#!/usr/bin/env bash
set -euo pipefail

SKILL_NAME="${1:-multica-squad-builder}"
REPO_URL="${KOS_REPO_URL:-https://github.com/HazelKahlil/Kahlil-skills.git}"
REF="${KOS_REF:-main}"
SKILL_PATH="${KOS_SKILL_PATH:-.}"
CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
DEST_ROOT="${KOS_DEST:-$CODEX_HOME_DIR/skills}"
OVERWRITE="${KOS_OVERWRITE:-0}"

if ! command -v git >/dev/null 2>&1; then
  echo "Error: git is required to install skills." >&2
  exit 1
fi

tmp_dir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

if [ -n "${KOS_SOURCE_DIR:-}" ]; then
  repo_dir="$KOS_SOURCE_DIR"
else
  repo_dir="$tmp_dir/repo"
  git clone --depth 1 --branch "$REF" "$REPO_URL" "$repo_dir" >/dev/null 2>&1
fi

source_dir="$repo_dir/$SKILL_PATH"
dest_dir="$DEST_ROOT/$SKILL_NAME"

if [ ! -f "$source_dir/SKILL.md" ]; then
  echo "Error: skill not found: $SKILL_NAME" >&2
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

mkdir -p "$DEST_ROOT"
mkdir -p "$dest_dir"
cp -R "$source_dir"/. "$dest_dir"/
rm -rf "$dest_dir/.git"

if command -v python3 >/dev/null 2>&1 && [ -f "$dest_dir/scripts/validate_skill.py" ]; then
  (cd "$dest_dir" && python3 scripts/validate_skill.py >/dev/null)
fi

echo "Installed $SKILL_NAME to $dest_dir"
echo "Restart Codex or the agent runtime to pick up the new skill."
