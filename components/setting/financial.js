/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Financial
   File         : financial.js
   Version      : 5.1.0

   Description :
   Financial Setting

   Flow :
   1. Baca data workspace melalui Global API
   2. Baca DATA sheet financial_activity
   3. Cek rule yang sudah tersedia
   4. Cek activity yang sudah tersedia
   5. Rule Pemasukan dan Pengeluaran selalu
      tampil sebagai checkbox locked
   6. Rule Hutang dan Tabungan dapat dipilih
   7. Rule Hutang dibuat otomatis jika dipilih
   8. Rule Tabungan dibuat otomatis jika dipilih
   9. Setiap Activity menghasilkan satu result:
        rules
        type
        activity
   10. Activity yang sudah ada:
        - checked
        - disabled
   11. Google Sheets menjadi sumber kebenaran

   Principle :
   - Google Sheets menjadi sumber kebenaran.
   - Tidak menggunakan localStorage sebagai state.
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

   Activity Normal :
   ------------------------------------------
   Pemasukan :
        gaji
        penghasilan_lain
        ceperan
        pemberian

   Pengeluaran :
        belanja_harian
        belanja_bulanan
        kebutuhan_anak
        tagihan
        belanja_online
        biaya_perbaikan
        makan_diluar
        refreshing
        biaya_tahunan
        pengeluaran_lain
        pengeluaran_tak_terduga
        beli_rokok
        beli_bensin
        beli_kopi
        iuran
        cicilan
        sedekah
        jajan
        biaya_berobat

   Auto Rule :
   ------------------------------------------
   rule_hutang :
        hutang | hutang_piutang
        bayar  | hutang_piutang

   rule_tabungan :
        tarik  | dana_darurat
        nabung | dana_darurat
        tarik  | tabungan_kaleng
        nabung | tabungan_kaleng
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

                "pengeluaran_tak_terduga",

            label :

                "Pengeluaran Tak Terduga"
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

                "jajan",

            label :

                "Jajan"
        },


        {
            name :

                "biaya_berobat",

            label :

                "Biaya Berobat"
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
 * Sumber kebenaran :
 *
 * Google Sheets
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

                item.name

        })

    );

}



/* =====================================================
   GET DIRECTION RULE
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

/*
 * Satu checkbox activity
 * menghasilkan satu row:
 *
 * {
 *     rules :
 *         "rule_pemasukan",
 *
 *     type :
 *         "masuk",
 *
 *     activity :
 *         "gaji"
 * }
 *
 * Activity yang sudah ada di Sheet
 * tidak dibuat ulang.
 */

function normalizeActivity(

    data,

    fields,

    ruleName,

    direction

){

    const type =

        direction === "pemasukan"

            ?

        "masuk"

            :

        "keluar";


    const result = [];


    fields.forEach(

        field => {

            if(

                data[field.name] !== true

            ){

                return;

            }


            const activity =

                normalizeValue(

                    field.name

                );


            /* =====================================
               ACTIVITY SUDAH ADA
            ===================================== */

            if(

                existingActivities[ruleName]?.has(

                    activity

                )

            ){

                return;

            }


            /* =====================================
               CREATE ONE ROW
            ===================================== */

            result.push({

                rules :

                    ruleName,

                type :

                    type,

                activity :

                    activity

            });

        }

    );


    return result;

}



/* =====================================================
   NORMALIZE RULE
===================================================== */

/*
 * Rule Pemasukan dan Pengeluaran :
 *
 *     bukan dibuat sebagai row tersendiri.
 *
 * Rule tersebut menjadi nyata ketika
 * Activity dipilih.
 *
 * Contoh:
 *
 * rule_pemasukan | masuk | gaji
 *
 *
 * Rule Hutang :
 *
 *     rule_hutang | hutang | hutang_piutang
 *     rule_hutang | bayar  | hutang_piutang
 *
 *
 * Rule Tabungan :
 *
 *     rule_tabungan | tarik  | dana_darurat
 *     rule_tabungan | nabung | dana_darurat
 *     rule_tabungan | tarik  | tabungan_kaleng
 *     rule_tabungan | nabung | tabungan_kaleng
 */

