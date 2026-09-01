/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Saving
   File         : saving.js
   Version      : 1.3.0

   Description :
   Saving Setting Definition

   Sheet :
   saving_bank

   Sheet Header :
   - nama

   UI :
   - Pilihan Bank / Wallet menggunakan checkbox
   - Nama manual menggunakan input text
   - Checkbox result dan manual result terpisah
   - Saat Confirm seluruh result dinormalisasi
     menjadi field "nama"

   Principle :
   - Bank / wallet bawaan mempunyai logo
   - User dapat memilih beberapa pilihan sekaligus
   - User dapat menambahkan nama sendiri
   - Nama yang tersimpan di Sheet adalah nama sebenarnya
   - Tidak ada lagi value "lain_lain"
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

        "Atur rekening atau tempat penyimpanan dana",


    /* =================================================
       SECTIONS
    ================================================= */

    sections : [


        /* =============================================
           BANK / WALLET BAWAAN
        ============================================= */

        {

            id :

                "bank_options",


            title :

                "🏦 Bank / Wallet",


            description :

                "Pilih bank, e-wallet, atau tempat penyimpanan dana yang kamu gunakan.",


            /* =========================================
               RESULT
            ========================================= */

            resultTitle :

                "Bank / Wallet Terpilih",


            addLabel :

                "＋ Tambah Pilihan",


            formAddLabel :

                "＋ Tambahkan Pilihan",


            deleteLabel :

                "Hapus",


            /* =========================================
               FORM TYPE
            ========================================= */

            inputMode :

                "checkbox-group",


            /* =========================================
               FIELDS
            ========================================= */

            fields : [

                /* -------------------------------------
                   MANDIRI
                ------------------------------------- */

                {

                    name :

                        "mandiri",

                    label :

                        "Mandiri",

                    type :

                        "checkbox",

                    resultName :

                        "Mandiri"

                    
                },


                /* -------------------------------------
                   BRI
                ------------------------------------- */

                {

                    name :

                        "bri",

                    label :

                        "BRI",

                    type :

                        "checkbox",

                    resultName :

                        "BRI"

                    
                },


                /* -------------------------------------
                   BNI
                ------------------------------------- */

                {

                    name :

                        "bni",

                    label :

                        "BNI",

                    type :

                        "checkbox",

                    resultName :

                        "BNI"

                    
                },


                /* -------------------------------------
                   BCA
                ------------------------------------- */

                {

                    name :

                        "bca",

                    label :

                        "BCA",

                    type :

                        "checkbox",

                    resultName :

                        "BCA"

                    
                },


                /* -------------------------------------
                   SEABANK
                ------------------------------------- */

                {

                    name :

                        "seabank",

                    label :

                        "SeaBank",

                    type :

                        "checkbox",

                    resultName :

                        "SeaBank"

                    
                },


                /* -------------------------------------
                   DANA
                ------------------------------------- */

                {

                    name :

                        "dana",

                    label :

                        "DANA",

                    type :

                        "checkbox",

                    resultName :

                        "DANA"

                    
                },


                /* -------------------------------------
                   OVO
                ------------------------------------- */

                {

                    name :

                        "ovo",

                    label :

                        "OVO",

                    type :

                        "checkbox",

                    resultName :

                        "OVO"

                    
                },


                /* -------------------------------------
                   GOPAY
                ------------------------------------- */

                {

                    name :

                        "gopay",

                    label :

                        "GoPay",

                    type :

                        "checkbox",

                    resultName :

                        "GoPay"

                    
                },


                /* -------------------------------------
                   SHOPEEPAY
                ------------------------------------- */

                {

                    name :

                        "shopeepay",

                    label :

                        "ShopeePay",

                    type :

                        "checkbox",

                    resultName :

                        "ShopeePay"

                    
                },


                /* -------------------------------------
                   WALLET CRYPTO
                ------------------------------------- */

                {

                    name :

                        "wallet_crypto",

                    label :

                        "Wallet Crypto",

                    type :

                        "checkbox",

                    resultName :

                        "Wallet Crypto"

                    
                },


                /* -------------------------------------
                   CELENGAN
                ------------------------------------- */

                {

                    name :

                        "celengan",

                    label :

                        "Celengan",

                    type :

                        "checkbox",

                    resultName :

                        "Celengan"

                    
                },


                /* -------------------------------------
                   KOPERASI
                ------------------------------------- */

                {

                    name :

                        "koperasi",

                    label :

                        "Koperasi",

                    type :

                        "checkbox",

                    resultName :

                        "Koperasi"

                    
                },


                /* -------------------------------------
                   DANA DARURAT
                ------------------------------------- */

                {

                    name :

                        "dana_darurat",

                    label :

                        "Dana Darurat",

                    type :

                        "checkbox",

                    resultName :

                        "Dana Darurat"

                    
                }

            ],


            /* =========================================
               NORMALIZE
               
               Checkbox :
               
               mandiri : true
               bri     : false
               
               ↓
               
               nama :
                   "Mandiri"
            ========================================= */

            normalize :

                data => {

                    const result = [];


                    if(

                        data.mandiri === true

                    ){

                        result.push({

                            nama :

                                "Mandiri"

                        });

                    }


                    if(

                        data.bri === true

                    ){

                        result.push({

                            nama :

                                "BRI"

                        });

                    }


                    if(

                        data.bni === true

                    ){

                        result.push({

                            nama :

                                "BNI"

                        });

                    }


                    if(

                        data.bca === true

                    ){

                        result.push({

                            nama :

                                "BCA"

                        });

                    }


                    if(

                        data.seabank === true

                    ){

                        result.push({

                            nama :

                                "SeaBank"

                        });

                    }


                    if(

                        data.dana === true

                    ){

                        result.push({

                            nama :

                                "DANA"

                        });

                    }


                    if(

                        data.ovo === true

                    ){

                        result.push({

                            nama :

                                "OVO"

                        });

                    }


                    if(

                        data.gopay === true

                    ){

                        result.push({

                            nama :

                                "GoPay"

                        });

                    }


                    if(

                        data.shopeepay === true

                    ){

                        result.push({

                            nama :

                                "ShopeePay"

                        });

                    }


                    if(

                        data.wallet_crypto === true

                    ){

                        result.push({

                            nama :

                                "Wallet Crypto"

                        });

                    }


                    if(

                        data.celengan === true

                    ){

                        result.push({

                            nama :

                                "Celengan"

                        });

                    }


                    if(

                        data.koperasi === true

                    ){

                        result.push({

                            nama :

                                "Koperasi"

                        });

                    }


                    if(

                        data.dana_darurat === true

                    ){

                        result.push({

                            nama :

                                "Dana Darurat"

                        });

                    }


                    return result;

                }

        },


        /* =============================================
           NAMA MANUAL
        ============================================= */

        {

            id :

                "bank_custom",


            title :

                "✏️ Nama Sendiri",


            description :

                "Tambahkan nama bank, wallet, atau tempat penyimpanan dana yang belum tersedia di daftar.",


            resultTitle :

                "Nama Sendiri",


            addLabel :

                "＋ Tambah Nama",


            formAddLabel :

                "＋ Tambahkan Nama",


            deleteLabel :

                "Hapus",


            fields : [

                {

                    name :

                        "nama_bank_custom",


                    label :

                        "Nama Bank / Wallet",


                    type :

                        "text",


                    placeholder :

                        "Contoh: Jago, SeaBank Bisnis, dll.",


                    required :

                        true

                }

            ],


            /* =========================================
               NORMALIZE
               
               Input :
                   nama_bank_custom
               
               ↓
               
               Sheet :
                   nama
            ========================================= */

            normalize :

                data => {

                    const nama =

                        String(

                            data.nama_bank_custom ??

                            ""

                        ).trim();


                    return {

                        nama :

                            nama

                    };

                }

        }

    ]

};
