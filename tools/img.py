"""Convert raw official images in assets/raw/ into optimized WebP in assets/img/.
Usage: python tools/img.py            (raw/ and img/ paths are fixed)
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RAW, OUT = ROOT / 'assets' / 'raw', ROOT / 'assets' / 'img'
OUT.mkdir(parents=True, exist_ok=True)

# (source, output name, max width, max height)
JOBS = [
    ('stories02_kv.jpg', 'kv-1080', 1080, None),
    ('stories02_kv.jpg', 'kv-640', 640, None),
    ('cover-1721-760.webp', 'cover-1721-760', 760, None),
    ('cover-1721-760.webp', 'cover-1721-400', 400, None),
    ('chara_img_sasaki.png', 'chara-sasaki', None, 1100),
    ('chara_img_kawaguchi.png', 'chara-kawaguchi', None, 1100),
    ('chara_img_kuwano.png', 'chara-kuwano', None, 1100),
    ('chara_bg_sasaki.png', 'chara-sasaki-bg', 560, None),
    ('chara_bg_kawaguchi.png', 'chara-kawaguchi-bg', 560, None),
    ('chara_bg_kuwano.png', 'chara-kuwano-bg', 560, None),
    ('thumb_sasaki_on.jpg', 'icon-sasaki', 180, None),
    ('thumb_kawaguchi_on.jpg', 'icon-kawaguchi', 180, None),
    ('thumb_kuwano_on.jpg', 'icon-kuwano', 180, None),
    ('yt-X8QT4C95p4Y.jpg', 'yt-X8QT4C95p4Y-800', 800, None),
    ('yt-X8QT4C95p4Y.jpg', 'yt-X8QT4C95p4Y-1280', 1280, None),
    ('yt-xDsN2cmAlhQ.jpg', 'yt-xDsN2cmAlhQ-800', 800, None),
    ('anime-kv-1400.webp', 'anime-kv-1200', 1200, None),
]

def fit(im, w, h):
    if w and im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    if h and im.height > h:
        im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    return im

for src, name, w, h in JOBS:
    p = RAW / src
    if not p.exists():
        print('missing', src); continue
    im = Image.open(p)
    im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
    im = fit(im, w, h)
    dst = OUT / f'{name}.webp'
    im.save(dst, 'WEBP', quality=80, method=6)
    print(f'{name}.webp', im.size, dst.stat().st_size // 1024, 'KB')
