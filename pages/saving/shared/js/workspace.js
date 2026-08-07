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

    if(

        workspace.workspace ===

        "saving"

    ){

        await Saving.init();

    }else{

        await Kas.init();

    }

    toggleHome();

}


/* =====================================================
   HOME
===================================================== */

function toggleHome(){

    const saving =

        document.getElementById(

            "home-page"

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

    if(

        workspace.workspace ===

        "saving"

    ){

        saving.classList.remove(

            "hidden"

        );

        kas.classList.add(

            "hidden"

        );

        return;

    }

    saving.classList.add(

        "hidden"

    );

    kas.classList.remove(

        "hidden"

    );

}
