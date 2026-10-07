import type { GameData, StatName } from '@wb/schema';
import { endBreeding } from './brood.ts';
import { advance, phaseAt } from './calendar.ts';
import { fledgling } from './clutch.ts';
import { yearSurvival } from './forecast.ts';
import { agingRiskMult, fatCap } from './formulas.ts';
import { potentialRange } from './mate.ts';
import { speciesBalance } from './step.ts';
import type {
  Choice,
  InheritanceChickCard,
  InheritanceStayCard,
  Life,
  LifeRecord,
  LogEntry,
  RunState,
} from './types.ts';

/**
 * 계승 관문 `inheritance` (05-inheritance 5장 · 00-core-loop 6.1).
 * `postFledge` 마지막 단계의 판정 뒤, 새끼가 1마리 이상 살아 있으면 독립 — 총 번식 수 +1 확정 → 관문.
 */

/** 가계도 한 줄을 닫는다 — 지금 개체의 조작이 끝났다 (8장) */
export function endLife(state: RunState, reason: LifeRecord['reason']): LifeRecord {
  return { ...state.life, end: { at: state.at, age: state.player.age }, reason };
}

/** 새 개체의 생애를 연다. 런 시작 개체는 1세대 */
export function startLife(state: Pick<RunState, 'at' | 'player'>, generation: number): Life {
  const { at, player } = state;
  return { generation, sex: player.sex, start: { at, age: player.age }, breeding: 0, fledged: 0 };
}

/** 독립하나 — 지금이 `postFledge` 마지막 단계이고 새끼가 살아 있다 */
export function inheritanceDue(state: RunState): boolean {
  if ((state.nest?.chicks ?? 0) === 0 || phaseAt(state.calendar, state.at) !== 'postFledge') {
    return false;
  }
  const next = advance(state.at, state.calendar);
  return phaseAt(state.calendar, next) !== 'postFledge';
}

/** 독립 → 총 번식 수 +1 확정 → 관문을 연다 (6.1: 점수가 먼저) */
export function openInheritance(state: RunState): { state: RunState; log: LogEntry[] } {
  const chicks = state.nest?.chicks ?? 0;
  const totalBreeding = state.totalBreeding + 1;
  const life = {
    ...state.life,
    breeding: state.life.breeding + 1,
    fledged: state.life.fledged + chicks,
  };
  return {
    state: { ...state, totalBreeding, life, gate: { kind: 'inheritance' } },
    log: [
      {
        at: state.at,
        type: 'breeding',
        text: `새끼 ${chicks}마리가 독립했다 — 번식 성공 ${totalBreeding}번째`,
        deltas: { totalBreeding: 1, fledged: chicks },
      },
    ],
  };
}

export function inheritanceChoices(state: RunState): Choice[] {
  const young = state.nest?.young ?? [];
  return [
    { id: 'inherit.stay', kind: 'inheritance', label: '이 개체로 1년 더' },
    ...young.map((_, i) => ({
      id: `inherit.chick.${i + 1}`,
      kind: 'inheritance' as const,
      label: `새끼 ${i + 1}로 계승`,
    })),
  ];
}

/** 화면 S-24 — 지금 개체 카드 (5장 '지금 개체') */
export function stayCard(state: RunState, data: GameData): InheritanceStayCard {
  const p = state.player;
  const species = speciesBalance(data, state.config.speciesId);
  return {
    choiceId: 'inherit.stay',
    age: p.age,
    agingMult: agingRiskMult(data.formulas, species, p.age),
    ...(state.mate ? { bond: state.mate.bond } : {}),
    yearSurvival: yearSurvival(data, state.config.speciesId, state.node, state.at, {
      age: p.age,
      expYears: p.expYears,
      vigilance: p.stats.vigilance ?? 0,
      flight: p.stats.flight ?? 0,
      silverSpoon: 0,
    }),
  };
}

/** 화면 S-24 — 새끼 카드, 부화 순서 (5장 '새끼 카드마다') */
export function chickCards(state: RunState, data: GameData): InheritanceChickCard[] {
  const f = data.formulas;
  return (state.nest?.young ?? []).flatMap((_, i) => {
    const c = fledgling(state, data, i);
    if (!c) return [];
    return [
      {
        choiceId: `inherit.chick.${i + 1}`,
        sex: c.sex,
        potentialRange: Object.fromEntries(
          Object.entries(c.potential).map(([stat, v]) => [stat, potentialRange(f, v ?? 0)]),
        ) as Partial<Record<StatName, [string, string]>>,
        silverSpoon: c.silverSpoon,
        firstWinter: c.firstWinter,
        yearSurvival: yearSurvival(data, state.config.speciesId, state.node, state.at, {
          age: 0,
          expYears: 0,
          vigilance: c.stats.vigilance ?? 0,
          flight: c.stats.flight ?? 0,
          silverSpoon: c.silverSpoon,
        }),
      },
    ];
  });
}

/**
 * 관문을 닫는다. 새끼들은 독립했으니 둥지를 거둔다.
 * 잔류(7.1)면 개체는 그대로. 계승(7장)이면 고른 새끼가 조작 개체가 되고 짝·둥지 관련 상태는 없어지며,
 * 그 해의 2차 번식은 없다(분할 해제).
 */
export function chooseInheritance(
  state: RunState,
  choiceId: string,
  data: GameData,
): { state: RunState; log: LogEntry[] } {
  const { gate: _g, nest: _n, ...closed } = state;
  if (choiceId === 'inherit.stay') {
    return {
      state: { ...closed, broodFledged: true },
      log: [{ at: state.at, type: 'inheritance', text: '이 개체로 1년 더 살기로 했다' }],
    };
  }
  const index = Number(choiceId.slice('inherit.chick.'.length)) - 1;
  const chick = fledgling(state, data, index);
  if (!chick) throw new Error(`없는 새끼다: ${choiceId}`);
  const f = data.formulas;
  const {
    mate: _m,
    order: _o,
    parenting: _p,
    recentHelp: _h,
    mateGone: _mg,
    broodFledged: _b,
    ...rest
  } = closed;
  const player = {
    speciesId: state.player.speciesId,
    sex: chick.sex,
    age: 0,
    energy: fatCap(f, chick.stats.stamina ?? 0) * f.energy.inheritStartRatio,
    stats: chick.stats,
    potential: chick.potential,
    feather: f.feather.runStart,
    expYears: 0,
    silverSpoon: chick.silverSpoon,
  };
  return {
    state: endBreeding({
      ...rest,
      player,
      life: startLife({ at: state.at, player }, state.life.generation + 1),
    }),
    log: [
      {
        at: state.at,
        type: 'inheritance',
        text: `새끼 ${index + 1}로 계승했다`,
        life: endLife(state, 'inherit'),
      },
    ],
  };
}
