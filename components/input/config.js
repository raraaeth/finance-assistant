/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : config.js
   Version      : 1.1.0

   Description :
   Global Input Configuration Registry

   PRINCIPLE :

   Global Workspace
        ↓
   Menentukan workspace aktif
        ↓
   Global Input
        ↓
   config.js
        ↓
   Import konfigurasi workspace
        ↓
   Flow / Session / Transaction


   IMPORTANT :

   config.js HANYA menjadi penghubung.

   Tidak menyimpan :

   - Prefix workspace
   - Sheet
   - Spreadsheet ID
   - Token
   - Authentication
   - Finance Core
   - Workspace global logic

   Prefix tetap berada pada masing-masing
   konfigurasi workspace.

   Contoh :

       daily.js
           ↓
       Daily.prefix

       airdrop.js
           ↓
       Airdrop.prefix

   config.js hanya menghubungkan object tersebut
   dengan workspace ID.
===================================================== */


/* =====================================================
   IMPORT INPUT CONFIGURATION
===================================================== */

import {

    Daily

} from "./daily.js";


import {

    Monthly

} from "./monthly.js";


import {

    Financial

} from "./financial.js";


import {

    Saving

} from "./saving.js";


import {

    Kas

} from "./kas.js";


import {

    Airdrop

} from "./airdrop.js";


/* =====================================================
   INPUT CONFIG REGISTRY
=====================================================

   Registry ini adalah penghubung antara :

       Global Workspace
              ↓
       workspace ID
              ↓
       Input Configuration

   Tidak membuat konfigurasi baru.

   Object asli dari masing-masing workspace
   langsung digunakan.
===================================================== */

const INPUT_CONFIG = {

    "payroll-daily" :

        Daily,


    "payroll-monthly" :

        Monthly,


    financial :

        Financial,


    saving :

        Saving,


    kas :

        Kas,


    airdrop :

        Airdrop

};


/* =====================================================
   GET INPUT CONFIG
=====================================================

   Mengambil konfigurasi input berdasarkan
   workspace ID.

   Contoh :

       getInputConfig(
           "payroll-daily"
       )

   menghasilkan :

       Daily

===================================================== */

export function getInputConfig(

    workspace

){

    if(

        !workspace

    ){

        return null;

    }


    return (

        INPUT_CONFIG[

            workspace

        ]

        ??

        null

    );

}


/* =====================================================
   GET INPUT PREFIX
=====================================================

   Prefix TIDAK disimpan di config.js.

   Prefix diambil langsung dari konfigurasi
   workspace yang sudah di-import.

   Contoh :

       payroll-daily
           ↓
       Daily
           ↓
       Daily.prefix

   atau :

       airdrop
           ↓
       Airdrop
           ↓
       Airdrop.prefix
===================================================== */

export function getInputPrefix(

    workspace

){

    const config =

        getInputConfig(

            workspace

        );


    if(

        !config

    ){

        console.warn(

            "Global Input: konfigurasi input tidak ditemukan:",

            workspace

        );


        return null;

    }


    const prefix =

        config.prefix;


    /* =============================================
       VALIDATE PREFIX
    ============================================= */

    if(

        typeof prefix !==

            "string"

        ||

        !prefix.trim()

    ){

        console.warn(

            "Global Input: prefix tidak ditemukan pada konfigurasi input:",

            workspace

        );


        return null;

    }


    return prefix

        .trim()

        .toUpperCase();

}


/* =====================================================
   GET INPUT WORKSPACE LABEL
=====================================================

   Label juga tetap berasal dari konfigurasi
   workspace masing-masing.

   Tidak ada label hardcode di sini.
===================================================== */

export function getInputWorkspaceLabel(

    workspace

){

    const config =

        getInputConfig(

            workspace

        );


    if(

        !config

    ){

        return null;

    }


    const label =

        config.workspaceLabel;


    if(

        typeof label ===

            "string"

        &&

        label.trim()

    ){

        return label.trim();

    }


    return (

        config.title

        ??

        workspace

        ??

        null

    );

}


/* =====================================================
   HAS INPUT CONFIG
===================================================== */

export function hasInputConfig(

    workspace

){

    return Boolean(

        getInputConfig(

            workspace

        )

    );

}


/* =====================================================
   GET ALL INPUT CONFIG
=====================================================

   Digunakan hanya untuk debugging /
   inspection.

   Tidak digunakan sebagai sumber
   workspace global.
===================================================== */

export function getAllInputConfigs(){

    return {

        ...INPUT_CONFIG

    };

}


/* =====================================================
   DEBUG INPUT CONFIG
===================================================== */

export function debugInputConfig(

    workspace

){

    const config =

        getInputConfig(

            workspace

        );


    const prefix =

        getInputPrefix(

            workspace

        );


    const workspaceLabel =

        getInputWorkspaceLabel(

            workspace

        );


    console.log(

        "=========================================="

    );


    console.log(

        "===== GLOBAL INPUT CONFIG ====="

    );


    console.log(

        "=========================================="

    );


    console.log(

        "Workspace:",

        workspace

    );


    console.log(

        "Config:",

        config

    );


    console.log(

        "Prefix:",

        prefix

    );


    console.log(

        "Workspace Label:",

        workspaceLabel

    );


    console.log(

        "=========================================="

    );


    return {

        workspace :

            workspace,


        config :

            config,


        prefix :

            prefix,


        workspaceLabel :

            workspaceLabel

    };

}
