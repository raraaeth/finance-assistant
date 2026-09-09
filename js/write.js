/* =====================================================
   Finance Assistant
   Module      : WRITE
   File        : write.js
   Version     : 1.4.0

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

   FINANCIAL SETTING
       ↓
   financial.js
       ↓
   saveFinancialSetting()
       ↓
   replaceSetting() / saveSetting()
       ↓
   Update.updateSettingRow()
       ↓
   Apps Script
       ↓
   Google Sheets

   Responsibility :
   - Mendapatkan Supabase session
   - Mendapatkan Finance Core
   - Mendapatkan Google Provider Token
   - Menentukan Apps Script endpoint
   - Mengirim WRITE request
   - Proteksi duplicate WRITE request
   - saveInput()
   - saveSetting()
   - saveFinancialSetting()
   - replaceSetting()
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


import {
    Update
} from "./update.js";


/* =====================================================
   CONFIG
===================================================== */

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

            /* =========================================
               VALIDATE ITEM
            ========================================= */

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


            /* =========================================
               MAIN DATA
            ========================================= */

            const itemData =
                item.data
                &&
                typeof item.data ===
                    "object"
                    ?
                item.data
                    :
                null;


            if(
                !itemData
            ){

                expanded.push(
                    item
                );

                return;
            }


            /* =========================================
               AUTO RULES
            ========================================= */

            const autoRules =
                Array.isArray(
                    itemData.auto_rules
                )
                    ?
                itemData.auto_rules
                    :
                [];


            /* =========================================
               MAIN DATA COPY

               auto_rules tidak dikirim
               sebagai property row utama.
            ========================================= */

            const mainData = {
                ...itemData
            };

            delete mainData.auto_rules;


            /* =========================================
               MAIN SETTING
            ========================================= */

            expanded.push({
                ...item,

                data :
                    mainData
            });


            /* =========================================
               NO AUTO RULE
            ========================================= */

            if(
                autoRules.length === 0
            ){
                return;
            }


            /* =========================================
               AUTO RULE ENTRIES
            ========================================= */

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
   DOUBLE WRITE PROTECTION
===================================================== */

const activeWrites =
    new Map();


/* =====================================================
   CREATE WRITE SIGNATURE
===================================================== */

function createWriteSignature(
    action,
    workspace,
    data
){

    let serializedData = "";


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
        String(
            action
        ),

        String(
            workspace
        ),

        serializedData

    ].join(
        "::"
    );
}


/* =====================================================
   GET ACTIVE WRITE
===================================================== */

function getActiveWrite(
    signature
){

    return activeWrites.get(
        signature
    );
}


/* =====================================================
   REGISTER ACTIVE WRITE
===================================================== */

function registerActiveWrite(
    signature,
    promise
){

    activeWrites.set(
        signature,
        promise
    );
}


/* =====================================================
   RELEASE ACTIVE WRITE
===================================================== */

function releaseActiveWrite(
    signature,
    promise
){

    if(
        activeWrites.get(
            signature
        )
        ===
        promise
    ){

        activeWrites.delete(
            signature
        );

    }
}


/* =====================================================
   WRITE
===================================================== */

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
        data === undefined
        ||
        data === null
    ){
        throw new Error(
            "Write data tidak ditemukan."
        );
    }


    /* =============================================
       CREATE SIGNATURE
    ============================================= */

    const signature =
        createWriteSignature(
            action,
            workspace,
            data
        );


    /* =============================================
       DUPLICATE REQUEST
    ============================================= */

    const activeWrite =
        getActiveWrite(
            signature
        );


    if(
        activeWrite
    ){

        console.warn(
            "WRITE: Duplicate request dicegah.",
            {
                action :
                    action,

                workspace :
                    workspace
            }
        );

        return activeWrite;
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
                    await getWriteSession();


                /* =================================
                   FINANCE CORE
                ================================= */

                const spreadsheetId =
                    getWriteSpreadsheetId();


                /* =================================
                   ACCESS TOKEN
                ================================= */

                const accessToken =
                    await getWriteAccessToken();


                /* =================================
                   ENDPOINT
                ================================= */

                const endpoint =
                    getWriteEndpoint(
                        session
                    );


                /* =================================
                   BUILD URL
                ================================= */

                const url =
                    buildWriteURL(
                        endpoint,
                        action,
                        workspace,
                        spreadsheetId,
                        accessToken,
                        data
                    );


                /* =================================
                   DEBUG
                ================================= */

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


                /* =================================
                   REQUEST
                ================================= */

                const result =
                    await jsonpRequest(
                        url
                    );


                /* =================================
                   DEBUG RESULT
                ================================= */

                console.log(
                    "===== WRITE RESULT =====",
                    result
                );


                return result;

            }

            finally{

                releaseActiveWrite(
                    signature,
                    requestPromise
                );

            }

        })();


    /* =============================================
       REGISTER
    ============================================= */

    registerActiveWrite(
        signature,
        requestPromise
    );


    return requestPromise;
}


