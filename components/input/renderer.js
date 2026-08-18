/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : renderer.js
   Version      : 1.0.0

   Description :
   Global Input Transaction Renderer

   Principle :
   Renderer bersifat global.

   Controller :
   transaction.js

   Data :
   State.transactions

   Config :
   State.config
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    State

} from "./state.js";


/* =====================================================
   RENDER TRANSACTION ITEM
===================================================== */

export function renderTransactionItem(

    transaction,

    index,

    onDelete

){

    if(

        !transaction

    ){

        return null;

    }


    /* =================================================
       ROOT
    ================================================= */

    const item =

        document.createElement(

            "div"

        );


    item.className =

        "global-input-list-item";


    /* =================================================
       DATA
    ================================================= */

    const fields =

        getDisplayFields(

            transaction

        );


    /* =================================================
       HTML
    ================================================= */

    item.innerHTML =

        `

        <div class="global-input-item-main">

            ${

                fields

                    .map(

                        field =>

                            renderFieldValue(

                                field

                            )

                    )

                    .join("")

            }

        </div>


        <div class="global-input-item-actions">

            <button

                type="button"

                data-delete="${index}"

            >

                Hapus

            </button>

        </div>

        `;


    /* =================================================
       DELETE
    ================================================= */

    const deleteButton =

        item.querySelector(

            "[data-delete]"

        );


    if(

        deleteButton &&

        typeof onDelete ===

            "function"

    ){

        deleteButton.addEventListener(

            "click",

            () => {

                onDelete(

                    index

                );

            }

        );

    }


    return item;

}


/* =====================================================
   GET DISPLAY FIELDS
===================================================== */

function getDisplayFields(

    transaction

){

    const steps =

        State.config?.steps ??

        [];


    const result = [];


    steps.forEach(

        field => {

            if(

                !field ||

                !field.id

            ){

                return;

            }


            const value =

                transaction[

                    field.id

                ];


            /* =========================================
               FIELD TIDAK ADA NILAI
            ========================================= */

            if(

                value ===

                    undefined ||

                value ===

                    null ||

                String(

                    value

                ).trim() ===

                    ""

            ){

                return;

            }


            /* =========================================
               HIDDEN FIELD
            ========================================= */

            if(

                typeof field.showWhen ===

                    "function"

            ){

                try{

                    if(

                        !field.showWhen(

                            transaction

                        )

                    ){

                        return;

                    }

                }

                catch(error){

                    console.warn(

                        "Renderer showWhen error:",

                        error

                    );

                }

            }


            /* =========================================
               LABEL
            ========================================= */

            const label =

                getDisplayLabel(

                    field,

                    value,

                    transaction

                );


            /* =========================================
               VALUE
            ========================================= */

            const displayValue =

                getDisplayValue(

                    field,

                    value,

                    transaction

                );


            result.push({

                id :

                    field.id,

                label :

                    label,

                value :

                    displayValue,

                type :

                    field.type

            });

        }

    );


    return result;

}


/* =====================================================
   DISPLAY LABEL
===================================================== */

function getDisplayLabel(

    field,

    value,

    transaction

){

    /* =============================================
       TYPE
    ============================================= */

    if(

        field.id ===

            "type"

    ){

        return getTypeLabel(

            value

        );

    }


    /* =============================================
       CATEGORY
    ============================================= */

    if(

        field.id ===

            "category"

    ){

        return getOptionLabel(

            field,

            value,

            transaction

        );

    }


    return (

        field.label ??

        field.id

    );

}


/* =====================================================
   DISPLAY VALUE
===================================================== */

function getDisplayValue(

    field,

    value,

    transaction

){

    /* =============================================
       TYPE
    ============================================= */

    if(

        field.id ===

            "type"

    ){

        return "";

    }


    /* =============================================
       NUMBER / NOMINAL
    ============================================= */

    if(

        field.type ===

            "number"

        ||

        field.id ===

            "amount"

        ||

        field.id ===

            "nominal"

    ){

        return formatCurrency(

            value

        );

    }


    /* =============================================
       SELECT
    ============================================= */

    if(

        field.type ===

            "select"

    ){

        return getOptionLabel(

            field,

            value,

            transaction

        );

    }


    /* =============================================
       NORMAL VALUE
    ============================================= */

    return escapeHTML(

        value

    );

}


/* =====================================================
   OPTION LABEL
===================================================== */

function getOptionLabel(

    field,

    value,

    transaction

){

    let options = [];


    /* =============================================
       FUNCTION OPTIONS
    ============================================= */

    if(

        typeof field.options ===

            "function"

    ){

        try{

            options =

                field.options(

                    transaction

                ) ??

                [];

        }

        catch(error){

            console.warn(

                "Renderer options error:",

                error

            );

            options = [];

        }

    }


    /* =============================================
       STATIC OPTIONS
    ============================================= */

    else{

        options =

            field.options ??

            [];

    }


    const option =

        options.find(

            item =>

                typeof item ===

                    "object"

                    ?

                String(

                    item.value

                ) ===

                String(

                    value

                )

                    :

                String(

                    item

                ) ===

                String(

                    value

                )

        );


    if(

        option &&

        typeof option ===

            "object"

    ){

        return escapeHTML(

            option.label ??

            option.value ??

            value

        );

    }


    return escapeHTML(

        value

    );

}


/* =====================================================
   TYPE LABEL
===================================================== */

function getTypeLabel(

    value

){

    switch(

        value

    ){

        case "masuk":

            return "💰 Masuk";


        case "keluar":

            return "💸 Keluar";


        case "bayar":

            return "💳 Bayar";


        case "tarik":

            return "↩️ Tarik";


        case "nabung":

            return "🏦 Nabung";


        case "hutang":

            return "🤝 Hutang";


        default:

            return escapeHTML(

                value

            );

    }

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

        ) || 0

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
