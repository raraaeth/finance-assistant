/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : flow.js
   Version      : 5.0.0

   Description :
   Global Input Flow Controller

   PRINCIPLE :

   Global Workspace
        ↓
   State.workspace
        ↓
   input/config.js
        ↓
   getInputConfig(workspace)
        ↓
   Workspace Input Config
        ↓
   steps
        ↓
   field.js
        ↓
   input

   Flow hanya bertugas mengumpulkan input.

   Enter / Change
        ↓
   lanjut ke field berikutnya

   Field terakhir selesai
        ↓
   FLOW COMPLETE
        ↓
   Tombol "Tambahkan" ditangani
   oleh transaction.js

   Klik "Tambahkan"
        ↓
   transaction.js

   Klik "Konfirmasi"
        ↓
   transaction.js


   IMPORTANT :

   - Flow TIDAK melakukan write.
   - Flow TIDAK membuat transaction.
   - Flow TIDAK melakukan confirm.
   - Flow TIDAK mengetahui daftar workspace.
   - Flow TIDAK menyimpan prefix.
   - Flow TIDAK menyimpan steps workspace.
   - Flow TIDAK mempunyai logic khusus workspace.

   Semua konfigurasi input berasal dari :

       input/config.js


   MODE :

   Workspace seperti Airdrop dapat mempunyai
   beberapa mode.

   Flow hanya meneruskan State.mode.

   Flow tidak mengetahui detail mode.
===================================================== */


/* =====================================================
   IMPORT STATE
===================================================== */

import {

    State

} from "./state.js";


/* =====================================================
   IMPORT INPUT CONFIG REGISTRY
===================================================== */

import {

    getInputConfig

} from "./config.js";


/* =====================================================
   IMPORT FIELD RENDERER
===================================================== */

import {

    renderField

} from "./field.js";


/* =====================================================
   START FLOW
===================================================== */

export function startFlow(){

    /* =============================================
       RESET CURRENT INPUT
    ============================================= */

    State.values = {};

    State.step = 0;

    State.editingIndex = null;

    State.editingId = null;

    State.selectedRecord = null;


    /* =============================================
       GET INPUT CONFIG
    ============================================= */

    const config =

        getInputConfig(

            getWorkspace()

        );


    /* =============================================
       APPLY DEFAULT VALUES
    ============================================= */

    if(

        config

        &&

        config.defaults

        &&

        typeof config.defaults ===

            "object"

    ){

        State.values = {

            ...config.defaults

        };

    }


    /* =============================================
       RENDER
    ============================================= */

    renderFlow();

}


/* =====================================================
   GET CONTAINER
===================================================== */

function getContainer(){

    return document.getElementById(

        "global-input-form"

    );

}


/* =====================================================
   GET WORKSPACE
=====================================================

   Workspace aktif berasal dari State.workspace.

   Flow tidak mempunyai daftar workspace.
===================================================== */

function getWorkspace(){

    return (

        State.workspace

        ??

        ""

    );

}


/* =====================================================
   GET INPUT CONFIG
=====================================================

   Sumber konfigurasi form :

       input/config.js

   Contoh :

       payroll-daily
           ↓
       Daily

       payroll-monthly
           ↓
       Monthly

       financial
           ↓
       Financial

       saving
           ↓
       Saving

       kas
           ↓
       Kas

       airdrop
           ↓
       Airdrop

===================================================== */

function getFlowConfig(){

    const workspace =

        getWorkspace();


    if(

        !workspace

    ){

        return null;

    }


    return getInputConfig(

        workspace

    );

}


/* =====================================================
   GET STEPS
===================================================== */

function getSteps(){

    const config =

        getFlowConfig();


    if(

        !config

        ||

        !Array.isArray(

            config.steps

        )

    ){

        return [];

    }


    return config.steps;

}


/* =====================================================
   GET PREFIX
=====================================================

   Prefix bukan milik Flow.

   Prefix diambil dari input config workspace.

       config.js
           ↓
       Daily.prefix
           ↓
       PDR

   atau :

       Airdrop.prefix
           ↓
       AIR
===================================================== */

export function getFlowPrefix(){

    const config =

        getFlowConfig();


    if(

        !config

    ){

        return "";

    }


    const prefix =

        config.prefix;


    if(

        typeof prefix !==

            "string"

        ||

        !prefix.trim()

    ){

        return "";

    }


    return prefix

        .trim()

        .toUpperCase();

}


