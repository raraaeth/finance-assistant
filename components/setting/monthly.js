/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Monthly
   File         : monthly.js
   Version      : 4.6.0

   Description :
   Payroll Monthly Setting Definition

   Modules :
   - Rule Periode
   - Rule Gaji
   - Rule Potong
   - Rule Tambah
   - Rule Attendance

   Principle :
   - Google Sheets / Payroll Engine menjadi sumber state.
   - Tidak menggunakan DOM sebagai sumber lock.
   - Rule Periode menjadi fondasi active period.
   - Rule baru selalu mewarisi active period.
   - History rule lama tidak dihapus.
   - Monthly tidak menggunakan Rule Work.
   - Attendance automatic rule ditangani Payroll Engine.
===================================================== */


/* =====================================================
   IMPORT PAYROLL ENGINE
===================================================== */

import {
    Payroll
} from "./payroll.js";


/* =====================================================
   CONSTANT
===================================================== */

const PAYROLL_MODE =
    "payroll-monthly";


/* =====================================================
   MONTH OPTION
===================================================== */

const MONTH_OPTIONS = [
    {
        value : "01",
        label : "Januari"
    },
    {
        value : "02",
        label : "Februari"
    },
    {
        value : "03",
        label : "Maret"
    },
    {
        value : "04",
        label : "April"
    },
    {
        value : "05",
        label : "Mei"
    },
    {
        value : "06",
        label : "Juni"
    },
    {
        value : "07",
        label : "Juli"
    },
    {
        value : "08",
        label : "Agustus"
    },
    {
        value : "09",
        label : "September"
    },
    {
        value : "10",
        label : "Oktober"
    },
    {
        value : "11",
        label : "November"
    },
    {
        value : "12",
        label : "Desember"
    }
];


/* =====================================================
   YEAR OPTION
===================================================== */

const CURRENT_YEAR =
    new Date().getFullYear();

const YEAR_OPTIONS = [];

for(
    let year = CURRENT_YEAR - 2;
    year <= CURRENT_YEAR + 15;
    year++
){
    YEAR_OPTIONS.push(
        {
            value :
                String(year),

            label :
                String(year)
        }
    );
}


/* =====================================================
   MONTH YEAR OPTION
===================================================== */

const MONTH_YEAR_OPTIONS = [];

YEAR_OPTIONS.forEach(
    year => {

        MONTH_OPTIONS.forEach(
            month => {

                MONTH_YEAR_OPTIONS.push(
                    {
                        value :
                            `${year.value}-${month.value}`,

                        label :
                            `${month.label} ${year.label}`
                    }
                );

            }
        );

    }
);


/* =====================================================
   RULE POTONG OPTIONS
   Master list.
   
   Jangan dimutasi.
   UI akan mengambil list ini lalu
   menghilangkan option yang sudah dibuat.
===================================================== */

const POTONG_OPTIONS = [

    {
        value :
            "BPJS",

        label :
            "BPJS"
    },

    {
        value :
            "tabungan",

        label :
            "Tabungan"
    },

    {
        value :
            "Jamsostek",

        label :
            "Jamsostek"
    },

    {
        value :
            "koperasi",

        label :
            "Koperasi"
    },

    {
        value :
            "lain-lain",

        label :
            "Lain-lain"
    },

    {
        value :
            "telat_1",

        label :
            "Telat 1"
    },

    {
        value :
            "telat_2",

        label :
            "Telat 2"
    },

    {
        value :
            "telat_3",

        label :
            "Telat 3"
    },

    {
        value :
            "telat_4",

        label :
            "Telat 4"
    },

    {
        value :
            "izin_telat",

        label :
            "Izin Telat"
    },

    {
        value :
            "izin_pulang",

        label :
            "Izin Pulang"
    },

    {
        value :
            "absen",

        label :
            "Absen"
    }

];


/* =====================================================
   RULE TAMBAH OPTIONS
   Master list.
===================================================== */

const TAMBAH_OPTIONS = [

    {
        value :
            "tunjangan",

        label :
            "Tunjangan"
    },

    {
        value :
            "uang_transport",

        label :
            "Uang Transport"
    },

    {
        value :
            "uang_makan",

        label :
            "Uang Makan"
    },

    {
        value :
            "lembur",

        label :
            "Lembur"
    },

    {
        value :
            "lembur_jam_1",

        label :
            "Lembur Jam 1"
    },

    {
        value :
            "lembur_jam_2",

        label :
            "Lembur Jam 2"
    },

    {
        value :
            "lembur_jam_3",

        label :
            "Lembur Jam 3"
    },

    {
        value :
            "lembur_jam_4",

        label :
            "Lembur Jam 4"
    },

    {
        value :
            "lembur_jam_5",

        label :
            "Lembur Jam 5"
    },

    {
        value :
            "lembur_jam_6",

        label :
            "Lembur Jam 6"
    },

    {
        value :
            "lembur_jam_7",

        label :
            "Lembur Jam 7"
    },

    {
        value :
            "lembur_jam_8",

        label :
            "Lembur Jam 8"
    }

];


/* =====================================================
   ATTENDANCE FEATURE DEFINITIONS

   Setiap checkbox memiliki identitas
   automatic rule yang dibuat Payroll Engine.
===================================================== */

const ATTENDANCE_FEATURES = [

    {
        field :
            "aktifkanRuleLembur",

        label :
            "Rule Lembur",

        rules : [
            {
                type_rule :
                    "rule_lembur",

                nama :
                    "lembur_jam"
            }
        ]
    },

    {
        field :
            "aktifkanRuleIzin",

        label :
            "Rule Izin",

        rules : [
            {
                type_rule :
                    "rule_izin",

                nama :
                    "izin_pulang"
            }
        ]
    },

    {
        field :
            "gunakanRuleTelat",

        label :
            "Rule Telat",

        rules : [
            {
                type_rule :
                    "rule_telat",

                nama :
                    "telat"
            },

            {
                type_rule :
                    "rule_telat",

                nama :
                    "izin_telat"
            }
        ]
    },

    {
        field :
            "gunakanRuleShift",

        label :
            "Rule Shift",

        rules : [
            {
                type_rule :
                    "rule_shift",

                nama :
                    "shift"
            }
        ]
    }

];


