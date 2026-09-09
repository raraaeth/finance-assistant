/* =====================================================
   Finance Assistant
   Module      : UPDATE
   File        : update.js
   Version     : 1.2.0

   Description :
   Global Google Apps Script UPDATE Engine

   Flow :

       MODULE
           ↓
       update.js
           ↓
       Apps Script
           ↓
       main.gs
           ↓
       update.gs
           ↓
       Google Sheets


   Public :

       Update.updateField()
       Update.updateRow()


   UPDATE FIELD :

       Digunakan untuk mengubah
       satu atau beberapa field tertentu.

       Target :

           ID + Project


   UPDATE ROW :

       Digunakan untuk overwrite
       satu row secara penuh.

       Target :

           ID + Date / tanggal

       Update Row sekarang menerima
       beberapa variasi nama field tanggal:

           tanggal
           Tanggal
           date
           Date

       Nilai tersebut akan dinormalisasi
       menjadi:

           target.tanggal

       untuk kompatibilitas dengan
       Apps Script update.gs.

       Row asli tetap mempertahankan
       nama field tanggal dari workspace.

       Contoh Financial:

           {
               id :
                   "FIN-XXXX",

               Date :
                   "2026-09-05"
           }

       akan diterima sebagai target:

           {
               id :
                   "FIN-XXXX",

               tanggal :
                   "2026-09-05"
           }


   Responsibility :

       - Mendapatkan Supabase session
       - Mendapatkan Finance Core
       - Mendapatkan Google Provider Token
       - Menentukan Apps Script endpoint
       - Membuat UPDATE request
       - Duplicate request protection
       - JSONP request
       - Update field
       - Update full row


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

const DEFAULT_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbxBiQSb1pioB0mDbkAqd6S3y4T5CTByn2-6kW7-T1l-5PdGYTBVDX4IXskxyu_QxokHDw/exec";


/* =====================================================
   DATE FIELD ALIASES
===================================================== */

const DATE_FIELD_ALIASES = [

    "tanggal",

    "Tanggal",

    "date",

    "Date"

];


/* =====================================================
   STATE
===================================================== */

const activeUpdates =
    new Map();


/* =====================================================
   SESSION
===================================================== */

async function getUpdateSession(){

    console.log(
        "UPDATE: Mengambil Supabase session..."
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
        "UPDATE: Session tersedia."
    );


    return session;

}


/* =====================================================
   FINANCE CORE
===================================================== */

function getUpdateFinanceCore(){

    const moduleInfo =
        loadModuleInfo();


    console.log(
        "UPDATE: Finance Module Info:",
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
        "UPDATE: Finance Core:",
        financeCore
    );


    return financeCore;

}


/* =====================================================
   SPREADSHEET ID
===================================================== */

function getUpdateSpreadsheetId(){

    const financeCore =
        getUpdateFinanceCore();


    return financeCore.id;

}


/* =====================================================
   GOOGLE PROVIDER TOKEN
===================================================== */

async function getUpdateAccessToken(){

    console.log(
        "UPDATE: Meminta Google Provider Token..."
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
        "UPDATE: Google Provider Token: AVAILABLE"
    );


    return token;

}


/* =====================================================
   ENDPOINT
===================================================== */

function getUpdateEndpoint(
    session
){

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

function jsonpRequest(
    url
){

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const callbackName =
                "__financeUpdateCallback_" +
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


                    clearTimeout(
                        timeout
                    );


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


                    clearTimeout(
                        timeout
                    );


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
               APPEND SCRIPT
            ========================================= */

            document.head.appendChild(
                script
            );

        }
    );

}


/* =====================================================
   BUILD UPDATE URL
===================================================== */

