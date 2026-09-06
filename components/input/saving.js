/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Saving
   File         : saving.js
   Version      : 2.2.0

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

   Edit Input Row :

   Target :
       ID + Tanggal

   Editable :
       jenis
       kategori
       bank
       nama
       nominal
       keterangan

   Locked :
       id
       tanggal

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

    getInputData,
    getInputRaw

} from "./data.js";


/* =====================================================
   IMPORT EDIT ROW
===================================================== */

import {

    EditRow

} from "./editrow.js";


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

           SAV-XXXXXXXX

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

    ],


    /* =================================================
       EDIT INPUT ROW
    =================================================

       Edit Row menggunakan :

           ID + Tanggal

       sebagai target locator.

       Tanggal pada Saving mengikuti
       data transaksi Saving.

       Field tanggal tidak menjadi
       field editable.

    ================================================= */

    openEdit :

        context => {

            console.log(
                "===== SAVING EDIT INPUT ROW OPEN ====="
            );


            return EditRow.open({

                /* =====================================
                   CONTEXT
                ===================================== */

                ...context,


                /* =====================================
                   WORKSPACE
                ===================================== */

                workspace :

                    "saving",


                /* =====================================
                   RECORD SOURCE
                =====================================

                   Gunakan data transaksi yang
                   sudah dibaca oleh Global Input
                   Data Engine.

                   Tidak membaca Sheet ulang.
                ===================================== */

                getRecords :

                    () => {

                        const records =

                            getInputRaw();


                        return Array.isArray(
                            records
                        )
                            ?

                            records

                            :

                            [];

                    },


                /* =====================================
                   DATE FIELD
                =====================================

                   Saving menggunakan field :

                       tanggal

                   Generic EditRow tetap memiliki
                   kemampuan membaca variasi tanggal,
                   tetapi workspace memberi tahu
                   field yang benar secara eksplisit.
                ===================================== */

                getDateField :

                    () =>

                        "tanggal",


                /* =====================================
                   ID FIELD
                ===================================== */

                getIdField :

                    record => {

                        if(

                            record &&

                            Object.prototype.hasOwnProperty.call(
                                record,
                                "id"
                            )

                        ){

                            return "id";

                        }


                        if(

                            record &&

                            Object.prototype.hasOwnProperty.call(
                                record,
                                "ID"
                            )

                        ){

                            return "ID";

                        }


                        return "id";

                    },


                /* =====================================
                   EDITABLE FIELDS
                =====================================

                   Hanya field yang memang berasal
                   dari Input Saving.

                   ID dan tanggal otomatis
                   dikunci oleh EditRow.
                ===================================== */

                editableFields : [

                    "jenis",

                    "kategori",

                    "bank",

                    "nama",

                    "nominal",

                    "keterangan"

                ],


                /* =====================================
                   LOCKED FIELDS
                ===================================== */

                lockedFields : [

                    "id",

                    "tanggal"

                ],


                /* =====================================
                   STRICT FIELD LIST
                =====================================

                   Jangan mengambil field lain dari
                   record mentah untuk ditampilkan
                   sebagai field editable.

                   Ini penting agar field internal/
                   derived tidak ikut muncul.
                ===================================== */

                strictFieldList :

                    true,


                /* =====================================
                   FIELD ORDER
                =====================================

                   Urutan sama seperti Normal Input.
                ===================================== */

                getFieldOrder :

                    () => [

                        "jenis",

                        "kategori",

                        "bank",

                        "nama",

                        "nominal",

                        "keterangan"

                    ],


                /* =====================================
                   FIELD MAP
                =====================================

                   Nama UI Saving sama dengan nama
                   field data Sheet.

                   Jadi tidak diperlukan mapping
                   tambahan.
                ===================================== */

                fieldMap : {

                    jenis :

                        "jenis",

                    kategori :

                        "kategori",

                    bank :

                        "bank",

                    nama :

                        "nama",

                    nominal :

                        "nominal",

                    keterangan :

                        "keterangan"

                },


                /* =====================================
                   FIELD CONFIG
                =====================================

                   EditRow akan menggunakan steps
                   Saving sebagai konfigurasi field.

                   Dengan ini :

                   jenis
                       → select

                   kategori
                       → select dinamis

                   bank
                       → select

                   nama
                       → select
                         hanya transfer

                   nominal
                       → number

                   keterangan
                       → text
                ===================================== */

                steps :

                    Saving.steps,


                /* =====================================
                   RECORD LABEL
                ===================================== */

                getRecordLabel :

                    record => {

                        const jenis =

                            String(

                                record?.jenis

                                ??

                                ""

                            ).trim();


                        const kategori =

                            String(

                                record?.kategori

                                ??

                                ""

                            ).trim();


                        if(

                            jenis &&

                            kategori

                        ){

                            return (

                                formatSavingLabel(
                                    jenis
                                )

                                +

                                " · "

                                +

                                formatSavingCategory(
                                    kategori
                                )

                            );

                        }


                        if(

                            jenis

                        ){

                            return formatSavingLabel(
                                jenis
                            );

                        }


                        if(

                            kategori

                        ){

                            return formatSavingCategory(
                                kategori
                            );

                        }


                        return "Transaksi Saving";

                    },


                /* =====================================
                   RECORD META
                ===================================== */

                getRecordMeta :

                    record => {

                        const tanggal =

                            getSavingRecordDate(
                                record
                            );


                        const nominal =

                            record?.nominal
                            ??
                            "";


                        const keterangan =

                            String(

                                record?.keterangan

                                ??

                                ""

                            ).trim();


                        const parts = [];


                        if(

                            tanggal

                        ){

                            parts.push(
                                tanggal
                            );

                        }


                        if(

                            nominal !==
                            ""

                        ){

                            parts.push(

                                formatSavingNominal(
                                    nominal
                                )

                            );

                        }


                        if(

                            keterangan

                        ){

                            parts.push(
                                keterangan
                            );

                        }


                        return parts.join(
                            " · "
                        );

                    },


                /* =====================================
                   DETAIL
                ===================================== */

                renderDetail :

                    record => {

                        const jenis =

                            String(

                                record?.jenis

                                ??

                                ""

                            ).trim();


                        const kategori =

                            String(

                                record?.kategori

                                ??

                                ""

                            ).trim();


                        const bank =

                            String(

                                record?.bank

                                ??

                                ""

                            ).trim();


                        const nama =

                            String(

                                record?.nama

                                ??

                                ""

                            ).trim();


                        const nominal =

                            String(

                                record?.nominal

                                ??

                                ""

                            ).trim();


                        const keterangan =

                            String(

                                record?.keterangan

                                ??

                                ""

                            ).trim();


                        return {

                            "Jenis" :

                                formatSavingLabel(
                                    jenis
                                ),

                            "Kategori" :

                                formatSavingCategory(
                                    kategori
                                ),

                            "Bank" :

                                bank,

                            "Bank Tujuan" :

                                jenis === "transfer"
                                    ?
                                    nama
                                    :
                                    "",

                            "Nominal" :

                                nominal,

                            "Keterangan" :

                                keterangan

                        };

                    },


                /* =====================================
                   VALIDATION
                ===================================== */

                validate :

                    (
                        record,
                        values,
                        editContext
                    ) => {

                        const jenis =

                            String(

                                values?.jenis

                                ??

                                ""

                            ).trim();


                        const kategori =

                            String(

                                values?.kategori

                                ??

                                ""

                            ).trim();


                        const bank =

                            String(

                                values?.bank

                                ??

                                ""

                            ).trim();


                        const nama =

                            String(

                                values?.nama

                                ??

                                ""

                            ).trim();


                        const nominal =

                            values?.nominal;


                        /* =================================
                           JENIS
                        ================================= */

                        if(

                            !jenis

                        ){

                            return {
                                valid :
                                    false,

                                message :
                                    "Jenis transaksi wajib dipilih."
                            };

                        }


                        /* =================================
                           KATEGORI
                        ================================= */

                        const categories =

                            CATEGORY[
                                jenis
                            ]

                            ??

                            [];


                        const validCategory =

                            categories.some(

                                option =>

                                    String(
                                        option.value
                                    )
                                    ===
                                    kategori

                            );


                        if(

                            !validCategory

                        ){

                            return {
                                valid :
                                    false,

                                message :
                                    "Kategori transaksi tidak valid."
                            };

                        }


                        /* =================================
                           BANK
                        ================================= */

                        if(

                            !bank

                        ){

                            return {
                                valid :
                                    false,

                                message :
                                    "Bank wajib dipilih."
                            };

                        }


                        const banks =

                            getBankOptions();


                        const validBank =

                            banks.some(

                                option =>

                                    String(
                                        option.value
                                    )
                                    ===
                                    bank

                            );


                        if(

                            !validBank

                        ){

                            return {
                                valid :
                                    false,

                                message :
                                    "Bank tidak ditemukan pada daftar Saving."
                            };

                        }


                        /* =================================
                           BANK TUJUAN
                        ================================= */

                        if(

                            jenis ===
                            "transfer"

                        ){

                            if(

                                !nama

                            ){

                                return {
                                    valid :
                                        false,

                                    message :
                                        "Bank tujuan wajib dipilih."
                                };

                            }


                            const validDestination =

                                banks.some(

                                    option =>

                                        String(
                                            option.value
                                        )
                                        ===
                                        nama

                                );


                            if(

                                !validDestination

                            ){

                                return {
                                    valid :
                                        false,

                                    message :
                                        "Bank tujuan tidak ditemukan pada daftar Saving."
                                };

                            }

                        }


                        /* =================================
                           NOMINAL
                        ================================= */

                        if(

                            nominal ===
                            undefined

                            ||

                            nominal ===
                            null

                            ||

                            String(
                                nominal
                            ).trim() === ""

                        ){

                            return {
                                valid :
                                    false,

                                message :
                                    "Nominal wajib diisi."
                            };

                        }


                        const numericNominal =

                            Number(
                                nominal
                            );


                        if(

                            !Number.isFinite(
                                numericNominal
                            )

                            ||

                            numericNominal <=
                            0

                        ){

                            return {
                                valid :
                                    false,

                                message :
                                    "Nominal harus lebih besar dari 0."
                            };

                        }


                        return {

                            valid :
                                true

                        };

                    }

            });

        }

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
   SAVING DATE
