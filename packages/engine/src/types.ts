import type { Phase, StatName } from '@wb/schema';
import type { RngState } from './rng.ts';

/** 런 하나의 설정 (03-contracts 3장) */
export interface RunConfig {
  speciesId: string;
  seed: string;
  startSex?: 'female' | 'male';
  mode: 'free' | 'weekly';
  /** 주간 시드 모드일 때 */
  weeklyId?: string;
}

/** 달력 위치. 1년 = 24시기(반 달), 시기 안은 단계로 쪼갠다 (gdd 4.2장) */
export interface CalendarAt {
  year: number;
  /** 1~24 (1 = 1월 상반) */
  period: number;
  /** 시기 안의 몇 번째 단계인지. 1부터 */
  step: number;
}

/** 지금 고를 수 있는 선택 하나 (03-contracts 3장) */
export interface Choice {
  id: string;
  kind:
    | 'node'
    | 'action'
    | 'eventOption'
    | 'seasonPolicy'
    | 'mateCandidate'
    | 'mateOrder'
    | 'nestSite'
    | 'clutchSize'
    | 'parentingPolicy'
    | 'secondBrood'
    | 'inheritance'
    | 'migration';
  label: string;
  /** 고를 수 없는 이유. 예: 생물학적으로 불가능한 짝 지시 */
  disabled?: { reason: string };
  /** 육아 방침 — 선택지 하나에 여러 항목 (04-breeding 6.2) */
  items?: ParentingItemChoice[];
}

/** 육아 방침 항목 하나. 고른 값은 `parentingPolicy?<item>=<선택>&…`로 `act`에 넘긴다 */
export interface ParentingItemChoice {
  /** `intensity` 또는 `breeding.json` `parenting`의 키 */
  item: string;
  label: string;
  options: string[];
  /** 지금 걸린 값 — 처음에는 기본값 */
  current: string;
  /** `postFledge` 조정에서 못 바꾸는 항목 */
  locked?: boolean;
}

/** 선택의 예상 결과. **난수를 쓰지 않는다** (엔진 원칙 2) */
export interface Preview {
  /** 0~1. 화면에서 반올림해 보여 준다 */
  deathRisk: number;
  broodRisk?: number;
  /** 예상 에너지 변화 범위 [최소, 최대] */
  energyDelta: [number, number];
  statGains?: Partial<Record<StatName, number>>;
  /** 짝 지시 수락률 */
  mateAcceptance?: number;
  /** "배가 고파 위험한 곳을 골랐다" 같은 설명 */
  notes: string[];
}

/** 모든 판정이 남기는 기록. 이야기 피드 · QA 분석 · 버그 재현에 쓴다 (엔진 원칙 5) */
export interface LogEntry {
  at: CalendarAt;
  type: string;
  text: string;
  deltas?: Record<string, number>;
  /** 사망·실패 원인 (QA 분석용) */
  cause?: string;
  /** 칸 판정 로그면 그 단계의 몇째 칸 (1부터) */
  slot?: number;
}

/**
 * 조작 중인 개체. 세부 스탯·특성의 규칙은 디자인의 상태 기계 명세를 기다린다.
 * 잠정(#5)
 */
export interface Bird {
  speciesId: string;
  sex: 'female' | 'male';
  /** 만 나이(년) */
  age: number;
  energy: number;
  /** 현재값. 잠재력을 넘지 않는다 (01-formulas 1.1) */
  stats: Partial<Record<StatName, number>>;
  /** 스탯마다의 상한. 유전되는 것은 이것뿐이다 (01-formulas 5장) */
  potential: Partial<Record<StatName, number>>;
  /** 0~`feather.max` (01-formulas 2.6) */
  feather: number;
  /** 경험 연수 = `period 1`을 지난 횟수 (01-formulas 2.2) */
  expYears: number;
  /** 계승한 새끼의 은수저 지수 — 첫 겨울 보정에 쓴다(01-formulas 6.3). 런 시작 개체는 없음 */
  silverSpoon?: number;
}

