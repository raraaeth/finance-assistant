/* =====================================================
   Finance Assistant
   Module      : Workspace
   File        : workspace.js
   Version     : 4.2.0

   Description :
   Workspace Controller

   Workspace Logic :

   exists
   = workspace sudah dibuat
     dan sheet yang diperlukan tersedia.

   active
   = workspace yang sedang dipilih user
     di local storage.

   Workspace yang belum dibuat
   tidak boleh dijalankan.

===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadWorkspace

} from "./storage.js";


import {

    loadSession

} from "./auth.js";


import * as Saving from

    "../pages/saving/home.js";


import * as Kas from

    "../pages/kas/home.js";


import * as PayrollMonthly from

    "../pages/payroll-monthly/home.js";


import * as PayrollDaily from

    "../pages/payroll-daily/home.js";


import * as Financial from

    "../pages/financial/home.js";


import * as Airdrop from

    "../pages/airdrop/home.js";


/* =====================================================
   MODULE REGISTRY
===================================================== */

const WORKSPACE = {

    financial:

        Financial,


    saving:

        Saving,


    kas:

        Kas,


    "payroll-daily":

        PayrollDaily,


    "payroll-monthly":

        PayrollMonthly,


    airdrop:

        Airdrop

};


/* =====================================================
   SESSION MODULES
===================================================== */

function getModules(){

    const session =

        loadSession();


    return (

        session
        ?.workspace
        ?.modules

        ||

        {}

    );

}


/* =====================================================
   ACTIVE WORKSPACE
===================================================== */

function getActiveWorkspace(){

    const workspace =

        loadWorkspace();


    return (

        workspace
        ?.workspace

        ||

        null

    );

}


/* =====================================================
   WORKSPACE VALIDATION

   exists hanya menentukan apakah
   workspace benar-benar sudah dibuat.

   active workspace ditentukan oleh
   workspace yang dipilih user
   melalui local storage.
===================================================== */

function workspaceExists(

    moduleName

){

    const modules =

        getModules();


    return (

        modules
        ?.[moduleName]
        ?.exists

        === true

    );

}


/* =====================================================
   INIT WORKSPACE
===================================================== */

export async function initWorkspace(){

    const active =

        getActiveWorkspace();


    /* =============================================
       NO ACTIVE WORKSPACE
    ============================================= */

    if(

        !active

    ){

        console.log(

            "Belum ada workspace yang dipilih."

        );

        return;

    }


    /* =============================================
       MODULE NOT FOUND
    ============================================= */

    const module =

        WORKSPACE[active];


    if(

        !module

    ){

        console.warn(

            `Module "${active}" tidak ditemukan.`

        );

        return;

    }


    /* =============================================
       WORKSPACE NOT CREATED
    ============================================= */

    if(

        !workspaceExists(

            active

        )

    ){

        console.warn(

            `Workspace "${active}" belum dibuat.`

        );

        return;

    }


    /* =============================================
       START MODULE
    ============================================= */

    console.log(

        "Workspace aktif:",

        active

    );


    await module.init();

}


/* =====================================================
   START
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initWorkspace

);
