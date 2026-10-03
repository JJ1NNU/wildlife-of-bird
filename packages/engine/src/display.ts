import type { Formulas } from '@wb/schema';

/**
 * 화면 표시 규칙 — `01-formulas` 7장. 반올림은 화면에서만 하고, 방식은 절댓값 기준 0.5 올림.
 * 화면과 봇 리포트가 같은 글자를 쓰도록 엔진이 낸다. 계수는 `formulas.display`·`mate.displayBands`.
 */

/** 절댓값 기준 0.5 올림 (`decimals`자리) */
export function roundHalfUp(x: number, decimals = 0): number {
  const k = 10 ** decimals;
  return (Math.sign(x) * Math.floor(Math.abs(x) * k + 0.5)) / k;
}

/** 7.1 확률(사망 위험 · 둥지 손실 · 새끼 사망)의 글자와 색 띠 */
export function formatRisk(f: Formulas, p: number): { text: string; band: 'low' | 'mid' | 'high' } {
  const d = f.display;
  const band = p < d.riskBands.low ? 'low' : p < d.riskBands.high ? 'mid' : 'high';
  if (p < d.riskMinShown) return { text: `${roundHalfUp(d.riskMinShown * 100, 1)}% 미만`, band };
  if (p < d.riskDecimalsBelow) return { text: `${roundHalfUp(p * 100, 1).toFixed(1)}%`, band };
  return { text: `${roundHalfUp(p * 100)}%`, band };
}

/** 7.2 에너지 변화 — 부호 붙은 정수. 0은 부호 없이 */
export function formatEnergyDelta(x: number): string {
  const n = roundHalfUp(x);
  if (n === 0) return '0';
  return n > 0 ? `+${n}` : `−${-n}`;
}

/** 7.3 예상 스탯 상승 — 소수 첫째 자리 */
export function formatStatGain(x: number): string {
  return `+${roundHalfUp(x, 1).toFixed(1)}`;
}

/** 7.4 짝 지시 수락률 — 숫자 없이 띠만 */
export function acceptanceBand(f: Formulas, p: number): 'high' | 'mid' | 'low' {
  const b = f.mate.displayBands;
  return p >= b.high ? 'high' : p >= b.mid ? 'mid' : 'low';
}
