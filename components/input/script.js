/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : script.js
   Version      : 5.1.0

   Description :
   Global Input Controller

   Handles :
   - Load HTML
   - Init
   - Open
   - Close
   - Module connection
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    State

} from "./state.js";


import {

    resolveWorkspace

} from "./workspace.js";


import {

    initSession

} from "./session.js";


import {

    startFlow

} from "./flow.js";


import {

    initTransaction

} from "./transaction.js";


/* =====================================================
   STATE
===================================================== */

let initialized = false;


/* =====================================================
   INPUT
===================================================== */

export const Input = {


    /* =================================================
       INIT
    ================================================= */

    async init(){

        if(

            initialized

        ){

            return;

        }


        /* =============================================
           LOAD HTML
        ============================================= */

        const overlay =

            await loadHTML();


        if(

            !overlay

        ){

            return;

        }


        /* =============================================
           TRANSACTION
        ============================================= */

        initTransaction();


        /* =============================================
           CLOSE BUTTON
        ============================================= */

        const closeButton =

            document.getElementById(

                "global-input-close"

            );


        if(

            closeButton

        ){

            closeButton.addEventListener(

                "click",

                () => {

                    Input.close();

                }

            );

        }


        /* =============================================
           BACKDROP
        ============================================= */

        const backdrop =

            document.getElementById(

                "global-input-backdrop"

            );


        if(

            backdrop

        ){

            backdrop.addEventListener(

                "click",

                () => {

                    Input.close();

                }

            );

        }


        /* =============================================
           ESC
        ============================================= */

        document.addEventListener(

            "keydown",

            event => {

                if(

                    event.key === "Escape"

                ){

                    Input.close();

                }

            }

        );


        initialized =

            true;

    },


    /* =================================================
       OPEN
    ================================================= */

    async open(){

        await Input.init();


        if(

            !initialized

        ){

            return;

        }


        /* =============================================
           RESOLVE WORKSPACE
        ============================================= */

        const result =

            resolveWorkspace();


        if(

            !result.config

        ){

            console.warn(

                "Input configuration tidak ditemukan:",

                result.workspace

            );

            return;

        }


        /* =============================================
           RESET STATE
        ============================================= */

        State.reset();


        /* =============================================
           CONFIG
        ============================================= */

        State.workspace =

            result.workspace;


        State.config =

            result.config;


        /* =============================================
           SESSION
        ============================================= */

        initSession(

            result.workspace

        );


        /* =============================================
           HEADER
        ============================================= */

        renderHeader();


        /* =============================================
           START FLOW
        ============================================= */

        startFlow();


        /* =============================================
           SHOW
        ============================================= */

        const overlay =

            document.getElementById(

                "global-input-overlay"

            );


        if(

            !overlay

        ){

            return;

        }


        overlay.classList.remove(

            "hidden"

        );


        overlay.classList.add(

            "is-open"

        );


        document.body.classList.add(

            "input-open"

        );

    },


    /* =================================================
       CLOSE
    ================================================= */

    close(){

        const overlay =

            document.getElementById(

                "global-input-overlay"

            );


        if(

            !overlay

        ){

            return;

        }


        overlay.classList.remove(

            "is-open"

        );


        overlay.classList.add(

            "hidden"

        );


        document.body.classList.remove(

            "input-open"

        );

    }

};


/* =====================================================
   LOAD HTML
===================================================== */

async function loadHTML(){

    /* =============================================
       CHECK EXISTING
    ============================================= */

    let overlay =

        document.getElementById(

            "global-input-overlay"

        );


    if(

        overlay

    ){

        return overlay;

    }


    /* =============================================
       FETCH COMPONENT HTML
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


        overlay =

            wrapper.firstElementChild;


        if(

            !overlay

        ){

            throw new Error(

                "Root Global Input tidak ditemukan."

            );

        }


        /* =========================================
           APPEND
        ========================================= */

        document.body.appendChild(

            overlay

        );


        return overlay;

    }

    catch(error){

        console.error(

            "Global Input HTML Error:",

            error

        );


        return null;

    }

}


/* =====================================================
   HEADER
===================================================== */

function renderHeader(){

    const title =

        document.getElementById(

            "global-input-title"

        );


    const subtitle =

        document.getElementById(

            "global-input-subtitle"

        );


    if(

        title

    ){

        title.textContent =

            State.config.title ??

            "Input";

    }


    if(

        subtitle

    ){

        subtitle.textContent =

            State.config.subtitle ??

            "Tambahkan data";

    }

}
