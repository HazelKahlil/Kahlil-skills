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
6. Create squad and set Captain as leader.
7. Copy exact roster mention markdown into the mention map.
8. Attach Project Resources / repos.
9. Verify daemon/runtime/toolchain and repo access.
10. Verify Project Resources or a clean local Git baseline. If the project is untracked inside a broad parent repo, keep LIVE blocked or document the traceability risk.
11. Verify Skill pickup and role boundaries.
12. Verify Project Resources are visible to the agent when resources are used.
13. Run no-code smoke tests.
14. Run 2–3 low-risk pilot issues.
15. Keep autopilots disabled until LIVE and explicit Human Owner approval.

## No-code smoke tests

Ask each agent to state its role, what it must not do, and what next action it would take for a multi-file feature request. It must not modify files.

Expected:

- Captain routes and asks for RFC; does not implement.
- Worker proposes RFC or plan; does not merge.
- Reviewer reviews independently; does not implement.
- Analyst asks for authorized data; does not invent metrics.

## Rerun / failure recovery check

After a failed task, automatic retry, manual rerun, or reassignment, the Captain should post or require a state reconciliation comment before continuing.

## Iteration loop

After real issues, run a short retro:

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
- What should change in role instructions, squad instructions, templates, or references?

Update only new tasks after Skill edits; running tasks keep their current version.
