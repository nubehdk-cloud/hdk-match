// HDK Match always requires fresh online data. No offline copies of fixtures
// or HTML are stored by the service worker.
self.addEventListener('install',event=>{
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(name=>name.startsWith('hdk-match-')).map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});
// Intentionally no fetch handler: do not serve stale cached screens.
