/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Financial
   File         : financial.js
   Version      : 5.0.0

   Description :
   Financial Setting

   Structure :
   1. Penentuan Rule
   2. Activity Pemasukan
   3. Activity Pengeluaran

   Rule :
   - Rule Pemasukan wajib digunakan
   - Rule Pengeluaran wajib digunakan
   - Rule Hutang opsional
   - Rule Tabungan opsional

   Principle :
   - Rule dibaca langsung dari Google Sheets
   - Global API menjadi sumber kebenaran rule
   - Rule yang sudah dibuat tidak dapat dihapus
   - Rule yang sudah dibuat tidak dapat diganti
   - Activity dari rule dapat diubah
   - Perubahan activity menggunakan replace berdasarkan
     identity "rules"
   - Tidak menggunakan id sebagai identity rule
   - Tidak menggunakan financial_rules sebagai
     sumber kebenaran keberadaan rule
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
   IMPORT FINANCIAL SETTING WRITER
===================================================== */

/*
 * Fungsi ini merupakan writer khusus Financial.
 *
 * Tujuannya:
 *
 *     existing rule
 *          ↓
 *     replace berdasarkan "rules"
 *
 *     rule baru
 *          ↓
 *     append
 *
 * Rule yang sudah dibuat tidak
 * dihapus ketika activity kosong.
 */

import {

    saveFinancialSetting

} from "../../write.js";


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
   FIXED FINANCIAL RULE
===================================================== */

const FINANCIAL_RULES = {

    rule_pemasukan : {

        label :
            "Rule Pemasukan",

        mandatory :
            true

    },


    rule_pengeluaran : {

        label :
            "Rule Pengeluaran",

        mandatory :
            true

    },


    rule_hutang : {

        label :
            "Rule Hutang",

        mandatory :
            false

    },


    rule_tabungan : {

        label :
            "Rule Tabungan",

        mandatory :
            false

    }

};


/* =====================================================
   EXISTING RULE STATE
===================================================== */

/*
 * Sumber kebenaran:
 *
 *     Google Sheets
 *
 * State ini hanya cache sementara
 * untuk kebutuhan UI.
 */

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


/* =====================================================
   EXISTING FINANCIAL ACTIVITY
===================================================== */

/*
 * Menyimpan data financial_activity
 * yang dibaca dari Google Sheets.
 */

let financialActivityData = [];


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

/*
 * Struktur workspace Financial:
 *
 * sheets[0] = RAW
 * sheets[1] = financial_activity
 *
 * Pembacaan dilakukan melalui Global API.
 */

