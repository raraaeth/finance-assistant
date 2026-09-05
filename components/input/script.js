/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : script.js
   Version      : 6.3.0

   Description :
   Global Input Controller

   Handles :
   - Load HTML
   - Init
   - Open
   - Open Edit Input
   - Close
   - Global Workspace connection
   - Input Data connection

   PRINCIPLE :

   Global js/workspace.js
        ↓
   active workspace
        ↓
   Global Input
        ↓
   ┌─────────────────────────────┐
   │                             │
   │  Normal Input               │
   │      ↓                      │
   │  data.js                    │
   │      ↓                      │
   │  flow.js                    │
   │                             │
   │  Edit Input                 │
   │      ↓                      │
   │  workspace edit controller  │
   │      ↓                      │
   │  Reward / EditRow engine    │
   │                             │
   └─────────────────────────────┘

   Edit Controller :
   - Airdrop
   - Financial
   - Kas
   - Payroll Monthly
   - Payroll Daily
   - Saving

   Principle :
   - Tidak mengubah Normal Input.
   - Tidak menyimpan logic workspace di sini.
   - script.js hanya melakukan routing.
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {
    State
} from "./state.js";


import {
    getActiveWorkspace,
    getWorkspaceConfig
} from "../../js/workspace.js";


import {
    initSession
} from "./session.js";


import {
    startFlow
} from "./flow.js";


import {
    initTransaction
} from "./transaction.js";


import {
    loadInputData
} from "./data.js";


/* =====================================================
   STATE
===================================================== */

let initialized = false;


/* =====================================================
   INPUT
===================================================== */

