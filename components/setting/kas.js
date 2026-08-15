/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Kas
   File         : kas.js
   Version      : 2.0.0

   Description :
   Kas Setting Definition

   Sheet :
   kas_member

   Fields :
   - nama
===================================================== */


/* =====================================================
   KAS SETTING
===================================================== */

export const KasSetting = {


    /* =================================================
       HEADER
    ================================================= */

    title :

        "Pengaturan Kas",


    subtitle :

        "Atur konfigurasi Kas",


    /* =================================================
       SECTIONS
    ================================================= */

    sections : [

        /* =============================================
           MEMBER
        ============================================= */

        {

            id :

                "member",


            title :

                "👥 Nama Member",


            description :

                "Daftar nama member yang digunakan dalam Kas.",


            /* =========================================
               ADD BUTTON
            ========================================= */

            addLabel :

                "＋ Tambah",


            /* =========================================
               FORM BUTTON
            ========================================= */

            formAddLabel :

                "＋ Tambahkan",


            /* =========================================
               DELETE BUTTON
            ========================================= */

            deleteLabel :

                "Hapus",


            /* =========================================
               FIELDS
            ========================================= */

            fields : [

                {

                    name :

                        "nama",


                    label :

                        "Nama Member",


                    type :

                        "text",


                    placeholder :

                        "Masukkan nama member",


                    required :

                        true

                }

            ]

        }

    ]

};
