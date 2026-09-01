/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : data.js
   Version      : 3.0.0

   Description :
   Global Input Dynamic Data Engine

   PRINCIPLE :

   Global Workspace
        ↓
   workspace.sheets
        ↓
   Global API
        ↓
   Google Sheets API
        ↓
   Input Data

   RESPONSIBILITY :

   - Membaca active workspace
   - Membaca konfigurasi workspace global
   - Membaca daftar sheet dari workspace.sheets
   - Mengirim sheet ke API.load()
   - Menyimpan RAW
   - Menyimpan DATA

   TIDAK ADA :

   - OpenSheet URL
   - Spreadsheet ID hardcode
   - Sheet name hardcode
   - Workspace list hardcode
   - Workspace-specific getter
   - Workspace-specific processing

   Sumber kebenaran :

   ../../js/workspace.js
   ../../js/api.js
===================================================== */


/* =====================================================
   IMPORT GLOBAL WORKSPACE
===================================================== */

import {

    getWorkspaceConfig

} from "../../js/workspace.js";


/* =====================================================
   IMPORT GLOBAL API
===================================================== */

import {

    API

} from "../../js/api.js";


/* =====================================================
   DATA STATE
===================================================== */

const Data = {

    workspace :

        null,

    config :

        null,

    sheets :

        [],

    raw :

        [],

    data :

        [],

    loaded :

        false

};


/* =====================================================
   NORMALIZE SHEETS
===================================================== */

function normalizeSheets(

    config

){

    if(

        !config

        ||

        !Array.isArray(

            config.sheets

        )

    ){

        return [];

    }


    return config.sheets

        .filter(

            sheet =>

                typeof sheet ===

                    "string"

                &&

                sheet.trim() !== ""

        )

        .map(

            sheet =>

                sheet.trim()

        );

}


/* =====================================================
   LOAD INPUT DATA
===================================================== */

export async function loadInputData(

    workspace

){

    console.log(

        "=========================================="

    );


    console.log(

        "===== GLOBAL INPUT DATA LOAD ====="

    );


    console.log(

        "=========================================="

    );


    /* =================================================
       RESET PREVIOUS DATA
    ================================================= */

    clearInputData();


    /* =================================================
       VALIDATE WORKSPACE
    ================================================= */

    if(

        !workspace

    ){

        throw new Error(

            "Global Input Data: workspace tidak ditemukan."

        );

    }


    /* =================================================
       GET GLOBAL WORKSPACE CONFIG
    ================================================= */

    const workspaces =

        getWorkspaceConfig();


    if(

        !workspaces

        ||

        typeof workspaces !==

            "object"

    ){

        throw new Error(

            "Global Input Data: konfigurasi workspace global tidak ditemukan."

        );

    }


    /* =================================================
       GET CURRENT WORKSPACE CONFIG
    ================================================= */

    const config =

        workspaces[

            workspace

        ];


    if(

        !config

    ){

        throw new Error(

            `Global Input Data: workspace "${workspace}" tidak terdaftar.`

        );

    }


    /* =================================================
       GET SHEETS
    ================================================= */

    const sheets =

        normalizeSheets(

            config

        );


    if(

        sheets.length === 0

    ){

        throw new Error(

            `Global Input Data: workspace "${workspace}" tidak memiliki konfigurasi sheet.`

        );

    }


    /* =================================================
       SHEET MAPPING
    ================================================= */

    /*
       Global workspace.js menentukan
       urutan sheet.

       Sheet pertama :

           RAW

       Sheet kedua :

           DATA

       Jika suatu saat jumlah sheet
       bertambah, data.js tidak perlu
       mengetahui nama sheet-nya.
    */


    const rawSheet =

        sheets[0];


    const dataSheet =

        sheets[1];


    /* =================================================
       DEBUG WORKSPACE
    ================================================= */

    console.log(

        "Input Workspace:",

        workspace

    );


    console.log(

        "Workspace Config:",

        config

    );


    console.log(

        "Workspace Sheets:",

        sheets

    );


    console.log(

        "RAW Sheet:",

        rawSheet

    );


    console.log(

        "DATA Sheet:",

        dataSheet

    );


    /* =================================================
       LOAD API
    ================================================= */

    /*
       API global bertanggung jawab terhadap :

       - Session
       - Finance Core
       - Google Provider Token
       - Google Sheets API
       - RAW
       - DATA
    */

    const result =

        await API.load(

            rawSheet,

            dataSheet

        );


    /* =================================================
       VALIDATE API RESULT
    ================================================= */

    if(

        !result

        ||

        result.success !== true

    ){

        throw new Error(

            `Global Input Data: gagal membaca workspace "${workspace}".`

        );

    }


    /* =================================================
       SAVE STATE
    ================================================= */

    Data.workspace =

        workspace;


    Data.config =

        config;


    Data.sheets =

        [

            ...sheets

        ];


    Data.raw =

        Array.isArray(

            result.raw

        )

        ?

        [

            ...result.raw

        ]

        :

        [];


    Data.data =

        Array.isArray(

            result.data

        )

        ?

        [

            ...result.data

        ]

        :

        [];


    Data.loaded =

        true;


    /* =================================================
       DEBUG RESULT
    ================================================= */

    console.log(

        "=========================================="

    );


    console.log(

        "===== GLOBAL INPUT DATA READY ====="

    );


    console.log(

        "=========================================="

    );


    console.log(

        "Workspace:",

        Data.workspace

    );


    console.log(

        "Sheets:",

        Data.sheets

    );


    console.log(

        "RAW Count:",

        Data.raw.length

    );


    console.log(

        "DATA Count:",

        Data.data.length

    );


    console.log(

        "RAW:",

        Data.raw

    );


    console.log(

        "DATA:",

        Data.data

    );


    console.log(

        "=========================================="

    );


    /* =================================================
       RETURN
    ================================================= */

    return {

        success :

            true,


        workspace :

            Data.workspace,


        config :

            Data.config,


        sheets :

            [

                ...Data.sheets

            ],


        raw :

            [

                ...Data.raw

            ],


        data :

            [

                ...Data.data

            ]

    };

}