export const Input = {


    /* =================================================
       INIT
    ================================================= */

    async init(){

        if(
            initialized
        ){

            return;

        }


        /* =============================================
           LOAD HTML
        ============================================= */

        const overlay =
            await loadHTML();


        if(
            !overlay
        ){

            console.error(
                "Global Input gagal dimuat."
            );

            return;

        }


        /* =============================================
           TRANSACTION
        ============================================= */

        initTransaction();


        /* =============================================
           CLOSE BUTTON
        ============================================= */

        const closeButton =
            document.getElementById(
                "global-input-close"
            );


        if(
            closeButton
        ){

            closeButton.addEventListener(
                "click",
                () => {

                    Input.close();

                }
            );

        }


        /* =============================================
           BACKDROP
        ============================================= */

        const backdrop =
            document.getElementById(
                "global-input-backdrop"
            );


        if(
            backdrop
        ){

            backdrop.addEventListener(
                "click",
                () => {

                    Input.close();

                }
            );

        }


        /* =============================================
           ESC
        ============================================= */

        document.addEventListener(
            "keydown",
            event => {

                if(
                    event.key === "Escape"
                ){

                    Input.close();

                }

            }
        );


        initialized =
            true;

    },


    /* =================================================
       OPEN

       NORMAL INPUT

       Flow lama tetap dipertahankan.
    ================================================= */

    async open(
        workspace = null
    ){

        console.log(
            "INPUT OPEN",
            workspace
        );


        /* =============================================
           INIT
        ============================================= */

        await Input.init();


        if(
            !initialized
        ){

            console.error(
                "INPUT INIT gagal."
            );

            return;

        }


        /* =============================================
           ROOT
        ============================================= */

        const overlay =
            document.getElementById(
                "global-input-overlay"
            );


        if(
            !overlay
        ){

            console.error(
                "Element #global-input-overlay tidak ditemukan."
            );

            return;

        }


        console.log(
            "INPUT ROOT",
            overlay
        );


        /* =============================================
           RESOLVE WORKSPACE

           Workspace berasal dari
           global js/workspace.js.
        ============================================= */

        const activeWorkspace =
            workspace
            ||
            getActiveWorkspace();


        console.log(
            "INPUT ACTIVE WORKSPACE:",
            activeWorkspace
        );


        /* =============================================
           VALIDATE WORKSPACE
        ============================================= */

        if(
            !activeWorkspace
        ){

            console.warn(
                "Global Input: workspace tidak ditemukan."
            );

            return;

        }


        /* =============================================
           GLOBAL WORKSPACE CONFIG
        ============================================= */

        const workspaceConfig =
            getWorkspaceConfig()
            ?.[
                activeWorkspace
            ];


        if(
            !workspaceConfig
        ){

            console.warn(
                "Global Input: konfigurasi workspace tidak ditemukan:",
                activeWorkspace
            );

            return;

        }


        console.log(
            "INPUT WORKSPACE CONFIG:",
            workspaceConfig
        );


        /* =============================================
           LOAD INPUT DATA

           data.js bertugas membaca data
           berdasarkan workspace.
        ============================================= */

        const inputData =
            await loadInputData(
                activeWorkspace
            );


        console.log(
            "INPUT DATA:",
            inputData
        );


        /* =============================================
           RESET STATE
        ============================================= */

        State.reset();


        /* =============================================
           SET WORKSPACE
        ============================================= */

        State.workspace =
            activeWorkspace;


        /* =============================================
           SET CONFIG
        ============================================= */

        State.config =
            workspaceConfig
            ||
            {};


        /* =============================================
           SESSION
        ============================================= */

        initSession(
            activeWorkspace
        );


        /* =============================================
           HEADER
        ============================================= */

        renderHeader();


        /* =============================================
           WORKSPACE
        ============================================= */

        renderWorkspace();


        /* =============================================
           FLOW
        ============================================= */

        startFlow();


        /* =============================================
           SHOW
        ============================================= */

        overlay.classList.add(
            "is-open"
        );


        document.body.classList.add(
            "input-open"
        );


        console.log(
            "INPUT FLOW STARTED"
        );

    },


    /* =================================================
       OPEN EDIT

       Controller entry point untuk Edit Input.

       Supported :

       Input.openEdit(
           "airdrop",
           "reward"
       );

       Input.openEdit(
           "airdrop",
           "row"
       );

       Input.openEdit(
           "financial",
           "row"
       );

       Input.openEdit(
           "kas",
           "row"
       );

       Input.openEdit(
           "payroll-monthly",
           "row"
       );

       Input.openEdit(
           "payroll-daily",
           "row"
       );

       Input.openEdit(
           "saving",
           "row"
       );

       atau :

       Input.openEdit({
           workspace: "airdrop",
           mode: "row"
       });

       Penting :
       - Tidak memakai flow.js
       - Tidak mengubah Normal Input
       - Tidak menyimpan logic workspace di sini
       - Workspace menentukan engine/edit flow
    ================================================= */

    async openEdit(
        workspace = null,
        mode = null
    ){

        /* =============================================
           NORMALIZE EDIT REQUEST

           Mendukung dua bentuk API :

           1. Legacy / positional :
              openEdit(workspace, mode)

           2. Context object :
              openEdit({
                  workspace,
                  mode
              })

           Bentuk object dipakai agar selaras dengan
           controller workspace.
        ============================================= */

        let editWorkspace =
            workspace;

        let editMode =
            mode;


        if(
            workspace
            &&
            typeof workspace === "object"
            &&
            !Array.isArray(workspace)
        ){

            editWorkspace =
                workspace.workspace
                ??
                null;

            editMode =
                workspace.mode
                ??
                null;

        }


        console.log(
            "INPUT EDIT OPEN",
            {
                workspace:
                    editWorkspace,

                mode:
                    editMode
            }
        );


        /* =============================================
           RESOLVE WORKSPACE
        ============================================= */

        const activeWorkspace =
            editWorkspace
            ||
            getActiveWorkspace();


        if(
            !activeWorkspace
        ){

            console.warn(
                "Global Input Edit: workspace tidak ditemukan."
            );

            return;

        }


        /* =============================================
           VALIDATE MODE
        ============================================= */

        if(
            !editMode
        ){

            console.warn(
                "Global Input Edit: mode edit belum ditentukan."
            );

            return;

        }


        /* =============================================
           GLOBAL WORKSPACE CONFIG
        ============================================= */

        const workspaceConfig =
            getWorkspaceConfig()
            ?.[
                activeWorkspace
            ];


        if(
            !workspaceConfig
        ){

            console.warn(
                "Global Input Edit: konfigurasi workspace tidak ditemukan:",
                activeWorkspace
            );

            return;

        }


        /* =============================================
           LOAD INPUT DATA

           Edit Input tetap menggunakan sumber data
           Global Input yang sama.
        ============================================= */

        const inputData =
            await loadInputData(
                activeWorkspace
            );


        console.log(
            "INPUT EDIT DATA:",
            inputData
        );


        /* =============================================
           PREPARE EDIT STATE

           Hanya state edit yang dibersihkan.

           State Normal Input tidak di-reset karena
           Edit Input bukan bagian dari flow normal.
        ============================================= */

        clearEditState();


        /* =============================================
           SET WORKSPACE
        ============================================= */

        State.workspace =
            activeWorkspace;


        /* =============================================
           SET CONFIG
        ============================================= */

        State.config =
            workspaceConfig;


        /* =============================================
           SET EDIT MODE
        ============================================= */

        if(
            typeof State.setEditMode ===
            "function"
        ){

            State.setEditMode(
                editMode
            );

        }
        else{

            State.editMode =
                editMode;

        }


        /* =============================================
           STORE EDIT DATA

           Jangan mengubah struktur State lama.

           Jika State menyediakan setter/data khusus,
           gunakan setter tersebut.
        ============================================= */

        if(
            typeof State.setInputData ===
            "function"
        ){

            State.setInputData(
                inputData
            );

        }
        else if(
            "inputData" in State
        ){

            State.inputData =
                inputData;

        }


        /* =============================================
           WORKSPACE EDIT CONTROLLER

           Workspace-specific JS yang menentukan
           bagaimana UI Edit Input dibuka.

           Contoh :

           Airdrop :
              reward → Reward
              row    → EditRow

           Workspace lain :
              row    → EditRow
        ============================================= */

        const editController =
            await loadEditController(
                activeWorkspace,
                editMode
            );


        if(
            !editController
        ){

            console.warn(
                "Global Input Edit: edit controller tidak ditemukan.",
                {
                    workspace:
                        activeWorkspace,

                    mode:
                        editMode
                }
            );

            return;

        }


        /* =============================================
           OPEN EDIT

           Controller workspace bertanggung jawab
           membuat / membuka UI edit.

           Context object menjadi format utama.
        ============================================= */

        const editContext = {

            workspace:
                activeWorkspace,

            mode:
                editMode,

            data:
                inputData,

            state:
                State

        };


        if(
            typeof editController.openEdit ===
            "function"
        ){

            return await editController.openEdit(
                editContext
            );

        }


        /* =============================================
           FALLBACK

           Jika module memakai nama open(),
           tetap bisa digunakan tanpa mengubah
           controller global.
        ============================================= */

        if(
            typeof editController.open ===
            "function"
        ){

            return await editController.open(
                editContext
            );

        }


        console.warn(
            "Global Input Edit: controller tidak memiliki openEdit() atau open().",
            editController
        );

    },


    /* =================================================
       CLOSE

       Menutup Normal Input.

       Edit Input yang memiliki overlay sendiri
       ditutup oleh workspace edit controller.
    ================================================= */

    close(){

        const overlay =
            document.getElementById(
                "global-input-overlay"
            );


        if(
            !overlay
        ){

            return;

        }


        overlay.classList.remove(
            "is-open"
        );


        document.body.classList.remove(
            "input-open"
        );

    }

};


