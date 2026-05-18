# Skill Size Policy

This package uses a lean-core strategy.

## Budget

- `SKILL.md`: target under 300 lines and under about 4,000–5,000 tokens.
- Importable zip: target under 100 KB for normal use.
- File count: target under 40 files.
- Individual references: focused and small enough to read only when needed.
- Generated example packs: not included in the importable package by default.

## Why

Agents usually discover a Skill from name and description, then load `SKILL.md`, then selectively load references. Large active instructions crowd out the task. Large package archives also increase audit burden and import/sync friction.

## What belongs where

- `SKILL.md`: router, invariants, modes, and load map.
- `references/`: policies and scenario guides.
- `templates/`: copyable output forms.
- `scripts/`: helpers that are optional and auditable.
- Project-specific generated packs: outside the Skill package unless explicitly requested as examples.
