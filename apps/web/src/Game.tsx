import {
  act,
  type CalendarAt,
  type Choice,
  formatEnergyDelta,
  formatRisk,
  formatStatGain,
  getChoices,
  getView,
  type LogEntry,
  type MateCandidateCard,
  newRun,
  preview,
  type RunState,
  roundHalfUp,
} from '@wb/engine';
import type { GameData, Season, StatName } from '@wb/schema';
import { useState } from 'react';
import { birdUrl } from './art.ts';
import { fastForward, SHOW_FAST_FORWARD } from './fast-forward.ts';
import { iconStyle } from './icons.ts';
import { clearRun, loadRun, saveRun } from './save.ts';

/**
 * M1 화면(#24): S-01 타이틀·이어하기 · S-10 메인 턴 · S-30 게임 오버 기록 · 자동 저장.
 * 배치는 아트 중충실도 와이어프레임(`docs/ux/wireframes/mid/01`, #123)과 #53(결정 영역 550)을 따른다.
 * 훈련 ▾ · 옮기기 ▾는 펼쳐서 고른다(와이어프레임 B, D-016) — 펼침은 화면만의 상태라 저장하지 않는다.
 * 개발용 빨리 감기(QA 평균 봇)는 피드 위에 둔다 — 결정 영역 배치를 건드리지 않고, 출시 빌드에서는 숨긴다.
 * 짝 후보 관문(S-20)은 결정 영역을 통째로 쓴다(와이어프레임 mid/03 E) — 지난 짝 카드는 엔진이 내면(#21).
 * 이벤트 · 나머지 번식 관문 · 계승은 엔진이 그 선택을 내면 붙인다(#21).
 * 잠정(#24): 화면 문구는 data/text/(콘텐츠)가 생기면 옮긴다.
 */

const SPECIES = 'parus-minor';
const RISK_WORD = { low: '낮음', mid: '보통', high: '높음' } as const;
const FOOD_WORD = {
  scarce: '아주 적음',
  low: '적음',
  medium: '보통',
  high: '많음',
  rich: '아주 많음',
};
const COMPETITION_WORD = { none: '없음', low: '낮음', medium: '보통', high: '높음' };
const STAT_WORD: Record<StatName, string> = {
  flight: '비행',
  foraging: '채식',
  vigilance: '경계',
  stamina: '체력',
  display: '과시',
  social: '사회',
  navigation: '항법',
};
/** 펼쳐 고르는 묶음: 선택 id 앞부분 → 묶음 줄 */
const GROUPS = [
  { key: 'train', prefix: 'action.train.', label: '훈련', icon: 'icon.action.train' },
  { key: 'move', prefix: 'move.', label: '옮기기', icon: 'icon.action.move' },
] as const;
type GroupKey = (typeof GROUPS)[number]['key'];
const HINT_WORD = { bold: '대담해 보인다', shy: '조심스러워 보인다' } as const;
const SEASON = [
  'winter',
  'winter',
  'spring',
  'spring',
  'spring',
  'summer',
  'summer',
  'summer',
  'autumn',
  'autumn',
  'autumn',
  'winter',
];

function periodLabel(at: CalendarAt): { text: string; season: string } {
  const month = Math.ceil(at.period / 2);
  return {
    text: `${at.year}년차 ${month}월 ${at.period % 2 ? '상반' : '하반'}`,
    season: SEASON[month - 1] ?? 'spring',
  };
}

/** 한 단계에 같은 종류·같은 글의 기록은 두 번 남지 않는다 */
function logKey(l: LogEntry): string {
  return `${l.at.year}.${l.at.period}.${l.at.step}.${l.type}.${l.text}`;
}

function startRun(data: GameData): RunState {
  const state = newRun({ speciesId: SPECIES, seed: Date.now().toString(36), mode: 'free' }, data);
  saveRun(state);
  return state;
}

