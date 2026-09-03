/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Kas
   File         : kas.js
   Version      : 3.1.0

   Description :
   Kas Setting

   Flow :
   1. Baca data workspace melalui Global API
   2. Baca sheet DATA workspace Kas
   3. Cek rule yang sudah tersedia
   4. Tampilkan rule yang belum tersedia
   5. User centang rule yang ingin dibuat
   6. Rule dibuat terlebih dahulu
   7. User dapat menambahkan member
   8. Jika rule sudah lengkap, checkbox tidak tersedia lagi

   Principle :
   - Tidak ada URL Spreadsheet hardcode.
   - Tidak ada Spreadsheet ID hardcode.
   - Tidak menggunakan components/input/data.js.
   - Pembacaan langsung melalui Global API.
   - Nama sheet diambil dari Global Workspace Registry.
   - Checkbox bukan data member.
   - Checkbox hanya digunakan untuk membuat rule.
   - Rule hanya dibuat sekali.
   - Member dapat ditambahkan kapan saja.
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
   FIXED RULE CONFIGURATION
===================================================== */

const KAS_RULES = {

    tabungan : [

        "nabung",

        "tarik",

        "lain_lain"

    ],


    kas : [

        "iuran",

        "tarik",

        "lain_lain"

    ],


    hutang : [

        "hutang",

        "bayar"

    ]

};



/* =====================================================
   RULE LABEL
===================================================== */

const KAS_RULE_LABEL = {

    tabungan :

        "Rule Tabungan",


    kas :

        "Rule Kas",


    hutang :

        "Rule Hutang"

};



/* =====================================================
   EXISTING RULE STATE
===================================================== */

/*
 * State ini hanya cache sementara.
 *
 * Sumber kebenaran tetap:
 *
 *     Google Sheets
 *
 * Data selalu di-refresh melalui
 * Global API ketika Setting Kas
 * dirender.
 */

let existingRules = {

    tabungan : false,

    kas : false,

    hutang : false

};



/* =====================================================
   KAS DATA CACHE
===================================================== */

/*
 * Menyimpan hasil pembacaan sheet
 * kas_member untuk kebutuhan debug
 * dan pemrosesan module.
 */

let kasMemberData = [];



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
   GET KAS WORKSPACE CONFIG
===================================================== */

/*
 * Workspace registry adalah sumber
 * konfigurasi nama sheet.
 *
 * Tidak ada nama sheet yang
 * di-hardcode di fungsi pembacaan.
 */

function getKasWorkspace(){

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

        workspaces.kas;


    if(

        !workspace

    ){

        throw new Error(

            'Workspace "kas" tidak ditemukan.'

        );

    }


    if(

        !Array.isArray(

            workspace.sheets

        )

    ){

        throw new Error(

            'Konfigurasi sheet workspace "kas" tidak valid.'

        );

    }


    if(

        workspace.sheets.length < 2

    ){

        throw new Error(

            'Workspace "kas" tidak memiliki DATA sheet.'

        );

    }


    return workspace;

}



/* =====================================================
   GET KAS SHEETS
===================================================== */

/*
 * Struktur Global Workspace:
 *
 * sheets[0] = RAW
 * sheets[1] = DATA
 *
 * Untuk Kas:
 *
 * sheets[0] = kas
 * sheets[1] = kas_member
 */

function getKasSheets(){

    const workspace =

        getKasWorkspace();


    return {

        rawSheet :

            workspace.sheets[0],


        dataSheet :

            workspace.sheets[1]

    };

}



/* =====================================================
   READ KAS MEMBER DATA
===================================================== */

/*
 * Membaca RAW + DATA melalui:
 *
 *     Global API
 *          ↓
 *     Google Sheets API
 *
 * API.load() akan mengisi:
 *
 *     API.raw
 *     API.data
 *
 * Kita menggunakan DATA karena
 * kas_member adalah sheet kedua
 * workspace Kas.
 */

async function readKasMemberData(){

    const sheets =

        getKasSheets();


    console.log(

        "=========================================="

    );


    console.log(

        "KAS SETTING: READ DATA"

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

            "Gagal membaca data workspace Kas."

        );

    }


    /*
     * API.load() sudah menyimpan hasil
     * ke API.data.
     */

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


    kasMemberData =

        data;


    console.log(

        "KAS SETTING: DATA",

        kasMemberData

    );


    console.log(

        "KAS SETTING: DATA COUNT",

        kasMemberData.length

    );


    return kasMemberData;

}



