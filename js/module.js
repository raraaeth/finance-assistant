/* ==========================================
   Finance Assistant
   Module      : MODULE
   File        : module.js
   Version     : 2.0.0

   Description :
   Google Drive + Google Sheets Engine

   Tahap 2 :

   Google Drive
       ↓
   Finance Assistant
       ↓
   Finance Core
       ↓
   account
       ↓
   onboarding data

   ACCOUNT RULE :

   User baru
       ↓
   onboarding
       ↓
   account belum ada
       ↓
   WRITE account

   User lama / browser lain
       ↓
   account sudah ada
       ↓
   READ account
       ↓
   JANGAN overwrite

   TIDAK menangani:
   - Active Workspace
   - Inactive Workspace
   - Create Workspace
   - Workspace switching
========================================== */


/* ==========================================
   IMPORT
========================================== */

import {

    getGoogleProviderToken

} from "./auth.js";


import {

    loadUser

} from "./storage.js";


/* ==========================================
   CONFIG
========================================== */

const Module = {

    folderName :

        "Finance Assistant",


    coreName :

        "Finance Core",


    accountSheetName :

        "account",


    driveApi :

        "https://www.googleapis.com/drive/v3",


    sheetsApi :

        "https://sheets.googleapis.com/v4"

};


/* ==========================================
   MIME TYPES
========================================== */

const MIME = {

    folder :

        "application/vnd.google-apps.folder",


    spreadsheet :

        "application/vnd.google-apps.spreadsheet"

};


/* ==========================================
   INITIALIZE MODULE
========================================== */

export async function initializeModule(

    onboarding = null

){

    console.log(
        "=========================================="
    );

    console.log(
        "===== FINANCE MODULE INITIALIZE ====="
    );

    console.log(
        "=========================================="
    );


    try{

        /* ======================================
           GOOGLE TOKEN
        ====================================== */

        const accessToken =

            await getGoogleProviderToken();


        if(

            !accessToken

        ){

            throw new Error(

                "Google Provider Token tidak ditemukan."

            );

        }


        console.log(

            "Google Provider Token tersedia."

        );


        /* ======================================
           ONBOARDING
        ====================================== */

        const onboardingData =

            buildAccountData(

                onboarding

            );


        console.log(

            "Onboarding / New Account Data:",

            onboardingData

        );


        /* ======================================
           FINANCE ASSISTANT FOLDER
        ====================================== */

        const folder =

            await getOrCreateFinanceFolder(

                accessToken

            );


        console.log(

            "Finance Assistant Folder:",

            folder

        );


        /* ======================================
           FINANCE CORE
        ====================================== */

        const core =

            await getOrCreateFinanceCore(

                accessToken,

                folder.id

            );


        console.log(

            "Finance Core:",

            core

        );


        /* ======================================
           ACCOUNT SHEET
        ====================================== */

        const accountSheet =

            await getOrCreateAccountSheet(

                accessToken,

                core.id

            );


        console.log(

            "Account Sheet:",

            accountSheet

        );


        /* ======================================
           READ EXISTING ACCOUNT
        ====================================== */

        console.log(
            "=========================================="
        );

        console.log(
            "===== CHECK EXISTING ACCOUNT ====="
        );

        console.log(
            "=========================================="
        );


        const existingAccount =

            await readAccountData(

                accessToken,

                core.id,

                accountSheet.title

            );


        console.log(

            "Existing Account:",

            existingAccount

        );


        /* ======================================
           ACCOUNT DECISION
        ====================================== */

        let finalAccountData;


        if(

            existingAccount

        ){

            /* ==================================
               EXISTING ACCOUNT

               Account di Finance Core adalah
               sumber kebenaran.

               Jangan overwrite dengan:
               - Google full_name
               - localStorage
               - onboarding kosong
            ================================== */

            console.log(

                "=========================================="

            );

            console.log(

                "ACCOUNT SUDAH ADA"

            );

            console.log(

                "Menggunakan data dari Finance Core."

            );

            console.log(

                "Tidak melakukan overwrite."

            );

            console.log(

                "=========================================="

            );


            finalAccountData =

                existingAccount;


        }else{

            /* ==================================
               NEW ACCOUNT
            ================================== */

            console.log(

                "=========================================="

            );

            console.log(

                "ACCOUNT BELUM ADA"

            );

            console.log(

                "Menyimpan data onboarding."

            );

            console.log(

                "=========================================="

            );


            await writeAccountData(

                accessToken,

                core.id,

                accountSheet.title,

                onboardingData

            );


            finalAccountData =

                onboardingData;


            console.log(

                "Account baru berhasil disimpan."

            );

        }


        /* ======================================
           RESULT
        ====================================== */

        const result = {

            success :

                true,


            folder : {

                id :

                    folder.id,


                name :

                    folder.name

            },


            financeCore : {

                id :

                    core.id,


                name :

                    core.name,


                url :

                    core.url

            },


            account : {

                title :

                    accountSheet.title,


                sheetId :

                    accountSheet.sheetId

            },


            accountData :

                finalAccountData

        };


        console.log(
            "=========================================="
        );

        console.log(
            "===== FINANCE MODULE READY ====="
        );

        console.log(
            "=========================================="
        );


        console.log(

            "FINAL ACCOUNT DATA:",

            finalAccountData

        );


        console.log(

            "Finance Module Result:",

            result

        );


        return result;


    }catch(error){

        console.error(
            "=========================================="
        );

        console.error(
            "===== FINANCE MODULE ERROR ====="
        );

        console.error(
            "=========================================="
        );


        console.error(

            error

        );


        console.error(

            "Message:",

            error?.message

        );


        console.error(

            "Stack:",

            error?.stack

        );


        throw error;

    }

}


