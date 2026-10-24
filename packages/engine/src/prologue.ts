import type { CardId, GameData } from '@wb/schema';
import { advance, phaseAt } from './calendar.ts';
import { seasonOf } from './formulas.ts';
import { speciesBalance } from './step.ts';
import type { RunState } from './types.ts';

/**
 * 프롤로그 — 알에서 깨어나 독립까지 (13-prologue). 상태에서 센다(저장 형식 그대로):
 * 1세대·나이 0·생애를 시작한 해의 `nestling`(P-1 둥지 안)·`postFledge`(P-2 부모 돌봄).
 * 계승한 새끼는 2세대부터라 해당 없다.
 */
export type PrologueStage = 'nest' | 'fledge';

export function prologueStage(state: RunState): PrologueStage | undefined {
  const { life, player, at } = state;
  if (life.generation !== 1 || player.age !== 0 || at.year !== life.start.at.year) return undefined;
  const phase = phaseAt(state.calendar, at);
  return phase === 'nestling' ? 'nest' : phase === 'postFledge' ? 'fledge' : undefined;
}

/** 이 단계가 구간의 마지막이면 끝나는 일 — P-1 끝 이소 · P-2 끝 독립(프롤로그 끝) */
export function prologueEnd(state: RunState): 'fledge' | 'independent' | undefined {
  const stage = prologueStage(state);
  if (!stage || prologueStage({ ...state, at: advance(state.at, state.calendar) }) === stage)
    return undefined;
  return stage === 'nest' ? 'fledge' : 'independent';
}

/** 프롤로그 몇째 단계인가 (1부터) — 생애를 시작한 단계에서 센다 */
function prologueStep(state: RunState): number {
  const same = (a: RunState['at'], b: RunState['at']) =>
    a.year === b.year && a.period === b.period && a.step === b.step;
  let at = state.life.start.at;
  let n = 1;
  while (!same(at, state.at)) {
    at = advance(at, state.calendar);
    n++;
  }
  return n;
}

/** 이 단계 패에 나올 수 있는 카드 (3.1, 누적). 프롤로그가 아니면 없음(제한 없음) */
export function prologuePool(state: RunState, data: GameData): ReadonlySet<CardId> | undefined {
  if (!prologueStage(state)) return undefined;
  const step = prologueStep(state);
  const { unlock } = speciesBalance(data, state.config.speciesId).prologue;
  return new Set(unlock.filter((u) => u.step <= step).flatMap((u) => u.cards as CardId[]));
}

/** 부모 급이 (3.2) = 그 단계 기초 소비 × `prologue.parentFeed[구간]`. 프롤로그가 아니면 0 */
export function parentFeed(state: RunState, data: GameData): number {
  const stage = prologueStage(state);
  if (!stage) return 0;
  const species = speciesBalance(data, state.config.speciesId);
  return (
    species.basalPerStep[seasonOf(species, state.at.period)] * species.prologue.parentFeed[stage]
  );
}
