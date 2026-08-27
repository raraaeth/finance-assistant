/* =====================================================
   Finance Assistant
   Module      : Workspace
   File        : addworkspace.js
   Version     : 1.0.0

   Description :
   Create Workspace Controller

   Responsibility :
   ------------------------------------------
   1. Mendapatkan Google Provider Access Token
      melalui auth.js

   2. Mendapatkan Finance Core ID
      melalui module.js

   3. Mengirim request:
        action=createModule

      ke Apps Script main.gs

   4. Menerima hasil pembuatan workspace

   5. Refresh Workspace State

   TIDAK menangani :
   - Google OAuth
   - Supabase Auth
   - Login
   - Refresh Token
   - Membuat Finance Core
   - Membuat Folder
   - Membuat Account

   Auth tetap ditangani oleh:
       auth.js

   Workspace status tetap ditangani oleh:
       workspace.js

   Server-side creation:
       main.gs
       module.gs
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    getValidGoogleProviderToken

} from "./auth.js";


import {

    loadModuleInfo

} from "./module.js";


import {

    getWorkspaceConfig,
    workspaceExists,
    refreshWorkspaces

} from "./workspace.js";


/* =====================================================
   CONFIG
===================================================== */

const AddWorkspaceConfig = {

    scriptUrl :

        "https://script.google.com/macros/s/AKfycbxBiQSb1pioB0mDbkAqd6S3y4T5CTByn2-6kW7-T1l-5PdGYTBVDX4IXskxyu_QxokHDw/exec"

};


/* =====================================================
   STATE
===================================================== */

const AddWorkspaceState = {

    loading :

        false,

    current :

        null

};


/* =====================================================
   GET WORKSPACE CONFIG
===================================================== */

export function getAddWorkspaceConfig(){

    return getWorkspaceConfig();

}


/* =====================================================
   GET FINANCE CORE
===================================================== */

function getFinanceCore(){

    const moduleInfo =

        loadModuleInfo();


    if(

        !moduleInfo

    ){

        return null;

    }


    const financeCore =

        moduleInfo.financeCore;


    if(

        !financeCore

        ||

        !financeCore.id

    ){

        return null;

    }


    return financeCore;

}


/* =====================================================
   JSONP REQUEST
===================================================== */

/*
   Apps Script dipanggil melalui JSONP
   karena frontend berjalan di GitHub Pages.

   Contoh:

   ?action=createModule
   &accessToken=XXXX
   &spreadsheetId=XXXX
   &module=saving
   &callback=XXXX
*/

function jsonpRequest(

    params = {}

){

    return new Promise(

        (

            resolve,

            reject

        ) => {


            /* =========================================
               CALLBACK NAME
            ========================================= */

            const callbackName =

                "__financeAssistantCreateWorkspace_"

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


            /* =========================================
               SCRIPT
            ========================================= */

            const script =

                document.createElement(

                    "script"

                );


            /* =========================================
               URL PARAMS
            ========================================= */

            const requestParams =

                new URLSearchParams();


            Object.entries(

                params

            )

            .forEach(

                ([

                    key,

                    value

                ]) => {


                    if(

                        value !==

                        undefined

                        &&

                        value !==

                        null

                    ){

                        requestParams.set(

                            key,

                            value

                        );

                    }

                }

            );


            /* =========================================
               CALLBACK
            ========================================= */

            requestParams.set(

                "callback",

                callbackName

            );


            /* =========================================
               TIMEOUT
            ========================================= */

            let timeout =

                null;


            /* =========================================
               CLEANUP
            ========================================= */

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


            /* =========================================
               CALLBACK HANDLER
            ========================================= */

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


            /* =========================================
               SCRIPT ERROR
            ========================================= */

            script.onerror = function(){

                cleanup();


                reject(

                    new Error(

                        "Gagal menghubungi Apps Script."

                    )

                );

            };


            /* =========================================
               TIMEOUT HANDLER
            ========================================= */

            timeout =

                setTimeout(

                    () => {

                        cleanup();


                        reject(

                            new Error(

                                "Request create workspace timeout."

                            )

                        );

                    },

                    30000

                );


            /* =========================================
               BUILD URL
            ========================================= */

            script.src =

                AddWorkspaceConfig.scriptUrl

                +

                "?"

                +

                requestParams.toString();


            /* =========================================
               DEBUG
            ========================================= */

            console.log(

                "ADD WORKSPACE: Mengirim request createModule..."

            );


            /* =========================================
               SEND
            ========================================= */

            document.head.appendChild(

                script

            );

        }

    );

}


/* =====================================================
   CREATE WORKSPACE
===================================================== */

/*
   Fungsi utama.

   createWorkspace("saving")

   Flow:

       moduleKey
          ↓
       Finance Core
          ↓
       Google Access Token
          ↓
       main.gs
          ↓
       createModuleWorkspace()
          ↓
       Google Sheets
          ↓
       result
          ↓
       refreshWorkspaces()
*/

