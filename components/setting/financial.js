/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Financial
   File         : financial.js
   Version      : 5.0.0

   Description :
   Financial Setting

   Flow :
   1. Baca data workspace melalui Global API
   2. Baca DATA sheet financial_activity
   3. Cek rule yang sudah tersedia
   4. Cek activity yang sudah tersedia
   5. Rule yang sudah ada menjadi:
        ✓ Rule ... sudah dibuat
   6. Activity yang sudah ada:
        - tetap checked
        - disabled
   7. Rule / activity baru tetap dapat dibuat
   8. Jika semua rule sudah ada, form Rule disembunyikan

   Principle :
   - Google Sheets menjadi sumber kebenaran.
   - Tidak menggunakan DOM sebagai sumber state.
   - Tidak menggunakan saveFinancialSetting().
   - Tidak mengubah Edit Input.
   - Tidak mengubah Normal Input.
   - Tidak ada Spreadsheet ID hardcode.
   - Tidak ada URL Spreadsheet hardcode.

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

const FINANCIAL_RULE_LABEL = {

    rule_pemasukan :

        "Rule Pemasukan",

    rule_pengeluaran :

        "Rule Pengeluaran",

    rule_hutang :

        "Rule Hutang",

    rule_tabungan :

        "Rule Tabungan"

};



/* =====================================================
   EXISTING RULE STATE
===================================================== */

/*
 * Sumber kebenaran:
 *
 *     Google Sheets
 *
 * Bukan localStorage.
 * Bukan DOM.
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
   EXISTING ACTIVITY STATE
===================================================== */

/*
 * Menyimpan activity yang sudah
 * terdapat pada financial_activity.
 *
 * Struktur:
 *
 * {
 *     rule_pemasukan : Set,
 *     rule_pengeluaran : Set,
 *     rule_hutang : Set,
 *     rule_tabungan : Set
 * }
 */

let existingActivities = {

    rule_pemasukan :

        new Set(),

    rule_pengeluaran :

        new Set(),

    rule_hutang :

        new Set(),

    rule_tabungan :

        new Set()

};



/* =====================================================
   FINANCIAL ACTIVITY DATA CACHE
===================================================== */

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

/*
 * Struktur workspace:
 *
 * sheets[0] = RAW
 * sheets[1] = DATA
 *
 * Financial:
 *
 * sheets[0] = financial
 * sheets[1] = financial_activity
 */

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
   PARSE CSV VALUE
===================================================== */

function parseCSV(

    value

){

    const normalized =

        normalizeValue(

            value

        );


    if(

        !normalized

    ){

        return [];

    }


    return normalized

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
   GET EXISTING RULES + ACTIVITY
===================================================== */

/*
 * Membaca seluruh financial_activity.
 *
 * Contoh sheet:
 *
 * rules              type              activity
 *
 * rule_pemasukan     masuk             gaji,ceperan
 * rule_pengeluaran   keluar            belanja_harian
 * rule_hutang        hutang,bayar      hutang_piutang
 *
 * Hasil:
 *
 * existingRules.rule_pemasukan = true
 * existingRules.rule_pengeluaran = true
 * existingRules.rule_hutang = true
 *
 * Activity juga dimasukkan ke Set.
 */

function readExistingFinancialState(

    rows = financialActivityData

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

        rule_pemasukan :

            false,

        rule_pengeluaran :

            false,

        rule_hutang :

            false,

        rule_tabungan :

            false

    };


    const activities = {

        rule_pemasukan :

            new Set(),

        rule_pengeluaran :

            new Set(),

        rule_hutang :

            new Set(),

        rule_tabungan :

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


            if(

                Object.prototype.hasOwnProperty.call(

                    rules,

                    rule

                )

            ){

                rules[rule] =

                    true;

            }


            const activityValue =

                getColumnValue(

                    row,

                    "activity"

                );


            const rowActivities =

                parseCSV(

                    activityValue

                );


            if(

                Object.prototype.hasOwnProperty.call(

                    activities,

                    rule

                )

            ){

                rowActivities.forEach(

                    activity => {

                        activities[rule].add(

                            activity

                        );

                    }

                );

            }

        }

    );


    return {

        rules :

            rules,

        activities :

            activities

    };

}



