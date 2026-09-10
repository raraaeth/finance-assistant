/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Airdrop
   File         : airdrop.js
   Version      : 3.0.0

   Description :
   Airdrop Setting Definition

   Sections :
   - Reminder
   - Ended
   - Option Wallet
   - Option Type

   Principle :
   - Google Sheets menjadi sumber state.
   - Rule Ended yang sudah dibuat tidak dapat dibuat ulang.
   - Wallet yang sudah tersedia menjadi checked + disabled.
   - Type yang sudah tersedia menjadi checked + disabled.
   - Item yang sudah ada tidak dikirim ulang saat save.
   - Campaign selalu aktif, tetapi tidak dibuat duplikat.
===================================================== */


/* =====================================================
   IMPORT GLOBAL API
===================================================== */

import {

    API

} from "../../js/api.js";


/* =====================================================
   IMPORT GLOBAL WORKSPACE
===================================================== */

import {

    getWorkspaceConfig

} from "../../js/workspace.js";



/* =====================================================
   EXISTING RULE STATE
===================================================== */

let existingRules = {

    reminder :

        false,

    ended :

        false

};



/* =====================================================
   EXISTING OPTION STATE
===================================================== */

let existingOptions = {

    wallet :

        new Set(),

    type :

        new Set()

};



/* =====================================================
   AIRDROP RULE DATA CACHE
===================================================== */

let airdropRuleData = [];

let airdropStateLoaded = false;



/* =====================================================
   NORMALIZE VALUE
===================================================== */

function normalizeValue(

    value

){

    return String(

        value ?? ""

    )

        .trim()

        .toLowerCase();

}



/* =====================================================
   GET AIRDROP WORKSPACE
===================================================== */

function getAirdropWorkspace(){

    const workspaces =

        getWorkspaceConfig();


    if(

        !workspaces ||

        typeof workspaces !== "object"

    ){

        throw new Error(

            "Workspace configuration tidak ditemukan."

        );

    }


    const workspace =

        workspaces.airdrop;


    if(

        !workspace

    ){

        throw new Error(

            'Workspace "airdrop" tidak ditemukan.'

        );

    }


    if(

        !Array.isArray(

            workspace.sheets

        )

    ){

        throw new Error(

            'Konfigurasi sheet workspace "airdrop" tidak valid.'

        );

    }


    if(

        workspace.sheets.length < 2

    ){

        throw new Error(

            'Workspace "airdrop" tidak memiliki DATA sheet.'

        );

    }


    return workspace;

}



/* =====================================================
   GET AIRDROP SHEETS
===================================================== */

/*
 * Struktur:
 *
 * sheets[0] = airdrop
 * sheets[1] = airdrop_rules
 */

function getAirdropSheets(){

    const workspace =

        getAirdropWorkspace();


    return {

        rawSheet :

            workspace.sheets[0],


        dataSheet :

            workspace.sheets[1]

    };

}



/* =====================================================
   READ AIRDROP RULE DATA
===================================================== */

async function readAirdropRuleData(){

    const sheets =

        getAirdropSheets();


    console.log(

        "=========================================="

    );


    console.log(

        "AIRDROP SETTING: READ DATA"

    );


    console.log(

        "RAW Sheet:",

        sheets.rawSheet

    );


    console.log(

        "DATA Sheet:",

        sheets.dataSheet

    );


    console.log(

        "=========================================="

    );


    const result =

        await API.load(

            sheets.rawSheet,

            sheets.dataSheet

        );


    if(

        !result ||

        result.success !== true

    ){

        throw new Error(

            "Gagal membaca data workspace Airdrop."

        );

    }


    const data =

        Array.isArray(

            result.data

        )

            ?

        result.data

            :

        Array.isArray(

            API.data

        )

            ?

        API.data

            :

        [];


    airdropRuleData =

        data;


    console.log(

        "AIRDROP SETTING: DATA",

        airdropRuleData

    );


    console.log(

        "AIRDROP SETTING: DATA COUNT",

        airdropRuleData.length

    );


    return airdropRuleData;

}



/* =====================================================
   GET COLUMN VALUE
===================================================== */

function getColumnValue(

    row,

    column

){

    if(

        !row ||

        typeof row !== "object"

    ){

        return "";

    }


    const target =

        normalizeValue(

            column

        );


    const key =

        Object.keys(

            row

        ).find(

            currentKey =>

                normalizeValue(

                    currentKey

                ) === target

        );


    if(

        !key

    ){

        return "";

    }


    return normalizeValue(

        row[key]

    );

}



