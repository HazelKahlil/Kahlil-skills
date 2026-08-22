# Kahlil-skills — 项目索引

> 状态: active
> 根入口: [README.md](./README.md) / [README.zh-CN.md](./README.zh-CN.md)

## Skills

| 路径 | 版本 | 交付重点 |
|------|------|----------|
| `skills/multica-squad-builder/` | 2.0.0 | Multica 小队设计、迭代与审计 |
| `skills/kahlil-cover/` | 0.2.0 | 双模式社媒封面提示词；含 Vibe Coding 定稿基线和回归检查 |
| `skills/kahlil-aesthetic/` | 2.0.0 | 审美证据入库、URL 捕获、复用包、usage 与健康检查 |
| `skills/kahlil-card/` | 1.0.0 | Kahlil 品牌社媒卡片、封面对、Live Photo 与 28 套版式 |

## 维护入口

| 文件 | 用途 |
|------|------|
| `AGENTS.md` | 修改、验证、清理和发布规则 |
| `README.md` / `README.zh-CN.md` | 双语项目总览、安装和使用 |
| `docs/publishing-checklist.md` | 发布前内容、安全和安装检查 |
| `docs/sanitization-report.md` | 最近一次清理报告 |
| `scripts/install-skill.sh` | 安装单个 Skill 或全部公开 Skill |

## 安装目标

默认安装到 `${CODEX_HOME:-~/.codex}/skills/`。每个 Skill 仍可通过 `KOS_DEST` 安装到临时审核目录。

## 公共边界

公开仓库只保存可复用的 Skill 源、必要模板/字体/测试夹具和公开说明。用户库、真实抓取内容、内部工作区路径、凭证、运行日志和一次性成品不进入这里。
