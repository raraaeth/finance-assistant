/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Kas
   File         : kas.js
   Version      : 2.0.0

   Description :
   Input Flow Configuration for Kas

   Flow :
   Jenis
   → Member
   → Nominal
   → Kategori
   → Custom Category
   → Keterangan
===================================================== */


/* =====================================================
   MEMBER
   TEMPORARY HARDCODE

   Nanti sumbernya dipindahkan ke Setting.
===================================================== */

const MEMBERS = [

    "Budi",

    "Ani",

    "Rina",

    "Doni"

];


/* =====================================================
   CATEGORY
===================================================== */

const CATEGORY = {

    masuk : [

        {

            value : "nabung",

            label : "Nabung",

            system : true

        },

        {

            value : "iuran",

            label : "Iuran",

            system : true

        },

        {

            value : "bayar",

            label : "Bayar",

            system : true

        },

        {

            value : "bunga",

            label : "Bunga",

            system : true

        },

        {

            value : "custom",

            label : "Lain-lain",

            system : false,

            custom : true

        }

    ],


    keluar : [

        {

            value : "hutang",

            label : "Hutang",

            system : true

        },

        {

            value : "custom",

            label : "Lain-lain",

            system : false,

            custom : true

        }

    ]

};


/* =====================================================
   KAS
===================================================== */

export const Kas = {

    workspace :

        "kas",

    title :

        "Input Kas",

    subtitle :

        "Tambahkan transaksi Kas",


    /* =============================================
       MEMBERS
    ============================================= */

    members :

        MEMBERS,


    /* =============================================
       FLOW
    ============================================= */

    steps : [

        /* =========================================
           1. JENIS
        ========================================= */

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


        /* =========================================
           2. MEMBER
        ========================================= */

        {

            id :

                "member",

            label :

                "Nama Member",

            type :

                "select",

            options :

                MEMBERS.map(

                    name => ({

                        value :

                            name,

                        label :

                            name

                    })

                )

        },


        /* =========================================
           3. NOMINAL
        ========================================= */

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


        /* =========================================
           4. KATEGORI
        ========================================= */

        {

            id :

                "category",

            label :

                "Kategori",

            type :

                "select",

            options : values =>

                CATEGORY[

                    values.type

                ] ?? []

        },


        /* =========================================
           5. CUSTOM CATEGORY
        ========================================= */

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


        /* =========================================
           6. KETERANGAN
        ========================================= */

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
