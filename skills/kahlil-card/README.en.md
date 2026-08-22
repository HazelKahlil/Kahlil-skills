# Kahlil Card

[简体中文](README.md)

Kahlil's social-card Skill for turning articles, product notes, screenshots, photos, or video material into reviewable 3:4 social-card sets. It also supports WeChat 21:9 + 1:1 cover pairs, Live Photo cards, and content-driven Editorial / Swiss layouts.

## Public package contents

- `SKILL.md` — trigger boundary, locked brand system, workflow, and delivery rules.
- `assets/` — Kahlil templates, font-slot documentation, texture backgrounds, and the WebGL background helper.
- `references/` — brand, layout, asset, Live Photo, AI-Look, platform, and QA rules.
- `scripts/` — task initialization, HTML rendering, document checks, and Live Photo helpers.
- `examples/` — review examples for layout and typography; never use this directory for generated output.

The default brand uses paper `#F6F2EA`, accent orange `#ED581E`, brown `#553B33`, and ink `#282829`. Latin display uses Futura, with Canela as an alternative; Chinese display uses Ruizi Xianxi. Do not silently switch back to the upstream IKB blue, Inter, or Noto Google stack.

## Install

From the repository root:

```bash
bash scripts/install-skill.sh kahlil-card
```

Or install directly from GitHub:

```bash
curl -fsSL https://raw.githubusercontent.com/HazelKahlil/Kahlil-skills/main/scripts/install-skill.sh \
  | env SKILL_NAME=kahlil-card bash
```

Restart Codex or the other agent runtime after installation.

## Use

```text
Use kahlil-card to turn this article into five 3:4 social cards using my default brand.
Use kahlil-card to turn this video into a five-second Live Photo card; review the static first frame first.
```

For real rendering, initialize a task directory and run its copied `render.mjs`:

```bash
KAHLIL_CARD_ROOT="$PWD" \
  bash skills/kahlil-card/scripts/init-task.sh --name Example-Topic
cd platforms/Kahlil-cards/YYYY年M月/D日/Example-Topic
node render.mjs
```

Generated images go to the task's `输出/<time>/` folder, never the Skill root. See `SKILL.md` and `references/` for recipes, platform limits, AI-Look gates, and QA.

## Validate

```bash
node skills/kahlil-card/scripts/check-skill-docs.mjs
node skills/kahlil-card/validate-social-deck.mjs path/to/task-dir
```

`validate-social-deck.mjs` needs Playwright available for the task. The public package intentionally does not vendor `node_modules`; run `npm install` when rendering is required.

## License and fonts

The templates and scripts retain the upstream AGPL-3.0 license in `LICENSE`. Futura, Canela, and Ruizi require the user to obtain appropriate licenses. For that reason, the public package does not bundle commercial font binaries; it keeps only the relative-path documentation. Other private fonts are not redistributed either.
