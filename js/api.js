/* =====================================================
   Finance Assistant
   Module      : API
   File        : api.js
   Version     : 6.0.0

   Description :
   Global Google Sheets API Engine

   MIGRATION :

   SEBELUM :

   auth.js
       ↓
   Google Provider Token
       ↓
   module.js
       ↓
   Finance Core ID
       ↓
   Apps Script
       ↓
   Google Sheets


   SEKARANG :

   auth.js
       ↓
   Google Provider Token
       ↓
   module.js
       ↓
   Finance Core ID
       ↓
   sheets.js
       ↓
   Google Sheets API


   RESPONSIBILITY :

   - Mendapatkan session
   - Mendapatkan Finance Core
   - Mendapatkan Google Provider Token
   - Membaca RAW sheet
   - Membaca DATA sheet
   - Menyimpan API.raw
   - Menyimpan API.data

   TIDAK MENANGANI :

   - Authentication
   - Login
   - Logout
   - Create Workspace
   - Create Sheet
   - Processing data
   - Rules
   - UI

===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadSession,

    getValidGoogleProviderToken

} from "./auth.js";


import {

    loadModuleInfo

} from "./module.js";


import {

    readSheet

} from "./sheets.js";


/* =====================================================
   STATE
===================================================== */

export const API = {

    raw :

        [],

    data :

        []

};


/* =====================================================
   SESSION
===================================================== */

async function getSession(){

    console.log(

        "API: Mengambil Supabase session..."

    );


    const session =

        await loadSession();


    if(

        !session

    ){

        throw new Error(

            "Session tidak ditemukan. Silakan login."

        );

    }


    console.log(

        "API: Session tersedia."

    );


    return session;

}


/* =====================================================
   FINANCE CORE
===================================================== */

function getFinanceCore(){

    const moduleInfo =

        loadModuleInfo();


    console.log(

        "API: Finance Module Info:",

        moduleInfo

    );


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

    ){

        throw new Error(

            "Finance Core tidak ditemukan."

        );

    }


    if(

        !financeCore.id

    ){

        throw new Error(

            "Finance Core Spreadsheet ID tidak ditemukan."

        );

    }


    console.log(

        "API: Finance Core:",

        financeCore

    );


    return financeCore;

}


/* =====================================================
   SPREADSHEET ID
===================================================== */

function getSpreadsheetId(){

    const financeCore =

        getFinanceCore();


    return financeCore.id;

}


/* =====================================================
   GOOGLE PROVIDER TOKEN
===================================================== */

async function getAccessToken(){

    console.log(

        "API: Meminta Google Provider Token..."

    );


    const token =

        await getValidGoogleProviderToken();


    if(

        !token

    ){

        throw new Error(

            "Google Provider Token tidak tersedia."

        );

    }


    console.log(

        "API: Google Provider Token: AVAILABLE"

    );


    return token;

}


/* =====================================================
   READ SHEET
===================================================== */

/*
   Semua pembacaan Sheet sekarang
   diarahkan ke sheets.js.

   sheets.js menangani :

   Google Sheets API
   Authorization
   Spreadsheet ID
   Sheet name
   Response parsing
*/


async function readData(

    accessToken,

    spreadsheetId,

    sheetName

){

    if(

        !sheetName

    ){

        throw new Error(

            "Nama sheet tidak ditemukan."

        );

    }


    console.log(

        "API: Membaca sheet:",

        sheetName

    );


    const result =

        await readSheet({

            accessToken :

                accessToken,

            spreadsheetId :

                spreadsheetId,

            sheetName :

                sheetName

        });


    if(

        !result

    ){

        throw new Error(

            `Response sheet "${sheetName}" kosong.`

        );

    }


    return result;

}


/* =====================================================
   NORMALIZE SHEET RESULT
===================================================== */

/*
   Google Sheets API menghasilkan :

   {
       headers : [],
       data : []
   }

   Tetapi kita juga mengantisipasi
   sheets.js mengembalikan langsung
   array data.

*/

function normalizeSheetResult(

    result

){

    /* =============================================
       ARRAY LANGSUNG
    ============================================= */

    if(

        Array.isArray(

            result

        )

    ){

        return {

            headers :

                [],

            data :

                result

        };

    }


    /* =============================================
       OBJECT
    ============================================= */

    if(

        typeof result !==

        "object"

        ||

        result === null

    ){

        return {

            headers :

                [],

            data :

                []

        };

    }


    return {

        headers :

            Array.isArray(

                result.headers

            )

            ?

            result.headers

            :

            [],


        data :

            Array.isArray(

                result.data

            )

            ?

            result.data

            :

            []

    };

}


