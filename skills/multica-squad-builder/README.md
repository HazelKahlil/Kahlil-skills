# Multica-Squad-Builder v1.1.5

Multica-Squad-Builder is a lean Skill for designing, configuring, auditing, migrating, operating, and iterating Multica agent squads.

v1.1.5 is the current public release. It keeps the importable package small while adding role theme presets for cultural, meme, and IP-inspired squad skins. Review Gate v3 remains the governing review policy.

## Recommended use

1. Import this Skill into Multica as `multica-squad-builder`.
2. Attach it first to a `Squad Designer` agent.
3. Ask the designer to create a project-specific setup pack.
4. Create the actual Captain / Worker / Reviewer / Analyst agents.
5. Install the generated role instructions into those agents.
6. Create the squad and copy the exact roster mention markdown from Multica's squad roster into the setup pack.
7. Install the generated squad instructions into the Multica squad.
8. Attach Project Resources / repos and verify daemon/runtime/tool access.
9. Run no-code smoke tests before real work.
10. Run 2-3 low-risk pilot issues before legacy migration, autopilots, or higher concurrency.

## Package philosophy

This package follows progressive disclosure: `SKILL.md` is a router and invariant layer. Detailed policies live in `references/`, and copyable outputs live in `templates/`. Agents should read only the files required for the current task.

## Files

- `SKILL.md` - activation router and non-negotiable rules.
- `references/` - focused supporting policies, including optional role theme presets.
- `templates/` - copyable instructions and output templates.
- `scripts/` - validation and lightweight setup rendering helpers.
- `config/` - sample project profile.

Generated examples and training bundles should stay outside the importable Skill unless deliberately requested.
