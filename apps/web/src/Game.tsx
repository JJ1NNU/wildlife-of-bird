import {
  act,
  type CalendarAt,
  type Choice,
  type ClutchSizeCard,
  formatEnergyDelta,
  formatRisk,
  formatStatGain,
  getChoices,
  getView,
  type LogEntry,
  type MateCandidateCard,
  type MateOrderCard,
  type NestSiteCard,
  newRun,
  type Preview,
  preview,
  type RunState,
  roundHalfUp,
} from '@wb/engine';
import type { GameData, Season, StatName } from '@wb/schema';
import { useEffect, useState } from 'react';
import { birdUrl } from './art.ts';
import { fastForward, SHOW_FAST_FORWARD } from './fast-forward.ts';
import { iconStyle } from './icons.ts';
import { clearRun, loadRun, saveRun } from './save.ts';

/**
 * M1 화면(#24): S-01 타이틀·이어하기 · S-10 메인 턴 · S-30 게임 오버 기록 · 자동 저장.
 * 배치는 아트 중충실도 와이어프레임(`docs/ux/wireframes/mid/01`, #123)과 #53(결정 영역 550)을 따른다.
 * 훈련 ▾ · 옮기기 ▾는 펼쳐서 고른다(와이어프레임 B, D-016) — 펼침은 화면만의 상태라 저장하지 않는다.
 * 개발용 빨리 감기(QA 평균 봇)는 피드 위에 둔다 — 결정 영역 배치를 건드리지 않고, 출시 빌드에서는 숨긴다.
 * 짝 후보(S-20) · 둥지 자리(S-23) 관문은 결정 영역을 통째로 쓴다(와이어프레임 mid/03 E·F) — 지난 짝 카드·구멍별 둥지 손실%는 엔진이 내면(#21).
 * 개발용 스탯 표 · 피드 줄마다 스탯 변화 · 게임 오버의 죽은 이유는 대표 플레이테스트용(#176).
 * 행동은 단계마다 칸 N개 루틴으로 짠다(#188, 와이어프레임 mid/06 A·B): 기본값 = 엔진 제안(전 단계 루틴), 칸 채우기는
 * 화면만의 계획이고 "진행"에서 칸마다 `act`한다(#191). 칸 k의 예상은 1~k−1칸을 채운 상태에서 `preview`.
 * 진행하면 S-12 칸별 결과를 이어서 자동 재생한다(와이어프레임 mid/06 C): 칸마다 0.6초, 예상 옆에 실제, 사망 칸 ✕ → 확인 뒤 S-30.
 * 판정은 진행 때 한 번에 끝내고 저장한다 — 재생은 보여 주기만 하므로 새로고침해도 결과가 같다.
 * 잠정(#188): 이벤트 칸에서 멈춤·이벤트 뒤 남은 칸 고치기(D)는 엔진이 이벤트·`replan`을 내면.
 * 둥지가 있으면 판에 둥지 줄(알/새끼 수, 와이어프레임 mid/03 A의 둥지 띠 첫 조각) — 국면·둥지 손실%·짝·지시는 엔진이 내면(#21).
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
const RES_WORD: Record<string, string> = { energy: '에너지', feather: '깃털' };
/** 관문 결정 버튼: [고른 뒤 앞말, 고르기 전] */
const GATE_GO = {
  mateCandidate: { done: (label: string) => `짝 맺기 · ${label}`, none: '짝을 고르세요' },
  nestSite: { done: (label: string) => `${label}에 짓기`, none: '둥지 자리를 고르세요' },
  clutchSize: { done: (label: string) => `${label} 낳기`, none: '알 수를 고르세요' },
  mateOrder: { done: (label: string) => `짝에게 · ${label}`, none: '짝에게 맡길 일을 고르세요' },
  parentingPolicy: { done: () => '이 방침으로', none: '이대로 진행' },
} as const;
/** 육아 방침 선택 id → 칸 글 (와이어프레임 mid/03 C). 잠정(#21): `data/text/`가 생기면 옮긴다 */
const POLICY_WORD: Record<string, string> = {
  low: '적게',
  mid: '보통',
  high: '많이',
  even: '고르게',
  compete: '센 새끼 먼저',
  quantity: '양 많이',
  quality: '질 좋게',
  feedFocus: '먹이 우선',
  clean: '청소',
  full: '다 자라서',
  early: '일찍',
  long: '길게',
  short: '짧게',
  safe: '안전',
  varied: '여러 곳',
  predator: '포식자',
  song: '노래',
};
const GRADE_WORD = { high: '높음', mid: '보통', low: '낮음' } as const;
const HINT_WORD = { bold: '대담해 보인다', shy: '조심스러워 보인다' } as const;
/** 지난 짝 카드의 성격(이미 확인) — 04-breeding 2.2 */
const PERSONALITY_WORD = { bold: '대담', shy: '조심스러움' } as const;
/** 짝 후보 관문 위 한 줄: 지난 짝이 없어진 이유(`gate.previousGone`, 2.1). 잠정(#21): 문구는 `data/text/`가 생기면 옮긴다 */
const MATE_GONE: Record<string, string> = {
  mateDeath: '지난 짝은 겨울을 넘기지 못했어요',
  divorce: '지난 짝이 떠났어요',
};
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

