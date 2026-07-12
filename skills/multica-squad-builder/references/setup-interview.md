# Setup Interview

Ask only questions that affect safety, scope, permissions, routing, data access, PR behavior, Project Resources, exact roster mentions, or migration strategy.

## Minimum questions

1. What should the squad be called?
2. Who is the Human Owner?
3. Is there one known executor and one deliverable? If yes, why is a squad needed instead of direct single-agent assignment?
4. Which work packages are dependent, which are genuinely independent, and which files or outputs could conflict?
5. What project type is this: new project, existing project, legacy migration, takeover, temporary project, incident, or multi-repo project?
6. Which repos, projects, services, or branches are in scope?
7. What issue prefix or tracker identifier should PRs use?
8. May agents create PRs? Default permission bundle: `PR_CREATE` includes branch, commit, task-branch push, and opening the PR.
9. May agents merge, deploy, change permissions, access production, or run destructive commands? Default: no.
10. Are there old tasks or legacy issues? Default: keep them in Backlog until audited.
11. Are metrics, logs, customer data, experiments, PII, secrets, auth, billing, or security involved?
12. Which CI, tests, readbacks, or release gates define done?
13. After creating the squad, what exact roster mention markdown does Multica show for Worker, Reviewer, Analyst, and Human Owner?
14. What should the Human Owner experience be: results-only updates, visual source artifact, approval boundaries, and escalation format?
15. What context budget and recovery budget should apply? Defaults: 80 comments, two rejected repair loops, and one recovery attempt per failure class.
16. Will this Skill be used only by a Squad Designer, or also attached to operational agents? Default: designer first; generated role instructions for operational agents.

## Conservative defaults

- Start as DRAFT until no-code smoke tests pass.
- Prefer direct single-agent assignment. Use a routed single-worker squad only when the issue is already squad-assigned; use staged/parallel work only when dependencies or independence justify it.
- Legacy tasks start in Backlog.
- Captain concurrency: 1.
- Worker concurrency: 1–2 initially.
- Reviewer concurrency: 1.
- Analyst concurrency: 1.
- `PR_CREATE` includes task branch, commit, push, and opening the PR; agents may not merge or deploy.
- Multi-PR work uses child issues.
- Plain `@Name` is not considered verified mention syntax.
- Dispatch is successful only after a new task ID is read back in `queued`, `dispatched`, or `running`.
- Evolution reviews need three substantive completed tasks or a concrete failure trigger; zero-sample cycles create no issue.

## Setup output

Generate a setup pack using `templates/setup-pack-template.md`. Record the execution topology and why a squad is needed. If names or exact mention markdown are missing, leave clearly marked placeholders and state that the setup is not installable yet.
