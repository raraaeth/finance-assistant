/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : workspace.js
   Version      : 1.1.0

   Description :
   Menentukan workspace aktif dan konfigurasi Input
===================================================== */


/* =====================================================
   IMPORT CONFIG
===================================================== */

import {

    Kas

} from "./kas.js";


import {

    Saving

} from "./saving.js";


import {

    Daily

} from "./daily.js";


import {

    Monthly

} from "./monthly.js";


import {

    FinancialInput

} from "./financial.js";

/* =====================================================
   WORKSPACE CONFIG
===================================================== */

const WORKSPACES = {

    kas : Kas,

    saving : Saving,

    "payroll-daily" : Daily,

    "financial": Financial,

    "payroll-monthly" : Monthly

};


/* =====================================================
   GET ACTIVE WORKSPACE
===================================================== */

export function getActiveWorkspace(){

    const workspace =

        window.activeWorkspace

        ||

        window.currentWorkspace

        ||

        "kas";


    return workspace;

}


/* =====================================================
   GET CONFIG
===================================================== */

export function getWorkspaceConfig(

    workspace

){

    return (

        WORKSPACES[workspace]

        ||

        null

    );

}


/* =====================================================
   RESOLVE WORKSPACE
===================================================== */

export function resolveWorkspace(

    workspace = null

){

    /* =============================================
       PRIORITY

       1. Workspace yang dikirim langsung
       2. Workspace global aktif
    ============================================= */

    const activeWorkspace =

        workspace

        ||

        getActiveWorkspace();


    const config =

        getWorkspaceConfig(

            activeWorkspace

        );


    if(

        !config

    ){

        console.warn(

            "Input configuration tidak ditemukan:",

            activeWorkspace

        );


        return {

            workspace :

                activeWorkspace,

            config :

                null

        };

    }


    return {

        workspace :

            activeWorkspace,

        config

    };

}