/* =====================================================
   GET WORKSPACE LABEL
===================================================== */

export function getFlowWorkspaceLabel(){

    const config =

        getFlowConfig();


    if(

        !config

    ){

        return getWorkspace();

    }


    const label =

        config.workspaceLabel;


    if(

        typeof label ===

            "string"

        &&

        label.trim()

    ){

        return label.trim();

    }


    if(

        typeof config.title ===

            "string"

        &&

        config.title.trim()

    ){

        return config.title.trim();

    }


    return getWorkspace();

}


/* =====================================================
   RENDER FLOW
===================================================== */

export function renderFlow(){

    const container =

        getContainer();


    if(

        !container

    ){

        return;

    }


    const steps =

        getSteps();


    /* =============================================
       CONFIG TIDAK DITEMUKAN
    ============================================= */

    if(

        !getFlowConfig()

    ){

        console.warn(

            "Global Input: konfigurasi input tidak ditemukan.",

            {

                workspace :

                    getWorkspace()

            }

        );


        return;

    }


    /* =============================================
       STEPS TIDAK DITEMUKAN
    ============================================= */

    if(

        steps.length ===

            0

    ){

        console.warn(

            "Global Input: steps tidak ditemukan pada konfigurasi input.",

            {

                workspace :

                    getWorkspace(),

                config :

                    getFlowConfig()

            }

        );


        flowComplete();

        return;

    }


    /* =============================================
       CURRENT FIELD
    ============================================= */

    let field =

        steps[

            State.step

        ];


    /* =============================================
       CARI FIELD VISIBLE BERIKUTNYA
    ============================================= */

    while(

        field

        &&

        !isVisible(

            field

        )

    ){

        State.step++;

        field =

            steps[

                State.step

            ];

    }


    /* =============================================
       SEMUA FIELD SELESAI
    ============================================= */

    if(

        !field

    ){

        flowComplete();

        return;

    }


    /* =============================================
       PREVENT DUPLICATE FIELD
    ============================================= */

    if(

        isFieldRendered(

            container,

            field.id

        )

    ){

        return;

    }


    /* =============================================
       RENDER FIELD
    ============================================= */

    renderField(

        field,

        container,

        handleFieldComplete

    );

}


/* =====================================================
   FIELD COMPLETE
===================================================== */

function handleFieldComplete(

    field,

    value

){

    if(

        !field

    ){

        return;

    }


    const steps =

        getSteps();


    const fieldIndex =

        steps.indexOf(

            field

        );


    if(

        fieldIndex ===

            -1

    ){

        return;

    }


    console.log(

        "FIELD COMPLETE:",

        {

            field :

                field.id,

            value :

                value,

            workspace :

                getWorkspace(),

            mode :

                State.mode,

            currentStep :

                State.step,

            fieldIndex :

                fieldIndex

        }

    );


    /* =================================================
       CONDITION FIELD
    ================================================= */

    if(

        field.type ===

            "condition"

    ){

        handleConditionChange(

            fieldIndex,

            value

        );

        return;

    }


    /* =================================================
       STATUS
    ================================================= */

    if(

        field.id ===

            "status"

    ){

        handleStatusChange(

            fieldIndex,

            value

        );

        return;

    }


    /* =================================================
       DETEKSI BACKTRACKING
    =================================================

       Contoh :

           State.step = 3

       User kembali mengubah :

           fieldIndex = 0

       Berarti :

           0 < 3

       Artinya user mengubah field sebelumnya.

       Semua field setelah field tersebut
       harus dianggap invalid.

    ================================================= */

    const isBacktracking =

        fieldIndex <

        State.step;


    /* =================================================
       SIMPAN VALUE FIELD
    ================================================= */

    State.values[

        field.id

    ] =

        value;


    /* =================================================
       RESET FIELD SETELAHNYA
       
       Hanya dilakukan jika user kembali
       mengubah field sebelumnya.

    ================================================= */

    if(

        isBacktracking

    ){

        console.log(

            "FLOW BACKTRACK:",

            {

                changedField :

                    field.id,

                changedIndex :

                    fieldIndex,

                previousStep :

                    State.step

            }

        );


        clearFieldsAfter(

            fieldIndex

        );

    }


    /* =================================================
       LANJUT KE FIELD BERIKUTNYA
       
       Bukan berdasarkan posisi lama,
       tetapi berdasarkan field yang baru saja
       diubah.

    ================================================= */

    State.step =

        fieldIndex + 1;


    /* =================================================
       RENDER
    ================================================= */

    renderFlow();

}

