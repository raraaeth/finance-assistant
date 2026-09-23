/* =====================================================
   FINANCE ASSISTANT
   Sitemap Script
===================================================== */

import articles from "../news/js/articles.js";


/* =====================================================
   MAIN PAGES
===================================================== */

const mainPages = [
    {
        title: "Home",
        url: "/"
    },
    {
        title: "Documentation",
        url: "/docs/"
    },
    {
        title: "News & Update",
        url: "/news/"
    },
    {
        title: "About App",
        url: "/app/"
    },
    {
        title: "Privacy Policy",
        url: "/privacy/"
    },
    {
        title: "Terms of Services",
        url: "/terms/"
    }
];


/* =====================================================
   DOCUMENTATION
===================================================== */

const documentationLinks = [
    {
        title: "Pengenalan",
        url: "/docs/"
    },
    {
        title: "Mulai",
        url: "/docs/mulai"
    },
    {
        title: "Workspace",
        url: "/docs/workspace"
    },
    {
        title: "Pengaturan & Input",
        url: "/docs/input"
    },
    {
        title: "Tabungan",
        url: "/docs/saving"
    },
    {
        title: "Kas Bersama",
        url: "/docs/kas"
    },
    {
        title: "Financial",
        url: "/docs/financial"
    },
    {
        title: "Perhitungan Gaji Bulanan",
        url: "/docs/monthly"
    },
    {
        title: "Perhitungan Gaji Harian",
        url: "/docs/daily"
    },
    {
        title: "Pengingat Airdrop",
        url: "/docs/airdrop"
    },
    {
        title: "Akun",
        url: "/docs/akun"
    },
    {
        title: "Data & Privasi",
        url: "/docs/privacy"
    }
];


/* =====================================================
   NEWS
   Diambil langsung dari articles.js
===================================================== */

const newsLinks = articles
    .slice()
    .sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    })
    .map(article => ({
        title: article.title,
        url: `/news/${article.slug}`
    }));


/* =====================================================
   RENDER LINK
===================================================== */

function renderLinks(containerId, links) {

    const container = document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = links
        .map(item => `
            <a
                href="${item.url}"
                class="sitemap-link"
            >
                <span class="sitemap-link-title">
                    ${item.title}
                </span>

                <span
                    class="sitemap-link-arrow"
                    aria-hidden="true"
                >
                    →
                </span>
            </a>
        `)
        .join("");
}


/* =====================================================
   SIDEBAR
===================================================== */

function initMenu() {

    const menuButton = document.getElementById(
        "sitemapMenuButton"
    );

    const menuOverlay = document.getElementById(
        "sitemapMenuOverlay"
    );

    const drawer = document.getElementById(
        "sitemapDrawer"
    );

    const drawerClose = document.getElementById(
        "sitemapDrawerClose"
    );

    if (
        !menuButton ||
        !menuOverlay ||
        !drawer ||
        !drawerClose
    ) {
        return;
    }


    function openMenu() {

        document.body.classList.add(
            "sitemap-menu-open"
        );

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        menuOverlay.setAttribute(
            "aria-hidden",
            "false"
        );

        drawer.setAttribute(
            "aria-hidden",
            "false"
        );
    }


    function closeMenu() {

        document.body.classList.remove(
            "sitemap-menu-open"
        );

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        menuOverlay.setAttribute(
            "aria-hidden",
            "true"
        );

        drawer.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    menuButton.addEventListener(
        "click",
        openMenu
    );


    drawerClose.addEventListener(
        "click",
        closeMenu
    );


    menuOverlay.addEventListener(
        "click",
        closeMenu
    );


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeMenu();
            }

        }
    );


    /* Tutup menu ketika memilih navigasi */

    const navigationLinks =
        drawer.querySelectorAll("a");

    navigationLinks.forEach(link => {

        link.addEventListener(
            "click",
            closeMenu
        );

    });
}


/* =====================================================
   INIT
===================================================== */

function init() {

    renderLinks(
        "sitemapMainPages",
        mainPages
    );

    renderLinks(
        "sitemapDocumentation",
        documentationLinks
    );

    renderLinks(
        "sitemapNews",
        newsLinks
    );

    initMenu();
}


if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

} else {

    init();

}
