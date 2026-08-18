/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : script.js
   Version      : 5.2.0

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

import {

    loadInputData

} from "./data.js";


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

            console.error(

                "Global Input gagal dimuat."

            );

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

    async open(

        workspace = null

    ){

        console.log(

            "INPUT OPEN",

            workspace

        );


        /* =============================================
           INIT
        ============================================= */

        await Input.init();


        if(

            !initialized

        ){

            console.error(

                "INPUT INIT gagal."

            );

            return;

        }


        /* =============================================
           ROOT
        ============================================= */

        const overlay =

            document.getElementById(

                "global-input-overlay"

            );


        if(

            !overlay

        ){

            console.error(

                "Element #global-input-overlay tidak ditemukan."

            );

            return;

        }


        console.log(

            "INPUT ROOT",

            overlay

        );


        /* =============================================
           RESOLVE WORKSPACE
        ============================================= */

        const result =

            resolveWorkspace(

                workspace

            );


        console.log(

            "INPUT WORKSPACE RESULT",

            result

        );


        if(

            !result

            ||

            !result.config

        ){

            console.warn(

                "Input configuration tidak ditemukan:",

                result?.workspace

            );

            return;

        }
/* =============================================
   LOAD INPUT DATA
============================================= */

await loadInputData(

    result.workspace

);


        /* =============================================
           RESET STATE
        ============================================= */

        State.reset();


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
           WORKSPACE
        ============================================= */

        renderWorkspace();


        /* =============================================
           FLOW
        ============================================= */

        startFlow();


        /* =============================================
           SHOW
        ============================================= */

        overlay.classList.add(

            "is-open"

        );


        document.body.classList.add(

            "input-open"

        );


        console.log(

            "INPUT FLOW STARTED"

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
           VALIDATE ROOT
        ========================================= */

        if(

            overlay.id !==

            "global-input-overlay"

        ){

            throw new Error(

                "Root Global Input harus menggunakan id global-input-overlay."

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

            State.config?.title ??

            "Input";

    }


    if(

        subtitle

    ){

        subtitle.textContent =

            State.config?.subtitle ??

            "Tambahkan data";

    }

}


/* =====================================================
   WORKSPACE
===================================================== */

function renderWorkspace(){

    const workspaceElement =

        document.getElementById(

            "global-input-workspace"

        );


    if(

        !workspaceElement

    ){

        return;

    }


    workspaceElement.textContent =

        State.config?.workspaceLabel

        ??

        State.workspace

        ??

        "-";

}
