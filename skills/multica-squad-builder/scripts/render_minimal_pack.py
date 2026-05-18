#!/usr/bin/env python3
from pathlib import Path
import json, sys, re
ROOT = Path(__file__).resolve().parents[1]

REQUIRED_INSTALL_PLACEHOLDERS = [
    '<PROJECT_NAME>','<SQUAD_NAME>','<HUMAN_OWNER>','<CAPTAIN_NAME>','<WORKER_NAME>',
    '<REVIEWER_NAME>','<ANALYST_NAME>','<WORKER_MENTION_MARKDOWN_FROM_ROSTER>',
    '<REVIEWER_MENTION_MARKDOWN_FROM_ROSTER>','<ANALYST_MENTION_MARKDOWN_FROM_ROSTER>'
]

def load(rel): return (ROOT/rel).read_text(encoding='utf-8')

def fill(s, data):
    agents=data.get('agents',{})
    mentions=data.get('mention_markdown',{})
    repl={
      '{{PROJECT_NAME}}': data.get('project_name','<PROJECT_NAME>'),
      '{{SQUAD_NAME}}': data.get('squad_name','<SQUAD_NAME>'),
      '{{PROJECT_ARCHETYPE}}': data.get('project_archetype','<PROJECT_ARCHETYPE>'),
      '{{HUMAN_OWNER}}': data.get('human_owner','<HUMAN_OWNER>'),
      '{{ISSUE_PREFIX}}': data.get('issue_prefix','<ISSUE_PREFIX>'),
      '{{CAPTAIN_NAME}}': agents.get('captain','<CAPTAIN_NAME>'),
      '{{WORKER_NAME}}': agents.get('worker','<WORKER_NAME>'),
      '{{REVIEWER_NAME}}': agents.get('reviewer','<REVIEWER_NAME>'),
      '{{ANALYST_NAME}}': agents.get('analyst','<ANALYST_NAME>'),
      '{{CAPTAIN_MENTION}}': mentions.get('captain','<CAPTAIN_MENTION_MARKDOWN_FROM_ROSTER>'),
      '{{WORKER_MENTION}}': mentions.get('worker','<WORKER_MENTION_MARKDOWN_FROM_ROSTER>'),
      '{{REVIEWER_MENTION}}': mentions.get('reviewer','<REVIEWER_MENTION_MARKDOWN_FROM_ROSTER>'),
      '{{ANALYST_MENTION}}': mentions.get('analyst','<ANALYST_MENTION_MARKDOWN_FROM_ROSTER>'),
      '{{HUMAN_OWNER_MENTION}}': mentions.get('human_owner','<HUMAN_OWNER_MENTION_MARKDOWN_FROM_ROSTER>'),
    }
    for k,v in repl.items(): s=s.replace(k,v)
    return s

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
    for rel in ['templates/setup-pack-template.md','templates/agent-captain-system-instructions.md','templates/agent-worker-system-instructions.md','templates/agent-reviewer-system-instructions.md','templates/agent-analyst-system-instructions.md','templates/squad-instructions.md']:
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