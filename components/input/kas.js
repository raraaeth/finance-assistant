/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Kas
   File         : kas.js
   Version      : 4.0.0

   Description :
   Input Flow Configuration for Kas

   Data Source :
   Global Input Data Engine
        ↓
   Global Workspace
        ↓
   kas.sheets
        ↓
   kas_member
        ↓
   getInputData()

   Rule Source :
   kas_member

   Rule Columns :
   - tabungan
   - kas
   - hutang

   Member Column :
   - nama

   Normal Flow :
   Jenis
   → Kategori
   → Member
   → Nominal
   → Keterangan

   Special Flow :
   Keluar → Lain-lain
   → Nominal
   → Keterangan

   Sheet Mapping :
   type      → jenis
   category  → kategori
   member    → nama
   amount    → nominal
   note      → keterangan

   Sheet Kas :
   - id
   - tanggal
   - jenis
   - kategori
   - nama
   - nominal
   - keterangan

   Edit Input :
   - Global EditRow
   - Target : ID + tanggal
   - ID locked
   - tanggal locked
   - Field edit mengikuti struktur Sheet Kas
   - Keluar + Lain-lain tidak membutuhkan nama

   Principle :
   - Rule dari Setting Kas menjadi sumber
     ketersediaan kategori.
   - Tidak menggunakan getter Kas khusus.
   - Member berasal dari getInputData().
   - Workspace dan sheet ditentukan oleh
     Global Workspace.
   - Lain-lain tidak mempunyai Member.
   - Lain-lain hanya memerlukan nominal
     dan keterangan pada Input.
   - Normal Input tidak diubah.
   - Edit Input menggunakan Global EditRow.
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

    "KAS";


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

        .toLowerCase();

}


/* =====================================================
   FORMAT KAS VALUE
===================================================== */

