/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : script.js
   Version      : 2.0.0

   Description :
   Global Input Controller

   Sections :
   - Import
   - State
   - Config
   - Init
   - Open
   - Close
   - Workspace
   - Form
   - Helper
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadWorkspace

} from "../../js/storage.js";


import {

    Kas

} from "./kas.js";


/* =====================================================
   CONFIG
===================================================== */

const INPUT_CONFIG = {

    kas :

        Kas

};


/* =====================================================
   STATE
===================================================== */

let initialized = false;


/* =====================================================
   SESSION
===================================================== */

let currentConfig =

    null;


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
           GET WORKSPACE
        ============================================= */

        const workspace =

            getActiveWorkspace();


        const config =

            INPUT_CONFIG[workspace];


        if(

            !config

        ){

            console.warn(

                `Input configuration untuk workspace "${workspace}" tidak ditemukan.`

            );

            return;

        }


        currentConfig =

            config;


        /* =============================================
           SESSION
        ============================================= */

        renderTitle(

            config

        );


        renderWorkspace(

            workspace

        );


        renderId(

            workspace

        );


        renderDate();


        /* =============================================
           FORM
        ============================================= */

        renderForm(

            config

        );


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
   TITLE
===================================================== */

function renderTitle(

    config

){

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

            config.title ??

            "Input";

    }


    if(

        subtitle

    ){

        subtitle.textContent =

            config.subtitle ??

            "Tambahkan data";

    }

}


/* =====================================================
   WORKSPACE
===================================================== */

function renderWorkspace(

    workspace

){

    const element =

        document.getElementById(

            "global-input-workspace"

        );


    if(

        !element

    ){

        return;

    }


    element.textContent =

        formatWorkspace(

            workspace

        );

}


/* =====================================================
   ID
===================================================== */

function renderId(

    workspace

){

    const element =

        document.getElementById(

            "global-input-id"

        );


    if(

        !element

    ){

        return;

    }


    element.textContent =

        generateId(

            workspace

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
   FORM
===================================================== */

function renderForm(

    config

){

    const form =

        document.getElementById(

            "global-input-form"

        );


    if(

        !form

    ){

        return;

    }


    form.innerHTML = "";


    const fields =

        config.fields ??

        [];


    fields.forEach(

        field => {

            renderField(

                form,

                field

            );

        }

    );

}


/* =====================================================
   FIELD
===================================================== */

function renderField(

    container,

    field

){

    const wrapper =

        document.createElement(

            "div"

        );


    wrapper.className =

        "global-input-field";


    const label =

        document.createElement(

            "label"

        );


    label.textContent =

        field.label;


    wrapper.appendChild(

        label

    );


    /* =============================================
       SELECT
    ============================================= */

    if(

        field.type ===

        "select"

    ){

        const select =

            document.createElement(

                "select"

            );


        select.dataset.field =

            field.id;


        const placeholder =

            document.createElement(

                "option"

            );


        placeholder.value =

            "";


        placeholder.textContent =

            "Pilih...";


        placeholder.disabled =

            true;


        placeholder.selected =

            true;


        select.appendChild(

            placeholder

        );


        (

            field.options ??

            []

        ).forEach(

            option => {

                const item =

                    document.createElement(

                        "option"

                    );


                item.value =

                    option.value;


                item.textContent =

                    option.label;


                select.appendChild(

                    item

                );

            }

        );


        wrapper.appendChild(

            select

        );

    }


    /* =============================================
       INPUT
    ============================================= */

    else{

        const input =

            document.createElement(

                "input"

            );


        input.type =

            field.type ??

            "text";


        input.dataset.field =

            field.id;


        wrapper.appendChild(

            input

        );

    }


    container.appendChild(

        wrapper

    );

}


/* =====================================================
   ACTIVE WORKSPACE
===================================================== */

function getActiveWorkspace(){

    const workspace =

        loadWorkspace();


    return (

        workspace?.workspace ??

        "saving"

    );

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
