#!/usr/bin/env python3
"""Validate package structure, operational policy, metadata, and checksums."""

from hashlib import sha256
import json
from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
errors = []


def package_files():
    return sorted(
        p
        for p in ROOT.rglob("*")
        if p.is_file()
        and ".git" not in p.parts
        and "__pycache__" not in p.parts
        and p.suffix != ".pyc"
    )


files = package_files()
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
if len(lines) > 300:
    errors.append(f"SKILL.md too long for lean core: {len(lines)} lines > 300")
if len(text) > 18000:
    errors.append(f"SKILL.md too large for lean core: {len(text)} chars > 18000")

required = [
    "agents/openai.yaml",
    "CHANGELOG.md",
    "CHECKSUMS.txt",
    "METRICS.json",
    "VERSION",
    "config/squad-profile.template.json",
    "references/multica-primitives.md",
    "references/operational-reliability.md",
    "references/squad-architecture.md",
    "references/setup-interview.md",
    "references/project-archetypes.md",
    "references/risk-governance.md",
    "references/rollout-and-iteration.md",
    "references/role-theme-presets.md",
    "templates/agent-captain-system-instructions.md",
    "templates/agent-worker-system-instructions.md",
    "templates/squad-instructions.md",
    "templates/operator-manual-prompt.md",
    "scripts/red_team_check.py",
    "scripts/test_operational_contract.py",
]
for relative_path in required:
    if not (ROOT / relative_path).exists():
        errors.append(f"Missing {relative_path}")

# Placeholders belong only in generated/template/config material.
for path in files:
    if path.suffix not in {".md", ".json"}:
        continue
    relative_path = path.relative_to(ROOT).as_posix()
    content = path.read_text(encoding="utf-8")
    if re.search(r"\{\{[^}]+\}\}|<PROJECT_NAME>|<SQUAD_NAME>|<HUMAN_OWNER>", content):
        if not (
            relative_path.startswith("templates/")
            or relative_path.startswith("config/")
            or relative_path.startswith("prompts/")
            or relative_path.startswith("docs/")
        ):
            errors.append(f"Unresolved placeholder outside template/config/prompts: {relative_path}")

critical_terms = [
    "exact roster mention markdown",
    "Task completion is not issue completion",
    "builder Skill",
    "PR / Done",
    "untrusted task data",
    "No known unresolved Critical / High",
    "Project Resources",
    "Authority order",
    "Autopilots stay off",
    "Review Router v2",
    "Human Visual Acceptance",
    "Source Verification",
    "Live Readback",
    "Blocker Gate",
    "Human Decision Gate",
    "Issue Hygiene Gate",
    "User visual rejection beats Agent PASS",
    "Reviewer cannot judge taste",
    "Role flavor may affect",
    "Execution topology",
    "Direct single agent",
    "Routed single-worker",
    "Dispatch receipt",
    "idempotency key",
    "one recovery attempt",
    "Owner Experience Contract",
    "PR_CREATE",
    "Context budget",
    "Fleet lifecycle",
    "zero-sample",
    "optional overlay",
    "display names only",
    "inject role content separately",
    "leader activity",
    "issue-metadata ledger",
    "cancel only the targeted tasks",
    "aggregate issue usage",
]
markdown_blob = "\n".join(
    path.read_text(encoding="utf-8", errors="ignore")
    for path in files
    if path.suffix == ".md"
)
for term in critical_terms:
    if term.lower() not in markdown_blob.lower():
        errors.append(f"Missing critical term: {term}")

# Machine-readable config must stay valid JSON.
try:
    profile = json.loads((ROOT / "config/squad-profile.template.json").read_text(encoding="utf-8"))
except (OSError, json.JSONDecodeError) as exc:
    profile = {}
    errors.append(f"Invalid squad profile JSON: {exc}")

for key in ("role_name_preset", "coordination", "usage_budget", "kill_switch"):
    if key not in profile:
        errors.append(f"Squad profile missing v1.5 control: {key}")

role_presets_path = ROOT / "references/role-theme-presets.md"
role_presets = role_presets_path.read_text(encoding="utf-8") if role_presets_path.exists() else ""
if role_presets.count("- display names:") != 6:
    errors.append("Role name preset library must contain exactly six display-name lists")
