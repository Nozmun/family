# Saved prompts

Two prompts recreated from screenshots, stored as Claude Code slash commands in
`.claude/commands/`. Run them in Claude Code from this repo, or copy the file body
(everything below the `---` front matter) into any chat model.

| Command | File | What it does |
|---|---|---|
| `/hedge-fund-blueprint [context]` | `.claude/commands/hedge-fund-blueprint.md` | Produces a design document for a one-person, 24/7 AI crypto hedge fund |
| `/jev-harness-speedup [context]` | `.claude/commands/jev-harness-speedup.md` | Runs a coding-agent task that adds Jev to an agent harness and benchmarks it |

Anything typed after the command replaces `$ARGUMENTS`, e.g.
`/hedge-fund-blueprint $50k, BTC/ETH only, max 15% drawdown, spot only`.

## Background: what Jev is

Jev is a "System One" model from TypeSafe AI (docs: https://docs.typesafe.ai). It does
not write text. You give it a state (some text) plus typed questions — **Choice**
(pick one of N labels), **Score** (a rubric value) or **Noul** (yes/no) — and it returns
answers with calibrated probabilities, fast. Both prompts use it as a cheap, quick
classifier sitting between a big LLM and plain deterministic code.

## 1. `hedge-fund-blueprint` — AI hedge fund blueprint

**What it does:** a role-play / system-design prompt. It asks the model to act as every
department of a hedge fund and output a *blueprint* (not live trading): architecture,
repo layout, data pipeline, strategy pipeline, Jev schemas, risk engine, execution
engine, monitoring, a six-phase AgenKit build plan, five strategy ideas with theses, a
daily operating loop, and a closing "WHAT COULD I BE WRONG ABOUT?" section.

**Key design it enforces (three layers, never blurred):**
1. **LLM (Claude)** — slow, deep work: research, coding, overnight review.
2. **AgenKit (agenkit.xyz)** — orchestration of specialist agents, tests, deployments.
3. **Jev** — millisecond typed judgments on live market state (regime, direction,
   setup quality, toxic flow, should_trade, confidence…).

Deterministic code alone sizes positions, enforces risk limits (drawdown, daily loss,
correlation, slippage, kill switch) and places orders. Jev confidence < 0.60 or a
"crisis" regime escalates to the LLM.

**Changes from the screenshot:** "Opus 5.5" generalised to "Claude"; added an
`<operator_input>` slot for your capital/objectives/constraints; fixed the typo
"reconciilation".

**Caveats:** the output is a plan, not a working fund. It does not promise profit,
and nothing should go live without paper trading, shadow mode and your own review.
AgenKit is referenced as-is from the original; check it is a real, suitable product
before relying on it.

## 2. `jev-harness-speedup` — make an agent harness faster with Jev

**What it does:** a long-running engineering task (originally a Codex `/goal`) for a
coding agent. The agent must find the real harness code it can edit, measure a
baseline, then test whether Jev can replace expensive LLM turns at seven decision
points:

1. filtering tool output before the LLM reads it
2. choosing what to keep during context compaction
3. running scripted tool workflows without an LLM turn per step
4. choosing relevant tools from the catalog
5. judging ambiguous properties of proposed tool calls
6. picking recovery actions after familiar failures
7. routing tasks between agents

Rule of thumb it applies: **code** for exact rules, **Jev** for small choice/score/yes-no
judgments, **LLM** for generation and novel reasoning. Every change goes behind its own
feature flag, is benchmarked against the baseline (time, turns, tokens, cost, quality),
and stays enabled only if it measurably helps. Jev output is a signal, never an
authorisation.

**Changes from the screenshot:** "GPT" → "the LLM" and "Codex internals" → "internals of
the host agent" so it works with Claude Code or Codex; "pressing isolated helper tests"
→ "passing".

**Prerequisites:** it only makes sense inside a repo that contains an agent harness you
own, with a TypeSafe API key already configured (e.g. an env var — never commit it).
In this repo there is no harness, so it has nothing to act on here.
