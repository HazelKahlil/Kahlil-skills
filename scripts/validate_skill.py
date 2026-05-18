#!/usr/bin/env python3
from pathlib import Path
import re, sys
ROOT = Path(__file__).resolve().parents[1]
errors=[]
def package_files():
    return [p for p in ROOT.rglob('*') if p.is_file() and '.git' not in p.parts]

skill = ROOT/'SKILL.md'
if not skill.exists(): errors.append('Missing SKILL.md')
text = skill.read_text(encoding='utf-8') if skill.exists() else ''
if not text.startswith('---\n'): errors.append('SKILL.md must start with YAML frontmatter')
if 'name: multica-squad-builder' not in text: errors.append('Unexpected skill name')
if 'description:' not in text: errors.append('Missing description')
lines = text.splitlines()
if len(lines) > 300: errors.append(f'SKILL.md too long for lean core: {len(lines)} lines > 300')
if len(text) > 18000: errors.append(f'SKILL.md too large for lean core: {len(text)} chars > 18000')
required = [
  'references/multica-primitives.md','references/squad-architecture.md','references/setup-interview.md',
  'references/project-archetypes.md','references/risk-governance.md','references/rollout-and-iteration.md',
  'templates/agent-captain-system-instructions.md','templates/squad-instructions.md','templates/operator-manual-prompt.md',
  'scripts/red_team_check.py'
]
for rel in required:
    if not (ROOT/rel).exists(): errors.append(f'Missing {rel}')
# Check placeholders are only in templates/config/prompts, not references/SKILL/README/release notes.
for p in package_files():
    if p.is_file() and p.suffix in {'.md','.json'}:
        rel = p.relative_to(ROOT).as_posix()
        content = p.read_text(encoding='utf-8')
        if re.search(r'\{\{[^}]+\}\}|<PROJECT_NAME>|<SQUAD_NAME>|<HUMAN_OWNER>', content):
            if not (rel.startswith('templates/') or rel.startswith('config/') or rel.startswith('prompts/') or rel.startswith('docs/')):
                errors.append(f'Unresolved placeholder outside template/config/prompts: {rel}')
# Critical text presence
crit_terms = [
    'exact roster mention markdown','Task completion is not issue completion','builder Skill',
    'PR / Done','untrusted task data','No known unresolved Critical / High','Project Resources','Authority order','Autopilots stay off'
]
blob='\n'.join(p.read_text(encoding='utf-8',errors='ignore') for p in package_files() if p.suffix == '.md')
for term in crit_terms:
    if term.lower() not in blob.lower(): errors.append(f'Missing critical term: {term}')
# Size budget
files=package_files()
raw=sum(p.stat().st_size for p in files)
if len(files) > 50: errors.append(f'Too many files for lean package: {len(files)} > 50')
if raw > 140000: errors.append(f'Raw package too large for lean package: {raw} > 140000')
if errors:
    print('Validation failed:')
    for e in errors: print('-', e)
    sys.exit(1)
print(f'OK: Multica-Squad-Builder lean validation passed ({len(files)} files, {raw} bytes raw, {len(lines)} SKILL.md lines).')
