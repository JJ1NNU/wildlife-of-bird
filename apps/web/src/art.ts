import type { ViewModel } from '@wb/engine';

/** 자리표시 그림(assets/placeholder, 아트 #15) — 투명 배경이라 겹쳐 그리는 사건 띠에도 쓴다 */
const placeholders = import.meta.glob('../../../assets/placeholder/ph.bird.*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** 최종 그림(assets/bird, #476) — 알파 없음(종이색 배경). 이름 규칙은 docs/art/asset-list.md */
const finals = import.meta.glob('../../../assets/bird/bird.*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export function placeholderBirdUrl(speciesId: string): string | undefined {
  return placeholders[`../../../assets/placeholder/ph.bird.${speciesId}.svg`];
}

/** 메인 그림 — 둥지에 새끼가 있으면 둥지, 0살이면 어린 새, 아니면 성조(성별). 최종 그림이 없는 종은 자리표시 */
export function birdUrl(view: ViewModel): string | undefined {
  const id = view.speciesId;
  const variant =
    (view.nest?.chicks ?? 0) > 0
      ? 'chick.nest'
      : view.player.age === 0
        ? 'juv.perch'
        : `adult-${view.player.sex === 'male' ? 'm' : 'f'}.breeding.perch`;
  return finals[`../../../assets/bird/bird.${id}.${variant}.webp`] ?? placeholderBirdUrl(id);
}

/** 어린 새 그림(계승 새끼 줄 사진 40) — 최종 그림이 없는 종은 자리표시 */
export function juvBirdUrl(speciesId: string): string | undefined {
  return (
    finals[`../../../assets/bird/bird.${speciesId}.juv.perch.webp`] ?? placeholderBirdUrl(speciesId)
  );
}