/* ==========================================
   BUILD ACCOUNT DATA
========================================== */

function buildAccountData(

    onboarding

){

    const user =

        loadUser()

        ||

        {};


    const data =

        onboarding

        ||

        {};


    const now =

        new Date()

        .toISOString();


    return {

        userId :

            user.id

            ||

            data.userId

            ||

            "",


        email :

            user.email

            ||

            data.email

            ||

            "",


        displayName :

            data.displayName

            ||

            user.displayName

            ||

            "",


        currency :

            data.currency

            ||

            "IDR",


        theme :

            data.theme

            ||

            "system",


        onboardingCompleted :

            data.onboardingCompleted === true

            ||

            data.onboardingCompleted === "true",


        createdAt :

            data.createdAt

            ||

            now,


        updatedAt :

            now

    };

}


/* ==========================================
   GET OR CREATE FINANCE FOLDER
========================================== */

async function getOrCreateFinanceFolder(

    accessToken

){

    console.log(

        "Mencari folder Finance Assistant..."

    );


    const existing =

        await findDriveFile(

            accessToken,

            Module.folderName,

            MIME.folder

        );


    if(

        existing

    ){

        console.log(

            "Folder Finance Assistant ditemukan:",

            existing.id

        );


        return existing;

    }


    console.log(

        "Folder tidak ditemukan."

    );


    console.log(

        "Membuat folder Finance Assistant..."

    );


    const folder =

        await driveRequest(

            accessToken,

            "/files",

            {

                method :

                    "POST",


                body : {

                    name :

                        Module.folderName,


                    mimeType :

                        MIME.folder

                }

            }

        );


    console.log(

        "Folder Finance Assistant dibuat:",

        folder.id

    );


    return folder;

}


/* ==========================================
   GET OR CREATE FINANCE CORE
========================================== */

