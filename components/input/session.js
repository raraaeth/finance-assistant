/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : session.js
   Version      : 3.1.0

   Description :
   Global Input Session Controller

   PRINCIPLE :

   Global Workspace
        ↓
   Global Input Controller
        ↓
   State.workspace
        ↓
   Input Config
        ↓
   Session
        ↓
   Prefix
        ↓
   Input ID

   IMPORTANT :

   - Tidak ada daftar workspace hardcode.
   - Tidak ada prefix workspace hardcode.
   - Tidak ada label workspace hardcode.
   - Prefix berasal dari konfigurasi input
     masing-masing workspace.
   - Workspace ID berasal dari State.workspace.
   - config.js menjadi penghubung ke konfigurasi
     workspace masing-masing.
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    State

} from "./state.js";


import {

    getInputConfig,

    getInputPrefix

} from "./config.js";


/* =====================================================
   INIT SESSION
===================================================== */

export function initSession(

    workspace

){

    /* =============================================
       WORKSPACE
    ============================================= */

    State.workspace =

        workspace;


    /* =============================================
       DATE
    ============================================= */

    State.date =

        getToday();


    /* =============================================
       DATE LOCK
    ============================================= */

    State.dateLocked =

        false;


    /* =============================================
       EDIT
    ============================================= */

    State.editingIndex =

        null;


    /* =============================================
       RENDER
    ============================================= */

    renderWorkspace();

    renderId();

    renderDate();

}


/* =====================================================
   RESET SESSION
===================================================== */

export function resetSession(){

    State.workspace =

        null;


    State.config =

        null;


    State.date =

        null;


    State.dateLocked =

        false;


    State.editingIndex =

        null;


    /* =============================================
       RESET DATE INPUT
    ============================================= */

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


    /* =============================================
       RESET LOCKED DATE
    ============================================= */

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

    /* =============================================
       DATE LOCK
    ============================================= */

    if(

        State.dateLocked

    ){

        return;

    }


    /* =============================================
       VALIDATE
    ============================================= */

    if(

        !value

    ){

        return;

    }


    /* =============================================
       SET
    ============================================= */

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

    /* =============================================
       VALIDATE DATE
    ============================================= */

    if(

        !State.date

    ){

        return;

    }


    /* =============================================
       LOCK
    ============================================= */

    State.dateLocked =

        true;


    /* =============================================
       INPUT
    ============================================= */

    const input =

        document.getElementById(

            "global-input-date"

        );


    /* =============================================
       LOCKED CONTAINER
    ============================================= */

    const locked =

        document.getElementById(

            "global-input-date-locked"

        );


    /* =============================================
       LOCKED VALUE
    ============================================= */

    const lockedValue =

        document.getElementById(

            "global-input-locked-date"

        );


    /* =============================================
       DISABLE INPUT
    ============================================= */

    if(

        input

    ){

        input.disabled =

            true;

    }


    /* =============================================
       SHOW LOCKED VALUE
    ============================================= */

    if(

        lockedValue

    ){

        lockedValue.textContent =

            formatDate(

                State.date

            );

    }


    /* =============================================
       SHOW LOCKED ELEMENT
    ============================================= */

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

    /* =============================================
       UNLOCK
    ============================================= */

    State.dateLocked =

        false;


    /* =============================================
       INPUT
    ============================================= */

    const input =

        document.getElementById(

            "global-input-date"

        );


    /* =============================================
       LOCKED CONTAINER
    ============================================= */

    const locked =

        document.getElementById(

            "global-input-date-locked"

        );


    /* =============================================
       ENABLE INPUT
    ============================================= */

    if(

        input

    ){

        input.disabled =

            false;

    }


    /* =============================================
       HIDE LOCKED ELEMENT
    ============================================= */

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

        formatWorkspace();

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


    const id =

        generateId();


    if(

        id

    ){

        element.textContent =

            id;

    }

    else{

        element.textContent =

            "-";

    }

}


/* =====================================================
   GENERATE ID
===================================================== */

function generateId(){

    /* =============================================
       GET PREFIX
    ============================================= */

    const prefix =

        getPrefix();


    /* =============================================
       PREFIX WAJIB
    ============================================= */

    if(

        !prefix

    ){

        console.error(

            "Global Input: tidak dapat membuat ID karena prefix workspace tidak tersedia.",

            State.workspace

        );


        return null;

    }


    /* =============================================
       RANDOM
    ============================================= */

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


    /* =============================================
       RESULT
    ============================================= */

    return `${prefix}-${random}`;

}


/* =====================================================
   GET PREFIX
===================================================== */

function getPrefix(){

    const prefix =

        getInputPrefix(

            State.workspace

        );


    /* =============================================
       VALIDATE PREFIX
    ============================================= */

    if(

        typeof prefix ===

            "string"

        &&

        prefix.trim()

    ){

        return prefix

            .trim()

            .toUpperCase();

    }


    /* =============================================
       PREFIX TIDAK DITEMUKAN
    ============================================= */

    console.warn(

        "Global Input: prefix tidak ditemukan pada konfigurasi input:",

        State.workspace

    );


    return null;

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

function formatWorkspace(){

    /* =============================================
       GET INPUT CONFIG
    ============================================= */

    const config =

        getInputConfig(

            State.workspace

        );


    /* =============================================
       GET LABEL
    ============================================= */

    const label =

        config?.workspaceLabel;


    /* =============================================
       VALIDATE LABEL
    ============================================= */

    if(

        typeof label ===

            "string"

        &&

        label.trim()

    ){

        return label.trim();

    }


    /* =============================================
       FALLBACK

       Workspace tetap berasal dari State.
       Tidak ada daftar workspace hardcode.
    ============================================= */

    return State.workspace ??

        "-";

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(

    value

){

    /* =============================================
       EMPTY
    ============================================= */

    if(

        !value

    ){

        return "-";

    }


    /* =============================================
       PARSE
    ============================================= */

    const date =

        new Date(

            `${value}T00:00:00`

        );


    /* =============================================
       INVALID
    ============================================= */

    if(

        Number.isNaN(

            date.getTime()

        )

    ){

        return value;

    }


    /* =============================================
       FORMAT
    ============================================= */

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
