# Rollout and Iteration

## Readiness levels

- `DRAFT`: generated but not installed or verified.
- `PILOT`: no-code smoke tests passed; only low-risk tasks allowed.
- `LIVE`: pilot issues passed; normal scoped operation allowed.
- `PAUSED`: kill-switch triggered or required evidence missing.

## Live installation checklist

1. Import Skill.
2. Attach Skill to Squad Designer first.
3. Generate project-specific setup pack.
4. Resolve all required placeholders or explicitly keep the pack in DRAFT.
5. Install role-specific system instructions into actual agents.
6. Record the execution topology and why a squad is needed. Stop installation if direct single-agent assignment is sufficient.
7. Create squad and set Captain as leader.
8. Copy exact roster mention markdown into the mention map.
9. Attach Project Resources / repos.
10. Verify daemon/runtime/toolchain and repo access.
11. Verify Project Resources or a clean local Git baseline. If the project is untracked inside a broad parent repo, keep LIVE blocked or document the traceability risk.
12. Verify Skill pickup, role loadouts, and role boundaries from live readback.
13. Verify Project Resources are visible to the agent when resources are used.
14. Run no-code and operational behavior smoke tests.
15. Run 2–3 low-risk pilot issues.
16. Keep autopilots disabled until LIVE and explicit Human Owner approval.

## No-code smoke tests

Ask each agent to state its role, what it must not do, and what next action it would take for a multi-file feature request. It must not modify files.

Expected:

- Captain routes and asks for RFC; does not implement.
- Worker proposes RFC or plan; does not merge.
- Reviewer reviews independently; does not implement.
- Analyst asks for authorized data; does not invent metrics.

## Operational behavior smoke tests

- Dispatch receipt: a low-risk delegation produces a visible task ID in `queued`, `dispatched`, or `running`; the Captain does not claim success before readback.
- Idempotency: repeating the same packet does not create a second child, Worker, branch, or PR.
- Failure recovery: an injected failed dispatch gets one fallback; a repeated failure becomes `blocked` without a “continue” loop.
- Permission bundle: one approved `PR_CREATE` reaches an open PR without asking again for task-branch push.
- Owner experience: a results-only request gets a result-first response, and a source artifact is preserved.
- Context gate: a long synthetic thread is summarized into one non-duplicate successor.

## Rerun / failure recovery check

After a failed task, automatic retry, manual rerun, or reassignment, the Captain should post or require a state reconciliation comment before continuing.

Recovery is bounded to one evidence-backed attempt per failure class and must produce a new task receipt.

## Iteration loop

After at least three substantive completed tasks since the last review, or after a concrete failure trigger, run a short retro. A zero-sample cycle produces no issue:

- Was routing correct?
- Did any agent violate its role?
- Were mentions controlled and exact?
- Were PR issue keys used safely?
- Did status reflect reality?
- Did review-passed work move to `in_review` instead of staying in `in_progress`?
- Was Analyst/RFC evidence bounded, or did the role scan broad old history unnecessarily?
- Was Project Resources / Git readiness strong enough for reviewers to prove changed-file scope?
- Were task failures or reruns handled cleanly?
- Were gates too strict or too loose?
- Were all runs completed with no queued/running/dispatched leftovers?
- Was there any loop, duplicate delegation, or task storm?
- Did every claimed dispatch have a receipt, and did recovery stay within budget?
- Did the Human Owner repeat answers or approve the same PR action more than once?
- Is each squad's mission distinct, and are stale squads/autopilots paused or proposed for lifecycle action?
- What should change in role instructions, squad instructions, templates, or references?

Update only new tasks after Skill edits; running tasks keep their current version.
