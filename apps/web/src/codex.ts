import type { RunState } from '@wb/engine';
import type { GameData } from '@wb/schema';

/**
 * 도감 등록(S-33, `docs/design/specs/screens.md` v2) — 런이 끝나도 남도록 기기에 모은다.
 * 엔진은 순수하므로 "만난 것"은 화면이 상태 변화에서 읽는다(#534 댓글):
 * `run-start` = 새 판의 종 · `event-seen` = 이벤트가 칸에 뽑힌 로그 · `predator-met` = 그 이벤트 선택지 효과의
 * 포식자 · `node-visited` = 단계가 바뀔 때 직전 장소.
 */
const KEY = 'wb.codex';

export interface CodexRecord {
  /** 처음 만난 판(이 기기에서 몇째 판, 1부터)과 세대 */
  run: number;
  generation: number;
  count: number;
}

interface Stored {
  /** 이 기기에서 시작한 판 수 */
  runs: number;
  seen: Record<string, CodexRecord>;
}

function read(): Stored {
  try {
    const s = localStorage.getItem(KEY);
    if (s) return JSON.parse(s) as Stored;
  } catch {
    // 막힌 저장소·깨진 값은 빈 도감으로
  }
  return { runs: 0, seen: {} };
}

export function codexSeen(): Record<string, CodexRecord> {
  return read().seen;
}

/** 이벤트 id → 그 이벤트 선택지 효과에 나오는 포식자 */
function predatorsOf(eventId: string, data: GameData): string[] {
  const event = data.events.find((e) => e.id === eventId);
  if (!event) return [];
  return [...JSON.stringify(event.options).matchAll(/"predator":"([^"]+)"/g)].map((m) => m[1] as string);
}

/** `prev`(없으면 새 판) → `next`에서 만난 도감 항목 id. 같은 항목이 여러 번 나오면 그만큼 센다 */
export function codexHits(prev: RunState | undefined, next: RunState, data: GameData): string[] {
  const hits: string[] = [];
  const newLog = prev ? next.log.slice(prev.log.length) : [];
  const drawn = newLog.flatMap((l) => (l.event && l.slot !== undefined ? [l.event] : []));
  for (const entry of data.codex.values()) {
    const u = entry.unlock;
    let n = 0;
    if (u.on === 'run-start') n = !prev && next.config.speciesId === u.species ? 1 : 0;
    else if (u.on === 'event-seen') n = drawn.filter((id) => u.events.includes(id)).length;
    else if (u.on === 'predator-met')
      n = drawn.filter((id) => predatorsOf(id, data).includes(u.predator)).length;
    else if (u.on === 'node-visited')
      n =
        prev && prev.node === u.node && JSON.stringify(prev.at) !== JSON.stringify(next.at) ? 1 : 0;
    for (let i = 0; i < n; i++) hits.push(entry.id);
  }
  return hits;
}

/** 만난 것을 기기에 더한다. `prev`가 없으면 새 판이라 판 수를 하나 늘린다 */
export function recordCodex(prev: RunState | undefined, next: RunState, data: GameData): void {
  const hits = codexHits(prev, next, data);
  if (prev && hits.length === 0) return;
  const stored = read();
  if (!prev) stored.runs += 1;
  for (const id of hits) {
    const r = stored.seen[id];
    if (r) r.count += 1;
    else
      stored.seen[id] = {
        run: Math.max(stored.runs, 1),
        generation: next.life.generation,
        count: 1,
      };
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // 저장 못 해도 판은 계속한다
  }
}
