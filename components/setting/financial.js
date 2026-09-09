/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Financial
   File         : financial.js
   Version      : 4.3.0

   Description :
   Financial Setting

   Structure :

   1. Penentuan Rule
   2. Activity Pemasukan
   3. Activity Pengeluaran

   Rule :

   Rule Pemasukan wajib digunakan
   Rule Pengeluaran wajib digunakan
   Rule Hutang opsional
   Rule Tabungan opsional

   IMPORTANT :

   Existing rule dibaca langsung dari
   sheet financial_activity.

   Jika rule sudah ada :
       - checkbox tidak dapat dipilih lagi
       - ditampilkan sebagai
         "✓ Rule ... sudah dibuat"

   Jika seluruh rule sudah ada :
       - input Penentuan Rule tidak dapat
         digunakan lagi.

   Activity tetap dapat dikonfigurasi.

   financial_rules hanya digunakan sebagai
   configuration/state frontend.

   financial_rules TIDAK menjadi payload
   result ke backend.
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {
    API
} from "../../js/api.js";

import {
    getWorkspaceConfig
} from "../../js/workspace.js";


/* =====================================================
   FINANCIAL RULE CONSTANT
===================================================== */

const FINANCIAL_RULES = {

    rule_pemasukan : {

        field :
            "gunakanRulePemasukan",

        label :
            "Rule Pemasukan",

        required :
            true

    },

    rule_pengeluaran : {

        field :
            "gunakanRulePengeluaran",

        label :
            "Rule Pengeluaran",

        required :
            true

    },

    rule_hutang : {

        field :
            "gunakanRuleHutang",

        label :
            "Rule Hutang",

        required :
            false

    },

    rule_tabungan : {

        field :
            "gunakanRuleTabungan",

        label :
            "Rule Tabungan",

        required :
            false

    }

};


/* =====================================================
   DEFAULT RULE STATE
===================================================== */

const DEFAULT_RULE_STATE = {

    gunakanRulePemasukan :
        true,

    gunakanRulePengeluaran :
        true,

    gunakanRuleHutang :
        false,

    gunakanRuleTabungan :
        false

};


/* =====================================================
   RUNTIME RULE STATE
===================================================== */

/*
   State ini berasal dari Google Sheet.

   Bukan dari DOM.
*/

let financialRuleState = {

    ...DEFAULT_RULE_STATE

};


/*
   Menyimpan rule yang benar-benar
   sudah ada di financial_activity.
*/

let existingFinancialRules = {

    rule_pemasukan :
        false,

    rule_pengeluaran :
        false,

    rule_hutang :
        false,

    rule_tabungan :
        false

};


/* =====================================================
   ACTIVITY MASTER
===================================================== */

const ACTIVITY = {


    /* =================================================
       PEMASUKAN
    ================================================= */

    pemasukan : [

        {
            name :

                "gaji",

            label :

                "Gaji"
        },


        {
            name :

                "penghasilan_lain",

            label :

                "Penghasilan Lain"
        },


        {
            name :

                "ceperan",

            label :

                "Ceperan"
        },


        {
            name :

                "pemberian",

            label :

                "Pemberian"
        },


        {
            name :

                "hutang_piutang",

            label :

                "Hutang / Piutang",

            rule :

                "hutang"
        },


        {
            name :

                "dana_darurat",

            label :

                "Dana Darurat",

            rule :

                "tabungan"
        },


        {
            name :

                "tabungan_kaleng",

            label :

                "Tabungan Kaleng",

            rule :

                "tabungan"
        }

    ],


    /* =================================================
       PENGELUARAN
    ================================================= */

    pengeluaran : [

        {
            name :

                "belanja_harian",

            label :

                "Belanja Harian"
        },


        {
            name :

                "belanja_bulanan",

            label :

                "Belanja Bulanan"
        },


        {
            name :

                "kebutuhan_anak",

            label :

                "Kebutuhan Anak"
        },


        {
            name :

                "tagihan",

            label :

                "Tagihan"
        },


        {
            name :

                "belanja_online",

            label :

                "Belanja Online"
        },


        {
            name :

                "biaya_perbaikan",

            label :

                "Biaya Perbaikan"
        },


        {
            name :

                "makan_diluar",

            label :

                "Makan di Luar"
        },


        {
            name :

                "refreshing",

            label :

                "Refreshing"
        },


        {
            name :

                "biaya_tahunan",

            label :

                "Biaya Tahunan"
        },


        {
            name :

                "pengeluaran_lain",

            label :

                "Pengeluaran Lain"
        },


        {
            name :

                "beli_rokok",

            label :

                "Beli Rokok"
        },


        {
            name :

                "beli_bensin",

            label :

                "Beli Bensin"
        },


        {
            name :

                "beli_kopi",

            label :

                "Beli Kopi"
        },


        {
            name :

                "iuran",

            label :

                "Iuran"
        },


        {
            name :

                "cicilan",

            label :

                "Cicilan"
        },


        {
            name :

                "sedekah",

            label :

                "Sedekah"
        },


        {
            name :

                "hutang_piutang",

            label :

                "Hutang / Piutang",

            rule :

                "hutang"
        },


        {
            name :

                "dana_darurat",

            label :

                "Dana Darurat",

            rule :

                "tabungan"
        },


        {
            name :

                "tabungan_kaleng",

            label :

                "Tabungan Kaleng",

            rule :

                "tabungan"
        }

    ]

};