/* =====================================================
   HELPER :
   NORMALIZE VALUE
===================================================== */

function normalizeValue(
    value
){

    if(
        value ===
        null
        ||
        value ===
        undefined
    ){
        return "";
    }

    return String(
        value
    ).trim();

}


/* =====================================================
   HELPER :
   NORMALIZE COMPARE
===================================================== */

function normalizeCompareValue(
    value
){

    return normalizeValue(
        value
    ).toLowerCase();

}


/* =====================================================
   HELPER :
   CREATE ISO DATE
===================================================== */

function createISODate(
    year,
    month,
    day
){

    const y =
        Number(year);

    const m =
        Number(month);

    const d =
        Number(day);

    if(
        !Number.isInteger(y)
        ||
        !Number.isInteger(m)
        ||
        !Number.isInteger(d)
    ){
        return "";
    }

    if(
        m < 1
        ||
        m > 12
        ||
        d < 1
        ||
        d > 31
    ){
        return "";
    }

    const date =
        new Date(
            y,
            m - 1,
            d
        );

    /*
     * Prevent JavaScript date rollover.
     *
     * Contoh :
     * 31 Februari
     * tidak boleh berubah menjadi
     * 3 Maret.
     */

    if(
        date.getFullYear() !== y
        ||
        date.getMonth() !== m - 1
        ||
        date.getDate() !== d
    ){
        return "";
    }

    return [
        String(y),
        String(m).padStart(2, "0"),
        String(d).padStart(2, "0")
    ].join("-");

}


/* =====================================================
   HELPER :
   PARSE MONTH YEAR
===================================================== */

function parseMonthYear(
    value
){

    const normalized =
        normalizeValue(
            value
        );

    const match =
        normalized.match(
            /^(\d{4})-(\d{2})$/
        );

    if(
        !match
    ){
        return null;
    }

    const year =
        Number(
            match[1]
        );

    const month =
        Number(
            match[2]
        );

    if(
        month < 1
        ||
        month > 12
    ){
        return null;
    }

    return {
        year,
        month
    };

}


/* =====================================================
   HELPER :
   NEXT MONTH
===================================================== */

function getNextMonth(
    year,
    month
){

    if(
        month === 12
    ){
        return {
            year :
                year + 1,

            month :
                1
        };
    }

    return {
        year,

        month :
            month + 1
    };

}


/* =====================================================
   HELPER :
   DAY NUMBER
===================================================== */

function getDayNumber(
    value
){

    const normalized =
        normalizeValue(
            value
        );

    if(
        normalized === ""
    ){
        return NaN;
    }

    const number =
        Number(
            normalized
        );

    if(
        !Number.isFinite(
            number
        )
    ){
        return NaN;
    }

    return Math.trunc(
        number
    );

}


/* =====================================================
   HELPER :
   CHECK TELAT
===================================================== */

function isTelatRule(
    nama
){

    return [
        "telat_1",
        "telat_2",
        "telat_3",
        "telat_4"
    ].includes(
        nama
    );

}


/* =====================================================
   HELPER :
   CHECK LEMBUR JAM
===================================================== */

function isLemburJamRule(
    nama
){

    return /^lembur_jam_[1-8]$/.test(
        normalizeValue(
            nama
        )
    );

}


/* =====================================================
   HELPER :
   GET MONTHLY ATTENDANCE SETTINGS
===================================================== */

function getMonthlyAttendanceSettings(
    data
){

    if(
        !Array.isArray(
            data
        )
    ){
        return {};
    }

    const item =
        data.find(
            entry => {

                const rule =
                    entry?.data ??
                    entry;

                return (
                    rule
                    &&
                    rule.type ===
                        "payroll_monthly"
                );

            }
        );

    if(
        !item
    ){
        return {};
    }

    const rule =
        item?.data ??
        item;

    return {

        aktifkanRuleLembur :
            rule.aktifkanRuleLembur ===
            true,

        aktifkanRuleIzin :
            rule.aktifkanRuleIzin ===
            true,

        gunakanRuleTelat :
            rule.gunakanRuleTelat ===
            true,

        gunakanRuleShift :
            rule.gunakanRuleShift ===
            true

    };

}


/* =====================================================
   HELPER :
   IS PERIOD RESULT
===================================================== */

function isPeriodRule(
    item
){

    const rule =
        item?.data ??
        item;

    return (
        rule
        &&
        normalizeValue(
            rule.type_rule
        ) ===
            "rule_periode"
        &&
        normalizeValue(
            rule.nama
        ) ===
            "periode_gaji"
    );

}


/* =====================================================
   HELPER :
   IS AUTOMATIC MONTHLY RULE
===================================================== */

function isAutomaticMonthlyRule(
    item
){

    const rule =
        item?.data ??
        item;

    if(
        !rule
    ){
        return false;
    }

    const typeRule =
        normalizeValue(
            rule.type_rule
        );

    return [
        "rule_masuk",
        "rule_lembur",
        "rule_izin",
        "rule_telat",
        "rule_shift"
    ].includes(
        typeRule
    );

}


/* =====================================================
   HELPER :
   CLEAN PAYLOAD FOR NEW PERIOD

   Hanya digunakan ketika memang sedang
   membuat periode baru.

   Automatic attendance lama dibuang dari
   payload sementara supaya Payroll Engine
   dapat membuat automatic rule untuk periode
   baru.

   Pada save normal, helper ini TIDAK dipakai.
===================================================== */

function getManualPayrollPayload(
    data
){

    if(
        !Array.isArray(
            data
        )
    ){
        return [];
    }

    return data.filter(
        item => {

            if(
                !item
            ){
                return false;
            }

            const rule =
                item?.data ??
                item;

            /*
             * Setting checkbox bukan
             * payroll rule yang disimpan.
             */

            if(
                rule
                &&
                rule.type ===
                    "payroll_monthly"
            ){
                return false;
            }

            /*
             * Automatic attendance lama
             * hanya dikeluarkan ketika
             * periode baru dibuat.
             */

            if(
                isAutomaticMonthlyRule(
                    item
                )
            ){
                return false;
            }

            return true;

        }
    );

}


/* =====================================================
   HELPER :
   GET RULE FROM CURRENT PERIOD
===================================================== */

