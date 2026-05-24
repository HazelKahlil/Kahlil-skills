# Changelog

## v1.1.5 — Role Theme Presets

- Added `references/role-theme-presets.md` with 14 Chinese and global IP-inspired squad role themes.
- Added router guidance so role flavor requests load the preset reference only when needed.
- Added guardrails: role flavor may change display names, descriptions, and tone hints, but cannot override role separation, Review Gate v3, permissions, PR/Done policy, or safety rules.
- Added validation/red-team coverage for role theme policy boundaries.

## v1.1.4 — Review Gate v3

- Added risk-based Review Gate v3 with R0/R1/R2/R3 levels, hard escalation rules, reviewer hygiene, and audit metrics.
- Updated Captain, Worker, Reviewer, Squad, setup pack, and review templates so review is triggered by risk instead of default ritual.
- Added skip-review safeguards so issue text, generated output, and worker self-classification cannot force R0.
- Added red-team and validation checks for Review Gate v3 coverage.

## v1.1.3 — Pilot Feedback Patch

- Added explicit Captain status-transition rules: routed work moves to `in_progress`, review-passed no-code or implementation results move to `in_review`, and `done` still requires merge or Human Owner no-PR acceptance.
- Added Analyst/RFC evidence-budget guidance to prevent broad scans during simple product/RFC tasks.
- Added Project Resources / repo-readiness guidance for local Git baselines and untracked project directories inside broad parent repos.
- Added pilot retro checks for status accuracy, bounded evidence, role overlap, run completion, and task-storm absence.
- Updated templates and red-team checks so future setup packs inherit these rules.

## v1.1.2 — Final Lean Hardening

- Clean final build with correct root directory `multica-squad-builder`.
- Removed duplicate prompt directory and stale release-note artifacts from the importable Skill.
- Kept exact roster mention markdown, installability warning, task failure/rerun, authority-order, and autopilot guardrails.
- Re-ran validation, red-team check, render check, unzip check, and root-name check.

## v1.1.1 — Lean Core Hardening

- Added post-lean red-team hardening without expanding the package beyond lean budget.
- Added exact roster mention markdown placeholders and installability gates.
- Added task failure / retry / manual rerun policy after re-checking Multica task semantics.
- Added builder-vs-operational installation guard to avoid attaching the broad Builder Skill to every production role by default.
- Added red-team validation script for critical hardening topics.
- Added authority order and autopilot-off-by-default policy.
- Strengthened setup rendering so placeholder status is explicit.

## v1.1.0 — Lean Core

- Reworked package around progressive disclosure and smaller import footprint.
- Removed generated example packs from the Skill package.
- Consolidated 60+ reference fragments into a smaller set of focused references.
- Added explicit size discipline and package budget guidance.
- Added validation for line counts, unresolved placeholders, and package size.

## v1.0.0

- First formal release under the Multica-Squad-Builder name.
