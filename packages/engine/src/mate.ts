import type { GameData, Phase, StatName } from '@wb/schema';
import { phaseAt } from './calendar.ts';
import { statGrade } from './formulas.ts';
import type { RngState } from './rng.ts';
import { nextChance, nextInt, nextNormal } from './rng.ts';
import { speciesBalance } from './step.ts';
import type { CalendarAt, Choice, MateCandidate, MateCandidateCard, RunState } from './types.ts';

/**
 * 짝 후보 관문 `mateCandidate` — 04-breeding 2.2~2.4. `pairing`의 첫 단계, 흐름의 마지막에 열린다.
 * 잠정(#21): 지난 짝의 생존·이혼·재결합 카드(2.1)는 종 키(`mateYearSurvival`·`divorce`)가 생기면 —
 * 그 전에는 해마다 새 후보만 나오고, 고르면 짝이 바뀐다.
 */

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/** 바로 앞 단계의 국면. `period 1`의 첫 단계면 같은 단계표의 `period 24` 마지막 단계 */
function previousPhase(calendar: Phase[][], at: CalendarAt): Phase | undefined {
  if (at.step > 1) return calendar[at.period - 1]?.[at.step - 2];
  const prev = calendar[(at.period + calendar.length - 2) % calendar.length];
  return prev?.[prev.length - 1];
}

/** 이 단계가 그 국면의 첫 단계인가 (00-core-loop 4.6) */
export function isPhaseStart(calendar: Phase[][], at: CalendarAt, phase: Phase): boolean {
  return phaseAt(calendar, at) === phase && previousPhase(calendar, at) !== phase;
}

/** 새 후보 `mate.candidates`장을 시드 난수로 만든다 (2.2 표 · 2.3 신호 · 2.4 상호 선택) */
export function makeCandidates(
  state: RunState,
  data: GameData,
): { rng: RngState; candidates: MateCandidate[] } {
  const f = data.formulas;
  const m = data.breeding.mate;
  const h = f.heredity;
  const species = speciesBalance(data, state.config.speciesId);
  let rng = state.rng;
  const candidates: MateCandidate[] = [];
  for (let i = 0; i < m.candidates; i += 1) {
    const potential: Partial<Record<StatName, number>> = {};
    const stats: Partial<Record<StatName, number>> = {};
    for (const [stat, grade] of Object.entries(species.aptitude)) {
      const z = nextNormal(rng);
      rng = z.state;
      const p = clamp(
        (f.stats.aptitudeMean[grade] ?? 0) + z.value * m.candidatePotentialSd,
        h.potentialMin,
        h.potentialMax,
      );
      potential[stat as StatName] = p;
      stats[stat as StatName] = p * m.candidateCurrentRatio;
    }
    const age = nextInt(rng, m.candidateAgeMin, m.candidateAgeMax);
    const bold = nextChance(age.state, m.boldShare);
    const noise = nextNormal(bold.state);
    const hintRight = nextChance(noise.state, m.hintAccuracy);
    rng = hintRight.state;
    const personality = bold.value ? 'bold' : 'shy';
    const values = Object.values(potential);
    candidates.push({
      sex: state.player.sex === 'female' ? 'male' : 'female',
      age: age.value,
      expYears: age.value,
      potential,
      stats,
      personality,
      personalityKnown: false,
      bond: m.bondStart,
      quality: values.reduce((a, b) => a + b, 0) / values.length,
      accepts: false,
      plumageNoise: noise.value * m.signalSd,
      hint: hintRight.value ? personality : personality === 'bold' ? 'shy' : 'bold',
    });
  }

  const p = state.player.stats;
  const accepts = mateAccepts(
    data,
    p.display ?? 0,
    p.social ?? 0,
    candidates.map((c) => c.quality),
  );
  candidates.forEach((c, i) => {
    c.accepts = accepts[i] ?? false;
  });
  return { rng, candidates };
}

/** 2.4 상호 선택: 매력 ≥ 품질 − reachMargin. 품질이 가장 낮은 1장은 늘 받아들인다. 난수 없음 */
export function mateAccepts(
  data: GameData,
  display: number,
  social: number,
  qualities: number[],
): boolean[] {
  const m = data.breeding.mate;
  const attract = m.attractDisplayWeight * display + (1 - m.attractDisplayWeight) * social;
  const lowest = Math.min(...qualities);
  return qualities.map((q) => q === lowest || attract >= q - m.reachMargin);
}

/** 관문 선택지. 받아들이지 않는 카드는 `disabled` */
export function mateChoices(candidates: MateCandidate[]): Choice[] {
  return candidates.map((c, i) => ({
    id: `mateCandidate.${i + 1}`,
    kind: 'mateCandidate',
    label: `후보 ${i + 1}`,
    ...(c.accepts ? {} : { disabled: { reason: '노래가 더 필요하다' } }),
  }));
}

/** 화면 S-20 카드 — 신호만 낸다 */
export function mateCards(data: GameData, candidates: MateCandidate[]): MateCandidateCard[] {
  const f = data.formulas;
  return candidates.map((c, i) => ({
    choiceId: `mateCandidate.${i + 1}`,
    plumage: statGrade(f, c.quality + c.plumageNoise),
    song: statGrade(f, c.stats.display ?? 0),
    age: c.age,
    hint: c.hint,
    accepts: c.accepts,
  }));
}
