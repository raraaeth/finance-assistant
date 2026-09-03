/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Kas
   File         : kas.js
   Version      : 3.1.1

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

   Flow :
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
   - Mapping ke struktur Sheet dilakukan
     oleh prepareTransaction().
   - Field frontend tetap dipertahankan
     agar Result UI dapat menampilkan
     transaksi dengan benar.
===================================================== */


/* =====================================================
   IMPORT DATA
===================================================== */

import {

    getInputData

} from "./data.js";


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


        config :

            Kas

    };

}
