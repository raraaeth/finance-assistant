/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : transaction.js
   Version      : 1.0.0

   Description :
   Temporary Transaction Controller

   Handles :
   - Add transaction
   - Edit transaction
   - Delete transaction
   - Transaction list
   - Summary
   - Date lock
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


/* =====================================================
   INIT
===================================================== */

export function initTransaction(){

    document.addEventListener(

        "global-input-flow-complete",

        event => {

            completeTransaction(

                event.detail.values

            );

        }

    );


    bindAddButton();

    bindConfirmButton();

}


/* =====================================================
   COMPLETE TRANSACTION
===================================================== */

function completeTransaction(

    values

){

    /* =============================================
       LOCK DATE
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
       EDIT
    ============================================= */

    if(

        State.editingIndex !== null

    ){

        State.transactions[

            State.editingIndex

        ] = transaction;


        State.editingIndex =

            null;

    }


    /* =============================================
       ADD
    ============================================= */

    else{

        State.transactions.push(

            transaction

        );

    }


    /* =============================================
       RESET CURRENT
    ============================================= */

    State.resetCurrent();


    /* =============================================
       RENDER
    ============================================= */

    renderTransactionList();

    updateSummary();

    showAddButton();


    console.log(

        "Transaction:",

        transaction

    );

}


/* =====================================================
   ADD BUTTON
===================================================== */

function bindAddButton(){

    const button =

        document.getElementById(

            "global-input-add"

        );


    if(

        !button

    ){

        return;

    }


    button.addEventListener(

        "click",

        () => {

            startFlow();

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


    State.transactions.forEach(

        (

            transaction,

            index

        ) => {

            const item =

                document.createElement(

                    "div"

                );


            item.className =

                "global-input-list-item";


            item.innerHTML =

            `

                <div>

                    <strong>

                        ${

                            getTypeLabel(

                                transaction.type

                            )

                        }

                    </strong>

                </div>


                <div>

                    ${

                        escapeHTML(

                            transaction.member

                        )

                    }

                </div>


                <div>

                    ${

                        formatCurrency(

                            transaction.amount

                        )

                    }

                </div>


                <div>

                    ${

                        escapeHTML(

                            getCategoryLabel(

                                transaction

                            )

                        )

                    }

                </div>


                ${

                    transaction.note

                    ?

                    `

                        <div>

                            ${

                                escapeHTML(

                                    transaction.note

                                )

                            }

                        </div>

                    `

                    :

                    ""

                }


                <div

                    class="global-input-item-actions">

                    <button

                        type="button"

                        data-edit="${index}">

                        Edit

                    </button>


                    <button

                        type="button"

                        data-delete="${index}">

                        Hapus

                    </button>

                </div>

            `;


            list.appendChild(

                item

            );

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


    list.querySelectorAll(

        "[data-edit]"

    ).forEach(

        button => {

            button.addEventListener(

                "click",

                () => {

                    editTransaction(

                        Number(

                            button.dataset.edit

                        )

                    );

                }

            );

        }

    );


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
   EDIT
===================================================== */

function editTransaction(

    index

){

    const transaction =

        State.transactions[index];


    if(

        !transaction

    ){

        return;

    }


    State.editingIndex =

        index;


    State.values = {

        type :

            transaction.type,

        member :

            transaction.member,

        amount :

            transaction.amount,

        category :

            transaction.category,

        customCategory :

            transaction.customCategory ??

            "",

        note :

            transaction.note ??

            ""

    };


    State.step = 0;


    /*

       Untuk sementara kita hapus tampilan
       form lalu mulai ulang flow.

       Tahap restore value akan kita sempurnakan
       setelah engine dasar selesai.

    */

    const form =

        document.getElementById(

            "global-input-form"

        );


    if(

        form

    ){

        form.innerHTML = "";

    }


    startFlow();

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

        hideAddButton();

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


    let totalIncome = 0;

    let totalExpense = 0;


    State.transactions.forEach(

        transaction => {

            const amount =

                Number(

                    transaction.amount

                ) || 0;


            if(

                transaction.type ===

                "masuk"

            ){

                totalIncome +=

                    amount;

            }


            else if(

                transaction.type ===

                "keluar"

            ){

                totalExpense +=

                    amount;

            }

        }

    );


    if(

        totalCount

    ){

        totalCount.textContent =

            String(

                State.transactions.length

            );

    }


    if(

        income

    ){

        income.textContent =

            formatCurrency(

                totalIncome

            );

    }


    if(

        expense

    ){

        expense.textContent =

            formatCurrency(

                totalExpense

            );

    }


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

       Apps Script belum disambungkan.

       Nanti payload ini yang dikirim
       ke API / Apps Script.

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

        type === "masuk"

    ){

        return "💰 Masuk";

    }


    if(

        type === "keluar"

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

        State.config?.steps ??

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
