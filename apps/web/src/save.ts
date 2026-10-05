import { deserialize, type RunState, serialize } from '@wb/engine';
import type { GameData } from '@wb/schema';

/**
 * 자동 저장(#24) — 결정마다 한 칸에 덮어쓴다. 저장소가 막힌 브라우저(사생활 보호 창 등)에서도
 * 게임은 돌아가야 하므로 실패는 삼킨다.
 */
const KEY = 'wb.run';

export function loadRun(data: GameData): { state?: RunState; problem?: string } {
  let text: string | null;
  try {
    text = localStorage.getItem(KEY);
  } catch {
    return {};
  }
  if (!text) return {};
  try {
    return { state: deserialize(text, data) };
  } catch (e) {
    return { problem: e instanceof Error ? e.message : String(e) };
  }
}

export function saveRun(state: RunState): void {
  try {
    localStorage.setItem(KEY, serialize(state));
  } catch {
    // 저장 못 해도 이번 판은 계속한다
  }
}

export function clearRun(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 위와 같음
  }
}
