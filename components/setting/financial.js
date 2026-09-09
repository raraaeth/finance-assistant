/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Financial
   File         : financial.js
   Version      : 5.0.0

   Description :
   Financial Setting

   Principle :
   - Google Sheets adalah sumber kebenaran.
   - Rule yang sudah ada menjadi:
         ✓ Rule ... sudah dibuat
   - Activity yang sudah ada menjadi:
         ✓ Activity ... sudah dibuat
   - Checkbox yang sudah dibuat tidak tersedia lagi.
   - Tidak ada duplikasi rule.
   - Rule hanya dibuat satu kali.
   - Activity dapat ditambahkan selama belum tersedia.
   - Rule Hutang mengikuti activity Hutang / Piutang.
   - Rule Tabungan mengikuti activity Dana Darurat
     dan Tabungan Kaleng.
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

import {
    saveFinancialSetting
} from "../../js/write.js";


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
   FINANCIAL RULE CONFIGURATION
===================================================== */

const FINANCIAL_RULES = {

    rule_pemasukan : {

        label :
            "Rule Pemasukan"

    },

    rule_pengeluaran : {

        label :
            "Rule Pengeluaran"

    },

    rule_hutang : {

        label :
            "Rule Hutang"

    },

    rule_tabungan : {

        label :
            "Rule Tabungan"

    }

};


/* =====================================================
   EXISTING DATA CACHE
===================================================== */

/*
 * Cache hanya digunakan setelah
 * pembacaan Sheet.
 *
 * BUKAN sumber kebenaran.
 */

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


let existingActivities = {

    pemasukan :
        new Set(),

    pengeluaran :
        new Set()

};


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
   READ FINANCIAL ACTIVITY DATA
===================================================== */

async function readFinancialActivityData(){

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
   SPLIT CSV VALUE
===================================================== */

function splitValues(

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

        .split(",")

        .map(

            item =>

                normalizeValue(

                    item

                )

        )

        .filter(

            Boolean

        );

}


/* =====================================================
   READ EXISTING RULES
===================================================== */

/*
 * Rule dianggap sudah dibuat apabila
 * terdapat row dengan rules yang sesuai.
 *
 * Contoh:
 *
 * rules = rule_pemasukan
 *
 * berarti:
 *
 * existingRules.rule_pemasukan = true
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
 * Activity dibaca dari:
 *
 *     rules
 *     activity
 *
 * Rule Pemasukan:
 *
 *     activity -> pemasukan
 *
 * Rule Pengeluaran:
 *
 *     activity -> pengeluaran
 *
 * Rule Hutang:
 *
 *     hutang_piutang
 *
 * Rule Tabungan:
 *
 *     dana_darurat
 *     tabungan_kaleng
 */

function readExistingActivities(

rows = financialActivityData

){

    const result = {

        pemasukan :
            new Set(),

        pengeluaran :
            new Set()

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


            const activities =

                splitValues(

                    getColumnValue(

                        row,

                        "activity"

                    )

                );


            if(

                rule ===

                "rule_pemasukan"

            ){

                activities.forEach(

                    activity => {

                        result.pemasukan.add(

                            activity

                        );

                    }

                );

            }


            if(

                rule ===

                "rule_pengeluaran"

            ){

                activities.forEach(

                    activity => {

                        result.pengeluaran.add(

                            activity

                        );

                    }

                );

            }

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

            await readFinancialActivityData();


        existingRules =

            readExistingRules(

                data

            );


        existingActivities =

            readExistingActivities(

                data

            );


        console.log(

            "=========================================="

        );


        console.log(

            "FINANCIAL EXISTING RULES:",

            existingRules

        );


        console.log(

            "FINANCIAL EXISTING ACTIVITIES:",

            {

                pemasukan :

                    Array.from(

                        existingActivities.pemasukan

                    ),

                pengeluaran :

                    Array.from(

                        existingActivities.pengeluaran

                    )

            }

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


        existingActivities = {

            pemasukan :
                new Set(),

            pengeluaran :
                new Set()

        };


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

            value :

                false,

            resultValue :

                item.name,

            activityRule :

                item.rule ?? ""

        })

    );

}


