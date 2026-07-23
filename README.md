# Kahlil Skills

[简体中文](README.zh-CN.md)

Kahlil Skills is a public collection of installable AI agent Skills. The first
Skill is `multica-squad-builder`, a lean Skill for designing, configuring,
auditing, migrating, operating, and iterating Multica-style agent squads.

Each Skill lives in its own folder under `skills/`, so the repository can grow
without mixing package files together.

## Skill

| Skill | Version | Purpose |
| --- | --- | --- |
| `multica-squad-builder` | `1.5.0` | Design, theme, audit, repair, operate, and iterate Multica-style squads with observable coordination and verified stopping. |

## Repository Layout

```text
skills/
  multica-squad-builder/
    SKILL.md
    agents/
    references/
    templates/
    config/
    scripts/
docs/
  publishing-checklist.md
  sanitization-report.md
  releases/
```

## Usage

For `multica-squad-builder`, start with:

```bash
cd skills/multica-squad-builder
python3 scripts/validate_skill.py
python3 scripts/red_team_check.py
python3 scripts/test_operational_contract.py
shasum -a 256 -c CHECKSUMS.txt
```

Then adapt the templates for your own workspace, roster, project resources, and mention map. Do not reuse example placeholders as real IDs.

## Install

Copy this command into an agent shell to install the current public skill:

```bash
curl -fsSL https://raw.githubusercontent.com/HazelKahlil/Kahlil-skills/main/scripts/install-skill.sh | bash
```

It installs `multica-squad-builder` to `${CODEX_HOME:-~/.codex}/skills/multica-squad-builder`.
Restart Codex or the agent runtime after installation.

To replace an existing local copy:

```bash
curl -fsSL https://raw.githubusercontent.com/HazelKahlil/Kahlil-skills/main/scripts/install-skill.sh | env KOS_OVERWRITE=1 bash
```

## Release Status

Current public release: `multica-squad-builder` v1.5.0.

## Agent Maintenance

Agents updating this repository should follow `AGENTS.md` before editing,
validating, committing, or publishing changes.

## Publishing Rule

Before publishing a new skill or release, run the checklist in `docs/publishing-checklist.md`.

## License

MIT. See `LICENSE`.
