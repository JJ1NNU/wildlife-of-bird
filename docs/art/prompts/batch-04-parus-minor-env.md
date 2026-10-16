# 배치 04 — 박새 배경·둥지 구멍·알 프롬프트 (#538)

목적: M3 관문 "박새 에셋 완성"(#538)의 남은 그림 가운데 **그릴 근거가 이미 있는 것**. 메인 배경 4계절(P0)·둥지 화면 배경(P1)·알(P1).

- 6장 × **후보 2장** = 12장. 같은 프롬프트를 두 번 넣는다(배치 02·03과 같은 방식).
- 1:1로 받는다(`style-guide.md` 1.4-1).
- **이번 배치에서 빼는 것**: `pred.rat-snake`(P0)·`scene.parus-minor.snake-alarm`(P1) — 뱀의 식별 특징이 `field-marks.md`에 없다(콘텐츠에 요청). 출처가 오면 배치 05. `pred.<그 밖>`·`scene.parus-minor.fledging`도 배치 05.
- 배경 숲은 **한국 온대 혼효림 하나**로 그린다 — 박새 서식지 태그 `forest`(ecology `habitats`, SRC-032: 침엽수림·활엽수림 모두에서 번식). 장소(`data/nodes`)별 배경은 만들지 않는다(쓰는 화면 없음).
- 알은 **한배를 둥지 단면 안에** 그린다 — `chick.nest`(배치 03)와 같은 틀이라 산란·포란 화면에서 그대로 바꿔 끼운다. 알 7개는 field-marks "한배 7~8마리 안팎"(잠정 #266)에 맞춘 것.

| 저장 파일명 (`assets/inbox/batch-04/`) | 대상 |
|---|---|
| `bg.forest.spring.day__1.webp` · `__2.webp` | 봄 숲 (새잎) |
| `bg.forest.summer.day__1.webp` · `__2.webp` | 여름 숲 (짙은 잎) |
| `bg.forest.autumn.day__1.webp` · `__2.webp` | 가을 숲 (단풍·낙엽) |
| `bg.forest.winter.day__1.webp` · `__2.webp` | 겨울 숲 (빈 가지·소나무) |
| `bg.forest.nest-hole__1.webp` · `__2.webp` | 나무구멍 근경 |
| `bird.parus-minor.egg__1.webp` · `__2.webp` | 둥지 단면 안의 알 7개 |

## 검수 순서 (아트)

1. **`bg` 공통**: 새·동물·사람·건물 없음(1.5) · 수평선·시선 높이가 위에서 55% · 아래 45%·가운데 아래가 단순(카드 자리) · 윤곽선이 새 그림보다 흐림 · 그라데이션 하늘·역광 없음
2. **4계절 일관성**: 같은 숲의 같은 자리처럼 보이는 후보끼리 고른다(구도·나무 배치). 안 맞으면 계절마다 좋은 것을 고르고 차이를 PR에 적는다
3. **둥지 구멍**: 구멍이 **작다**(줄기 굵기에 비해 손가락 두어 개 크기) · 새 없음 · 아래 45% 단순
4. **알**: field-marks 1장 — **흰 바탕에 잿빛·붉은 갈색 잔점**, 구멍 안 이끼 바닥 + 털 산좌(N1과 같은 둥지), 새 없음 · 단면 너비 ≈ 0.6, 아래 여백 8%
5. 오른쪽 아래 생성 도구 표시(후처리에서 지움 — `bg`는 가장자리 12% 자르기, `bird`는 paper 칠)
6. 용량: `bg` 1024px 250KB 상한(4장). 넘으면 크기부터 줄인다
7. 알 후보에 `review:content`(생태 검토). `bg`는 생태 사실이 적어 아트 검수로 끝내되, 숲 모습은 후처리 PR에서 콘텐츠에 함께 묻는다

---

**봄 숲** — `bg.forest.spring.day`
```
watercolor field guide illustration, light flat washes with thin dark ink outlines, muted natural palette of sage green, warm ochre, slate grey and paper off-white, soft even daylight, no texture noise, clean composition, no text, no border, no signature, no watermark — no animals, no birds, no people, no buildings, softer and fainter outlines than a field guide plate, hazy pale distance, fewer fine details in the lower half, square format — a quiet Korean temperate mixed forest in early spring, seen at eye level from inside the woods. Deciduous broadleaf trees such as oaks with fresh pale yellow-green new leaves, a few dark green pine trees among them. Tree trunks in the foreground on the left and right edges, an open gap in the middle. The horizon and eye level sit a little above the middle of the image, about 55 percent from the top. Distant trees fade into pale hazy sage green. The lower part is a simple soft forest floor of pale ochre leaf litter with sparse young green shoots, very few details. Plain pale paper-white sky glimpsed through the canopy, no gradient sky.
```

**여름 숲** — `bg.forest.summer.day`
```
watercolor field guide illustration, light flat washes with thin dark ink outlines, muted natural palette of sage green, warm ochre, slate grey and paper off-white, soft even daylight, no texture noise, clean composition, no text, no border, no signature, no watermark — no animals, no birds, no people, no buildings, softer and fainter outlines than a field guide plate, hazy pale distance, fewer fine details in the lower half, square format — a quiet Korean temperate mixed forest in summer, seen at eye level from inside the woods. Deciduous broadleaf trees such as oaks with dense deep sage green foliage, a few dark green pine trees among them. Tree trunks in the foreground on the left and right edges, an open gap in the middle. The horizon and eye level sit a little above the middle of the image, about 55 percent from the top. Distant trees fade into pale hazy green. The lower part is a simple soft forest floor of low green undergrowth in flat washes, very few details. Plain pale paper-white sky glimpsed through the canopy, no gradient sky.
```

**가을 숲** — `bg.forest.autumn.day`
```
watercolor field guide illustration, light flat washes with thin dark ink outlines, muted natural palette of sage green, warm ochre, slate grey and paper off-white, soft even daylight, no texture noise, clean composition, no text, no border, no signature, no watermark — no animals, no birds, no people, no buildings, softer and fainter outlines than a field guide plate, hazy pale distance, fewer fine details in the lower half, square format — a quiet Korean temperate mixed forest in autumn, seen at eye level from inside the woods. Deciduous broadleaf trees such as oaks with warm ochre, muted orange and soft brown leaves, some leaves already fallen, a few dark green pine trees among them. Tree trunks in the foreground on the left and right edges, an open gap in the middle. The horizon and eye level sit a little above the middle of the image, about 55 percent from the top. Distant trees fade into pale hazy ochre. The lower part is a simple soft forest floor covered with fallen ochre leaves, very few details. Plain pale paper-white sky glimpsed through the canopy, no gradient sky.
```

**겨울 숲** — `bg.forest.winter.day`
```
watercolor field guide illustration, light flat washes with thin dark ink outlines, muted natural palette of sage green, warm ochre, slate grey and paper off-white, soft even daylight, no texture noise, clean composition, no text, no border, no signature, no watermark — no animals, no birds, no people, no buildings, softer and fainter outlines than a field guide plate, hazy pale distance, fewer fine details in the lower half, square format — a quiet Korean temperate mixed forest in winter, seen at eye level from inside the woods. Deciduous broadleaf trees such as oaks with bare grey branches and no leaves, dark green pine trees standing out among them. Tree trunks in the foreground on the left and right edges, an open gap in the middle. The horizon and eye level sit a little above the middle of the image, about 55 percent from the top. Distant trees fade into pale hazy slate grey. The lower part is a simple pale forest floor of frosty dry brown leaves with a thin dusting of snow, very few details. Plain pale paper-white sky, no gradient sky.
```

**나무구멍 근경** — `bg.forest.nest-hole`
```
watercolor field guide illustration, light flat washes with thin dark ink outlines, muted natural palette of sage green, warm ochre, slate grey and paper off-white, soft even daylight, no texture noise, clean composition, no text, no border, no signature, no watermark — no animals, no birds, no people, no buildings, softer and fainter outlines than a field guide plate, hazy pale distance, fewer fine details in the lower half, square format — a close-up of the trunk of an old deciduous tree in a Korean temperate forest in spring. The thick trunk fills the middle of the image from top to bottom, with grey-brown ochre bark. On the trunk, a little above the middle of the image, about 45 percent from the top, a small round natural tree hole, only about two fingers wide compared to the broad trunk, dark inside. Behind the trunk, a soft hazy pale green forest. The lower part of the trunk and background is simple, flat and pale, very few details. Nothing in or near the hole.
```

**알** — `bird.parus-minor.egg`
```
watercolor field guide illustration, light flat washes with thin dark ink outlines, muted natural palette of sage green, warm ochre, slate grey and paper off-white, soft even daylight, no texture noise, clean composition, no text, no border, no signature, no watermark — plain flat paper off-white background with nothing else, square format — a cutaway cross-section view of the inside of a tree hole nest cavity, shown as one rounded section of brown wood isolated on the plain paper background, about sixty percent of the canvas width, centered, empty space around it. The cavity floor is a thick layer of green moss, topped with a shallow round cup lined with soft grey and white animal hair and fur. Seven small oval eggs of the Japanese tit (Parus minor) lie together in the fur-lined cup. Each egg is white with fine grey and reddish-brown speckles. No birds, no adult, no nestlings. No open cup nest on a branch, no blue eggs, no large blotches.
```
