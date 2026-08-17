/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Financial
   File         : financial.js
   Version      : 1.0.0

   Description :
   Dummy Financial Input

   Purpose :
   Menyediakan konfigurasi sementara agar
   Input.open("financial") tidak error.
===================================================== */


/* =====================================================
   FINANCIAL INPUT
===================================================== */

export const Financial = {


    /* =================================================
       HEADER
    ================================================= */

    title :

        "Input Financial",


    subtitle :

        "Tambahkan data Financial",


    /* =================================================
       FIELDS
    ================================================= */

    fields : [

        {

            name :

                "nama",


            label :

                "Nama",


            type :

                "text",


            placeholder :

                "Masukkan nama",


            required :

                true

        },


        {

            name :

                "nominal",


            label :

                "Nominal",


            type :

                "number",


            placeholder :

                "Masukkan nominal",


            required :

                true,


            min :

                0,


            step :

                1

        }

    ]

};
