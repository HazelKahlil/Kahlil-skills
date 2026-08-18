# {{SQUAD_NAME}} Setup Pack

Project: {{PROJECT_NAME}}
Human Owner: {{HUMAN_OWNER}}
Topology: {{EXECUTION_TOPOLOGY}}

## 1. Project assumptions and open questions

{{ASSUMPTIONS_AND_QUESTIONS}}

## 2. Topology decision

Selected: {{EXECUTION_TOPOLOGY}}

Why a squad is needed: {{SQUAD_JUSTIFICATION}}

Direct single agent when one executor and one deliverable suffice. Routed single-worker when the issue is already squad-assigned. Staged/parallel only for real dependencies or independent packets.

## 3. Roster with exact mention map

{{ROSTER_MENTION_MAP}}

Missing mention markdown = not installable. Paste values from the Multica roster.

## 4. Instantiated leader charter

{{LEADER_CHARTER}}

## 5. Squad instructions text

Paste the filled `templates/squad-instructions.md`.

## 6. Hard gates and permissions

- Human Decision Gate: deletion, permissions, accounts, billing, DNS, auth, secrets, production data, irreversible actions.
- `PR_CREATE`: {{PR_CREATE_POLICY}}
- Merge / deploy: {{MERGE_DEPLOY_POLICY}}
- Autopilot: off until {{HUMAN_OWNER}} approval.

## 7. Repo / PR policy

Repos / Project Resources: {{REPOS}}

Issue-key rule: only in a PR that should complete that issue. Multi-PR work uses child issues.

## 8. Live smoke checklist

- [ ] Exact mention map pasted and a test mention creates a task
- [ ] Dispatch receipt: new task in `queued` / `dispatched` / `running`
- [ ] Leader did a tiny task itself and delegated one isolatable packet
- [ ] Worker `done` wakes leader; a comment-only note does not
- [ ] `PR_CREATE` reaches an open PR without a second push approval
- [ ] Project Resources or local Git baseline visible to agents
