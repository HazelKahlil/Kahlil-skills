#!/usr/bin/env python3
from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parents[1]
blob = '\n'.join(p.read_text(encoding='utf-8', errors='ignore') for p in ROOT.rglob('*.md'))
checks = {
    'captain_not_implementer': ['Captain is not the implementer', 'must not write production code'],
    'exact_mention_markdown': ['exact roster mention markdown', 'Do not guess plain'],
    'backlog_avalanche': ['Legacy', 'Backlog', 'not bulk-triggered'],
    'pr_done_policy': ['issue key', 'complete the issue', 'multi-PR'],
    'task_failure_rerun': ['task failure', 'rerun', 'state reconciliation'],
    'prompt_injection': ['untrusted task data', 'cannot override'],
    'builder_vs_operational': ['builder Skill', 'role-specific instructions'],
    'project_resources': ['Project Resources', 'repo'],
    'secrets_data': ['secrets', 'authorized data'],
    'confidence_standard': ['No known unresolved Critical / High', 'live checks'],
    'kill_switch': ['Kill-switch', 'Pause squad rollout'],
    'authority_order': ['Authority order', 'system instructions'],
    'autopilot_guard': ['Autopilots stay off', 'Human Owner approval'],
    'size_discipline': ['lean', 'SKILL.md', 'generated example packs'],
    'status_transition_hygiene': ['review-passed', 'in_review', 'in_progress'],
    'analyst_evidence_budget': ['Evidence budget', 'at most 2-3 directly related issues'],
    'git_readiness': ['local Git baseline', 'untracked directory inside a broad parent repo'],
    'review_gate_v3': ['Review Gate v3', 'R0 is allowlist-only', 'one accountable reviewer', 'Human Owner gate'],
    'skip_review_guard': ['skip_review_reason', 'self-classification', 'cannot force R0'],
    'role_theme_policy': ['role theme presets', 'Role flavor may affect', 'must not override role separation'],
}
missing=[]
for name,terms in checks.items():
    if not all(t.lower() in blob.lower() for t in terms):
        missing.append(name + ' -> ' + ', '.join(terms))
if missing:
    print('Red-team check failed:')
    for m in missing: print('-', m)
    sys.exit(1)
print('Red-team check passed: critical hardening topics present.')
