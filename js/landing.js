/* =====================================================
   Finance Assistant
   Component    : Landing Page
   File         : landing.js
   Version      : 2.0.0

   Description :
   Landing Page Module Tabs + Latest News

   Handles :
   - Module card
   - Module selection
   - Manual module selection
   - Keyboard navigation
   - Active module state
   - Latest 5 News
   - Dynamic News from articles.js

   Principle :

       Module Card
            ↓
       Select Module
            ↓
       Show Module Slide

   News :

       articles.js
            ↓
       Sort by date
            ↓
       Take 5 latest
            ↓
       Render to Root Homepage
===================================================== */


/* =====================================================
   IMPORT ARTICLES
===================================================== */

import articles from "../news/js/articles.js";

/* =====================================================
   BLOG
   News sudah migrasi ke blog.
===================================================== */

const BLOG_URL =
    "https://blog.financeassistant.web.id";

const BLOG_SLUG_MAP = {
    "pentingnya-menganalisa-pengeluaran-kecil":
        "pentingnya-menganalisa-pengeluaran-keci",
    "seberapa-penting-punya-penghasilan-tambahan":
        "seberapa-penting-punya-penghasilan",
    "cara-menghemat-gaji-agar-tidak-cepat-habis":
        "cara-menghemat-gaji-agar-tidak-cepat",
    "5-tips-menabung-rutin-menyisihkan-gaji-bulanan":
        "5-tips-menabung-rutin-menyisihkan-gaji",
    "penghasilan-besar-belum-tentu-terbebas-dari-hutang":
        "penghasilan-besar-belum-tentu-terbebas"
};

function blogArticleUrl(slug) {

    if (!slug) return `${BLOG_URL}/`;

    if (slug === "panduan-finance-assistant") {
        return `${BLOG_URL}/2026/10/panduan-finance-assistant.html`;
    }

    const blogSlug = BLOG_SLUG_MAP[slug] || slug;

    return `${BLOG_URL}/2026/11/${blogSlug}.html`;
}



/* =====================================================
   CONFIG
===================================================== */

const CONFIG = {

    latestNewsLimit: 5

};


/* =====================================================
   STATE
===================================================== */

const State = {

    current: 0,

    modules: [],

    slides: []

};


/* =====================================================
   INIT
===================================================== */

function init(){

    State.modules =

        Array.from(

            document.querySelectorAll(
                ".module-card"
            )

        );


    State.slides =

        Array.from(

            document.querySelectorAll(
                ".module-slide"
            )

        );


    initThemeSwitch();


    if(

        State.modules.length === 0

        ||

        State.slides.length === 0

    ){

        return;

    }


    bindModuleEvents();

    bindTabKeys();

    setInitialSlide();

}


/* =====================================================
   MODULE EVENT (TAB)
===================================================== */

function bindModuleEvents(){

    State.modules.forEach(

        module => {

            module.addEventListener(

                "click",

                () => {

                    const id =
                        module.dataset.module;


                    if(!id){

                        return;

                    }


                    showModule(id);

                }

            );

        }

    );

}


/* =====================================================
   TAB KEYBOARD NAVIGATION
===================================================== */

function bindTabKeys(){

    const grid =

        document.querySelector(
            ".module-grid"
        );


    if(!grid){

        return;

    }


    grid.addEventListener(

        "keydown",

        event => {

            const keys = [

                "ArrowRight",

                "ArrowLeft",

                "Home",

                "End"

            ];


            if(!keys.includes(event.key)){

                return;

            }


            const currentIndex =

                State.modules.indexOf(

                    document.activeElement

                );


            if(currentIndex === -1){

                return;

            }


            event.preventDefault();


            let nextIndex = currentIndex;


            if(event.key === "ArrowRight"){

                nextIndex =

                    (currentIndex + 1) %

                    State.modules.length;

            }

            else if(event.key === "ArrowLeft"){

                nextIndex =

                    (currentIndex -

                        1 +

                        State.modules.length) %

                    State.modules.length;

            }

            else if(event.key === "Home"){

                nextIndex = 0;

            }

            else if(event.key === "End"){

                nextIndex =

                    State.modules.length - 1;

            }


            const target =
                State.modules[nextIndex];


            if(!target){

                return;

            }


            target.focus();

            showModule(

                target.dataset.module

            );

        }

    );

}


/* =====================================================
   INITIAL SLIDE
===================================================== */

function setInitialSlide(){

    const firstModule =
        State.modules[0];


    if(!firstModule){

        return;

    }


    showModule(

        firstModule.dataset.module

    );

}


/* =====================================================
   SHOW MODULE (TAB PANEL)
===================================================== */

function showModule(moduleId){

    const slideIndex =

        State.slides.findIndex(

            slide =>

                slide.dataset.slide ===

                moduleId

        );


    if(slideIndex === -1){

        console.warn(
            "Landing slide tidak ditemukan:",
            moduleId
        );

        return;

    }


    showSlide(slideIndex);

}


/* =====================================================
   SHOW SLIDE (TAB PANEL)
===================================================== */

