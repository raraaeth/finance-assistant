/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Financial
   File         : financial.js
   Version      : 4.3.0

   Description :
   Financial Setting

   Behaviour :
   - Membaca rule existing dari financial_activity
   - Rule yang sudah dibuat tidak dapat dipilih lagi
   - Rule existing ditampilkan sebagai:
       ✓ Rule Pemasukan sudah dibuat
   - Rule baru tetap dapat dipilih
   - Jika seluruh rule sudah dibuat,
     Penentuan Rule tidak dapat menambah rule lagi
   - Activity tetap dapat diubah
   - Rule yang sudah dibuat tidak pernah dihapus

   Fixed Rule :
   - rule_pemasukan
   - rule_pengeluaran
   - rule_hutang
   - rule_tabungan

   Sheet :
   financial_activity

   Header :
   id
   rules
   type
   activity
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
   FINANCIAL RULE DEFINITION
===================================================== */

const FINANCIAL_RULES = {

    rule_pemasukan : {

        field :
            "gunakanRulePemasukan",

        label :
            "Rule Pemasukan",

        mandatory :
            true
    },

    rule_pengeluaran : {

        field :
            "gunakanRulePengeluaran",

        label :
            "Rule Pengeluaran",

        mandatory :
            true
    },

    rule_hutang : {

        field :
            "gunakanRuleHutang",

        label :
            "Rule Hutang",

        mandatory :
            false
    },

    rule_tabungan : {

        field :
            "gunakanRuleTabungan",

        label :
            "Rule Tabungan",

        mandatory :
            false
    }

};


/* =====================================================
   STATE
===================================================== */

/*
   State ini berasal dari Sheet.

   true :
       Rule sudah dibuat.

   false :
       Rule belum dibuat.
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


/*
   State pilihan frontend.

   Berbeda dengan existingRules.

   Contoh:

   rule_hutang belum ada
   tetapi user mencentangnya.

   Maka:

   existingRules.rule_hutang = false
   selectedRuleState.rule_hutang = true
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
   GET FINANCIAL WORKSPACE
===================================================== */

