/* =====================================================
   Finance Assistant
   Component    : Global Loading
   File         : script.js
   Version      : 3.0.0

   Description :
   Global Loading & HTML Alert Controller

   Responsibility :
   - Load CSS
   - Load HTML
   - Show loading
   - Hide loading
   - Show HTML alert
   - Hide HTML alert
   - Prevent duplicate component
   - Lock body scroll

   Usage :

   Loading.show();

   Loading.show(
       "Menyiapkan Finance Assistant...",
       "Mohon tunggu sebentar."
   );

   Loading.hide();

   await Loading.alert({
       title : "Login berhasil",
       message :
           "Finance Assistant berhasil disiapkan."
   });
===================================================== */


/* =====================================================
   STATE
===================================================== */

let initialized = false;

let loadingElement = null;

let alertElement = null;

let styleLoaded = false;

let alertResolver = null;



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

            loadingElement &&

            alertElement

        ){

            return true;

        }


        /* =============================================
           LOAD CSS
        ============================================= */

        await loadCSS();


        /* =============================================
           EXISTING LOADING
        ============================================= */

        loadingElement =

            document.getElementById(

                "global-loading"

            );


        /* =============================================
           EXISTING ALERT
        ============================================= */

        alertElement =

            document.getElementById(

                "global-alert"

            );


        /* =============================================
           BOTH EXIST
        ============================================= */

        if(

            loadingElement &&

            alertElement

        ){

            bindAlertEvents();


            initialized =

                true;


            return true;

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


            /* =========================================
               FIND LOADING
            ========================================= */

            loadingElement =

                wrapper.querySelector(

                    "#global-loading"

                );


            /* =========================================
               FIND ALERT
            ========================================= */

            alertElement =

                wrapper.querySelector(

                    "#global-alert"

                );


            if(

                !loadingElement

            ){

                throw new Error(

                    "Global Loading root tidak ditemukan."

                );

            }


            if(

                !alertElement

            ){

                throw new Error(

                    "Global Alert root tidak ditemukan."

                );

            }


            /* =========================================
               APPEND
            ========================================= */

            document.body.appendChild(

                loadingElement

            );


            document.body.appendChild(

                alertElement

            );


            /* =========================================
               BIND EVENTS
            ========================================= */

            bindAlertEvents();


            /* =========================================
               STATE
            ========================================= */

            initialized =

                true;


            return true;

        }

        catch(error){

            console.error(

                "Global Loading HTML Error:",

                error

            );


            loadingElement =

                null;


            alertElement =

                null;


            initialized =

                false;


            return false;

        }

    },


    /* =================================================
       SHOW
    ================================================= */

    async show(

        title =

            "Menyiapkan Finance Assistant...",

        message =

            "Mohon tunggu sebentar."

    ){

        const ready =

            await Loading.init();


        if(

            !ready

        ){

            console.error(

                "Global Loading gagal diinisialisasi."

            );


            return false;

        }


        /* =============================================
           UPDATE TITLE
        ============================================= */

        const titleElement =

            loadingElement.querySelector(

                "#global-loading-title"

            );


        if(

            titleElement

        ){

            titleElement.textContent =

                title;

        }


        /* =============================================
           UPDATE MESSAGE
        ============================================= */

        const messageElement =

            loadingElement.querySelector(

                "#global-loading-text"

            );


        if(

            messageElement

        ){

            messageElement.textContent =

                message;

        }


        /* =============================================
           HIDE ALERT
        ============================================= */

        hideAlert();


        /* =============================================
           SHOW LOADING
        ============================================= */

        loadingElement.classList.remove(

            "is-hidden"

        );


        loadingElement.classList.add(

            "is-visible"

        );


        loadingElement.setAttribute(

            "aria-hidden",

            "false"

        );


        /* =============================================
           BODY LOCK
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
           HIDE LOADING
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
           RESTORE BODY
        ============================================= */

        document.body.classList.remove(

            "global-loading-active"

        );

    },


    /* =================================================
       ALERT
    ================================================= */

    async alert({

        title =

            "Berhasil",

        message =

            "",

        buttonText =

            "OK",

        icon =

            "✓"

    } = {}){

        const ready =

            await Loading.init();


        if(

            !ready

        ){

            console.error(

                "Global Alert gagal diinisialisasi."

            );


            return false;

        }


        /* =============================================
           HIDE LOADING
        ============================================= */

        Loading.hide();


        /* =============================================
           ELEMENT
        ============================================= */

        const titleElement =

            alertElement.querySelector(

                "#global-alert-title"

            );


        const messageElement =

            alertElement.querySelector(

                "#global-alert-message"

            );


        const iconElement =

            alertElement.querySelector(

                "#global-alert-icon"

            );


        const confirmButton =

            alertElement.querySelector(

                "#global-alert-confirm"

            );


        /* =============================================
           SET CONTENT
        ============================================= */

        if(

            titleElement

        ){

            titleElement.textContent =

                title;

        }


        if(

            messageElement

        ){

            messageElement.textContent =

                message;

        }


        if(

            iconElement

        ){

            iconElement.textContent =

                icon;

        }


        if(

            confirmButton

        ){

            confirmButton.textContent =

                buttonText;


            confirmButton.disabled =

                false;

        }


        /* =============================================
           SHOW
        ============================================= */

        alertElement.classList.remove(

            "is-hidden"

        );


        alertElement.setAttribute(

            "aria-hidden",

            "false"

        );


        /* =============================================
           BODY LOCK
        ============================================= */

        document.body.classList.add(

            "global-loading-active"

        );


        /* =============================================
           FOCUS
        ============================================= */

        if(

            confirmButton

        ){

            setTimeout(

                () => {

                    confirmButton.focus();

                },

                0

            );

        }


        /* =============================================
           PROMISE
        ============================================= */

        return new Promise(

            resolve => {

                alertResolver =

                    resolve;

            }

        );

    },


    /* =================================================
       HIDE ALERT
    ================================================= */

    hideAlert(){

        hideAlert();

    }

};



