import type { LifeRecord } from '@wb/engine';
import type { Lineage as LineageData } from './lineage.ts';
import { t } from './text.ts';

/**
 * S-31 가계도 — 세대마다 한 칸, 계승한 새끼로 이어진 선. 맨 위에 S-30과 같은 총 번식 수·세대 수.
 * 계승하지 않은 새끼·잠재력·스탯은 그리지 않는다(기록 화면).
 */
export function Lineage({
  lineage,
  line,
  onBack,
}: {
  lineage: LineageData;
  line: (life: LifeRecord, cause?: string) => string;
  onBack: () => void;
}) {
  return (
    <main className="game" data-testid="lineage-screen">
      <div className="over">
        <h1>{t('lineage.title')}</h1>
        <p className="score">
          {t('lineage.summary', {
            total: lineage.totalBreeding,
            generations: lineage.lives.length,
          })}
        </p>
        <ol className="tree">
          {lineage.lives.map(({ life, cause }) => (
            <li key={life.generation} className={life.reason}>
              {line(life, cause)}
            </li>
          ))}
        </ol>
        <button type="button" className="btn" onClick={onBack} data-testid="lineage-back">
          {t('lineage.back')}
        </button>
      </div>
    </main>
  );
}
