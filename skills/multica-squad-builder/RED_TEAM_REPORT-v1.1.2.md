# Multica-Squad-Builder v1.1.2 Final Red-team Report

## Confidence standard

Mathematical 100% confidence is not claimed. Operational confidence is claimed when the offline package has no known unresolved Critical / High design risks and remaining real-environment risks are converted into live checks.

## Loop run

1. **Attack** — reviewed v1.1.0/v1.1.1 Lean Core for size, root-name, role-boundary, mention, rendering, task failure, autopilot, supply-chain, and live-rollout weaknesses.
2. **Classify** — identified high-value gaps: exact mention map not installability-critical, setup packs could remain placeholder-filled, task failure/rerun policy was too light, Builder Skill could be attached too broadly, autopilot defaults were not explicit, and the previous zip root could drift from the Skill machine name.
3. **Patch** — produced v1.1.2 with exact mention fields, installability warnings, authority order, autopilot-off-by-default, task reconciliation, builder-vs-operational boundary, and clean package root.
4. **Test** — ran validation, red-team check, render check, unzip check, root-directory check, and checksum generation.
5. **Record** — this report.

## Tests run

```text
python scripts/validate_skill.py
python scripts/red_team_check.py
python scripts/render_minimal_pack.py config/squad-profile.template.json /mnt/data/msb_v112_clean/generated.md
unzip package and rerun validation + red-team checks
verify zip root == multica-squad-builder
```

## Remaining live checks

- Confirm Skill import and attachment in the real Multica workspace.
- Confirm Skill pickup by the actual agent runtime.
- Confirm daemon/runtime/toolchain availability.
- Confirm Project Resources / repo access.
- Confirm exact roster mention markdown.
- Confirm GitHub webhook, branch protection, CI, and PR/Done behavior.
- Confirm Human Owner availability.
- Confirm Analyst data/MCP authorization and privacy boundary.
- Confirm autopilots remain off until LIVE and explicit approval.

## Stop/go recommendation

Go for DRAFT → PILOT rollout. Do not mark LIVE until no-code smoke tests and 2-3 low-risk pilot issues pass.