# Kahlil Open Skills

[English](README.md)

Kahlil Open Skills 是一个公开的 Skill 集合，用来发布经过清理、可复用的 AI Agent 工作流、自动化和项目运营 Skill。

这个仓库会保持轻量。它只包含适合公开发布的 Skill 包，以及理解、验证、复用这些 Skill 所需的最少文档。这里不应该包含私有工作区 ID、本地机器路径、项目专属 issue 历史、凭证、截图、数据库或内部报告。

## 当前 Skill

| Skill | 版本 | 用途 |
| --- | --- | --- |
| `multica-squad-builder` | `1.1.3` | 设计、配置、审计、迁移、运营和迭代 Multica 风格的 Agent 小队。 |

## 仓库结构

```text
skills/
  multica-squad-builder/
    SKILL.md
    references/
    templates/
    scripts/
docs/
  publishing-checklist.md
  sanitization-report.md
```

## 使用方式

每个 Skill 都放在 `skills/<skill-name>/` 下面，尽量保持自包含。

验证 `multica-squad-builder`：

```bash
cd skills/multica-squad-builder
python3 scripts/validate_skill.py
python3 scripts/red_team_check.py
shasum -a 256 -c CHECKSUMS.txt
```

使用时，根据你自己的工作区、成员、小队名单、项目资源和 mention map 调整模板。不要把示例占位符当成真实 ID 使用。

## 发布状态

当前公开版本：`multica-squad-builder` v1.1.3。

## 发布规则

发布新的 Skill 或版本前，先运行 `docs/publishing-checklist.md` 里的检查。

## 许可证

MIT。详见 `LICENSE`。
