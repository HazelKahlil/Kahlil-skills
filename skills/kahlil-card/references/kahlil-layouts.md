# 版式

## 画幅

| 类 | 尺寸 | 用途 |
|----|------|------|
| `.poster.xhs`（模板默认） | 1080×1440 | 小红书 3:4 |
| 方/宽 | 可后扩 | 微信 1:1 / 21:9 |

## 垂直结构（所有页通用）

```
┌ chrome-min（顶，不参与居中）
├ k-main（flex:1; justify-content:center）
│   ├ head（cat + title）
│   ├ 内容模块（system / cards / …）
│   └ lead
└ s01-bottom / foot（底，不参与居中）
```

主内容在页眉与页脚之间**垂直居中**，避免「上紧下松」。

## S01 Accent Cover（已定稿）

参考：`examples/s01-final-reference.png`
模板：`assets/template-kahlil-card.html`

结构：

1. chrome-min
2. t-cat（橙）
3. 英文标题（橙）+ 中文标题（纤细）
4. 12 栏系统块：左 7 栏 accent 大块，右 5 栏两节点
5. lead
6. Issue 页脚

## S02–S06（扩展原则）

后续页沿用同一 chrome/footer/token。内容区替换即可，例如：

| 编号 | 用途 | 中间模块方向 |
|------|------|----------------|
| S02 | 双信号对比 | 左 `.card-accent`（橙）+ 右 `.card-outlined`；不用默认黑底 `.card-ink` |
| S03 | 属性/文件卡 | 列表 + mono 标签 |
| S04 | 界面示意 | 直边 frame，无圆角阴影 |
| S05 | 反模式 | 三横条警告行 |
| S06 | 流程 | 三步 pipeline |

扩展时先复用 token 与 chrome，再写模块 HTML；不要引入第二套配色。

## 标题缩短

见 `title-shortener.md`。方封面/缩略优先 4–10 字中文锤点；先缩文案，再缩字号。