/** 플레이어의 짝 (04-breeding 2장). 짝 지시·번식은 이 값을 쓴다 */
export interface Mate {
  sex: 'female' | 'male';
  age: number;
  expYears: number;
  potential: Partial<Record<StatName, number>>;
  stats: Partial<Record<StatName, number>>;
  /** 실제 성격. 수락률은 늘 이것으로 계산한다(2.5) */
  personality: 'bold' | 'shy';
  /** 성격이 '확인'됐나. 아니면 화면은 힌트만 보여 준다 */
  personalityKnown: boolean;
  bond: number;
  /** 지금까지 건 지시 수(수락·거절 모두) — `mate.revealAfterOrders`면 성격 확인 (2.5) */
  orders?: number;
}

/** 지금 걸린 짝 지시·도움 (04-breeding 3장). 그 국면이 끝나면 없어진다 */
export interface MateOrder {
  /** 고른 선택 id — `mateOrder.<id>` 또는 `help.<id>` */
  id: string;
  phase: Phase;
  accepted: boolean;
  /** 효과 비율 — 수락 1, 거절이면 f (3.5) */
  effect: number;
  /** 짝 r에 더하는 값 (2.6) — 거절이면 0 */
  mateR: number;
}

/** 짝 지시 관문 카드 — 수락률은 등급만 (2.5, 01-formulas 7.4) */
export interface MateOrderCard {
  choiceId: string;
  /** 수락 판정이 있는 지시만. 성격 확인 전에는 `neutral`로 계산 */
  acceptance?: 'high' | 'mid' | 'low';
}

/** 짝 후보 카드 하나 — 만들 때 신호까지 한 번 정해 고정한다 (04-breeding 2.2·2.3) */
export interface MateCandidate extends Mate {
  /** 잠재력 평균. 화면에 숫자로 나오지 않는다 */
  quality: number;
  /** 2.4 상호 선택 — 아니면 고를 수 없다 */
  accepts: boolean;
  /** 깃 선명도 오차 `정규(0, mate.signalSd)` */
  plumageNoise: number;
  /** 성격 힌트(`mate.hintAccuracy` 확률로 맞는 쪽) */
  hint: 'bold' | 'shy';
  /** 지난 짝 — 고르면 재결합 (2.2) */
  previous?: boolean;
}

/** 열려 있는 관문. 열려 있으면 `getChoices`는 관문의 선택지만 준다 (03-contracts 3장) */
export type Gate =
  | { kind: 'mateCandidate'; candidates: MateCandidate[] }
  | { kind: 'mateOrder'; options: string[] }
  | { kind: 'nestSite'; holes: string[] }
  | { kind: 'clutchSize'; options: number[] }
  | { kind: 'parentingPolicy' }
  | { kind: 'secondBrood' }
  | { kind: 'inheritance' };

/** 지은 둥지 (04-breeding 4장). 둥지 국면 동안 이 장소에 묶인다 */
export interface Nest {
  /** 구멍 id (`breeding.nestSite.holes`) — 경쟁에 지면 `shallow` */
  site: string;
  node: string;
  /** 산란수 관문에서 낳은 알 수 (04-breeding 5장) */
  eggs?: number;
  /** 살아 있는 새끼 수 — `incubation` 마지막 단계에 부화로 정해지고, 급이 국면마다 새끼 사망으로 준다 */
  chicks?: number;
  /** 살아 있는 새끼 — 부화 순서. 길이는 늘 `chicks` (05-inheritance 3장) */
  young?: Chick[];
  /** 은수저 — 급이 단계 충족도의 합과 단계 수. 평균이 은수저 지수의 바탕 (01-formulas 6.1) */
  spoon?: { sum: number; steps: number };
}

/** 새끼 하나 — 부화 때 성별·잠재력이 정해진다 (05-inheritance 3장, 01-formulas 5장) */
export interface Chick {
  sex: 'female' | 'male';
  potential: Partial<Record<StatName, number>>;
}