/* =====================================================
   READ EXISTING AIRDROP STATE
===================================================== */

function readExistingAirdropState(

    rows = airdropRuleData

){

    const data =

        Array.isArray(

            rows

        )

            ?

        rows

            :

        [];


    const rules = {

        reminder :

            false,

        ended :

            false

    };


    const options = {

        wallet :

            new Set(),

        type :

            new Set()

    };


    data.forEach(

        row => {

            const rule =

                getColumnValue(

                    row,

                    "rules"

                );


            if(

                !rule

            ){

                return;

            }


            /* =====================================
               REMINDER
            ===================================== */

            if(

                rule === "reminder"

            ){

                rules.reminder =

                    true;

                return;

            }


            /* =====================================
               ENDED
            ===================================== */

            if(

                rule === "ended"

            ){

                const active =

                    getColumnValue(

                        row,

                        "active"

                    );


                /*
                 * Ended dianggap sudah dibuat
                 * jika rule aktif.
                 *
                 * Jika row lama bernilai FALSE,
                 * checkbox tetap dapat digunakan.
                 */

                if(

                    active === "true"

                ){

                    rules.ended =

                        true;

                }


                return;

            }


            /* =====================================
               OPTION
            ===================================== */

            if(

                rule !== "option"

            ){

                return;

            }


            const target =

                getColumnValue(

                    row,

                    "target"

                );


            const type =

                getColumnValue(

                    row,

                    "type"

                );


            if(

                !target ||

                !type

            ){

                return;

            }


            /* =====================================
               WALLET
            ===================================== */

            if(

                target === "wallet"

            ){

                options.wallet.add(

                    type

                );

                return;

            }


            /* =====================================
               TYPE
            ===================================== */

            if(

                target === "type"

            ){

                options.type.add(

                    type

                );

            }

        }

    );


    return {

        rules :

            rules,

        options :

            options

    };

}



/* =====================================================
   REFRESH AIRDROP STATE
===================================================== */

async function refreshAirdropState(){

    try{

        const data =

            await readAirdropRuleData();


        const state =

            readExistingAirdropState(

                data

            );


        existingRules =

            state.rules;


        existingOptions =

            state.options;


        airdropStateLoaded =

            true;


        console.log(

            "=========================================="

        );


        console.log(

            "AIRDROP SETTING - EXISTING RULES:",

            existingRules

        );


        console.log(

            "AIRDROP SETTING - EXISTING WALLET:",

            Array.from(

                existingOptions.wallet

            )

        );


        console.log(

            "AIRDROP SETTING - EXISTING TYPE:",

            Array.from(

                existingOptions.type

            )

        );


        console.log(

            "=========================================="

        );


        return {

            rules :

                existingRules,

            options :

                existingOptions

        };

    }

    catch(error){

        console.error(

            "AirdropSetting: gagal membaca data.",

            error

        );


        existingRules = {

            reminder :

                false,

            ended :

                false

        };


        existingOptions = {

            wallet :

                new Set(),

            type :

                new Set()

        };


        airdropStateLoaded =

            false;


        throw error;

    }

}



/* =====================================================
   GET AIRDROP RULE STATE
===================================================== */

/*
 * Digunakan oleh Global Setting Controller.
 *
 * Hanya Ended yang merupakan rule checkbox.
 */

function getAirdropRuleState(){

    return {

        gunakanRuleEnded :

            existingRules.ended === true

    };

}



/* =====================================================
   APPLY ENDED RULE UI STATE
===================================================== */

function applyEndedRuleUIState(

    form,

    sectionElement

){

    if(

        !sectionElement

    ){

        return;

    }


    const wrapper =

        sectionElement.querySelector(

            '.global-setting-field[data-field="active"]'

        );


    if(

        !wrapper

    ){

        return;

    }


    const input =

        wrapper.querySelector(

            'input[type="checkbox"]'

        );


    if(

        existingRules.ended === true

    ){

        /*
         * Rule sudah dibuat.
         *
         * Jangan beri kesempatan membuat
         * row Ended kedua.
         */

        if(

            input

        ){

            input.checked =

                true;

            input.disabled =

                true;

        }


        wrapper.classList.add(

            "airdrop-rule-created"

        );


        /*
         * Jika controller belum mengganti
         * isi field, tetap tampilkan status.
         */

        const noteExists =

            wrapper.querySelector(

                ".airdrop-rule-created-note"

            );


        if(

            !noteExists

        ){

            const note =

                document.createElement(

                    "div"

                );


            note.className =

                "global-setting-field-note airdrop-rule-created-note";


            note.textContent =

                "✓ Rule Ended sudah dibuat";


            wrapper.appendChild(

                note

            );

        }

        return;

    }


    wrapper.classList.remove(

        "airdrop-rule-created"

    );


    if(

        input

    ){

        input.disabled =

            false;

    }

}



