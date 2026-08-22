# 槽位说明

## 页眉 `.chrome-min`

单行，左右分布，褐色 mono，全大写视觉（CSS `text-transform: uppercase`）。

```html
<div class="chrome-min">
  <span>Hazelkahlil · {THEME}</span>
  <span>Vol. {NN} / {YEAR} / {RECIPE}</span>
</div>
```

| 占位 | 含义 | 示例 |
|------|------|------|
| `{THEME}` | 系列/栏目主题，不是正文标题 | `AI NATIVE`、`PHOTO`、`TYPE` |
| `{NN}` | 期号两位 | `01` |
| `{YEAR}` | 年 | `2026` |
| `{RECIPE}` | 版式编号 | `S01`、`S03` |

默认：`Hazelkahlil · AI NATIVE` · `Vol. 01 / 2026 / S01`

## 分类 `.t-cat`

本页内容功能标签，**按页生成**，橙色。

示例：

- `S01 / ACCENT COVER`
- `COVER / HOOK`
- `SYSTEM / PIPELINE`

## 标题

```html
<h1 class="s01-font-title">
  <span class="latin">AI native</span>
  <span class="cn">不是答案</span>
</h1>
```

- `.latin`：橙色；Futura 大小写 / Canela 全大写
- `.cn`：墨色；锐字纤细；`margin-top: 28px`
- 文案按选题；标题缩短见 `title-shortener.md`

## 系统块 `.s01-system`（S01）

左大色块 + 右两节点。标签 mono 可固定结构（01/02/03），**文案随内容**。

## 导语 `.s01-lead`

1–2 行，解释本页判断。系统无衬线。

## 页脚 `.s01-bottom`

```html
<div class="s01-bottom">
  <p class="t-meta">Issue {NN}</p>
  <p class="t-meta">/ Hazelkahlil</p>
</div>
```

作者名固定 `Hazelkahlil`，除非用户改品牌署名。

## 固定 vs 生成（一句话）

**固定**：品牌名、页眉/页脚结构、色票、字体角色。
**生成**：`{THEME}` 具体词、分类、中英标题、色块句、导语、期号数字。
