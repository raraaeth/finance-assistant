/* =====================================================
   FINANCE ASSISTANT
   NEWS & UPDATE

   File    : /news/js/app.js
   Version : 1.2.1

   Description :
   Entry point News & Update.

   Handles :
   - Initialisasi News
   - Router
   - Renderer
   - Article listing
   - Article detail
   - Hamburger menu
   - Navigation drawer
   - Dynamic SEO
   - Structured Data
===================================================== */


/* =====================================================
   IMPORT
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

    siteName:
        "Finance Assistant",

    siteURL:
        "https://financeassistant.web.id",

    newsPath:
        "/news/",

    homeTitle:
        "News & Update — Finance Assistant",

    homeDescription:
        "Berita, pembaruan, informasi terbaru seputar Finance Assistant.",

    homeKeywords:
        "Finance Assistant, berita Finance Assistant, update Finance Assistant, aplikasi keuangan, informasi Finance Assistant"

};


/* =====================================================
   INIT
===================================================== */

function init(){

    initMenu();

    initEvent();

    restoreNewsRoute();

    initRouter();

    router.init();

}


/* =====================================================
   ROUTER
===================================================== */

function initRouter(){

    window.addEventListener(
        "news:route",
        onRoute
    );

}


/* =====================================================
   RESTORE NEWS ROUTE
===================================================== */

function restoreNewsRoute(){

    const params =
        new URLSearchParams(
            window.location.search
        );


    const route =
        params.get(
            "route"
        );


    if(
        !route
    ){

        return;

    }


    /*
     * Pastikan route memang
     * merupakan route News.
     */

    if(
        !route.startsWith(
            "/news/"
        )
    ){

        return;

    }


    /*
     * Kembalikan URL menjadi
     * clean URL.
     *
     * Contoh:
     *
     * /news/?route=/news/artikel01
     *
     * menjadi:
     *
     * /news/artikel01
     */

    window.history.replaceState(
        {},
        "",
        route
    );

}


/* =====================================================
   ROUTE HANDLER
===================================================== */

function onRoute(
    event
){

    const route =
        event.detail;


    if(
        !route
    ){

        return;

    }


    if(
        route.type === "home"
    ){

        renderHome();

        return;

    }


    if(
        route.type === "article"
    ){

        renderArticle(
            route.slug
        );

        return;

    }


    renderNotFound();

}


/* =====================================================
   HOME RENDERER
===================================================== */

function renderHome(){

    State.articleLimit =
        State.articlesPerLoad;


    const content =
        document.getElementById(
            "newsContent"
        );


    if(
        !content
    ){

        return;

    }


    const sortedArticles =
        getSortedArticles();


    /*
     * SEO
     */

    updateHomeSEO();


    if(
        !sortedArticles.length
    ){

        content.innerHTML = `

            <section class="news-empty">

                <h1 class="news-empty-title">

                    Belum ada artikel

                </h1>


                <p class="news-empty-text">

                    Belum ada News & Update
                    yang tersedia.

                </p>

            </section>

        `;

        return;

    }


    content.innerHTML =
        buildHomeHTML(
            sortedArticles
        );


    bindLoadMore();

}


/* =====================================================
   HOME HTML
===================================================== */

