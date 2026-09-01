/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Saving
   File         : saving.js
   Version      : 1.2.0

   Description :
   Saving Setting Definition

   Sheet :
   saving_bank

   Fields :
   - nama_bank
   - nama_bank_custom

   Sheet Mapping :
   UI
       ↓
   normalize()
       ↓
   nama
       ↓
   saving_bank

   Principle :
   - Field UI tetap menggunakan nama_bank
   - Lain-lain menggunakan nama_bank_custom
   - Data akhir disesuaikan dengan header Sheet
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

            ],


            /* =========================================
               NORMALIZE
               
               Mapping :
               
               Field UI
                   ↓
               Sheet

               Sheet header :

                   nama

               Jika pilihan normal :

                   nama_bank = bri
                       ↓
                   nama = bri

               Jika Lain-lain :

                   nama_bank = lain_lain
                   nama_bank_custom = Jago
                       ↓
                   nama = Jago

               Field UI tidak dikirim
               ke backend dalam bentuk
               nama_bank / nama_bank_custom.
            ========================================= */

            normalize :

                data => {

                    const selectedBank =

                        String(

                            data.nama_bank ??

                            ""

                        ).trim();


                    const customBank =

                        String(

                            data.nama_bank_custom ??

                            ""

                        ).trim();


                    /* =================================
                       LAIN-LAIN
                    ================================= */

                    if(

                        selectedBank ===

                            "lain_lain"

                    ){

                        return {

                            nama :

                                customBank

                        };

                    }


                    /* =================================
                       BANK NORMAL
                    ================================= */

                    return {

                        nama :

                            selectedBank

                    };

                }

        }

    ]

};