/** 독립한 새끼 — 은수저 지수 확정, 시작 스탯, 첫 겨울 보정 (05-inheritance 3장) */
export interface Fledgling extends Chick {
  silverSpoon: number;
  stats: Partial<Record<StatName, number>>;
  firstWinter: number;
}

/** 산란수 관문 카드 (04-breeding 5장) */
export interface ClutchSizeCard {
  choiceId: string;
  eggs: number;
  /** 관문 뒤 `laying` 단계마다 더 드는 소비 — 수컷이면 0 */
  layingCost: number;
}

/** 2차 번식 여부 관문 카드 (04-breeding 7장) */
export interface SecondBroodCard {
  choiceId: string;
  /** 고르는 순간 잃는 에너지 — '안 한다'는 0 */
  energyCost: number;
}

/** 계승 관문 — 지금 개체 카드 (05-inheritance 5장) */
export interface InheritanceStayCard {
  choiceId: 'inherit.stay';
  age: number;
  /** 노화 위험 배율 (01-formulas 4장) */
  agingMult: number;
  /** 짝 유대 — 짝이 있을 때만 */
  bond?: number;
  /** 1년 생존 예상 0~1, 사건 제외 (05-inheritance 6장) */
  yearSurvival: number;
}

/** 계승 관문 — 독립한 새끼 카드, 부화 순서 (05-inheritance 5장) */
export interface InheritanceChickCard {
  choiceId: string;
  sex: 'female' | 'male';
  /** 잠재력 등급 범위 [아래, 위] (05-inheritance 4장) */
  potentialRange: Partial<Record<StatName, [string, string]>>;
  silverSpoon: number;
  /** 첫 겨울 위험 배율 (01-formulas 6.3) */
  firstWinter: number;
  yearSurvival: number;
}

/** 화면 S-23 둥지 자리 카드 */
export interface NestSiteCard {
  choiceId: string;
  hole: string;
  /** 경쟁 구멍만 — 차지할 확률 0~1 */
  contestChance?: number;
}

/** 화면 S-20 카드 — 신호만, 실제 값은 없다 (04-breeding 2.3) */
export interface MateCandidateCard {
  choiceId: string;
  /** 깃 선명도 등급 = 품질 + 오차 */
  plumage: string;
  /** 노래 등급 = 과시 현재값 */
  song: string;
  age: number;
  hint: 'bold' | 'shy';
  accepts: boolean;
  /** 지난 짝 카드 — 맨 앞에 1장, 늘 받아들인다 (2.2) */
  previous?: boolean;
  /** 지난 짝만: 스탯마다 잠재력 등급 범위 [아래, 위] (05-inheritance 4장) */
  potentialRange?: Partial<Record<StatName, [string, string]>>;
  /** 지난 짝만: 유대 지금 → 재결합 뒤 (2.2) */
  bond?: { now: number; reunion: number };
}

/** 지난 짝이 없어진 이유 (04-breeding 2.1) */
export type MateGone = 'mateDeath' | 'divorce';

/**
 * 런의 전체 상태. 저장 파일의 `state`가 이것이다.
 *
 * 난수 상태가 안에 있으므로 같은 상태 + 같은 선택은 항상 같은 결과를 낸다.
 * 짝 · 새끼 · 가계도 · 환경은 그 규칙을 구현할 때(M1, #21) 더한다.
 */
