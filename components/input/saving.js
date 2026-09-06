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
   → Nama Bank
   → Nominal
   → Keterangan

   KELUAR
   Jenis
   → Kategori
   → Nama Bank
   → Nominal
   → Keterangan

   TRANSFER INTERNAL
   Jenis
   → Kategori
   → Bank Asal
   → Bank Tujuan
   → Nominal
   → Keterangan

   TRANSFER WITHDRAW / DEPOSIT
   Jenis
   → Kategori
   → Nama Bank
   → Nominal
   → Keterangan

   Note :
   Bank Tujuan hanya digunakan oleh :

       jenis   = transfer
       kategori = internal_transfer

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
   EDIT ROW FIELD RULE
===================================================== */

/*
   Struktur field Edit Row Saving :

   MASUK
   --------------------------------
   jenis
   kategori
   bank
   nominal
   keterangan


   KELUAR
   --------------------------------
   jenis
   kategori
   bank
   nominal
   keterangan


   TRANSFER + INTERNAL_TRANSFER
   --------------------------------
   jenis
   kategori
   bank
   nama
   nominal
   keterangan


   TRANSFER + WITHDRAW / DEPOSIT
   --------------------------------
   jenis
   kategori
   bank
   nominal
   keterangan


   Jadi :

       nama

   BUKAN field Bank Tujuan umum.

   nama hanya digunakan sebagai
   Bank Tujuan apabila :

       jenis === "transfer"
       &&
       kategori === "internal_transfer"
*/


function isInternalTransfer(

    values

){

    return (

        values?.jenis ===

            "transfer"

        &&

        values?.kategori ===

            "internal_transfer"

    );

}


/* =====================================================
   EDIT ROW FIELD ORDER
===================================================== */

/*
   Urutan field tetap mengikuti
   struktur Input Saving.

   Field "nama" hanya akan masuk
   ketika internal_transfer.
*/

function getSavingEditFieldOrder(

    values

){

    const fields = [

        "jenis",

        "kategori",

        "bank"

    ];


    if(

        isInternalTransfer(

            values

        )

    ){

        fields.push(

            "nama"

        );

    }


    fields.push(

        "nominal",

        "keterangan"

    );


    return fields;

}


/* =====================================================
   EDIT ROW FIELD LABEL
===================================================== */

function getSavingEditFieldLabel(

    field,

    values

){

    switch(

        field

    ){

        case "jenis":

            return "Jenis Transaksi";


        case "kategori":

            return "Kategori";


        case "bank":

            return isInternalTransfer(

                values

            )

                ?

            "Bank Asal"

                :

            "Nama Bank";


        case "nama":

            return "Bank Tujuan";


        case "nominal":

            return "Nominal";


        case "keterangan":

            return "Keterangan";


        default:

            return field;

    }

}


/* =====================================================
   EDIT ROW FIELD TYPE
===================================================== */

function getSavingEditFieldType(

    field

){

    switch(

        field

    ){

        case "jenis":

            return "select";


        case "kategori":

            return "select";


        case "bank":

            return "select";


        case "nama":

            return "select";


        case "nominal":

            return "number";


        case "keterangan":

            return "text";


        default:

            return "text";

    }

}


/* =====================================================
   EDIT ROW FIELD OPTIONS
===================================================== */

function getSavingEditFieldOptions(

    field,

    values

){

    switch(

        field

    ){

        case "jenis":

            return [

                ...TRANSACTION_TYPES

            ];


        case "kategori":

            return [

                ...(

                    CATEGORY[

                        values?.jenis

                    ]

                    ??

                    []

                )

            ];


        case "bank":

            return getBankOptions();


        case "nama":

            /*
               Bank Tujuan hanya valid
               untuk internal_transfer.
            */

            if(

                !isInternalTransfer(

                    values

                )

            ){

                return [];

            }


            return getBankOptions();


        default:

            return [];

    }

}


/* =====================================================
   EDIT ROW FIELD VISIBILITY
===================================================== */

function isSavingEditFieldVisible(

    field,

    values

){

    /*
       Bank selalu tersedia.

       Label berubah :

       masuk / keluar
           → Nama Bank

       transfer + internal_transfer
           → Bank Asal
    */

    if(

        field === "bank"

    ){

        return true;

    }


    /*
       nama hanya muncul sebagai
       Bank Tujuan untuk
       internal_transfer.
    */

    if(

        field === "nama"

    ){

        return isInternalTransfer(

            values

        );

    }


    return true;

}


/* =====================================================
   EDIT ROW FIELD VALUE
===================================================== */

/*
   Membaca nilai field dari record.

   Tidak mengubah record.

   Mapping langsung berdasarkan
   field Saving.
*/

function getSavingEditFieldValue(

    field,

    record

){

    if(

        !record

        ||

        typeof record !==

            "object"

    ){

        return "";

    }


    /*
       Field langsung.
    */

    if(

        Object.prototype.hasOwnProperty.call(

            record,

            field

        )

    ){

        return record[field];

    }


    /*
       Fallback case-sensitive
       untuk data yang mungkin
       menggunakan huruf kapital.
    */

    const keys =

        Object.keys(

            record

        );


    const target =

        field.toLowerCase();


    const matchedKey =

        keys.find(

            key =>

                String(

                    key

                )

                .toLowerCase()

                ===

                target

        );


    if(

        matchedKey !==

            undefined

    ){

        return record[

            matchedKey

        ];

    }


    return "";

}


