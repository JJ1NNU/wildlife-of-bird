import type { GameData } from '@wb/schema';
import { PERIODS_PER_YEAR, yearCalendar } from './calendar.ts';
import { deathRisk, seasonOf } from './formulas.ts';
import { mapNode, speciesBalance } from './step.ts';
import type { CalendarAt } from './types.ts';

/** 1년 생존 예상의 대상 — 잔류하는 지금 개체 또는 계승 후보 새끼 (05-inheritance 6장) */
export interface ForecastSubject {
  age: number;
  expYears: number;
  vigilance: number;
  flight: number;
  /** 첫 겨울 보정에 쓴다(나이 0일 때만) */
  silverSpoon: number;
}

/**
 * 05-inheritance 6장 1년 생존 예상 — `from` 다음 단계부터 24시기를 **기본 단계표**대로,
 * 지금 장소의 기준 위험(행동 `forage`)으로 곱한다. 난수 없음.
 * `riskMod`·지방·배고픔·깃털·부상은 1, 스탯(경계·비행)은 지금 값, `period 1`을 지나면 나이·경험 +1.
 */
export function yearSurvival(
  data: GameData,
  speciesId: string,
  nodeId: string,
  from: CalendarAt,
  subject: ForecastSubject,
): number {
  const f = data.formulas;
  const species = speciesBalance(data, speciesId);
  const node = mapNode(data, nodeId);
  const calendar = yearCalendar(data, speciesId);
  let { age, expYears } = subject;
  let survival = 1;
  // 관문 단계 다음부터: 같은 시기의 남은 단계 → 다음 시기들 → 같은 시기의 관문 단계까지
  for (let i = 0; i <= PERIODS_PER_YEAR; i++) {
    const period = ((from.period - 1 + i) % PERIODS_PER_YEAR) + 1;
    const steps = calendar[period - 1] ?? [];
    if (i > 0 && period === 1) {
      age += 1;
      expYears += 1;
    }
    const first = i === 0 ? from.step : 0;
    const last = i === PERIODS_PER_YEAR ? from.step : steps.length;
    const season = seasonOf(species, period);
    for (let s = first; s < last; s++) {
      const phase = steps[s];
      if (!phase) continue;
      const risk = deathRisk(f, species, {
        nodeRisk: node.seasons[season].risk,
        phase,
        season,
        action: 'forage',
        riskModFactor: 1,
        vigilance: subject.vigilance,
        flight: subject.flight,
        expYears,
        r: f.risk.hungerFrom,
        feather: f.risk.featherFrom,
        age,
        silverSpoon: subject.silverSpoon,
        injured: false,
      });
      survival *= 1 - risk;
    }
  }
  return survival;
}