export async function createWorkspace(

    moduleKey

){

    console.log(

        "=========================================="

    );

    console.log(

        "===== CREATE WORKSPACE ====="

    );

    console.log(

        "=========================================="

    );


    /* =========================================
       VALIDATE MODULE KEY
    ========================================= */

    if(

        !moduleKey

    ){

        throw new Error(

            "Module Key tidak ditemukan."

        );

    }


    /* =========================================
       GET WORKSPACE CONFIG
    ========================================= */

    const workspaces =

        getWorkspaceConfig();


    const workspace =

        workspaces[

            moduleKey

        ];


    if(

        !workspace

    ){

        throw new Error(

            `Workspace "${moduleKey}" tidak ditemukan.`

        );

    }


    console.log(

        "Workspace:",

        workspace

    );


    /* =========================================
       PREVENT DUPLICATE
    ========================================= */

    if(

        workspaceExists(

            moduleKey

        )

    ){

        console.log(

            "Workspace sudah tersedia:",

            moduleKey

        );


        return {

            success :

                true,

            created :

                false,

            module :

                moduleKey,

            message :

                `Workspace "${workspace.title}" sudah tersedia.`

        };

    }


    /* =========================================
       PREVENT DOUBLE REQUEST
    ========================================= */

    if(

        AddWorkspaceState.loading

    ){

        throw new Error(

            "Sedang membuat workspace. Silakan tunggu."

        );

    }


    AddWorkspaceState.loading =

        true;


    AddWorkspaceState.current =

        moduleKey;


    try{


        /* =====================================
           FINANCE CORE
        ===================================== */

        const financeCore =

            getFinanceCore();


        if(

            !financeCore

        ){

            throw new Error(

                "Finance Core belum ditemukan."

            );

        }


        console.log(

            "Finance Core:",

            financeCore.id

        );


        /* =====================================
           GOOGLE ACCESS TOKEN
        ===================================== */

        console.log(

            "ADD WORKSPACE: Meminta Google Provider Token..."

        );


        const accessToken =

            await getValidGoogleProviderToken();


        if(

            !accessToken

        ){

            throw new Error(

                "Google Provider Access Token tidak tersedia."

            );

        }


        console.log(

            "ADD WORKSPACE: Google Provider Token: AVAILABLE"

        );


        /* =====================================
           CREATE MODULE REQUEST
        ===================================== */

        console.log(

            "ADD WORKSPACE: Membuat workspace:",

            moduleKey

        );


        const result =

            await jsonpRequest({

                action :

                    "createModule",


                accessToken :

                    accessToken,


                spreadsheetId :

                    financeCore.id,


                module :

                    moduleKey

            });


        /* =====================================
           RESPONSE
        ===================================== */

        console.log(

            "===== CREATE WORKSPACE RESPONSE ====="

        );


        console.log(

            "Result:",

            result

        );


        /* =====================================
           VALIDATE RESPONSE
        ===================================== */

        if(

            !result

        ){

            throw new Error(

                "Response create workspace kosong."

            );

        }


        if(

            result.success !== true

        ){

            throw new Error(

                result.error

                ||

                result.message

                ||

                "Gagal membuat workspace."

            );

        }


        /* =====================================
           SUCCESS
        ===================================== */

        console.log(

            "=========================================="

        );

        console.log(

            "===== WORKSPACE CREATED ====="

        );

        console.log(

            "=========================================="

        );


        console.log(

            "Module:",

            result.module

        );


        console.log(

            "Created:",

            result.created

        );


        if(

            result.createdSheets

        ){

            console.log(

                "Created Sheets:",

                result.createdSheets

            );

        }


        /* =====================================
           REFRESH WORKSPACE STATE
        ===================================== */

        console.log(

            "ADD WORKSPACE: Refreshing workspace state..."

        );


        try{

            await refreshWorkspaces();


            console.log(

                "ADD WORKSPACE: Workspace state berhasil diperbarui."

            );

        }catch(refreshError){

            console.warn(

                "ADD WORKSPACE: Gagal refresh workspace state:",

                refreshError

            );

        }


        /* =====================================
           RETURN
        ===================================== */

        return result;


    }catch(error){

        console.error(

            "=========================================="

        );

        console.error(

            "===== CREATE WORKSPACE FAILED ====="

        );

        console.error(

            "=========================================="

        );


        console.error(

            "Add Workspace Error:",

            error

        );


        throw error;


    }finally{


        AddWorkspaceState.loading =

            false;


        AddWorkspaceState.current =

            null;

    }

}


/* =====================================================
   CREATE MODULE
===================================================== */

/*
   Alias.

   Bisa digunakan jika UI memakai
   istilah "Create Module".
*/

export async function createModule(

    moduleKey

){

    return await createWorkspace(

        moduleKey

    );

}


/* =====================================================
   CHECK CREATING
===================================================== */

export function isCreatingWorkspace(){

    return (

        AddWorkspaceState.loading

        ===

        true

    );

}


/* =====================================================
   GET CREATE STATE
===================================================== */

export function getCreateWorkspaceState(){

    return {

        ...AddWorkspaceState

    };

}


/* =====================================================
   GLOBAL HELPER
===================================================== */

/*
   Opsional untuk tombol HTML.

   Contoh:

   onclick="createWorkspace('saving')"

   Tidak wajib digunakan jika UI
   memakai addEventListener.
*/

window.createWorkspace =

    createWorkspace;


/* =====================================================
   EXPORT
===================================================== */

export {

    AddWorkspaceState

};
