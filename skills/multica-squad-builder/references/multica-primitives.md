# Multica Primitives Reference

Use this reference when generating Multica-specific instructions.

## Skill

A Skill is a knowledge pack: `SKILL.md` plus optional files such as scripts, configs, references, and templates. It must be attached to an agent to take effect. Edits affect newly created tasks, not tasks already running.

## Agent

An agent has a runtime and role instructions. Role instructions define what it must do and what it must not do. A Skill augments the agent but should not replace role-specific system instructions.

## Squad

A squad is a routing layer led by a leader agent. The leader reads the issue and roster, then delegates to members using exact mention markdown from the roster. Typing a guessed plain `@Name` is not reliable. Squad membership does not make the agents more capable; it coordinates them.

On a squad-assigned issue, the leader should delegate once, record/evaluate if the CLI/runtime supports it, and stop. The leader should not implement the work.

## Issue and task

Issues are the visible units of work. Tasks are agent work sessions created by assignment, mention, chat, autopilot, or rerun. Do not assume an issue is complete just because one task finished.

A single issue may have multiple tasks over time. After failure, retry, rerun, reassignment, or parallel mention, re-check the issue state, latest comments, repo scope, and gates.

## Status

Use: `backlog`, `todo`, `in_progress`, `in_review`, `blocked`, `done`, `cancelled`.

Recommended semantics:

- `backlog`: not ready to trigger agents.
- `todo`: ready for squad routing.
- `in_progress`: research, RFC, debugging, or implementation is underway.
- `in_review`: waiting on reviewer or Human Owner.
- `blocked`: requires external input; comment must state the blocker.
- `done`: PR merged or Human Owner accepts no-PR result.
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

## Runtime / daemon

Agents run through local daemon/runtime/tooling. Before live operation, verify runtime availability, repo access, Skill pickup, exact roster mention markdown, and ability to read Project Resources.
