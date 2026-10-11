"""Gate 0: does a maker have positive edge on this venue/instrument?

Replays recorded L2 + trades and measures, for every aggressive trade, the
hypothetical fill of a passive order resting at the touch on the other side,
then the mid-price markout against that maker at several horizons.

Conventions
- Event time ``t`` is local receive time in nanoseconds (monotonic per file).
- A ``buy`` aggressor lifts the ask, so the maker sold; a ``sell`` hits the bid.
- ``adverse_bps`` > 0 means the mid moved against the maker after the fill.
- Quote state is the last book seen *before* the trade message in receive order.
  Venues may publish the book update that consumed liquidity first, which biases
  half-spread low (conservative). Queue position is NOT modelled here: this
  measures the best case where every touch trade is a fill.
"""

from __future__ import annotations

import bisect
import json
import statistics
from collections.abc import Iterable, Iterator
from pathlib import Path


class BookTracker:
    def __init__(self) -> None:
        self.bids: dict[float, float] = {}
        self.asks: dict[float, float] = {}

    def apply(self, msg: dict) -> None:
        if msg.get("channel") != "book":
            return
        for d in msg.get("data", []):
            if msg.get("type") == "snapshot":
                self.bids.clear()
                self.asks.clear()
            for side, book in (("bids", self.bids), ("asks", self.asks)):
                for lvl in d.get(side, []):
                    p, q = float(lvl["price"]), float(lvl["qty"])
                    if q == 0:
                        book.pop(p, None)
                    else:
                        book[p] = q

    @property
    def best_bid(self) -> float | None:
        return max(self.bids) if self.bids else None

    @property
    def best_ask(self) -> float | None:
        return min(self.asks) if self.asks else None

    @property
    def mid(self) -> float | None:
        b, a = self.best_bid, self.best_ask
        if b is None or a is None or b >= a:
            return None
        return (b + a) / 2

    @property
    def spread_bps(self) -> float | None:
        m = self.mid
        return None if m is None else (self.best_ask - self.best_bid) / m * 1e4


def load_events(path: str | Path) -> Iterator[dict]:
    import gzip

    p = Path(path)
    opener = gzip.open if p.suffix == ".gz" else open
    with opener(p, "rt") as f:
        for line in f:
            if line.strip():
                yield json.loads(line)


def markouts(events: Iterable[dict], horizons_s: list[float]) -> list[dict]:
    books: dict[str, BookTracker] = {}
    timelines: dict[str, tuple[list[int], list[float]]] = {}
    pending: list[dict] = []

    for ev in events:
        t, msg = ev["t"], ev["msg"]
        ch = msg.get("channel")
        if ch == "book":
            for d in msg.get("data", []):
                sym = d["symbol"]
                bk = books.setdefault(sym, BookTracker())
                bk.apply({"channel": "book", "type": msg.get("type"), "data": [d]})
                if bk.mid is not None:
                    ts, ms = timelines.setdefault(sym, ([], []))
                    ts.append(t)
                    ms.append(bk.mid)
        elif ch == "trade":
            for d in msg.get("data", []):
                sym = d["symbol"]
                bk = books.get(sym)
                if bk is None or bk.mid is None:
                    continue
                mid, price = bk.mid, float(d["price"])
                sign = 1.0 if d["side"] == "buy" else -1.0
                pending.append(
                    {
                        "symbol": sym,
                        "t": t,
                        "sign": sign,
                        "mid": mid,
                        "spread_bps": bk.spread_bps,
                        # maker sold above mid (buy) or bought below mid (sell)
                        "half_spread_bps": sign * (price - mid) / mid * 1e4,
                    }
                )

    rows = []
    for r in pending:
        ts, ms = timelines.get(r["symbol"], ([], []))
        adverse: dict[float, float] = {}
        for h in horizons_s:
            target = r["t"] + int(h * 1e9)
            if not ts or ts[-1] < target:
                break  # horizon not observed; drop rather than extrapolate
            i = bisect.bisect_right(ts, target) - 1
            adverse[h] = r["sign"] * (ms[i] - r["mid"]) / r["mid"] * 1e4
        if len(adverse) == len(horizons_s):
            rows.append({**r, "adverse_bps": adverse})
    return rows


def evaluate_gate(
    rows: list[dict], maker_fee_bps: float, horizon_s: float, min_fills: int = 200
) -> dict:
    """Gate: maker_fee + E[adverse_selection] < 0.5 * typical quoted spread."""
    if len(rows) < min_fills:
        return {
            "pass": False,
            "n": len(rows),
            "reason": f"insufficient fills ({len(rows)} < {min_fills}); capture longer",
        }
    adverse = statistics.fmean(r["adverse_bps"][horizon_s] for r in rows)
    spread = statistics.median(r["spread_bps"] for r in rows)
    cost = maker_fee_bps + adverse
    threshold = 0.5 * spread
    out = {
        "n": len(rows),
        "typical_spread_bps": spread,
        "adverse_bps": adverse,
        "maker_fee_bps": maker_fee_bps,
        "cost_bps": cost,
        "threshold_bps": threshold,
        "pass": cost < threshold,
    }
    if "half_spread_bps" in rows[0]:
        half = statistics.fmean(r["half_spread_bps"] for r in rows)
        out["mean_half_spread_bps"] = half
        out["net_edge_per_fill_bps"] = half - maker_fee_bps - adverse
    out["reason"] = (
        "ok" if out["pass"] else "cost >= half typical spread: pick another venue/instrument"
    )
    return out
