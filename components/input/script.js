/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : script.js
   Version      : 1.0.0

   Description :
   Reusable Global Input Controller

   Direction :
   Right → Left

   Sections :
   - State
   - Input
   - Init
   - Open
   - Close
   - Session
   - Helper
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadWorkspace

} from "../../js/storage.js";


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
           CHECK EXISTING
        ============================================= */

        let input =

            document.getElementById(

                "global-input"

            );


        /* =============================================
           LOAD HTML
        ============================================= */

        if(

            !input

        ){

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

                        "Input HTML gagal dimuat"

                    );

                }


                const html =

                    await response.text();


                const wrapper =

                    document.createElement(

                        "div"

                    );


                wrapper.innerHTML =

                    html;


                const element =

                    wrapper.firstElementChild;


                document.body.appendChild(

                    element

                );


                input = element;

            }

            catch(error){

                console.error(

                    "Global Input Error:",

                    error

                );

                return;

            }

        }


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


        const input =

            document.getElementById(

                "global-input"

            );


        if(

            !input

        ){

            return;

        }


        /* =============================================
           SESSION
        ============================================= */

        renderWorkspace();

        renderId();

        renderDate();


        /* =============================================
           SHOW
        ============================================= */

        input.classList.add(

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

        const input =

            document.getElementById(

                "global-input"

            );


        if(

            !input

        ){

            return;

        }


        input.classList.remove(

            "is-open"

        );


        document.body.classList.remove(

            "input-open"

        );

    }

};


/* =====================================================
   WORKSPACE
===================================================== */

function renderWorkspace(){

    const element =

        document.getElementById(

            "global-input-workspace"

        );


    if(

        !element

    ){

        return;

    }


    const workspace =

        loadWorkspace();


    const active =

        workspace?.workspace ??

        "saving";


    element.textContent =

        formatWorkspace(

            active

        );

}


/* =====================================================
   ID
===================================================== */

function renderId(){

    const element =

        document.getElementById(

            "global-input-id"

        );


    if(

        !element

    ){

        return;

    }


    const workspace =

        loadWorkspace();


    const active =

        workspace?.workspace ??

        "saving";


    element.textContent =

        generateId(

            active

        );

}


/* =====================================================
   DATE
===================================================== */

function renderDate(){

    const element =

        document.getElementById(

            "global-input-date"

        );


    if(

        !element

    ){

        return;

    }


    const today =

        new Date();


    const year =

        today.getFullYear();


    const month =

        String(

            today.getMonth() + 1

        ).padStart(

            2,

            "0"

        );


    const day =

        String(

            today.getDate()

        ).padStart(

            2,

            "0"

        );


    element.value =

        `${year}-${month}-${day}`;

}


/* =====================================================
   GENERATE ID
===================================================== */

function generateId(

    workspace

){

    const prefix =

        getPrefix(

            workspace

        );


    const random =

        Math.random()

        .toString(

            36

        )

        .substring(

            2,

            10

        )

        .toUpperCase();


    return `${prefix}-${random}`;

}


/* =====================================================
   PREFIX
===================================================== */

function getPrefix(

    workspace

){

    switch(

        workspace

    ){

        case "saving":

            return "SAV";


        case "kas":

            return "KAS";


        case "payroll-monthly":

            return "PM";


        case "payroll-daily":

            return "PD";


        case "financial":

            return "FIN";


        default:

            return "FA";

    }

}


/* =====================================================
   WORKSPACE NAME
===================================================== */

function formatWorkspace(

    workspace

){

    switch(

        workspace

    ){

        case "saving":

            return "Saving";


        case "kas":

            return "Kas";


        case "payroll-monthly":

            return "Payroll Monthly";


        case "payroll-daily":

            return "Payroll Daily";


        case "financial":

            return "Financial";


        default:

            return workspace;

    }

}
