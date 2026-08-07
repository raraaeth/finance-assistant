/* =====================================================
   Finance Assistant
   Workspace   : Saving
   Module      : Workspace
   File        : workspace.js
   Version     : 1.0.0

   Description :
   Workspace Controller

   Sections :
   - Import
   - State
   - Init
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadWorkspace

} from "../../../../js/storage.js";

import * as Saving from

    "../../saving/js/home.js";

import * as Kas from

    "../../kas/js/home.js";


/* =====================================================
   STATE
===================================================== */

const workspace =

    loadWorkspace();


/* =====================================================
   INIT
===================================================== */

export async function initWorkspace(){

    toggleWorkspace();

    if(

        workspace.workspace ===

        "saving"

    ){

        await Saving.init();

        return;

    }

    await Kas.init();

}

/* =====================================================
   WORKSPACE
===================================================== */

function toggleWorkspace(){

    const saving =

        document.getElementById(

            "saving-home"

        );

    const kas =

        document.getElementById(

            "kas-home"

        );

    if(

        !saving ||

        !kas

    ){

        return;

    }

    const active =

        workspace.workspace;

    saving.classList.toggle(

        "hidden",

        active !==

        "saving"

    );

    kas.classList.toggle(

        "hidden",

        active !==

        "kas"

    );

}

/* =====================================================
   START
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initWorkspace

);