for forbidden_detail in ("role seeds", "best for", "tone hint", "Journey to the West", "Breaking Bad"):
    if forbidden_detail in role_presets:
        errors.append(f"Role name presets still contain replaced detail: {forbidden_detail}")

openai_yaml = ROOT / "agents/openai.yaml"
openai_text = openai_yaml.read_text(encoding="utf-8") if openai_yaml.exists() else ""
for field in ("display_name:", "short_description:", "default_prompt:", "$multica-squad-builder"):
    if field not in openai_text:
        errors.append(f"agents/openai.yaml missing: {field}")

# Release metadata must describe the same version and exact package shape.
version_path = ROOT / "VERSION"
version = version_path.read_text(encoding="utf-8").strip() if version_path.exists() else ""
if not re.fullmatch(r"\d+\.\d+\.\d+", version):
    errors.append(f"Invalid VERSION: {version!r}")

try:
    metrics = json.loads((ROOT / "METRICS.json").read_text(encoding="utf-8"))
except (OSError, json.JSONDecodeError) as exc:
    metrics = {}
    errors.append(f"Invalid METRICS.json: {exc}")

if metrics.get("version") != version:
    errors.append(f"VERSION/METRICS mismatch: {version!r} != {metrics.get('version')!r}")
changelog_path = ROOT / "CHANGELOG.md"
changelog = changelog_path.read_text(encoding="utf-8") if changelog_path.exists() else ""
if f"## v{version}" not in changelog:
    errors.append(f"CHANGELOG missing v{version}")

metric_files = [p for p in files if p.name not in {"CHECKSUMS.txt", "METRICS.json"}]
expected_metrics = {
    "file_count_without_checksums_metrics": len(metric_files),
    "raw_bytes_without_checksums_metrics": sum(p.stat().st_size for p in metric_files),
    "skill_lines": len(lines),
    "skill_bytes": skill.stat().st_size if skill.exists() else 0,
}
for key, expected in expected_metrics.items():
    if metrics.get(key) != expected:
        errors.append(f"METRICS {key} mismatch: expected {expected}, got {metrics.get(key)!r}")

checksum_path = ROOT / "CHECKSUMS.txt"
checksum_entries = {}
if checksum_path.exists():
    for number, line in enumerate(checksum_path.read_text(encoding="utf-8").splitlines(), 1):
        match = re.fullmatch(r"([0-9a-f]{64})  (.+)", line)
        if not match:
            errors.append(f"Malformed CHECKSUMS line {number}: {line!r}")
            continue
        digest, relative_path = match.groups()
        if relative_path in checksum_entries:
            errors.append(f"Duplicate CHECKSUMS entry: {relative_path}")
        checksum_entries[relative_path] = digest
else:
    errors.append("Missing CHECKSUMS.txt")

expected_checksum_paths = {
    p.relative_to(ROOT).as_posix() for p in files if p.name != "CHECKSUMS.txt"
}
listed_checksum_paths = set(checksum_entries)
for missing in sorted(expected_checksum_paths - listed_checksum_paths):
    errors.append(f"CHECKSUMS missing file: {missing}")
for stale in sorted(listed_checksum_paths - expected_checksum_paths):
    errors.append(f"CHECKSUMS lists absent file: {stale}")
for relative_path in sorted(expected_checksum_paths & listed_checksum_paths):
    actual = sha256((ROOT / relative_path).read_bytes()).hexdigest()
    if actual != checksum_entries[relative_path]:
        errors.append(f"CHECKSUMS digest mismatch: {relative_path}")

raw_bytes = sum(path.stat().st_size for path in files)
if len(files) > 40:
    errors.append(f"Too many files for lean package: {len(files)} > 40")
if raw_bytes > 140000:
    errors.append(f"Raw package too large for lean package: {raw_bytes} > 140000")

if errors:
    print("Validation failed:")
    for error in errors:
        print("-", error)
    sys.exit(1)

print(
    "OK: Multica-Squad-Builder validation passed "
    f"({len(files)} files, {raw_bytes} bytes raw, {len(lines)} SKILL.md lines, metadata/checksums exact)."
)
