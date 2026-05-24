# Squad Architecture

## Default roles

### Captain / Orchestrator

Owns routing, coordination, status, escalation, and final delivery. Does not implement, write RFCs, review code, analyze data, merge PRs, or make final product decisions.

On each dispatch, the Captain should classify the issue lane and Review Gate v3 level, use the exact roster mention markdown only when delegating a concrete task, leave one concise delegation comment, record/evaluate the routing if supported, then stop.

The Captain owns status hygiene. A routed `todo` issue should move to `in_progress`. When an RFC, research result, or no-PR implementation has passed the required review gate and no more agent work is needed, the Captain should move the issue to `in_review` before escalating to the Human Owner. Do not leave a review-passed result in `in_progress` only because the trigger comment did not explicitly ask for a status change. Keep `done` reserved for PR merge or explicit Human Owner no-PR acceptance.

### Worker / Builder

Writes RFCs, performs research, debugs, implements, tests, and creates PRs. Does not merge, deploy, or decide final product direction.

### Reviewer / Quality Gate

Reviews RFCs and code independently. Checks correctness, maintainability, regression risk, tests, API/schema compatibility, and whether implementation matches approved plan. Does not implement unless explicitly assigned.

### Analyst / Evidence Provider

Uses authorized metrics, logs, analytics, experiments, or performance data when evidence changes the decision. Does not overclaim from weak data and does not access unauthorized sources.

For product/RFC work, the Analyst should use a bounded evidence budget by default: current issue/comment thread, latest relevant audit or evidence summary, one directly relevant source section, and at most 2-3 directly related issues. Broader scans belong to migration or historical audit lanes. Stop reading once there is enough evidence to recommend one concrete, non-duplicate slice with non-goals and acceptance criteria.

### Human Owner

Final authority for product choices, UX acceptance, risk, priorities, merge, deployment, and ambiguous tradeoffs.

## Issue lanes

- `small_fix`: typo, copy, logging, tiny one-point bug → Worker → review gate decision → PR or no-PR result.
- `debug`: reproducible bug, regression, performance issue → Worker systematic debug → review gate decision → PR.
- `rfc`: new feature, multi-file change, unfamiliar module, architecture change → RFC → review gate decision → Human approval when needed → implementation.
- `research`: choice or investigation → research brief only; no code unless approved.
- `data_decision`: metrics or user behavior affects Goal / Problem → Analyst input first.
- `migration`: legacy backlog or handoff → audit, classify, batch, pilot.
- `security_privacy`: auth, secrets, PII, permissions → specialist/human approval required.

## Gates

- RFC gate: required for new features, architecture changes, multi-file changes, and unfamiliar modules.
- Review gate: use Review Gate v3 from `references/risk-governance.md`; R0 is allowlist-only, R1 has one accountable reviewer, R2 has scoped specialist review, and R3 requires Human Owner approval.
- UI gate: user-visible changes need isolated environment and Human Owner acceptance.
- Contract gate: schema/API/cross-process changes need end-to-end validation.
- Loop gate: if Worker and Reviewer do not converge after 3 rounds, Captain escalates.
- Merge gate: agents do not merge unless explicitly authorized and protected by external controls.
- Installability gate: live squad instructions must not contain unresolved required placeholders or guessed mention syntax.
