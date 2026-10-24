import type { GameData } from '@wb/schema';
import { describe, expect, it } from 'vitest';
import type { Mate, RunState } from '../src/index.ts';
import { act, getChoices, getView, mateAccepts, newRun, preview } from '../src/index.ts';
import { actStep, seasonData, testData } from './fixture.ts';

describe('상호 선택 (04-breeding 2.4 예시)', () => {
  it('매력 54, 품질 52 · 58 · 66 → 예 · 예 · 아니오', () => {
    expect(mateAccepts(testData, 50, 60, [52, 58, 66])).toEqual([true, true, false]);
  });

  it('매력 24 → 품질이 가장 낮은 카드만 예', () => {
    expect(mateAccepts(testData, 20, 30, [52, 58, 66])).toEqual([true, false, false]);
  });
});

describe('짝 후보 관문 (04-breeding 2.2, 00-core-loop 4.6)', () => {
  const start = newRun({ speciesId: 'parus-minor', seed: 'mate', mode: 'free' }, testData);
  /** `pairing` 첫 단계(`period 5`), 에너지 넉넉히, 과시·사회 높게 — 후보 여럿을 받아들이게 */
  const pairing: RunState = {
    ...start,
    at: { year: 1, period: 5, step: 1 },
    player: {
      ...start.player,
      energy: 60,
      stats: { ...start.player.stats, display: 90, social: 90 },
    },
  };
  // 포식으로 끝나지 않는 행동을 고른다 — 결정론이라 이 시드에서 늘 같다
  const opened = actStep(pairing, 'action.rest', testData).state;

  it('흐름의 마지막에 열리고, 그 단계에 머물며, 관문 선택지만 준다', () => {
    expect(opened.gameOver).toBe(false);
    expect(opened.at).toEqual(pairing.at);
    // 번식기 시작 로그 (지표 M-05)
    expect(opened.log.filter((l) => l.type === 'breedingSeason')).toEqual([
      expect.objectContaining({ at: pairing.at, deltas: { breedable: 1 } }),
    ]);
    const choices = getChoices(opened, testData);
    expect(choices.map((c) => c.id).slice(-2)).toEqual([
      'mateCandidate.search',
      'mateCandidate.skip',
    ]);
    expect(choices.every((c) => c.kind === 'mateCandidate')).toBe(true);
    const gate = getView(opened, testData).gate;
    const cards = gate?.kind === 'mateCandidate' ? gate.cards : [];
    expect(cards.map((c) => c.choiceId)).toEqual(choices.slice(0, -2).map((c) => c.id));
    expect(preview(opened, choices[0]?.id ?? '', testData).deathRisk).toBe(0);
  });

  it('고르면 짝이 생기고 다음 단계로 간다. 같은 단계의 둘째 단계에서는 열리지 않는다', () => {
    const id = getChoices(opened, testData).find((c) => !c.disabled)?.id ?? '';
    const paired = act(opened, id, testData).state;
    expect(paired.gate).toBeUndefined();
    expect(paired.mate?.sex).toBe('male');
    expect(paired.mate?.bond).toBe(testData.breeding.mate.bondStart);
    expect(paired.at).toEqual({ year: 1, period: 5, step: 2 });
    expect(actStep(paired, 'action.rest', testData).state.gate).toBeUndefined();
  });

  /** 과시·사회 0 — 받아들이는 카드가 1장뿐 */
  const lonely: RunState = {
    ...pairing,
    player: { ...pairing.player, stats: { ...pairing.player.stats, display: 0, social: 0 } },
  };

  it('받아들이는 카드가 1장뿐이어도 관문이 열린다 — 자동 진행 없음 (2.7)', () => {
    const gate = actStep(lonely, 'action.rest', testData).state;
    expect(gate.gate?.kind).toBe('mateCandidate');
    expect(gate.at).toEqual(lonely.at);
  });

  it('더 찾아보기: 에너지 −searchEnergy, 다음 단계 끝에 새 후보로 다시 열린다. 늦게 맺으면 계절 방침 관문 (2.7)', () => {
    const m = testData.breeding.mate;
    const gate = actStep(lonely, 'action.rest', seasonData).state;
    expect(preview(gate, 'mateCandidate.search', seasonData).energyDelta).toEqual([
      -m.searchEnergy,
      -m.searchEnergy,
    ]);
    const searched = act(gate, 'mateCandidate.search', seasonData).state;
    expect(searched.at).toEqual({ year: 1, period: 5, step: 2 });
    expect(searched.gate).toBeUndefined();
    expect(searched.mate).toBeUndefined();
    const again = actStep(searched, 'action.rest', seasonData).state;
    expect(again.at).toEqual(searched.at);
    expect(again.gate?.kind).toBe('mateCandidate');
    // 번식기 시작 로그는 한 해에 한 번 (M-05)
    expect(again.log.filter((l) => l.type === 'breedingSeason')).toHaveLength(1);
    const id = getChoices(again, seasonData).find((c) => !c.disabled)?.id ?? '';
    const late = act(again, id, seasonData).state;
    expect(late.mate).toBeDefined();
    expect(late.gate?.kind).toBe('seasonPolicy');
    expect(late.at).toEqual(searched.at);
  });

  it('pairing 마지막 단계에서는 더 찾아보기를 막는다. 포기하면 그해 다시 열지 않는다 (2.7)', () => {
    const gate = actStep(lonely, 'action.rest', testData).state;
    const last = { ...gate, at: { year: 1, period: 6, step: gate.calendar[5]?.length ?? 1 } };
    const search = getChoices(last, testData).find((c) => c.id === 'mateCandidate.search');
    expect(search?.disabled?.reason).toBe('짝 찾기 시기가 끝난다');
    const skipped = act(gate, 'mateCandidate.skip', testData).state;
    expect(skipped.mate).toBeUndefined();
    expect(actStep(skipped, 'action.rest', testData).state.gate).toBeUndefined();
  });
});

