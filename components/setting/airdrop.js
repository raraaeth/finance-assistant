/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Airdrop
   File         : airdrop.js
   Version      : 2.0.0

   Description :
   Airdrop Setting Definition

   Sections :
   - Reminder
   - Ended
   - Option Wallet
   - Option Type

   Principle :
   User hanya memilih konfigurasi yang tersedia.
   Internal rule value ditentukan oleh module.
===================================================== */


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

                "Atur berapa hari sebelum campaign berakhir agar campaign ditampilkan pada Reminder.",


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

                        "Nilai ini menentukan berapa hari sebelum campaign berakhir campaign tersebut akan ditampilkan pada Reminder."

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

                                data.value ??

                                ""

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

                "Atur otomatisasi perubahan status campaign yang sudah melewati tanggal berakhir.",


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

                        "Jika dicentang, status campaign yang sudah melewati tanggal berakhir akan diubah menjadi Ended secara otomatis."

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

                            ?

                            "TRUE"

                            :

                            "FALSE"

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

                "Pilih wallet yang tersedia untuk digunakan pada input Airdrop.",


            addLabel :

                "＋ Atur Wallet",


            formAddLabel :

                "＋ Simpan Wallet",


            deleteLabel :

                "Hapus",


            uniqueFields : [

                "main_wallet",

                "second_wallet",

                "testnet_wallet",

                "backup_wallet",

                "bybit_wallet",

                "gate_wallet",

                "binance_wallet",

                "okx_wallet",

                "phantom_wallet",

                "solflare_wallet",

                "kucoin_wallet",

                "metamask_wallet",

                "xrp_wallet",

                "cosmos_wallet",

                "canton_wallet",

                "binance_exchange",

                "okx_exchange",

                "kucoin_exchange",

                "bybit_exchange",

                "gate_exchange"

            ],


            autoCloseForm :

                true,


            fields : [

                /* =========================================
                   MAIN WALLET
                ========================================= */

                {

                    name :

                        "main_wallet",

                    label :

                        "Main Wallet",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "main_wallet",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   SECOND WALLET
                ========================================= */

                {

                    name :

                        "second_wallet",

                    label :

                        "Second Wallet",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "second_wallet",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   TESTNET WALLET
                ========================================= */

                {

                    name :

                        "testnet_wallet",

                    label :

                        "Testnet Wallet",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "testnet_wallet",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   BACKUP WALLET
                ========================================= */

                {

                    name :

                        "backup_wallet",

                    label :

                        "Backup Wallet",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "backup_wallet",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   BYBIT WALLET
                ========================================= */

                {

                    name :

                        "bybit_wallet",

                    label :

                        "Bybit Wallet",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "bybit_wallet",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   GATE WALLET
                ========================================= */

                {

                    name :

                        "gate_wallet",

                    label :

                        "Gate Wallet",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "gate_wallet",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   BINANCE WALLET
                ========================================= */

                {

                    name :

                        "binance_wallet",

                    label :

                        "Binance Wallet",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "binance_wallet",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   OKX WALLET
                ========================================= */

                {

                    name :

                        "okx_wallet",

                    label :

                        "OKX Wallet",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "okx_wallet",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   PHANTOM WALLET
                ========================================= */

                {

                    name :

                        "phantom_wallet",

                    label :

                        "Phantom Wallet",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "phantom_wallet",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   SOLFLARE WALLET
                ========================================= */

                {

                    name :

                        "solflare_wallet",

                    label :

                        "Solflare Wallet",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "solflare_wallet",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   KUCOIN WALLET
                ========================================= */

                {

                    name :

                        "kucoin_wallet",

                    label :

                        "KuCoin Wallet",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "kucoin_wallet",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   METAMASK WALLET
                ========================================= */

                {

                    name :

                        "metamask_wallet",

                    label :

                        "Metamask Wallet",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "metamask_wallet",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   XRP WALLET
                ========================================= */

                {

                    name :

                        "xrp_wallet",

                    label :

                        "XRP Wallet",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "xrp_wallet",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   COSMOS WALLET
                ========================================= */

                {

                    name :

                        "cosmos_wallet",

                    label :

                        "Cosmos Wallet",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "cosmos_wallet",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   CANTON WALLET
                ========================================= */

                {

                    name :

                        "canton_wallet",

                    label :

                        "Canton Wallet",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "canton_wallet",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   BINANCE EXCHANGE
                ========================================= */

                {

                    name :

                        "binance_exchange",

                    label :

                        "Binance Exchange",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "binance_exchange",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   OKX EXCHANGE
                ========================================= */

                {

                    name :

                        "okx_exchange",

                    label :

                        "OKX Exchange",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "okx_exchange",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   KUCOIN EXCHANGE
                ========================================= */

                {

                    name :

                        "kucoin_exchange",

                    label :

                        "KuCoin Exchange",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "kucoin_exchange",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   BYBIT EXCHANGE
                ========================================= */

                {

                    name :

                        "bybit_exchange",

                    label :

                        "Bybit Exchange",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "bybit_exchange",

                    resultTarget :

                        "wallet"

                },


                /* =========================================
                   GATE EXCHANGE
                ========================================= */

                {

                    name :

                        "gate_exchange",

                    label :

                        "Gate Exchange",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "gate_exchange",

                    resultTarget :

                        "wallet"

                }

            ],


            normalize :

                function(

                    data

                ){

                    const result = [];


                    const wallets = [

                        "main_wallet",

                        "second_wallet",

                        "testnet_wallet",

                        "backup_wallet",

                        "bybit_wallet",

                        "gate_wallet",

                        "binance_wallet",

                        "okx_wallet",

                        "phantom_wallet",

                        "solflare_wallet",

                        "kucoin_wallet",

                        "metamask_wallet",

                        "xrp_wallet",

                        "cosmos_wallet",

                        "canton_wallet",

                        "binance_exchange",

                        "okx_exchange",

                        "kucoin_exchange",

                        "bybit_exchange",

                        "gate_exchange"

                    ];


                    wallets.forEach(

                        wallet => {

                            if(

                                Boolean(

                                    data[

                                        wallet

                                    ]

                                )

                            ){

                                result.push({

                                    rules :

                                        "option",

                                    target :

                                        "wallet",

                                    type :

                                        wallet,

                                    value :

                                        "",

                                    unit :

                                        "",

                                    active :

                                        "TRUE"

                                });

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

                "campaign",

                "testnet",

                "retro",

                "daily",

                "bansos",

                "zealy",

                "galxe",

                "taskon",

                "layer3",

                "gleam",

                "giveaway",

                "nft"

            ],


            autoCloseForm :

                true,


            fields : [

                /* =========================================
                   CAMPAIGN
                ========================================= */

                {

                    name :

                        "campaign",

                    label :

                        "Campaign",

                    type :

                        "checkbox",

                    value :

                        true,

                    resultValue :

                        "campaign",

                    resultTarget :

                        "type"

                },


                /* =========================================
                   TESTNET
                ========================================= */

                {

                    name :

                        "testnet",

                    label :

                        "Testnet",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "testnet",

                    resultTarget :

                        "type"

                },


                /* =========================================
                   RETRO
                ========================================= */

                {

                    name :

                        "retro",

                    label :

                        "Retro",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "retro",

                    resultTarget :

                        "type"

                },


                /* =========================================
                   DAILY
                ========================================= */

                {

                    name :

                        "daily",

                    label :

                        "Daily",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "daily",

                    resultTarget :

                        "type"

                },


                /* =========================================
                   BANSOS
                ========================================= */

                {

                    name :

                        "bansos",

                    label :

                        "Bansos",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "bansos",

                    resultTarget :

                        "type"

                },


                /* =========================================
                   ZEALY
                ========================================= */

                {

                    name :

                        "zealy",

                    label :

                        "Zealy",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "zealy",

                    resultTarget :

                        "type"

                },


                /* =========================================
                   GALXE
                ========================================= */

                {

                    name :

                        "galxe",

                    label :

                        "Galxe",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "galxe",

                    resultTarget :

                        "type"

                },


                /* =========================================
                   TASKON
                ========================================= */

                {

                    name :

                        "taskon",

                    label :

                        "Taskon",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "taskon",

                    resultTarget :

                        "type"

                },


                /* =========================================
                   LAYER3
                ========================================= */

                {

                    name :

                        "layer3",

                    label :

                        "Layer3",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "layer3",

                    resultTarget :

                        "type"

                },


                /* =========================================
                   GLEAM
                ========================================= */

                {

                    name :

                        "gleam",

                    label :

                        "Gleam",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "gleam",

                    resultTarget :

                        "type"

                },


                /* =========================================
                   GIVEAWAY
                ========================================= */

                {

                    name :

                        "giveaway",

                    label :

                        "Giveaway",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "giveaway",

                    resultTarget :

                        "type"

                },


                /* =========================================
                   NFT
                ========================================= */

                {

                    name :

                        "nft",

                    label :

                        "NFT",

                    type :

                        "checkbox",

                    value :

                        false,

                    resultValue :

                        "nft",

                    resultTarget :

                        "type"

                }

            ],


            normalize :

                function(

                    data

                ){

                    const result = [];


                    /* =====================================
                       CAMPAIGN ALWAYS ACTIVE
                    ===================================== */

                    result.push({

                        rules :

                            "option",

                        target :

                            "type",

                        type :

                            "campaign",

                        value :

                            "",

                        unit :

                            "",

                        active :

                            "TRUE"

                    });


                    /* =====================================
                       OPTIONAL TYPES
                    ===================================== */

                    const types = [

                        "testnet",

                        "retro",

                        "daily",

                        "bansos",

                        "zealy",

                        "galxe",

                        "taskon",

                        "layer3",

                        "gleam",

                        "giveaway",

                        "nft"

                    ];


                    types.forEach(

                        type => {

                            if(

                                Boolean(

                                    data[

                                        type

                                    ]

                                )

                            ){

                                result.push({

                                    rules :

                                        "option",

                                    target :

                                        "type",

                                    type :

                                        type,

                                    value :

                                        "",

                                    unit :

                                        "",

                                    active :

                                        "TRUE"

                                });

                            }

                        }

                    );


                    return result;

                }

        }

    ]

};
