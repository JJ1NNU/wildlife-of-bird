# 배치 03 — 박새 둥지 안 새끼 프롬프트 (#25, #95)

목적: 둥지 단계 화면의 박새 새끼 그림(`bird.parus-minor.chick.nest`, P0). 콘텐츠가 `docs/content/field-marks.md` 1장에 둥지 안 새끼 특징과 거부 기준 N1~N3을 채웠다(#167, #177).

- 1장 × **후보 2장**. 같은 프롬프트를 두 번 넣는다(배치 02와 같은 방식).
- **그리는 단계: 깃이 거의 다 난 단계(부화 약 2주)** — field-marks '대표 그림 추천'. 맨살 단계는 박새로 알아보기 어렵다. 깃 무늬는 '어린 새' 행(검정 흐림·아래 노르스름·노란 입가).
- **입은 다문 채로** 그린다. 입 안 색은 출처가 없다(field-marks: 붉게 강조하지 않는다). 조르는 자세(입 벌림)는 출처가 생기면 따로.
- 1:1로 받는다(`style-guide.md` 1.4-1).

## `bird` 구도 규칙의 예외 (이 에셋만)

`bird`는 원래 "단독·옆모습·왼쪽"이지만 둥지 안 새끼는 **5~8마리가 산좌에 몰려 있어야** 맞다(N2). 그래서:

- **둥지 구멍의 단면(잘라 본 모습)** 하나를 단색 배경 위에 둔다 → 배경과 합성할 수 있게 `bird`처럼 종이색 바탕을 유지한다.
- 꼬리 블록의 `single animal only, strict side profile facing left`를 빼고, 나머지(`whole body visible, plain flat paper off-white background with nothing else, square format`)는 남긴다.
- 크기: 둥지 단면 너비 ≈ 캔버스의 **0.6**, 단면 아래 여백 8%. 새끼 한 마리 크기는 성조 0.35 비율에 맞추지 않는다(한 화면 안에서 성조와 함께 쓰지 않는다).

| 저장 파일명 (`assets/inbox/batch-03/`) | 대상 |
|---|---|
| `bird.parus-minor.chick.nest__1.webp` · `__2.webp` | 둥지 안 새끼 (부화 약 2주) |

## 검수 순서 (아트)

1. field-marks 1장 둥지 안 새끼 거부 기준 — 하나라도 틀리면 탈락
   - **N1** 열린 밥그릇 둥지가 아니라 구멍 **안**, 이끼 바닥 + 털 산좌
   - **N2** 5~8마리
   - **N3** 검정이 흐림(회흑색), 아래 노르스름, 입가 노랑
   - (추가) 입 안이 붉게 보이지 않을 것 · 어미 새가 들어가 있지 않을 것
2. 단면 너비 ≈ 0.6, 아래 여백 8%, 단색 종이색 바탕
3. 화풍 A(1.5 금지 표현 — 특히 귀여움 과장: 큰 눈), 오른쪽 아래 생성 도구 표시(후처리에서 지움)
4. 통과한 후보에 `review:content`

---

**둥지 안 새끼** — `bird.parus-minor.chick.nest`
```
watercolor field guide illustration, light flat washes with thin dark ink outlines, muted natural palette of sage green, warm ochre, slate grey and paper off-white, soft even daylight, no texture noise, clean composition, no text, no border, no signature, no watermark — whole body visible, plain flat paper off-white background with nothing else, square format — a cutaway cross-section view of the inside of a tree hole nest cavity, shown as one rounded section of brown wood isolated on the plain paper background, about sixty percent of the canvas width, centered, empty space around it. The cavity floor is a thick layer of green moss, topped with a shallow round cup lined with soft grey and white animal hair and fur. Six nestling Japanese tits (Parus minor), NOT Great tits, about two weeks old and almost fully feathered, huddled tightly together in the fur-lined cup, beaks closed, calm, no adult bird. Each nestling has the juvenile pattern: dull sooty grey-black cap and throat without gloss, a whitish cheek patch, olive-tinged grey back, pale yellowish underparts, and a conspicuous pale yellow gape flange at the corners of the beak. Natural proportions, small dark eyes, not cartoonish, not cute. No open cup nest on a branch, no eggs, no red open mouths.
```
