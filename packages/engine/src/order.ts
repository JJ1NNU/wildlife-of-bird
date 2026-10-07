import type { GameData, Phase } from '@wb/schema';
import { phaseAt } from './calendar.ts';
import { acceptanceBand } from './display.ts';
import { mateAcceptance, seasonOf } from './formulas.ts';
import { isPhaseStart } from './mate.ts';
import { nextChance, nextFloat } from './rng.ts';
import { mapNode, speciesBalance } from './step.ts';
import type { Choice, LogEntry, MateOrder, MateOrderCard, RunState } from './types.ts';

/**
 * 짝 지시 관문 `mateOrder` — 04-breeding 3장. 짝이 있는 둥지 국면의 첫 단계, 첫 칸보다 먼저 열린다.
 * 고르면 같은 단계에서 이어 칸을 고른다. 지시는 그 국면이 끝날 때까지 걸린다.
 * `guardNest`는 둥지 손실(`nest.ts` `nestSurvives`). `feedHigh`는 은수저 충족도(`clutch.ts` `feedChicks`).
 */

/** 짝 지시를 받는 둥지 국면 (3.1) */
const ORDER_PHASES: readonly Phase[] = [
  'nestSite',
  'laying',
  'incubation',
  'nestling',
  'postFledge',
];

/** 잠정(#21): 화면 글은 콘텐츠의 `data/text/`가 생기면 그리로 옮긴다 */
const ORDER_LABEL: Record<string, string> = {
  none: '지시 없음',
  patrol: '영역을 돌며 지켜 줘',
  courtshipFeed: '먹이를 가져다줘',
  incubationFeed: '품는 동안 먹이를 날라 줘',
  incubate: '대신 알을 품어 줘',
  guardNest: '둥지 가까이 지켜 줘',
  feedHigh: '새끼를 더 많이 먹여 줘',
  splitBrood: '새끼를 나눠 맡자',
  feedMate: '짝에게 먹이를 나른다',
};
const IMPOSSIBLE_REASON = '박새는 암컷만 알을 품어요';

/** 이 단계에 짝 지시 관문이 열리나 — 짝이 있고 둥지 국면의 첫 단계. `nestSite` 뒤로는 둥지가 있어야 */
export function orderDue(state: RunState): boolean {
  const phase = phaseAt(state.calendar, state.at);
  if (!state.mate || !ORDER_PHASES.includes(phase)) return false;
  if (phase !== 'nestSite' && !state.nest) return false;
  return isPhaseStart(state.calendar, state.at, phase);
}

/** 관문 선택지 id — `mateOrder.none` + 그 국면·짝 성별의 지시 + 플레이어 성별의 도움 (3.1) */
export function orderOptions(state: RunState, data: GameData): string[] {
  const phase = phaseAt(state.calendar, state.at);
  const mateSex = state.mate?.sex;
  if (!mateSex) return [];
  const ids = ['mateOrder.none'];
  for (const [id, o] of Object.entries(data.breeding.orders)) {
    if (!o.phases.includes(phase) || !o.role[mateSex]) continue;
    // 짝이 그 국면에 포란하는 성별이면 둥지 지키기는 없다 (3.2 — 박새는 암컷만 포란)
    if (id === 'guardNest' && phase === 'incubation' && mateSex === 'female') continue;
    ids.push(`mateOrder.${id}`);
  }
  for (const [id, h] of Object.entries(data.breeding.help)) {
    if (h.phases.includes(phase) && h.sex === state.player.sex) ids.push(`help.${id}`);
  }
  return ids;
}

function orderKey(choiceId: string): string {
  return choiceId.split('.')[1] ?? '';
}

function isImpossible(state: RunState, data: GameData, choiceId: string): boolean {
  const o = choiceId.startsWith('mateOrder.')
    ? data.breeding.orders[orderKey(choiceId)]
    : undefined;
  return o !== undefined && state.mate !== undefined && o.role[state.mate.sex] === 'impossible';
}

export function orderChoices(state: RunState, data: GameData, options: string[]): Choice[] {
  return options.map((id) => ({
    id,
    kind: 'mateOrder',
    label: ORDER_LABEL[orderKey(id)] ?? id,
    ...(isImpossible(state, data, id) ? { disabled: { reason: IMPOSSIBLE_REASON } } : {}),
  }));
}

/** 2.6 짝 r — 지금 걸린 지시·도움의 `mateR`까지 */
export function mateR(state: RunState, data: GameData): number {
  const f = data.formulas;
  const species = speciesBalance(data, state.config.speciesId);
  const food = mapNode(data, state.node).seasons[seasonOf(species, state.at.period)].food;
  // 잠정(#21): 먹이 보정(`foodMod`)은 이벤트·환경 조각에서 — 지금은 1
  const base = (data.breeding.mate.rBase * f.nodeTiers.food[food]) / f.nodeTiers.food.medium;
  return Math.min(1, Math.max(0, base + (state.order?.mateR ?? 0)));
}

