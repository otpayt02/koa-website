"""Save larger copies of selected public Facebook photos for local review only."""

import hashlib
import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image, ImageDraw, ImageFont, ImageOps


root = Path(__file__).resolve().parents[1]
destination = root / "output" / "fb-shortlist-100"
destination.mkdir(parents=True, exist_ok=True)
selected = json.loads((root / "content" / "koa-photo-shortlist-100.json").read_text(encoding="utf-8"))
sources = {}
for filename in ("fb-public-candidates.json", "fb-congress-candidates.json", "fb-regional-candidates.json", "fb-cup-candidates.json", "fb-youth-candidates.json"):
    for row in json.loads((root / "output" / filename).read_text(encoding="utf-8")):
        match = re.search(r"fbid=(\d+)", row["photoUrl"])
        if match:
            sources[match.group(1)] = row["thumbnailUrl"]


def fetch(record):
    photo_id = record["id"].removeprefix("facebook-")
    path = destination / f"{photo_id}.jpg"
    try:
        if path.exists():
            data = path.read_bytes()
        else:
            last_error = None
            for size in (960, 640, 417, 206):
                url = re.sub(r"ctp=s\d+x\d+", f"ctp=s{size}x{size}", sources[photo_id])
                request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
                try:
                    with urlopen(request, timeout=25) as response:
                        if not response.headers.get("Content-Type", "").startswith("image/"):
                            raise ValueError("Response is not an image")
                        data = response.read(5_000_001)
                    break
                except Exception as exc:
                    last_error = exc
            else:
                raise last_error or ValueError("No image size available")
        if len(data) > 5_000_000:
            raise ValueError("Image exceeds 5 MB review limit")
        image = Image.open(BytesIO(data))
        image.load()
        path.write_bytes(data)
        return {"id": record["id"], "file": path.name, "bytes": len(data), "width": image.width, "height": image.height, "sha256": hashlib.sha256(data).hexdigest(), "status": "saved_for_local_review"}
    except Exception as exc:
        return {"id": record["id"], "status": "unavailable", "error": str(exc)}


results = []
with ThreadPoolExecutor(max_workers=8) as pool:
    futures = [pool.submit(fetch, row) for row in selected if row["id"].startswith("facebook-")]
    for future in as_completed(futures):
        results.append(future.result())

results.sort(key=lambda row: row["id"])
(destination / "media-readback.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
success = [row for row in results if row["status"] == "saved_for_local_review"]
print(f"{len(success)}/{len(results)} larger photos saved; {sum(row['bytes'] for row in success):,} bytes")

sheet = Image.new("RGB", (10 * 196, 10 * 170), "#f5f1e8")
draw = ImageDraw.Draw(sheet)
font = ImageFont.load_default()
for index, record in enumerate(selected):
    x, y = (index % 10) * 196, (index // 10) * 170
    path = destination / f"{record['id'].removeprefix('facebook-')}.jpg" if record["id"].startswith("facebook-") else root / "public" / record["assetPath"].lstrip("/")
    if path.exists():
        with Image.open(path) as original:
            thumb = ImageOps.contain(original.convert("RGB"), (188, 140))
        sheet.paste(thumb, (x + (196 - thumb.width) // 2, y + 3))
    draw.text((x + 5, y + 145), f"{index + 1:03d} {record['suggestedRoute'][:16]}", fill="#10203c", font=font)
    draw.rectangle((x, y, x + 195, y + 169), outline="#d4cec2")
sheet.save(destination / "contact-sheet-100.jpg", quality=88)
print(destination / "contact-sheet-100.jpg")
