/* =====================================================
   Finance Assistant
   FILE        : pwa.js
   DESCRIPTION : PWA dihentikan, fokus aplikasi Android
   VERSION     : 2.0.0

   Berkas ini tidak lagi mendaftarkan service worker
   dan tidak lagi menawarkan install PWA. Tugasnya hanya
   membersihkan service worker dan cache lama pada
   perangkat yang sebelumnya memasang PWA, lalu
   menyembunyikan tombol install lama bila masih ada.
===================================================== */

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations()
        .then((registrations) => {
            registrations.forEach((registration) => {
                registration.unregister();
            });
        })
        .catch(() => {});
}

if ("caches" in window) {
    caches.keys()
        .then((keys) => {
            keys.forEach((key) => {
                caches.delete(key);
            });
        })
        .catch(() => {});
}

document.addEventListener("DOMContentLoaded", () => {
    document
        .querySelectorAll("#install-pwa, .install-pwa")
        .forEach((button) => {
            button.style.display = "none";
        });
});
