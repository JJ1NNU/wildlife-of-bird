/** 종 그림 주소. 지금은 자리표시(assets/placeholder, 아트 #15) — 최종 그림이 오면 경로만 바꾼다. */
const urls = import.meta.glob('../../../assets/placeholder/ph.bird.*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export function birdUrl(speciesId: string): string | undefined {
  return urls[`../../../assets/placeholder/ph.bird.${speciesId}.svg`];
}
