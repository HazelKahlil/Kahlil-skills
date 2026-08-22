# Kahlil Cover

把文章、口播稿或选题转成可直接交给图像模型的社媒封面提示词。

正式模式只有两种：

- `IP 角色版`：使用 Kahlil 的角色契约和动作语言。标题优先、纯白背景、人物动作在下半区；两张 `assets/accepted/` 图片是当前 Vibe Coding 的字体与构图验收基线。
- `内容视觉版`：由当前文章重新决定主体、动作、环境、媒介和风格，不自动套用历史静物或莫兰迪风格。

默认画幅为 `3:4`。标题文字和词序不改写，标点可为排版省略；右下角只保留很小的 `Kahlil`。

## 验证

```bash
bash tests/validate-skill.sh
```

IP 模式如果需要角色一致性，另外提供 `kahlil-artwork` 的两张 canonical 角色参考图：`01-action-library.png` 与 `02-workflow-language.png`。本包不复制另一个 Skill 的私有安装路径。
