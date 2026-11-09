import urllib.request,sys,runpy,os
from pathlib import Path
proof=Path('C:/Users/olive/Projects/koa-website/output/editorial-reference/motion-public-parity')
proof.mkdir(parents=True,exist_ok=True);os.chdir(proof)
original=urllib.request.urlopen
urllib.request.urlopen=lambda url,*args,**kwargs: original(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}) if isinstance(url,str) else url,*args,**kwargs)
sys.argv=['export-published-copy.py','https://koamerica.org']
runpy.run_path('C:/Users/olive/Projects/koa-remote-design-audit/sites-release-clean-20261005/scripts/export-published-copy.py',run_name='__main__')
normalize=lambda s:'\n'.join(x.strip() for x in s.splitlines() if x.strip())
local=Path('C:/Users/olive/Projects/koa-remote-design-audit/sites-release-clean-20261005/content/published-site-copy.txt').read_text(encoding='utf-8')
public=(proof/'content/published-site-copy.txt').read_text(encoding='utf-8')
print('public_local_parity:',normalize(local)==normalize(public),'chars:',len(normalize(public)))
assert normalize(local)==normalize(public)
