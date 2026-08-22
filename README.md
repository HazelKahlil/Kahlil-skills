# Kahlil Skills

[简体中文](README.zh-CN.md)

Kahlil Skills is a public collection of reusable AI-agent Skills. Each Skill is isolated under `skills/` with its own instructions, references, assets, scripts, and validation where needed.

## Skills

| Skill | Version | Purpose |
| --- | --- | --- |
| `multica-squad-builder` | `2.0.0` | Design, iterate, and audit Multica-style agent squads. |
| `kahlil-cover` | `0.2.0` | Turn an article or topic into an article-specific social-cover prompt, with IP and content-visual modes. |
| `kahlil-aesthetic` | `2.0.0` | Preserve curated visual references as verifiable, reusable aesthetic evidence. |
| `kahlil-card` | `1.0.0` | Produce Kahlil-branded social-card sets, cover pairs, and Live Photo cards. |

## Install

Install one Skill:

```bash
bash scripts/install-skill.sh kahlil-cover
bash scripts/install-skill.sh kahlil-aesthetic
bash scripts/install-skill.sh kahlil-card
```

Install every public Skill:

```bash
bash scripts/install-skill.sh all
```

From a clean machine, the same installer can be piped from GitHub:

```bash
curl -fsSL https://raw.githubusercontent.com/HazelKahlil/Kahlil-skills/main/scripts/install-skill.sh | bash -s -- all
```

The installer writes to `${CODEX_HOME:-~/.codex}/skills/<skill-name>`. Use `KOS_DEST` for a temporary review destination and `KOS_OVERWRITE=1` to replace an existing copy. Restart Codex or the agent runtime after installation.

## Validate

```bash
cd skills/multica-squad-builder && python3 scripts/validate_skill.py
cd skills/kahlil-cover && bash tests/validate-skill.sh
cd skills/kahlil-aesthetic && node --test tests/*.test.mjs
node skills/kahlil-card/scripts/check-skill-docs.mjs
```

For the full package and publishing checks, see `docs/publishing-checklist.md`. The repository is intentionally public-safe: no private workspace data, credentials, local machine paths, or generated private reports belong here.

## Layout

```text
skills/<skill-name>/
  SKILL.md
  README.md              # when the package needs a human-facing guide
  VERSION
  CHANGELOG.md
  agents/                # optional UI metadata
  references/            # conditional instructions and schemas
  assets/                # templates, fonts, images, or fixtures
  scripts/               # deterministic helpers
```

## License

The repository-level material is MIT (`LICENSE`). Individual Skill packages may retain their own upstream license; check the package's `LICENSE` before redistribution.
