/* =========================================================
   FINANCE ASSISTANT — DOCUMENTATION
   Router
   ========================================================= */


/* =========================================================
   1. ARTICLE REGISTRY
   Urutan di sini juga menentukan Previous / Next.
   ========================================================= */

export const ARTICLES = [

  // =========================
  // STARTED
  // =========================

  {
    id: "pengenalan",
    title: "Pengenalan",
    section: "DOKUMENTASI",
    path: "../started/pengenalan.js"
  },

  {
    id: "mulai",
    title: "Mulai",
    section: "DOKUMENTASI",
    path: "../started/mulai.js"
  },

  {
    id: "workspace",
    title: "Workspace",
    section: "DOKUMENTASI",
    path: "../started/workspace.js"
  },

  {
    id: "input",
    title: "Pengaturan & Input",
    section: "DOKUMENTASI",
    path: "../started/input.js"
  },


  // =========================
  // MODULE
  // =========================

  {
    id: "saving",
    title: "Tabungan",
    section: "FITUR",
    path: "../module/saving.js"
  },

  {
    id: "kas",
    title: "Kas Bersama",
    section: "FITUR",
    path: "../module/kas.js"
  },

  {
    id: "financial",
    title: "Financial",
    section: "FITUR",
    path: "../module/financial.js"
  },

  {
    id: "monthly",
    title: "Perhitungan Gaji Bulanan",
    section: "FITUR",
    path: "../module/monthly.js"
  },

  {
    id: "daily",
    title: "Perhitungan Gaji Harian",
    section: "FITUR",
    path: "../module/daily.js"
  },

  {
    id: "airdrop",
    title: "Pengingat Airdrop",
    section: "FITUR",
    path: "../module/airdrop.js"
  },


  // =========================
  // DATA & PRIVASI
  // =========================

  {
    id: "akun",
    title: "Akun",
    section: "DATA & PRIVASI",
    path: "../data-privasi/akun.js"
  },

  {
    id: "privacy",
    title: "Data & Privasi",
    section: "DATA & PRIVASI",
    path: "../data-privasi/privacy.js"
  }

];


/* =========================================================
   2. DEFAULT ARTICLE
   ========================================================= */

const DEFAULT_ARTICLE = "pengenalan";


/* =========================================================
   3. GET ARTICLE FROM URL
   ========================================================= */

function getArticleIdFromURL() {

  const params = new URLSearchParams(
    window.location.search
  );

  return params.get("doc") || DEFAULT_ARTICLE;

}


/* =========================================================
   4. FIND ARTICLE
   ========================================================= */

export function getArticle(id) {

  return ARTICLES.find(
    article => article.id === id
  );

}


/* =========================================================
   5. LOAD ARTICLE
   ========================================================= */

async function loadArticle(article) {

  const articleContainer =
    document.getElementById("article");

  if (!articleContainer) {
    return;
  }


  /* Loading */

  articleContainer.innerHTML = `
    <div class="article-loading">
      Memuat dokumentasi...
    </div>
  `;


  try {

    const module = await import(
      article.path
    );


    const data = module.default;


    if (!data) {
      throw new Error(
        "Artikel tidak memiliki export default."
      );
    }


    /* Update document title */

    document.title =
      `${data.title || article.title} — Finance Assistant`;


    /* Render */

    articleContainer.innerHTML =
      data.content || "";


    /* Scroll ke atas */

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });


  } catch (error) {

    console.error(
      "Gagal memuat artikel:",
      error
    );


    articleContainer.innerHTML = `
      <div class="article-error">

        <h1>Artikel tidak ditemukan</h1>

        <p>
          Dokumentasi yang kamu cari belum tersedia
          atau terjadi kesalahan saat memuat artikel.
        </p>

        <a href="?doc=${DEFAULT_ARTICLE}">
          Kembali ke Pengenalan
        </a>

      </div>
    `;

  }

}


/* =========================================================
   6. PREVIOUS / NEXT
   ========================================================= */

function renderArticleNavigation(articleId) {

  const navigation =
    document.getElementById(
      "articleNavigation"
    );

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
            href="?doc=${previous.id}"
            class="article-nav-button previous"
            data-doc="${previous.id}"
          >

            <span class="article-nav-label">
              ← Sebelumnya
            </span>

            <span class="article-nav-title">
              ${previous.title}
            </span>

          </a>
        `
        : `
          <div></div>
        `
    }


    ${
      next
        ? `
          <a
            href="?doc=${next.id}"
            class="article-nav-button next"
            data-doc="${next.id}"
          >

            <span class="article-nav-label">
              Berikutnya →
            </span>

            <span class="article-nav-title">
              ${next.title}
            </span>

          </a>
        `
        : `
          <div></div>
        `
    }

  `;

}


/* =========================================================
   7. NAVIGATION CLICK
   Intercept link supaya tidak reload.
   ========================================================= */

function setupNavigationLinks() {

  document.addEventListener(
    "click",
    event => {

      const link =
        event.target.closest(
          "[data-doc]"
        );

      if (!link) {
        return;
      }


      event.preventDefault();


      const articleId =
        link.dataset.doc;


      navigateTo(articleId);

    }
  );

}


/* =========================================================
   8. NAVIGATE
   ========================================================= */

export async function navigateTo(
  articleId,
  updateURL = true
) {

  let article =
    getArticle(articleId);


  /* Fallback */

  if (!article) {

    article =
      getArticle(DEFAULT_ARTICLE);

    articleId =
      DEFAULT_ARTICLE;

  }


  /* Update URL */

  if (updateURL) {

    const url =
      new URL(
        window.location.href
      );

    url.searchParams.set(
      "doc",
      articleId
    );


    window.history.pushState(
      {},
      "",
      url
    );

  }


  /* Load */

  await loadArticle(article);


  /* Previous / Next */

  renderArticleNavigation(
    articleId
  );


  /* Active sidebar */

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
   9. BROWSER BACK / FORWARD
   ========================================================= */

function setupHistoryNavigation() {

  window.addEventListener(
    "popstate",
    () => {

      const articleId =
        getArticleIdFromURL();


      navigateTo(
        articleId,
        false
      );

    }
  );

}


/* =========================================================
   10. INITIALIZE ROUTER
   ========================================================= */

export function initRouter() {

  setupNavigationLinks();

  setupHistoryNavigation();


  const articleId =
    getArticleIdFromURL();


  navigateTo(
    articleId,
    false
  );

}
