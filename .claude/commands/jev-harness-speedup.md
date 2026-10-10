---
description: Audit an agent harness and integrate Jev at decision points that measurably cut LLM turns/tokens, with flags, benchmarks and rollback
argument-hint: "[optional: harness path, repo, or focus area]"
---
Goal: Make this harness measurably faster by integrating Jev at suitable decision points. Carry the work through discovery, implementation, verification, and benchmarking.

Additional operator context (may be empty): $ARGUMENTS

First identify the actual running harness, its source repository, installed Jev integrations, and supported extension points. Trace how this session reaches that runtime. Distinguish editable harness code from upstream code, plugins, and inaccessible internals of the host agent (e.g. Claude Code or Codex). Do not assume changing a skill or configuration changes the running engine.

Read the current official TypeSafe documentation at https://docs.typesafe.ai and follow its documented API and SDK contracts. Use direct TypeSafe access with existing approved credentials. Never use OpenRouter or expose secrets.

Audit these opportunities:
1. Selecting relevant tool-output chunks before the LLM reads them.
2. Selecting context to retain or retrieve during compaction.
3. Running prepared tool workflows without an LLM turn between every step.
4. Selecting relevant tools from the available catalog.
5. Evaluating ambiguous properties of proposed tool calls.
6. Choosing predefined recovery actions after familiar failures.
7. Routing tasks and coordinating available agents.

For each opportunity, identify the actual integration point and decide whether deterministic code, Jev, or the LLM is appropriate. Prefer code for exact rules and known facts. Use Jev for atomic choice, score, or Noul (yes/no) judgments. Keep the LLM for generation, unfamiliar situations, and complex reasoning.

Prioritize integrations that remove LLM turns or materially reduce LLM input. Include the cost of preparing Jev requests, inference, fallbacks, and any extra retrieval. Avoid adding Jev calls where they merely add overhead.

Establish a native baseline before changing behavior. Implement candidates incrementally behind independent feature flags. Continue through all viable candidates; document inaccessible or unsuitable ones precisely rather than pretending they are integrated.

For context and output filtering:
- Preserve current instructions, user corrections, authorization, unresolved work, and essential execution state through deterministic rules.
- Retain complete source material with reliable retrieval references.
- Measure missed evidence, extra retrieval, and downstream mistakes.
- Use the LLM when a coherent summary must be generated.

For execution loops:
- Use only currently available, authorized actions.
- Validate arguments, recheck changing state, and verify postconditions.
- Stop or return to the LLM on unfamiliar states.
- Preserve existing permissions and confirmation requirements.
- Treat Jev probabilities as decision signals, never authorization or proof.

Use independent questions together when they share a state and do not depend on one another's answers. Define explicit handling for abstention, invalid responses, timeouts, and provider failures. Preserve the native path as a reversible fallback where appropriate.

Run meaningful tests and representative end-to-end comparisons against the unchanged baseline. Compare completion quality, elapsed time, LLM turns, input tokens, Jev calls, retries, fallbacks, and cost where observable. Separate measured improvements from estimates.

Enable only integrations supported by evidence of improved speed or efficiency without unacceptable quality loss. Leave inconclusive candidates disabled. Verify that the running harness actually uses each enabled integration; passing isolated helper tests is insufficient.

Work autonomously through reversible local changes. Ask only for genuinely missing access, essential information, or actions requiring authorization. Do not modify unrelated work or claim inaccessible internals have changed.

Deliver:
- The implemented changes and exact integration points.
- Evidence that each enabled path runs in the real harness.
- Before/after measurements and test results.
- Feature flags and rollback instructions.
- Remaining limitations and candidates that did not improve performance.

Complete the task when every audited candidate has a documented disposition and every enabled integration has implementation, verification, and benchmark evidence.
