/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Financial
   File         : financial.js
   Version      : 4.3.0

   Description :
   Financial Setting

   Behavior :
   - Rule membaca state dari financial_activity
   - Rule yang sudah dibuat tidak dapat dipilih lagi
   - Activity yang sudah tersimpan tidak dapat dipilih lagi
   - Activity yang belum tersimpan tetap dapat dipilih
   - Rule Hutang / Tabungan mengikuti state rule
   - Tidak menghapus rule yang sudah pernah dibuat
   - Activity dapat diubah dengan memilih activity baru
   - Tidak mengubah Normal Input
   - Tidak mengubah Edit Input

   Financial Activity Sheet :

       id
       rules
       type
       activity

   Fixed Rule :

       rule_pemasukan
       rule_pengeluaran
       rule_hutang
       rule_tabungan
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
   FINANCIAL RULE IDENTITY
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
   INTERNAL STATE
===================================================== */

let financialActivityData = [];

let existingRules = {

    rule_pemasukan :
        false,

    rule_pengeluaran :
        false,

    rule_hutang :
        false,

    rule_tabungan :
        false

};


/*
   State yang sedang dipilih pada UI.

   Rule yang sudah ada di Sheet
   selalu dianggap aktif.

   Rule baru mengikuti checkbox UI.
*/

let selectedRuleState = {

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
        )
        .find(
            currentKey =>
                normalizeValue(
                    currentKey
                ) ===
                target
        );


    if(
        !key
    ){

        return "";

    }


    return String(
        row[key] ??
        ""
    )
    .trim();

}


/* =====================================================
   GET FINANCIAL WORKSPACE
===================================================== */