function buildUpdateURL(
    endpoint,
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
        "update"
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
   CREATE UPDATE SIGNATURE
===================================================== */

function createUpdateSignature(
    workspace,
    data
){

    let serializedData;


    try{

        serializedData =
            JSON.stringify(
                data
            );

    }
    catch(error){

        serializedData =
            String(
                data
            );

    }


    return [

        "update",

        workspace,

        serializedData

    ].join(
        "|"
    );

}


/* =====================================================
   GET ACTIVE UPDATE
===================================================== */

function getActiveUpdate(
    signature
){

    return activeUpdates.get(
        signature
    );

}


/* =====================================================
   REGISTER UPDATE
===================================================== */

function registerActiveUpdate(
    signature,
    promise
){

    activeUpdates.set(
        signature,
        promise
    );

}


/* =====================================================
   RELEASE UPDATE
===================================================== */

function releaseActiveUpdate(
    signature,
    promise
){

    if(
        activeUpdates.get(
            signature
        )
        ===
        promise
    ){

        activeUpdates.delete(
            signature
        );

    }

}


/* =====================================================
   VALIDATE WORKSPACE
===================================================== */

function validateWorkspace(
    workspace
){

    if(
        !workspace
        ||
        typeof workspace !==
            "string"
    ){

        throw new Error(
            "Workspace tidak ditemukan."
        );

    }


    if(
        !workspace.trim()
    ){

        throw new Error(
            "Workspace tidak valid."
        );

    }


    return workspace.trim();

}


/* =====================================================
   VALIDATE FIELD TARGET
===================================================== */

function validateFieldTarget(
    target
){

    if(
        !target
        ||
        typeof target !==
            "object"
        ||
        Array.isArray(
            target
        )
    ){

        throw new Error(
            "Update target tidak valid."
        );

    }


    /* =============================================
       ID
    ============================================= */

    if(
        target.id ===
            undefined
        ||
        target.id ===
            null
        ||
        String(
            target.id
        ).trim() === ""
    ){

        throw new Error(
            "Update target membutuhkan ID."
        );

    }


    /* =============================================
       PROJECT
    ============================================= */

    if(
        target.project ===
            undefined
        ||
        target.project ===
            null
        ||
        String(
            target.project
        ).trim() === ""
    ){

        throw new Error(
            "Update target membutuhkan project."
        );

    }


    return {

        id :
            String(
                target.id
            ).trim(),

        project :
            String(
                target.project
            ).trim()

    };

}


/* =====================================================
   GET DATE VALUE
===================================================== */

function getDateValue(
    source
){

    if(
        !source
        ||
        typeof source !==
            "object"
        ||
        Array.isArray(
            source
        )
    ){

        return undefined;

    }


    for(
        const field
        of DATE_FIELD_ALIASES
    ){

        if(
            Object.prototype.hasOwnProperty.call(
                source,
                field
            )
        ){

            const value =
                source[
                    field
                ];


            if(
                value !==
                    undefined
                &&
                value !==
                    null
                &&
                String(
                    value
                ).trim() !== ""
            ){

                return value;

            }

        }

    }


    return undefined;

}


/* =====================================================
   GET DATE FIELD NAME
===================================================== */

function getDateFieldName(
    source
){

    if(
        !source
        ||
        typeof source !==
            "object"
        ||
        Array.isArray(
            source
        )
    ){

        return null;

    }


    for(
        const field
        of DATE_FIELD_ALIASES
    ){

        if(
            Object.prototype.hasOwnProperty.call(
                source,
                field
            )
        ){

            const value =
                source[
                    field
                ];


            if(
                value !==
                    undefined
                &&
                value !==
                    null
                &&
                String(
                    value
                ).trim() !== ""
            ){

                return field;

            }

        }

    }


    return null;

}


/* =====================================================
   NORMALIZE DATE VALUE
===================================================== */

function normalizeDateValue(
    value
){

    if(
        value ===
            undefined
        ||
        value ===
            null
    ){

        return "";

    }


    return String(
        value
    ).trim();

}


/* =====================================================
   VALIDATE ROW TARGET
===================================================== */

function validateRowTarget(
    target
){

    if(
        !target
        ||
        typeof target !==
            "object"
        ||
        Array.isArray(
            target
        )
    ){

        throw new Error(
            "Update row target tidak valid."
        );

    }


    /* =============================================
       ID
    ============================================= */

    if(
        target.id ===
            undefined
        ||
        target.id ===
            null
        ||
        String(
            target.id
        ).trim() === ""
    ){

        throw new Error(
            "Update row target membutuhkan ID."
        );

    }


    /* =============================================
       DATE / TANGGAL
    ============================================= */

    const rawDate =
        getDateValue(
            target
        );


    const normalizedDate =
        normalizeDateValue(
            rawDate
        );


    if(
        !normalizedDate
    ){

        throw new Error(
            "Update row target membutuhkan tanggal/Date."
        );

    }


    console.log(
        "UPDATE ROW DATE TARGET:",
        {
            sourceField :
                getDateFieldName(
                    target
                ),

            value :
                normalizedDate
        }
    );


    return {

        id :
            String(
                target.id
            ).trim(),

        tanggal :
            normalizedDate

    };

}


/* =====================================================
   VALIDATE FIELD CHANGES
===================================================== */

function validateFieldChanges(
    changes
){

    if(
        !changes
        ||
        typeof changes !==
            "object"
        ||
        Array.isArray(
            changes
        )
    ){

        throw new Error(
            "Update changes tidak valid."
        );

    }


    const keys =
        Object.keys(
            changes
        );


    if(
        keys.length ===
            0
    ){

        throw new Error(
            "Tidak ada field yang akan di-update."
        );

    }


    if(
        Object.prototype.hasOwnProperty.call(
            changes,
            "id"
        )
    ){

        throw new Error(
            "ID tidak boleh diubah menggunakan updateField()."
        );

    }


    if(
        Object.prototype.hasOwnProperty.call(
            changes,
            "project"
        )
    ){

        throw new Error(
            "Project tidak boleh diubah menggunakan updateField()."
        );

    }


    return {

        ...changes

    };

}


/* =====================================================
   VALIDATE ROW
===================================================== */

function validateRow(
    target,
    row
){

    if(
        !row
        ||
        typeof row !==
            "object"
        ||
        Array.isArray(
            row
        )
    ){

        throw new Error(
            "Update row tidak valid."
        );

    }


    /* =============================================
       ROW ID
    ============================================= */

    if(
        row.id ===
            undefined
        ||
        row.id ===
            null
        ||
        String(
            row.id
        ).trim() === ""
    ){

        throw new Error(
            "Update row membutuhkan ID."
        );

    }


    /* =============================================
       ID MUST MATCH TARGET
    ============================================= */

    if(
        String(
            row.id
        ).trim()
        !==
        String(
            target.id
        ).trim()
    ){

        throw new Error(
            "ID target dan ID row tidak sama."
        );

    }


    /* =============================================
       ROW DATE / TANGGAL
    ============================================= */

    const rawDate =
        getDateValue(
            row
        );


    const normalizedDate =
        normalizeDateValue(
            rawDate
        );


    if(
        !normalizedDate
    ){

        throw new Error(
            "Update row membutuhkan tanggal/Date."
        );

    }


    /* =============================================
       DATE MUST MATCH TARGET
    ============================================= */

    if(
        normalizedDate
        !==
        String(
            target.tanggal
        ).trim()
    ){

        throw new Error(
            "Tanggal target dan tanggal row tidak sama."
        );

    }


    /* =============================================
       PRESERVE ORIGINAL ROW
    ============================================= */

    const validRow = {

        ...row

    };


    if(
        !Object.prototype.hasOwnProperty.call(
            validRow,
            "tanggal"
        )
    ){

        validRow.tanggal =
            normalizedDate;

    }


    return validRow;

}


/* =====================================================
   NORMALIZE RESPONSE
===================================================== */

function normalizeUpdateResponse(
    response
){

    if(
        response ===
            undefined
        ||
        response ===
            null
    ){

        return {

            success :
                false,

            code :
                "EMPTY_RESPONSE",

            message :
                "Apps Script mengembalikan response kosong."

        };

    }


    if(
        typeof response ===
            "string"
    ){

        try{

            return JSON.parse(
                response
            );

        }
        catch(error){

            return {

                success :
                    false,

                code :
                    "INVALID_RESPONSE",

                message :
                    response

            };

        }

    }


    if(
        typeof response !==
            "object"
    ){

        return {

            success :
                false,

            code :
                "INVALID_RESPONSE",

            message :
                "Format response tidak valid."

        };

    }


    return response;

}


/* =====================================================
   UPDATE FIELD
===================================================== */

async function updateField(
    workspace,
    target,
    changes
){

    const validWorkspace =
        validateWorkspace(
            workspace
        );


    const validTarget =
        validateFieldTarget(
            target
        );


    const validChanges =
        validateFieldChanges(
            changes
        );


    const data = {

        mode :
            "field",

        target :
            validTarget,

        changes :
            validChanges

    };


    return update(
        validWorkspace,
        data
    );

}


/* =====================================================
   UPDATE ROW
===================================================== */

async function updateRow(
    workspace,
    target,
    row
){

    const validWorkspace =
        validateWorkspace(
            workspace
        );


    const validTarget =
        validateRowTarget(
            target
        );


    const validRow =
        validateRow(
            validTarget,
            row
        );


    const data = {

        mode :
            "row",

        target :
            validTarget,

        row :
            validRow

    };


    return update(
        validWorkspace,
        data
    );

}


/* =====================================================
   GENERIC UPDATE
===================================================== */

async function update(
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
        !data
        ||
        typeof data !==
            "object"
        ||
        Array.isArray(
            data
        )
    ){

        throw new Error(
            "Update data tidak valid."
        );

    }


    if(
        data.mode !==
            "field"
        &&
        data.mode !==
            "row"
    ){

        throw new Error(
            "Update mode harus field atau row."
        );

    }


    /* =============================================
       TARGET
    ============================================= */

    const target =
        data.mode ===
            "field"

            ?

            validateFieldTarget(
                data.target
            )

            :

            validateRowTarget(
                data.target
            );


    /* =============================================
       NORMALIZE DATA
    ============================================= */

    const requestData = {

        ...data,

        target

    };


    /* =============================================
       SIGNATURE
    ============================================= */

    const signature =
        createUpdateSignature(
            workspace,
            requestData
        );


    /* =============================================
       DUPLICATE REQUEST
    ============================================= */

    const activeUpdate =
        getActiveUpdate(
            signature
        );


    if(
        activeUpdate
    ){

        console.warn(
            "UPDATE: Duplicate request dicegah.",
            {
                workspace :
                    workspace,

                mode :
                    requestData.mode
            }
        );


        return activeUpdate;

    }


    /* =============================================
       REQUEST PROMISE
    ============================================= */

    const requestPromise =
        (async () => {

            try{

                /* =================================
                   SESSION
                ================================= */

                const session =
                    await getUpdateSession();


                /* =================================
                   FINANCE CORE
                ================================= */

                const spreadsheetId =
                    getUpdateSpreadsheetId();


                /* =================================
                   GOOGLE TOKEN
                ================================= */

                const accessToken =
                    await getUpdateAccessToken();


                /* =================================
                   ENDPOINT
                ================================= */

                const endpoint =
                    getUpdateEndpoint(
                        session
                    );


                /* =================================
                   BUILD URL
                ================================= */

                const url =
                    buildUpdateURL(
                        endpoint,
                        workspace,
                        spreadsheetId,
                        accessToken,
                        requestData
                    );


                /* =================================
                   DEBUG
                ================================= */

                console.log(
                    "=========================================="
                );


                console.log(
                    "===== UPDATE REQUEST ====="
                );


                console.log(
                    "Action:",
                    "update"
                );


                console.log(
                    "Workspace:",
                    workspace
                );


                console.log(
                    "Mode:",
                    requestData.mode
                );


                console.log(
                    "Target:",
                    requestData.target
                );


                console.log(
                    "Data:",
                    requestData
                );


                console.log(
                    "Spreadsheet ID:",
                    spreadsheetId
                );


                console.log(
                    "Endpoint:",
                    endpoint
                );


                console.log(
                    "=========================================="
                );


                /* =================================
                   REQUEST
                ================================= */

                const result =
                    await jsonpRequest(
                        url
                    );


                /* =================================
                   NORMALIZE RESULT
                ================================= */

                const normalized =
                    normalizeUpdateResponse(
                        result
                    );


                /* =================================
                   DEBUG RESULT
                ================================= */

                console.log(
                    "===== UPDATE RESULT =====",
                    normalized
                );


                return normalized;

            }

            catch(error){

                console.error(
                    "=========================================="
                );


                console.error(
                    "===== UPDATE FAILED ====="
                );


                console.error(
                    "Update Error:",
                    error
                );


                console.error(
                    "Update Error Message:",
                    error?.message
                );


                console.error(
                    "Update Error Stack:",
                    error?.stack
                );


                throw error;

            }

            finally{

                releaseActiveUpdate(
                    signature,
                    requestPromise
                );

            }

        })();


    /* =============================================
       REGISTER REQUEST
    ============================================= */

    registerActiveUpdate(
        signature,
        requestPromise
    );


    return requestPromise;

}


/* =====================================================
   GET ACTIVE UPDATE COUNT
===================================================== */

function getActiveUpdateCount(){

    return activeUpdates.size;

}


/* =====================================================
   IS UPDATING
===================================================== */

function isUpdating(){

    return (
        activeUpdates.size >
        0
    );

}


/* =====================================================
   RESET ACTIVE UPDATES
===================================================== */

function resetUpdates(){

    activeUpdates.clear();

}


/* =====================================================
   PUBLIC UPDATE OBJECT
===================================================== */

export const Update = {

    updateField,

    updateRow,

    isUpdating,

    getActiveUpdateCount,

    resetUpdates

};


/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default Update;


/* =====================================================
   END
===================================================== */
