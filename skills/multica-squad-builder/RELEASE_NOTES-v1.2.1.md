# Release Notes v1.2.1

This release adds the validation budget layer to Review Router v2: review intensity must stay proportionate to task size, with a hard per-issue default budget, so squads cannot drift back into repeated review loops.

## Highlights

- Proportionality rule: for routine tasks, validation must cost less than the implementation it audits; otherwise downgrade to self-check plus sampled audit.
- Per-issue budget: one Blocker Gate pass plus one re-review of original blockers by default; more rounds require the Human Owner.
- The budget never waives Human Decision Gate, Source Verification, branch protection, CODEOWNERS, or org rules.
- Captain and Squad templates carry the budget and the two-loop stop-and-escalate rule, so generated squads inherit loop protection by default.
- Repository READMEs synced to the current release version.

## Validation

Run:

```bash
python3 scripts/validate_skill.py
python3 scripts/red_team_check.py
shasum -a 256 -c CHECKSUMS.txt
```
