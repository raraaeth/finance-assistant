/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Kas
   File         : kas.js
   Version      : 3.0.0

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

   Principle :
   - Rule dari Setting Kas menjadi sumber
     ketersediaan kategori.
   - Tidak menggunakan getter Kas khusus.
   - Member berasal dari getInputData().
   - Workspace dan sheet ditentukan oleh
     Global Workspace.
   - Lain-lain tidak mempunyai Member.
   - Lain-lain hanya mempengaruhi saldo Kas.
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
   RULE SOURCE
=====================================================

   Struktur kas_member :

       nama        tabungan      kas       hutang
                   nabung        iuran     hutang
                   tarik         tarik     bayar
                   lain_lain     lain_lain

   Kolom rule dibaca sebagai daftar kode yang
   tersedia.

===================================================== */


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

   Contoh :

       tabungan :
       [
           "nabung",
           "tarik",
           "lain_lain"
       ]

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


            /*
             * Satu cell dapat berisi lebih dari
             * satu nilai, misalnya :
             *
             * pagi,siang,malam
             *
             * Walaupun Rule Kas saat ini normalnya
             * satu nilai per row, kita tetap
             * normalisasi jika terdapat pemisah.
             */

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

    const rules =

        getRuleValues(

            column

        );


    return rules.includes(

        rule

    );

}


/* =====================================================
   CATEGORY AVAILABILITY
=====================================================

   Mapping final :

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

        /*
         * Tabungan
         */

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


        /*
         * Kas
         */

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


        /*
         * Hutang
         */

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

        /*
         * Tabungan / Kas
         *
         * Tarik cukup tersedia jika ada pada
         * salah satu rule source.
         */

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


        /*
         * Lain-lain
         *
         * Sama seperti tarik, rule dianggap
         * tersedia jika terdapat pada Tabungan
         * atau Kas.
         */

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


        /*
         * Hutang
         */

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

   Baris rule tidak memiliki nama sehingga
   otomatis diabaikan.

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

   Hook ini dipanggil oleh Global Transaction
   sebelum transaksi dikirim.

   Tujuan :

   - memastikan Lain-lain tidak mempunyai
     Member.
   - menjaga data tetap konsisten.

   Business processing tetap dilakukan
   oleh process.js.

===================================================== */

export function prepareTransaction(

    values,

    context

){

    const result = {

        ...values

    };


    /*
     * Lain-lain adalah pengeluaran level Kas.
     *
     * Tidak mempunyai Member.
     */

    if(

        result.type ===

            "keluar"

        &&

        result.category ===

            "lain_lain"

    ){

        delete result.member;

    }


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
