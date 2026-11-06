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

Resolve targets from current accessible roster data; ask only for unavailable material fields. A proposal may flag unresolved targets. For a narrow existing-agent patch, use only relevant sections and show changed fields rather than filling a full setup form.

## 4. Instantiated leader charter

{{LEADER_CHARTER}}

## 5. Squad instructions text

Paste the filled `templates/squad-instructions.md`. Resolve `{{REPAIR_LIMIT}}` from the specific valid project/packet decision; use 2 only when none is specified. Fill the same chosen number into the squad, leader, worker and reviewer text and applicable handoffs. Also fill {{REPAIR_EXTENSION_POLICY}} consistently: the exact project-delegated conditions, finite maximum and failure exit, or "No delegated extension; specific owner authorization is required beyond the cap" when none exists. These are authoring placeholders, not new runtime settings or questions when decisions are already known. Preserve an active packet's count and stopping decisions; replace the limit only under a specific valid decision, never to evade it.

## 6. Hard gates and permissions

- Consequential actions: use current authorization for exact scope; missing authority needs a decision. Preserve project merge/deploy/data/permission limits.
- `PR_CREATE`: {{PR_CREATE_POLICY}}
- Merge / deploy: {{MERGE_DEPLOY_POLICY}}
- Autopilot: off until {{HUMAN_OWNER}} approval.

## 7. Repo / PR policy

Repos / Project Resources: {{REPOS}}

Issue-key rule: only in a PR that should complete that issue. Multi-PR work uses child issues.

## 8. Verification and delivery

- Read back changed text/fields, IDs, membership and bindings; preserve unrelated settings.
- Distinguish saved configuration from behavior in a subsequent authorized run.
- Proposal-only work does not automatically dispatch samples, send mentions or create test PRs.
- Prefer an authorized real packet for behavioral verification. Any extra test dispatch must be in the authorized scope; observe success, blocked handoff and repair-cap exit without manufacturing failures.
- Ensure runtime roles receive their needed contract even when this Skill is attached only to the designer.
