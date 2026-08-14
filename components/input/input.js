/* =====================================================
   Finance Assistant
   Global Component
   Module      : Input
   File        : input.js
   Version     : 1.0.0

   Description :
   Global Input Controller

   Sections :
   - Import
   - State
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

export const Input = {

    workspace : "",

    sessionDate : null,

    dateLocked : false,

    items : [],

    current : {}

};


/* =====================================================
   INIT
===================================================== */

Input.init = function(){

    bindEvents();

};


/* =====================================================
   OPEN
===================================================== */

Input.open = function(){

    const overlay =

        document.getElementById(

            "global-input-overlay"

        );


    if(

        !overlay

    ){

        console.warn(

            "Global Input Overlay tidak ditemukan."

        );

        return;

    }


    /* =============================================
       RESET SESSION
    ============================================= */

    resetSession();


    /* =============================================
       LOAD WORKSPACE
    ============================================= */

    const workspace =

        loadWorkspace();


    Input.workspace =

        workspace?.workspace ??

        "saving";


    /* =============================================
       RENDER SESSION
    ============================================= */

    renderWorkspace();

    generateId();

    setDefaultDate();


    /* =============================================
       SHOW
    ============================================= */

    overlay.classList.remove(

        "hidden"

    );

};


/* =====================================================
   CLOSE
===================================================== */

Input.close = function(){

    const overlay =

        document.getElementById(

            "global-input-overlay"

        );


    if(

        !overlay

    ){

        return;

    }


    overlay.classList.add(

        "hidden"

    );


    resetSession();

};


/* =====================================================
   RESET SESSION
===================================================== */

function resetSession(){

    Input.workspace = "";

    Input.sessionDate = null;

    Input.dateLocked = false;

    Input.items = [];

    Input.current = {};


    const list =

        document.getElementById(

            "global-input-list"

        );


    if(

        list

    ){

        list.innerHTML = "";

    }


    const form =

        document.getElementById(

            "global-input-form"

        );


    if(

        form

    ){

        form.innerHTML = "";

    }


    hideElement(

        "global-input-action"

    );


    hideElement(

        "global-input-list-section"

    );


    hideElement(

        "global-input-footer"

    );


    showElement(

        "global-input-date"

    );


    hideElement(

        "global-input-date-locked"

    );


    updateCount();

}


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


    element.textContent =

        formatWorkspace(

            Input.workspace

        );

}


/* =====================================================
   ID
===================================================== */

function generateId(){

    const element =

        document.getElementById(

            "global-input-id"

        );


    if(

        !element

    ){

        return;

    }


    const prefix =

        getPrefix(

            Input.workspace

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


    element.textContent =

        `${prefix}-${random}`;

}


/* =====================================================
   DATE
===================================================== */

function setDefaultDate(){

    const input =

        document.getElementById(

            "global-input-date"

        );


    if(

        !input

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


    const date =

        `${year}-${month}-${day}`;


    input.value =

        date;


    Input.sessionDate =

        date;

}


/* =====================================================
   LOCK DATE
===================================================== */

function lockDate(){

    const input =

        document.getElementById(

            "global-input-date"

        );


    const locked =

        document.getElementById(

            "global-input-date-locked"

        );


    const lockedDate =

        document.getElementById(

            "global-input-locked-date"

        );


    if(

        !input ||

        !locked ||

        !lockedDate

    ){

        return;

    }


    Input.sessionDate =

        input.value;


    Input.dateLocked =

        true;


    input.classList.add(

        "hidden"

    );


    locked.classList.remove(

        "hidden"

    );


    lockedDate.textContent =

        formatDate(

            Input.sessionDate

        );

}


/* =====================================================
   EVENTS
===================================================== */

function bindEvents(){

    const closeButton =

        document.getElementById(

            "global-input-close"

        );


    const backdrop =

        document.getElementById(

            "global-input-backdrop"

        );


    const dateInput =

        document.getElementById(

            "global-input-date"

        );


    if(

        closeButton

    ){

        closeButton.addEventListener(

            "click",

            Input.close

        );

    }


    if(

        backdrop

    ){

        backdrop.addEventListener(

            "click",

            Input.close

        );

    }


    if(

        dateInput

    ){

        dateInput.addEventListener(

            "change",

            ()=>{

                if(

                    !Input.dateLocked

                ){

                    Input.sessionDate =

                        dateInput.value;

                }

            }

        );

    }

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
   FORMAT DATE
===================================================== */

function formatDate(

    value

){

    if(

        !value

    ){

        return "-";

    }


    const date =

        new Date(

            `${value}T00:00:00`

        );


    return date.toLocaleDateString(

        "id-ID",

        {

            day :

                "2-digit",

            month :

                "long",

            year :

                "numeric"

        }

    );

}


/* =====================================================
   SHOW
===================================================== */

function showElement(

    id

){

    const element =

        document.getElementById(

            id

        );


    if(

        element

    ){

        element.classList.remove(

            "hidden"

        );

    }

}


/* =====================================================
   HIDE
===================================================== */

function hideElement(

    id

){

    const element =

        document.getElementById(

            id

        );


    if(

        element

    ){

        element.classList.add(

            "hidden"

        );

    }

}


/* =====================================================
   COUNT
===================================================== */

function updateCount(){

    const count =

        document.getElementById(

            "global-input-count"

        );


    const total =

        document.getElementById(

            "global-input-total-count"

        );


    if(

        count

    ){

        count.textContent =

            Input.items.length;

    }


    if(

        total

    ){

        total.textContent =

            Input.items.length;

    }

}