function buildHomeHTML(
    sortedArticles
){

    const visibleArticles =
        sortedArticles.slice(
            0,
            State.articleLimit
        );


    const hasMore =
        State.articleLimit <
        sortedArticles.length;


    const articleHTML =
        visibleArticles
            .map(
                buildArticleCard
            )
            .join("");


    return `

        <section class="news-home">

            <div class="news-home-header">

                <h1 class="news-page-title">

                    News & Update

                </h1>


                <p class="news-page-description">

                    Berita, pembaruan, dan informasi terbaru
                    seputar Finance Assistant.

                </p>

            </div>


            <div class="news-article-list">

                ${articleHTML}

            </div>


            ${
                hasMore
                    ? `

                        <div class="news-load-more">

                            <button
                                type="button"
                                id="newsLoadMore"
                            >

                                Tampilkan lebih banyak

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

function buildArticleCard(
    article
){

    const excerpt =
        createExcerpt(
            article.content
        );


    const href =
        getArticleURL(
            article.slug
        );


    const imageHTML =
        article.image
            ? `

                <div class="news-article-card-image">

                    <img
                        src="${escapeAttribute(article.image)}"
                        alt="${escapeAttribute(article.title)}"
                        loading="lazy"
                    >

                </div>

            `
            : "";


    return `

        <article class="news-article-card">

            ${
                article.image
                    ? `

                        <a
                            href="${href}"
                            class="news-article-card-image-link"
                            aria-label="Baca ${escapeAttribute(article.title)}"
                        >

                            ${imageHTML}

                        </a>

                    `
                    : ""
            }


            <div class="news-article-card-body">

                <div class="news-article-card-date">

                    ${formatDate(article.date)}

                </div>


                <h2 class="news-article-card-title">

                    <a
                        href="${href}"
                    >

                        ${escapeHTML(article.title)}

                    </a>

                </h2>


                <p class="news-article-card-excerpt">

                    ${escapeHTML(excerpt)}

                </p>


                <a
                    href="${href}"
                    class="news-article-card-more"
                >

                    Baca selengkapnya →

                </a>

            </div>

        </article>

    `;

}


/* =====================================================
   LOAD MORE
===================================================== */

function bindLoadMore(){

    const button =
        document.getElementById(
            "newsLoadMore"
        );


    if(
        !button
    ){

        return;

    }


    button.addEventListener(
        "click",
        onLoadMore
    );

}


/* =====================================================
   LOAD MORE ACTION
===================================================== */

function onLoadMore(){

    const sortedArticles =
        getSortedArticles();


    State.articleLimit +=
        State.articlesPerLoad;


    const content =
        document.getElementById(
            "newsContent"
        );


    if(
        !content
    ){

        return;

    }


    content.innerHTML =
        buildHomeHTML(
            sortedArticles
        );


    bindLoadMore();

}


/* =====================================================
   ARTICLE DETAIL RENDERER
===================================================== */

function renderArticle(
    slug
){

    const content =
        document.getElementById(
            "newsContent"
        );


    if(
        !content
    ){

        return;

    }


    const sortedArticles =
        getSortedArticles();


    const index =
        sortedArticles.findIndex(
            article =>
                article.slug === slug
        );


    if(
        index === -1
    ){

        renderNotFound();

        return;

    }


    const article =
        sortedArticles[index];


    const previousArticle =
        sortedArticles[
            index - 1
        ];


    const nextArticle =
        sortedArticles[
            index + 1
        ];


    /*
     * SEO
     */

    updateArticleSEO(
        article
    );


    content.innerHTML =
        buildArticleHTML(
            article,
            previousArticle,
            nextArticle
        );


    window.scrollTo(
        {
            top: 0,
            behavior: "instant"
        }
    );

}


/* =====================================================
   ARTICLE HTML
===================================================== */

function buildArticleHTML(
    article,
    previousArticle,
    nextArticle
){

    const imageHTML =
        article.image
            ? `

                <div class="news-article-cover">

                    <img
                        src="${escapeAttribute(article.image)}"
                        alt="${escapeAttribute(article.title)}"
                    >

                </div>

            `
            : "";


    const previousHTML =
        previousArticle
            ? `

                <a
                    href="${getArticleURL(previousArticle.slug)}"
                >

                    ← Artikel Sebelumnya

                </a>

            `
            : `

                <span class="is-disabled">

                    ← Artikel Sebelumnya

                </span>

            `;


    const nextHTML =
        nextArticle
            ? `

                <a
                    href="${getArticleURL(nextArticle.slug)}"
                >

                    Artikel Berikutnya →

                </a>

            `
            : `

                <span class="is-disabled">

                    Artikel Berikutnya →

                </span>

            `;


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
   NOT FOUND
===================================================== */

function renderNotFound(){

    const content =
        document.getElementById(
            "newsContent"
        );


    if(
        !content
    ){

        return;

    }


    /*
     * SEO
     */

    updateNotFoundSEO();


    content.innerHTML = `

        <section class="news-empty">

            <h1 class="news-empty-title">

                Artikel tidak ditemukan

            </h1>


            <p class="news-empty-text">

                Artikel yang kamu cari tidak tersedia
                atau alamatnya sudah berubah.

            </p>


            <div style="margin-top: 22px;">

                <a
                    href="/news/"
                    class="news-highlight-link"
                >

                    ← Kembali ke News & Update

                </a>

            </div>

        </section>

    `;

}


/* =====================================================
   ARTICLE DATA
===================================================== */

function getSortedArticles(){

    return [

        ...articles

    ].sort(

        (
            a,
            b
        ) => {

            const dateA =
                new Date(
                    a.date || 0
                );


            const dateB =
                new Date(
                    b.date || 0
                );


            return (
                dateB -
                dateA
            );

        }

    );

}


/* =====================================================
   ARTICLE URL
===================================================== */

function getArticleURL(
    slug
){

    return `/news/${encodeURIComponent(slug)}`;

}


/* =====================================================
   CREATE EXCERPT
===================================================== */

function createExcerpt(
    html
){

    if(
        !html
    ){

        return "";

    }


    const temp =
        document.createElement(
            "div"
        );


    temp.innerHTML =
        html;


    const text =
        temp.textContent
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    if(
        !text
    ){

        return "";

    }


    const sentences =
        text.match(
            /[^.!?]+[.!?]+/g
        );


    if(
        !sentences ||
        sentences.length === 0
    ){

        return truncateText(
            text,
            220
        );

    }


    let excerpt = "";


    for(
        const sentence of sentences
    ){

        const candidate =
            `${excerpt} ${sentence.trim()}`
                .trim();


        if(
            candidate.length > 280 &&
            excerpt
        ){

            break;

        }


        excerpt =
            candidate;


        if(
            countSentences(
                excerpt
            ) >= 3
        ){

            break;

        }

    }


    if(
        excerpt.length > 300
    ){

        excerpt =
            truncateText(
                excerpt,
                300
            );

    }


    if(
        excerpt.length <
        text.length
    ){

        excerpt =
            excerpt.replace(
                /[.!?]+$/,
                ""
            ) +
            "…";

    }


    return excerpt;

}


/* =====================================================
   COUNT SENTENCES
===================================================== */

function countSentences(
    text
){

    const matches =
        text.match(
            /[.!?]+/g
        );


    return matches
        ? matches.length
        : 0;

}


/* =====================================================
   TRUNCATE TEXT
===================================================== */

function truncateText(
    text,
    maxLength
){

    if(
        text.length <=
        maxLength
    ){

        return text;

    }


    const shortened =
        text
            .slice(
                0,
                maxLength
            )
            .replace(
                /\s+\S*$/,
                ""
            );


    return (
        shortened.trim() +
        "…"
    );

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(
    date
){

    if(
        !date
    ){

        return "";

    }


    const parsed =
        new Date(
            `${date}T00:00:00`
        );


    if(
        Number.isNaN(
            parsed.getTime()
        )
    ){

        return date;

    }


    return parsed.toLocaleDateString(
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

function escapeHTML(
    value
){

    return String(
        value ?? ""
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
            "&#039;"
        );

}


/* =====================================================
   ESCAPE ATTRIBUTE
===================================================== */

function escapeAttribute(
    value
){

    return escapeHTML(
        value
    );

}


/* =====================================================
   =====================================================
   SEO
   =====================================================
===================================================== */


/* =====================================================
   HOME SEO
===================================================== */

function updateHomeSEO(){

    const url =
        getSiteURL(
            SEO.newsPath
        );


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
            "",

        robots:
            "index, follow"

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

function updateArticleSEO(
    article
){

    const seo =
        article.seo || {};


    /*
     * SEO title dari artikel.
     *
     * Jika belum tersedia,
     * gunakan fallback.
     */

    const title =
        seo.title ||
        `${article.title} — Finance Assistant`;


    /*
     * SEO description dari artikel.
     *
     * Jika belum tersedia,
     * gunakan excerpt artikel.
     */

    const description =
        seo.description ||
        createSEODescription(
            article.content
        );


    /*
     * Keywords bersifat opsional.
     */

    const keywords =
        seo.keywords ||
        "";


    const url =
        getSiteURL(
            getArticleURL(
                article.slug
            )
        );


    const image =
        article.image
            ? getSiteURL(
                article.image
            )
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
            article.date || "",

        robots:
            "index, follow"

    });


    updateArticleStructuredData({

        article:
            article,

        title:
            title,

        description:
            description,

        url:
            url,

        image:
            image

    });

}


/* =====================================================
   404 SEO
===================================================== */

function updateNotFoundSEO(){

    const currentPath =
        window.location.pathname ||
        "/news/";


    const url =
        getSiteURL(
            currentPath
        );


    updateBasicSEO({

        title:
            "Artikel Tidak Ditemukan — Finance Assistant",

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


    updateStructuredData(
        null
    );

}


/* =====================================================
   GET SITE URL
===================================================== */

function getSiteURL(
    path = "/"
){

    if(
        !path
    ){

        return SEO.siteURL;

    }


    if(
        path.startsWith(
            "http://"
        ) ||
        path.startsWith(
            "https://"
        )
    ){

        return path;

    }


    return (

        SEO.siteURL.replace(
            /\/$/,
            ""
        ) +

        "/" +

        path.replace(
            /^\//,
            ""
        )

    );

}


/* =====================================================
   BASIC SEO
===================================================== */

function updateBasicSEO(
    options = {}
){

    const {

        title =
            SEO.homeTitle,

        description =
            SEO.homeDescription,

        keywords =
            "",

        canonical =
            SEO.siteURL,

        type =
            "website",

        image =
            "",

        publishedTime =
            "",

        robots =
            "index, follow"

    } = options;


    /*
     * TITLE
     */

    document.title =
        title;


    /*
     * BASIC META
     */

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


    /*
     * OPEN GRAPH
     */

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


    if(
        image
    ){

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

    }else{

        removeMeta(
            "property",
            "og:image"
        );


        removeMeta(
            "property",
            "og:image:alt"
        );

    }


    /*
     * ARTICLE META
     */

    if(
        type === "article" &&
        publishedTime
    ){

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

    }else{

        removeMeta(
            "property",
            "article:published_time"
        );


        removeMeta(
            "property",
            "article:modified_time"
        );

    }


    /*
     * TWITTER
     */

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


    if(
        image
    ){

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

    }else{

        removeMeta(
            "name",
            "twitter:image"
        );


        removeMeta(
            "name",
            "twitter:image:alt"
        );

    }


    /*
     * CANONICAL
     */

    setCanonical(
        canonical
    );

}


/* =====================================================
   SET META
===================================================== */

function setMeta(
    attribute,
    key,
    content
){

    if(
        !content
    ){

        return;

    }


    let meta =
        document.head.querySelector(
            `meta[${attribute}="${key}"]`
        );


    if(
        !meta
    ){

        meta =
            document.createElement(
                "meta"
            );


        meta.setAttribute(
            attribute,
            key
        );


        document.head.appendChild(
            meta
        );

    }


    meta.setAttribute(
        "content",
        content
    );

}


/* =====================================================
   REMOVE META
===================================================== */

function removeMeta(
    attribute,
    key
){

    const meta =
        document.head.querySelector(
            `meta[${attribute}="${key}"]`
        );


    if(
        meta
    ){

        meta.remove();

    }

}


/* =====================================================
   CANONICAL
===================================================== */

function setCanonical(
    url
){

    let canonical =
        document.head.querySelector(
            'link[rel="canonical"]'
        );


    if(
        !canonical
    ){

        canonical =
            document.createElement(
                "link"
            );


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

function updateStructuredData(
    data
){

    const existing =
        document.getElementById(
            "newsStructuredData"
        );


    if(
        existing
    ){

        existing.remove();

    }


    if(
        !data
    ){

        return;

    }


    const script =
        document.createElement(
            "script"
        );


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

function updateArticleStructuredData(
    options
){

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


    if(
        existing
    ){

        existing.remove();

    }


    const script =
        document.createElement(
            "script"
        );


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


    if(
        image
    ){

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
   SEO DESCRIPTION
===================================================== */

function createSEODescription(
    content
){

    const excerpt =
        createExcerpt(
            content
        );


    if(
        excerpt
    ){

        return excerpt;

    }


    return SEO.homeDescription;

}


/* =====================================================
   MENU
===================================================== */

function initMenu(){

    const button =
        document.getElementById(
            "newsMenuButton"
        );


    const overlay =
        document.getElementById(
            "newsMenuOverlay"
        );


    const drawer =
        document.getElementById(
            "newsDrawer"
        );


    if(
        !button ||
        !overlay ||
        !drawer
    ){

        return;

    }


    button.addEventListener(
        "click",
        toggleMenu
    );


    overlay.addEventListener(
        "click",
        closeMenu
    );


    drawer.addEventListener(
        "click",
        onDrawerClick
    );

}


/* =====================================================
   TOGGLE MENU
===================================================== */

function toggleMenu(){

    if(
        State.menuOpen
    ){

        closeMenu();

    }else{

        openMenu();

    }

}


/* =====================================================
   OPEN MENU
===================================================== */

function openMenu(){

    State.menuOpen =
        true;


    document.body.classList.add(
        "news-menu-open"
    );


    const button =
        document.getElementById(
            "newsMenuButton"
        );


    const overlay =
        document.getElementById(
            "newsMenuOverlay"
        );


    if(
        button
    ){

        button.setAttribute(
            "aria-expanded",
            "true"
        );

    }


    if(
        overlay
    ){

        overlay.setAttribute(
            "aria-hidden",
            "false"
        );

    }

}


/* =====================================================
   CLOSE MENU
===================================================== */

function closeMenu(){

    State.menuOpen =
        false;


    document.body.classList.remove(
        "news-menu-open"
    );


    const button =
        document.getElementById(
            "newsMenuButton"
        );


    const overlay =
        document.getElementById(
            "newsMenuOverlay"
        );


    if(
        button
    ){

        button.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    if(
        overlay
    ){

        overlay.setAttribute(
            "aria-hidden",
            "true"
        );

    }

}


/* =====================================================
   DRAWER CLICK
===================================================== */

function onDrawerClick(
    event
){

    const link =
        event.target.closest(
            "a"
        );


    if(
        !link
    ){

        return;

    }


    closeMenu();

}


/* =====================================================
   EVENT
===================================================== */

function initEvent(){

    if(
        State.eventsBound
    ){

        return;

    }


    document.addEventListener(
        "keydown",
        onKeyDown
    );


    State.eventsBound =
        true;

}


/* =====================================================
   KEYBOARD
===================================================== */

function onKeyDown(
    event
){

    if(
        event.key === "Escape" &&
        State.menuOpen
    ){

        closeMenu();

    }

}


/* =====================================================
   START
===================================================== */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        init,
        {
            once: true
        }
    );

}else{

    init();

}
