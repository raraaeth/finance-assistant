/* =====================================================
   Finance Assistant
   Module      : Workspace
   File        : workspace.js
   Version     : 4.2.0

   Description :
   Workspace Controller

   Workspace Status :
   - Active
   - Inactive
   - Not Created

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

   Hanya berisi workspace
   yang sudah dibuat.

   Contoh:

   {
       financial: {
           active: true
       },

       airdrop: {
           active: false
       }
   }
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

   Workspace aktif dibaca
   dari local storage.

   Contoh:

   {
       workspace: "financial"
   }
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
   MODULE EXISTS

   Workspace hanya dianggap tersedia
   jika benar-benar ada di modules.

   Workspace yang belum dibuat
   tidak akan ditemukan di sini.
===================================================== */

function isModuleExists(

    moduleName

){

    const modules =

        getModules();


    return (

        modules
        ?.[moduleName]

        !==

        undefined

    );

}


/* =====================================================
   MODULE ACTIVE

   Workspace dianggap aktif
   hanya jika:

   active === true
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
       WORKSPACE NOT CREATED

       Workspace tidak ada
       di hasil scan backend.
    ============================================= */

    if(

        !isModuleExists(

            active

        )

    ){

        console.warn(

            `Workspace "${active}" belum dibuat.`

        );

        return;

    }


    /* =============================================
       MODULE NOT FOUND

       Workspace ada di backend,
       tetapi belum terdaftar
       di frontend registry.
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

            `Workspace "${active}" sedang tidak aktif.`

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
