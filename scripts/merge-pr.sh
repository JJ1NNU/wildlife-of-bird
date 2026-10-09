#!/usr/bin/env bash
# 검토를 확인한 뒤 PR을 머지한다 (01-collaboration 8장).
# 사용: bash scripts/merge-pr.sh <PR번호> [--keep-branch | --check]
#   --check: 리뷰만 확인하고 머지하지 않는다
#   --keep-branch: 쌓인 PR의 아래 PR을 머지할 때(브랜치를 지우면 위 PR이 닫힌다)
# 확인하는 것:
#   1. 남은 review:* 라벨이 없다
#   2. 한 번이라도 달렸던 review:<부서> 라벨마다 승인 댓글(또는 리뷰 본문)이 있다
#      인식하는 줄 머리(굵게 ** 무시): "승인 (<부서>" · "[<부서>] 승인" · "[<부서>] 리뷰 — 승인"
#   3. 최신 main 기준 CI가 모두 통과했다 (뒤처져 있으면 update-branch 후 다시 돌린다)
set -euo pipefail

pr="${1:?사용: bash scripts/merge-pr.sh <PR번호> [--keep-branch | --check]}"
delete="--delete-branch"
[ "${2:-}" = "--keep-branch" ] && delete=""
check_only=""
[ "${2:-}" = "--check" ] && check_only=1
repo="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"

state="$(gh pr view "$pr" --json state --jq .state)"
[ "$state" = "OPEN" ] || { echo "중단: PR #$pr 상태가 $state"; exit 1; }
[ "$(gh pr view "$pr" --json isDraft --jq .isDraft)" = "false" ] || { echo "중단: Draft PR"; exit 1; }

left="$(gh pr view "$pr" --json labels --jq '[.labels[].name|select(startswith("review:"))]|join(" ")')"
[ -z "$left" ] || { echo "중단: 리뷰 대기 라벨이 남아 있음 — $left"; exit 1; }

asked="$(gh api "repos/$repo/issues/$pr/timeline" --paginate \
  --jq '.[]|select(.event=="labeled" and (.label.name|startswith("review:")))|.label.name' | sort -u)"
comments="$(gh pr view "$pr" --json comments,reviews --jq '(.comments[].body),(.reviews[].body)' | tr -d '*')"
for label in $asked; do
  dept="${label#review:}"
  grep -qE "^(승인 \($dept|\[$dept\] (리뷰 — )?승인)" <<<"$comments" || { echo "중단: $label 승인 댓글 없음"; exit 1; }
  echo "리뷰 확인: $dept 승인"
done
[ -n "$asked" ] || echo "리뷰 확인: 필수 리뷰 없음(소유 부서 PR)"
[ -z "$check_only" ] || { echo "확인만 함 — 머지하지 않음"; exit 0; }

head="$(gh pr view "$pr" --json headRefOid --jq .headRefOid)"
if [ "$(gh api "repos/$repo/compare/main...$head" --jq .behind_by)" != "0" ]; then
  echo "최신 main에 맞추는 중"
  gh pr update-branch "$pr"
  sleep 15
fi
[ "$(gh pr view "$pr" --json mergeable --jq .mergeable)" != "CONFLICTING" ] || { echo "중단: main과 충돌 — 작성 부서가 rebase"; exit 1; }
gh pr checks "$pr" --watch --interval 10 >/dev/null || { echo "중단: CI 실패"; gh pr checks "$pr"; exit 1; }
echo "CI 확인: 최신 main 기준 통과"

gh pr merge "$pr" --squash $delete
echo "머지 완료: #$pr"
