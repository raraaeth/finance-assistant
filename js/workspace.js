/* =====================================================
   Finance Assistant
   Module      : Workspace
   File        : workspace.js
   Version     : 5.1.0

   Description :
   Workspace Controller

   Tahap 3 :

   Finance Core
        ↓
   Cek sheet inti workspace
        ↓
   exists
        ↓
   Active / Inactive

   Workspace Logic :

   exists
   = kedua sheet inti workspace tersedia.

   active
   = workspace yang sedang dipilih user
     melalui local storage.

   inactive
   = workspace sudah lengkap
     tetapi belum sedang dipilih.

   Workspace yang belum lengkap
   tidak dianggap tersedia.

   TIDAK menangani:
   - Google OAuth
   - Finance Assistant Folder
   - Finance Core
   - Account
   - Onboarding
   - Create Workspace
   - Membuat sheet workspace
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadWorkspace,

    saveWorkspace

} from "./storage.js";


import {

    loadSession,

    getGoogleProviderToken

} from "./auth.js";


import {

    loadModuleInfo

} from "./module.js";


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

const WorkspaceConfig = {

    sheetsApi :

        "https://sheets.googleapis.com/v4",

    storageKey :

        "finance_workspace_modules"

};


/* =====================================================
   WORKSPACE REGISTRY
===================================================== */

const WORKSPACES = {

    financial : {

        id :

            "financial",

        title :

            "Financial",

        icon :

            "📊",

        sheets : [

            "financial",

            "financial_activity"

        ],

        module :

            Financial

    },


    saving : {

        id :

            "saving",

        title :

            "Saving",

        icon :

            "🏦",

        sheets : [

            "saving",

            "saving_bank"

        ],

        module :

            Saving

    },


    kas : {

        id :

            "kas",

        title :

            "Kas Bersama",

        icon :

            "👥",

        sheets : [

            "kas",

            "kas_member"

        ],

        module :

            Kas

    },


    "payroll-daily" : {

        id :

            "payroll-daily",

        title :

            "Payroll Daily",

        icon :

            "💰",

        sheets : [

            "payroll_daily",

            "payroll_daily_rules"

        ],

        module :

            PayrollDaily

    },


    "payroll-monthly" : {

        id :

            "payroll-monthly",

        title :

            "Payroll Monthly",

        icon :

            "💼",

        sheets : [

            "payroll_monthly",

            "payroll_monthly_rules"

        ],

        module :

            PayrollMonthly

    },


    airdrop : {

        id :

            "airdrop",

        title :

            "Airdrop",

        icon :

            "🎁",

        sheets : [

            "airdrop",

            "airdrop_rules"

        ],

        module :

            Airdrop

    }

};


/* =====================================================
   STATE
===================================================== */

const WorkspaceState = {

    modules :

        {},

    active :

        null,

    initialized :

        false

};


/* =====================================================
   GET WORKSPACE CONFIG
===================================================== */

export function getWorkspaceConfig(){

    return WORKSPACES;

}


/* =====================================================
   GET WORKSPACE STATUS
===================================================== */

export function getWorkspaceStatus(){

    return {

        ...WorkspaceState.modules

    };

}


/* =====================================================
   GET ACTIVE WORKSPACE
===================================================== */