function getFinancialWorkspace(){

    const workspaces =
        getWorkspaceConfig();


    if(
        !workspaces ||
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
   FIND EXISTING RULES
===================================================== */

function detectExistingRules(

    rows

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


    if(
        !Array.isArray(
            rows
        )
    ){

        return result;

    }


    rows.forEach(

        row => {

            if(
                !row ||
                typeof row !==
                    "object"
            ){

                return;

            }


            const rule =
                normalizeValue(
                    row.rules
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
   REFRESH EXISTING RULES
===================================================== */

async function refreshExistingRules(){

    const data =
        await readFinancialActivity();


    existingRules =
        detectExistingRules(
            data
        );


    /*
       Rule existing selalu dianggap
       aktif dan tidak dapat dimatikan.
    */

    selectedRuleState = {

        gunakanRulePemasukan :
            existingRules.rule_pemasukan
                ||
            true,

        gunakanRulePengeluaran :
            existingRules.rule_pengeluaran
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


    return existingRules;

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
   GET RULE STATE FOR CONTROLLER
===================================================== */

async function getRuleState(){

    try{

        await refreshExistingRules();

    }
    catch(error){

        console.error(
            "Financial Rule Read Error:",
            error
        );

    }


    return getFinancialRuleState();

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


    /* =================================================
       FILTER ACTIVITY
    ================================================= */

    fields.forEach(

        field => {

            if(
                data[field.name] !==
                    true
            ){

                return;

            }


            const activityRule =
                field.activityRule ??
                "";


            /* =========================================
               HUTANG
            ========================================= */

            if(

                activityRule ===
                    "hutang"

                &&

                ruleState
                    .gunakanRuleHutang !==
                    true

            ){

                return;

            }


            /* =========================================
               TABUNGAN
            ========================================= */

            if(

                activityRule ===
                    "tabungan"

                &&

                ruleState
                    .gunakanRuleTabungan !==
                    true

            ){

                return;

            }


            activity.push(

                field.name

            );

        }

    );


    /* =================================================
       TYPE
    ================================================= */

    const types = [];


    /* =================================================
       PEMASUKAN
    ================================================= */

    if(

        direction ===
            "pemasukan"

    ){

        types.push(
            "masuk"
        );


        if(

            ruleState
                .gunakanRuleHutang ===
                true

        ){

            types.push(
                "hutang"
            );

        }


        if(

            ruleState
                .gunakanRuleTabungan ===
                true

        ){

            types.push(
                "tarik"
            );

        }

    }


    /* =================================================
       PENGELUARAN
    ================================================= */

    if(

        direction ===
            "pengeluaran"

    ){

        types.push(
            "keluar"
        );


        if(

            ruleState
                .gunakanRuleHutang ===
                true

        ){

            types.push(
                "bayar"
            );

        }


        if(

            ruleState
                .gunakanRuleTabungan ===
                true

        ){

            types.push(
                "nabung"
            );

        }

    }


    /* =================================================
       RESULT
    ================================================= */

    const result = {

        rules :
            rules,

        type :
            types.join(","),

        activity :
            activity.join(",")

    };


    /* =================================================
       DISPLAY STATE
    ================================================= */

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

    /*
       Existing rule tidak boleh
       dimatikan.

       Rule baru mengikuti checkbox.
    */

    selectedRuleState = {

        gunakanRulePemasukan :

            existingRules.rule_pemasukan
                ||
            Boolean(
                data.gunakanRulePemasukan
            ),

        gunakanRulePengeluaran :

            existingRules.rule_pengeluaran
                ||
            Boolean(
                data.gunakanRulePengeluaran
            ),

        gunakanRuleHutang :

            existingRules.rule_hutang
                ||
            Boolean(
                data.gunakanRuleHutang
            ),

        gunakanRuleTabungan :

            existingRules.rule_tabungan
                ||
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
   RULE FIELD FINDER
===================================================== */

function findRuleField(

    container,

    fieldName

){

    if(
        !container
    ){

        return null;

    }


    return container.querySelector(

        `[data-field="${fieldName}"]`

    );

}


/* =====================================================
   SHOW RULE CREATED STATE
===================================================== */

function showRuleCreated(

    container,

    fieldName,

    label

){

    const field =
        findRuleField(
            container,
            fieldName
        );


    if(
        !field
    ){

        return;

    }


    /*
       Jangan dibuat dua kali.
    */

    if(
        field.dataset.financialRuleCreated ===
            "true"
    ){

        return;

    }


    field.dataset.financialRuleCreated =
        "true";


    /*
       Simpan ukuran/struktur wrapper
       dengan mengganti isi field saja.
    */

    field.innerHTML = "";


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "financial-rule-created";


    message.textContent =
        `✓ ${label} sudah dibuat`;


    field.appendChild(
        message
    );


    field.classList.add(
        "is-used"
    );


    field.classList.add(
        "rule-created"
    );


    field.setAttribute(
        "data-rule-created",
        "true"
    );

}


/* =====================================================
   APPLY EXISTING RULE UI
===================================================== */

function applyExistingRuleUI(

    container

){

    if(
        !container
    ){

        return;

    }


    const rules =
        Object.keys(
            FINANCIAL_RULES
        );


    rules.forEach(

        rule => {

            const config =
                FINANCIAL_RULES[
                    rule
                ];


            if(
                existingRules[
                    rule
                ] === true
            ){

                showRuleCreated(

                    container,

                    config.field,

                    config.label

                );

            }

        }

    );


    /*
       Jika semua rule sudah dibuat,
       jangan izinkan penambahan rule lagi.
    */

    const allCreated =

        rules.every(

            rule =>
                existingRules[
                    rule
                ] === true

        );


    if(
        allCreated
    ){

        disableRuleSection(
            container
        );

    }

}


/* =====================================================
   DISABLE RULE SECTION
===================================================== */

function disableRuleSection(

    container

){

    if(
        !container
    ){

        return;

    }


    /*
       Semua checkbox/input rule
       dibuat tidak aktif.
    */

    container
        .querySelectorAll(
            'input, select, textarea'
        )
        .forEach(

            input => {

                input.disabled =
                    true;

            }

        );


    /*
       Tombol simpan rule
       tidak diperlukan lagi.
    */

    container
        .querySelectorAll(
            'button'
        )
        .forEach(

            button => {

                const text =
                    normalizeValue(
                        button.textContent
                    );


                if(
                    text.includes(
                        "simpan rule"
                    )
                    ||
                    text.includes(
                        "tambah rule"
                    )
                ){

                    button.disabled =
                        true;

                    button.classList.add(
                        "disabled"
                    );

                    button.setAttribute(
                        "aria-disabled",
                        "true"
                    );

                }

            }

        );


    container.classList.add(
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
        !form ||
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


    /* =================================================
       HUTANG
    ================================================= */

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


    /* =================================================
       TABUNGAN
    ================================================= */

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
   REFRESH ACTIVITY CONTROLS
===================================================== */

function refreshActivityControls(){

    const ruleState =
        getFinancialRuleState();


    document
        .querySelectorAll(
            '[data-section="financial_activity_pemasukan"]'
        )
        .forEach(

            section => {

                applyActivityRuleControl(

                    section,

                    ruleState

                );

            }

        );


    document
        .querySelectorAll(
            '[data-section="financial_activity_pengeluaran"]'
        )
        .forEach(

            section => {

                applyActivityRuleControl(

                    section,

                    ruleState

                );

            }

        );

}


/* =====================================================
   BIND RULE CHANGE
===================================================== */

function bindRuleChange(

container

){

    if(
        !container
    ){

        return;

    }


    const fieldMap = {

        gunakanRulePemasukan :
            "rule_pemasukan",

        gunakanRulePengeluaran :
            "rule_pengeluaran",

        gunakanRuleHutang :
            "rule_hutang",

        gunakanRuleTabungan :
            "rule_tabungan"

    };


    Object.keys(
        fieldMap
    )
    .forEach(

        fieldName => {

            const input =
                container.querySelector(

                    `[data-field="${fieldName}"] input[type="checkbox"]`

                );


            if(
                !input
            ){

                return;

            }


            /*
               Jangan bind ulang.
            */

            if(
                input.dataset.financialRuleBound ===
                    "true"
            ){

                return;

            }


            input.dataset.financialRuleBound =
                "true";


            input.addEventListener(

                "change",

                () => {

                    const rule =
                        fieldMap[
                            fieldName
                        ];


                    /*
                       Rule existing tidak boleh
                       dimatikan.
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
                        fieldName
                    ] =
                        input.checked;


                    refreshActivityControls();

                }

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


    getRuleState :


        getRuleState,


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

                async function(

                    form

                ){

                    /*
                       Baca Sheet setiap kali
                       Setting dibuka/render.
                    */

                    try{

                        await refreshExistingRules();

                    }
                    catch(error){

                        console.error(

                            "Financial Setting Rule Read Error:",

                            error

                        );

                    }


                    applyExistingRuleUI(

                        form

                    );


                    bindRuleChange(

                        form

                    );


                    refreshActivityControls();

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
