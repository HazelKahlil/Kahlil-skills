# Fork map: guizang-social-card → kahlil-card

Upstream: https://github.com/op7418/guizang-social-card-skill

## Replaced (always)

| Area | Upstream default | kahlil-card |
|------|------------------|---------------|
| Seed template | `template-swiss-card.html` | `template-kahlil-card.html` |
| Accent | IKB `#002FA7` | **kahlil-orange** `#ED581E` |
| Paper | `#fafaf8` | `#F6F2EA` |
| Meta color | grey-3 | **brown** `#553B33` |
| Ink | `#0a0a0a` | `#282829` |
| EN fonts | Inter (Google) | **Futura** / **Canela** local |
| CN display | Noto Sans SC | **锐字驰光黑纤细** |
| CN body | Noto Sans SC | PingFang / system |
| Chrome L | `Vol. 01 · Swiss` | `Hazelkahlil · {THEME}` |
| Chrome R | date | `Vol. NN / YEAR / RECIPE` |
| Foot | `Issue` + `/ [作者]` | `Issue NN` + `/ Hazelkahlil` |
| Google Fonts | required link | **removed** |

## Kept (structure)

- S01–S12 Swiss recipes (docs + CSS primitives)
- M01–M16 Editorial recipes (docs; non-default seed)
- Components: cards, frames, matrix, KPI, device chrome, maps
- validate-social-deck geometry rules
- Live Photo scripts
- category cookbook / title shortener / QA / platform specs
- screenshot backgrounds assets

## EN dual mode

- `en-futura` (default on `<html>`): mixed case
- `en-canela`: ALL CAPS + tight tracking

## Files

| Path | Role |
|------|------|
| `assets/template-kahlil-card.html` | production seed |
| `assets/template-swiss-upstream.html` | untouched upstream swiss snapshot |
| `assets/template-editorial-card.html` | optional magazine path |
| `references/brand.md` | brand lock |
| `references/slots.md` | fixed vs generated |
| `scripts/init-task.sh` | new task |
| `scripts/render-task.mjs` | Playwright export |
