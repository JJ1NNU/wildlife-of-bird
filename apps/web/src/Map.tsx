import { formatRisk, getChoices, preview, type RunState } from '@wb/engine';
import type { GameData, Season } from '@wb/schema';
import { diff1, t } from './text.ts';

/**
 * S-11 지도(`docs/design/specs/screens.md` v2) — 장소마다 먹이·위험·경쟁 등급, 지금 장소의 연속 체류(고갈).
 * 위험%·에너지는 지금 옮길 수 있는 곳(옮기기 목적지)에만 — S-10 옮기기 펼침과 같은 `preview` 숫자.
 * 옮기기 입력은 받지 않는다: 목적지를 누르면 S-10 옮기기 펼침으로 돌아간다.
 */
export function MapScreen({
  data,
  state,
  season,
  onBack,
  onMove,
}: {
  data: GameData;
  /** 옮기기를 넣을 칸의 상태(없으면 지금 상태) — S-10 카드와 같은 기준 */
  state: RunState;
  season: Season | undefined;
  onBack: () => void;
  /** 목적지를 눌렀을 때. 없으면(채울 칸 없음) 목적지도 누를 수 없다 */
  onMove: (() => void) | undefined;
}) {
  const moves = new Map(
    getChoices(state, data)
      .filter((c) => c.id.startsWith('move.') && !c.disabled)
      .map((c) => [c.id.slice('move.'.length), preview(state, c.id, data)]),
  );
  const nodes = [...data.nodes.values()].filter((n) => n.species.includes(state.config.speciesId));
  const { depletionPerStay, depletionFloor } = data.formulas.energy;
  const depletion = Math.max(depletionFloor, 1 - depletionPerStay * state.stay);
  const e0 = state.player.energy;
  return (
    <main className="game" data-testid="map">
      <div className="over">
        <h1>{t('map.title')}</h1>
        <ul className="map-list">
          {nodes.map((n) => {
            const tiers = season && n.seasons[season];
            const here = n.id === state.node;
            const p = moves.get(n.id);
            const body = (
              <>
                <span className="b">
                  {n.nameKo}
                  {here && <span className="muted small"> {t('map.here')}</span>}
                </span>
                {tiers && (
                  <span className="small">
                    {t('map.tiers', {
                      food: t(`word.food.${tiers.food}`),
                      risk: t(`map.risk.${tiers.risk}`),
                      competition: t(`word.competition.${tiers.competition}`),
                    })}
                  </span>
                )}
                <span className="small muted">
                  {here
                    ? t('map.stay', { n: state.stay, food: Math.round(depletion * 100) })
                    : p
                      ? t('map.move', {
                          // S-10 옮기기 카드와 같은 숫자 — 지금 값에서 표시값 차 (01-formulas 7.0)
                          energy:
                            p.energyDelta[0] === p.energyDelta[1]
                              ? diff1(e0, e0 + p.energyDelta[0])
                              : `${diff1(e0, e0 + p.energyDelta[0])}~${diff1(e0, e0 + p.energyDelta[1])}`,
                          risk: formatRisk(data.formulas, p.deathRisk).text,
                        })
                      : t('map.far')}
                </span>
              </>
            );
            return (
              <li key={n.id} className={here ? 'here' : undefined} data-testid={`map-${n.id}`}>
                {p && onMove ? (
                  <button type="button" onClick={onMove}>
                    {body}
                  </button>
                ) : (
                  <div>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
        <button type="button" className="btn" onClick={onBack} data-testid="map-back">
          {t('map.back')}
        </button>
      </div>
    </main>
  );
}