/* =====================================================
   GET CURRENT RULE STATE
===================================================== */

/*
 * Sumber state:
 *
 *     existingRules
 *
 * BUKAN DOM.
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
   GET RULE STATE FROM FORM
===================================================== */

/*
 * Digunakan saat user sedang membuat
 * rule baru.
 *
 * Rule yang sudah ada tetap dipaksa true.
 */

function getRuleStateFromData(

data

){

    const current =

        getFinancialRuleState();


    return {

        gunakanRulePemasukan :

            current.gunakanRulePemasukan ||

            data?.gunakanRulePemasukan === true,

        gunakanRulePengeluaran :

            current.gunakanRulePengeluaran ||

            data?.gunakanRulePengeluaran === true,

        gunakanRuleHutang :

            current.gunakanRuleHutang ||

            data?.gunakanRuleHutang === true,

        gunakanRuleTabungan :

            current.gunakanRuleTabungan ||

            data?.gunakanRuleTabungan === true

    };

}


/* =====================================================
   APPLY RULE UI STATE
===================================================== */

/*
 * Sama seperti Kas.
 *
 * Jika sudah ada:
 *
 *     ✓ Rule Pemasukan sudah dibuat
 *
 * Jika belum:
 *
 *     [ ] Gunakan Rule Pemasukan
 */

