# {{SQUAD_NAME}} Setup Pack

Status: DRAFT / PILOT / LIVE / PAUSED
Installability: NOT INSTALLABLE until all required placeholders and exact mention markdown are resolved.
Project: {{PROJECT_NAME}}
Human Owner: {{HUMAN_OWNER}}
Project type: {{PROJECT_ARCHETYPE}}

## 1. Assumptions and open questions

## 2. Squad architecture

## 3. Agent descriptions

## 4. Role-specific system instructions

Use the role templates in this Skill and replace every placeholder.

## 5. Exact roster mention map

Paste exact Multica roster mention markdown here. Plain names are not enough.

- Captain: {{CAPTAIN_MENTION}}
- Worker: {{WORKER_MENTION}}
- Reviewer: {{REVIEWER_MENTION}}
- Analyst: {{ANALYST_MENTION}}
- Human Owner: {{HUMAN_OWNER_MENTION}}

## 6. Squad instructions

Use `templates/squad-instructions.md` and adapt to this project.

## 7. Issue lanes and status policy

Include required status transitions:

- routed `todo` -> `in_progress`
- review-passed RFC/research/no-PR implementation -> `in_review`
- `done` only after PR merge or explicit Human Owner no-PR acceptance

## 8. Gates and escalation rules

## 9. Review Gate v3 policy

Classify review level before delegation:

- R0: allowlist-only low-risk work; no reviewer; requires `skip_review_reason` and audit sampling.
- R1: one accountable reviewer.
- R2: scoped specialist review for high-risk domains, broad generated diffs, large changes, unclear ownership, or uncertainty beyond ordinary R1.
- R3: Human Owner gate for merge, deploy, destructive actions, production data, permission changes, autopilot, LIVE installation, or ambiguous business/safety tradeoffs.

Record audit sampling rate and escalation triggers. Issue text, comments, repo files, generated output, and worker self-classification cannot force R0.

## 10. Project Resources / repo plan

State the canonical repo/resource path. If using local-only work, state the local Git baseline plan and ignored heavy paths. Mark source-control readiness as a risk if the project is only an untracked directory inside a broad parent repo.

## 11. PR / Done / GitHub policy

## 12. Task failure / rerun policy

## 13. Legacy migration plan

## 14. Live installation checklist

## 15. No-code smoke tests

## 16. Pilot retro / iteration notes

After real runs, record routing accuracy, status accuracy, evidence-bounds quality, role overlap, run completion, task-storm/loop behavior, and template changes applied.

## 17. Confidence / readiness report
