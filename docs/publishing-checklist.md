# Publishing Checklist

Run this checklist before pushing a release to GitHub.

## Content

- [ ] Skill content is generic and reusable.
- [ ] `AGENTS.md` has been read before editing or publishing.
- [ ] No private setup packs, issue transcripts, run logs, screenshots, databases, or generated private reports are included.
- [ ] Project-specific examples are anonymized or expressed as placeholders.
- [ ] README explains purpose, layout, validation, and usage.
- [ ] LICENSE is present.
- [ ] SECURITY.md is present.

## Sanitization

Run from the repository root:

```bash
rg -n --glob '!docs/publishing-checklist.md' '/Users/|mention://|workspace_id|agent_id|member_id|issue_id|[A-Z]{2,10}-[0-9]+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' .
```

Expected result: no private IDs, local paths, issue keys, or mention links. Placeholders such as `{{PROJECT_NAME}}` are fine.

Run a basic secret-pattern scan:

```bash
rg -n --glob '!docs/publishing-checklist.md' 'sk-[A-Za-z0-9]|ghp_|github_pat_|xox[baprs]-|AKIA[0-9A-Z]{16}|BEGIN (RSA|OPENSSH|PRIVATE) KEY|api[_-]?key|access[_-]?token|refresh[_-]?token|cookie|secret' .
```

Expected result: no real secrets. Policy documents may contain words such as `secret` or `cookie`; inspect those matches manually.

## Skill Validation

For each skill with validation scripts:

```bash
cd skills/<skill-name>
python3 scripts/validate_skill.py
python3 scripts/red_team_check.py
shasum -a 256 -c CHECKSUMS.txt
```

## Installation

- [ ] One-line install command is present in `README.md` and `README.zh-CN.md`.
- [ ] `scripts/install-skill.sh` installs into `${CODEX_HOME:-~/.codex}/skills`.
- [ ] Installer has been tested with a temporary destination.

## GitHub

- [ ] Confirm the repo name and visibility before creating the remote.
- [ ] Push only after sanitization passes.
- [ ] Tag releases only after checksums and version files are updated.
