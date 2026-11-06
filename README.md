# Kahlil Skills

[简体中文](README.zh-CN.md)

Kahlil Skills is a public collection of installable AI agent Skills. The first
Skill is `multica-squad-builder`, a lean Skill for designing, iterating, and
auditing Multica-style agent squads.

Each Skill lives in its own folder under `skills/`, so the repository can grow
without mixing package files together.

## Skill

| Skill | Version | Purpose |
| --- | --- | --- |
| `multica-squad-builder` | `2.1.1` | Design, iterate, and audit Multica-style agent squads with a leader charter and minimal hard gates. |

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
  releases/
```

## Usage

For `multica-squad-builder`, start with:

```bash
cd skills/multica-squad-builder
python3 scripts/validate_skill.py
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

Current public package: `multica-squad-builder` v2.1.1.
The default installer follows `main`; versioned bundles and checksums are available on [GitHub Releases](https://github.com/HazelKahlil/Kahlil-skills/releases/tag/v2.1.1).

## Agent Maintenance

Agents updating this repository should follow `AGENTS.md` before editing,
validating, committing, or publishing changes.

## Publishing Rule

Before publishing a new skill or release, run the checklist in `docs/publishing-checklist.md`.

## License

MIT. See `LICENSE`.
