/* =====================================================
   Finance Assistant
   Module      : API
   File        : api.js
   Version     : 5.0.0

   Description :
   Apps Script Module API Engine

   Request Method :
   JSONP

   Architecture :

   auth.js
       ↓
   Google Provider Token

   module.js
       ↓
   Finance Core ID

   api.js
       ↓
   Apps Script
       ↓
   Google Sheets

   Update :
   • Finance Core diambil dari module.js
   • Google Provider Token diambil dari auth.js
   • Tidak lagi menggunakan session.workspace.spreadsheet
   • Tidak lagi menggunakan session.token.accessToken
   • loadSession() diperlakukan sebagai async
   • RAW / DATA tetap menggunakan Apps Script JSONP

===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadSession,

    getGoogleProviderToken

} from "./auth.js";


import {

    loadModuleInfo

} from "./module.js";


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

async function getSession(){

    return await loadSession();

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

        return null;

    }


    if(

        !moduleInfo.financeCore

    ){

        return null;

    }


    if(

        !moduleInfo.financeCore.id

    ){

        return null;

    }


    return moduleInfo.financeCore;

}


/* =====================================================
   SPREADSHEET ID
===================================================== */

function getSpreadsheetId(){

    const financeCore =

        getFinanceCore();


    return (

        financeCore?.id

        ||

        null

    );

}


/* =====================================================
   GOOGLE PROVIDER TOKEN
===================================================== */

async function getAccessToken(){

    const token =

        await getGoogleProviderToken();


    return (

        token

        ||

        null

    );

}


/* =====================================================
   JSONP REQUEST

   Digunakan untuk request ke
   Google Apps Script tanpa CORS.

===================================================== */

