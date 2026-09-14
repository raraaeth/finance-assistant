/* =====================================================
   FINANCE ASSISTANT
   NEWS & UPDATE

   File    : /news/js/app.js
   Version : 1.2.0

   Description :
   News Application Controller

   Handles :
   - News home
   - Article detail
   - Routing
   - Article listing
   - Load more
   - Prev / next article
   - Dynamic SEO
   - Structured data
   - Navigation menu
===================================================== */

import router from "./router.js";
import articles from "./articles.js";


/* =====================================================
   STATE
===================================================== */

const State = {

    menuOpen: false,

    eventsBound: false,

    articleLimit: 10,

    articlesPerLoad: 10

};


/* =====================================================
   SEO CONFIG
===================================================== */

const SEO = {

    siteName: "Finance Assistant",

    siteURL: "https://financeassistant.web.id",

    newsPath: "/news/",

    homeTitle:
        "News & Update — Finance Assistant",

    homeDescription:
        "Berita, pembaruan, informasi, dan perkembangan terbaru seputar Finance Assistant.",

    homeKeywords:
        "Finance Assistant, berita Finance Assistant, update Finance Assistant, aplikasi keuangan, informasi Finance Assistant"

};


/* =====================================================
   INIT
===================================================== */

function init() {

    initMenu();

    initEvent();

    restoreNewsRoute();

    initRouter();

    router.init();

}


/* =====================================================
   RESTORE LEGACY ROUTE
===================================================== */

function restoreNewsRoute() {

    const params =
        new URLSearchParams(window.location.search);

    const legacyRoute =
        params.get("route");

    if (!legacyRoute) {

        return;

    }

    if (!legacyRoute.startsWith("/news")) {

        return;

    }

    window.history.replaceState(
        {},
        "",
        legacyRoute
    );

}


/* =====================================================
   ROUTER
===================================================== */

function initRouter() {

    window.addEventListener(
        "news:route",
        event => {

            onRoute(event.detail);

        }
    );

}


/* =====================================================
   ROUTE HANDLER
===================================================== */

function onRoute(route) {

    if (!route) {

        renderNotFound();

        return;

    }


    if (route.type === "home") {

        renderHome();

        return;

    }


    if (route.type === "article") {

        renderArticle(route.slug);

        return;

    }


    renderNotFound();

}


/* =====================================================
   HOME
===================================================== */

function renderHome() {

    State.articleLimit = State.articlesPerLoad;


    const container =
        document.getElementById("newsContent");


    if (!container) {

        return;

    }


    const sortedArticles =
        getSortedArticles();


    updateHomeSEO();


    container.innerHTML =
        buildHomeHTML(sortedArticles);


    bindLoadMore();

}


/* =====================================================
   HOME HTML
===================================================== */

function buildHomeHTML(articleList) {

    const visibleArticles =
        articleList.slice(
            0,
            State.articleLimit
        );


    if (!articleList.length) {

        return `
            <section class="news-page">

                <div class="news-page-header">

                    <h1>News & Update</h1>

                    <p>
                        Belum ada berita atau pembaruan.
                    </p>

                </div>

            </section>
        `;

    }


    const cards =
        visibleArticles
            .map(article => buildArticleCard(article))
            .join("");


    const hasMore =
        State.articleLimit < articleList.length;


    return `

        <section class="news-page">

            <div class="news-page-header">

                <h1>News & Update</h1>

                <p>
                    Berita, informasi, dan pembaruan
                    terbaru seputar Finance Assistant.
                </p>

            </div>


            <div class="news-list">

                ${cards}

            </div>


            ${
                hasMore
                    ? `
                        <div class="news-load-more">

                            <button
                                type="button"
                                id="newsLoadMore"
                                class="news-load-more-button"
                            >
                                Muat Lebih Banyak
                            </button>

                        </div>
                    `
                    : ""
            }

        </section>

    `;

}


/* =====================================================
   ARTICLE CARD
===================================================== */

