
/* =====================================================
   FINANCE ASSISTANT
   Sitemap Generator

   File    : /js/generate-sitemap.mjs
   Version : 1.1.0

   Description :
   Generate sitemap.xml otomatis untuk halaman
   publik Finance Assistant.

   Sumber:
   - Public pages : konfigurasi tetap
   - Documentation: registry Docs
   - News         : /news/js/articles.js

   Tidak memasukkan:
   - Dashboard
   - /pages/
   - Onboarding
===================================================== */

import fs from "node:fs";
import path from "node:path";
import {
    fileURLToPath,
    pathToFileURL
} from "node:url";


/* =====================================================
   1. ROOT DIRECTORY
===================================================== */

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

const ROOT_DIR =
    path.resolve(__dirname, "..");


/* =====================================================
   2. SITE CONFIGURATION
===================================================== */

const SITE_URL =
    "https://financeassistant.web.id";


/* =====================================================
   3. PUBLIC PAGES
===================================================== */

const PUBLIC_PAGES = [

    "/",

    "/privacy/",

    "/terms/",

    "/app/",

    "/docs/",

    "/news/"

];


/* =====================================================
   4. DOCUMENTATION ARTICLES
===================================================== */

const DOCS_ARTICLES = [

    "mulai",

    "workspace",

    "input",

    "saving",

    "kas",

    "financial",

    "monthly",

    "daily",

    "airdrop",

    "akun",

    "privacy"

];


/* =====================================================
   5. NEWS ARTICLE REGISTRY
===================================================== */

const NEWS_ARTICLES_FILE =
    path.join(
        ROOT_DIR,
        "news",
        "js",
        "articles.js"
    );


/* =====================================================
   6. LOAD NEWS ARTICLES
===================================================== */

async function loadNewsArticles() {

    if (
        !fs.existsSync(NEWS_ARTICLES_FILE)
    ) {

        throw new Error(
            `articles.js tidak ditemukan: ${NEWS_ARTICLES_FILE}`
        );

    }

    const moduleURL =
        pathToFileURL(
            NEWS_ARTICLES_FILE
        ).href;

    const module =
        await import(
            `${moduleURL}?t=${Date.now()}`
        );

    const articles =
        module.default;

    if (!Array.isArray(articles)) {

        throw new Error(
            "articles.js tidak mengekspor array artikel."
        );

    }

    return articles;

}


/* =====================================================
   7. NORMALIZE URL
===================================================== */

function normalizeURL(url) {

    if (url === "/") {
        return "/";
    }

    let normalized =
        String(url)
            .replace(/\\/g, "/")
            .replace(/\/+/g, "/");

    if (!normalized.startsWith("/")) {
        normalized = `/${normalized}`;
    }

    if (!normalized.endsWith("/")) {
        normalized += "/";
    }

    return normalized;

}


/* =====================================================
   8. ESCAPE XML
===================================================== */

function escapeXML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

}


/* =====================================================
   9. BUILD URL
===================================================== */

function buildURL(item) {

    const normalizedURL =
        normalizeURL(item.url);

    const fullURL =
        `${SITE_URL}${normalizedURL}`;

    let output =
`    <url>
        <loc>${escapeXML(fullURL)}</loc>`;

    if (item.lastmod) {

        output += `
        <lastmod>${escapeXML(item.lastmod)}</lastmod>`;

    }

    output += `
    </url>`;

    return output;

}


/* =====================================================
   10. MAIN GENERATOR
===================================================== */

async function generateSitemap() {

    console.log(
        "[SITEMAP] Memulai generate sitemap..."
    );

    const urls = [];


    /* =================================================
       PUBLIC PAGES
    ================================================= */

    for (const page of PUBLIC_PAGES) {

        urls.push({
            url: page
        });

    }


    /* =================================================
       DOCUMENTATION
    ================================================= */

    for (const article of DOCS_ARTICLES) {

        urls.push({
            url: `/docs/${article}/`
        });

    }


    /* =================================================
       NEWS
    ================================================= */

    const newsArticles =
        await loadNewsArticles();

    const seenSlugs =
        new Set();

    for (const article of newsArticles) {

        if (
            !article ||
            !article.slug
        ) {

            throw new Error(
                "Ada artikel News yang tidak memiliki slug."
            );

        }

        if (
            !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
                article.slug
            )
        ) {

            throw new Error(
                `Slug artikel tidak valid: ${article.slug}`
            );

        }

        if (seenSlugs.has(article.slug)) {

            throw new Error(
                `Slug artikel duplikat: ${article.slug}`
            );

        }

        seenSlugs.add(article.slug);

        const slug =
            encodeURIComponent(
                article.slug
            );

        urls.push({

            url: `/news/${slug}/`,

            lastmod: article.date || null

        });

    }


    /* =================================================
       REMOVE DUPLICATE URL
    ================================================= */

    const uniqueURLs =
        new Map();

    for (const item of urls) {

        const normalizedURL =
            normalizeURL(item.url);

        if (!uniqueURLs.has(normalizedURL)) {

            uniqueURLs.set(
                normalizedURL,
                {
                    ...item,
                    url: normalizedURL
                }
            );

        }

    }


    /* =================================================
       BUILD XML
    ================================================= */

    const entries =
        Array.from(uniqueURLs.values())
            .map(buildURL)
            .join("\n");

    const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${entries}
</urlset>
`;


    /* =================================================
       WRITE sitemap.xml
    ================================================= */

    const outputPath =
        path.join(
            ROOT_DIR,
            "sitemap.xml"
        );

    fs.writeFileSync(
        outputPath,
        xml,
        "utf8"
    );


    /* =================================================
       RESULT
    ================================================= */

    console.log(
        "[SITEMAP] Berhasil dibuat:"
    );

    console.log(outputPath);

    console.log(
        `[SITEMAP] Total URL: ${uniqueURLs.size}`
    );

}


/* =====================================================
   11. RUN
===================================================== */

generateSitemap()
    .catch(error => {

        console.error(
            "[SITEMAP] Gagal membuat sitemap."
        );

        console.error(error);

        process.exitCode = 1;

    });