function normalizeRule(

    data

){

    const result = [];


    /* =============================================
       RULE HUTANG
    ============================================= */

    if(

        data.gunakanRuleHutang === true &&

        existingRules.rule_hutang !== true

    ){

        result.push({

            rules :

                "rule_hutang",

            type :

                "hutang",

            activity :

                "hutang_piutang"

        });


        result.push({

            rules :

                "rule_hutang",

            type :

                "bayar",

            activity :

                "hutang_piutang"

        });

    }


    /* =============================================
       RULE TABUNGAN
    ============================================= */

    if(

        data.gunakanRuleTabungan === true &&

        existingRules.rule_tabungan !== true

    ){

        result.push({

            rules :

                "rule_tabungan",

            type :

                "tarik",

            activity :

                "dana_darurat"

        });


        result.push({

            rules :

                "rule_tabungan",

            type :

                "nabung",

            activity :

                "dana_darurat"

        });


        result.push({

            rules :

                "rule_tabungan",

            type :

                "tarik",

            activity :

                "tabungan_kaleng"

        });


        result.push({

            rules :

                "rule_tabungan",

            type :

                "nabung",

            activity :

                "tabungan_kaleng"

        });

    }


    return result;

}



/* =====================================================
   APPLY RULE UI STATE
===================================================== */

