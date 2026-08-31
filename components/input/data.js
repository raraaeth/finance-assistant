/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : data.js
   Version      : 2.0.0

   Description :
   Global Input Dynamic Data Engine

   PRINCIPLE :

   Global Workspace
        ↓
   workspace.sheets
        ↓
   API.load()
        ↓
   Google Sheets API
        ↓
   Input Data

   TIDAK ADA :

   - OpenSheet URL
   - Spreadsheet ID hardcode
   - Sheet name hardcode
   - Workspace list hardcode
   - Data source hardcode

   Sumber kebenaran :

   ../../js/workspace.js
   ../../js/api.js

   Compatibility :

   Getter lama tetap disediakan agar
   module workspace yang sekarang
   tidak langsung rusak.
===================================================== */


/* =====================================================
   IMPORT GLOBAL WORKSPACE
===================================================== */

import {

    getWorkspaceConfig

} from "../../js/workspace.js";


/* =====================================================
   IMPORT GLOBAL API
===================================================== */

import {

    API

} from "../../js/api.js";


/* =====================================================
   DATA STATE
===================================================== */

const Data = {

    workspace :

        null,

    sheets :

        [],

    raw :

        [],

    data :

        [],

    loaded :

        false

};


/* =====================================================
   NORMALIZE SHEETS
===================================================== */

function normalizeSheets(

    workspaceConfig

){

    if(

        !workspaceConfig

        ||

        !Array.isArray(

            workspaceConfig.sheets

        )

    ){

        return [];

    }


    return workspaceConfig.sheets

        .filter(

            sheet =>

                typeof sheet ===

                    "string"

                &&

                sheet.trim() !== ""

        )

        .map(

            sheet =>

                sheet.trim()

        );

}


/* =====================================================
   LOAD INPUT DATA
===================================================== */

/*
   Workspace tidak menentukan
   source secara manual.

   Contoh :

   workspace = "airdrop"

        ↓

   global workspace.js

        ↓

   sheets :

       [
           "airdrop",
           "airdrop_rules"
       ]

        ↓

   API.load()

        ↓

   Google Sheets API
*/

export async function loadInputData(

    workspace

){

    console.log(

        "=========================================="

    );

    console.log(

        "===== GLOBAL INPUT DATA LOAD ====="

    );

    console.log(

        "=========================================="

    );


    /* =================================================
       VALIDATE WORKSPACE
    ================================================= */

    if(

        !workspace

    ){

        throw new Error(

            "Global Input Data: workspace tidak ditemukan."

        );

    }


    /* =================================================
       GET GLOBAL WORKSPACE CONFIG
    ================================================= */

    const workspaceConfigs =

        getWorkspaceConfig();


    if(

        !workspaceConfigs

        ||

        typeof workspaceConfigs !==

            "object"

    ){

        throw new Error(

            "Global Input Data: konfigurasi workspace global tidak ditemukan."

        );

    }


    /* =================================================
       GET CURRENT WORKSPACE
    ================================================= */

    const config =

        workspaceConfigs[

            workspace

        ];


    if(

        !config

    ){

        throw new Error(

            `Global Input Data: workspace "${workspace}" tidak terdaftar.`

        );

    }


    /* =================================================
       GET SHEETS
    ================================================= */

    const sheets =

        normalizeSheets(

            config

        );


    if(

        sheets.length < 2

    ){

        throw new Error(

            `Global Input Data: workspace "${workspace}" tidak memiliki dua sheet inti.`

        );

    }


    const rawSheet =

        sheets[0];


    const dataSheet =

        sheets[1];


    /* =================================================
       DEBUG CONFIG
    ================================================= */

    console.log(

        "Input Workspace:",

        workspace

    );


    console.log(

        "Workspace Config:",

        config

    );


    console.log(

        "Input Sheets:",

        sheets

    );


    console.log(

        "Raw Sheet:",

        rawSheet

    );


    console.log(

        "Data Sheet:",

        dataSheet

    );


    /* =================================================
       LOAD GOOGLE SHEETS
    ================================================= */

    const result =

        await API.load(

            rawSheet,

            dataSheet

        );


    /* =================================================
       VALIDATE RESULT
    ================================================= */

    if(

        !result

        ||

        result.success !== true

    ){

        throw new Error(

            `Global Input Data: gagal membaca data workspace "${workspace}".`

        );

    }


    /* =================================================
       SAVE STATE
    ================================================= */

    Data.workspace =

        workspace;


    Data.sheets =

        sheets;


    Data.raw =

        Array.isArray(

            API.raw

        )

        ?

        [

            ...API.raw

        ]

        :

        [];


    Data.data =

        Array.isArray(

            API.data

        )

        ?

        [

            ...API.data

        ]

        :

        [];


    Data.loaded =

        true;


    /* =================================================
       DEBUG RESPONSE
    ================================================= */

    console.log(

        "=========================================="

    );

    console.log(

        "===== GLOBAL INPUT DATA READY ====="

    );

    console.log(

        "=========================================="

    );


    console.log(

        "Workspace:",

        Data.workspace

    );


    console.log(

        "Sheets:",

        Data.sheets

    );


    console.log(

        "RAW Count:",

        Data.raw.length

    );


    console.log(

        "DATA Count:",

        Data.data.length

    );


    console.log(

        "RAW:",

        Data.raw

    );


    console.log(

        "DATA:",

        Data.data

    );


    console.log(

        "=========================================="

    );


    return {

        success :

            true,

        workspace :

            Data.workspace,

        sheets :

            [

                ...Data.sheets

            ],

        raw :

            [

                ...Data.raw

            ],

        data :

            [

                ...Data.data

            ]

    };

}


