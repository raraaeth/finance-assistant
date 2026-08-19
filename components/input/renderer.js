/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : renderer.js
   Version      : 2.0.0

   Description :
   Global Input Transaction Renderer

   Principle :
   Renderer bersifat GLOBAL.
   Tidak mengunci field untuk Kas, Financial, Payroll, dll.

   Controller :
   transaction.js

   Data :
   State.transactions

   Config :
   State.config.steps
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
       DISPLAY DATA
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

   Semua data diambil dari State.config.steps.
   Renderer tidak mengetahui workspace tertentu.
===================================================== */

function getDisplayFields(

    transaction

){

    const steps =

        Array.isArray(

            State.config?.steps

        )

            ?

        State.config.steps

            :

        [];


    const result = [];


    if(

        steps.length === 0

    ){

        return result;

    }


    /* =================================================
       DETEKSI FIELD TRANSACTION DIRECTION
       
       Kas :
           type = masuk / keluar

       Financial :
           jenis = masuk / keluar
           type  = gaji / belanja_online / ...

       Field direction hanya dipakai sebagai penanda.
    ================================================= */

    const directionField =

        steps.find(

            field =>

                isDirectionField(

                    field,

                    transaction

                )

        );


    const activityField =

        steps.find(

            field =>

                field &&

                field.id === "type" &&

                field !== directionField

        );


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

                !isFieldVisible(

                    field,

                    transaction

                )

            ){

                return;

            }


            /* =========================================
               FINANCIAL / WORKSPACE LAIN
            ========================================= */

            if(

                field === directionField &&

                activityField

            ){

                return;

            }


            const label =

                getDisplayLabel(

                    field,

                    value,

                    transaction

                );


            const displayValue =

                getDisplayValue(

                    field,

                    value,

                    transaction

                );


            if(

                displayValue ===

                    ""

            ){

                return;

            }


            result.push({

                id :

                    field.id,

                label :

                    label,

                value :

                    displayValue,

                type :

                    field.type,

                isPrimary :

                    isPrimaryField(

                        field,

                        directionField,

                        activityField

                    )

            });

        }

    );


    /* =================================================
       PRIMARY FIELD FIRST
    ================================================= */

    result.sort(

        (

            a,

            b

        ) => {

            if(

                a.isPrimary &&

                !b.isPrimary

            ){

                return -1;

            }


            if(

                !a.isPrimary &&

                b.isPrimary

            ){

                return 1;

            }


            return 0;

        }

    );


    return result;

}


/* =====================================================
   FIELD VISIBILITY
===================================================== */

function isFieldVisible(

    field,

    transaction

){

    if(

        typeof field.showWhen !==

            "function"

    ){

        return true;

    }


    try{

        return Boolean(

            field.showWhen(

                transaction

            )

        );

    }

    catch(error){

        console.warn(

            "Renderer showWhen error:",

            error

        );

        return true;

    }

}


/* =====================================================
   PRIMARY FIELD
===================================================== */

function isPrimaryField(

    field,

    directionField,

    activityField

){

    if(

        activityField

        &&

        field === activityField

    ){

        return true;

    }


    if(

        !activityField

        &&

        field === directionField

    ){

        return true;

    }


    return false;

}


/* =====================================================
   DIRECTION FIELD
===================================================== */

function isDirectionField(

    field,

    transaction

){

    if(

        !field ||

        !field.id

    ){

        return false;

    }


    const value =

        transaction[

            field.id

        ];


    if(

        value !== "masuk" &&

        value !== "keluar"

    ){

        return false;

    }


    /* =============================================
       PRIORITAS FIELD UMUM
    ============================================= */

    if(

        field.id === "type" ||

        field.id === "jenis" ||

        field.id === "transactionType"

    ){

        return true;

    }


    /* =============================================
       FALLBACK BERDASARKAN OPTIONS
    ============================================= */

    const options =

        getFieldOptions(

            field,

            transaction

        );


    return options.some(

        option => {

            const optionValue =

                typeof option === "object"

                    ?

                option.value

                    :

                option;


            return (

                optionValue === "masuk" ||

                optionValue === "keluar"

            );

        }

    );

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
       PRIMARY ACTIVITY
    ============================================= */

    if(

        field.id === "type"

    ){

        return getActivityLabel(

            field,

            value,

            transaction

        );

    }


    /* =============================================
       DIRECTION
    ============================================= */

    if(

        value === "masuk"

    ){

        return "Masuk";

    }


    if(

        value === "keluar"

    ){

        return "Keluar";

    }


    /* =============================================
       DEFAULT LABEL
    ============================================= */

    return resolveFieldLabel(

        field,

        transaction

    );

}

/* =====================================================
   RESOLVE FIELD LABEL
===================================================== */

