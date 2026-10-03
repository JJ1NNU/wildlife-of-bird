import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import '@wb/tokens/tokens.css';
import './style.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root가 없다');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
