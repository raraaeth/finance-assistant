/* =====================================================
   Finance Assistant
   GLOBAL MODULE
   FILE        : sheets.js
   DESCRIPTION : Google Sheets Read Engine
   VERSION     : 1.0.0

   RESPONSIBILITY
   -----------------------------------------------------
   sheets.js hanya menangani:

   - Mendapatkan Google Provider Access Token
   - Mendapatkan Finance Core ID user
   - Membaca Google Sheets API
   - Mengembalikan RAW data

   TIDAK menangani:

   - Supabase Auth
   - Google OAuth
   - Create Workspace
   - Create Sheet
   - Input data
   - Update data
   - Delete data
   - processData()
   - Rendering UI

   FLOW
   -----------------------------------------------------

   User
      ↓
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
      ↓
   RAW

===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    getValidGoogleProviderToken

} from "./auth.js";


import {

    loadModuleInfo

} from "./module.js";


/* =====================================================
   CONFIG
===================================================== */

const SheetsConfig = {

    api :

        "https://sheets.googleapis.com/v4",

    defaultRange :

        "A:Z"

};


/* =====================================================
   GET FINANCE CORE
===================================================== */

/*
   Mengambil Finance Core milik user
   yang sedang login.

   Spreadsheet ID TIDAK disimpan
   di config.js.

   ID diperoleh dari module.js.
*/

function getFinanceCore(){

    const moduleInfo =

        loadModuleInfo();


    if(

        !moduleInfo

    ){

        throw new Error(

            "Module Info belum tersedia."

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

            "Finance Core belum tersedia."

        );

    }


    return financeCore;

}


/* =====================================================
   GET GOOGLE ACCESS TOKEN
===================================================== */

/*
   Menggunakan auth.js sebagai satu-satunya
   sumber Google Provider Token.

   Tidak membaca token dari localStorage
   secara langsung.

   auth.js yang bertanggung jawab:

   - session
   - local token
   - expiry
   - refresh token
   - automatic refresh
*/

async function getGoogleToken(){

    const token =

        await getValidGoogleProviderToken();


    if(

        !token

    ){

        throw new Error(

            "Google Provider Token tidak tersedia."

        );

    }


    return token;

}


/* =====================================================
   BUILD SHEETS URL
===================================================== */

function buildSheetsUrl(

    spreadsheetId,

    sheetName,

    range

){

    if(

        !spreadsheetId

    ){

        throw new Error(

            "Spreadsheet ID tidak ditemukan."

        );

    }


    if(

        !sheetName

    ){

        throw new Error(

            "Nama sheet tidak ditemukan."

        );

    }


    const targetRange =

        range

        ||

        SheetsConfig.defaultRange;


    /*
       Contoh:

       financial!A:Z

       menjadi:

       financial%21A%3AZ
    */

    const encodedRange =

        encodeURIComponent(

            `${sheetName}!${targetRange}`

        );


    return (

        SheetsConfig.api

        +

        "/spreadsheets/"

        +

        encodeURIComponent(

            spreadsheetId

        )

        +

        "/values/"

        +

        encodedRange

    );

}


/* =====================================================
   READ SHEET
===================================================== */

/*
   Fungsi utama READ.

   Contoh:

       const raw = await readSheet(
           "financial"
       );

   Return:

       [
           ["tanggal", "kategori", "nominal"],
           ["2026-08-01", "Makan", "25000"],
           ...
       ]

   Ini adalah RAW.

   Processing menjadi DATA dilakukan
   oleh module masing-masing.
*/

export async function readSheet(

    sheetName,

    options = {}

){

    console.log(

        "=========================================="

    );


    console.log(

        "===== GOOGLE SHEETS READ ====="

    );


    console.log(

        "=========================================="

    );


    try{

        /* =====================================
           FINANCE CORE
        ===================================== */

        const financeCore =

            getFinanceCore();


        const spreadsheetId =

            financeCore.id;


        console.log(

            "Finance Core:",

            spreadsheetId

        );


        /* =====================================
           GOOGLE TOKEN
        ===================================== */

        const accessToken =

            await getGoogleToken();


        console.log(

            "Google Provider Token:",

            accessToken

                ?

                "AVAILABLE"

                :

                "MISSING"

        );


        /* =====================================
           RANGE
        ===================================== */

        const range =

            options.range

            ||

            SheetsConfig.defaultRange;


        /* =====================================
           URL
        ===================================== */

        const url =

            buildSheetsUrl(

                spreadsheetId,

                sheetName,

                range

            );


        /*
           Jangan console.log URL.

           URL memang tidak mengandung token,
           tetapi tidak perlu memenuhi console
           dengan URL panjang.
        */

        console.log(

            "Sheet:",

            sheetName

        );


        console.log(

            "Range:",

            range

        );


        console.log(

            "Mengambil data dari Google Sheets..."

        );


        /* =====================================
           REQUEST
        ===================================== */

        const response =

            await fetch(

                url,

                {

                    method :

                        "GET",

                    headers : {

                        Authorization :

                            `Bearer ${accessToken}`

                    }

                }

            );


        /* =====================================
           RESPONSE TEXT
        ===================================== */

        const text =

            await response.text();


        let result =

            null;


        try{

            result =

                text

                ?

                JSON.parse(

                    text

                )

                :

                null;

        }catch(error){

            console.error(

                "Google Sheets Raw Response:",

                text

            );


            throw new Error(

                "Response Google Sheets bukan JSON yang valid."

            );

        }


        /* =====================================
           GOOGLE API ERROR
        ===================================== */

        if(

            !response.ok

        ){

            console.error(

                "Google Sheets API Error:",

                result

            );


            /*
               Token mungkin sudah expired
               walaupun auth.js menganggap
               token masih valid.

               Untuk tahap pertama ini kita
               belum melakukan retry otomatis.

               Retry akan kita tambahkan setelah
               READ dasar berhasil.
            */

            throw new Error(

                result
                ?.error
                ?.message

                ||

                `Google Sheets API Error ${response.status}`

            );

        }


        /* =====================================
           VALUES
        ===================================== */

        const raw =

            Array.isArray(

                result?.values

            )

            ?

            result.values

            :

            [];


        /* =====================================
           DEBUG
        ===================================== */

        console.log(

            "Google Sheets READ SUCCESS."

        );


        console.log(

            "Spreadsheet:",

            spreadsheetId

        );


        console.log(

            "Sheet:",

            sheetName

        );


        console.log(

            "RAW rows:",

            raw.length

        );


        console.log(

            "RAW:",

            raw

        );


        console.log(

            "=========================================="

        );


        return raw;


    }catch(error){

        console.error(

            "=========================================="

        );


        console.error(

            "===== GOOGLE SHEETS READ FAILED ====="

        );


        console.error(

            "=========================================="

        );


        console.error(

            "Sheet:",

            sheetName

        );


        console.error(

            "Error:",

            error

        );


        console.error(

            "Message:",

            error?.message

        );


        throw error;

    }

}


