# Contributing

This repository accepts reusable skill packages only. Keep contributions generic and portable.

## Requirements

- Do not include private workspace IDs, agent IDs, member IDs, issue IDs, local paths, secrets, cookies, database files, screenshots, or private project reports.
- Use placeholders for workspace-specific values, for example `{{PROJECT_NAME}}`, `{{HUMAN_OWNER}}`, and `{{CAPTAIN_MENTION}}`.
- Keep skills self-contained under `skills/<skill-name>/`.
- Include validation scripts when practical.
- Update `README.md`, `CHANGELOG.md`, `VERSION`, `METRICS.json`, and `CHECKSUMS.txt` when a skill release changes.

## Validation

For `multica-squad-builder`:

```bash
cd skills/multica-squad-builder
python3 scripts/validate_skill.py
python3 scripts/red_team_check.py
shasum -a 256 -c CHECKSUMS.txt
```

Also run the repository-level sanitization checks in `docs/publishing-checklist.md`.
