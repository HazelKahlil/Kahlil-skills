# Kahlil Aesthetic

把 Kahlil 已经选定为“好看”的图片、截图、公开网页或对话片段保存成可验证、可复用的审美证据。它不替用户判断审美，也不把某一篇文章的风格自动变成全局模板。

## 目录

- `SKILL.md`：触发边界、入库流程、复用模式和隐私/权利规则。
- `references/`：资产、草稿、manifest、capture 和 usage 契约。
- `scripts/`：配置、入库、URL 捕获、验证、迁移、复用包、usage 和 doctor。
- `tests/`：生命周期、URL 安全、证据完整性和硬化测试。

用户库、配置、抓取页面和原始媒体都保存在 Skill 之外。公开包不包含任何真实审美资产或用户隐私。

## 验证

```bash
node --test tests/*.test.mjs
```

使用时只在用户明确说 `kahlil-aesthetic`、`审美资产入库`、`审美入库` 或 `视觉资产入库` 时触发。
