# Operational Reliability

Use this reference when designing a new squad or repairing one after real runs. Optimize for the smallest topology that can finish the work, observable dispatch, bounded recovery, and a low-friction Human Owner experience.

## Execution topology

Choose topology before names, personas, or roster size.

1. `direct_single_agent`: one known executor, one deliverable, and no independent coordination need. Recommend assigning that Agent directly; do not create a squad merely for style.
2. `routed_single_worker`: an issue is already assigned to a squad, but one Worker can own the result. The Captain delegates to exactly one primary Worker, verifies the dispatch receipt, then stops.
3. `staged_squad`: work packages have real dependencies. Define the artifact and acceptance check for each stage; start the next stage only after the previous handoff is observable.
4. `parallel_squad`: two or more work packages are independent, do not edit the same files or output, and parallelism materially reduces elapsed time. Give each package a unique scope and accountable owner.

If child-issue or stage creation is unavailable, fall back to routed single-worker instead of claiming that a staged dispatch exists. A large roster is not evidence that all members should run.

## Dispatch receipt and idempotency

An exact mention, child assignment, rerun, or reassignment is an attempt, not proof. Immediately read back current issue runs or agent tasks. A valid dispatch receipt records the parent issue, delegate, work packet, task ID, timestamp, and a state of `queued / dispatched / running`.

If no new task is visible, do not claim that dispatch succeeded. Make at most one explicit fallback attempt, such as direct assignment to the same single Worker. If that also has no receipt, move to `blocked` with the failed route and the exact Human Owner action required.

Before creating a child issue, branch, PR, or new task packet, inspect existing children, comments, runs, branches, and PRs. Use this idempotency key:

`parent issue + accountable role + scope + deliverable`

Continue an existing matching packet. Never create two Workers for the same key, even after a timeout or context reset. A retry must preserve the original key and accepted plan.

## Failure recovery budget

`agent_error`, session or usage limits, runtime disconnects, and timeouts do not prove that work will resume automatically. Reconcile the current issue, accepted plan, assignee, branch, PR, and completed gates before recovery.

Allow one recovery attempt for a task failure: one verified rerun, fresh delegation, or reassignment chosen for the failure class. If the same failure class happens again, stop the loop, set `blocked`, and state the evidence and next external action. Do not post repeated “continue” comments without a newly created task receipt.

Bad or context-poisoned output should start from a concise fresh work packet, not from an ambiguous transcript. Never invent a Goal, task, deployment, or completion state that has not been read back.

## Owner Experience Contract

- Give the result first: current outcome, proof, and only then the minimum next decision.
- Do not ask the same question twice. Preserve confirmed choices and do not re-request an action already covered by an approved permission bundle.
- Read the user's source artifact, attachment, current file, or visual baseline before proposing replacements. If a visual result is rejected, return to that source artifact instead of producing unrelated variants.
- When the owner says “results only,” suppress progress narration and routine acknowledgements.
- Keep persona flavor subordinate to clarity, truth, safety, and concise delivery.

Permission bundles prevent step-by-step approval fatigue. By default:

- `PR_CREATE` = create a task branch, commit scoped changes, push the task branch, and open the PR.
- Merge, deploy, destructive changes, production data, accounts, permissions, billing, DNS, auth, and secrets remain separate gates unless an explicit policy says otherwise.

## Work-package status and handoff

A child issue may be `done` when its defined work package and evidence are delivered; that does not make the parent issue complete. The parent is `done` only when its own acceptance policy is satisfied.

Update the child terminal state in the same run as the delivery. If blocked, include the cause, attempts, preserved artifact, and next action. Mention the next owner only for a real handoff, then verify that the mention or assignment created a task when a new task is required.

Do not assume every comment or non-terminal status wakes the Captain. Generated instructions must tell the Captain how to inspect unfinished children after a handoff and how to avoid silent stage barriers.

## Context budget

Use an Issue Hygiene Gate when an issue exceeds 80 comments, the same repair is rejected twice, or the next action is no longer clear. Post one compact state summary, create a successor issue with a non-duplicate idempotency key when work remains, and close or block the old issue accurately. Do not drag the full transcript into the successor.

## Fleet lifecycle and evidence-based evolution

Audit live configuration rather than prose alone: squad mission, leader, roster, role loadout, attached Skills, runtime/model readback, active tasks, stale issues, and autopilots. Do not hardcode model names in squad instructions; live configuration is the source of truth. Flag overlapping squads for a Human Owner merge, specialization, pause, or archive decision rather than silently keeping duplicate missions.

Run housekeeping or an evolution review only after at least three substantive completed tasks since the last review, or when a concrete failure threshold is hit. A zero-sample cycle produces no empty issue. Every proposed change must cite an observed behavior and a measurable expected effect.

Project workflow frameworks are an optional overlay. Follow them when the project already supplies the relevant files or the Human Owner explicitly requests a retrofit. Missing framework files must not block ordinary squad work.

## Operational evidence to record

- topology selected and why a squad is needed;
- dispatch attempts versus valid receipts;
- duplicate packets prevented;
- failure class, recovery attempt, and outcome;
- comments per issue and repair-loop count;
- repeated Human Owner questions or permission prompts;
- substantive completed tasks since the last evolution review;
- stale or overlapping squad and autopilot decisions.
