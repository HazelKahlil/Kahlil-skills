#!/usr/bin/env bash
set -euo pipefail

# Install one named skill, or all public skills when the name is "all".
# Examples:
#   bash scripts/install-skill.sh kahlil-cover
#   SKILL_NAME=kahlil-card bash scripts/install-skill.sh
#   bash scripts/install-skill.sh all

SKILL_NAME="${1:-${SKILL_NAME:-multica-squad-builder}}"
REPO_URL="${KOS_REPO_URL:-https://github.com/HazelKahlil/Kahlil-skills.git}"
REF="${KOS_REF:-main}"
CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
DEST_ROOT="${KOS_DEST:-$CODEX_HOME_DIR/skills}"
OVERWRITE="${KOS_OVERWRITE:-0}"

if ! command -v git >/dev/null 2>&1; then
  echo "Error: git is required to install skills." >&2
  exit 1
fi

if [ -n "${KOS_SOURCE_DIR:-}" ]; then
  repo_dir="$KOS_SOURCE_DIR"
  cleanup_repo=0
else
  tmp_dir="$(mktemp -d)"
  cleanup_repo=1
  repo_dir="$tmp_dir/repo"
  cleanup() {
    rm -rf "$tmp_dir"
  }
  trap cleanup EXIT
  git clone --depth 1 --branch "$REF" "$REPO_URL" "$repo_dir" >/dev/null 2>&1
fi

validate_skill() {
  local name="$1"
  local dest="$2"
  case "$name" in
    multica-squad-builder)
      if command -v python3 >/dev/null 2>&1 && [ -f "$dest/scripts/validate_skill.py" ]; then
        (cd "$dest" && python3 scripts/validate_skill.py >/dev/null)
      fi
      ;;
    kahlil-cover)
      (cd "$dest" && bash tests/validate-skill.sh >/dev/null)
      ;;
    kahlil-aesthetic)
      if command -v node >/dev/null 2>&1; then
        (cd "$dest" && node --test tests/*.test.mjs >/dev/null)
      fi
      ;;
    kahlil-card)
      if command -v node >/dev/null 2>&1 && [ -f "$dest/scripts/check-skill-docs.mjs" ]; then
        (cd "$dest" && node scripts/check-skill-docs.mjs >/dev/null)
      fi
      ;;
    *)
      echo "Warning: no package validator registered for $name" >&2
      ;;
  esac
}

install_one() {
  local name="$1"
  local skill_path="${KOS_SKILL_PATH:-skills/$name}"
  local source_dir="$repo_dir/$skill_path"
  local dest_dir="$DEST_ROOT/$name"

  if [ ! -f "$source_dir/SKILL.md" ]; then
    echo "Error: skill not found: $name" >&2
    exit 1
  fi

  if [ -e "$dest_dir" ]; then
    if [ "$OVERWRITE" = "1" ]; then
      rm -rf "$dest_dir"
    else
      echo "Error: destination already exists: $dest_dir" >&2
      echo "Set KOS_OVERWRITE=1 to replace it." >&2
      exit 1
    fi
  fi

  mkdir -p "$DEST_ROOT" "$dest_dir"
  cp -R "$source_dir"/. "$dest_dir"/
  rm -rf "$dest_dir/.git"
  validate_skill "$name" "$dest_dir"
  echo "Installed $name to $dest_dir"
}

if [ "$SKILL_NAME" = "all" ]; then
  for name in multica-squad-builder kahlil-cover kahlil-aesthetic kahlil-card; do
    install_one "$name"
  done
else
  install_one "$SKILL_NAME"
fi

echo "Restart Codex or the agent runtime to pick up the installed skill(s)."
