/* =====================================================
   Finance Assistant
   Module      : Workspace
   File        : workspace.js
   Version     : 4.3.0

   Description :
   Workspace Controller

   Workspace Logic :

   exists
   = workspace sudah dibuat
     dan sheet yang diperlukan tersedia.

   active
   = workspace yang sedang dipilih user
     di local storage.

   Workspace yang belum dibuat
   tidak boleh dijalankan.

===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadWorkspace,

    saveWorkspace

} from "./storage.js";


import {

    loadSession

} from "./auth.js";


import * as Saving from

    "../pages/saving/home.js";


import * as Kas from

    "../pages/kas/home.js";


import * as PayrollMonthly from

    "../pages/payroll-monthly/home.js";


import * as PayrollDaily from

    "../pages/payroll-daily/home.js";


import * as Financial from

    "../pages/financial/home.js";


import * as Airdrop from

    "../pages/airdrop/home.js";


/* =====================================================
   CONFIG
===================================================== */

const API_URL =

    "https://script.google.com/macros/s/AKfycbxBiQSb1pioB0mDbkAqd6S3y4T5CTByn2-6kW7-T1l-5PdGYTBVDX4IXskxyu_QxokHDw/exec";


/* =====================================================
   MODULE REGISTRY
===================================================== */

const WORKSPACE = {

    financial:

        Financial,


    saving:

        Saving,


    kas:

        Kas,


    "payroll-daily":

        PayrollDaily,


    "payroll-monthly":

        PayrollMonthly,


    airdrop:

        Airdrop

};


/* =====================================================
   SESSION MODULES
===================================================== */

function getModules(){

    const session =

        loadSession();


    return (

        session
        ?.workspace
        ?.modules

        ||

        {}

    );

}


/* =====================================================
   ACTIVE WORKSPACE
===================================================== */

function getActiveWorkspace(){

    const workspace =

        loadWorkspace();


    return (

        workspace
        ?.workspace

        ||

        null

    );

}


/* =====================================================
   GET API URL
===================================================== */

function getApiUrl(){

    return API_URL;

}


/* =====================================================
   GET ACCESS TOKEN
===================================================== */

function getAccessToken(){

    const session =

        loadSession();


    return (

        session
        ?.token
        ?.accessToken

        ||

        session
        ?.token
        ?.access_token

        ||

        null

    );

}


/* =====================================================
   GET SPREADSHEET ID
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

        session
        ?.workspace
        ?.spreadsheetId

        ||

        null

    );

}


/* =====================================================
   JSONP REQUEST
===================================================== */
function jsonpRequest(

    params = {}

){

    return new Promise(

        (

            resolve,

            reject

        ) => {


            const callbackName =

                "__financeAssistantWorkspace_"

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


            const script =

                document.createElement(

                    "script"

                );


            const requestParams =

                new URLSearchParams();


            let timeout =

                null;


            /* =============================================
               ADD PARAMS
            ============================================= */

            Object.entries(

                params

            )

            .forEach(

                ([

                    key,

                    value

                ]) => {

                    if(

                        value !== undefined

                        &&

                        value !== null

                    ){

                        requestParams.set(

                            key,

                            value

                        );

                    }

                }

            );


            /* =============================================
               CALLBACK
            ============================================= */

            requestParams.set(

                "callback",

                callbackName

            );


            /* =============================================
               CLEANUP
            ============================================= */

            const cleanup = () => {

                if(

                    timeout

                ){

                    clearTimeout(

                        timeout

                    );

                }


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

            };


            /* =============================================
               REGISTER CALLBACK
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
               SCRIPT ERROR
            ============================================= */

            script.onerror = function(){

                cleanup();


                reject(

                    new Error(

                        "Gagal menghubungi Finance Assistant API"

                    )

                );

            };


            /* =============================================
               TIMEOUT
            ============================================= */

            timeout =

                setTimeout(

                    () => {

                        cleanup();


                        reject(

                            new Error(

                                "Request ke server timeout"

                            )

                        );

                    },

                    30000

                );


            /* =============================================
               BUILD URL
            ============================================= */

            script.src =

                getApiUrl()

                +

                "?"

                +

                requestParams.toString();


            /* =============================================
               SEND REQUEST
            ============================================= */

            document.head.appendChild(

                script

            );

        }

    );

}



/* =====================================================
   UPDATE SESSION
===================================================== */

function updateSession(

    updater

){

    const session =

        loadSession();


    if(

        !session

    ){

        throw new Error(

            "Session tidak ditemukan"

        );

    }


    const updated =

        updater(

            session

        );


    localStorage.setItem(

        "finance_session",

        JSON.stringify(

            updated

        )

    );


    return updated;

}


/* =====================================================
   REFRESH MODULES

   Mengambil status terbaru seluruh module
   dari Finance Core Spreadsheet.
===================================================== */

