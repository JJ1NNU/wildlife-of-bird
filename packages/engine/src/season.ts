import type { GameData, Season, SeasonPolicyEffect } from '@wb/schema';
import { seasonOf } from './formulas.ts';
import { speciesBalance } from './step.ts';
import type { Choice, LogEntry, RunState, SeasonPolicyCard } from './types.ts';

/**
 * 계절 방침 관문 `seasonPolicy` — 11-season-policy. 각 계절 첫 시기의 첫 단계 흐름 끝에 늘 열리고(00-core-loop 4.6),
 * 고른 방침은 다음 단계부터 그 계절 끝까지 걸린다. 고르기 전·그 계절을 벗어나면 기본값(목록의 첫 방침).
 */

function seasonNow(state: RunState, data: GameData): Season {
  return seasonOf(speciesBalance(data, state.config.speciesId), state.at.period);
}

/** 이 종·계절의 방침 id 목록. 첫 방침이 기본값 */
function policyIds(state: RunState, data: GameData, season: Season): string[] {
  return data.seasonPolicy.species[state.config.speciesId]?.[season] ?? [];
}

/** 지금 걸린 방침의 효과 (3장). 없는 키는 배율 1 · 가산 0 */
export function seasonEffect(state: RunState, data: GameData): SeasonPolicyEffect {
  const season = seasonNow(state, data);
  const id =
    state.seasonPolicy?.season === season
      ? state.seasonPolicy.id
      : policyIds(state, data, season)[0];
  return (id && data.seasonPolicy.policies[id]) || {};
}

/** 관문이 열리는가 — 계절 첫 시기의 첫 단계이고 이 계절 방침을 아직 고르지 않았다 */
export function seasonDue(state: RunState, data: GameData): boolean {
  const season = seasonNow(state, data);
  const first = speciesBalance(data, state.config.speciesId).seasons[season][0];
  return (
    state.at.period === first &&
    state.at.step === 1 &&
    state.seasonPolicy?.season !== season &&
    policyIds(state, data, season).length > 0
  );
}

/** 계절이 바뀌면 지난 계절의 방침을 거둔다 — `nextStep`이 부른다 */
export function dropSeasonPolicy(state: RunState, data: GameData): RunState {
  if (!state.seasonPolicy || state.seasonPolicy.season === seasonNow(state, data)) return state;
  const { seasonPolicy: _s, ...rest } = state;
  return rest;
}

function label(data: GameData, id: string): string {
  return data.text.get(`seasonPolicy.${id}.name`) ?? id;
}

export function seasonChoices(state: RunState, data: GameData): Choice[] {
  return policyIds(state, data, seasonNow(state, data)).map((id) => ({
    id: `seasonPolicy.${id}`,
    kind: 'seasonPolicy',
    label: label(data, id),
  }));
}

/** 관문 카드 — 방침마다 효과 숫자 그대로(화면 S-14는 M2) */
export function seasonCards(state: RunState, data: GameData): SeasonPolicyCard[] {
  return policyIds(state, data, seasonNow(state, data)).map((id) => ({
    choiceId: `seasonPolicy.${id}`,
    effects: structuredClone(data.seasonPolicy.policies[id] ?? {}),
  }));
}

/** 방침을 건다. 관문은 닫지 않는다(api가 닫는다) */
export function chooseSeason(
  state: RunState,
  choiceId: string,
  data: GameData,
): { state: RunState; log: LogEntry[] } {
  const id = choiceId.slice('seasonPolicy.'.length);
  const season = seasonNow(state, data);
  return {
    state: { ...state, seasonPolicy: { season, id } },
    log: [{ at: state.at, type: 'season', text: `계절 방침: ${label(data, id)}` }],
  };
}
