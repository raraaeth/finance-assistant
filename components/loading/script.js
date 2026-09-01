/* =====================================================
   Finance Assistant
   Component    : Global Loading
   File         : script.js
   Version      : 2.0.0

   Description :
   Global Full Screen Loading Controller

   Responsibility :
   - Create loading HTML
   - Create loading CSS
   - Show loading
   - Hide loading
   - Prevent duplicate loading element
   - Set Hero Dashboard image
   - Hero floating animation
   - Generic untuk seluruh aplikasi

   Usage :
   Loading.show()
   Loading.hide()
===================================================== */


/* =====================================================
   STATE
===================================================== */

let initialized = false;

let loadingElement = null;


/* =====================================================
   LOADING
===================================================== */

export const Loading = {


    /* =================================================
       INIT
    ================================================= */

    async init(){

        /* =============================================
           ALREADY INITIALIZED
        ============================================= */

        if(

            initialized &&

            loadingElement

        ){

            return loadingElement;

        }


        /* =============================================
           CHECK EXISTING DOM
        ============================================= */

        loadingElement =

            document.getElementById(

                "global-loading"

            );


        if(

            loadingElement

        ){

            setHeroImage(

                loadingElement

            );


            initialized =

                true;


            return loadingElement;

        }


        /* =============================================
           CREATE CSS
        ============================================= */

        createLoadingStyle();


        /* =============================================
           CREATE HTML
        ============================================= */

        loadingElement =

            createLoadingElement();


        if(

            !loadingElement

        ){

            console.error(

                "Global Loading element gagal dibuat."

            );

            return null;

        }


        /* =============================================
           SET HERO IMAGE
        ============================================= */

        setHeroImage(

            loadingElement

        );


        /* =============================================
           APPEND
        ============================================= */

        document.body.appendChild(

            loadingElement

        );


        initialized =

            true;


        return loadingElement;

    },


    /* =================================================
       SHOW
    ================================================= */

    async show(){

        const element =

            await Loading.init();


        if(

            !element

        ){

            return false;

        }


        /* =============================================
           SHOW
        ============================================= */

        element.classList.remove(

            "is-hidden"

        );


        element.classList.add(

            "is-visible"

        );


        element.setAttribute(

            "aria-hidden",

            "false"

        );


        /* =============================================
           PREVENT SCROLL
        ============================================= */

        document.body.classList.add(

            "global-loading-active"

        );


        return true;

    },


    /* =================================================
       HIDE
    ================================================= */

    hide(){

        const element =

            loadingElement

            ||

            document.getElementById(

                "global-loading"

            );


        if(

            !element

        ){

            return;

        }


        /* =============================================
           HIDE
        ============================================= */

        element.classList.remove(

            "is-visible"

        );


        element.classList.add(

            "is-hidden"

        );


        element.setAttribute(

            "aria-hidden",

            "true"

        );


        /* =============================================
           RESTORE SCROLL
        ============================================= */

        document.body.classList.remove(

            "global-loading-active"

        );

    }

};



/* =====================================================
   CREATE LOADING HTML
===================================================== */

function createLoadingElement(){

    const loading =

        document.createElement(

            "div"

        );


    loading.id =

        "global-loading";


    loading.className =

        "global-loading is-hidden";


    loading.setAttribute(

        "aria-hidden",

        "true"

    );


    loading.innerHTML =

    `

        <div class="global-loading-content">

            <img
                class="global-loading-logo"
                src=""
                alt="Finance Assistant">

        </div>

    `;


    return loading;

}



/* =====================================================
   CREATE LOADING CSS
===================================================== */

function createLoadingStyle(){

    /* =============================================
       PREVENT DUPLICATE STYLE
    ============================================= */

    if(

        document.getElementById(

            "global-loading-style"

        )

    ){

        return;

    }


    /* =============================================
       STYLE ELEMENT
    ============================================= */

    const style =

        document.createElement(

            "style"

        );


    style.id =

        "global-loading-style";


    style.textContent =

    `

        /* ==========================================
           GLOBAL LOADING
        ========================================== */

        #global-loading.global-loading{

            position: fixed;

            inset: 0;

            width: 100%;

            height: 100%;

            background: #ffffff;

            display: flex;

            align-items: center;

            justify-content: center;

            z-index: 999999;

            opacity: 1;

            visibility: visible;

            pointer-events: auto;

            transition:

                opacity

                180ms

                ease,

                visibility

                180ms

                ease;

        }


        /* ==========================================
           CONTENT
        ========================================== */

        #global-loading

        .global-loading-content{

            width: 100%;

            height: 100%;

            display: flex;

            align-items: center;

            justify-content: center;

            padding: 20px;

            box-sizing: border-box;

        }


        /* ==========================================
           HERO DASHBOARD
        ========================================== */

        #global-loading

        .global-loading-logo{

            display: block;

            width: min(

                78vw,

                360px

            );

            max-width: 360px;

            height: auto;

            object-fit: contain;

            animation:

                global-loading-float

                2.4s

                ease-in-out

                infinite;

            will-change: transform;

        }


        /* ==========================================
           FLOAT ANIMATION
        ========================================== */

        @keyframes global-loading-float{

            0%{

                transform:

                    translateY(0);

            }


            50%{

                transform:

                    translateY(-12px);

            }


            100%{

                transform:

                    translateY(0);

            }

        }


        /* ==========================================
           HIDDEN
        ========================================== */

        #global-loading

        &.is-hidden{

            opacity: 0;

            visibility: hidden;

            pointer-events: none;

        }


        /* ==========================================
           VISIBLE
        ========================================== */

        #global-loading

        &.is-visible{

            opacity: 1;

            visibility: visible;

            pointer-events: auto;

        }


        /* ==========================================
           BODY LOCK
        ========================================== */

        body.global-loading-active{

            overflow: hidden;

        }


        /* ==========================================
           MOBILE
        ========================================== */

        @media(

            max-width: 600px

        ){

            #global-loading

            .global-loading-content{

                padding: 16px;

            }


            #global-loading

            .global-loading-logo{

                width: 78vw;

                max-width: 300px;

            }

        }


        /* ==========================================
           SMALL MOBILE
        ========================================== */

        @media(

            max-width: 380px

        ){

            #global-loading

            .global-loading-logo{

                width: 74vw;

                max-width: 270px;

            }

        }


        /* ==========================================
           REDUCED MOTION
        ========================================== */

        @media(

            prefers-reduced-motion: reduce

        ){

            #global-loading

            .global-loading-logo{

                animation: none;

            }

        }

    `;


    document.head.appendChild(

        style

    );

}



/* =====================================================
   SET HERO IMAGE
===================================================== */

function setHeroImage(

    element

){

    if(

        !element

    ){

        return;

    }


    const logo =

        element.querySelector(

            ".global-loading-logo"

        );


    if(

        !logo

    ){

        return;

    }


    /* =============================================
       HERO DASHBOARD
    ============================================= */

    logo.src =

        new URL(

            "../../assets/images/hero/hero-dashboard.png",

            import.meta.url

        ).href;

}
