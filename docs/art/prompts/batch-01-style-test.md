# 배치 01 — 화풍 테스트 프롬프트 (#13, #30)

목적: 시안 A·B·C를 **같은 대상 3장**으로 비교한다. 최종 에셋이 아니므로 생태 검토 전이어도 쓴다.
총 9장(시안 3 × 대상 3). 후보는 대상당 1장이면 충분하다 — 지금 비교하는 것은 화풍이지 그림의 완성도가 아니다.

| 저장 파일명 (`assets/inbox/batch-01/`) | 시안 | 대상 | 비율 |
|---|---|---|---|
| `styletest.A.t1-bird.webp` | A 수채 도감 | 박새 옆모습 | 1:1 |
| `styletest.A.t2-forest.webp` | A | 봄 숲 (새 없이) | 4:5 세로 |
| `styletest.A.t3-snake.webp` | A | 뱀 경보 장면 | 4:5 세로 |
| `styletest.B.t1-bird.webp` | B 평면 벡터 | 박새 옆모습 | 1:1 |
| `styletest.B.t2-forest.webp` | B | 봄 숲 | 4:5 세로 |
| `styletest.B.t3-snake.webp` | B | 뱀 경보 장면 | 4:5 세로 |
| `styletest.C.t1-bird.webp` | C 저녁빛 회화 | 박새 옆모습 | 1:1 |
| `styletest.C.t2-forest.webp` | C | 봄 숲 | 4:5 세로 |
| `styletest.C.t3-snake.webp` | C | 뱀 경보 장면 | 4:5 세로 |

프롬프트는 **[공통 블록] + [대상 블록]** 을 그대로 이어 붙인 것이다. 아래 9개는 이미 붙여 둔 완성형이니 복사해서 바로 넣으면 된다.

---

## 시안 A — 담색 수채 생태도감

**A-T1 박새 옆모습**
```
watercolor field guide illustration, light flat washes with thin dark ink outlines, muted natural palette of sage green, warm ochre, slate grey and paper off-white, soft even daylight, no texture noise, clean composition, no text, no border, no signature — a small songbird in strict side profile facing left, perched on a thin bare branch, whole body visible, black crown and black throat, clean white cheek patch, a narrow black stripe running from the throat down the centre of the whitish belly, grey-green back, one white wing bar, plain paper off-white background, single bird only, square format
```

**A-T2 봄 숲 (새 없이)**
```
watercolor field guide illustration, light flat washes with thin dark ink outlines, muted natural palette of sage green, warm ochre, slate grey and paper off-white, soft even daylight, no texture noise, clean composition, no text, no border, no signature — a temperate deciduous forest in spring, old broadleaf trees with fresh young leaves, leaf litter and bare soil on the ground, open view into the depth of the wood, mid-morning light, horizon line slightly above the middle, simple and uncluttered lower half, no animals, no birds, no people, no buildings, vertical 4:5 format
```

**A-T3 뱀 경보 장면**
```
watercolor field guide illustration, light flat washes with thin dark ink outlines, muted natural palette of sage green, warm ochre, slate grey and paper off-white, soft even daylight, no texture noise, clean composition, no text, no border, no signature — a slender rat snake climbing the trunk of an old tree towards a round nest hole, a small black-and-white songbird on a branch just above it, body low and wings half raised in alarm, tense quiet moment, spring forest behind, no blood, no exaggerated fangs, no glowing eyes, vertical 4:5 format
```

---

## 시안 B — 평면 벡터 자연

**B-T1 박새 옆모습**
```
flat vector illustration, solid color shapes with no gradients, single-step shading, limited palette of five colors — sage green, warm ochre, slate grey, charcoal, off-white, crisp clean edges, no outline, no texture, no text, no border — a small songbird in strict side profile facing left, perched on a thin bare branch, whole body visible, black crown and black throat, clean white cheek patch, a narrow black stripe running from the throat down the centre of the whitish belly, grey-green back, one white wing bar, plain off-white background, single bird only, square format
```

**B-T2 봄 숲 (새 없이)**
```
flat vector illustration, solid color shapes with no gradients, single-step shading, limited palette of five colors — sage green, warm ochre, slate grey, charcoal, off-white, crisp clean edges, no outline, no texture, no text, no border — a temperate deciduous forest in spring, layered tree trunks and simple leaf masses, leaf litter on the ground, mid-morning light, horizon line slightly above the middle, simple and uncluttered lower half, no animals, no birds, no people, no buildings, vertical 4:5 format
```

**B-T3 뱀 경보 장면**
```
flat vector illustration, solid color shapes with no gradients, single-step shading, limited palette of five colors — sage green, warm ochre, slate grey, charcoal, off-white, crisp clean edges, no outline, no texture, no text, no border — a slender rat snake climbing the trunk of an old tree towards a round nest hole, a small black-and-white songbird on a branch just above it, body low and wings half raised in alarm, tense quiet moment, spring forest behind, no blood, no exaggerated fangs, no glowing eyes, vertical 4:5 format
```

---

## 시안 C — 저녁빛 자연 회화

**C-T1 박새 옆모습**
```
soft painterly digital illustration, visible loose brushwork, atmospheric perspective with hazy distance, low warm sunlight from the left, muted natural palette of sage green, warm ochre, slate grey and off-white, no text, no border, no signature — a small songbird in strict side profile facing left, perched on a thin bare branch, whole body visible, black crown and black throat, clean white cheek patch, a narrow black stripe running from the throat down the centre of the whitish belly, grey-green back, one white wing bar, plain soft off-white background, single bird only, square format
```

**C-T2 봄 숲 (새 없이)**
```
soft painterly digital illustration, visible loose brushwork, atmospheric perspective with hazy distance, low warm sunlight from the left, muted natural palette of sage green, warm ochre, slate grey and off-white, no text, no border, no signature — a temperate deciduous forest in spring, old broadleaf trees with fresh young leaves, light falling through the canopy, leaf litter on the ground, horizon line slightly above the middle, simple and uncluttered lower half, no animals, no birds, no people, no buildings, vertical 4:5 format
```

**C-T3 뱀 경보 장면**
```
soft painterly digital illustration, visible loose brushwork, atmospheric perspective with hazy distance, low warm sunlight from the left, muted natural palette of sage green, warm ochre, slate grey and off-white, no text, no border, no signature — a slender rat snake climbing the trunk of an old tree towards a round nest hole, a small black-and-white songbird on a branch just above it, body low and wings half raised in alarm, tense quiet moment, spring forest behind, no blood, no exaggerated fangs, no glowing eyes, vertical 4:5 format
```

---

## 출처 기록 (대표가 알려 주면 아트가 채운다)

| 항목 | 값 |
|---|---|
| 사용 도구·모델 | (대표 댓글) |
| 생성 날짜 | |
| 배치 | 01 |
| 비고 | 화풍 테스트용. 최종 에셋 아님. 박새 식별 특징은 `잠정(#11)` |
