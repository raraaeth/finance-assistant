/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Saving
   File         : saving.js
   Version      : 1.1.0

   Description :
   Saving Setting Definition

   Sheet :
   saving_bank

   Fields :
   - nama_bank
===================================================== */


/* =====================================================
   SAVING SETTING
===================================================== */

export const SavingSetting = {


    /* =================================================
       HEADER
    ================================================= */

    title :

        "Pengaturan Saving",


    subtitle :

        "Atur konfigurasi Saving",


    /* =================================================
       SECTIONS
    ================================================= */

    sections : [

        /* =============================================
           BANK
        ============================================= */

        {

            id :

                "bank",


            title :

                "🏦 Nama Bank",


            description :

                "Daftar rekening atau tempat penyimpanan dana Saving.",


            /* =========================================
               BUTTON
            ========================================= */

            addLabel :

                "＋ Tambah",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            /* =========================================
               FIELDS
            ========================================= */

            fields : [

                /* -------------------------------------
                   NAMA BANK
                ------------------------------------- */

                {

                    name :

                        "nama_bank",


                    label :

                        "Nama Bank",


                    type :

                        "select",


                    required :

                        true,


                    options : [

                        {

                            value :

                                "mandiri",

                            label :

                                "Mandiri"

                        },

                        {

                            value :

                                "bri",

                            label :

                                "BRI"

                        },

                        {

                            value :

                                "dana",

                            label :

                                "DANA"

                        },

                        {

                            value :

                                "seabank",

                            label :

                                "SeaBank"

                        },

                        {

                            value :

                                "ovo",

                            label :

                                "OVO"

                        },

                        {

                            value :

                                "gopay",

                            label :

                                "GoPay"

                        },

                        {

                            value :

                                "bni",

                            label :

                                "BNI"

                        },

                        {

                            value :

                                "bca",

                            label :

                                "BCA"

                        },

                        {

                            value :

                                "shopeepay",

                            label :

                                "ShopeePay"

                        },

                       {

                            value :

                                "wallet_crypto",

                            label :

                                "Wallet Crypto"

                        },

                        {

                            value :

                                "celengan",

                            label :

                                "Celengan"

                        },

                       {

                            value :

                                "koperasi",

                            label :

                                "Koperasi"

                        },

                        {

                            value :

                                "dana_darurat",

                            label :

                                "Dana Darurat"

                        },               

                        /* ---------------------------------
                           LAIN-LAIN
                        --------------------------------- */

                        {

                            value :

                                "lain_lain",

                            label :

                                "Lain-lain"

                        }

                    ]

                },


                /* -------------------------------------
                   NAMA BANK CUSTOM
                ------------------------------------- */

                {

                    name :

                        "nama_bank_custom",


                    label :

                        "Nama Bank Lainnya",


                    type :

                        "text",


                    placeholder :

                        "Masukkan nama bank",


                    required :

                        true,


                    dependsOn : {

                        field :

                            "nama_bank",

                        value :

                            "lain_lain"

                    }

                }

            ]

        }

    ]

};
