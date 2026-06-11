# Kahlil-skills — 项目索引

> 状态: active
> 上次更新: 2026-06-11
> 根索引: [INVENTORY.md](../../INVENTORY.md) | 入口: [README.md](./README.md)

## 全景

Kahlil Skills 是一个公开、可安装的 AI Agent Skills 合集仓库。当前包含 `multica-squad-builder`（v1.2.0，Review Router v2），用于设计、配置、审计、迁移、运营和迭代 Multica 风格的 Agent 小队。每个 Skill 放在 `skills/` 下的独立文件夹中，遵循标准化验证流程（validate_skill + red_team_check + checksum）后才发布，通过远程 curl 脚本一键安装。

## 目录结构

| 路径 | 用途 |
|------|------|
| skills/multica-squad-builder/ | 核心 Skill 包 |
| skills/multica-squad-builder/SKILL.md | Skill 主定义文件 |
| skills/multica-squad-builder/scripts/ | 验证脚本（validate_skill.py、red_team_check.py、render_minimal_pack.py） |
| skills/multica-squad-builder/templates/ | Agent 角色指令模板（captain、reviewer、worker、analyst）和交付物模板（RFC、review、migration 等） |
| skills/multica-squad-builder/config/ | 小队配置模板（squad-profile.template.json） |
| skills/multica-squad-builder/references/ | 参考文档（架构、角色预设、风控、部署指南等 9 篇） |
| skills/multica-squad-builder/CHANGELOG.md | 变更日志 |
| skills/multica-squad-builder/CHECKSUMS.txt | 文件校验和 |
| skills/multica-squad-builder/METRICS.json | 度量数据 |
| skills/multica-squad-builder/RED_TEAM_REPORT-*.md | 红队安全审计报告 |
| skills/multica-squad-builder/RELEASE_NOTES-*.md | 版本发布说明 |
| docs/ | 发布检查清单、清理报告 |
| scripts/install-skill.sh | 安装脚本 |

## 关键文件

| 文件 | 用途 |
|------|------|
| AGENTS.md | Agent 维护说明，含验证与发布前检查流程 |
| README.md | 项目总览（英文），Skill 列表与安装命令 |
| README.zh-CN.md | 项目总览（简体中文），与 README.md 同步维护 |
| CONTRIBUTING.md | 贡献指南 |
| SECURITY.md | 安全策略 |
| LICENSE | MIT 开源许可证 |
| README.md (multica-squad-builder) | 该 Skill 的使用说明 |
| docs/publishing-checklist.md | 发布前检查清单 |
| docs/sanitization-report.md | 仓库清理报告 |
| scripts/install-skill.sh | curl 管道安装脚本，支持 KOS_OVERWRITE |

## 技术栈

- **Skill 定义**: Markdown（SKILL.md）
- **验证脚本**: Python 3（validate_skill.py、red_team_check.py、render_minimal_pack.py）
- **安装**: Bash Shell 脚本（curl + install-skill.sh）
- **校验**: SHA-256 checksums

## 依赖与集成

- **发布平台**: GitHub (https://github.com/HazelKahlil/Kahlil-skills)
- **安装目标**: `~/.codex/skills/`（Codex CLI）或任意 KOS_DEST 路径
- **无第三方 API 依赖**，纯本地可执行
- 当前 Skill 数量: 1 个（multica-squad-builder）

## 部署

- **仓库**: GitHub 公开仓库 `HazelKahlil/Kahlil-skills`
- **安装命令**: `curl -fsSL https://raw.githubusercontent.com/HazelKahlil/Kahlil-skills/main/scripts/install-skill.sh | bash`
- **覆盖安装**: 追加 `env KOS_OVERWRITE=1 bash`
- 安装后需重启 Agent 运行时

## 常见操作

- 验证 Skill: `cd skills/multica-squad-builder && python3 scripts/validate_skill.py`
- 红队检查: `python3 scripts/red_team_check.py`
- 校验文件: `shasum -a 256 -c CHECKSUMS.txt`
- 测试安装: `KOS_SOURCE_DIR="$PWD" KOS_DEST="$(mktemp -d)/skills" bash scripts/install-skill.sh`
- 新增 Skill: 在 `skills/` 下创建独立文件夹，遵循发布检查清单

## 关联项目

- [Knowledge for kahlil](../Knowledge%20for%20kahlil/): 工作区知识管理项目，Skills 安装使用
- 全局 Skills 目录: `/Users/kahlilhazel/.agents/skills/`

## Agent 入口

| 文件 | 说明 |
|------|------|
| AGENTS.md | 修改前必读：验证流程、发布检查、公共安全约束 |
| README.md | 项目总览、Skill 列表、安装与使用方式 |
