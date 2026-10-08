/**
 * QA 평균 봇(qa/bots/avg.ts)이 Node에서 data/를 읽는 `node:fs`를 브라우저에서 대신한다(빨리 감기용).
 * 봇이 읽는 파일만 빌드에 넣는다. 경로는 저장소 뿌리 기준(`data/...`).
 */
const raw: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob(['../../../../data/balance/effects.json', '../../../../data/events/*.json'], {
      eager: true,
      query: '?raw',
      import: 'default',
    }) as Record<string, string>,
  ).map(([p, text]) => [p.replace(/^(\.\.\/)+/, ''), text]),
);

export function readFileSync(file: string): string {
  const text = raw[file];
  if (text === undefined) throw new Error(`bot-shim: ${file} 없음`);
  return text;
}

export function readdirSync(dir: string): string[] {
  return Object.keys(raw)
    .filter((p) => p.startsWith(`${dir}/`) && !p.slice(dir.length + 1).includes('/'))
    .map((p) => p.slice(dir.length + 1));
}
