/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Kas
   File         : kas.js
   Version      : 1.0.0

   Description :
   Input Configuration for Kas
===================================================== */


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
       FIELDS
    ============================================= */

    fields : [

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

        }

    ]

};
