# Release Notes v1.2.0

This release replaces level-based review with Review Router v2, matching the user's current Multica workflow: Codex handles fast visual annotation loops, Multica keeps the task record and deployment path, and squads validate by evidence type instead of repeated default review.

## Highlights

- Replaced Review Gate v3 with Review Router v2 across `SKILL.md`, references, templates, and validation scripts.
- Added six validation routes: Human Visual Acceptance, Source Verification, Live Readback, Blocker Gate, Human Decision Gate, and Issue Hygiene Gate.
- Scoped Reviewer to blocker-only review: PASS or BLOCKED, at most 3 blockers, no taste judgment, no repeated ritual review.
- Updated Worker and Captain outputs to use `validation_route`, `validation_reason`, evidence, and self-check fields.
- Preserved role theme support while preventing theme flavor from overriding Review Router v2 or operational safety.

## Validation

Run:

```bash
python3 scripts/validate_skill.py
python3 scripts/red_team_check.py
shasum -a 256 -c CHECKSUMS.txt
```