/* =====================================================
   GET COLUMN VALUE
===================================================== */

/*
 * Membaca kolom secara aman.
 *
 * Mendukung:
 *
 *     nama
 *     Nama
 *     TABUNGAN
 *
 * selama nama key setelah
 * normalisasi sama.
 */

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
   GET EXISTING RULES
===================================================== */

/*
 * Mengecek rule berdasarkan DATA
 * kas_member yang baru dibaca.
 *
 * Rule dianggap tersedia apabila
 * seluruh fixed rule ditemukan
 * di kolom masing-masing.
 */

function readExistingRules(

    rows = kasMemberData

){

    const data =

        Array.isArray(

            rows

        )

            ?

        rows

            :

        [];


    const result = {

        tabungan : false,

        kas : false,

        hutang : false

    };


    /* =============================================
       TABUNGAN
    ============================================= */

    const tabunganValues =

        new Set(

            data

                .map(

                    row =>

                        getColumnValue(

                            row,

                            "tabungan"

                        )

                )

                .filter(

                    Boolean

                )

        );


    result.tabungan =

        KAS_RULES.tabungan.every(

            rule =>

                tabunganValues.has(

                    rule

                )

        );


    /* =============================================
       KAS
    ============================================= */

    const kasValues =

        new Set(

            data

                .map(

                    row =>

                        getColumnValue(

                            row,

                            "kas"

                        )

                )

                .filter(

                    Boolean

                )

        );


    result.kas =

        KAS_RULES.kas.every(

            rule =>

                kasValues.has(

                    rule

                )

        );


    /* =============================================
       HUTANG
    ============================================= */

    const hutangValues =

        new Set(

            data

                .map(

                    row =>

                        getColumnValue(

                            row,

                            "hutang"

                        )

                )

                .filter(

                    Boolean

                )

        );


    result.hutang =

        KAS_RULES.hutang.every(

            rule =>

                hutangValues.has(

                    rule

                )

        );


    return result;

}



/* =====================================================
   REFRESH EXISTING RULES
===================================================== */

/*
 * Selalu baca ulang Google Sheets
 * ketika form Setting Kas dirender.
 *
 * Jadi status checkbox tidak
 * bergantung pada cache lama.
 */

async function refreshExistingRules(){

    try{

        const data =

            await readKasMemberData();


        existingRules =

            readExistingRules(

                data

            );


        console.log(

            "=========================================="

        );


        console.log(

            "KAS SETTING - EXISTING RULES:",

            existingRules

        );


        console.log(

            "KAS SETTING - MEMBER DATA:",

            kasMemberData

        );


        console.log(

            "=========================================="

        );


        return existingRules;

    }

    catch(error){

        console.error(

            "KAS SETTING: gagal membaca data.",

            error

        );


        /*
         * Jangan menganggap rule sudah ada
         * apabila pembacaan gagal.
         */

        existingRules = {

            tabungan : false,

            kas : false,

            hutang : false

        };


        throw error;

    }

}



/* =====================================================
   APPLY RULE UI STATE
===================================================== */

/*
 * Hasil UI:
 *
 * Jika rule sudah ada:
 *
 *     ✓ Rule Tabungan sudah dibuat
 *
 * Jika belum:
 *
 *     [ ] Tabungan
 *
 * Checkbox yang sudah dibuat
 * tidak lagi tersedia.
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

        KAS_RULE_LABEL

    ).forEach(

        ruleType => {

            const wrapper =

                sectionElement.querySelector(

                    `.global-setting-field[data-field="${ruleType}"]`

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

                    "kas-rule-created"

                );


                const status =

                    document.createElement(

                        "div"

                    );


                status.className =

                    "global-setting-field-note";


                status.textContent =

                    `✓ ${KAS_RULE_LABEL[ruleType]} sudah dibuat`;


                wrapper.appendChild(

                    status

                );


                return;

            }


            /* =====================================
               RULE BELUM ADA
            ===================================== */

            wrapper.classList.remove(

                "kas-rule-created"

            );

        }

    );


    /* =============================================
       CHECK IF ALL RULES ARE CREATED
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
   BUILD RULE RESULT
===================================================== */

