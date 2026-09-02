/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : transaction.js
   Version      : 6.0.0

   Description :
   Transaction Controller

   Handles :
   - Complete input
   - Add input
   - Update input
   - Delete input
   - Transaction list
   - Summary
   - Date lock
   - Confirm
   - AppScript / Write Engine
   - Loading
   - Double-submit protection

   PRINCIPLE :

   Input baru :
       editingId = null
           ↓
       create record baru
           ↓
       ID menggunakan prefix input workspace

   Input edit :
       editingId tersedia
           ↓
       update record berdasarkan ID

   Transaction controller tetap generic.

   CONFIG :

       State.workspace
            ↓
       getInputConfig(workspace)
            ↓
       workspace input config
            ↓
       steps

       State.workspace
            ↓
       getInputPrefix(workspace)
            ↓
       prefix

   Prefix TIDAK disimpan di transaction.js.

   Prefix berasal dari konfigurasi
   masing-masing input workspace.

   Contoh :

       Airdrop
           → AIR-xxxx

       Saving
           → SAV-xxxx

       Kas
           → KAS-xxxx

       Payroll Daily
           → PD-xxxx

       Payroll Monthly
           → PM-xxxx

       Financial
           → FIN-xxxx

   CONFIRM :

       State.transactions
            ↓
       saveInput()
            ↓
       Write Engine
            ↓
       AppScript input.gs
            ↓
       Google Sheet

   Loading aktif selama seluruh proses
   penyimpanan berlangsung.

   Double protection :

       Layer 1
       initTransaction()
            ↓
       cegah listener ganda

       Layer 2
       confirmTransactions()
            ↓
       cegah request ganda

       Layer tambahan
       Add button
            ↓
       cegah add/update ganda
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    State

} from "./state.js";


import {

    lockDate,
    unlockDate

} from "./session.js";


import {

    startFlow

} from "./flow.js";


import {

    renderTransactionItem

} from "./renderer.js";


import {

    getInputConfig,
    getInputPrefix

} from "./config.js";


/* =====================================================
   WRITE ENGINE
===================================================== */

import {

    saveInput

} from "../../js/write.js";


/* =====================================================
   LOADING
===================================================== */

import {

    Loading

} from "../loading/script.js";


/* =====================================================
   CONTROLLER STATE
===================================================== */

/*
   Mencegah initTransaction()
   memasang event listener lebih dari sekali.
*/

let transactionInitialized = false;


/*
   Mencegah Add / Update diproses
   dua kali karena double click.
*/

let isAddingTransaction = false;


/*
   Mencegah Confirm diproses
   dua kali secara bersamaan.
*/

let isConfirmingTransactions = false;


/* =====================================================
   GET INPUT CONFIG
=====================================================

   Sumber konfigurasi transaction adalah
   workspace aktif.

       State.workspace
            ↓
       getInputConfig()
            ↓
       input config

   Tidak lagi membaca :

       State.config.module

===================================================== */

function getTransactionInputConfig(){

    const workspace =

        State.workspace;


    if(

        !workspace

    ){

        return null;

    }


    const config =

        getInputConfig(

            workspace

        );


    if(

        !config

        ||

        typeof config !==

            "object"

    ){

        return null;

    }


    return config;

}


/* =====================================================
   GET STEPS
===================================================== */