function getCurrentPeriodRuleList(
    rules,
    typeRule,
    nama
){

    if(
        !Array.isArray(
            rules
        )
    ){
        return [];
    }

    const targetType =
        normalizeCompareValue(
            typeRule
        );

    const targetName =
        normalizeCompareValue(
            nama
        );

    return rules.filter(
        rule => {

            if(
                !rule
            ){
                return false;
            }

            return (
                normalizeCompareValue(
                    rule.type_rule
                ) ===
                    targetType
                &&
                normalizeCompareValue(
                    rule.nama
                ) ===
                    targetName
            );

        }
    );

}


/* =====================================================
   HELPER :
   ATTENDANCE FEATURE CREATED STATE
===================================================== */

function isAttendanceFeatureCreated(
    rules,
    feature
){

    if(
        !feature
        ||
        !Array.isArray(
            feature.rules
        )
    ){
        return false;
    }

    /*
     * Semua rule yang membentuk satu feature
     * harus sudah ada.

     * Contoh Rule Telat:
     *
     * rule_telat / telat
     * rule_telat / izin_telat
     *
     * Keduanya harus ada agar status menjadi
     * "Rule Telat sudah dibuat".
     */

    return feature.rules.every(
        requiredRule => {

            return (
                getCurrentPeriodRuleList(
                    rules,
                    requiredRule.type_rule,
                    requiredRule.nama
                ).length >
                0
            );

        }
    );

}


/* =====================================================
   HELPER :
   GET ATTENDANCE FEATURE STATES
===================================================== */

function getAttendanceFeatureStates(
    rules
){

    const states = {};

    ATTENDANCE_FEATURES.forEach(
        feature => {

            states[
                feature.field
            ] =
                isAttendanceFeatureCreated(
                    rules,
                    feature
                );

        }
    );

    return states;

}


/* =====================================================
   HELPER :
   APPLY SELECT OPTIONS
===================================================== */

function applyAvailableSelectOptions(
    section,
    fieldName,
    masterOptions,
    lockedNames,
    newPeriodMode
){

    if(
        !section
        ||
        !Array.isArray(
            section.fields
        )
    ){
        return;
    }

    const field =
        section.fields.find(
            item =>
                item
                &&
                item.name ===
                    fieldName
        );

    if(
        !field
    ){
        return;
    }

    const options =
        Array.isArray(
            masterOptions
        )
            ?
        masterOptions
            :
        [];

    /*
     * Periode baru:
     *
     * semua option kembali tersedia.
     */

    if(
        newPeriodMode
    ){

        field.options =
            options.map(
                option => ({
                    ...option
                })
            );

        return;
    }


    const locked =
        lockedNames instanceof Set
            ?
        lockedNames
            :
        new Set();


    field.options =
        options.filter(
            option => {

                const value =
                    normalizeCompareValue(
                        option?.value
                    );

                return !locked.has(
                    value
                );

            }
        ).map(
            option => ({
                ...option
            })
        );

}


/* =====================================================
   HELPER :
   APPLY RULE GAJI UI

   DOM hanya digunakan sebagai target render.
   State tetap berasal dari Payroll.
===================================================== */

function applyRuleGajiUI(
    sectionElement,
    locked
){

    if(
        !sectionElement
    ){
        return;
    }

    const form =
        sectionElement.querySelector(
            ".global-setting-form"
        );

    if(
        !form
    ){
        return;
    }

    if(
        locked
    ){

        form.querySelectorAll(
            "input, select, textarea"
        ).forEach(
            element => {

                element.disabled =
                    true;

            }
        );


        form.querySelectorAll(
            "button"
        ).forEach(
            button => {

                if(
                    button.classList.contains(
                        "global-setting-form-add"
                    )
                ){
                    button.disabled =
                        true;
                }

            }
        );

    }
    else{

        form.querySelectorAll(
            "input, select, textarea"
        ).forEach(
            element => {

                element.disabled =
                    false;

            }
        );


        form.querySelectorAll(
            "button"
        ).forEach(
            button => {

                if(
                    button.classList.contains(
                        "global-setting-form-add"
                    )
                ){
                    button.disabled =
                        false;
                }

            }
        );


        /*
         * Jika periode baru dibuka,
         * status "sudah dibuat" dari periode
         * lama tidak boleh tertinggal.
         */

        sectionElement
            .querySelectorAll(
                ".payroll-rule-created-note"
            )
            .forEach(
                element => {

                    element.remove();

                }
            );

    }

}


/* =====================================================
   HELPER :
   APPLY ATTENDANCE UI
===================================================== */

function applyAttendanceUI(
    sectionElement,
    section,
    featureStates,
    newPeriodMode
){

    if(
        !sectionElement
    ){
        return;
    }

    if(
        !section
        ||
        !Array.isArray(
            section.fields
        )
    ){
        return;
    }


    const fields =
        section.fields;


    ATTENDANCE_FEATURES.forEach(
        feature => {

            const field =
                fields.find(
                    item =>
                        item
                        &&
                        item.name ===
                            feature.field
                );

            if(
                !field
            ){
                return;
            }


            const wrapper =
                sectionElement.querySelector(
                    `.global-setting-field[data-field="${feature.field}"]`
                );

            if(
                !wrapper
            ){
                return;
            }


            const input =
                wrapper.querySelector(
                    `input[name="${feature.field}"]`
                );


            const label =
                wrapper.querySelector(
                    "label"
                );


            const note =
                wrapper.querySelector(
                    ".global-setting-field-note"
                );


            /*
             * Jika sedang membuat periode baru,
             * seluruh checkbox dibuka kembali.
             */

            if(
                newPeriodMode
            ){

                if(
                    input
                ){

                    input.disabled =
                        false;

                    input.style.display =
                        "";

                }


                if(
                    label
                ){

                    label.textContent =
                        field.label ??
                        feature.field;

                }


                if(
                    note
                ){

                    note.style.display =
                        "";

                    note.textContent =
                        field.note ??
                        "";

                }


                wrapper
                    .querySelectorAll(
                        ".payroll-attendance-created-note"
                    )
                    .forEach(
                        element => {

                            element.remove();

                        }
                    );


                return;

            }


            const created =
                featureStates[
                    feature.field
                ] === true;


            /*
             * Rule sudah dibuat.
             */

            if(
                created
            ){

                if(
                    input
                ){

                    input.checked =
                        false;

                    input.disabled =
                        true;

                    input.style.display =
                        "none";

                }


                if(
                    label
                ){

                    label.textContent =
                        `✓ ${feature.label} sudah dibuat`;

                    label.classList.add(
                        "payroll-attendance-created-label"
                    );

                }


                if(
                    note
                ){

                    note.style.display =
                        "none";

                }


                let status =
                    wrapper.querySelector(
                        ".payroll-attendance-created-note"
                    );


                if(
                    !status
                ){

                    status =
                        document.createElement(
                            "small"
                        );

                    status.className =
                        "global-setting-field-note payroll-attendance-created-note";

                    wrapper.appendChild(
                        status
                    );

                }


                status.textContent =
                    `✓ ${feature.label} sudah dibuat`;

            }


            /*
             * Rule belum dibuat.
             */

            else{

                if(
                    input
                ){

                    input.disabled =
                        false;

                    input.style.display =
                        "";

                }


                if(
                    label
                ){

                    label.textContent =
                        field.label ??
                        feature.field;

                    label.classList.remove(
                        "payroll-attendance-created-label"
                    );

                }


                if(
                    note
                ){

                    note.style.display =
                        "";

                    note.textContent =
                        field.note ??
                        "";

                }


                wrapper
                    .querySelectorAll(
                        ".payroll-attendance-created-note"
                    )
                    .forEach(
                        element => {

                            element.remove();

                        }
                    );

            }

        }
    );

}


