import { act, deserialize, type RunState, serialize } from '@wb/engine';
import type { GameData } from '@wb/schema';

/**
 * 자동 저장(#24) — 결정마다 한 칸에 덮어쓴다. 저장소가 막힌 브라우저(사생활 보호 창 등)에서도
 * 게임은 돌아가야 하므로 실패는 삼킨다.
 */
const KEY = 'wb.run';
/** 이번 판에서 고른 선택 id 순서 — 플레이 기록 내보내기(#395). 상태와 같이 저장한다 */
const CHOICES_KEY = 'wb.choices';

/** 없으면 이 기능 전에 시작한 판이라 기록을 내보낼 수 없다 */
let choices: string[] | undefined;

export function loadRun(data: GameData): { state?: RunState; problem?: string } {
  let text: string | null;
  try {
    text = localStorage.getItem(KEY);
    const c = localStorage.getItem(CHOICES_KEY);
    choices = c ? (JSON.parse(c) as string[]) : undefined;
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
    if (choices) localStorage.setItem(CHOICES_KEY, JSON.stringify(choices));
    else localStorage.removeItem(CHOICES_KEY);
  } catch {
    // 저장 못 해도 이번 판은 계속한다
  }
}

export function clearRun(): void {
  choices = undefined;
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(CHOICES_KEY);
  } catch {
    // 위와 같음
  }
}

/** 새 판의 기록을 비운다 — `newRun` 직후 */
export function startRecord(): void {
  choices = [];
}

/** 판을 진행하는 `act`는 모두 이것으로 — 고른 id를 기록에 남긴다(미리 보기용 `act`는 그대로) */
export function actRecorded(state: RunState, choiceId: string, data: GameData) {
  choices?.push(choiceId);
  return act(state, choiceId, data);
}

/**
 * 판 기록 한 줄(JSONL) — sim `RunRecord` 형식이라 `npm run sim -- replay`가 그대로 읽는다(#395).
 * 기록이 없는 판(이 기능 전에 시작)이면 undefined.
 */
export async function runRecordLine(state: RunState): Promise<string | undefined> {
  if (!choices) return undefined;
  const bytes = new TextEncoder().encode(serialize(state));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const finalStateHash = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return JSON.stringify({
    config: state.config,
    bot: { id: 'human', version: '0' },
    choices,
    result: { totalBreeding: state.totalBreeding, gameOver: state.gameOver, endAt: state.at },
    error: null,
    finalStateHash,
    log: state.log,
  });
}

export function hasRecord(): boolean {
  return choices !== undefined;
}