async function readFinancialActivity(){

    const sheets =

        getFinancialSheets();


    console.log(
        "=========================================="
    );


    console.log(
        "FINANCIAL SETTING: READ DATA"
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


    console.log(
        "FINANCIAL SETTING: DATA COUNT",
        financialActivityData.length
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
   GET RAW COLUMN VALUE
===================================================== */

function getRawColumnValue(

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


    return String(

        row[key] ?? ""

    ).trim();

}


/* =====================================================
   READ EXISTING RULES
===================================================== */

/*
 * Rule dianggap sudah dibuat apabila
 * terdapat row dengan identity "rules"
 * yang sama.
 *
 * Tidak peduli activity kosong atau tidak.
 *
 * Contoh:
 *
 * rule_hutang | hutang,bayar | ""
 *
 * Tetap dianggap:
 *
 *     rule_hutang = sudah dibuat
 */

function readExistingRules(

    rows = financialActivityData

){

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


    const data =

        Array.isArray(

            rows

        )

            ?

        rows

            :

        [];


    data.forEach(

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

                result[rule] = true;

            }

        }

    );


    return result;

}


/* =====================================================
   READ EXISTING ACTIVITIES
===================================================== */

/*
 * Activity dibaca berdasarkan identity rule.
 *
 * Hasil:
 *
 * {
 *     rule_pemasukan :
 *         ["gaji","ceperan"],
 *
 *     rule_pengeluaran :
 *         ["belanja_harian"],
 *
 *     rule_hutang :
 *         ["hutang_piutang"],
 *
 *     rule_tabungan :
 *         ["dana_darurat"]
 * }
 *
 * Jika activity kosong:
 *
 *     []
 *
 * Rule tetap dianggap ada.
 */

function readExistingActivities(

    rows = financialActivityData

){

    const result = {

        rule_pemasukan :
            [],

        rule_pengeluaran :
            [],

        rule_hutang :
            [],

        rule_tabungan :
            []

    };


    const data =

        Array.isArray(

            rows

        )

            ?

        rows

            :

        [];


    data.forEach(

        row => {

            const rule =

                getColumnValue(

                    row,

                    "rules"

                );


            if(

                !Object.prototype.hasOwnProperty.call(

                    result,

                    rule

                )

            ){

                return;

            }


            const activity =

                getRawColumnValue(

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

                    value =>

                        normalizeValue(

                            value

                        )

                )

                .filter(

                    Boolean

                )

                .forEach(

                    value => {

                        if(

                            !result[rule].includes(

                                value

                            )

                        ){

                            result[rule].push(

                                value

                            );

                        }

                    }

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

        const data =

            await readFinancialActivity();


        existingRules =

            readExistingRules(

                data

            );


        const existingActivities =

            readExistingActivities(

                data

            );


        console.log(
            "=========================================="
        );


        console.log(
            "FINANCIAL SETTING - EXISTING RULES:",
            existingRules
        );


        console.log(
            "FINANCIAL SETTING - EXISTING ACTIVITIES:",
            existingActivities
        );


        console.log(
            "=========================================="
        );


        return {

            rules :
                existingRules,

            activities :
                existingActivities

        };

    }

    catch(error){

        console.error(
            "FINANCIAL SETTING: gagal membaca data.",
            error
        );


        existingRules = {

            rule_pemasukan :
                false,

            rule_pengeluaran :
                false,

            rule_hutang :
                false,

            rule_tabungan :
                false

        };


        financialActivityData = [];


        throw error;

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
   APPLY EXISTING ACTIVITY STATE
===================================================== */

/*
 * Mengisi checkbox activity berdasarkan
 * data yang benar-benar ada di Sheet.
 *
 * Rule sudah ada bukan berarti activity
 * terkunci.
 *
 * Activity tetap editable.
 */

function applyExistingActivityState(

    form,

    activities

){

    if(

        !form ||

        !activities

    ){

        return;

    }


    const activityValues =

        new Set(

            Array.isArray(

                activities

            )

                ?

            activities

                :

            []

        );


    form.querySelectorAll(

        'input[type="checkbox"]'

    ).forEach(

        input => {

            const fieldName =

                normalizeValue(

                    input.name ||

                    input.value ||

                    input.dataset.field ||

                    ""

                );


            if(

                !fieldName

            ){

                return;

            }


            input.checked =

                activityValues.has(

                    fieldName

                );

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

        !form ||

        !ruleData

    ){

        return;

    }


    const ruleHutang =

        Boolean(

            ruleData.rule_hutang

        );


    const ruleTabungan =

        Boolean(

            ruleData.rule_tabungan

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
   APPLY RULE UI STATE
===================================================== */

/*
 * Sama seperti Kas:
 *
 * Jika rule sudah ada:
 *
 *     ✓ Rule Pemasukan sudah dibuat
 *
 * Checkbox tidak lagi tersedia.
 *
 * Rule tidak dapat dihapus.
 */

function applyRuleUIState(

    sectionElement,

    state

){

    if(

        !sectionElement ||

        !state

    ){

        return;

    }


    Object.keys(

        FINANCIAL_RULES

    ).forEach(

        ruleKey => {

            const wrapper =

                sectionElement.querySelector(

                    `.global-setting-field[data-field="${ruleKey}"]`

                );


            if(

                !wrapper

            ){

                return;

            }


            const ruleConfig =

                FINANCIAL_RULES[ruleKey];


            /* =====================================
               RULE SUDAH ADA
            ===================================== */

            if(

                state[ruleKey] === true

            ){

                wrapper.innerHTML = "";


                wrapper.classList.add(

                    "financial-rule-created"

                );


                const status =

                    document.createElement(

                        "div"

                    );


                status.className =

                    "global-setting-field-note";


                status.textContent =

                    `✓ ${ruleConfig.label} sudah dibuat`;


                wrapper.appendChild(

                    status

                );


                return;

            }


            /* =====================================
               RULE BELUM ADA
            ===================================== */

            wrapper.classList.remove(

                "financial-rule-created"

            );

        }

    );


    /* =============================================
       RULE WAJIB
    ============================================= */

    /*
     * Pemasukan dan Pengeluaran selalu
     * dianggap aktif untuk konfigurasi
     * Financial.
     *
     * Jangan biarkan user mematikan
     * kedua rule mandatory tersebut.
     */

    [

        "rule_pemasukan",

        "rule_pengeluaran"

    ].forEach(

        ruleKey => {

            const wrapper =

                sectionElement.querySelector(

                    `.global-setting-field[data-field="${ruleKey}"]`

                );


            if(

                !wrapper

            ){

                return;

            }


            if(

                state[ruleKey] === true

            ){

                return;

            }


            const input =

                wrapper.querySelector(

                    'input[type="checkbox"]'

                );


            if(

                input

            ){

                input.checked =

                    true;

            }

        }

    );


    /* =============================================
       CHECK ALL RULE
    ============================================= */

    const allCreated =

        Object.keys(

            FINANCIAL_RULES

        ).every(

            ruleKey =>

                state[ruleKey] === true

        );


    const addButton =

        sectionElement.querySelector(

            ".global-setting-add"

        );


    const form =

        sectionElement.querySelector(

            ".global-setting-form"

        );


    /* =============================================
       ALL CREATED
    ============================================= */

    if(

        allCreated

    ){

        if(

            addButton

        ){

            addButton.style.display =

                "none";

        }


        if(

            form

        ){

            form.classList.add(

                "hidden"

            );

        }


        return;

    }


    /* =============================================
       STILL HAS MISSING RULE
    ============================================= */

    if(

        addButton

    ){

        addButton.style.display =

            "";

    }

}


/* =====================================================
   GET FINANCIAL RULE STATE
===================================================== */

/*
 * Berbeda dengan versi lama.
 *
 * Fungsi ini TIDAK lagi membaca:
 *
 *     document.querySelector(...)
 *
 * Sumber state rule adalah:
 *
 *     Google Sheets
 *         ↓
 *     existingRules
 */

function getFinancialRuleState(){

    return {

        gunakanRulePemasukan :

            existingRules.rule_pemasukan === true,

        gunakanRulePengeluaran :

            existingRules.rule_pengeluaran === true,

        gunakanRuleHutang :

            existingRules.rule_hutang === true,

        gunakanRuleTabungan :

            existingRules.rule_tabungan === true

    };

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
       DISPLAY
    ============================================= */

    result.__display = {};


    fields.forEach(

        field => {

            result.__display[field.name] =

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

/*
 * Rule section hanya digunakan
 * untuk konfigurasi UI.
 *
 * Tidak dikirim sebagai row
 * financial_activity.
 */

function normalizeRule(

    data

){

    return {

        gunakanRulePemasukan :

            true,


        gunakanRulePengeluaran :

            true,


        gunakanRuleHutang :

            Boolean(

                data.gunakanRuleHutang

            ),


        gunakanRuleTabungan :

            Boolean(

                data.gunakanRuleTabungan

            )

    };

}


/* =====================================================
   BUILD FINANCIAL RULE PAYLOAD
===================================================== */

/*
 * Membentuk konfigurasi final Financial.
 *
 * Rule identity FIXED:
 *
 *     rule_pemasukan
 *     rule_pengeluaran
 *     rule_hutang
 *     rule_tabungan
 *
 * Activity berasal dari checkbox
 * saat ini.
 *
 * Rule yang sudah ada tetap dipertahankan.
 */

function buildFinancialPayload(

    data

){

    const rules = [];


    /* =============================================
       PEMASUKAN
    ============================================= */

    rules.push({

        rules :
            "rule_pemasukan",

        type :
            "masuk",

        activity :
            getSelectedActivities(

                data,

                ACTIVITY.pemasukan

            )

    });


    /* =============================================
       PENGELUARAN
    ============================================= */

    rules.push({

        rules :
            "rule_pengeluaran",

        type :
            "keluar",

        activity :
            getSelectedActivities(

                data,

                ACTIVITY.pengeluaran

            )

    });


    /* =============================================
       HUTANG
    ============================================= */

    if(

        existingRules.rule_hutang === true

    ){

        rules.push({

            rules :
                "rule_hutang",

            type :
                "hutang,bayar",

            activity :
                getSelectedActivitiesByRule(

                    data,

                    "hutang"

                )

        });

    }


    /* =============================================
       TABUNGAN
    ============================================= */

    if(

        existingRules.rule_tabungan === true

    ){

        rules.push({

            rules :
                "rule_tabungan",

            type :
                "nabung,tarik",

            activity :
                getSelectedActivitiesByRule(

                    data,

                    "tabungan"

                )

        });

    }


    return rules;

}


/* =====================================================
   GET SELECTED ACTIVITIES
===================================================== */

function getSelectedActivities(

    data,

    list

){

    return list

        .filter(

            item =>

                data[item.name] === true

        )

        .filter(

            item => {

                if(

                    item.rule === "hutang"

                ){

                    return (

                        existingRules.rule_hutang === true

                    );

                }


                if(

                    item.rule === "tabungan"

                ){

                    return (

                        existingRules.rule_tabungan === true

                    );

                }


                return true;

            }

        )

        .map(

            item =>

                item.name

        )

        .join(",");

}


/* =====================================================
   GET SELECTED ACTIVITIES BY RULE
===================================================== */

function getSelectedActivitiesByRule(

    data,

    rule

){

    const lists = [

        ACTIVITY.pemasukan,

        ACTIVITY.pengeluaran

    ];


    const result = [];


    lists.forEach(

        list => {

            list.forEach(

                item => {

                    if(

                        item.rule !== rule

                    ){

                        return;

                    }


                    if(

                        data[item.name] !== true

                    ){

                        return;

                    }


                    if(

                        !result.includes(

                            item.name

                        )

                    ){

                        result.push(

                            item.name

                        );

                    }

                }

            );

        }

    );


    return result.join(",");

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
       CUSTOM SAVE
    ================================================= */

    /*
     * Financial tidak menggunakan saveSetting()
     * global karena saveSetting() bersifat append.
     *
     * Financial membutuhkan:
     *
     *     existing → replace
     *     baru     → append
     *
     * berdasarkan identity:
     *
     *     rules
     *
     * Rule yang sudah ada tidak pernah
     * dihapus.
     */

    async save(

        payload,

        context

    ){

        const financialRules =

            buildFinancialPayload(

                payload

            );


        console.log(
            "=========================================="
        );


        console.log(
            "FINANCIAL SETTING: SAVE"
        );


        console.log(
            "FINANCIAL SETTING: RULES",
            financialRules
        );


        console.log(
            "FINANCIAL SETTING: EXISTING",
            existingRules
        );


        console.log(
            "=========================================="
        );


        return saveFinancialSetting(

            financialRules,

            context

        );

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

                "Tentukan rule Financial yang akan digunakan. Rule yang sudah dibuat tidak dapat dihapus atau diganti.",


            persist :

                false,


            addLabel :

                "＋ Atur Rule",


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


            /* =========================================
               RENDER RULE
            ========================================= */

            async onRender(

                form,

                sectionElement

            ){

                const state =

                    await refreshFinancialState();


                applyRuleUIState(

                    sectionElement,

                    state.rules

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

                async function(

                    form

                ){

                    /*
                     * State harus sudah dibaca
                     * dari Sheet.
                     */

                    if(

                        !financialActivityData.length

                    ){

                        try{

                            await refreshFinancialState();

                        }

                        catch(error){

                            console.error(

                                "Financial Activity Pemasukan:",

                                error

                            );

                        }

                    }


                    const activities =

                        readExistingActivities(

                            financialActivityData

                        );


                    applyExistingActivityState(

                        form,

                        activities.rule_pemasukan

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

                async function(

                    form

                ){

                    /*
                     * Pastikan state Sheet tersedia.
                     */

                    if(

                        !financialActivityData.length

                    ){

                        try{

                            await refreshFinancialState();

                        }

                        catch(error){

                            console.error(

                                "Financial Activity Pengeluaran:",

                                error

                            );

                        }

                    }


                    const activities =

                        readExistingActivities(

                            financialActivityData

                        );


                    applyExistingActivityState(

                        form,

                        activities.rule_pengeluaran

                    );


                    applyActivityRuleControl(

                        form,

                        getFinancialRuleState()

                    );

                }

        }

    ]

};
