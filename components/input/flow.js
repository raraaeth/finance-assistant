/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : flow.js
   Version      : 1.2.0

   Description :
   Global Input Flow Controller

   Handles :
   - Progressive field
   - Field visibility
   - Next field
   - Completed fields remain visible
   - Condition multi-select
   - Multiple condition inputs
   - Dynamic condition fields
   - Status change reset
   - Terminal attendance status

   Attendance Flow :

   Status
      ↓
   Shift (optional)
      ↓
   Tambahkan Kondisi
      ↓
   [ Telat ]
   [ Izin Telat ]
   [ Izin Pulang ]
   [ Lembur ]
      ↓
   Field yang dicentang tampil
      ↓
   Semua input selesai
      ↓
   Flow complete

   Terminal :

   cuti
   sakit
   absen
      ↓
   Flow complete
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    State

} from "./state.js";


import {

    renderField

} from "./field.js";

/* =====================================================
   PAYROLL DAILY HIERARCHY
===================================================== */

import {

    resolveDailyHierarchy

} from "./daily.js";

/* =====================================================
   INPUT
===================================================== */

import {

    saveInput

} from "../../js/write.js";



/* =====================================================
   START FLOW
===================================================== */

export function startFlow(){

    State.values = {};

    State.step = 0;

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
   GET STEPS
===================================================== */

function getSteps(){

    return State.config?.steps ?? [];

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


    let field =

        steps[

            State.step

        ];


    /* =================================================
       FIND NEXT VISIBLE FIELD
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
       COMPLETE
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


    console.log(

        "Flow selesai:",

        field.id,

        value

    );


    const steps =

        getSteps();


    const fieldIndex =

        steps.indexOf(

            field

        );


    /* =================================================
       CONDITION
       
       Checkbox tidak menaikkan State.step.

       Sebaliknya :

       1. Bersihkan field kondisi lama
       2. Cari semua field yang aktif
       3. Render SEMUA field hasil checklist
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

    State.workspace ===

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
       
       Status adalah special field.

       Jika status berubah :

       1. Semua field setelah status
          harus dibersihkan.
       2. Jika terminal :
          langsung selesai.
       3. Jika normal :
          mulai ulang flow setelah status.
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
       DYNAMIC CONDITION INPUT
       
       Field seperti :

       telat
       izin_telat
       izin_pulang
       lembur_jam

       tidak boleh langsung maju satu step
       seperti progressive field biasa.

       Semua field yang dipilih checkbox harus
       selesai terlebih dahulu.
    ================================================= */

    if(

        isConditionInput(

            field

        )

    ){

        handleConditionInputComplete(

            fieldIndex

        );

        return;

    }


    /* =================================================
       NORMAL FIELD
    ================================================= */

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

    /* =============================================
       SIMPAN NAMA BARU
    ============================================= */

    State.values.nama =

        String(

            value ??

            ""

        ).trim();


    /* =============================================
       BERSIHKAN FIELD SETELAH NAMA

       Ini menghapus :

       grade_1
       grade_2
       qty

       dari pilihan Nama sebelumnya.
    ============================================= */

    clearFieldsAfter(

        namaIndex

    );


    /* =============================================
       RESOLVE HIERARCHY
    ============================================= */

    const resolved =

        resolveDailyHierarchy(

            State.values

        );


    /* =============================================
       APPLY GRADE 1
    ============================================= */

    if(

        resolved.grade_1

    ){

        State.values.grade_1 =

            resolved.grade_1;

    }

    else{

        delete State.values.grade_1;

    }


    /* =============================================
       APPLY GRADE 2
    ============================================= */

    if(

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


    /* =============================================
       LANJUT FLOW
    ============================================= */

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
       CLEAR SEMUA FIELD SETELAH STATUS
    ================================================= */

    clearFieldsAfter(

        statusIndex

    );


    /* =================================================
       TERMINAL STATUS
       
       cuti
       sakit
       absen
       
       Tidak perlu :

       shift
       condition
       telat
       izin
       lembur
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
       
       Masuk
       Lembur

       Lanjut ke field setelah status.
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
       HAPUS SEMUA FIELD HASIL KONDISI SEBELUMNYA
    ================================================= */

    clearFieldsAfter(

        conditionIndex

    );


    /* =================================================
       CONDITION KOSONG
       
       Jangan lanjut otomatis.

       User masih bisa memilih kondisi
       atau menekan Tambah Transaksi.
    ================================================= */

    if(

        !Array.isArray(

            value

        )

        ||

        value.length === 0

    ){

        State.step =

            conditionIndex;


        return;

    }


    /* =================================================
       RENDER SEMUA FIELD AKTIF
       
       Contoh :

       Telat + Lembur

       Maka :

       Telat
       Lembur Jam

       tampil bersamaan.
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
       CARI SEMUA FIELD SETELAH CONDITION
       YANG SEKARANG VISIBLE
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


        activeFields.push({

            field,

            index

        });

    }


    /* =================================================
       TIDAK ADA FIELD INPUT
    ================================================= */

    if(

        activeFields.length === 0

    ){

        State.step =

            conditionIndex;


        return;

    }


    /* =================================================
       RENDER SEMUA FIELD
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

       Cursor berada pada field terakhir
       dari kelompok condition.
    ================================================= */

    State.step =

        activeFields[

            activeFields.length - 1

        ].index;

}


/* =====================================================
   CONDITION INPUT COMPLETE
===================================================== */

function handleConditionInputComplete(

    fieldIndex

){

    const conditionIndex =

        findConditionIndexBefore(

            fieldIndex

        );


    /* =================================================
       Jika tidak ditemukan condition,
       perlakukan sebagai field normal.
    ================================================= */

    if(

        conditionIndex === -1

    ){

        State.step =

            fieldIndex + 1;


        renderFlow();

        return;

    }


    /* =================================================
       CEK SEMUA FIELD CONDITION
    ================================================= */

    if(

        areConditionInputsComplete(

            conditionIndex

        )

    ){

        console.log(

            "Semua condition input selesai."

        );


        flowComplete();

        return;

    }


    console.log(

        "Masih ada condition input yang belum selesai."

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

    }


    return -1;

}


/* =====================================================
   CHECK CONDITION INPUT COMPLETE
===================================================== */

function areConditionInputsComplete(

    conditionIndex

){

    const steps =

        getSteps();


    const conditionValue =

        State.values?.[

            steps[conditionIndex]?.id

        ];


    if(

        !Array.isArray(

            conditionValue

        )

        ||

        conditionValue.length === 0

    ){

        return false;

    }


    const activeFields = [];


    /* =================================================
       SEMUA FIELD SETELAH CONDITION
       YANG MASIH VISIBLE
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


        activeFields.push(

            field

        );

    }


    /* =================================================
       TIDAK ADA FIELD
    ================================================= */

    if(

        activeFields.length === 0

    ){

        return true;

    }


    /* =================================================
       SETIAP FIELD AKTIF HARUS SUDAH DIISI
    ================================================= */

    return activeFields.every(

        field => {

            const value =

                State.values?.[

                    field.id

                ];


            return (

                value !==

                    undefined

                &&

                value !==

                    null

                &&

                String(

                    value

                ).trim() !==

                    ""

            );

        }

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


    /* =================================================
       Cari condition sebelumnya.

       Jika field berada setelah condition,
       dan condition aktif, maka field dianggap
       sebagai dynamic condition input.
    ================================================= */

    const steps =

        getSteps();


    const fieldIndex =

        steps.indexOf(

            field

        );


    if(

        fieldIndex === -1

    ){

        return false;

    }


    return (

        findConditionIndexBefore(

            fieldIndex

        ) !==

            -1

    );

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
       HAPUS DOM FIELD
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
===================================================== */

async function flowComplete(){

    console.log(

        "Semua field selesai:",

        State.values

    );


    /* =============================================
       FINAL DATA
    ============================================= */

    const data = {

        ...State.values

    };


    /* =============================================
       SAVE INPUT
       
       Flow :
       
       flow.js
          ↓
       write.js
          ↓
       Apps Script
          ↓
       input.gs
    ============================================= */

    try{

        console.log(

            "INPUT SAVE START",

            {

                workspace :

                    State.workspace,

                data :

                    data

            }

        );


        const result =

            await saveInput(

                State.workspace,

                data

            );


        console.log(

            "INPUT SAVE RESULT",

            result

        );


        /* =========================================
           SAVE FAILED
        ========================================= */

        if(

            !result?.success

        ){

            throw new Error(

                result?.error

                ||

                result?.message

                ||

                "Gagal menyimpan input."

            );

        }


        /* =========================================
           FLOW COMPLETE EVENT
           
           Event baru dikirim SETELAH
           backend berhasil menyimpan.
        ========================================= */

        document.dispatchEvent(

            new CustomEvent(

                "global-input-flow-complete",

                {

                    detail : {

                        values :

                            {

                                ...data

                            },

                        result :

                            result

                    }

                }

            )

        );


        console.log(

            "INPUT SAVE SUCCESS"

        );

    }

    catch(error){

        console.error(

            "INPUT SAVE ERROR:",

            error

        );


        alert(

            "Gagal menyimpan input:\n" +

            error.message

        );

    }

}


    

