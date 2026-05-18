# Setup Interview

Ask only questions that affect safety, scope, permissions, routing, data access, PR behavior, Project Resources, exact roster mentions, or migration strategy.

## Minimum questions

1. What should the squad be called?
2. Who is the Human Owner?
3. What project type is this: new project, existing project, legacy migration, takeover, temporary project, incident, or multi-repo project?
4. Which repos, projects, services, or branches are in scope?
5. What issue prefix or tracker identifier should PRs use?
6. May agents create PRs?
7. May agents merge, deploy, change permissions, access production, or run destructive commands? Default: no.
8. Are there old tasks or legacy issues? Default: keep them in Backlog until audited.
9. Are metrics, logs, customer data, experiments, PII, secrets, auth, billing, or security involved?
10. Which CI, tests, or release gates define done?
11. After creating the squad, what exact roster mention markdown does Multica show for Worker, Reviewer, Analyst, and Human Owner?
12. Will this Skill be used only by a Squad Designer, or also attached to operational agents? Default: designer first; generated role instructions for operational agents.

## Conservative defaults

- Start as DRAFT until no-code smoke tests pass.
- Legacy tasks start in Backlog.
- Captain concurrency: 1.
- Worker concurrency: 1–2 initially.
- Reviewer concurrency: 1.
- Analyst concurrency: 1.
- Agents may create PRs but not merge or deploy.
- Multi-PR work uses child issues.
- Plain `@Name` is not considered verified mention syntax.

## Setup output

Generate a setup pack using `templates/setup-pack-template.md`. If names or exact mention markdown are missing, leave clearly marked placeholders and state that the setup is not installable yet.