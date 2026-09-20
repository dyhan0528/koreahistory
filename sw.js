/* 한국탐방 해설사 — 서비스워커
   앱 셸은 설치 시 미리 담아 두고, 웹폰트는 처음 받은 뒤 캐시에서 쓴다.
   답사지에서 지하철 신호가 약해도 열리는 것이 목적이다. */

const VERSION = "v1.2.0";
const SHELL = "khg-shell-" + VERSION;
const FONTS = "khg-fonts-" + VERSION;

const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL)
      .then(c => c.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== SHELL && k !== FONTS).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if(req.method !== "GET") return;

  const url = new URL(req.url);

  // 웹폰트: 캐시 우선, 없으면 받아서 담아 둔다
  if(url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"){
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(FONTS).then(c => c.put(req, copy));
        return res;
      }).catch(() => hit))
    );
    return;
  }

  if(url.origin !== self.location.origin) return;

  // 문서 요청: 네트워크를 먼저 보고, 실패하면 캐시된 앱 셸로 띄운다
  if(req.mode === "navigate"){
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(SHELL).then(c => c.put("./index.html", copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // 그 밖의 같은 출처 자원: 캐시 우선
  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if(res.ok){
        const copy = res.clone();
        caches.open(SHELL).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});
