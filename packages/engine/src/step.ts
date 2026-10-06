import type { GameData, MapNode, Phase, SpeciesBalance, StatName } from '@wb/schema';
import { phaseAt } from './calendar.ts';
import type { ActionId } from './formulas.ts';
import {
  deathRisk,
  expenditure,
  fatCap,
  forageEfficiency,
  intake,
  nextEnergy,
  nextFeather,
  seasonOf,
  statGain,
} from './formulas.ts';
import { nestLocked } from './nest.ts';
import type { Choice, RunState } from './types.ts';

/**
 * 한 단계의 행동 판정 — `00-core-loop` 3장. 판정 1(에너지) → 2(스탯) → 3(위험) 순서는 고정이다(3.1).
 * 난수를 쓰지 않는다: 위험은 확률만 내고, 굴리는 것은 `act`다. 그래서 `preview`와 `act`가
 * 같은 계산을 공유한다.
 */

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
      ...(locked ? { disabled: { reason: '둥지를 떠날 수 없다' } } : {}),
    });
  }
  return choices;
}

/** 고른 선택이 이 단계에 뜻하는 것 */
interface StepAction {
  action: ActionId;
  /** `train`이 올리는 스탯 */
  trained?: StatName;
  /** 이 단계의 장소와 그 장소에서의 체류 (옮기면 새 장소, 0) */
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

/** 판정 1·2·3을 계산한다. 난수 없음 */
export function judgeStep(state: RunState, choiceId: string, data: GameData): StepOutcome {
  const f = data.formulas;
  const species = speciesBalance(data, state.config.speciesId);
  const p = state.player;
  const { action, trained, node, stay } = stepAction(state, choiceId);
  const phase = phaseAt(state.calendar, state.at);
  const season = seasonOf(species, state.at.period);
  const tiers = mapNode(data, node).seasons[season];
  const stat = (s: StatName) => p.stats[s] ?? 0;

  // 판정 1 — 에너지 수지 (01-formulas 2장)
  const cap = fatCap(f, stat('stamina'));
  const gained = intake(f, {
    food: tiers.food,
    competition: tiers.competition,
    foodModFactor: 1,
    efficiency: forageEfficiency(f, stat('foraging'), p.expYears),
    action,
    stay,
  });
  const spent = expenditure(f, species, {
    period: state.at.period,
    phase,
    action,
    flight: stat('flight'),
    // 잠정(#21): 둥지·새끼는 번식 조각에서 — 그 전에는 포란·급이 비용이 없다
    incubating: false,
    feeding: false,
    feedIntensity: 'mid',
    chicks: 0,
  });
  const { energy, starved } = nextEnergy(cap, p.energy, gained, spent);
  const feather = nextFeather(f, p.feather, phase, action);
  if (starved) return { phase, node, stay, energy, starved, feather, stats: p.stats, risk: 0 };

  // 판정 2 — 스탯 상승 (01-formulas 1.3)
  const stats = { ...p.stats };
  for (const [key, base] of Object.entries(f.actions[action].gain)) {
    const s = (key === 'chosen' ? trained : key) as StatName | undefined;
    if (!s || base === undefined) continue;
    const potential = p.potential[s] ?? 0;
    const current = stats[s] ?? 0;
    // 잠정(#21): 성장 배율 — 은수저 지수는 계승한 새끼부터 생긴다. 런 시작 개체는 1
    const gain = statGain(f, species, { stat: s, base, potential, current, growthMult: 1 });
    stats[s] = Math.min(potential, current + gain);
  }

  // 판정 3 — 위험 (01-formulas 3.1). 같은 단계에 오른 경계가 바로 쓰인다
  const risk = deathRisk(f, species, {
    nodeRisk: tiers.risk,
    phase,
    season,
    action,
    riskModFactor: 1,
    vigilance: stats.vigilance ?? 0,
    expYears: p.expYears,
    r: energy / cap,
    feather,
    age: p.age,
    silverSpoon: 0,
    injured: false,
  });
  return { phase, node, stay, energy, starved, feather, stats, risk };
}
