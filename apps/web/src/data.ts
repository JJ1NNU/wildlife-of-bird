import { loadGameData, type RawFile, type RawGameData } from '@wb/schema';

/**
 * 저장소의 data/를 빌드에 넣는다. 묶음 구분은 schema의 readDataDir(Node용)과 같다.
 * 경로는 이 파일(apps/web/src) 기준이다. glob의 옵션은 Vite 규칙상 리터럴로 적어야 한다.
 */
function files(modules: Record<string, unknown>): RawFile[] {
  return Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, json]) => ({ file: path.replace(/^(\.\.\/)+/, ''), json }));
}

/**
 * 파일 하나짜리 묶음. 빠지면 loadGameData가 오류 없이 기본값(빈 카드 풀 등)을 써서
 * 화면이 조용히 틀리므로(#555) 여기서 바로 멈춘다.
 */
function one(name: string, modules: Record<string, unknown>): RawFile {
  const file = files(modules)[0];
  if (!file) throw new Error(`data/balance/${name}.json을 빌드에 넣지 못했다`);
  return file;
}
const effects = one(
  'effects',
  import.meta.glob('../../../data/balance/effects.json', { eager: true, import: 'default' }),
);
const formulas = one(
  'formulas',
  import.meta.glob('../../../data/balance/formulas.json', { eager: true, import: 'default' }),
);
const breeding = one(
  'breeding',
  import.meta.glob('../../../data/balance/breeding.json', { eager: true, import: 'default' }),
);
const seasonPolicy = one(
  'season-policy',
  import.meta.glob('../../../data/balance/season-policy.json', { eager: true, import: 'default' }),
);
const cards = one(
  'cards',
  import.meta.glob('../../../data/balance/cards.json', { eager: true, import: 'default' }),
);

const raw: RawGameData = {
  effects,
  formulas,
  breeding,
  seasonPolicy,
  cards,
  ecology: files(
    import.meta.glob('../../../data/species/*.ecology.json', { eager: true, import: 'default' }),
  ),
  balance: files(
    import.meta.glob('../../../data/balance/species/*.json', { eager: true, import: 'default' }),
  ),
  calendar: files(
    import.meta.glob('../../../data/calendar/*.json', { eager: true, import: 'default' }),
  ),
  nodes: files(import.meta.glob('../../../data/nodes/*.json', { eager: true, import: 'default' })),
  predators: files(
    import.meta.glob('../../../data/predators/*.json', { eager: true, import: 'default' }),
  ),
  events: files(
    import.meta.glob('../../../data/events/*.json', { eager: true, import: 'default' }),
  ),
  codex: files(import.meta.glob('../../../data/codex/*.json', { eager: true, import: 'default' })),
  text: files(import.meta.glob('../../../data/text/*.json', { eager: true, import: 'default' })),
};

export const loaded = loadGameData(raw);
export const fileCount =
  raw.ecology.length +
  raw.balance.length +
  raw.calendar.length +
  raw.nodes.length +
  raw.predators.length +
  raw.events.length;
