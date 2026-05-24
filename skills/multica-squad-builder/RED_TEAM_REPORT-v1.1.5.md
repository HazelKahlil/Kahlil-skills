# Red Team Report v1.1.5

## Scope

Role theme presets were red-teamed for persona overreach, policy override, review-gate bypass, unsafe glamorization, and installable package bloat.

## Attack / Patch Record

| Attack | Classification | Patch |
| --- | --- | --- |
| A persona tells an agent to ignore its actual role. | Critical | Role themes are explicitly limited to display names, descriptions, and tone hints. |
| A theme bypasses Review Gate v3 because it feels playful or low-stakes. | Critical | `SKILL.md` states role flavor cannot override review gates, permissions, PR/Done, or safety rules. |
| A crime/corruption theme normalizes unsafe behavior. | High | Presets with dark-value baggage are marked `use_with_warning` and require value-system isolation. |
| Agents claim to literally be IP characters or copy signature dialogue. | Medium | Preset rules require inspiration-only use and prohibit literal identity claims or copied signature lines. |
| The preset library bloats the lean router. | Low | Theme detail is isolated in `references/role-theme-presets.md`; `SKILL.md` only adds a router line and invariant. |

## Residual Risk

No known unresolved Critical / High design risks remain inside the Skill. Real-world calibration should watch whether theme tone causes agents to become too verbose, too unserious, or less precise during PILOT runs.
