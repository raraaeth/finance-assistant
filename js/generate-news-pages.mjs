
/* =====================================================
   FINANCE ASSISTANT
   NEWS & UPDATE

   File    : /js/generate-news-pages.mjs
   Version : 1.0.0

   Description :
   Generate static HTML pages for News articles.

   Source :
   /news/js/articles.js

   Output :
   /news/<slug>/index.html
===================================================== */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT_DIR = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    ".."
);

const NEWS_DIR = path.join(ROOT_DIR, "news");
const ARTICLES_FILE = path.join(
    NEWS_DIR,
    "js",
    "articles.js"
);

const SITE_URL = "https://financeassistant.web.id";
const NEWS_URL = `${SITE_URL}/news/`;

/* =====================================================
   HTML HELPERS
===================================================== */

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeJSON(value) {
    return JSON.stringify(value).replace(/</g, "\\u003c");
}

function formatDate(date) {
    if (!date) return "";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function createExcerpt(html = "") {
    const text = String(html)
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#039;/gi, "'")
        .replace(/\s+/g, " ")
        .trim();

    if (text.length <= 280) {
        return text;
    }

    const shortened = text.slice(0, 277);
    const lastSpace = shortened.lastIndexOf(" ");

    return `${shortened.slice(0, lastSpace > 0 ? lastSpace : 277)}…`;
}

function getArticleURL(slug) {
    return `/news/${encodeURIComponent(slug)}/`;
}

/* =====================================================
   LOAD ARTICLES
===================================================== */

async function loadArticles() {
    const moduleURL = pathToFileURL(ARTICLES_FILE).href;
    const module = await import(
        `${moduleURL}?update=${Date.now()}`
    );

    if (!Array.isArray(module.default)) {
        throw new Error(
            "news/js/articles.js harus mengekspor array artikel."
        );
    }

    const articles = module.default;

    const seenSlugs = new Set();

    for (const article of articles) {
        if (!article.slug || !article.title) {
            throw new Error(
                "Ada artikel yang tidak memiliki slug atau title."
            );
        }

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) {
            throw new Error(
                `Slug tidak valid: ${article.slug}`
            );
        }

        if (seenSlugs.has(article.slug)) {
            throw new Error(
                `Slug duplikat ditemukan: ${article.slug}`
            );
        }

        seenSlugs.add(article.slug);
    }

    return [...articles].sort((a, b) => {
        return new Date(b.date || 0) - new Date(a.date || 0);
    });
}

/* =====================================================
   ARTICLE HTML
===================================================== */

function buildArticleContent(
    article,
    previousArticle,
    nextArticle
) {
    const imageHTML = article.image
        ? `
            <div class="news-article-cover">
                <img
                    src="${escapeHTML(article.image)}"
                    alt="${escapeHTML(article.title)}"
                >
            </div>
        `
        : "";

    const previousHTML = previousArticle
        ? `
            <a href="${getArticleURL(previousArticle.slug)}">
                ← Artikel Sebelumnya
            </a>
        `
        : `<span class="is-disabled">← Artikel Sebelumnya</span>`;

    const nextHTML = nextArticle
        ? `
            <a href="${getArticleURL(nextArticle.slug)}">
                Artikel Berikutnya →
            </a>
        `
        : `<span class="is-disabled">Artikel Berikutnya →</span>`;

    return `
        <article class="news-article">

            <header class="news-article-header">
                <div class="news-article-date">
                    ${formatDate(article.date)}
                </div>

                <h1 class="news-article-title">
                    ${escapeHTML(article.title)}
                </h1>
            </header>

            ${imageHTML}

            <div class="news-article-content">
                ${article.content || ""}
            </div>

            <div class="news-article-share">
                <p class="news-share-title">Bagikan artikel :</p>
                <div class="sharethis-inline-share-buttons"></div>
            </div>

            <nav
                class="news-article-navigation"
                aria-label="Navigasi artikel"
            >
                ${previousHTML}
                ${nextHTML}
            </nav>

        </article>
    `;
}

/* =====================================================
   STATIC SEO
===================================================== */

function buildSEO(article, canonical) {
    const seo = article.seo || {};

    const title =
        seo.title ||
        `${article.title} — Finance Assistant`;

    const description =
        seo.description ||
        createExcerpt(article.content);

    const keywords = seo.keywords || "";

    const image = article.image
        ? new URL(article.image, SITE_URL).href
        : "";

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        name: title,
        description,
        url: canonical,
        datePublished: article.date || "",
        dateModified: article.date || "",
        inLanguage: "id-ID",
        articleSection: "News & Update",
        author: {
            "@type": "Organization",
            name: "Finance Assistant",
            url: SITE_URL
        },
        publisher: {
            "@type": "Organization",
            name: "Finance Assistant",
            url: SITE_URL
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonical
        },
        ...(image ? { image: [image] } : {})
    };

    return {
        title,
        description,
        keywords,
        image,
        structuredData
    };
}

/* =====================================================
   PAGE TEMPLATE
===================================================== */

