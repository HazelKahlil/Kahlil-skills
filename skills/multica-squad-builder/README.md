# Multica-Squad-Builder v2.1.0

Design, iterate, or audit a Multica agent squad. Output is a tailored setup pack: topology, leader charter, role instructions, hard gates.

Strong models, few rules. The leader writes specs, does small work, packs self-contained briefs, judges member output, and unblocks with decisions.

## Use

1. Attach this Skill to a Squad Designer.
2. Choose topology: direct single agent, routed single-worker, or staged/parallel squad.
3. Use relevant setup/role sections only; a narrow patch needs a concrete diff and candidate text, not a full setup ceremony.
4. Paste exact roster mention markdown before treating the pack as installable.

## Package

- `SKILL.md` — purpose, charter, gates, modes, router
- `references/` — leader playbook, squad design, primitives, safety gates, optional name presets
- `templates/` — installable leader/worker/reviewer/analyst/squad/setup-pack text
- `scripts/validate_skill.py` — package shape check

Keep generated text short and retain necessary boundaries. Missed compliance is not permission to remove protections. Repair details are in references/repair-contract.md; resolve the specific valid project/packet limit (default 2 only when unspecified) and fill the same {{REPAIR_LIMIT}} value into every applicable generated role. Generated runtime text must carry applicable rules instead of relying on a designer-only attachment.

Existing agents, local imports and workspace copies need separately scoped updates. Saved configuration is distinct from subsequent runtime behavior. No automatic fleet migration or task dispatch is implied.
