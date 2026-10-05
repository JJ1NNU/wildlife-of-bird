import {
  act,
  type CalendarAt,
  formatEnergyDelta,
  formatRisk,
  getChoices,
  getView,
  type LogEntry,
  newRun,
  preview,
  type RunState,
} from '@wb/engine';
import type { GameData } from '@wb/schema';
import { useState } from 'react';
import { birdUrl } from './art.ts';
import { iconStyle } from './icons.ts';
import { clearRun, loadRun, saveRun } from './save.ts';

/**
 * M1 화면(#24) — 첫 조각: S-10 메인 턴 · S-30 게임 오버 기록 · 자동 저장.
 * 배치는 아트 중충실도 와이어프레임(`docs/ux/wireframes/mid/01`, #123)과 #53(결정 영역 550)을 따른다.
 * 엔진이 아직 자리표시 선택만 내므로(#21) 이벤트 · 번식 · 계승 · 옮기기 펼침은 엔진이 선택을 내면 붙인다.
 * 잠정(#24): 화면 문구는 data/text/(콘텐츠)가 생기면 옮긴다.
 */

const SPECIES = 'parus-minor';
const RISK_WORD = { low: '낮음', mid: '보통', high: '높음' } as const;
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
  const [state, setState] = useState<RunState>(() => boot.state ?? startRun(data));
  const [picked, setPicked] = useState<string>();
  const [notice, setNotice] = useState(boot.problem);

  const view = getView(state, data);
  const choices = getChoices(state, data);
  const when = periodLabel(view.at);
  const pickedChoice = choices.find((c) => c.id === picked);

  function go() {
    if (!picked) return;
    const next = act(state, picked, data).state;
    saveRun(next);
    setState(next);
    setPicked(undefined);
    setNotice(undefined);
  }

  function restart() {
    clearRun();
    setState(startRun(data));
    setPicked(undefined);
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
              에너지 <b data-testid="energy">{view.player.energy}</b>
            </span>
          </div>
        </header>

        <div className="art">
          <img className="art-bird" src={birdUrl(view.speciesId)} alt="" />
          <div className="plate small">
            {data.ecology.get(view.speciesId)?.nameKo ?? view.speciesId}{' '}
            {view.player.sex === 'female' ? '♀' : '♂'} {view.player.age}세
          </div>
        </div>

        {notice && (
          <p className="notice small">저장된 판을 불러오지 못해 새 판을 시작했다 — {notice}</p>
        )}

        <ul className="list" aria-label="행동">
          {choices.map((c) => {
            const p = c.disabled ? undefined : preview(state, c.id, data);
            const risk = p && formatRisk(data.formulas, p.deathRisk);
            const [lo, hi] = p?.energyDelta ?? [0, 0];
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className={`opt${c.id === picked ? ' sel' : ''}`}
                  aria-pressed={c.id === picked}
                  disabled={!!c.disabled}
                  onClick={() => setPicked(c.id)}
                >
                  <span className="ico" style={iconStyle(`icon.${c.id}`)} />
                  <span className="main">
                    <span className="b">{c.label}</span>
                    {c.disabled && <span className="cap">{c.disabled.reason}</span>}
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
          })}
        </ul>

        <div className="actions">
          <button
            type="button"
            className="btn prim"
            disabled={!pickedChoice}
            onClick={go}
            data-testid="go"
          >
            {pickedChoice ? `${pickedChoice.label} 진행` : '행동을 고르세요'}
          </button>
        </div>
      </div>

      <section className="feed" aria-label="지난 일">
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
