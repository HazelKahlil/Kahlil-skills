# Kahlil Card

[English](README.en.md)

Kahlil 的小红书 / Rednote 社媒卡片 Skill。它把文章、产品说明、截图、照片或视频整理成可渲染的 3:4 卡组，也支持公众号 21:9 + 1:1 封面对、Live Photo 动态卡和按内容选择的 Editorial / Swiss 版式。

## 这份公开包包含什么

- `SKILL.md`：触发边界、品牌锁定、内容流程和交付规则。
- `assets/`：Kahlil 模板、字体相对路径说明、背景材质和 WebGL 背景脚本。
- `references/`：品牌、版式、素材、Live Photo、AI-Look、平台规格和 QA 规则。
- `scripts/`：任务初始化、HTML 渲染、文档检查和 Live Photo 辅助脚本。
- `examples/`：用于审查版式与字体的示例卡片，不是默认输出目录。

默认品牌：纸色 `#F6F2EA`、强调橙 `#ED581E`、褐色 `#553B33`、墨黑 `#282829`；英文使用 Futura，备选 Canela；中文大标题使用锐字纤细。字体二进制不随公开包分发，渲染时请提供已获授权的本地副本；没有副本时使用模板的系统字体回退。不要在没有明确要求时切回上游 IKB 蓝、Inter 或 Noto Google 字体。

## 安装

在本仓库根目录执行：

```bash
bash scripts/install-skill.sh kahlil-card
```

或从 GitHub 直接安装：

```bash
curl -fsSL https://raw.githubusercontent.com/HazelKahlil/Kahlil-skills/main/scripts/install-skill.sh \
  | env SKILL_NAME=kahlil-card bash
```

安装后重启 Codex 或其他 Agent 运行时。

## 使用

```text
用 kahlil-card 把这篇文章做成 5 张小红书 3:4 卡片，使用我的默认品牌。
用 kahlil-card 把这段视频做成 5 秒 Live Photo 卡片，先做静态首帧检查。
```

需要真实渲染时，先初始化任务目录，再执行复制出来的 `render.mjs`：

```bash
KAHLIL_CARD_ROOT="$PWD" \
  bash skills/kahlil-card/scripts/init-task.sh --name 示例专题
cd platforms/Kahlil-cards/2026年8月/23日/示例专题
node render.mjs
```

默认成图写入任务目录的 `输出/<时分>/`，而不是 Skill 根目录。具体版式、平台限制、AI-Look 闸门和 QA 见 `SKILL.md` 与 `references/`。

## 校验

```bash
node skills/kahlil-card/scripts/check-skill-docs.mjs
node skills/kahlil-card/validate-social-deck.mjs path/to/task-dir
```

`validate-social-deck.mjs` 需要任务目录中可用的 Playwright；公开包不携带 `node_modules`，请在需要渲染时运行 `npm install`。

## 许可与字体

模板与脚本沿用上游项目的 AGPL-3.0 许可，见 `LICENSE`。Futura、Canela 和锐字字体需要使用者自行取得授权；出于许可边界，公开包不包含任何商业字体二进制，只保留相对路径说明。其他私有字体同样不随包分发。
