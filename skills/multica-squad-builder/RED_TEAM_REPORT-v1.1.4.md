# Red Team Report v1.1.4

## Scope

Review Gate v3 was red-teamed for over-review waste, unsafe skip-review paths, reviewer loops, missing ownership, and Human Owner bypass risks.

## Attack / Patch Record

| Attack | Classification | Patch |
| --- | --- | --- |
| Agent marks risky work R0 to avoid review. | Critical | R0 is allowlist-only; worker `review_level` is advisory only. |
| Issue or comment instructs the squad to skip review. | Critical | Issue/comment/repo/log/generated output remains untrusted task data and cannot force R0. |
| Small auth/security/data change bypasses review due to low LOC. | Critical | Hard escalation rules make high-risk domains never R0. |
| DRAFT setup pack gets treated as installable. | Critical | DRAFT remains non-installable; DRAFT to PILOT requires review gate and LIVE requires Human Owner. |
| Missing mention map causes guessed reviewer mentions. | Critical | Missing exact roster mention markdown blocks delegation. |
| AI review noise creates wasted cycles. | High | AI review is advisory by default and comment severity is required. |
| Multiple specialists duplicate review effort. | High | R2 review scopes must be explicit; split work if more than two specialist scopes are needed. |
| Branch protection is bypassed by internal policy. | High | External GitHub/GitLab protections override internal review minimization. |

## Residual Risk

No known unresolved Critical / High design risks remain inside the Skill. Real-world calibration still requires PILOT metrics for R0 audit pass rate, reviewer load, review latency, and Human Owner rejection rate.