/* =====================================================
   HELPER :
   APPLY ATTENDANCE STATE
===================================================== */

async function refreshAttendanceState(
    sectionElement,
    section
){

    if(
        !sectionElement
    ){
        return;
    }


    /*
     * Pastikan Payroll sudah membaca Rules Sheet.
     */

    const state =
        await Payroll.getRuleState(
            {
                mode :
                    PAYROLL_MODE,

                sectionId :
                    "rule_periode"
            }
        );


    const newPeriodMode =
        state?.newPeriodMode ===
        true;


    /*
     * Periode baru:
     *
     * jangan menggunakan rule periode lama
     * untuk mengunci attendance.
     */

    if(
        newPeriodMode
    ){

        applyAttendanceUI(
            sectionElement,
            section,
            {},
            true
        );

        return;

    }


    const rules =
        await Payroll.getCurrentPeriodRules(
            PAYROLL_MODE
        );


    const featureStates =
        getAttendanceFeatureStates(
            rules
        );


    applyAttendanceUI(
        sectionElement,
        section,
        featureStates,
        false
    );

}


/* =====================================================
   MONTHLY SETTING
===================================================== */

export const MonthlySetting = {

    /* =================================================
       HEADER
    ================================================= */

    title :
        "Pengaturan Payroll Monthly",

    subtitle :
        "Atur periode dan rule payroll monthly",


    /* =================================================
       SECTIONS
    ================================================= */

    sections : [


        /* =================================================
           RULE PERIODE
        ================================================= */

        {

            id :
                "rule_periode",

            title :
                "📅 Periode Gaji",

            description :
                "Tentukan periode perhitungan dan masa aktif gaji.",

            addLabel :
                "＋ Tambah Periode Baru",

            formAddLabel :
                "＋ Tambahkan",

            deleteLabel :
                "Hapus",

            uniqueFields : [
                "nilai_start",
                "nilai_end",
                "berlaku_start",
                "berlaku_end"
            ],

            autoCloseForm :
                true,


            /* =============================================
               FIELDS
            ============================================= */

            fields : [

                {

                    name :
                        "nilai_start_day",

                    label :
                        "Tanggal Mulai Periode Perhitungan",

                    type :
                        "number",

                    placeholder :
                        "Contoh: 25",

                    required :
                        true,

                    min :
                        1,

                    max :
                        31,

                    step :
                        1,

                    note :
                        "Masukkan tanggal awal periode perhitungan gaji."
                },


                {

                    name :
                        "nilai_end_day",

                    label :
                        "Tanggal Akhir Periode Perhitungan",

                    type :
                        "number",

                    placeholder :
                        "Contoh: 24",

                    required :
                        true,

                    min :
                        1,

                    max :
                        31,

                    step :
                        1,

                    note :
                        "Tanggal akhir otomatis berada satu bulan setelah bulan mulai."
                },


                {

                    name :
                        "periode_start_month",

                    label :
                        "Masa Aktif Mulai",

                    type :
                        "select",

                    placeholder :
                        "Pilih bulan dan tahun",

                    required :
                        true,

                    options :
                        MONTH_YEAR_OPTIONS,

                    note :
                        "Tentukan bulan dan tahun mulai berlakunya payroll."
                },


                {

                    name :
                        "periode_end_month",

                    label :
                        "Masa Aktif Berakhir",

                    type :
                        "select",

                    placeholder :
                        "Pilih bulan dan tahun",

                    required :
                        true,

                    options :
                        MONTH_YEAR_OPTIONS,

                    note :
                        "Tentukan bulan dan tahun berakhirnya payroll."
                }

            ],


            /* =============================================
               NORMALIZE
            ============================================= */

            normalize :
                function(
                    data
                ){

                    const startDay =
                        getDayNumber(
                            data.nilai_start_day
                        );

                    const endDay =
                        getDayNumber(
                            data.nilai_end_day
                        );

                    if(
                        !Number.isInteger(
                            startDay
                        )
                        ||
                        startDay < 1
                        ||
                        startDay > 31
                    ){

                        alert(
                            "Tanggal mulai periode harus antara 1 sampai 31."
                        );

                        return null;
                    }


                    if(
                        !Number.isInteger(
                            endDay
                        )
                        ||
                        endDay < 1
                        ||
                        endDay > 31
                    ){

                        alert(
                            "Tanggal akhir periode harus antara 1 sampai 31."
                        );

                        return null;
                    }


                    const activeStart =
                        parseMonthYear(
                            data.periode_start_month
                        );

                    const activeEnd =
                        parseMonthYear(
                            data.periode_end_month
                        );


                    if(
                        !activeStart
                        ||
                        !activeEnd
                    ){

                        alert(
                            "Bulan dan tahun masa aktif belum lengkap."
                        );

                        return null;
                    }


                    const calculationEndMonth =
                        getNextMonth(
                            activeStart.year,
                            activeStart.month
                        );


                    const nilaiStart =
                        createISODate(
                            activeStart.year,
                            activeStart.month,
                            startDay
                        );


                    const nilaiEnd =
                        createISODate(
                            calculationEndMonth.year,
                            calculationEndMonth.month,
                            endDay
                        );


                    const berlakuStart =
                        createISODate(
                            activeStart.year,
                            activeStart.month,
                            startDay
                        );


                    const berlakuEnd =
                        createISODate(
                            activeEnd.year,
                            activeEnd.month,
                            endDay
                        );


                    if(
                        !nilaiStart
                        ||
                        !nilaiEnd
                        ||
                        !berlakuStart
                        ||
                        !berlakuEnd
                    ){

                        alert(
                            "Tanggal periode tidak valid untuk bulan yang dipilih."
                        );

                        return null;
                    }


                    if(
                        new Date(
                            berlakuEnd
                        ) <
                        new Date(
                            berlakuStart
                        )
                    ){

                        alert(
                            "Masa aktif berakhir sebelum masa aktif dimulai."
                        );

                        return null;
                    }


                    return {

                        type_rule :
                            "rule_periode",

                        nama :
                            "periode_gaji",

                        kondisi :
                            "periode",

                        waktu :
                            "bulanan",

                        nominal :
                            "",

                        nilai_start :
                            nilaiStart,

                        nilai_end :
                            nilaiEnd,

                        berlaku_start :
                            berlakuStart,

                        berlaku_end :
                            berlakuEnd

                    };

                },


            /* =============================================
               RULE STATE
            ============================================= */

            getRuleState :
                async function(
                    {
                        sectionElement
                    } = {}
                ){

                    await Payroll.applySectionState(
                        sectionElement,
                        PAYROLL_MODE,
                        "rule_periode"
                    );


                    return Payroll.getRuleState(
                        {
                            mode :
                                PAYROLL_MODE,

                            sectionId :
                                "rule_periode"
                        }
                    );

                }

        },


        /* =================================================
           RULE GAJI
        ================================================= */

        {

            id :
                "rule_gaji",

            title :
                "💰 Rule Gaji",

            description :
                "Tentukan gaji pokok yang digunakan dalam perhitungan payroll.",

            addLabel :
                "＋ Tambah Rule Gaji",

            formAddLabel :
                "＋ Tambahkan",

            deleteLabel :
                "Hapus",

            uniqueFields : [
                "nama"
            ],

            autoCloseForm :
                true,


            fields : [

                {

                    name :
                        "nama",

                    label :
                        "Nama Gaji",

                    type :
                        "select",

                    placeholder :
                        "Pilih gaji",

                    required :
                        true,

                    options : [
                        {

                            value :
                                "gaji",

                            label :
                                "Gaji Pokok"

                        }
                    ]
                },


                {

                    name :
                        "nominal",

                    label :
                        "Nominal Gaji Pokok",

                    type :
                        "number",

                    placeholder :
                        "Contoh: 5157500",

                    required :
                        true,

                    min :
                        0,

                    step :
                        1,

                    note :
                        "Masukkan nominal gaji pokok untuk satu periode gaji."
                }

            ],


            /* =============================================
               NORMALIZE
            ============================================= */

            normalize :
                function(
                    data
                ){

                    return Payroll.prepareRule(
                        PAYROLL_MODE,
                        {

                            type_rule :
                                "rule_gaji",

                            nama :
                                "gaji",

                            kondisi :
                                "gaji_pokok",

                            waktu :
                                "bulanan",

                            nominal :
                                data.nominal,

                            nilai_start :
                                "",

                            nilai_end :
                                "",

                            berlaku_start :
                                "",

                            berlaku_end :
                                ""

                        }
                    );

                },


            /* =============================================
               RULE STATE
            ============================================= */

            getRuleState :
                async function(
                    {
                        sectionElement
                    } = {}
                ){

                    await Payroll.applySectionState(
                        sectionElement,
                        PAYROLL_MODE,
                        "rule_gaji"
                    );


                    const state =
                        await Payroll.getRuleState(
                            {
                                mode :
                                    PAYROLL_MODE,

                                sectionId :
                                    "rule_gaji"
                            }
                        );


                    const locked =
                        state?.gaji ===
                        true;


                    applyRuleGajiUI(
                        sectionElement,
                        locked
                    );


                    return state;

                }

        },


        /* =================================================
           RULE POTONG
        ================================================= */

        {

            id :
                "rule_potong",

            title :
                "➖ Rule Potong",

            description :
                "Atur aturan pemotongan gaji dan attendance.",

            addLabel :
                "＋ Tambah Rule Potong",

            formAddLabel :
                "＋ Tambahkan",

            deleteLabel :
                "Hapus",

            uniqueFields : [
                "nama"
            ],


            fields : [

                /* -----------------------------------------
                   NAMA
                ----------------------------------------- */

                {

                    name :
                        "nama",

                    label :
                        "Nama Rule Potong",

                    type :
                        "select",

                    placeholder :
                        "Pilih rule potong",

                    required :
                        true,

                    note :
                        "Pilih jenis potongan yang ingin digunakan.",

                    options :
                        POTONG_OPTIONS.map(
                            option => ({
                                ...option
                            })
                        )

                },


                /* -----------------------------------------
                   NOMINAL
                ----------------------------------------- */

                {

                    name :
                        "nominal",

                    label :
                        "Nominal Potongan",

                    type :
                        "number",

                    placeholder :
                        "Contoh: 40000",

                    required :
                        true,

                    min :
                        0,

                    step :
                        1,

                    note :
                        "Masukkan nominal potongan."
                },


                /* -----------------------------------------
                   NILAI START
                ----------------------------------------- */

                {

                    name :
                        "nilai_start",

                    label :
                        "Nilai Start",

                    type :
                        "number",

                    placeholder :
                        "Contoh: 1",

                    required :
                        false,

                    min :
                        1,

                    step :
                        1,

                    dependsOn : {

                        field :
                            "nama",

                        values : [
                            "telat_1",
                            "telat_2",
                            "telat_3",
                            "telat_4"
                        ]

                    },

                    note :
                        "Isi batas awal keterlambatan dalam menit."
                },


                /* -----------------------------------------
                   NILAI END
                ----------------------------------------- */

                {

                    name :
                        "nilai_end",

                    label :
                        "Nilai End",

                    type :
                        "number",

                    placeholder :
                        "Contoh: 30",

                    required :
                        false,

                    min :
                        1,

                    step :
                        1,

                    dependsOn : {

                        field :
                            "nama",

                        values : [
                            "telat_1",
                            "telat_2",
                            "telat_3",
                            "telat_4"
                        ]

                    },

                    note :
                        "Isi batas akhir keterlambatan dalam menit."
                }

            ],


            /* =============================================
               NORMALIZE
            ============================================= */

            normalize :
                function(
                    data
                ){

                    const nama =
                        normalizeValue(
                            data.nama
                        );

                    let kondisi =
                        "periode";

                    let waktu =
                        "gaji";


                    if(
                        isTelatRule(
                            nama
                        )
                    ){

                        kondisi =
                            "telat";

                        waktu =
                            "menit";


                        const start =
                            getDayNumber(
                                data.nilai_start
                            );

                        const end =
                            getDayNumber(
                                data.nilai_end
                            );


                        if(
                            !Number.isInteger(
                                start
                            )
                            ||
                            !Number.isInteger(
                                end
                            )
                        ){

                            alert(
                                "Nilai Start dan Nilai End wajib diisi untuk Rule Telat."
                            );

                            return null;
                        }


                        if(
                            start >
                            end
                        ){

                            alert(
                                "Nilai Start tidak boleh lebih besar dari Nilai End."
                            );

                            return null;
                        }

                    }
                    else if(
                        nama ===
                        "izin_telat"
                    ){

                        kondisi =
                            "izin_telat";

                        waktu =
                            "jam";

                    }
                    else if(
                        nama ===
                        "izin_pulang"
                    ){

                        kondisi =
                            "izin_pulang";

                        waktu =
                            "jam";

                    }
                    else if(
                        nama ===
                        "absen"
                    ){

                        kondisi =
                            "absen";

                        waktu =
                            "harian";

                    }


                    return Payroll.prepareRule(
                        PAYROLL_MODE,
                        {

                            type_rule :
                                "rule_potong",

                            nama :
                                nama,

                            kondisi :
                                kondisi,

                            waktu :
                                waktu,

                            nominal :
                                data.nominal ??
                                "",

                            nilai_start :
                                data.nilai_start ??
                                "",

                            nilai_end :
                                data.nilai_end ??
                                "",

                            berlaku_start :
                                "",

                            berlaku_end :
                                ""

                        }
                    );

                },


            /* =============================================
               RULE STATE
            ============================================= */

            getRuleState :
                async function(
                    {
                        section,
                        sectionElement
                    } = {}
                ){

                    await Payroll.applySectionState(
                        sectionElement,
                        PAYROLL_MODE,
                        "rule_potong"
                    );


                    const state =
                        await Payroll.getRuleState(
                            {
                                mode :
                                    PAYROLL_MODE,

                                sectionId :
                                    "rule_potong"
                            }
                        );


                    const locked =
                        state?.lockedPotong
                            instanceof Set
                                ?
                            state.lockedPotong
                                :
                            null;


                    /*
                     * Payroll engine tetap menjadi
                     * sumber lock.
                     *
                     * Config options hanya dirender
                     * ulang berdasarkan state tersebut.
                     */

                    let names =
                        locked;


                    if(
                        !(
                            names instanceof Set
                        )
                    ){

                        const rules =
                            await Payroll.getCurrentPeriodRules(
                                PAYROLL_MODE
                            );


                        names =
                            new Set();

                        rules.forEach(
                            rule => {

                                if(
                                    normalizeCompareValue(
                                        rule?.type_rule
                                    ) !==
                                    "rule_potong"
                                ){
                                    return;
                                }

                                const nama =
                                    normalizeCompareValue(
                                        rule?.nama
                                    );

                                if(
                                    nama
                                ){
                                    names.add(
                                        nama
                                    );
                                }

                            }
                        );

                    }


                    const periodState =
                        await Payroll.getRuleState(
                            {
                                mode :
                                    PAYROLL_MODE,

                                sectionId :
                                    "rule_periode"
                            }
                        );


                    applyAvailableSelectOptions(
                        section,
                        "nama",
                        POTONG_OPTIONS,
                        names,
                        periodState?.newPeriodMode === true
                    );


                    return state;

                }

        },


        /* =================================================
           RULE TAMBAH
        ================================================= */

        {

            id :
                "rule_tambah",

            title :
                "➕ Rule Tambah",

            description :
                "Atur tunjangan, uang makan, transport, dan lembur.",

            addLabel :
                "＋ Tambah Rule Tambah",

            formAddLabel :
                "＋ Tambahkan",

            deleteLabel :
                "Hapus",

            uniqueFields : [
                "nama"
            ],

            autoCloseForm :
                true,


            fields : [

                /* -----------------------------------------
                   NAMA
                ----------------------------------------- */

                {

                    name :
                        "nama",

                    label :
                        "Nama Rule Tambah",

                    type :
                        "select",

                    placeholder :
                        "Pilih rule tambah",

                    required :
                        true,

                    note :
                        "Pilih jenis tambahan yang ingin dibuat.",

                    options :
                        TAMBAH_OPTIONS.map(
                            option => ({
                                ...option
                            })
                        )

                },


                /* -----------------------------------------
                   KONDISI UANG MAKAN
                ----------------------------------------- */

                {

                    name :
                        "kondisi",

                    label :
                        "Kondisi Uang Makan",

                    type :
                        "select",

                    placeholder :
                        "Pilih kondisi",

                    required :
                        true,

                    dependsOn : {

                        field :
                            "nama",

                        value :
                            "uang_makan"

                    },

                    note :
                        "Masuk + Lembur dihitung harian. Periode dihitung bulanan.",

                    options : [

                        {

                            value :
                                "masuk,lembur",

                            label :
                                "Masuk + Lembur"

                        },

                        {

                            value :
                                "periode",

                            label :
                                "Periode"

                        }

                    ]

                },


                /* -----------------------------------------
                   NOMINAL
                ----------------------------------------- */

                {

                    name :
                        "nominal",

                    label :
                        "Nominal",

                    type :
                        "number",

                    placeholder :
                        "Contoh: 50000",

                    required :
                        true,

                    min :
                        0,

                    step :
                        1,

                    note :
                        "Masukkan nominal rule tambah."
                },


                /* -----------------------------------------
                   NILAI START
                ----------------------------------------- */

                {

                    name :
                        "nilai_start",

                    label :
                        "Nilai Start",

                    type :
                        "number",

                    placeholder :
                        "Contoh: 1",

                    required :
                        false,

                    min :
                        1,

                    step :
                        1,

                    dependsOn : {

                        field :
                            "nama",

                        values : [
                            "lembur_jam_1",
                            "lembur_jam_2",
                            "lembur_jam_3",
                            "lembur_jam_4",
                            "lembur_jam_5",
                            "lembur_jam_6",
                            "lembur_jam_7",
                            "lembur_jam_8"
                        ]

                    },

                    note :
                        "Isi batas awal jam lembur."
                },


                /* -----------------------------------------
                   NILAI END
                ----------------------------------------- */

                {

                    name :
                        "nilai_end",

                    label :
                        "Nilai End",

                    type :
                        "number",

                    placeholder :
                        "Contoh: 2",

                    required :
                        false,

                    min :
                        1,

                    step :
                        1,

                    dependsOn : {

                        field :
                            "nama",

                        values : [
                            "lembur_jam_1",
                            "lembur_jam_2",
                            "lembur_jam_3",
                            "lembur_jam_4",
                            "lembur_jam_5",
                            "lembur_jam_6",
                            "lembur_jam_7",
                            "lembur_jam_8"
                        ]

                    },

                    note :
                        "Isi batas akhir jam lembur."
                }

            ],


            /* =============================================
               NORMALIZE
            ============================================= */

            normalize :
                function(
                    data
                ){

                    const nama =
                        normalizeValue(
                            data.nama
                        );

                    let kondisi =
                        "periode";

                    let waktu =
                        "gaji";


                    if(
                        nama ===
                        "uang_makan"
                    ){

                        if(
                            data.kondisi ===
                            "masuk,lembur"
                        ){

                            kondisi =
                                "masuk,lembur";

                            waktu =
                                "harian";

                        }
                        else{

                            kondisi =
                                "periode";

                            waktu =
                                "bulanan";

                        }

                    }
                    else if(
                        nama ===
                        "lembur"
                    ){

                        kondisi =
                            "lembur_harian";

                        waktu =
                            "harian";

                    }
                    else if(
                        isLemburJamRule(
                            nama
                        )
                    ){

                        kondisi =
                            "masuk,lembur";

                        waktu =
                            "jam";


                        const start =
                            getDayNumber(
                                data.nilai_start
                            );

                        const end =
                            getDayNumber(
                                data.nilai_end
                            );


                        if(
                            !Number.isInteger(
                                start
                            )
                            ||
                            !Number.isInteger(
                                end
                            )
                        ){

                            alert(
                                "Nilai Start dan Nilai End wajib diisi untuk Rule Lembur Jam."
                            );

                            return null;
                        }


                        if(
                            start >
                            end
                        ){

                            alert(
                                "Nilai Start tidak boleh lebih besar dari Nilai End."
                            );

                            return null;
                        }

                    }


                    return Payroll.prepareRule(
                        PAYROLL_MODE,
                        {

                            type_rule :
                                "rule_tambah",

                            nama :
                                nama,

                            kondisi :
                                kondisi,

                            waktu :
                                waktu,

                            nominal :
                                data.nominal ??
                                "",

                            nilai_start :
                                data.nilai_start ??
                                "",

                            nilai_end :
                                data.nilai_end ??
                                "",

                            berlaku_start :
                                "",

                            berlaku_end :
                                ""

                        }
                    );

                },


            /* =============================================
               RULE STATE
            ============================================= */

            getRuleState :
                async function(
                    {
                        section,
                        sectionElement
                    } = {}
                ){

                    await Payroll.applySectionState(
                        sectionElement,
                        PAYROLL_MODE,
                        "rule_tambah"
                    );


                    const state =
                        await Payroll.getRuleState(
                            {
                                mode :
                                    PAYROLL_MODE,

                                sectionId :
                                    "rule_tambah"
                            }
                        );


                    const locked =
                        state?.lockedTambah
                            instanceof Set
                                ?
                            state.lockedTambah
                                :
                            null;


                    let names =
                        locked;


                    if(
                        !(
                            names instanceof Set
                        )
                    ){

                        const rules =
                            await Payroll.getCurrentPeriodRules(
                                PAYROLL_MODE
                            );


                        names =
                            new Set();

                        rules.forEach(
                            rule => {

                                if(
                                    normalizeCompareValue(
                                        rule?.type_rule
                                    ) !==
                                    "rule_tambah"
                                ){
                                    return;
                                }

                                const nama =
                                    normalizeCompareValue(
                                        rule?.nama
                                    );

                                if(
                                    nama
                                ){
                                    names.add(
                                        nama
                                    );
                                }

                            }
                        );

                    }


                    const periodState =
                        await Payroll.getRuleState(
                            {
                                mode :
                                    PAYROLL_MODE,

                                sectionId :
                                    "rule_periode"
                            }
                        );


                    applyAvailableSelectOptions(
                        section,
                        "nama",
                        TAMBAH_OPTIONS,
                        names,
                        periodState?.newPeriodMode === true
                    );


                    return state;

                }

        },


        /* =================================================
           RULE ATTENDANCE
        ================================================= */

        {

            id :
                "monthly_rules",

            title :
                "⚙️ Rule Attendance",

            description :
                "Atur fitur attendance yang digunakan dalam Payroll Monthly.",

            addLabel :
                "＋ Simpan Rule",

            formAddLabel :
                "＋ Simpan Rule",

            deleteLabel :
                "Hapus",

            /*
             * Setting ini hanya digunakan sebagai
             * konfigurasi automatic attendance.
             *
             * Tidak menjadi result payroll rule.
             */

            persist :
                false,

            inputMode :
                "checkbox-group",


            fields : [

                {

                    name :
                        "aktifkanRuleLembur",

                    label :
                        "Aktifkan Rule Lembur",

                    type :
                        "checkbox",

                    value :
                        true,

                    note :
                        "Buat Rule Lembur otomatis untuk Payroll Monthly."
                },


                {

                    name :
                        "aktifkanRuleIzin",

                    label :
                        "Aktifkan Rule Izin",

                    type :
                        "checkbox",

                    value :
                        true,

                    note :
                        "Buat Rule Izin Pulang otomatis."
                },


                {

                    name :
                        "gunakanRuleTelat",

                    label :
                        "Gunakan Rule Telat",

                    type :
                        "checkbox",

                    value :
                        true,

                    note :
                        "Aktifkan perhitungan telat dan izin telat."
                },


                {

                    name :
                        "gunakanRuleShift",

                    label :
                        "Gunakan Rule Shift",

                    type :
                        "checkbox",

                    value :
                        true,

                    note :
                        "Aktifkan Rule Shift pada attendance."
                }

            ],


            /* =============================================
               RULE STATE
            ============================================= */

            getRuleState :
                async function(
                    {
                        section,
                        sectionElement
                    } = {}
                ){

                    /*
                     * Tidak menggunakan checkbox sebagai
                     * sumber state.
                     *
                     * Payroll / Rules Sheet menjadi source.
                     */

                    await refreshAttendanceState(
                        sectionElement,
                        section
                    );


                    return Payroll.getRuleState(
                        {
                            mode :
                                PAYROLL_MODE,

                            sectionId :
                                "monthly_rules"
                        }
                    );

                },


            /* =============================================
               NORMALIZE
            ============================================= */

            normalize :
                function(
                    data
                ){

                    return {

                        type :
                            "payroll_monthly",

                        aktifkanRuleLembur :
                            data.aktifkanRuleLembur ===
                            true,

                        aktifkanRuleIzin :
                            data.aktifkanRuleIzin ===
                            true,

                        gunakanRuleTelat :
                            data.gunakanRuleTelat ===
                            true,

                        gunakanRuleShift :
                            data.gunakanRuleShift ===
                            true

                    };

                }

        }

    ],


    /* =====================================================
       PREPARE SAVE
    ===================================================== */

    prepareSave :
        async function(
            payload = [],
            context = {}
        ){

            /*
             * context.data tetap digunakan untuk membaca
             * setting attendance karena monthly_rules
             * mempunyai persist:false.
             */

            const sourceData =
                Array.isArray(
                    context.data
                )
                    ?
                context.data
                    :
                payload;


            /*
             * Ambil konfigurasi attendance.
             */

            const settings =
                getMonthlyAttendanceSettings(
                    sourceData
                );


            /*
             * -------------------------------------------------
             * PENTING :
             *
             * Jangan menentukan periode baru hanya karena
             * payload mempunyai rule_periode.
             *
             * History bisa tetap mempunyai rule_periode.
             *
             * Source of truth adalah Payroll state.
             * -------------------------------------------------
             */

            const periodState =
                await Payroll.getRuleState(
                    {
                        mode :
                            PAYROLL_MODE,

                        sectionId :
                            "rule_periode"
                    }
                );


            const creatingNewPeriod =
                periodState?.newPeriodMode ===
                true
                ||
                periodState?.hasPeriod ===
                false
                ||
                periodState?.periodExists ===
                false;


            /*
             * Payload persistent dari controller.
             *
             * monthly_rules sudah difilter oleh controller
             * karena persist:false.
             *
             * Automatic attendance lama tetap dipertahankan
             * pada save normal.
             */

            const persistentPayload =
                Array.isArray(
                    payload
                )
                    ?
                payload
                    :
                [];


            /*
             * -------------------------------------------------
             * CASE 1
             *
             * Membuat periode baru.
             *
             * Automatic attendance lama tidak dibawa sebagai
             * rule periode baru.
             *
             * Payroll.prepareSave() akan:
             *
             * 1. menetapkan periode baru
             * 2. mewariskan active period
             * 3. membuat automatic attendance baru
             * 4. mempertahankan proses Payroll Engine
             * -------------------------------------------------
             */

            if(
                creatingNewPeriod
            ){

                const manualPayload =
                    getManualPayrollPayload(
                        sourceData
                    );


                const prepared =
                    await Payroll.prepareSave(
                        PAYROLL_MODE,
                        manualPayload,
                        {
                            settings :
                                settings
                        }
                    );


                return Array.isArray(
                    prepared
                )
                    ?
                prepared
                    :
                [];

            }


            /*
             * -------------------------------------------------
             * CASE 2
             *
             * Save normal pada periode aktif.
             *
             * Jangan menjalankan automatic generator.
             *
             * Jangan membuang automatic attendance yang
             * sudah tersimpan.
             *
             * Semua rule persistent tetap dipertahankan.
             * -------------------------------------------------
             */

            const output =
                [];


            for(
                const item of
                    persistentPayload
            ){

                const rule =
                    item?.data ??
                    item;


                if(
                    !rule
                ){
                    continue;
                }


                /*
                 * Rule periode aktif yang sudah ada
                 * tidak perlu dibuat ulang.
                 */

                if(
                    isPeriodRule(
                        item
                    )
                ){

                    output.push(
                        item
                    );

                    continue;
                }


                /*
                 * Setting monthly tidak seharusnya
                 * masuk ke payload persistent.
                 *
                 * Tetapi tetap dijaga sebagai proteksi.
                 */

                if(
                    rule.type ===
                    "payroll_monthly"
                ){
                    continue;
                }


                /*
                 * Semua rule lain diwariskan active period
                 * melalui Payroll.prepareRule().
                 *
                 * Automatic rule yang sudah ada juga
                 * dipertahankan.
                 */

                const prepared =
                    Payroll.prepareRule(
                        PAYROLL_MODE,
                        rule
                    );


                if(
                    item
                    &&
                    item.data
                ){

                    output.push(
                        {

                            ...item,

                            data :
                                prepared

                        }
                    );

                }
                else{

                    output.push(
                        prepared
                    );

                }

            }


            return output;

        }

};


/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default MonthlySetting;
