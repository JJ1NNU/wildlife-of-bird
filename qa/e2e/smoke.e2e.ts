import { expect, type Page, test } from '@playwright/test';

/**
 * M1 핵심 흐름 스모크(T6, test-strategy 5장):
 * 새 게임 → (손 진행) 첫 번식 → 계승 화면에서 새끼로 계승 → 새로고침·이어 하기 → (빨리 감기) 게임 오버 기록.
 * 새 판 시드가 Date.now()라 시계를 고정한다 — 이 시각의 판은 계승 관문이 온다.
 * 밸런스가 바뀌어 관문 전에 죽으면 날짜를 바꿔 다시 고른다(#438: 1월 1일 → 3일).
 */
const FIXED_TIME = Date.UTC(2026, 0, 3);

/** 사람처럼 한 번 누른다: 다시 보기는 넘기고, 관문은 첫 선택지, 빈 칸은 채식 */
async function press(page: Page) {
  for (const id of ['replay-skip', 'replay-ok']) {
    const b = page.getByTestId(id);
    if (await b.isVisible()) return b.click();
  }
  const go = page.getByTestId('go');
  if (await go.isVisible()) {
    if (await go.isEnabled()) return go.click();
    return page.locator('[data-testid^="choice-"]:not([disabled])').first().click();
  }
  const forage = page.getByTestId('choice-action.forage');
  if (await forage.isVisible()) return forage.click();
  return page.locator('[data-testid^="choice-"]:not([disabled])').first().click();
}

test('새 게임 → 번식 → 계승 → 이어 하기 → 게임 오버', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.clock.setFixedTime(FIXED_TIME);

  await page.goto('/');
  await page.getByTestId('new-run').click();
  await expect(page.getByTestId('main-turn')).toBeVisible();

  // 계승 관문까지 손으로 (번식에 성공해 새끼가 있어야 온다)
  const gate = page.getByTestId('gate-inheritance');
  for (let i = 0; i < 400 && !(await gate.isVisible()); i++) {
    await expect(page.getByTestId('game-over')).toBeHidden();
    await press(page);
  }
  await expect(gate).toBeVisible();

  // 첫 새끼로 계승: 고르기 → 진행 → 확인 화면 → 진행
  await gate.locator('[data-testid^="choice-"]').nth(1).click();
  await page.getByTestId('go').click();
  await expect(page.getByTestId('inherit-confirm')).toBeVisible();
  await page.getByTestId('go').click();
  await expect(gate).toBeHidden();

  // 새로고침 → 제목 화면의 이어 하기로 같은 판에 돌아온다
  const energy = await page.getByTestId('energy').textContent();
  await page.reload();
  await page.getByTestId('continue').click();
  await expect(page.getByTestId('main-turn')).toBeVisible();
  await expect(page.getByTestId('energy')).toHaveText(energy ?? '');

  // 빨리 감기(평균 봇)로 게임 오버까지
  const over = page.getByTestId('game-over');
  for (let i = 0; i < 30 && !(await over.isVisible()); i++) {
    await page.getByTestId('fast-forward').click();
  }
  await expect(over).toBeVisible();
  await expect(page.getByTestId('death-cause')).toBeVisible();
  await expect(page.getByTestId('run-records')).toBeVisible();
  // 가계도 2세대 이상 = 계승이 기록됐다
  expect(await page.getByTestId('lineage').locator('li').count()).toBeGreaterThanOrEqual(2);
  expect(errors).toEqual([]);
});
