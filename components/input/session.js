/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : session.js
   Version      : 1.0.0

   Description :
   Global Input Session Controller

   Handles :
   - Workspace
   - Input ID
   - Date
   - Date Lock
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    State

} from "./state.js";


/* =====================================================
   INIT SESSION
===================================================== */

export function initSession(

    workspace

){

    State.workspace =

        workspace;


    State.date =

        getToday();


    State.dateLocked =

        false;


    State.editingIndex =

        null;


    renderWorkspace();

    renderId();

    renderDate();

}


/* =====================================================
   RESET SESSION
===================================================== */

export function resetSession(){

    State.workspace = null;

    State.date = null;

    State.dateLocked = false;

    State.editingIndex = null;


    const dateInput =

        document.getElementById(

            "global-input-date"

        );


    if(

        dateInput

    ){

        dateInput.disabled =

            false;

    }


    const lockedDate =

        document.getElementById(

            "global-input-date-locked"

        );


    if(

        lockedDate

    ){

        lockedDate.classList.add(

            "hidden"

        );

    }

}


/* =====================================================
   GET TODAY
===================================================== */

function getToday(){

    const today =

        new Date();


    const year =

        today.getFullYear();


    const month =

        String(

            today.getMonth() + 1

        )

        .padStart(

            2,

            "0"

        );


    const day =

        String(

            today.getDate()

        )

        .padStart(

            2,

            "0"

        );


    return `${year}-${month}-${day}`;

}


/* =====================================================
   SET DATE
===================================================== */

export function setDate(

    value

){

    if(

        State.dateLocked

    ){

        return;

    }


    if(

        !value

    ){

        return;

    }


    State.date =

        value;

}


/* =====================================================
   GET DATE
===================================================== */

export function getDate(){

    return State.date;

}


/* =====================================================
   LOCK DATE
===================================================== */

export function lockDate(){

    if(

        !State.date

    ){

        return;

    }


    State.dateLocked =

        true;


    const input =

        document.getElementById(

            "global-input-date"

        );


    const locked =

        document.getElementById(

            "global-input-date-locked"

        );


    const lockedValue =

        document.getElementById(

            "global-input-locked-date"

        );


    if(

        input

    ){

        input.disabled =

            true;

    }


    if(

        lockedValue

    ){

        lockedValue.textContent =

            formatDate(

                State.date

            );

    }


    if(

        locked

    ){

        locked.classList.remove(

            "hidden"

        );

    }

}


/* =====================================================
   UNLOCK DATE
===================================================== */

export function unlockDate(){

    State.dateLocked =

        false;


    const input =

        document.getElementById(

            "global-input-date"

        );


    const locked =

        document.getElementById(

            "global-input-date-locked"

        );


    if(

        input

    ){

        input.disabled =

            false;

    }


    if(

        locked

    ){

        locked.classList.add(

            "hidden"

        );

    }

}


/* =====================================================
   RENDER WORKSPACE
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

            State.workspace

        );

}


/* =====================================================
   RENDER ID
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


    element.textContent =

        generateId(

            State.workspace

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


        case "payroll-daily":

            return "PD";


        case "payroll-monthly":

            return "PM";


        case "financial":

            return "FIN";


        default:

            return "FA";

    }

}


/* =====================================================
   RENDER DATE
===================================================== */

function renderDate(){

    const input =

        document.getElementById(

            "global-input-date"

        );


    if(

        !input

    ){

        return;

    }


    input.value =

        State.date;


    input.disabled =

        false;

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


        case "payroll-daily":

            return "Payroll Daily";


        case "payroll-monthly":

            return "Payroll Monthly";


        case "financial":

            return "Financial";


        default:

            return workspace ??

                "-";

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


    if(

        Number.isNaN(

            date.getTime()

        )

    ){

        return value;

    }


    return new Intl.DateTimeFormat(

        "id-ID",

        {

            day :

                "2-digit",

            month :

                "2-digit",

            year :

                "numeric"

        }

    ).format(

        date

    );

}
