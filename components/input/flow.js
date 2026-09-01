/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : flow.js
   Version      : 4.0.0

   Description :
   Global Input Flow Controller

   PRINCIPLE :

   Flow hanya bertugas mengumpulkan input.

   Workspace
       ↓
   config.js
       ↓
   State.config
       ↓
   State.config.module
       ↓
   steps
       ↓
   field.js
       ↓
   input

   Enter / Change
       ↓
   lanjut ke field berikutnya

   Field terakhir selesai
       ↓
   FLOW COMPLETE
       ↓
   Tombol "Tambahkan" muncul

   Klik "Tambahkan"
       ↓
   ditangani transaction.js

   Klik "Konfirmasi"
       ↓
   ditangani transaction.js

   IMPORTANT :

   - Enter TIDAK menambahkan transaction
   - Enter TIDAK mengirim data
   - Enter TIDAK menjalankan confirm
   - Enter TIDAK menjalankan completeTransaction()
   - Flow TIDAK melakukan write

   Hanya tombol Tambahkan yang boleh
   memasukkan data ke State.transactions.

   Hanya tombol Konfirmasi yang boleh
   mengirim data.

   MODE :

   Flow tetap generic.

   Workspace yang mempunyai beberapa mode
   seperti Airdrop dapat menentukan mode
   melalui State.mode.

   Flow tidak mengetahui detail mode.
===================================================== */


/* =====================================================
   IMPORT STATE
===================================================== */

import {

    State

} from "./state.js";


/* =====================================================
   IMPORT FIELD RENDERER
===================================================== */

import {

    renderField

} from "./field.js";


/* =====================================================
   PAYROLL DAILY HIERARCHY
=====================================================

   Payroll Daily mempunyai hierarchy khusus :

       Nama
          ↓
       Grade 1
          ↓
       Grade 2

   Flow hanya meneruskan perubahan Nama
   kepada hierarchy engine.

   Logic hierarchy tetap berada di daily.js.

===================================================== */

import {

    resolveDailyHierarchy

} from "./daily.js";


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
   GET MODULE CONFIG
=====================================================

   Struktur baru :

       State.config
           ↓
       module
           ↓
       workspace config

   Contoh :

       State.config = {

           id       : "payroll-daily",
           title    : "Payroll Daily",
           icon     : "...",
           sheets   : [...],
           module   : {

               workspace : "payroll-daily",
               prefix    : "PDR",
               title     : "Payroll Daily",
               steps     : [...]
           }

       }

   Compatibility :

   Jika module belum tersedia,
   State.config sendiri tetap dapat digunakan
   sebagai fallback.

===================================================== */

function getModuleConfig(){

    const config =

        State.config;


    if(

        !config

        ||

        typeof config !==

            "object"

    ){

        return {};

    }


    const module =

        config.module;


    if(

        module

        &&

        typeof module ===

            "object"

    ){

        return module;

    }


    return config;

}


/* =====================================================
   GET STEPS
===================================================== */

function getSteps(){

    const config =

        getModuleConfig();


    if(

        !Array.isArray(

            config.steps

        )

    ){

        return [];

    }


    return config.steps;

}


/* =====================================================
   GET WORKSPACE
===================================================== */

function getWorkspace(){

    const module =

        getModuleConfig();


    return (

        module.workspace

        ??

        State.workspace

        ??

        ""

    );

}


/* =====================================================
   GET PREFIX
=====================================================

   Prefix tidak dibuat di Flow.

   Prefix berasal dari konfigurasi workspace
   melalui config.js.

===================================================== */

