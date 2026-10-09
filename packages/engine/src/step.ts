import type { Formulas, GameData, MapNode, Phase, SpeciesBalance, StatName } from '@wb/schema';
import { phaseAt } from './calendar.ts';
import { layingCost } from './clutch.ts';
import type { ActionId } from './formulas.ts';
import {
  broodCost,
  deathRisk,
  expenditure,
  fatCap,
  foodModFactor,
  forageEfficiency,
  growthMult,
  intake,
  nextEnergy,
  nextFeather,
  riskModFactor,
  seasonOf,
  statGain,
} from './formulas.ts';
import { nestLocked } from './nest.ts';
import { orderValue } from './order.ts';
import { feedCostMult, feedIntensity, parentingCost, playerRiskMult } from './parenting.ts';
import { seasonEffect } from './season.ts';
import type { Choice, RunState } from './types.ts';

/**
 * 칸 하나의 행동 판정 — `00-core-loop` 3장·3.5. 판정 1(에너지) → 2(스탯) → 3(위험) 순서는 고정이다(3.1).
 * 단계 공식을 계산한 뒤 칸 수로 나눈다(`01-formulas` 9.4).
 * 난수를 쓰지 않는다: 위험은 확률만 내고, 굴리는 것은 `act`다. 그래서 `preview`와 `act`가
 * 같은 계산을 공유한다.
 */

/** 문턱 비교의 부동소수 여유 — 스탯이 소수라 문턱에 딱 닿아도 합이 아래로 반올림될 수 있다 */
const EPS = 1e-9;

/** 칸 수 스탯의 r = 지금 스탯 합 ÷ 종 평균 잠재력 합 (`01-formulas` 9.6) */
function statSumRatio(state: RunState, data: GameData): { sum: number; mean: number } {
  const mean = data.formulas.stats.aptitudeMean;
  const species = speciesBalance(data, state.config.speciesId);
  const sumOf = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
  return {
    sum: sumOf(Object.values(state.player.stats)),
    mean: sumOf(Object.values(species.aptitude).map((g) => mean[g] ?? 0)),
  };
}

/**
 * 이 단계의 칸 수 (00-core-loop 3.5, 01-formulas 9.6). 번식기 = `slotsBase` ÷ 단계 수.
 * 평시(단계 1개) = `slotsBase` + 스탯 합 문턱을 넘은 개수. 루틴을 짜기 시작한 상태로 부르고
 * 실행 중에는 그 값을 고정한다 — 칸마다 스탯이 올라도 이번 루틴의 칸 수는 바뀌지 않는다.
 */
export function slotCount(state: RunState, data: GameData): number {
  const { slotsBase, extraSlotRatios } = data.formulas.routine;
  const stages = state.calendar[state.at.period - 1]?.length ?? 1;
  if (stages > 1) return slotsBase / stages;
  const { sum, mean } = statSumRatio(state, data);
  return slotsBase + extraSlotRatios.filter((ratio) => sum >= ratio * mean - EPS).length;
}

/** 다음 칸 문턱까지 남은 스탯 합. 번식기이거나 문턱을 모두 넘었으면 없음 (S-10 '다음 칸까지') */
export function nextSlotIn(state: RunState, data: GameData): number | undefined {
  if ((state.calendar[state.at.period - 1]?.length ?? 1) > 1) return undefined;
  const { sum, mean } = statSumRatio(state, data);
  const next = data.formulas.routine.extraSlotRatios.find((ratio) => sum < ratio * mean - EPS);
  return next === undefined ? undefined : Math.ceil(next * mean - sum);
}

/** `action.<행동>`으로 고르는 행동. `move`·`train`은 `move.<장소>`·`action.train.<스탯>`으로 (03-contracts 3장) */
const ACTIONS = ['forage', 'rest', 'social', 'explore'] as const;

/** 잠정(#21): 화면 글은 콘텐츠의 `data/text/`가 생기면 그리로 옮긴다 */
const ACTION_LABEL: Record<(typeof ACTIONS)[number], string> = {
  forage: '채식',
  rest: '휴식',
  social: '어울리기',
  explore: '살피기',
};
const STAT_LABEL: Record<StatName, string> = {
  flight: '비행',
  foraging: '채식',
  vigilance: '경계',
  stamina: '체력',
  display: '과시',
  social: '사회',
  navigation: '항법',
};

export function speciesBalance(data: GameData, speciesId: string): SpeciesBalance {
  const species = data.balance.get(speciesId);
  if (!species) {
    throw new Error(`밸런스가 없는 종이다: ${speciesId} (data/balance/species/${speciesId}.json)`);
  }
  return species;
}

