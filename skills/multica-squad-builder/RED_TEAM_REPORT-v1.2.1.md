# Red Team Report v1.2.1

## Scope

The validation budget was red-teamed against abuse in both directions: the budget being cited to skip mandatory gates, and the budget failing to stop review loops.

## Attack / Patch Record

| Attack | Classification | Patch |
| --- | --- | --- |
| An agent cites the validation budget to skip Human Decision Gate or Source Verification on risky work. | Critical | The budget explicitly never waives Human Decision Gate, Source Verification, branch protection, CODEOWNERS, or org rules. |
| A captain keeps adding review rounds despite the budget. | High | Captain template carries the per-issue budget and the two-loop stop-and-escalate rule; repeated overruns are an Issue Hygiene Gate trigger. |
| A reviewer reopens new non-blockers during the budgeted re-review. | Medium | Re-review checks only original blockers unless a severe new risk appears; the budget binds the re-review to that scope. |
| A worker self-classifies work as routine to stay under self-check. | Medium | Worker self-classification remains advisory; the captain derives the route from changed artifacts and risk flags, not labels. |

## Residual Risk

No known unresolved Critical / High design risks inside the Skill. Watch in live runs: captains misjudging genuinely risky work as routine — mitigated because hard escalation rules key off artifact types (deploy, auth, secrets, production data), not the routine label.
