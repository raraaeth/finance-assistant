/* =====================================================
   Finance Assistant
   Component    : Landing Page
   File         : landing.js
   Version      : 2.0.0

   Description :
   Landing Page Module Slider + Latest News

   Handles :
   - Module card
   - Module selection
   - Automatic slide
   - 5 second interval
   - Manual module selection
   - Slide indicator
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
   CONFIG
===================================================== */

const CONFIG = {

    interval: 5000,

    latestNewsLimit: 5

};


/* =====================================================
   STATE
===================================================== */

const State = {

    current: 0,

    timer: null,

    modules: [],

    slides: [],

    dots: []

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


    State.dots =

        Array.from(

            document.querySelectorAll(
                ".module-slider-dot"
            )

        );


    if(

        State.modules.length === 0

        ||

        State.slides.length === 0

    ){

        return;

    }


    bindModuleEvents();

    bindDotEvents();

    setInitialSlide();

    startAutoSlide();

}


/* =====================================================
   MODULE EVENT
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
   DOT EVENT
===================================================== */

function bindDotEvents(){

    State.dots.forEach(

        (

            dot,

            index

        ) => {

            dot.addEventListener(

                "click",

                () => {

                    showSlide(index);

                }

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


    const firstId =
        firstModule.dataset.module;


    showModule(

        firstId,

        false

    );

}


/* =====================================================
   SHOW MODULE
===================================================== */

function showModule(

    moduleId,

    restart = true

){

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


    showSlide(

        slideIndex,

        false

    );


    /* =============================================
       ACTIVE MODULE
    ============================================= */

    State.modules.forEach(

        module => {

            module.classList.toggle(

                "active",

                module.dataset.module ===

                    moduleId

            );

        }

    );


    /* =============================================
       RESTART TIMER
    ============================================= */

    if(restart){

        restartAutoSlide();

    }

}


/* =====================================================
   SHOW SLIDE
===================================================== */

function showSlide(

    index,

    restart = true

){

    if(

        index < 0

        ||

        index >= State.slides.length

    ){

        return;

    }


    State.current = index;


    /* =============================================
       HIDE / SHOW SLIDES
    ============================================= */

    State.slides.forEach(

        (

            slide,

            slideIndex

        ) => {

            slide.classList.toggle(

                "active",

                slideIndex === index

            );

        }

    );


    /* =============================================
       ACTIVE DOT
    ============================================= */

    State.dots.forEach(

        (

            dot,

            dotIndex

        ) => {

            dot.classList.toggle(

                "active",

                dotIndex === index

            );

        }

    );


    /* =============================================
       ACTIVE MODULE
    ============================================= */

    const currentSlide =
        State.slides[index];


    const moduleId =
        currentSlide?.dataset.slide;


    State.modules.forEach(

        module => {

            module.classList.toggle(

                "active",

                module.dataset.module ===

                    moduleId

            );

        }

    );


    if(restart){

        restartAutoSlide();

    }

}


/* =====================================================
   NEXT SLIDE
===================================================== */

function nextSlide(){

    if(

        State.slides.length === 0

    ){

        return;

    }


    let next =
        State.current + 1;


    if(

        next >=

        State.slides.length

    ){

        next = 0;

    }


    showSlide(

        next,

        false

    );

}


/* =====================================================
   START AUTO SLIDE
===================================================== */

function startAutoSlide(){

    stopAutoSlide();


    State.timer =

        setInterval(

            () => {

                nextSlide();

            },

            CONFIG.interval

        );

}


/* =====================================================
   STOP AUTO SLIDE
===================================================== */

function stopAutoSlide(){

    if(State.timer){

        clearInterval(

            State.timer

        );

        State.timer = null;

    }

}


/* =====================================================
   RESTART AUTO SLIDE
===================================================== */

function restartAutoSlide(){

    startAutoSlide();

}


/* =====================================================
   VISIBILITY CHANGE
===================================================== */

function initVisibility(){

    document.addEventListener(

        "visibilitychange",

        () => {

            if(document.hidden){

                stopAutoSlide();

            }

            else{

                startAutoSlide();

            }

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
                                href="/news/${slug}"
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
                                        href="/news/${slug}"
                                    >
                                        ${title}
                                    </a>

                                </h3>


                                <p>
                                    ${excerpt}
                                </p>


                                <a
                                    href="/news/${slug}"
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

        initVisibility();

        renderLatestNews();

    }

);
