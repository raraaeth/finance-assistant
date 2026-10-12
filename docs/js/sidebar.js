
/* =========================================================
   FINANCE ASSISTANT — DOCUMENTATION
   Sidebar
   File : sidebar.js
   ========================================================= */

import {
  ARTICLES,
  getArticleIdFromURL
} from "./router.js";


/* =========================================================
   1. ELEMENTS
   ========================================================= */

const sidebar =
  document.getElementById("sidebar");

const sidebarContent =
  document.getElementById("sidebarContent");

const sidebarToggle =
  document.getElementById("sidebarToggle");

const sidebarOverlay =
  document.getElementById("sidebarOverlay");


/* =========================================================
   2. GROUP ARTICLES
   ========================================================= */

function groupArticles() {

  const groups = {};

  ARTICLES.forEach(article => {

    if (!groups[article.section]) {
      groups[article.section] = [];
    }

    groups[article.section].push(article);

  });

  return groups;

}


/* =========================================================
   3. RENDER SIDEBAR
   Semua tautan menggunakan permalink dari router.js.
   ========================================================= */

function renderSidebar() {

  if (!sidebarContent) {
    return;
  }

  const groups = groupArticles();

  sidebarContent.innerHTML = "";

  Object.entries(groups).forEach(
    ([sectionName, articles]) => {

      const section =
        document.createElement("div");

      section.className = "sidebar-section";

      const title =
        document.createElement("div");

      title.className = "sidebar-section-title";
      title.textContent = sectionName;

      const list =
        document.createElement("ul");

      list.className = "sidebar-list";

      articles.forEach(article => {

        const item =
          document.createElement("li");

        const link =
          document.createElement("a");

        link.className = "sidebar-link";
        link.href = article.url;
        link.dataset.doc = article.id;
        link.textContent = article.title;

        item.appendChild(link);
        list.appendChild(item);

      });

      section.appendChild(title);
      section.appendChild(list);
      sidebarContent.appendChild(section);

    }
  );

}


/* =========================================================
   4. ACTIVE ARTICLE
   Berdasarkan permalink halaman saat ini.
   ========================================================= */

function setActiveArticle(articleId) {

  if (!sidebarContent) {
    return;
  }

  const links =
    sidebarContent.querySelectorAll("a[data-doc]");

  links.forEach(link => {

    const isActive =
      Boolean(articleId) &&
      link.dataset.doc === articleId;

    link.classList.toggle("active", isActive);

    if (isActive) {

      link.setAttribute("aria-current", "page");

    } else {

      link.removeAttribute("aria-current");

    }

  });

}


/* =========================================================
   5. CLOSE MOBILE SIDEBAR
   ========================================================= */

function closeSidebar() {

  if (sidebar) {
    sidebar.classList.remove("open");
  }

  if (sidebarOverlay) {

    sidebarOverlay.classList.remove("active");

    sidebarOverlay.setAttribute(
      "aria-hidden",
      "true"
    );

  }

  if (sidebarToggle) {

    sidebarToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    sidebarToggle.setAttribute(
      "aria-label",
      "Buka menu"
    );

  }

}


/* =========================================================
   6. TOGGLE MOBILE SIDEBAR
   ========================================================= */

function toggleSidebar() {

  if (!sidebar) {
    return;
  }

  const isOpen =
    sidebar.classList.toggle("open");

  if (sidebarOverlay) {

    sidebarOverlay.classList.toggle(
      "active",
      isOpen
    );

    sidebarOverlay.setAttribute(
      "aria-hidden",
      String(!isOpen)
    );

  }

  if (sidebarToggle) {

    sidebarToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    sidebarToggle.setAttribute(
      "aria-label",
      isOpen ? "Tutup menu" : "Buka menu"
    );

  }

}


/* =========================================================
   7. SIDEBAR LINKS
   Navigasi normal melalui permalink.
   ========================================================= */

function setupSidebarLinks() {

  if (!sidebarContent) {
    return;
  }

  sidebarContent.addEventListener(
    "click",
    event => {

      const link =
        event.target.closest("a[data-doc]");

      if (!link) {
        return;
      }

      // Biarkan browser membuka halaman HTML tujuan.
      // Jangan gunakan preventDefault().
      closeSidebar();

    }
  );

}


/* =========================================================
   8. TOGGLE BUTTON & OVERLAY
   ========================================================= */

function setupSidebarToggle() {

  if (sidebarToggle) {
    sidebarToggle.addEventListener(
      "click",
      toggleSidebar
    );
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener(
      "click",
      closeSidebar
    );
  }

}


/* =========================================================
   9. ESCAPE KEY
   ========================================================= */

function setupEscapeKey() {

  document.addEventListener(
    "keydown",
    event => {

      if (event.key === "Escape") {
        closeSidebar();
      }

    }
  );

}


/* =========================================================
   10. NAVIGATION EVENT
   ========================================================= */

function setupNavigationListener() {

  document.addEventListener(
    "documentation:navigate",
    event => {

      const articleId =
        event.detail?.articleId;

      setActiveArticle(articleId || null);

    }
  );

}


/* =========================================================
   11. INITIALIZE
   ========================================================= */

export function initSidebar() {

  if (!sidebarContent) {
    return;
  }

  renderSidebar();

  // /docs/ otomatis menandai Pengenalan aktif.
  // URL yang tidak dikenal tidak menandai artikel apa pun.
  setActiveArticle(getArticleIdFromURL());

  setupSidebarLinks();
  setupSidebarToggle();
  setupEscapeKey();
  setupNavigationListener();

}
