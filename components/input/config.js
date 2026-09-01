/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : config.js
   Version      : 1.0.0

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
   Konfigurasi input workspace
        ↓
   Flow / Session / Transaction

   IMPORTANT :

   - Tidak mengatur authentication.
   - Tidak mengatur Finance Core.
   - Tidak mengatur Google Sheets.
   - Tidak menentukan sheet.
   - Tidak memiliki logic workspace global.
   - Tidak memiliki prefix hardcode berdasarkan
     nama workspace.

   Prefix berasal dari masing-masing
   konfigurasi input workspace.

   Contoh :

       daily.js
           ↓
       prefix : "PD"

       airdrop.js
           ↓
       prefix : "AIR"
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
===================================================== */

/*
   Registry ini hanya menghubungkan
   workspace ID dengan konfigurasi input.

   Tidak menyimpan:

   - sheet
   - spreadsheet ID
   - token
   - authentication
   - workspace status
*/


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
===================================================== */

/*
   Mengambil konfigurasi input berdasarkan
   workspace ID.

   Contoh :

       getInputConfig(
           "payroll-daily"
       );

   menghasilkan :

       Daily
*/

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
===================================================== */

/*
   Prefix berasal dari konfigurasi
   masing-masing workspace input.

   Tidak ada prefix hardcode di sini.

   Contoh :

       Payroll Daily
           ↓
       Daily.prefix
           ↓
       "PD"
*/

export function getInputPrefix(

    workspace

){

    const config =

        getInputConfig(

            workspace

        );


    const prefix =

        config?.prefix;


    if(

        typeof prefix !==

            "string"

    ){

        return null;

    }


    const value =

        prefix.trim();


    if(

        !value

    ){

        return null;

    }


    return value.toUpperCase();

}


/* =====================================================
   CHECK INPUT CONFIG
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
===================================================== */

/*
   Digunakan hanya jika suatu saat
   diperlukan untuk debugging / inspection.

   Tidak digunakan sebagai sumber
   workspace global.
*/

export function getAllInputConfigs(){

    return {

        ...INPUT_CONFIG

    };

}


/* =====================================================
   DEBUG
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


    console.log(

        "===== GLOBAL INPUT CONFIG ====="

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

        "==============================="

    );


    return {

        workspace :

            workspace,

        config :

            config,

        prefix :

            prefix

    };

}
