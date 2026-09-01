/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : renderer.js
   Version      : 2.1.0

   Description :
   Global Input Transaction Renderer

   Principle :
   Renderer bersifat GLOBAL.

   Renderer tidak mengetahui workspace tertentu.

   Struktur Config :

       State.config
            ↓
       State.config.module
            ↓
       module.steps
            ↓
       Renderer

   Compatibility :

       Jika module belum tersedia,
       State.config digunakan sebagai fallback.

   Controller :
       transaction.js

   Data :
       State.transactions

   Config :
       State.config.module.steps
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    State

} from "./state.js";


/* =====================================================
   GET MODULE CONFIG
=====================================================

   Struktur utama :

       State.config
           ↓
       module
           ↓
       workspace config

   Fallback :

       State.config

   digunakan jika module belum tersedia.

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

        deleteButton

        &&

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
=====================================================

   Semua field berasal dari :

       State.config.module.steps

   Renderer tidak mengetahui workspace.

===================================================== */

function getDisplayFields(

    transaction

){

    const steps =

        getSteps();


    const result = [];


    if(

        steps.length ===

            0

    ){

        console.warn(

            "Renderer: steps tidak ditemukan.",

            {

                workspace :

                    State.workspace,

                config :

                    State.config,

                module :

                    State.config?.module

            }

        );


        return result;

    }


    /* =================================================
       DIRECTION FIELD
       
       Contoh :

       Kas :
           type = masuk / keluar

       Financial :
           jenis = masuk / keluar

       Payroll Daily :
           status = masuk

       Field ini hanya menjadi
       penanda direction.

    ================================================= */

    const directionField =

        steps.find(

            field =>

                isDirectionField(

                    field,

                    transaction

                )

        );


    /* =================================================
       ACTIVITY FIELD
       
       Contoh Financial :

           jenis = masuk / keluar
           type  = gaji / belanja / ...

       Jika ada activity field,
       direction tidak ditampilkan sebagai
       field normal.

    ================================================= */

    const activityField =

        steps.find(

            field =>

                field

                &&

                field.id ===

                    "type"

                &&

                field !==

                    directionField

        );


    /* =================================================
       PROCESS STEPS
    ================================================= */

    steps.forEach(

        field => {

            if(

                !field

                ||

                !field.id

            ){

                return;

            }


            const value =

                transaction[

                    field.id

                ];


            /* =========================================
               FIELD TANPA NILAI
            ========================================= */

            if(

                value ===

                    undefined

                ||

                value ===

                    null

                ||

                String(

                    value

                ).trim() ===

                    ""

            ){

                return;

            }


            /* =========================================
               VISIBILITY
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
               HIDE DIRECTION
               
               Jika workspace memiliki
               activity field, direction
               tidak perlu ditampilkan
               sebagai field tambahan.

               Contoh :

               Financial

                   Masuk
                   Gaji
                   Rp100.000

               bukan :

                   Jenis : Masuk
                   Type  : Gaji

            ========================================= */

            if(

                field ===

                    directionField

                &&

                activityField

            ){

                return;

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


            if(

                displayValue ===

                    ""

            ){

                return;

            }


            /* =========================================
               PUSH
            ========================================= */

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

                a.isPrimary

                &&

                !b.isPrimary

            ){

                return -1;

            }


            if(

                !a.isPrimary

                &&

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

    /* =================================================
       ACTIVITY PRIORITY
    ================================================= */

    if(

        activityField

        &&

        field ===

            activityField

    ){

        return true;

    }


    /* =================================================
       DIRECTION PRIORITY
       
       Jika tidak ada activity,
       direction menjadi primary.

       Contoh :

       Kas :
           type = Masuk

       Payroll Daily :
           status = Masuk

    ================================================= */

    if(

        !activityField

        &&

        field ===

            directionField

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


    const normalizedValue =

        String(

            value ??

            ""

        )

        .trim()

        .toLowerCase();


    if(

        normalizedValue !==

            "masuk"

        &&

        normalizedValue !==

            "keluar"

    ){

        return false;

    }


    /* =============================================
       PRIORITAS FIELD UMUM
    ============================================= */

    if(

        field.id ===

            "type"

        ||

        field.id ===

            "jenis"

        ||

        field.id ===

            "transactionType"

        ||

        field.id ===

            "status"

    ){

        return true;

    }


    /* =============================================
       FALLBACK OPTIONS
    ============================================= */

    const options =

        getFieldOptions(

            field,

            transaction

        );


    return options.some(

        option => {

            const optionValue =

                typeof option ===

                    "object"

                    ?

                option.value

                    :

                option;


            const normalizedOption =

                String(

                    optionValue ??

                    ""

                )

                .trim()

                .toLowerCase();


            return (

                normalizedOption ===

                    "masuk"

                ||

                normalizedOption ===

                    "keluar"

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

    /* =================================================
       ACTIVITY
    ================================================= */

    if(

        field.id ===

            "type"

    ){

        return getActivityLabel(

            field,

            value,

            transaction

        );

    }


    /* =================================================
       DIRECTION
    ================================================= */

    const normalizedValue =

        String(

            value ??

            ""

        )

        .trim()

        .toLowerCase();


    if(

        normalizedValue ===

            "masuk"

    ){

        return "Masuk";

    }


    if(

        normalizedValue ===

            "keluar"

    ){

        return "Keluar";

    }


    /* =================================================
       DEFAULT
    ================================================= */

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


    /* =================================================
       DYNAMIC LABEL
    ================================================= */

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


    /* =================================================
       STATIC LABEL
    ================================================= */

    return escapeHTML(

        field.label

        ??

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

    const normalizedValue =

        String(

            value ??

            ""

        )

        .trim()

        .toLowerCase();


    /* =================================================
       DIRECTION
    ================================================= */

    if(

        normalizedValue ===

            "masuk"

    ){

        return "💰 Masuk";

    }


    if(

        normalizedValue ===

            "keluar"

    ){

        return "💸 Keluar";

    }


    /* =================================================
       CUSTOM DISPLAY
       
       display() memiliki prioritas
       paling tinggi setelah direction.
    ================================================= */

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


    /* =================================================
       CUSTOM FORMAT
    ================================================= */

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


    /* =================================================
       QUANTITY
    ================================================= */

    if(

        field.id ===

            "qty"

    ){

        return (

            escapeHTML(

                value

            )

            +

            " pcs"

        );

    }


    /* =================================================
       NUMBER
    ================================================= */

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


    /* =================================================
       SELECT
    ================================================= */

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


    /* =================================================
       DEFAULT
    ================================================= */

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

    return getOptionLabel(

        field,

        value,

        transaction

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

    const options =

        getFieldOptions(

            field,

            transaction

        );


    const option =

        options.find(

            item => {

                const optionValue =

                    typeof item ===

                        "object"

                        ?

                    item.value

                        :

                    item;


                return (

                    String(

                        optionValue ??

                        ""

                    )

                    ===

                    String(

                        value ??

                        ""

                    )

                );

            }

        );


    if(

        option

        &&

        typeof option ===

            "object"

    ){

        return escapeHTML(

            option.label

            ??

            option.value

            ??

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

    if(

        !field

    ){

        return [];

    }


    /* =================================================
       FUNCTION OPTIONS
    ================================================= */

    if(

        typeof field.options ===

            "function"

    ){

        try{

            const options =

                field.options(

                    transaction

                );


            return Array.isArray(

                options

            )

                ?

            options

                :

            [];

        }

        catch(error){

            console.warn(

                "Renderer options error:",

                error

            );


            return [];

        }

    }


    /* =================================================
       STATIC OPTIONS
    ================================================= */

    return Array.isArray(

        field.options

    )

        ?

    field.options

        :

    [];

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

                value ??

                ""

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


    /* =================================================
       PRIMARY
    ================================================= */

    if(

        field.isPrimary

    ){

        return `

            <div class="global-input-item-primary">

                ${field.value}

            </div>

        `;

    }


    /* =================================================
       NORMAL FIELD
    ================================================= */

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

    const config =

        getModuleConfig();


    return {

        workspace :

            State.workspace

            ||

            config.workspace

            ||

            "",


        steps :

            getSteps()

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

        !transaction

        ||

        !fieldId

    ){

        return false;

    }


    const value =

        transaction[

            fieldId

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


/* =====================================================
   GET TRANSACTION FIELD
===================================================== */

export function getTransactionField(

    transaction,

    fieldId

){

    if(

        !transaction

        ||

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

        getSteps();


    /* =================================================
       NUMBER FIELD DARI CONFIG
    ================================================= */

    const numberField =

        steps.find(

            field =>

                field

                &&

                field.type ===

                    "number"

                &&

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


    /* =================================================
       FALLBACK
    ================================================= */

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

        getSteps();


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

            ??

            ""

        )

        .trim()

        .toLowerCase();

    }


    /* =================================================
       FALLBACK
    ================================================= */

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

        getSteps();


    const directionField =

        steps.find(

            field =>

                isDirectionField(

                    field,

                    transaction

                )

        );


    /* =================================================
       ACTIVITY FIELD
    ================================================= */

    const activityField =

        steps.find(

            field =>

                field

                &&

                field.id ===

                    "type"

                &&

                field !==

                    directionField

        );


    if(

        activityField

        &&

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


    /* =================================================
       CATEGORY
    ================================================= */

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


    /* =================================================
       FALLBACK
    ================================================= */

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

        getSteps();


    /* =================================================
       CONFIG FIELD
       
       Cari field text / textarea
       yang bukan direction / activity.
    ================================================= */

    const noteField =

        steps.find(

            field => {

                if(

                    !field

                    ||

                    !field.id

                ){

                    return false;

                }


                if(

                    field.id ===

                        "type"

                    ||

                    field.id ===

                        "jenis"

                    ||

                    field.id ===

                        "category"

                ){

                    return false;

                }


                if(

                    field.type !==

                        "text"

                    &&

                    field.type !==

                        "textarea"

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


    /* =================================================
       FALLBACK
    ================================================= */

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

    const config =

        getModuleConfig();


    const fields =

        getTransactionDisplayData(

            transaction

        );


    console.log(

        "=========================================="

    );


    console.log(

        "===== GLOBAL INPUT RENDERER ====="

    );


    console.log(

        "=========================================="

    );


    console.log(

        "Workspace:",

        State.workspace

    );


    console.log(

        "Config:",

        State.config

    );


    console.log(

        "Module:",

        config

    );


    console.log(

        "Steps:",

        getSteps()

    );


    console.log(

        "Transaction:",

        transaction

    );


    console.log(

        "Fields:",

        fields

    );


    console.log(

        "Direction:",

        getTransactionDirection(

            transaction

        )

    );


    console.log(

        "Activity:",

        getTransactionActivity(

            transaction

        )

    );


    console.log(

        "Amount:",

        getTransactionAmount(

            transaction

        )

    );


    console.log(

        "Note:",

        getTransactionNote(

            transaction

        )

    );


    console.log(

        "=========================================="

    );


    return {

        workspace :

            State.workspace,

        config :

            State.config,

        module :

            config,

        steps :

            getSteps(),

        transaction :

            transaction,

        fields :

            fields,

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

    };

}
