"""Gate 0 report: python -m mm.report FILE --maker-fee-bps X (fee must be supplied, never assumed)."""

from __future__ import annotations

import argparse
from collections import defaultdict

from mm.economics import evaluate_gate, load_events, markouts


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="+")
    ap.add_argument(
        "--maker-fee-bps",
        type=float,
        required=True,
        help="your actual maker fee in bps (negative for a rebate); verify on the venue",
    )
    ap.add_argument("--horizon", type=float, default=5.0)
    ap.add_argument("--min-fills", type=int, default=200)
    a = ap.parse_args()
    horizons = sorted({1.0, 5.0, 30.0, a.horizon})
    rows = [r for f in a.files for r in markouts(load_events(f), horizons)]
    by_sym = defaultdict(list)
    for r in rows:
        by_sym[r["symbol"]].append(r)
    for sym, rs in sorted(by_sym.items()):
        g = evaluate_gate(rs, a.maker_fee_bps, a.horizon, a.min_fills)
        print(f"\n{sym}: {'PASS' if g['pass'] else 'FAIL'} - {g['reason']}")
        for k, v in g.items():
            if k not in ("pass", "reason"):
                print(f"  {k}: {v:.3f}" if isinstance(v, float) else f"  {k}: {v}")
        for h in horizons:
            import statistics

            print(f"  adverse@{h:g}s bps: {statistics.fmean(r['adverse_bps'][h] for r in rs):.3f}")


if __name__ == "__main__":
    main()
