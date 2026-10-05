import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
// 글꼴(Pretendard, OFL 1.1): 같은 출처에서 unicode-range 조각만 받는다 — 화면에 쓴 글자의 조각만 내려온다
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import '@wb/tokens/tokens.css';
import './style.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root가 없다');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
