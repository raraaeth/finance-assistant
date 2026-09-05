/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Financial
   File         : financial.js
   Version      : 1.2.2

   Description :
   Input Flow Configuration for Financial

   Data Source :
   Global Input Data Engine
        ↓
   Global Workspace
        ↓
   financial.sheets
        ↓
   financial_activity
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
   - Control mengikuti struktur Input Financial.
   - Select mempertahankan canonical value.
   - Field hasil proses / field tambahan tidak diedit.
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
   EDITABLE FIELDS
===================================================== */

/*
   Hanya field yang memang digunakan oleh
   Normal Input Financial yang boleh diedit
   melalui Edit Row.

   ID + Tanggal tetap dikunci oleh Global EditRow.

   Field lain yang mungkin terdapat pada row
   karena hasil proses / kolom tambahan Sheet
   tidak boleh ikut diedit.
*/

const EDITABLE_FIELDS = [

    "jenis",

    "type",

    "nominal",

    "keterangan"

];


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

    ],


    /* =================================================
       EDIT INPUT
    ================================================= */

    async openEdit(

        context = null

    ){

        const mode =

            typeof context ===

                "object" &&

            context !== null

                ?

                context.mode

                :

                context;


        const normalizedMode =

            normalizeValue(

                mode

            );


        /*
           Financial hanya mempunyai
           Edit Input Row.

           Jika mode kosong, tetap buka
           Edit Row agar kompatibel dengan
           Global Input Edit Controller.
        */

        if(

            normalizedMode &&

            normalizedMode !== "row"

        ){

            console.warn(

                "[Financial] Mode Edit Input tidak dikenal:",

                mode

            );

        }


        return openEditRow();

    }

};


/* =====================================================
   EDIT INPUT ROW
===================================================== */

/*
   Financial adapter untuk Global EditRow.

   Generic EditRow menangani :

   - maksimal 20 record
   - direct list
   - search
   - selected record
   - detail
   - editable field
   - staging
   - pending
   - duplicate protection
   - Konfirmasi
   - Update Row

   Financial hanya menentukan :

   - source data
   - ID
   - Tanggal
   - label
   - tipe field
   - option field
   - urutan field
   - editable field
   - validation
*/


