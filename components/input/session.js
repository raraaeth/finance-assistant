/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : session.js
   Version      : 2.0.0

   Description :
   Global Input Session Controller

   Handles :
   - Workspace
   - Input ID
   - Date
   - Date Lock

   Principle :
   - Workspace berasal dari Global Workspace Resolver.
   - Prefix berasal dari konfigurasi Input workspace.
   - Session tidak mengetahui daftar prefix workspace.
   - Session tidak melakukan hardcode workspace.
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


    State.dateLocked =

        false;


    /* =============================================
       EDITING
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


    /* =============================================
       RESET LOCKED DATE VALUE
    ============================================= */

    const lockedValue =

        document.getElementById(

            "global-input-locked-date"

        );


    if(

        lockedValue

    ){

        lockedValue.textContent =

            "";

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
       LOCKED VALUE
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
       SHOW LOCKED DATE
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
   GET PREFIX
===================================================== */

/*
   Prefix TIDAK lagi hardcode di session.js.

   Sumber :

       Input workspace.js
              ↓
       INPUT_CONFIG
              ↓
       prefix

   Contoh konfigurasi :

       airdrop : {

           prefix : "AIR"

       }

*/

function getPrefix(

    workspace

){

    if(

        !workspace

    ){

        return "FA";

    }


    const result =

        resolveWorkspace(

            workspace

        );


    const config =

        result?.config;


    /* =============================================
       PREFIX
    ============================================= */

    const prefix =

        config?.prefix;


    if(

        prefix

    ){

        return String(

            prefix

        )

        .trim()

        .toUpperCase();

    }


    /* =============================================
       FALLBACK
       
       Hanya digunakan apabila workspace
       belum mempunyai prefix.
    ============================================= */

    return "FA";

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

/*
   Nama workspace tidak lagi dibuat
   menggunakan switch hardcode.

   Resolver global menjadi sumber
   konfigurasi workspace.

   Prioritas :

       workspaceConfig.name
       workspaceConfig.label
       workspace
*/

function formatWorkspace(

    workspace

){

    if(

        !workspace

    ){

        return "-";

    }


    const result =

        resolveWorkspace(

            workspace

        );


    const workspaceConfig =

        result?.workspaceConfig;


    if(

        workspaceConfig?.name

    ){

        return workspaceConfig.name;

    }


    if(

        workspaceConfig?.label

    ){

        return workspaceConfig.label;

    }


    return workspace;

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
