/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : transaction.js
   Version      : 5.0.0

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
       LOCK DATE

       Hanya transaction pertama
       yang mengunci tanggal.
    ============================================= */

    if(

        State.transactions.length ===

            0

    ){

        lockDate();

    }


    /* =============================================
       CREATE TRANSACTION
    ============================================= */

    const transaction = {

        id :

            generateTransactionId(),

        date :

            State.date,

        ...values

    };


    /* =============================================
       ADD TO LIST
    ============================================= */

    State.transactions.push(

        transaction

    );


    console.log(

        "Transaction ditambahkan:",

        transaction

    );


    /* =============================================
       FINISH
    ============================================= */

    finishCurrentInput();

}


/* =====================================================
   UPDATE TRANSACTION
===================================================== */

function updateTransaction(

    values

){

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

        return;

    }


    button.addEventListener(

        "click",

        () => {

            confirmTransactions();

        }

    );

}


/* =====================================================
   CONFIRM TRANSACTIONS
===================================================== */

function confirmTransactions(){

    if(

        State.transactions.length ===

            0

    ){

        console.warn(

            "Tidak ada transaction untuk dikonfirmasi."

        );


        return;

    }


    const payload = {

        workspace :

            getTransactionWorkspace(),

        date :

            State.date,

        mode :

            State.mode,

        transactions :

            [

                ...State.transactions

            ]

    };


    console.log(

        "DATA SIAP DIKIRIM:",

        payload

    );


    /*
       WRITE ENGINE / API akan menangani
       pengiriman data.

       transaction.js hanya menyiapkan
       payload.

       Tidak ada Apps Script langsung
       di sini.
    */

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
