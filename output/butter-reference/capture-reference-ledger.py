from pathlib import Path
import re, hashlib, shutil, json

project = Path(r'C:\Users\olive\Projects\koa-website')
release = Path(r'C:\Users\olive\Projects\koa-remote-design-audit\sites-release-clean-20261005')
archive = project / 'versions/meta-artifacts-20261008'
archive.mkdir(exist_ok=True)
sources = list((project / 'versions').glob('koa_butter_style_*.html')) + list((project / 'versions').glob('koa_mid_style_*.html'))
downloaded = [p for p in Path(r'C:\Users\olive\Downloads').glob('*.html') if p.stat().st_mtime > 1791502800]
seen = set(); records = []
for p in sources + downloaded:
    raw = p.read_bytes(); digest = hashlib.sha256(raw).hexdigest()
    if digest in seen: continue
    seen.add(digest)
    if p in downloaded:
        shutil.copy2(p, archive / p.name)
    text = re.sub(r'data:[^\s"\x27)]+', '[inline asset]', raw.decode('utf-8', errors='replace'))
    styles = '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', text, re.S))
    # React artifacts keep application CSS inside a template literal after their framework bundle.
    marker = text.find(':root{', text.find('const Nr') if 'const Nr' in text else 0)
    if marker >= 0: styles += '\n' + text[marker:marker + 50000]
    fonts = sorted(set(re.findall(r'(?:font-family|fontFamily)\s*[:=]\s*([^;}\n]+)', styles)))
    colors = sorted(set(re.findall(r'#[0-9a-fA-F]{6}\b', styles)))
    durations = sorted(set(re.findall(r'\b(?:animation|transition)[^;\n]{0,160}', styles)))
    records.append({'file':str(archive / p.name) if p in downloaded else str(p), 'sha256':digest,'bytes':len(raw),'fonts':fonts[:12],'colors':colors[:40],'motion':durations[:20]})
out = release / 'docs/koa-butter-reference-inventory.json'
out.write_text(json.dumps({'captured':'2026-10-08','source':'https://www.meta.ai/artifacts','coverage':'All KOA HTML cards visible in the loaded artifact library were downloaded, including route-specific artifacts. Batch timed out on later unrelated artifacts; not a complete account archive. Identical files deduplicated by SHA-256. Source-code observations are not screenshot measurements.','references':records},ensure_ascii=False,indent=2),encoding='utf-8')
for item in records:
    print(Path(item['file']).name, item['sha256'][:10], ', '.join(item['fonts'])[:130], 'colors', ','.join(item['colors'][:8]))
