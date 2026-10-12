
/* =========================================================
   FINANCE ASSISTANT — DOCUMENTATION
   Router
   File : router.js
   ========================================================= */


/* =========================================================
   1. ARTICLE REGISTRY

   Urutan artikel menentukan Previous / Next.
   Artikel menggunakan halaman HTML mandiri.
   ========================================================= */

export const ARTICLES = [

  // =========================
  // DOKUMENTASI
  // =========================

  {
    id: "pengenalan",
    title: "Pengenalan",
    section: "DOKUMENTASI",
    url: "/docs/pengenalan/"
  },

  {
    id: "mulai",
    title: "Mulai",
    section: "DOKUMENTASI",
    url: "/docs/mulai/"
  },

  {
    id: "workspace",
    title: "Workspace",
    section: "DOKUMENTASI",
    url: "/docs/workspace/"
  },

  {
    id: "input",
    title: "Pengaturan & Input",
    section: "DOKUMENTASI",
    url: "/docs/input/"
  },


  // =========================
  // FITUR
  // =========================

  {
    id: "saving",
    title: "Tabungan",
    section: "FITUR",
    url: "/docs/saving/"
  },

  {
    id: "kas",
    title: "Kas Bersama",
    section: "FITUR",
    url: "/docs/kas/"
  },

  {
    id: "financial",
    title: "Financial",
    section: "FITUR",
    url: "/docs/financial/"
  },

  {
    id: "monthly",
    title: "Perhitungan Gaji Bulanan",
    section: "FITUR",
    url: "/docs/monthly/"
  },

  {
    id: "daily",
    title: "Perhitungan Gaji Harian",
    section: "FITUR",
    url: "/docs/daily/"
  },

  {
    id: "airdrop",
    title: "Pengingat Airdrop",
    section: "FITUR",
    url: "/docs/airdrop/"
  },


  // =========================
  // DATA & PRIVASI
  // =========================

  {
    id: "akun",
    title: "Akun",
    section: "DATA & PRIVASI",
    url: "/docs/akun/"
  },

  {
    id: "privacy",
    title: "Data & Privasi",
    section: "DATA & PRIVASI",
    url: "/docs/privacy/"
  }

];


/* =========================================================
   2. DEFAULT ARTICLE
   ========================================================= */

const DEFAULT_ARTICLE = "pengenalan";


/* =========================================================
   3. GET ARTICLE
   ========================================================= */

export function getArticle(id) {

  return ARTICLES.find(
    article => article.id === id
  );

}


/* =========================================================
   4. GET ARTICLE ID FROM URL
   ========================================================= */

export function getArticleIdFromURL() {

  const pathname =
    window.location.pathname
      .replace(/\/+$/, "");

  const docsBasePath = "/docs";


  // Halaman utama dokumentasi

  if (
    pathname === docsBasePath ||
    pathname === ""
  ) {

    return DEFAULT_ARTICLE;

  }


  // Halaman artikel

  if (
    pathname.startsWith(`${docsBasePath}/`)
  ) {

    const articleId =
      pathname
        .slice(`${docsBasePath}/`.length)
        .split("/")[0];

    return getArticle(articleId)
      ? articleId
      : DEFAULT_ARTICLE;

  }


  return DEFAULT_ARTICLE;

}


/* =========================================================
   5. BUILD ARTICLE URL
   ========================================================= */

export function getArticleURL(articleId) {

  const article =
    getArticle(articleId);

  return article
    ? article.url
    : "/docs/";

}


/* =========================================================
   6. PREVIOUS / NEXT NAVIGATION
   ========================================================= */

export function renderArticleNavigation(articleId) {

  const navigation =
    document.getElementById("articleNavigation");

  if (!navigation) {
    return;
  }


  const currentIndex =
    ARTICLES.findIndex(
      article => article.id === articleId
    );

  if (currentIndex === -1) {

    navigation.innerHTML = "";
    return;

  }


  const previous =
    ARTICLES[currentIndex - 1] || null;

  const next =
    ARTICLES[currentIndex + 1] || null;


  navigation.innerHTML = `

    ${
      previous
        ? `
          <a
            href="${previous.url}"
            class="article-nav-button previous"
          >

            <span class="article-nav-label">
              ← Sebelumnya
            </span>

            <span class="article-nav-title">
              ${previous.title}
            </span>

          </a>
        `
        : "<div></div>"
    }

    ${
      next
        ? `
          <a
            href="${next.url}"
            class="article-nav-button next"
          >

            <span class="article-nav-label">
              Berikutnya →
            </span>

            <span class="article-nav-title">
              ${next.title}
            </span>

          </a>
        `
        : "<div></div>"
    }

  `;

}


/* =========================================================
   7. ACTIVE SIDEBAR EVENT
   ========================================================= */

export function notifyNavigation(articleId) {

  document.dispatchEvent(
    new CustomEvent(
      "documentation:navigate",
      {
        detail: {
          articleId
        }
      }
    )
  );

}


/* =========================================================
   8. LEGACY URL SUPPORT
   Mendukung URL lama:
   /docs/?doc=mulai
   ========================================================= */

function handleLegacyURL() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const legacyArticle =
    params.get("doc");

  if (!legacyArticle) {
    return false;
  }


  const article =
    getArticle(legacyArticle);

  if (!article) {
    return false;
  }


  window.location.replace(article.url);

  return true;

}


/* =========================================================
   9. INITIALIZE ROUTER
   ========================================================= */

export function initRouter() {

  // Konversi URL lama jika masih digunakan.

  if (handleLegacyURL()) {
    return;
  }


  const articleId =
    getArticleIdFromURL();


  // Previous / Next hanya dibuat jika elemen tersedia.
  // Halaman artikel mandiri dapat memanggil fungsi ini
  // setelah HTML artikel selesai dimuat.

  renderArticleNavigation(articleId);


  // Sinkronisasi menu aktif pada sidebar.

  notifyNavigation(articleId);

}
