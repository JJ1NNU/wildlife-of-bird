#!/usr/bin/env bash
# 라벨과 마일스톤을 만든다. 여러 번 실행해도 안전하다(이미 있으면 갱신 또는 건너뜀).
# 사용: 저장소 폴더에서  bash scripts/setup-github.sh  (저장소를 못 찾으면: bash scripts/setup-github.sh <계정>/<저장소>)
# 필요: gh CLI 로그인 (gh auth status)
set -euo pipefail

gh auth status >/dev/null 2>&1 || { echo "gh 로그인이 필요합니다: gh auth login"; exit 1; }

# 대상 저장소: 인자 > GH_REPO 환경 변수 > 현재 폴더의 원격 저장소
if [ -n "${1:-}" ]; then GH_REPO="$1"; fi
if [ -z "${GH_REPO:-}" ]; then
  GH_REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
fi
[ -n "${GH_REPO:-}" ] || { echo "저장소를 알 수 없습니다: bash scripts/setup-github.sh <계정>/<저장소>"; exit 1; }
export GH_REPO   # gh label·gh api({owner}/{repo})가 이 저장소를 쓴다
echo "대상 저장소: $GH_REPO"

label() {
  gh label create "$1" --color "$2" --description "$3" --force >/dev/null
  echo "label: $1"
}

# 부서 (처리할 부서)
label "dept:pm"      "5319e7" "PM — 일정·이슈·대표 보고"
label "dept:design"  "1d76db" "게임디자인 — 규칙·수치·명세"
label "dept:content" "0e8a16" "생태·콘텐츠 — 생태 사실·글·데이터"
label "dept:engine"  "b60205" "엔진 — 게임 엔진·스키마·시뮬레이터·CI"
label "dept:client"  "d93f0b" "클라이언트·배포 — 화면·PWA·배포·리더보드"
label "dept:art"     "e99695" "아트·UX — 화풍·와이어프레임·에셋"
label "dept:qa"      "fbca04" "QA·밸런스 — 봇·리포트·테스트·관문"
label "dept:report"  "c2e0c6" "보고 — 대표 창구, 아침 보고"

# 종류
label "type:task"     "c5def5" "작업 요청"
label "type:decision" "bfd4f2" "결정 요청 (부서 간)"
label "type:bug"      "ee0701" "버그"
label "type:human"    "f9d0c4" "대표가 직접 해야 하는 일"
label "type:question" "d4c5f9" "질문"

# 대표
label "needs:ceo" "000000" "대표 결정 필요"

# 리뷰 요청 (PR)
for d in pm design content engine client art qa; do
  label "review:$d" "ededed" "PR에 $d 리뷰 필요 — 승인 시 리뷰어가 이 라벨을 뗀다"
done

# 상태
label "status:blocked"     "b60205" "막힘 — 본문에 무엇을 기다리는지"
label "status:in-progress" "0052cc" "작업 중"

# 우선순위
label "P0" "b60205" "이번 마일스톤 필수"
label "P1" "d93f0b" "이번 마일스톤 목표"
label "P2" "c2e0c6" "여유 있으면"

# 버그 심각도 (뜻: docs/agents/qa.md 10장 / 관문의 "S1 버그 0" 집계: 02-roadmap 6장)
label "sev:S1" "b60205" "치명 — 진행 불가·저장 손실·점수 오류·명백한 생태 오류 (관문 차단)"
label "sev:S2" "d93f0b" "중대 — 규칙이 명세와 다름·화면 깨짐"
label "sev:S3" "fbca04" "보통 — 불편·문구 오류"
label "sev:S4" "c2e0c6" "사소 — 다듬기"

# 마일스톤
existing="$(gh api "repos/{owner}/{repo}/milestones?state=all&per_page=100" --jq '.[].title')"
milestone() {
  if grep -qxF "$1" <<<"$existing"; then
    echo "milestone (있음): $1"
  else
    gh api "repos/{owner}/{repo}/milestones" -f title="$1" -f description="$2" >/dev/null
    echo "milestone: $1"
  fi
}
milestone "M0 착수"              "모두가 일할 수 있는 바닥 — docs/studio/02-roadmap.md"
milestone "M1 박새 수직 슬라이스" "꾸밈 없는 UI로 박새를 여러 해 플레이"
milestone "M2 박새 밸런스"        "박새가 목표치에 맞는다"
milestone "M3 알파"              "보이는 게임, 친구 알파"
milestone "M4 두루미+공정성"      "빠른 종 vs 느린 종이 공정"
milestone "M5 4종 완성"           "4종, 환경 변화, 칭호"
milestone "M6 베타"              "온라인 기능과 완성도"
milestone "M7 출시·운영"          "1.0 공개와 운영"

echo "완료 — GitHub 기본 라벨(bug, enhancement 등)은 쓰지 않습니다. 필요 없으면 저장소 설정에서 지워도 됩니다."