/*
 * Menghasilkan row berdasarkan
 * checkbox yang dipilih.
 *
 * Contoh Tabungan + Kas:
 *
 * [
 *
 *     { tabungan: "nabung" },
 *     { tabungan: "tarik" },
 *     { tabungan: "lain_lain" },
 *
 *     { kas: "iuran" },
 *     { kas: "tarik" },
 *     { kas: "lain_lain" }
 *
 * ]
 *
 * Setiap object menjadi satu row.
 */

function buildRuleResults(

    data

){

    const results = [];


    /* =============================================
       TABUNGAN
    ============================================= */

    if(

        data.tabungan === true &&

        existingRules.tabungan !== true

    ){

        KAS_RULES.tabungan.forEach(

            rule => {

                results.push({

                    tabungan :

                        rule

                });

            }

        );


        /*
         * Cegah rule dibuat ulang
         * dalam sesi yang sama.
         */

        existingRules.tabungan = true;

    }


    /* =============================================
       KAS
    ============================================= */

    if(

        data.kas === true &&

        existingRules.kas !== true

    ){

        KAS_RULES.kas.forEach(

            rule => {

                results.push({

                    kas :

                        rule

                });

            }

        );


        existingRules.kas = true;

    }


    /* =============================================
       HUTANG
    ============================================= */

    if(

        data.hutang === true &&

        existingRules.hutang !== true

    ){

        KAS_RULES.hutang.forEach(

            rule => {

                results.push({

                    hutang :

                        rule

                });

            }

        );


        existingRules.hutang = true;

    }


    return results;

}



/* =====================================================
   KAS SETTING
===================================================== */

export const KasSetting = {


    /* =================================================
       HEADER
    ================================================= */

    title :

        "Pengaturan Kas",


    subtitle :

        "Atur rule Kas dan member",



    /* =================================================
       SECTIONS
    ================================================= */

    sections : [

        /* =============================================
           RULE
        ============================================= */

        {

            id :

                "kas_rules",


            title :

                "⚙️ Rule Kas",


            description :

                "Buat rule kategori Kas terlebih dahulu. Rule yang sudah tersedia akan dikunci secara otomatis.",


            addLabel :

                "＋ Atur Rule",


            formAddLabel :

                "＋ Buat Rule",


            autoCloseForm :

                true,


            fields : [

                {

                    name :

                        "tabungan",

                    label :

                        "Tabungan",

                    type :

                        "checkbox",

                    value :

                        false

                },


                {

                    name :

                        "kas",

                    label :

                        "Kas",

                    type :

                        "checkbox",

                    value :

                        false

                },


                {

                    name :

                        "hutang",

                    label :

                        "Hutang",

                    type :

                        "checkbox",

                    value :

                        false

                }

            ],


            /* =========================================
               NORMALIZE
            ========================================= */

            normalize(

                data

            ){

                const results =

                    buildRuleResults(

                        data

                    );


                if(

                    results.length === 0

                ){

                    return [];

                }


                return results;

            },


            /* =========================================
               RENDER
            ========================================= */

            async onRender(

                form,

                sectionElement

            ){

                /*
                 * Baca ulang Google Sheets
                 * melalui Global API.
                 */

                const state =

                    await refreshExistingRules();


                /*
                 * Terapkan status rule ke UI.
                 */

                applyRuleUIState(

                    sectionElement,

                    state

                );

            }

        },


        /* =============================================
           MEMBER
        ============================================= */

        {

            id :

                "kas_member",


            title :

                "👥 Nama Member",


            description :

                "Tambahkan nama member yang digunakan dalam Kas.",


            addLabel :

                "＋ Tambah Member",


            formAddLabel :

                "＋ Tambahkan",


            uniqueFields : [

                "nama"

            ],


            fields : [

                {

                    name :

                        "nama",

                    label :

                        "Nama Member",

                    type :

                        "text",

                    placeholder :

                        "Masukkan nama member",

                    required :

                        true

                }

            ],


            normalize(

                data

            ){

                return {

                    nama :

                        String(

                            data.nama ??

                            ""

                        ).trim()

                };

            }

        }

    ]

};
