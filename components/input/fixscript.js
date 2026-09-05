/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : script.js
   Version      : 6.0.0

   Description :
   Global Input Controller

   Handles :
   - Load HTML
   - Init
   - Open
   - Close
   - Global Workspace connection
   - Input Data connection

   PRINCIPLE :

   Global js/workspace.js
        ↓
   active workspace
        ↓
   Global Input
        ↓
   data.js
        ↓
   Input Flow
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    State

} from "./state.js";


import {

    getActiveWorkspace,

    getWorkspaceConfig

} from "../../js/workspace.js";


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
           
           Tidak lagi menggunakan
           components/input/workspace.js.

           Workspace langsung berasal dari
           global js/workspace.js.
        ============================================= */

        const activeWorkspace =

            workspace

            ||

            getActiveWorkspace();


        console.log(

            "INPUT ACTIVE WORKSPACE:",

            activeWorkspace

        );


        /* =============================================
           VALIDATE WORKSPACE
        ============================================= */

        if(

            !activeWorkspace

        ){

            console.warn(

                "Global Input: workspace tidak ditemukan."

            );

            return;

        }


        /* =============================================
           GLOBAL WORKSPACE CONFIG
           
           Config ini berasal langsung dari
           js/workspace.js.

           Contoh :

           {
               id,
               title,
               icon,
               sheets,
               module
           }
        ============================================= */

        const workspaceConfig =

            getWorkspaceConfig()

            ?.[

                activeWorkspace

            ];


        if(

            !workspaceConfig

        ){

            console.warn(

                "Global Input: konfigurasi workspace tidak ditemukan:",

                activeWorkspace

            );

            return;

        }


        console.log(

            "INPUT WORKSPACE CONFIG:",

            workspaceConfig

        );


        /* =============================================
           LOAD INPUT DATA
           
           data.js bertugas membaca sheet yang
           ditentukan oleh workspace global.

           Tidak ada URL OpenSheet di sini.
        ============================================= */

        const inputData =

            await loadInputData(

                activeWorkspace

            );


        console.log(

            "INPUT DATA:",

            inputData

        );


        /* =============================================
           RESET STATE
        ============================================= */

        State.reset();


        /* =============================================
           SET WORKSPACE
        ============================================= */

        State.workspace =

            activeWorkspace;


        /* =============================================
           SET CONFIG
           
           Untuk sementara config State berasal
           dari konfigurasi workspace global.

           Konfigurasi khusus field/input akan
           ditangani oleh module input masing-masing.
        ============================================= */

        State.config =

            workspaceConfig

            ||

            {};


        /* =============================================
           SESSION
        ============================================= */

        initSession(

            activeWorkspace

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


    /* =============================================
       TITLE
       
       Menggunakan title dari global workspace.
    ============================================= */

    if(

        title

    ){

        title.textContent =

            State.config?.title

            ??

            "Input";

    }


    /* =============================================
       SUBTITLE
       
       Global workspace.js tidak mempunyai
       subtitle input.

       Jadi jangan menganggap field tersebut
       ada di global config.
    ============================================= */

    if(

        subtitle

    ){

        subtitle.textContent =

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


    /* =============================================
       WORKSPACE LABEL
       
       Global workspace menggunakan "title",
       bukan workspaceLabel.
    ============================================= */

    workspaceElement.textContent =

        State.config?.title

        ??

        State.workspace

        ??

        "-";

}
