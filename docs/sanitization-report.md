# Sanitization Report / 清理报告

Current release audit: `multica-squad-builder` v2.0.0, `kahlil-cover` v0.2.0, `kahlil-aesthetic` v2.0.0, and `kahlil-card` v1.0.0 (2026-08-23).

## Scope

Included:

- `skills/multica-squad-builder/`
- `skills/kahlil-cover/`
- `skills/kahlil-aesthetic/`
- `skills/kahlil-card/`
- root documentation and `scripts/install-skill.sh`

Excluded:

- private setup packs, user libraries, captures, and workspace exports
- issue transcripts, internal handoff/product/audit documents, and run logs
- machine-specific paths and private canonical artwork sources
- `node_modules`, commercial font binaries, and private font symlinks

## Checks

The source skills and public repository were checked for private local paths, workspace IDs, agent IDs, member IDs, issue IDs, project-specific references, issue keys, and common secret patterns. Package-specific validators and an all-package installer smoke test were also run in a temporary destination.

Latest audit result: no private IDs, local paths, issue keys, or real secret/token patterns were found. Broad-regex hits such as `SHA-256`, `AGPL-3.0`, and policy/test strings containing words like `secret`, `cookie`, or `token` are benign and were verified by manual inspection.

## Validation evidence

- `kahlil-cover`: dual-mode contract test passed
- `kahlil-aesthetic`: 36/36 tests passed
- `kahlil-card`: 30/30 documentation checks passed
- `multica-squad-builder`: existing validator passed
- installer smoke test: all four packages installed successfully

中文结论：三个 Kahlil Skill 已整理为可公开审核的包；私有 canonical artwork 源文件仍在仓库外，公开包只保留已接受的封面基准图。分支和 Draft PR 应在合并到 `main` 前保持可审核状态。

## Notes

This repository is prepared as a clean open-source release workspace. It is not a dump of the local workspace or private project history.

中文说明：这个仓库是整理后的开源发布工作区，不是本地工作区或私有项目历史的直接导出。