/* =====================================================
   CREATE OPTION FIELDS
===================================================== */

function createOptionFields(

    list

){

    return list.map(

        item => ({

            name :

                item.name,

            label :

                item.label,

            type :

                "checkbox",

            value :

                false,

            resultValue :

                item.name,

            resultTarget :

                item.target

        })

    );

}



/* =====================================================
   APPLY EXISTING OPTION STATE
===================================================== */

/*
 * Item yang sudah ada di airdrop_rules:
 *
 *   checked
 *   disabled
 *
 * Item baru:
 *
 *   unchecked
 *   enabled
 */

function applyExistingOptionState(

    form,

    target,

    fields

){

    if(

        !form

    ){

        return;

    }


    const existing =

        existingOptions[target] ||

        new Set();


    fields.forEach(

        fieldConfig => {

            const wrapper =

                form.querySelector(

                    `.global-setting-field[data-field="${fieldConfig.name}"]`

                );


            if(

                !wrapper

            ){

                return;

            }


            const input =

                wrapper.querySelector(

                    'input[type="checkbox"]'

                );


            if(

                !input

            ){

                return;

            }


            const alreadyExists =

                existing.has(

                    normalizeValue(

                        fieldConfig.name

                    )

                );


            if(

                alreadyExists

            ){

                /*
                 * Sudah ada di Sheet.
                 */

                input.checked =

                    true;


                input.disabled =

                    true;


                wrapper.classList.add(

                    "airdrop-option-created"

                );


                return;

            }


            /*
             * Belum ada.
             *
             * Tetap dapat dipilih.
             */

            input.checked =

                false;


            input.disabled =

                false;


            wrapper.classList.remove(

                "airdrop-option-created"

            );

        }

    );

}



/* =====================================================
   GET SELECTED NEW OPTIONS
===================================================== */