/* =====================================================
   GET FINANCIAL WORKSPACE
===================================================== */

function getFinancialWorkspace(){

    const workspaces =
        getWorkspaceConfig();


    if(
        !workspaces
        ||
        typeof workspaces !==
            "object"
    ){

        throw new Error(
            "Workspace configuration tidak ditemukan."
        );

    }


    const workspace =
        workspaces.financial;


    if(
        !workspace
    ){

        throw new Error(
            'Workspace "financial" tidak ditemukan.'
        );

    }


    if(
        !Array.isArray(
            workspace.sheets
        )
    ){

        throw new Error(
            'Konfigurasi sheet workspace "financial" tidak valid.'
        );

    }


    if(
        workspace.sheets.length <
            2
    ){

        throw new Error(
            'Workspace "financial" tidak memiliki DATA sheet.'
        );

    }


    return workspace;

}


/* =====================================================
   GET FINANCIAL SHEETS
===================================================== */

function getFinancialSheets(){

    const workspace =
        getFinancialWorkspace();


    return {

        rawSheet :
            workspace.sheets[0],

        dataSheet :
            workspace.sheets[1]

    };

}


/* =====================================================
   NORMALIZE VALUE
===================================================== */

function normalizeValue(
    value
){

    return String(
        value ??
        ""
    )
    .trim()
    .toLowerCase();

}


/* =====================================================
   GET COLUMN VALUE
===================================================== */

function getColumnValue(
    row,
    column
){

    if(
        !row
        ||
        typeof row !==
            "object"
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
        )
        .find(
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
   READ FINANCIAL ACTIVITY
===================================================== */

async function readFinancialActivity(){

    const sheets =
        getFinancialSheets();


    const result =
        await API.load(
            sheets.rawSheet,
            sheets.dataSheet
        );


    if(
        !result
        ||
        result.success !== true
    ){

        throw new Error(
            "Gagal membaca data workspace Financial."
        );

    }


    const data =
        Array.isArray(
            result.data
        )
            ?

        result.data

            :

        (
            Array.isArray(
                API.data
            )

                ?

            API.data

                :

            []
        );


    return data;

}


/* =====================================================
   READ EXISTING FINANCIAL RULES
===================================================== */

async function readExistingFinancialRules(){

    const rows =
        await readFinancialActivity();


    const result = {

        rule_pemasukan :
            false,

        rule_pengeluaran :
            false,

        rule_hutang :
            false,

        rule_tabungan :
            false

    };


    if(
        !Array.isArray(
            rows
        )
    ){

        return result;

    }


    rows.forEach(
        row => {

            const rule =
                getColumnValue(
                    row,
                    "rules"
                );


            if(
                Object.prototype.hasOwnProperty.call(
                    result,
                    rule
                )
            ){

                result[rule] =
                    true;

            }

        }
    );


    return result;

}


/* =====================================================
   REFRESH RULE STATE
===================================================== */

async function refreshFinancialRuleState(){

    const existing =
        await readExistingFinancialRules();


    existingFinancialRules =
        {
            ...existing
        };


    /*
       Existing rule selalu dianggap aktif.

       Rule wajib tetap true.
       Rule opsional true jika sudah
       pernah dibuat.
    */

    financialRuleState = {

        gunakanRulePemasukan :

            existing.rule_pemasukan
                ||

            true,


        gunakanRulePengeluaran :

            existing.rule_pengeluaran
                ||

            true,


        gunakanRuleHutang :

            existing.rule_hutang
                ||

            false,


        gunakanRuleTabungan :

            existing.rule_tabungan
                ||

            false

    };


    return financialRuleState;

}


/* =====================================================
   CHECK ALL RULE CREATED
===================================================== */

function allFinancialRulesCreated(){

    return (

        existingFinancialRules.rule_pemasukan
        ===
        true

        &&

        existingFinancialRules.rule_pengeluaran
        ===
        true

        &&

        existingFinancialRules.rule_hutang
        ===
        true

        &&

        existingFinancialRules.rule_tabungan
        ===
        true

    );

}


/* =====================================================
   CREATE ACTIVITY FIELDS
===================================================== */

function createActivityFields(
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

            resultValue :
                item.name,

            activityRule :
                item.rule ??
                ""

        })

    );

}


