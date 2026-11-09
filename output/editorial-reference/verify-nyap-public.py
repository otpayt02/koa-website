import hashlib, json, urllib.request
from pathlib import Path
root=Path('C:/Users/olive/Projects/koa-remote-design-audit/sites-release-clean-20261005')
files=['nyap-2027-flyer-1.jpg','nyap-2027-flyer-2.jpg','hero-capitol-background-restored.png']
results=[]
for name in files:
    req=urllib.request.Request('https://koamerica.org/koa/assets/'+name,headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req,timeout=30) as response:
        data=response.read()
    expected=hashlib.sha256((root/'public/koa/assets'/name).read_bytes()).hexdigest()
    actual=hashlib.sha256(data).hexdigest()
    results.append({'asset':name,'bytes':len(data),'sha256':actual,'matches_release':expected==actual})
assert all(item['matches_release'] for item in results)
proof=Path(__file__).with_name('nyap-public-assets-check.json')
proof.write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps(results))
