# Release Notes v1.1.5

This release adds optional role theme presets for playful, recognizable squad skins while preserving the existing governance model.

## Highlights

- Added `references/role-theme-presets.md` with 14 baseline themes.
- Included Chinese/cultural themes such as 西游取经团, 三国蜀汉班底, 独立团作战室, 狂飙京海局, 少林足球队, 让子弹飞, 爱情公寓, and 三体.
- Included global IP-inspired Chinese-name themes such as 复仇者联盟, 草帽团, 变形金刚, 速度与激情, and 绝命毒师.
- Added theme tags: `safe_default`, `meme_strong`, and `use_with_warning`.
- Clarified that role flavor may affect names, short descriptions, and tone hints only. It must not override role separation, Review Gate v3, permissions, PR/Done policy, or Human Owner authority.

## Validation

Run:

```bash
python3 scripts/validate_skill.py
python3 scripts/red_team_check.py
shasum -a 256 -c CHECKSUMS.txt
```
