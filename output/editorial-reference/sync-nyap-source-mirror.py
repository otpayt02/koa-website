from pathlib import Path
import subprocess, shutil, json
release=Path('C:/Users/olive/Projects/koa-remote-design-audit/sites-release-clean-20261005').resolve()
mirror=Path('C:/Users/olive/Projects/koa-remote-design-audit/koa-website').resolve()
backup=Path(__file__).with_name('mirror-before-nyap').resolve()
paths=subprocess.check_output(['git','diff','--name-only','9a00ff3047dcf39d952d9e124567b9e784469803','HEAD'],cwd=release,text=True).splitlines()
copied=[]
for relative in paths:
    src=(release/relative).resolve(); dst=(mirror/relative).resolve(); old=(backup/relative).resolve()
    assert src.is_relative_to(release) and dst.is_relative_to(mirror) and old.is_relative_to(backup)
    if not src.is_file(): continue
    if dst.is_file() and src.read_bytes()!=dst.read_bytes():
        old.parent.mkdir(parents=True,exist_ok=True)
        if not old.exists(): shutil.copy2(dst,old)
    dst.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(src,dst); copied.append(relative)
Path(__file__).with_name('nyap-mirror-sync.json').write_text(json.dumps({'release':str(release),'mirror':str(mirror),'backup':str(backup),'files':copied},indent=2),encoding='utf-8')
print('Synced',len(copied),'source and asset files; prior mirror copies preserved.')
