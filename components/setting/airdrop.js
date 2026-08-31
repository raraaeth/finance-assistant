/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Airdrop
   File         : airdrop.js
   Version      : 1.0.0

   Description :
   Airdrop Setting Definition

   Sections :
   - Reminder
   - Ended
   - Option Wallet
   - Option Type

   Principle :
   User only fills fields that are necessary.
   Internal engine values are generated automatically.
===================================================== */


/* =====================================================
   DEFAULT OPTIONS
===================================================== */

const DEFAULT_WALLETS = [

    {
        value : "main_wallet",
        label : "Main Wallet"
    },

    {
        value : "second_wallet",
        label : "Second Wallet"
    },

    {
        value : "gate_wallet",
        label : "Gate Wallet"
    },

    {
        value : "binance_wallet",
        label : "Binance Wallet"
    },

    {
        value : "okx_wallet",
        label : "OKX Wallet"
    },

    {
        value : "phantom_wallet",
        label : "Phantom Wallet"
    },

    {
        value : "kucoin_wallet",
        label : "KuCoin Wallet"
    }

];


const DEFAULT_TYPES = [

    {
        value : "testnet",
        label : "Testnet"
    },

    {
        value : "retro",
        label : "Retro"
    },

    {
        value : "daily",
        label : "Daily"
    },

    {
        value : "bansos",
        label : "Bansos"
    }

];


/* =====================================================
   HELPER
===================================================== */


/* -----------------------------------------------------
   NORMALIZE CUSTOM OPTION
----------------------------------------------------- */

function normalizeCustomOptions(
    value
){

    if(
        value === null ||
        value === undefined
    ){

        return [];

    }


    return String(
        value
    )
    .split(
        /[\n,]+/
    )
    .map(
        item =>
            item
                .trim()
    )
    .filter(
        Boolean
    );

}


/* -----------------------------------------------------
   NORMALIZE OPTION VALUE
----------------------------------------------------- */

function normalizeOptionValue(
    value
){

    return String(
        value
    )
    .trim()
    .toLowerCase()
    .replace(
        /\s+/g,
        "_"
    )
    .replace(
        /[^a-z0-9_]/g,
        ""
    );

}


/* -----------------------------------------------------
   NORMALIZE OPTION LABEL
----------------------------------------------------- */

function normalizeOptionLabel(
    value
){

    return String(
        value
    )
    .trim();

}


/* -----------------------------------------------------
   CREATE OPTION ROW
----------------------------------------------------- */

function createOptionRow(
    target,
    value
){

    return {

        rules :
            "option",

        target :
            target,

        type :
            normalizeOptionValue(
                value
            ),

        value :
            "",

        unit :
            "",

        active :
            "TRUE"

    };

}


/* =====================================================
   AIRDROP SETTING
===================================================== */

