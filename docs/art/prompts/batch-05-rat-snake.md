# 배치 05 — 뱀(구렁이) 포식자·뱀 경보 장면 프롬프트 (#538)

목적: M3 관문 "박새 에셋 완성"(#538)의 뱀 그림. 배치 04에서 식별 특징이 없어 뺀 두 장이다. 근거는 `docs/content/field-marks.md` 5장(#566, PR #569).

- 2장 × **후보 2장** = 4장. 같은 프롬프트를 두 번 넣는다(배치 02~04와 같은 방식).
- 1:1로 받는다(`style-guide.md` 1.4-1). 장면은 1:1에서 가운데 가로 80%를 잘라 4:5로 만든다.
- **구렁이(*Elaphe schrenckii*) 한 종, 어른 뱀만**, 등은 **암갈색~검은색**(field-marks 5장 추천) — 유혈목이를 섞지 않는다(S4).
- 프롬프트에 "Amur rat snake (Elaphe schrenckii), Korea"를 쓰고 "rat snake"만 쓰지 않는다(field-marks 팁 — 북미 쥐잡이뱀이 나온다). 거부 기준 S1~S5를 부정어로 넣는다.
- `pred`의 몸길이 비율: 뱀은 길어 2장 표의 비율을 그대로 못 쓴다 → **느슨한 S자로 굽혀 캔버스 너비 약 0.85 안**에 온몸을 넣는다(잠정 #538 — 뱀과 새를 같은 크기로 비교하는 화면은 없다).
- 이번 배치에서 빼는 것: `pred.<그 밖>`(상성 묶음별 포식자 — 식별 특징 없음)·`scene.parus-minor.fledging`(P2).

| 저장 파일명 (`assets/inbox/batch-05/`) | 대상 |
|---|---|
| `pred.rat-snake__1.webp` · `__2.webp` | 구렁이 단독(옆모습, 왼쪽 향함) |
| `scene.parus-minor.snake-alarm__1.webp` · `__2.webp` | 줄기를 타고 둥지 구멍에 머리를 들이미는 구렁이 + 가지에서 경보하는 박새 |

## 검수 순서 (아트)

1. **S1 머리**: 세모난 큰 머리·세로 눈동자·짧고 뭉툭한 몸이면 거부. 머리는 목보다 조금 넓은 정도, 눈동자 둥글게
2. **S2·S4 색**: 등이 암갈~검정, 무늬는 흐린 가로띠 정도 · 배는 황백~회백 · **주황·빨강·초록·노랑 줄무늬·화려한 고리가 있으면 거부**
3. **S3 크기**(장면): 뱀이 박새보다 **훨씬 크고 굵다**(몸길이 열 배 이상)
4. **S5 둥지**(장면): 뱀은 **작은 나무구멍**에 머리를 넣는다 — 가지 위 열린 둥지·둥지를 부수는 그림이면 거부. 구멍은 `bg.forest.nest-hole`(배치 04)처럼 작게
5. **장면 박새**: field-marks 1장(검은 머리·흰 뺨·검은 세로줄·**흰 배, 노란 배 아님**) · 가까운 가지에서 뱀을 향해 몸을 낮추고 날개를 반쯤 든 경보 자세 · 둥지 밖. 주인공 새는 잘린 뒤 기준 왼쪽 1/3, 뱀·구멍은 가운데 80% 안
6. **장면 긴장**: 피·송곳니 과장·빛나는 눈 없음(style-guide 1장 `scene`). 긴장은 화면의 배경 명도·경고색이 만든다
7. 오른쪽 아래 생성 도구 표시(후처리에서 지움 — `pred`는 paper 칠, `scene`은 가장자리 12% 자르기)
8. 용량: `pred` 768px 150KB · `scene` 1024px 200KB
9. 두 장 모두 `review:content`(생태 검토 — 거부 기준 S1~S5)

---

**구렁이** — `pred.rat-snake`
```
watercolor field guide illustration, light flat washes with thin dark ink outlines, muted natural palette of sage green, warm ochre, slate grey and paper off-white, soft even daylight, no texture noise, clean composition, no text, no border, no signature, no watermark — single animal only, strict side profile facing left, whole body visible, plain flat paper off-white background with nothing else, square format — an adult Amur rat snake (Elaphe schrenckii) of Korea, a large, long and thick-bodied non-venomous snake, lying in a loose relaxed S-curve across about 85 percent of the canvas width, head on the left. Back is uniform dark brown to blackish, with only faint, blurry pale yellowish crossbands, not sharp. Belly is pale yellowish-white to greyish-white with scattered dark brown spots. Head only slightly wider than the neck, smooth and rounded, not triangular, round pupils, thin dark vertical lines on the lip scales. Plain, calm, not menacing. No orange, no red, no bright green, no yellow stripes, no bright rings or saddle pattern, no corn snake, no viper, no triangular head, no slit pupils, no open mouth, no fangs, no tongue flicking.
```

**뱀 경보 장면** — `scene.parus-minor.snake-alarm`
```
watercolor field guide illustration, light flat washes with thin dark ink outlines, muted natural palette of sage green, warm ochre, slate grey and paper off-white, soft even daylight, no texture noise, clean composition, no text, no border, no signature, no watermark — no blood, no exaggerated fangs, no glowing eyes, no people, square format — spring in a quiet Korean temperate forest. A thick old deciduous tree trunk with grey-brown bark stands slightly right of center. A large adult Amur rat snake (Elaphe schrenckii) of Korea, long and thick-bodied, uniform dark brown to blackish with only faint blurry pale crossbands, pale yellowish-white belly, is climbing the trunk, its body wrapped loosely around the bark, its rounded head (not triangular) pushing into a small round natural tree hole on the trunk, the hole only about two fingers wide compared to the broad trunk. On a nearby branch on the left side, a small Japanese tit (Parus minor) faces the snake in alarm: glossy black head and throat, large white cheek patches, a black stripe down the middle of a white belly (white belly, not yellow, not buff), grey back with a faint green tinge, body held low, wings half raised, beak open in an alarm call. The bird is outside the nest, much smaller than the snake. All main elements stay inside the central 80 percent of the width. Soft hazy pale green forest behind. Tense but calm, documentary feeling. No orange, no red, no bright green or yellow pattern on the snake, no viper, no open cup nest on a branch, no snake breaking a nest, no blood, no eggs or chicks shown.
```
