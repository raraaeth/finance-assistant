/* =====================================================
   Finance Assistant
   Module      : WRITE
   File        : write.js
   Version     : 1.1.0

   Description :
   Global Google Apps Script WRITE Engine

   Flow :

   INPUT
       ↓
   write.js
       ↓
   Apps Script
       ↓
   main.gs
       ↓
   input.gs
       ↓
   Google Sheets


   SETTING
       ↓
   write.js
       ↓
   Apps Script
       ↓
   main.gs
       ↓
   setting.gs
       ↓
   Google Sheets


   Responsibility :

   - Mendapatkan Supabase session
   - Mendapatkan Finance Core
   - Mendapatkan Google Provider Token
   - Menentukan Apps Script endpoint
   - Mengirim WRITE request
   - saveInput()
   - saveSetting()
   - Expand automatic payroll rules

   TIDAK MENANGANI :

   - Authentication
   - Login
   - Logout
   - READ Sheet
   - Processing
   - Calculation
   - Business Rules
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


/* =====================================================
   CONFIG
===================================================== */

/*
   Fallback endpoint Apps Script.

   Endpoint utama dapat berasal dari
   moduleInfo / session workspace.

   Fallback digunakan jika endpoint
   belum tersedia di session.
*/

const DEFAULT_ENDPOINT =

    "https://script.google.com/macros/s/AKfycbxBiQSb1pioB0mDbkAqd6S3y4T5CTByn2-6kW7-T1l-5PdGYTBVDX4IXskxyu_QxokHDw/exec";


/* =====================================================
   SESSION
===================================================== */

async function getWriteSession(){

    console.log(

        "WRITE: Mengambil Supabase session..."

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

        "WRITE: Session tersedia."

    );


    return session;

}


/* =====================================================
   FINANCE CORE
===================================================== */

function getWriteFinanceCore(){

    const moduleInfo =

        loadModuleInfo();


    console.log(

        "WRITE: Finance Module Info:",

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

        "WRITE: Finance Core:",

        financeCore

    );


    return financeCore;

}


/* =====================================================
   SPREADSHEET ID
===================================================== */

function getWriteSpreadsheetId(){

    const financeCore =

        getWriteFinanceCore();


    return financeCore.id;

}


/* =====================================================
   GOOGLE PROVIDER TOKEN
===================================================== */

async function getWriteAccessToken(){

    console.log(

        "WRITE: Meminta Google Provider Token..."

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

        "WRITE: Google Provider Token: AVAILABLE"

    );


    return token;

}


/* =====================================================
   ENDPOINT
===================================================== */

function getWriteEndpoint(

    session

){

    /*
       Prioritas :

       1. session.workspace.endpoint
       2. moduleInfo endpoint
       3. DEFAULT_ENDPOINT
    */


    const moduleInfo =

        loadModuleInfo();


    const endpoint =

        session
        ?.workspace
        ?.endpoint

        ||

        moduleInfo
        ?.workspace
        ?.endpoint

        ||

        moduleInfo
        ?.endpoint

        ||

        DEFAULT_ENDPOINT;


    if(

        !endpoint

    ){

        throw new Error(

            "Apps Script endpoint tidak ditemukan."

        );

    }


    return endpoint;

}


/* =====================================================
   JSONP REQUEST
===================================================== */

/*
   WRITE menggunakan gateway Apps Script
   yang sama seperti mekanisme lama.

   Karena request dikirim menggunakan
   URL parameter, JSONP digunakan agar
   tetap kompatibel dengan endpoint Apps Script.
*/

function jsonpRequest(

    url

){

    return new Promise(

        (

            resolve,

            reject

        ) => {

            const callbackName =

                "__financeWriteCallback_" +

                Date.now() +

                "_" +

                Math.random()

                    .toString(

                        36

                    )

                    .substring(

                        2

                    );


            const script =

                document.createElement(

                    "script"

                );


            let finished =

                false;


            /* =========================================
               CLEANUP
            ========================================= */

            const cleanup =

                () => {

                    try{

                        delete window[

                            callbackName

                        ];

                    }

                    catch(error){

                        window[

                            callbackName

                        ] =

                            undefined;

                    }


                    if(

                        script.parentNode

                    ){

                        script.parentNode.removeChild(

                            script

                        );

                    }

                };


            /* =========================================
               CALLBACK
            ========================================= */

            window[

                callbackName

            ] =

                result => {

                    if(

                        finished

                    ){

                        return;

                    }


                    finished =

                        true;


                    cleanup();


                    resolve(

                        result

                    );

                };


            /* =========================================
               ERROR
            ========================================= */

            script.onerror =

                () => {

                    if(

                        finished

                    ){

                        return;

                    }


                    finished =

                        true;


                    cleanup();


                    reject(

                        new Error(

                            "Apps Script request gagal."

                        )

                    );

                };


            /* =========================================
               CALLBACK PARAMETER
            ========================================= */

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


            /* =========================================
               TIMEOUT
            ========================================= */

            const timeout =

                setTimeout(

                    () => {

                        if(

                            finished

                        ){

                            return;

                        }


                        finished =

                            true;


                        cleanup();


                        reject(

                            new Error(

                                "Apps Script request timeout."

                            )

                        );

                    },

                    30000

                );


            /* =========================================
               CLEAR TIMEOUT CALLBACK
            ========================================= */

            const originalResolve =

                window[

                    callbackName

                ];


            window[

                callbackName

            ] =

                result => {

                    clearTimeout(

                        timeout

                    );


                    originalResolve(

                        result

                    );

                };


            /* =========================================
               APPEND SCRIPT
            ========================================= */

            document.head.appendChild(

                script

            );

        }

    );

}


