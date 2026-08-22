# kahlil-card Brand Lock

Fork basis: [op7418/guizang-social-card-skill](https://github.com/op7418/guizang-social-card-skill) **Swiss** path only as visual skeleton.

## Locked tokens

| Token | Value | Role |
|-------|-------|------|
| `--paper` | `#F6F2EA` | Card background |
| `--accent` | `#ED581E` | Accent fills, `.t-cat`, optional EN title |
| `--accent-on` | `#F6F2EA` | Text on accent |
| `--brown` | `#553B33` | Chrome / meta / foot |
| `--ink` | `#282829` | Primary text |
| `--grey-1` | `#EFE9DF` | Soft fills |
| `--grey-2` | `#D9D2C6` | Rules / borders |
| `--grey-3` | `#6F6A62` | Secondary (legacy) |

`data-accent` default: **`kahlil-orange`**.

## Type roles

| Role | Font | Rule |
|------|------|------|
| EN display (default) | Futura Medium (`Local Futura`) | Mixed case OK |
| EN display (alt) | Canela Text Regular (`Local Canela`) | **ALL CAPS** + `letter-spacing: -0.02em` |
| CN display title | 锐字驰光黑纤细 | Hammer titles only |
| CN body / nodes | PingFang / system sans | Not Ruizi unless user asks |
| Mono chrome | SF Mono stack | Uppercase tracking |

Toggle EN with `en-futura` (default on `<html>`) or `en-canela` on `<html>` / `.poster`.

## Fixed chrome copy pattern

| Slot | Pattern |
|------|---------|
| Header L | `Hazelkahlil · {THEME}` |
| Header R | `Vol. {NN} / {YEAR} / {RECIPE}` |
| Foot L | `Issue {NN}` |
| Foot R | `/ Hazelkahlil` |

`{THEME}` default: `AI NATIVE`.

## Forbidden (keep Swiss discipline)

- Border radius, soft shadows, multi-stop gradients on posters
- Multiple accents in one deck
- Defaulting back to IKB / Inter / Noto Google stack without user request
- GUOHUI or guizang author strings in chrome/foot

## Optional CN display (not default body)

Full files may be linked under `assets/fonts/`: 风雅楷宋 / FW珍珠 / 黄庭坚 / 沈尹默 — only when user picks them for a title experiment.
