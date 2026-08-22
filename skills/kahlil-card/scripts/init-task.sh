#!/usr/bin/env bash
set -euo pipefail
# Usage:
#   init-task.sh <任务目录>
#   init-task.sh --name <专题中文名>   # 自动落到
#     <workspace>/platforms/Kahlil-cards/<YYYY年M月>/<D日>/<专题中文名>/
#
# 路径约定见 references/路径约定.md
# 成图由 render 写入 输出/<H时MM分>/，不在 init 时预建时间戳子目录。

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
# The public package cannot assume a particular workspace path. Set
# KAHLIL_CARD_ROOT (or pass --root) when you have a dedicated project root;
# otherwise use the current directory as the workspace.
DEFAULT_WS="${KAHLIL_CARD_ROOT:-${PWD}}"
# 正式归档：platforms 下的 Kahlil-cards（中文目录名）
DEFAULT_OUT_ROOT="${KAHLIL_CARD_OUT_ROOT:-${DEFAULT_WS}/platforms/Kahlil-cards}"
OUT_CN="输出"

TASK_DIR=""
TOPIC_NAME=""
# 允许覆盖日期分层（测试或补档）
FORCE_YEAR=""
FORCE_MONTH=""
FORCE_DAY=""
FLAT=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name|-n)
      TOPIC_NAME="${2:-}"
      shift 2
      ;;
    --root)
      DEFAULT_WS="${2:-}"
      DEFAULT_OUT_ROOT="${DEFAULT_WS}/platforms/Kahlil-cards"
      shift 2
      ;;
    --out-root)
      DEFAULT_OUT_ROOT="${2:-}"
      shift 2
      ;;
    --year)
      FORCE_YEAR="${2:-}"
      shift 2
      ;;
    --month)
      FORCE_MONTH="${2:-}"
      shift 2
      ;;
    --day)
      FORCE_DAY="${2:-}"
      shift 2
      ;;
    --flat)
      # 不按年月日分层，直接 platforms/Kahlil-cards/<名>/（兼容旧习惯）
      FLAT=1
      shift
      ;;
    -h|--help)
      echo "usage: $0 <任务目录>"
      echo "       $0 --name <专题中文名> [--year Y --month M --day D] [--flat]"
      echo "示例: $0 --name 给AI小白的10个工具清单"
      echo "默认落点: ${DEFAULT_OUT_ROOT}/<YYYY年M月>/<D日>/<专题中文名>/"
      echo "成图落点: …/输出/<H时MM分>/卡片-01.png （由 node render.mjs 写入）"
      exit 0
      ;;
    *)
      if [[ -z "$TASK_DIR" ]]; then
        TASK_DIR="$1"
      else
        echo "unexpected arg: $1" >&2
        exit 1
      fi
      shift
      ;;
  esac
done

# 本地日期（不补零）：2026年7月 / 23日
date_parts() {
  local y m d
  y="${FORCE_YEAR:-$(date +%Y)}"
  # macOS/BSD date 支持 %-m %-d；GNU 也支持
  if [[ -n "${FORCE_MONTH:-}" ]]; then
    m="$FORCE_MONTH"
  else
    m="$(date +%-m 2>/dev/null || date +%m | sed 's/^0//')"
  fi
  if [[ -n "${FORCE_DAY:-}" ]]; then
    d="$FORCE_DAY"
  else
    d="$(date +%-d 2>/dev/null || date +%d | sed 's/^0//')"
  fi
  # 去掉前导零保险
  m=$((10#${m}))
  d=$((10#${d}))
  echo "${y}年${m}月" "${d}日"
}

if [[ -n "$TOPIC_NAME" ]]; then
  # 去掉危险字符
  SAFE_NAME="$(printf '%s' "$TOPIC_NAME" | tr -d '/\\:*?"<>|' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  if [[ -z "$SAFE_NAME" ]]; then
    echo "empty topic name after sanitize" >&2
    exit 1
  fi
  if [[ "$FLAT" -eq 1 ]]; then
    TASK_DIR="${DEFAULT_OUT_ROOT}/${SAFE_NAME}"
  else
    read -r YM_DIR DAY_DIR < <(date_parts)
    TASK_DIR="${DEFAULT_OUT_ROOT}/${YM_DIR}/${DAY_DIR}/${SAFE_NAME}"
  fi
fi

if [[ -z "${TASK_DIR:-}" ]]; then
  echo "usage: $0 <任务目录>" >&2
  echo "       $0 --name <专题中文名>" >&2
  echo "路径约定: ${DEFAULT_OUT_ROOT}/<YYYY年M月>/<D日>/<专题中文名>/${OUT_CN}/<H时MM分>/" >&2
  exit 1
fi

# 若用户只给了相对中文名且不含斜杠，自动接到当日分层下
if [[ "$TASK_DIR" != /* && "$TASK_DIR" != .*/* && "$TASK_DIR" != */* ]]; then
  if [[ "$FLAT" -eq 1 ]]; then
    TASK_DIR="${DEFAULT_OUT_ROOT}/${TASK_DIR}"
  else
    read -r YM_DIR DAY_DIR < <(date_parts)
    TASK_DIR="${DEFAULT_OUT_ROOT}/${YM_DIR}/${DAY_DIR}/${TASK_DIR}"
  fi
fi

mkdir -p "${DEFAULT_OUT_ROOT}"
mkdir -p "${TASK_DIR}/${OUT_CN}" "${TASK_DIR}/assets" "${TASK_DIR}/素材"
cp -f "$SKILL_DIR/assets/template-kahlil-card.html" "$TASK_DIR/index.html"

# fonts: symlink（模板仍引用 assets/fonts/...）
if [[ -e "$TASK_DIR/assets/fonts" || -L "$TASK_DIR/assets/fonts" ]]; then
  rm -rf "$TASK_DIR/assets/fonts"
fi
ln -sfn "$SKILL_DIR/assets/fonts" "$TASK_DIR/assets/fonts"

if [[ -d "$SKILL_DIR/assets/screenshot-backgrounds" ]]; then
  ln -sfn "$SKILL_DIR/assets/screenshot-backgrounds" "$TASK_DIR/assets/screenshot-backgrounds"
fi

cp -f "$SKILL_DIR/scripts/render-task.mjs" "$TASK_DIR/render.mjs"

# 写一份给人看的路径说明
cat > "${TASK_DIR}/路径说明.txt" <<EOF
专题目录: ${TASK_DIR}
成图目录: ${TASK_DIR}/${OUT_CN}/<H时MM分>/   （每次 render 新建时间戳子目录）
最近成图: ${TASK_DIR}/${OUT_CN}/最近/         （软链，指向最近一次）
素材目录: ${TASK_DIR}/素材/
源文件:   ${TASK_DIR}/index.html

渲染:
  cd "${TASK_DIR}" && node render.mjs

路径约定: kahlil-card/references/路径约定.md
归档根:   platforms/Kahlil-cards/<YYYY年M月>/<D日>/<专题>/
EOF

# 兼容：若旧脚本找 output/，做软链指向 输出/
if [[ ! -e "${TASK_DIR}/output" ]]; then
  ln -sfn "${OUT_CN}" "${TASK_DIR}/output"
fi

echo "已初始化（platforms/Kahlil-cards · 按日分层）: $TASK_DIR"
echo "  index.html  <- template-kahlil-card.html"
echo "  assets/fonts -> skill 字体"
echo "  成图目录: ${TASK_DIR}/${OUT_CN}/<H时MM分>/"
echo "  渲染: cd \"$TASK_DIR\" && node render.mjs"