/* =====================================================
   GET CURRENT WORKSPACE
===================================================== */

export function getInputWorkspace(){

    return Data.workspace;

}


/* =====================================================
   GET SHEETS
===================================================== */

export function getInputSheets(){

    return [

        ...Data.sheets

    ];

}


/* =====================================================
   GET RAW DATA
===================================================== */

/*
   RAW :

   sheet pertama workspace.

   Contoh Airdrop :

       airdrop
*/

export function getInputRaw(){

    return [

        ...Data.raw

    ];

}


/* =====================================================
   GET DATA
===================================================== */

/*
   DATA :

   sheet kedua workspace.

   Contoh Airdrop :

       airdrop_rules

   Financial :

       financial_activity

   Saving :

       saving_bank

   Kas :

       kas_member

   Payroll Daily :

       payroll_daily_rules

   Payroll Monthly :

       payroll_monthly_rules
*/

export function getInputData(){

    return [

        ...Data.data

    ];

}


/* =====================================================
   GET RULE DATA
===================================================== */

/*
   Alias generic.

   Untuk workspace yang sheet keduanya
   merupakan rules / master data.
*/

export function getInputRules(){

    return [

        ...Data.data

    ];

}


/* =====================================================
   IS LOADED
===================================================== */

export function isInputDataLoaded(){

    return Data.loaded === true;

}


/* =====================================================
   CLEAR
===================================================== */

export function clearInputData(){

    Data.workspace =

        null;


    Data.sheets =

        [];


    Data.raw =

        [];


    Data.data =

        [];


    Data.loaded =

        false;

}


/* =====================================================
   COMPATIBILITY :
   KAS
===================================================== */

/*
   Sementara dipertahankan agar
   kas.js lama tidak rusak.

   Tidak ada lagi source hardcode.

   Data berasal dari sheet kedua
   workspace aktif.
*/

export function getKasMembers(){

    if(

        Data.workspace !==

            "kas"

    ){

        return [];

    }


    return [

        ...Data.data

    ]

    .filter(

        item =>

            item &&

            typeof item ===

                "object"

    )

    .filter(

        item =>

            typeof item.nama ===

                "string"

            &&

            item.nama.trim() !== ""

    )

    .map(

        item => ({

            value :

                item.nama.trim(),

            label :

                item.nama.trim()

        })

    );

}


/* =====================================================
   COMPATIBILITY :
   FINANCIAL
===================================================== */

export function getFinancialActivity(){

    if(

        Data.workspace !==

            "financial"

    ){

        return [];

    }


    return [

        ...Data.data

    ];

}


/* =====================================================
   COMPATIBILITY :
   SAVING
===================================================== */

export function getSavingBanks(){

    if(

        Data.workspace !==

            "saving"

    ){

        return [];

    }


    return [

        ...Data.data

    ]

    .filter(

        item =>

            item &&

            typeof item ===

                "object"

    )

    .filter(

        item =>

            typeof item.nama ===

                "string"

            &&

            item.nama.trim() !== ""

    )

    .map(

        item => ({

            value :

                item.nama.trim(),

            label :

                item.nama.trim()

        })

    );

}


/* =====================================================
   COMPATIBILITY :
   PAYROLL DAILY
===================================================== */

export function getPayrollDailyRules(){

    if(

        Data.workspace !==

            "payroll-daily"

    ){

        return [];

    }


    return [

        ...Data.data

    ];

}


/* =====================================================
   COMPATIBILITY :
   PAYROLL MONTHLY
===================================================== */

export function getPayrollMonthlyRules(){

    if(

        Data.workspace !==

            "payroll-monthly"

    ){

        return [];

    }


    return [

        ...Data.data

    ];

}


/* =====================================================
   DEBUG
===================================================== */

export function debugInputData(){

    console.log(

        "=========================================="

    );

    console.log(

        "===== GLOBAL INPUT DATA DEBUG ====="

    );

    console.log(

        "=========================================="

    );


    console.log(

        "Workspace:",

        Data.workspace

    );


    console.log(

        "Sheets:",

        Data.sheets

    );


    console.log(

        "Loaded:",

        Data.loaded

    );


    console.log(

        "RAW:",

        Data.raw

    );


    console.log(

        "DATA:",

        Data.data

    );


    console.log(

        "=========================================="

    );


    return {

        workspace :

            Data.workspace,

        sheets :

            [

                ...Data.sheets

            ],

        loaded :

            Data.loaded,

        raw :

            [

                ...Data.raw

            ],

        data :

            [

                ...Data.data

            ]

    };

}