async function getOrCreateFinanceCore(

    accessToken,

    folderId

){

    console.log(

        "Mencari Finance Core..."

    );


    const existing =

        await findDriveFile(

            accessToken,

            Module.coreName,

            MIME.spreadsheet,

            folderId

        );


    if(

        existing

    ){

        console.log(

            "Finance Core ditemukan:",

            existing.id

        );


        return {

            id :

                existing.id,


            name :

                existing.name,


            url :

                existing.webViewLink

                ||

                `https://docs.google.com/spreadsheets/d/${existing.id}/edit`

        };

    }


    console.log(

        "Finance Core tidak ditemukan."

    );


    console.log(

        "Membuat Finance Core..."

    );


    /* ======================================
       CREATE SPREADSHEET
    ====================================== */

    const spreadsheet =

        await sheetsRequest(

            accessToken,

            "/spreadsheets",

            {

                method :

                    "POST",


                body : {

                    properties : {

                        title :

                            Module.coreName

                    }

                }

            }

        );


    const spreadsheetId =

        spreadsheet.spreadsheetId;


    if(

        !spreadsheetId

    ){

        throw new Error(

            "Finance Core berhasil dibuat tetapi Spreadsheet ID tidak ditemukan."

        );

    }


    console.log(

        "Finance Core dibuat:",

        spreadsheetId

    );


    /* ======================================
       MOVE TO FINANCE ASSISTANT FOLDER
    ====================================== */

    console.log(

        "Memindahkan Finance Core ke Finance Assistant..."

    );


    await moveFileToFolder(

        accessToken,

        spreadsheetId,

        folderId

    );


    console.log(

        "Finance Core berhasil ditempatkan di folder Finance Assistant."

    );


    return {

        id :

            spreadsheetId,


        name :

            Module.coreName,


        url :

            spreadsheet.spreadsheetUrl

            ||

            `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`

    };

}


/* ==========================================
   GET OR CREATE ACCOUNT SHEET
========================================== */

async function getOrCreateAccountSheet(

    accessToken,

    spreadsheetId

){

    console.log(

        "Mengecek sheet account..."

    );


    const spreadsheet =

        await sheetsRequest(

            accessToken,

            `/spreadsheets/${encodeURIComponent(

                spreadsheetId

            )}?fields=spreadsheetId,properties,sheets.properties`,

            {

                method :

                    "GET"

            }

        );


    const sheets =

        spreadsheet.sheets

        ||

        [];


    const existing =

        sheets.find(

            sheet =>

                sheet
                ?.properties
                ?.title

                ===

                Module.accountSheetName

        );


    if(

        existing

    ){

        console.log(

            "Sheet account ditemukan."

        );


        return {

            title :

                existing.properties.title,


            sheetId :

                existing.properties.sheetId

        };

    }


    console.log(

        "Sheet account belum ada."

    );


    console.log(

        "Membuat sheet account..."

    );


    const result =

        await sheetsRequest(

            accessToken,

            `/spreadsheets/${encodeURIComponent(

                spreadsheetId

            )}:batchUpdate`,

            {

                method :

                    "POST",


                body : {

                    requests : [

                        {

                            addSheet : {

                                properties : {

                                    title :

                                        Module.accountSheetName

                                }

                            }

                        }

                    ]

                }

            }

        );


    const createdSheet =

        result
        ?.replies
        ?.find(

            reply =>

                reply.addSheet

        )
        ?.addSheet
        ?.properties;


    if(

        !createdSheet

    ){

        throw new Error(

            "Sheet account gagal dibuat."

        );

    }


    console.log(

        "Sheet account berhasil dibuat."

    );


    return {

        title :

            createdSheet.title,


        sheetId :

            createdSheet.sheetId

    };

}


/* ==========================================
   READ ACCOUNT DATA
========================================== */

