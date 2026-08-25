/* =====================================================
   Finance Assistant
   Module      : API
   File        : api.js
   Version     : 4.2.0

   Description :
   Apps Script Module API Engine

   Request Method :
   JSONP

   Update :
   • Kirim accessToken ke Apps Script
   • Kompatibel dengan getModuleData()
   • RAW/DATA menggunakan Google Sheets API

   Reason :
   Apps Script Web App tidak dapat
   di-fetch langsung dari GitHub Pages
   karena CORS.

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

function getSession(){

    return loadSession();

}


/* =====================================================
   SPREADSHEET ID
===================================================== */

function getSpreadsheetId(){

    const session =

        getSession();


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
   ACCESS TOKEN
===================================================== */

function getAccessToken(){

    const session =

        getSession();


    return (

        session
        ?.token
        ?.accessToken

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


    /* =============================================
       SESSION
    ============================================= */

    const session =

        getSession();


    /* =============================================
       SPREADSHEET
    ============================================= */

    const spreadsheetId =

        session
        ?.workspace
        ?.spreadsheet
        ?.id

        ||

        null;


    if(

        !spreadsheetId

    ){

        throw new Error(

            "Finance Core Spreadsheet ID tidak ditemukan"

        );

    }


    /* =============================================
       ACCESS TOKEN
    ============================================= */

    const accessToken =

        session
        ?.token
        ?.accessToken

        ||

        null;


    if(

        !accessToken

    ){

        throw new Error(

            "Access Token tidak ditemukan"

        );

    }


    /* =============================================
       ENDPOINT
    ============================================= */

    if(

        !endpoint

    ){

        throw new Error(

            "API endpoint tidak ditemukan"

        );

    }


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
       DEBUG
    ============================================= */

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

            "Raw API response kosong"

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

            "Raw API gagal"

        );

    }


    /* =============================================
       VALIDATE DATA RESPONSE
    ============================================= */

    if(

        !dataResult

    ){

        throw new Error(

            "Data API response kosong"

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
       SAVE RAW
    ============================================= */

    API.raw =

        rawResult.data

        ||

        [];


    /* =============================================
       SAVE DATA
    ============================================= */

    API.data =

        dataResult.data

        ||

        [];


    /* =============================================
       DEBUG
    ============================================= */

    console.log(

        "===== API LOAD SUCCESS ====="

    );


    console.log(

        "API raw:",

        API.raw

    );


    console.log(

        "API data:",

        API.data

    );


    /* =============================================
       RETURN

       Optional return agar module
       yang memanggil API.load()
       juga bisa menggunakan hasilnya.
    ============================================= */

    return {

        success : true,

        raw :

            API.raw,

        data :

            API.data

    };

};
