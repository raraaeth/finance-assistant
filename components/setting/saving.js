/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Saving
   File         : saving.js
   Version      : 1.4.0

   Description :
   Saving Setting Definition

   Flow :
   1. Baca data workspace melalui Global API
   2. Baca sheet saving_bank
   3. Cek bank / wallet bawaan yang sudah tersedia
   4. Tampilkan pilihan yang belum tersedia
   5. User dapat memilih bank / wallet yang belum ada
   6. User dapat menambahkan nama sendiri
   7. Bank / wallet bawaan hanya dapat dibuat satu kali

   Sheet :
   saving_bank

   Sheet Header :
   - nama

   UI :
   - Pilihan Bank / Wallet menggunakan checkbox
   - Nama manual menggunakan input text
   - Checkbox result dan manual result terpisah
   - Saat Confirm seluruh result dinormalisasi
     menjadi field "nama"

   Principle :
   - Bank / wallet bawaan mempunyai logo
   - User dapat memilih beberapa pilihan sekaligus
   - User dapat menambahkan nama sendiri
   - Nama yang tersimpan di Sheet adalah nama sebenarnya
   - Tidak ada lagi value "lain_lain"
   - Bank / wallet bawaan hanya dapat dibuat satu kali
   - Nama manual tetap dapat ditambahkan kapan saja

   Architecture :
   - Tidak ada URL Spreadsheet hardcode
   - Tidak ada Spreadsheet ID hardcode
   - Tidak menggunakan components/input/data.js
   - Pembacaan dilakukan melalui Global API
   - Nama sheet diambil dari Global Workspace Registry
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
   FIXED BANK / WALLET
===================================================== */

const SAVING_FIXED_BANKS = {

    mandiri :
        "Mandiri",

    bri :
        "BRI",

    bni :
        "BNI",

    bca :
        "BCA",

    seabank :
        "SeaBank",

    dana :
        "DANA",

    ovo :
        "OVO",

    gopay :
        "GoPay",

    shopeepay :
        "ShopeePay",

    wallet_crypto :
        "Wallet Crypto",

    celengan :
        "Celengan",

    koperasi :
        "Koperasi",

    dana_darurat :
        "Dana Darurat"

};


/* =====================================================
   EXISTING BANK STATE
===================================================== */

/*
 * State ini hanya cache sementara.
 *
 * Sumber kebenaran tetap :
 *
 *     Google Sheets
 *
 * Data selalu di-refresh melalui
 * Global API ketika Setting Saving
 * dirender.
 */

let existingBanks = {

    mandiri :
        false,

    bri :
        false,

    bni :
        false,

    bca :
        false,

    seabank :
        false,

    dana :
        false,

    ovo :
        false,

    gopay :
        false,

    shopeepay :
        false,

    wallet_crypto :
        false,

    celengan :
        false,

    koperasi :
        false,

    dana_darurat :
        false

};


/* =====================================================
   SAVING BANK DATA CACHE
===================================================== */

/*
 * Menyimpan hasil pembacaan sheet
 * saving_bank.
 */

let savingBankData = [];


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
   GET SAVING WORKSPACE
===================================================== */

/*
 * Workspace Registry adalah sumber
 * konfigurasi nama sheet.
 *
 * Saving :
 *
 *     sheets[0] = saving
 *     sheets[1] = saving_bank
 */

function getSavingWorkspace(){

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

        workspaces.saving;


    if(

        !workspace

    ){

        throw new Error(

            'Workspace "saving" tidak ditemukan.'

        );

    }


    if(

        !Array.isArray(

            workspace.sheets

        )

    ){

        throw new Error(

            'Konfigurasi sheet workspace "saving" tidak valid.'

        );

    }


    if(

        workspace.sheets.length < 2

    ){

        throw new Error(

            'Workspace "saving" tidak memiliki saving_bank sheet.'

        );

    }


    return workspace;

}


/* =====================================================
   GET SAVING SHEETS
===================================================== */

function getSavingSheets(){

    const workspace =

        getSavingWorkspace();


    return {

        rawSheet :

            workspace.sheets[0],

        dataSheet :

            workspace.sheets[1]

    };

}