export function mapNode(data: GameData, id: string): MapNode {
  const node = data.nodes.get(id);
  if (!node) throw new Error(`없는 장소다: ${id} (data/nodes/)`);
  return node;
}

/** 지금 자리의 행동 + 훈련(적성 스탯마다) + 연결된 목적지 — 평평한 목록 하나 (00-core-loop 3.2) */
export function stepChoices(state: RunState, data: GameData): Choice[] {
  const species = speciesBalance(data, state.config.speciesId);
  const choices: Choice[] = ACTIONS.map((a) => ({
    id: `action.${a}`,
    kind: 'action',
    label: ACTION_LABEL[a],
  }));
  for (const stat of Object.keys(species.aptitude) as StatName[]) {
    choices.push({ id: `action.train.${stat}`, kind: 'action', label: `${STAT_LABEL[stat]} 훈련` });
  }
  const locked = nestLocked(state);
  for (const id of mapNode(data, state.node).links) {
    choices.push({
      id: `move.${id}`,
      kind: 'node',
      label: `옮기기 · ${mapNode(data, id).nameKo}`,
      // 둥지 국면 동안 옮길 수 없다 (04-breeding 1장)
      ...(locked ? { disabled: { reason: '둥지를 떠날 수 없음' } } : {}),
    });
  }
  return choices;
}

/** 고른 선택이 이 단계에 뜻하는 것 */
interface StepAction {
  action: ActionId;
  /** `train`이 올리는 스탯 */
  trained?: StatName;
  /** 이 칸의 장소와 그 장소에서의 체류 칸 수 (옮기면 새 장소, 0) */
  node: string;
  stay: number;
}

function stepAction(state: RunState, choiceId: string): StepAction {
  const [head, action, stat] = choiceId.split('.');
  if (head === 'move' && action) return { action: 'move', node: action, stay: 0 };
  if (action === 'train') {
    return { action: 'train', trained: stat as StatName, node: state.node, stay: state.stay + 1 };
  }
  return { action: action as ActionId, node: state.node, stay: state.stay + 1 };
}

export interface StepOutcome {
  phase: Phase;
  node: string;
  stay: number;
  energy: number;
  starved: boolean;
  feather: number;
  stats: RunState['player']['stats'];
  /** 판정 3의 사망 확률. 굶어 죽었으면 계산하지 않는다(0) */
  risk: number;
}

/**
 * 짝 지시·도움이 소비에 더하는 것 (04-breeding 6.3): `feedMate` 비용을 더하고,
 * 짝이 날라 주는 먹이(`courtshipFeed`·`incubationFeed`)는 섭취가 아니라 소비에서 뺀다
 */
function orderCost(state: RunState, data: GameData): number {
  const b = data.breeding;
  let cost = 0;
  for (const [id, h] of Object.entries(b.help)) {
    cost += orderValue(state, `help.${id}`, 0, h.playerCostPerStep);
  }
  for (const [id, o] of Object.entries(b.orders)) {
    if (o.playerEnergyPerStep)
      cost -= orderValue(state, `mateOrder.${id}`, 0, o.playerEnergyPerStep);
  }
  return cost;
}

/** 소비(2.4)의 포란·급이 입력 — 지금 단계·둥지·방침 */
function broodInput(state: RunState, data: GameData) {
  const phase = phaseAt(state.calendar, state.at);
  return {
    phase,
    // 박새는 암컷만 포란한다 (01-formulas 2.4)
    incubating:
      state.player.sex === 'female' && phase === 'incubation' && state.nest?.eggs !== undefined,
    feeding: (state.nest?.chicks ?? 0) > 0,
    feedIntensity: feedIntensity(state, data),
    feedCostMult: feedCostMult(state, data),
    chicks: state.nest?.chicks ?? 0,
  };
}

/** 내 번식 비용 — 이 단계 소비의 번식 몫: 포란·급이 + 산란 + 지시·도움 + 방침 (04-breeding 6.3 '번식 비용 칸') */
export function breedingCost(state: RunState, data: GameData): number {
  return (
    broodCost(data.formulas, broodInput(state, data)) +
    layingCost(data, state) +
    orderCost(state, data) +
    parentingCost(state, data)
  );
}