/* =====================================================
   NORMALIZE ACTIVITY
===================================================== */

function normalizeActivity(

    data,

    fields,

    rules,

    direction

){

    /*
       Baca state dari Sheet/runtime,
       bukan dari result DOM.
    */

    const ruleState =
        getFinancialRuleState();


    const activity = [];


    /* =============================================
       FILTER ACTIVITY
    ============================================= */

    fields.forEach(

        field => {

            /*
               Checkbox tidak aktif.
            */

            if(
                data[field.name] !==
                    true
            ){

                return;

            }


            const activityRule =
                field.activityRule ??
                "";


            /* =====================================
               HUTANG
            ===================================== */

            if(

                activityRule ===
                    "hutang"

                &&

                ruleState.gunakanRuleHutang
                    !==
                    true

            ){

                return;

            }


            /* =====================================
               TABUNGAN
            ===================================== */

            if(

                activityRule ===
                    "tabungan"

                &&

                ruleState.gunakanRuleTabungan
                    !==
                    true

            ){

                return;

            }


            /*
               Activity valid.
            */

            activity.push(
                field.name
            );

        }

    );


    /* =============================================
       TYPE
    ============================================= */

    const types = [];


    /* =============================================
       PEMASUKAN
    ============================================= */

    if(
        direction ===
            "pemasukan"
    ){

        types.push(
            "masuk"
        );


        if(
            ruleState.gunakanRuleHutang
                ===
                true
        ){

            types.push(
                "hutang"
            );

        }


        if(
            ruleState.gunakanRuleTabungan
                ===
                true
        ){

            types.push(
                "tarik"
            );

        }

    }


    /* =============================================
       PENGELUARAN
    ============================================= */

    if(
        direction ===
            "pengeluaran"
    ){

        types.push(
            "keluar"
        );


        if(
            ruleState.gunakanRuleHutang
                ===
                true
        ){

            types.push(
                "bayar"
            );

        }


        if(
            ruleState.gunakanRuleTabungan
                ===
                true
        ){

            types.push(
                "nabung"
            );

        }

    }


    /* =============================================
       RESULT
    ============================================= */

    const result = {

        rules :
            rules,

        type :
            types.join(","),

        activity :
            activity.join(",")

    };


    /* =============================================
       DISPLAY STATE
    ============================================= */

    result.__display = {};


    fields.forEach(

        field => {

            result.__display[
                field.name
            ] =

                activity.includes(
                    field.name
                );

        }

    );


    return result;

}


/* =====================================================
   NORMALIZE RULE
===================================================== */

function normalizeRule(
    data
){

    const result = {

        gunakanRulePemasukan :

            Boolean(
                data.gunakanRulePemasukan
            ),

        gunakanRulePengeluaran :

            Boolean(
                data.gunakanRulePengeluaran
            ),

        gunakanRuleHutang :

            Boolean(
                data.gunakanRuleHutang
            ),

        gunakanRuleTabungan :

            Boolean(
                data.gunakanRuleTabungan
            )

    };


    /*
       Existing rule tidak boleh
       dimatikan lagi.
    */

    if(
        existingFinancialRules.rule_pemasukan
    ){

        result.gunakanRulePemasukan =
            true;

    }


    if(
        existingFinancialRules.rule_pengeluaran
    ){

        result.gunakanRulePengeluaran =
            true;

    }


    if(
        existingFinancialRules.rule_hutang
    ){

        result.gunakanRuleHutang =
            true;

    }


    if(
        existingFinancialRules.rule_tabungan
    ){

        result.gunakanRuleTabungan =
            true;

    }


    /*
       Simpan ke runtime state.
    */

    financialRuleState = {

        ...result

    };


    return result;

}


/* =====================================================
   GET FINANCIAL RULE STATE
===================================================== */

function getFinancialRuleState(){

    return {

        ...financialRuleState

    };

}


/* =====================================================
   APPLY RULE UI STATE
===================================================== */

