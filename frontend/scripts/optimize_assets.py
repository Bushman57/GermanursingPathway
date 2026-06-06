"""One-off asset optimizer: compress PNG/JPEG and emit WebP variants."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parents[1] / "src" / "assets"
PUBLIC = Path(__file__).resolve().parents[1] / "public"

PNG_MAX_SIDE = 512
JPEG_QUALITY = 82
WEBP_QUALITY = 80


def _resize_if_large(img: Image.Image, max_side: int) -> Image.Image:
    w, h = img.size
    if max(w, h) <= max_side:
        return img
    scale = max_side / max(w, h)
    return img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)


def optimize_png(path: Path, *, max_side: int = PNG_MAX_SIDE) -> None:
    img = Image.open(path)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA")
    img = _resize_if_large(img, max_side)
    img.save(path, optimize=True, compress_level=9)
    webp_path = path.with_suffix(".webp")
    save_img = img.convert("RGB") if img.mode == "RGBA" else img
    save_img.save(webp_path, "WEBP", quality=WEBP_QUALITY, method=6)
    print(f"PNG  {path.name}: {path.stat().st_size // 1024} KB, webp {webp_path.stat().st_size // 1024} KB")


def optimize_jpeg(path: Path, *, max_side: int | None = 1920) -> None:
    img = Image.open(path).convert("RGB")
    if max_side:
        img = _resize_if_large(img, max_side)
    img.save(path, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    webp_path = path.with_suffix(".webp")
    img.save(webp_path, "WEBP", quality=WEBP_QUALITY, method=6)
    print(f"JPEG {path.name}: {path.stat().st_size // 1024} KB, webp {webp_path.stat().st_size // 1024} KB")


def write_favicon(source: Path) -> None:
    img = Image.open(source)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA")
    img = _resize_if_large(img, 64)
    favicon_png = PUBLIC / "favicon.png"
    favicon_webp = PUBLIC / "favicon.webp"
    img.save(favicon_png, "PNG", optimize=True)
    img.convert("RGB").save(favicon_webp, "WEBP", quality=85)
    print(f"Favicon: png {favicon_png.stat().st_size // 1024} KB")


def main() -> int:
    optimize_png(ASSETS / "logo.png", max_side=256)
    optimize_png(ASSETS / "image_hero.png", max_side=1920)
    for pattern in ("**/*.jpg", "**/*.jpeg"):
        for path in ASSETS.glob(pattern):
            optimize_jpeg(path)
    write_favicon(ASSETS / "logo.webp" if (ASSETS / "logo.webp").exists() else ASSETS / "logo.png")
    unused = ASSETS / "german-universities.png"
    if unused.exists():
        unused.unlink()
        print("Removed unused german-universities.png")
    return 0


if __name__ == "__main__":
    sys.exit(main())
