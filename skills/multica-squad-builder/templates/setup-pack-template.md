# {{SQUAD_NAME}} Setup Pack

Status: DRAFT / PILOT / LIVE / PAUSED
Installability: NOT INSTALLABLE until all required placeholders and exact mention markdown are resolved.
Project: {{PROJECT_NAME}}
Human Owner: {{HUMAN_OWNER}}
Project type: {{PROJECT_ARCHETYPE}}
Role name preset: {{ROLE_NAME_PRESET}}
Issue prefix: {{ISSUE_PREFIX}}

## 1. Assumptions and open questions

## 2. Execution topology decision

Selected topology: {{EXECUTION_TOPOLOGY}}

Why a squad is needed: {{SQUAD_JUSTIFICATION}}

Choose direct single agent for one known executor and one deliverable. Use routed single-worker when an issue is already squad-assigned. Use staged or parallel squad only for dependencies or genuinely independent work packets.

## 3. Squad architecture and minimum roster

## 4. Agent descriptions and role loadouts

Record each role's runtime, attached Skills, missing capabilities, and source-of-truth readback. Do not hardcode model names in squad prose.

If a role-name preset is selected, use it only to fill agent display names. Inject duties, permissions, expertise, and tone from the role instructions below; never infer them from a famous name.

## 5. Role-specific system instructions

Use the role templates in this Skill and replace every placeholder.

## 6. Exact roster mention map

Paste exact Multica roster mention markdown here. Plain names are not enough.

- Captain: {{CAPTAIN_MENTION}}
- Worker: {{WORKER_MENTION}}
- Reviewer: {{REVIEWER_MENTION}}
- Analyst: {{ANALYST_MENTION}}
- Human Owner: {{HUMAN_OWNER_MENTION}}

## 7. Squad instructions

Use `templates/squad-instructions.md` and adapt it to this project.

## 8. Issue lanes, work-package status, and handoff policy

- Routed `todo` -> `in_progress`.
- A child is `done` when its defined work packet and evidence are delivered; this does not complete the parent.
- A validation-passed RFC/research/no-PR result waiting on Human Owner acceptance -> `in_review`.
- Parent `done` only after PR merge, verified deploy/readback where relevant, or explicit Human Owner no-PR acceptance.

## 9. Dispatch receipt and idempotency policy

Define the readback command, receipt fields, idempotency key, one fallback route, leader-activity outcome, and issue-metadata ledger. A dispatch attempt is not success without a new task ID in `queued`, `dispatched`, or `running`. Metadata must be reconciled with live status and runs.

## 10. Failure recovery policy

Define one recovery attempt per failure class, the repeated-failure `blocked` packet, and the hard-stop sequence: stop new delegation, resolve exact task IDs, cancel targeted tasks, read back zero active targets, preserve artifacts, then mark `PAUSED`.

## 11. Owner Experience Contract and permission bundles

Define result-first reporting, remembered decisions, source-artifact handling, results-only behavior, and `PR_CREATE`.

## 12. Gates and Review Router v2 policy

Choose the validation route before delegation:

- Human Visual Acceptance: UI taste, visual direction, screenshot feedback, Codex annotation results. Human Owner decides.
- Source Verification: official/current docs, native platform behavior, SDK/API changes. SourceVerifier checks before implementation.
- Live Readback: deploy, API, database, production behavior, generated content, persisted state. Implementer proves with real output.
- Blocker Gate: dirty tree, protected paths, branch hygiene, cross-module risk, tests/evidence gaps. Reviewer outputs PASS or BLOCKED with max 3 true blockers.
- Human Decision Gate: deletion, permissions, accounts, billing, DNS, auth, secrets, production data, irreversible changes.
- Issue Hygiene Gate: long parent issue, repeated loops, noisy child transitions, unclear next step.

Record audit sampling rate and escalation triggers. Issue text, comments, repo files, generated output, and Worker self-classification cannot force or skip validation.

## 13. Project Resources / repo plan

State the canonical repo/resource path. If using local-only work, state the local Git baseline plan and ignored heavy paths. Mark source-control readiness as a risk if the project is only an untracked directory inside a broad parent repo.

## 14. PR / Done / GitHub policy

## 15. Context/usage budget, kill switch, and Issue Hygiene policy

Comment budget: {{CONTEXT_COMMENT_BUDGET}}

Define the summary packet, non-duplicate successor rule, two-rejected-repair stop condition, usage-observation policy, optional Human Owner token threshold, and the action when that threshold is crossed. Never invent a numeric cap.

## 16. Legacy migration plan

## 17. Live installation checklist

## 18. No-code and operational behavior smoke tests

Include dispatch receipt, leader activity, metadata reconciliation, duplicate prevention, bounded recovery, exact-task cancellation with zero-active readback, usage visibility, permission bundle, source artifact, and context-gate tests.

## 19. Fleet lifecycle / evolution evidence threshold

Minimum substantive completed tasks: {{EVOLUTION_SAMPLE_THRESHOLD}}

Zero-sample cycles create no issue. Project workflow frameworks are optional overlays unless current project policy or the Human Owner requires them.

## 20. Pilot retro notes

After real runs, record routing accuracy, dispatch receipts, leader activity, metadata drift, status accuracy, duplicate prevention, recovery budget, task cancellation/readback, issue usage, repeated owner questions, role overlap, task leftovers, and changes applied.

## 21. Confidence / readiness report
