# Kahlil Skills

[English](README.md)

Kahlil Skills 是一个公开、可复用的 AI Agent Skills 合集。每个 Skill 都独立放在 `skills/` 下，按需携带自己的指令、参考文档、资产、脚本和验证方式。

## Skills

| Skill | 版本 | 用途 |
| --- | --- | --- |
| `multica-squad-builder` | `2.0.0` | 设计、迭代和审计 Multica 风格 Agent 小队。 |
| `kahlil-cover` | `0.2.0` | 把文章或选题转成与内容对应的社媒封面提示词，支持 IP 角色版和内容视觉版。 |
| `kahlil-aesthetic` | `2.0.0` | 把已经选定的视觉参考保存为可验证、可复用的审美证据。 |
| `kahlil-card` | `1.0.0` | 生成 Kahlil 品牌社媒卡组、公众号封面对和 Live Photo 卡片。 |

## 安装

安装单个 Skill：

```bash
bash scripts/install-skill.sh kahlil-cover
bash scripts/install-skill.sh kahlil-aesthetic
bash scripts/install-skill.sh kahlil-card
```

安装全部公开 Skill：

```bash
bash scripts/install-skill.sh all
```

在没有克隆仓库的机器上，也可以直接从 GitHub 管道安装：

```bash
curl -fsSL https://raw.githubusercontent.com/HazelKahlil/Kahlil-skills/main/scripts/install-skill.sh | bash -s -- all
```

安装脚本默认写入 `${CODEX_HOME:-~/.codex}/skills/<skill-name>`。审核时可以用 `KOS_DEST` 指定临时目录；覆盖已有版本时加 `KOS_OVERWRITE=1`。安装后重启 Codex 或 Agent 运行时。

## 验证

```bash
cd skills/multica-squad-builder && python3 scripts/validate_skill.py
cd skills/kahlil-cover && bash tests/validate-skill.sh
cd skills/kahlil-aesthetic && node --test tests/*.test.mjs
node skills/kahlil-card/scripts/check-skill-docs.mjs
```

完整发布检查见 `docs/publishing-checklist.md`。仓库按公开安全设计：不放私有工作区资料、凭证、本机绝对路径或内部生成报告。

## 目录结构

```text
skills/<skill-name>/
  SKILL.md
  README.md              # 需要面向人的使用说明时提供
  VERSION
  CHANGELOG.md
  agents/                # 可选 UI 元数据
  references/            # 条件式说明与 schema
  assets/                # 模板、字体、图片或测试夹具
  scripts/               # 可重复执行的辅助脚本
```

## 许可证

仓库级文件使用 MIT（见 `LICENSE`）。单个 Skill 可以保留自己的上游许可证；重新分发前请阅读对应目录里的 `LICENSE`。
