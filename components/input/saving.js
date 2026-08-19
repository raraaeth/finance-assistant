/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Saving
   File         : saving.js
   Version      : 2.0.0

   Description :
   Input Flow Configuration for Saving

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
===================================================== */


/* =====================================================
   IMPORT DATA
===================================================== */

import {

    getSavingBanks

} from "./data.js";


/* =====================================================
   BANK OPTIONS
===================================================== */

function getBankOptions(){

    const banks =

        getSavingBanks();


    if(

        !Array.isArray(

            banks

        )

    ){

        return [];

    }


    return banks.map(

        bank => {

            if(

                typeof bank ===

                    "object"

                &&

                bank !== null

            ){

                return {

                    value :

                        bank.value

                        ??

                        bank.nama

                        ??

                        "",

                    label :

                        bank.label

                        ??

                        bank.nama

                        ??

                        bank.value

                        ??

                        ""

                };

            }


            return {

                value :

                    bank,

                label :

                    bank

            };

        }

    )

    .filter(

        option =>

            option.value !== ""

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

    workspace :

        "saving",


    title :

        "Input Saving",


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
           - masuk
           - keluar
           - transfer
           
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
           4. NAMA / BANK TUJUAN
           
           Hanya muncul untuk transfer.
           
           bank  = sumber
           nama  = tujuan
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
           
           SELALU ADA
           OPTIONAL
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