function getSelectedNewOptions(

    data,

    fields,

    target

){

    const result = [];

    const existing =

        existingOptions[target] ||

        new Set();


    fields.forEach(

        field => {

            if(

                data[field.name] !== true

            ){

                return;

            }


            /*
             * Jangan kirim ulang item
             * yang sudah ada di Sheet.
             */

            if(

                existing.has(

                    normalizeValue(

                        field.name

                    )

                )

            ){

                return;

            }


            result.push(

                field.name

            );

        }

    );


    return result;

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

        /*
         * Jika Reminder sudah pernah dibuat,
         * jangan izinkan membuat row Reminder kedua.
         */

        if(

            existingRules.reminder === true

        ){

            return null;

        }


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

    },
           onRender :

    async function(

        form,

        sectionElement

    ){

        if(

            !airdropStateLoaded

        ){

            await refreshAirdropState();

        }


        applyReminderRuleUIState(

            form,

            sectionElement

        );

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

                    /*
                     * Jika tidak dicentang,
                     * jangan membuat rule baru.
                     */

                    if(

                        data.active !== true

                    ){

                        return null;

                    }


                    /*
                     * Jika rule sudah ada,
                     * jangan buat row kedua.
                     */

                    if(

                        existingRules.ended === true

                    ){

                        return null;

                    }


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

                            "TRUE"

                    };

                },


            onRender :

                async function(

                    form,

                    sectionElement

                ){

                    if(

                        !airdropStateLoaded

                    ){

                        await refreshAirdropState();

                    }


                    applyEndedRuleUIState(

                        form,

                        sectionElement

                    );

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


            fields :

                createOptionFields([

                    {

                        name :

                            "main_wallet",

                        label :

                            "Main Wallet",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "second_wallet",

                        label :

                            "Second Wallet",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "testnet_wallet",

                        label :

                            "Testnet Wallet",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "backup_wallet",

                        label :

                            "Backup Wallet",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "bybit_wallet",

                        label :

                            "Bybit Wallet",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "gate_wallet",

                        label :

                            "Gate Wallet",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "binance_wallet",

                        label :

                            "Binance Wallet",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "okx_wallet",

                        label :

                            "OKX Wallet",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "phantom_wallet",

                        label :

                            "Phantom Wallet",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "solflare_wallet",

                        label :

                            "Solflare Wallet",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "kucoin_wallet",

                        label :

                            "KuCoin Wallet",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "metamask_wallet",

                        label :

                            "Metamask Wallet",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "xrp_wallet",

                        label :

                            "XRP Wallet",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "cosmos_wallet",

                        label :

                            "Cosmos Wallet",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "canton_wallet",

                        label :

                            "Canton Wallet",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "binance_exchange",

                        label :

                            "Binance Exchange",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "okx_exchange",

                        label :

                            "OKX Exchange",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "kucoin_exchange",

                        label :

                            "KuCoin Exchange",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "bybit_exchange",

                        label :

                            "Bybit Exchange",

                        target :

                            "wallet"

                    },

                    {

                        name :

                            "gate_exchange",

                        label :

                            "Gate Exchange",

                        target :

                            "wallet"

                    }

                ]),


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

                                data[wallet] !== true

                            ){

                                return;

                            }


                            /*
                             * Jangan append wallet
                             * yang sudah ada.
                             */

                            if(

                                existingOptions.wallet.has(

                                    normalizeValue(

                                        wallet

                                    )

                                )

                            ){

                                return;

                            }


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

                    );


                    return result;

                },


            onRender :

                async function(

                    form

                ){

                    if(

                        !airdropStateLoaded

                    ){

                        await refreshAirdropState();

                    }


                    applyExistingOptionState(

                        form,

                        "wallet",

                        this.fields

                    );

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

                "Pilih type Airdrop yang tersedia untuk digunakan pada input.",


            note :

                "Type Campaign selalu ada dan akan ditambahkan secara otomatis.",


            addLabel :

                "＋ Atur Type",


            formAddLabel :

                "＋ Simpan Type",


            deleteLabel :

                "Hapus",


            uniqueFields : [

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


            fields :

                createOptionFields([

                    {

                        name :

                            "testnet",

                        label :

                            "Testnet",

                        target :

                            "type"

                    },

                    {

                        name :

                            "retro",

                        label :

                            "Retro",

                        target :

                            "type"

                    },

                    {

                        name :

                            "daily",

                        label :

                            "Daily",

                        target :

                            "type"

                    },

                    {

                        name :

                            "bansos",

                        label :

                            "Bansos",

                        target :

                            "type"

                    },

                    {

                        name :

                            "zealy",

                        label :

                            "Zealy",

                        target :

                            "type"

                    },

                    {

                        name :

                            "galxe",

                        label :

                            "Galxe",

                        target :

                            "type"

                    },

                    {

                        name :

                            "taskon",

                        label :

                            "Taskon",

                        target :

                            "type"

                    },

                    {

                        name :

                            "layer3",

                        label :

                            "Layer3",

                        target :

                            "type"

                    },

                    {

                        name :

                            "gleam",

                        label :

                            "Gleam",

                        target :

                            "type"

                    },

                    {

                        name :

                            "giveaway",

                        label :

                            "Giveaway",

                        target :

                            "type"

                    },

                    {

                        name :

                            "nft",

                        label :

                            "NFT",

                        target :

                            "type"

                    }

                ]),


            normalize :

                function(

                    data

                ){

                    const result = [];


                    /* =====================================
                       CAMPAIGN ALWAYS ACTIVE
                    ===================================== */

                    /*
                     * Campaign tidak memiliki checkbox.
                     *
                     * Hanya buat jika belum ada.
                     */

                    if(

                        !existingOptions.type.has(

                            "campaign"

                        )

                    ){

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

                    }


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

                                data[type] !== true

                            ){

                                return;

                            }


                            /*
                             * Jangan append type
                             * yang sudah ada.
                             */

                            if(

                                existingOptions.type.has(

                                    normalizeValue(

                                        type

                                    )

                                )

                            ){

                                return;

                            }


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

                    );


                    return result;

                },


            onRender :

                async function(

                    form

                ){

                    if(

                        !airdropStateLoaded

                    ){

                        await refreshAirdropState();

                    }


                    applyExistingOptionState(

                        form,

                        "type",

                        this.fields

                    );

                }

        }

    ],



    /* =================================================
       PERSISTENT RULE STATE
    ================================================= */

    /*
     * Ended adalah satu-satunya rule checkbox
     * pada Airdrop yang dapat menjadi persistent
     * rule state.
     */

    ruleStateFields : {

        ended : {

            field :

                "active",

            label :

                "Rule Ended"

        }

    },



    /* =================================================
       GET RULE STATE
    ================================================= */

    async getRuleState(){

        try{

            await refreshAirdropState();

        }

        catch(error){

            console.error(

                "AirdropSetting.getRuleState:",

                error

            );

        }


        return {

            ended :

                existingRules.ended === true

        };

    }

};