/* =====================================================
   SAVE INPUT
===================================================== */

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
        !data
        ||
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
       SAVE
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
   REPLACE SETTING
===================================================== */

/*
   Digunakan khusus untuk setting yang mempunyai
   fixed identity berdasarkan field tertentu.

   Financial :

       rules
       ↓
       rule_pemasukan
       rule_pengeluaran
       rule_hutang
       rule_tabungan

   Target TIDAK menggunakan:
       id
       tanggal
       Date

   Target menggunakan:
       rules
*/

export async function replaceSetting(
    workspace,
    rules,
    data
){

    if(
        !workspace
    ){
        throw new Error(
            "Workspace tidak ditemukan."
        );
    }


    const targetRules =
        String(
            rules ??
            ""
        )
        .trim();


    if(
        !targetRules
    ){
        throw new Error(
            "Rules setting tidak ditemukan."
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
            "Setting replace data tidak valid."
        );
    }


    if(
        !Update
        ||
        typeof Update.updateSettingRow !==
            "function"
    ){

        throw new Error(
            "Update.updateSettingRow() tidak tersedia."
        );

    }


    console.log(
        "WRITE: REPLACE SETTING",
        {
            workspace :
                workspace,

            rules :
                targetRules,

            data :
                data
        }
    );


    return Update.updateSettingRow(
        workspace,

        {
            rules :
                targetRules
        },

        data
    );
}


/* =====================================================
   SAVE FINANCIAL SETTING
===================================================== */

/*
   rows harus berupa:

   [
       {
           section :
               "financial_activity",

           data : {
               rules :
                   "rule_pemasukan",

               type :
                   "masuk",

               activity :
                   "gaji"
           }
       }
   ]

   existingRules:

   {
       rule_pemasukan : true,
       rule_pengeluaran : true,
       rule_hutang : false,
       rule_tabungan : false
   }


   LOGIC :

   existing = true
       ↓
   replaceSetting()

   existing = false
       ↓
   saveSetting()


   TIDAK ADA DELETE.

   Rule yang sudah pernah dibuat tetap ada,
   walaupun activity-nya menjadi kosong.
*/

export async function saveFinancialSetting(
    workspace,
    existingRules,
    rows
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
            rows
        )
    ){
        throw new Error(
            "Financial Setting rows harus berupa array."
        );
    }


    const state =
        existingRules &&
        typeof existingRules ===
            "object"
            ?
        existingRules
            :
        {};


    /* =============================================
       NORMALIZE + UNIQUE RULE
    ============================================= */

    const uniqueRows =
        new Map();


    rows.forEach(
        entry => {

            if(
                !entry
                ||
                typeof entry !==
                    "object"
            ){
                return;
            }


            const row =
                entry.data;


            if(
                !row
                ||
                typeof row !==
                    "object"
            ){
                return;
            }


            const rules =
                String(
                    row.rules ??
                    ""
                )
                .trim()
                .toLowerCase();


            if(
                !rules
            ){
                return;
            }


            /* =====================================
               Hanya fixed Financial rules
            ===================================== */

            const allowed =
                (
                    rules ===
                        "rule_pemasukan"

                    ||

                    rules ===
                        "rule_pengeluaran"

                    ||

                    rules ===
                        "rule_hutang"

                    ||

                    rules ===
                        "rule_tabungan"
                );


            if(
                !allowed
            ){
                return;
            }


            uniqueRows.set(
                rules,
                {
                    section :
                        entry.section
                        ||
                        "financial_activity",

                    data :
                        {
                            ...row,

                            rules :
                                rules
                        }
                }
            );

        }
    );


    const results = [];


    /* =============================================
       PROCESS SEQUENTIALLY

       Jangan Promise.all.

       Google Sheet WRITE harus berjalan
       satu per satu agar tidak terjadi
       race condition antar row.
    ============================================= */

    for(
        const [
            rules,
            entry
        ]
        of uniqueRows
    ){

        const alreadyExists =
            state[
                rules
            ] === true;


        /* =========================================
           EXISTING RULE
        ========================================= */

        if(
            alreadyExists
        ){

            console.log(
                "WRITE: Financial rule REPLACE",
                rules
            );


            const result =
                await replaceSetting(
                    workspace,
                    rules,
                    entry.data
                );


            results.push({
                mode :
                    "replace",

                rules :
                    rules,

                result :
                    result
            });


            continue;
        }


        /* =========================================
           NEW RULE
        ========================================= */

        console.log(
            "WRITE: Financial rule APPEND",
            rules
        );


        const result =
            await saveSetting(
                workspace,
                [
                    entry
                ]
            );


        results.push({
            mode :
                "append",

            rules :
                rules,

            result :
                result
        });

    }


    console.log(
        "WRITE: FINANCIAL SETTING COMPLETE",
        results
    );


    return results;
}


/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default {

    saveInput,

    saveSetting,

    replaceSetting,

    saveFinancialSetting

};


/* =====================================================
   END
===================================================== */
