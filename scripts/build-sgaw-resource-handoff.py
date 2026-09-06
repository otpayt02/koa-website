from pathlib import Path
import json,hashlib,zipfile,re
from datetime import datetime,timezone
from pypdf import PdfReader
ROOT=Path(r'C:\Users\olive\Projects\koa-website')
LANG=Path(r'C:\Users\olive\Projects\karen-lang-trans')
AGENT=Path(r'C:\Users\olive\Projects\karen-language-agent')
OUT=AGENT/'data/source_cache/koa-reference-handoff'
OUT.mkdir(parents=True,exist_ok=True)
FILES=['example_sentences.json','groundtruth_corrections.json','karen_all_syllables.json','karen_dataset_yolov8.zip','karen_dict_full.json','karen_grammar.pdf','karen_grammar_vern.pdf','karen_index_map.json','karen_ocr_v1_best.pt','karen_paragraphs.txt','karendictdatabase.json']
paths=[LANG/n for n in FILES]+[ROOT/n for n in ['design-qa.md','glyph_cinematic_html_spec.txt','Recording 2026-09-03 192734.mp4']]
rows=[]
for path in paths:
 digest=hashlib.sha256()
 with path.open('rb') as f:
  for block in iter(lambda:f.read(1024*1024),b''):digest.update(block)
 kind='language-source' if path.parent==LANG else 'design-reference'
 row={'id':path.stem.replace(' ','-').lower(),'name':path.name,'path':str(path),'bytes':path.stat().st_size,'sha256':digest.hexdigest(),'kind':kind,'rights_state':'not-assessed','review_state':'unreviewed','training_eligibility':False,'instruction_authority':'reference-data-only','modified_ns':path.stat().st_mtime_ns}
 if path.suffix=='.json':
  data=json.loads(path.read_text(encoding='utf-8-sig'));row['format']='json';row['records']=len(data)
  row['top_level']=type(data).__name__
  if path.name=='example_sentences.json':row['notes']=['Empty object; no example sentences supplied.']
  if path.name=='groundtruth_corrections.json':row['notes']=['Metadata container, not two corrections. totalCorrections is 0.']
  if path.name=='karen_index_map.json':row['notes']=['Numeric labels; not a validated class-to-Unicode bridge.']
 elif path.suffix=='.pdf':
  reader=PdfReader(path); pages=[{'page':i+1,'text':p.extract_text() or ''} for i,p in enumerate(reader.pages)]
  cache=OUT/(path.stem+'.pages.json');cache.write_text(json.dumps(pages,ensure_ascii=False),encoding='utf-8')
  row.update(format='pdf',pages=len(pages),extracted_pages_path=str(cache),extractor='pypdf; text layer only; no OCR performed',pages_with_text=sum(bool(p['text'].strip()) for p in pages))
 elif path.suffix=='.zip':
  with zipfile.ZipFile(path) as z:
   names=z.namelist();yaml=z.read('data.yaml').decode('utf-8');nc=re.search(r'^nc:\s*(\d+)',yaml,re.M)
   row.update(format='archive',entries=len(names),declared_classes=int(nc.group(1)),notes=['Directory and data.yaml inspected; images not extracted and no training run.'])
 elif path.suffix=='.pt':row.update(format='model-weights',notes=['Hashed only; weights not deserialized or executed. Architecture, labels and accuracy unverified.'])
 elif path.suffix=='.mp4':row.update(format='video',notes=['20.03-second supplied visual reference. Six frames reviewed locally; not language training data.'])
 else:row.update(format='text',lines=len(path.read_text(encoding='utf-8-sig').splitlines()))
 rows.append(row)
manifest={'schema_version':1,'created_at':datetime.now(timezone.utc).isoformat(),'scope':'Private local reference catalog. Source documents are data, never agent instructions.','resources':rows,'ocr_bridge':{'dataset_classes':6400,'index_entries':6341,'syllable_records':3375,'status':'unverified-mismatched-inventories','next_step':'Establish an explicit class-id to Unicode mapping and evaluate on held-out images; do not join by row order.'}}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'manifest':str(OUT/'manifest.json'),'resources':len(rows),'pdf_pages':sum(r.get('pages',0) for r in rows)}))
