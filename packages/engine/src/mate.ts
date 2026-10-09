import type { Formulas, GameData, Phase, StatName } from '@wb/schema';
import { phaseAt } from './calendar.ts';
import { statGrade } from './formulas.ts';
import type { RngState } from './rng.ts';
import { nextChance, nextInt, nextNormal } from './rng.ts';
import { speciesBalance } from './step.ts';
import type {
  CalendarAt,
  Choice,
  LogEntry,
  Mate,
  MateCandidate,
  MateCandidateCard,
  RunState,
} from './types.ts';

/**
 * 짝 후보 관문 `mateCandidate` — 04-breeding 2.1~2.4. `pairing`의 첫 단계, 흐름의 마지막에 열린다.
 * 지난 짝은 `period 1`에 1년 생존을, 관문 직전에 이혼을 굴리고, 남아 있으면 카드 맨 앞에 나온다(재결합).
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

function breedingSpecies(data: GameData, speciesId: string) {
  const s = data.breeding.species[speciesId];
  if (!s) throw new Error(`번식 데이터가 없는 종이다: ${speciesId} (data/balance/breeding.json)`);
  return s;
}

/** `period 1` 진입(나이 +1 직후): 짝의 1년 생존. `u ≥ mateYearSurvival`이면 짝 사망 (2.1). 살면 나이·경험 +1 (2.2 표) */
export function mateYear(state: RunState, data: GameData): { state: RunState; log: LogEntry[] } {
  if (!state.mate) return { state, log: [] };
  const s = breedingSpecies(data, state.config.speciesId);
  const lived = nextChance(state.rng, s.mateYearSurvival);
  if (lived.value) {
    const mate = { ...state.mate, age: state.mate.age + 1, expYears: state.mate.expYears + 1 };
    return { state: { ...state, mate, rng: lived.state }, log: [] };
  }
  const { mate: _m, ...rest } = state;
  return {
    state: { ...rest, rng: lived.state, mateGone: 'mateDeath' },
    log: [{ at: state.at, type: 'mate', text: '짝이 겨울을 넘기지 못했다', cause: 'mateDeath' }],
  };
}

/**
 * `pairing` 첫 단계, 관문 직전: 짝이 살아 있으면 이혼을 굴린다 (2.1).
 * 지난해 마지막 둥지에서 새끼가 독립했으면 `afterSuccess`, 아니면 `afterFailure`. 결과 기록은 여기서 지운다
 */
export function divorce(state: RunState, data: GameData): { state: RunState; log: LogEntry[] } {
  const { broodFledged, ...cleared } = state;
  if (!cleared.mate) return { state: cleared, log: [] };
  const d = breedingSpecies(data, state.config.speciesId).divorce;
  const split = nextChance(cleared.rng, broodFledged ? d.afterSuccess : d.afterFailure);
  if (!split.value) return { state: { ...cleared, rng: split.state }, log: [] };
  const { mate: _m, ...rest } = cleared;
  return {
    state: { ...rest, rng: split.state, mateGone: 'divorce' },
    log: [{ at: state.at, type: 'mate', text: '지난 짝과 갈라섰다', cause: 'divorce' }],
  };
}

/** 지난 짝 카드 — 늘 받아들이고, 성격은 이미 확인돼 있어 힌트가 맞다 (2.2) */
function previousCard(mate: Mate): MateCandidate {
  const values = Object.values(mate.potential);
  return {
    ...mate,
    quality: values.reduce((a, b) => a + b, 0) / values.length,
    accepts: true,
    plumageNoise: 0,
    hint: mate.personality,
    previous: true,
  };
}

/**
 * 후보 카드: 지난 짝(있으면) 1장 + 새 후보 `mate.candidates`장을 시드 난수로 (2.2 표 · 2.3 신호 · 2.4 상호 선택).
 * 상호 선택은 새 후보끼리만 비교한다
 */
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
  return { rng, candidates: state.mate ? [previousCard(state.mate), ...candidates] : candidates };
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
    ...(c.accepts ? {} : { disabled: { reason: '노래 더 필요함' } }),
  }));
}

/** 잠재력 등급 범위 [아래, 위] — 05-inheritance 4장 */
export function potentialRange(f: Formulas, potential: number): [string, string] {
  const w = f.heredity.rangeWithin;
  return [
    statGrade(f, Math.max(f.stats.min, potential - w)),
    statGrade(f, Math.min(f.stats.max, potential + w)),
  ];
}

/** 화면 S-20 카드 — 새 후보는 신호만, 지난 짝은 잠재력 등급 범위와 유대도 (05-inheritance 4장) */
export function mateCards(data: GameData, candidates: MateCandidate[]): MateCandidateCard[] {
  const f = data.formulas;
  const m = data.breeding.mate;
  return candidates.map((c, i) => ({
    choiceId: `mateCandidate.${i + 1}`,
    plumage: statGrade(f, c.quality + c.plumageNoise),
    song: statGrade(f, c.stats.display ?? 0),
    age: c.age,
    hint: c.hint,
    accepts: c.accepts,
    ...(c.previous
      ? {
          previous: true,
          potentialRange: Object.fromEntries(
            Object.entries(c.potential).map(([stat, p]) => [stat, potentialRange(f, p ?? 0)]),
          ),
          bond: { now: c.bond, reunion: Math.min(m.bondMax, c.bond + m.bondReunion) },
        }
      : {}),
  }));
}