/* =====================================================
   CLEAR EDIT STATE
===================================================== */

function clearEditState(){

    /* =============================================
       SELECTED RECORD
    ============================================= */

    if(
        typeof State.clearEditSelectedRecord ===
        "function"
    ){

        State.clearEditSelectedRecord();

    }
    else{

        State.editSelectedRecord =
            null;

    }


    /* =============================================
       EDIT TRANSACTIONS
    ============================================= */

    if(
        typeof State.clearEditTransactions ===
        "function"
    ){

        State.clearEditTransactions();

    }
    else{

        State.editTransactions =
            [];

    }

}


/* =====================================================
   LOAD EDIT CONTROLLER
===================================================== */

async function loadEditController(
    workspace,
    mode
){

    const normalizedWorkspace =
        String(
            workspace
            ??
            ""
        )
        .trim()
        .toLowerCase();


    const normalizedMode =
        String(
            mode
            ??
            ""
        )
        .trim()
        .toLowerCase();


    if(
        !normalizedWorkspace
    ){

        return null;

    }


    if(
        !normalizedMode
    ){

        console.warn(
            "Global Input Edit: mode edit belum ditentukan."
        );

        return null;

    }


    /* =============================================
       WORKSPACE EDIT MAP

       Semua file workspace berada di
       components/input/.

       Global controller hanya melakukan routing.

       Normal Input TIDAK melewati map ini.
    ============================================= */

    const controllerMap = {

        /* =========================================
           AIRDROP
        ========================================= */

        airdrop: {

            reward :
                "./airdrop.js",

            row :
                "./airdrop.js"

        },


        /* =========================================
           FINANCIAL
        ========================================= */

        financial: {

            row :
                "./financial.js"

        },


        /* =========================================
           KAS
        ========================================= */

        kas: {

            row :
                "./kas.js"

        },


        /* =========================================
           PAYROLL MONTHLY
        ========================================= */

        "payroll-monthly": {

            row :
                "./monthly.js"

        },


        /* =========================================
           PAYROLL DAILY
        ========================================= */

        "payroll-daily": {

            row :
                "./daily.js"

        },


        /* =========================================
           SAVING
        ========================================= */

        saving: {

            row :
                "./saving.js"

        }

    };


    const workspaceMap =
        controllerMap[
            normalizedWorkspace
        ];


    if(
        !workspaceMap
    ){

        console.warn(
            "Global Input Edit: workspace edit belum tersedia:",
            normalizedWorkspace
        );

        return null;

    }


    const modulePath =
        workspaceMap[
            normalizedMode
        ];


    if(
        !modulePath
    ){

        console.warn(
            "Global Input Edit: mode edit belum tersedia:",
            {
                workspace:
                    normalizedWorkspace,

                mode:
                    normalizedMode
            }
        );

        return null;

    }


    try{

        const module =
            await import(
                modulePath
            );


        /* =========================================
           PRIORITY

           1. Named export berdasarkan workspace
           2. default export
        ========================================= */

        const controller =
            module[
                getWorkspaceExportName(
                    normalizedWorkspace
                )
            ]
            ??
            module.default
            ??
            null;


        if(
            !controller
        ){

            console.warn(
                "Global Input Edit: export controller tidak ditemukan:",
                {
                    workspace:
                        normalizedWorkspace,

                    mode:
                        normalizedMode,

                    module:
                        modulePath
                }
            );

            return null;

        }


        return controller;

    }
    catch(error){

        console.error(
            "Global Input Edit: gagal memuat edit controller.",
            {
                workspace:
                    normalizedWorkspace,

                mode:
                    normalizedMode,

                module:
                    modulePath,

                error
            }
        );

        return null;

    }

}