export function Game({ data }: { data: GameData }) {
  const [boot] = useState(() => loadRun(data));
  const [state, setState] = useState<RunState | undefined>(boot.state);
  const [onTitle, setOnTitle] = useState(true);
  const [picked, setPicked] = useState<string>();
  const [open, setOpen] = useState<GroupKey>();

  if (onTitle || !state) {
    const saved = state && !state.gameOver ? state : undefined;
    return (
      <main className="game" data-testid="title">
        <div className="over">
          <h1>야생조류 키우기</h1>
          {boot.problem && (
            <p className="notice small">저장된 판을 불러오지 못했다 — {boot.problem}</p>
          )}
          {saved && (
            <button
              type="button"
              className="btn prim"
              onClick={() => setOnTitle(false)}
              data-testid="continue"
            >
              이어하기 · {periodLabel(saved.at).text}
            </button>
          )}
          <button
            type="button"
            className={saved ? 'btn' : 'btn prim'}
            onClick={() => {
              setState(startRun(data));
              setPicked(undefined);
              setOnTitle(false);
            }}
            data-testid="new-run"
          >
            새 판 시작
          </button>
        </div>
      </main>
    );
  }

  const view = getView(state, data);
  const choices = getChoices(state, data);
  const when = periodLabel(view.at);
  const pickedChoice = choices.find((c) => c.id === picked);
  // 장소 등급은 종의 계절 구분(밸런스)을 따른다 — 엔진의 seasonOf와 같은 규칙
  const seasonPeriods = data.balance.get(view.speciesId)?.seasons;
  const season =
    seasonPeriods &&
    (Object.keys(seasonPeriods) as Season[]).find((k) => seasonPeriods[k].includes(view.at.period));

  function go() {
    if (!picked || !state) return;
    const next = act(state, picked, data).state;
    saveRun(next);
    setState(next);
    setPicked(undefined);
    setOpen(undefined);
  }

  function restart() {
    clearRun();
    setState(startRun(data));
    setPicked(undefined);
  }

  /** 선택 한 줄: 이름 · 예상 성장(아래) · 에너지 변화 · 위험%(오른쪽) — 와이어프레임 A */
  function row(c: Choice, group?: GroupKey) {
    if (!state) return null;
    const p = c.disabled ? undefined : preview(state, c.id, data);
    const risk = p && formatRisk(data.formulas, p.deathRisk);
    const [lo, hi] = p?.energyDelta ?? [0, 0];
    const gains = Object.entries(p?.statGains ?? {})
      .map(([stat, x]) => `${STAT_WORD[stat as StatName]} ${formatStatGain(x)}`)
      .join(' · ');
    const dest = group === 'move' ? data.nodes.get(c.id.slice('move.'.length)) : undefined;
    const destSeason = dest && season ? dest.seasons[season] : undefined;
    const name =
      group === 'train'
        ? (STAT_WORD[c.id.slice('action.train.'.length) as StatName] ?? c.label)
        : (dest?.nameKo ?? c.label);
    const cap = [
      destSeason &&
        `먹이 ${FOOD_WORD[destSeason.food]} · 경쟁 ${COMPETITION_WORD[destSeason.competition]}`,
      gains,
      c.disabled?.reason,
      ...(p?.notes ?? []),
    ]
      .filter(Boolean)
      .join(' · ');
    return (
      <li key={c.id}>
        <button
          type="button"
          className={`opt${group ? ' sub' : ''}${c.id === picked ? ' sel' : ''}`}
          aria-pressed={c.id === picked}
          disabled={!!c.disabled}
          onClick={() => setPicked(c.id)}
          data-testid={`choice-${c.id}`}
        >
          {!group && <span className="ico" style={iconStyle(`icon.${c.id}`)} />}
          <span className="main">
            <span className="b">{name}</span>
            {cap && <span className="cap">{cap}</span>}
          </span>
          {p && risk && (
            <span className="vals">
              <span>
                에너지{' '}
                <b>
                  {lo === hi
                    ? formatEnergyDelta(lo)
                    : `${formatEnergyDelta(lo)}~${formatEnergyDelta(hi)}`}
                </b>
              </span>
              <span className={`risk ${risk.band}`}>
                <span className="ico s" style={iconStyle('icon.risk')} />
                {risk.text} <span className="w">{RISK_WORD[risk.band]}</span>
              </span>
            </span>
          )}
        </button>
      </li>
    );
  }

  /** S-20 후보 카드: 신호 4개(깃·노래·나이·성격 힌트) + 나를 받아들이는지 — 04-breeding 2.3~2.4 */
  function mateRow(card: MateCandidateCard, n: number) {
    const c = choices.find((x) => x.id === card.choiceId);
    const sex = view.player.sex === 'female' ? '♂' : '♀';
    return (
      <li key={card.choiceId}>
        <button
          type="button"
          className={`opt${card.choiceId === picked ? ' sel' : ''}`}
          aria-pressed={card.choiceId === picked}
          disabled={!!c?.disabled}
          onClick={() => setPicked(card.choiceId)}
          data-testid={`choice-${card.choiceId}`}
        >
          <span className="main">
            <span className="b">
              {sex} 후보 {n} <span className="muted small">{card.age <= 1 ? '1년생' : '성조'}</span>
            </span>
            <span className="cap">
              깃 선명도 <b>{card.plumage}</b> · 노래 <b>{card.song}</b>
            </span>
            <span className="cap">
              {[HINT_WORD[card.hint], c?.disabled?.reason].filter(Boolean).join(' · ')}
            </span>
          </span>
          <span className="vals">
            <span>나를 받아들임</span>
            <b>{card.accepts ? '예' : '아니오'}</b>
          </span>
        </button>
      </li>
    );
  }

  if (view.gameOver) {
    return (
      <main className="game" data-testid="game-over">
        <div className="over">
          <h1>여기까지</h1>
          <p className="muted">
            {when.text} · {view.player.age}세
          </p>
          <p className="score">
            총 번식 <b>{view.totalBreeding}</b>
          </p>
          <ul className="feed-list">
            {view.recentLog.slice(-5).map((l) => (
              <li key={logKey(l)}>{l.text}</li>
            ))}
          </ul>
          <button type="button" className="btn prim" onClick={restart}>
            새 판 시작
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="game" data-testid="main-turn">
      <div className="zone">
        <header className="status">
          <div className="row small">
            <span className="ico s" style={iconStyle(`icon.season.${when.season}`)} />
            <span className="b">{when.text}</span>
            <span className="muted">· {view.at.step}단계</span>
            <span className="sp" />
            <span>
              총 번식 <b>{view.totalBreeding}</b>
            </span>
          </div>
          <div className="row small">
            <span className="ico s" style={iconStyle('icon.res.energy')} />
            <span>
              에너지 <b data-testid="energy">{roundHalfUp(view.player.energy)}</b>
              <span className="muted"> / {roundHalfUp(view.energyCap)}</span>
            </span>
            <span className="ico s" style={iconStyle('icon.res.feather')} />
            <span>
              깃털 <b>{roundHalfUp(view.player.feather)}</b>
            </span>
          </div>
        </header>

        {view.gate?.kind === 'mateCandidate' ? (
          <ul className="list" aria-label="짝 후보" data-testid="gate-mateCandidate">
            <li className="gate-title b">짝 후보 — 한 마리를 고른다</li>
            {view.gate.cards.map((card, i) => mateRow(card, i + 1))}
          </ul>
        ) : (
          <>
            <div className="art">
              <img className="art-bird" src={birdUrl(view.speciesId)} alt="" />
              <div className="plate small">
                {data.ecology.get(view.speciesId)?.nameKo ?? view.speciesId}{' '}
                {view.player.sex === 'female' ? '♀' : '♂'} {view.player.age}세{' · '}
                {data.nodes.get(view.node)?.nameKo ?? view.node}
              </div>
            </div>

            <ul className="list" aria-label="행동">
              {choices
                .filter((c) => !GROUPS.some((g) => c.id.startsWith(g.prefix)))
                .map((c) => row(c))}
              {GROUPS.map((g) => {
                const members = choices.filter((c) => c.id.startsWith(g.prefix));
                if (members.length === 0) return null;
                const isOpen = open === g.key;
                const pickedHere = members.find((c) => c.id === picked);
                return [
                  <li key={g.key}>
                    <button
                      type="button"
                      className={`opt${!isOpen && pickedHere ? ' sel' : ''}`}
                      aria-expanded={isOpen}
                      onClick={(e) => {
                        setOpen(isOpen ? undefined : g.key);
                        // 펼치면 그 줄을 목록 맨 위로 — 결정 버튼은 늘 같은 자리(와이어프레임 B)
                        const el = e.currentTarget;
                        if (!isOpen)
                          requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
                      }}
                      data-testid={`group-${g.key}`}
                    >
                      <span className="ico" style={iconStyle(g.icon)} />
                      <span className="main">
                        <span className="b">
                          {g.label} {isOpen ? '▴' : '▾'}
                        </span>
                        <span className="cap">
                          {pickedHere
                            ? pickedHere.label
                            : g.key === 'move'
                              ? `갈 수 있는 곳 ${members.length}`
                              : '스탯 하나를 고른다'}
                        </span>
                      </span>
                    </button>
                  </li>,
                  ...(isOpen ? members.map((c) => row(c, g.key)) : []),
                ];
              })}
            </ul>
          </>
        )}

        <div className="actions">
          <button
            type="button"
            className="btn prim"
            disabled={!pickedChoice}
            onClick={go}
            data-testid="go"
          >
            {view.gate
              ? pickedChoice
                ? `짝 맺기 · ${pickedChoice.label}`
                : '짝을 고르세요'
              : pickedChoice
                ? `${pickedChoice.label} 진행`
                : '행동을 고르세요'}
          </button>
        </div>
      </div>

      <section className="feed" aria-label="지난 일">
        {SHOW_FAST_FORWARD && (
          <div className="dev small">
            <span className="muted">개발용 · 평균 봇으로</span>
            <button
              type="button"
              className="btn"
              onClick={() => {
                const next = fastForward(state, data);
                saveRun(next);
                setState(next);
                setPicked(undefined);
                setOpen(undefined);
              }}
              data-testid="fast-forward"
            >
              1년 빨리 감기
            </button>
          </div>
        )}
        <ul className="feed-list">
          {view.recentLog
            .slice()
            .reverse()
            .map((l) => (
              <li key={logKey(l)}>
                {periodLabel(l.at).text} {l.at.step}단계 — {l.text}
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}
