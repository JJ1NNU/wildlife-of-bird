# 생태·콘텐츠 상태

기다림: PR #417·#419 design 승인 **댓글**(`승인 (design)` 형식) · 대표 플레이테스트 #388

> 이 파일은 생태·콘텐츠 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-09 (라운드 44, 자동 근무 83회차)
- 현재 마일스톤: M1 — 콘텐츠 몫(#23) 완료, #165·#247·#252·#257·#263·#266·#290·#297·#304·#311·#321·#324·#341·#350 완료, #371 #372 #380 머지(#378 닫힘)

## 이번 근무에 한 것
- PR #417 여전히 design 승인 **댓글** 없음(merge-pr.sh 중단 확인). 기다리지 않고 #394 12차를 **#417 브랜치 위에 쌓아** PR #419: `foggy-dawn`(짝짓기·수컷 — 흐린 안개 새벽, 과시 small↔에너지 small). 계획의 안개 환경 카드는 안개가 먹이를 줄인다는 근거가 없어 근거 있는 "구름·비가 있으면 새벽 노래가 늦다"로 좁힘. SRC-147 Bruni 외 2014 (Springer 초록 확인, 검은머리박새 포함 6종). needs-review P-46. 이벤트 76건

## 진행 중
- PR #417 → 머지 뒤 PR #419 (둘 다 design `승인 (design)` **댓글** 오면 순서대로 `bash scripts/merge-pr.sh 417` → 419). #419는 #417 커밋을 품고 있어 #417 먼저
- #394 누계 19/20. 남은 1건: dust-or-anting(박새 확인 전 — Potter & Hauser 1974 Auk 91:537 doi:10.2307/4084474 후보, 초록 없음). 후보 출처 메모: Kacelnik 1979 *Anim. Behav.* 27:237 doi:10.1016/0003-3472(79)90143-X 큰박새 먹이 효율과 빛 세기 — 초록 못 받음(S2 tldr만: 이른 아침 먹이 기회가 낮다)

## 막힘
- 없음

## 다음 근무에서 할 일
1. (미룸) #360 남은 needs-review 재확인 — 틀린 사실이 드러나면 그 건만 고침
2. 다음 SRC 번호 148, 다음 P 번호 P-47
3. fact-check 열림: P-10(주식) · P-14 · P-15(long-cold-night) · P-18 · P-23(mate-guarding · nest-cleaning) · P-24 · P-25 · P-27~P-33 · P-35 · P-40(heat-wave) · P-41(sprayed-field) · P-42(spring-drought) · P-43(cache-pilfer) · P-44(mosquito-ditch) · P-45(sunbathing) · P-46(foggy-dawn)
4. #417·#419 머지 뒤 #394 마지막 차(dust-or-anting). 머지 전에 새 브랜치를 따면 common.json 끝부분 충돌 — 머지 뒤에 시작. common.json은 biome format 쓰지 말고 손으로 끝에 붙인다(포맷터가 파일 전체를 바꿈). 공통 이벤트는 새 일반 총설로 받치고, 한 종 연구 외삽은 needs-review(sources.md 공통 이벤트 절)
5. 족제비 도감 — 출처 더 찾으면(M3). 올빼미 도감에 SRC-099 한 문장 넣을 수 있음(M3)
6. S-30 가계도 줄(`lifeLine`) 문구는 엔진 #21 뒤 클라이언트가 따로 요청한다(#297)

## 메모 (다음 근무의 나에게)
- #360에서 못 찾은 것: *P. minor* 털갈이 시기·구멍 잠자리 — OpenAlex·crossref 'Parus minor moult/roost'·'シジュウカラ 換羽/ねぐら' 없음. 手井 2018 鳥類標識誌 30:24(가나자와 박새 계절 몸 치수)은 털갈이 내용 없음. 외삽뿐인 이벤트(P-27 2건·P-28·P-35)는 전문가 질문 후보
- J-STAGE 초록 뽑기: 받은 HTML에서 `id="article-overiew-abstract-wrap"` 뒤를 태그 지우고 읽는다. OpenAlex `abstract_inverted_index`로도 초록 복원 가능. Windows에서 `python`은 멈춘다(스토어 스텁) — node만
- #341에서 못 찾은 것: 박새 배설물 주머니·둥지 청소(nest-cleaning) — OpenAlex 'Parus minor/Japanese tit fecal sac·nest sanitation' 없음. Yoon 외(한국교원대 청주) 연구진이 국내 박새 둥지 위험 실험을 여럿 냈다(SRC-108·109, *J Avian Biol* 2016 jav.00890 암컷 품기·수컷 급이와 기후) — P-23·P-31 후보
- 한국환경생태학회지(KJEE) 본문은 `doi.org` → envecojournal.org 페이지를 curl로 받으면 HTML 전문이 나온다(SRC-107). ScienceDirect(Elsevier)는 내장 브라우저에서도 CAPTCHA — 넘기지 않는다. Springer 초록은 내장 브라우저 `#Abs1-content`로 읽힌다
- rival-near-mate: *P. minor* 짝 지키기 문헌 없음(OpenAlex). 후보만: 「Reproductive ecology of Japanese great tits focusing on extra-pair paternity」(2013, Medical Entomology and Zoology?) · jjo 71:171(2022, 박새 섞인 한배 DNA 기록) — 짝 밖 부성까지라 쫓아내기 근거는 아님. Hamao 2016 *Anim Behav* 119:143(일본 박새 방언 반응)·Hamao 2020 *J Ethol* 38:383(노래 특성, 영역 언급 없음)
- J-STAGE 초록은 `curl -sL https://doi.org/<doi>`로 받힌다(`/_article/-char/en` 직접 주소는 404). crossref `query.bibliographic`로 DOI 찾기. Saitou 1979 원문 제목엔 부제가 안 보여 sources.md엔 '연작 n편'으로만 적음
- #324에서 못 찾은 것: 박새(P. minor) 구애 먹이·짝 지키기·겨울 서열 — OpenAlex 결과 없음. Da Silva 2025 *Biology* 14:297(일본 박새 날갯짓 '먼저 들어가' 몸짓 재분석)은 둥지 입구 짝 신호라 지금 이벤트엔 안 맞음. SRC-082 초록은 입구 기울기·나무 굵기까지 — 구멍 깊이는 없음(shallow-hole 못 닫음)
- Sci Rep·PMC 논문 본문은 Europe PMC `ebi.ac.uk/europepmc/webservices/rest/<PMCID>/fullTextXML`로 받는다(SRC-097). Ardea(BioOne) 공개 논문은 `.full` 페이지를 WebFetch로 읽힌다(PDF는 curl 막힘). 지린 쭤자 박새 연구진(Wang Haitao)의 Dryad 데이터셋에 산란·부화 날짜가 있을 수 있다
- tandfonline 본문은 curl은 403(Cloudflare)이지만 **내장 브라우저**로 열면 읽힌다. 표는 'Display Table' 버튼을 눌러야 DOM에 들어온다(CSV 다운로드는 챌린지에 막힘) — SRC-095에서 확인
- #257에서 못 찾은 것: P-18 부화율 — 한라산 박새류 학위논문(제주대 2013?, 「고도와 기온변화에 따른 박새류의 번식생태」 oak.jejunu.ac.kr/handle/2020.oak/20814)은 검색 요약상 부화 성공률 67.3%(2011)·71.3%(2012)지만 **박새류 합산**이고 사이트가 이 환경에서 접속 안 됨(인증서·DNS). Nomi 2017 *Wilson J Ornithol* 129:294(북일본 박새류 4종 번식, doi:10.1676/16-014.1)·Yuta & Koizumi 2012 *Ardea* 100:197(북일본 박새 한배 평균 10 넘음, 2회 번식 60% 이상) 본문은 유료 — 부화율 미확인. Lee 2023 *Turk J Zool* 47:33(국내 인공새집 박새, 관목 비율 ↔ 부화·이소 성공, doi:10.55730/1300-0179.3110) 초록에 수치 없음. Yu 2025 DGIST 석사논문(박새 포란 패턴·둥지 구조 ↔ 부화 성공) 초록에 수치 없음. Saitou 1979 山階鳥研報 11:149(기본 무리 안 서열 — flock-rank 후보) OpenAlex에 없음
- SRC-093(大堀 2007)은 Saitou 1979 연작(기본 무리·서열·짝 맺기)을 인용 — flock-rank · first-winter-follow 근거로 원문을 찾을 만하다(J-STAGE `jyio1952` 11권)
- 새매 → 이소 무렵 어린 박새: Geer 1978 *Condor* 80:419 「Effects of nesting sparrowhawks on nesting tits」(SORA·USF 원문 403, 요지 미확인)
- #200 후보 중 출처 못 찾은 것: 늦여름 메뚜기·매미 먹이(P. minor 식단 문헌 없음), 어린 새 분산 시기(Drent 1984 Ardea 72:127 doi:10.5253/arde.v72.p127 — 유료, 요지 미확인), 새매가 이소 무렵 어린 박새를 많이 잡음(Geer 1979 옥스퍼드 박사논문 — 요지: 해마다 박새류의 22~42%를 새매가 잡음, postFledge 후보). Greenwood 1979 Ornis Fennica 56:75는 분산 거리뿐, 시기 없음
- 우박 문헌: OpenAlex 'hailstorm bird mortality' — 열린 둥지 연구뿐(Carver 2017 rse2.41 초원 레이더). 구멍 둥지 우박 자료는 없음
- 머지 스크립트는 **한 번이라도 달린** review 라벨마다 승인 댓글을 요구한다 — 내 영역 데이터 PR에는 `dept:content`만 단다(#238)
- **머지는 `bash scripts/merge-pr.sh <번호>` 한 줄로**(#117, `gh pr merge` 직접 금지). 그 전에 별도 명령으로 `git switch --detach origin/main`(worktree를 브랜치에서 떼기, #113)
- 원문 확인한 출처: SRC-001~005 · 023~034 (032·033은 서지·초록까지, 032·033은 #110에 있음). 006~022는 `미확인`
- **SRC-034는 AI 답 — 어떤 사실의 출처로도 쓰지 않는다**(#266). 남은 쓰임은 needs-review 자리 표시뿐
- 화면 문구 키 마디에 숫자 금지(camelCase 정규식) — 순서는 `first`~`tenth`로(#270)
- SRC-032·033 원문은 *P. major* 표기(구 분류) — 한국 개체 = 지금의 *P. minor*
- 이벤트 스키마에 결과 글 필드가 없다(옵션은 id·text·효과만). 결과 글이 필요하면 디자인·엔진에 요청
- 장소 등급 어림: 섭취 ≈ food 수치 × (1 − competition). 봄 노숙림 9.6, 겨울 소나무숲 9.75
- 홍콩조류협회 도감은 식별 특징에 좋다(C). 홍콩 박새는 다른 아종 — 등 색 근거로 쓰지 않는다
- 두루미 '암컷 뺨 회색'(위키백과)은 동물원 자료와 어긋남 — M4에 재확인
- Strix 14:11–23(1996) PDF는 글꼴 인코딩 문제로 추출 불가
- 수명 값은 **최장 기록**. SRC-003은 유럽 박새 — 생태 사실 문장으로 쓰지 않는다
- Windows: `npm run format`이 `version.json` CRLF를 건드린다 → 포맷은 `npx biome format --write <경로>`로 좁혀서. 파이썬으로 파일 쓸 땐 `newline=''`
- JSON 글 안에 큰따옴표 금지 — 인용은 '…'. 파이썬으로 고친 뒤 `json.load`로 확인하고 `npx biome check <경로>` 출력 꼭 읽기(#110에서 CI 깨짐)
- Bash 도구에 아주 긴 heredoc을 주면 잘린다 — 긴 스크립트는 Write 도구로 파일을 만든 뒤 실행
- 털갈이 중 비행 저하는 작다(SRC-046 찌르레기, Lind 2001 참새) — '깃이 빠져 둔하다' 같은 글은 쓰지 않는다
- 박새 노래 = 낮은 음·높은 음 한 쌍을 되풀이(SRC-027)
- 초록 없는 논문(Wiley 등)은 OpenAlex `api.openalex.org/works/doi:<doi>`의 `abstract_inverted_index`로 받을 수 있다(SRC-044 확인)
- Europe PMC REST(`ebi.ac.uk/europepmc/webservices/rest/search?query=PMCID:...&resultType=core`)로 초록·서지를 받을 수 있다(PMC·Springer 직접 접근은 막힘)
- 환경 카드(`draw: "periodStart"`)는 선택지 1~3개. 알림 카드는 `{ id: "ok", text: 결과 요약, effects }` 하나로 썼다(#147)
- 시기 = 반달. 1 = 1월 상반, 7–8 = 4월, 12–14 = 6월 하반~7월, 15–18 = 8~9월, 23–24 = 12월
- crossref API(`api.crossref.org/works/<doi>`)로 서지 확인이 잘 된다. BioOne PDF는 WebFetch로 받은 뒤 `pypdf`로 읽으면 된다
- Kennedy 1970(SRC-052) britishbirds 본문은 403 — 서지는 다른 글의 인용으로만 확인
- SRC-027(HKBWS)은 식단·서식지·텃새 여부엔 종 단위 C 근거로 썼다(#168). 식단 비율은 없음
- 새끼 그림: 입 안 색은 출처 없음(SRC-064 초록은 자연 색을 안 적음). 핀깃 단계 날짜는 D(SRC-062)뿐
- #190에서 쓴 새 출처(아직 sources.md에 없음): Moiron 2018 Proc R Soc B doi:10.1098/rspb.2017.2868(초록) · Ekman 1987 Anim Behav 35:445 · Wunderle 1991(인용만) · Gibb 1954 Ibis(서지만, 수치 미확인). 데이터에 쓸 때 SRC-070~로 등록(065~068 밤 휴식, 069 기상청 태풍)
- 도감 형식(#156): 파일 하나에 항목 하나 `data/codex/<kind>.<target>.json`. 본문 4~8문장 — 출처가 한 줄뿐인 대상(참매·족제비)은 채우지 말고 보류
- **우리 데이터 PR엔 review 라벨을 붙이지 않는다** — 한 번 붙였다 떼도 merge-pr.sh가 그 부서 승인을 요구한다(#228)
- 겨울 먹이대 이벤트 후보: Plummer 2013 Sci Rep 3:2002(doi:10.1038/srep02002, 푸른박새 겨울 급이 → 다음 봄 새끼가 작고 덜 살아남음, 초록 확인). 지금 효과 종류로 손익을 옮기기 어려워 보류
