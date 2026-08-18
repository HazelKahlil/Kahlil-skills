# Agent Maintenance Instructions

This repository publishes reusable AI agent skills. Keep it small, public-safe,
and easy for other agents to install.

## Required Workflow

Before changing files:

1. Read `README.md`, `README.zh-CN.md`, and this file.
2. Keep changes scoped to the requested skill or documentation.
3. Do not add private workspace data, local machine paths, credentials, issue
   transcripts, screenshots, databases, or internal reports.
4. Keep English and Simplified Chinese README content in sync when public-facing
   descriptions, install commands, or release status change.

Before publishing changes:

1. For each changed skill, run its validation scripts.
2. Update `VERSION` and `CHANGELOG.md` when files inside a skill package change.
3. Run the repository sanitization checks from `docs/publishing-checklist.md`.
4. If `scripts/install-skill.sh` or install instructions change, test the
   installer with a temporary `KOS_DEST`.
5. Commit only the intended files and push only after checks pass.

## Standard Checks

For `multica-squad-builder`:

```bash
cd skills/multica-squad-builder
python3 scripts/validate_skill.py
```

For the installer:

```bash
tmp_dest="$(mktemp -d)"
KOS_SOURCE_DIR="$PWD" KOS_DEST="$tmp_dest/skills" bash scripts/install-skill.sh
rm -rf "$tmp_dest"
```

## Public Install Command

The current default install command is:

```bash
curl -fsSL https://raw.githubusercontent.com/HazelKahlil/Kahlil-skills/main/scripts/install-skill.sh | bash
```

After installing, restart Codex or the agent runtime so the new skill is loaded.
