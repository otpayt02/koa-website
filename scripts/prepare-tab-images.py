from pathlib import Path
from PIL import Image

SOURCE = Path(r"C:\Users\olive\.codex\generated_images\01a0542b-94ca-7db0-9bbc-607701a0443e")
DESTINATION = Path(__file__).resolve().parents[1] / "public" / "koa" / "generated" / "tab-images"
FILES = {
    "about-01": "exec-c9237023-8e61-4bf5-a3a6-6af6619e01a9.png", "about-02": "exec-b5ea7d79-fef8-4061-a5bb-67994395b519.png", "about-03": "exec-2fdc2b83-6fa1-4279-a2cb-42e910af1a96.png",
    "programs-01": "exec-f03c0866-86e1-40d3-af89-e8feff4d3d72.png", "programs-02": "exec-02941863-17d2-452c-aa6b-286d209bf47d.png", "programs-03": "exec-6cf88a4f-15f6-412c-8890-47d9ba59bb4c.png",
    "stories-01": "exec-40325824-726f-4f1f-8edf-e3338f40db22.png", "stories-02": "exec-276f44f5-eb32-4a74-a3de-532dddcdee2d.png", "stories-03": "exec-9a37b561-574e-4575-99f0-bdffc27820b3.png",
    "impact-01": "exec-90cc68fa-3bda-4e5e-bf15-93245041282c.png", "impact-02": "exec-7ee2aa48-b99b-4e01-b7fd-5ac4773a8121.png", "impact-03": "exec-c03dde46-0197-40d5-b5e6-d8a75a6fd0a3.png",
    "contact-01": "exec-5ff73a48-bb90-4d16-9a82-83a560bb0a33.png", "contact-02": "exec-909ad767-4ab4-451c-bd01-1a5adb1b2d99.png", "contact-03": "exec-51102a44-d722-4abc-93f9-9fd0e746fab4.png",
    "build-01": "exec-640281fb-313c-4953-8449-9234b057768d.png", "build-02": "exec-47cabc05-2d7a-4100-844a-75ffff6fff51.png", "build-03": "exec-b428f439-43af-4e96-8c9b-133b0e32f4b2.png",
}

DESTINATION.mkdir(parents=True, exist_ok=True)
for name, source_name in FILES.items():
    with Image.open(SOURCE / source_name) as image:
        image = image.convert("RGB")
        image.thumbnail((1440, 960), Image.Resampling.LANCZOS)
        image.save(DESTINATION / f"{name}.webp", "WEBP", quality=80, method=6)
        print(name, image.size)
