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
    'status_transition_hygiene': ['validation-passed', 'in_review', 'in_progress'],
    'analyst_evidence_budget': ['Evidence budget', 'at most 2-3 directly related issues'],
    'git_readiness': ['local Git baseline', 'untracked directory inside a broad parent repo'],
    'review_router_v2': ['Review Router v2', 'Human Visual Acceptance', 'Source Verification', 'Live Readback', 'Blocker Gate', 'Human Decision Gate', 'Issue Hygiene Gate'],
    'reviewer_taste_guard': ['User visual rejection beats Agent PASS', 'Reviewer cannot judge taste', 'PASS or BLOCKED'],
    'skip_review_guard': ['self-classification', 'cannot force or skip review'],
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
