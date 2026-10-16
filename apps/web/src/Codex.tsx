import type { CodexKind, GameData } from '@wb/schema';
import { codexSeen } from './codex.ts';
import { t } from './text.ts';

/** 갈래 순서 — 이벤트 갈래는 아직 데이터가 없다 */
const KINDS: CodexKind[] = ['species', 'predator', 'phenomenon', 'node'];

/**
 * S-33 도감(`docs/design/specs/screens.md` v2) — 만나지 못한 항목은 '?', 만난 항목은 설명 글·처음 만난 판과 세대·횟수.
 * 확률과는 무관한 기록이다. 그림·포식자 상성 글은 데이터가 생기면 더한다.
 */
export function Codex({ data, onBack }: { data: GameData; onBack: () => void }) {
  const seen = codexSeen();
  const entries = [...data.codex.values()];
  const count = entries.filter((e) => seen[e.id]).length;
  return (
    <main className="game" data-testid="codex">
      <div className="over">
        <h1>{t('codex.title')}</h1>
        <p className="muted small">{t('codex.progress', { seen: count, total: entries.length })}</p>
        {KINDS.map((kind) => {
          const list = entries.filter((e) => e.kind === kind);
          if (list.length === 0) return null;
          return (
            <section key={kind} className="codex-kind">
              <h2 className="small">{t(`codex.kind.${kind}`)}</h2>
              <ul>
                {list.map((e) => {
                  const r = seen[e.id];
                  return (
                    <li key={e.id} data-testid={`codex-${e.id}`}>
                      {r ? (
                        <details>
                          <summary>
                            {e.nameKo}
                            {e.scientificName && <i className="muted"> {e.scientificName}</i>}
                          </summary>
                          <p>{e.body}</p>
                          <p className="muted small">
                            {t('codex.first', { run: r.run, generation: r.generation })},{' '}
                            {t('codex.count', { n: r.count })}
                          </p>
                        </details>
                      ) : (
                        <span className="muted">{t('codex.unknown')}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
        <button type="button" className="btn" onClick={onBack} data-testid="codex-back">
          {t('codex.back')}
        </button>
      </div>
    </main>
  );
}
