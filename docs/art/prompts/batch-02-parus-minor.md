# 배치 02 — 박새 P0 그림 프롬프트 (#25, #95)

목적: 메인 화면의 주인공 박새 그림. 배치 01(화풍 테스트)에서 **9장 모두 배가 노랗게** 나와(`style-options.md` 6.3) 프롬프트를 `docs/content/field-marks.md` 1장(그림 거부 기준 6개)대로 다시 썼다.

- 3장 × **후보 2장** = 6장. 같은 프롬프트를 두 번 넣어 두 장을 받는다(일관성 확인, `style-guide.md` 1.4-5).
- 깃: 박새는 계절 깃 차이 출처가 없어 **같은 깃으로 그린다**(field-marks 1장). ID의 `breeding`은 그대로 둔다.
- **둥지 안 새끼(`chick.nest`)는 이번 배치에서 뺀다** — field-marks에 식별 특징 출처가 없다(#95에 요청). 출처가 오면 배치 03에 넣는다.
- 1:1로 받는다. 비율 지시는 도구가 무시한다(`style-guide.md` 1.4-1).

| 저장 파일명 (`assets/inbox/batch-02/`) | 대상 |
|---|---|
| `bird.parus-minor.adult-m.breeding.perch__1.webp` · `__2.webp` | 성조 수컷 |
| `bird.parus-minor.adult-f.breeding.perch__1.webp` · `__2.webp` | 성조 암컷 |
| `bird.parus-minor.juv.perch__1.webp` · `__2.webp` | 어린 새 (이소 후~첫 털갈이) |

프롬프트 = `style-guide.md` 1.3 **공통 블록** + `bird` **꼬리 블록** + 대상 블록. 아래는 이미 붙여 둔 완성형이다.

## 검수 순서 (아트)

1. field-marks 1장 '틀리기 쉬운 것' 6개 — 하나라도 틀리면 그 후보는 탈락(1 배 색, 2 세로줄 끝, 3 암수 굵기, 4 등 색, 5 흰 뺨 둘러싸임, 6 날개띠)
2. 옆모습·왼쪽 향함, 단독, 몸길이 ≈ 캔버스 너비의 0.35, 발끝 아래 여백 8%
3. 화풍 A(1.5 금지 표현), 오른쪽 아래 생성 도구 표시(후처리에서 지움)
4. 통과한 후보에 `review:content`(생태 검토)

---

**성조 수컷** — `bird.parus-minor.adult-m.breeding.perch`
```
watercolor field guide illustration, light flat washes with thin dark ink outlines, muted natural palette of sage green, warm ochre, slate grey and paper off-white, soft even daylight, no texture noise, clean composition, no text, no border, no signature, no watermark — single animal only, strict side profile facing left, whole body visible, plain flat paper off-white background with nothing else, square format — an adult male Japanese tit (Parus minor), NOT a Great tit, perched on a short thin bare twig, the bird small in the frame, about one third of the canvas width, centered, empty space around it. Glossy blue-black crown and nape. Black throat and a black line that fully encircles a large clean white cheek patch, the white cheek is an enclosed island, not open at the back. A small white spot on the back of the neck. Back is blue-grey, with only a faint olive-green tinge where the nape meets the upper back; the back is not green. One clear white wing bar. Underparts greyish-white, no yellow, not buff, not cream. A broad black stripe runs unbroken from the black throat down the centre of the breast and belly all the way to the undertail coverts, widening into a broad black patch between the legs.
```

**성조 암컷** — `bird.parus-minor.adult-f.breeding.perch`
```
watercolor field guide illustration, light flat washes with thin dark ink outlines, muted natural palette of sage green, warm ochre, slate grey and paper off-white, soft even daylight, no texture noise, clean composition, no text, no border, no signature, no watermark — single animal only, strict side profile facing left, whole body visible, plain flat paper off-white background with nothing else, square format — an adult female Japanese tit (Parus minor), NOT a Great tit, perched on a short thin bare twig, the bird small in the frame, about one third of the canvas width, centered, empty space around it. Crown and nape black with little gloss. Black throat and a black line that fully encircles a large clean white cheek patch, the white cheek is an enclosed island, not open at the back. A small white spot on the back of the neck. Back is blue-grey, with only a faint olive-green tinge where the nape meets the upper back; the back is not green. One clear white wing bar. Underparts greyish-white, no yellow, not buff, not cream. A thin narrow black stripe runs unbroken from a small black throat down the centre of the belly to the undertail coverts; the stripe stays thin and does not widen between the legs.
```

**어린 새** — `bird.parus-minor.juv.perch`
```
watercolor field guide illustration, light flat washes with thin dark ink outlines, muted natural palette of sage green, warm ochre, slate grey and paper off-white, soft even daylight, no texture noise, clean composition, no text, no border, no signature, no watermark — single animal only, strict side profile facing left, whole body visible, plain flat paper off-white background with nothing else, square format — a recently fledged juvenile Japanese tit (Parus minor), perched on a short thin bare twig, the bird small in the frame, about one third of the canvas width, centered, empty space around it. Same head and body pattern as the adult, but all the black parts are dull sooty grey-black without gloss. White cheek patch enclosed by the dull dark line. Upperparts tinged olive. Underparts pale yellowish. Conspicuous whitish gape at the corners of the beak. One white wing bar. A dull dark stripe down the centre of the belly.
```
