const CACHE_NAME = 'expert-auto-v6';
const CORE = ['./','./index.html','./manifest.json','./style.css','./app.js','./data.js','./ai-providers.js','./firebase-config.js','./fond.jpg','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => Promise.allSettled(CORE.map(u => c.add(u).catch(() => {})))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (/puter|pollinations|openrouter|huggingface|mistral|groq|together|siliconflow|cohere|moonshot|baichuan|zhipu|cdnjs|gstatic|firebase/.test(url.hostname)) {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE_NAME).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE_NAME).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