export function getActiveWorkspace(){

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
   GET GOOGLE TOKEN
===================================================== */

async function getGoogleToken(){

    const token =

        await getGoogleProviderToken();


    if(

        !token

    ){

        throw new Error(

            "Google Provider Token tidak ditemukan."

        );

    }


    return token;

}


/* =====================================================
   GET FINANCE CORE SHEETS
===================================================== */

async function getFinanceCoreSheets(

    accessToken,

    spreadsheetId

){

    console.log(

        "===== CHECK FINANCE CORE SHEETS ====="

    );


    console.log(

        "Finance Core:",

        spreadsheetId

    );


    const url =

        WorkspaceConfig.sheetsApi

        +

        "/spreadsheets/"

        +

        encodeURIComponent(

            spreadsheetId

        )

        +

        "?fields=spreadsheetId,properties.title,sheets.properties";


    const response =

        await fetch(

            url,

            {

                method :

                    "GET",

                headers : {

                    Authorization :

                        `Bearer ${accessToken}`

                }

            }

        );


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

        console.error(

            "Google Sheets Raw Response:",

            text

        );


        throw new Error(

            "Response Google Sheets tidak valid."

        );

    }


    if(

        !response.ok

    ){

        console.error(

            "Google Sheets Error:",

            data

        );


        throw new Error(

            data
            ?.error
            ?.message

            ||

            `Google Sheets Error ${response.status}`

        );

    }


    const sheets =

        data?.sheets

        ||

        [];


    return sheets

        .map(

            sheet =>

                sheet
                ?.properties
                ?.title

        )

        .filter(

            Boolean

        );

}


/* =====================================================
   CHECK WORKSPACE SHEETS
===================================================== */

function checkWorkspaceSheets(

    workspace,

    existingSheets

){

    const requiredSheets =

        workspace.sheets;


    const sheetStatus =

        requiredSheets.map(

            sheetName => ({

                name :

                    sheetName,

                exists :

                    existingSheets.includes(

                        sheetName

                    )

            })

        );


    const exists =

        sheetStatus.every(

            sheet =>

                sheet.exists === true

        );


    return {

        id :

            workspace.id,


        title :

            workspace.title,


        icon :

            workspace.icon,


        sheets :

            sheetStatus,


        exists :


            exists,


        active :

            false

    };

}


/* =====================================================
   REFRESH WORKSPACES
===================================================== */

export async function refreshWorkspaces(){

    console.log(

        "=========================================="

    );


    console.log(

        "===== WORKSPACE REFRESH ====="

    );


    console.log(

        "=========================================="

    );


    /* =============================================
       FINANCE CORE
    ============================================= */

    const financeCore =

        getFinanceCore();


    if(

        !financeCore

    ){

        console.warn(

            "Finance Core belum ditemukan."

        );


        WorkspaceState.modules = {};

        WorkspaceState.active = null;

        WorkspaceState.initialized = true;


        saveWorkspaceStatus(

            {}

        );


        return {};

    }


    console.log(

        "Finance Core ditemukan:",

        financeCore

    );


    /* =============================================
       GOOGLE TOKEN
    ============================================= */

    const accessToken =

        await getGoogleToken();


    /* =============================================
       GET SHEETS
    ============================================= */

    const existingSheets =

        await getFinanceCoreSheets(

            accessToken,

            financeCore.id

        );


    console.log(

        "Sheet yang tersedia:",

        existingSheets

    );


    /* =============================================
       CHECK ALL WORKSPACES
    ============================================= */

    const modules = {};


    Object.values(

        WORKSPACES

    )

    .forEach(

        workspace => {

            const status =

                checkWorkspaceSheets(

                    workspace,

                    existingSheets

                );


            modules[

                workspace.id

            ] = status;


            console.log(

                `Workspace "${workspace.id}"`,

                {

                    required :

                        workspace.sheets,

                    exists :

                        status.exists

                }

            );

        }

    );


    /* =============================================
       CURRENT ACTIVE
    ============================================= */

    const current =

        getActiveWorkspace();


    let active =

        null;


    /*
     * Workspace hanya boleh menjadi
     * active jika kedua sheet intinya ada.
     */

    if(

        current

        &&

        modules[current]

        &&

        modules[current].exists === true

    ){

        active =

            current;

    }


    /* =============================================
       APPLY ACTIVE STATUS
    ============================================= */

    Object.keys(

        modules

    )

    .forEach(

        key => {

            modules[key].active =

                key === active;

        }

    );


    /* =============================================
       SAVE STATE
    ============================================= */

    WorkspaceState.modules =

        modules;


    WorkspaceState.active =

        active;


    WorkspaceState.initialized =

        true;


    saveWorkspaceStatus(

        modules

    );


    console.log(

        "===== WORKSPACE STATUS ====="

    );


    console.log(

        modules

    );


    console.log(

        "Active Workspace:",

        active

    );


    console.log(

        "===== WORKSPACE REFRESH COMPLETE ====="

    );


    return modules;

}


