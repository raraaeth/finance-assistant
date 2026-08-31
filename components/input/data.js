/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : data.js
   Version      : 2.0.0

   Description :
   Global Input Dynamic Data Engine

   Architecture :

   workspace.js
        ↓
   Workspace Configuration
        ↓
   module.js
        ↓
   Finance Core ID
        ↓
   auth.js
        ↓
   Google Provider Token
        ↓
   sheets.js
        ↓
   Google Sheets API
        ↓
   data.js
        ↓
   Input Components

   Principle :

   - Tidak ada OpenSheet
   - Tidak ada Spreadsheet ID hardcode
   - Tidak ada URL hardcode
   - Tidak ada daftar sheet hardcode
   - Workspace menentukan sheet yang dibutuhkan
   - data.js bersifat generic
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    getWorkspaceConfig,

    getActiveWorkspace

} from "../../js/workspace.js";


import {

    loadModuleInfo

} from "../../js/module.js";


import {

    getGoogleProviderToken

} from "../../js/auth.js";


import {

    readSheets

} from "../../js/sheets.js";


/* =====================================================
   DATA STATE
===================================================== */

const Data = {

    workspace :

        null,


    sheets :

        {},


    loaded :

        false

};


/* =====================================================
   NORMALIZE WORKSPACE
===================================================== */

function resolveWorkspace(

    workspace

){

    /* =============================================
       WORKSPACE DARI PARAMETER
    ============================================= */

    if(

        workspace

    ){

        return workspace;

    }


    /* =============================================
       WORKSPACE DARI GLOBAL STATE
    ============================================= */

    return getActiveWorkspace();

}


/* =====================================================
   GET WORKSPACE CONFIG
===================================================== */

function resolveWorkspaceConfig(

    workspace

){

    const configs =

        getWorkspaceConfig();


    if(

        !configs

        ||

        typeof configs !==

            "object"

    ){

        throw new Error(

            "Workspace configuration tidak ditemukan."

        );

    }


    const config =

        configs[

            workspace

        ];


    if(

        !config

    ){

        throw new Error(

            `Workspace "${workspace}" tidak ditemukan.`

        );

    }


    return config;

}


/* =====================================================
   GET FINANCE CORE
===================================================== */

function resolveFinanceCore(){

    const moduleInfo =

        loadModuleInfo();


    if(

        !moduleInfo

    ){

        throw new Error(

            "Finance Module Info tidak ditemukan."

        );

    }


    const financeCore =

        moduleInfo.financeCore;


    if(

        !financeCore

        ||

        !financeCore.id

    ){

        throw new Error(

            "Finance Core Spreadsheet ID tidak ditemukan."

        );

    }


    return financeCore;

}


/* =====================================================
   GET GOOGLE TOKEN
===================================================== */

async function resolveAccessToken(){

    const token =

        await getGoogleProviderToken();


    if(

        !token

    ){

        throw new Error(

            "Google Provider Token tidak ditemukan."

        );

    }


    return token;

}


/* =====================================================
   LOAD INPUT DATA
===================================================== */

