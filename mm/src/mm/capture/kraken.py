"""Record Kraken public WS v2 book + trade messages to gzip JSONL (no auth, no orders)."""

from __future__ import annotations

import argparse
import asyncio
import gzip
import json
import time
from pathlib import Path

import websockets

URL = "wss://ws.kraken.com/v2"


async def record(symbols: list[str], seconds: float, out: Path, depth: int = 10) -> int:
    out.parent.mkdir(parents=True, exist_ok=True)
    deadline = time.monotonic() + seconds
    n = 0
    with gzip.open(out, "wt") as f:
        async with websockets.connect(URL, max_size=2**22) as ws:
            for ch, extra in (("book", {"depth": depth}), ("trade", {"snapshot": False})):
                await ws.send(
                    json.dumps(
                        {
                            "method": "subscribe",
                            "params": {"channel": ch, "symbol": symbols, **extra},
                        }
                    )
                )
            while (left := deadline - time.monotonic()) > 0:
                try:
                    raw = await asyncio.wait_for(ws.recv(), timeout=min(left, 10))
                except TimeoutError:
                    continue
                f.write(json.dumps({"t": time.time_ns(), "msg": json.loads(raw)}) + "\n")
                n += 1
    return n


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--symbols", nargs="+", required=True, help='e.g. "BTC/USD" "SOL/USD"')
    ap.add_argument("--seconds", type=float, default=600)
    ap.add_argument("--out", type=Path, default=None)
    a = ap.parse_args()
    out = a.out or Path("data") / f"kraken_{time.strftime('%Y%m%dT%H%M%S')}.jsonl.gz"
    print(f"recorded {asyncio.run(record(a.symbols, a.seconds, out))} messages -> {out}")


if __name__ == "__main__":
    main()
