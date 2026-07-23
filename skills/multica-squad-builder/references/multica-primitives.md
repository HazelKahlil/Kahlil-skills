# Multica Primitives Reference

Use this reference when generating Multica-specific instructions.

## Skill

A Skill is a knowledge pack: `SKILL.md` plus optional files such as scripts, configs, references, and templates. It must be attached to an agent to take effect. Edits affect newly created tasks, not tasks already running.

## Agent

An agent has a runtime and role instructions. Role instructions define what it must do and what it must not do. A Skill augments the agent but should not replace role-specific system instructions.

## Squad

A squad is a routing layer led by a leader agent. The leader reads the issue and roster, then delegates to members using exact mention markdown from the roster. Typing a guessed plain `@Name` is not reliable. Squad membership does not make the agents more capable; it coordinates them.

On a squad-assigned issue, the leader should delegate once, verify that the delegation created a task, record its evaluation if the CLI/runtime supports it, and stop. The leader should not implement the work. When one known Agent is sufficient, direct assignment to that Agent is preferable to squad routing.

When available, record every leader trigger with `multica squad activity <issue-id> <action|no_action|failed> --reason ...`. Record `no_action` when the leader deliberately does nothing; silence is not an observable evaluation.

## Issue and task

Issues are the visible units of work. Tasks are agent work sessions created by assignment, mention, chat, autopilot, or rerun. Do not assume an issue is complete just because one task finished.

A single issue may have multiple tasks over time. After failure, retry, rerun, reassignment, or parallel mention, re-check the issue state, latest comments, repo scope, and gates.

Assignment, exact mention, rerun, and reassignment are dispatch attempts. Use the current CLI/API to read back issue runs or agent tasks and capture the new task ID. Do not report `queued`, `dispatched`, `running`, or completion from intent alone.

An `agent_error`, limit, timeout, or runtime disconnect is not an automatic retry guarantee. Permit one recovery attempt, verify its new task receipt, then block on a repeated failure class. Check current `multica <command> --help` rather than hardcoding an unavailable fallback command.

Use issue metadata, when available, as a small machine-readable coordination ledger rather than hiding stable state in long comments. Recommended fields include Skill version, execution topology, validation route, idempotency key, latest dispatch task ID, and recovery count. Reconcile metadata with issue status and issue runs; metadata does not override source-of-truth state or higher-authority instructions.

## Stop and usage primitives

For a hard stop, list issue runs, identify the exact queued/running task IDs, cancel only those tasks with the current supported command, then read issue runs again. In current CLI versions this is exposed through `multica issue cancel-task`; verify `--help` before generating installable commands. Do not claim a squad is `PAUSED` while a targeted task remains active.

Use `multica issue usage`, when available, to observe aggregate token use. Observation is the default. Do not invent a hard cap or cancel work because of usage unless the Human Owner or project policy supplied the threshold and action.

## Status

Use: `backlog`, `todo`, `in_progress`, `in_review`, `blocked`, `done`, `cancelled`.

Recommended semantics:

- `backlog`: not ready to trigger agents.
- `todo`: ready for squad routing.
- `in_progress`: research, RFC, debugging, or implementation is underway.
- `in_review`: waiting on reviewer or Human Owner.
- `blocked`: requires external input; comment must state the blocker.
- `done`: for a child, its defined work packet and evidence are complete; for the parent, PR merged or Human Owner accepts the whole no-PR result.
- `cancelled`: intentionally not doing it.

Required transition discipline:

- Captain moves accepted routed work from `todo` to `in_progress`.
- Captain moves review-passed RFCs, research results, and no-PR implementation results to `in_review` before Human Owner acceptance.
- Captain does not leave review-passed work in `in_progress` merely because the trigger did not explicitly request a status change.
- `done` remains reserved for PR merge or explicit Human Owner no-PR acceptance.

## Project Resources

Prefer Project Resources for repo and project context. Do not rely on an issue comment alone to describe which repo/service/branch is in scope. Verify that the project resource list is visible to the agent before treating the setup as live.

Before LIVE, require either a Project Resource / canonical checkout or a clean local Git baseline for the project. If the project directory appears only as an untracked directory inside a broad parent repository, mark source-control readiness as a risk: reviewers cannot use Git diff as strong proof of changed-file scope. A lightweight local Git baseline with heavy paths ignored is acceptable when remote GitHub/PR flow is not desired.

## GitHub / PR

When an issue key appears in PR branch, title, or body, integration may link the PR to that issue; when the PR merges, the issue may move to Done. For multi-PR parent work, use child issues or avoid parent issue keys in partial PRs.

If the Human Owner approves `PR_CREATE`, treat task-branch creation, scoped commit, task-branch push, and opening the PR as one permission bundle. Merge and deploy remain separate unless current project policy explicitly says otherwise.

## Runtime / daemon

Agents run through local daemon/runtime/tooling. Before live operation, verify runtime availability, repo access, Skill pickup, exact roster mention markdown, ability to read Project Resources, leader-activity recording, issue metadata, task cancellation/readback, and usage readback when those controls are part of the generated pack.
