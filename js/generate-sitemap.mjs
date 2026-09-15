/* =====================================================
   FINANCE ASSISTANT
   Sitemap Generator

   File    : /js/generate-sitemap.mjs
   Version : 1.0.0

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


import fs from "fs";
import path from "path";
import {
    fileURLToPath
} from "url";


/* =====================================================
   1. ROOT DIRECTORY
===================================================== */

const __filename =
    fileURLToPath(
        import.meta.url
    );


const __dirname =
    path.dirname(
        __filename
    );


/*
   File berada di:

   /js/generate-sitemap.mjs

   Naik satu level = root project
*/

const ROOT_DIR =
    path.resolve(
        __dirname,
        ".."
    );


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
=====================================================

   Berdasarkan router Docs.

   Artikel "pengenalan" adalah DEFAULT_ARTICLE
   sehingga URL-nya:

   /docs/

   Bukan:

   /docs/pengenalan
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
        !fs.existsSync(
            NEWS_ARTICLES_FILE
        )
    ) {

        console.warn(
            "[SITEMAP] articles.js tidak ditemukan:"
        );

        console.warn(
            NEWS_ARTICLES_FILE
        );

        return [];

    }


    try {

        const module =
            await import(
                `file://${NEWS_ARTICLES_FILE}?t=${Date.now()}`
            );


        const articles =
            module.default;


        if (
            !Array.isArray(
                articles
            )
        ) {

            console.warn(
                "[SITEMAP] articles.js tidak mengexport array."
            );

            return [];

        }


        return articles;

    } catch (error) {

        console.error(
            "[SITEMAP] Gagal membaca articles.js:"
        );

        console.error(
            error
        );

        return [];

    }

}


/* =====================================================
   7. NORMALIZE URL
===================================================== */

function normalizeURL(
    url
) {

    if (
        url === "/"
    ) {

        return "/";

    }


    return url
        .replace(
            /^\/+/,
            "/"
        )
        .replace(
            /\/+/g,
            "/"
        );

}


/* =====================================================
   8. ESCAPE XML
===================================================== */

function escapeXML(
    value
) {

    return String(
        value
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&apos;"
        );

}


/* =====================================================
   9. BUILD URL
===================================================== */

function buildURL(
    item
) {

    const fullURL =
        `${SITE_URL}${normalizeURL(
            item.url
        )}`;


    let output = `    <url>
        <loc>${escapeXML(
            fullURL
        )}</loc>`;


    if (
        item.lastmod
    ) {

        output += `
        <lastmod>${escapeXML(
            item.lastmod
        )}</lastmod>`;

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

    for (
        const page
        of PUBLIC_PAGES
    ) {

        urls.push({

            url: page

        });

    }


    /* =================================================
       DOCUMENTATION
    ================================================= */

    for (
        const article
        of DOCS_ARTICLES
    ) {

        urls.push({

            url:
                `/docs/${article}`

        });

    }


    /* =================================================
       NEWS
    ================================================= */

    const newsArticles =
        await loadNewsArticles();


    for (
        const article
        of newsArticles
    ) {

        /*
           Artikel tanpa slug tidak dimasukkan.
        */

        if (
            !article ||
            !article.slug
        ) {

            console.warn(
                "[SITEMAP] Artikel News dilewati karena tidak memiliki slug."
            );

            continue;

        }


        const slug =
            encodeURIComponent(
                article.slug
            );


        urls.push({

            url:
                `/news/${slug}`,

            lastmod:
                article.date || null

        });

    }


    /* =================================================
       REMOVE DUPLICATE URL
    ================================================= */

    const uniqueURLs =
        new Map();


    for (
        const item
        of urls
    ) {

        if (
            !uniqueURLs.has(
                item.url
            )
        ) {

            uniqueURLs.set(
                item.url,
                item
            );

        }

    }


    /* =================================================
       BUILD XML
    ================================================= */

    const entries =
        Array.from(
            uniqueURLs.values()
        )
            .map(
                buildURL
            )
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

    console.log(
        outputPath
    );

    console.log(
        `[SITEMAP] Total URL: ${uniqueURLs.size}`
    );

}


/* =====================================================
   11. RUN
===================================================== */

generateSitemap()
    .catch(
        error => {

            console.error(
                "[SITEMAP] Gagal membuat sitemap."
            );

            console.error(
                error
            );

            process.exit(
                1
            );

        }
    );
