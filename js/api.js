/* =====================================================
   Finance Assistant
   Module      : API
   File        : api.js
   Version     : 4.0.0

   Description :
   Apps Script Module API Engine

   Sections :
   - Import
   - State
   - Session
   - Load
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadSession

} from "./auth.js";


/* =====================================================
   STATE
===================================================== */

export const API = {

    raw : [],

    data : []

};


/* =====================================================
   SESSION
===================================================== */

function getSpreadsheetId(){

    const session =

        loadSession();


    return (

        session
        ?.workspace
        ?.spreadsheet
        ?.id

        ||

        null

    );

}


/* =====================================================
   LOAD
===================================================== */

API.load = async function(

    endpoint,

    rawSheet,

    dataSheet

){

    /* =============================================
       Spreadsheet
    ============================================= */

    const spreadsheetId =

        getSpreadsheetId();


    if(

        !spreadsheetId

    ){

        throw new Error(

            "Finance Core Spreadsheet ID tidak ditemukan"

        );

    }


    /* =============================================
       Endpoint
    ============================================= */

    if(

        !endpoint

    ){

        throw new Error(

            "API endpoint tidak ditemukan"

        );

    }


    /* =============================================
       URLs
    ============================================= */

    const rawUrl =

        endpoint

        +

        "?action=module"

        +

        "&spreadsheetId="

        +

        encodeURIComponent(

            spreadsheetId

        )

        +

        "&sheet="

        +

        encodeURIComponent(

            rawSheet

        );


    const dataUrl =

        endpoint

        +

        "?action=module"

        +

        "&spreadsheetId="

        +

        encodeURIComponent(

            spreadsheetId

        )

        +

        "&sheet="

        +

        encodeURIComponent(

            dataSheet

        );


    console.log(

        "===== API LOAD ====="

    );


    console.log(

        "RAW URL:",

        rawUrl

    );


    console.log(

        "DATA URL:",

        dataUrl

    );


    /* =============================================
       Request
    ============================================= */

    const [

        rawResponse,

        dataResponse

    ] = await Promise.all([

        fetch(

            rawUrl

        ),

        fetch(

            dataUrl

        )

    ]);
   console.log(
    "===== API RESPONSE STATUS ====="
);

console.log(
    "RAW:",
    rawResponse.status,
    rawResponse.ok
);

console.log(
    "DATA:",
    dataResponse.status,
    dataResponse.ok
);


    /* =============================================
       Response Validation
    ============================================= */

    if(

        !rawResponse.ok

    ){

        throw new Error(

            `Raw API gagal: ${rawResponse.status}`

        );

    }


    if(

        !dataResponse.ok

    ){

        throw new Error(

            `Data API gagal: ${dataResponse.status}`

        );

    }


    /* =============================================
       JSON
    ============================================= */

    const rawResult =

        await rawResponse.json();


    const dataResult =

        await dataResponse.json();


    /* =============================================
       API Error
    ============================================= */

    if(

        rawResult.success !== true

    ){

        throw new Error(

            rawResult.error

            ||

            rawResult.message

            ||

            "Raw API gagal"

        );

    }


    if(

        dataResult.success !== true

    ){

        throw new Error(

            dataResult.error

            ||

            dataResult.message

            ||

            "Data API gagal"

        );

    }


    /* =============================================
       SAVE STATE
    ============================================= */

    API.raw =

        rawResult.data

        ||

        [];


    API.data =

        dataResult.data

        ||

        [];


    console.log(

        "API raw:",

        API.raw

    );


    console.log(

        "API data:",

        API.data

    );

};
