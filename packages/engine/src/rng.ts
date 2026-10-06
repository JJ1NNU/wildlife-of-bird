/**
 * 시드 고정 난수. 엔진 원칙 2: 난수 상태는 `RunState` 안에 들어 있고,
 * `Math.random`과 현재 시간은 쓰지 않는다. 같은 시드 + 같은 선택 = 같은 결과.
 *
 * 알고리즘은 SplitMix32 — 32비트 정수 하나가 전체 상태이므로 저장 파일에
 * 숫자 한 개로 들어가고, 저장·불러오기를 왕복해도 수열이 이어진다.
 */

/** 난수 상태. 저장 파일에 그대로 들어간다. */
export type RngState = number;

/** 문자열 시드를 32비트 상태로 바꾼다 (FNV-1a). 같은 문자열은 항상 같은 상태. */
export function seedFromString(seed: string): RngState {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** 다음 상태와 0 이상 1 미만의 수. 상태를 바꾸지 않고 새 상태를 돌려준다. */
export function nextFloat(state: RngState): { state: RngState; value: number } {
  const next = (state + 0x9e3779b9) >>> 0;
  let z = next;
  z = Math.imul(z ^ (z >>> 16), 0x21f0aaad);
  z = Math.imul(z ^ (z >>> 15), 0x735a2d97);
  z = (z ^ (z >>> 15)) >>> 0;
  return { state: next, value: z / 0x100000000 };
}

/** `min` 이상 `max` 이하의 정수. */
export function nextInt(
  state: RngState,
  min: number,
  max: number,
): { state: RngState; value: number } {
  const rolled = nextFloat(state);
  return { state: rolled.state, value: min + Math.floor(rolled.value * (max - min + 1)) };
}

/** 확률 `p`(0~1)로 참. 위험 판정에 쓴다. */
export function nextChance(state: RngState, p: number): { state: RngState; value: boolean } {
  const rolled = nextFloat(state);
  return { state: rolled.state, value: rolled.value < p };
}

/**
 * 표준정규분포 표본 하나 (Box–Muller, 균등 난수 2개를 당긴다).
 * 짝 후보 잠재력·신호 오차(04-breeding 2.2·2.3)와 유전(01-formulas 5장)에 쓴다.
 * `1 − u`로 0을 피한다(`nextFloat`는 0 이상 1 미만).
 */
export function nextNormal(state: RngState): { state: RngState; value: number } {
  const a = nextFloat(state);
  const b = nextFloat(a.state);
  const value = Math.sqrt(-2 * Math.log(1 - a.value)) * Math.cos(2 * Math.PI * b.value);
  return { state: b.state, value };
}