/* =====================================================
   READ SHEET OBJECT
===================================================== */

/*
   Helper untuk module yang ingin langsung
   mendapatkan:

   {
       headers : [...],
       data : [...]
   }

   Tetapi ini tetap BUKAN processData
   module.

   Fungsi ini hanya mengubah format
   Google Sheets values menjadi object.

   Contoh RAW:

       [
           ["date", "amount"],
           ["2026-08-01", "10000"]
       ]

   menjadi:

       {
           headers : [
               "date",
               "amount"
           ],

           data : [
               {
                   date : "2026-08-01",
                   amount : "10000"
               }
           ]
       }
*/

export async function readSheetObject(

    sheetName,

    options = {}

){

    const raw =

        await readSheet(

            sheetName,

            options

        );


    if(

        !raw.length

    ){

        return {

            headers :

                [],

            data :

                []

        };

    }


    const headers =

        raw[0]

            .map(

                header =>

                    String(

                        header

                        ??

                        ""

                    ).trim()

            );


    const data =

        raw

            .slice(

                1

            )

            .map(

                row => {

                    const item = {};


                    headers.forEach(

                        (

                            header,

                            index

                        ) => {

                            if(

                                !header

                            ){

                                return;

                            }


                            item[

                                header

                            ] =

                                row[index]

                                !==

                                undefined

                                ?

                                row[index]

                                :

                                "";

                        }

                    );


                    return item;

                }

            );


    console.log(

        "Sheet Object Data:",

        data

    );


    return {

        headers :

            headers,

        data :

            data

    };

}


/* =====================================================
   READ MULTIPLE SHEETS
===================================================== */

/*
   Digunakan jika suatu module membutuhkan
   lebih dari satu sheet.

   Contoh:

       const result = await readSheets({

           main :
               "financial",

           activity :
               "financial_activity"

       });

   Return:

       {
           main : [...],
           activity : [...]
       }

   Setiap property tetap RAW.
*/

export async function readSheets(

    sheets,

    options = {}

){

    if(

        !sheets

        ||

        typeof sheets !== "object"

    ){

        throw new Error(

            "Daftar sheet tidak valid."

        );

    }


    const entries =

        Object.entries(

            sheets

        );


    const result = {};


    for(

        const [

            key,

            sheetName

        ]

        of

        entries

    ){

        result[key] =

            await readSheet(

                sheetName,

                options

            );

    }


    return result;

}


/* =====================================================
   GET SHEET METADATA
===================================================== */

/*
   Helper opsional.

   Digunakan jika suatu saat kita perlu
   mengetahui daftar sheet yang ada
   di Finance Core.

   Ini masih READ ONLY.

   Tidak mengubah spreadsheet.
*/

export async function getSheets(){

    console.log(

        "===== GET GOOGLE SHEETS ====="

    );


    const financeCore =

        getFinanceCore();


    const accessToken =

        await getGoogleToken();


    const url =

        SheetsConfig.api

        +

        "/spreadsheets/"

        +

        encodeURIComponent(

            financeCore.id

        )

        +

        "?fields=spreadsheetId,properties.title,sheets.properties";


    const response =

        await fetch(

            url,

            {

                method :

                    "GET",

                headers : {

                    Authorization :

                        `Bearer ${accessToken}`

                }

            }

        );


    const text =

        await response.text();


    let result =

        null;


    try{

        result =

            text

            ?

            JSON.parse(

                text

            )

            :

            null;

    }catch(error){

        throw new Error(

            "Response Google Sheets metadata tidak valid."

        );

    }


    if(

        !response.ok

    ){

        throw new Error(

            result
            ?.error
            ?.message

            ||

            `Google Sheets API Error ${response.status}`

        );

    }


    const sheets =

        result?.sheets

        ||

        [];


    return sheets

        .map(

            sheet =>

                sheet
                ?.properties
                ?.title

        )

        .filter(

            Boolean

        );

}


/* =====================================================
   EXPORT CONFIG
===================================================== */

export {

    SheetsConfig

};
