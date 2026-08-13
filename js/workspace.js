/* =====================================================
   Finance Assistant
   Module      : Workspace
   File        : workspace.js
   Version     : 3.0.0

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

} from "./storage.js";

import * as Saving from

    "../pages/saving/home.js";

import * as Kas from

    "../pages/kas/home.js";

import * as PayrollMonthly from
    "../pages/payroll-monthly/home.js";

import PayrollDaily
    from "../pages/payroll-daily/home.js";


/* =====================================================
   STATE
===================================================== */

const workspace =

    loadWorkspace();

const WORKSPACE = {

    saving :
        Saving,

    kas :
        Kas,

    "payroll-monthly" :
        PayrollMonthly,

    "payroll-daily" :
        PayrollDaily

};


/* =====================================================
   INIT
===================================================== */

export async function initWorkspace(){

    const active =

        workspace?.workspace ??

        "saving";

    const module =

        WORKSPACE[active];

    if(

        !module

    ){

        console.warn(

            `Workspace "${active}" tidak ditemukan.`

        );

        return;

    }

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
