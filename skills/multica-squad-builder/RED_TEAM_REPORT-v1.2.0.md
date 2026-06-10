# Red Team Report v1.2.0

## Scope

Review Router v2 was red-teamed against the user's core failure modes: repeated review loops, visual work being judged by agents, stale/offline assumptions for native platform/API work, deploy tasks without real readback, and long parent issues hiding state.

## Attack / Patch Record

| Attack | Classification | Patch |
| --- | --- | --- |
| A squad sends every completed task to Reviewer by habit. | Critical | Review Router v2 requires routing by validation type, and Reviewer is only the Blocker Gate. |
| Reviewer approves a UI detail that the user visually rejects. | Critical | Human Visual Acceptance is explicit; user visual rejection beats Agent PASS. |
| A native platform/API task relies on stale model knowledge. | High | Source Verification route requires official/current/primary-source checks before implementation. |
| Deployment is marked done without checking real runtime behavior. | High | Live Readback route requires concrete command output, URL/API result, logs, or screenshot evidence. |
| Reviewer creates long repeated loops with broad feedback. | High | Reviewer may output only PASS or BLOCKED, with at most 3 true blockers and exact clearing conditions. |
| A child issue or parent issue grows into noisy status churn. | Medium | Issue Hygiene Gate requires summarize/split/ask-user behavior when the issue becomes hard to reason about. |
| The user explicitly asks for a squad, but the designer blocks on whether a squad is needed. | Medium | Skill keeps the user's squad request as an execution command; it may advise, but must not block creation on that basis. |

## Residual Risk

No known unresolved Critical / High design risks remain inside the Skill. Real-world pilot runs should still watch for two practical risks: agents misclassifying the validation route, and humans accepting weak Live Readback evidence. Both should be caught during the first 2-3 low-risk squad pilot issues.