export function getFlowPrefix(){

    const module =

        getModuleConfig();


    const prefix =

        module.prefix;


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
       TIDAK ADA CONFIG
    ============================================= */

    if(

        steps.length ===

            0

    ){

        console.warn(

            "Global Input: steps tidak ditemukan pada konfigurasi workspace.",

            {

                workspace :

                    getWorkspace(),

                config :

                    State.config

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


    /* =================================================
       CARI FIELD VISIBLE BERIKUTNYA
    ================================================= */

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


    /* =================================================
       SEMUA FIELD SUDAH SELESAI
       
       Stop di sini.

       Tidak memasukkan transaksi.
       Tidak melakukan write.
       Tidak melakukan confirm.

       Hanya dispatch event.
    ================================================= */

    if(

        !field

    ){

        flowComplete();

        return;

    }


    /* =================================================
       PREVENT DUPLICATE FIELD
    ================================================= */

    if(

        isFieldRendered(

            container,

            field.id

        )

    ){

        return;

    }


    /* =================================================
       RENDER FIELD
    ================================================= */

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

        field.id,

        value,

        "MODE:",

        State.mode

    );


    /* =================================================
       CONDITION FIELD

       Checkbox condition bukan field biasa.

       Setelah condition dipilih,
       semua field condition aktif
       ditampilkan bersamaan.
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
       PAYROLL DAILY HIERARCHY
    ================================================= */

    if(

        field.id ===

            "nama"

        &&

        getWorkspace() ===

            "payroll-daily"

    ){

        handleDailyHierarchyChange(

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
       NORMAL FIELD
    ================================================= */

    State.values[

        field.id

    ] =

        value;


    State.step =

        fieldIndex + 1;


    renderFlow();

}


/* =====================================================
   PAYROLL DAILY HIERARCHY CHANGE
===================================================== */

function handleDailyHierarchyChange(

    namaIndex,

    value

){

    /* =================================================
       SIMPAN NAMA
    ================================================= */

    State.values.nama =

        String(

            value ??

            ""

        ).trim();


    /* =================================================
       BERSIHKAN FIELD SETELAH NAMA
    ================================================= */

    clearFieldsAfter(

        namaIndex

    );


    /* =================================================
       RESOLVE HIERARCHY
    ================================================= */

    const resolved =

        resolveDailyHierarchy(

            State.values

        );


    /* =================================================
       GRADE 1
    ================================================= */

    if(

        resolved

        &&

        resolved.grade_1

    ){

        State.values.grade_1 =

            resolved.grade_1;

    }

    else{

        delete State.values.grade_1;

    }


    /* =================================================
       GRADE 2
    ================================================= */

    if(

        resolved

        &&

        resolved.grade_2

    ){

        State.values.grade_2 =

            resolved.grade_2;

    }

    else{

        delete State.values.grade_2;

    }


    console.log(

        "PAYROLL DAILY HIERARCHY RESOLVED:",

        {

            nama :

                State.values.nama,

            grade_1 :

                State.values.grade_1 ??

                "",

            grade_2 :

                State.values.grade_2 ??

                ""

        }

    );


    /* =================================================
       LANJUT FLOW
    ================================================= */

    State.step =

        namaIndex + 1;


    renderFlow();

}


/* =====================================================
   STATUS CHANGE
===================================================== */

function handleStatusChange(

    statusIndex,

    value

){

    /* =================================================
       SIMPAN STATUS
    ================================================= */

    State.values.status =

        value;


    /* =================================================
       CLEAR FIELD SETELAH STATUS
    ================================================= */

    clearFieldsAfter(

        statusIndex

    );


    /* =================================================
       TERMINAL STATUS
       
       Attendance :

       Cuti
       Sakit
       Absen

       Status terminal tidak memiliki
       field tambahan.
    ================================================= */

    if(

        isTerminalStatus(

            getSteps()[

                statusIndex

            ],

            value

        )

    ){

        console.log(

            "Terminal attendance status:",

            value

        );


        flowComplete();

        return;

    }


    /* =================================================
       STATUS NORMAL
    ================================================= */

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


    /* =================================================
       SIMPAN CONDITION
    ================================================= */

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


    /* =================================================
       BERSIHKAN FIELD CONDITION SEBELUMNYA
    ================================================= */

    clearFieldsAfter(

        conditionIndex

    );


    /* =================================================
       CONDITION KOSONG

       Jangan flowComplete.

       Tetap berada di condition.
    ================================================= */

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


    /* =================================================
       RENDER CONDITION FIELDS
    ================================================= */

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
       YANG VISIBLE
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
           STOP PENCARIAN CONDITION INPUT

           Field final seperti keterangan
           dianggap field normal.
        ================================================= */

        if(

            isFinalInputField(

                field

            )

        ){

            break;

        }


        activeFields.push({

            field,

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

       Cursor berada di condition input terakhir.
    ================================================= */

    State.step =

        activeFields[

            activeFields.length - 1

        ].index;

}


/* =====================================================
   FINAL INPUT FIELD
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

    );

}


/* =====================================================
   FIELD CONDITION INPUT
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
           Jangan mencari melewati field normal.
        ================================================= */

        if(

            field?.id ===

                "keterangan"

        ){

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


    if(

        !container

    ){

        return;

    }


    /* =================================================
       HAPUS STATE
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
       HAPUS DOM
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
   TERMINAL STATUS
===================================================== */

function isTerminalStatus(

    field,

    value

){

    if(

        !field

        ||

        field.id !==

            "status"

    ){

        return false;

    }


    const status =

        String(

            value ??

            ""

        )

        .trim()

        .toLowerCase();


    return (

        status ===

            "cuti"

        ||

        status ===

            "sakit"

        ||

        status ===

            "absen"

    );

}


/* =====================================================
   VISIBILITY
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

            "Global Input flow showWhen error:",

            error

        );


        return false;

    }

}


/* =====================================================
   FLOW COMPLETE
=====================================================

   INI ADALAH BATAS FLOW.

   Tidak ada transaksi dibuat di sini.
   Tidak ada write.
   Tidak ada confirm.

   Hanya memberi tahu transaction.js
   bahwa semua input sudah selesai.

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

                            ...State.values

                        },

                    editingId :

                        State.editingId

                }

            }

        )

    );

}
