/* =====================================================
   Finance Assistant
   Global Component
   Module      : Input
   File        : input.js
   Version     : 1.1.0

   Description :
   Global Input Controller

   Sections :
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


    resetSession();


    /* =============================================
       WORKSPACE
    ============================================= */

    const workspace =

        loadWorkspace();


    Input.workspace =

        workspace?.workspace ??

        "saving";


    /* =============================================
       SESSION
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
   RESET
===================================================== */

function resetSession(){

    Input.workspace = "";

    Input.sessionDate = null;

    Input.dateLocked = false;

    Input.items = [];

    Input.current = {};


    const form =

        document.getElementById(

            "global-input-form"

        );


    if(

        form

    ){

        form.innerHTML = "";

    }


    const list =

        document.getElementById(

            "global-input-list"

        );


    if(

        list

    ){

        list.innerHTML = "";

    }


    hide(

        "global-input-action"

    );


    hide(

        "global-input-list-section"

    );


    hide(

        "global-input-footer"

    );


    show(

        "global-input-date"

    );


    hide(

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

function show(

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

function hide(

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
