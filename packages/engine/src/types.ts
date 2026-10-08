import type { Phase, RiskTier, StatName } from '@wb/schema';
import type { FoodMod } from './formulas.ts';
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
  /** 육아 방침 관문(S-22): 그 방침의 이소 기대 수 (04-breeding 6.4 — 표시는 소수 첫째 자리) */
  expectedFledged?: number;
  /** 육아 방침 관문(S-22): 그 방침의 지금 단계 번식 비용 (표시는 01-formulas 7.2 정수) */
  breedingCost?: number;
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
  /** 이벤트 로그면 이벤트 id */
  event?: string;
  /** 조작이 끝난 개체의 생애 기록 — 계승(`inheritance`)·사망(`death`) 로그에만 (05-inheritance 8장) */
  life?: LifeRecord;
}

/** 지금 조작 중인 개체의 생애 — 가계도 한 줄의 앞부분 (05-inheritance 8장) */
export interface Life {
  /** 1부터 */
  generation: number;
  sex: Bird['sex'];
  start: { at: CalendarAt; age: number };
  /** 이 개체를 조작하는 동안 확정된 번식 수 */
  breeding: number;
  /** 이 개체를 조작하는 동안 독립시킨 새끼 수 */
  fledged: number;
}

/** 가계도 한 줄 (S-30) */
export interface LifeRecord extends Life {
  end: { at: CalendarAt; age: number };
  /** 끝난 이유. 사망이면 원인은 그 로그의 `cause` */
  reason: 'inherit' | 'death';
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
  | { kind: 'inheritance' }
  /** 단계 이벤트 — 루틴이 멈춘 자리 (03-contracts 3장 '이벤트로 멈춤') */
  | { kind: 'event'; id: string };

/** 이벤트로 멈춘 루틴 (03-contracts 3장) — 이벤트 선택지를 고르면 남은 칸을 다시 채운다 */
export interface PausedRoutine {
  /** 이 단계의 칸 수 — 실행 전 상태로 고정 (01-formulas 9.6) */
  slots: number;
  /** 이미 실행한 칸 수 */
  done: number;
  /** 원래 계획 — 다시 채우기의 제안값은 `plan.slice(done)` */
  plan: string[];
  /** 단계를 시작할 때 둥지가 있었나 — 이벤트로 둥지를 잃어도 B-5 흐름을 탄다 */
  nest: boolean;
}

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
  /** 조기 이소(`fledgeEarly`, 03-events 6.1) — 은수저 충족도는 이 단계까지만 쌓는다 */
  fledgedEarly?: true;
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

/**
 * 효과 하나의 화면용 숫자 (03-events 5.3·6.1). 지금 상태 기준이고 판정은 하지 않는다.
 * `delta`·`gain` = 등급표 값(에너지는 지방 상한으로 자르기 전), `chance` = 그 자리 판정 확률 0~1,
 * `chicks` = 지금 새끼 수로 올림한 마릿수, `factor` = 그 시기 끝까지 곱하는 배율, `checks` = 부상 배율을 받는 판정 수
 */
export type EffectPreview =
  | { type: 'energy' | 'feather' | 'bond'; delta: number }
  | { type: 'statGain'; stat: StatName; gain: number }
  | { type: 'deathRisk'; chance: number; cause: string }
  | { type: 'broodRisk'; chance: number }
  | { type: 'chickLoss'; chicks: number }
  | { type: 'riskMod' | 'foodMod'; factor: number }
  | { type: 'injury'; checks: number }
  | { type: 'fledgeEarly' };

/** 이벤트 선택지 카드 — 글은 `data.events`의 그 선택지, 효과 숫자는 여기 (03-events 5.3) */
export interface EventOptionCard {
  choiceId: string;
  /** 판정형만 — 성공 확률 0~1 (5.2) */
  chance?: number;
  /** 고정 효과 */
  effects?: EffectPreview[];
  /** 판정형만 — 성공·실패 효과 */
  onSuccess?: EffectPreview[];
  onFail?: EffectPreview[];
}

/** 산란수 관문 카드 (04-breeding 5장) */
export interface ClutchSizeCard {
  choiceId: string;
  eggs: number;
  /** 관문 뒤 `laying` 단계마다 더 드는 소비 — 수컷이면 0 */
  layingCost: number;
  /** 이소 기대 수 (04-breeding 6.4, 이벤트 없음 — 표시는 화면이 소수 첫째 자리) */
  expectedFledged: number;
  /** 은수저 지수 0~1 (01-formulas 6.1, 새끼 수 = 산란수 × `hatchRate` — 표시는 소수 셋째 자리) */
  silverSpoon: number;
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
  /** 이 구멍에 지으면 둥지 단계마다의 손실 확률 0~1 (04-breeding 4장, 표시는 화면이 소수 첫째 %) */
  nestLoss: number;
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
  /** 이벤트로 멈춘 루틴 — 이벤트 관문 중이거나 남은 칸 다시 채우기 중 */
  paused?: PausedRoutine;
  /** 이벤트 id → 다시 나올 수 있을 때까지 남은 단계 수 (03-events 3.1 쿨다운). 단계가 넘어갈 때 1 줄고 0이면 지운다 */
  eventCooldown?: Record<string, number>;
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
  /** 그 시기가 끝날 때까지 걸린 이벤트·환경 효과 `riskMod`·`foodMod` (03-events 6.1). 시기가 바뀌면 지운다 */
  periodMods?: { risk: RiskTier[]; food: FoodMod[] };
  /**
   * 부상 배율을 받을 남은 위험 판정 수 — 판정 3을 받은 단계가 끝날 때 1 줄고 0이면 지운다 (03-events 6.1 `injury`).
   * 단계 이벤트(판정 뒤)로 걸리면 다음 단계부터, 환경 카드(판정 전)로 걸리면 그 단계부터 센다
   */
  injury?: number;
  /** 이 단계의 이벤트로 걸린(늘어난) 부상 — 이 단계 끝에는 `injury`를 줄이지 않는다 (03-events 6.1 v0.1.2) */
  injuryFresh?: true;
  /** 지금 걸린 육아 방침 — 항목 → 선택 (04-breeding 6장). 둥지가 없어지면 없어진다 */
  parenting?: Record<string, string>;
  /** 최근 `mate.reciprocityWindowSteps` 단계가 도움 단계였나 (04-breeding 3.3 상호성) */
  recentHelp?: boolean[];
  /** 점수 = 총 번식 수 (gdd 11.1장 [확정]) */
  totalBreeding: number;
  /** 지금 조작 중인 개체의 생애 (05-inheritance 8장) */
  life: Life;
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
  /** 플레이어 잠재력 — 스탯마다 등급 범위 [아래, 위]. 숫자는 보이지 않는다 (05-inheritance 4장) */
  potentialRange: Partial<Record<StatName, [string, string]>>;
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
    | { kind: 'event'; id: string; cards: EventOptionCard[] }
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
    /** 이 단계의 칸 수 (평시는 스탯 합 문턱으로 7·8, 01-formulas 9.6). 다시 채우기면 남은 칸 수 */
    slots: number;
    /** 평시에 다음 칸까지 남은 스탯 합. 번식기·문턱을 모두 넘었으면 없음 */
    nextSlotIn?: number;
    /** 이미 채운 칸의 선택 id — 다시 채우기면 실행된 칸은 빠진다 */
    filled: string[];
    /** 남은 빈 칸마다 제안 id. null = 제안 없음 */
    suggested: (string | null)[];
    /** 이벤트 뒤 남은 칸 다시 채우기 (결정으로 세지 않는다) */
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
