/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Kas
   File         : kas.js
   Version      : 2.1.0

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

   Flow :
   Jenis
   → Member
   → Nominal
   → Kategori
   → Custom Category
   → Keterangan

   Principle :
   - Tidak menggunakan getter Kas khusus.
   - Member berasal dari getInputData().
   - Workspace dan sheet ditentukan oleh
     Global Workspace.
===================================================== */


/* =====================================================
   IMPORT DATA
===================================================== */

import {

    getInputData

} from "./data.js";


/* =====================================================
   GET MEMBER OPTIONS
=====================================================

   Data berasal dari sheet kedua
   workspace Kas.

   Contoh :

       kas
         ↓
       kas_member
         ↓
       getInputData()

   Struktur member yang diharapkan :

       {
           nama : "Nama Member"
       }

===================================================== */

function getMemberOptions(){

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

            item =>

                String(

                    item.nama ??

                    ""

                )

                    .trim()

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
   CATEGORY
===================================================== */

const CATEGORY = {

    masuk : [

        {

            value :

                "nabung",

            label :

                "Nabung",

            system :

                true

        },

        {

            value :

                "iuran",

            label :

                "Iuran",

            system :

                true

        },

        {

            value :

                "bayar",

            label :

                "Bayar",

            system :

                true

        },

        {

            value :

                "bunga",

            label :

                "Bunga",

            system :

                true

        },

        {

            value :

                "custom",

            label :

                "Lain-lain",

            system :

                false,

            custom :

                true

        }

    ],


    keluar : [

        {

            value :

                "hutang",

            label :

                "Hutang",

            system :

                true

        },

        {

            value :

                "custom",

            label :

                "Lain-lain",

            system :

                false,

            custom :

                true

        }

    ]

};


/* =====================================================
   KAS
===================================================== */

export const Kas = {

    /* =================================================
       WORKSPACE
    ================================================= */

    workspace :

        "kas",


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
           2. MEMBER
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

                    getMemberOptions()

        },


        /* =============================================
           3. NOMINAL
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
           4. KATEGORI
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

                    CATEGORY[

                        values.type

                    ]

                    ??

                    []

        },


        /* =============================================
           5. CUSTOM CATEGORY
        ============================================= */

        {

            id :

                "customCategory",

            label :

                "Kategori Lainnya",

            type :

                "text",

            placeholder :

                "Contoh: Project, Donasi, Sumbangan",

            showWhen :

                values =>

                    values.category ===

                    "custom"

        },


        /* =============================================
           6. KETERANGAN
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

    ]

};


/* =====================================================
   GET CONFIG
===================================================== */

export function getKasInputConfig(){

    return Kas;

}


/* =====================================================
   GET MEMBERS
===================================================== */

export function getKasMembers(){

    return getMemberOptions();

}


/* =====================================================
   GET CATEGORIES
===================================================== */

export function getKasCategories(

    type

){

    return CATEGORY[

        type

    ]

    ??

    [];

}


/* =====================================================
   DEBUG
===================================================== */

export function debugKasInput(){

    const data =

        getInputData();


    const members =

        getMemberOptions();


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

        "Member Options:",

        members

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

            Array.isArray(

                data

            )

            ?

            [

                ...data

            ]

            :

            [],


        members :

            [

                ...members

            ],


        config :

            Kas

    };

}
