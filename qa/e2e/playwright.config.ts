import { defineConfig } from '@playwright/test';

/**
 * e2e 스모크(T6, test-strategy 5장). `npm run e2e`.
 * 브라우저는 내려받지 않고 설치된 Chrome을 쓴다(GitHub 우분투 러너에도 있음).
 * 이름을 `*.e2e.ts`로 둬 vitest(`*.test.ts`·`*.spec.ts`)가 집어 가지 않게 한다.
 */
export default defineConfig({
  testDir: '.',
  testMatch: '*.e2e.ts',
  outputDir: '../../test-results',
  timeout: 120_000,
  use: {
    baseURL: 'http://localhost:5173',
    channel: 'chrome',
    viewport: { width: 360, height: 780 },
  },
  webServer: {
    command: 'npm run dev -w @wb/web -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    cwd: '../..',
  },
});
