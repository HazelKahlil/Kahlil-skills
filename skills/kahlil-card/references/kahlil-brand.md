# kahlil-card 品牌规范

## 色板

```css
--paper: #F6F2EA;
--ink: #282829;
--brown: #553B33;
--grey-1: #EFE9DF;
--grey-2: #D9D2C6;
--accent: #ED581E;
--accent-on: #F6F2EA;
```

| Token | 用途 |
|-------|------|
| paper | 卡片底 |
| ink | 中文标题、正文、节点字 |
| brown | 页眉、页脚 meta、节点小标签 |
| accent | 分类行、英文主标题、主色块底 |
| accent-on | 主色块上的字（米纸色） |
| grey-1/2 | 次级块底、分割线 |

一包卡片只用这一套 accent。不要切回 IKB 蓝，除非用户点名实验。

## 字体

### 英文（默认 Futura）

- Family: `Local Futura` ← `assets/fonts/Futura-Medium.ttf`
- Weight: 500
- 大小写：保留语义大小写（`AI native`）
- letter-spacing: 约 `0.02em`

### 英文（备选 Canela）

- Family: `Local Canela` ← `assets/fonts/CanelaText-Regular.ttf`
- Weight: 400
- **必须全大写**（`text-transform: uppercase` 或源文大写）
- letter-spacing: **`-0.02em`**（比默认更紧）

### 中文大标题

- Family: `S01 Ruizi Xianxi` ← `assets/fonts/ruizi-xianxi.ttf`
- 锐字驰光黑-闪 **纤细**
- Weight: 300；`font-synthesis: none`
- 与英文行间距：`margin-top: 28px`

### 正文 / 节点中文

- 系统无衬线：`PingFang SC` / `Microsoft YaHei UI` 栈
- 不要默认改成楷宋；用户点名再用 `fz-fengya` 等

## 禁止

- 圆角、`box-shadow`、装饰渐变
- 一页多个 competing 强调色
- 页眉页脚同时再加一套装饰 issue-strip（顶栏 chrome + 底栏 Issue 即可）
- 缺字时静默依赖系统楷体冒充方正（CJK 必须先确认 glyph 覆盖）