/** 그 시기에 걸린 `riskMod`의 곱 (01-formulas 3.1 · 3.2 위험 보정). 없으면 1 */
export function periodRiskFactor(state: RunState, data: GameData): number {
  return riskModFactor(data.effects.riskMod, state.periodMods?.risk ?? []);
}

/** 1.3 성장 배율: 계승한 새끼는 나이 ≤ `growthUntilAge` 동안 은수저 성장 배율. 런 시작 개체는 1 */
export function growthNow(f: Formulas, p: RunState['player']): number {
  return p.silverSpoon !== undefined && p.age <= f.silverSpoon.growthUntilAge
    ? growthMult(f, p.silverSpoon)
    : 1;
}

/** 칸 하나의 판정 1·2·3을 계산한다. 난수 없음 */
export function judgeStep(
  state: RunState,
  choiceId: string,
  data: GameData,
  n = slotCount(state, data),
): StepOutcome {
  const f = data.formulas;
  const species = speciesBalance(data, state.config.speciesId);
  const p = state.player;
  const { action, trained, node, stay } = stepAction(state, choiceId);
  const phase = phaseAt(state.calendar, state.at);
  const season = seasonOf(species, state.at.period);
  const tiers = mapNode(data, node).seasons[season];
  const stat = (s: StatName) => p.stats[s] ?? 0;
  // 계절 방침 (11-season-policy 3장)
  const sp = seasonEffect(state, data);

  // 판정 1 — 에너지 수지 (01-formulas 2장)
  const cap = fatCap(f, stat('stamina'));
  const gained =
    intake(f, {
      food: tiers.food,
      competition: tiers.competition,
      foodModFactor: foodModFactor(data.effects.foodMod, state.periodMods?.food ?? []),
      efficiency: forageEfficiency(f, stat('foraging'), p.expYears),
      action,
      // 9.4: 고갈은 연속 체류 ÷ 칸 수 — 같은 시간 머물면 단계 때와 같은 만큼 준다
      stay: stay / n,
    }) * (sp.intakeMult ?? 1);
  const spent = Math.max(
    0,
    expenditure(f, species, {
      period: state.at.period,
      action,
      flight: stat('flight'),
      ...broodInput(state, data),
    }) +
      layingCost(data, state) +
      orderCost(state, data) +
      parentingCost(state, data) +
      (sp.playerCostPerStep ?? 0),
  );
  // 9.4: 에너지 변화 전체(잠 회복 포함)와 깃털 변화는 ÷ 칸 수
  const recover = species.sleepRecoverPerStep[season];
  const { energy, starved } = nextEnergy(cap, p.energy, gained / n, (spent - recover) / n);
  const feather =
    p.feather + (nextFeather(f, p.feather, phase, action, sp.moltRecoverMult) - p.feather) / n;
  if (starved) return { phase, node, stay, energy, starved, feather, stats: p.stats, risk: 0 };

  // 판정 2 — 스탯 상승 (01-formulas 1.3)
  const stats = { ...p.stats };
  const growth = growthNow(f, p);
  for (const [key, base] of Object.entries(f.actions[action].gain)) {
    const s = (key === 'chosen' ? trained : key) as StatName | undefined;
    if (!s || base === undefined) continue;
    const potential = p.potential[s] ?? 0;
    const current = stats[s] ?? 0;
    const gain =
      statGain(f, species, { stat: s, base, potential, current, growthMult: growth }) *
      (sp.statGainMult?.[s] ?? 1);
    stats[s] = Math.min(potential, current + gain);
  }

  // 판정 3 — 위험 (01-formulas 3.1). 같은 단계에 오른 경계가 바로 쓰인다
  const stepRisk = deathRisk(f, species, {
    nodeRisk: tiers.risk,
    phase,
    season,
    action,
    // 위험 보정 = 그 시기의 이벤트·환경 `riskMod` × 육아 방침 `quality` × 계절 방침
    riskModFactor:
      periodRiskFactor(state, data) * playerRiskMult(state, data) * (sp.playerRiskMult ?? 1),
    vigilance: stats.vigilance ?? 0,
    flight: stats.flight ?? 0,
    expYears: p.expYears,
    r: energy / cap,
    feather,
    age: p.age,
    silverSpoon: p.silverSpoon ?? 0,
    injured: (state.injury ?? 0) > 0,
  });
  // 9.4: 칸 위험 = 1 − (1 − 단계 위험)^(1/n) — 모든 칸이 같은 행동이면 단계 위험과 같다
  const risk = 1 - (1 - stepRisk) ** (1 / n);
  return { phase, node, stay, energy, starved, feather, stats, risk };
}
