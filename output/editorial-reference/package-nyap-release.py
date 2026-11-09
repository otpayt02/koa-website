from pathlib import Path
import tarfile, re, urllib.request, json
root = Path('C:/Users/olive/Projects/koa-remote-design-audit/sites-release-clean-20261005')
proof = Path('C:/Users/olive/Projects/koa-website/output/editorial-reference')
texts = '\n'.join(p.read_text(encoding='utf-8') for folder in ['app','components','content'] for p in (root/folder).rglob('*') if p.suffix in ['.tsx','.ts','.css','.json'] and p.name != 'supplied-photo-assets-20261008.json')
archive = proof/'koa-nyap-release.tar.gz'
with tarfile.open(archive, 'w:gz', compresslevel=9) as tar:
    for path in (root/'dist').rglob('*'):
        if not path.is_file(): continue
        name = path.relative_to(root).as_posix()
        if '/client/koa/assets/' in name and path.name not in texts: continue
        if path.name.endswith('-ai.jpg') or (path.name.startswith('story-') and path.name.endswith('-original.png')) or path.name == 'programs-community-mobile-generated.png': continue
        tar.add(path, arcname=name)
    tar.add(root/'.openai/hosting.json', arcname='.openai/hosting.json')
with tarfile.open(archive) as tar: names = set(tar.getnames())
images = set()
for lang in ['en','ksw','my','th']:
    for route in ['', 'about','mission','services','advocacy','contact','donate','news','events']:
        html = urllib.request.urlopen('http://127.0.0.1:4193/'+lang+('/'+route if route else '')).read().decode()
        images.update(re.findall(r'<img[^>]+src="([^"]+)"', html))
missing = [src for src in images if src.startswith('/') and 'dist/client'+src not in names]
receipt = {'archive':str(archive),'bytes':archive.stat().st_size,'files':len(names),'checked_images':len(images),'missing_images':missing}
(proof/'nyap-package-check.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8')
print(json.dumps(receipt))
assert not missing
