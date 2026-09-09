/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Financial
   File         : financial.js
   Version      : 5.0.0

   Description :
   Financial Setting

   RULE STATE :

   financial_activity Sheet menjadi sumber utama
   untuk menentukan Rule yang sudah dibuat.

   Jika Rule sudah ada di Sheet :
   - checkbox checked
   - checkbox disabled

   Jika Rule belum ada :
   - checkbox tetap aktif
   - user dapat membuat Rule tersebut

   Fixed Rule :

   rule_pemasukan
   rule_pengeluaran
   rule_hutang
   rule_tabungan

   IMPORTANT :

   financial_rules hanya digunakan sebagai
   configuration/state frontend.

   financial_rules TIDAK menjadi payload
   result ke backend.

   Activity tetap divalidasi ulang saat
   normalize agar disabled frontend
   bukan satu-satunya pengaman.
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

        defaultValue :
            true

    },

    rule_pengeluaran : {

        field :
            "gunakanRulePengeluaran",

        label :
            "Rule Pengeluaran",

        defaultValue :
            true

    },

    rule_hutang : {

        field :
            "gunakanRuleHutang",

        label :
            "Rule Hutang",

        defaultValue :
            false

    },

    rule_tabungan : {

        field :
            "gunakanRuleTabungan",

        label :
            "Rule Tabungan",

        defaultValue :
            false

    }

};


/* =====================================================
   FINANCIAL ACTIVITY SHEET
===================================================== */

const FINANCIAL_ACTIVITY_SHEET_INDEX = 1;


/* =====================================================
   RULE STATE

   existingRuleState :
   status Rule berdasarkan Sheet.

   selectedRuleState :
   status Rule yang sedang digunakan oleh
   form saat ini.

   Ini penting supaya Rule baru yang dicentang
   langsung dapat mengaktifkan Activity terkait
   tanpa harus menunggu Sheet berubah.
===================================================== */

let existingRuleState = {

    gunakanRulePemasukan :
        false,

    gunakanRulePengeluaran :
        false,

    gunakanRuleHutang :
        false,

    gunakanRuleTabungan :
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

    if(!workspace){

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
        workspace.sheets.length <=
        FINANCIAL_ACTIVITY_SHEET_INDEX
    ){

        throw new Error(
            'Workspace "financial" tidak memiliki Financial Activity sheet.'
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
            workspace.sheets[
                FINANCIAL_ACTIVITY_SHEET_INDEX
            ]

    };

}


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
        Object.keys(row).find(

            currentKey =>

                normalizeValue(
                    currentKey
                ) === target

        );


    if(!key){

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

            sheets.activitySheet

        );


    if(
        !result ||
        result.success !== true
    ){

        throw new Error(
            "Gagal membaca data Financial Activity."
        );

    }


    if(
        Array.isArray(
            result.data
        )
    ){

        return result.data;

    }


    if(
        Array.isArray(
            API.data
        )
    ){

        return API.data;

    }


    return [];

}


/* =====================================================
   READ EXISTING RULES
=====================================================

   Hanya membaca kolom :

   rules

   Tidak membaca id.

   Karena identity Financial Rule adalah :

   rule_pemasukan
   rule_pengeluaran
   rule_hutang
   rule_tabungan
===================================================== */

async function readExistingFinancialRules(){

    const rows =
        await readFinancialActivity();


    const state = {

        gunakanRulePemasukan :
            false,

        gunakanRulePengeluaran :
            false,

        gunakanRuleHutang :
            false,

        gunakanRuleTabungan :
            false

    };


    if(!Array.isArray(rows)){

        return state;

    }


    rows.forEach(

        row => {

            const rule =
                getColumnValue(
                    row,
                    "rules"
                );


            if(
                rule ===
                "rule_pemasukan"
            ){

                state.gunakanRulePemasukan =
                    true;

            }


            if(
                rule ===
                "rule_pengeluaran"
            ){

                state.gunakanRulePengeluaran =
                    true;

            }


            if(
                rule ===
                "rule_hutang"
            ){

                state.gunakanRuleHutang =
                    true;

            }


            if(
                rule ===
                "rule_tabungan"
            ){

                state.gunakanRuleTabungan =
                    true;

            }

        }

    );


    return state;

}


