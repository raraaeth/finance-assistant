/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Financial
   File         : financial.js
   Version      : 1.0.0

   Description :
   Dummy Financial Setting

   Purpose :
   Menyediakan konfigurasi sementara agar
   Setting.open("financial") tidak error.
===================================================== */


/* =====================================================
   FINANCIAL SETTING
===================================================== */

export const FinancialSetting = {


    /* =================================================
       HEADER
    ================================================= */

    title :

        "Pengaturan Financial",


    subtitle :

        "Atur konfigurasi Financial",


    /* =================================================
       SECTIONS
    ================================================= */

    sections : [

        {

            id :

                "financial_general",


            title :

                "⚙️ Pengaturan Financial",


            description :

                "Konfigurasi Financial akan tersedia pada tahap berikutnya.",


            /* =========================================
               BUTTON
            ========================================= */

            addLabel :

                "＋ Tambah Konfigurasi",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            autoCloseForm :

                true,


            /* =========================================
               DUPLICATE
            ========================================= */

            uniqueFields : [

                "nama"

            ],


            /* =========================================
               FIELDS
            ========================================= */

            fields : [

                {

                    name :

                        "nama",


                    label :

                        "Nama Konfigurasi",


                    type :

                        "text",


                    placeholder :

                        "Contoh: Financial",


                    required :

                        true,


                    note :

                        "Konfigurasi Financial sementara untuk pengujian."

                }

            ],


            /* =========================================
               NORMALIZE
            ========================================= */

            normalize :

                function(

                    data

                ){

                    return {

                        type :

                            "financial",


                        nama :

                            data.nama ?? ""

                    };

                }

        }

    ]

};
