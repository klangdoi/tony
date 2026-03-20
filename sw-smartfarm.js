// SmartFarm Registry — Service Worker v4.0
const CACHE_NAME = 'smartfarm-v4.0';
const ASSETS = ['./smartfarm.html'];

// ── INSTALL ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── ACTIVATE ──
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── FETCH — Cache first strategy ──
self.addEventListener('fetch', e => {
  // Skip non-GET and cross-origin
  if(e.request.method !== 'GET') return;
  if(!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        if(res && res.status === 200){
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      });
    }).catch(() => caches.match('./smartfarm.html'))
  );
});

// ── PUSH NOTIFICATION ──
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'SmartFarm Registry 🌿';
  const options = {
    body: data.body || 'มีการแจ้งเตือนใหม่',
    icon: data.icon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text y="52" font-size="52">🌿</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text y="52" font-size="52">🌿</text></svg>',
    vibrate: [200, 100, 200],
    tag: data.tag || 'smartfarm',
    requireInteraction: false,
    data: { url: data.url || self.registration.scope }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// ── NOTIFICATION CLICK — open app ──
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || self.registration.scope;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Focus existing window if open
      for(const client of clientList){
        if(client.url === url && 'focus' in client) return client.focus();
      }
      // Open new window
      if(clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ── BACKGROUND SYNC — daily care check ──
self.addEventListener('sync', e => {
  if(e.tag === 'care-check'){
    e.waitUntil(checkCareBackground());
  }
});

async function checkCareBackground(){
  // Read plants from cache/message
  // This is triggered by app when registered
  const allClients = await clients.matchAll();
  allClients.forEach(client => {
    client.postMessage({ type: 'CARE_CHECK' });
  });
}

// ── MESSAGE from app ──
self.addEventListener('message', e => {
  if(e.data?.type === 'SHOW_NOTIF'){
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      icon: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text y="52" font-size="52">${e.data.icon||'🌿'}</text></svg>`,
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text y="52" font-size="52">🌿</text></svg>',
      vibrate: [200, 100, 200],
      tag: 'smartfarm-'+Date.now(),
      data: { url: self.registration.scope }
    });
  }
});
