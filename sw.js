// No polling or federation calls; the app reads the shared weekly snapshot.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(n=>n.startsWith('hdk-match-')).map(n=>caches.delete(n)));
  await self.clients.claim();
})()));