export interface RunState {
  config: RunConfig;
  rng: RngState;
  at: CalendarAt;
  /** 그 해의 실제 단계표 — 시기마다 단계별 국면 (00-core-loop 8장, `yearCalendar`) */
  calendar: Phase[][];
  /** 지금 장소 id (`data/nodes/`) */
  node: string;
  /** 지금 장소에 도착한 뒤 지난 칸 수. 도착한 칸이 0 (01-formulas 2.3 고갈, 9.4) */
  stay: number;
  /** 짜는 중인 루틴 — 이 단계에 채운 칸의 선택 id (00-core-loop 3.5, 03-contracts 3장) */
  routine?: string[];
  /** 바로 전 단계에 실행한 루틴 — 다음 루틴의 제안값 */
  lastRoutine?: string[];
  player: Bird;
  mate?: Mate;
  /** 지은 둥지. 둥지 국면을 벗어나면 없어진다 */
  nest?: Nest;
  /** 마지막으로 거둔 둥지에 새끼가 남아 있었나 — 다음 `pairing`의 이혼 확률 (04-breeding 2.1). 그때 지운다 */
  broodFledged?: boolean;
  /** 그 해에 지은 둥지 수 — 1년 최대 2번식(00-core-loop 4.4 조건 1). `period 1`에 지운다 */
  yearNests?: number;
  /** 지난 짝이 없어진 이유 — 짝 후보 관문을 닫을 때 지운다 (04-breeding 2.1) */
  mateGone?: MateGone;
  /**
   * 열려 있는 관문. 짝 지시는 단계 시작에 열려 고르면 같은 단계의 칸으로,
   * 나머지는 단계 끝에 열려 고르면 다음 단계로 간다
   */
  gate?: Gate;
  /** 지금 걸린 짝 지시·도움 */
  order?: MateOrder;
  /** 지금 걸린 육아 방침 — 항목 → 선택 (04-breeding 6장). 둥지가 없어지면 없어진다 */
  parenting?: Record<string, string>;
  /** 최근 `mate.reciprocityWindowSteps` 단계가 도움 단계였나 (04-breeding 3.3 상호성) */
  recentHelp?: boolean[];
  /** 점수 = 총 번식 수 (gdd 11.1장 [확정]) */
  totalBreeding: number;
  gameOver: boolean;
  /** 남긴 판정 기록. 저장 파일에 함께 들어가 이야기 피드가 이어진다 */
  log: LogEntry[];
}

/** 화면이 그대로 그리는 형태. 화면은 확률·점수를 계산하지 않는다 (엔진 원칙, 03-contracts 1.5) */
export interface ViewModel {
  at: CalendarAt;
  /** 지금 단계의 국면 */
  phase: Phase;
  speciesId: string;
  /** 지금 장소 id — 이름은 `data.nodes` */
  node: string;
  player: Bird;
  /** 에너지의 상한(지방 상한, 01-formulas 2.1) */
  energyCap: number;
  totalBreeding: number;
  gameOver: boolean;
  /** 열려 있는 관문의 카드 — 짝 후보(S-20) · 짝 지시 · 둥지 자리(S-23) · 산란수 */
  gate?:
    | { kind: 'mateCandidate'; cards: MateCandidateCard[]; previousGone?: MateGone }
    | { kind: 'mateOrder'; cards: MateOrderCard[] }
    | { kind: 'nestSite'; cards: NestSiteCard[] }
    | { kind: 'clutchSize'; cards: ClutchSizeCard[] }
    | { kind: 'parentingPolicy'; cards: ParentingItemChoice[] }
    | { kind: 'secondBrood'; cards: SecondBroodCard[] }
    | {
        kind: 'inheritance';
        /** 맨 위 "번식 성공 — 총 N" */
        totalBreeding: number;
        stay: InheritanceStayCard;
        cards: InheritanceChickCard[];
      };
  nest?: Nest;
  /** 루틴을 짜는 중일 때만 (관문 중에는 없음, 03-contracts 3장 '행동 루틴') */
  routine?: {
    /** 이 단계의 칸 수 */
    slots: number;
    /** 이미 채운 칸의 선택 id */
    filled: string[];
    /** 남은 빈 칸마다 제안 id. null = 제안 없음 */
    suggested: (string | null)[];
    /** 이벤트 뒤 남은 칸 다시 채우기 — 이벤트가 생기기 전에는 늘 false */
    replan: boolean;
  };
  /** 최근 판정 기록 — 이야기 피드 */
  recentLog: LogEntry[];
}

/** `act`의 결과 */
export interface ActResult {
  state: RunState;
  log: LogEntry[];
}