function buildPage(article, previousArticle, nextArticle) {
    const canonical = new URL(
        getArticleURL(article.slug),
        SITE_URL
    ).href;

    const seo = buildSEO(article, canonical);

    const content = buildArticleContent(
        article,
        previousArticle,
        nextArticle
    );

    return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#ffffff">

    <title>${escapeHTML(seo.title)}</title>
    <meta name="description" content="${escapeHTML(seo.description)}">
    <meta name="keywords" content="${escapeHTML(seo.keywords)}">
    <meta name="robots" content="index, follow">

    <link rel="icon" type="image/png" href="/assets/icons/icon-192.png">
    <link rel="stylesheet" href="../style.css">
    <link rel="canonical" href="${escapeHTML(canonical)}">

    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHTML(seo.title)}">
    <meta property="og:description" content="${escapeHTML(seo.description)}">
    <meta property="og:url" content="${escapeHTML(canonical)}">
    <meta property="og:site_name" content="Finance Assistant">
    <meta property="og:locale" content="id_ID">

    ${seo.image ? `
    <meta property="og:image" content="${escapeHTML(seo.image)}">
    <meta property="og:image:alt" content="${escapeHTML(seo.title)}">
    ` : ""}

    <meta name="twitter:card" content="${seo.image ? "summary_large_image" : "summary"}">
    <meta name="twitter:title" content="${escapeHTML(seo.title)}">
    <meta name="twitter:description" content="${escapeHTML(seo.description)}">
    <meta name="twitter:url" content="${escapeHTML(canonical)}">

    ${seo.image ? `
    <meta name="twitter:image" content="${escapeHTML(seo.image)}">
    ` : ""}

    <script type="application/ld+json">${escapeJSON(seo.structuredData)}</script>

    <script
        type="text/javascript"
        src="https://platform-api.sharethis.com/js/sharethis.js#property=6abe2c539c1fa68c7ae459a8&product=inline-share-buttons"
        async="async"
    ></script>
</head>

<body>
    <header class="news-header">
        <div class="news-header-inner">

            <button
                type="button"
                class="news-menu-button"
                id="newsMenuButton"
                aria-label="Buka navigasi"
                aria-expanded="false"
            >☰</button>

            <a
                href="/news/"
                class="news-brand"
                aria-label="Finance Assistant News"
            >
                <img
                    src="/assets/icons/icon-192.png"
                    alt="Finance Assistant"
                    class="news-brand-icon"
                >
                <span class="news-brand-title">Finance Assistant</span>
            </a>

            <a
                href="/news/"
                class="news-home-button"
                aria-label="Beranda News"
                title="Beranda News"
            >📰</a>

        </div>
    </header>

    <div
        class="news-menu-overlay"
        id="newsMenuOverlay"
        aria-hidden="true"
    ></div>

    <aside
        class="news-drawer"
        id="newsDrawer"
        aria-label="Navigasi Finance Assistant"
    >
        <div class="news-drawer-header">
            <img
                src="/assets/icons/icon-192.png"
                alt="Finance Assistant"
                class="news-drawer-icon"
            >
            <div>
                <strong>Finance Assistant</strong>
                <span>Navigasi</span>
            </div>
        </div>

        <nav class="news-drawer-nav">
            <a href="/pages/" class="news-drawer-link">
                <span>🏠</span><span>Home Page</span>
            </a>
            <a href="/docs/" class="news-drawer-link">
                <span>📖</span><span>Panduan</span>
            </a>
            <a href="/pages/dashboard/" class="news-drawer-link">
                <span>📊</span><span>Dashboard</span>
            </a>
            <a href="/news/" class="news-drawer-link active">
                <span>📰</span><span>News &amp; Update</span>
            </a>
            <a href="/sitemap/" class="news-drawer-link">
                <span>🗺️</span><span>Sitemap</span>
            </a>
        </nav>
    </aside>

    <main class="news-main" id="newsMain">
        <div class="news-content" id="newsContent">
            ${content}
        </div>
    </main>

    <script type="module" src="../js/app.js"></script>
</body>
</html>
`;
}

/* =====================================================
   GENERATE PAGES
===================================================== */

async function generatePages() {
    const articles = await loadArticles();

    if (!articles.length) {
        throw new Error("Tidak ada artikel untuk dibuat.");
    }

    let generated = 0;

    for (let i = 0; i < articles.length; i++) {
        const article = articles[i];

        const previousArticle = articles[i - 1] || null;
        const nextArticle = articles[i + 1] || null;

        const outputDir = path.join(
            NEWS_DIR,
            article.slug
        );

        const outputFile = path.join(
            outputDir,
            "index.html"
        );

        await fs.mkdir(outputDir, {
            recursive: true
        });

        const html = buildPage(
            article,
            previousArticle,
            nextArticle
        );

        await fs.writeFile(
            outputFile,
            html,
            "utf8"
        );

        generated++;

        console.log(
            `Generated: news/${article.slug}/index.html`
        );
    }

    console.log(
        `\nSelesai. ${generated} halaman artikel dibuat.`
    );
}

generatePages().catch(error => {
    console.error("Gagal membuat halaman News:");
    console.error(error);
    process.exitCode = 1;
});