/* =====================================================
   BUILD WRITE URL
===================================================== */

function buildWriteURL(

    endpoint,

    action,

    workspace,

    spreadsheetId,

    accessToken,

    data

){

    const params =

        new URLSearchParams();


    /* =============================================
       ACTION
    ============================================= */

    params.set(

        "action",

        action

    );


    /* =============================================
       WORKSPACE
    ============================================= */

    params.set(

        "workspace",

        workspace

    );


    /* =============================================
       SPREADSHEET
    ============================================= */

    params.set(

        "spreadsheetId",

        spreadsheetId

    );


    /* =============================================
       ACCESS TOKEN
    ============================================= */

    params.set(

        "accessToken",

        accessToken

    );


    /* =============================================
       DATA
    ============================================= */

    params.set(

        "data",

        JSON.stringify(

            data

        )

    );


    /* =============================================
       URL
    ============================================= */

    return (

        endpoint

        +

        (

            endpoint.includes(

                "?"

            )

                ?

            "&"

                :

            "?"

        )

        +

        params.toString()

    );

}


/* =====================================================
   EXPAND AUTOMATIC SETTING RULES
===================================================== */

/*
   Automatic rule dibuat oleh module setting.

   Contoh dari monthly.js:

       {
           section : "rule_periode",

           data : {
               type_rule : "rule_periode",
               nama : "periode_gaji",
               ...
               auto_rules : [
                   {...},
                   {...},
                   {...},
                   {...},
                   {...}
               ]
           }
       }


   write.js tidak mengubah struktur rule utama.

   Yang dilakukan hanya:

       1. Simpan rule utama.
       2. Ambil data.auto_rules.
       3. Hapus auto_rules dari row utama.
       4. Tambahkan setiap automatic rule
          sebagai setting entry baru.


   Dengan demikian Apps Script menerima:

       rule_periode
       rule_masuk
       rule_masuk
       rule_masuk
       rule_masuk
       rule_masuk


   tanpa perlu membuat HTML tambahan.
*/

function expandAutomaticSettingRules(

    data

){

    if(

        !Array.isArray(

            data

        )

    ){

        return data;

    }


    const expanded = [];


    data.forEach(

        item => {

            /*
               Pastikan item merupakan object.
            */

            if(

                !item

                ||

                typeof item !==

                    "object"

            ){

                expanded.push(

                    item

                );

                return;

            }


            /*
               Ambil data utama.

               Struktur normal:

                   item.data

               Tetapi fallback juga diberikan
               apabila suatu saat struktur berubah
               menjadi item langsung.
            */

            const itemData =

                item.data &&

                typeof item.data ===

                    "object"

                    ?

                item.data

                    :

                null;


            /*
               Tidak memiliki data object.
               Biarkan seperti semula.
            */

            if(

                !itemData

            ){

                expanded.push(

                    item

                );

                return;

            }


            /*
               Ambil automatic rules.
            */

            const autoRules =

                Array.isArray(

                    itemData.auto_rules

                )

                    ?

                itemData.auto_rules

                    :

                [];


            /*
               Buat salinan data utama.

               auto_rules tidak ikut dikirim
               sebagai property row utama.

               Ini penting agar row periode tetap
               mempunyai struktur kolom yang sama.
            */

            const mainData = {

                ...itemData

            };


            delete mainData.auto_rules;


            /*
               Masukkan rule utama.
            */

            expanded.push({

                ...item,

                data :

                    mainData

            });


            /*
               Tidak ada automatic rule.
            */

            if(

                autoRules.length === 0

            ){

                return;

            }


            /*
               Masukkan setiap automatic rule
               sebagai entry setting tersendiri.
            */

            autoRules.forEach(

                autoRule => {

                    if(

                        !autoRule

                        ||

                        typeof autoRule !==

                            "object"

                    ){

                        return;

                    }


                    /*
                       Automatic rule mempunyai
                       struktur data rule langsung.

                       Section diprioritaskan dari
                       type_rule agar tetap kompatibel
                       dengan Apps Script yang sekarang.
                    */

                    const ruleSection =

                        autoRule.type_rule

                            ||

                        "rule_masuk";


                    expanded.push({

                        section :

                            ruleSection,


                        data :

                            {

                                ...autoRule

                            }

                    });

                }

            );

        }

    );


    return expanded;

}


