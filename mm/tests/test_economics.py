import json

from mm.economics import BookTracker, evaluate_gate, load_events, markouts


def book_msg(t, typ, bids, asks, symbol="BTC/USD"):
    return {
        "t": t,
        "msg": {
            "channel": "book",
            "type": typ,
            "data": [
                {
                    "symbol": symbol,
                    "bids": [{"price": p, "qty": q} for p, q in bids],
                    "asks": [{"price": p, "qty": q} for p, q in asks],
                }
            ],
        },
    }


def trade_msg(t, side, price, qty=1.0, symbol="BTC/USD"):
    return {
        "t": t,
        "msg": {
            "channel": "trade",
            "type": "update",
            "data": [{"symbol": symbol, "side": side, "price": price, "qty": qty}],
        },
    }


def test_book_tracker_snapshot_update_and_removal():
    b = BookTracker()
    b.apply(book_msg(0, "snapshot", [(99.0, 1), (98.0, 1)], [(101.0, 1), (102.0, 1)])["msg"])
    assert (b.best_bid, b.best_ask, b.mid) == (99.0, 101.0, 100.0)
    b.apply(book_msg(1, "update", [(99.0, 0), (99.5, 2)], [])["msg"])
    assert b.best_bid == 99.5
    assert round(b.spread_bps, 3) == round((101.0 - 99.5) / 100.25 * 1e4, 3)


def test_crossed_or_empty_book_has_no_mid():
    b = BookTracker()
    assert b.mid is None
    b.apply(book_msg(0, "snapshot", [(101, 1)], [(100, 1)])["msg"])
    assert b.mid is None


def test_markout_sign_convention_buy_aggressor_hits_maker_ask():
    # book mid 100, ask 101. Aggressive buy fills our resting ask at 101.
    # Mid then rises to 103 -> maker sold too cheap: adverse selection > 0.
    ev = [
        book_msg(0, "snapshot", [(99, 1)], [(101, 1)]),
        trade_msg(1_000_000_000, "buy", 101.0),
        book_msg(3_000_000_000, "update", [(99, 0), (103, 1)], [(101, 0), (105, 1)]),
    ]
    rows = markouts(ev, horizons_s=[2])
    assert len(rows) == 1
    r = rows[0]
    assert r["half_spread_bps"] > 0
    assert r["adverse_bps"][2] > 0  # mid moved against the maker
    mid_then = 104.0
    assert abs(r["adverse_bps"][2] - (mid_then - 100.0) / 100.0 * 1e4) < 1e-6


def test_markout_sell_aggressor_symmetric():
    ev = [
        book_msg(0, "snapshot", [(99, 1)], [(101, 1)]),
        trade_msg(1_000_000_000, "sell", 99.0),
        book_msg(3_000_000_000, "update", [(99, 0), (95, 1)], [(101, 0), (97, 1)]),
    ]
    r = markouts(ev, horizons_s=[2])[0]
    assert r["adverse_bps"][2] > 0


def test_gate_passes_and_fails_on_threshold():
    rows = [{"spread_bps": 20.0, "adverse_bps": {5: 2.0}} for _ in range(50)]
    ok = evaluate_gate(rows, maker_fee_bps=5.0, horizon_s=5, min_fills=30)
    assert ok["pass"] and ok["cost_bps"] == 7.0 and ok["threshold_bps"] == 10.0
    bad = evaluate_gate(rows, maker_fee_bps=9.0, horizon_s=5, min_fills=30)
    assert not bad["pass"]


def test_gate_refuses_on_too_few_fills():
    rows = [{"spread_bps": 20.0, "adverse_bps": {5: 0.0}}] * 3
    g = evaluate_gate(rows, maker_fee_bps=0.0, horizon_s=5, min_fills=30)
    assert not g["pass"] and "insufficient" in g["reason"]


def test_load_events_roundtrip(tmp_path):
    p = tmp_path / "x.jsonl"
    p.write_text(json.dumps({"t": 1, "msg": {"channel": "heartbeat"}}) + "\n")
    assert len(list(load_events(p))) == 1
