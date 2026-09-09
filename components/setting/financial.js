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

   Fixed Rule :
   - rule_pemasukan
   - rule_pengeluaran
   - rule_hutang
   - rule_tabungan

   Rule :
   - Rule Pemasukan wajib
   - Rule Pengeluaran wajib
   - Rule Hutang opsional
   - Rule Tabungan opsional

   Storage :
   financial
       ↓
   financial_activity

   Financial Setting :
       READ existing rules
           ↓
       determine rule state
           ↓
       configure activity
           ↓
       SAVE
           ↓
       existing rule  → REPLACE
       new rule       → APPEND

   IMPORTANT :
   - Tidak mengubah Normal Input.
   - Tidak mengubah Edit Input.
   - Rule identity menggunakan field "rules".
   - ID tidak digunakan sebagai identity setting.
   - Rule yang sudah dibuat tidak dapat dinonaktifkan.
   - Rule yang sudah dibuat tidak pernah dihapus.
   - Activity boleh dikosongkan.
===================================================== */


/* =====================================================
   IMPORT API
===================================================== */

import {
    API
} from "../../js/api.js";


/* =====================================================
   IMPORT WORKSPACE
===================================================== */

import {
    getWorkspaceConfig
} from "../../js/workspace.js";


/* =====================================================
   IMPORT WRITE
===================================================== */

import {
    saveFinancialSetting
} from "../../js/write.js";


/* =====================================================
   CONFIG
===================================================== */

const WORKSPACE =
    "financial";


const FINANCIAL_ACTIVITY_SHEET =
    "financial_activity";


/* =====================================================
   FIXED RULE
===================================================== */

const RULES = {

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
   STATE
===================================================== */

let existingRuleState = {

    rule_pemasukan :
        false,

    rule_pengeluaran :
        false,

    rule_hutang :
        false,

    rule_tabungan :
        false

};


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


let financialActivityData =
    [];


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
   GET WORKSPACE
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
        workspaces[
            WORKSPACE
        ];


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
            'Workspace "financial" tidak memiliki financial_activity sheet.'
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

        activitySheet :
            workspace.sheets[1]

    };

}


/* =====================================================
   READ FINANCIAL ACTIVITY
===================================================== */

