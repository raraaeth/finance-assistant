/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : workspace.js
   Version      : 3.0.0

   Description :
   Global Input Workspace Resolver

   PRINCIPLE :

   Global js/workspace.js
        ↓
   sumber workspace utama
        ↓
   Global Input
        ↓
   resolve workspace
        ↓
   Global Workspace Configuration

   IMPORTANT :

   - Tidak ada registry workspace lokal
   - Tidak ada daftar workspace hardcode
   - Tidak ada sheet hardcode
   - Global workspace.js menjadi
     satu-satunya sumber kebenaran
===================================================== */


/* =====================================================
   IMPORT GLOBAL WORKSPACE
===================================================== */

import {

    getActiveWorkspace as getGlobalActiveWorkspace,

    getWorkspaceConfig as getGlobalWorkspaceConfig

} from "../../js/workspace.js";


/* =====================================================
   GET ACTIVE WORKSPACE
===================================================== */

export function getActiveWorkspace(){

    /* =============================================
       GLOBAL WORKSPACE
    ============================================= */

    const globalWorkspace =

        getGlobalActiveWorkspace();


    if(

        globalWorkspace

    ){

        return globalWorkspace;

    }


    /* =============================================
       LEGACY FALLBACK
       
       Dipertahankan sementara agar
       tidak memutus workspace lama.
    ============================================= */

    if(

        window.activeWorkspace

    ){

        return window.activeWorkspace;

    }


    if(

        window.currentWorkspace

    ){

        return window.currentWorkspace;

    }


    return null;

}


/* =====================================================
   GET WORKSPACE CONFIG
===================================================== */

export function getWorkspaceConfig(

    workspace

){

    /* =============================================
       VALIDATE
    ============================================= */

    if(

        !workspace

    ){

        return null;

    }


    /* =============================================
       GLOBAL WORKSPACE CONFIG
       
       Global workspace.js adalah
       sumber kebenaran.
    ============================================= */

    const configs =

        getGlobalWorkspaceConfig();


    if(

        !configs

        ||

        typeof configs !==

            "object"

    ){

        console.warn(

            "Global Input: konfigurasi workspace global tidak ditemukan."

        );

        return null;

    }


    /* =============================================
       GET WORKSPACE
    ============================================= */

    const config =

        configs[

            workspace

        ];


    /* =============================================
       WORKSPACE TIDAK DITEMUKAN
    ============================================= */

    if(

        !config

    ){

        console.warn(

            "Global Input: workspace tidak terdaftar:",

            workspace

        );

        return null;

    }


    return config;

}


/* =====================================================
   RESOLVE WORKSPACE
===================================================== */

export function resolveWorkspace(

    workspace = null

){

    /* =============================================
       PRIORITY

       1. Workspace parameter
       2. Global active workspace
       3. Legacy window state
    ============================================= */

    const activeWorkspace =

        workspace

        ||

        getActiveWorkspace();


    /* =============================================
       WORKSPACE TIDAK DITEMUKAN
    ============================================= */

    if(

        !activeWorkspace

    ){

        console.warn(

            "Global Input: workspace tidak ditemukan."

        );


        return {

            workspace :

                null,


            workspaceConfig :

                null,


            config :

                null

        };

    }


    /* =============================================
       GET GLOBAL CONFIG
    ============================================= */

    const config =

        getWorkspaceConfig(

            activeWorkspace

        );


    /* =============================================
       WORKSPACE TIDAK TERDAFTAR
    ============================================= */

    if(

        !config

    ){

        return {

            workspace :

                activeWorkspace,


            workspaceConfig :

                null,


            config :

                null

        };

    }


    /* =============================================
       RETURN
    ============================================= */

    return {

        workspace :

            activeWorkspace,


        workspaceConfig :

            config,


        config :

            config

    };

}