function resolveFieldLabel(

    field,

    transaction

){

    if(

        !field

    ){

        return "";

    }


    /* =============================================
       DYNAMIC LABEL
       
       label dapat berupa function:

       values =>
           values.jenis === "transfer"
               ? "Bank Asal"
               : "Bank"
    ============================================= */

    if(

        typeof field.label ===

            "function"

    ){

        try{

            return escapeHTML(

                field.label(

                    transaction

                )

            );

        }

        catch(error){

            console.warn(

                "Renderer label error:",

                error

            );

            return escapeHTML(

                field.id

            );

        }

    }


    /* =============================================
       STATIC LABEL
    ============================================= */

    return escapeHTML(

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
       DIRECTION FIELD
    ============================================= */

    if(

        value === "masuk"

    ){

        return "💰 Masuk";

    }


    if(

        value === "keluar"

    ){

        return "💸 Keluar";

    }

       /* =============================================
       CUSTOM DISPLAY
    ============================================= */

    if(

        typeof field.display ===

            "function"

    ){

        try{

            return escapeHTML(

                field.display(

                    value,

                    transaction

                )

            );

        }

        catch(error){

            console.warn(

                "Renderer display error:",

                error

            );

        }

    }


    /* =============================================
       CUSTOM FORMAT
    ============================================= */

    if(

        typeof field.format ===

            "function"

    ){

        try{

            return escapeHTML(

                field.format(

                    value,

                    transaction

                )

            );

        }

        catch(error){

            console.warn(

                "Renderer format error:",

                error

            );

        }

    }


    /* =============================================
       NUMBER
    ============================================= */

    if(

        field.type === "number"

        ||

        field.id === "amount"

        ||

        field.id === "nominal"

    ){

        return formatCurrency(

            value

        );

    }


    /* =============================================
       SELECT
    ============================================= */

    if(

        field.type === "select"

    ){

        return getOptionLabel(

            field,

            value,

            transaction

        );

    }


    /* =============================================
       CUSTOM DISPLAY
    ============================================= */

    if(

        typeof field.display ===

            "function"

    ){

        try{

            return escapeHTML(

                field.display(

                    value,

                    transaction

                )

            );

        }

        catch(error){

            console.warn(

                "Renderer display error:",

                error

            );

        }

    }


    /* =============================================
       CUSTOM FORMAT
    ============================================= */

    if(

        typeof field.format ===

            "function"

    ){

        try{

            return escapeHTML(

                field.format(

                    value,

                    transaction

                )

            );

        }

        catch(error){

            console.warn(

                "Renderer format error:",

                error

            );

        }

    }


    /* =============================================
       DEFAULT
    ============================================= */

    return escapeHTML(

        value

    );

}


/* =====================================================
   ACTIVITY LABEL
===================================================== */

function getActivityLabel(

    field,

    value,

    transaction

){

    const label =

        getOptionLabel(

            field,

            value,

            transaction

        );


    return label;

}


/* =====================================================
   OPTION LABEL
===================================================== */

function getOptionLabel(

    field,

    value,

    transaction

){

    const options =

        getFieldOptions(

            field,

            transaction

        );


    const option =

        options.find(

            item => {

                const optionValue =

                    typeof item === "object"

                        ?

                    item.value

                        :

                    item;


                return (

                    String(

                        optionValue

                    ) ===

                    String(

                        value

                    )

                );

            }

        );


    if(

        option &&

        typeof option === "object"

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
   GET FIELD OPTIONS
===================================================== */

function getFieldOptions(

    field,

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

            Array.isArray(

                field.options

            )

                ?

            field.options

                :

            [];

    }


    return options;

}


/* =====================================================
   FORMAT CURRENCY
===================================================== */

function formatCurrency(

    value

){

    const number =

        Number(

            String(

                value

            )

            .replace(

                /[^0-9.-]/g,

                ""

            )

        )

        || 0;


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

        number

    );

}


/* =====================================================
   RENDER FIELD VALUE
===================================================== */

function renderFieldValue(

    field

){

    if(

        !field

    ){

        return "";

    }


    /* =============================================
       PRIMARY
    ============================================= */

    if(

        field.isPrimary

    ){

        return `

            <div class="global-input-item-primary">

                ${field.value}

            </div>

        `;

    }


    /* =============================================
       NORMAL FIELD
    ============================================= */

    return `

        <div class="global-input-item-field">

            <div class="global-input-item-label">

                ${field.label}

            </div>


            <div class="global-input-item-value">

                ${field.value}

            </div>

        </div>

    `;

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
   GET WORKSPACE
===================================================== */

export function getRendererWorkspace(){

    return (

        State.workspace

        ||

        ""

    );

}


/* =====================================================
   GET RENDER CONFIG
===================================================== */

export function getRendererConfig(){

    return {

        workspace :

            State.workspace

            ||

            "",

        steps :

            Array.isArray(

                State.config?.steps

            )

                ?

            [

                ...State.config.steps

            ]

                :

            []

    };

}


/* =====================================================
   GET TRANSACTION DISPLAY DATA
===================================================== */

export function getTransactionDisplayData(

    transaction

){

    if(

        !transaction

    ){

        return [];

    }


    return getDisplayFields(

        transaction

    );

}


/* =====================================================
   CHECK TRANSACTION VALUE
===================================================== */

export function hasTransactionValue(

    transaction,

    fieldId

){

    if(

        !transaction ||

        !fieldId

    ){

        return false;

    }


    const value =

        transaction[

            fieldId

        ];


    return (

        value !== undefined &&

        value !== null &&

        String(

            value

        ).trim() !== ""

    );

}


/* =====================================================
   GET TRANSACTION FIELD
===================================================== */

export function getTransactionField(

    transaction,

    fieldId

){

    if(

        !transaction ||

        !fieldId

    ){

        return undefined;

    }


    return transaction[

        fieldId

    ];

}


/* =====================================================
   GET TRANSACTION AMOUNT
===================================================== */

export function getTransactionAmount(

    transaction

){

    if(

        !transaction

    ){

        return 0;

    }


    const steps =

        Array.isArray(

            State.config?.steps

        )

            ?

        State.config.steps

            :

        [];


    /* =============================================
       NUMBER FIELD DARI CONFIG
    ============================================= */

    const numberField =

        steps.find(

            field =>

                field &&

                field.type === "number" &&

                hasTransactionValue(

                    transaction,

                    field.id

                )

        );


    if(

        numberField

    ){

        return Number(

            String(

                transaction[

                    numberField.id

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
   GET TRANSACTION DIRECTION
===================================================== */

export function getTransactionDirection(

    transaction

){

    if(

        !transaction

    ){

        return "";

    }


    const steps =

        Array.isArray(

            State.config?.steps

        )

            ?

        State.config.steps

            :

        [];


    const field =

        steps.find(

            item =>

                isDirectionField(

                    item,

                    transaction

                )

        );


    if(

        field

    ){

        return String(

            transaction[

                field.id

            ]

            ||

            ""

        ).toLowerCase();

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

    .toLowerCase();

}


/* =====================================================
   GET TRANSACTION ACTIVITY
===================================================== */

export function getTransactionActivity(

    transaction

){

    if(

        !transaction

    ){

        return "";

    }


    const steps =

        Array.isArray(

            State.config?.steps

        )

            ?

        State.config.steps

            :

        [];


    const directionField =

        steps.find(

            field =>

                isDirectionField(

                    field,

                    transaction

                )

        );


    /* =============================================
       TYPE FIELD
       
       Financial :
       jenis = direction
       type  = activity

       Kas :
       type = direction
       category = activity
    ============================================= */

    const activityField =

        steps.find(

            field =>

                field &&

                field.id === "type" &&

                field !== directionField

        );


    if(

        activityField &&

        hasTransactionValue(

            transaction,

            activityField.id

        )

    ){

        return String(

            transaction[

                activityField.id

            ]

        );

    }


    /* =============================================
       CATEGORY
    ============================================= */

    if(

        hasTransactionValue(

            transaction,

            "category"

        )

    ){

        return String(

            transaction.category

        );

    }


    /* =============================================
       FALLBACK
    ============================================= */

    return "";

}


/* =====================================================
   GET TRANSACTION NOTE
===================================================== */

export function getTransactionNote(

    transaction

){

    if(

        !transaction

    ){

        return "";

    }


    const steps =

        Array.isArray(

            State.config?.steps

        )

            ?

        State.config.steps

            :

        [];


    /* =============================================
       CONFIG FIELD

       Cari field text / textarea
       yang bukan direction / activity.
    ============================================= */

    const noteField =

        steps.find(

            field => {

                if(

                    !field ||

                    !field.id

                ){

                    return false;

                }


                if(

                    field.id === "type" ||

                    field.id === "jenis" ||

                    field.id === "category"

                ){

                    return false;

                }


                if(

                    field.type !== "text" &&

                    field.type !== "textarea"

                ){

                    return false;

                }


                return hasTransactionValue(

                    transaction,

                    field.id

                );

            }

        );


    if(

        noteField

    ){

        return String(

            transaction[

                noteField.id

            ]

        );

    }


    /* =============================================
       FALLBACK
    ============================================= */

    return String(

        transaction.keterangan

        ??

        transaction.note

        ??

        ""

    );

}


/* =====================================================
   GET TRANSACTION TYPE LABEL
===================================================== */

export function getTransactionTypeLabel(

    transaction

){

    const direction =

        getTransactionDirection(

            transaction

        );


    switch(

        direction

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

                direction

            );

    }

}


/* =====================================================
   DEBUG
===================================================== */

export function debugRenderer(

    transaction

){

    console.log(

        "GLOBAL INPUT RENDERER:",

        {

            workspace :

                State.workspace,

            transaction :

                transaction,

            fields :

                getTransactionDisplayData(

                    transaction

                ),

            direction :

                getTransactionDirection(

                    transaction

                ),

            activity :

                getTransactionActivity(

                    transaction

                ),

            amount :

                getTransactionAmount(

                    transaction

                ),

            note :

                getTransactionNote(

                    transaction

                )

        }

    );

}
