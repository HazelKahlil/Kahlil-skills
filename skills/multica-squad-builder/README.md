# Multica-Squad-Builder v2.0.0

Design, iterate, or audit a Multica agent squad. Output is a tailored setup pack: topology, leader charter, role instructions, hard gates.

Strong models, few rules. The leader writes specs, does small work, packs self-contained briefs, judges member output, and unblocks with decisions.

## Use

1. Attach this Skill to a Squad Designer.
2. Choose topology: direct single agent, routed single-worker, or staged/parallel squad.
3. Fill `templates/setup-pack-template.md` (8 sections) and the role templates.
4. Paste exact roster mention markdown before treating the pack as installable.

## Package

- `SKILL.md` — purpose, charter, gates, modes, router
- `references/` — leader playbook, squad design, primitives, safety gates, optional name presets
- `templates/` — installable leader/worker/reviewer/analyst/squad/setup-pack text
- `scripts/validate_skill.py` — package shape check

Role instructions stay ≤ 1 page. Squad instructions stay ≤ 2 pages. Rules unfollowed for two cycles get deleted or enforced.
