/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : script.js
   Version      : 3.0.0

   Description :
   Global Input Controller

   Sections :
   - Import
   - State
   - Config
   - Init
   - Open
   - Close
   - Flow
   - Field
   - Session
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

let currentConfig = null;

let currentStep = 0;

let currentValues = {};


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
           CLOSE
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
           WORKSPACE
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
           RESET SESSION
        ============================================= */

        currentStep = 0;

        currentValues = {};


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
           RESET LIST
        ============================================= */

        resetList();


        /* =============================================
           RENDER FIRST STEP
        ============================================= */

        renderCurrentStep();


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
   CURRENT STEP
===================================================== */

function renderCurrentStep(){

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


    const steps =

        currentConfig?.steps ??

        [];


    /* =============================================
       FIND NEXT VISIBLE STEP
    ============================================= */

    let step =

        steps[currentStep];


    while(

        step

        &&

        !shouldShow(

            step

        )

    ){

        currentStep++;

        step =

            steps[currentStep];

    }


    /* =============================================
       COMPLETE
    ============================================= */

    if(

        !step

    ){

        finishInput();

        return;

    }


    renderField(

        form,

        step

    );

}


/* =====================================================
   SHOULD SHOW
===================================================== */

function shouldShow(

    field

){

    if(

        typeof field.showWhen !==

        "function"

    ){

        return true;

    }


    return field.showWhen(

        currentValues

    );

}


/* =====================================================
   RENDER FIELD
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


    let element;


    /* =============================================
       SELECT
    ============================================= */

    if(

        field.type ===

        "select"

    ){

        element =

            document.createElement(

                "select"

            );


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


        element.appendChild(

            placeholder

        );


        const options =

            typeof field.options ===

            "function"

                ?

                field.options(

                    currentValues

                )

                :

                (

                    field.options ??

                    []

                );


        options.forEach(

            option => {

                const item =

                    document.createElement(

                        "option"

                    );


                item.value =

                    option.value;


                item.textContent =

                    option.label;


                element.appendChild(

                    item

                );

            }

        );

    }


    /* =============================================
       INPUT
    ============================================= */

    else{

        element =

            document.createElement(

                "input"

            );


        element.type =

            field.type ??

            "text";


        if(

            field.placeholder

        ){

            element.placeholder =

                field.placeholder;

        }

    }


    element.dataset.field =

        field.id;


    wrapper.appendChild(

        element

    );


    container.appendChild(

        wrapper

    );


    /* =============================================
       EVENT
    ============================================= */

    element.addEventListener(

        "change",

        () => {

            handleField(

                field,

                element

            );

        }

    );


    element.addEventListener(

        "keydown",

        event => {

            if(

                event.key === "Enter"

            ){

                event.preventDefault();

                handleField(

                    field,

                    element

                );

            }

        }

    );


    /* =============================================
       FOCUS
    ============================================= */

    requestAnimationFrame(

        () => {

            element.focus();

        }

    );

}


/* =====================================================
   HANDLE FIELD
===================================================== */

function handleField(

    field,

    element

){

    const value =

        element.value.trim();


    /* =============================================
       VALIDATION
    ============================================= */

    if(

        !value

    ){

        return;

    }


    /* =============================================
       SAVE VALUE
    ============================================= */

    currentValues[

        field.id

    ] =

        value;


    console.log(

        "Input:",

        field.id,

        value

    );


    /* =============================================
       NEXT STEP
    ============================================= */

    currentStep++;

    renderCurrentStep();

}


/* =====================================================
   FINISH INPUT
===================================================== */

function finishInput(){

    console.log(

        "Input selesai:",

        currentValues

    );


    renderInputPreview();

}


/* =====================================================
   INPUT PREVIEW
===================================================== */

function renderInputPreview(){

    const form =

        document.getElementById(

            "global-input-form"

        );


    if(

        form

    ){

        form.innerHTML =

        `

            <div class="global-input-field">

                <strong>

                    Input selesai

                </strong>

            </div>

        `;

    }


    const listSection =

        document.getElementById(

            "global-input-list-section"

        );


    const list =

        document.getElementById(

            "global-input-list"

        );


    const count =

        document.getElementById(

            "global-input-count"

        );


    if(

        listSection

    ){

        listSection.style.display =

            "block";

    }


    if(

        list

    ){

        list.innerHTML =

            `

                <div class="global-input-list-item">

                    <strong>

                        ${

                            formatWorkspace(

                                currentConfig.workspace

                            )

                        }

                    </strong>

                    <br>

                    ${

                        formatValue(

                            currentValues.type

                        )

                    }

                    <br>

                    ${

                        currentValues.member ??

                        "-"

                    }

                    <br>

                    Rp${

                        Number(

                            currentValues.amount

                        ).toLocaleString(

                            "id-ID"

                        )

                    }

                </div>

            `;

    }


    if(

        count

    ){

        count.textContent =

            "1";

    }

}


/* =====================================================
   RESET LIST
===================================================== */

function resetList(){

    const listSection =

        document.getElementById(

            "global-input-list-section"

        );


    const list =

        document.getElementById(

            "global-input-list"

        );


    const count =

        document.getElementById(

            "global-input-count"

        );


    if(

        listSection

    ){

        listSection.style.display =

            "none";

    }


    if(

        list

    ){

        list.innerHTML = "";

    }


    if(

        count

    ){

        count.textContent =

            "0";

    }

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

        element

    ){

        element.textContent =

            formatWorkspace(

                workspace

            );

    }

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

        element

    ){

        element.textContent =

            generateId(

                workspace

            );

    }

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
   FORMAT WORKSPACE
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


/* =====================================================
   FORMAT VALUE
===================================================== */

function formatValue(

    value

){

    switch(

        value

    ){

        case "masuk":

            return "💰 Masuk";


        case "keluar":

            return "💸 Keluar";


        default:

            return value ?? "-";

    }

}