async function readFinancialActivity(){

    const sheets =
        getFinancialSheets();


    console.log(
        "FINANCIAL SETTING: READ",
        {
            rawSheet :
                sheets.rawSheet,

            activitySheet :
                sheets.activitySheet
        }
    );


    const result =
        await API.load(
            sheets.rawSheet,
            sheets.activitySheet
        );


    if(
        !result
        ||
        result.success !==
            true
    ){

        throw new Error(
            "Gagal membaca data Financial."
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


    console.log(
        "FINANCIAL SETTING: DATA",
        financialActivityData
    );


    return financialActivityData;

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
        ).find(
            currentKey =>
                normalizeValue(
                    currentKey
                )
                ===
                target
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
   BUILD EXISTING RULE STATE
===================================================== */

function buildExistingRuleState(
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
                getColumnValue(
                    row,
                    "rules"
                );


            if(
                Object.prototype.hasOwnProperty.call(
                    state,
                    rules
                )
            ){

                state[
                    rules
                ] =
                    true;

            }

        }
    );


    return state;

}


/* =====================================================
   GET EXISTING RULE ROW
===================================================== */

function getExistingRuleRow(
    ruleName
){

    const target =
        normalizeValue(
            ruleName
        );


    return (
        financialActivityData.find(
            row =>
                getColumnValue(
                    row,
                    "rules"
                )
                ===
                target
        )
        ??
        null
    );

}


/* =====================================================
   GET EXISTING ACTIVITY
===================================================== */

function getExistingActivity(
    ruleName
){

    const row =
        getExistingRuleRow(
            ruleName
        );


    if(
        !row
    ){

        return [];

    }


    return String(
        row.activity ??
        ""
    )
    .split(",")
    .map(
        value =>
            normalizeValue(
                value
            )
    )
    .filter(
        Boolean
    );

}


/* =====================================================
   INITIALIZE RULE STATE
===================================================== */

function initializeRuleState(){

    selectedRuleState = {

        gunakanRulePemasukan :
            true,

        gunakanRulePengeluaran :
            true,

        gunakanRuleHutang :
            existingRuleState
                .rule_hutang ===
                true,

        gunakanRuleTabungan :
            existingRuleState
                .rule_tabungan ===
                true

    };


    return selectedRuleState;

}


/* =====================================================
   GET FINANCIAL RULE STATE
===================================================== */

function getFinancialRuleState(){

    return {

        gunakanRulePemasukan :
            selectedRuleState
                .gunakanRulePemasukan ===
                true,

        gunakanRulePengeluaran :
            selectedRuleState
                .gunakanRulePengeluaran ===
                true,

        gunakanRuleHutang :
            selectedRuleState
                .gunakanRuleHutang ===
                true,

        gunakanRuleTabungan :
            selectedRuleState
                .gunakanRuleTabungan ===
                true

    };

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
   GET TYPE
===================================================== */

function getDirectionTypes(
    direction
){

    const state =
        getFinancialRuleState();


    const types = [];


    if(
        direction ===
            "pemasukan"
    ){

        types.push(
            "masuk"
        );


        if(
            state.gunakanRuleHutang ===
                true
        ){

            types.push(
                "hutang"
            );

        }


        if(
            state.gunakanRuleTabungan ===
                true
        ){

            types.push(
                "tarik"
            );

        }

    }


    if(
        direction ===
            "pengeluaran"
    ){

        types.push(
            "keluar"
        );


        if(
            state.gunakanRuleHutang ===
                true
        ){

            types.push(
                "bayar"
            );

        }


        if(
            state.gunakanRuleTabungan ===
                true
        ){

            types.push(
                "nabung"
            );

        }

    }


    return types;

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

    const state =
        getFinancialRuleState();


    const activity = [];


    /* =============================================
       FILTER ACTIVITY
    ============================================= */

    fields.forEach(
        field => {

            if(
                data[
                    field.name
                ] !==
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
                state.gunakanRuleHutang !==
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
                state.gunakanRuleTabungan !==
                    true
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

    const types =
        getDirectionTypes(
            direction
        );


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
       DISPLAY
    ============================================= */

    result.__display =
        {};


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

    /*
       Mandatory rules selalu true.
    */

    const pemasukan =
        true;


    const pengeluaran =
        true;


    /*
       Optional rule :

       - jika sudah ada → tetap true
       - jika baru dipilih → true
       - jika belum dipilih → false
    */

    const hutang =
        existingRuleState
            .rule_hutang ===
            true
        ||
        Boolean(
            data.gunakanRuleHutang
        );


    const tabungan =
        existingRuleState
            .rule_tabungan ===
            true
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
        ...selectedRuleState
    };

}


/* =====================================================
   APPLY EXISTING ACTIVITY
===================================================== */

function applyExistingActivity(
    form,
    ruleName,
    fields
){

    if(
        !form
        ||
        !Array.isArray(
            fields
        )
    ){

        return;

    }


    const activity =
        getExistingActivity(
            ruleName
        );


    fields.forEach(
        field => {

            const input =
                form.querySelector(
                    `[name="${field.name}"]`
                );


            if(
                !input
            ){

                return;

            }


            /*
               Hanya set dari Sheet ketika
               rule memang sudah ada.
            */

            if(
                existingRuleState[
                    ruleName
                ] ===
                    true
            ){

                input.checked =
                    activity.includes(
                        field.name
                    );

            }

        }
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


    const ruleHutang =
        Boolean(
            ruleData
                .gunakanRuleHutang
        );


    const ruleTabungan =
        Boolean(
            ruleData
                .gunakanRuleTabungan
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
   REFRESH ACTIVITY UI
===================================================== */

function refreshActivityUI(){

    const ruleState =
        getFinancialRuleState();


    const sections = [
        "financial_activity_pemasukan",
        "financial_activity_pengeluaran"
    ];


    sections.forEach(
        sectionId => {

            const forms =
                document.querySelectorAll(
                    `[data-section="${sectionId}"] .global-setting-form`
                );


            forms.forEach(
                form => {

                    applyActivityRuleControl(
                        form,
                        ruleState
                    );

                }
            );

        }
    );

}


/* =====================================================
   APPLY RULE UI
===================================================== */

function applyRuleUI(
    form,
    sectionElement
){

    if(
        !form
    ){

        return;

    }


    Object.entries(
        RULES
    ).forEach(
        (
            [
                ruleName,
                config
            ]
        ) => {

            const fieldName =
                config.field;


            const wrapper =
                form.querySelector(
                    `[data-field="${fieldName}"]`
                );


            if(
                !wrapper
            ){

                return;

            }


            const exists =
                existingRuleState[
                    ruleName
                ] ===
                    true;


            /* =====================================
               RULE SUDAH DIBUAT
            ===================================== */

            if(
                exists
            ){

                wrapper.classList.add(
                    "is-used",
                    "rule-created"
                );


                wrapper.innerHTML =
                    "";


                const message =
                    document.createElement(
                        "div"
                    );


                message.className =
                    "global-setting-rule-created";


                message.textContent =
                    "✓ " +
                    config.label +
                    " sudah dibuat";


                wrapper.appendChild(
                    message
                );


                return;

            }


            /* =====================================
               RULE BELUM DIBUAT
            ===================================== */

            const input =
                wrapper.querySelector(
                    'input[type="checkbox"]'
                );


            if(
                !input
            ){

                return;

            }


            /*
               Mandatory selalu true.
            */

            if(
                config.required
            ){

                input.checked =
                    true;

            }
            else{

                input.checked =
                    selectedRuleState[
                        fieldName
                    ] ===
                        true;

            }


            input.disabled =
                false;


            /* =====================================
               CHANGE
            ===================================== */

            if(
                input.dataset
                    .financialRuleBound !==
                    "true"
            ){

                input.dataset
                    .financialRuleBound =
                        "true";


                input.addEventListener(
                    "change",
                    () => {

                        if(
                            config.required
                        ){

                            input.checked =
                                true;

                        }


                        selectedRuleState[
                            fieldName
                        ] =
                            input.checked ===
                                true;


                        refreshActivityUI();

                    }
                );

            }

        }
    );

}


/* =====================================================
   GET RESULT ENTRIES
===================================================== */

function getResultEntries(
    data
){

    if(
        Array.isArray(
            data
        )
    ){

        return data.filter(
            item =>
                item
                &&
                typeof item ===
                    "object"
        );

    }


    if(
        data
        &&
        typeof data ===
            "object"
    ){

        return [
            data
        ];

    }


    return [];

}


/* =====================================================
   FIND RULE ENTRY
===================================================== */

function findRuleEntry(
    entries,
    ruleName
){

    const target =
        normalizeValue(
            ruleName
        );


    for(
        let index =
            entries.length -
            1;

        index >= 0;

        index--
    ){

        const entry =
            entries[index];


        const row =
            entry?.data;


        if(
            !row
            ||
            typeof row !==
                "object"
        ){

            continue;

        }


        const rowRule =
            normalizeValue(
                row.rules
            );


        if(
            rowRule ===
                target
        ){

            return entry;

        }

    }


    return null;

}


/* =====================================================
   GET ACTIVITY FROM ENTRY
===================================================== */

function getEntryActivity(
    entry
){

    if(
        !entry
        ||
        !entry.data
    ){

        return [];

    }


    return String(
        entry.data.activity ??
        ""
    )
    .split(",")
    .map(
        value =>
            normalizeValue(
                value
            )
    )
    .filter(
        Boolean
    );

}


/* =====================================================
   UNIQUE ACTIVITY
===================================================== */

function uniqueActivity(
    values
){

    return [
        ...new Set(
            values
                .map(
                    value =>
                        normalizeValue(
                            value
                        )
                )
                .filter(
                    Boolean
                )
        )
    ];

}


/* =====================================================
   BUILD MANDATORY RULE
===================================================== */

function buildMandatoryRule(
    ruleName,
    direction,
    entries
){

    const entry =
        findRuleEntry(
            entries,
            ruleName
        );


    let activity = [];


    if(
        entry
    ){

        activity =
            getEntryActivity(
                entry
            );

    }
    else{

        activity =
            getExistingActivity(
                ruleName
            );

    }


    activity =
        uniqueActivity(
            activity
        );


    const types =
        getDirectionTypes(
            direction
        );


    return {

        section :
            FINANCIAL_ACTIVITY_SHEET,

        data : {

            rules :
                ruleName,

            type :
                types.join(","),

            activity :
                activity.join(",")

        }

    };

}


/* =====================================================
   BUILD RULE HUTANG
===================================================== */

function buildRuleHutang(
    entries
){

    const pemasukanEntry =
        findRuleEntry(
            entries,
            "rule_pemasukan"
        );


    const pengeluaranEntry =
        findRuleEntry(
            entries,
            "rule_pengeluaran"
        );


    let activity = [];


    if(
        pemasukanEntry
    ){

        activity.push(
            ...getEntryActivity(
                pemasukanEntry
            )
            .filter(
                value =>
                    value ===
                    "hutang_piutang"
            )
        );

    }


    if(
        pengeluaranEntry
    ){

        activity.push(
            ...getEntryActivity(
                pengeluaranEntry
            )
            .filter(
                value =>
                    value ===
                    "hutang_piutang"
            )
        );

    }


    if(
        activity.length ===
            0
    ){

        const existing =
            getExistingActivity(
                "rule_hutang"
            );


        activity.push(
            ...existing
        );

    }


    activity =
        uniqueActivity(
            activity
        );


    return {

        section :
            FINANCIAL_ACTIVITY_SHEET,

        data : {

            rules :
                "rule_hutang",

            type :
                "hutang,bayar",

            activity :
                activity.join(",")

        }

    };

}


/* =====================================================
   BUILD RULE TABUNGAN
===================================================== */

function buildRuleTabungan(
    entries
){

    const pemasukanEntry =
        findRuleEntry(
            entries,
            "rule_pemasukan"
        );


    const pengeluaranEntry =
        findRuleEntry(
            entries,
            "rule_pengeluaran"
        );


    let activity = [];


    const allowed =
        [
            "dana_darurat",
            "tabungan_kaleng"
        ];


    if(
        pemasukanEntry
    ){

        activity.push(
            ...getEntryActivity(
                pemasukanEntry
            )
            .filter(
                value =>
                    allowed.includes(
                        value
                    )
            )
        );

    }


    if(
        pengeluaranEntry
    ){

        activity.push(
            ...getEntryActivity(
                pengeluaranEntry
            )
            .filter(
                value =>
                    allowed.includes(
                        value
                    )
            )
        );

    }


    if(
        activity.length ===
            0
    ){

        const existing =
            getExistingActivity(
                "rule_tabungan"
            );


        activity.push(
            ...existing
        );

    }


    activity =
        uniqueActivity(
            activity
        );


    return {

        section :
            FINANCIAL_ACTIVITY_SHEET,

        data : {

            rules :
                "rule_tabungan",

            type :
                "nabung,tarik",

            activity :
                activity.join(",")

        }

    };

}


/* =====================================================
   BUILD FINANCIAL SAVE ROWS
===================================================== */

function buildFinancialSaveRows(
    data
){

    const entries =
        getResultEntries(
            data
        );


    /*
       Ambil rule state terbaru.

       Context.data dari Global Setting
       tetap menjadi sumber state checkbox
       pada sesi saat ini.
    */

    const ruleEntry =
        entries.find(
            entry =>
                entry?.section ===
                    "financial_rules"
        );


    if(
        ruleEntry
        &&
        ruleEntry.data
    ){

        normalizeRule(
            ruleEntry.data
        );

    }


    const rows = [];


    /* =============================================
       RULE PEMASUKAN
    ============================================= */

    if(
        selectedRuleState
            .gunakanRulePemasukan ===
            true
    ){

        rows.push(
            buildMandatoryRule(
                "rule_pemasukan",
                "pemasukan",
                entries
            )
        );

    }


    /* =============================================
       RULE PENGELUARAN
    ============================================= */

    if(
        selectedRuleState
            .gunakanRulePengeluaran ===
            true
    ){

        rows.push(
            buildMandatoryRule(
                "rule_pengeluaran",
                "pengeluaran",
                entries
            )
        );

    }


    /* =============================================
       RULE HUTANG

       Jika sudah ada:
           tetap diproses.

       Jika baru dipilih:
           dibuat.

       Jika tidak ada:
           jangan dibuat.

       Tidak pernah delete.
    ============================================= */

    if(
        selectedRuleState
            .gunakanRuleHutang ===
            true
        ||
        existingRuleState
            .rule_hutang ===
            true
    ){

        rows.push(
            buildRuleHutang(
                entries
            )
        );

    }


    /* =============================================
       RULE TABUNGAN
    ============================================= */

    if(
        selectedRuleState
            .gunakanRuleTabungan ===
            true
        ||
        existingRuleState
            .rule_tabungan ===
            true
    ){

        rows.push(
            buildRuleTabungan(
                entries
            )
        );

    }


    /*
       Final dedupe.
       Satu rules hanya boleh satu row.
    */

    const unique =
        new Map();


    rows.forEach(
        entry => {

            const rules =
                normalizeValue(
                    entry?.data?.rules
                );


            if(
                !rules
            ){

                return;

            }


            unique.set(
                rules,
                entry
            );

        }
    );


    return [
        ...unique.values()
    ];

}


/* =====================================================
   SAVE HOOK
===================================================== */

async function saveFinancial(
    payload,
    context = {}
){

    /*
       context.data berisi seluruh result
       Global Setting.

       payload sendiri hanya berisi
       section yang persist:true.
    */

    const rawData =
        context?.data;


    const rows =
        buildFinancialSaveRows(
            rawData
        );


    if(
        rows.length ===
            0
    ){

        throw new Error(
            "Tidak ada Financial Setting yang dapat disimpan."
        );

    }


    console.log(
        "FINANCIAL SETTING: SAVE",
        {
            existingRules :
                existingRuleState,

            selectedRules :
                selectedRuleState,

            rows :
                rows
        }
    );


    const result =
        await saveFinancialSetting(
            WORKSPACE,
            existingRuleState,
            rows
        );


    /*
       Setelah WRITE berhasil,
       state lokal dianggap sudah dibuat.

       Rule tidak dihapus.
    */

    rows.forEach(
        entry => {

            const rule =
                normalizeValue(
                    entry?.data?.rules
                );


            if(
                Object.prototype.hasOwnProperty.call(
                    existingRuleState,
                    rule
                )
            ){

                existingRuleState[
                    rule
                ] =
                    true;

            }

        }
    );


    return result;

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
       SAVE HOOK
    ================================================= */

    save :
        saveFinancial,


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


            /*
               READ Sheet ketika section rule
               akan dipakai oleh Global Setting
               sebagai persistent rule state.
            */

            getRuleState :
                async function(){

                    try{

                        await readFinancialActivity();


                        existingRuleState =
                            buildExistingRuleState(
                                financialActivityData
                            );


                        initializeRuleState();


                        return {
                            ...existingRuleState
                        };

                    }
                    catch(error){

                        console.error(
                            "FINANCIAL SETTING: Gagal membaca rule state.",
                            error
                        );


                        /*
                           Jangan menganggap rule
                           sudah dibuat jika READ gagal.
                        */

                        existingRuleState = {

                            rule_pemasukan :
                                false,

                            rule_pengeluaran :
                                false,

                            rule_hutang :
                                false,

                            rule_tabungan :
                                false

                        };


                        initializeRuleState();


                        return {
                            ...existingRuleState
                        };

                    }

                },


            normalize :
                normalizeRule,


            onRender :
                function(
                    form,
                    sectionElement
                ){

                    applyRuleUI(
                        form,
                        sectionElement
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

                    applyExistingActivity(
                        form,

                        "rule_pemasukan",

                        this.fields
                    );


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

                    applyExistingActivity(
                        form,

                        "rule_pengeluaran",

                        this.fields
                    );


                    applyActivityRuleControl(
                        form,

                        getFinancialRuleState()
                    );

                }

        }

    ]

};


/* =====================================================
   INITIAL FINANCIAL READ
===================================================== */

export async function refreshFinancialSetting(){

    await readFinancialActivity();


    existingRuleState =
        buildExistingRuleState(
            financialActivityData
        );


    initializeRuleState();


    return {
        existingRules :
            {
                ...existingRuleState
            },

        selectedRules :
            {
                ...selectedRuleState
            },

        data :
            financialActivityData

    };

}


/* =====================================================
   END
===================================================== */
