import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/** 빨리 감기가 쓰는 QA 봇의 node:fs·node:path를 브라우저용으로 바꾼다 — 안 바꾸면 화면이 빈 채로 멈춘다 */
const botShim: Plugin = {
  name: 'wb-bot-shim',
  enforce: 'pre',
  resolveId(id, importer) {
    if (!importer?.replaceAll('\\', '/').includes('/qa/bots/')) return;
    if (id === 'node:fs') return fileURLToPath(new URL('./src/bot-shim/fs.ts', import.meta.url));
    if (id === 'node:path')
      return fileURLToPath(new URL('./src/bot-shim/path.ts', import.meta.url));
  },
};

export default defineConfig({
  plugins: [botShim, react()],
  // data/는 저장소 뿌리에 있다 (03-contracts 4장). 개발 서버가 그 파일을 읽도록 허용한다.
  server: { fs: { allow: ['../..'] } },
});
