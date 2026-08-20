/* =====================================================
   Finance Assistant
   Component    : Landing Page
   File         : landing.js
   Version      : 1.0.0

   Description :
   Landing Page Module Slider

   Handles :
   - Module card
   - Module selection
   - Automatic slide
   - 15 second interval
   - Manual module selection
   - Slide indicator
   - Active module state

   Principle :

       Module Card
            ↓
       Select Module
            ↓
       Show Module Slide

   Automatic :

       Slide 1
          ↓ 15s
       Slide 2
          ↓ 15s
       Slide 3
          ↓
       kembali Slide 1
===================================================== */


/* =====================================================
   CONFIG
===================================================== */

const CONFIG = {

    interval :

        5000

};


/* =====================================================
   STATE
===================================================== */

const State = {

    current :

        0,

    timer :

        null,

    modules :

        [],

    slides :

        [],

    dots :

        []

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


                    if(

                        !id

                    ){

                        return;

                    }


                    showModule(

                        id

                    );

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

                    showSlide(

                        index

                    );

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


    if(

        !firstModule

    ){

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


    if(

        slideIndex === -1

    ){

        console.warn(

            "Landing slide tidak ditemukan:",

            moduleId

        );

        return;

    }


    showSlide(

        slideIndex

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
       
       Jika user memilih module secara manual,
       hitungan 15 detik dimulai lagi.
    ============================================= */

    if(

        restart

    ){

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


    State.current =

        index;


    /* =============================================
       HIDE ALL SLIDES
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


    if(

        restart

    ){

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

    if(

        State.timer

    ){

        clearInterval(

            State.timer

        );

        State.timer =

            null;

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
=====================================================

   Jika user pindah tab,
   timer dihentikan.

   Saat kembali,
   timer dimulai lagi.
===================================================== */

function initVisibility(){

    document.addEventListener(

        "visibilitychange",

        () => {

            if(

                document.hidden

            ){

                stopAutoSlide();

            }

            else{

                startAutoSlide();

            }

        }

    );

}


/* =====================================================
   INIT
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        init();

        initVisibility();

    }

);
