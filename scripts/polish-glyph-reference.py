"""Apply the requested guide removal to the supplied standalone reference only."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'koa-sites-release/dist/koa.html'
s=p.read_text(encoding='utf-8')
old='var pts = samplePoints("KOA", 0, 0, tw, 4, H * 0.4);'
new='var pts = samplePoints("K", -tw * 0.32, 0, tw * 0.28, 4, H * 0.4).concat(samplePoints("A", tw * 0.32, 0, tw * 0.28, 4, H * 0.4));'
if old not in s and new not in s:raise SystemExit('Reference changed: inspect before applying')
s=s.replace(old,new)
marker='/* Glyph-only reference correction: 2026-09-06 */'
if marker not in s:
 s=s.replace('</style>',marker+'\n.wordmark span, .chapter-bg-num--prologue, .halo-ring, .halo-spiral { display: none !important; }\n</style>',1)
p.write_text(s,encoding='utf-8')
print('Reference updated: K/A glyphs only, no O target or visible letter/halo guides.')
