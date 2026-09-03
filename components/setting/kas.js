/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Kas
   File         : kas.js
   Version      : 3.0.0

   Description :
   Kas Setting

   Flow :
   1. Baca kas_member
   2. Cek rule yang sudah tersedia
   3. Tampilkan rule yang belum tersedia
   4. User centang rule yang ingin dibuat
   5. Rule dibuat terlebih dahulu
   6. User dapat menambahkan member
   7. Jika rule sudah lengkap, checkbox tidak tersedia lagi

   Sheet :
   kas_member

   Header :
   nama
   tabungan
   kas
   hutang

   Fixed Rules :

   Tabungan :
   - nabung
   - tarik
   - lain_lain

   Kas :
   - iuran
   - tarik
   - lain_lain

   Hutang :
   - hutang
   - bayar

   Principle :
   - Tidak ada URL Spreadsheet hardcode.
   - Tidak ada workspace hardcode untuk membaca data.
   - Data dibaca melalui Global Input Data Engine.
   - Checkbox bukan data member.
   - Checkbox hanya digunakan untuk membuat rule.
   - Rule hanya dibuat sekali.
   - Member dapat ditambahkan kapan saja.
===================================================== */


/* =====================================================
   IMPORT DATA ENGINE
===================================================== */

import {

    getInputData,

    loadInputData

} from "../../js/data.js";



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
 * State diperbarui setiap kali
 * Setting Kas dibuka / form rule dirender.
 */

let existingRules = {

    tabungan : false,

    kas : false,

    hutang : false

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
 * selama nama key sebenarnya sama
 * jika dinormalisasi.
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
 * Membaca sheet kas_member melalui
 * Global Input Data Engine.
 *
 * Tidak menggunakan URL Spreadsheet.
 *
 * Tidak menggunakan getter Kas khusus.
 */

function readExistingRules(){

    const data =

        getInputData();


    const rows =

        Array.isArray(data)

            ?

        data

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

            rows

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

            rows

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

            rows

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

async function refreshExistingRules(){

    /*
     * Refresh data dari Google Sheets.
     *
     * Ini penting supaya ketika user:
     *
     * - selesai membuat rule
     * - membuka Setting lagi
     *
     * status rule membaca kondisi terbaru.
     */

    try{

        await loadInputData(

            "kas"

        );

    }

    catch(error){

        console.warn(

            "KAS SETTING: gagal refresh data.",

            error

        );

    }


    existingRules =

        readExistingRules();


    console.log(

        "KAS SETTING - EXISTING RULES:",

        existingRules

    );


    return existingRules;

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
 *     dan checkbox tetap bisa dipilih.
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


    /*
     * Semua rule sudah dibuat.
     *
     * Tidak perlu lagi tombol
     * "Atur Rule".
     */

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


    /*
     * Masih ada rule yang belum dibuat.
     */

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
 * Contoh:
 *
 * Tabungan + Kas
 *
 * menjadi:
 *
 * [
 *   { tabungan: "nabung" },
 *   { tabungan: "tarik" },
 *   { tabungan: "lain_lain" },
 *
 *   { kas: "iuran" },
 *   { kas: "tarik" },
 *   { kas: "lain_lain" }
 * ]
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
         * Update state sementara supaya
         * tidak dibuat ulang dalam sesi
         * yang sama.
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
                 * Ambil ulang data Spreadsheet.
                 */

                const state =

                    await refreshExistingRules();


                /*
                 * Terapkan status rule.
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