/* =====================================================
   REFRESH FINANCIAL STATE
===================================================== */

async function refreshFinancialState(){

    try{

        const data =

            await readFinancialActivityData();


        const state =

            readExistingFinancialState(

                data

            );


        existingRules =

            state.rules;


        existingActivities =

            state.activities;


        console.log(

            "=========================================="

        );


        console.log(

            "FINANCIAL SETTING - EXISTING RULES:",

            existingRules

        );


        console.log(

            "FINANCIAL SETTING - EXISTING ACTIVITIES:",

            {

                rule_pemasukan :

                    Array.from(

                        existingActivities.rule_pemasukan

                    ),

                rule_pengeluaran :

                    Array.from(

                        existingActivities.rule_pengeluaran

                    ),

                rule_hutang :

                    Array.from(

                        existingActivities.rule_hutang

                    ),

                rule_tabungan :

                    Array.from(

                        existingActivities.rule_tabungan

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

            rule_pemasukan :

                new Set(),

            rule_pengeluaran :

                new Set(),

            rule_hutang :

                new Set(),

            rule_tabungan :

                new Set()

        };


        throw error;

    }

}



/* =====================================================
   GET FINANCIAL RULE STATE
===================================================== */

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
   GET RULE FROM DIRECTION
===================================================== */

function getDirectionRule(

    direction

){

    if(

        direction === "pemasukan"

    ){

        return "rule_pemasukan";

    }


    if(

        direction === "pengeluaran"

    ){

        return "rule_pengeluaran";

    }


    return "";

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

function normalizeRule(

    data

){

    return {

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

}



/* =====================================================
   APPLY RULE UI STATE
===================================================== */

/*
 * Sama seperti Kas.
 *
 * Jika rule sudah ada:
 *
 *     ✓ Rule Pemasukan sudah dibuat
 *
 * Checkbox dihapus dari UI.
 *
 * Jika semua rule sudah ada:
 *
 *     Form + tombol Tambah Rule
 *     disembunyikan.
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

        FINANCIAL_RULE_LABEL

    ).forEach(

        ruleType => {

            const field =

                sectionElement.querySelector(

                    `.global-setting-field[data-field="${ruleType}"]`

                );


            /*
             * Financial menggunakan nama field:
             *
             * gunakanRulePemasukan
             * gunakanRulePengeluaran
             * gunakanRuleHutang
             * gunakanRuleTabungan
             */

            let wrapper = field;


            if(

                ruleType === "rule_pemasukan"

            ){

                wrapper =

                    sectionElement.querySelector(

                        '.global-setting-field[data-field="gunakanRulePemasukan"]'

                    );

            }


            if(

                ruleType === "rule_pengeluaran"

            ){

                wrapper =

                    sectionElement.querySelector(

                        '.global-setting-field[data-field="gunakanRulePengeluaran"]'

                    );

            }


            if(

                ruleType === "rule_hutang"

            ){

                wrapper =

                    sectionElement.querySelector(

                        '.global-setting-field[data-field="gunakanRuleHutang"]'

                    );

            }


            if(

                ruleType === "rule_tabungan"

            ){

                wrapper =

                    sectionElement.querySelector(

                        '.global-setting-field[data-field="gunakanRuleTabungan"]'

                    );

            }


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

                    `✓ ${FINANCIAL_RULE_LABEL[ruleType]} sudah dibuat`;


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
       CHECK ALL RULE
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
       SEMUA RULE SUDAH ADA
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
       MASIH ADA RULE
    ============================================= */

    if(

        addButton

    ){

        addButton.style.display =

            "";

    }

}



/* =====================================================
   APPLY ACTIVITY EXISTING STATE
===================================================== */

/*
 * Activity yang sudah terdapat
 * di Sheet:
 *
 *     checked
 *     disabled
 *
 * Activity baru:
 *
 *     unchecked
 *     enabled
 *
 * Contoh:
 *
 * Sheet:
 *
 * rule_pemasukan
 * activity = gaji,ceperan
 *
 * UI:
 *
 * Gaji       ☑ disabled
 * Ceperan    ☑ disabled
 * Pemberian  ☐ enabled
 */

function applyExistingActivityState(

    form,

    ruleName,

    fields

){

    if(

        !form

    ){

        return;

    }


    const existing =

        existingActivities[ruleName] ||

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


            /* =====================================
               ACTIVITY SUDAH ADA
            ===================================== */

            if(

                alreadyExists

            ){

                input.checked =

                    true;


                input.disabled =

                    true;


                wrapper.classList.add(

                    "financial-activity-created"

                );


                return;

            }


            /* =====================================
               ACTIVITY BELUM ADA
            ===================================== */

            /*
             * Jangan mematikan activity baru
             * hanya karena activity lain
             * sudah dibuat.
             */

            wrapper.classList.remove(

                "financial-activity-created"

            );


            /*
             * Rule Hutang / Tabungan tetap
             * mengikuti status rule.
             */

            if(

                fieldConfig.activityRule === "hutang"

            ){

                input.disabled =

                    existingRules.rule_hutang !== true;


                if(

                    existingRules.rule_hutang !== true

                ){

                    input.checked =

                        false;

                }

                return;

            }


            if(

                fieldConfig.activityRule === "tabungan"

            ){

                input.disabled =

                    existingRules.rule_tabungan !== true;


                if(

                    existingRules.rule_tabungan !== true

                ){

                    input.checked =

                        false;

                }

                return;

            }


            input.disabled =

                false;

        }

    );

}



/* =====================================================
   APPLY ACTIVITY RULE CONTROL
===================================================== */

function applyActivityRuleControl(

    form,

    ruleData,

    ruleName,

    fields

){

    if(

        !form

    ){

        return;

    }


    const ruleHutang =

        Boolean(

            ruleData?.gunakanRuleHutang

        );


    const ruleTabungan =

        Boolean(

            ruleData?.gunakanRuleTabungan

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


            const alreadyExists =

                existingActivities[ruleName]?.has(

                    normalizeValue(

                        field.dataset?.field ??

                        ""

                    )

                );


            /*
             * Existing activity HARUS tetap
             * disabled walaupun rule aktif.
             */

            if(

                alreadyExists

            ){

                input.checked =

                    true;

                input.disabled =

                    true;

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


            const alreadyExists =

                existingActivities[ruleName]?.has(

                    normalizeValue(

                        field.dataset?.field ??

                        ""

                    )

                );


            if(

                alreadyExists

            ){

                input.checked =

                    true;

                input.disabled =

                    true;

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
                     * State sudah dibaca oleh
                     * section Rule.
                     *
                     * Tetapi tetap pastikan
                     * data tersedia apabila
                     * section ini dirender
                     * langsung.
                     */

                    if(

                        !Array.isArray(

                            financialActivityData

                        )

                    ){

                        await refreshFinancialState();

                    }


                    applyExistingActivityState(

                        form,

                        "rule_pemasukan",

                        this.fields

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

                    if(

                        !Array.isArray(

                            financialActivityData

                        )

                    ){

                        await refreshFinancialState();

                    }


                    applyExistingActivityState(

                        form,

                        "rule_pengeluaran",

                        this.fields

                    );

                }

        }

    ],



    /* =================================================
       PERSISTENT RULE STATE
    ================================================= */

    /*
     * Digunakan Global Setting Controller
     * untuk mengetahui rule mana yang
     * sudah dibuat.
     *
     * State berasal dari Google Sheets.
     */

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
       GET RULE STATE
    ================================================= */

    async getRuleState(){

        try{

            await refreshFinancialState();

        }

        catch(error){

            console.error(

                "FinancialSetting.getRuleState:",

                error

            );

        }


        return {

            rule_pemasukan :

                existingRules.rule_pemasukan,

            rule_pengeluaran :

                existingRules.rule_pengeluaran,

            rule_hutang :

                existingRules.rule_hutang,

            rule_tabungan :

                existingRules.rule_tabungan

        };

    }

};
