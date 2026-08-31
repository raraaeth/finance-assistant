/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : transaction.js
   Version      : 3.0.0

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

   Input edit :
       editingId tersedia
       ↓
       update record berdasarkan ID

   Transaction controller tetap generic.
   Tidak mengetahui workspace tertentu.
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

               Belum menambahkan / meng-update
               transaksi.

               Hanya tampilkan tombol action.
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

        return;

    }


    /* =============================================
       EDIT / UPDATE
       
       Jika editingId tersedia,
       berarti record lama sedang
       diubah.
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

        State.transactions.length === 0

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
       CARI RECORD BERDASARKAN ID
    ============================================= */

    const index =

        State.transactions.findIndex(

            transaction =>

                String(

                    transaction?.id

                ) ===

                String(

                    editingId

                )

        );


    /* =============================================
       RECORD TIDAK DITEMUKAN
    ============================================= */

    if(

        index === -1

    ){

        /*
           Jika record belum berada di
           State.transactions, gunakan
           selectedRecord sebagai sumber
           record lama.
        */

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
           MERGE RECORD LAMA + NILAI BARU
        ========================================= */

        const oldTransaction =

            State.transactions[index];


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
       HIDE ACTION BUTTON
    ============================================= */

    hideAddButton();


    /* =============================================
       RENDER LIST
    ============================================= */

    renderTransactionList();


    updateSummary();


    /* =============================================
       START NEW FLOW
       
       Untuk mode input berikutnya.
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
   RENDER LIST
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

        State.transactions.length === 0

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

        State.transactions.length === 0

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
       
       Tetap kompatibel dengan
       Kas / Financial.
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

            State.transactions.length > 0

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

        State.transactions.length === 0

    ){

        return;

    }


    const payload = {

        workspace :

            State.workspace,

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
===================================================== */

function generateTransactionId(){

    return (

        "TX-" +

        Date.now()

        .toString(

            36

        )

        .toUpperCase() +

        "-" +

        Math.random()

        .toString(

            36

        )

        .substring(

            2,

            6

        )

        .toUpperCase()

    );

}


/* =====================================================
   TYPE LABEL
===================================================== */

function getTypeLabel(

    type

){

    if(

        type ===

            "masuk"

    ){

        return "💰 Masuk";

    }


    if(

        type ===

            "keluar"

    ){

        return "💸 Keluar";

    }


    return type ?? "-";

}


/* =====================================================
   CATEGORY LABEL
===================================================== */

function getCategoryLabel(

    transaction

){

    if(

        transaction.category ===

            "custom"

    ){

        return (

            transaction.customCategory

            ||

            "Lain-lain"

        );

    }


    const steps =

        State.config?.steps

        ??

        [];


    const categoryField =

        steps.find(

            field =>

                field.id ===

                    "category"

        );


    if(

        !categoryField

    ){

        return (

            transaction.category

            ||

            "-"

        );

    }


    const options =

        typeof categoryField.options ===

            "function"

            ?

            categoryField.options(

                transaction

            )

            :

            (

                categoryField.options

                ||

                []

            );


    const option =

        options.find(

            item =>

                item.value ===

                    transaction.category

        );


    return (

        option?.label

        ||

        transaction.category

        ||

        "-"

    );

}


/* =====================================================
   GET TRANSACTION TYPE
===================================================== */

function getTransactionType(

    transaction

){

    const steps =

        State.config?.steps

        ??

        [];


    /* =============================================
       AMBIL SELECT PERTAMA
    ============================================= */

    const typeField =

        steps.find(

            field =>

                field.type ===

                    "select"

        );


    if(

        typeField

        &&

        transaction[

            typeField.id

        ] !==

            undefined

    ){

        return transaction[

            typeField.id

        ];

    }


    /* =============================================
       FALLBACK
    ============================================= */

    return (

        transaction.jenis

        ??

        transaction.type

        ??

        ""

    );

}


/* =====================================================
   GET TRANSACTION AMOUNT
===================================================== */

function getTransactionAmount(

    transaction

){

    const steps =

        State.config?.steps

        ??

        [];


    /* =============================================
       AMBIL NUMBER FIELD PERTAMA
    ============================================= */

    const amountField =

        steps.find(

            field =>

                field.type ===

                    "number"

        );


    if(

        amountField

        &&

        transaction[

            amountField.id

        ] !==

            undefined

    ){

        return Number(

            transaction[

                amountField.id

            ]

        ) || 0;

    }


    /* =============================================
       FALLBACK
    ============================================= */

    return Number(

        transaction.nominal

        ??

        transaction.amount

    ) || 0;

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
