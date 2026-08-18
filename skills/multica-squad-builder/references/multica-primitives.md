# Multica Primitives

Use this reference when generating Multica-specific instructions. Check `multica <command> --help` before hardcoding flags.

## Skill

A Skill is a knowledge pack (`SKILL.md` plus optional files). It must be attached to an agent to take effect. Edits affect newly created tasks, not tasks already running.

## Agent

An agent has a runtime and role instructions. A Skill augments the agent; it does not replace role-specific instructions.

## Squad

A squad is led by a leader agent. The leader reads the issue and roster, then delegates with exact mention markdown from the roster. Guessed plain `@Name` is unreliable. Membership coordinates agents; it does not make them more capable.

When one known agent is sufficient, assign that agent directly.

## Issue and task

Issues are the visible units of work. Tasks are agent work sessions created by assignment, mention, chat, autopilot, or rerun. One finished task does not complete an issue.

Assignment, exact mention, rerun, and reassignment are dispatch attempts. Read back issue runs or agent tasks and capture the new task ID. Do not report `queued`, `dispatched`, `running`, or completion from intent alone.

An `agent_error`, limit, timeout, or disconnect is not an automatic retry. Permit one recovery attempt, verify its new task receipt, then block on a repeated failure class.

## Status

Use: `backlog`, `todo`, `in_progress`, `in_review`, `blocked`, `done`, `cancelled`.

- `backlog`: not ready to trigger agents.
- `todo`: ready for routing.
- `in_progress`: work is underway.
- `in_review`: waiting on reviewer or Human Owner.
- `blocked`: needs external input; the comment states the blocker.
- `done`: child packet complete; parent requires PR merge or Human Owner no-PR acceptance.
- `cancelled`: intentionally not doing it.

Move accepted routed work from `todo` to `in_progress`. Keep parent `done` for merge or explicit no-PR acceptance.

Wake fact: only a child `done` or `cancelled` wakes the leader. Members who need the leader set `blocked` and `@mention` the leader. A comment alone does not start a leader run.

## Project Resources

Prefer Project Resources for repo and project context. Verify the resource list is visible to the agent before treating setup as live. A project that exists only as an untracked directory inside a broad parent repo is a source-control readiness risk.

## GitHub / PR

When an issue key appears in PR branch, title, or body, merge may move that issue to Done. For multi-PR parent work, use child issues.

If the Human Owner approves `PR_CREATE`, treat task-branch creation, scoped commit, task-branch push, and opening the PR as one permission bundle. Merge and deploy remain separate.

## Runtime

Before live operation, verify runtime availability, repo access, Skill pickup, exact roster mention markdown, and Project Resource visibility.
