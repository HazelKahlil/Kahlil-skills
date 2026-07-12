# Release Notes v1.1.4

This release adds Review Gate v3 to reduce unnecessary review while preserving high-risk controls.

## Highlights

- R0 no-review path is now allowlist-only and requires `skip_review_reason`.
- R1 uses exactly one accountable reviewer by default.
- R2 covers scoped specialist review for high-risk domains and large or uncertain changes.
- R3 preserves Human Owner authority for merge, deploy, destructive actions, production data, permission changes, autopilot, and LIVE installation.
- Templates now require review scope, severity labels, risk flags, and validation evidence.

## Validation

Run:

```bash
python3 scripts/validate_skill.py
python3 scripts/red_team_check.py
shasum -a 256 -c CHECKSUMS.txt
```