/* =====================================================
   READ SAVING BANK DATA
===================================================== */

/*
 * Membaca :
 *
 *     saving
 *         +
 *     saving_bank
 *
 * melalui :
 *
 *     Global API
 *          ↓
 *     Google Sheets API
 *
 * API.load() akan mengisi :
 *
 *     API.raw
 *     API.data
 */

async function readSavingBankData(){

    const sheets =

        getSavingSheets();


    console.log(

        "=========================================="

    );


    console.log(

        "SAVING SETTING: READ DATA"

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

            "Gagal membaca data workspace Saving."

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


    savingBankData =

        data;


    console.log(

        "SAVING SETTING: DATA",

        savingBankData

    );


    console.log(

        "SAVING SETTING: DATA COUNT",

        savingBankData.length

    );


    return savingBankData;

}


/* =====================================================
   GET COLUMN VALUE
===================================================== */

/*
 * Membaca kolom secara aman.
 *
 * Mendukung :
 *
 *     nama
 *     Nama
 *     NAMA
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
   READ EXISTING BANKS
===================================================== */

/*
 * Mengecek bank / wallet bawaan
 * berdasarkan data saving_bank.
 *
 * Contoh :
 *
 * saving_bank :
 *
 *     nama
 *     ----------------
 *     Mandiri
 *     DANA
 *
 * menghasilkan :
 *
 * {
 *     mandiri : true,
 *     bri : false,
 *     dana : true
 * }
 */

function readExistingBanks(

    rows = savingBankData

){

    const data =

        Array.isArray(

            rows

        )

            ?

        rows

            :

        [];


    const result = {};


    Object.keys(

        SAVING_FIXED_BANKS

    ).forEach(

        key => {

            result[key] = false;

        }

    );


    /*
     * Ambil semua nama dari
     * saving_bank.
     */

    const existingNames =

        new Set(

            data

                .map(

                    row =>

                        getColumnValue(

                            row,

                            "nama"

                        )

                )

                .filter(

                    Boolean

                )

        );


    /*
     * Bandingkan dengan
     * fixed bank / wallet.
     */

    Object.entries(

        SAVING_FIXED_BANKS

    ).forEach(

        ([

            key,

            label

        ]) => {

            result[key] =

                existingNames.has(

                    normalizeValue(

                        label

                    )

                );

        }

    );


    return result;

}


/* =====================================================
   REFRESH EXISTING BANKS
===================================================== */

/*
 * Selalu baca ulang Google Sheets
 * ketika form Setting Saving dirender.
 *
 * Jadi status checkbox tidak
 * bergantung pada cache lama.
 */

async function refreshExistingBanks(){

    try{

        const data =

            await readSavingBankData();


        existingBanks =

            readExistingBanks(

                data

            );


        console.log(

            "=========================================="

        );


        console.log(

            "SAVING SETTING - EXISTING BANKS:",

            existingBanks

        );


        console.log(

            "SAVING SETTING - BANK DATA:",

            savingBankData

        );


        console.log(

            "=========================================="

        );


        return existingBanks;

    }

    catch(error){

        console.error(

            "SAVING SETTING: gagal membaca data.",

            error

        );


        /*
         * Jangan menganggap bank sudah ada
         * apabila pembacaan gagal.
         */

        existingBanks = {

            mandiri :
                false,

            bri :
                false,

            bni :
                false,

            bca :
                false,

            seabank :
                false,

            dana :
                false,

            ovo :
                false,

            gopay :
                false,

            shopeepay :
                false,

            wallet_crypto :
                false,

            celengan :
                false,

            koperasi :
                false,

            dana_darurat :
                false

        };


        throw error;

    }

}


/* =====================================================
   APPLY BANK UI STATE
===================================================== */

/*
 * Hasil UI :
 *
 * Jika bank sudah ada :
 *
 *     ✓ Mandiri sudah dibuat
 *
 * Jika belum :
 *
 *     [ ] Mandiri
 *
 * Checkbox yang sudah dibuat
 * tidak lagi tersedia.
 */

function applyBankUIState(

    sectionElement,

    state

){

    if(

        !sectionElement

    ){

        return;

    }


    Object.entries(

        SAVING_FIXED_BANKS

    ).forEach(

        ([

            fieldName,

            label

        ]) => {

            const wrapper =

                sectionElement.querySelector(

                    `.global-setting-field[data-field="${fieldName}"]`

                );


            if(

                !wrapper

            ){

                return;

            }


            /*
             * BANK SUDAH ADA
             */

            if(

                state[fieldName] === true

            ){

                wrapper.innerHTML = "";


                wrapper.classList.add(

                    "saving-bank-created"

                );


                const status =

                    document.createElement(

                        "div"

                    );


                status.className =

                    "global-setting-field-note";


                status.textContent =

                    `✓ ${label} sudah dibuat`;


                wrapper.appendChild(

                    status

                );


                return;

            }


            /*
             * BANK BELUM ADA
             */

            wrapper.classList.remove(

                "saving-bank-created"

            );

        }

    );


    /*
     * Cek apakah semua fixed bank
     * sudah tersedia.
     */

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
     * SEMUA SUDAH DIBUAT
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
     * MASIH ADA YANG BELUM DIBUAT
     */

    if(

        addButton

    ){

        addButton.style.display =

            "";

    }

}


/* =====================================================
   BUILD BANK RESULT
===================================================== */

/*
 * Menghasilkan row berdasarkan
 * checkbox yang dipilih.
 *
 * Contoh :
 *
 * data :
 *
 * {
 *     mandiri : true,
 *     dana    : true
 * }
 *
 * ↓
 *
 * [
 *
 *     { nama : "Mandiri" },
 *     { nama : "DANA" }
 *
 * ]
 *
 * Bank yang sudah ada di Sheet
 * tidak akan dibuat kembali.
 */

function buildBankResults(

    data

){

    const results = [];


    Object.entries(

        SAVING_FIXED_BANKS

    ).forEach(

        ([

            fieldName,

            label

        ]) => {

            if(

                data[fieldName] !== true

            ){

                return;

            }


            /*
             * Jangan buat ulang bank
             * yang sudah ada di Sheet.
             */

            if(

                existingBanks[fieldName] === true

            ){

                return;

            }


            results.push({

                nama :

                    label

            });


            /*
             * Cegah rule yang sama
             * dibuat ulang dalam sesi
             * yang sama.
             */

            existingBanks[fieldName] =

                true;

        }

    );


    return results;

}


/* =====================================================
   SAVING SETTING
===================================================== */

export const SavingSetting = {


    /* =================================================
       HEADER
    ================================================= */

    title :

        "Pengaturan Saving",


    subtitle :

        "Atur rekening atau tempat penyimpanan dana",


    /* =================================================
       SECTIONS
    ================================================= */

    sections : [


        /* =============================================
           BANK / WALLET BAWAAN
        ============================================= */

        {

            id :

                "bank_options",


            title :

                "🏦 Bank / Wallet",


            description :

                "Pilih bank, e-wallet, atau tempat penyimpanan dana yang kamu gunakan.",


            /* =========================================
               RESULT
            ========================================= */

            resultTitle :

                "Bank / Wallet Terpilih",


            addLabel :

                "＋ Tambah Pilihan",


            formAddLabel :

                "＋ Tambahkan Pilihan",


            deleteLabel :

                "Hapus",


            /* =========================================
               FORM TYPE
            ========================================= */

            inputMode :

                "checkbox-group",


            /* =========================================
               FIELDS
            ========================================= */

            fields : [

                /* -------------------------------------
                   MANDIRI
                ------------------------------------- */

                {

                    name :

                        "mandiri",

                    label :

                        "Mandiri",

                    type :

                        "checkbox",

                    resultName :

                        "Mandiri"

                },


                /* -------------------------------------
                   BRI
                ------------------------------------- */

                {

                    name :

                        "bri",

                    label :

                        "BRI",

                    type :

                        "checkbox",

                    resultName :

                        "BRI"

                },


                /* -------------------------------------
                   BNI
                ------------------------------------- */

                {

                    name :

                        "bni",

                    label :

                        "BNI",

                    type :

                        "checkbox",

                    resultName :

                        "BNI"

                },


                /* -------------------------------------
                   BCA
                ------------------------------------- */

                {

                    name :

                        "bca",

                    label :

                        "BCA",

                    type :

                        "checkbox",

                    resultName :

                        "BCA"

                },


                /* -------------------------------------
                   SEABANK
                ------------------------------------- */

                {

                    name :

                        "seabank",

                    label :

                        "SeaBank",

                    type :

                        "checkbox",

                    resultName :

                        "SeaBank"

                },


                /* -------------------------------------
                   DANA
                ------------------------------------- */

                {

                    name :

                        "dana",

                    label :

                        "DANA",

                    type :

                        "checkbox",

                    resultName :

                        "DANA"

                },


                /* -------------------------------------
                   OVO
                ------------------------------------- */

                {

                    name :

                        "ovo",

                    label :

                        "OVO",

                    type :

                        "checkbox",

                    resultName :

                        "OVO"

                },


                /* -------------------------------------
                   GOPAY
                ------------------------------------- */

                {

                    name :

                        "gopay",

                    label :

                        "GoPay",

                    type :

                        "checkbox",

                    resultName :

                        "GoPay"

                },


                /* -------------------------------------
                   SHOPEEPAY
                ------------------------------------- */

                {

                    name :

                        "shopeepay",

                    label :

                        "ShopeePay",

                    type :

                        "checkbox",

                    resultName :

                        "ShopeePay"

                },


                /* -------------------------------------
                   WALLET CRYPTO
                ------------------------------------- */

                {

                    name :

                        "wallet_crypto",

                    label :

                        "Wallet Crypto",

                    type :

                        "checkbox",

                    resultName :

                        "Wallet Crypto"

                },


                /* -------------------------------------
                   CELENGAN
                ------------------------------------- */

                {

                    name :

                        "celengan",

                    label :

                        "Celengan",

                    type :

                        "checkbox",

                    resultName :

                        "Celengan"

                },


                /* -------------------------------------
                   KOPERASI
                ------------------------------------- */

                {

                    name :

                        "koperasi",

                    label :

                        "Koperasi",

                    type :

                        "checkbox",

                    resultName :

                        "Koperasi"

                },


                /* -------------------------------------
                   DANA DARURAT
                ------------------------------------- */

                {

                    name :

                        "dana_darurat",

                    label :

                        "Dana Darurat",

                    type :

                        "checkbox",

                    resultName :

                        "Dana Darurat"

                }

            ],


            /* =========================================
               NORMALIZE
               
               Checkbox :
               
               mandiri : true
               bri     : false
               
               ↓
               
               nama :
                   "Mandiri"
            ========================================= */

            normalize :

                data => {

                    return buildBankResults(

                        data

                    );

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

                    await refreshExistingBanks();


                /*
                 * Terapkan status bank
                 * ke UI.
                 */

                applyBankUIState(

                    sectionElement,

                    state

                );

            }

        },


        /* =============================================
           NAMA MANUAL
        ============================================= */

        {

            id :

                "bank_custom",


            title :

                "✏️ Nama Sendiri",


            description :

                "Tambahkan nama bank, wallet, atau tempat penyimpanan dana yang belum tersedia di daftar.",


            resultTitle :

                "Nama Sendiri",


            addLabel :

                "＋ Tambah Nama",


            formAddLabel :

                "＋ Tambahkan Nama",


            deleteLabel :

                "Hapus",


            fields : [

                {

                    name :

                        "nama_bank_custom",


                    label :

                        "Nama Bank / Wallet",


                    type :

                        "text",


                    placeholder :

                        "Contoh: Jago, SeaBank Bisnis, dll.",


                    required :

                        true

                }

            ],


            /* =========================================
               NORMALIZE
               
               Input :
                   nama_bank_custom
               
               ↓
               
               Sheet :
                   nama
            ========================================= */

            normalize :

                data => {

                    const nama =

                        String(

                            data.nama_bank_custom ??

                            ""

                        ).trim();


                    return {

                        nama :

                            nama

                    };

                }

        }

    ]

};
