/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Financial
   File         : financial.js
   Version      : 1.2.0

   Description :
   Input Flow Configuration for Financial

   Data Source :
   Global Input Data Engine
        ↓
   Global Workspace
        ↓
   financial.sheets
        ↓
   getInputData()

   Flow :
   Jenis
   → Activity
   → Nominal
   → Keterangan

   Principle :
   - Tidak ada getter Financial khusus.
   - Data activity berasal dari getInputData().
   - Workspace dan sheet ditentukan oleh
     Global Workspace.
   - TYPE_RULE tetap menjadi konfigurasi
     bisnis milik Financial.

   Edit Row :
   - Menggunakan Global EditRow Engine.
   - Target record berdasarkan ID + Tanggal.
   - ID dan Tanggal dikunci.
   - Control mengikuti konfigurasi Input.
   - Value select tetap menggunakan canonical value.
   - Tidak mengubah flow Input normal.
===================================================== */


/* =====================================================
   IMPORT DATA
===================================================== */

import {

    getInputData,
    getInputRaw

} from "./data.js";


/* =====================================================
   IMPORT EDIT ROW
===================================================== */

import {

    EditRow

} from "./editrow.js";


/* =====================================================
   PREFIX
===================================================== */

export const PREFIX =

    "FIN";


/* =====================================================
   RULE CONFIGURATION
===================================================== */

const TYPE_RULE = {

    masuk :
        "rule_pemasukan",

    keluar :
        "rule_pengeluaran",

    hutang :
        "rule_hutang",

    bayar :
        "rule_hutang",

    nabung :
        "rule_tabungan",

    tarik :
        "rule_tabungan"

};


/* =====================================================
   TYPE LABEL
===================================================== */

const TYPE_LABEL = {

    masuk :
        "💰 Masuk",

    keluar :
        "💸 Keluar",

    bayar :
        "💳 Bayar",

    tarik :
        "↩️ Tarik",

    nabung :
        "🏦 Nabung",

    hutang :
        "🤝 Hutang"

};


/* =====================================================
   GET INPUT RULE DATA
===================================================== */

/*
   Data berasal dari sheet kedua
   workspace Financial.

   Contoh :

       financial
           ↓
       financial_activity
           ↓
       getInputData()
*/

function getRules(){

    const data =

        getInputData();


    if(

        !Array.isArray(

            data

        )

    ){

        return [];

    }


    return data

        .filter(

            item =>

                item &&

                typeof item ===

                    "object"

        )

        .map(

            item => ({

                rules :

                    String(

                        item?.rules ??

                        ""

                    )

                        .trim()

                        .toLowerCase(),

                type :

                    String(

                        item?.type ??

                        ""

                    )

                        .split(",")

                        .map(

                            value =>

                                value

                                    .trim()

                                    .toLowerCase()

                        )

                        .filter(

                            Boolean

                        ),

                activity :

                    String(

                        item?.activity ??

                        ""

                    )

                        .split(",")

                        .map(

                            value =>

                                value

                                    .trim()

                                    .toLowerCase()

                        )

                        .filter(

                            Boolean

                        )

            })

        );

}


/* =====================================================
   GET RULE
===================================================== */

function getRule(

    ruleName

){

    return getRules().find(

        rule =>

            rule.rules ===

            ruleName

    );

}


/* =====================================================
   GET AVAILABLE TYPES
===================================================== */

function getAvailableTypes(){

    const available = [];


    /*
       Urutan type tetap menjadi
       urutan tampilan Financial.
    */

    const types = [

        "masuk",

        "keluar",

        "bayar",

        "tarik",

        "nabung",

        "hutang"

    ];


    types.forEach(

        type => {

            const ruleName =

                TYPE_RULE[type];


            const rule =

                getRule(

                    ruleName

                );


            if(

                !rule

            ){

                return;

            }


            /*
               Rule harus benar-benar
               mengizinkan type tersebut.
            */

            if(

                !rule.type.includes(

                    type

                )

            ){

                return;

            }


            available.push({

                value :

                    type,

                label :

                    TYPE_LABEL[type]

            });

        }

    );


    return available;

}