async function readAccountData(

    accessToken,

    spreadsheetId,

    sheetName

){

    console.log(

        "Membaca data account..."

    );


    const range =

        `${sheetName}!A:B`;


    const result =

        await sheetsRequest(

            accessToken,

            `/spreadsheets/${encodeURIComponent(

                spreadsheetId

            )}/values/${encodeURIComponent(

                range

            )}`,

            {

                method :

                    "GET"

            }

        );


    const values =

        result?.values

        ||

        [];


    /* ======================================
       EMPTY ACCOUNT
    ====================================== */

    if(

        values.length < 2

    ){

        console.log(

            "Account belum memiliki data."

        );


        return null;

    }


    /* ======================================
       PARSE ACCOUNT
    ====================================== */

    const account = {};


    values.slice(

        1

    )

    .forEach(

        row => {

            const field =

                row?.[0];


            const value =

                row?.[1];


            if(

                field

            ){

                account[field] =

                    value;

            }

        }

    );


    /* ======================================
       VALIDATE ACCOUNT
    ====================================== */

    if(

        !account.userId

        &&

        !account.email

        &&

        !account.displayName

    ){

        console.log(

            "Account sheet ada tetapi data account kosong."

        );


        return null;

    }


    /* ======================================
       NORMALIZE
    ====================================== */

    account.onboardingCompleted =

        account.onboardingCompleted === true

        ||

        account.onboardingCompleted === "true";


    console.log(

        "Account berhasil dibaca:",

        account

    );


    return account;

}


/* ==========================================
   WRITE ACCOUNT DATA
========================================== */

async function writeAccountData(

    accessToken,

    spreadsheetId,

    sheetName,

    data

){

    console.log(

        "Menulis data account..."

    );


    /* ======================================
       HEADER
    ====================================== */

    const headers = [

        "field",

        "value"

    ];


    /* ======================================
       DATA
    ====================================== */

    const rows = [

        [

            "userId",

            data.userId

        ],


        [

            "email",

            data.email

        ],


        [

            "displayName",

            data.displayName

        ],


        [

            "currency",

            data.currency

        ],


        [

            "theme",

            data.theme

        ],


        [

            "onboardingCompleted",

            data.onboardingCompleted

                ?

                "true"

                :

                "false"

        ],


        [

            "createdAt",

            data.createdAt

        ],


        [

            "updatedAt",

            data.updatedAt

        ]

    ];


    const values = [

        headers,

        ...rows

    ];


    /* ======================================
       RANGE
    ====================================== */

    const range =

        `${sheetName}!A1:B${values.length}`;


    /* ======================================
       UPDATE
    ====================================== */

    await sheetsRequest(

        accessToken,

        `/spreadsheets/${encodeURIComponent(

            spreadsheetId

        )}/values/${encodeURIComponent(

            range

        )}?valueInputOption=USER_ENTERED`,

        {

            method :

                "PUT",


            body : {

                range :

                    range,


                majorDimension :

                    "ROWS",


                values :

                    values

            }

        }

    );


    console.log(

        "Data account berhasil ditulis."

    );

}


/* ==========================================
   FIND DRIVE FILE
========================================== */

async function findDriveFile(

    accessToken,

    name,

    mimeType,

    parentId = null

){

    let query =

        `name = '${escapeDriveQuery(name)}'`

        +

        ` and mimeType = '${mimeType}'`

        +

        ` and trashed = false`;


    if(

        parentId

    ){

        query +=

            ` and '${parentId}' in parents`;

    }


    const params =

        new URLSearchParams({

            q :

                query,


            spaces :

                "drive",


            pageSize :

                "10",


            fields :

                "files(id,name,mimeType,parents,webViewLink)"

        });


    const result =

        await driveRequest(

            accessToken,

            `/files?${params.toString()}`,

            {

                method :

                    "GET"

            }

        );


    const files =

        result.files

        ||

        [];


    return (

        files[0]

        ||

        null

    );

}


/* ==========================================
   ESCAPE DRIVE QUERY
========================================== */

function escapeDriveQuery(

    value

){

    return String(

        value

    )

    .replace(

        /\\/g,

        "\\\\"

    )

    .replace(

        /'/g,

        "\\'"

    );

}


/* ==========================================
   MOVE FILE TO FOLDER
========================================== */