/* =====================================================
   STATUS CHANGE
===================================================== */

function handleStatusChange(

    statusIndex,

    value

){

    /* =============================================
       SIMPAN STATUS
    ============================================= */

    State.values.status =

        value;


    /* =============================================
       CLEAR FIELD SETELAH STATUS
    ============================================= */

    clearFieldsAfter(

        statusIndex

    );


    /* =============================================
       LANJUT
       
       Visibility field berikutnya sepenuhnya
       ditentukan oleh showWhen.
    ============================================= */

    State.step =

        statusIndex + 1;


    renderFlow();

}


/* =====================================================
   CONDITION CHANGE
===================================================== */

function handleConditionChange(

    conditionIndex,

    value

){

    console.log(

        "Condition updated:",

        value

    );


    /* =============================================
       NORMALIZE VALUE
    ============================================= */

    State.values.conditions =

        Array.isArray(

            value

        )

            ?

        [

            ...value

        ]

            :

        [];


    /* =============================================
       CLEAR FIELD SETELAH CONDITION
    ============================================= */

    clearFieldsAfter(

        conditionIndex

    );


    /* =============================================
       CONDITION KOSONG
       
       Tidak complete.
       
       User masih berada pada condition.
    ============================================= */

    if(

        !Array.isArray(

            value

        )

        ||

        value.length ===

            0

    ){

        State.step =

            conditionIndex;


        return;

    }


    /* =============================================
       RENDER CONDITION FIELDS
    ============================================= */

    renderConditionFields(

        conditionIndex

    );

}


/* =====================================================
   RENDER CONDITION FIELDS
===================================================== */

function renderConditionFields(

    conditionIndex

){

    const container =

        getContainer();


    if(

        !container

    ){

        return;

    }


    const steps =

        getSteps();


    const activeFields = [];


    /* =================================================
       CARI FIELD SETELAH CONDITION
       
       Field yang memenuhi showWhen
       dianggap aktif.
    ================================================= */

    for(

        let index =

            conditionIndex + 1;

        index <

            steps.length;

        index++

    ){

        const field =

            steps[index];


        if(

            !field

        ){

            continue;

        }


        if(

            !isVisible(

                field

            )

        ){

            continue;

        }


        /* =================================================
           FINAL FIELD

           Condition fields harus dirender dahulu.

           Setelah menemukan field normal terakhir
           seperti keterangan, pencarian berhenti.
        ================================================= */

        if(

            isFinalInputField(

                field

            )

        ){

            break;

        }


        activeFields.push({

            field :

                field,

            index :

                index

        });

    }


    /* =================================================
       TIDAK ADA CONDITION INPUT
    ================================================= */

    if(

        activeFields.length ===

            0

    ){

        State.step =

            conditionIndex + 1;


        renderFlow();

        return;

    }


    /* =================================================
       RENDER SEMUA CONDITION INPUT
    ================================================= */

    activeFields.forEach(

        item => {

            if(

                isFieldRendered(

                    container,

                    item.field.id

                )

            ){

                return;

            }


            renderField(

                item.field,

                container,

                handleFieldComplete

            );

        }

    );


    /* =================================================
       CURSOR
       
       Setelah semua condition field dirender,
       cursor ditempatkan pada field terakhir.
    ================================================= */

    State.step =

        activeFields[

            activeFields.length - 1

        ].index;

}


/* =====================================================
   FINAL INPUT FIELD
=====================================================

   Field setelah condition yang dianggap
   sebagai input normal.

   Saat ini keterangan menjadi field final.

   Ini hanya digunakan untuk menentukan batas
   rendering condition.

===================================================== */

function isFinalInputField(

    field

){

    if(

        !field

    ){

        return false;

    }


    return (

        field.id ===

            "keterangan"

        ||

        field.id ===

            "note"

    );

}


/* =====================================================
   IS CONDITION INPUT
===================================================== */

function isConditionInput(

    field

){

    if(

        !field

    ){

        return false;

    }


    const steps =

        getSteps();


    const fieldIndex =

        steps.indexOf(

            field

        );


    if(

        fieldIndex ===

            -1

    ){

        return false;

    }


    const conditionIndex =

        findConditionIndexBefore(

            fieldIndex

        );


    if(

        conditionIndex ===

            -1

    ){

        return false;

    }


    return !

        isFinalInputField(

            field

        );

}


