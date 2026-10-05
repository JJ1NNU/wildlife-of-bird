import type { CSSProperties } from 'react';

/** 아이콘 v0(assets/icon, 아트 #25). CSS mask로 글자색을 따른다. 작은 SVG는 Vite가 작은따옴표가 든 data: 주소로 넣으므로 큰따옴표로 감싼다. */
const urls = import.meta.glob('../../../assets/icon/icon.*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** `icon.action.forage` 같은 이름을 `.ico`에 줄 style로. 없는 아이콘이면 undefined */
export function iconStyle(name: string): CSSProperties | undefined {
  const url = urls[`../../../assets/icon/${name}.svg`];
  return url ? ({ '--i': `url("${url}")` } as CSSProperties) : undefined;
}
