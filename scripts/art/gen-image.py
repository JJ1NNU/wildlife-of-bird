"""Gemini API로 그림 1장을 생성해 PNG로 저장한다 (#179).

키는 환경 변수 GEMINI_API_KEY에서만 읽는다. 키 값은 출력·파일 어디에도 남기지 않는다.

사용:
  python scripts/art/gen-image.py <프롬프트.txt> <출력.png> [--model gemini-2.5-flash-image]

프롬프트 파일은 style-guide.md 1.3 공통 블록까지 붙인 완성형 한 덩어리.
출력은 저장소 밖 원본 폴더(C:/dev/wild-bird-originals/...)에 두고, 후처리(process-bird.py)한 WebP만 저장소에 넣는다.
"""

import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request

API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("prompt_file")
    ap.add_argument("out_png")
    ap.add_argument("--model", default="gemini-2.5-flash-image")
    args = ap.parse_args()

    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        print("GEMINI_API_KEY 환경 변수가 없다", file=sys.stderr)
        return 2

    with open(args.prompt_file, encoding="utf-8") as f:
        prompt = f.read().strip()

    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "1:1"},
        },
    }
    req = urllib.request.Request(
        API.format(model=args.model),
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            res = json.load(r)
    except urllib.error.HTTPError as e:
        # 오류 본문에는 키가 들어 있지 않다(상태·메시지·한도 정보만)
        print(f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:1500]}", file=sys.stderr)
        return 1

    for cand in res.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            data = part.get("inlineData") or part.get("inline_data")
            if data:
                os.makedirs(os.path.dirname(os.path.abspath(args.out_png)), exist_ok=True)
                with open(args.out_png, "wb") as f:
                    f.write(base64.b64decode(data["data"]))
                print(f"저장: {args.out_png} ({data.get('mimeType', '?')}) 모델 {args.model}")
                return 0

    print("이미지가 응답에 없다: " + json.dumps(res, ensure_ascii=False)[:1500], file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