/* =====================================================
   WRITE
===================================================== */

/*
   Generic internal WRITE function.

   Tidak dipanggil langsung oleh module.

   Public interface :

       saveInput()
       saveSetting()
*/

async function write(

    action,

    workspace,

    data

){

    /* =============================================
       VALIDATION
    ============================================= */

    if(

        !action

    ){

        throw new Error(

            "Write action tidak ditemukan."

        );

    }


    if(

        !workspace

    ){

        throw new Error(

            "Workspace tidak ditemukan."

        );

    }


    if(

        data === undefined ||

        data === null

    ){

        throw new Error(

            "Write data tidak ditemukan."

        );

    }


    /* =============================================
       SESSION
    ============================================= */

    const session =

        await getWriteSession();


    /* =============================================
       FINANCE CORE
    ============================================= */

    const spreadsheetId =

        getWriteSpreadsheetId();


    /* =============================================
       ACCESS TOKEN
    ============================================= */

    const accessToken =

        await getWriteAccessToken();


    /* =============================================
       ENDPOINT
    ============================================= */

    const endpoint =

        getWriteEndpoint(

            session

        );


    /* =============================================
       BUILD URL
    ============================================= */

    const url =

        buildWriteURL(

            endpoint,

            action,

            workspace,

            spreadsheetId,

            accessToken,

            data

        );


    /* =============================================
       DEBUG
    ============================================= */

    console.log(

        "=========================================="

    );


    console.log(

        "===== WRITE REQUEST ====="

    );


    console.log(

        "Action:",

        action

    );


    console.log(

        "Workspace:",

        workspace

    );


    console.log(

        "Spreadsheet:",

        spreadsheetId

    );


    console.log(

        "Endpoint:",

        endpoint

    );


    console.log(

        "Data:",

        data

    );


    console.log(

        "=========================================="

    );


    /* =============================================
       REQUEST
    ============================================= */

    const result =

        await jsonpRequest(

            url

        );


    /* =============================================
       DEBUG RESULT
    ============================================= */

    console.log(

        "===== WRITE RESULT =====",

        result

    );


    return result;

}


/* =====================================================
   SAVE INPUT
===================================================== */

/*
   Dipakai oleh Input Component.

   Flow :

       Input Component
              ↓
       saveInput()
              ↓
       write()
              ↓
       action=input
              ↓
       main.gs
              ↓
       input.gs
*/

export async function saveInput(

    workspace,

    data

){

    if(

        !workspace

    ){

        throw new Error(

            "Workspace tidak ditemukan."

        );

    }


    if(

        !data ||

        typeof data !==

            "object"

    ){

        throw new Error(

            "Input data tidak valid."

        );

    }


    console.log(

        "WRITE: SAVE INPUT",

        {

            workspace :

                workspace,

            data :

                data

        }

    );


    return write(

        "input",

        workspace,

        data

    );

}


/* =====================================================
   SAVE SETTING
===================================================== */

/*
   Dipakai oleh Setting Component.

   Flow :

       Setting Component
              ↓
       saveSetting()
              ↓
       expandAutomaticSettingRules()
              ↓
       write()
              ↓
       action=setting
              ↓
       main.gs
              ↓
       setting.gs
              ↓
       Google Sheets


   Automatic rule payroll:

       rule_periode
           ↓
       auto_rules
           ↓
       rule_masuk
           ↓
       Google Sheets


   User tidak perlu mengetahui
   keberadaan rule_masuk.
*/

export async function saveSetting(

    workspace,

    data

){

    if(

        !workspace

    ){

        throw new Error(

            "Workspace tidak ditemukan."

        );

    }


    if(

        !Array.isArray(

            data

        )

    ){

        throw new Error(

            "Setting data harus berupa array."

        );

    }


    /* =============================================
       EXPAND AUTOMATIC RULES
    ============================================= */

    const expandedData =

        expandAutomaticSettingRules(

            data

        );


    /* =============================================
       DEBUG AUTOMATIC RULES
    ============================================= */

    console.log(

        "WRITE: SETTING DATA ORIGINAL",

        data

    );


    console.log(

        "WRITE: SETTING DATA EXPANDED",

        expandedData

    );


    console.log(

        "WRITE: AUTO RULE COUNT",

        expandedData.length -

        data.length

    );


    /* =============================================
       SAVE SETTING
    ============================================= */

    console.log(

        "WRITE: SAVE SETTING",

        {

            workspace :

                workspace,

            data :

                expandedData

        }

    );


    return write(

        "setting",

        workspace,

        expandedData

    );

}


/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default {

    saveInput,

    saveSetting

};


/* =====================================================
   END
===================================================== */