export const AirdropSetting = {


    /* =================================================
       HEADER
    ================================================= */

    title :

        "Pengaturan Airdrop",


    subtitle :

        "Atur reminder, otomatisasi status, wallet, dan type Airdrop.",


    /* =================================================
       SECTIONS
    ================================================= */

    sections : [


        /* =================================================
           1. REMINDER
        ================================================= */

        {

            id :

                "airdrop_reminder",


            title :

                "🔔 Reminder",


            description :

                "Tentukan berapa hari sebelum campaign berakhir agar ditampilkan pada Reminder.",


            addLabel :

                "＋ Atur Reminder",


            formAddLabel :

                "＋ Simpan Reminder",


            deleteLabel :

                "Hapus",


            uniqueFields : [

                "value"

            ],


            autoCloseForm :

                true,


            fields : [

                {

                    name :

                        "value",


                    label :

                        "Berapa hari sebelum campaign berakhir?",


                    type :

                        "number",


                    value :

                        7,


                    placeholder :

                        "Contoh: 7",


                    required :

                        true,


                    min :

                        1,


                    step :

                        1,


                    note :

                        "Campaign akan ditampilkan pada Reminder jika tanggal berakhirnya berada dalam jumlah hari yang kamu tentukan."

                }

            ],


            normalize :

                function(
                    data
                ){

                    return {

                        rules :

                            "reminder",

                        target :

                            "end",

                        type :

                            "campaign",

                        value :

                            String(
                                data.value ?? ""
                            ),

                        unit :

                            "day",

                        active :

                            "TRUE"

                    };

                }

        },


        /* =================================================
           2. ENDED
        ================================================= */

        {

            id :

                "airdrop_ended",


            title :

                "⏹️ Ended",


            description :

                "Atur apakah status campaign yang sudah berakhir akan diubah menjadi Ended secara otomatis.",


            addLabel :

                "＋ Atur Ended",


            formAddLabel :

                "＋ Simpan Pengaturan",


            deleteLabel :

                "Hapus",


            uniqueFields : [

                "active"

            ],


            autoCloseForm :

                true,


            fields : [

                {

                    name :

                        "active",


                    label :

                        "Otomatis ubah status campaign menjadi Ended",


                    type :

                        "checkbox",


                    value :

                        false,


                    required :

                        false,


                    note :

                        "Jika dicentang, campaign yang sudah melewati tanggal berakhir akan diubah statusnya menjadi Ended secara otomatis."

                }

            ],


            normalize :

                function(
                    data
                ){

                    return {

                        rules :

                            "ended",

                        target :

                            "end",

                        type :

                            "campaign",

                        value :

                            "1",

                        unit :

                            "day",

                        active :

                            Boolean(
                                data.active
                            )
                            ? "TRUE"
                            : "FALSE"

                    };

                }

        },


        /* =================================================
           3. OPTION WALLET
        ================================================= */

        {

            id :

                "airdrop_option_wallet",


            title :

                "👛 Option Wallet",


            description :

                "Pilih wallet yang tersedia untuk digunakan pada input Airdrop. Kamu juga dapat menambahkan wallet sendiri.",


            addLabel :

                "＋ Atur Wallet",


            formAddLabel :

                "＋ Simpan Wallet",


            deleteLabel :

                "Hapus",


            uniqueFields : [

                "walletOptions"

            ],


            autoCloseForm :

                true,


            fields : [

                {

                    name :

                        "walletOptions",


                    label :

                        "Wallet yang tersedia",


                    type :

                        "checkboxGroup",


                    options :

                        DEFAULT_WALLETS,


                    value :

                        DEFAULT_WALLETS
                            .map(
                                item =>
                                    item.value
                            ),


                    required :

                        false,


                    note :

                        "Checklist wallet yang ingin tersedia pada input Airdrop."

                },


                {

                    name :

                        "customWallet",


                    label :

                        "Tambahkan wallet lain",


                    type :

                        "text",


                    placeholder :

                        "Contoh: metamask_wallet",


                    required :

                        false,


                    note :

                        "Jika ingin menambahkan lebih dari satu wallet, pisahkan dengan koma atau baris baru."

                }

            ],


            normalize :

                function(
                    data
                ){

                    const result = [];


                    /* =====================================
                       DEFAULT WALLET
                    ===================================== */

                    const selectedWallets =

                        Array.isArray(
                            data.walletOptions
                        )

                        ?

                        data.walletOptions

                        :

                        [];


                    selectedWallets.forEach(

                        wallet => {

                            const value =

                                normalizeOptionValue(
                                    wallet
                                );


                            if(
                                !value
                            ){

                                return;

                            }


                            result.push(

                                createOptionRow(
                                    "wallet",
                                    value
                                )

                            );

                        }

                    );


                    /* =====================================
                       CUSTOM WALLET
                    ===================================== */

                    const customWallets =

                        normalizeCustomOptions(
                            data.customWallet
                        );


                    customWallets.forEach(

                        wallet => {

                            const value =

                                normalizeOptionValue(
                                    wallet
                                );


                            if(
                                !value
                            ){

                                return;

                            }


                            const exists =

                                result.some(

                                    row =>

                                        row.target ===
                                            "wallet"

                                        &&

                                        row.type ===
                                            value

                                );


                            if(
                                !exists
                            ){

                                result.push(

                                    createOptionRow(
                                        "wallet",
                                        value
                                    )

                                );

                            }

                        }

                    );


                    return result;

                }

        },


        /* =================================================
           4. OPTION TYPE
        ================================================= */

        {

            id :

                "airdrop_option_type",


            title :

                "🏷️ Option Type",


            description :

                "Pilih type Airdrop yang tersedia untuk digunakan pada input. Campaign selalu tersedia dan tidak dapat dinonaktifkan.",


            addLabel :

                "＋ Atur Type",


            formAddLabel :

                "＋ Simpan Type",


            deleteLabel :

                "Hapus",


            uniqueFields : [

                "typeOptions"

            ],


            autoCloseForm :

                true,


            fields : [

                {

                    name :

                        "typeOptions",


                    label :

                        "Type yang tersedia",


                    type :

                        "checkboxGroup",


                    options :

                        [

                            {

                                value :
                                    "campaign",

                                label :
                                    "Campaign",

                                disabled :
                                    true

                            },

                            ...DEFAULT_TYPES

                        ],


                    value :

                        [

                            "campaign"

                        ],


                    required :

                        false,


                    note :

                        "Campaign selalu aktif karena merupakan type wajib. Type lainnya dapat kamu pilih sesuai kebutuhan."

                },


                {

                    name :

                        "customType",


                    label :

                        "Tambahkan type lain",


                    type :

                        "text",


                    placeholder :

                        "Contoh: quest",


                    required :

                        false,


                    note :

                        "Jika ingin menambahkan lebih dari satu type, pisahkan dengan koma atau baris baru."

                }

            ],


            normalize :

                function(
                    data
                ){

                    const result = [];


                    /* =====================================
                       CAMPAIGN — ALWAYS REQUIRED
                    ===================================== */

                    result.push(

                        createOptionRow(
                            "type",
                            "campaign"
                        )

                    );


                    /* =====================================
                       SELECTED DEFAULT TYPE
                    ===================================== */

                    const selectedTypes =

                        Array.isArray(
                            data.typeOptions
                        )

                        ?

                        data.typeOptions

                        :

                        [];


                    selectedTypes.forEach(

                        type => {

                            const value =

                                normalizeOptionValue(
                                    type
                                );


                            if(
                                !value ||
                                value ===
                                    "campaign"
                            ){

                                return;

                            }


                            const exists =

                                result.some(

                                    row =>

                                        row.target ===
                                            "type"

                                        &&

                                        row.type ===
                                            value

                                );


                            if(
                                !exists
                            ){

                                result.push(

                                    createOptionRow(
                                        "type",
                                        value
                                    )

                                );

                            }

                        }

                    );


                    /* =====================================
                       CUSTOM TYPE
                    ===================================== */

                    const customTypes =

                        normalizeCustomOptions(
                            data.customType
                        );


                    customTypes.forEach(

                        type => {

                            const value =

                                normalizeOptionValue(
                                    type
                                );


                            if(
                                !value ||
                                value ===
                                    "campaign"
                            ){

                                return;

                            }


                            const exists =

                                result.some(

                                    row =>

                                        row.target ===
                                            "type"

                                        &&

                                        row.type ===
                                            value

                                );


                            if(
                                !exists
                            ){

                                result.push(

                                    createOptionRow(
                                        "type",
                                        value
                                    )

                                );

                            }

                        }

                    );


                    return result;

                }

        }

    ]

};