function applyFinancialRuleUI(
    form
){

    if(
        !form
    ){

        return;

    }


    const rules =
        Object.keys(
            FINANCIAL_RULES
        );


    rules.forEach(

        ruleName => {

            const config =
                FINANCIAL_RULES[
                    ruleName
                ];


            const created =
                existingFinancialRules[
                    ruleName
                ]
                ===
                true;


            const wrapper =
                form.querySelector(
                    `[data-field="${config.field}"]`
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
                created
            ){

                /*
                   Rule sudah ada.

                   Jangan boleh diubah.
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
                    "is-used"
                );

                wrapper.classList.add(
                    "rule-created"
                );


                /*
                   Ganti tampilan checkbox
                   dengan status sederhana.
                */

                const label =
                    config.label;


                const status =
                    document.createElement(
                        "div"
                    );


                status.className =
                    "financial-rule-created";


                status.textContent =
                    `✓ ${label} sudah dibuat`;


                /*
                   Hindari membuat status
                   berkali-kali ketika render.
                */

                const oldStatus =
                    wrapper.querySelector(
                        ".financial-rule-created"
                    );


                if(
                    !oldStatus
                ){

                    wrapper.appendChild(
                        status
                    );

                }

            }

        }
    );


    /*
       Jika seluruh rule sudah dibuat,
       tutup akses input Penentuan Rule.
    */

    if(
        allFinancialRulesCreated()
    ){

        disableFinancialRuleSection(
            form
        );

    }

}


/* =====================================================
   DISABLE FINANCIAL RULE SECTION
===================================================== */

function disableFinancialRuleSection(
    form
){

    if(
        !form
    ){

        return;

    }


    /*
       Disable seluruh checkbox.
    */

    const inputs =
        form.querySelectorAll(
            'input[type="checkbox"]'
        );


    inputs.forEach(
        input => {

            input.checked =
                true;

            input.disabled =
                true;

        }
    );


    /*
       Disable tombol simpan.
    */

    const buttons =
        form.querySelectorAll(
            "button"
        );


    buttons.forEach(
        button => {

            const text =
                String(
                    button.textContent ||
                    ""
                )
                .trim()
                .toLowerCase();


            if(
                text.includes(
                    "simpan rule"
                )
                ||
                text.includes(
                    "tambah rule"
                )
                ||
                text.includes(
                    "tambahkan"
                )
            ){

                button.disabled =
                    true;

                button.classList.add(
                    "disabled"
                );

            }

        }
    );


    /*
       Tandai section.
    */

    form.classList.add(
        "all-rules-created"
    );

}


/* =====================================================
   APPLY ACTIVITY RULE CONTROL
===================================================== */

function applyActivityRuleControl(

    form,

    ruleData

){

    if(
        !form
        ||
        !ruleData
    ){

        return;

    }


    /* =============================================
       RULE STATUS
    ============================================= */

    const ruleHutang =

        Boolean(

            ruleData.gunakanRuleHutang

        );


    const ruleTabungan =

        Boolean(

            ruleData.gunakanRuleTabungan

        );


    /* =============================================
       HUTANG
    ============================================= */

    const hutangFields =

        form.querySelectorAll(

            '[data-activity-rule="hutang"]'

        );


    hutangFields.forEach(

        field => {

            const input =

                field.querySelector(

                    'input[type="checkbox"]'

                );


            if(
                !input
            ){

                return;

            }


            input.disabled =

                !ruleHutang;


            if(
                !ruleHutang
            ){

                input.checked =

                    false;

            }


            field.classList.toggle(

                "disabled",

                !ruleHutang

            );

        }

    );


    /* =============================================
       TABUNGAN
    ============================================= */

    const tabunganFields =

        form.querySelectorAll(

            '[data-activity-rule="tabungan"]'

        );


    tabunganFields.forEach(

        field => {

            const input =

                field.querySelector(

                    'input[type="checkbox"]'

                );


            if(
                !input
            ){

                return;

            }


            input.disabled =

                !ruleTabungan;


            if(
                !ruleTabungan
            ){

                input.checked =

                    false;

            }


            field.classList.toggle(

                "disabled",

                !ruleTabungan

            );

        }

    );

}


/* =====================================================
   FINANCIAL SETTING
===================================================== */

