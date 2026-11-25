/* Finance Assistant — gerbang pindah ke aplikasi Android (masa tenggang).
 *
 * Dipasang hanya di halaman aplikasi web (pages/). Landing, docs, blog,
 * dan halaman publik lain TIDAK memakai skrip ini.
 *
 * Perilaku:
 * - Selama masa tenggang (sampai CUTOFF): dialog pengingat muncul
 *   maksimal sekali per hari, masih bisa ditutup ("Nanti Saja") dan
 *   versi web tetap bisa dipakai.
 * - Setelah CUTOFF: dialog mengunci layar, tidak bisa ditutup, satu-
 *   satunya jalan adalah tombol unduh aplikasi Android di Play Store.
 *
 * Mengubah tanggal kunci = ubah CUTOFF di bawah ini saja.
 * Keputusan Nur 26 Nov 2026: masa tenggang + tautan Play Store.
 */
(function () {
  "use strict";

  var CUTOFF = new Date("2026-12-15T23:59:59+07:00"); // akhir masa tenggang (WIB)
  var PLAY_URL = "https://play.google.com/store/apps/details?id=web.financeassistant.app";
  var LS_KEY = "fa_force_update_last_shown";

  var now = new Date();
  var hard = now > CUTOFF;

  // Cegah kedipan isi aplikasi sebelum keputusan tampil (khusus mode kunci).
  if (hard) {
    document.documentElement.style.visibility = "hidden";
  }

  function daysLeft() {
    var ms = CUTOFF.getTime() - now.getTime();
    return Math.max(0, Math.ceil(ms / 86400000));
  }

  function shownToday() {
    try {
      var v = window.localStorage.getItem(LS_KEY);
      return v === now.toDateString();
    } catch (e) {
      return false;
    }
  }

  function markShown() {
    try {
      window.localStorage.setItem(LS_KEY, now.toDateString());
    } catch (e) { /* abaikan */ }
  }

  function build() {
    var overlay = document.createElement("div");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,.72);" +
      "display:flex;align-items:center;justify-content:center;padding:20px;" +
      "font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;";

    var card = document.createElement("div");
    card.style.cssText =
      "background:#fff;border-radius:16px;max-width:420px;width:100%;" +
      "padding:28px 24px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.35);";

    var title = document.createElement("h2");
    title.style.cssText = "margin:0 0 12px;font-size:21px;color:#0f172a;line-height:1.3;";
    title.textContent = hard
      ? "Versi Web Sudah Berakhir"
      : "Versi Web Akan Berakhir";

    var body = document.createElement("p");
    body.style.cssText = "margin:0 0 20px;font-size:15px;line-height:1.55;color:#334155;";
    if (hard) {
      body.textContent =
        "Finance Assistant versi web sudah tidak bisa digunakan. Semua fitur " +
        "sudah pindah ke aplikasi Android. Data Anda aman: pasang aplikasinya, " +
        "masuk dengan akun Google yang sama, lalu pilih \u201CMuat Data dari Drive\u201D " +
        "untuk melanjutkan data lama Anda.";
    } else {
      body.textContent =
        "Mulai 16 Desember 2026 (tersisa " + daysLeft() + " hari lagi), Finance " +
        "Assistant versi web tidak bisa digunakan lagi. Semua fitur sudah pindah " +
        "ke aplikasi Android. Data Anda aman: pasang aplikasinya, masuk dengan " +
        "akun Google yang sama, lalu pilih \u201CMuat Data dari Drive\u201D untuk " +
        "melanjutkan data lama Anda.";
    }

    var cta = document.createElement("a");
    cta.href = PLAY_URL;
    cta.target = "_blank";
    cta.rel = "noopener";
    cta.textContent = "Unduh di Google Play";
    cta.style.cssText =
      "display:block;background:#2563eb;color:#fff;text-decoration:none;" +
      "font-weight:600;font-size:16px;padding:13px 18px;border-radius:10px;";

    card.appendChild(title);
    card.appendChild(body);
    card.appendChild(cta);

    if (!hard) {
      var later = document.createElement("button");
      later.type = "button";
      later.textContent = "Nanti Saja";
      later.style.cssText =
        "margin-top:12px;background:none;border:none;color:#64748b;" +
        "font-size:14px;cursor:pointer;padding:6px 10px;";
      later.addEventListener("click", function () {
        overlay.remove();
      });
      card.appendChild(later);
    }

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    if (hard) {
      document.documentElement.style.visibility = "";
    }
  }

  function init() {
    if (!hard && shownToday()) return;
    markShown();
    build();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
