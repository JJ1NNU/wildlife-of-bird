import {
  act,
  type CalendarAt,
  type Choice,
  type ClutchSizeCard,
  type EffectPreview,
  type EventOptionCard,
  formatEnergyDelta,
  formatRisk,
  formatStatGain,
  getChoices,
  getView,
  type InheritanceChickCard,
  type LifeRecord,
  type LogEntry,
  type MateCandidateCard,
  type MateOrderCard,
  type NestSiteCard,
  newRun,
  type Preview,
  preview,
  type RunState,
  roundHalfUp,
  type SeasonPolicyCard,
  type SecondBroodCard,
} from '@wb/engine';
import type { GameData, Season, StatName } from '@wb/schema';
import { useEffect, useState } from 'react';
import { birdUrl } from './art.ts';
import { fastForward, SHOW_FAST_FORWARD } from './fast-forward.ts';
import { iconStyle } from './icons.ts';
import { clearRun, loadRun, saveRun } from './save.ts';
import { t } from './text.ts';

/**
 * M1 화면(#24): S-01 타이틀·이어하기 · S-10 메인 턴 · S-30 게임 오버 기록 · 자동 저장.
 * 배치는 아트 중충실도 와이어프레임(`docs/ux/wireframes/mid/01`, #123)과 #53(결정 영역 550)을 따른다.
 * 훈련 ▾ · 옮기기 ▾는 펼쳐서 고른다(와이어프레임 B, D-016) — 펼침은 화면만의 상태라 저장하지 않는다.
 * 개발용 빨리 감기(QA 평균 봇)·스탯 표는 피드 맨 아래에 둔다 — 피드 위쪽은 내리면 sticky 결정 영역에 덮여 안 눌리므로(#386)
 * 끝까지 내리면 보이는 자리로. 결정 영역 배치를 건드리지 않고, 출시 빌드에서는 숨긴다.
 * 짝 후보(S-20) · 둥지 자리(S-23) 관문은 결정 영역을 통째로 쓴다(와이어프레임 mid/03 E·F) — 지난 짝 카드·구멍별 둥지 손실%는 엔진이 내면(#21).
 * 개발용 스탯 표 · 피드 줄마다 스탯 변화 · 게임 오버의 죽은 이유는 대표 플레이테스트용(#176).
 * 행동은 단계마다 칸 N개 루틴으로 짠다(#188, 와이어프레임 mid/06 A·B): 기본값 = 엔진 제안(전 단계 루틴), 칸 채우기는
 * 화면만의 계획이고 "진행"에서 칸마다 `act`한다(#191). 칸 k의 예상은 1~k−1칸을 채운 상태에서 `preview`.
 * 진행하면 S-12 칸별 결과를 이어서 자동 재생한다(와이어프레임 mid/06 C): 칸마다 0.6초, 예상 옆에 실제, 사망 칸 ✕ → 확인 뒤 S-30.
 * 판정은 진행 때 한 번에 끝내고 저장한다 — 재생은 보여 주기만 하므로 새로고침해도 결과가 같다.
 * 이벤트가 나온 칸에서 재생 표가 끝나고, 고른 뒤 남은 칸을 다시 채운다(`view.routine.replan`).
 * S-13 이벤트 카드(와이어프레임 mid/02 A): 제목·본문·선택지, 판정형은 "<스탯> 판정 N%". 효과 숫자·그림·시트 겹침은 잠정(#188).
 * 둥지가 있으면 판에 둥지 줄(알/새끼 수, 와이어프레임 mid/03 A의 둥지 띠 첫 조각) — 국면·둥지 손실%·짝·지시는 엔진이 내면(#21).
 * 이벤트 · 나머지 번식 관문 · 계승은 엔진이 그 선택을 내면 붙인다(#21).
 * 화면 문구는 data/text/*.json(콘텐츠)에서 `t()`로 읽는다. 개발용(빨리 감기·스탯 표)만 코드에 둔다.
 */

const SPECIES = 'parus-minor';
/** 스탯 이름 — 문구 data/text/word.json */
const STAT_WORD = Object.fromEntries(
  (['flight', 'foraging', 'vigilance', 'stamina', 'display', 'social', 'navigation'] as const).map(
    (k) => [k, t(`word.stat.${k}`)],
  ),
) as Record<StatName, string>;
/** 펼쳐 고르는 묶음: 선택 id 앞부분 → 묶음 줄 */
const GROUPS = [
  {
    key: 'train',
    prefix: 'action.train.',
    label: t('routine.group.train'),
    icon: 'icon.action.train',
  },
  { key: 'move', prefix: 'move.', label: t('routine.group.move'), icon: 'icon.action.move' },
] as const;
type GroupKey = (typeof GROUPS)[number]['key'];
const RES_WORD: Record<string, string> = { energy: t('main.energy'), feather: t('main.feather') };
/** 관문 결정 버튼 글 — 문구 data/text/gate.json. 2차 번식·계승·이벤트는 고른 선택지 글 그대로 */
function gateGo(kind: string, label?: string): string {
  if (label === undefined)
    return kind === 'inheritance' ? t('inheritance.go.none') : t(`gate.${kind}.none`);
  return kind === 'secondBrood' || kind === 'inheritance' || kind === 'event'
    ? label
    : t(`gate.${kind}.go`, { label });
}
/** 새끼 부화 순서 → 이름 (와이어프레임 mid/04-inherit A) — 문구 data/text/inheritance.json */
const ORDINAL = [
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth',
].map((k) => t(`inheritance.ordinal.${k}`));
const SEX_MARK = { female: '♀', male: '♂' } as const;
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
    text: t(at.period % 2 ? 'main.period.firstHalf' : 'main.period.secondHalf', {
      year: at.year,
      month,
    }),
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
  /** 이 칸 뒤 당첨된 단계 이벤트(`event` 줄) — 루틴이 여기서 멈춘다 */
  event: LogEntry | undefined;
}

