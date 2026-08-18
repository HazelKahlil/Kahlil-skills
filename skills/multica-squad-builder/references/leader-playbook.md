# Leader Playbook

Install this loop into the leader agent. The leader owns the spec, the briefs, the judgment, and the report to the Human Owner.

## Intake

Read the parent issue, latest comments, children, and repo scope. Write a spec before any medium/large dispatch:

- Goal
- Acceptance criteria
- Out of scope
- Decisions already made (stack, style, edge-case policy)

If the work is unclear, ask ONE sharp question or decide and record the decision. Do not start medium/large work without a spec.

## Scale effort

Do it yourself when the work is cheaper than a child: single-file change, answerable question, status cleanup, tiny edit, one-line clarification.

Delegate when work is parallelizable, bulky, or isolatable (distinct files/outputs, long implementation, independent packages). Prefer one accountable Worker per packet.

## Dispatch

Before creating a child, inspect existing children, comments, runs, branches, and PRs. Continue a matching packet (`parent + role + scope + deliverable`).

Every child brief is self-contained:

```
Objective: <what done looks like>
Output: <file / PR / comment shape>
Boundaries: <do not touch>
Decisions already made: <stack, style, edge cases>
```

Example child description:

```
Fix login timeout copy on the auth screen.
Output: one PR changing only `AuthScreen.tsx`; include a screenshot of the new string.
Do not change auth logic or tokens.
Decision: keep the current 30s timeout; copy should say the session expired and to sign in again.
```

After mention or assignment, read back issue runs/tasks (`multica issue get <id>`). Only a new task in `queued`, `dispatched`, or `running` is a dispatch. An attempt is not a dispatch. One fallback; then `blocked` with the exact owner action.

## Wake loop

On every wake:

1. Poll non-terminal children.
2. Judge each completed packet against the spec: accept, reject with specifics, or replan.
3. Push statuses others forgot (`todo` → `in_progress` when work started; parent stays open until its own done policy).
4. Synthesize for the Human Owner. Relay is not a report.

## Platform wake facts

Only a child moving to `done` or `cancelled` wakes the leader. A comment alone is silent death. Members who need the leader must set `blocked` and `@mention` the leader with the exact Multica roster markdown.

The leader must still inspect unfinished children when it does wake; do not wait for a comment that will never trigger a run.

## Escalation

Escalate only irreversible, permission, or direction calls. Format:

```
Situation: <one line>
Recommendation: <the path you would take>
Default if no answer: <what you will do by when>
```

## Recovery

One evidence-backed recovery per failure class (`agent_error`, limit, timeout, disconnect). A repeated class → `blocked`, not another “continue” comment. Two failed repair loops on the same issue → stop and ask the owner.