export async function loadInputData(

    workspace = null

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
       RESOLVE WORKSPACE
    ================================================= */

    const activeWorkspace =

        resolveWorkspace(

            workspace

        );


    if(

        !activeWorkspace

    ){

        throw new Error(

            "Workspace aktif tidak ditemukan."

        );

    }


    console.log(

        "Input Workspace:",

        activeWorkspace

    );


    /* =================================================
       GET WORKSPACE CONFIG
    ================================================= */

    const workspaceConfig =

        resolveWorkspaceConfig(

            activeWorkspace

        );


    console.log(

        "Workspace Config:",

        workspaceConfig

    );


    /* =================================================
       GET SHEETS
    ================================================= */

    const sheets =

        Array.isArray(

            workspaceConfig.sheets

        )

        ?

        workspaceConfig.sheets.filter(

            sheet =>

                typeof sheet ===

                    "string"

                &&

                sheet.trim() !== ""

        )

        :

        [];


    if(

        !sheets.length

    ){

        throw new Error(

            `Workspace "${activeWorkspace}" tidak memiliki konfigurasi sheet.`

        );

    }


    console.log(

        "Input Sheets:",

        sheets

    );


    /* =================================================
       FINANCE CORE
    ================================================= */

    const financeCore =

        resolveFinanceCore();


    console.log(

        "Finance Core:",

        financeCore

    );


    /* =================================================
       GOOGLE TOKEN
    ================================================= */

    const accessToken =

        await resolveAccessToken();


    console.log(

        "Google Provider Token: AVAILABLE"

    );


    /* =================================================
       READ SHEETS
    ================================================= */

    const result =

        await readSheets({

            accessToken :

                accessToken,

            spreadsheetId :

                financeCore.id,

            sheets :

                sheets

        });


    /* =================================================
       SAVE DATA
    ================================================= */

    Data.workspace =

        activeWorkspace;


    Data.sheets =

        result &&

        typeof result ===

            "object"

        ?

        result

        :

        {};


    Data.loaded =

        true;


    /* =================================================
       DEBUG
    ================================================= */

    console.log(

        "=========================================="

    );


    console.log(

        "===== GLOBAL INPUT DATA READY ====="

    );


    console.log(

        "Workspace:",

        Data.workspace

    );


    console.log(

        "Sheets:",

        Object.keys(

            Data.sheets

        )

    );


    console.log(

        "Data:",

        Data.sheets

    );


    console.log(

        "=========================================="

    );


    /* =================================================
       RETURN
    ================================================= */

    return Data;

}


/* =====================================================
   GET CURRENT WORKSPACE
===================================================== */

export function getWorkspace(){

    return Data.workspace;

}


/* =====================================================
   GET ALL SHEETS
===================================================== */

export function getSheets(){

    return {

        ...Data.sheets

    };

}


/* =====================================================
   GET ONE SHEET
===================================================== */

export function getSheet(

    sheetName

){

    if(

        !sheetName

    ){

        return {

            headers :

                [],

            data :

                []

        };

    }


    return (

        Data.sheets[

            sheetName

        ]

        ||

        {

            headers :

                [],

            data :

                []

        }

    );

}


/* =====================================================
   GET SHEET DATA
===================================================== */

export function getSheetData(

    sheetName

){

    const sheet =

        getSheet(

            sheetName

        );


    if(

        Array.isArray(

            sheet

        )

    ){

        return [

            ...sheet

        ];

    }


    if(

        Array.isArray(

            sheet.data

        )

    ){

        return [

            ...sheet.data

        ];

    }


    return [];

}


/* =====================================================
   GET SHEET HEADERS
===================================================== */

export function getSheetHeaders(

    sheetName

){

    const sheet =

        getSheet(

            sheetName

        );


    if(

        Array.isArray(

            sheet.headers

        )

    ){

        return [

            ...sheet.headers

        ];

    }


    return [];

}


/* =====================================================
   GET RAW INPUT DATA
===================================================== */

export function getData(){

    return {

        ...Data.sheets

    };

}


/* =====================================================
   LEGACY / COMPATIBILITY GETTERS
===================================================== */

/*
   Getter di bawah tetap dipertahankan
   supaya input module lama tidak langsung
   rusak saat migrasi.

   Sumber datanya TETAP generic.

   Nama sheet tidak lagi menentukan URL
   atau Spreadsheet ID.

   Workspace.js tetap menjadi sumber
   konfigurasi sheet.
*/


export function getKasMembers(){

    return getSheetData(

        "kas_member"

    );

}


export function getFinancialActivity(){

    return getSheetData(

        "financial_activity"

    );

}


export function getSavingBanks(){

    return getSheetData(

        "saving_bank"

    );

}


export function getPayrollDailyRules(){

    return getSheetData(

        "payroll_daily_rules"

    );

}


export function getPayrollMonthlyRules(){

    return getSheetData(

        "payroll_monthly_rules"

    );

}


/* =====================================================
   CLEAR
===================================================== */

export function clearInputData(){

    Data.workspace =

        null;


    Data.sheets =

        {};


    Data.loaded =

        false;


}


/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default Data;