/* =====================================================
   GET CURRENT WORKSPACE
===================================================== */

export function getInputWorkspace(){

    return Data.workspace;

}


/* =====================================================
   GET WORKSPACE CONFIG
===================================================== */

export function getInputWorkspaceConfig(){

    return Data.config;

}


/* =====================================================
   GET SHEETS
===================================================== */

export function getInputSheets(){

    return [

        ...Data.sheets

    ];

}


/* =====================================================
   GET RAW
===================================================== */

export function getInputRaw(){

    return [

        ...Data.raw

    ];

}


/* =====================================================
   GET DATA
===================================================== */

export function getInputData(){

    return [

        ...Data.data

    ];

}


/* =====================================================
   GET RULES
===================================================== */

export function getInputRules(){

    return [

        ...Data.data

    ];

}


/* =====================================================
   IS LOADED
===================================================== */

export function isInputDataLoaded(){

    return Data.loaded === true;

}


/* =====================================================
   CLEAR
===================================================== */

export function clearInputData(){

    Data.workspace =

        null;


    Data.config =

        null;


    Data.sheets =

        [];


    Data.raw =

        [];


    Data.data =

        [];


    Data.loaded =

        false;

}


/* =====================================================
   DEBUG
===================================================== */

export function debugInputData(){

    console.log(

        "=========================================="

    );


    console.log(

        "===== GLOBAL INPUT DATA DEBUG ====="

    );


    console.log(

        "=========================================="

    );


    console.log(

        "Workspace:",

        Data.workspace

    );


    console.log(

        "Config:",

        Data.config

    );


    console.log(

        "Sheets:",

        Data.sheets

    );


    console.log(

        "Loaded:",

        Data.loaded

    );


    console.log(

        "RAW:",

        Data.raw

    );


    console.log(

        "DATA:",

        Data.data

    );


    console.log(

        "=========================================="

    );


    return {

        workspace :

            Data.workspace,


        config :

            Data.config,


        sheets :

            [

                ...Data.sheets

            ],


        loaded :

            Data.loaded,


        raw :

            [

                ...Data.raw

            ],


        data :

            [

                ...Data.data

            ]

    };

}