===================================================== */

/*
   Helper khusus adapter Edit Row.

   Saving menggunakan field :

       tanggal

   Tidak menggunakan State.date.

   State.date adalah tanggal untuk
   Normal Input, sedangkan Edit Row
   mengambil tanggal dari record Sheet.
*/

function getSavingRecordDate(
    record
){

    if(
        !record ||
        typeof record !==
            "object"
    ){

        return "";

    }


    return String(

        record.tanggal
        ??
        record.Tanggal
        ??
        ""

    ).trim();

}


/* =====================================================
   FORMAT JENIS
===================================================== */

function formatSavingLabel(
    value
){

    const normalized =

        String(
            value
            ??
            ""
        )
        .trim();


    const option =

        TRANSACTION_TYPES.find(

            item =>

                item.value ===
                normalized

        );


    return option
        ?
        option.label
        :
        normalized;

}


/* =====================================================
   FORMAT CATEGORY
===================================================== */

function formatSavingCategory(
    value
){

    const normalized =

        String(
            value
            ??
            ""
        )
        .trim();


    for(

        const type
        of
        Object.keys(
            CATEGORY
        )

    ){

        const option =

            CATEGORY[
                type
            ].find(

                item =>

                    item.value ===
                    normalized

            );


        if(
            option
        ){

            return option.label;

        }

    }


    return normalized;

}


/* =====================================================
   FORMAT NOMINAL
===================================================== */

function formatSavingNominal(
    value
){

    if(
        value ===
        undefined

        ||

        value ===
        null

        ||

        String(
            value
        ).trim() === ""

    ){

        return "";

    }


    const numeric =

        Number(
            String(
                value
            )
            .replace(
                /[^\d.-]/g,
                ""
            )
        );


    if(
        !Number.isFinite(
            numeric
        )
    ){

        return String(
            value
        );

    }


    return new Intl.NumberFormat(
        "id-ID"
    ).format(
        numeric
    );

}


/* =====================================================
   GET BANK OPTIONS
   PUBLIC DEBUG
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


/* =====================================================
   END
===================================================== */
