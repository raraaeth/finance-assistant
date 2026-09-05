/* =====================================================
   Finance Assistant
   Module      : UPDATE
   File        : update.js
   Version     : 1.1.0

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

       Contoh :

       Update.updateField(
           "airdrop",

           {
               id :
                   "AIRDROP-XXXX",

               project :
                   "Allox"
           },

           {
               status :
                   "ended"
           }
       );


   UPDATE ROW :

       Digunakan untuk overwrite
       satu row secara penuh.

       Target :

           ID + Tanggal

       Contoh :

       Update.updateRow(
           "airdrop",

           {
               id :
                   "AIRDROP-XXXX",

               tanggal :
                   "2026-09-04"
           },

           {
               id :
                   "AIRDROP-XXXX",

               tanggal :
                   "2026-09-04",

               type :
                   "campaign",

               nama :
                   "wallet",

               project :
                   "Allox",

               start :
                   "2026-08-01",

               end :
                   "2026-09-04",

               status :
                   "ended",

               "$reward" :
                   100
           }
       );


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

/*
   Fallback endpoint Apps Script.

   Endpoint utama tetap mengikuti
   pola WRITE :

       1. session.workspace.endpoint
       2. moduleInfo.workspace.endpoint
       3. moduleInfo.endpoint
       4. DEFAULT_ENDPOINT
*/

const DEFAULT_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbxBiQSb1pioB0mDbkAqd6S3y4T5CTByn2-6kW7-T1l-5PdGYTBVDX4IXskxyu_QxokHDw/exec";


/* =====================================================
   STATE
===================================================== */

/*
   Menyimpan request UPDATE yang sedang berjalan.

   Struktur :

       signature
           ↓
       Promise

   Jika request yang sama dipanggil
   sebelum request pertama selesai,
   request kedua tidak dibuat ulang.

   Promise request pertama dikembalikan.
*/

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

    /*
       Prioritas :

       1. session.workspace.endpoint
       2. moduleInfo.workspace.endpoint
       3. moduleInfo.endpoint
       4. DEFAULT_ENDPOINT
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
   UPDATE menggunakan gateway Apps Script
   yang sama dengan WRITE dan READ.

   Request dikirim menggunakan
   URL parameter sehingga JSONP
   digunakan agar kompatibel dengan
   Apps Script endpoint.
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

    /*
       Hanya hapus lock jika Promise
       yang selesai masih merupakan
       Promise yang terdaftar.

       Ini mencegah request lain
       menghapus lock milik request
       yang berbeda.
    */

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

/*
   Target untuk updateField :

       ID + Project

   Dipertahankan seperti arsitektur
   sebelumnya karena updateField()
   sudah digunakan oleh automation
   dan Edit Reward.
*/

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
   VALIDATE ROW TARGET
===================================================== */

/*
   Target untuk updateRow :

       ID + Tanggal

   Digunakan oleh Edit Input Row.

   Project TIDAK digunakan sebagai
   locator karena project merupakan
   salah satu field di dalam row yang
   dapat berubah melalui overwrite row.
*/

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
       TANGGAL
    ============================================= */

    if(
        target.tanggal ===
            undefined
        ||
        target.tanggal ===
            null
        ||
        String(
            target.tanggal
        ).trim() === ""
    ){

        throw new Error(
            "Update row target membutuhkan tanggal."
        );

    }


    return {

        id :
            String(
                target.id
            ).trim(),

        tanggal :
            String(
                target.tanggal
            ).trim()

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


    /*
       ID dan project digunakan
       sebagai locator.

       Pada field update,
       keduanya tidak boleh diubah.
    */

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

/*
   Validasi row penuh.

   Karena updateRow menggunakan
   target ID + Tanggal, maka row
   yang dikirim wajib mempunyai:

       row.id
       row.tanggal

   dan keduanya harus sama dengan
   locator target.

   Field lain tetap dipertahankan
   sebagai bagian dari full row.
*/

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
       ROW TANGGAL
    ============================================= */

    if(
        row.tanggal ===
            undefined
        ||
        row.tanggal ===
            null
        ||
        String(
            row.tanggal
        ).trim() === ""
    ){

        throw new Error(
            "Update row membutuhkan tanggal."
        );

    }


    /* =============================================
       TANGGAL MUST MATCH TARGET
    ============================================= */

    if(
        String(
            row.tanggal
        ).trim()
        !==
        String(
            target.tanggal
        ).trim()
    ){

        throw new Error(
            "Tanggal target dan tanggal row tidak sama."
        );

    }


    return {

        ...row

    };

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


    /*
       Jika response berupa JSON string,
       coba parse.
    */

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

/*
   Public API :

       Update.updateField(
           workspace,
           target,
           changes
       )


   Target :

       ID + Project


   Contoh :

       Update.updateField(
           "airdrop",

           {
               id :
                   "AIR-MTKJTZ",

               project :
                   "Dimension"
           },

           {
               status :
                   "ended"
           }
       );


   Server :

       action=update

       data :

       {
           mode :
               "field",

           target :
               {
                   id :
                       "...",

                   project :
                       "..."
               },

           changes :
               {
                   status :
                       "ended"
               }
       }
*/

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

/*
   Public API :

       Update.updateRow(
           workspace,
           target,
           row
       )


   Target :

       ID + Tanggal


   Contoh :

       Update.updateRow(
           "airdrop",

           {
               id :
                   "AIR-MTKJTZ",

               tanggal :
                   "2026-09-04"
           },

           {
               id :
                   "AIR-MTKJTZ",

               tanggal :
                   "2026-09-04",

               type :
                   "campaign",

               nama :
                   "main_wallet",

               project :
                   "Dimension",

               start :
                   "2026-08-01",

               end :
                   "2026-09-04",

               status :
                   "ended",

               "$reward" :
                   500
           }
       );


   Server :

       action=update

       data :

       {
           mode :
               "row",

           target :
               {
                   id :
                       "...",

                   tanggal :
                       "..."
               },

           row :
               {
                   ...
               }
       }
*/

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

/*
   Internal generic UPDATE engine.

   Public caller sebaiknya menggunakan :

       updateField()

   atau :

       updateRow()

   Jangan memanggil fungsi ini
   langsung dari module.
*/

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


        /*
           Kembalikan Promise request
           pertama.

           Tidak membuat request kedua.
        */

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

                /*
                   Lock dilepas setelah request
                   benar-benar selesai.
                */

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

    /*
       Tidak membatalkan request yang
       sedang berjalan.

       Hanya membersihkan registry.

       Normalnya fungsi ini tidak perlu
       dipanggil oleh module.
    */

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