function formatKasValue(

    value

){

    if(

        value ===

            undefined

        ||

        value ===

            null

        ||

        value ===

            ""

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
   FORMAT NOMINAL
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
   GET INPUT DATA
===================================================== */

function getKasData(){

    const data =

        getInputData();


    if(

        !Array.isArray(

            data

        )

    ){

        return [];

    }


    return data.filter(

        item =>

            item &&

            typeof item ===

                "object"

    );

}


/* =====================================================
   GET EDITABLE RECORDS
===================================================== */

function getKasRecords(){

    const records =

        getInputRaw();


    if(

        !Array.isArray(

            records

        )

    ){

        return [];

    }


    return records.filter(

        record =>

            record &&

            typeof record ===

                "object"

    );

}


/* =====================================================
   GET RULE VALUES
=====================================================

   Membaca seluruh isi kolom rule.

   Struktur :

       nama        tabungan      kas       hutang
                   nabung        iuran     hutang
                   tarik         tarik     bayar
                   lain_lain     lain_lain

===================================================== */

function getRuleValues(

    column

){

    const data =

        getKasData();


    const result = [];


    data.forEach(

        item => {

            const value =

                normalizeValue(

                    item[column]

                );


            if(

                !value

            ){

                return;

            }


            value

                .split(",")

                .map(

                    item =>

                        item.trim()

                )

                .filter(

                    Boolean

                )

                .forEach(

                    rule => {

                        if(

                            !result.includes(

                                rule

                            )

                        ){

                            result.push(

                                rule

                            );

                        }

                    }

                );

        }

    );


    return result;

}


/* =====================================================
   CHECK RULE
===================================================== */

function hasRule(

    column,

    rule

){

    return getRuleValues(

        column

    ).includes(

        rule

    );

}


/* =====================================================
   CATEGORY AVAILABILITY
=====================================================

   Mapping :

   MASUK
   - nabung  ← tabungan
   - iuran   ← kas
   - bayar   ← hutang

   KELUAR
   - tarik      ← tabungan / kas
   - lain_lain  ← tabungan / kas
   - hutang     ← hutang

===================================================== */

function getCategoryDefinitions(

    type

){

    const categories = [];


    /* =================================================
       MASUK
    ================================================= */

    if(

        type ===

        "masuk"

    ){

        /* ---------------------------------------------
           NABUNG
        --------------------------------------------- */

        if(

            hasRule(

                "tabungan",

                "nabung"

            )

        ){

            categories.push({

                value :

                    "nabung",

                label :

                    "Nabung",

                source :

                    "tabungan",

                system :

                    true

            });

        }


        /* ---------------------------------------------
           IURAN
        --------------------------------------------- */

        if(

            hasRule(

                "kas",

                "iuran"

            )

        ){

            categories.push({

                value :

                    "iuran",

                label :

                    "Iuran",

                source :

                    "kas",

                system :

                    true

            });

        }


        /* ---------------------------------------------
           BAYAR
        --------------------------------------------- */

        if(

            hasRule(

                "hutang",

                "bayar"

            )

        ){

            categories.push({

                value :

                    "bayar",

                label :

                    "Bayar",

                source :

                    "hutang",

                system :

                    true

            });

        }

    }


    /* =================================================
       KELUAR
    ================================================= */

    if(

        type ===

        "keluar"

    ){

        /* ---------------------------------------------
           TARIK
        --------------------------------------------- */

        if(

            hasRule(

                "tabungan",

                "tarik"

            )

            ||

            hasRule(

                "kas",

                "tarik"

            )

        ){

            categories.push({

                value :

                    "tarik",

                label :

                    "Tarik",

                source :

                    "tabungan/kas",

                system :

                    true

            });

        }


        /* ---------------------------------------------
           LAIN-LAIN
        --------------------------------------------- */

        if(

            hasRule(

                "tabungan",

                "lain_lain"

            )

            ||

            hasRule(

                "kas",

                "lain_lain"

            )

        ){

            categories.push({

                value :

                    "lain_lain",

                label :

                    "Lain-lain",

                source :

                    "tabungan/kas",

                system :

                    true,

                noMember :

                    true

            });

        }


        /* ---------------------------------------------
           HUTANG
        --------------------------------------------- */

        if(

            hasRule(

                "hutang",

                "hutang"

            )

        ){

            categories.push({

                value :

                    "hutang",

                label :

                    "Hutang",

                source :

                    "hutang",

                system :

                    true

            });

        }

    }


    return categories;

}


/* =====================================================
   GET MEMBER OPTIONS
=====================================================

   Member berasal dari :

       kas_member.nama

   Baris rule tidak memiliki nama,
   sehingga otomatis diabaikan.

===================================================== */

function getMemberOptions(){

    const data =

        getKasData();


    return data

        .map(

            item =>

                String(

                    item.nama ??

                    ""

                ).trim()

        )

        .filter(

            Boolean

        )

        .filter(

            (

                value,

                index,

                array

            ) =>

                array.indexOf(

                    value

                ) === index

        )

        .map(

            value => ({

                value :

                    value,

                label :

                    value

            })

        );

}


/* =====================================================
   CATEGORY GETTER
===================================================== */

export function getKasCategories(

    type

){

    return getCategoryDefinitions(

        type

    );

}


/* =====================================================
   MEMBER GETTER
===================================================== */

export function getKasMembers(){

    return getMemberOptions();

}


/* =====================================================
   RULE GETTER
===================================================== */

export function getKasRules(){

    return {

        tabungan :

            getRuleValues(

                "tabungan"

            ),

        kas :

            getRuleValues(

                "kas"

            ),

        hutang :

            getRuleValues(

                "hutang"

            )

    };

}


/* =====================================================
   PREPARE TRANSACTION
=====================================================

   GLOBAL INPUT menggunakan nama field frontend :

       type
       category
       member
       amount
       note

   Sheet Kas menggunakan header :

       jenis
       kategori
       nama
       nominal
       keterangan

   PENTING :

   Field frontend tetap dipertahankan karena
   Result UI membaca field tersebut.

   Kemudian field Sheet ditambahkan sebagai
   mapping untuk proses penyimpanan.

   Mapping :

       type      → jenis
       category  → kategori
       member    → nama
       amount    → nominal
       note      → keterangan

===================================================== */

export function prepareTransaction(

    values,

    context

){

    /*
     * PENTING :
     *
     * Jangan membuat object kosong.
     *
     * Field asli harus dipertahankan agar
     * Result UI tetap dapat membaca :
     *
     * type
     * category
     * member
     * amount
     * note
     */

    const result = {

        ...values

    };


    /* =================================================
       JENIS → JENIS
    ================================================= */

    result.jenis =

        values.type ??

        "";


    /* =================================================
       KATEGORI → KATEGORI
    ================================================= */

    result.kategori =

        values.category ??

        "";


    /* =================================================
       MEMBER → NAMA
    =================================================

       Keluar → Lain-lain tidak mempunyai
       member.

    ================================================= */

    if(

        values.type ===

            "keluar"

        &&

        values.category ===

            "lain_lain"

    ){

        result.nama = "";

    }

    else{

        result.nama =

            values.member ??

            "";

    }


    /* =================================================
       NOMINAL → NOMINAL
    ================================================= */

    result.nominal =

        values.amount ??

        "";


    /* =================================================
       KETERANGAN → KETERANGAN
    ================================================= */

    result.keterangan =

        values.note ??

        "";


    /* =================================================
       DEBUG
    ================================================= */

    console.log(

        "=========================================="

    );


    console.log(

        "===== KAS PREPARE TRANSACTION ====="

    );


    console.log(

        "Input Values:",

        values

    );


    console.log(

        "Prepared Values:",

        result

    );


    console.log(

        "Context:",

        context

    );


    console.log(

        "=========================================="

    );


    return result;

}


/* =====================================================
   KAS CONFIG
===================================================== */

export const Kas = {

    /* =================================================
       WORKSPACE
    ================================================= */

    workspace :

        "kas",


    /* =================================================
       PREFIX
    ================================================= */

    prefix :

        PREFIX,


    /* =================================================
       TITLE
    ================================================= */

    title :

        "Input Kas",


    /* =================================================
       SUBTITLE
    ================================================= */

    subtitle :

        "Tambahkan transaksi Kas",


    /* =================================================
       FLOW
    ================================================= */

    steps : [

        /* =============================================
           1. JENIS
        ============================================= */

        {

            id :

                "type",

            label :

                "Jenis Transaksi",

            type :

                "select",

            options : [

                {

                    value :

                        "masuk",

                    label :

                        "💰 Masuk"

                },

                {

                    value :

                        "keluar",

                    label :

                        "💸 Keluar"

                }

            ]

        },


        /* =============================================
           2. KATEGORI
        ============================================= */

        {

            id :

                "category",

            label :

                "Kategori",

            type :

                "select",

            options :

                values =>

                    getCategoryDefinitions(

                        values.type

                    )

        },


        /* =============================================
           3. MEMBER
        ============================================= */

        {

            id :

                "member",

            label :

                "Nama Member",

            type :

                "select",

            options :

                () =>

                    getMemberOptions(),

            showWhen :

                values =>

                    !(

                        values.type ===

                            "keluar"

                        &&

                        values.category ===

                            "lain_lain"

                    )

        },


        /* =============================================
           4. NOMINAL
        ============================================= */

        {

            id :

                "amount",

            label :

                "Nominal",

            type :

                "number",

            placeholder :

                "Masukkan nominal"

        },


        /* =============================================
           5. KETERANGAN
        ============================================= */

        {

            id :

                "note",

            label :

                "Keterangan",

            type :

                "text",

            placeholder :

                "Keterangan transaksi"

        }

    ],


    /* =================================================
       TRANSACTION HOOK
    ================================================= */

    prepareTransaction

};


/* =====================================================
   EDIT INPUT
=====================================================

   Global EditRow Adapter.

   Sheet Kas :

       id
       tanggal
       jenis
       kategori
       nama
       nominal
       keterangan

   Target :

       ID + tanggal

   ID + tanggal locked.

===================================================== */


/* =====================================================
   EDITABLE FIELDS
===================================================== */

const EDITABLE_FIELDS = [

    "jenis",

    "kategori",

    "nama",

    "nominal",

    "keterangan"

];


/* =====================================================
   LOCKED FIELDS
===================================================== */

const LOCKED_FIELDS = [

    "id",

    "tanggal"

];


/* =====================================================
   CHECK SPECIAL MEMBER CONDITION
=====================================================

   Keluar + Lain-lain tidak mempunyai nama.

===================================================== */

function isKasNoMember(

    values

){

    const jenis =

        normalizeValue(

            values?.jenis

        );


    const kategori =

        normalizeValue(

            values?.kategori

        );


    return (

        jenis ===

            "keluar"

        &&

        kategori ===

            "lain_lain"

    );

}


/* =====================================================
   EDIT VALUE PREPARATION
=====================================================

   Jika :

       jenis    = keluar
       kategori = lain_lain

   maka nama harus kosong.

   Ini penting ketika record lama memiliki
   nama lalu kategori diubah menjadi lain_lain.

===================================================== */

function prepareEditValues(

    values

){

    const prepared = {

        ...(values || {})

    };


    if(

        isKasNoMember(

            prepared

        )

    ){

        prepared.nama = "";

    }


    return prepared;

}


/* =====================================================
   EDIT FIELD OPTIONS
===================================================== */

function getEditFieldOptions(

    field,

    values,

    record

){

    const normalized =

        normalizeValue(

            field

        );


    /* =================================================
       JENIS
    ================================================= */

    if(

        normalized ===

        "jenis"

    ){

        return [

            {

                value :

                    "masuk",

                label :

                    "💰 Masuk"

            },

            {

                value :

                    "keluar",

                label :

                    "💸 Keluar"

            }

        ];

    }


    /* =================================================
       KATEGORI
    ================================================= */

    if(

        normalized ===

        "kategori"

    ){

        const jenis =

            normalizeValue(

                values?.jenis

                ??

                record?.jenis

            );


        return getCategoryDefinitions(

            jenis

        );

    }


    /* =================================================
       NAMA
    ================================================= */

    if(

        normalized ===

        "nama"

    ){

        return getMemberOptions();

    }


    return [];

}


/* =====================================================
   EDIT FIELD TYPE
===================================================== */

function getKasEditFieldType(

    field

){

    const normalized =

        normalizeValue(

            field

        );


    switch(

        normalized

    ){

        case "jenis":

        case "kategori":

        case "nama":

            return "select";


        case "nominal":

            return "number";


        case "keterangan":

            return "text";


        default:

            return "text";

    }

}


/* =====================================================
   EDIT FIELD LABEL
===================================================== */

function getKasEditFieldLabel(

    field

){

    const normalized =

        normalizeValue(

            field

        );


    switch(

        normalized

    ){

        case "id":

            return "ID";


        case "tanggal":

            return "Tanggal";


        case "date":

            return "Tanggal";


        case "jenis":

            return "Jenis Transaksi";


        case "kategori":

            return "Kategori";


        case "nama":

            return "Nama Member";


        case "nominal":

            return "Nominal";


        case "keterangan":

            return "Keterangan";


        default:

            return formatKasValue(

                field

            );

    }

}


/* =====================================================
   EDIT FIELD CONFIG
===================================================== */

function getKasEditFieldConfig(

    field,

    record,

    values

){

    const normalized =

        normalizeValue(

            field

        );


    /* =================================================
       JENIS
    ================================================= */

    if(

        normalized ===

        "jenis"

    ){

        return {

            type :

                "select",

            options :

                getEditFieldOptions(

                    "jenis",

                    values,

                    record

                ),

            required :

                true,

            placeholder :

                "Pilih jenis transaksi"

        };

    }


    /* =================================================
       KATEGORI
    ================================================= */

    if(

        normalized ===

        "kategori"

    ){

        return {

            type :

                "select",

            options :

                values =>

                    getEditFieldOptions(

                        "kategori",

                        values,

                        record

                    ),

            required :

                true,

            placeholder :

                "Pilih kategori"

        };

    }


    /* =================================================
       NAMA
    ================================================= */

    if(

        normalized ===

        "nama"

    ){

        return {

            type :

                "select",

            options :

                () =>

                    getMemberOptions(),

            required :

                !isKasNoMember(

                    values ||

                    record

                ),

            placeholder :

                "Pilih nama member",

            visibleIf :

                currentValues =>

                    !isKasNoMember(

                        currentValues

                    )

        };

    }


    /* =================================================
       NOMINAL
    ================================================= */

    if(

        normalized ===

        "nominal"

    ){

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

    }


    /* =================================================
       KETERANGAN
    ================================================= */

    if(

        normalized ===

        "keterangan"

    ){

        return {

            type :

                "text",

            required :

                false,

            placeholder :

                "Keterangan transaksi"

        };

    }


    return {

        type :

            getKasEditFieldType(

                normalized

            )

    };

}


/* =====================================================
   EDIT RECORD LABEL
===================================================== */

function getKasRecordLabel(

    record

){

    const jenis =

        formatKasValue(

            record?.jenis

        );


    const kategori =

        formatKasValue(

            record?.kategori

        );


    const nama =

        String(

            record?.nama ??

            ""

        ).trim();


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

        "Kas";


    const parts = [

        main

    ];


    if(

        kategori !== "-"

    ){

        parts.push(

            kategori

        );

    }


    if(

        nama

    ){

        parts.push(

            nama

        );

    }


    if(

        parts.length >

        0

    ){

        return parts.join(

            " · "

        );

    }


    return id ||

        "Transaksi Kas";

}


/* =====================================================
   EDIT RECORD META
===================================================== */

function getKasRecordMeta(

    record

){

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

            undefined

        &&

        nominal !==

            null

        &&

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

}


/* =====================================================
   EDIT SEARCH TEXT
===================================================== */

function getKasSearchText(

    record

){

    return [

        record?.id,

        record?.tanggal,

        record?.jenis,

        record?.kategori,

        record?.nama,

        record?.nominal,

        record?.keterangan

    ]

        .filter(

            value =>

                value !==

                    undefined

                &&

                value !==

                    null

        )

        .join(

            " "

        );

}


/* =====================================================
   EDIT DETAIL
===================================================== */

function renderKasDetail(

    record

){

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

                    formatKasValue(

                        record?.jenis

                    )

            },

            {

                label :

                    "Kategori",

                value :

                    formatKasValue(

                        record?.kategori

                    )

            },

            {

                label :

                    "Nama Member",

                value :

                    String(

                        record?.nama ??

                        ""

                    ).trim() ||

                    "-"

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

}


/* =====================================================
   EDIT VALIDATION
===================================================== */

function validateKasEdit(

    record,

    values,

    context

){

    if(

        !record

    ){

        return false;

    }


    /* =================================================
       ID
    ================================================= */

    const id =

        String(

            record?.id ??

            ""

        ).trim();


    if(

        !id

    ){

        console.error(

            "[Kas EditRow] ID kosong."

        );


        return false;

    }


    /* =================================================
       TANGGAL
    ================================================= */

    const tanggal =

        String(

            record?.tanggal ??

            ""

        ).trim();


    if(

        !tanggal

    ){

        console.warn(

            "[Kas EditRow] tanggal kosong."

        );


        return false;

    }


    /* =================================================
       JENIS
    ================================================= */

    const jenis =

        normalizeValue(

            values?.jenis

        );


    if(

        jenis !==

            "masuk"

        &&

        jenis !==

            "keluar"

    ){

        console.warn(

            "[Kas EditRow] Jenis transaksi tidak valid:",

            values?.jenis

        );


        return false;

    }


    /* =================================================
       KATEGORI
    ================================================= */

    const kategori =

        normalizeValue(

            values?.kategori

        );


    if(

        !kategori

    ){

        console.warn(

            "[Kas EditRow] Kategori kosong."

        );


        return false;

    }


    const availableCategories =

        getCategoryDefinitions(

            jenis

        );


    const categoryExists =

        availableCategories.some(

            item =>

                normalizeValue(

                    item?.value

                ) ===

                kategori

        );


    if(

        !categoryExists

    ){

        console.warn(

            "[Kas EditRow] Kategori tidak tersedia untuk jenis:",

            jenis,

            kategori

        );


        return false;

    }


    /* =================================================
       MEMBER
    ================================================= */

    if(

        !isKasNoMember(

            values

        )

    ){

        const nama =

            String(

                values?.nama ??

                ""

            ).trim();


        if(

            !nama

        ){

            console.warn(

                "[Kas EditRow] Nama member wajib diisi."

            );


            return false;

        }

    }


    /* =================================================
       NOMINAL
    ================================================= */

    const nominal =

        Number(

            values?.nominal

        );


    if(

        !Number.isFinite(

            nominal

        )

        ||

        nominal < 0

    ){

        console.warn(

            "[Kas EditRow] Nominal tidak valid:",

            values?.nominal

        );


        return false;

    }


    return true;

}


/* =====================================================
   EDIT INPUT ROW
===================================================== */

async function openEditRow(){

    console.log(

        "===== KAS EDIT INPUT ROW OPEN ====="

    );


    /* =================================================
       OPEN CHECK
    ================================================= */

    if(

        !EditRow ||

        typeof EditRow.open !==

            "function"

    ){

        console.error(

            "[Kas] EditRow.open() tidak tersedia."

        );


        return null;

    }


    /* =================================================
       CLEAR CURRENT STATE
    ================================================= */

    if(

        typeof EditRow.reset ===

            "function"

    ){

        EditRow.reset();

    }


    /* =================================================
       RECORD SOURCE
    ================================================= */

    const records =

        getKasRecords();


    console.log(

        "Kas Edit Row records:",

        records

    );


    /* =================================================
       OPEN GLOBAL EDIT ROW
    ================================================= */

    return EditRow.open({

        /* =============================================
           WORKSPACE
        ============================================= */

        workspace :

            "kas",


        /* =============================================
           MODE
        ============================================= */

        mode :

            "row",


        /* =============================================
           HEADER
        ============================================= */

        title :

            "Edit Input Row",

        subtitle :

            "Pilih transaksi Kas dari daftar untuk mengubah data.",


        /* =============================================
           RECORD SOURCE
        ============================================= */

        getRecords :

            () => {

                const currentRecords =

                    typeof EditRow.getEditableRecords ===

                        "function"

                        ?

                    EditRow.getEditableRecords()

                        :

                    getKasRecords();


                return Array.isArray(

                    currentRecords

                )

                    ?

                    currentRecords

                    :

                    [];

            },


        /* =============================================
           TARGET FIELD
        ============================================= */

        /*
         * Sheet Kas menggunakan :
         *
         *     id
         *     tanggal
         *
         * Bukan Date.
         */

        getIdField :

            record => {

                if(

                    record &&

                    Object.prototype.hasOwnProperty.call(

                        record,

                        "id"

                    )

                ){

                    return "id";

                }


                if(

                    record &&

                    Object.prototype.hasOwnProperty.call(

                        record,

                        "ID"

                    )

                ){

                    return "ID";

                }


                return "id";

            },


        getDateField :

            record => {

                return "tanggal";

            },


        /* =============================================
           EDITABLE FIELDS
        ============================================= */

        editableFields :

            [

                ...EDITABLE_FIELDS

            ],


        /* =============================================
           LOCKED FIELDS
        ============================================= */

        lockedFields :

            [

                ...LOCKED_FIELDS

            ],


        /* =============================================
           STRICT FIELD LIST
        ============================================= */

        strictFieldList :

            true,


        /* =============================================
           FIELD ORDER
        ============================================= */

        getFieldOrder :

            record => {

                return [

                    "id",

                    "tanggal",

                    "jenis",

                    "kategori",

                    "nama",

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


        /* =============================================
           FIELD MAP
        ============================================= */

        fieldMap : {

            jenis :

                "jenis",

            kategori :

                "kategori",

            nama :

                "nama",

            nominal :

                "nominal",

            keterangan :

                "keterangan"

        },


        /* =============================================
           FIELD TYPE
        ============================================= */

        getFieldType :

            (

                field,

                value,

                record

            ) => {

                return getKasEditFieldType(

                    field

                );

            },


        /* =============================================
           FIELD LABEL
        ============================================= */

        getFieldLabel :

            (

                field,

                record

            ) => {

                return getKasEditFieldLabel(

                    field

                );

            },


        /* =============================================
           FIELD CONFIG
        ============================================= */

        getFieldConfig :

            (

                field,

                record,

                values

            ) => {

                return getKasEditFieldConfig(

                    field,

                    record,

                    values

                );

            },


        /* =============================================
           RECORD LABEL
        ============================================= */

        getRecordLabel :

            record => {

                return getKasRecordLabel(

                    record

                );

            },


        /* =============================================
           RECORD META
        ============================================= */

        getRecordMeta :

            record => {

                return getKasRecordMeta(

                    record

                );

            },


        /* =============================================
           SEARCH
        ============================================= */

        getSearchText :

            record => {

                return getKasSearchText(

                    record

                );

            },


        /* =============================================
           DETAIL
        ============================================= */

        renderDetail :

            record => {

                return renderKasDetail(

                    record

                );

            },


        /* =============================================
           FIELD LOCK CHECK
        ============================================= */

        isFieldLocked :

            (

                field,

                record

            ) => {

                const normalized =

                    normalizeValue(

                        field

                    );


                if(

                    normalized ===

                        "id"

                    ||

                    normalized ===

                        "tanggal"

                    ||

                    normalized ===

                        "date"

                ){

                    return true;

                }


                return !EDITABLE_FIELDS.includes(

                    normalized

                );

            },


        /* =============================================
           FIELD EDIT CHECK
        ============================================= */

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


        /* =============================================
           PREPARE VALUES
        ============================================= */

        prepareValues :

            values => {

                return prepareEditValues(

                    values

                );

            },


        /* =============================================
           VALIDATE
        ============================================= */

        validate :

            (

                record,

                values,

                context

            ) => {

                return validateKasEdit(

                    record,

                    values,

                    context

                );

            },


        /* =============================================
           UI TEXT
        ============================================= */

        listTitle :

            "Daftar Transaksi Kas",

        searchPlaceholder :

            "Cari ID, tanggal, kategori, nama...",

        emptyText :

            "Tidak ada transaksi Kas yang dapat diedit.",


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


        /* =============================================
           UI MODE
        ============================================= */

        fullscreen :

            true,


        allowBackdropClose :

            true,


        allowEscapeClose :

            true

    });

}


/* =====================================================
   OPEN EDIT
===================================================== */

Kas.openEdit =

    async function(

        context = null

    ){

        const mode =

            typeof context ===

                "object"

            &&

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
         * Kas hanya mempunyai
         * Edit Input Row.
         *
         * Jika mode kosong, tetap buka
         * Edit Row agar kompatibel dengan
         * Global Input Edit Controller.
         */

        if(

            normalizedMode &&

            normalizedMode !==

                "row"

        ){

            console.warn(

                "[Kas] Mode Edit Input tidak dikenal:",

                mode

            );

        }


        return openEditRow();

    };


/* =====================================================
   GET CONFIG
===================================================== */

export function getKasInputConfig(){

    return Kas;

}


/* =====================================================
   CHECK CATEGORY
===================================================== */

export function hasKasRule(

    column,

    rule

){

    return hasRule(

        column,

        rule

    );

}


/* =====================================================
   DEBUG
===================================================== */

export function debugKasInput(){

    const data =

        getKasData();


    const rules =

        getKasRules();


    const members =

        getMemberOptions();


    const masuk =

        getCategoryDefinitions(

            "masuk"

        );


    const keluar =

        getCategoryDefinitions(

            "keluar"

        );


    const editRecords =

        getKasRecords();


    console.log(

        "=========================================="

    );


    console.log(

        "===== KAS INPUT DEBUG ====="

    );


    console.log(

        "=========================================="

    );


    console.log(

        "Raw Input Data:",

        data

    );


    console.log(

        "Rules:",

        rules

    );


    console.log(

        "Member Options:",

        members

    );


    console.log(

        "Masuk Categories:",

        masuk

    );


    console.log(

        "Keluar Categories:",

        keluar

    );


    console.log(

        "Edit Records:",

        editRecords

    );


    console.log(

        "Kas Config:",

        Kas

    );


    console.log(

        "=========================================="

    );


    return {

        data :

            [

                ...data

            ],


        rules : {

            tabungan :

                [

                    ...rules.tabungan

                ],

            kas :

                [

                    ...rules.kas

                ],

            hutang :

                [

                    ...rules.hutang

                ]

        },


        members :

            [

                ...members

            ],


        masuk :

            [

                ...masuk

            ],


        keluar :

            [

                ...keluar

            ],


        editRecords :

            [

                ...editRecords

            ],


        config :

            Kas

    };

}
