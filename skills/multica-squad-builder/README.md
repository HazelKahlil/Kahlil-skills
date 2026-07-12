# Multica-Squad-Builder v1.4.0

Multica-Squad-Builder is a lean Skill for designing, configuring, auditing, repairing, migrating, operating, and iterating Multica agent squads.

v1.4.0 is the current public release. It chooses the smallest execution topology, verifies every dispatch with a task receipt, prevents duplicate work, bounds failure recovery, and generates result-first owner experience, permission, context, and fleet-lifecycle contracts.

## Recommended use

1. Import this Skill into Multica as `multica-squad-builder`.
2. Attach it first to a `Squad Designer` agent.
3. Ask the designer to decide direct single agent, routed single-worker, staged squad, or parallel squad. Do not create a squad when one known Agent is enough.
4. Generate a project-specific setup pack and resolve exact mention markdown.
5. Create the minimum Captain / Worker / Reviewer / Analyst roster actually required.
6. Install the generated role instructions and squad instructions.
7. Attach Project Resources / repos and verify daemon/runtime/tool/Skill readback.
8. Run no-code and operational behavior smoke tests before real work.
9. Run 2-3 low-risk pilot issues before legacy migration, autopilots, or higher concurrency.
10. Audit evolution only after three substantive completed tasks or a concrete failure trigger.

## Package philosophy

This package follows progressive disclosure: `SKILL.md` is a router and invariant layer. Detailed policies live in `references/`, and copyable outputs live in `templates/`. Agents should read only the files required for the current task.

## Files

- `SKILL.md` - activation router and non-negotiable rules.
- `references/` - focused supporting policies, including optional role theme presets.
- `templates/` - copyable instructions and output templates.
- `scripts/` - validation and lightweight setup rendering helpers.
- `config/` - sample project profile.

Generated examples and training bundles should stay outside the importable Skill unless deliberately requested.

Run `python3 scripts/test_operational_contract.py` with the standard validation scripts before publishing.
