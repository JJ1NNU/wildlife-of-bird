"""생성 새 그림 후처리 (style-guide.md 5장). 아트가 대표 PC에서 돌리는 오프라인 도구 — 저장소 의존성 아님.

python scripts/art/process-bird.py <원본.png> <출력.webp> --toe-y <발끝 y px> [--ratio 0.35] [--watermark]

1. 표시 지우기: 오른쪽 아래 생성 도구 표시 자리를 같은 높이 왼쪽의 배경 조각으로 덮는다
2. 색 맞추기: 배경 중앙값 → 종이색 #FAF8F2 (채널별 곱), 종이 결은 종이색으로 고른다(알파는 만들지 않는다)
3. 구도: 몸길이(부리~꼬리 끝) = 캔버스 너비 × ratio, 가로 가운데, 발끝 = 위에서 92%.
   원본 가장자리는 종이색으로 페더링해 이어 붙인다(배경을 빼지 않는다, 5.3)
4. 768px WebP 품질 80, 150KB를 넘으면 크기를 줄인다(4장)
"""

import argparse
import io
import statistics

from PIL import Image, ImageChops, ImageDraw, ImageFilter

PAPER = (0xFA, 0xF8, 0xF2)
FINAL = 768
LIMIT = 150 * 1024
FEATHER = 256  # 원본 px


def border_median(im):
    w, h = im.size
    pts = [(x, y) for x in range(0, w, 32) for y in (8, h - 8)]
    pts += [(x, y) for y in range(0, h, 32) for x in (8, w - 8)]
    px = [im.getpixel(p) for p in pts]
    return tuple(statistics.median_low(c[i] for c in px) for i in range(3))


def remove_watermark(im):
    w, h = im.size
    box = (int(w * 0.80), int(h * 0.84), w, int(h * 0.94))
    src = (box[0] - int(w * 0.5), box[1], box[2] - int(w * 0.5), box[3])
    im.paste(im.crop(src), box[:2])


def bird_bbox(im, bg):
    diff = ImageChops.difference(im, Image.new("RGB", im.size, bg)).convert("L")
    mask = diff.point(lambda v: 255 if v > 40 else 0).filter(ImageFilter.MinFilter(5))
    return mask.getbbox()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("out")
    ap.add_argument("--toe-y", type=int, required=True)
    ap.add_argument("--ratio", type=float, default=0.35)
    ap.add_argument("--watermark", action="store_true")
    a = ap.parse_args()

    im = Image.open(a.src).convert("RGB")
    if a.watermark:
        remove_watermark(im)
    bg = border_median(im)
    im = im.point([min(255, round(v * PAPER[c] / bg[c])) for c in range(3) for v in range(256)])

    # 종이 결·얼룩(배경과 차이 8 이하)은 종이색으로 고르고 32까지 서서히 원래 색으로 — 이어 붙인 경계가 안 보이게
    paper = Image.new("RGB", im.size, PAPER)
    diff = ImageChops.difference(im, paper).convert("L").filter(ImageFilter.GaussianBlur(2))
    im = Image.composite(im, paper, diff.point(lambda v: max(0, min(255, (v - 8) * 255 // 24))))

    left, top, right, bottom = bird_bbox(im, PAPER)
    size = round((right - left) / a.ratio)
    ox = round(size / 2 - (left + right) / 2)
    oy = round(size * 0.92 - a.toe_y)

    w, h = im.size
    fade = Image.new("L", (w, h), 255)
    d = ImageDraw.Draw(fade)
    for i in range(FEATHER):
        d.rectangle((i, i, w - 1 - i, h - 1 - i), outline=round(255 * (i + 1) / FEATHER))
    canvas = Image.new("RGB", (size, size), PAPER)
    canvas.paste(im, (ox, oy), fade)

    side = FINAL
    while True:
        buf = io.BytesIO()
        canvas.resize((side, side), Image.LANCZOS).save(buf, "WEBP", quality=80, method=6)
        if buf.tell() <= LIMIT:
            break
        side -= 64
    with open(a.out, "wb") as f:
        f.write(buf.getvalue())
    print(f"{a.out}: bbox {left},{top},{right},{bottom} 캔버스 {size} → {side}px {buf.tell() // 1024}KB")


if __name__ == "__main__":
    main()
