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
    'role_theme_policy': ['role name presets', 'Role flavor may affect', 'must not override role separation'],
    'role_names_only': ['display names only', 'inject role content separately', 'A preset name never justifies creating an extra agent'],
    'topology_selector': ['Execution topology', 'Direct single agent', 'Routed single-worker', 'Staged or parallel squad'],
    'dispatch_observability': ['Dispatch receipt', 'queued / dispatched / running', 'do not claim that dispatch succeeded'],
    'idempotency': ['idempotency key', 'parent issue + accountable role + scope + deliverable', 'Never create two Workers'],
    'bounded_recovery': ['agent_error', 'one recovery attempt', 'same failure class'],
    'owner_experience': ['Owner Experience Contract', 'result first', 'Do not ask the same question twice', 'source artifact'],
    'permission_bundle': ['PR_CREATE', 'push the task branch', 'separate gates'],
    'context_budget': ['Context budget', '80 comments', 'successor issue'],
    'fleet_evolution': ['Fleet lifecycle', 'at least three substantive completed tasks', 'zero-sample', 'optional overlay'],
    'leader_activity': ['leader activity', 'action', 'no_action', 'failed'],
    'metadata_ledger': ['issue-metadata ledger', 'squad.skill_version', 'stale metadata is not authority'],
    'hard_stop_readback': ['cancel only the targeted tasks', 'no targeted task remains active', 'PAUSED'],
    'usage_visibility': ['aggregate issue usage', 'Do not invent a hard cap', 'Human Owner defines a token threshold'],
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
