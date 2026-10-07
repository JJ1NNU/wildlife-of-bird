import type { GameData, Phase } from '@wb/schema';
import { phaseAt } from './calendar.ts';
import type { Intensity } from './formulas.ts';
import { isPhaseStart } from './mate.ts';
import type { Choice, LogEntry, ParentingItemChoice, RunState } from './types.ts';

/**
 * 육아 방침 관문 `parentingPolicy` — 04-breeding 6장. 새끼가 있는 `nestling` 첫 단계(설정)·`postFledge` 첫 단계(조정)에
 * 첫 칸보다 먼저 열린다(짝 지시 다음). 선택지는 하나이고 항목별 값을 id 뒤에 담는다:
 * `parentingPolicy?intensity=high&allocation=compete` — 빠진 항목은 현재값(처음에는 기본값).
 * 방침은 둥지가 있는 동안 걸린다.
 * 은수저(`compete`·`quality`·`early`)는 `clutch.ts`. 잠정(#21): 둥지 손실 배율(`clean`·`early`)·학습 보너스는 걸어 두기만 한다 —
 * 둥지 손실·계승 조각에서 효과.
 */

/** 이 항목은 `postFledge` 조정에서 못 바꾼다 (6.2) */
const NESTLING_ONLY = ['nestCare', 'fledgeTiming'];

/** 잠정(#21): 화면 글은 콘텐츠의 `data/text/`가 생기면 그리로 옮긴다 */
const ITEM_LABEL: Record<string, string> = {
  intensity: '급이 강도',
  allocation: '먹이 배분',
  foodQuality: '먹이 질',
  nestCare: '둥지 관리',
  fledgeTiming: '이소 시점',
  postFledgeCare: '이소 후 돌봄',
  learning: '학습 기회',
};

/** 항목 → 선택 id 목록. 급이 강도는 `formulas.json`, 나머지는 `breeding.json` `parenting` */
function itemOptions(data: GameData): Record<string, string[]> {
  const out: Record<string, string[]> = {
    intensity: Object.keys(data.formulas.energy.feedCostByIntensity),
  };
  for (const [item, options] of Object.entries(data.breeding.parenting)) {
    out[item] = Object.keys(options);
  }
  return out;
}

/** 기본값 — 급이 강도는 `mid`, 나머지는 첫 선택 (6.1) */
function defaultOf(item: string, options: string[]): string {
  return item === 'intensity' ? 'mid' : (options[0] ?? '');
}

/** 지금 걸린 방침의 한 항목. 정하지 않았으면 기본값 */
export function policy(state: RunState, data: GameData, item: string): string {
  const set = state.parenting?.[item];
  if (set) return set;
  return defaultOf(item, itemOptions(data)[item] ?? []);
}

/** 이 단계에 육아 방침 관문이 열리나 — 새끼가 있고 급이 국면의 첫 단계 */
export function parentingDue(state: RunState): boolean {
  if ((state.nest?.chicks ?? 0) === 0) return false;
  const phase = phaseAt(state.calendar, state.at);
  if (phase !== 'nestling' && phase !== 'postFledge') return false;
  return isPhaseStart(state.calendar, state.at, phase);
}

function items(state: RunState, data: GameData): ParentingItemChoice[] {
  const adjust = phaseAt(state.calendar, state.at) === 'postFledge';
  return Object.entries(itemOptions(data)).map(([item, options]) => ({
    item,
    label: ITEM_LABEL[item] ?? item,
    options,
    current: policy(state, data, item),
    ...(adjust && NESTLING_ONLY.includes(item) ? { locked: true } : {}),
  }));
}

export function parentingChoices(state: RunState, data: GameData): Choice[] {
  return [
    {
      id: 'parentingPolicy',
      kind: 'parentingPolicy',
      label: '육아 방침 정하기',
      items: items(state, data),
    },
  ];
}

/** 방침을 정한다 — 빠진 항목은 현재값. 없는 항목·선택, 잠긴 항목을 바꾸면 던진다 */
export function setPolicy(
  state: RunState,
  choiceId: string,
  data: GameData,
): { state: RunState; log: LogEntry[] } {
  const query = new URLSearchParams(choiceId.split('?')[1] ?? '');
  const parenting: Record<string, string> = {};
  for (const it of items(state, data)) {
    const value = query.get(it.item) ?? it.current;
    if (!it.options.includes(value)) throw new Error(`없는 선택이다: ${it.item}=${value}`);
    if (it.locked && value !== it.current)
      throw new Error(`지금 바꿀 수 없는 항목이다: ${it.item}`);
    parenting[it.item] = value;
    query.delete(it.item);
  }
  const extra = [...query.keys()];
  if (extra.length > 0) throw new Error(`없는 육아 방침 항목이다: ${extra.join(', ')}`);
  const text = Object.entries(parenting)
    .map(([item, v]) => `${ITEM_LABEL[item] ?? item} ${v}`)
    .join(' · ');
  return {
    state: { ...state, parenting },
    log: [{ at: state.at, type: 'parenting', text: `육아 방침: ${text}` }],
  };
}

/** 이 국면에 효과가 있는 방침 선택들 (6.1 '걸리는 국면') */
function active(state: RunState, data: GameData, phase: Phase) {
  if (!state.parenting || (phase !== 'nestling' && phase !== 'postFledge')) return [];
  const p = data.breeding.parenting;
  const pick = <T>(table: Record<string, T>, item: string) => table[policy(state, data, item)];
  return [
    pick(p.allocation, 'allocation'),
    pick(p.foodQuality, 'foodQuality'),
    ...(phase === 'nestling' ? [pick(p.nestCare, 'nestCare')] : []),
    ...(phase === 'postFledge'
      ? [pick(p.postFledgeCare, 'postFledgeCare'), pick(p.learning, 'learning')]
      : []),
  ].filter((o) => o !== undefined);
}

/** 급이 강도 — 정하지 않았으면 `mid` */
export function feedIntensity(state: RunState, data: GameData): Intensity {
  return policy(state, data, 'intensity') as Intensity;
}

/** 새끼 사망 배율 (6.3) — `compete` × `clean` × `early`(postFledge) × `short` × `predator` */
export function chickDeathMult(state: RunState, data: GameData): number {
  const phase = phaseAt(state.calendar, state.at);
  let m = 1;
  for (const o of active(state, data, phase)) m *= o.chickDeathMult ?? 1;
  if (state.parenting && phase === 'postFledge') {
    const early = data.breeding.parenting.fledgeTiming[policy(state, data, 'fledgeTiming')];
    m *= early?.postFledgeChickDeathMult ?? 1;
  }
  return m;
}

/** 플레이어 소비에 더하는 것 (6.3) — `clean`·`varied`·`song` */
export function parentingCost(state: RunState, data: GameData): number {
  let cost = 0;
  for (const o of active(state, data, phaseAt(state.calendar, state.at))) {
    cost += o.playerCostPerStep ?? 0;
  }
  return cost;
}

/** 급이 비용(강도 몫) 배율 — `short` */
export function feedCostMult(state: RunState, data: GameData): number {
  let m = 1;
  for (const o of active(state, data, phaseAt(state.calendar, state.at))) m *= o.feedCostMult ?? 1;
  return m;
}

/** 플레이어 사망 위험 배율 — `quality` (3.1 보정 칸) */
export function playerRiskMult(state: RunState, data: GameData): number {
  let m = 1;
  for (const o of active(state, data, phaseAt(state.calendar, state.at)))
    m *= o.playerRiskMult ?? 1;
  return m;
}
