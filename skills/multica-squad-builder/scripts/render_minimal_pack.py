#!/usr/bin/env python3
from pathlib import Path
import json, sys, re
ROOT = Path(__file__).resolve().parents[1]

REQUIRED_INSTALL_PLACEHOLDERS = [
    '<PROJECT_NAME>','<SQUAD_NAME>','<PROJECT_ARCHETYPE>','<HUMAN_OWNER>','<ISSUE_PREFIX>',
    '<EXECUTION_TOPOLOGY>','<SQUAD_JUSTIFICATION>','<CAPTAIN_NAME>','<WORKER_NAME>',
    '<REVIEWER_NAME>','<ANALYST_NAME>','<WORKER_MENTION_MARKDOWN_FROM_ROSTER>',
    '<CAPTAIN_MENTION_MARKDOWN_FROM_ROSTER>','<REVIEWER_MENTION_MARKDOWN_FROM_ROSTER>',
    '<ANALYST_MENTION_MARKDOWN_FROM_ROSTER>','<HUMAN_OWNER_MENTION_MARKDOWN_FROM_ROSTER>'
]

def load(rel): return (ROOT/rel).read_text(encoding='utf-8')

def fill(s, data):
    agents=data.get('agents',{})
    mentions=data.get('mention_markdown',{})
    context=data.get('context_budget',{})
    evolution=data.get('evolution',{})
    enabled=set(data.get('enabled_roles',['captain','worker','reviewer','analyst']))
    def role_value(role, placeholder):
        value=agents.get(role)
        return str(value) if value else ('Not installed' if role not in enabled else placeholder)
    def mention_value(role, placeholder):
        value=mentions.get(role)
        return str(value) if value else ('Not installed' if role not in enabled else placeholder)
    repl={
      '{{PROJECT_NAME}}': data.get('project_name','<PROJECT_NAME>'),
      '{{SQUAD_NAME}}': data.get('squad_name','<SQUAD_NAME>'),
      '{{PROJECT_ARCHETYPE}}': data.get('project_archetype','<PROJECT_ARCHETYPE>'),
      '{{EXECUTION_TOPOLOGY}}': data.get('execution_topology','<EXECUTION_TOPOLOGY>'),
      '{{SQUAD_JUSTIFICATION}}': data.get('squad_justification','<SQUAD_JUSTIFICATION>'),
      '{{HUMAN_OWNER}}': data.get('human_owner','<HUMAN_OWNER>'),
      '{{ISSUE_PREFIX}}': data.get('issue_prefix','<ISSUE_PREFIX>'),
      '{{CAPTAIN_NAME}}': role_value('captain','<CAPTAIN_NAME>'),
      '{{WORKER_NAME}}': role_value('worker','<WORKER_NAME>'),
      '{{REVIEWER_NAME}}': role_value('reviewer','<REVIEWER_NAME>'),
      '{{ANALYST_NAME}}': role_value('analyst','<ANALYST_NAME>'),
      '{{CAPTAIN_MENTION}}': mention_value('captain','<CAPTAIN_MENTION_MARKDOWN_FROM_ROSTER>'),
      '{{WORKER_MENTION}}': mention_value('worker','<WORKER_MENTION_MARKDOWN_FROM_ROSTER>'),
      '{{REVIEWER_MENTION}}': mention_value('reviewer','<REVIEWER_MENTION_MARKDOWN_FROM_ROSTER>'),
      '{{ANALYST_MENTION}}': mention_value('analyst','<ANALYST_MENTION_MARKDOWN_FROM_ROSTER>'),
      '{{HUMAN_OWNER_MENTION}}': mentions.get('human_owner','<HUMAN_OWNER_MENTION_MARKDOWN_FROM_ROSTER>'),
      '{{CONTEXT_COMMENT_BUDGET}}': str(context.get('comment_limit',80)),
      '{{EVOLUTION_SAMPLE_THRESHOLD}}': str(evolution.get('substantive_completed_task_threshold',3)),
    }
    for k,v in repl.items(): s=s.replace(k,v)
    return s

def template_paths(data):
    enabled=set(data.get('enabled_roles',['captain','worker','reviewer','analyst']))
    paths=['templates/setup-pack-template.md','templates/agent-captain-system-instructions.md','templates/agent-worker-system-instructions.md']
    if 'reviewer' in enabled: paths.append('templates/agent-reviewer-system-instructions.md')
    if 'analyst' in enabled: paths.append('templates/agent-analyst-system-instructions.md')
    paths.append('templates/squad-instructions.md')
    return paths

def unresolved_required(text):
    hits=[]
    for ph in REQUIRED_INSTALL_PLACEHOLDERS:
        if ph in text: hits.append(ph)
    hits += re.findall(r'\{\{[^}]+\}\}', text)
    return sorted(set(hits))

def main():
    if len(sys.argv)<3:
        print('Usage: render_minimal_pack.py config/squad-profile.template.json output.md')
        sys.exit(2)
    data=json.loads((ROOT/sys.argv[1]).read_text(encoding='utf-8'))
    parts=[]
    for rel in template_paths(data):
        parts.append(fill(load(rel),data))
    out='\n\n---\n\n'.join(parts)
    missing=unresolved_required(out)
    if missing:
        out += '\n\n---\n\n# Installability Warning\n\nThis setup pack remains DRAFT / NOT INSTALLABLE because these required placeholders are unresolved:\n\n'
        out += ''.join(f'- `{m}`\n' for m in missing)
    outp=Path(sys.argv[2])
    outp.parent.mkdir(parents=True, exist_ok=True)
    outp.write_text(out,encoding='utf-8')
    print(f'Rendered {outp}')
    if missing:
        print('WARNING: unresolved required placeholders:', ', '.join(missing))
if __name__=='__main__': main()