describe('지난 짝 — 생존 · 이혼 · 재결합 (04-breeding 2.1 · 2.2)', () => {
  const start = newRun({ speciesId: 'parus-minor', seed: 'mate', mode: 'free' }, testData);
  const mate: Mate = {
    sex: 'male',
    age: 2,
    expYears: 2,
    potential: { foraging: 60, display: 60 },
    stats: { foraging: 50, display: 50 },
    personality: 'bold',
    personalityKnown: false,
    bond: 95,
  };
  const paired: RunState = { ...start, mate, player: { ...start.player, energy: 60 } };
  /** 종 번식 키만 바꾼 데이터 — 난수 결과를 0·1 확률로 고정한다 */
  const withSpecies = (patch: object): GameData => {
    const s = testData.breeding.species['parus-minor'];
    if (!s) throw new Error('박새 번식 데이터가 없다');
    return {
      ...testData,
      breeding: { ...testData.breeding, species: { 'parus-minor': { ...s, ...patch } } },
    };
  };

  it('period 1 진입에서 u ≥ mateYearSurvival이면 짝이 죽는다', () => {
    const last = start.calendar[23]?.length ?? 1;
    const eve: RunState = { ...paired, at: { year: 1, period: 24, step: last } };
    const dead = actStep(eve, 'action.rest', withSpecies({ mateYearSurvival: 0 }));
    expect(dead.state.at).toMatchObject({ period: 1, step: 1 });
    expect(dead.state.mate).toBeUndefined();
    expect(dead.log.some((l) => l.cause === 'mateDeath')).toBe(true);
    expect(dead.state.mateGone).toBe('mateDeath');
    const alive = actStep(eve, 'action.rest', withSpecies({ mateYearSurvival: 1 }));
    expect(alive.state.mate).toEqual({ ...mate, age: 3, expYears: 3 });
  });

  const pairing: RunState = { ...paired, at: { year: 2, period: 5, step: 1 } };

  it('이혼 확률은 지난해 독립 성공이면 afterSuccess, 아니면 afterFailure', () => {
    const data = withSpecies({ divorce: { afterSuccess: 1, afterFailure: 0 } });
    const success = actStep({ ...pairing, broodFledged: true }, 'action.rest', data);
    expect(success.log.some((l) => l.cause === 'divorce')).toBe(true);
    const gate = getView(success.state, data).gate;
    expect(gate?.cards.some((c) => 'previous' in c)).toBe(false);
    expect(gate?.kind === 'mateCandidate' && gate.previousGone).toBe('divorce');
    const failure = actStep({ ...pairing, broodFledged: false }, 'action.rest', data);
    expect(failure.log.some((l) => l.cause === 'divorce')).toBe(false);
    expect(failure.state.broodFledged).toBeUndefined();
  });

  it('남은 지난 짝은 맨 앞 카드 · 늘 받아들임 · 재결합하면 유대 상한 100, 성격 확인 (BR-7)', () => {
    const data = withSpecies({ divorce: { afterSuccess: 0, afterFailure: 0 } });
    const opened = actStep(pairing, 'action.rest', data).state;
    const cards = getView(opened, data).gate?.cards ?? [];
    expect(cards).toHaveLength(data.breeding.mate.candidates + 1);
    expect(cards[0]).toMatchObject({
      choiceId: 'mateCandidate.1',
      accepts: true,
      previous: true,
      potentialRange: { foraging: ['C', 'B'], display: ['C', 'B'] },
      bond: { now: 95, reunion: 100 },
    });
    const reunited = act(opened, 'mateCandidate.1', data).state;
    expect(reunited.mate?.bond).toBe(100);
    expect(reunited.mate?.personalityKnown).toBe(true);
  });
});
