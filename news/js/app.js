/* =====================================================
   FINANCE ASSISTANT
   NEWS & UPDATE

   File    : /news/js/app.js
   Version : 1.2.0

   Description :
   Entry point News & Update.

   Handles :
   - Initialisasi News
   - Router
   - Renderer
   - Article listing
   - Article detail
   - Article SEO
   - Structured Data
   - Hamburger menu
   - Navigation drawer
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
   SEO CONFIGURATION
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
        "Berita, pembaruan, informasi, dan perkembangan terbaru seputar Finance Assistant.",

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
     *
     * replaceState tidak melakukan
     * reload halaman.
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
     * SEO halaman utama News.
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
                    Belum ada News & Update yang tersedia.
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
     * SEO artikel dibaca langsung
     * dari object artikel.
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
     * SEO halaman 404.
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
                dateB - dateA
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
   SEO — HOME
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
            null

    });


    updateNewsStructuredData({

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
   SEO — ARTICLE
===================================================== */

function updateArticleSEO(
    article
){

    const seo =
        article.seo || {};


    const title =
        seo.title ||
        `${article.title} — Finance Assistant`;


    const description =
        seo.description ||
        createSEODescription(
            article.content
        );


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
            image

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
   SEO — NOT FOUND
===================================================== */

function updateNotFoundSEO(){

    const title =
        "Artikel Tidak Ditemukan — Finance Assistant";


    const description =
        "Artikel News & Update yang kamu cari tidak tersedia atau alamatnya sudah berubah.";


    const url =
        window.location.href;


    updateBasicSEO({

        title:
            title,

        description:
            description,

        keywords:
            "",

        canonical:
            url,

        type:
            "website",

        image:
            null,

        robots:
            "noindex, nofollow"

    });


    removeStructuredData();

}


/* =====================================================
   SEO — BASIC META
===================================================== */

function updateBasicSEO(
    options
){

    const title =
        options.title || "";


    const description =
        options.description || "";


    const keywords =
        options.keywords || "";


    const canonical =
        options.canonical || "";


    const type =
        options.type || "website";


    const image =
        options.image || "";


    const robots =
        options.robots ||
        "index, follow";


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


    if(
        image
    ){

        setMeta(
            "property",
            "og:image",
            image
        );

    }else{

        removeMeta(
            "property",
            "og:image"
        );

    }


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


    if(
        image
    ){

        setMeta(
            "name",
            "twitter:image",
            image
        );

    }else{

        removeMeta(
            "name",
            "twitter:image"
        );

    }


    updateCanonical(
        canonical
    );


    /*
     * Khusus artikel.
     */

    if(
        type === "article"
    ){

        setMeta(
            "property",
            "article:published_time",
            getArticlePublishedTime()
        );

    }else{

        removeMeta(
            "property",
            "article:published_time"
        );

    }

}


/* =====================================================
   META HELPER
===================================================== */

function setMeta(
    attribute,
    name,
    content
){

    let element =
        document.head.querySelector(
            `meta[${attribute}="${name}"]`
        );


    if(
        !element
    ){

        element =
            document.createElement(
                "meta"
            );


        element.setAttribute(
            attribute,
            name
        );


        document.head.appendChild(
            element
        );

    }


    element.setAttribute(
        "content",
        content || ""
    );

}


/* =====================================================
   REMOVE META
===================================================== */

function removeMeta(
    attribute,
    name
){

    const element =
        document.head.querySelector(
            `meta[${attribute}="${name}"]`
        );


    if(
        element
    ){

        element.remove();

    }

}


/* =====================================================
   CANONICAL
===================================================== */

function updateCanonical(
    url
){

    if(
        !url
    ){
        return;
    }


    let link =
        document.head.querySelector(
            'link[rel="canonical"]'
        );


    if(
        !link
    ){

        link =
            document.createElement(
                "link"
            );


        link.setAttribute(
            "rel",
            "canonical"
        );


        document.head.appendChild(
            link
        );

    }


    link.setAttribute(
        "href",
        url
    );

}


/* =====================================================
   ARTICLE PUBLISHED TIME
===================================================== */

function getArticlePublishedTime(){

    return "";

}


/* =====================================================
   SEO DESCRIPTION
===================================================== */

function createSEODescription(
    html
){

    if(
        !html
    ){
        return SEO.homeDescription;
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
        return SEO.homeDescription;
    }


    return truncateText(
        text,
        160
    );

}


/* =====================================================
   SITE URL
===================================================== */

function getSiteURL(
path
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
        SEO.siteURL +
        (
            path.startsWith("/")
                ? path
                : `/${path}`
        )
    );

}


/* =====================================================
   STRUCTURED DATA — WEBPAGE
===================================================== */

function updateNewsStructuredData(
    data
){

    const json =
        {

            "@context":
                "https://schema.org",

            "@type":
                data.type || "WebPage",

            name:
                data.name,

            description:
                data.description,

            url:
                data.url,

            isPartOf:
                {
                    "@type":
                        "WebSite",

                    name:
                        SEO.siteName,

                    url:
                        SEO.siteURL + "/"
                }

        };


    setStructuredData(
        json
    );

}


/* =====================================================
   STRUCTURED DATA — ARTICLE
===================================================== */

function updateArticleStructuredData(
    data
){

    const article =
        data.article;


    const json =
        {

            "@context":
                "https://schema.org",

            "@type":
                "Article",

            headline:
                article.title,

            name:
                data.title,

            description:
                data.description,

            url:
                data.url,

            datePublished:
                article.date,

            dateModified:
                article.date,

            author:
                {

                    "@type":
                        "Organization",

                    name:
                        SEO.siteName,

                    url:
                        SEO.siteURL + "/"

                },

            publisher:
                {

                    "@type":
                        "Organization",

                    name:
                        SEO.siteName,

                    url:
                        SEO.siteURL + "/"

                },

            mainEntityOfPage:
                {

                    "@type":
                        "WebPage",

                    "@id":
                        data.url

                }

        };


    if(
        data.image
    ){

        json.image =
            [
                data.image
            ];

    }


    setStructuredData(
        json
    );

}


/* =====================================================
   STRUCTURED DATA HELPER
===================================================== */

function setStructuredData(
data
){

    removeStructuredData();


    const script =
        document.createElement(
            "script"
        );


    script.type =
        "application/ld+json";


    script.id =
        "newsStructuredData";


    script.textContent =
        JSON.stringify(
            data
        );


    document.head.appendChild(
        script
    );

}


/* =====================================================
   REMOVE STRUCTURED DATA
===================================================== */

function removeStructuredData(){

    const existing =
        document.getElementById(
            "newsStructuredData"
        );


    if(
        existing
    ){

        existing.remove();

    }

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
            day: "numeric",
            month: "long",
            year: "numeric"
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


    if(button){

        button.setAttribute(
            "aria-expanded",
            "true"
        );

    }


    if(overlay){

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


    if(button){

        button.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    if(overlay){

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