/* =====================================================
   FIND CONDITION INDEX
===================================================== */

function findConditionIndexBefore(

    fieldIndex

){

    const steps =

        getSteps();


    for(

        let index =

            fieldIndex - 1;

        index >= 0;

        index--

    ){

        const field =

            steps[index];


        if(

            field?.type ===

                "condition"

        ){

            return index;

        }


        /* =================================================
           Jangan mencari melewati final field.
        ================================================= */

        if(

            isFinalInputField(

                field

            ) ){

            break;

        }

    }


    return -1;

}


/* =====================================================
   CLEAR FIELDS AFTER
===================================================== */

function clearFieldsAfter(

    index

){

    const container =

        getContainer();


    const steps =

        getSteps();


    /* =================================================
       CLEAR STATE
    ================================================= */

    for(

        let i =

            index + 1;

        i <

            steps.length;

        i++

    ){

        const field =

            steps[i];


        if(

            !field

        ){

            continue;

        }


        delete State.values[

            field.id

        ];

    }


    /* =================================================
       CLEAR DOM
       
       Container boleh tidak tersedia.
       State tetap harus dibersihkan.
    ================================================= */

    if(

        !container

    ){

        return;

    }


    for(

        let i =

            index + 1;

        i <

            steps.length;

        i++

    ){

        const field =

            steps[i];


        if(

            !field

        ){

            continue;

        }


        const elements =

            container.querySelectorAll(

                `[data-field="${field.id}"]`

            );


        elements.forEach(

            element => {

                const wrapper =

                    element.closest(

                        ".global-input-field"

                    );


                if(

                    wrapper

                ){

                    wrapper.remove();

                }

                else{

                    element.remove();

                }

            }

        );

    }

}


/* =====================================================
   IS FIELD RENDERED
===================================================== */

function isFieldRendered(

    container,

    fieldId

){

    if(

        !container

        ||

        !fieldId

    ){

        return false;

    }


    return Boolean(

        container.querySelector(

            `[data-field="${fieldId}"]`

        )

    );

}


/* =====================================================
   VISIBILITY
=====================================================

   Semua workspace-specific visibility
   berasal dari field.showWhen.

   Flow tidak mempunyai daftar status,
   daftar category, daftar jenis, dll.
===================================================== */

function isVisible(

    field

){

    if(

        !field

    ){

        return false;

    }


    if(

        typeof field.showWhen !==

            "function"

    ){

        return true;

    }


    try{

        return Boolean(

            field.showWhen(

                State.values

            )

        );

    }

    catch(error){

        console.warn(

            "Global Input: showWhen error.",

            {

                workspace :

                    getWorkspace(),

                field :

                    field.id,

                error :

                    error

            }

        );


        return false;

    }

}


/* =====================================================
   GET CURRENT FIELD
===================================================== */

export function getCurrentField(){

    const steps =

        getSteps();


    if(

        !Array.isArray(

            steps

        )

    ){

        return null;

    }


    return (

        steps[

            State.step

        ]

        ??

        null

    );

}


/* =====================================================
   GET CURRENT CONFIG
===================================================== */

export function getCurrentInputConfig(){

    return getFlowConfig();

}


/* =====================================================
   GET CURRENT STEPS
===================================================== */

export function getCurrentInputSteps(){

    return [

        ...getSteps()

    ];

}


/* =====================================================
   GET CURRENT VALUES
===================================================== */

export function getCurrentInputValues(){

    return {

        ...(

            State.values

            ??

            {}

        )

    };

}


/* =====================================================
   FLOW COMPLETE
=====================================================

   INI ADALAH BATAS FLOW.

   Tidak ada :

       transaction

       write

       confirm

       API call

   Flow hanya mengirim event.

   transaction.js yang menentukan apa
   yang dilakukan setelah flow selesai.
===================================================== */

function flowComplete(){

    console.log(

        "INPUT FLOW COMPLETE:",

        {

            workspace :

                getWorkspace(),

            mode :

                State.mode,

            values :

                State.values,

            editingId :

                State.editingId

        }

    );


    document.dispatchEvent(

        new CustomEvent(

            "global-input-flow-complete",

            {

                detail : {

                    workspace :

                        getWorkspace(),

                    mode :

                        State.mode,

                    values :

                        {

                            ...(

                                State.values

                                ??

                                {}

                            )

                        },

                    editingId :

                        State.editingId

                }

            }

        )

    );

}