/** 3.3 수락률. `shown`이면 성격이 확인되기 전에는 `neutral`로 (2.5 — 화면용) */
export function orderAcceptance(
  state: RunState,
  data: GameData,
  choiceId: string,
  shown = false,
): number | undefined {
  const o = choiceId.startsWith('mateOrder.')
    ? data.breeding.orders[orderKey(choiceId)]
    : undefined;
  const mate = state.mate;
  if (!o || !mate || !o.cost) return undefined;
  const role = o.role[mate.sex];
  if (!role || role === 'impossible') return undefined;
  const personality =
    !o.risky || (shown && !mate.personalityKnown)
      ? 'neutral'
      : mate.personality === 'bold'
        ? 'match'
        : 'mismatch';
  return mateAcceptance(data.formulas, {
    role,
    personality,
    mateR: mateR(state, data),
    bond: mate.bond,
    recentHelps: (state.recentHelp ?? []).filter(Boolean).length,
    cost: o.cost,
    social: state.player.stats.social ?? 0,
  });
}

export function orderCards(state: RunState, data: GameData, options: string[]): MateOrderCard[] {
  return options.map((choiceId) => {
    const p = orderAcceptance(state, data, choiceId, true);
    return {
      choiceId,
      ...(p === undefined ? {} : { acceptance: acceptanceBand(data.formulas, p) }),
    };
  });
}

/** 지시를 건다 — 수락은 그 자리에서 한 번 굴리고, 거절이면 효과 비율 f도 한 번 (3.3·3.5) */
export function giveOrder(
  state: RunState,
  choiceId: string,
  data: GameData,
): { state: RunState; log: LogEntry[] } {
  const phase = phaseAt(state.calendar, state.at);
  const mate = state.mate;
  if (!mate) throw new Error('짝 없이 짝 지시 관문이 열려 있다');
  const key = orderKey(choiceId);
  if (choiceId === 'mateOrder.none') {
    return { state, log: [{ at: state.at, type: 'order', text: '짝에게 지시하지 않았다' }] };
  }
  if (choiceId.startsWith('help.')) {
    const h = data.breeding.help[key];
    if (!h) throw new Error(`없는 도움이다: ${choiceId}`);
    const order: MateOrder = { id: choiceId, phase, accepted: true, effect: 1, mateR: h.mateR };
    return {
      state: { ...state, order },
      log: [{ at: state.at, type: 'order', text: ORDER_LABEL[key] ?? key }],
    };
  }

  const o = data.breeding.orders[key];
  const p = orderAcceptance(state, data, choiceId);
  if (!o || p === undefined) throw new Error(`걸 수 없는 지시다: ${choiceId}`);
  const m = data.breeding.mate;
  const f = data.formulas.mate;
  const rolled = nextChance(state.rng, p);
  let rng = rolled.state;
  let effect = 1;
  if (!rolled.value) {
    const u = nextFloat(rng);
    rng = u.state;
    effect = f.refusalEffectMin + u.value * (f.refusalEffectMax - f.refusalEffectMin);
  }
  const orders = (mate.orders ?? 0) + 1;
  const nextMate = {
    ...mate,
    orders,
    personalityKnown: mate.personalityKnown || orders >= m.revealAfterOrders,
    bond: rolled.value ? Math.min(m.bondMax, mate.bond + m.bondPerAccepted) : mate.bond,
  };
  const order: MateOrder = {
    id: choiceId,
    phase,
    accepted: rolled.value,
    effect,
    // 거절하면 짝 r에 걸리지 않는다 (3.5)
    mateR: rolled.value ? (o.mateR ?? 0) : 0,
  };
  const label = ORDER_LABEL[key] ?? key;
  const text = rolled.value
    ? `짝이 지시를 받아들였다: ${label}`
    : `짝이 다른 일을 했다: ${label} (효과 −${Math.round((1 - effect) * 100)}%)`;
  return {
    state: { ...state, rng, mate: nextMate, order },
    log: [
      {
        at: state.at,
        type: 'order',
        text,
        deltas: { acceptance: p, effect },
        ...(rolled.value ? {} : { cause: 'refused' }),
      },
    ],
  };
}

/**
 * 지금 걸린 지시가 `id`(`mateOrder.<id>`·`help.<id>`)면 `없음 + 비율 × (수락 − 없음)`, 아니면 `none` (3.5).
 * 비율은 수락 1, 거절 f. 짝이 없으면 지시도 없다(BR-2)
 */
export function orderValue(state: RunState, id: string, none: number, full: number): number {
  const o = state.order;
  if (!o || o.id !== id || !state.mate) return none;
  return none + o.effect * (full - none);
}

/**
 * 다음 단계로 간 뒤: 상호성 창(3.3)에 지난 단계가 도움 단계였는지 적고,
 * 국면이 바뀌었으면 지시를 거둔다. 짝이 없으면 지시도 없다(BR-2)
 */
export function carryOrder(prev: RunState, next: RunState, data: GameData): RunState {
  const window = data.formulas.mate.reciprocityWindowSteps;
  // 급이 국면에 급이 강도 `high`인 단계도 도움 단계다 (04-breeding 6.1)
  const prevPhase = phaseAt(prev.calendar, prev.at);
  const fedHigh =
    prev.parenting?.intensity === 'high' &&
    (prevPhase === 'nestling' || prevPhase === 'postFledge');
  const helped = (prev.order?.id.startsWith('help.') ?? false) || fedHigh;
  const recentHelp = [...(prev.recentHelp ?? []), helped].slice(-window);
  const { order, ...rest } = next;
  const keep = order && next.mate && order.phase === phaseAt(next.calendar, next.at);
  return { ...rest, recentHelp, ...(keep ? { order } : {}) };
}
