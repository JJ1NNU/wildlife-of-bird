import { roundHalfUp } from '@wb/engine';

/**
 * 화면 문구 — 콘텐츠의 data/text/*.json(평평한 `"화면.항목.용도": "문구"`)을 빌드에 넣는다.
 * 자리 표시 `{n}`은 vars로 채운다. 키가 없으면 키를 그대로 보여 빠진 문구가 눈에 띄게 한다.
 */
const strings: Record<string, string> = Object.assign(
  {},
  ...Object.values(
    import.meta.glob<Record<string, string>>('../../../data/text/*.json', {
      eager: true,
      import: 'default',
    }),
  ),
);

export function t(key: string, vars: Record<string, string | number> = {}): string {
  const s = strings[key];
  if (s === undefined) return key;
  // `{name}로`는 받침 따라 으로/로 (받침 없음·ㄹ → 로)
  return s.replace(/\{(\w+)\}(로)?/g, (m, k: string, ro?: string) =>
    k in vars ? `${vars[k]}${ro ? roAfter(String(vars[k])) : ''}` : m,
  );
}

/** 숫자는 읽는 소리의 받침: 0 영 · 3 삼 · 6 육만 받침(ㄹ 아님) */
const DIGIT_BATCHIM = '036';

/** 조사 으로/로 — 마지막 글자가 ㄹ 아닌 받침이면 `으로` */
export function roAfter(word: string): string {
  const c = word.at(-1) ?? '';
  if (/\d/.test(c)) return DIGIT_BATCHIM.includes(c) ? '으로' : '로';
  const code = c.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return '로';
  const jong = code % 28;
  return jong === 0 || jong === 8 ? '로' : '으로';
}

/** 칸 단위 에너지 — 소수 첫째 자리(#206, 01-formulas 9.4). 0이면 부호 없이 */
export function energy1(x: number): string {
  const n = roundHalfUp(x, 1);
  if (n === 0) return '0';
  return `${n > 0 ? '+' : '-'}${Math.abs(n).toFixed(1)}`;
}