/* =====================================================
   SAVE WORKSPACE STATUS
===================================================== */

function saveWorkspaceStatus(

    modules

){

    localStorage.setItem(

        WorkspaceConfig.storageKey,

        JSON.stringify(

            modules

        )

    );

}


/* =====================================================
   LOAD WORKSPACE STATUS
===================================================== */

export function loadWorkspaceStatus(){

    const data =

        localStorage.getItem(

            WorkspaceConfig.storageKey

        );


    if(

        !data

    ){

        return {};

    }


    try{

        return JSON.parse(

            data

        );

    }catch(error){

        console.error(

            "Gagal membaca workspace status:",

            error

        );


        localStorage.removeItem(

            WorkspaceConfig.storageKey

        );


        return {};

    }

}


/* =====================================================
   CHECK WORKSPACE EXISTS
===================================================== */

export function workspaceExists(

    moduleKey

){

    return (

        WorkspaceState
        .modules
        ?.[moduleKey]
        ?.exists

        === true

    );

}


/* =====================================================
   CHECK WORKSPACE ACTIVE
===================================================== */

export function workspaceIsActive(

    moduleKey

){

    return (

        WorkspaceState.active

        ===

        moduleKey

    );

}


/* =====================================================
   SET ACTIVE WORKSPACE
===================================================== */

export function setActiveWorkspace(

    moduleKey

){

    console.log(

        "===== SET ACTIVE WORKSPACE ====="

    );


    console.log(

        "Workspace:",

        moduleKey

    );


    /* =============================================
       VALIDATE CONFIG
    ============================================= */

    const workspace =

        WORKSPACES[

            moduleKey

        ];


    if(

        !workspace

    ){

        throw new Error(

            `Workspace "${moduleKey}" tidak ditemukan.`

        );

    }


    /* =============================================
       VALIDATE EXISTS
    ============================================= */

    if(

        !workspaceExists(

            moduleKey

        )

    ){

        throw new Error(

            `Workspace "${workspace.title}" belum dibuat lengkap.`

        );

    }


    /* =============================================
       SAVE ACTIVE
    ============================================= */

    const current =

        loadWorkspace()

        ||

        {};


    saveWorkspace({

        ...current,

        workspace :

            moduleKey

    });


    /* =============================================
       UPDATE MEMORY
    ============================================= */

    WorkspaceState.active =

        moduleKey;


    Object.keys(

        WorkspaceState.modules

    )

    .forEach(

        key => {

            WorkspaceState.modules[key].active =

                key === moduleKey;

        }

    );


    saveWorkspaceStatus(

        WorkspaceState.modules

    );


    console.log(

        "Workspace aktif:",

        moduleKey

    );


    return (

        WorkspaceState.modules

    );

}


/* =====================================================
   GET WORKSPACE STATE

   Digunakan Profile.

   Return:

   {
       active: {...} | null,

       inactive: [...]
   }

   Hanya workspace yang exists === true
   yang dikirim.

===================================================== */

export async function getWorkspaceState(){

    console.log(

        "===== GET WORKSPACE STATE ====="

    );


    /*
     * Pastikan status terbaru sudah
     * diperiksa dari Finance Core.
     */

    await refreshWorkspaces();


    const activeId =

        WorkspaceState.active;


    let active =

        null;


    const inactive = [];


    Object.values(

        WorkspaceState.modules

    )

    .forEach(

        workspace => {

            if(

                workspace.exists !== true

            ){

                return;

            }


            const item = {

                id :

                    workspace.id,

                title :

                    workspace.title,

                icon :

                    workspace.icon,

                sheets :

                    workspace.sheets,

                exists :

                    true

            };


            if(

                workspace.id === activeId

            ){

                active =

                    item;

            }else{

                inactive.push(

                    item

                );

            }

        }

    );


    const result = {

        active :

            active,


        inactive :

            inactive

    };


    console.log(

        "Workspace State:",

        result

    );


    return result;

}