function buildArticleCard(article) {

    const url =
        getArticleURL(article.slug);


    const excerpt =
        createExcerpt(article.content);


    const image =
        article.image
            ? `
                <div class="news-card-image">

                    <img
                        src="${escapeAttribute(article.image)}"
                        alt="${escapeAttribute(article.title)}"
                        loading="lazy"
                    >

                </div>
            `
            : "";


    return `

        <article class="news-card">

            ${image}


            <div class="news-card-content">

                <div class="news-card-date">

                    ${formatDate(article.date)}

                </div>


                <h2 class="news-card-title">

                    <a href="${escapeAttribute(url)}">

                        ${escapeHTML(article.title)}

                    </a>

                </h2>


                <p class="news-card-excerpt">

                    ${escapeHTML(excerpt)}

                </p>


                <a
                    href="${escapeAttribute(url)}"
                    class="news-card-read-more"
                >

                    Baca Selengkapnya

                </a>

            </div>

        </article>

    `;

}


/* =====================================================
   LOAD MORE
===================================================== */

function bindLoadMore() {

    const button =
        document.getElementById("newsLoadMore");


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        () => {

            State.articleLimit +=
                State.articlesPerLoad;


            renderHome();

        }
    );

}


/* =====================================================
   ARTICLE DETAIL
===================================================== */

function renderArticle(slug) {

    const container =
        document.getElementById("newsContent");


    if (!container) {

        return;

    }


    const article =
        articles.find(
            item => item.slug === slug
        );


    if (!article) {

        renderNotFound();

        return;

    }


    updateArticleSEO(article);


    const sortedArticles =
        getSortedArticles();


    const currentIndex =
        sortedArticles.findIndex(
            item => item.slug === article.slug
        );


    const previousArticle =
        currentIndex > 0
            ? sortedArticles[currentIndex - 1]
            : null;


    const nextArticle =
        currentIndex <
        sortedArticles.length - 1
            ? sortedArticles[currentIndex + 1]
            : null;


    container.innerHTML = `

        <article class="news-article">

            <header class="news-article-header">

                <div class="news-article-date">

                    ${formatDate(article.date)}

                </div>


                <h1 class="news-article-title">

                    ${escapeHTML(article.title)}

                </h1>

            </header>


            ${
                article.image
                    ? `
                        <div class="news-article-image">

                            <img
                                src="${escapeAttribute(article.image)}"
                                alt="${escapeAttribute(article.title)}"
                            >

                        </div>
                    `
                    : ""
            }


            <div class="news-article-content">

                ${article.content}

            </div>


            <nav
                class="news-article-navigation"
                aria-label="Navigasi artikel"
            >

                ${
                    previousArticle
                        ? `
                            <a
                                href="${escapeAttribute(
                                    getArticleURL(
                                        previousArticle.slug
                                    )
                                )}"
                                class="news-article-nav previous"
                            >

                                <span class="news-article-nav-label">
                                    Artikel Sebelumnya
                                </span>

                                <span class="news-article-nav-title">
                                    ${escapeHTML(
                                        previousArticle.title
                                    )}
                                </span>

                            </a>
                        `
                        : `
                            <span></span>
                        `
                }


                ${
                    nextArticle
                        ? `
                            <a
                                href="${escapeAttribute(
                                    getArticleURL(
                                        nextArticle.slug
                                    )
                                )}"
                                class="news-article-nav next"
                            >

                                <span class="news-article-nav-label">
                                    Artikel Berikutnya
                                </span>

                                <span class="news-article-nav-title">
                                    ${escapeHTML(
                                        nextArticle.title
                                    )}
                                </span>

                            </a>
                        `
                        : `
                            <span></span>
                        `
                }

            </nav>

        </article>

    `;

}


/* =====================================================
   NOT FOUND
===================================================== */

function renderNotFound() {

    const container =
        document.getElementById("newsContent");


    if (!container) {

        return;

    }


    updateNotFoundSEO();


    container.innerHTML = `

        <section class="news-page news-not-found">

            <div class="news-page-header">

                <h1>404</h1>

                <p>
                    Artikel yang kamu cari tidak ditemukan.
                </p>


                <a
                    href="/news/"
                    class="news-back-home"
                >

                    Kembali ke News & Update

                </a>

            </div>

        </section>

    `;

}


