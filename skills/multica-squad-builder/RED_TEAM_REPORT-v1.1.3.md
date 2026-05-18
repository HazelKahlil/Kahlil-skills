# Multica-Squad-Builder v1.1.3 Red-team Report

## Confidence standard

Operational confidence is claimed only for the offline package state. Live
confidence still requires import, agent-runtime pickup, exact roster mention
verification, project resource verification, and Human Owner acceptance.

## Pilot feedback addressed

1. **Status drift** — Captain instructions now require routed work to move to
   `in_progress`, review-passed no-code or implementation results to move to
   `in_review`, and `done` to remain reserved for merge or explicit Human Owner
   acceptance.
2. **Over-broad research** — Analyst instructions now include a bounded evidence
   budget for RFC, research, and no-code tasks.
3. **Repo ambiguity** — setup packs now call out local Git baseline checks,
   parent-repo ambiguity, and GitHub resource readiness before LIVE rollout.
4. **Pilot feedback loop** — rollout guidance now includes retro checks for
   task storms, role overlap, status accuracy, bounded evidence, and completed
   run handling.

## Tests run

```text
python3 scripts/validate_skill.py
python3 scripts/red_team_check.py
shasum -a 256 -c CHECKSUMS.txt
```

## Remaining live checks

- Confirm Skill import and attachment in the real Multica workspace.
- Confirm Skill pickup by the actual agent runtime.
- Confirm exact roster mention markdown.
- Confirm project resource and GitHub repo access.
- Confirm branch protection, CI, PR, and Done policy behavior.
- Confirm autopilots remain off until LIVE and explicit approval.

## Stop/go recommendation

Go for DRAFT -> PILOT. Do not mark LIVE until at least one no-code pilot and
one low-risk implementation pilot complete with correct status transitions,
bounded evidence, and no accidental mention/task loops.
