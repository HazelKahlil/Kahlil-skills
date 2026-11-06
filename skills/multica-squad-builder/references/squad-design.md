# Squad Design

Choose topology before names, personas, or roster size. Document why a squad is needed.

## Topology

| Topology | Use when | Roster |
| --- | --- | --- |
| Direct single agent | One known executor, one deliverable | No squad. Assign that agent. |
| Routed single-worker | Issue is already squad-assigned; one Worker can own it | Leader + one Worker |
| Staged squad | Real dependencies; each stage has an artifact and a handoff check | Leader + Workers for sequential packets; Reviewer only on risk |
| Parallel squad | Independent packets, distinct files/outputs, parallelism saves time | Leader + one Worker per packet |

If child or stage creation is unavailable, fall back to routed single-worker.

## Minimum roster by project shape

| Shape | Start with |
| --- | --- |
| New project | Leader + Worker. Add Reviewer only after blast-radius work appears. |
| Existing project | Same; discover repo, tests, CI, ownership before broad edits. |
| Legacy / handoff | Audit first; old issues stay `backlog` until classified. Leader + Worker. |
| Spike / temporary | Timebox, artifact, exit criteria. Often direct single agent. |
| Incident | Reproduce, mitigate, rollback, fix. Keep the roster tiny. |
| Multi-repo | List each repo/service/branch and attach Project Resources. One Worker per repo packet if truly independent. |

Risk-triggered Reviewer and Analyst may be idle by design. Add roles only for an evidenced need; lack of constant activity does not justify deleting an existing optional role.

## Setup facts to resolve

Read context and current configuration first. Ask only for material missing facts; these are topics, not a mandatory questionnaire:

1. **Scope** — what is in, what is out, which repos/branches?
2. **Safety** — secrets, production data, auth, billing, irreversible actions?
3. **Permissions** — `PR_CREATE` (branch + commit + push + open PR)? Merge/deploy stay off unless explicit.
4. **Repo + PR behavior** — Project Resource or local Git baseline? Issue key in PRs? Multi-PR work uses child issues.
5. **Exact mention markdown** — paste the Multica roster mention values. Guessing `@Name` is not a mention.

## Mention map

Resolve required IDs and mention forms from current accessible roster data. Ask only for unavailable material values. Proposals may identify unresolved targets without inventing IDs or pretending installability.

`@mention` creates tasks. Use it for first delegation, a real handoff, or escalation. Do not mention for thanks or closing comments.

## Persona

Optional display-name presets live in `references/role-theme-presets.md`. Names fill labels only. Duties, gates, and permissions come from role instructions.
