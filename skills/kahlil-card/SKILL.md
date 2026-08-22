---
name: kahlil-card
description: Kahlil 的小红书/社媒卡片 Skill（改造自 guizang Swiss 系统）。用于生成 1080×1440 等社媒卡组与微信封面，默认品牌页眉页脚、米纸橙褐黑配色、Futura/Canela 双英文 + 锐字纤细中文标题，并保留 S01–S12 等全套版式。触发词：kahlil-card、kahlil卡片、我的社媒卡片、Hazelkahlil 卡片、按我的卡片模板出图。
---

# kahlil-card

Kahlil 自用社媒卡片系统。视觉骨架 fork 自 [guizang-social-card-skill](https://github.com/op7418/guizang-social-card-skill) 的 **Swiss** 一路；品牌、配色、字体、页眉页脚已替换为 Kahlil 定稿。**S01–S12** 版式与组件、校验、Live Photo / 品类 cookbook 等能力同步保留并改写默认值。

**不要**再走 guizang 默认 IKB 蓝或 Inter/Noto Google 字体栈，除非用户明确要求对比实验。

## 何时使用

- 用户说 `kahlil-card` / `按我的卡片模板` / `Hazelkahlil 卡片`
- 小红书 3:4 卡组、封面、说明页、数据页、流程页
- 微信 21:9 + 1:1 封面配对
- 在已定品牌下扩写任意 S 系 recipe（不仅是 S01）

## 何时不用

- 公众号长文排版 → `rv-paiban` / `gzh-design`
- 纯封面插画提示词 → 其他 cover skill
- 还在做未锁定的字体/配色选型且用户没说用 kahlil-card

## 品牌锁定（默认不可破）

| 项 | 默认值 |
|----|--------|
| 纸色 | `#F6F2EA` |
| 强调橙 | `#ED581E`（`data-accent="kahlil-orange"`） |
| 褐（meta） | `#553B33` |
| 墨/黑 | `#282829` |
| 英文默认 | **Futura Medium**，大小写可区分（`en-futura`） |
| 英文备选 | **Canela Regular**，**全大写** + 紧字距（`en-canela`） |
| 中文大标题 | **锐字驰光黑纤细** |
| 正文/节点中文 | 系统无衬线（PingFang 栈） |
| 分类行 | 强调橙 |
| 底纹 | 默认关 |
| 圆角/阴影/渐变 | 禁止（Swiss 纪律） |

详见 `references/brand.md`。

## 槽位：固定 vs 按内容生成

### 固定骨架

| 槽位 | 默认 |
|------|------|
| 页眉左 | `Hazelkahlil · {THEME}` |
| 页眉右 | `Vol. {NN} / {YEAR} / {RECIPE}` |
| 页脚左 | `Issue {NN}` |
| 页脚右 | `/ Hazelkahlil` |

`{THEME}` 默认 `AI NATIVE`。详见 `references/slots.md`。

### 按内容生成

分类 kicker、中英标题、系统块/矩阵/ledger、导语、图与数据 —— **按选题写，不是随机**。

## 版式（全套同步）

种子：`assets/template-kahlil-card.html`（由 Swiss 模板全量改造）。

| 系列 | 状态 |
|------|------|
| **S01–S12** | 默认生产路径；chrome/色/字体已 kahlil 化；S01 定稿见 `examples/` |
| **M01–M16** | references 保留；非默认。若用户要杂志风再用 Editorial 种子并换品牌 chrome |
| 画幅 | `.poster.xhs` 1080×1440 · `.square` 1080×1080 · `.wide` 2100×900 |

选用 recipe 时读 `references/layout-recipes.md`。填内容的位置仍是 `<!-- POSTERS_HERE -->`。

其他 references（components / style-system / title-shortener / category-cookbook / live-photo / screenshot / map / qa…）均已带 kahlil 默认覆盖说明；生产流程与 guizang 相同，**默认值不同**。

## 工作流

1. **Intake**：平台、页数、主题 `{THEME}`、期号、素材图/视频。
2. **Init 任务目录**（推荐，落在 **platforms/Kahlil-cards**，按日分层）：
   ```bash
   bash <skill-root>/scripts/init-task.sh \
     --name AI原生-不是答案
   # 等价于落到：
   # …/platforms/Kahlil-cards/2026年7月/23日/AI原生-不是答案/
   ```
   会复制 `template-kahlil-card.html` → `index.html`，symlink `assets/fonts`，并创建 **`输出/`**、**`素材/`**。专题名**不要**再塞日期（日期在上层目录）。
3. **选 recipe**：每页一个 S0x（或用户点名的 M0x），写入 `POSTERS_HERE`。
4. **只改内容槽与英文模式**：不要改 token / `@font-face` / chrome 品牌结构，除非用户要实验。默认整页 `en-futura`；用户要书卷英文字用 `en-canela`（自动 ALL CAPS 规则）。
5. **卡面文案 AI-Look 闸门（自动）**：第一次渲染前，提取 `POSTERS_HERE` 中面向读者的标题、导语、正文、数据说明、引语和结尾判断，自动调用 `kahlil-ai-look` 的**去痕模式**。保留事实、判断、专名、数字和卡片结构，不新增未经证实的信息；把修改后的文字写回 `index.html`。固定品牌 chrome、HTML 注释和文件名不进入检查。详见 `references/ai-look-gate.md`。
6. **渲染与 QA**：
   ```bash
   cd "…/platforms/Kahlil-cards/2026年7月/23日/AI原生-不是答案"
   node render.mjs
   # 成图 → 输出/16时06分/卡片-01.png …
   # 输出/最近 → 16时06分
   ```
   先做 `references/qa-checklist.md` 的人工检查；用户要求时再运行 `node validate-social-deck.mjs <任务目录> --style=swiss`。如果 AI-Look 改过卡面文字，必须重新渲染并重新检查，旧 PNG 不得作为最终稿。
7. **发布文案与 AI-Look 闸门（自动）**：成图和版式 QA 完成后，先在本次时间戳目录写入 `发布文案-初稿.txt`，遵守 `references/xhs-caption.md` 的平台格式规则；再自动调用 `kahlil-ai-look` 的**去痕模式**，将修改后的完整文本写入同一目录的 `发布文案.txt`，并保存 `AI-Look-检查报告.md`。重新检查标题字数、标签数量和正文+标签字数后，才在对话中贴最终可复制全文；不询问用户是否需要检查，也不交付初稿代替最终文案。
8. **交付**：PNG + 源 HTML + 本次 `输出/<时间戳>/发布文案.txt` + `AI-Look-检查报告.md`；路径用中文（见 `references/路径约定.md`）。可复制文案与路径分开，别插进正文中间。

除非用户明确要求“只保留原稿”“只做检测不改写”或跳过 AI-Look，否则第 5 步和第 7 步均为默认必做闸门。AI-Look 调用失败、只返回诊断报告或无法产出去痕稿时，暂停最终文案交付并明确说明闸门未完成。

### AI-Look 闸门的统一规则

- `kahlil-ai-look` 是文字去痕检查，不替代事实核查、图片来源核验或视觉 QA。
- 所有修改只朝去除 AI 写作指纹的方向进行，不改变事实、判断、账号气质和既定卡片结构。
- 卡面文字被修改后必须重渲染；发布文案被修改后必须重新跑 `xhs-caption` 的格式和字数自检。
- 新任务使用 `发布文案-初稿.txt`、`发布文案.txt` 和 `AI-Look-检查报告.md`；不再以 `发布文案-去痕后.txt` 作为默认命名。

参考：`references/ai-look-gate.md`、`references/xhs-caption.md`。

**路径硬规则（kahlil）：**

- 默认：`<workspace>/platforms/Kahlil-cards/<YYYY年M月>/<D日>/<专题中文名>/输出/<H时MM分>/`
- 专题名用中文，**日期放上层目录**，不要用纯英文 slug
- 成图文件名默认 `卡片-01.png` 等中文；每次 render 新建时间戳子目录，并维护 `输出/最近`
- **`Live-Photo` / `IMG_*` / `.pvt` 等技术名可保留英文**（用户已确认）
- Generated work must live in a task folder, not in the skill root.
- 默认任务文件夹：`platforms/Kahlil-cards/<YYYY年M月>/<D日>/<专题中文名>/`（历史扁平 `platforms/Kahlil-cards/<专题>/` 只读兼容；`local-tests/` 与 `本地测试/` 仅作旧任务兼容，不要为新任务创建）
- 完整约定：`references/路径约定.md`

## 字体文件（用户自备）

`assets/fonts/`

| 文件 | 用途 |
|------|------|
| `Futura-Medium.ttf` | 默认英文；需用户提供已授权副本 |
| `CanelaText-Regular.ttf` | 备选英文全大写；需用户提供已授权副本 |
| `ruizi-xianxi.ttf` | 中文大标题；需用户提供已授权副本 |
| 其他 FZ/Ruizi 字体 | 可选的用户自备字体；公开包不随附，需自行确认授权 |

出于商业字体许可边界，公开包只保留相对路径说明，不包含上述字体二进制。缺少本地副本时，模板会回退到系统字体栈；要复现已接受示例的字形，需要先把已获授权的文件放入 `assets/fonts/`。

## 与 guizang 的关系

| 继承 | 替换 |
|------|------|
| Swiss 画幅、无圆角阴影、S/M recipe 思路、标题缩短、单 accent、校验维度、Live Photo 脚本 | 配色、中英文字体、页眉品牌、页脚作者、S01 居中结构、默认橙、去掉强制 Google Fonts |

上游 `LICENSE`（AGPL-3.0）保留；字体商用授权以你方为准。

## Live Photo（继承 guizang，默认落盘仍走 Kahlil-cards）

完整流程见 `references/live-photo-production.md`。生产时记住：

- Supports **Triple Live Photo** collage and **material-first Live Photo puzzle layouts** (two / three / four-grid).
- Single-video text-on-image: **use the M16 Image-Led Cover / text-on-image rules**; keep copy sparse.
- **Do not invent extra kicker, meta, hairlines** or chrome on the video surface just to fill space.
- Respect platform limits (`5s` Xiaohongshu, `3s` WeChat Official Account); deliver `JPG + MOV + .pvt` when packaging.
- **Audience-facing copy must describe the user's actual scene** — not production jargon (`3s`, `Live Photo`, `information budget`).
- **Do not add non-template ornaments just to satisfy an automated density warning.**
- Technical folder/file names like `Live-Photo` / `IMG_*` / `.pvt` may stay English; parent task still under `platforms/Kahlil-cards/<YYYY年M月>/<D日>/<中文专题>/输出/<时间戳>/`.

## 快速自检

- [ ] 页眉 `Hazelkahlil · …`，不是 GUOHUI / 归藏默认
- [ ] 页脚 `Issue NN` + `/ Hazelkahlil`
- [ ] 中文大标题锐字纤细；英文 Futura 或 Canela 全大写
- [ ] 米纸 + 橙，无默认 IKB 残留
- [ ] 多页仍共用同一 accent 与 chrome 规则
- [ ] 版式来自 S01–S12（或用户点名的 M），不是只会一张封面
- [ ] 成图在 `platforms/Kahlil-cards/<年>/<日>/<专题>/输出/<时间戳>/`，不在 skill 根
- [ ] 小红书卡组成图后已附整段可复制文案（正文直接接标签、无分段壳）；标题≤20、标签3–5、正文+标签800–1000；见 `references/xhs-caption.md`
