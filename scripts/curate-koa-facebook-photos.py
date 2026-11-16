"""Build the sourced 100-photo KOA editorial shortlist from review sheets.

The new Facebook photos remain review-only. This script does not publish media.
"""

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCES = [
    # file, album, route, editorial purpose, contact-sheet indices
    ("fb-public-candidates.json", "KOA public Photos", "advocacy", "Civic learning, meetings, and community leadership", [3, 10, 11, 12, 14, 16, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 32, 33, 34, 35, 36, 37, 38, 41, 42, 47]),
    ("fb-congress-candidates.json", "KOA 2nd Congress & election", "about", "Governance, discussion, and organizational history", [1, 2, 3, 4, 5, 6, 7, 9, 11, 13, 14, 15, 16, 17, 18, 19, 21, 23, 25, 26, 27, 29, 32, 33, 36]),
    ("fb-regional-candidates.json", "Regional conference", "community", "Regional dialogue and community leadership", [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 18, 20]),
    ("fb-cup-candidates.json", "KOA cup", "community", "Sport, connection, and youth participation", [1, 2, 4, 6, 7, 8, 13, 17, 20, 23, 26, 28, 29, 34]),
    ("fb-youth-candidates.json", "Karen youth day celebration 2023", "community", "Youth celebration and cultural connection", [1, 2, 3, 6, 7, 11, 13, 15]),
]

shortlist = []
seen = set()
for filename, album, route, purpose, selected in SOURCES:
    rows = {row["index"]: row for row in json.loads((ROOT / "output" / filename).read_text(encoding="utf-8"))}
    for index in selected:
        row = rows[index]
        match = re.search(r"fbid=(\d+)", row["photoUrl"])
        if not match:
            raise ValueError(f"Missing Facebook photo ID: {row['photoUrl']}")
        photo_id = match.group(1)
        if photo_id in seen:
            raise ValueError(f"Duplicate Facebook photo ID: {photo_id}")
        seen.add(photo_id)
        shortlist.append({
            "id": f"facebook-{photo_id}",
            "source": "KOA Facebook public photo or album",
            "sourceAlbum": album,
            "sourceUrl": row["photoUrl"],
            "contactSheetIndex": index,
            "suggestedRoute": route,
            "editorialPurpose": purpose,
            "altDraft": None,
            "eventDate": None,
            "rightsStatus": "KOA page; full-resolution reuse and subject consent to confirm",
            "reviewStatus": "pending_photo_and_context_review",
            "publicReady": False,
        })

approved = json.loads((ROOT / "content" / "supplied-photo-assets-20261008.json").read_text(encoding="utf-8"))
for row in approved:
    if row["status"] != "Approved supplied documentary asset":
        continue
    shortlist.append({
        "id": f"supplied-{row['file'].rsplit('.', 1)[0]}",
        "source": row["source"],
        "sourceAlbum": None,
        "sourceUrl": None,
        "assetPath": f"/koa/assets/{row['file']}",
        "sha256": row["sha256"],
        "suggestedRoute": row["destination"],
        "editorialPurpose": row["description"],
        "altDraft": row["description"],
        "eventDate": None,
        "rightsStatus": row["status"],
        "reviewStatus": "supplied_and_approved",
        "publicReady": True,
    })

if len(shortlist) != 100 or len(seen) != 90:
    raise ValueError(f"Expected 90 Facebook and 10 supplied photos; got {len(seen)} and {len(shortlist) - len(seen)}")

out = ROOT / "content" / "koa-photo-shortlist-100.json"
out.write_text(json.dumps(shortlist, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {len(shortlist)} photo records to {out}")
