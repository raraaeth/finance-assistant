/* =====================================================
   Finance Assistant
   FILE : sw.js
   DESCRIPTION : Service Worker dimatikan (PWA dihentikan)

   Finance Assistant sekarang fokus sebagai aplikasi
   Android. Service worker ini hanya bertugas membersihkan
   cache lama dan mencabut registrasinya sendiri pada
   perangkat yang sebelumnya memasang PWA.
===================================================== */

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));
            await self.registration.unregister();
            const clients = await self.clients.matchAll({ type: "window" });
            clients.forEach((client) => client.navigate(client.url));
        })()
    );
});
