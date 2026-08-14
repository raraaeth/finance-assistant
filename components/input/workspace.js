/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : workspace.js
   Version      : 1.0.0

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


/* =====================================================
   WORKSPACE CONFIG
===================================================== */

const WORKSPACES = {

    kas : Kas,

    saving : Saving,

    "payroll-daily" : Daily,

    "payroll-monthly" : Monthly

};


/* =====================================================
   GET ACTIVE WORKSPACE
===================================================== */

export function getActiveWorkspace(){

    /*
       Untuk sementara kita baca dari
       workspace global.

       Nanti bisa langsung disambungkan
       ke workspace controller utama.
    */

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

export function resolveWorkspace(){

    const workspace =

        getActiveWorkspace();


    const config =

        getWorkspaceConfig(

            workspace

        );


    if(

        !config

    ){

        console.warn(

            "Input configuration tidak ditemukan:",

            workspace

        );


        return {

            workspace,

            config : null

        };

    }


    return {

        workspace,

        config

    };

}