/* =====================================================
   GET ACTIVITY BY TYPE
===================================================== */

function getActivityByType(

    type

){

    if(

        !type

    ){

        return [];

    }


    const ruleName =

        TYPE_RULE[type];


    if(

        !ruleName

    ){

        return [];

    }


    const rule =

        getRule(

            ruleName

        );


    if(

        !rule

    ){

        return [];

    }


    return rule.activity.map(

        activity => ({

            value :

                activity,

            label :

                formatActivity(

                    activity

                )

        })

    );

}


/* =====================================================
   FORMAT ACTIVITY LABEL
===================================================== */

function formatActivity(

    value

){

    return String(

        value ??

        ""

    )

        .replace(

            /_/g,

            " "

        )

        .replace(

            /\b\w/g,

            char =>

                char.toUpperCase()

        );

}


/* =====================================================
   FINANCIAL
===================================================== */

export const Financial = {

    /* =================================================
       WORKSPACE
    ================================================= */

    workspace :

        "financial",


    /* =================================================
       PREFIX
    =================================================

       Digunakan oleh Global Input Controller
       untuk membuat ID transaksi.

       Contoh :

           FIN-XXXXXXXX

    ================================================= */

    prefix :

        PREFIX,


    /* =================================================
       TITLE
    ================================================= */

    title :

        "Input Financial",


    /* =================================================
       SUBTITLE
    ================================================= */

    subtitle :

        "Tambahkan transaksi Financial",


    /* =================================================
       FLOW
    ================================================= */

    steps : [

        /* =============================================
           1. JENIS TRANSAKSI
        ============================================= */

        {

            id :

                "jenis",

            label :

                "Jenis Transaksi",

            type :

                "select",

            options :

                () =>

                    getAvailableTypes()

        },


        /* =============================================
           2. ACTIVITY
        ============================================= */

        {

            id :

                "type",

            label :

                "Aktivitas",

            type :

                "select",

            options :

                values =>

                    getActivityByType(

                        values.jenis

                    )

        },


        /* =============================================
           3. NOMINAL
        ============================================= */

        {

            id :

                "nominal",

            label :

                "Nominal",

            type :

                "number",

            placeholder :

                "Masukkan nominal"

        },


        /* =============================================
           4. KETERANGAN
        ============================================= */

        {

            id :

                "keterangan",

            label :

                "Keterangan",

            type :

                "text",

            placeholder :

                "Keterangan transaksi"

        }

    ]

};


/* =====================================================
   EDIT INPUT ROW
===================================================== */

/*
   Edit Row menggunakan engine global.

   Financial hanya menyediakan konfigurasi
   workspace-specific.

   Target :

       ID + Tanggal

   Field :

       jenis
       type
       nominal
       keterangan

   ID dan Tanggal ditangani sebagai
   locked field oleh Global EditRow.
*/

