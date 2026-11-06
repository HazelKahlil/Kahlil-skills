# Changelog

## v2.1.1 — Concise evidence handoffs

- Carry current candidate, repair count/allowance, results, remaining blockers and next action; reference unchanged history rather than copying full logs or JSON each round.
- Keep references accessible and retain decision-relevant evidence and authority in the current brief. Repair limits, finite extension conditions, review independence and QA gates are unchanged.

## v2.1.0 — Bounded repairs and focused handoffs

- Share one packet repair count across review and applicable QA; inherit project limits, default to two only when unspecified, and preserve finite delegated extensions without resetting counts.
- Stop unproductive work early; distinguish necessary blockers from optional polish, and reuse applicable evidence.
- Let pre-authorized worker/reviewer handoffs proceed directly with verified routing; send the leader decisions, cap exits and consolidated results rather than routine acknowledgments.
- Keep child delivery, candidate verdict and parent acceptance distinct; disclose all relevant blockers and preserve required independent review and live QA.
- Update existing objects by approved fields; retain valid authority, IDs and bindings, and separate configuration readback from runtime verification.

## v2.0.0 — Real Leader, Few Rules

- Redesigned the leader from a routing/dispatch layer into a real leader: spec before dispatch, scale effort (small work done personally), self-contained briefs, judge/synthesize member output, unblock with decisions.
- Cut procedural scaffolding that rotted mid-context: Review Router v2, Issue Hygiene Gate, Owner Experience Contract, mandatory leader activity, metadata ledgers, usage visibility, DRAFT/PILOT readiness ladder, kill switch sequences, 21-item setup packs, validation budgets, comment-count gates.
- Three modes only: Setup (migration is a variant), Iterate, Audit.
- Hard gates kept: Human Decision Gate, `PR_CREATE` bundle, done=merged-or-accepted, user visual veto, two-loop stop, untrusted task data.
- Review is optional and risk-triggered: PASS or BLOCKED, max 3 blockers. Reviewer and Analyst marked optional.
- Merged architecture/archetypes/interview into `references/squad-design.md`; compressed risk governance into `references/safety-gates.md`; added `references/leader-playbook.md`.
- Removed operator manuals, RFC/PR/review/confidence/migration templates, red-team and operational-contract scripts, METRICS/CHECKSUMS, and v1.5 config/profile machinery.
- Size discipline: `SKILL.md` ~70–80 lines; role instructions ≤1 page; squad instructions ≤2 pages.

## v1.5.0 — Name Presets and Observable Control

- Replaced the 14 fictional/IP-inspired role themes with six historical-figure name presets: 科学革命局、计算先驱实验室、世界文学编辑部、哲学决策议会、探索远征队、艺术创新工坊.
- Reduced presets to display names only. Names no longer inject duties, expertise, personality, tone, permissions, or authority; project-specific role instructions supply those separately.
- Added leader-activity outcomes for every Captain trigger: `action`, `no_action`, or `failed`, with receipt-aware reasons.
- Added a compact issue-metadata coordination ledger for Skill version, topology, validation route, idempotency, dispatch task ID, and recovery count, with live-state reconciliation.
- Added a verified kill-switch sequence using exact task cancellation and zero-active readback before `PAUSED`, while preserving issues, branches, PRs, and artifacts.
- Added aggregate issue-usage visibility with observe-only defaults and no invented numeric token cap.
- Updated setup, Captain, squad, rollout, config, red-team, and operational-contract coverage; added UI metadata in `agents/openai.yaml`.

## v1.4.0 — Observable Squad Operations

- Added an execution-topology selector: direct single agent, routed single-worker, staged squad, or parallel squad. Generated packs must explain why a squad is needed before choosing roster size.
- Added dispatch receipts and idempotency keys so assignment, exact mention, rerun, child creation, branch creation, and PR creation cannot be reported as successful without readback or duplicated across retries.
- Added a bounded failure-recovery policy: one evidence-backed recovery attempt per failure class, then `blocked` with an exact external action instead of repeated “continue” loops.
- Added the Owner Experience Contract: result-first delivery, remembered answers and approvals, source-artifact/visual-baseline preservation, and results-only behavior.
- Added the `PR_CREATE` permission bundle for task branch, scoped commit, task-branch push, and opening the PR; merge, deploy, destructive actions, and sensitive control planes stay separate.
- Distinguished child work-package completion from parent acceptance, and added an 80-comment / two-rejected-repair context budget with one non-duplicate successor issue.
- Added fleet lifecycle audits, live role-loadout readback, evidence thresholds for evolution reviews, zero-sample suppression, and project workflow as an optional overlay.
- Added behavior-level regression tests and strengthened package validation for version, metrics, checksum coverage, and exact digests.
- Moved historical release notes and red-team reports outside the importable Skill package to keep active context lean.

## v1.2.1 — Validation Budget

- Added proportionality and a per-issue validation budget to Review Router v2: default one Blocker Gate pass plus one re-review of original blockers; extra rounds require the Human Owner.
- The budget never waives Human Decision Gate, Source Verification, branch protection, CODEOWNERS, or org rules.
- Captain template now carries the budget and the two-loop stop-and-escalate rule so generated captains cannot regress into review loops.
- Squad instructions template carries the same budget line.
- Synced repository READMEs to the current release version.

## v1.2.0 — Review Router v2

- Replaced level-based Review Gate v3 with Review Router v2 across the runtime Skill, references, and setup templates.
- Added validation routes for Human Visual Acceptance, Source Verification, Live Readback, Blocker Gate, Human Decision Gate, and Issue Hygiene Gate.
- Tightened Reviewer scope: reviewer is now a blocker gate only, cannot judge visual taste, cannot replace user acceptance, and should avoid repeated re-review loops.
- Updated Worker/Captain/Squad templates so outputs report `validation_route`, `validation_reason`, evidence, and self-check results instead of `review_level`.
- Added source/current-doc verification guidance for native platform/API work and live readback guidance for deploy/API/production behavior.
- Added validation and red-team checks so generated squads do not regress back to Review Gate v3 habits.

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