/* =====================================================
   SORT ARTICLES
===================================================== */

function getSortedArticles() {

    return [...articles].sort(
        (a, b) => {

            return new Date(b.date) -
                   new Date(a.date);

        }
    );

}


/* =====================================================
   ARTICLE URL
===================================================== */

function getArticleURL(slug) {

    return `/news/${encodeURIComponent(slug)}`;

}


/* =====================================================
   SITE URL
===================================================== */

function getSiteURL(path = "/") {

    if (!path) {

        return SEO.siteURL;

    }


    if (path.startsWith("http")) {

        return path;

    }


    return (
        SEO.siteURL.replace(/\/$/, "") +
        "/" +
        path.replace(/^\//, "")
    );

}


/* =====================================================
   HOME SEO
===================================================== */

function updateHomeSEO() {

    const url =
        getSiteURL(SEO.newsPath);


    updateBasicSEO({

        title:
            SEO.homeTitle,

        description:
            SEO.homeDescription,

        keywords:
            SEO.homeKeywords,

        canonical:
            url,

        type:
            "website",

        image:
            ""

    });


    updateStructuredData({

        type:
            "WebPage",

        name:
            SEO.homeTitle,

        description:
            SEO.homeDescription,

        url:

            url

    });

}


/* =====================================================
   ARTICLE SEO
===================================================== */

function updateArticleSEO(article) {

    const seo =
        article.seo || {};


    const title =
        seo.title ||
        `${article.title} — Finance Assistant`;


    const description =
        seo.description ||
        createSEODescription(article.content);


    const keywords =
        seo.keywords ||
        "";


    const url =
        getSiteURL(
            getArticleURL(article.slug)
        );


    const image =
        article.image
            ? getSiteURL(article.image)
            : "";


    updateBasicSEO({

        title:
            title,

        description:
            description,

        keywords:
            keywords,

        canonical:
            url,

        type:
            "article",

        image:
            image,

        publishedTime:
            article.date || ""

    });


    updateArticleStructuredData({

        article,
        title,
        description,
        url,
        image

    });

}


/* =====================================================
   404 SEO
===================================================== */

function updateNotFoundSEO() {

    const currentPath =
        window.location.pathname || "/news/";


    const url =
        getSiteURL(currentPath);


    updateBasicSEO({

        title:
            "404 — News & Update | Finance Assistant",

        description:
            "Halaman News & Update yang kamu cari tidak ditemukan.",

        keywords:
            "",

        canonical:
            url,

        type:
            "website",

        image:
            "",

        robots:
            "noindex, nofollow"

    });


    updateStructuredData(null);

}


/* =====================================================
   BASIC SEO
===================================================== */

function updateBasicSEO(options = {}) {

    const {

        title = SEO.homeTitle,

        description = SEO.homeDescription,

        keywords = "",

        canonical = SEO.siteURL,

        type = "website",

        image = "",

        publishedTime = "",

        robots = "index, follow"

    } = options;


    document.title =
        title;


    setMeta(
        "name",
        "description",
        description
    );


    setMeta(
        "name",
        "keywords",
        keywords
    );


    setMeta(
        "name",
        "robots",
        robots
    );


    /* -------------------------------------------------
       Open Graph
    ------------------------------------------------- */

    setMeta(
        "property",
        "og:type",
        type
    );


    setMeta(
        "property",
        "og:title",
        title
    );


    setMeta(
        "property",
        "og:description",
        description
    );


    setMeta(
        "property",
        "og:url",
        canonical
    );


    setMeta(
        "property",
        "og:site_name",
        SEO.siteName
    );


    setMeta(
        "property",
        "og:locale",
        "id_ID"
    );


    if (image) {

        setMeta(
            "property",
            "og:image",
            image
        );


        setMeta(
            "property",
            "og:image:alt",
            title
        );

    } else {

        removeMeta(
            "property",
            "og:image"
        );


        removeMeta(
            "property",
            "og:image:alt"
        );

    }


    /* -------------------------------------------------
       Article Open Graph
    ------------------------------------------------- */

    if (
        type === "article" &&
        publishedTime
    ) {

        setMeta(
            "property",
            "article:published_time",
            publishedTime
        );

        setMeta(
            "property",
            "article:modified_time",
            publishedTime
        );

    } else {

        removeMeta(
            "property",
            "article:published_time"
        );


        removeMeta(
            "property",
            "article:modified_time"
        );

    }


    /* -------------------------------------------------
       Twitter
    ------------------------------------------------- */

    setMeta(
        "name",
        "twitter:card",
        image
            ? "summary_large_image"
            : "summary"
    );


    setMeta(
        "name",
        "twitter:title",
        title
    );


    setMeta(
        "name",
        "twitter:description",
        description
    );


    setMeta(
        "name",
        "twitter:url",
        canonical
    );


    if (image) {

        setMeta(
            "name",
            "twitter:image",
            image
        );


        setMeta(
            "name",
            "twitter:image:alt",
            title
        );

    } else {

        removeMeta(
            "name",
            "twitter:image"
        );


        removeMeta(
            "name",
            "twitter:image:alt"
        );

    }


    /* -------------------------------------------------
       Canonical
    ------------------------------------------------- */

    setCanonical(canonical);

}


/* =====================================================
   SET META
===================================================== */

function setMeta(attribute, key, content) {

    if (!content) {

        return;

    }


    let meta =
        document.head.querySelector(
            `meta[${attribute}="${key}"]`
        );


    if (!meta) {

        meta =
            document.createElement("meta");


        meta.setAttribute(
            attribute,
            key
        );


        document.head.appendChild(meta);

    }


    meta.setAttribute(
        "content",
        content
    );

}


/* =====================================================
   REMOVE META
===================================================== */

function removeMeta(attribute, key) {

    const meta =
        document.head.querySelector(
            `meta[${attribute}="${key}"]`
        );


    if (meta) {

        meta.remove();

    }

}


/* =====================================================
   CANONICAL
===================================================== */

function setCanonical(url) {

    let canonical =
        document.head.querySelector(
            'link[rel="canonical"]'
        );


    if (!canonical) {

        canonical =
            document.createElement("link");


        canonical.setAttribute(
            "rel",
            "canonical"
        );


        document.head.appendChild(
            canonical
        );

    }


    canonical.setAttribute(
        "href",
        url
    );

}


/* =====================================================
   STRUCTURED DATA
===================================================== */

function updateStructuredData(data) {

    const existing =
        document.getElementById(
            "newsStructuredData"
        );


    if (existing) {

        existing.remove();

    }


    if (!data) {

        return;

    }


    const script =
        document.createElement("script");


    script.id =
        "newsStructuredData";


    script.type =
        "application/ld+json";


    const structuredData = {

        "@context":
            "https://schema.org",

        "@type":
            data.type,

        name:
            data.name,

        description:
            data.description,

        url:
            data.url,

        inLanguage:
            "id-ID",

        isPartOf: {

            "@type":
                "WebSite",

            name:
                SEO.siteName,

            url:
                SEO.siteURL

        }

    };


    script.textContent =
        JSON.stringify(
            structuredData
        );


    document.head.appendChild(
        script
    );

}


/* =====================================================
   ARTICLE STRUCTURED DATA
===================================================== */

function updateArticleStructuredData(options) {

    const {

        article,

        title,

        description,

        url,

        image

    } = options;


    const existing =
        document.getElementById(
            "newsStructuredData"
        );


    if (existing) {

        existing.remove();

    }


    const script =
        document.createElement("script");


    script.id =
        "newsStructuredData";


    script.type =
        "application/ld+json";


    const structuredData = {

        "@context":
            "https://schema.org",

        "@type":
            "Article",

        headline:
            title,

        name:
            title,

        description:
            description,

        url:
            url,

        datePublished:
            article.date || "",

        dateModified:
            article.date || "",

        inLanguage:
            "id-ID",

        articleSection:
            "News & Update",

        author: {

            "@type":
                "Organization",

            name:
                SEO.siteName,

            url:
                SEO.siteURL

        },

        publisher: {

            "@type":
                "Organization",

            name:
                SEO.siteName,

            url:
                SEO.siteURL

        },

        mainEntityOfPage: {

            "@type":
                "WebPage",

            "@id":
                url

        }

    };


    if (image) {

        structuredData.image = [
            image
        ];

    }


    script.textContent =
        JSON.stringify(
            structuredData
        );


    document.head.appendChild(
        script
    );

}


/* =====================================================
   CREATE EXCERPT
===================================================== */

function createExcerpt(content) {

    if (!content) {

        return "";

    }


    const temporary =
        document.createElement("div");


    temporary.innerHTML =
        content;


    const text =
        temporary.textContent
            .replace(/\s+/g, " ")
            .trim();


    if (!text) {

        return "";

    }


    const sentences =
        text
            .split(/(?<=[.!?])\s+/)
            .filter(Boolean);


    let excerpt =
        sentences
            .slice(0, 3)
            .join(" ");


    if (excerpt.length > 300) {

        excerpt =
            excerpt.substring(
                0,
                297
            ).trim() + "...";

    }


    return excerpt;

}


/* =====================================================
   SEO DESCRIPTION
===================================================== */

function createSEODescription(content) {

    const excerpt =
        createExcerpt(content);


    if (excerpt) {

        return excerpt;

    }


    return SEO.homeDescription;

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(date) {

    if (!date) {

        return "";

    }


    const parsedDate =
        new Date(date);


    if (Number.isNaN(
        parsedDate.getTime()
    )) {

        return date;

    }


    return parsedDate.toLocaleDateString(
        "id-ID",
        {

            day:
                "numeric",

            month:
                "long",

            year:
                "numeric"

        }
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   ESCAPE ATTRIBUTE
===================================================== */

function escapeAttribute(value) {

    return escapeHTML(value);

}


/* =====================================================
   MENU
===================================================== */

function initMenu() {

    const menuButton =
        document.getElementById("menuButton");

    const drawer =
        document.getElementById("sideDrawer");

    const overlay =
        document.getElementById("drawerOverlay");


    if (!menuButton ||
        !drawer) {

        return;

    }


    menuButton.addEventListener(
        "click",
        () => {

            toggleMenu();

        }
    );


    if (overlay) {

        overlay.addEventListener(
            "click",
            () => {

                closeMenu();

            }
        );

    }

}


/* =====================================================
   MENU TOGGLE
===================================================== */

function toggleMenu() {

    if (State.menuOpen) {

        closeMenu();

    } else {

        openMenu();

    }

}


/* =====================================================
   OPEN MENU
===================================================== */

function openMenu() {

    const drawer =
        document.getElementById("sideDrawer");

    const overlay =
        document.getElementById("drawerOverlay");


    if (!drawer) {

        return;

    }


    State.menuOpen = true;


    drawer.classList.add(
        "open"
    );


    if (overlay) {

        overlay.classList.add(
            "open"
        );

    }


    document.body.classList.add(
        "drawer-open"
    );

}


/* =====================================================
   CLOSE MENU
===================================================== */

function closeMenu() {

    const drawer =
        document.getElementById("sideDrawer");

    const overlay =
        document.getElementById("drawerOverlay");


    State.menuOpen = false;


    if (drawer) {

        drawer.classList.remove(
            "open"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "open"
        );

    }


    document.body.classList.remove(
        "drawer-open"
    );

}


/* =====================================================
   GLOBAL EVENTS
===================================================== */

function initEvent() {

    if (State.eventsBound) {

        return;

    }


    State.eventsBound = true;


    document.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(
                    "a[href]"
                );


            if (!link) {

                return;

            }


            const href =
                link.getAttribute("href");


            if (!href) {

                return;

            }


            if (
                href.startsWith("/news/") &&
                !href.includes("#")
            ) {

                event.preventDefault();


                closeMenu();


                router.navigate(
                    href
                );

            }

        }
    );

}


/* =====================================================
   START
===================================================== */

init();
