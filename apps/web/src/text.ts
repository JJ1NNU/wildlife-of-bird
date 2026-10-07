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
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
