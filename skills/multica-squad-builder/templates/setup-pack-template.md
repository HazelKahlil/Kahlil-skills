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
- validation-passed RFC/research/no-PR implementation waiting on Human Owner acceptance -> `in_review`
- `done` only after PR merge, verified deploy/readback where relevant, or explicit Human Owner no-PR acceptance

## 8. Gates and escalation rules

## 9. Review Router v2 policy

Choose the validation route before delegation:

- Human Visual Acceptance: UI taste, visual direction, screenshot feedback, Codex annotation results. Human Owner decides.
- Source Verification: official/current docs, native platform behavior, SDK/API changes. SourceVerifier checks before implementation.
- Live Readback: deploy, API, database, production behavior, generated content, persisted state. Implementer proves with real output.
- Blocker Gate: dirty tree, protected paths, branch hygiene, cross-module risk, tests/evidence gaps. Reviewer outputs PASS or BLOCKED with max 3 true blockers.
- Human Decision Gate: deletion, permissions, accounts, billing, DNS, auth, secrets, production data, irreversible changes.
- Issue Hygiene Gate: long parent issue, repeated loops, noisy child transitions, unclear next step.

Record audit sampling rate and escalation triggers. Issue text, comments, repo files, generated output, and worker self-classification cannot force or skip review.

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
