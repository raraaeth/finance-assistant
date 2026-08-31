/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : workspace.js
   Version      : 2.0.0

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
   config Input module
===================================================== */


/* =====================================================
   IMPORT GLOBAL WORKSPACE
===================================================== */

import {
    getActiveWorkspace as getGlobalActiveWorkspace,
    getWorkspaceConfig as getGlobalWorkspaceConfig
} from "../js/workspace.js";


/* =====================================================
   INPUT CONFIG
===================================================== */

const INPUT_CONFIG = {};


/* =====================================================
   GET ACTIVE WORKSPACE
===================================================== */

export function getActiveWorkspace(){

    return (
        getGlobalActiveWorkspace()
        ||
        window.activeWorkspace
        ||
        window.currentWorkspace
        ||
        null
    );

}


/* =====================================================
   GET INPUT CONFIG
===================================================== */

export function getWorkspaceConfig(
    workspace
){

    if(
        !workspace
    ){
        return null;
    }


    return (
        INPUT_CONFIG[workspace]
        ||
        null
    );

}


/* =====================================================
   RESOLVE GLOBAL WORKSPACE
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


    /* =============================================
       VALIDATE WORKSPACE
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

            config :
                null
        };

    }


    /* =============================================
       GET GLOBAL WORKSPACE
       
       Global workspace adalah
       sumber kebenaran workspace.
    ============================================= */

    const globalConfig =
        getGlobalWorkspaceConfig();


    const workspaceConfig =
        globalConfig?.[
            activeWorkspace
        ];


    /* =============================================
       WORKSPACE TIDAK TERDAFTAR
    ============================================= */

    if(
        !workspaceConfig
    ){

        console.warn(
            "Global Input: workspace tidak terdaftar:",
            activeWorkspace
        );

        return {
            workspace :
                activeWorkspace,

            config :
                null
        };

    }


    /* =============================================
       INPUT CONFIG
       
       Untuk sementara Input config
       masih kosong.

       Config field akan kita bereskan
       pada tahap berikutnya.
    ============================================= */

    const inputConfig =
        getWorkspaceConfig(
            activeWorkspace
        );


    /* =============================================
       RETURN
       
       Workspace sudah valid walaupun
       Input config belum tersedia.
    ============================================= */

    return {

        workspace :
            activeWorkspace,

        workspaceConfig :
            workspaceConfig,

        config :
            inputConfig

    };

}
