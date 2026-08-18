#!/usr/bin/env python3
"""Validate the v2.0.0 package shape."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []

REQUIRED = [
    "SKILL.md",
    "README.md",
    "CHANGELOG.md",
    "VERSION",
    "references/multica-primitives.md",
    "references/leader-playbook.md",
    "references/squad-design.md",
    "references/safety-gates.md",
    "references/role-theme-presets.md",
    "templates/agent-leader-instructions.md",
    "templates/agent-worker-instructions.md",
    "templates/agent-reviewer-instructions.md",
    "templates/agent-analyst-instructions.md",
    "templates/squad-instructions.md",
    "templates/setup-pack-template.md",
    "scripts/validate_skill.py",
]

DELETED = [
    "operational-reliability.md",
    "risk-governance.md",
    "operator-manual-guide.md",
    "rollout-and-iteration.md",
    "setup-interview.md",
    "project-archetypes.md",
    "squad-architecture.md",
    "skill-size-policy.md",
    "confidence-report-template.md",
    "migration-plan-template.md",
    "operator-manual-prompt.md",
    "rfc-template.md",
    "pr-delivery-template.md",
    "review-template.md",
    "red_team_check.py",
    "test_operational_contract.py",
    "render_minimal_pack.py",
    "agent-captain-system-instructions.md",
    "agent-worker-system-instructions.md",
    "agent-reviewer-system-instructions.md",
    "agent-analyst-system-instructions.md",
]

skill = ROOT / "SKILL.md"
text = skill.read_text(encoding="utf-8") if skill.exists() else ""
if not skill.exists():
    errors.append("Missing SKILL.md")
if not text.startswith("---\n"):
    errors.append("SKILL.md must start with YAML frontmatter")
if "name: multica-squad-builder" not in text:
    errors.append("Unexpected skill name")
if "description:" not in text:
    errors.append("Missing description")

lines = text.splitlines()
if len(lines) > 100:
    errors.append(f"SKILL.md too long: {len(lines)} lines > 100")

for relative_path in REQUIRED:
    if not (ROOT / relative_path).exists():
        errors.append(f"Missing {relative_path}")

version = (ROOT / "VERSION").read_text(encoding="utf-8").strip() if (ROOT / "VERSION").exists() else ""
if version != "2.0.0":
    errors.append(f"VERSION must be 2.0.0, got {version!r}")
changelog = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8") if (ROOT / "CHANGELOG.md").exists() else ""
if "## v2.0.0" not in changelog:
    errors.append("CHANGELOG missing v2.0.0")

files = sorted(
    p
    for p in ROOT.rglob("*")
    if p.is_file()
    and ".git" not in p.parts
    and "__pycache__" not in p.parts
    and p.suffix != ".pyc"
)

for path in files:
    relative = path.relative_to(ROOT).as_posix()
    if relative in {"CHANGELOG.md", "scripts/validate_skill.py"}:
        continue
    content = path.read_text(encoding="utf-8", errors="ignore")
    for name in DELETED:
        if name in content:
            errors.append(f"{relative} references deleted file {name}")

if errors:
    print("Validation failed:")
    for error in errors:
        print("-", error)
    sys.exit(1)

print(
    f"OK: Multica-Squad-Builder v2.0.0 validation passed "
    f"({len(files)} files, {len(lines)} SKILL.md lines)."
)