/* =====================================================
   SET EDIT ROW FIELD VALUE
===================================================== */

function setSavingEditFieldValue(

    field,

    value,

    record

){

    if(

        !record

        ||

        typeof record !==

            "object"

    ){

        return;

    }


    /*
       Gunakan key asli jika tersedia.
    */

    if(

        Object.prototype.hasOwnProperty.call(

            record,

            field

        )

    ){

        record[field] = value;

        return;

    }


    /*
       Fallback case-insensitive.
    */

    const keys =

        Object.keys(

            record

        );


    const target =

        field.toLowerCase();


    const matchedKey =

        keys.find(

            key =>

                String(

                    key

                )

                .toLowerCase()

                ===

                target

        );


    if(

        matchedKey !==

            undefined

    ){

        record[

            matchedKey

        ] = value;

        return;

    }


    /*
       Jika field belum ada,
       gunakan nama field standar.
    */

    record[field] = value;

}


/* =====================================================
   SAVING EDIT VALIDATION
===================================================== */

function validateSavingEdit(

    record,

    values

){

    if(

        !record

        ||

        typeof record !==

            "object"

    ){

        throw new Error(

            "Data transaksi Saving tidak valid."

        );

    }


    if(

        !values

        ||

        typeof values !==

            "object"

    ){

        throw new Error(

            "Data edit Saving tidak valid."

        );

    }


    if(

        !values.jenis

    ){

        throw new Error(

            "Jenis transaksi wajib dipilih."

        );

    }


    if(

        !values.kategori

    ){

        throw new Error(

            "Kategori wajib dipilih."

        );

    }


    if(

        !values.bank

    ){

        throw new Error(

            "Nama Bank wajib dipilih."

        );

    }


    /*
       Bank Tujuan WAJIB hanya
       untuk internal_transfer.
    */

    if(

        isInternalTransfer(

            values

        )

        &&

        !values.nama

    ){

        throw new Error(

            "Bank Tujuan wajib dipilih untuk Internal Transfer."

        );

    }


    /*
       Untuk transaksi selain
       internal_transfer, nama
       tidak boleh menjadi
       Bank Tujuan.

       Kita kosongkan secara
       konseptual di validation
       agar tidak ikut dianggap
       sebagai field edit.
    */

    return true;

}


/* =====================================================
   SAVING EDIT ROW CONFIG
===================================================== */

const SAVING_EDIT_CONFIG = {

    /*
       Field yang boleh diedit.

       ID dan Date/Tanggal tetap
       ditangani oleh generic
       EditRow sebagai locator
       dan locked field.
    */

    editableFields : [

        "jenis",

        "kategori",

        "bank",

        "nama",

        "nominal",

        "keterangan"

    ],


    /*
       Field yang harus tetap
       terkunci.

       ID + Date merupakan
       locator Edit Row.
    */

    lockedFields : [

        "id",

        "date",

        "Date",

        "tanggal",

        "Tanggal"

    ],


    strictFieldList :

        true,


    getFieldOrder(

        values

    ){

        return getSavingEditFieldOrder(

            values

        );

    },


    getFieldLabel(

        field,

        values

    ){

        return getSavingEditFieldLabel(

            field,

            values

        );

    },


    getFieldType(

        field

    ){

        return getSavingEditFieldType(

            field

        );

    },


    getFieldOptions(

        field,

        values

    ){

        return getSavingEditFieldOptions(

            field,

            values

        );

    },


    isFieldVisible(

        field,

        values

    ){

        return isSavingEditFieldVisible(

            field,

            values

        );

    },


    getFieldValue(

        field,

        record

    ){

        return getSavingEditFieldValue(

            field,

            record

        );

    },


    setFieldValue(

        field,

        value,

        record

    ){

        setSavingEditFieldValue(

            field,

            value,

            record

        );

    },


    getSheetField(

        field

    ){

        return field;

    },


    validate(

        record,

        values

    ){

        return validateSavingEdit(

            record,

            values

        );

    }

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
       EDIT ROW
    ================================================= */

    editRow :

        SAVING_EDIT_CONFIG

};


/* =====================================================
   OPEN EDIT ROW
===================================================== */

/*
   Dipanggil oleh Global Input Controller :

       Financial.openEdit()
       Saving.openEdit()
       dst.

   Normal Input tidak melewati
   fungsi ini.
*/

async function openSavingEditRow(

    context = {}

){

    const data =

        Array.isArray(

            context.data

        )

            ?

        context.data

            :

        [];


    console.log(

        "=========================================="

    );


    console.log(

        "===== SAVING EDIT INPUT ROW OPEN ====="

    );


    console.log(

        "Saving Edit Row records:",

        data

    );


    return EditRow.open({

        workspace :

            "saving",

        mode :

            "row",

        data :

            data,

        state :

            context.state,


        /*
           Konfigurasi field Saving.
        */

        ...SAVING_EDIT_CONFIG,


        /*
           Target Edit Row tetap
           menggunakan ID + Date/Tanggal.

           Generic EditRow yang menangani
           pembacaan locator.
        */

        getRecords :

            () =>

                data

    });

}


/* =====================================================
   ATTACH EDIT API
===================================================== */

Saving.openEdit =

    openSavingEditRow;


/*
   Alias untuk kompatibilitas
   controller yang memanggil
   .open()
*/

Saving.open =

    openSavingEditRow;


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


    console.log(

        "Saving Edit Config:",

        SAVING_EDIT_CONFIG

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