function showSlide(index){

    if(

        index < 0

        ||

        index >= State.slides.length

    ){

        return;

    }


    State.current = index;


    State.slides.forEach(

        (

            slide,

            slideIndex

        ) => {

            const isActive =
                slideIndex === index;


            slide.classList.toggle(

                "active",

                isActive

            );


            slide.hidden = !isActive;

        }

    );


    const currentSlide =
        State.slides[index];


    const moduleId =
        currentSlide?.dataset.slide;


    State.modules.forEach(

        module => {

            const isActive =

                module.dataset.module ===

                    moduleId;


            module.classList.toggle(

                "active",

                isActive

            );


            module.setAttribute(

                "aria-selected",

                String(isActive)

            );


            module.tabIndex =

                isActive ? 0 : -1;

        }

    );

}


/* =====================================================
   HERO THEME SWITCHER
   Mengganti tema mockup ponsel di hero saja,
   bukan tema halaman.
===================================================== */

function initThemeSwitch(){

    const phone =

        document.getElementById(
            "faPhone"
        );


    const buttons =

        Array.from(

            document.querySelectorAll(
                ".fa-theme-btn"
            )

        );


    if(!phone || buttons.length === 0){

        return;

    }


    buttons.forEach(

        button => {

            button.addEventListener(

                "click",

                () => {

                    phone.dataset.theme =

                        button.dataset.themeChoice;


                    buttons.forEach(

                        other => {

                            other.setAttribute(

                                "aria-pressed",

                                String(other === button)

                            );

                        }

                    );

                }

            );

        }

    );

}


/* =====================================================
   NEWS
===================================================== */


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value){

    if(value === null || value === undefined){

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
   EXTRACT TEXT
===================================================== */

function extractText(html){

    if(!html){

        return "";

    }


    const temp =
        document.createElement("div");


    temp.innerHTML = html;


    return temp.textContent

        .replace(/\s+/g, " ")

        .trim();

}


/* =====================================================
   CREATE EXCERPT
===================================================== */

function createExcerpt(

    article,

    maxLength = 125

){

    const source =

        article?.seo?.description

        ||

        extractText(

            article?.content

        );


    if(!source){

        return "";

    }


    const text =
        source.trim();


    if(text.length <= maxLength){

        return text;

    }


    return (

        text

            .slice(

                0,

                maxLength

            )

            .replace(

                /\s+\S*$/,

                ""

            )

            .trim()

        + "..."

    );

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatNewsDate(date){

    if(!date){

        return "";

    }


    const parsed =
        new Date(date);


    if(

        Number.isNaN(

            parsed.getTime()

        )

    ){

        return escapeHTML(date);

    }


    return new Intl.DateTimeFormat(

        "id-ID",

        {

            day: "numeric",

            month: "long",

            year: "numeric"

        }

    ).format(parsed);

}


/* =====================================================
   GET LATEST ARTICLES
===================================================== */

function getLatestArticles(){

    if(!Array.isArray(articles)){

        return [];

    }


    return [...articles]

        .filter(

            article =>

                article &&

                article.title

        )

        .sort(

            (a, b) =>

                new Date(b.date) -

                new Date(a.date)

        )

        .slice(

            0,

            CONFIG.latestNewsLimit

        );

}


/* =====================================================
   RENDER NEWS
===================================================== */

function renderLatestNews(){

    const container =

        document.getElementById(

            "latestNewsList"

        );


    if(!container){

        return;

    }


    const latestArticles =
        getLatestArticles();


    if(

        latestArticles.length === 0

    ){

        container.innerHTML = `

            <div class="latest-news-empty">

                <p>
                    Belum ada News & Update.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =

        latestArticles

            .map(

                article => {

                    const slug =
                        encodeURIComponent(

                            article.slug || ""

                        );


                    const title =
                        escapeHTML(

                            article.title

                        );


                    const image =
                        escapeHTML(

                            article.image || ""

                        );


                    const date =
                        formatNewsDate(

                            article.date

                        );


                    const excerpt =
                        escapeHTML(

                            createExcerpt(

                                article

                            )

                        );


                    return `

                        <article
                            class="latest-news-card"
                        >

                            <a
                                href="${blogArticleUrl(slug)}"
                                class="latest-news-image-link"
                                aria-label="Baca ${title}"
                            >

                                <img
                                    src="${image}"
                                    alt="${title}"
                                    loading="lazy"
                                >

                            </a>


                            <div
                                class="latest-news-card-content"
                            >

                                <time
                                    datetime="${escapeHTML(article.date || "")}"
                                    class="latest-news-date"
                                >
                                    ${date}
                                </time>


                                <h3>

                                    <a
                                        href="${blogArticleUrl(slug)}"
                                    >
                                        ${title}
                                    </a>

                                </h3>


                                <p>
                                    ${excerpt}
                                </p>


                                <a
                                    href="${blogArticleUrl(slug)}"
                                    class="latest-news-link"
                                >
                                    Baca selengkapnya →
                                </a>

                            </div>

                        </article>

                    `;

                }

            )

            .join("");

}


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        init();

        renderLatestNews();

    }

);