function getSteps(){

    const config =

        getTransactionInputConfig();


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
   GET WORKSPACE
=====================================================

   Workspace transaction selalu mengikuti
   workspace aktif pada State.

===================================================== */

function getTransactionWorkspace(){

    return (

        State.workspace

        ??

        ""

    );

}


/* =====================================================
   GET PREFIX
=====================================================

   Prefix berasal dari :

       getInputPrefix(
           State.workspace
       )

   Tidak ada prefix workspace yang
   di-hardcode di transaction.js.

===================================================== */

function getTransactionPrefix(){

    const workspace =

        State.workspace;


    if(

        !workspace

    ){

        console.warn(

            "Transaction prefix gagal: State.workspace kosong."

        );


        return "TX";

    }


    const prefix =

        getInputPrefix(

            workspace

        );


    if(

        typeof prefix ===

            "string"

        &&

        prefix.trim()

    ){

        return prefix

            .trim()

            .toUpperCase();

    }


    console.warn(

        "Transaction prefix tidak ditemukan untuk workspace:",

        workspace,

        "Menggunakan fallback TX."

    );


    return "TX";

}


/* =====================================================
   INIT
===================================================== */

export function initTransaction(){

    /* =============================================
       DOUBLE INIT PROTECTION
    ============================================= */

    if(

        transactionInitialized

    ){

        console.warn(

            "TRANSACTION INIT: sudah pernah diinisialisasi. Dilewati."

        );


        return;

    }


    transactionInitialized = true;


    console.log(

        "TRANSACTION INIT"

    );


    /* =============================================
       FLOW COMPLETE
    ============================================= */

    document.addEventListener(

        "global-input-flow-complete",

        event => {

            /*
               Semua field sudah selesai.

               Belum menambahkan transaction.

               Hanya tampilkan tombol Tambahkan.
            */

            console.log(

                "TRANSACTION FLOW COMPLETE:",

                event.detail

            );


            showAddButton();

        }

    );


    /* =============================================
       ADD / UPDATE
    ============================================= */

    bindAddButton();


    /* =============================================
       CONFIRM
    ============================================= */

    bindConfirmButton();

}


/* =====================================================
   COMPLETE TRANSACTION
===================================================== */

function completeTransaction(

    values

){

    /* =============================================
       VALIDATION
    ============================================= */

    if(

        !values

        ||

        typeof values !==

            "object"

    ){

        console.warn(

            "Complete transaction gagal: values tidak valid."

        );


        return;

    }


    /* =============================================
       EDIT / UPDATE
    ============================================= */

    if(

        State.editingId

    ){

        updateTransaction(

            values

        );


        return;

    }


    /* =============================================
       CREATE NEW
    ============================================= */

    addTransaction(

        values

    );

}


/* =====================================================
   ADD TRANSACTION
===================================================== */

function addTransaction(

    values

){

    /* =============================================
       DOUBLE ADD PROTECTION
    ============================================= */

    if(

        isAddingTransaction

    ){

        console.warn(

            "TRANSACTION ADD: request ganda dicegah."

        );


        return;

    }


    isAddingTransaction = true;


    const button =

        document.getElementById(

            "global-input-add"

        );


    if(

        button

    ){

        button.disabled = true;

        button.setAttribute(

            "aria-disabled",

            "true"

        );

    }


    try{

        /* =========================================
           LOCK DATE

           Hanya transaction pertama
           yang mengunci tanggal.
        ========================================= */

        if(

            State.transactions.length ===

                0

        ){

            lockDate();

        }


        /* =========================================
           CREATE TRANSACTION
        ========================================= */

        const transaction = {

            id :

                generateTransactionId(),

            date :

                State.date,

            ...values

        };


        /* =========================================
           ADD TO LIST
        ========================================= */

        State.transactions.push(

            transaction

        );


        console.log(

            "Transaction ditambahkan:",

            transaction

        );


        /* =========================================
           FINISH
        ========================================= */

        finishCurrentInput();

    }

    finally{

        isAddingTransaction = false;


        if(

            button

        ){

            button.disabled = false;

            button.removeAttribute(

                "aria-disabled"

            );

        }

    }

}


/* =====================================================
   UPDATE TRANSACTION
===================================================== */

function updateTransaction(

    values

){

    /* =============================================
       DOUBLE UPDATE PROTECTION
    ============================================= */

    if(

        isAddingTransaction

    ){

        console.warn(

            "TRANSACTION UPDATE: request ganda dicegah."

        );


        return;

    }


    isAddingTransaction = true;


    const button =

        document.getElementById(

            "global-input-add"

        );


    if(

        button

    ){

        button.disabled = true;

        button.setAttribute(

            "aria-disabled",

            "true"

        );

    }


    try{

        const editingId =

            State.editingId;


        if(

            !editingId

        ){

            console.warn(

                "Update transaction gagal: editingId kosong."

            );


            return;

        }


        /* =============================================
           CARI RECORD
        ============================================= */

        const index =

            State.transactions.findIndex(

                transaction =>

                    String(

                        transaction?.id

                    )

                    ===

                    String(

                        editingId

                    )

            );


        /* =============================================
           RECORD TIDAK DITEMUKAN
        ============================================= */

        if(

            index ===

                -1

        ){

            const baseRecord =

                State.selectedRecord;


            if(

                !baseRecord

            ){

                console.warn(

                    "Update transaction gagal: record tidak ditemukan:",

                    editingId

                );


                return;

            }


            const updatedTransaction = {

                ...baseRecord,

                ...values,

                id :

                    baseRecord.id

            };


            State.transactions.push(

                updatedTransaction

            );


            console.log(

                "Transaction update disiapkan:",

                updatedTransaction

            );

        }

        else{

            /* =========================================
               MERGE RECORD
            ========================================= */

            const oldTransaction =

                State.transactions[

                    index

                ];


            const updatedTransaction = {

                ...oldTransaction,

                ...values,

                id :

                    oldTransaction.id

            };


            State.transactions[

                index

            ] =

                updatedTransaction;


            console.log(

                "Transaction diubah:",

                updatedTransaction

            );

        }


        /* =============================================
           FINISH
        ============================================= */

        finishCurrentInput();

    }

    finally{

        isAddingTransaction = false;


        if(

            button

        ){

            button.disabled = false;

            button.removeAttribute(

                "aria-disabled"

            );

        }

    }

}


/* =====================================================
   FINISH CURRENT INPUT
===================================================== */

function finishCurrentInput(){

    /* =============================================
       RESET CURRENT STATE
    ============================================= */

    State.resetCurrent();


    /* =============================================
       RESET FORM DOM
    ============================================= */

    resetTransactionForm();


    /* =============================================
       HIDE ADD BUTTON
    ============================================= */

    hideAddButton();


    /* =============================================
       RENDER LIST
    ============================================= */

    renderTransactionList();


    updateSummary();


    /* =============================================
       START NEW FLOW
    ============================================= */

    startFlow();

}


/* =====================================================
   RESET FORM
===================================================== */

function resetTransactionForm(){

    const form =

        document.getElementById(

            "global-input-form"

        );


    if(

        !form

    ){

        return;

    }


    form.innerHTML = "";

}


/* =====================================================
   ADD / UPDATE BUTTON
===================================================== */

function bindAddButton(){

    const button =

        document.getElementById(

            "global-input-add"

        );


    if(

        !button

    ){

        console.warn(

            "Tombol #global-input-add belum ditemukan."

        );


        return;

    }


    button.addEventListener(

        "click",

        () => {

            /* =====================================
               DOUBLE CLICK PROTECTION
            ===================================== */

            if(

                isAddingTransaction

            ){

                console.warn(

                    "TRANSACTION ADD/UPDATE: klik ganda dicegah."

                );


                return;

            }


            /* =====================================
               AMBIL CURRENT VALUES
            ===================================== */

            const values = {

                ...State.values

            };


            /* =====================================
               COMPLETE
            ===================================== */

            completeTransaction(

                values

            );

        }

    );

}


/* =====================================================
   SHOW ADD BUTTON
===================================================== */

function showAddButton(){

    const action =

        document.getElementById(

            "global-input-action"

        );


    if(

        action

    ){

        action.classList.remove(

            "hidden"

        );

    }

}


/* =====================================================
   HIDE ADD BUTTON
===================================================== */

export function hideAddButton(){

    const action =

        document.getElementById(

            "global-input-action"

        );


    if(

        action

    ){

        action.classList.add(

            "hidden"

        );

    }

}


/* =====================================================
   RENDER TRANSACTION LIST
===================================================== */

export function renderTransactionList(){

    const section =

        document.getElementById(

            "global-input-list-section"

        );


    const list =

        document.getElementById(

            "global-input-list"

        );


    const count =

        document.getElementById(

            "global-input-count"

        );


    if(

        !section

        ||

        !list

    ){

        return;

    }


    /* =============================================
       EMPTY
    ============================================= */

    if(

        State.transactions.length ===

            0

    ){

        section.classList.add(

            "hidden"

        );


        list.innerHTML = "";


        if(

            count

        ){

            count.textContent =

                "0";

        }


        return;

    }


    /* =============================================
       SHOW
    ============================================= */

    section.classList.remove(

        "hidden"

    );


    if(

        count

    ){

        count.textContent =

            String(

                State.transactions.length

            );

    }


    list.innerHTML = "";


    /* =============================================
       RENDER EACH TRANSACTION
    ============================================= */

    State.transactions.forEach(

        (

            transaction,

            index

        ) => {

            const item =

                renderTransactionItem(

                    transaction,

                    index,

                    deleteTransaction

                );


            if(

                item

            ){

                list.appendChild(

                    item

                );

            }

        }

    );


    bindListActions();

}


/* =====================================================
   LIST ACTIONS
===================================================== */

function bindListActions(){

    const list =

        document.getElementById(

            "global-input-list"

        );


    if(

        !list

    ){

        return;

    }


    /* =============================================
       DELETE
    ============================================= */

    list.querySelectorAll(

        "[data-delete]"

    ).forEach(

        button => {

            button.addEventListener(

                "click",

                () => {

                    deleteTransaction(

                        Number(

                            button.dataset.delete

                        )

                    );

                }

            );

        }

    );

}


/* =====================================================
   DELETE
===================================================== */

function deleteTransaction(

    index

){

    if(

        !State.transactions[index]

    ){

        return;

    }


    State.transactions.splice(

        index,

        1

    );


    /* =============================================
       ALL TRANSACTIONS DELETED
    ============================================= */

    if(

        State.transactions.length ===

            0

    ){

        unlockDate();

    }


    renderTransactionList();


    updateSummary();

}


/* =====================================================
   SUMMARY
===================================================== */

function updateSummary(){

    const totalCount =

        document.getElementById(

            "global-input-total-count"

        );


    const income =

        document.querySelector(

            "#global-input-total-income strong"

        );


    const expense =

        document.querySelector(

            "#global-input-total-expense strong"

        );


    let totalIncome =

        0;


    let totalExpense =

        0;


    /* =============================================
       CALCULATE
    ============================================= */

    State.transactions.forEach(

        transaction => {

            const amount =

                getTransactionAmount(

                    transaction

                );


            const type =

                getTransactionType(

                    transaction

                );


            if(

                type ===

                    "masuk"

            ){

                totalIncome +=

                    amount;

            }


            else if(

                type ===

                    "keluar"

            ){

                totalExpense +=

                    amount;

            }

        }

    );


    /* =============================================
       TOTAL COUNT
    ============================================= */

    if(

        totalCount

    ){

        totalCount.textContent =

            String(

                State.transactions.length

            );

    }


    /* =============================================
       INCOME
    ============================================= */

    if(

        income

    ){

        income.textContent =

            formatCurrency(

                totalIncome

            );

    }


    /* =============================================
       EXPENSE
    ============================================= */

    if(

        expense

    ){

        expense.textContent =

            formatCurrency(

                totalExpense

            );

    }


    /* =============================================
       FOOTER
    ============================================= */

    const footer =

        document.getElementById(

            "global-input-footer"

        );


    if(

        footer

    ){

        if(

            State.transactions.length >

                0

        ){

            footer.classList.remove(

                "hidden"

            );

        }

        else{

            footer.classList.add(

                "hidden"

            );

        }

    }

}


/* =====================================================
   CONFIRM
===================================================== */

function bindConfirmButton(){

    const button =

        document.getElementById(

            "global-input-confirm"

        );


    if(

        !button

    ){

        console.warn(

            "Tombol #global-input-confirm belum ditemukan."

        );


        return;

    }


    button.addEventListener(

        "click",

        () => {

            /*
               confirmTransactions()
               sudah memiliki protection internal.

               Jadi walaupun click event terpanggil
               dua kali, hanya request pertama
               yang boleh berjalan.
            */

            confirmTransactions();

        }

    );

}


/* =====================================================
   CONFIRM TRANSACTIONS
=====================================================

   FLOW :

       Confirm
          ↓
       lock
          ↓
       Loading.show()
          ↓
       snapshot transactions
          ↓
       saveInput()
          ↓
       Write Engine
          ↓
       AppScript input.gs
          ↓
       Google Sheet
          ↓
       semua sukses
          ↓
       State.reset()
          ↓
       close overlay

   Setiap transaction dikirim sebagai
   object individual karena input.gs
   menerima satu transaction object.

===================================================== */

async function confirmTransactions(){

    /* =============================================
       DOUBLE CONFIRM PROTECTION
    ============================================= */

    if(

        isConfirmingTransactions

    ){

        console.warn(

            "TRANSACTION CONFIRM: request ganda dicegah."

        );


        return {

            success :

                false,

            duplicate :

                true

        };

    }


    /* =============================================
       VALIDATION
    ============================================= */

    if(

        !Array.isArray(

            State.transactions

        )

        ||

        State.transactions.length ===

            0

    ){

        console.warn(

            "Tidak ada transaction untuk dikonfirmasi."

        );


        return {

            success :

                false,

            empty :

                true

        };

    }


    /* =============================================
       LOCK CONFIRM
    ============================================= */

    isConfirmingTransactions = true;


    const button =

        document.getElementById(

            "global-input-confirm"

        );


    if(

        button

    ){

        button.disabled = true;

        button.setAttribute(

            "aria-disabled",

            "true"

        );

        button.setAttribute(

            "aria-busy",

            "true"

        );

    }


    try{

        /* =========================================
           LOADING
        ========================================= */

        await Loading.show();


        /*
           Beri browser kesempatan untuk
           menggambar Loading terlebih dahulu.

           Ini penting supaya Loading tidak
           tertahan oleh proses async berikutnya.
        */

        await new Promise(

            resolve => {

                if(

                    typeof requestAnimationFrame ===

                        "function"

                ){

                    requestAnimationFrame(

                        () => resolve()

                    );

                }

                else{

                    setTimeout(

                        resolve,

                        0

                    );

                }

            }

        );


        /* =========================================
           SNAPSHOT TRANSACTIONS
        =========================================

           Gunakan copy agar data yang sedang
           dikirim tidak berubah akibat perubahan
           State selama proses async.
        ========================================= */

        const transactions =

            State.transactions.map(

                transaction => ({

                    ...transaction

                })

            );


        const workspace =

            getTransactionWorkspace();


        if(

            !workspace

        ){

            throw new Error(

                "Workspace input tidak ditemukan."

            );

        }


        /* =========================================
           PAYLOAD LOG
        ========================================= */

        const payload = {

            workspace :

                workspace,

            date :

                State.date,

            mode :

                State.mode,

            transactions :

                transactions

        };


        console.log(

            "DATA SIAP DIKIRIM:",

            payload

        );


        console.log(

            "INPUT CONFIRM:",

            {

                workspace :

                    workspace,

                count :

                    transactions.length

            }

        );


        /* =========================================
           SAVE EACH TRANSACTION
        =========================================

           input.gs saat ini menerima:

               saveInput(
                   accessToken,
                   spreadsheetId,
                   workspace,
                   data
               )

           Karena itu setiap transaction
           dikirim satu per satu.

        ========================================= */

        const results = [];


        for(

            let index = 0;

            index < transactions.length;

            index++

        ){

            const transaction =

                transactions[index];


            console.log(

                "INPUT SAVE:",

                {

                    index :

                        index + 1,

                    total :

                        transactions.length,

                    transaction :

                        transaction

                }

            );


            const result =

                await saveInput(

                    workspace,

                    transaction

                );


            console.log(

                "INPUT SAVE RESULT:",

                {

                    index :

                        index + 1,

                    result :

                        result

                }

            );


            /* =====================================
               VALIDATE RESULT
            ===================================== */

            if(

                !result

                ||

                result.success !==

                    true

            ){

                let message =

                    "AppScript gagal menyimpan transaction.";


                if(

                    result

                    &&

                    result.message

                ){

                    message =

                        result.message;

                }

                else if(

                    result

                    &&

                    result.error

                ){

                    message =

                        result.error;

                }


                throw new Error(

                    message

                );

            }


            results.push(

                result

            );

        }


        /* =========================================
           ALL SUCCESS
        ========================================= */

        console.log(

            "=========================================="

        );


        console.log(

            "INPUT SAVE SUCCESS"

        );


        console.log(

            "Workspace:",

            workspace

        );


        console.log(

            "Total transaction:",

            transactions.length

        );


        console.log(

            "Results:",

            results

        );


        console.log(

            "=========================================="

        );


        /* =========================================
           RESET STATE
        ========================================= */

        State.reset();


        /* =========================================
           CLOSE INPUT OVERLAY
        ========================================= */

        closeInputOverlay();


        return {

            success :

                true,

            workspace :

                workspace,

            count :

                transactions.length,

            results :

                results

        };

    }

    catch(

        error

    ){

        console.error(

            "INPUT SAVE ERROR:",

            error

        );


        const message =

            error?.message

            ??

            String(

                error

            );


        /*
           Jangan reset State ketika gagal.

           User masih dapat melihat transaction
           yang belum berhasil disimpan dan
           melakukan retry.
        */

        alert(

            "Gagal menyimpan input:\n" +

            message

        );


        return {

            success :

                false,

            error :

                message

        };

    }

    finally{

        /* =========================================
           HIDE LOADING
        ========================================= */

        try{

            await Loading.hide();

        }

        catch(

            loadingError

        ){

            console.warn(

                "Loading hide gagal:",

                loadingError

            );

        }


        /* =========================================
           UNLOCK CONFIRM
        ========================================= */

        isConfirmingTransactions = false;


        if(

            button

        ){

            button.disabled = false;

            button.removeAttribute(

                "aria-disabled"

            );

            button.removeAttribute(

                "aria-busy"

            );

        }

    }

}


/* =====================================================
   CLOSE INPUT OVERLAY
=====================================================

   Tidak import script.js agar tidak terjadi
   circular dependency.

   transaction.js cukup menutup overlay
   secara langsung setelah seluruh input
   berhasil disimpan.

===================================================== */

function closeInputOverlay(){

    const overlay =

        document.getElementById(

            "global-input-overlay"

        );


    if(

        overlay

    ){

        overlay.classList.remove(

            "is-open"

        );

    }


    document.body.classList.remove(

        "input-open"

    );


    console.log(

        "INPUT OVERLAY CLOSED"

    );

}


/* =====================================================
   GENERATE TRANSACTION ID
=====================================================

   ID menggunakan prefix dari :

       getInputPrefix(
           State.workspace
       )

   Contoh :

       PD
         ↓
       PD-xxxxxxxx-xxxxx

       AIR
         ↓
       AIR-xxxxxxxx-xxxxx

===================================================== */

function generateTransactionId(){

    const prefix =

        getTransactionPrefix();


    const timestamp =

        Date.now()

        .toString(

            36

        )

        .toUpperCase();


    const random =

        Math.random()

        .toString(

            36

        )

        .substring(

            2,

            7

        )

        .toUpperCase();


    return (

        prefix +

        "-" +

        timestamp +

        "-" +

        random

    );

}


/* =====================================================
   GET TRANSACTION TYPE
=====================================================

   Mengambil field pertama yang berisi
   direction :

       masuk
       keluar

   Tidak mengunci nama field.

===================================================== */

function getTransactionType(

    transaction

){

    const steps =

        getSteps();


    /* =============================================
       CARI DIRECTION FIELD
    ============================================= */

    const typeField =

        steps.find(

            field => {

                if(

                    !field

                    ||

                    !field.id

                ){

                    return false;

                }


                const value =

                    transaction[

                        field.id

                    ];


                const normalized =

                    String(

                        value ??

                        ""

                    )

                    .trim()

                    .toLowerCase();


                return (

                    normalized ===

                        "masuk"

                    ||

                    normalized ===

                        "keluar"

                );

            }

        );


    if(

        typeField

    ){

        return String(

            transaction[

                typeField.id

            ]

        )

        .trim()

        .toLowerCase();

    }


    /* =============================================
       FALLBACK
    ============================================= */

    return String(

        transaction.jenis

        ??

        transaction.type

        ??

        ""

    )

    .trim()

    .toLowerCase();

}


/* =====================================================
   GET TRANSACTION AMOUNT
===================================================== */

function getTransactionAmount(

    transaction

){

    const steps =

        getSteps();


    /* =============================================
       NUMBER FIELD
    ============================================= */

    const amountField =

        steps.find(

            field =>

                field

                &&

                field.type ===

                    "number"

                &&

                transaction[

                    field.id

                ] !==

                    undefined

        );


    if(

        amountField

    ){

        return Number(

            String(

                transaction[

                    amountField.id

                ]

            )

            .replace(

                /[^0-9.-]/g,

                ""

            )

        )

        || 0;

    }


    /* =============================================
       FALLBACK
    ============================================= */

    return Number(

        String(

            transaction.nominal

            ??

            transaction.amount

            ??

            0

        )

        .replace(

            /[^0-9.-]/g,

            ""

        )

    )

    || 0;

}


/* =====================================================
   FORMAT CURRENCY
===================================================== */

function formatCurrency(

    value

){

    return new Intl.NumberFormat(

        "id-ID",

        {

            style :

                "currency",

            currency :

                "IDR",

            maximumFractionDigits :

                0

        }

    ).format(

        Number(

            value

        )

        ||

        0

    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(

    value

){

    return String(

        value ??

        ""

    )

        .replace(

            /&/g,

            "&amp;"

        )

        .replace(

            /</g,

            "&lt;"

        )

        .replace(

            />/g,

            "&gt;"

        )

        .replace(

            /"/g,

            "&quot;"

        )

        .replace(

            /'/g,

            "&#039;"

        );

}


/* =====================================================
   GET TRANSACTION CONFIG
=====================================================

   Helper untuk debugging / inspection.

   Sumber config :

       State.workspace
           ↓
       getInputConfig()

===================================================== */

export function getTransactionConfig(){

    const config =

        getTransactionInputConfig();


    return {

        workspace :

            getTransactionWorkspace(),

        prefix :

            getTransactionPrefix(),

        steps :

            getSteps(),

        config :

            config,

        module :

            config

    };

}


/* =====================================================
   DEBUG
===================================================== */

export function debugTransaction(

    transaction = null

){

    const config =

        getTransactionInputConfig();


    const data = {

        workspace :

            getTransactionWorkspace(),

        prefix :

            getTransactionPrefix(),

        steps :

            getSteps(),

        config :

            config,

        module :

            config,

        stateWorkspace :

            State.workspace,

        stateDate :

            State.date,

        stateMode :

            State.mode,

        editingId :

            State.editingId,

        values :

            State.values,

        transactions :

            State.transactions,

        transaction :

            transaction,

        transactionType :

            transaction

                ?

            getTransactionType(

                transaction

            )

                :

            "",

        transactionAmount :

            transaction

                ?

            getTransactionAmount(

                transaction

            )

                :

            0

    };


    console.log(

        "=========================================="

    );


    console.log(

        "===== GLOBAL INPUT TRANSACTION ====="

    );


    console.log(

        "=========================================="

    );


    console.log(

        "Workspace:",

        data.workspace

    );


    console.log(

        "Prefix:",

        data.prefix

    );


    console.log(

        "Steps:",

        data.steps

    );


    console.log(

        "Config:",

        data.config

    );


    console.log(

        "Module:",

        data.module

    );


    console.log(

        "State:",

        data

    );


    console.log(

        "=========================================="

    );


    return data;

}