function jsonpRequest(

    url

){

    return new Promise(

        (

            resolve,

            reject

        ) => {


            /* =============================================
               CALLBACK NAME
            ============================================= */

            const callbackName =

                "__financeAssistantApi_"

                +

                Date.now()

                +

                "_"

                +

                Math.random()

                .toString(

                    36

                )

                .slice(

                    2

                );


            /* =============================================
               SCRIPT
            ============================================= */

            const script =

                document.createElement(

                    "script"

                );


            /* =============================================
               TIMEOUT
            ============================================= */

            const timeout =

                setTimeout(

                    () => {

                        cleanup();


                        reject(

                            new Error(

                                "Request API terlalu lama"

                            )

                        );

                    },

                    30000

                );


            /* =============================================
               CALLBACK
            ============================================= */

            window[

                callbackName

            ] = function(

                data

            ){

                cleanup();


                resolve(

                    data

                );

            };


            /* =============================================
               ERROR
            ============================================= */

            script.onerror = function(){

                cleanup();


                reject(

                    new Error(

                        "Gagal menghubungi Apps Script"

                    )

                );

            };


            /* =============================================
               CLEANUP
            ============================================= */

            function cleanup(){


                clearTimeout(

                    timeout

                );


                if(

                    window[

                        callbackName

                    ]

                ){

                    delete window[

                        callbackName

                    ];

                }


                if(

                    script.parentNode

                ){

                    script.remove();

                }

            }


            /* =============================================
               BUILD URL
            ============================================= */

            const separator =

                url.includes(

                    "?"

                )

                ?

                "&"

                :

                "?";


            script.src =

                url

                +

                separator

                +

                "callback="

                +

                encodeURIComponent(

                    callbackName

                );


            /* =============================================
               DEBUG
            ============================================= */

            console.log(

                "JSONP Request:",

                script.src

            );


            /* =============================================
               SEND
            ============================================= */

            document.head.appendChild(

                script

            );

        }

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

    console.log(

        "=========================================="

    );


    console.log(

        "===== API LOAD ====="

    );


    console.log(

        "=========================================="

    );


    /* =============================================
       SESSION
    ============================================= */

    const session =

        await getSession();


    console.log(

        "API: Session:",

        session

    );


    if(

        !session

    ){

        throw new Error(

            "Session tidak ditemukan. Silakan login."

        );

    }


    /* =============================================
       FINANCE CORE
    ============================================= */

    const spreadsheetId =

        getSpreadsheetId();


    console.log(

        "API: Finance Core ID:",

        spreadsheetId

    );


    if(

        !spreadsheetId

    ){

        throw new Error(

            "Finance Core Spreadsheet ID tidak ditemukan."

        );

    }


    /* =============================================
       GOOGLE PROVIDER TOKEN
    ============================================= */

    const accessToken =

        await getAccessToken();


    console.log(

        "API: Google Provider Token:",

        accessToken

        ?

        "AVAILABLE"

        :

        "MISSING"

    );


    if(

        !accessToken

    ){

        throw new Error(

            "Google Provider Token tidak ditemukan. Silakan login ulang."

        );

    }


    /* =============================================
       ENDPOINT
    ============================================= */

    if(

        !endpoint

    ){

        throw new Error(

            "API endpoint tidak ditemukan."

        );

    }


    /* =============================================
       RAW SHEET
    ============================================= */

    if(

        !rawSheet

    ){

        throw new Error(

            "Raw sheet tidak ditemukan."

        );

    }


    /* =============================================
       DATA SHEET
    ============================================= */

    if(

        !dataSheet

    ){

        throw new Error(

            "Data sheet tidak ditemukan."

        );

    }


    /* =============================================
       DEBUG CONFIG
    ============================================= */

    console.log(

        "API Endpoint:",

        endpoint

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

        "Finance Core:",

        spreadsheetId

    );


    /* =============================================
       RAW URL
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

        )

        +

        "&accessToken="

        +

        encodeURIComponent(

            accessToken

        );


    /* =============================================
       DATA URL
    ============================================= */

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

        )

        +

        "&accessToken="

        +

        encodeURIComponent(

            accessToken

        );


    /* =============================================
       DEBUG URL
    ============================================= */

    console.log(

        "RAW URL:",

        rawUrl

    );


    console.log(

        "DATA URL:",

        dataUrl

    );


    /* =============================================
       REQUEST

       Menggunakan JSONP.

       Tidak menggunakan fetch()
       agar tidak terkena CORS.
    ============================================= */

    const [

        rawResult,

        dataResult

    ] = await Promise.all([

        jsonpRequest(

            rawUrl

        ),

        jsonpRequest(

            dataUrl

        )

    ]);


    /* =============================================
       DEBUG RESPONSE
    ============================================= */

    console.log(

        "=========================================="

    );


    console.log(

        "===== API RESPONSE ====="

    );


    console.log(

        "RAW RESULT:",

        rawResult

    );


    console.log(

        "DATA RESULT:",

        dataResult

    );


    /* =============================================
       VALIDATE RAW RESPONSE
    ============================================= */

    if(

        !rawResult

    ){

        throw new Error(

            "Raw API response kosong."

        );

    }


    if(

        rawResult.success !== true

    ){

        throw new Error(

            rawResult.error

            ||

            rawResult.message

            ||

            "Raw API gagal."

        );

    }


    /* =============================================
       VALIDATE DATA RESPONSE
    ============================================= */

    if(

        !dataResult

    ){

        throw new Error(

            "Data API response kosong."

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

            "Data API gagal."

        );

    }


    /* =============================================
       SAVE RAW
    ============================================= */

    API.raw =

        Array.isArray(

            rawResult.data

        )

        ?

        rawResult.data

        :

        [];


    /* =============================================
       SAVE DATA
    ============================================= */

    API.data =

        Array.isArray(

            dataResult.data

        )

        ?

        dataResult.data

        :

        [];


    /* =============================================
       DEBUG DATA
    ============================================= */

    console.log(

        "===== API LOAD SUCCESS ====="

    );


    console.log(

        "API raw:",

        API.raw

    );


    console.log(

        "API raw count:",

        API.raw.length

    );


    console.log(

        "API data:",

        API.data

    );


    console.log(

        "API data count:",

        API.data.length

    );


    /* =============================================
       RETURN
    ============================================= */

    return {

        success :

            true,


        raw :

            API.raw,


        data :

            API.data

    };

};
