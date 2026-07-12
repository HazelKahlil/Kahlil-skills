# Squad Architecture

## Topology selector

Choose the smallest execution topology before defining roles:

- Direct single agent: one known executor and one deliverable. Do not install a squad.
- Routed single-worker: the issue is already squad-assigned; the Captain routes once to one accountable Worker and stops.
- Staged squad: dependent work packets with explicit artifacts and handoff checks.
- Parallel squad: independent work packets with distinct outputs and no shared-file conflict.

Document why a squad is needed. Roster size follows topology; it must not create work for idle roles.

## Default roles

### Captain / Orchestrator

Owns routing, coordination, status, escalation, and final delivery. Does not implement, write RFCs, review code, analyze data, merge PRs, or make final product decisions.

On each dispatch, the Captain should classify topology, issue lane, and Review Router v2 validation route; check for an existing child/task/branch/PR with the same idempotency key; use the exact roster mention markdown only for a concrete task; then read back a dispatch receipt. Only a new task ID in `queued`, `dispatched`, or `running` proves dispatch. The Captain records/evaluates the routing if supported, then stops.

The Captain owns status hygiene. A routed `todo` issue should move to `in_progress`. When an RFC, research result, or no-PR implementation has passed the required validation route and no more agent work is needed, the Captain may move the issue to `in_review` before escalating to the Human Owner. Do not leave validation-passed work in `in_progress` only because the trigger comment did not explicitly ask for a status change. Keep `done` reserved for PR merge, verified deploy/readback where relevant, or explicit Human Owner no-PR acceptance.

### Worker / Builder

Writes RFCs, performs research, debugs, implements, tests, and creates PRs. Works only on the assigned work packet, reuses an existing matching branch/PR, and delivers evidence plus a terminal child status in the same run. Does not merge, deploy, or decide final product direction.

### Reviewer / Blocker Gate

Checks blockers independently in the assigned scope. Reviews correctness, regression risk, tests, API/schema compatibility, protected paths, branch hygiene, and match to approved plan. Does not judge visual taste and does not implement unless explicitly assigned.

### Analyst / Evidence Provider

Uses authorized metrics, logs, analytics, experiments, or performance data when evidence changes the decision. Does not overclaim from weak data and does not access unauthorized sources.

For product/RFC work, the Analyst should use a bounded evidence budget by default: current issue/comment thread, latest relevant audit or evidence summary, one directly relevant source section, and at most 2-3 directly related issues. Broader scans belong to migration or historical audit lanes. Stop reading once there is enough evidence to recommend one concrete, non-duplicate slice with non-goals and acceptance criteria.

### Human Owner

Final authority for product choices, UX acceptance, risk, priorities, merge, deployment, and ambiguous tradeoffs.

The generated squad must apply the Owner Experience Contract: result first, no repeated questions or permission prompts, source artifacts before variants, and concise escalation with one required decision.

## Issue lanes

- `small_fix`: typo, copy, logging, tiny one-point bug → Worker → validation route decision → PR or no-PR result.
- `debug`: reproducible bug, regression, performance issue → Worker systematic debug → validation route decision → PR.
- `rfc`: new feature, multi-file change, unfamiliar module, architecture change → RFC → validation route decision → Human approval when needed → implementation.
- `research`: choice or investigation → research brief only; no code unless approved.
- `data_decision`: metrics or user behavior affects Goal / Problem → Analyst input first.
- `migration`: legacy backlog or handoff → audit, classify, batch, pilot.
- `security_privacy`: auth, secrets, PII, permissions → specialist/human approval required.

## Gates

- RFC gate: required for new features, architecture changes, multi-file changes, and unfamiliar modules.
- Review Router v2: choose Human Visual Acceptance, Source Verification, Live Readback, Blocker Gate, Human Decision Gate, Issue Hygiene Gate, or self-check only.
- UI gate: user-visible visual taste changes need isolated evidence and Human Owner acceptance, not Agent taste review.
- Source gate: official/current docs or native platform behavior go to SourceVerifier before implementation.
- Contract/readback gate: schema/API/cross-process/deploy/database changes need real end-to-end validation.
- Loop gate: if Worker and Reviewer do not converge after 2 rounds, Captain escalates.
- Merge gate: agents do not merge unless explicitly authorized and protected by external controls.
- Installability gate: live squad instructions must not contain unresolved required placeholders or guessed mention syntax.
- Dispatch gate: delegation needs a visible task receipt; one failed fallback is the recovery limit.
- Idempotency gate: one active packet per parent + role + scope + deliverable.
- Context gate: after 80 comments or two rejected repair loops, summarize and move remaining work to one non-duplicate successor issue.
