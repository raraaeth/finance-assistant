/* =====================================================
   Finance Assistant
   Module      : Workspace
   File        : workspace.js
   Version     : 2.0.0

   Description :
   Workspace Controller

   Sections :
   - Import
   - State
   - Init
   - Workspace
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

import * as Financial from

    "../pages/financial/home.js";

import * as PayrollMonthly from

    "../pages/payroll-monthly/home.js";

import * as PayrollDaily from

    "../pages/payroll-daily/home.js";


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

    financial :

        Financial,

    "payroll-monthly" :

        PayrollMonthly,

    "payroll-daily" :

        PayrollDaily

};


/* =====================================================
   INIT
===================================================== */

export async function initWorkspace(){

    toggleWorkspace();

    const module =

        WORKSPACE[

            workspace.workspace

        ];

    if(

        !module

    ){

        return;

    }

    await module.init();

}


/* =====================================================
   WORKSPACE
===================================================== */

function toggleWorkspace(){

    Object.keys(

        WORKSPACE

    ).forEach(

        name=>{

            const element =

                document.getElementById(

                    `${name}-home`

                );

            if(

                !element

            ){

                return;

            }

            element.classList.toggle(

                "hidden",

                workspace.workspace !==

                name

            );

        }

    );

}


/* =====================================================
   START
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initWorkspace

);