function getFinancialWorkspace(){

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
        workspace.sheets.length < 2
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
        !result ||
        result.success !== true
    ){

        throw new Error(
            "Gagal membaca data Financial Activity."
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


    financialActivityData =
        data;


    return financialActivityData;

}


/* =====================================================
   GET EXISTING RULES
===================================================== */

function detectExistingRules(
    rows
){

    const state = {

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

        return state;

    }


    rows.forEach(
        row => {

            const rules =
                normalizeValue(
                    getColumnValue(
                        row,
                        "rules"
                    )
                );


            if(
                Object.prototype.hasOwnProperty.call(
                    state,
                    rules
                )
            ){

                state[rules] =
                    true;

            }

        }
    );


    return state;

}


/* =====================================================
   GET EXISTING ACTIVITY
===================================================== */

function getExistingActivities(
    rule
){

    const result =
        new Set();


    if(
        !Array.isArray(
            financialActivityData
        )
    ){

        return result;

    }


    financialActivityData.forEach(
        row => {

            const rowRule =
                normalizeValue(
                    getColumnValue(
                        row,
                        "rules"
                    )
                );


            if(
                rowRule !==
                normalizeValue(
                    rule
                )
            ){

                return;

            }


            const activity =
                getColumnValue(
                    row,
                    "activity"
                );


            if(
                !activity
            ){

                return;

            }


            activity
                .split(",")
                .map(
                    item =>
                        normalizeValue(
                            item
                        )
                )
                .filter(
                    Boolean
                )
                .forEach(
                    item =>
                        result.add(
                            item
                        )
                );

        }
    );


    return result;

}


/* =====================================================
   REFRESH FINANCIAL STATE
===================================================== */

async function refreshFinancialState(){

    try{

        const rows =
            await readFinancialActivity();


        existingRules =
            detectExistingRules(
                rows
            );


        /*
           Rule yang sudah ada tidak pernah
           boleh kembali menjadi false.
        */

        selectedRuleState =
            {

                gunakanRulePemasukan :

                    existingRules.rule_pemasukan
                    ||
                    selectedRuleState.gunakanRulePemasukan
                    ||
                    true,


                gunakanRulePengeluaran :

                    existingRules.rule_pengeluaran
                    ||
                    selectedRuleState.gunakanRulePengeluaran
                    ||
                    true,


                gunakanRuleHutang :

                    existingRules.rule_hutang
                    ||
                    selectedRuleState.gunakanRuleHutang,


                gunakanRuleTabungan :

                    existingRules.rule_tabungan
                    ||
                    selectedRuleState.gunakanRuleTabungan

            };


        return {

            rows :
                rows,

            rules :
                existingRules

        };

    }
    catch(error){

        console.error(
            "[Financial] Gagal membaca Financial Activity:",
            error
        );


        return {

            rows :
                financialActivityData,

            rules :
                existingRules

        };

    }

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
                item.rule ?? ""

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

    const ruleState =
        getFinancialRuleState();


    const activity = [];


    /* =============================================
       FILTER ACTIVITY
    ============================================= */

    fields.forEach(
        field => {

            if(
                data[field.name] !== true
            ){

                return;

            }


            const activityRule =
                field.activityRule ?? "";


            /* =====================================
               HUTANG
            ===================================== */

            if(
                activityRule === "hutang"
                &&
                ruleState.gunakanRuleHutang !== true
            ){

                return;

            }


            /* =====================================
               TABUNGAN
            ===================================== */

            if(
                activityRule === "tabungan"
                &&
                ruleState.gunakanRuleTabungan !== true
            ){

                return;

            }


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
        direction === "pemasukan"
    ){

        types.push(
            "masuk"
        );


        if(
            ruleState.gunakanRuleHutang === true
        ){

            types.push(
                "hutang"
            );

        }


        if(
            ruleState.gunakanRuleTabungan === true
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
        direction === "pengeluaran"
    ){

        types.push(
            "keluar"
        );


        if(
            ruleState.gunakanRuleHutang === true
        ){

            types.push(
                "bayar"
            );

        }


        if(
            ruleState.gunakanRuleTabungan === true
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

    const pemasukan =
        existingRules.rule_pemasukan
        ||
        Boolean(
            data.gunakanRulePemasukan
        )
        ||
        true;


    const pengeluaran =
        existingRules.rule_pengeluaran
        ||
        Boolean(
            data.gunakanRulePengeluaran
        )
        ||
        true;


    const hutang =
        existingRules.rule_hutang
        ||
        Boolean(
            data.gunakanRuleHutang
        );


    const tabungan =
        existingRules.rule_tabungan
        ||
        Boolean(
            data.gunakanRuleTabungan
        );


    selectedRuleState = {

        gunakanRulePemasukan :
            pemasukan,

        gunakanRulePengeluaran :
            pengeluaran,

        gunakanRuleHutang :
            hutang,

        gunakanRuleTabungan :
            tabungan

    };


    return {

        gunakanRulePemasukan :
            pemasukan,

        gunakanRulePengeluaran :
            pengeluaran,

        gunakanRuleHutang :
            hutang,

        gunakanRuleTabungan :
            tabungan

    };

}


/* =====================================================
   GET FINANCIAL RULE STATE
===================================================== */

function getFinancialRuleState(){

    return {

        gunakanRulePemasukan :

            existingRules.rule_pemasukan
            ||
            selectedRuleState.gunakanRulePemasukan
            ||
            true,


        gunakanRulePengeluaran :

            existingRules.rule_pengeluaran
            ||
            selectedRuleState.gunakanRulePengeluaran
            ||
            true,


        gunakanRuleHutang :

            existingRules.rule_hutang
            ||
            selectedRuleState.gunakanRuleHutang,


        gunakanRuleTabungan :

            existingRules.rule_tabungan
            ||
            selectedRuleState.gunakanRuleTabungan

    };

}


/* =====================================================
   FIND ACTIVITY INPUT
===================================================== */

function findActivityInput(
    form,
    fieldName
){

    if(
        !form
    ){

        return null;

    }


    let input =
        form.querySelector(
            `input[name="${fieldName}"]`
        );


    if(
        input
    ){

        return input;

    }


    const inputs =
        form.querySelectorAll(
            'input[type="checkbox"]'
        );


    for(
        const currentInput of inputs
    ){

        if(
            currentInput.value ===
            fieldName
        ){

            return currentInput;

        }

    }


    return null;

}


/* =====================================================
   GET ACTIVITY FIELD WRAPPER
===================================================== */

function findActivityWrapper(
    input
){

    if(
        !input
    ){

        return null;

    }


    return (
        input.closest(
            "[data-activity-rule]"
        )
        ||
        input.parentElement
    );

}


/* =====================================================
   APPLY EXISTING ACTIVITY STATE
===================================================== */

/*
   Activity yang sudah tersimpan di Sheet :

       checked
       disabled

   Activity yang belum tersimpan :

       unchecked
       enabled

   Ini berlaku per rule.
*/

function applyExistingActivityState(
    form,
    direction
){

    if(
        !form
    ){

        return;

    }


    const rule =
        direction === "pemasukan"

            ?

        "rule_pemasukan"

            :

        "rule_pengeluaran";


    const existingActivities =
        getExistingActivities(
            rule
        );


    const fields =
        direction === "pemasukan"

            ?

        ACTIVITY.pemasukan

            :

        ACTIVITY.pengeluaran;


    fields.forEach(
        item => {

            const input =
                findActivityInput(
                    form,
                    item.name
                );


            if(
                !input
            ){

                return;

            }


            const wrapper =
                findActivityWrapper(
                    input
                );


            const activityName =
                normalizeValue(
                    item.name
                );


            const alreadyExists =
                existingActivities.has(
                    activityName
                );


            /*
               Activity yang sudah ada
               harus selalu checked.
            */

            if(
                alreadyExists
            ){

                input.checked =
                    true;

                input.disabled =
                    true;


                if(
                    wrapper
                ){

                    wrapper.classList.add(
                        "disabled"
                    );

                    wrapper.classList.add(
                        "activity-created"
                    );

                }

            }

        }
    );

}


/* =====================================================
   APPLY RULE DEPENDENCY
===================================================== */

function applyActivityRuleControl(
    form,
    ruleData
){

    if(
        !form ||
        !ruleData
    ){

        return;

    }


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


            /*
               Jangan mengaktifkan kembali
               activity yang memang sudah
               tersimpan.
            */

            const activityName =
                normalizeValue(
                    input.name ||
                    input.value
                );


            const existingActivities =
                getExistingActivities(
                    form.dataset.direction ===
                    "pengeluaran"

                        ?

                    "rule_pengeluaran"

                        :

                    "rule_pemasukan"
                );


            const alreadyExists =
                existingActivities.has(
                    activityName
                );


            if(
                alreadyExists
            ){

                input.checked =
                    true;

                input.disabled =
                    true;

            }
            else{

                input.disabled =
                    !ruleHutang;


                if(
                    !ruleHutang
                ){

                    input.checked =
                        false;

                }

            }


            field.classList.toggle(
                "disabled",
                input.disabled
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


            const activityName =
                normalizeValue(
                    input.name ||
                    input.value
                );


            const existingActivities =
                getExistingActivities(
                    form.dataset.direction ===
                    "pengeluaran"

                        ?

                    "rule_pengeluaran"

                        :

                    "rule_pemasukan"
                );


            const alreadyExists =
                existingActivities.has(
                    activityName
                );


            if(
                alreadyExists
            ){

                input.checked =
                    true;

                input.disabled =
                    true;

            }
            else{

                input.disabled =
                    !ruleTabungan;


                if(
                    !ruleTabungan
                ){

                    input.checked =
                        false;

                }

            }


            field.classList.toggle(
                "disabled",
                input.disabled
            );

        }
    );

}


/* =====================================================
   APPLY RULE UI
===================================================== */

function applyRuleUI(
    form
){

    if(
        !form
    ){

        return;

    }


    Object.entries(
        FINANCIAL_RULES
    )
    .forEach(
        (
            [
                rule,
                config
            ]
        ) => {

            const input =
                form.querySelector(
                    `input[name="${config.field}"]`
                );


            if(
                !input
            ){

                return;

            }


            const wrapper =
                input.closest(
                    ".global-setting-field"
                )
                ||
                input.parentElement;


            const exists =
                existingRules[
                    rule
                ] === true;


            if(
                exists
            ){

                /*
                   Rule sudah dibuat.

                   Tidak boleh diubah lagi.
                */

                input.checked =
                    true;

                input.disabled =
                    true;


                if(
                    wrapper
                ){

                    wrapper.classList.add(
                        "disabled"
                    );

                    wrapper.classList.add(
                        "rule-created"
                    );

                }

            }

        }
    );

}


/* =====================================================
   BIND RULE CHANGE
===================================================== */

function bindRuleChange(
    form
){

    if(
        !form
    ){

        return;

    }


    Object.entries(
        FINANCIAL_RULES
    )
    .forEach(
        (
            [
                rule,
                config
            ]
        ) => {

            const input =
                form.querySelector(
                    `input[name="${config.field}"]`
                );


            if(
                !input
            ){

                return;

            }


            if(
                input.dataset.financialBound ===
                "true"
            ){

                return;

            }


            input.dataset.financialBound =
                "true";


            input.addEventListener(
                "change",
                () => {

                    /*
                       Rule yang sudah ada
                       tidak boleh diubah.
                    */

                    if(
                        existingRules[
                            rule
                        ] === true
                    ){

                        input.checked =
                            true;

                        return;

                    }


                    selectedRuleState[
                        config.field
                    ] =
                        input.checked === true;


                    refreshActivityForms();

                }
            );

        }
    );

}


/* =====================================================
   REFRESH ACTIVITY FORMS
===================================================== */

function refreshActivityForms(){

    const ruleState =
        getFinancialRuleState();


    const forms =
        document.querySelectorAll(
            '[data-section^="financial_activity_"]'
        );


    forms.forEach(
        form => {

            const direction =
                form.dataset.section ===
                "financial_activity_pengeluaran"

                    ?

                "pengeluaran"

                    :

                "pemasukan";


            applyActivityRuleControl(
                form,
                ruleState
            );


            applyExistingActivityState(
                form,
                direction
            );

        }
    );

}


/* =====================================================
   REFRESH RULE FORM
===================================================== */

function refreshRuleForm(
    form
){

    if(
        !form
    ){

        return;

    }


    applyRuleUI(
        form
    );


    bindRuleChange(
        form
    );

}


/* =====================================================
   RULE STATE API
===================================================== */

async function getRuleState(){

    await refreshFinancialState();

    return getFinancialRuleState();

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


    getRuleState : getRuleState,


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

                    refreshRuleForm(
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

                    /*
                       Penanda direction supaya
                       rule dependency bisa tahu
                       apakah ini pemasukan.
                    */

                    form.dataset.direction =
                        "pemasukan";

                    form.dataset.section =
                        "financial_activity_pemasukan";


                    const apply =
                        () => {

                            applyActivityRuleControl(
                                form,
                                getFinancialRuleState()
                            );


                            applyExistingActivityState(
                                form,
                                "pemasukan"
                            );

                        };


                    /*
                       Terapkan langsung jika
                       data Sheet sudah tersedia.
                    */

                    apply();


                    /*
                       Baca ulang Sheet agar
                       state selalu aktual.
                    */

                    refreshFinancialState()
                        .then(
                            () => {

                                apply();

                            }
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

                    form.dataset.direction =
                        "pengeluaran";

                    form.dataset.section =
                        "financial_activity_pengeluaran";


                    const apply =
                        () => {

                            applyActivityRuleControl(
                                form,
                                getFinancialRuleState()
                            );


                            applyExistingActivityState(
                                form,
                                "pengeluaran"
                            );

                        };


                    apply();


                    refreshFinancialState()
                        .then(
                            () => {

                                apply();

                            }
                        );

                }

        }

    ]

};