/** S-12 칸별 결과: 판정이 끝난 상태와 칸 줄. `shown`칸까지 보인다 */
interface Replay {
  next: RunState;
  rows: ReplayRow[];
  /** 루틴 합 변화(`decision`, 다시 채우기면 `replan` 줄) — 끝나면 성장 합 한 줄 */
  total: LogEntry | undefined;
  death: LogEntry | undefined;
}

const REPLAY_MS = 600;

function reducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function logLine(l: LogEntry): string {
  const d = deltaText(l.deltas, l.slot !== undefined);
  const where = `${periodLabel(l.at).text} ${t('main.step', { n: l.at.step })}${l.slot ? ` ${t('routine.slot', { n: l.slot })}` : ''}`;
  return `${where} — ${l.text}${d ? ` · ${d}` : ''}`;
}

/** S-30 가계도 한 줄 (05-inheritance 8장) — 문구 data/text/gameOver.json */
function lifeLine(r: LifeRecord, cause?: string): string {
  return t('gameOver.life', {
    generation: r.generation,
    sex: t(`gameOver.life.${r.sex}`),
    span: t('gameOver.life.span', {
      start: periodLabel(r.start.at).text,
      startAge: r.start.age,
      end: periodLabel(r.end.at).text,
      endAge: r.end.age,
    }),
    end:
      r.reason === 'inherit'
        ? t('gameOver.life.inherit')
        : cause
          ? t('gameOver.life.deathCause', { cause })
          : t('gameOver.life.death'),
    breeding: r.breeding,
    fledged: r.fledged,
  });
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
  /** S-24: 새끼를 고르고 결정을 누르면 확인 시트를 한 번 더 (docs/ux/screens.md 3장) */
  const [confirming, setConfirming] = useState(false);
  const [shown, setShown] = useState(0);
  const [paused, setPaused] = useState(false);
  /** 평시 칸 수가 바뀐 직후 한 줄 알림(01-formulas 9.6). 다음 결정에서 사라진다 */
  const [slotNote, setSlotNote] = useState<{ from: number; to: number }>();

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
          <h1>{t('title.name')}</h1>
          {boot.problem && (
            <p className="notice small">{t('title.loadFail', { problem: boot.problem })}</p>
          )}
          {saved && (
            <button
              type="button"
              className="btn prim"
              onClick={() => setOnTitle(false)}
              data-testid="continue"
            >
              {t('title.continue', { when: periodLabel(saved.at).text })}
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
            {t('title.new')}
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
      ? t(`gate.previousGone.${view.gate.previousGone}`)
      : undefined;
  // 2차 번식: 왜 열렸는지 — 마지막 둥지 기록(부화 0 · 새끼 전멸, 00-core-loop 4.4)
  const broodWhy =
    view.gate?.kind === 'secondBrood'
      ? view.recentLog
          .slice()
          .reverse()
          .find((l) => l.type === 'nest')?.text
      : undefined;
  // S-22: 항목별 값은 선택 id 뒤(`parentingPolicy?item=opt&…`)에 담는다 — 안 고른 항목은 지금 걸린 값
  const policyCards = view.gate?.kind === 'parentingPolicy' ? view.gate.cards : undefined;
  const policyQuery = new URLSearchParams(picked?.split('?')[1] ?? '');
  const policyValues = Object.fromEntries(
    (policyCards ?? []).map((c) => [c.item, policyQuery.get(c.item) ?? c.current]),
  );
  const policyChanged = (policyCards ?? []).some((c) => policyValues[c.item] !== c.current);
  const policyAdjust = (policyCards ?? []).some((c) => c.locked);
  // S-24: 고른 새끼 카드와 이름(부화 순서)
  const inherit = view.gate?.kind === 'inheritance' ? view.gate : undefined;
  const inheritIndex = inherit?.cards.findIndex((c) => c.choiceId === picked) ?? -1;
  const inheritChick = inherit?.cards[inheritIndex];
  const chickName = (i: number, card: InheritanceChickCard) =>
    `${ORDINAL[i] ?? `${i + 1}째`} ${SEX_MARK[card.sex]}`;
  // S-13: 지금 이벤트의 글(제목·본문·선택지)은 data/events
  const eventGate = view.gate?.kind === 'event' ? view.gate : undefined;
  const gateEvent = eventGate && data.events.find((e) => e.id === eventGate.id);
  const gateId = policyCards ? (picked ?? 'parentingPolicy') : pickedChoice?.id;
  // 장소 등급은 종의 계절 구분(밸런스)을 따른다 — 엔진의 seasonOf와 같은 규칙
  const seasonPeriods = data.balance.get(view.speciesId)?.seasons;
  const season =
    seasonPeriods &&
    (Object.keys(seasonPeriods) as Season[]).find((k) => seasonPeriods[k].includes(view.at.period));

  // 루틴(관문·게임 오버가 아닐 때): 남은 칸의 계획과 칸마다 예상
  const plan = view.routine ? (edited ?? view.routine.suggested) : [];
  const slots = view.routine ? planSlots(state, plan, data) : [];
  // 칸 번호는 단계 안의 절대값 — 이벤트 뒤 다시 채우기면 이미 한 칸(`paused.done`)부터 (03-contracts 3장)
  const done = (state.paused?.done ?? 0) + (view.routine?.filled.length ?? 0);
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
    // 칸 수 알림: 평시(6칸 이상)끼리 바뀔 때만 — 번식기 칸 나누기는 알리지 않는다
    // 다시 채우기 중 `routine.slots`는 남은 칸 수라 멈춘 루틴의 칸 수와 비교한다
    const from = state && (state.paused?.slots ?? getView(state, data).routine?.slots);
    const to = getView(next, data).routine?.slots;
    setSlotNote(from && to && from >= 6 && to >= 6 && from !== to ? { from, to } : undefined);
    saveRun(next);
    setState(next);
    setPicked(undefined);
    setOpen(undefined);
    setEdited(undefined);
    setCursor(undefined);
    setReplay(undefined);
    setConfirming(false);
  }

  function go() {
    if (!state) return;
    if (view.gate) {
      if (!gateId) return;
      // 계승은 되돌릴 수 없다 — 확인 시트를 거친다 (잔류는 바로)
      if (inheritChick && !confirming) return setConfirming(true);
      commit(act(state, gateId, data).state);
      return;
    }
    // 칸마다 act — 마지막 칸을 채우면 엔진이 루틴을 실행한다
    if (!ready) return;
    let s = state;
    let log: LogEntry[] = [];
    for (const slot of slots) ({ state: s, log } = act(s, slot.id as string, data));
    // 마지막 칸의 act가 루틴을 실행한다 — 그 로그가 decision(replan) → slot… → event | death
    saveRun(s);
    const death = log.find((l) => l.type === 'death');
    const event = log.find((l) => l.type === 'event');
    // 이벤트로 멈추면 그 칸까지만 — 남은 칸은 고른 뒤 다시 채운다
    const rows = slots
      .map((sl, k) => {
        const slot = done + k + 1;
        return {
          slot,
          label: labelOf(sl),
          expect: sl.preview?.energyDelta[0],
          actual: log.find((l) => l.type === 'slot' && l.slot === slot),
          dead: death?.slot === slot,
          event: event?.slot === slot ? event : undefined,
        };
      })
      .filter((r) => !event?.slot || r.slot <= event.slot);
    setReplay({
      next: s,
      death,
      total: log.find((l) => l.type === 'decision' || l.type === 'replan'),
      rows,
    });
    setShown(reducedMotion() ? rows.length : 0);
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
        t('main.move.destination', {
          food: t(`word.food.${destSeason.food}`),
          competition: t(`word.competition.${destSeason.competition}`),
        }),
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
                {t('main.energy')}{' '}
                <b>{lo === hi ? energy1(lo) : `${energy1(lo)}~${energy1(hi)}`}</b>
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
    const age = (
      <span className="muted small">
        {t(card.age <= 1 ? 'gate.age.yearling' : 'gate.age.adult')}
      </span>
    );
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
                {sex} {t('gate.mateCandidate.previous')} {age}
                {card.bond && (
                  <span className="muted small">
                    {' '}
                    ·{' '}
                    {t('gate.mateCandidate.bond', {
                      now: card.bond.now,
                      reunion: card.bond.reunion,
                    })}
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
                  {ranges.length > 3 && (
                    <span className="muted">{t('gate.moreCount', { n: ranges.length })}</span>
                  )}
                </span>
              )}
              <span className="cap">
                {t('gate.mateCandidate.personalityKnown', {
                  hint: t(`gate.personality.${card.hint}`),
                })}
              </span>
            </span>
            <span className="vals">
              <span>{t('gate.mateCandidate.reunion')}</span>
              <b>{t('gate.yes')}</b>
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
              {sex} {t('gate.mateCandidate.candidate', { n })} {age}
            </span>
            <span className="cap">
              {t('gate.mateCandidate.plumage')} <b>{card.plumage}</b> ·{' '}
              {t('gate.mateCandidate.song')} <b>{card.song}</b>
            </span>
            <span className="cap">
              {[t(`gate.mateHint.${card.hint}`), c?.disabled?.reason].filter(Boolean).join(' · ')}
            </span>
          </span>
          <span className="vals">
            <span>{t('gate.mateCandidate.accepts')}</span>
            <b>{t(card.accepts ? 'gate.yes' : 'gate.no')}</b>
          </span>
        </button>
      </li>
    );
  }

  /** 잠재력 등급 범위 — 위 등급이 높은 순. `limit`이면 강한 것만 그만큼 (mid/04-inherit A) */
  function potentialRanges(card: InheritanceChickCard, limit?: number) {
    const order: string[] = data.formulas.stats.grades.map((g) => g.grade);
    const ranges = Object.entries(card.potentialRange).sort(
      ([, a], [, b]) => order.indexOf(b?.[1] ?? '') - order.indexOf(a?.[1] ?? ''),
    );
    const shown = limit ? ranges.slice(0, limit) : ranges;
    return (
      <span className="cap">
        {shown.map(([stat, r]) => (
          <span key={stat}>
            {STAT_WORD[stat as StatName]} <b>{r?.[0]}</b>~<b>{r?.[1]}</b>{' '}
          </span>
        ))}
        {shown.length < ranges.length && (
          <span className="muted">{t('gate.moreCount', { n: ranges.length })}</span>
        )}
      </span>
    );
  }

  /** S-24 새끼 카드: 성별 · 1년 생존(정수 %) · 은수저·첫 겨울 배율(소수 둘째) · 잠재력 범위 — 05-inheritance 5장 */
  function chickRow(card: InheritanceChickCard, i: number) {
    const sel = card.choiceId === picked;
    return (
      <li key={card.choiceId}>
        <button
          type="button"
          className={`opt${sel ? ' sel' : ''}`}
          aria-pressed={sel}
          onClick={() => setPicked(card.choiceId)}
          data-testid={`choice-${card.choiceId}`}
        >
          <span className="main">
            <span className="b">{chickName(i, card)}</span>
            <span className="cap">
              {t('inheritance.chick.silverSpoon')} <b>{card.silverSpoon.toFixed(2)}</b> ·{' '}
              {t('inheritance.chick.firstWinter')} <b>×{card.firstWinter.toFixed(2)}</b>
            </span>
            {potentialRanges(card, sel ? undefined : 2)}
          </span>
          <span className="vals">
            <span>{t('inheritance.card.yearSurvival')}</span>
            <b>{Math.round(card.yearSurvival * 100)}%</b>
          </span>
        </button>
      </li>
    );
  }

  /** S-23 둥지 자리 카드: 구멍 이름 · 차지할 확률(경쟁 구멍만, 정수 %) · 둥지 손실 위험(단계마다, 행동 위험%와 같은 꼴) — 04-breeding 4장 */
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
                t(
                  card.contestChance === undefined
                    ? 'gate.nestSite.noContest'
                    : 'gate.nestSite.contest',
                ),
                c?.disabled?.reason,
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </span>
          <span className="vals">
            {card.contestChance !== undefined && (
              <span>
                {t('gate.nestSite.chance')} <b>{roundHalfUp(card.contestChance * 100)}%</b>
              </span>
            )}
            <span className="risk" data-testid={`nestLoss-${card.hole}`}>
              <span className="ico s" style={iconStyle('icon.risk')} />
              {t('gate.nestSite.nestLoss')} {formatRisk(data.formulas, card.nestLoss).text}
            </span>
          </span>
        </button>
      </li>
    );
  }

  /** 계절 방침 카드(M1 기능 위주 — 화면 S-14는 M2): 이름 · 설명 · 방침을 건 다음 단계 위험·에너지(`preview`, 11-season-policy 4장) */
  function seasonRow(card: SeasonPolicyCard) {
    const c = choices.find((x) => x.id === card.choiceId);
    const id = card.choiceId.slice('seasonPolicy.'.length);
    const p = state && !c?.disabled ? preview(state, card.choiceId, data) : undefined;
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
            <span className="b">{c?.label ?? id}</span>
            <span className="cap">{t(`seasonPolicy.${id}.desc`)}</span>
          </span>
          {p && (
            <span className="vals" data-testid={`season-preview-${id}`}>
              <span>
                {t('main.energy')} <b>{formatEnergyDelta(p.energyDelta[0])}</b>
              </span>
              <span className="risk">
                <span className="ico s" style={iconStyle('icon.risk')} />
                {formatRisk(data.formulas, p.deathRisk).text}
              </span>
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
            <span className="b">{c?.label ?? t('gate.clutchSize.eggs', { n: card.eggs })}</span>
            {/* 04-breeding 5장: 이소 기대 수 소수 첫째 · 은수저 소수 셋째 (이벤트 없는 값) */}
            <span className="cap" data-testid={`clutch-forecast-${card.eggs}`}>
              {t('gate.clutchSize.expectedFledged')} <b>{card.expectedFledged.toFixed(1)}</b> ·{' '}
              {t('inheritance.chick.silverSpoon')} <b>{card.silverSpoon.toFixed(3)}</b>
            </span>
            {c?.disabled && <span className="cap">{c.disabled.reason}</span>}
          </span>
          <span className="vals">
            <span>{t('gate.clutchSize.layingCost')}</span>
            <b>
              {card.layingCost === 0
                ? t('gate.none')
                : `${t('main.energy')} ${formatEnergyDelta(-card.layingCost)}`}
            </b>
          </span>
        </button>
      </li>
    );
  }

  /** 2차 번식 카드 (와이어프레임 mid/04-inherit C): 한다 = 에너지 −n → 남는 값 · 대가 한 줄, 안 한다 = 털갈이 */
  /** S-13 선택지 한 줄 — 판정형이면 스탯 판정 확률(정수 %, 와이어프레임 mid/02 A) */
  /** 효과 한 덩이(03-events 5.3) — 내 사망 위험만 띠, 새끼·둥지는 숫자 + 낱말(와이어프레임 mid/02 B) */
  function fxItem(e: EffectPreview, i: number) {
    switch (e.type) {
      case 'energy':
      case 'feather':
      case 'bond':
        return (
          <span key={i}>{t(`gate.event.fx.${e.type}`, { n: formatEnergyDelta(e.delta) })}</span>
        );
      case 'statGain':
        return (
          <span key={i}>
            {t('gate.event.fx.statGain', { stat: STAT_WORD[e.stat], n: formatStatGain(e.gain) })}
          </span>
        );
      case 'deathRisk': {
        const r = formatRisk(data.formulas, e.chance);
        return (
          <span key={i} className={`risk ${r.band}`}>
            <span className="ico s" style={iconStyle('icon.risk')} />
            {t('gate.event.fx.deathRisk', { p: r.text })}
          </span>
        );
      }
      case 'broodRisk':
        return (
          <span key={i} className="danger">
            {t('gate.event.fx.broodRisk', { p: formatRisk(data.formulas, e.chance).text })}
          </span>
        );
      case 'chickLoss':
        return (
          <span key={i} className="danger">
            {t('gate.event.fx.chickLoss', { n: e.chicks })}
          </span>
        );
      case 'riskMod':
      case 'foodMod':
        return <span key={i}>{t(`gate.event.fx.${e.type}`, { n: roundHalfUp(e.factor, 1) })}</span>;
      case 'injury':
        return (
          <span key={i} className="caution">
            {t('gate.event.fx.injury', { n: e.checks })}
          </span>
        );
      case 'fledgeEarly':
        return null;
    }
  }

  /** 효과 줄 — fledgeEarly가 있으면 그 위에 주의색 굵은 한 줄 */
  function fxLine(effects: EffectPreview[] = [], label?: string) {
    return (
      <>
        {effects.some((e) => e.type === 'fledgeEarly') && (
          <span className="cap caution b">{t('gate.event.fx.fledgeEarly')}</span>
        )}
        <span className="cap fx">
          {label && <span className="b">{label}</span>}
          {effects.map(fxItem)}
        </span>
      </>
    );
  }

  function eventRow(card: EventOptionCard) {
    const c = choices.find((x) => x.id === card.choiceId);
    const option = gateEvent?.options.find((o) => `event.${o.id}` === card.choiceId);
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
            <span className="b">{option?.text ?? c?.label ?? card.choiceId}</span>
            {option?.check && card.chance !== undefined && (
              <span className="cap">
                {t('gate.event.check', {
                  stat: STAT_WORD[option.check.stat],
                  n: Math.round(card.chance * 100),
                })}
              </span>
            )}
            {card.onSuccess ? (
              <>
                <span>{fxLine(card.onSuccess, t('gate.event.success'))}</span>
                <span>{fxLine(card.onFail, t('gate.event.fail'))}</span>
              </>
            ) : (
              fxLine(card.effects)
            )}
          </span>
        </button>
      </li>
    );
  }

  function broodRow(card: SecondBroodCard) {
    const c = choices.find((x) => x.id === card.choiceId);
    const yes = card.energyCost > 0;
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
            {yes ? (
              <span className="cap caution b">{t('gate.secondBrood.yesCost')}</span>
            ) : (
              <span className="cap">{t('gate.secondBrood.noGain')}</span>
            )}
          </span>
          <span className="vals">
            <span>{t('main.energy')}</span>
            <b>
              {yes
                ? `${formatEnergyDelta(-card.energyCost)} → ${Math.max(0, roundHalfUp(view.player.energy - card.energyCost))}`
                : t('gate.none')}
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
      ? t('gate.mateOrder.unavailable')
      : card.acceptance
        ? t(`gate.grade.${card.acceptance}`)
        : card.choiceId.startsWith('help.')
          ? t('gate.mateOrder.self')
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
              <span>{card.acceptance ? t('gate.mateOrder.acceptance') : ''}</span>
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
          <h1>{t('gameOver.title')}</h1>
          <p className="muted">
            {when.text} · {t('main.age', { n: view.player.age })}
          </p>
          {death && (
            <p className="cause" data-testid="death-cause">
              {t('gameOver.cause')} <b>{death.text}</b>
            </p>
          )}
          <p className="muted small">
            {last && `${t('gameOver.lastAction', { text: last.text })} · `}
            {t('gameOver.energyLeft')} {roundHalfUp(view.player.energy)} /{' '}
            {roundHalfUp(view.energyCap)}
          </p>
          <p className="score">
            {t('main.totalBreeding')} <b>{view.totalBreeding}</b>
          </p>
          {view.records && (
            <table className="compare small" data-testid="run-records">
              <tbody>
                <tr>
                  <th>{t('gameOver.records.span')}</th>
                  <td>
                    {t('gameOver.records.spanValue', {
                      generations: view.records.generations,
                      years: view.records.yearsSurvived.toFixed(1),
                    })}
                  </td>
                </tr>
                <tr>
                  <th>{t('gameOver.records.fledged')}</th>
                  <td>{t('main.nest.chicks', { n: view.records.fledged })}</td>
                </tr>
                <tr>
                  <th>{t('gameOver.records.oldestAge')}</th>
                  <td>{t('main.age', { n: view.records.oldestAge })}</td>
                </tr>
              </tbody>
            </table>
          )}
          <h2 className="small">{t('gameOver.familyTree')}</h2>
          <ol className="feed-list" data-testid="lineage">
            {state.log.flatMap((l) =>
              l.life
                ? [
                    <li key={l.life.generation}>
                      {lifeLine(l.life, l.type === 'death' ? l.text : undefined)}
                    </li>,
                  ]
                : [],
            )}
          </ol>
          <ul className="feed-list">
            {view.recentLog.slice(-5).map((l) => (
              <li key={logKey(l)}>{logLine(l)}</li>
            ))}
          </ul>
          <button type="button" className="btn prim" onClick={restart}>
            {t('title.new')}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="game" data-testid="main-turn">
      <div className={`zone${eventGate ? ' ov' : ''}`}>
        <header className="status">
          <div className="row small">
            <span className="ico s" style={iconStyle(`icon.season.${when.season}`)} />
            <span className="b">{when.text}</span>
            <span className="muted">· {t('main.step', { n: view.at.step })}</span>
            <span className="sp" />
            <span>
              {t('main.totalBreeding')} <b>{view.totalBreeding}</b>
            </span>
          </div>
          <div className="row small">
            <span className="ico s" style={iconStyle('icon.res.energy')} />
            <span>
              {t('main.energy')} <b data-testid="energy">{roundHalfUp(shownEnergy)}</b>
              <span className="muted"> / {roundHalfUp(view.energyCap)}</span>
            </span>
            {view.starving && (
              <span className="risk high b" role="alert" data-testid="starving">
                {t('main.starving')}
              </span>
            )}
            <span className="ico s" style={iconStyle('icon.res.feather')} />
            <span>
              {t('main.feather')} <b>{roundHalfUp(view.player.feather)}</b>
            </span>
          </div>
        </header>

        {view.gate?.kind === 'mateCandidate' ? (
          <ul
            className="list"
            aria-label={t('gate.mateCandidate.label')}
            data-testid="gate-mateCandidate"
          >
            <li className="gate-title b">{t('gate.mateCandidate.title')}</li>
            {mateGone && <li className="gate-title muted small">{mateGone}</li>}
            {view.gate.cards.map((card, i) => mateRow(card, mateCards?.[0]?.previous ? i : i + 1))}
          </ul>
        ) : view.gate?.kind === 'nestSite' ? (
          <ul className="list" aria-label={t('gate.nestSite.label')} data-testid="gate-nestSite">
            <li className="gate-title b">{t('gate.nestSite.title')}</li>
            {view.gate.cards.map((card) => nestRow(card))}
            <li className="gate-title muted small">{t('gate.nestSite.help')}</li>
          </ul>
        ) : view.gate?.kind === 'mateOrder' ? (
          <ul className="list" aria-label={t('gate.mateOrder.label')} data-testid="gate-mateOrder">
            <li className="gate-title b">{t('gate.mateOrder.title')}</li>
            {view.gate.cards.map((card) => orderRow(card))}
            <li className="gate-title muted small">{t('gate.mateOrder.help')}</li>
          </ul>
        ) : view.gate?.kind === 'parentingPolicy' ? (
          <ul
            className="list"
            aria-label={t('gate.parentingPolicy.label')}
            data-testid="gate-parentingPolicy"
          >
            <li className="gate-title b">
              {t(policyAdjust ? 'gate.parentingPolicy.adjustTitle' : 'gate.parentingPolicy.title')}
            </li>
            {view.gate.cards.map((it, i) => (
              <li key={it.item} className={`pol${it.locked ? ' lock' : ''}`}>
                <span className="lab small b">
                  {i + 1} {it.label}
                  {it.locked && (
                    <span className="muted"> · {t('gate.parentingPolicy.locked')}</span>
                  )}
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
                      {t(`gate.policy.${o}`)}
                    </button>
                  ))}
                </fieldset>
              </li>
            ))}
          </ul>
        ) : inherit && confirming && inheritChick ? (
          <div className="list" data-testid="inherit-confirm">
            <p className="gate-title b">
              {t('inheritance.confirm.title', { name: chickName(inheritIndex, inheritChick) })}{' '}
              <span className="caution">{t('inheritance.confirm.caution')}</span>
            </p>
            <table className="compare small">
              <thead>
                <tr>
                  <th />
                  <th>{t('inheritance.confirm.colStay')}</th>
                  <th>{chickName(inheritIndex, inheritChick)}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>{t('inheritance.confirm.rowAge')}</th>
                  <td>{t('inheritance.confirm.stayAge', { age: inherit.stay.age })}</td>
                  <td className="caution">{t('inheritance.confirm.chickAge')}</td>
                </tr>
                <tr>
                  <th>{t('inheritance.confirm.rowStats')}</th>
                  <td>{t('inheritance.confirm.stayStats')}</td>
                  <td className="caution">{t('inheritance.confirm.chickStats')}</td>
                </tr>
                <tr>
                  <th>{t('inheritance.confirm.rowPotential')}</th>
                  <td>{t('inheritance.confirm.stayPotential')}</td>
                  <td>{t('inheritance.confirm.chickPotential')}</td>
                </tr>
                <tr>
                  <th>{t('inheritance.confirm.rowMate')}</th>
                  <td>
                    {inherit.stay.bond !== undefined
                      ? t('inheritance.confirm.mateYes', { bond: inherit.stay.bond })
                      : t('inheritance.confirm.mateNo')}
                  </td>
                  <td className="caution">{t('inheritance.confirm.chickMate')}</td>
                </tr>
                <tr>
                  <th>{t('inheritance.confirm.rowSurvival')}</th>
                  <td>{Math.round(inherit.stay.yearSurvival * 100)}%</td>
                  <td>
                    {Math.round(inheritChick.yearSurvival * 100)}% ·{' '}
                    {t('inheritance.chick.firstWinter')} ×{inheritChick.firstWinter.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="muted small">{t('inheritance.confirm.kept')}</p>
          </div>
        ) : inherit ? (
          <ul
            className="list"
            aria-label={t('gate.inheritance.label')}
            data-testid="gate-inheritance"
          >
            <li className="gate-title b">
              {t('inheritance.header.title', {
                n: inherit.cards.length,
                from: inherit.totalBreeding - 1,
                to: inherit.totalBreeding,
              })}
            </li>
            <li className="gate-title muted small">{t('inheritance.header.note')}</li>
            <li>
              <button
                type="button"
                className={`opt${picked === inherit.stay.choiceId ? ' sel' : ''}`}
                aria-pressed={picked === inherit.stay.choiceId}
                onClick={() => setPicked(inherit.stay.choiceId)}
                data-testid={`choice-${inherit.stay.choiceId}`}
              >
                <span className="main">
                  <span className="b">
                    {t('inheritance.stay.label')} {SEX_MARK[view.player.sex]}{' '}
                    {t('inheritance.confirm.stayAge', { age: inherit.stay.age })}{' '}
                    <span className="muted small">{t('inheritance.stay.tag')}</span>
                  </span>
                  <span className="cap">
                    {t('inheritance.stay.aging')} <b>×{inherit.stay.agingMult.toFixed(2)}</b>
                    {inherit.stay.bond !== undefined && (
                      <>
                        {' '}
                        · {t('inheritance.stay.bond')} <b>{inherit.stay.bond}</b>
                      </>
                    )}
                  </span>
                </span>
                <span className="vals">
                  <span>{t('inheritance.card.yearSurvival')}</span>
                  <b>{Math.round(inherit.stay.yearSurvival * 100)}%</b>
                </span>
              </button>
            </li>
            <li className="gate-title muted small">{t('inheritance.chicks.title')}</li>
            {inherit.cards.map((card, i) => chickRow(card, i))}
            <li className="gate-title muted small">{t('inheritance.footer.note')}</li>
          </ul>
        ) : view.gate?.kind === 'secondBrood' ? (
          <ul
            className="list"
            aria-label={t('gate.secondBrood.label')}
            data-testid="gate-secondBrood"
          >
            <li className="gate-title b">{t('gate.secondBrood.title')}</li>
            {broodWhy && <li className="gate-title muted small">{broodWhy}</li>}
            {view.gate.cards.map((card) => broodRow(card))}
          </ul>
        ) : view.gate?.kind === 'event' ? (
          <ul className="list sheet" aria-label={t('gate.event.label')} data-testid="gate-event">
            <li className="gate-title b">{gateEvent?.title ?? view.gate.id}</li>
            {gateEvent && <li className="gate-title muted small">{gateEvent.body}</li>}
            {view.nest?.chicks !== undefined && (
              <li className="gate-title small" data-testid="event-nest">
                {t('main.nest')} · {t('main.nest.chicks', { n: view.nest.chicks })}
              </li>
            )}
            {view.gate.cards.map((card) => eventRow(card))}
          </ul>
        ) : view.gate?.kind === 'seasonPolicy' ? (
          <ul
            className="list"
            aria-label={t('gate.seasonPolicy.label')}
            data-testid="gate-seasonPolicy"
          >
            <li className="gate-title b">{t('gate.seasonPolicy.title')}</li>
            {view.gate.cards.map((card) => seasonRow(card))}
            <li className="gate-title muted small">{t('gate.seasonPolicy.help')}</li>
          </ul>
        ) : view.gate?.kind === 'clutchSize' ? (
          <ul
            className="list"
            aria-label={t('gate.clutchSize.label')}
            data-testid="gate-clutchSize"
          >
            <li className="gate-title b">{t('gate.clutchSize.title')}</li>
            {view.gate.cards.map((card) => clutchRow(card))}
            <li className="gate-title muted small">{t('gate.clutchSize.help')}</li>
          </ul>
        ) : (
          <>
            <div className="art short">
              <img className="art-bird" src={birdUrl(view.speciesId)} alt="" />
              <div className="plate small">
                {data.ecology.get(view.speciesId)?.nameKo ?? view.speciesId}{' '}
                {view.player.sex === 'female' ? '♀' : '♂'} {t('main.age', { n: view.player.age })}
                {' · '}
                {data.nodes.get(view.node)?.nameKo ?? view.node}
                {view.nest && (
                  <div className="b" data-testid="nest-band">
                    {t('main.nest')} ·{' '}
                    {view.nest.chicks !== undefined
                      ? t('main.nest.chicks', { n: view.nest.chicks })
                      : view.nest.eggs !== undefined
                        ? t('main.nest.eggs', { n: view.nest.eggs })
                        : t('main.nest.beforeLaying')}
                  </div>
                )}
              </div>
            </div>

            <div className="slots" data-testid="routine">
              {(slotNote || view.routine?.nextSlotIn !== undefined) && (
                // 평시 칸 수(01-formulas 9.6) — 문구 data/text/routine.json
                <div className="slot-head" role="status" data-testid="slot-head">
                  {slotNote ? (
                    <b>
                      {t(
                        slotNote.to > slotNote.from ? 'routine.slots.gained' : 'routine.slots.lost',
                        {
                          n: slotNote.to,
                        },
                      )}
                    </b>
                  ) : (
                    <span>{t('routine.slots.count', { n: slots.length + done })}</span>
                  )}
                  {view.routine?.nextSlotIn !== undefined && (
                    <span> · {t('routine.slots.nextIn', { n: view.routine.nextSlotIn })}</span>
                  )}
                </div>
              )}
              <div className={`cells${slots.length + done > 6 ? ' many' : ''}`}>
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
                  {t('main.energy')} {roundHalfUp(view.player.energy)} →{' '}
                  <b>{ready ? roundHalfUp(energyAfter.at(-1) ?? 0) : '—'}</b>
                </span>
                <span className="sp" />
                <span>{t('routine.sum', { n: slots.length })}</span>
                {ready ? (
                  <span className={`risk ${sumBand.band}`} data-testid="routine-risk">
                    <span className="ico s" style={iconStyle('icon.risk')} />
                    {sumBand.text} <span className="w">{t(`word.risk.${sumBand.band}`)}</span>
                  </span>
                ) : (
                  <span className="muted">{t('routine.hasEmpty')}</span>
                )}
              </div>
            </div>

            {replay ? (
              <div className="list" data-testid="replay">
                <table className="slot-table small" aria-label={t('routine.table.resultLabel')}>
                  <thead>
                    <tr>
                      <th>{t('routine.table.slot')}</th>
                      <th>{t('routine.table.action')}</th>
                      <th>{t('routine.table.expected')}</th>
                      <th>{t('routine.table.actual')}</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {replay.rows.map((r, k) => {
                      const seen = k < shown;
                      return (
                        <tr key={r.slot} className={seen ? '' : 'muted'}>
                          <td>{r.slot}</td>
                          <td>
                            {r.label}
                            {seen && r.event && ` · ${r.event.text}`}
                          </td>
                          <td>{r.expect !== undefined && energy1(r.expect)}</td>
                          <td>
                            {seen ? (r.actual ? energy1(r.actual.deltas?.energy ?? 0) : '—') : '…'}
                          </td>
                          <td className={seen && r.dead ? 'danger' : ''}>
                            {seen ? (r.dead ? '✕' : r.event ? '!' : r.actual ? '✓' : '') : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {replayDone && (
                  <p className="small" data-testid="replay-total">
                    {replay.death
                      ? t('routine.replay.deathAt', {
                          n: replay.death.slot ?? '',
                          text: replay.death.text,
                        })
                      : deltaText(replay.total?.deltas) || t('routine.replay.noChange')}
                  </p>
                )}
              </div>
            ) : cursor === undefined ? (
              <div className="list">
                <table className="slot-table small" aria-label={t('routine.table.previewLabel')}>
                  <thead>
                    <tr>
                      <th>{t('routine.table.slot')}</th>
                      <th>{t('routine.table.action')}</th>
                      <th>{t('routine.table.energy')}</th>
                      <th>{t('routine.table.risk')}</th>
                      <th>{t('routine.table.growth')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((s, k) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: 칸은 자리로 구분한다
                      <tr key={k}>
                        <td>{done + k + 1}</td>
                        <td>
                          {s.id ? labelOf(s) : <span className="muted">{t('routine.empty')}</span>}
                        </td>
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
                <p className="muted small">{t('routine.editHelp')}</p>
              </div>
            ) : (
              <ul className="list" aria-label={t('routine.slotActions', { n: done + cursor + 1 })}>
                <li className="gate-title row small">
                  <span className="b">{t('routine.slot', { n: done + cursor + 1 })}</span>
                  {cursor > 0 && (
                    <span className="muted">
                      {t('routine.editFrom', {
                        n: done + cursor,
                        energy: roundHalfUp(energyAfter[cursor - 1] ?? 0, 1).toFixed(1),
                      })}
                    </span>
                  )}
                  <span className="sp" />
                  <button
                    type="button"
                    className="step"
                    disabled={cursor === 0}
                    onClick={() => setCursor(cursor - 1)}
                    aria-label={t('routine.prevSlot')}
                  >
                    ◂
                  </button>
                  <button
                    type="button"
                    className="step"
                    disabled={cursor === slots.length - 1}
                    onClick={() => setCursor(cursor + 1)}
                    aria-label={t('routine.nextSlot')}
                  >
                    ▸
                  </button>
                </li>
                {!cursorSlot ? (
                  <li className="gate-title muted small">{t('routine.fillPrevFirst')}</li>
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
                                    ? t('routine.group.moveHint', { n: members.length })
                                    : t('routine.group.trainHint')}
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
          {inherit && confirming ? (
            <>
              <button
                type="button"
                className="btn"
                onClick={() => setConfirming(false)}
                data-testid="inherit-back"
              >
                {t('inheritance.confirm.back')}
              </button>
              <button type="button" className="btn prim" onClick={go} data-testid="go">
                {t('inheritance.confirm.go')}
              </button>
            </>
          ) : view.gate ? (
            <button
              type="button"
              className="btn prim"
              disabled={!gateId}
              onClick={go}
              data-testid="go"
            >
              {policyCards
                ? policyChanged || !policyAdjust
                  ? gateGo('parentingPolicy', '')
                  : gateGo('parentingPolicy')
                : pickedPrevious
                  ? t('gate.mateCandidate.previousGo')
                  : inheritChick
                    ? t('inheritance.go.chick', { name: chickName(inheritIndex, inheritChick) })
                    : pickedChoice
                      ? gateGo(view.gate.kind, pickedChoice.label)
                      : gateGo(view.gate.kind)}
            </button>
          ) : replay ? (
            replayDone ? (
              <button
                type="button"
                className="btn prim"
                onClick={() => commit(replay.next)}
                data-testid="replay-ok"
              >
                {t('routine.replay.ok')}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setPaused(!paused)}
                  data-testid="replay-pause"
                >
                  {t(paused ? 'routine.replay.resume' : 'routine.replay.pause')}
                </button>
                <button
                  type="button"
                  className="btn prim"
                  onClick={() => setShown(replay.rows.length)}
                  data-testid="replay-skip"
                >
                  {t('routine.replay.skip')}
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
              {t(ready ? 'routine.go' : 'routine.fillEmpty')}
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
                {t('routine.undo')}
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
                {t('routine.view')}
              </button>
            </>
          )}
        </div>
      </div>

      <section className="feed" aria-label={t('main.feed')}>
        <ul className="feed-list">
          {view.recentLog
            .slice()
            .reverse()
            .map((l) => (
              <li key={logKey(l)}>{logLine(l)}</li>
            ))}
        </ul>
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
      </section>
    </main>
  );
}
