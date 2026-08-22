# Fixed slots vs content-generated slots

## Fixed (every page)

| Slot | Selector | Default |
|------|----------|---------|
| Header left | `.chrome-min > span:first-child` | `Hazelkahlil · {THEME}` |
| Header right | `.chrome-min > span:last-child` | `Vol. {NN} / {YEAR} / {RECIPE}` |
| Foot left | `.k-foot .t-meta:first-child` (or bottom meta) | `Issue {NN}` |
| Foot right | `.k-foot .t-meta:last-child` | `/ Hazelkahlil` |
| Colors / type roles | CSS tokens | See `brand.md` |

These are **not random**. Numbers and `{THEME}` update per deck/series.

## Generated from content (per page)

| Slot | Typical selector | Notes |
|------|------------------|-------|
| Kicker | `.t-cat` | Page function, e.g. `S01 / ACCENT COVER`, `TRAP`, `PIPELINE` |
| EN title | `.latin-en` / statement Latin line | Futura mixed or Canela CAPS |
| CN title | `.cn` / CN hammer | 锐字纤细; shorten via `title-shortener.md` |
| System / matrix / ledger | recipe blocks | From story beats — not lorem |
| Lead / body | `.lead` `.body` | 1–2 sentences on cover |
| Images / shots | `.frame-img` `.frame-shot` | User or sourced assets |

## Recipe coverage

All **S01–S12** Swiss recipes in `layout-recipes.md` apply, with kahlil chrome + palette.
**M01–M16** Editorial recipes remain in references for rare magazine jobs; default production stays Swiss/kahlil. If using Editorial seed (`template-editorial-card.html`), still swap author chrome to Hazelkahlil and prefer warm paper when user wants brand consistency.
