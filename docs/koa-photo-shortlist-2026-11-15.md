# KOA photo shortlist: 100 images

The source of truth is [`content/koa-photo-shortlist-100.json`](../content/koa-photo-shortlist-100.json). It records 100 distinct selections, their source or supplied asset, intended route, editorial purpose, and review status. The local visual review sheet is `output/fb-shortlist-100/contact-sheet-100.jpg`; the 90 Facebook review copies and SHA-256 readback are in that same untracked `output` folder. Facebook CDN URLs expire, so durable source links in the manifest point to photo pages rather than temporary image delivery URLs.

## Checked scope

| Facebook surface | Visible thumbnails inspected | Selected |
| --- | ---: | ---: |
| KOA public Photos | 64 | 28 |
| KOA 2nd Congress & election | 36 | 25 |
| Regional conference | 22 | 15 |
| KOA cup | 36 | 14 |
| Karen youth day celebration 2023 | 16 | 8 |
| **Facebook subtotal** | **174** | **90** |
| Previously supplied and approved documentary photos | 10 eligible | 10 |
| **Total shortlist** | | **100** |

Facebook showed a sign-in gate during the public scroll. Its album labels indicate more items than rendered here. These 174 are the visible, checked subset, **not every KOA post or a ranking of every photo on Facebook**. The 100 choices favor recognizable activity, clear subjects, civic learning, governance, regional dialogue, sport, and youth celebration. They exclude text-heavy flyers, letters, obvious repeats, and four supplied assets held for dated archive use.

## Publication boundary

The 90 newly found Facebook images are **review candidates**. Their larger local copies were retrieved for visual review; none was added to `public/` or deployed. Confirm KOA's reuse rights, the relevant people or youth consent, event context, photographer credit, final crop, and alt text before publication. The ten supplied originals already carry approval in `content/supplied-photo-assets-20261008.json`.

The site previously pointed at 13 missing `/koa/assets/` files. This pass replaced those references with existing documentary assets and the authentic seal; captions and alt text that made unsupported event or music claims were revised to describe only visible scenes. The updated text is included in the unapproved translation queue.

## Recreate local review material

The browser-captured `output/fb-*-candidates.json` files are required inputs and are intentionally local. With Python and Pillow available:

```powershell
python scripts/curate-koa-facebook-photos.py
python scripts/download-koa-photo-review.py
```

The first command validates exactly 90 unique Facebook IDs plus 10 approved supplied files. The second fetches up to 960-pixel review copies where Facebook allows it, checks every image, records dimensions and hashes, and builds the 100-image sheet. A full-resolution original from the KOA Page export is still preferable for final website use.