/* =====================================================
   LOAD
===================================================== */

/*
   Interface lama tetap dipertahankan :

       API.load(

           endpoint,

           rawSheet,

           dataSheet

       )

   Parameter endpoint sekarang
   tidak lagi digunakan untuk READ.

   Kenapa tetap dipertahankan?

   Agar module lama tidak rusak
   selama proses migrasi.

   Nantinya parameter endpoint
   dapat dihapus setelah seluruh
   module selesai dimigrasikan.
*/


API.load = async function(

    rawSheet,

    dataSheet

){

    console.log(

        "=========================================="

    );


    console.log(

        "===== API LOAD — GOOGLE SHEETS API ====="

    );


    console.log(

        "=========================================="

    );


    /* =================================================
       SESSION
    ================================================= */

    const session =

        await getSession();


    console.log(

        "API: Supabase User:",

        session.user?.email

        ||

        session.user?.id

        ||

        "UNKNOWN"

    );


    /* =================================================
       FINANCE CORE
    ================================================= */

    const spreadsheetId =

        getSpreadsheetId();


    console.log(

        "API: Finance Core ID:",

        spreadsheetId

    );


    /* =================================================
       GOOGLE TOKEN
    ================================================= */

    const accessToken =

        await getAccessToken();


    /* =================================================
       VALIDATE RAW SHEET
    ================================================= */

    if(

        !rawSheet

    ){

        throw new Error(

            "Raw sheet tidak ditemukan."

        );

    }


    /* =================================================
       VALIDATE DATA SHEET
    ================================================= */

    if(

        !dataSheet

    ){

        throw new Error(

            "Data sheet tidak ditemukan."

        );

    }


    /* =================================================
       DEBUG CONFIG
    ================================================= */

    console.log(

        "=========================================="

    );


    console.log(

        "API CONFIG"

    );


    console.log(

        "Finance Core:",

        spreadsheetId

    );


    console.log(

        "RAW Sheet:",

        rawSheet

    );


    console.log(

        "DATA Sheet:",

        dataSheet

    );


    console.log(

        "=========================================="

    );


    /* =================================================
       READ RAW + DATA
    ================================================= */

    /*
       Dibaca paralel supaya lebih cepat.

       Tidak ada lagi :

           Apps Script JSONP
               ↓
           Google Sheets API

       Sekarang langsung :

           Google Sheets API
               ↓
           RAW
           
           Google Sheets API
               ↓
           DATA
    */


    const [

        rawResult,

        dataResult

    ] = await Promise.all([

        readData(

            accessToken,

            spreadsheetId,

            rawSheet

        ),


        readData(

            accessToken,

            spreadsheetId,

            dataSheet

        )

    ]);


    /* =================================================
       NORMALIZE RESULT
    ================================================= */

    const normalizedRaw =

        normalizeSheetResult(

            rawResult

        );


    const normalizedData =

        normalizeSheetResult(

            dataResult

        );


    /* =================================================
       SAVE RAW
    ================================================= */

    API.raw =

        normalizedRaw.data;


    /* =================================================
       SAVE DATA
    ================================================= */

    API.data =

        normalizedData.data;


    /* =================================================
       DEBUG RESPONSE
    ================================================= */

    console.log(

        "=========================================="

    );


    console.log(

        "===== API RESPONSE ====="

    );


    console.log(

        "RAW Headers:",

        normalizedRaw.headers

    );


    console.log(

        "RAW Result:",

        normalizedRaw.data

    );


    console.log(

        "RAW Count:",

        API.raw.length

    );


    console.log(

        "DATA Headers:",

        normalizedData.headers

    );


    console.log(

        "DATA Result:",

        normalizedData.data

    );


    console.log(

        "DATA Count:",

        API.data.length

    );


    console.log(

        "=========================================="

    );


    /* =================================================
       SUCCESS
    ================================================= */

    console.log(

        "===== API LOAD SUCCESS ====="

    );


    return {

        success :

            true,


        spreadsheetId :

            spreadsheetId,


        rawSheet :

            rawSheet,


        dataSheet :

            dataSheet,


        rawHeaders :

            normalizedRaw.headers,


        dataHeaders :

            normalizedData.headers,


        raw :

            API.raw,


        data :

            API.data

    };

};


/* =====================================================
   GET RAW
===================================================== */

export function getRaw(){

    return API.raw;

}


/* =====================================================
   GET DATA
===================================================== */

export function getData(){

    return API.data;

}


/* =====================================================
   CLEAR
===================================================== */

export function clear(){

    API.raw =

        [];

    API.data =

        [];

}


/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default API;
