#!/usr/bin/env bash

set -u

skill_dir="$(cd "$(dirname "$0")/.." && pwd)"
skill_file="$skill_dir/SKILL.md"
failures=0

require_pattern() {
  local pattern="$1"
  local message="$2"
  if ! rg -q "$pattern" "$skill_file"; then
    echo "FAIL: $message"
    failures=$((failures + 1))
  fi
}

forbid_pattern() {
  local pattern="$1"
  local message="$2"
  if rg -q "$pattern" "$skill_file"; then
    echo "FAIL: $message"
    failures=$((failures + 1))
  fi
}

require_file() {
  local path="$1"
  local message="$2"
  if [[ ! -f "$path" ]]; then
    echo "FAIL: $message"
    failures=$((failures + 1))
  fi
}

require_pattern '^---$' '缺少 YAML frontmatter'
require_pattern '^name: kahlil-cover$' 'Skill name 必须为 kahlil-cover'
require_pattern '^description: Use when ' 'description 必须只描述触发场景'
require_pattern 'IP 角色版' '缺少 Hazel 观察者 IP 角色模式'
require_pattern '内容视觉版' '缺少文章内容驱动模式'
require_pattern '未指定.*先询问' '用户未指定模式时必须先询问'
require_pattern '参考图.*优先' '缺少参考图覆盖层'
require_pattern '核心判断' '缺少核心判断提取字段'
require_pattern '视觉动作' '缺少视觉动作提取字段'
require_pattern '主视觉' '缺少主视觉提取字段'
require_pattern '风格路由' '缺少按内容选择风格的路由规则'
require_pattern '不得复用另一篇文章' '缺少跨文章主体防串线规则'
require_pattern '莫兰迪.*仅' '莫兰迪必须被限定为显式选择的历史风格'
require_pattern '默认.*3:4' '缺少 3:4 默认画幅规则'
require_pattern '标题优先' 'IP 模式缺少标题优先原则'
require_pattern '纯白背景' 'IP 模式缺少纯白背景规则'
require_pattern '下半区' 'IP 模式缺少人物与动作的下半区构图'
require_pattern '所有中文标题行统一使用同一套粗黑体' 'IP 标题中文必须统一使用同一套粗黑体'
forbid_pattern '上方.*固定使用.*宋体' 'IP 标题上方说明句不得回退到宋体'
require_pattern '英文关键短语.*超粗无衬线' 'IP 标题英文关键词必须使用超粗无衬线'
require_pattern '底部中文结论句继续使用同一套粗黑体' 'IP 标题底部结论句必须保持同一套粗黑体'
require_pattern '标点可省略' '缺少标题标点可省略规则'
require_pattern '很小.*Kahlil|Kahlil.*很小' '缺少右下角极小 Kahlil 署名规则'
require_pattern 'kahlil-artwork' 'IP 模式必须调用角色契约'
require_pattern '01-action-library\.png' '缺少 IP 角色动作根参考图'
require_pattern '02-workflow-language\.png' '缺少 IP 工作流根参考图'
forbid_pattern 'HazelKahlil' '默认署名已改为 Kahlil，不应继续使用 HazelKahlil'
require_pattern '负面约束' '缺少内容相关的负面约束'
forbid_pattern 'consistent "Morandi-inspired AICONVERSATION" style' '仍把莫兰迪写成所有封面的固定风格'
require_file "$skill_dir/assets/accepted/2026-07-16-vibe-coding-ip-orange.png" '缺少用户确认的橙色关键词定稿基线'
require_file "$skill_dir/assets/accepted/2026-07-16-vibe-coding-ip-black.png" '缺少用户确认的黑色关键词定稿基线'

if (( failures > 0 )); then
  echo "Skill validation failed: $failures problem(s)"
  exit 1
fi

echo "PASS: kahlil-cover dual-mode contract"
