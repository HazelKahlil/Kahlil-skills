# Contributing

This repository accepts reusable skill packages only. Keep contributions generic and portable.

## Requirements

- Do not include private workspace IDs, agent IDs, member IDs, issue IDs, local paths, secrets, cookies, database files, screenshots, or private project reports.
- Use neutral placeholder names for workspace-specific values instead of real IDs.
- Keep each Skill self-contained under `skills/<skill-name>/`.
- Include validation scripts when practical.
- Update `README.md`, `CHANGELOG.md`, and `VERSION` when a skill release changes.

## Validation

For `multica-squad-builder`:

```bash
cd skills/multica-squad-builder
python3 scripts/validate_skill.py
```

Also run the repository-level sanitization checks in `docs/publishing-checklist.md`.