/* =====================================================
   INITIALIZE RULE STATE
===================================================== */

async function initializeFinancialRuleState(){

    try{

        existingRuleState =
            await readExistingFinancialRules();

    }

    catch(error){

        console.error(
            "Financial Rule Sheet Error:",
            error
        );


        existingRuleState = {

            gunakanRulePemasukan :
                false,

            gunakanRulePengeluaran :
                false,

            gunakanRuleHutang :
                false,

            gunakanRuleTabungan :
                false

        };

    }


    /* =============================================
       RULE YANG SUDAH ADA
       SELALU AKTIF
    ============================================= */

    selectedRuleState = {

        gunakanRulePemasukan :

            existingRuleState
                .gunakanRulePemasukan === true
                ? true
                : true,


        gunakanRulePengeluaran :

            existingRuleState
                .gunakanRulePengeluaran === true
                ? true
                : true,


        gunakanRuleHutang :

            existingRuleState
                .gunakanRuleHutang === true,


        gunakanRuleTabungan :

            existingRuleState
                .gunakanRuleTabungan === true

    };


    return existingRuleState;

}


/* =====================================================
   GET FINANCIAL RULE STATE
===================================================== */

function getFinancialRuleState(){

    return {

        gunakanRulePemasukan :
            Boolean(
                selectedRuleState
                    .gunakanRulePemasukan
            ),

        gunakanRulePengeluaran :
            Boolean(
                selectedRuleState
                    .gunakanRulePengeluaran
            ),

        gunakanRuleHutang :
            Boolean(
                selectedRuleState
                    .gunakanRuleHutang
            ),

        gunakanRuleTabungan :
            Boolean(
                selectedRuleState
                    .gunakanRuleTabungan
            )

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

                activityRule ===
                "hutang"

                &&

                ruleState
                    .gunakanRuleHutang !== true

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

                ruleState
                    .gunakanRuleTabungan !== true

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

        direction ===
        "pemasukan"

    ){

        types.push(
            "masuk"
        );


        if(

            ruleState
                .gunakanRuleHutang === true

        ){

            types.push(
                "hutang"
            );

        }


        if(

            ruleState
                .gunakanRuleTabungan === true

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

            ruleState
                .gunakanRuleHutang === true

        ){

            types.push(
                "bayar"
            );

        }


        if(

            ruleState
                .gunakanRuleTabungan === true

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

       Hanya untuk UI.
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

    /* =============================================
       RULE YANG SUDAH ADA DI SHEET
       TIDAK BOLEH DIMATIKAN
    ============================================= */

    selectedRuleState = {

        gunakanRulePemasukan :

            existingRuleState
                .gunakanRulePemasukan === true

                ?

                true

                :

                Boolean(
                    data.gunakanRulePemasukan
                ),


        gunakanRulePengeluaran :

            existingRuleState
                .gunakanRulePengeluaran === true

                ?

                true

                :

                Boolean(
                    data.gunakanRulePengeluaran
                ),


        gunakanRuleHutang :

            existingRuleState
                .gunakanRuleHutang === true

                ?

                true

                :

                Boolean(
                    data.gunakanRuleHutang
                ),


        gunakanRuleTabungan :

            existingRuleState
                .gunakanRuleTabungan === true

                ?

                true

                :

                Boolean(
                    data.gunakanRuleTabungan
                )

    };


    return {

        gunakanRulePemasukan :

            selectedRuleState
                .gunakanRulePemasukan,

        gunakanRulePengeluaran :

            selectedRuleState
                .gunakanRulePengeluaran,

        gunakanRuleHutang :

            selectedRuleState
                .gunakanRuleHutang,

        gunakanRuleTabungan :

            selectedRuleState
                .gunakanRuleTabungan

    };

}


/* =====================================================
   FIND FIELD INPUT
===================================================== */

function findRuleInput(

    form,

    fieldName

){

    if(!form){

        return null;

    }


    return (

        form.querySelector(
            `[data-field="${fieldName}"] input[type="checkbox"]`
        )

        ||

        form.querySelector(
            `input[name="${fieldName}"]`
        )

        ||

        form.querySelector(
            `#${fieldName}`
        )

    );

}


/* =====================================================
   APPLY RULE STATE TO FORM
===================================================== */

function applyRuleStateToForm(

    form

){

    if(!form){

        return;

    }


    Object.entries(
        FINANCIAL_RULES
    ).forEach(

        ([ruleKey, config]) => {

            const input =
                findRuleInput(
                    form,
                    config.field
                );


            if(!input){

                return;

            }


            const exists =
                existingRuleState[
                    config.field
                ] === true;


            /* =====================================
               RULE SUDAH ADA
            ===================================== */

            if(exists){

                input.checked =
                    true;

                input.disabled =
                    true;

                input.setAttribute(
                    "data-rule-created",
                    "true"
                );


                const wrapper =
                    input.closest(
                        "[data-field]"
                    );


                if(wrapper){

                    wrapper.classList.add(
                        "rule-created"
                    );

                    wrapper.classList.add(
                        "is-used"
                    );

                }

                return;

            }


            /* =====================================
               RULE BELUM ADA
            ===================================== */

            input.disabled =
                false;


            input.checked =
                Boolean(
                    selectedRuleState[
                        config.field
                    ]
                );


            input.removeAttribute(
                "data-rule-created"
            );


            const wrapper =
                input.closest(
                    "[data-field]"
                );


            if(wrapper){

                wrapper.classList.remove(
                    "rule-created"
                );

                wrapper.classList.remove(
                    "is-used"
                );

            }

        }

    );


    /* =============================================
       LISTENER RULE BARU
    ============================================= */

    Object.values(
        FINANCIAL_RULES
    ).forEach(

        config => {

            const input =
                findRuleInput(
                    form,
                    config.field
                );


            if(!input){

                return;

            }


            if(
                input.dataset
                    .financialRuleListener ===
                "true"
            ){

                return;

            }


            input.dataset
                .financialRuleListener =
                "true";


            input.addEventListener(

                "change",

                function(){

                    if(
                        existingRuleState[
                            config.field
                        ] === true
                    ){

                        input.checked =
                            true;

                        input.disabled =
                            true;

                        return;

                    }


                    selectedRuleState[
                        config.field
                    ] =
                        input.checked === true;


                    refreshActivityRuleControls();

                }

            );

        }

    );

}


/* =====================================================
   REFRESH ACTIVITY RULE CONTROLS
===================================================== */

function refreshActivityRuleControls(){

    const pemasukanForm =
        document.querySelector(
            '[data-section="financial_activity_pemasukan"]'
        );


    const pengeluaranForm =
        document.querySelector(
            '[data-section="financial_activity_pengeluaran"]'
        );


    const ruleState =
        getFinancialRuleState();


    if(pemasukanForm){

        applyActivityRuleControl(
            pemasukanForm,
            ruleState
        );

    }


    if(pengeluaranForm){

        applyActivityRuleControl(
            pengeluaranForm,
            ruleState
        );

    }

}


/* =====================================================
   ACTIVITY RULE CONTROL
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


            if(!input){

                return;

            }


            input.disabled =
                !ruleHutang;


            if(!ruleHutang){

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


            if(!input){

                return;

            }


            input.disabled =
                !ruleTabungan;


            if(!ruleTabungan){

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
               BACA SHEET SAAT SECTION DIBUKA
            ========================================= */

            onRender :

                async function(

                    form

                ){

                    await initializeFinancialRuleState();


                    applyRuleStateToForm(
                        form
                    );


                    refreshActivityRuleControls();

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