async function moveFileToFolder(

    accessToken,

    fileId,

    folderId

){

    /* ======================================
       GET CURRENT PARENTS
    ====================================== */

    const current =

        await driveRequest(

            accessToken,

            `/files/${encodeURIComponent(

                fileId

            )}?fields=id,parents`,

            {

                method :

                    "GET"

            }

        );


    const oldParents =

        current.parents

        ?

        current.parents.join(",")

        :

        "";


    /* ======================================
       MOVE
    ====================================== */

    const params =

        new URLSearchParams();


    params.set(

        "addParents",

        folderId

    );


    if(

        oldParents

    ){

        params.set(

            "removeParents",

            oldParents

        );

    }


    params.set(

        "fields",

        "id,name,parents,webViewLink"

    );


    await driveRequest(

        accessToken,

        `/files/${encodeURIComponent(

            fileId

        )}?${params.toString()}`,

        {

            method :

                "PATCH"

        }

    );

}


/* ==========================================
   DRIVE REQUEST
========================================== */

async function driveRequest(

    accessToken,

    path,

    options = {}

){

    return await googleRequest(

        Module.driveApi,

        accessToken,

        path,

        options

    );

}


/* ==========================================
   SHEETS REQUEST
========================================== */

async function sheetsRequest(

    accessToken,

    path,

    options = {}

){

    return await googleRequest(

        Module.sheetsApi,

        accessToken,

        path,

        options

    );

}


/* ==========================================
   GOOGLE REQUEST
========================================== */

async function googleRequest(

    baseUrl,

    accessToken,

    path,

    options = {}

){

    const response =

        await fetch(

            baseUrl +

            path,

            {

                method :

                    options.method

                    ||

                    "GET",


                headers : {

                    "Authorization" :

                        `Bearer ${accessToken}`,

                    "Content-Type" :

                        "application/json"

                },


                body :

                    options.body

                    ?

                    JSON.stringify(

                        options.body

                    )

                    :

                    undefined

            }

        );


    /* ======================================
       READ RESPONSE
    ====================================== */

    const text =

        await response.text();


    let data =

        null;


    try{

        data =

            text

            ?

            JSON.parse(

                text

            )

            :

            null;

    }catch(error){

        data = {

            raw :

                text

        };

    }


    /* ======================================
       ERROR
    ====================================== */

    if(

        !response.ok

    ){

        console.error(

            "Google API Error:",

            {

                status :

                    response.status,


                statusText :

                    response.statusText,


                data :

                    data

            }

        );


        const message =

            data
            ?.error
            ?.message

            ||

            data
            ?.error_description

            ||

            `Google API Error ${response.status}`;


        throw new Error(

            message

        );

    }


    return data;

}


/* ==========================================
   SAVE MODULE INFO
========================================== */

export function saveModuleInfo(

    result

){

    if(

        !result

        ||

        !result.success

    ){

        return;

    }


    const moduleInfo = {

        folder : {

            id :

                result.folder.id,


            name :

                result.folder.name

        },


        financeCore : {

            id :

                result.financeCore.id,


            name :

                result.financeCore.name,


            url :

                result.financeCore.url

        },


        account : {

            title :

                result.account.title,


            sheetId :

                result.account.sheetId

        }

    };


    localStorage.setItem(

        "finance_module",

        JSON.stringify(

            moduleInfo

        )

    );


    console.log(

        "Finance Module Info disimpan:",

        moduleInfo

    );

}


/* ==========================================
   LOAD MODULE INFO
========================================== */

export function loadModuleInfo(){

    const data =

        localStorage.getItem(

            "finance_module"

        );


    if(

        !data

    ){

        return null;

    }


    try{

        return JSON.parse(

            data

        );

    }catch(error){

        console.error(

            "Gagal membaca finance_module:",

            error

        );


        localStorage.removeItem(

            "finance_module"

        );


        return null;

    }

}


/* ==========================================
   CLEAR MODULE INFO
========================================== */

export function clearModuleInfo(){

    localStorage.removeItem(

        "finance_module"

    );

}


/* ==========================================
   EXPORT
========================================== */

export {

    Module

};