/* =====================================================
   BIND ALERT EVENTS
===================================================== */

function bindAlertEvents(){

    if(

        !alertElement

    ){

        return;

    }


    /* =============================================
       CONFIRM BUTTON
    ============================================= */

    const confirmButton =

        alertElement.querySelector(

            "#global-alert-confirm"

        );


    if(

        confirmButton

    ){

        confirmButton.addEventListener(

            "click",

            handleAlertConfirm

        );

    }


    /* =============================================
       BACKDROP
       
       Untuk login kita tidak menutup alert
       ketika backdrop ditekan.
       User harus menekan OK.
    ============================================= */

}



/* =====================================================
   HANDLE ALERT CONFIRM
===================================================== */

function handleAlertConfirm(){

    hideAlert();


    if(

        typeof alertResolver ===

        "function"

    ){

        const resolve =

            alertResolver;


        alertResolver =

            null;


        resolve(

            true

        );

    }

}



/* =====================================================
   HIDE ALERT
===================================================== */

function hideAlert(){

    const element =

        alertElement

        ||

        document.getElementById(

            "global-alert"

        );


    if(

        !element

    ){

        return;

    }


    element.classList.add(

        "is-hidden"

    );


    element.setAttribute(

        "aria-hidden",

        "true"

    );


    document.body.classList.remove(

        "global-loading-active"

    );

}



/* =====================================================
   LOAD CSS
===================================================== */

async function loadCSS(){

    /* =============================================
       SUDAH DIMUAT
    ============================================= */

    if(

        styleLoaded

    ){

        return true;

    }


    /* =============================================
       CEK LINK EXISTING
    ============================================= */

    const existing =

        document.querySelector(

            'link[data-global-loading-style="true"]'

        );


    if(

        existing

    ){

        styleLoaded =

            true;


        return true;

    }


    /* =============================================
       CREATE STYLESHEET
    ============================================= */

    return new Promise(

        resolve => {

            const link =

                document.createElement(

                    "link"

                );


            link.rel =

                "stylesheet";


            link.href =

                new URL(

                    "./style.css",

                    import.meta.url

                ).href;


            link.dataset.globalLoadingStyle =

                "true";


            link.onload =

                () => {

                    styleLoaded =

                        true;


                    resolve(

                        true

                    );

                };


            link.onerror =

                error => {

                    console.error(

                        "Global Loading CSS Error:",

                        error

                    );


                    resolve(

                        false

                    );

                };


            document.head.appendChild(

                link

            );

        }

    );

}
