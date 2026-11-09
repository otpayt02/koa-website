from pathlib import Path
import subprocess,json,shutil
release=Path('C:/Users/olive/Projects/koa-remote-design-audit/sites-release-clean-20261005')
complete=Path('C:/Users/olive/Projects/koa-remote-design-audit/koa-website')
changed=subprocess.check_output(['git','diff-tree','--no-commit-id','--name-only','-r','HEAD'],cwd=release,text=True).splitlines()
normalize=lambda b:b.replace(b'\r\n',b'\n')
copied=[];held=[]
for rel in changed:
    target=complete/rel
    old=subprocess.run(['git','show','HEAD^:'+rel],cwd=release,capture_output=True)
    if target.exists() and old.returncode==0 and normalize(target.read_bytes())!=normalize(old.stdout) and normalize(target.read_bytes())!=normalize((release/rel).read_bytes()):
        held.append(rel);continue
    if target.exists() and old.returncode!=0 and normalize(target.read_bytes())!=normalize((release/rel).read_bytes()):
        held.append(rel);continue
    target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(release/rel,target);copied.append(rel)
proof=Path('C:/Users/olive/Projects/koa-website/output/editorial-reference')
receipt={'copied':copied,'held_existing_edits':held}
(proof/'motion-source-mirror.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8')
for rel in ['docs/koa-scroll-choreography.md']:
    target=Path('C:/Users/olive/Projects/koa-website')/rel
    if not target.exists():target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(release/rel,target)
print(json.dumps(receipt))
