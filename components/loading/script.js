/* =====================================================
   Finance Assistant
   Component    : Global Loading
   File         : script.js
   Version      : 1.0.0

   Description :
   Global Full Screen Loading Controller

   Responsibility :
   - Load HTML loading
   - Show loading
   - Hide loading
   - Prevent duplicate loading element
   - Set Hero Dashboard image
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
           EXISTING DOM
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
           LOAD HTML
        ============================================= */

        try{

            const response =

                await fetch(

                    new URL(

                        "./index.html",

                        import.meta.url

                    )

                );


            if(

                !response.ok

            ){

                throw new Error(

                    `HTTP ${response.status}`

                );

            }


            const html =

                await response.text();


            /* =========================================
               CREATE DOM
            ========================================= */

            const wrapper =

                document.createElement(

                    "div"

                );


            wrapper.innerHTML =

                html.trim();


            loadingElement =

                wrapper.firstElementChild;


            if(

                !loadingElement

            ){

                throw new Error(

                    "Global Loading root tidak ditemukan."

                );

            }


            /* =========================================
               SET HERO IMAGE
            ========================================= */

            setHeroImage(

                loadingElement

            );


            /* =========================================
               APPEND
            ========================================= */

            document.body.appendChild(

                loadingElement

            );


            initialized =

                true;


            return loadingElement;

        }

        catch(error){

            console.error(

                "Global Loading HTML Error:",

                error

            );


            loadingElement =

                null;


            initialized =

                false;


            return null;

        }

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

        element.classList.add(

            "is-visible"

        );


        element.classList.remove(

            "is-hidden"

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
