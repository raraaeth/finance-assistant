/* =====================================================
   Finance Assistant
   Module      : Google Sheets
   File        : sheets.js
   Version     : 2.0.0

   Description :
   Google Sheets Reader Engine

   Architecture :

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
   RAW / DATA

   Responsibility :

   - Membaca Google Spreadsheet
   - Membaca Google Sheet
   - Mengubah values menjadi object
   - Mengembalikan headers
   - Mengembalikan data

   Tidak menangani :

   - Login
   - Logout
   - Supabase Auth
   - Google OAuth
   - Finance Core creation
   - Workspace creation
   - Apps Script
   - Processing data
   - UI

===================================================== */


/* =====================================================
   CONFIG
===================================================== */

const SHEETS_API =

    "https://sheets.googleapis.com/v4";


/* =====================================================
   READ SHEET
===================================================== */

/*
   Contract :

       readSheet({

           accessToken,

           spreadsheetId,

           sheetName

       })


   Return :

       {

           headers : [],

           data : []

       }

*/


export async function readSheet({

    accessToken,

    spreadsheetId,

    sheetName

} = {}){

    console.log(

        "=========================================="

    );


    console.log(

        "===== GOOGLE SHEETS READ ====="

    );


    console.log(

        "=========================================="

    );


    /* =================================================
       VALIDATION
    ================================================= */

    if(

        !accessToken

    ){

        throw new Error(

            "Google Provider Token tidak ditemukan."

        );

    }


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


    /* =================================================
       DEBUG
    ================================================= */

    console.log(

        "Sheets API:",

        "Google Sheets API"

    );


    console.log(

        "Spreadsheet ID:",

        spreadsheetId

    );


    console.log(

        "Sheet:",

        sheetName

    );


    /* =================================================
       RANGE
    ================================================= */

    /*
       Gunakan A:Z untuk mempertahankan
       kompatibilitas dengan Apps Script
       versi sebelumnya.

       Jika nantinya ada sheet dengan
       kolom lebih dari Z, bisa diperluas.
    */

    const range =

        `${sheetName}!A:Z`;


    /* =================================================
       URL
    ================================================= */

    const url =

        SHEETS_API

        +

        "/spreadsheets/"

        +

        encodeURIComponent(

            spreadsheetId

        )

        +

        "/values/"

        +

        encodeURIComponent(

            range

        );


    console.log(

        "Google Sheets request dibuat."

    );


    /* =================================================
       REQUEST
    ================================================= */

    let response;


    try{

        response =

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

    }catch(error){

        console.error(

            "Google Sheets Network Error:",

            error

        );


        throw new Error(

            "Gagal menghubungi Google Sheets API."

        );

    }


    /* =================================================
       RESPONSE TEXT
    ================================================= */

    const text =

        await response.text();


    /* =================================================
       PARSE JSON
    ================================================= */

    let result;


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


    /* =================================================
       GOOGLE API ERROR
    ================================================= */

    if(

        !response.ok

    ){

        console.error(

            "=========================================="

        );


        console.error(

            "===== GOOGLE SHEETS API ERROR ====="

        );


        console.error(

            "=========================================="

        );


        console.error(

            "HTTP Status:",

            response.status

        );


        console.error(

            "Response:",

            result

        );


        const message =

            result
            ?.error
            ?.message

            ||

            `Google Sheets API Error ${response.status}`;


        throw new Error(

            message

        );

    }


    /* =================================================
       VALUES
    ================================================= */

    const values =

        Array.isArray(

            result?.values

        )

        ?

        result.values

        :

        [];


    console.log(

        "Google Sheets rows:",

        values.length

    );


    /* =================================================
       EMPTY SHEET
    ================================================= */

    if(

        !values.length

    ){

        console.log(

            `Sheet "${sheetName}" kosong.`

        );


        return {

            headers :

                [],


            data :

                []

        };

    }


    /* =================================================
       HEADER
    ================================================= */

    const headers =

        Array.isArray(

            values[0]

        )

        ?

        values[0].map(

            header =>

                String(

                    header

                    ??

                    ""

                ).trim()

        )

        :

        [];


    console.log(

        "Headers:",

        headers

    );


    /* =================================================
       DATA
    ================================================= */

    const data =

        values

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

                            /*
                               Header kosong tidak
                               digunakan sebagai key.
                            */

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


    /* =================================================
       DEBUG
    ================================================= */

    console.log(

        "Sheet:",

        sheetName

    );


    console.log(

        "Headers count:",

        headers.length

    );


    console.log(

        "Data count:",

        data.length

    );


    console.log(

        "Data:",

        data

    );


    /* =================================================
       SUCCESS
    ================================================= */

    console.log(

        "=========================================="

    );


    console.log(

        "===== GOOGLE SHEETS READ SUCCESS ====="

    );


    console.log(

        "=========================================="

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
   Helper untuk membaca beberapa sheet
   secara paralel.

   Tidak wajib digunakan oleh api.js,
   tetapi berguna untuk module lain
   nantinya.

   Contract :

       readSheets({

           accessToken,

           spreadsheetId,

           sheets : [

               "financial",

               "financial_activity"

           ]

       })


   Return :

       {

           financial : {

               headers : [],

               data : []

           },

           financial_activity : {

               headers : [],

               data : []

           }

       }

*/


export async function readSheets({

    accessToken,

    spreadsheetId,

    sheets = []

} = {}){

    if(

        !Array.isArray(

            sheets

        )

        ||

        !sheets.length

    ){

        return {};

    }


    console.log(

        "===== READ MULTIPLE SHEETS ====="

    );


    const results =

        await Promise.all(

            sheets.map(

                sheetName =>

                    readSheet({

                        accessToken,

                        spreadsheetId,

                        sheetName

                    })

                    .then(

                        result => ({

                            sheetName,

                            result

                        })

                    )

            )

        );


    const output = {};


    results.forEach(

        ({

            sheetName,

            result

        }) => {

            output[

                sheetName

            ] =

                result;

        }

    );


    return output;

}


/* =====================================================
   GET SHEET VALUES
===================================================== */

/*
   Versi low-level.

   Digunakan jika suatu saat module
   membutuhkan raw values asli dari
   Google Sheets API.

   Return :

       [

           ["Date", "jenis", "nominal"],

           ["2026-08-01", "masuk", "100000"]

       ]

*/


export async function getSheetValues({

    accessToken,

    spreadsheetId,

    sheetName

} = {}){

    if(

        !accessToken

    ){

        throw new Error(

            "Google Provider Token tidak ditemukan."

        );

    }


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


    const range =

        `${sheetName}!A:Z`;


    const url =

        SHEETS_API

        +

        "/spreadsheets/"

        +

        encodeURIComponent(

            spreadsheetId

        )

        +

        "/values/"

        +

        encodeURIComponent(

            range

        );


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


    let result;


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

            "Response Google Sheets tidak valid."

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


    return (

        Array.isArray(

            result?.values

        )

        ?

        result.values

        :

        []

    );

}


/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default {

    readSheet,

    readSheets,

    getSheetValues

};