export async function refreshModules(){

    const accessToken =

        getAccessToken();


    const spreadsheetId =

        getSpreadsheetId();


    /* =============================================
       VALIDATION
    ============================================= */

    if(

        !accessToken

    ){

        throw new Error(

            "Access Token tidak ditemukan"

        );

    }


    if(

        !spreadsheetId

    ){

        throw new Error(

            "Finance Core Spreadsheet ID tidak ditemukan"

        );

    }


    /* =============================================
       REQUEST
    ============================================= */

    const result =

        await jsonpRequest({

            action:

                "modules",


            accessToken:

                accessToken,


            spreadsheetId:

                spreadsheetId

        });


    /* =============================================
       VALIDATE RESPONSE
    ============================================= */

    if(

        !result

    ){

        throw new Error(

            "Response modules kosong"

        );

    }


    if(

        !result.success

    ){

        throw new Error(

            result.error

            ||

            "Gagal mengambil data module"

        );

    }


    /* =============================================
       UPDATE SESSION
    ============================================= */

    updateSession(

        session => ({

            ...session,


            workspace:{

                ...(

                    session.workspace

                    ||

                    {}
                ),


                modules:

                    result.modules

                    ||

                    {}

            }

        })

    );


    return result.modules;

}


/* =====================================================
   CREATE WORKSPACE

   Membuat sheet module baru
   di Finance Core Spreadsheet.
===================================================== */

export async function createWorkspace(

    moduleKey

){

    /* =============================================
       VALIDATION
    ============================================= */

    if(

        !moduleKey

    ){

        throw new Error(

            "Module Key tidak ditemukan"

        );

    }


    const accessToken =

        getAccessToken();


    const spreadsheetId =

        getSpreadsheetId();


    if(

        !accessToken

    ){

        throw new Error(

            "Access Token tidak ditemukan"

        );

    }


    if(

        !spreadsheetId

    ){

        throw new Error(

            "Finance Core Spreadsheet ID tidak ditemukan"

        );

    }


    console.log(

        "===== CREATE WORKSPACE ====="

    );


    console.log(

        "Module:",

        moduleKey

    );


    /* =============================================
       REQUEST API
    ============================================= */

    const result =

        await jsonpRequest({

            action:

                "createModule",


            accessToken:

                accessToken,


            spreadsheetId:

                spreadsheetId,


            module:

                moduleKey

        });


    console.log(

        "Create Workspace Response:",

        result

    );


    /* =============================================
       VALIDATE RESPONSE
    ============================================= */

    if(

        !result

    ){

        throw new Error(

            "Response create workspace kosong"

        );

    }


    if(

        !result.success

    ){

        throw new Error(

            result.error

            ||

            "Gagal membuat workspace"

        );

    }


    /* =============================================
       UPDATE SESSION MODULES

       Backend module.gs mengembalikan
       status modules terbaru.
    ============================================= */

    if(

        result.modules

    ){

        updateSession(

            session => ({

                ...session,


                workspace:{

                    ...(

                        session.workspace

                        ||

                        {}
                    ),


                    modules:

                        result.modules

                }

            })

        );

    }


    /* =============================================
       FALLBACK

       Jika backend belum mengembalikan
       modules, lakukan refresh manual.
    ============================================= */

    else{

        await refreshModules();

    }


    /* =============================================
       SET ACTIVE WORKSPACE

       Workspace yang baru dibuat
       langsung menjadi aktif.
    ============================================= */

    const current =

        loadWorkspace()

        ||

        {};


    saveWorkspace({

        ...current,


        workspace:

            moduleKey

    });


    console.log(

        "Workspace berhasil dibuat:",

        moduleKey

    );


    return result;

}


/* =====================================================
   WORKSPACE VALIDATION

   exists hanya menentukan apakah
   workspace benar-benar sudah dibuat.

   active workspace ditentukan oleh
   workspace yang dipilih user
   melalui local storage.
===================================================== */

function workspaceExists(

    moduleName

){

    const modules =

        getModules();


    return (

        modules
        ?.[moduleName]
        ?.exists

        === true

    );

}


/* =====================================================
   INIT WORKSPACE
===================================================== */

export async function initWorkspace(){

    const active =

        getActiveWorkspace();


    /* =============================================
       NO ACTIVE WORKSPACE
    ============================================= */

    if(

        !active

    ){

        console.log(

            "Belum ada workspace yang dipilih."

        );

        return;

    }


    /* =============================================
       MODULE NOT FOUND
    ============================================= */

    const module =

        WORKSPACE[active];


    if(

        !module

    ){

        console.warn(

            `Module "${active}" tidak ditemukan.`

        );

        return;

    }


    /* =============================================
       WORKSPACE NOT CREATED
    ============================================= */

    if(

        !workspaceExists(

            active

        )

    ){

        console.warn(

            `Workspace "${active}" belum dibuat.`

        );

        return;

    }


    /* =============================================
       START MODULE
    ============================================= */

    console.log(

        "Workspace aktif:",

        active

    );


    await module.init();

}


/* =====================================================
   START
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initWorkspace

);
