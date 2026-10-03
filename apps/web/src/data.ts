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

const one = (modules: Record<string, unknown>) => files(modules)[0];
const effects = one(
  import.meta.glob('../../../data/balance/effects.json', { eager: true, import: 'default' }),
);
const formulas = one(
  import.meta.glob('../../../data/balance/formulas.json', { eager: true, import: 'default' }),
);

const raw: RawGameData = {
  ...(effects ? { effects } : {}),
  ...(formulas ? { formulas } : {}),
  ecology: files(
    import.meta.glob('../../../data/species/*.ecology.json', { eager: true, import: 'default' }),
  ),
  balance: files(
    import.meta.glob('../../../data/balance/species/*.json', { eager: true, import: 'default' }),
  ),
  events: files(
    import.meta.glob('../../../data/events/*.json', { eager: true, import: 'default' }),
  ),
};

export const loaded = loadGameData(raw);
export const fileCount = raw.ecology.length + raw.balance.length + raw.events.length;
