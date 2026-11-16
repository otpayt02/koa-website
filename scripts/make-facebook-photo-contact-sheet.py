"""Build a local review sheet from a browser-captured Facebook photo list.

Input JSON is produced from visible public photo links. CDN URLs expire; this
script saves only small thumbnails for editorial review, outside public/.
"""

import json
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image, ImageDraw, ImageFont, ImageOps


source = Path(sys.argv[1])
destination = Path(sys.argv[2])
destination.mkdir(parents=True, exist_ok=True)
records = json.loads(source.read_text(encoding="utf-8"))


def fetch(record):
    url = record.get("thumbnailUrl")
    if not url:
        return record["index"], None, "missing_thumbnail_url"
    try:
        request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(request, timeout=20) as response:
            if not response.headers.get("Content-Type", "").startswith("image/"):
                raise ValueError("Response is not an image")
            data = response.read(2_000_001)
        if len(data) > 2_000_000:
            raise ValueError("Thumbnail exceeds 2 MB")
        image = Image.open(BytesIO(data))
        image.load()
        image = image.convert("RGB")
        image.save(destination / f"{record['index']:03d}.jpg", quality=85)
        return record["index"], image, None
    except Exception as exc:
        return record["index"], None, str(exc)


results = {}
with ThreadPoolExecutor(max_workers=8) as pool:
    for future in as_completed(pool.submit(fetch, record) for record in records):
        index, image, error = future.result()
        results[index] = (image, error)

columns = 8
cell_width, cell_height = 220, 258
rows = (len(records) + columns - 1) // columns
sheet = Image.new("RGB", (columns * cell_width, rows * cell_height), "#f5f1e8")
draw = ImageDraw.Draw(sheet)
font = ImageFont.load_default()
for record in records:
    index = record["index"]
    x = ((index - 1) % columns) * cell_width
    y = ((index - 1) // columns) * cell_height
    image, error = results[index]
    if image:
        thumb = ImageOps.contain(image, (206, 206))
        sheet.paste(thumb, (x + (cell_width - thumb.width) // 2, y + 4))
    else:
        draw.text((x + 8, y + 30), "Unavailable", fill="#8e2230", font=font)
    draw.text((x + 7, y + 213), f"{index:02d}  {record.get('alt', '')[:29]}", fill="#10203c", font=font)
    draw.rectangle((x, y, x + cell_width - 1, y + cell_height - 1), outline="#d4cec2")

sheet.save(destination / "contact-sheet.jpg", quality=89)
failures = [{"index": record["index"], "error": results[record["index"]][1]} for record in records if results[record["index"]][1]]
(destination / "download-failures.json").write_text(json.dumps(failures, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"{len(records)} candidates; {len(records) - len(failures)} thumbnails; {len(failures)} failures")
print(destination / "contact-sheet.jpg")