/* =====================================================
   GET ALL WORKSPACES
===================================================== */

export function getWorkspaces(){

    return Object.values(

        WORKSPACES

    )

    .map(

        workspace => {

            const status =

                WorkspaceState
                .modules
                ?.[workspace.id]

                ||

                {

                    id :

                        workspace.id,

                    title :

                        workspace.title,

                    icon :

                        workspace.icon,

                    sheets :

                        workspace.sheets.map(

                            name => ({

                                name :

                                    name,

                                exists :

                                    false

                            })

                        ),

                    exists :

                        false,

                    active :

                        false

                };


            return {

                ...status

            };

        }

    );

}


/* =====================================================
   GET AVAILABLE WORKSPACES
===================================================== */

export function getAvailableWorkspaces(){

    return getWorkspaces()

        .filter(

            workspace =>

                workspace.exists === true

        );

}


/* =====================================================
   GET ACTIVE WORKSPACE INFO
===================================================== */

export function getActiveWorkspaceInfo(){

    const active =

        WorkspaceState.active;


    if(

        !active

    ){

        return null;

    }


    return (

        WorkspaceState
        .modules
        ?.[active]

        ||

        null

    );

}


/* =====================================================
   INIT WORKSPACE
===================================================== */

export async function initWorkspace(){

    console.log(

        "=========================================="

    );


    console.log(

        "===== WORKSPACE INITIALIZE ====="

    );


    console.log(

        "=========================================="

    );


    try{

        /* =============================================
           CHECK SESSION
        ============================================= */

        const session =

            await loadSession();


        if(

            !session

        ){

            console.log(

                "Workspace: User belum login."

            );


            WorkspaceState.modules = {};

            WorkspaceState.active = null;

            WorkspaceState.initialized = true;


            return null;

        }


        /* =============================================
           REFRESH STATUS
        ============================================= */

        await refreshWorkspaces();


        /* =============================================
           ACTIVE
        ============================================= */

        const active =

            WorkspaceState.active;


        if(

            !active

        ){

            console.log(

                "Belum ada Workspace yang dipilih."

            );


            return null;

        }


        /* =============================================
           GET MODULE
        ============================================= */

        const workspace =

            WORKSPACES[

                active

            ];


        if(

            !workspace

        ){

            console.warn(

                `Workspace "${active}" tidak ditemukan.`

            );


            return null;

        }


        /* =============================================
           VALIDATE EXISTS
        ============================================= */

        if(

            !workspaceExists(

                active

            )

        ){

            console.warn(

                `Workspace "${active}" belum lengkap.`

            );


            return null;

        }


        /* =============================================
           START MODULE
        ============================================= */

        console.log(

            "Workspace aktif:",

            workspace.title

        );


        if(

            !workspace.module

        ){

            console.warn(

                `Module "${active}" belum memiliki controller.`

            );


            return null;

        }


        if(

            typeof workspace.module.init !==

            "function"

        ){

            console.warn(

                `Module "${active}" tidak memiliki fungsi init().`

            );


            return null;

        }


        await workspace.module.init();


        return workspace;


    }catch(error){

        console.error(

            "===== WORKSPACE INITIALIZE ERROR ====="

        );


        console.error(

            error

        );


        return null;

    }

}


/* =====================================================
   AUTO INITIALIZE
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        initWorkspace();

    }

);


/* =====================================================
   EXPORT
===================================================== */

export {

    WORKSPACES,

    WorkspaceState

};