export const FinancialSetting = {


    /* =================================================
       HEADER
    ================================================= */

    title :

        "Pengaturan Financial",


    subtitle :

        "Atur rule dan activity financial",


    /* =================================================
       RULE STATE

       Controller global akan membaca state ini
       sebelum render.
    ================================================= */

    ruleStateFields : {

        rule_pemasukan : {

            field :
                "gunakanRulePemasukan",

            label :
                "Rule Pemasukan"

        },

        rule_pengeluaran : {

            field :
                "gunakanRulePengeluaran",

            label :
                "Rule Pengeluaran"

        },

        rule_hutang : {

            field :
                "gunakanRuleHutang",

            label :
                "Rule Hutang"

        },

        rule_tabungan : {

            field :
                "gunakanRuleTabungan",

            label :
                "Rule Tabungan"

        }

    },


    /* =================================================
       READ RULE STATE

       Sumber :
           Google Sheet
    ================================================= */

    getRuleState :

        async function(){

            try{

                return await
                    refreshFinancialRuleState();

            }
            catch(error){

                console.error(

                    "Financial Rule Read Error:",

                    error

                );


                /*
                   Fallback aman.
                */

                return {

                    ...financialRuleState

                };

            }

        },


    /* =================================================
       SECTIONS
    ================================================= */

    sections : [


        /* =============================================
           1. PENENTUAN RULE
        ============================================= */

        {

            id :

                "financial_rules",


            title :

                "⚙️ Penentuan Rule",


            description :

                "Tentukan rule Financial yang akan digunakan.",


            persist :

                false,


            addLabel :

                "＋ Tambah Rule",


            formAddLabel :

                "＋ Simpan Rule",


            deleteLabel :

                "Hapus",


            autoCloseForm :

                true,


            uniqueFields : [

                "gunakanRulePemasukan",

                "gunakanRulePengeluaran",

                "gunakanRuleHutang",

                "gunakanRuleTabungan"

            ],


            fields : [

                {

                    name :

                        "gunakanRulePemasukan",

                    label :

                        "Gunakan Rule Pemasukan",

                    type :

                        "checkbox",

                    value :

                        true,

                    required :

                        false

                },


                {

                    name :

                        "gunakanRulePengeluaran",

                    label :

                        "Gunakan Rule Pengeluaran",

                    type :

                        "checkbox",

                    value :

                        true,

                    required :

                        false

                },


                {

                    name :

                        "gunakanRuleHutang",

                    label :

                        "Gunakan Rule Hutang",

                    type :

                        "checkbox",

                    value :

                        false,

                    required :

                        false,

                    note :

                        "Opsional. Aktifkan jika Financial menggunakan transaksi hutang dan pembayaran hutang."

                },


                {

                    name :

                        "gunakanRuleTabungan",

                    label :

                        "Gunakan Rule Tabungan",

                    type :

                        "checkbox",

                    value :

                        false,

                    required :

                        false,

                    note :

                        "Opsional. Aktifkan jika Financial menggunakan transaksi tabungan dan penarikan tabungan."

                }

            ],


            normalize :

                normalizeRule,


            onRender :

                function(
                    form
                ){

                    applyFinancialRuleUI(
                        form
                    );

                }

        },


        /* =============================================
           2. ACTIVITY PEMASUKAN
        ============================================= */

        {

            id :

                "financial_activity_pemasukan",


            title :

                "💰 Activity Pemasukan",


            description :

                "Pilih activity yang tersedia untuk Rule Pemasukan.",


            addLabel :

                "＋ Tambah Activity",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            autoCloseForm :

                true,


            uniqueFields : [

                "activity"

            ],


            fields :

                createActivityFields(

                    ACTIVITY.pemasukan

                ),


            normalize :

                function(
                    data
                ){

                    return normalizeActivity(

                        data,

                        this.fields,

                        "rule_pemasukan",

                        "pemasukan"

                    );

                },


            onRender :

                function(
                    form
                ){

                    applyActivityRuleControl(

                        form,

                        getFinancialRuleState()

                    );

                }

        },


        /* =============================================
           3. ACTIVITY PENGELUARAN
        ============================================= */

        {

            id :

                "financial_activity_pengeluaran",


            title :

                "💸 Activity Pengeluaran",


            description :

                "Pilih activity yang tersedia untuk Rule Pengeluaran.",


            addLabel :

                "＋ Tambah Activity",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            autoCloseForm :

                true,


            uniqueFields : [

                "activity"

            ],


            fields :

                createActivityFields(

                    ACTIVITY.pengeluaran

                ),


            normalize :

                function(
                    data
                ){

                    return normalizeActivity(

                        data,

                        this.fields,

                        "rule_pengeluaran",

                        "pengeluaran"

                    );

                },


            onRender :

                function(
                    form
                ){

                    applyActivityRuleControl(

                        form,

                        getFinancialRuleState()

                    );

                }

        }

    ]

};
