
/* =========================================================
   FINANCE ASSISTANT — DOCUMENTATION
   Application Entry Point
   File         : app.js
   ========================================================= */

import { initRouter } from "./router.js";
import { initSidebar } from "./sidebar.js";
import { initSidebarFooter } from "./footer.js";
import { ARTICLES } from "./router.js";

/* =========================================================
   SEARCH
   ========================================================= */

function initSearch() {
  const searchButton = document.getElementById("searchButton");
  const searchModal = document.getElementById("searchModal");
  const searchInput = document.getElementById("searchInput");
  const searchClose = document.getElementById("searchClose");
  const searchResults = document.getElementById("searchResults");

  if (
    !searchButton ||
    !searchModal ||
    !searchInput ||
    !searchClose ||
    !searchResults
  ) {
    return;
  }

  let searchIndex = [];
  let isIndexLoaded = false;
  let isLoading = false;

  function openSearch() {
    searchModal.classList.add("active");
    searchModal.setAttribute("aria-hidden", "false");

    searchInput.value = "";
    searchResults.innerHTML = `
      <p class="search-empty">
        Ketik kata kunci untuk mencari dokumentasi.
      </p>
    `;

    searchInput.focus();
    loadSearchIndex();
  }

  function closeSearch() {
    searchModal.classList.remove("active");
    searchModal.setAttribute("aria-hidden", "true");
    searchButton.focus();
  }

  async function loadSearchIndex() {
    if (isIndexLoaded || isLoading) return;

    isLoading = true;

    searchResults.innerHTML = `
      <p class="search-empty">
        Memuat dokumentasi...
      </p>
    `;

    try {
      const results = await Promise.all(
        ARTICLES.map(async (article) => {
          try {
            const response = await fetch(article.url);

            if (!response.ok) {
              throw new Error(
                `Gagal memuat ${article.url}: ${response.status}`
              );
            }

            const html = await response.text();
            const parser = new DOMParser();
            const documentPage = parser.parseFromString(
              html,
              "text/html"
            );

            const title =
              documentPage.querySelector("h1")?.textContent?.trim() ||
              documentPage.querySelector("title")?.textContent?.trim() ||
              article.title;

            const contentElement =
              documentPage.querySelector("#article") ||
              documentPage.querySelector(".docs-article") ||
              documentPage.querySelector("main");

            if (!contentElement) {
              return {
                id: article.id,
                title,
                url: article.url,
                content: ""
              };
            }

            const contentClone = contentElement.cloneNode(true);

            contentClone
              .querySelectorAll(
                "script, style, nav, button, .article-navigation"
              )
              .forEach((element) => element.remove());

            return {
              id: article.id,
              title,
              url: article.url,
              content: contentClone.textContent
                .replace(/\s+/g, " ")
                .trim()
            };
          } catch (error) {
            console.warn(
              `Pencarian tidak dapat membaca artikel "${article.title}".`,
              error
            );

            return {
              id: article.id,
              title: article.title,
              url: article.url,
              content: ""
            };
          }
        })
      );

      searchIndex = results;
      isIndexLoaded = true;

      if (searchInput.value.trim()) {
        performSearch(searchInput.value);
      } else {
        searchResults.innerHTML = `
          <p class="search-empty">
            Ketik kata kunci untuk mencari dokumentasi.
          </p>
        `;
      }
    } catch (error) {
      console.error("Gagal memuat indeks pencarian:", error);

      searchResults.innerHTML = `
        <p class="search-empty">
          Pencarian gagal dimuat. Silakan coba lagi.
        </p>
        <button type="button" class="search-retry">
          Coba lagi
        </button>
      `;
    } finally {
      isLoading = false;
    }
  }

  function performSearch(keyword) {
    const query = keyword.trim().toLocaleLowerCase("id");

    if (!query) {
      searchResults.innerHTML = `
        <p class="search-empty">
          Ketik kata kunci untuk mencari dokumentasi.
        </p>
      `;
      return;
    }

    if (!isIndexLoaded) {
      searchResults.innerHTML = `
        <p class="search-empty">
          Memuat dokumentasi...
        </p>
      `;
      return;
    }

    const matches = searchIndex
      .map((article) => {
        const title = article.title.toLocaleLowerCase("id");
        const content = article.content.toLocaleLowerCase("id");

        let score = 0;

        if (title.includes(query)) score += 10;
        if (content.includes(query)) score += 1;

        return { ...article, score };
      })
      .filter((article) => article.score > 0)
      .sort((a, b) => b.score - a.score);

    if (matches.length === 0) {
      searchResults.innerHTML = `
        <p class="search-empty">
          Tidak ada dokumentasi yang cocok dengan
          "${escapeHTML(keyword.trim())}".
        </p>
      `;
      return;
    }

    searchResults.innerHTML = matches
      .map((article) => {
        const snippet = getSnippet(article.content, query);

        return `
          <a
            class="search-result"
            href="${escapeHTML(article.url)}"
            data-doc="${escapeHTML(article.id)}"
          >
            <span class="search-result-title">
              ${escapeHTML(article.title)}
            </span>
            ${
              snippet
                ? `<span class="search-result-snippet">${escapeHTML(snippet)}</span>`
                : ""
            }
          </a>
        `;
      })
      .join("");
  }

  function getSnippet(content, query) {
    if (!content) return "";

    const lowerContent = content.toLocaleLowerCase("id");
    const index = lowerContent.indexOf(query);

    if (index === -1) {
      return content.slice(0, 140) +
        (content.length > 140 ? "..." : "");
    }

    const start = Math.max(0, index - 55);
    const end = Math.min(content.length, index + query.length + 85);

    return (
      (start > 0 ? "..." : "") +
      content.slice(start, end) +
      (end < content.length ? "..." : "")
    );
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[character];
    });
  }

  searchButton.addEventListener("click", openSearch);
  searchClose.addEventListener("click", closeSearch);

  searchInput.addEventListener("input", () => {
    performSearch(searchInput.value);
  });

  searchModal.addEventListener("click", (event) => {
    if (event.target === searchModal) {
      closeSearch();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" &&
        searchModal.classList.contains("active")) {
      closeSearch();
    }
  });

  searchResults.addEventListener("click", (event) => {
    const retryButton = event.target.closest(".search-retry");

    if (retryButton) {
      isIndexLoaded = false;
      loadSearchIndex();
    }
  });
}

/* =========================================================
   APPLICATION INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  initSidebarFooter();
  initRouter();
  initSearch();
});