/** 한 단계에 같은 종류·같은 칸·같은 글의 기록은 두 번 남지 않는다 */
function logKey(l: LogEntry): string {
  return `${l.at.year}.${l.at.period}.${l.at.step}.${l.type}.${l.slot ?? ''}.${l.text}`;
}

/** 칸 단위 에너지 — 소수 첫째 자리(#206, 01-formulas 9.4). 0이면 부호 없이 */
function energy1(x: number): string {
  const n = roundHalfUp(x, 1);
  if (n === 0) return '0';
  return `${n > 0 ? '+' : '−'}${Math.abs(n).toFixed(1)}`;
}

/** 칸 줄의 아이콘 — 훈련·옮기기는 묶음 아이콘 */
function slotIcon(id: string): string {
  return GROUPS.find((g) => id.startsWith(g.prefix))?.icon ?? `icon.${id}`;
}

/** 칸 하나의 계획: 그 칸을 채우기 전 상태(선택지·`preview` 기준)와 고른 선택 */
interface SlotPlan {
  /** 이 칸의 선택지를 내는 상태 (앞 칸까지 채움). 앞 칸이 비면 없다 */
  before: RunState | undefined;
  id: string | null;
  preview: Preview | undefined;
}

/**
 * 계획한 칸들을 앞에서부터 채워 본다(채우기 `act`는 판정·난수 없음, #191). 못 고르는 칸은 비우고,
 * 빈 칸 뒤로는 선택지를 알 수 없다. 마지막 칸은 채우지 않는다 — 채우면 루틴이 실행된다.
 */
function planSlots(base: RunState, plan: (string | null)[], data: GameData): SlotPlan[] {
  let s: RunState | undefined = base;
  return plan.map((want, k) => {
    const before = s;
    const ok = before && want && getChoices(before, data).some((c) => c.id === want && !c.disabled);
    const id = ok ? want : null;
    const p = before && id ? preview(before, id, data) : undefined;
    s = before && id && k < plan.length - 1 ? act(before, id, data).state : undefined;
    return { before, id, preview: p };
  });
}

/** 기록 한 줄의 변화: 스탯(소수 첫째) 먼저, 에너지·깃털(정수, 칸 줄은 소수 첫째 #206) 뒤 — 0으로 반올림되면 뺀다 (#176) */
function deltaText(deltas: Record<string, number> = {}, perSlot = false): string {
  const stats: string[] = [];
  const res: string[] = [];
  for (const [k, x] of Object.entries(deltas)) {
    if (k.startsWith('stat.')) {
      const n = roundHalfUp(x, 1);
      const name = STAT_WORD[k.slice('stat.'.length) as StatName] ?? k;
      if (n !== 0) stats.push(`${name} ${n > 0 ? '+' : '−'}${Math.abs(n).toFixed(1)}`);
    } else if (k in RES_WORD) {
      // 그 밖의 키(짝 지시 `acceptance`·`effect` 등)는 로그 글에 이미 있다
      const t = perSlot ? energy1(x) : formatEnergyDelta(x);
      if (t !== '0') res.push(`${RES_WORD[k]} ${t}`);
    }
  }
  return [...stats, ...res].join(' · ');
}

/** S-12 재생 한 줄: 칸의 예상(진행 전 `preview`)과 실제(루틴 로그의 `slot` 줄) */
interface ReplayRow {
  slot: number;
  label: string;
  expect: number | undefined;
  actual: LogEntry | undefined;
  dead: boolean;
}

