# Kahlil Open Skills

[简体中文](README.zh-CN.md)

Kahlil Open Skills is a public collection of cleaned, reusable skills for AI
agent workflows, automation, and project operations.

This repository is intentionally small. It contains publishable skill packages
and the minimum documentation needed to understand, validate, and reuse them. It
does not include private workspace IDs, local machine paths, project-specific
issue history, credentials, screenshots, databases, or internal reports.

## Skills

| Skill | Version | Purpose |
| --- | --- | --- |
| `multica-squad-builder` | `1.1.3` | Design, configure, audit, migrate, operate, and iterate Multica-style agent squads. |

## Repository Layout

```text
skills/
  multica-squad-builder/
    SKILL.md
    references/
    templates/
    scripts/
docs/
  publishing-checklist.md
  sanitization-report.md
```

## Usage

Each skill is self-contained under `skills/<skill-name>/`.

For `multica-squad-builder`, start with:

```bash
cd skills/multica-squad-builder
python3 scripts/validate_skill.py
python3 scripts/red_team_check.py
```

Then adapt the templates for your own workspace, roster, project resources, and mention map. Do not reuse example placeholders as real IDs.

## Release Status

Current public release: `multica-squad-builder` v1.1.3.

## Publishing Rule

Before publishing a new skill or release, run the checklist in `docs/publishing-checklist.md`.

## License

MIT. See `LICENSE`.
