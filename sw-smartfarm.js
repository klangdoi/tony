// SmartFarm Registry — Service Worker v4.0.1
const CACHE_NAME = 'smartfarm-v4.0.1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Notification click — เปิดแอป
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
      for(const client of list){
        if('focus' in client) return client.focus();
      }
      if(clients.openWindow) return clients.openWindow('./smartfarm.html');
    })
  );
});

// รับ message จากแอป — แสดง notification
self.addEventListener('message', e => {
  if(e.data?.type==='SHOW_NOTIF'){
    const {title,body,icon='🌿'} = e.data;
    self.registration.showNotification(title,{
      body,
      icon:`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text y="52" font-size="52">${icon}</text></svg>`,
      badge:`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text y="52" font-size="52">🌿</text></svg>`,
      vibrate:[200,100,200],
      tag:'sf-'+Date.now(),
    });
  }
});
