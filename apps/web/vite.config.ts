import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // data/는 저장소 뿌리에 있다 (03-contracts 4장). 개발 서버가 그 파일을 읽도록 허용한다.
  server: { fs: { allow: ['../..'] } },
});