/* =====================================================
   WORKSPACE EXPORT NAME
===================================================== */

function getWorkspaceExportName(
    workspace
){

    const map = {

        /* =========================================
           Airdrop
        ========================================= */

        airdrop :
            "Airdrop",


        /* =========================================
           Financial
        ========================================= */

        financial :
            "Financial",


        /* =========================================
           Kas
        ========================================= */

        kas :
            "Kas",


        /* =========================================
           Payroll Monthly
        ========================================= */

        "payroll-monthly" :
            "Monthly",


        /* =========================================
           Payroll Daily
        ========================================= */

        "payroll-daily" :
            "Daily",


        /* =========================================
           Saving
        ========================================= */

        saving :
            "Saving"

    };


    return (
        map[
            workspace
        ]
        ??
        ""
    );

}


/* =====================================================
   LOAD HTML
===================================================== */

async function loadHTML(){

    /* =============================================
       CHECK EXISTING
    ============================================= */

    let overlay =
        document.getElementById(
            "global-input-overlay"
        );


    if(
        overlay
    ){

        return overlay;

    }


    /* =============================================
       FETCH COMPONENT HTML
    ============================================= */

    try{

        const response =
            await fetch(

                new URL(
                    "./index.html",
                    import.meta.url
                )

            );


        if(
            !response.ok
        ){

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const html =
            await response.text();


        /* =========================================
           CREATE DOM
        ========================================= */

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.innerHTML =
            html.trim();


        overlay =
            wrapper.firstElementChild;


        if(
            !overlay
        ){

            throw new Error(
                "Root Global Input tidak ditemukan."
            );

        }


        /* =========================================
           VALIDATE ROOT
        ========================================= */

        if(
            overlay.id !==
            "global-input-overlay"
        ){

            throw new Error(
                "Root Global Input harus menggunakan id global-input-overlay."
            );

        }


        /* =========================================
           APPEND
        ========================================= */

        document.body.appendChild(
            overlay
        );


        return overlay;

    }
    catch(error){

        console.error(
            "Global Input HTML Error:",
            error
        );


        return null;

    }

}


/* =====================================================
   HEADER
===================================================== */

function renderHeader(){

    const title =
        document.getElementById(
            "global-input-title"
        );


    const subtitle =
        document.getElementById(
            "global-input-subtitle"
        );


    /* =============================================
       TITLE
    ============================================= */

    if(
        title
    ){

        title.textContent =
            State.config?.title
            ??
            "Input";

    }


    /* =============================================
       SUBTITLE
    ============================================= */

    if(
        subtitle
    ){

        subtitle.textContent =
            "Tambahkan data";

    }

}


/* =====================================================
   WORKSPACE
===================================================== */

function renderWorkspace(){

    const workspaceElement =
        document.getElementById(
            "global-input-workspace"
        );


    if(
        !workspaceElement
    ){

        return;

    }


    /* =============================================
       WORKSPACE LABEL
    ============================================= */

    workspaceElement.textContent =
        State.config?.title
        ??
        State.workspace
        ??
        "-";

}


/* =====================================================
   DEFAULT
===================================================== */

export default Input;
