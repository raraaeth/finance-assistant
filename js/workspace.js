/* =====================================================
   Finance Assistant
   Module      : Workspace
   File        : workspace.js
   Version     : 4.0.0

   Description :
   Workspace Controller

   Sections :
   - Import
   - Module Registry
   - Session
   - Workspace
   - Validation
   - Init
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
        ?.module

        ||

        null

    );

}


/* =====================================================
   MODULE VALIDATION
===================================================== */

function isModuleActive(

    moduleName

){

    const modules =

        getModules();


    return (

        modules
        ?.[moduleName]
        ?.active

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
       MODULE INACTIVE
    ============================================= */

    if(

        !isModuleActive(

            active

        )

    ){

        console.warn(

            `Workspace "${active}" belum aktif.`

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
