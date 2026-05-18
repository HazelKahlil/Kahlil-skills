# Multica-Squad-Builder v1.1.2 Release Notes

v1.1.2 is the final lean-hardening build after one more confidence-loop audit. It keeps the active Skill small while preserving the guardrails needed for real Multica squad setup.

## Fixes over v1.1.1 draft

- Ensured the zip root directory is exactly `multica-squad-builder`, matching the Skill machine name.
- Removed duplicate `prompts/` copy and stale release artifacts from the importable package.
- Kept exact roster mention map, installability warning, task failure/rerun reconciliation, authority order, autopilot guard, builder-vs-operational boundary, and red-team checker.

## Size posture

The package remains under the lean budget: `SKILL.md` is under 300 lines, total file count is under 40, and zipped size remains well under 100 KB.