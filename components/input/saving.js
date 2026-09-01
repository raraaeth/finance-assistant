/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Saving
   File         : saving.js
   Version      : 2.1.0

   Description :
   Input Flow Configuration for Saving

   Data Source :
   Global Input Data Engine
        ↓
   Workspace Global
        ↓
   saving.sheets
        ↓
   saving_bank
        ↓
   getInputData()

   Flow :

   MASUK
   Jenis
   → Kategori
   → Bank
   → Nominal
   → Keterangan

   KELUAR
   Jenis
   → Kategori
   → Bank
   → Nominal
   → Keterangan

   TRANSFER
   Jenis
   → Kategori
   → Bank Asal
   → Bank Tujuan
   → Nominal
   → Keterangan

   Note :
   Transfer hanya untuk perpindahan dana
   antar bank / wallet milik sendiri.

   Principle :
   - Tidak ada source data bank hardcode.
   - Tidak ada getter Saving khusus.
   - Bank berasal dari getInputData().
   - Workspace dan sheet ditentukan oleh
     Global Workspace + Global Input Data Engine.
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

    "SAV";


/* =====================================================
   BANK OPTIONS
===================================================== */

/*
   Data bank berasal dari :

       saving_bank
            ↓
       getInputData()

   Format utama yang didukung :

       {
           nama : "BCA"
       }

   Juga tetap mendukung :

       {
           value : "BCA",
           label : "BCA"
       }

   atau data string :

       "BCA"
*/

function getBankOptions(){

    const banks =

        getInputData();


    if(

        !Array.isArray(

            banks

        )

    ){

        return [];

    }


    return banks

        .map(

            bank => {

                /* =====================================
                   OBJECT
                ===================================== */

                if(

                    bank &&

                    typeof bank ===

                        "object"

                ){

                    const value =

                        String(

                            bank.value

                            ??

                            bank.nama

                            ??

                            ""

                        )

                        .trim();


                    const label =

                        String(

                            bank.label

                            ??

                            bank.nama

                            ??

                            bank.value

                            ??

                            ""

                        )

                        .trim();


                    return {

                        value :

                            value,

                        label :

                            label

                    };

                }


                /* =====================================
                   STRING
                ===================================== */

                const value =

                    String(

                        bank ??

                        ""

                    )

                    .trim();


                return {

                    value :

                        value,

                    label :

                        value

                };

            }

        )

        .filter(

            option =>

                option.value !== ""

        )

        .filter(

            option =>

                option.label !== ""

        );

}


/* =====================================================
   TRANSACTION TYPE
===================================================== */

const TRANSACTION_TYPES = [

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

    },

    {

        value :

            "transfer",

        label :

            "🔄 Transfer",

        note :

            "Transfer digunakan untuk memindahkan dana antar bank atau wallet milik sendiri. Transfer ke rekening atau wallet milik orang lain gunakan Keluar → Transfer Out."

    }

];


/* =====================================================
   CATEGORY
===================================================== */

const CATEGORY = {

    masuk : [

        {

            value :

                "transfer_in",

            label :

                "Transfer In"

        },

        {

            value :

                "deposit",

            label :

                "Deposit"

        }

    ],


    keluar : [

        {

            value :

                "tarik",

            label :

                "Tarik"

        },

        {

            value :

                "transfer_out",

            label :

                "Transfer Out"

        },

        {

            value :

                "topup",

            label :

                "Topup"

        }

    ],


    transfer : [

        {

            value :

                "internal_transfer",

            label :

                "Internal Transfer"

        },

        {

            value :

                "withdraw",

            label :

                "Withdraw"

        },

        {

            value :

                "deposit",

            label :

                "Deposit"

        }

    ]

};


/* =====================================================
   SAVING
===================================================== */

export const Saving = {

    /* =================================================
       WORKSPACE
    ================================================= */

    workspace :

        "saving",

   /* =================================================
       PREFIX
    =================================================

       Digunakan oleh Global Input Controller
       untuk membuat ID transaksi.

       Contoh :

           PDR-XXXXXXXX

    ================================================= */

    prefix :

        PREFIX,


    /* =================================================
       TITLE
    ================================================= */

    title :

        "Input Saving",


    /* =================================================
       SUBTITLE
    ================================================= */

    subtitle :

        "Tambahkan transaksi Saving",


    /* =================================================
       FLOW
    ================================================= */

    steps : [

        /* =============================================
           1. JENIS
        ============================================= */

        {

            id :

                "jenis",

            label :

                "Jenis Transaksi",

            type :

                "select",

            options :

                TRANSACTION_TYPES

        },


        /* =============================================
           2. KATEGORI
        ============================================= */

        {

            id :

                "kategori",

            label :

                "Kategori",

            type :

                "select",

            options :

                values =>

                    CATEGORY[

                        values.jenis

                    ]

                    ??

                    []

        },


        /* =============================================
           3. BANK
           
           Untuk :

           masuk
           keluar
           transfer

           Pada transfer :

               bank = sumber
        ============================================= */

        {

            id :

                "bank",

            label :

                values =>

                    values.jenis ===

                    "transfer"

                        ?

                    "Bank Asal"

                        :

                    "Bank",

            type :

                "select",

            options :

                () =>

                    getBankOptions()

        },


        /* =============================================
           4. BANK TUJUAN
           
           Hanya muncul untuk transfer.

           bank
               =
           bank asal

           nama
               =
           bank tujuan
        ============================================= */

        {

            id :

                "nama",

            label :

                "Bank Tujuan",

            type :

                "select",

            options :

                () =>

                    getBankOptions(),

            showWhen :

                values =>

                    values.jenis ===

                    "transfer"

        },


        /* =============================================
           5. NOMINAL
        ============================================= */

        {

            id :

                "nominal",

            label :

                "Nominal",

            type :

                "number",

            placeholder :

                "Masukkan nominal"

        },


        /* =============================================
           6. KETERANGAN

           Selalu tersedia.

           Optional.
        ============================================= */

        {

            id :

                "keterangan",

            label :

                "Keterangan",

            type :

                "text",

            placeholder :

                "Keterangan transaksi",

            required :

                false

        }

    ]

};


/* =====================================================
   GET CONFIG
===================================================== */

export function getSavingInputConfig(){

    return Saving;

}


/* =====================================================
   GET BANK OPTIONS
===================================================== */

export function getSavingBankOptions(){

    return getBankOptions();

}


/* =====================================================
   DEBUG
===================================================== */

export function debugSavingInput(){

    const data =

        getInputData();


    const banks =

        getBankOptions();


    console.log(

        "===== SAVING INPUT DEBUG ====="

    );


    console.log(

        "Raw Saving Data:",

        data

    );


    console.log(

        "Bank Options:",

        banks

    );


    console.log(

        "Saving Config:",

        Saving

    );


    return {

        data :

            Array.isArray(data)

                ?

            [

                ...data

            ]

                :

            [],

        banks :

            [

                ...banks

            ],

        config :

            Saving

    };

}