/** S-12 칸별 결과: 판정이 끝난 상태와 칸 줄. `shown`칸까지 보인다 */
interface Replay {
  next: RunState;
  rows: ReplayRow[];
  /** 루틴 합 변화(`decision` 줄) — 끝나면 성장 합 한 줄 */
  total: LogEntry | undefined;
  death: LogEntry | undefined;
}

const REPLAY_MS = 600;

function reducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function logLine(l: LogEntry): string {
  const d = deltaText(l.deltas, l.slot !== undefined);
  const where = `${periodLabel(l.at).text} ${l.at.step}단계${l.slot ? ` ${l.slot}칸` : ''}`;
  return `${where} — ${l.text}${d ? ` · ${d}` : ''}`;
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
  /** 고친 루틴(남은 칸). 없으면 엔진 제안 그대로 */
  const [edited, setEdited] = useState<(string | null)[]>();
  /** 고치는 칸(0부터, 남은 칸 기준). 없으면 루틴 보기(A) */
  const [cursor, setCursor] = useState<number>();
  /** 진행 직후 S-12 재생. 확인을 누르면 `next`로 넘어간다 */
  const [replay, setReplay] = useState<Replay>();
  const [shown, setShown] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!replay || paused || shown >= replay.rows.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), REPLAY_MS);
    return () => clearTimeout(t);
  }, [replay, paused, shown]);

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
  // S-20: 지난 짝이 없어진 이유 한 줄 — 관문의 `previousGone` (04-breeding 2.1)
  const mateCards = view.gate?.kind === 'mateCandidate' ? view.gate.cards : undefined;
  const pickedPrevious = !!mateCards?.find((c) => c.choiceId === picked)?.previous;
  const mateGone =
    view.gate?.kind === 'mateCandidate' && view.gate.previousGone
      ? MATE_GONE[view.gate.previousGone]
      : undefined;
  // S-22: 항목별 값은 선택 id 뒤(`parentingPolicy?item=opt&…`)에 담는다 — 안 고른 항목은 지금 걸린 값
  const policyCards = view.gate?.kind === 'parentingPolicy' ? view.gate.cards : undefined;
  const policyQuery = new URLSearchParams(picked?.split('?')[1] ?? '');
  const policyValues = Object.fromEntries(
    (policyCards ?? []).map((c) => [c.item, policyQuery.get(c.item) ?? c.current]),
  );
  const policyChanged = (policyCards ?? []).some((c) => policyValues[c.item] !== c.current);
  const policyAdjust = (policyCards ?? []).some((c) => c.locked);
  const gateId = policyCards ? (picked ?? 'parentingPolicy') : pickedChoice?.id;
  // 장소 등급은 종의 계절 구분(밸런스)을 따른다 — 엔진의 seasonOf와 같은 규칙
  const seasonPeriods = data.balance.get(view.speciesId)?.seasons;
  const season =
    seasonPeriods &&
    (Object.keys(seasonPeriods) as Season[]).find((k) => seasonPeriods[k].includes(view.at.period));

  // 루틴(관문·게임 오버가 아닐 때): 남은 칸의 계획과 칸마다 예상
  const plan = view.routine ? (edited ?? view.routine.suggested) : [];
  const slots = view.routine ? planSlots(state, plan, data) : [];
  const done = view.routine?.filled.length ?? 0;
  const ready = slots.length > 0 && slots.every((s) => s.id);
  // 요약 줄: 루틴 합 위험 1 − Π(1 − pₖ) — 띠는 합에만(#206)
  const sumRisk = 1 - slots.reduce((q, s) => q * (1 - (s.preview?.deathRisk ?? 0)), 1);
  // 칸마다 끝난 뒤 에너지 (preview의 변화는 앞 칸까지 채운 상태 기준이라 더하면 된다)
  let e = view.player.energy;
  const energyAfter = slots.map((s) => {
    e += s.preview?.energyDelta[0] ?? 0;
    return e;
  });

  const sumBand = formatRisk(data.formulas, sumRisk);
  // S-12 재생 중에는 상태 바 에너지가 보인 칸까지 같이 움직인다
  const replayDone = replay ? shown >= replay.rows.length : false;
  const shownEnergy = replay
    ? replay.rows
        .slice(0, shown)
        .reduce((x, r) => x + (r.actual?.deltas?.energy ?? 0), view.player.energy)
    : view.player.energy;
  const cursorSlot =
    cursor !== undefined && slots[cursor]?.before
      ? { k: cursor, before: slots[cursor].before }
      : undefined;
  const cursorChoices = cursorSlot ? getChoices(cursorSlot.before, data) : [];

  /** 칸 k 앞에 옮기기가 있으면 그 칸의 장소 이름 — 다음 칸부터 새 장소(3.5) */
  function placeBefore(k: number): string | undefined {
    const move = plan
      .slice(0, k)
      .findLast((id) => id?.startsWith('move.'))
      ?.slice('move.'.length);
    return move && (data.nodes.get(move)?.nameKo ?? move);
  }

  function labelOf(s: SlotPlan): string {
    const c = s.before && getChoices(s.before, data).find((x) => x.id === s.id);
    return c ? c.label : (s.id ?? '');
  }

  function commit(next: RunState) {
    saveRun(next);
    setState(next);
    setPicked(undefined);
    setOpen(undefined);
    setEdited(undefined);
    setCursor(undefined);
    setReplay(undefined);
  }

  function go() {
    if (!state) return;
    if (view.gate) {
      if (gateId) commit(act(state, gateId, data).state);
      return;
    }
    // 칸마다 act — 마지막 칸을 채우면 엔진이 루틴을 실행한다
    if (!ready) return;
    let s = state;
    let log: LogEntry[] = [];
    for (const slot of slots) ({ state: s, log } = act(s, slot.id as string, data));
    // 마지막 칸의 act가 루틴을 실행한다 — 그 로그가 decision → slot… → death
    saveRun(s);
    const death = log.find((l) => l.type === 'death');
    setReplay({
      next: s,
      death,
      total: log.find((l) => l.type === 'decision'),
      rows: slots.map((sl, k) => {
        const slot = done + k + 1;
        return {
          slot,
          label: labelOf(sl),
          expect: sl.preview?.energyDelta[0],
          actual: log.find((l) => l.type === 'slot' && l.slot === slot),
          dead: death?.slot === slot,
        };
      }),
    });
    setShown(reducedMotion() ? slots.length : 0);
    setPaused(false);
    setCursor(undefined);
    setOpen(undefined);
  }

  /** 고치는 칸에 선택을 넣고 다음 칸으로 — 마지막 칸이면 루틴 보기로 */
  function fill(k: number, id: string) {
    const next = plan.slice();
    next[k] = id;
    setEdited(next);
    setOpen(undefined);
    setCursor(k + 1 < plan.length ? k + 1 : undefined);
  }

  function restart() {
    clearRun();
    commit(startRun(data));
  }

  /** 선택 한 줄: 이름 · 예상 성장(아래) · 에너지 변화 · 위험%(오른쪽) — 와이어프레임 A.
   * 루틴 칸이면 그 칸 상태 기준, 에너지는 소수 첫째 자리, 위험은 숫자만(띠는 루틴 합에만, #206) */
  function row(c: Choice, slot: { k: number; before: RunState }, group?: GroupKey) {
    const p = c.disabled ? undefined : preview(slot.before, c.id, data);
    const selected = plan[slot.k] === c.id;
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
          className={`opt${group ? ' sub' : ''}${selected ? ' sel' : ''}`}
          aria-pressed={selected}
          disabled={!!c.disabled}
          onClick={() => fill(slot.k, c.id)}
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
                에너지 <b>{lo === hi ? energy1(lo) : `${energy1(lo)}~${energy1(hi)}`}</b>
              </span>
              <span className="risk">
                <span className="ico s" style={iconStyle('icon.risk')} />
                {risk.text}
              </span>
            </span>
          )}
        </button>
      </li>
    );
  }

  /**
   * S-20 후보 카드: 신호 4개(깃·노래·나이·성격 힌트) + 나를 받아들이는지 — 04-breeding 2.3~2.4.
   * 지난 짝 카드(맨 앞 1장)는 신호 대신 성격(확인) · 재결합 예 (2.2)
   */
  function mateRow(card: MateCandidateCard, n: number) {
    const c = choices.find((x) => x.id === card.choiceId);
    const sex = view.player.sex === 'female' ? '♂' : '♀';
    const age = <span className="muted small">{card.age <= 1 ? '1년생' : '성조'}</span>;
    if (card.previous) {
      // 등급 범위는 3개까지, 넘치면 "… n개"로 접는다 (와이어프레임 mid/03 짝 후보)
      const ranges = Object.entries(card.potentialRange ?? {});
      return (
        <li key={card.choiceId}>
          <button
            type="button"
            className={`opt${card.choiceId === picked ? ' sel' : ''}`}
            aria-pressed={card.choiceId === picked}
            onClick={() => setPicked(card.choiceId)}
            data-testid={`choice-${card.choiceId}`}
          >
            <span className="main">
              <span className="b">
                {sex} 지난 짝 {age}
                {card.bond && (
                  <span className="muted small">
                    {' '}
                    · 유대 {card.bond.now} → {card.bond.reunion}
                  </span>
                )}
              </span>
              {ranges.length > 0 && (
                <span className="cap">
                  {ranges.slice(0, 3).map(([stat, [lo, hi]]) => (
                    <span key={stat}>
                      {STAT_WORD[stat as StatName]} <b>{lo}</b>~<b>{hi}</b>{' '}
                    </span>
                  ))}
                  {ranges.length > 3 && <span className="muted">… {ranges.length}개</span>}
                </span>
              )}
              <span className="cap">성격: {PERSONALITY_WORD[card.hint]} (확인)</span>
            </span>
            <span className="vals">
              <span>재결합</span>
              <b>예</b>
            </span>
          </button>
        </li>
      );
    }
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
              {sex} 후보 {n} {age}
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

  /** S-23 둥지 자리 카드: 구멍 이름 · 차지할 확률(경쟁 구멍만, 정수 %) — 04-breeding 4장 */
  function nestRow(card: NestSiteCard) {
    const c = choices.find((x) => x.id === card.choiceId);
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
            <span className="b">{c?.label ?? card.hole}</span>
            <span className="cap">
              {[
                card.contestChance === undefined ? '다툼 없음' : '좋은 구멍은 다툰다 — 과시 판정',
                c?.disabled?.reason,
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </span>
          {card.contestChance !== undefined && (
            <span className="vals">
              <span>차지할 확률</span>
              <b>{roundHalfUp(card.contestChance * 100)}%</b>
            </span>
          )}
        </button>
      </li>
    );
  }

  /** 산란수 카드: 알 수 · 산란 단계 비용(정수) — 04-breeding 5장. 이소 기대 수·은수저는 엔진이 더하면(#21) */
  function clutchRow(card: ClutchSizeCard) {
    const c = choices.find((x) => x.id === card.choiceId);
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
            <span className="b">{c?.label ?? `알 ${card.eggs}개`}</span>
            {c?.disabled && <span className="cap">{c.disabled.reason}</span>}
          </span>
          <span className="vals">
            <span>산란 비용/단계</span>
            <b>
              {card.layingCost === 0 ? '없음' : `에너지 ${formatEnergyDelta(-card.layingCost)}`}
            </b>
          </span>
        </button>
      </li>
    );
  }

  /** 짝 지시 한 줄: 지시 · 수락률 등급(숫자 없음, 01-formulas 7.4) — 불가면 이유, 도움은 "내가 한다" */
  function orderRow(card: MateOrderCard) {
    const c = choices.find((x) => x.id === card.choiceId);
    const val = c?.disabled
      ? '불가'
      : card.acceptance
        ? GRADE_WORD[card.acceptance]
        : card.choiceId.startsWith('help.')
          ? '내가 한다'
          : undefined;
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
            <span className="b">{c?.label ?? card.choiceId}</span>
            {c?.disabled && <span className="cap">{c.disabled.reason}</span>}
          </span>
          {val && (
            <span className="vals">
              <span>{card.acceptance ? '받아들일 가능성' : ''}</span>
              <b>{val}</b>
            </span>
          )}
        </button>
      </li>
    );
  }

  if (view.gameOver) {
    const death = view.recentLog
      .slice()
      .reverse()
      .find((l) => l.type === 'death');
    const last = view.recentLog
      .slice()
      .reverse()
      .find((l) => l.type === 'decision');
    return (
      <main className="game" data-testid="game-over">
        <div className="over">
          <h1>여기까지</h1>
          <p className="muted">
            {when.text} · {view.player.age}세
          </p>
          {death && (
            <p className="cause" data-testid="death-cause">
              죽은 이유 <b>{death.text}</b>
            </p>
          )}
          <p className="muted small">
            {last && `마지막 행동: ${last.text} · `}남은 에너지 {roundHalfUp(view.player.energy)} /{' '}
            {roundHalfUp(view.energyCap)}
          </p>
          <p className="score">
            총 번식 <b>{view.totalBreeding}</b>
          </p>
          <ul className="feed-list">
            {view.recentLog.slice(-5).map((l) => (
              <li key={logKey(l)}>{logLine(l)}</li>
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
              에너지 <b data-testid="energy">{roundHalfUp(shownEnergy)}</b>
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
            {mateGone && <li className="gate-title muted small">{mateGone}</li>}
            {view.gate.cards.map((card, i) => mateRow(card, mateCards?.[0]?.previous ? i : i + 1))}
          </ul>
        ) : view.gate?.kind === 'nestSite' ? (
          <ul className="list" aria-label="둥지 자리" data-testid="gate-nestSite">
            <li className="gate-title b">어디에 지을까 — 구멍 하나를 고른다</li>
            {view.gate.cards.map((card) => nestRow(card))}
            <li className="gate-title muted small">
              둥지를 지으면 새끼가 떠날 때까지 이 장소를 옮길 수 없다. 깊은 구멍을 못 차지하면 얕은
              구멍에 짓는다.
            </li>
          </ul>
        ) : view.gate?.kind === 'mateOrder' ? (
          <ul className="list" aria-label="짝 지시" data-testid="gate-mateOrder">
            <li className="gate-title b">짝에게 맡길 일 — 하나를 고른다</li>
            {view.gate.cards.map((card) => orderRow(card))}
            <li className="gate-title muted small">
              고른 지시는 이 국면이 끝날 때까지. 거절하면 짝은 다른 일을 한다 — 원래 효과의 일부만.
            </li>
          </ul>
        ) : view.gate?.kind === 'parentingPolicy' ? (
          <ul className="list" aria-label="육아 방침" data-testid="gate-parentingPolicy">
            <li className="gate-title b">{policyAdjust ? '육아 방침 조정' : '육아 방침 정하기'}</li>
            {view.gate.cards.map((it, i) => (
              <li key={it.item} className={`pol${it.locked ? ' lock' : ''}`}>
                <span className="lab small b">
                  {i + 1} {it.label}
                  {it.locked && <span className="muted"> · 잠김</span>}
                </span>
                <fieldset className="seg" aria-label={it.label}>
                  {it.options.map((o) => (
                    <button
                      key={o}
                      type="button"
                      className={policyValues[it.item] === o ? 'on' : undefined}
                      aria-pressed={policyValues[it.item] === o}
                      disabled={it.locked}
                      onClick={() =>
                        setPicked(
                          `parentingPolicy?${new URLSearchParams({ ...policyValues, [it.item]: o })}`,
                        )
                      }
                      data-testid={`policy-${it.item}-${o}`}
                    >
                      {POLICY_WORD[o] ?? o}
                    </button>
                  ))}
                </fieldset>
              </li>
            ))}
          </ul>
        ) : view.gate?.kind === 'clutchSize' ? (
          <ul className="list" aria-label="산란수" data-testid="gate-clutchSize">
            <li className="gate-title b">알을 몇 개 낳을까</li>
            {view.gate.cards.map((card) => clutchRow(card))}
            <li className="gate-title muted small">
              많이 낳으면 이소할 새끼가 늘지만, 새끼 하나하나의 몫과 첫 겨울 생존이 준다.
            </li>
          </ul>
        ) : (
          <>
            <div className="art short">
              <img className="art-bird" src={birdUrl(view.speciesId)} alt="" />
              <div className="plate small">
                {data.ecology.get(view.speciesId)?.nameKo ?? view.speciesId}{' '}
                {view.player.sex === 'female' ? '♀' : '♂'} {view.player.age}세{' · '}
                {data.nodes.get(view.node)?.nameKo ?? view.node}
                {view.nest && (
                  <div className="b" data-testid="nest-band">
                    둥지 ·{' '}
                    {view.nest.chicks !== undefined
                      ? `새끼 ${view.nest.chicks}마리`
                      : view.nest.eggs !== undefined
                        ? `알 ${view.nest.eggs}개`
                        : '알 낳기 전'}
                  </div>
                )}
              </div>
            </div>

            <div className="slots" data-testid="routine">
              <div className="cells">
                {slots.map((s, k) => {
                  const place = placeBefore(k);
                  return (
                    <button
                      // biome-ignore lint/suspicious/noArrayIndexKey: 칸은 자리로 구분한다
                      key={k}
                      type="button"
                      className={`cell${k === cursor || (replay && k === shown - 1) ? ' cur' : ''}${s.id ? '' : ' empty'}`}
                      aria-pressed={k === cursor}
                      disabled={Boolean(replay)}
                      onClick={() => setCursor(k === cursor ? undefined : k)}
                      data-testid={`slot-${done + k + 1}`}
                    >
                      {place && <span className="pl">{place}</span>}
                      <span className="n">{done + k + 1}</span>
                      {s.id && <span className="ico s" style={iconStyle(slotIcon(s.id))} />}
                      <span className="e">
                        {s.preview ? energy1(s.preview.energyDelta[0]) : '—'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="sum">
                <span>
                  에너지 {roundHalfUp(view.player.energy)} →{' '}
                  <b>{ready ? roundHalfUp(energyAfter.at(-1) ?? 0) : '—'}</b>
                </span>
                <span className="sp" />
                <span>{slots.length}칸 합</span>
                {ready ? (
                  <span className={`risk ${sumBand.band}`} data-testid="routine-risk">
                    <span className="ico s" style={iconStyle('icon.risk')} />
                    {sumBand.text} <span className="w">{RISK_WORD[sumBand.band]}</span>
                  </span>
                ) : (
                  <span className="muted">빈 칸이 있다</span>
                )}
              </div>
            </div>

            {replay ? (
              <div className="list" data-testid="replay">
                <table className="slot-table small" aria-label="칸별 결과">
                  <thead>
                    <tr>
                      <th>칸</th>
                      <th>행동</th>
                      <th>예상</th>
                      <th>실제</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {replay.rows.map((r, k) => {
                      const seen = k < shown;
                      return (
                        <tr key={r.slot} className={seen ? '' : 'muted'}>
                          <td>{r.slot}</td>
                          <td>{r.label}</td>
                          <td>{r.expect !== undefined && energy1(r.expect)}</td>
                          <td>
                            {seen ? (r.actual ? energy1(r.actual.deltas?.energy ?? 0) : '—') : '…'}
                          </td>
                          <td className={seen && r.dead ? 'danger' : ''}>
                            {seen ? (r.dead ? '✕' : r.actual ? '✓' : '') : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {replayDone && (
                  <p className="small" data-testid="replay-total">
                    {replay.death
                      ? `${replay.death.slot}칸에서 — ${replay.death.text}`
                      : deltaText(replay.total?.deltas) || '변화 없음'}
                  </p>
                )}
              </div>
            ) : cursor === undefined ? (
              <div className="list">
                <table className="slot-table small" aria-label="칸별 예상">
                  <thead>
                    <tr>
                      <th>칸</th>
                      <th>행동</th>
                      <th>에너지</th>
                      <th>위험</th>
                      <th>성장</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((s, k) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: 칸은 자리로 구분한다
                      <tr key={k}>
                        <td>{done + k + 1}</td>
                        <td>{s.id ? labelOf(s) : <span className="muted">비었다</span>}</td>
                        <td>
                          {s.preview &&
                            `${energy1(s.preview.energyDelta[0])} → ${roundHalfUp(energyAfter[k] ?? 0, 1).toFixed(1)}`}
                        </td>
                        <td>{s.preview && formatRisk(data.formulas, s.preview.deathRisk).text}</td>
                        <td>
                          {Object.entries(s.preview?.statGains ?? {})
                            .map(([st, x]) => `${STAT_WORD[st as StatName]} ${formatStatGain(x)}`)
                            .join(' · ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="muted small">
                  칸을 누르면 그 칸을 고친다. 고치는 탭은 결정이 아니다.
                </p>
              </div>
            ) : (
              <ul className="list" aria-label={`${done + cursor + 1}칸 행동`}>
                <li className="gate-title row small">
                  <span className="b">{done + cursor + 1}칸</span>
                  {cursor > 0 && (
                    <span className="muted">
                      — {done + cursor}칸 뒤 에너지{' '}
                      {roundHalfUp(energyAfter[cursor - 1] ?? 0, 1).toFixed(1)}에서
                    </span>
                  )}
                  <span className="sp" />
                  <button
                    type="button"
                    className="step"
                    disabled={cursor === 0}
                    onClick={() => setCursor(cursor - 1)}
                    aria-label="앞 칸"
                  >
                    ◂
                  </button>
                  <button
                    type="button"
                    className="step"
                    disabled={cursor === slots.length - 1}
                    onClick={() => setCursor(cursor + 1)}
                    aria-label="다음 칸"
                  >
                    ▸
                  </button>
                </li>
                {!cursorSlot ? (
                  <li className="gate-title muted small">앞의 빈 칸을 먼저 채운다.</li>
                ) : (
                  <>
                    {cursorChoices
                      .filter((c) => !GROUPS.some((g) => c.id.startsWith(g.prefix)))
                      .map((c) => row(c, cursorSlot))}
                    {GROUPS.map((g) => {
                      const members = cursorChoices.filter((c) => c.id.startsWith(g.prefix));
                      if (members.length === 0) return null;
                      const isOpen = open === g.key;
                      const pickedHere = members.find((c) => c.id === plan[cursor]);
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
                        ...(isOpen ? members.map((c) => row(c, cursorSlot, g.key)) : []),
                      ];
                    })}
                  </>
                )}
              </ul>
            )}
          </>
        )}

        <div className="actions">
          {view.gate ? (
            <button
              type="button"
              className="btn prim"
              disabled={!gateId}
              onClick={go}
              data-testid="go"
            >
              {policyCards
                ? policyChanged || !policyAdjust
                  ? GATE_GO.parentingPolicy.done()
                  : GATE_GO.parentingPolicy.none
                : pickedPrevious
                  ? '지난 짝과 다시'
                  : pickedChoice
                    ? GATE_GO[view.gate.kind].done(pickedChoice.label)
                    : GATE_GO[view.gate.kind].none}
            </button>
          ) : replay ? (
            replayDone ? (
              <button
                type="button"
                className="btn prim"
                onClick={() => commit(replay.next)}
                data-testid="replay-ok"
              >
                확인
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setPaused(!paused)}
                  data-testid="replay-pause"
                >
                  {paused ? '계속' : '멈춤'}
                </button>
                <button
                  type="button"
                  className="btn prim"
                  onClick={() => setShown(replay.rows.length)}
                  data-testid="replay-skip"
                >
                  끝까지 ▸▸
                </button>
              </>
            )
          ) : cursor === undefined ? (
            <button
              type="button"
              className="btn prim"
              onClick={() => (ready ? go() : setCursor(slots.findIndex((s) => !s.id)))}
              data-testid="go"
            >
              {ready ? '이 루틴으로 진행' : '빈 칸 채우기'}
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn"
                disabled={!edited}
                onClick={() => {
                  setEdited(undefined);
                  setOpen(undefined);
                }}
                data-testid="routine-reset"
              >
                되돌리기
              </button>
              <button
                type="button"
                className="btn prim"
                onClick={() => {
                  setCursor(undefined);
                  setOpen(undefined);
                }}
                data-testid="routine-view"
              >
                루틴 보기
              </button>
            </>
          )}
        </div>
      </div>

      <section className="feed" aria-label="지난 일">
        {SHOW_FAST_FORWARD && (
          <div className="dev small">
            <span className="muted">개발용 · 평균 봇으로</span>
            <button
              type="button"
              className="btn"
              onClick={() => commit(fastForward(state, data))}
              data-testid="fast-forward"
            >
              1년 빨리 감기
            </button>
          </div>
        )}
        {SHOW_FAST_FORWARD && (
          <table className="stats small" data-testid="stats">
            <caption className="muted">개발용 · 스탯 현재 / 잠재력</caption>
            <tbody>
              {(Object.keys(view.player.potential) as StatName[]).map((s) => (
                <tr key={s}>
                  <th>{STAT_WORD[s] ?? s}</th>
                  <td>{roundHalfUp(view.player.stats[s] ?? 0, 1).toFixed(1)}</td>
                  <td className="muted">
                    / {roundHalfUp(view.player.potential[s] ?? 0, 1).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <ul className="feed-list">
          {view.recentLog
            .slice()
            .reverse()
            .map((l) => (
              <li key={logKey(l)}>{logLine(l)}</li>
            ))}
        </ul>
      </section>
    </main>
  );
}