/*
 * Rule Pemasukan :
 *
 *     checked
 *     disabled
 *
 * Rule Pengeluaran :
 *
 *     checked
 *     disabled
 *
 * Rule Hutang / Tabungan :
 *
 *     jika sudah ada :
 *         checked
 *         disabled
 *
 *     jika belum ada :
 *         unchecked
 *         enabled
 *
 * UI hanya mengikuti state.
 * Source of truth tetap Sheet.
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


    const ruleConfig = {

        gunakanRulePemasukan : {

            rule :

                "rule_pemasukan",

            fixed :

                true

        },


        gunakanRulePengeluaran : {

            rule :

                "rule_pengeluaran",

            fixed :

                true

        },


        gunakanRuleHutang : {

            rule :

                "rule_hutang",

            fixed :

                false

        },


        gunakanRuleTabungan : {

            rule :

                "rule_tabungan",

            fixed :

                false

        }

    };


    Object.entries(

        ruleConfig

    ).forEach(

        ([fieldName, config]) => {

            const wrapper =

                sectionElement.querySelector(

                    `.global-setting-field[data-field="${fieldName}"]`

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


            /* =====================================
               FIXED RULE
            ===================================== */

            if(

                config.fixed

            ){

                input.checked =

                    true;


                input.disabled =

                    true;


                wrapper.classList.add(

                    "rule-locked"

                );


                return;

            }


            /* =====================================
               OPTIONAL RULE SUDAH ADA
            ===================================== */

            const exists =

                state[config.rule] === true;


            if(

                exists

            ){

                input.checked =

                    true;


                input.disabled =

                    true;


                wrapper.classList.add(

                    "rule-locked"

                );

            }

            else{

                input.checked =

                    false;


                input.disabled =

                    false;


                wrapper.classList.remove(

                    "rule-locked"

                );

            }

        }

    );


    /* =============================================
       CHECK ALL REAL RULE
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

            form.innerHTML = "";

        }


        return;

    }


    if(

        addButton

    ){

        addButton.style.display =

            "";

    }

}



/* =====================================================
   APPLY EXISTING ACTIVITY STATE
===================================================== */

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


            input.checked =

                false;


            input.disabled =

                false;


            wrapper.classList.remove(

                "financial-activity-created"

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

                "rules",

                "type",

                "activity"

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

                /*
                 * Pastikan state Sheet sudah tersedia.
                 *
                 * getRuleState() juga dipanggil oleh
                 * Global Setting Controller.
                 */

                if(

                    !Array.isArray(

                        financialActivityData

                    )

                    ||

                    financialActivityData.length === 0

                ){

                    try{

                        await refreshFinancialState();

                    }

                    catch(error){

                        console.error(

                            "Financial Rule Render Error:",

                            error

                        );

                    }

                }


                applyRuleUIState(

                    sectionElement,

                    existingRules

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

                function(

                    form

                ){

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

    ruleStateFields : {

        rule_pemasukan : {

            field :

                "gunakanRulePemasukan",

            label :

                "Rule Pemasukan",

            replaceWithStatus :

                false

        },


        rule_pengeluaran : {

            field :

                "gunakanRulePengeluaran",

            label :

                "Rule Pengeluaran",

            replaceWithStatus :

                false

        },


        rule_hutang : {

            field :

                "gunakanRuleHutang",

            label :

                "Rule Hutang",

            replaceWithStatus :

                false

        },


        rule_tabungan : {

            field :

                "gunakanRuleTabungan",

            label :

                "Rule Tabungan",

            replaceWithStatus :

                false

        }

    },


    /* =================================================
       PREPARE SAVE
    ================================================= */

    /*
     * Global Controller akan:
     *
     * 1. collect semua result
     * 2. menjalankan financial auto rule
     * 3. membuang persist:false
     * 4. memanggil prepareSave()
     *
     * Di sini kita mengambil result
     * dari financial_rules yang memang
     * sengaja persist:false.
     *
     * Rule Hutang dan Rule Tabungan
     * kemudian dimasukkan ke payload final.
     *
     * Dengan cara ini controller tidak perlu
     * mengetahui struktur khusus Financial.
     */

    prepareSave :

        function(

            payload,

            context

        ){

            const sourceData =

                Array.isArray(

                    context?.data

                )

                    ?

                context.data

                    :

                [];


            /* =========================================
               AMBIL AUTO RULE
            ========================================= */

            const autoRules =

                sourceData

                    .filter(

                        item =>

                            item?.section ===

                            "financial_rules"

                    )

                    .map(

                        item =>

                            item?.data

                    )

                    .filter(

                        item =>

                            item &&

                            typeof item ===

                                "object" &&

                            item.rules &&

                            item.type &&

                            item.activity

                    );


            /* =========================================
               HAPUS LEGACY AUTO RULE
            ========================================= */

            const cleanPayload =

                Array.isArray(

                    payload

                )

                    ?

                payload.filter(

                    item =>

                        item?.section !==

                            "financial_auto_rule_hutang"

                        &&

                        item?.section !==

                            "financial_auto_rule_tabungan"

                )

                    :

                [];


            /* =========================================
               DEDUPLICATE
            ========================================= */

            const result =

                [

                    ...cleanPayload

                ];


            const existingPayloadKeys =

                new Set(

                    result.map(

                        item => {

                            const data =

                                item?.data ??

                                {};

                            return [

                                normalizeValue(

                                    data.rules

                                ),

                                normalizeValue(

                                    data.type

                                ),

                                normalizeValue(

                                    data.activity

                                )

                            ].join("|");

                        }

                    )

                );


            autoRules.forEach(

                rule => {

                    const key = [

                        normalizeValue(

                            rule.rules

                        ),

                        normalizeValue(

                            rule.type

                        ),

                        normalizeValue(

                            rule.activity

                        )

                    ].join("|");


                    if(

                        existingPayloadKeys.has(

                            key

                        )

                    ){

                        return;

                    }


                    result.push({

                        section :

                            "financial_rules_auto",

                        data : {

                            rules :

                                rule.rules,

                            type :

                                rule.type,

                            activity :

                                rule.activity

                        }

                    });


                    existingPayloadKeys.add(

                        key

                    );

                }

            );


            console.log(

                "=========================================="

            );


            console.log(

                "FINANCIAL PREPARE SAVE"

            );


            console.log(

                "PAYLOAD BEFORE:",

                payload

            );


            console.log(

                "FINANCIAL AUTO RULE:",

                autoRules

            );


            console.log(

                "PAYLOAD AFTER:",

                result

            );


            console.log(

                "=========================================="

            );


            return result;

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