async function openEditRow(){

    console.log(

        "===== FINANCIAL EDIT INPUT ROW OPEN ====="

    );


    /* =============================================
       GET RECORDS
    ============================================= */

    const records =

        typeof EditRow.getEditableRecords ===

            "function"

            ?

            EditRow.getEditableRecords()

            :

            getInputRaw();


    console.log(

        "Financial Edit Row records:",

        records

    );


    /* =============================================
       RESET
    ============================================= */

    if(

        typeof EditRow.reset ===

            "function"

    ){

        EditRow.reset();

    }


    /* =============================================
       OPEN CHECK
    ============================================= */

    if(

        !EditRow ||

        typeof EditRow.open !==

            "function"

    ){

        console.error(

            "[Financial] EditRow.open() tidak tersedia."

        );

        return null;

    }


    /* =============================================
       OPEN GLOBAL EDIT ROW
    ============================================= */

    return EditRow.open({

        /* =========================================
           WORKSPACE
        ========================================= */

        workspace :

            "financial",


        /* =========================================
           MODE
        ========================================= */

        mode :

            "row",


        /* =========================================
           HEADER
        ========================================= */

        title :

            "Edit Input Row",


        subtitle :

            "Pilih transaksi dari daftar untuk mengubah data.",


        /* =========================================
           RECORD SOURCE
        ========================================= */

        getRecords :

            () => getInputRaw(),


        /* =========================================
           TARGET FIELD
        ========================================= */

        getIdField :

            record => {

                return "id";

            },


        getDateField :

            record => {

                return "tanggal";

            },


        /* =========================================
           EDITABLE FIELD LIST
        ========================================= */

        editableFields :

            [

                ...EDITABLE_FIELDS

            ],


        /* =========================================
           LOCKED FIELD
        ========================================= */

        isFieldLocked :

            (

                field,

                record

            ) => {

                const normalized =

                    normalizeValue(

                        field

                    );


                /*
                   ID dan Tanggal selalu
                   dikunci oleh Global EditRow.
                */

                if(

                    normalized === "id" ||

                    normalized === "tanggal"

                ){

                    return true;

                }


                /*
                   Field yang bukan bagian
                   dari Normal Input Financial
                   juga dikunci.

                   Contoh :

                   Month
                   Year
                   field hasil proses
                   atau kolom tambahan Sheet.
                */

                return !EDITABLE_FIELDS.includes(

                    normalized

                );

            },


        /* =========================================
           EDITABLE CHECK
        ========================================= */

        isFieldEditable :

            (

                field,

                record

            ) => {

                const normalized =

                    normalizeValue(

                        field

                    );


                return EDITABLE_FIELDS.includes(

                    normalized

                );

            },


        /* =========================================
           RECORD LABEL
        ========================================= */

        getRecordLabel :

            record => {

                const jenis =

                    formatFinancialValue(

                        record?.jenis

                    );


                const activity =

                    formatActivity(

                        record?.type

                    );


                const id =

                    String(

                        record?.id ??

                        ""

                    ).trim();


                const main =

                    jenis !== "-"

                        ?

                        jenis

                        :

                        "Financial";


                const detail =

                    activity !== "-"

                        ?

                        activity

                        :

                        "";


                if(

                    detail

                ){

                    return `${

                        main

                    } · ${

                        detail

                    }`;

                }


                return id ||

                    main;

            },


        /* =========================================
           RECORD META
        ========================================= */

        getRecordMeta :

            record => {

                const tanggal =

                    String(

                        record?.tanggal ??

                        ""

                    ).trim();


                const nominal =

                    record?.nominal;


                const keterangan =

                    String(

                        record?.keterangan ??

                        ""

                    ).trim();


                const parts = [];


                if(

                    tanggal

                ){

                    parts.push(

                        tanggal

                    );

                }


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

                        keterangan

                    );

                }


                return parts.join(

                    " · "

                );

            },


        /* =========================================
           SEARCH
        ========================================= */

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


        /* =========================================
           FIELD TYPE
        ========================================= */

        getFieldType :

            (

                field,

                value,

                record

            ) => {

                const normalized =

                    normalizeValue(

                        field

                    );


                /* =================================
                   JENIS
                ================================= */

                if(

                    normalized ===

                    "jenis"

                ){

                    return "select";

                }


                /* =================================
                   ACTIVITY
                ================================= */

                if(

                    normalized ===

                    "type"

                ){

                    return "select";

                }


                /* =================================
                   NOMINAL
                ================================= */

                if(

                    normalized ===

                    "nominal"

                ){

                    return "number";

                }


                /* =================================
                   KETERANGAN
                ================================= */

                if(

                    normalized ===

                    "keterangan"

                ){

                    return "text";

                }


                return undefined;

            },


        /* =========================================
           FIELD LABEL
        ========================================= */

        getFieldLabel :

            (

                field,

                record

            ) => {

                switch(

                    normalizeValue(

                        field

                    )

                ){

                    case "id":

                        return "ID";


                    case "tanggal":

                        return "Tanggal";


                    case "jenis":

                        return "Jenis Transaksi";


                    case "type":

                        return "Aktivitas";


                    case "nominal":

                        return "Nominal";


                    case "keterangan":

                        return "Keterangan";


                    default:

                        return formatFinancialValue(

                            field

                        );

                }

            },


        /* =========================================
           FIELD CONFIG
        ========================================= */

        getFieldConfig :

            (

                field,

                record,

                context

            ) => {

                switch(

                    normalizeValue(

                        field

                    )

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

                                true,

                            placeholder :

                                "Pilih jenis transaksi"

                        };


                    /* =================================
                       ACTIVITY
                    ================================= */

                    case "type":

                        return {

                            type :

                                "select",

                            options :

                                values =>

                                    getActivityByType(

                                        values?.jenis ??

                                        record?.jenis

                                    ),

                            required :

                                true,

                            placeholder :

                                "Pilih aktivitas"

                        };


                    /* =================================
                       NOMINAL
                    ================================= */

                    case "nominal":

                        return {

                            type :

                                "number",

                            required :

                                true,

                            min :

                                0,

                            step :

                                "any",

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

                        return {

                            type :

                                "text"

                        };

                }

            },


        /* =========================================
           FIELD ORDER
        ========================================= */

        getFieldOrder :

            record => {

                /*
                   Field input Financial selalu
                   ditampilkan dalam urutan yang
                   sama dengan Normal Input.

                   Field lain tidak dimasukkan
                   ke area edit.
                */

                return [

                    "id",

                    "tanggal",

                    "jenis",

                    "type",

                    "nominal",

                    "keterangan"

                ].filter(

                    field =>

                        record &&

                        Object.prototype.hasOwnProperty.call(

                            record,

                            field

                        )

                );

            },


        /* =========================================
           DETAIL
        ========================================= */

        renderDetail :

            record => {

                return {

                    title :

                        "Informasi Transaksi",

                    items : [

                        {

                            label :

                                "ID",

                            value :

                                String(

                                    record?.id ??

                                    "-"

                                ),

                            locked :

                                true

                        },


                        {

                            label :

                                "Tanggal",

                            value :

                                String(

                                    record?.tanggal ??

                                    "-"

                                ),

                            locked :

                                true

                        },


                        {

                            label :

                                "Jenis Transaksi",

                            value :

                                formatFinancialValue(

                                    record?.jenis

                                )

                        },


                        {

                            label :

                                "Aktivitas",

                            value :

                                formatActivity(

                                    record?.type

                                )

                        },


                        {

                            label :

                                "Nominal",

                            value :

                                formatNominal(

                                    record?.nominal

                                )

                        },


                        {

                            label :

                                "Keterangan",

                            value :

                                String(

                                    record?.keterangan ??

                                    "-"

                                )

                        }

                    ]

                };

            },


        /* =========================================
           VALIDATE
        ========================================= */

        validate :

            (

                record,

                values,

                context

            ) => {

                if(

                    !record

                ){

                    return false;

                }


                /* =================================
                   ID
                ================================= */

                const id =

                    String(

                        record?.id ??

                        ""

                    ).trim();


                if(

                    !id

                ){

                    console.error(

                        "[Financial EditRow] ID kosong."

                    );

                    return false;

                }


                /* =================================
                   TANGGAL
                ================================= */

                const tanggal =

                    String(

                        record?.tanggal ??

                        ""

                    ).trim();


                if(

                    !tanggal

                ){

                    console.error(

                        "[Financial EditRow] Tanggal kosong."

                    );

                    return false;

                }


                /* =================================
                   JENIS
                ================================= */

                if(

                    !values?.jenis

                ){

                    console.error(

                        "[Financial EditRow] Jenis transaksi kosong."

                    );

                    return false;

                }


                /* =================================
                   ACTIVITY
                ================================= */

                if(

                    !values?.type

                ){

                    console.error(

                        "[Financial EditRow] Aktivitas kosong."

                    );

                    return false;

                }


                /* =================================
                   NOMINAL
                ================================= */

                const nominal =

                    Number(

                        values?.nominal

                    );


                if(

                    !Number.isFinite(

                        nominal

                    ) ||

                    nominal <= 0

                ){

                    console.error(

                        "[Financial EditRow] Nominal tidak valid."

                    );

                    return false;

                }


                /* =================================
                   ACTIVITY RULE
                ================================= */

                const activities =

                    getActivityByType(

                        values.jenis

                    );


                const validActivity =

                    activities.some(

                        option =>

                            String(

                                option.value

                            ) ===

                            String(

                                values.type

                            )

                    );


                if(

                    !validActivity

                ){

                    console.error(

                        "[Financial EditRow] " +

                        "Aktivitas tidak sesuai " +

                        "dengan jenis transaksi."

                    );

                    return false;

                }


                return true;

            },


        /* =========================================
           STAGING
        ========================================= */

        onAdd :

            async (

                record,

                values,

                changes

            ) => {

                console.log(

                    "===== FINANCIAL EDIT ROW STAGE ====="

                );


                console.log(

                    "Record:",

                    record

                );


                console.log(

                    "Values:",

                    values

                );


                console.log(

                    "Changes:",

                    changes

                );


                /*
                   Tidak ada Apps Script di sini.

                   Staging sepenuhnya ditangani
                   oleh Global EditRow.
                */

                return true;

            },


        /* =========================================
           REMOVE
        ========================================= */

        onRemove :

            item => {

                console.log(

                    "===== FINANCIAL EDIT ROW REMOVE =====",

                    item

                );


                return true;

            },


        /* =========================================
           PENDING LABEL
        ========================================= */

        getPendingLabel :

            item => {

                const record =

                    item?.record ??

                    {};


                const changes =

                    item?.changes ??

                    {};


                /*
                   Global EditRow dapat menyimpan
                   perubahan langsung sebagai:

                       changes.jenis
                       changes.type

                   atau melalui:

                       changes.values.jenis
                       changes.values.type

                   Keduanya didukung di sini.
                */

                const jenis =

                    formatFinancialValue(

                        changes?.values?.jenis ??

                        changes?.jenis ??

                        record?.jenis

                    );


                const activity =

                    formatActivity(

                        changes?.values?.type ??

                        changes?.type ??

                        record?.type

                    );


                const tanggal =

                    String(

                        record?.tanggal ??

                        ""

                    ).trim();


                const main =

                    jenis !== "-"

                        ?

                        jenis

                        :

                        "Financial";


                const detail =

                    activity !== "-"

                        ?

                        activity

                        :

                        "";


                if(

                    detail &&

                    tanggal

                ){

                    return `${

                        main

                    } · ${

                        detail

                    } · ${

                        tanggal

                    }`;

                }


                if(

                    detail

                ){

                    return `${

                        main

                    } · ${

                        detail

                    }`;

                }


                return main;

            },


        /* =========================================
           UI TEXT
        ========================================= */

        listTitle :

            "Daftar Transaksi",


        searchPlaceholder :

            "Cari ID, tanggal, aktivitas...",


        emptyText :

            "Tidak ada transaksi yang dapat diedit.",


        addText :

            "Tambahkan",


        confirmText :

            "Konfirmasi",


        removeText :

            "Hapus",


        pendingTitle :

            "Sudah Ditambahkan",


        addedText :

            "Sudah Ditambahkan",


        duplicateText :

            "Transaksi ini sudah ditambahkan.",


        confirmLoadingText :

            "Menyimpan...",


        fullscreen :

            true,


        allowBackdropClose :

            true,


        allowEscapeClose :

            true

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
   NORMALIZE VALUE
===================================================== */

function normalizeValue(

    value

){

    return String(

        value ??

        ""

    )

        .trim()

        .toLowerCase()

        .replace(

            /[\s-]+/g,

            "_"

        );

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
