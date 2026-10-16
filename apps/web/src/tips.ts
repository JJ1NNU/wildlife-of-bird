/**
 * 튜토리얼 팁(06-tutorial) — 상황을 처음 만날 때 한 장씩. 팁은 결정이 아니라 상태·리플레이에 안 들어가고,
 * 본 팁 id만 기기에 따로 저장한다(`wb.tips`, 게임 저장과 무관).
 */
const KEY = 'wb.tips';

/** 번호 = 줄 세우기 우선순위 (06-tutorial 4장 표 순서) */
export const TIP_ORDER = [
  'T-00',
  'T-01',
  'T-02',
  'T-03',
  'T-04',
  'T-05',
  'T-06',
  'T-07',
  'T-08',
  'T-10',
  'T-11',
  'T-12',
  'T-13',
  'T-14',
  'T-15',
  'T-30',
  'T-31',
  'T-40',
] as const;
export type TipId = (typeof TIP_ORDER)[number];

/**
 * 팁이 가리키는 대상(06-tutorial 4장 "가리키는 곳") — 첫 번째로 맞는 요소에 `.tip-target` 테두리(ui-kit 3.2).
 * 대상이 여럿이면 첫 카드만. 없는 팁(T-00)·아직 안 정한 관문 팁은 테두리 없이 카드만 뜬다
 */
export const TIP_TARGET: Partial<Record<TipId, string>> = {
  'T-01': '[data-testid="hand"]',
  'T-02': '[data-testid="hand"] .pcard .val',
  'T-03': '[data-testid="hand"] .pcard .risk',
  'T-04': '[data-testid="budget"]',
  'T-05': '[data-testid^="choice-move."]',
  'T-06': '[data-testid="starving"]',
  'T-07': '[data-testid="replay"]',
  'T-40': '[data-testid="death-cause"]',
};

/** 한 단계에 띄우는 팁 수 한도 — 넘치면 다음 단계로. T-30은 미루지 않는다(4장) */
const PER_STEP = 3;

/** 문구 키 앞부분: `T-01` → `tutorial.t01` */
export function tipKey(id: TipId): string {
  return `tutorial.${id.replace('-', '').toLowerCase()}`;
}

/**
 * 지금 띄울 팁 — 조건이 참인 것 중 안 본 것을 번호 순으로 하나.
 * `stepShown`은 이번 단계에 이미 닫은 팁 수(T-00은 런 시작 전 온보딩이라 세지 않는다).
 */
export function nextTip(
  due: ReadonlySet<TipId>,
  seen: ReadonlySet<string>,
  stepShown: number,
): TipId | undefined {
  return TIP_ORDER.find(
    (id) =>
      due.has(id) && !seen.has(id) && (id === 'T-00' || id === 'T-30' || stepShown < PER_STEP),
  );
}

export function loadSeenTips(): Set<string> {
  try {
    const s = localStorage.getItem(KEY);
    return new Set(s ? (JSON.parse(s) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function saveSeenTips(seen: ReadonlySet<string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...seen]));
  } catch {
    // 저장 못 하면 다음에 다시 뜰 뿐이다
  }
}

/** S-40 도움말 켜기/끄기 — 기본 켜짐(06-tutorial 2장). 본 팁 목록과 따로 저장 */
const OFF_KEY = 'wb.tipsOff';

export function loadTipsOn(): boolean {
  try {
    return localStorage.getItem(OFF_KEY) !== '1';
  } catch {
    return true;
  }
}

export function saveTipsOn(on: boolean): void {
  try {
    if (on) localStorage.removeItem(OFF_KEY);
    else localStorage.setItem(OFF_KEY, '1');
  } catch {
    // 저장 못 하면 다음에 켜진 채로 시작할 뿐이다
  }
}