export function openFinancialEditRow(){

    EditRow.open({

        /* =============================================
           WORKSPACE
        ============================================= */

        workspace :

            "financial",


        /* =============================================
           RECORD SOURCE
        ============================================= */

        records :

            getInputRaw(),


        /* =============================================
           ID FIELD
        ============================================= */

        getIdField :

            () =>

                "id",


        /* =============================================
           DATE FIELD
        ============================================= */

        getDateField :

            () =>

                "tanggal",


        /* =============================================
           RECORD LABEL
        ============================================= */

        getRecordLabel :

            record => {

                const jenis =

                    record?.jenis ??

                    "-";


                const activity =

                    record?.type ??

                    "-";


                return `${

                    formatFinancialValue(

                        jenis

                    )

                } · ${

                    formatActivity(

                        activity

                    )

                }`;

            },


        /* =============================================
           RECORD META
        ============================================= */

        getRecordMeta :

            record => {

                const nominal =

                    record?.nominal;


                const keterangan =

                    record?.keterangan;


                const parts = [];


                if(

                    nominal !==

                    undefined &&

                    nominal !==

                    null &&

                    nominal !==

                    ""

                ){

                    parts.push(

                        formatNominal(

                            nominal

                        )

                    );

                }


                if(

                    keterangan

                ){

                    parts.push(

                        String(

                            keterangan

                        )

                    );

                }


                return parts.join(

                    " · "

                );

            },


        /* =============================================
           SEARCH
        ============================================= */

        getSearchText :

            record => {

                return [

                    record?.id,

                    record?.tanggal,

                    record?.jenis,

                    record?.type,

                    record?.nominal,

                    record?.keterangan

                ]

                    .filter(

                        value =>

                            value !==

                            undefined &&

                            value !==

                            null

                    )

                    .join(" ");

            },


        /* =============================================
           FIELD TYPE
        ============================================= */

        getFieldType :

            field => {

                switch(

                    field

                ){

                    case "jenis":

                        return "select";


                    case "type":

                        return "select";


                    case "nominal":

                        return "number";


                    case "keterangan":

                        return "text";


                    default:

                        return undefined;

                }

            },


        /* =============================================
           FIELD LABEL
        ============================================= */

        getFieldLabel :

            field => {

                const labels = {

                    id :
                        "ID",

                    tanggal :
                        "Tanggal",

                    jenis :
                        "Jenis Transaksi",

                    type :
                        "Aktivitas",

                    nominal :
                        "Nominal",

                    keterangan :
                        "Keterangan"

                };


                return (

                    labels[field] ??

                    field

                );

            },


        /* =============================================
           FIELD CONFIG
        ============================================= */

        getFieldConfig :

            (field, record, values) => {

                switch(

                    field

                ){

                    /* =================================
                       JENIS
                    ================================= */

                    case "jenis":

                        return {

                            type :

                                "select",

                            options :

                                getAvailableTypes(),

                            required :

                                true

                        };


                    /* =================================
                       ACTIVITY
                    ================================= */

                    case "type":

                        return {

                            type :

                                "select",

                            options :

                                getActivityByType(

                                    values?.jenis ??

                                    record?.jenis

                                ),

                            required :

                                true

                        };


                    /* =================================
                       NOMINAL
                    ================================= */

                    case "nominal":

                        return {

                            type :

                                "number",

                            placeholder :

                                "Masukkan nominal"

                        };


                    /* =================================
                       KETERANGAN
                    ================================= */

                    case "keterangan":

                        return {

                            type :

                                "text",

                            placeholder :

                                "Keterangan transaksi"

                        };


                    default:

                        return {};

                }

            },


        /* =============================================
           FIELD ORDER
        ============================================= */

        getFieldOrder :

            () => [

                "id",

                "tanggal",

                "jenis",

                "type",

                "nominal",

                "keterangan"

            ],


        /* =============================================
           LOCKED FIELD
        ============================================= */

        isFieldLocked :

            field => {

                return (

                    field ===

                    "id" ||

                    field ===

                    "tanggal"

                );

            },


        /* =============================================
           EDITABLE FIELD
        ============================================= */

        isFieldEditable :

            field => {

                return [

                    "jenis",

                    "type",

                    "nominal",

                    "keterangan"

                ].includes(

                    field

                );

            },


        /* =============================================
           DETAIL
        ============================================= */

        renderDetail :

            record => {

                const id =

                    escapeHTML(

                        record?.id ??

                        "-"

                    );


                const tanggal =

                    escapeHTML(

                        record?.tanggal ??

                        "-"

                    );


                const jenis =

                    escapeHTML(

                        formatFinancialValue(

                            record?.jenis

                        )

                    );


                const activity =

                    escapeHTML(

                        formatActivity(

                            record?.type

                        )

                    );


                return `

                    <div class="global-edit-row-detail">

                        <div>

                            <span>ID</span>

                            <strong>

                                ${id}

                            </strong>

                        </div>


                        <div>

                            <span>Tanggal</span>

                            <strong>

                                ${tanggal}

                            </strong>

                        </div>


                        <div>

                            <span>Jenis Transaksi</span>

                            <strong>

                                ${jenis}

                            </strong>

                        </div>


                        <div>

                            <span>Aktivitas</span>

                            <strong>

                                ${activity}

                            </strong>

                        </div>

                    </div>

                `;

            },


        /* =============================================
           VALIDATION
        ============================================= */

        validate :

            (record, values) => {

                if(

                    !values

                ){

                    return {

                        valid :

                            false,

                        message :

                            "Data tidak ditemukan."

                    };

                }


                if(

                    !values.jenis

                ){

                    return {

                        valid :

                            false,

                        message :

                            "Jenis Transaksi wajib dipilih."

                    };

                }


                if(

                    !values.type

                ){

                    return {

                        valid :

                            false,

                        message :

                            "Aktivitas wajib dipilih."

                    };

                }


                const nominal =

                    Number(

                        values.nominal

                    );


                if(

                    !Number.isFinite(

                        nominal

                    ) ||

                    nominal <= 0

                ){

                    return {

                        valid :

                            false,

                        message :

                            "Nominal harus lebih dari 0."

                    };

                }


                return {

                    valid :

                        true

                };

            },


        /* =============================================
           PENDING LABEL
        ============================================= */

        getPendingLabel :

            (record, changes) => {

                const jenis =

                    formatFinancialValue(

                        changes?.jenis ??

                        record?.jenis

                    );


                const activity =

                    formatActivity(

                        changes?.type ??

                        record?.type

                    );


                return `${

                    jenis

                } · ${

                    activity

                }`;

            },


        /* =============================================
           ADD
           Tidak menyentuh Apps Script.
           Semua perubahan tetap lokal sampai
           Konfirmasi.
        ============================================= */

        onAdd :

            () => {

                return true;

            },


        /* =============================================
           REMOVE
        ============================================= */

        onRemove :

            () => {

                return true;

            },


        /* =============================================
           CONFIRM
           Update dilakukan oleh Global EditRow.
        ============================================= */

        onConfirm :

            pending => {

                return EditRow.confirm(

                    pending

                );

            },


        /* =============================================
           UI TEXT
        ============================================= */

        listTitle :

            "Data Financial",


        searchPlaceholder :

            "Cari ID, tanggal, aktivitas...",


        addButtonText :

            "Tambahkan",


        confirmButtonText :

            "Konfirmasi"

    });

}


