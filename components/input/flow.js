/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : flow.js
   Version      : 2.0.0

   Description :
   Global Input Flow Controller

   PRINCIPLE :

   Flow hanya bertugas mengumpulkan input.

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
   ↓
   Apps Script

   IMPORTANT :

   Enter TIDAK:
   - menambahkan transaction
   - mengirim Apps Script
   - menjalankan confirm
   - menjalankan completeTransaction()

   Hanya tombol Tambahkan yang boleh
   memasukkan data ke State.transactions.

   Hanya tombol Konfirmasi yang boleh
   mengirim data ke Apps Script.
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
       
       STOP DI SINI.

       Jangan memasukkan transaksi.
       Jangan konfirmasi.
       Jangan kirim Apps Script.

       Hanya dispatch event agar
       transaction.js menampilkan
       tombol Tambahkan.
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

        fieldIndex === -1

    ){

        return;

    }


    console.log(

        "FIELD COMPLETE:",

        field.id,

        value

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
       
       Field condition input juga diperlakukan
       sebagai field biasa setelah nilainya
       berhasil disimpan.

       TAPI :

       Jangan pernah flowComplete()
       hanya karena field condition selesai.

       Flow harus bergerak ke field berikutnya.
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
       
       Cuti
       Sakit
       Absen

       Status terminal tidak memiliki
       field tambahan.

       Flow selesai → tombol Tambahkan.

       Tetap TIDAK menambahkan transaksi.
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

        value.length === 0

    ){

        State.step =

            conditionIndex;

        return;

    }


    /* =================================================
       SIMPAN CONDITION
       
       Biasanya renderField sudah menyimpan
       State.values.

       Tidak perlu menulis ulang di sini.
    ================================================= */


    /* =================================================
       RENDER SEMUA CONDITION INPUT
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

       IMPORTANT :

       "keterangan" dan field normal setelah
       condition juga bisa berada di sini.

       Karena itu kita hanya menentukan
       field condition berdasarkan struktur
       config, bukan menganggap seluruh field
       setelah condition sebagai condition input.
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
           
           Field dengan ID keterangan dianggap
           sebagai field normal terakhir.

           Jangan masukkan ke kelompok
           condition input.
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
       
       Tetap lanjutkan flow secara normal.
    ================================================= */

    if(

        activeFields.length === 0

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

       Setelah field terakhir condition selesai,
       renderFlow() akan mencari field berikutnya,
       misalnya "keterangan".
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


    /* =================================================
       KETERANGAN ADALAH FIELD TERAKHIR.

       Enter pada field ini hanya menyebabkan
       flowComplete() melalui renderFlow().

       TIDAK MENAMBAHKAN TRANSAKSI.
    ================================================= */

    return (

        field.id ===

            "keterangan"

    );

}


/* =====================================================
   FIELD CONDITION INPUT
       
   Digunakan hanya untuk kebutuhan
   pengecekan internal.

   Tidak pernah melakukan complete transaction.
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

        fieldIndex === -1

    ){

        return false;

    }


    const conditionIndex =

        findConditionIndexBefore(

            fieldIndex

        );


    if(

        conditionIndex === -1

    ){

        return false;

    }


    /* =================================================
       Field setelah condition dianggap condition
       input hanya jika field tersebut BUKAN field
       final seperti keterangan.
    ================================================= */

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

           Ini mencegah field seperti keterangan
           dianggap sebagai condition input.
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
       
   INI ADALAH BATAS FLOW.

   Tidak ada transaksi yang dibuat di sini.

   Tidak ada Apps Script.

   Tidak ada confirm.

   Hanya memberi tahu transaction.js
   bahwa semua input sudah selesai.
===================================================== */

function flowComplete(){

    console.log(

        "INPUT FLOW COMPLETE:",

        State.values

    );


    document.dispatchEvent(

        new CustomEvent(

            "global-input-flow-complete",

            {

                detail : {

                    values :

                        {

                            ...State.values

                        }

                }

            }

        )

    );

}