function applyRuleUIState(

    sectionElement,

    state

){

    if(

        !sectionElement

    ){

        return;

    }


    Object.keys(

        FINANCIAL_RULES

    ).forEach(

        ruleType => {

            const fieldMap = {

                rule_pemasukan :

                    "gunakanRulePemasukan",

                rule_pengeluaran :

                    "gunakanRulePengeluaran",

                rule_hutang :

                    "gunakanRuleHutang",

                rule_tabungan :

                    "gunakanRuleTabungan"

            };


            const fieldName =

                fieldMap[ruleType];


            if(

                !fieldName

            ){

                return;

            }


            const wrapper =

                sectionElement.querySelector(

                    `.global-setting-field[data-field="${fieldName}"]`

                );


            if(

                !wrapper

            ){

                return;

            }


            /* =====================================
               RULE SUDAH ADA
            ===================================== */

            if(

                state[ruleType] === true

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

                    `✓ ${FINANCIAL_RULES[ruleType].label} sudah dibuat`;


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
       CEK SEMUA RULE
    ============================================= */

    const allCreated =

        Object.values(

            state

        ).every(

            Boolean

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
       SEMUA RULE SUDAH DIBUAT
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
       MASIH ADA RULE YANG BELUM DIBUAT
    ============================================= */

    if(

        addButton

    ){

        addButton.style.display =

            "";

    }

}


/* =====================================================
   APPLY ACTIVITY UI STATE
===================================================== */

/*
 * Activity yang sudah ada di Sheet:
 *
 *     ✓ Gaji sudah dibuat
 *
 * Activity yang belum ada:
 *
 *     [ ] Gaji
 *
 * Activity tidak boleh dipilih ulang.
 */

function applyActivityUIState(

    sectionElement,

    direction

){

    if(

        !sectionElement

    ){

        return;

    }


    const existing =

        existingActivities[direction] ||

        new Set();


    const fields =

        sectionElement.querySelectorAll(

            ".global-setting-field"

        );


    fields.forEach(

        wrapper => {

            const fieldName =

                wrapper.dataset.field;


            if(

                !fieldName

            ){

                return;

            }


            /*
             * Cari activity berdasarkan
             * master activity.
             */

            const item =

                ACTIVITY[direction].find(

                    activity =>

                        activity.name ===

                        fieldName

                );


            if(

                !item

            ){

                return;

            }


            /* =====================================
               ACTIVITY SUDAH ADA
            ===================================== */

            if(

                existing.has(

                    fieldName

                )

            ){

                wrapper.innerHTML = "";


                wrapper.classList.add(

                    "financial-activity-created"

                );


                const status =

                    document.createElement(

                        "div"

                    );


                status.className =

                    "global-setting-field-note";


                status.textContent =

                    `✓ ${item.label} sudah dibuat`;


                wrapper.appendChild(

                    status

                );


                return;

            }


            /* =====================================
               ACTIVITY BELUM ADA
            ===================================== */

            wrapper.classList.remove(

                "financial-activity-created"

            );

        }

    );


    /* =============================================
       CEK SEMUA ACTIVITY
    ============================================= */

    const allCreated =

        ACTIVITY[direction].every(

            item =>

                existing.has(

                    normalizeValue(

                        item.name

                    )

                )

        );


    const addButton =

        sectionElement.querySelector(

            ".global-setting-add"

        );


    const form =

        sectionElement.querySelector(

            ".global-setting-form"

        );


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

    }

    else{

        if(

            addButton

        ){

            addButton.style.display =

                "";

        }

    }

}


/* =====================================================
   APPLY ACTIVITY RULE CONTROL
===================================================== */

/*
 * Activity Hutang hanya aktif jika
 * Rule Hutang sudah dibuat.
 *
 * Activity Tabungan hanya aktif jika
 * Rule Tabungan sudah dibuat.
 */

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

            /*
             * Jika activity sudah dibuat,
             * UI sudah berubah menjadi
             * status "sudah dibuat".
             */

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
   NORMALIZE ACTIVITY
===================================================== */

function normalizeActivity(

    data,

    fields,

    rules,

    direction

){

    const ruleState =

        getRuleStateFromData(

            data

        );


    const activity = [];


    fields.forEach(

        field => {

            /*
             * Checkbox tidak dicentang.
             */

            if(

                data[field.name] !== true

            ){

                return;

            }


            /*
             * Activity sudah ada di Sheet.
             *
             * Jangan masukkan lagi.
             */

            if(

                existingActivities[direction]?.has(

                    normalizeValue(

                        field.name

                    )

                )

            ){

                return;

            }


            const activityRule =

                field.activityRule ?? "";


            /* =====================================
               HUTANG
            ===================================== */

            if(

                activityRule === "hutang" &&

                ruleState.gunakanRuleHutang !== true

            ){

                return;

            }


            /* =====================================
               TABUNGAN
            ===================================== */

            if(

                activityRule === "tabungan" &&

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


    return {

        rules :

            rules,

        type :

            types.join(","),

        activity :

            activity.join(",")

    };

}


/* =====================================================
   NORMALIZE RULE
===================================================== */

/*
 * Rule hanya menghasilkan rule yang
 * BENAR-BENAR belum ada.
 *
 * Jika sudah ada di Sheet:
 *
 *     jangan buat lagi.
 */

function normalizeRule(

    data

){

    const results = [];


    const state =

        getRuleStateFromData(

            data

        );


    /* =============================================
       RULE PEMASUKAN
    ============================================= */

    if(

        state.gunakanRulePemasukan === true &&

        existingRules.rule_pemasukan !== true

    ){

        results.push({

            section :

                "financial_activity",

            data : {

                rules :

                    "rule_pemasukan",

                type :

                    "masuk",

                activity :

                    ""

            }

        });

    }


    /* =============================================
       RULE PENGELUARAN
    ============================================= */

    if(

        state.gunakanRulePengeluaran === true &&

        existingRules.rule_pengeluaran !== true

    ){

        results.push({

            section :

                "financial_activity",

            data : {

                rules :

                    "rule_pengeluaran",

                type :

                    "keluar",

                activity :

                    ""

            }

        });

    }


    /* =============================================
       RULE HUTANG
    ============================================= */

    if(

        state.gunakanRuleHutang === true &&

        existingRules.rule_hutang !== true

    ){

        results.push({

            section :

                "financial_activity",

            data : {

                rules :

                    "rule_hutang",

                type :

                    "hutang,bayar",

                activity :

                    "hutang_piutang"

            }

        });

    }


    /* =============================================
       RULE TABUNGAN
    ============================================= */

    if(

        state.gunakanRuleTabungan === true &&

        existingRules.rule_tabungan !== true

    ){

        results.push({

            section :

                "financial_activity",

            data : {

                rules :

                    "rule_tabungan",

                type :

                    "nabung,tarik",

                activity :

                    "dana_darurat,tabungan_kaleng"

            }

        });

    }


    return results;

}


/* =====================================================
   BUILD FINANCIAL SAVE ROWS
===================================================== */

/*
 * Menggabungkan:
 *
 * - Rule baru
 * - Activity baru
 *
 * Tetapi tetap menjaga:
 *
 *     satu rule = satu row
 *
 * Untuk rule yang sudah ada,
 * aktivitas baru digabung ke row
 * rule tersebut.
 */

function buildFinancialRows(

    data,

    rawData

){

    const rows = [];


    /*
     * Ambil state rule terbaru.
     */

    const state =

        getRuleStateFromData(

            rawData

        );


    /*
     * Activity dari kedua form.
     */

    const pemasukan =

        data.find(

            item =>

                item?.data?.rules ===

                "rule_pemasukan"

        )?.data;


    const pengeluaran =

        data.find(

            item =>

                item?.data?.rules ===

                "rule_pengeluaran"

        )?.data;


    /* =============================================
       RULE PEMASUKAN
    ============================================= */

    if(

        state.gunakanRulePemasukan === true

    ){

        const newActivities =

            splitValues(

                pemasukan?.activity

            );


        const allActivities =

            new Set(

                [

                    ...existingActivities.pemasukan,

                    ...newActivities

                ]

            );


        rows.push({

            section :

                "financial_activity",

            data : {

                rules :

                    "rule_pemasukan",

                type :

                    buildIncomeTypes(

                        state

                    ),

                activity :

                    Array.from(

                        allActivities

                    ).join(",")

            }

        });

    }


    /* =============================================
       RULE PENGELUARAN
    ============================================= */

    if(

        state.gunakanRulePengeluaran === true

    ){

        const newActivities =

            splitValues(

                pengeluaran?.activity

            );


        const allActivities =

            new Set(

                [

                    ...existingActivities.pengeluaran,

                    ...newActivities

                ]

            );


        rows.push({

            section :

                "financial_activity",

            data : {

                rules :

                    "rule_pengeluaran",

                type :

                    buildExpenseTypes(

                        state

                    ),

                activity :

                    Array.from(

                        allActivities

                    ).join(",")

            }

        });

    }


    /* =============================================
       RULE HUTANG
    ============================================= */

    if(

        state.gunakanRuleHutang === true

    ){

        rows.push({

            section :

                "financial_activity",

            data : {

                rules :

                    "rule_hutang",

                type :

                    "hutang,bayar",

                activity :

                    "hutang_piutang"

            }

        });

    }


    /* =============================================
       RULE TABUNGAN
    ============================================= */

    if(

        state.gunakanRuleTabungan === true

    ){

        rows.push({

            section :

                "financial_activity",

            data : {

                rules :

                    "rule_tabungan",

                type :

                    "nabung,tarik",

                activity :

                    buildSavingActivities(

                        rawData

                    )

            }

        });

    }


    return rows;

}


/* =====================================================
   BUILD INCOME TYPES
===================================================== */

function buildIncomeTypes(

state

){

    const types = [

        "masuk"

    ];


    if(

        state.gunakanRuleHutang === true

    ){

        types.push(

            "hutang"

        );

    }


    if(

        state.gunakanRuleTabungan === true

    ){

        types.push(

            "tarik"

        );

    }


    return types.join(",");

}


/* =====================================================
   BUILD EXPENSE TYPES
===================================================== */

function buildExpenseTypes(

state

){

    const types = [

        "keluar"

    ];


    if(

        state.gunakanRuleHutang === true

    ){

        types.push(

            "bayar"

        );

    }


    if(

        state.gunakanRuleTabungan === true

    ){

        types.push(

            "nabung"

        );

    }


    return types.join(",");

}


/* =====================================================
   BUILD SAVING ACTIVITIES
===================================================== */

function buildSavingActivities(

data

){

    const result = new Set();


    const pemasukan =

        data.find(

            item =>

                item?.data?.rules ===

                "rule_pemasukan"

        )?.data;


    const pengeluaran =

        data.find(

            item =>

                item?.data?.rules ===

                "rule_pengeluaran"

        )?.data;


    [

        ...splitValues(

            pemasukan?.activity

        ),

        ...splitValues(

            pengeluaran?.activity

        )

    ].forEach(

        activity => {

            if(

                activity ===

                    "dana_darurat" ||

                activity ===

                    "tabungan_kaleng"

            ){

                result.add(

                    activity

                );

            }

        }

    );


    /*
     * Jika sudah ada sebelumnya,
     * tetap pertahankan.
     */

    [
        "dana_darurat",
        "tabungan_kaleng"
    ].forEach(

        activity => {

            if(

                existingActivities.pemasukan.has(

                    activity

                ) ||

                existingActivities.pengeluaran.has(

                    activity

                )

            ){

                result.add(

                    activity

                );

            }

        }

    );


    return Array.from(

        result

    ).join(",");

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

    save :

        async function(

            payload,

            context

        ){

            /*
             * Controller tetap menjadi
             * pemanggil utama.
             *
             * Kita hanya mengganti cara
             * penyimpanan Financial.
             */

            const rawData =

                Array.isArray(

                    context?.data

                )

                    ?

                context.data

                    :

                [];


            const rows =

                buildFinancialRows(

                    payload,

                    rawData

                );


            if(

                rows.length === 0

            ){

                return {

                    success :

                        true,

                    message :

                        "Tidak ada perubahan Financial."

                };

            }


            const result =

                await saveFinancialSetting(

                    context?.workspace ||

                        "financial",

                    existingRules,

                    rows

                );


            /*
             * Update cache setelah save.
             *
             * Agar selama sesi yang sama
             * rule/activity langsung dianggap
             * sudah dibuat.
             */

            rows.forEach(

                entry => {

                    const rule =

                        normalizeValue(

                            entry?.data?.rules

                        );


                    if(

                        rule ===

                        "rule_pemasukan"

                    ){

                        existingRules.rule_pemasukan =

                            true;

                    }


                    if(

                        rule ===

                        "rule_pengeluaran"

                    ){

                        existingRules.rule_pengeluaran =

                            true;

                    }


                    if(

                        rule ===

                        "rule_hutang"

                    ){

                        existingRules.rule_hutang =

                            true;

                    }


                    if(

                        rule ===

                        "rule_tabungan"

                    ){

                        existingRules.rule_tabungan =

                            true;

                    }

                }

            );


            return result;

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

                "Buat rule Financial terlebih dahulu. Rule yang sudah tersedia akan dikunci secara otomatis.",


            addLabel :

                "＋ Tambah Rule",


            formAddLabel :

                "＋ Simpan Rule",


            autoCloseForm :

                true,


            persist :

                false,


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
               RENDER
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

                    form,

                    sectionElement

                ){

                    /*
                     * Pastikan Sheet sudah
                     * dibaca terlebih dahulu.
                     */

                    await refreshFinancialState();


                    /*
                     * Rule control.
                     */

                    applyActivityRuleControl(

                        form,

                        getFinancialRuleState()

                    );


                    /*
                     * Activity yang sudah ada.
                     */

                    applyActivityUIState(

                        sectionElement,

                        "pemasukan"

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

                    form,

                    sectionElement

                ){

                    await refreshFinancialState();


                    applyActivityRuleControl(

                        form,

                        getFinancialRuleState()

                    );


                    applyActivityUIState(

                        sectionElement,

                        "pengeluaran"

                    );

                }

        }

    ]

};