/* =====================================================
   GET CONFIG
===================================================== */

export function getFinancialInputConfig(){

    return Financial;

}


/* =====================================================
   GET AVAILABLE TYPES
===================================================== */

export function getFinancialTypes(){

    return getAvailableTypes();

}


/* =====================================================
   GET ACTIVITIES
===================================================== */

export function getFinancialActivities(

    type

){

    return getActivityByType(

        type

    );

}


/* =====================================================
   DEBUG
===================================================== */

export function debugFinancialInput(){

    const data =

        getInputData();


    const rules =

        getRules();


    const types =

        getAvailableTypes();


    console.log(

        "=========================================="

    );


    console.log(

        "===== FINANCIAL INPUT DEBUG ====="

    );


    console.log(

        "=========================================="

    );


    console.log(

        "Raw Input Data:",

        data

    );


    console.log(

        "Normalized Rules:",

        rules

    );


    console.log(

        "Available Types:",

        types

    );


    console.log(

        "Financial Config:",

        Financial

    );


    console.log(

        "=========================================="

    );


    return {

        data :

            Array.isArray(

                data

            )

            ?

            [

                ...data

            ]

            :

            [],


        rules :

            [

                ...rules

            ],


        types :

            [

                ...types

            ],


        config :

            Financial

    };

}


/* =====================================================
   FINANCIAL VALUE FORMAT
===================================================== */

function formatFinancialValue(

    value

){

    if(

        !value

    ){

        return "-";

    }


    return String(

        value

    )

        .replace(

            /_/g,

            " "

        )

        .replace(

            /\b\w/g,

            char =>

                char.toUpperCase()

        );

}


/* =====================================================
   NOMINAL FORMAT
===================================================== */

function formatNominal(

    value

){

    const number =

        Number(

            value

        );


    if(

        !Number.isFinite(

            number

        )

    ){

        return String(

            value ??

            "-"

        );

    }


    return number.toLocaleString(

        "id-ID"

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
