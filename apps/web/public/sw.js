// 서비스워커(#535) — PWA 설치 판정과 오프라인 플레이.
// 늘 네트워크 먼저(새 배포가 바로 보인다), 네트워크가 안 되면 마지막으로 받은 것을 캐시에서 준다.
const CACHE = 'wb-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

/** 첫 방문에 페이지와 그 페이지가 바로 부르는 파일(/assets/…)을 받아 둔다 — 다음엔 오프라인으로 열린다 */
async function precache() {
  const cache = await caches.open(CACHE);
  const res = await fetch('/', { cache: 'no-store' });
  if (!res.ok) return;
  const html = await res.clone().text();
  await cache.put('/', res);
  const urls = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((m) => m[1]);
  await Promise.allSettled(urls.map((u) => cache.add(u)));
}

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // 화면 주소는 하나(/)라 페이지 요청은 모두 같은 칸에 둔다
  const key = req.mode === 'navigate' ? '/' : req;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          e.waitUntil(caches.open(CACHE).then((c) => c.put(key, copy)));
        }
        return res;
      })
      .catch(() => caches.match(key, { ignoreVary: true }).then((hit) => hit ?? Response.error())),
  );
});
