import type { LifeRecord, RunState } from '@wb/engine';

/**
 * S-31 가계도(`docs/design/specs/screens.md` v2) — 끝난 생애는 로그의 `life`, 사망 원인은 그 로그 글.
 * 지난 판은 마지막 1판만 기기에 둔다(타이틀에서 연다).
 */
const KEY = 'wb.lineage';

export interface Lineage {
  totalBreeding: number;
  lives: { life: LifeRecord; cause: string | undefined }[];
}

export function lineageOf(state: RunState): Lineage {
  return {
    totalBreeding: state.totalBreeding,
    lives: state.log.flatMap((l) =>
      l.life ? [{ life: l.life, cause: l.type === 'death' ? l.text : undefined }] : [],
    ),
  };
}

export function saveLineage(lineage: Lineage): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(lineage));
  } catch {
    // 막힌 저장소면 지난 판 가계도를 못 남길 뿐
  }
}

export function loadLineage(): Lineage | undefined {
  try {
    const s = localStorage.getItem(KEY);
    if (s) return JSON.parse(s) as Lineage;
  } catch {
    // 깨진 값은 없는 것으로
  }
  return undefined;
}
