/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Monthly
   File         : monthly.js
   Version      : 4.7.0

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
===================================================== */

const ATTENDANCE_FEATURES = [

    {
        field :
            "aktifkanRuleLembur",

        label :
            "Rule Lembur",

        note :
            "Buat Rule Lembur otomatis untuk Payroll Monthly.",

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

        note :
            "Buat Rule Izin Pulang otomatis.",

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

        note :
            "Aktifkan perhitungan telat dan izin telat.",

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

        note :
            "Aktifkan Rule Shift pada attendance.",

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
   FORMAT NOMINAL
===================================================== */

function formatNominal(
    value
){

    const normalized =
        normalizeValue(
            value
        );

    if(
        normalized === ""
    ){
        return "-";
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
        return normalized;
    }

    return (
        "Rp " +
        new Intl.NumberFormat(
            "id-ID"
        ).format(
            number
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

            if(
                rule
                &&
                rule.type ===
                    "payroll_monthly"
            ){
                return false;
            }

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
   REMOVE GAJI SHEET RESULT
===================================================== */

function removeGajiSheetResult(
    sectionElement
){

    if(
        !sectionElement
    ){
        return;
    }

    sectionElement
        .querySelectorAll(
            ".payroll-gaji-sheet-result"
        )
        .forEach(
            element => {

                element.remove();

            }
        );

}


/* =====================================================
   HELPER :
   RENDER GAJI SHEET RESULT
===================================================== */

function renderGajiSheetResult(
    sectionElement,
    rule
){

    if(
        !sectionElement
    ){
        return;
    }

    removeGajiSheetResult(
        sectionElement
    );

    if(
        !rule
    ){
        return;
    }

    const result =
        sectionElement.querySelector(
            ".global-setting-result"
        );

    if(
        !result
    ){
        return;
    }

    const item =
        document.createElement(
            "div"
        );

    /*
     * PENTING :
     *
     * Jangan memakai class
     * global-setting-result-item
     * dan jangan memberi dataset.value.
     *
     * Ini hanya visual information dari
     * Rules Sheet, bukan result baru
     * yang dibuat user pada form.
     */

    item.className =
        "payroll-gaji-sheet-result";


    const title =
        document.createElement(
            "strong"
        );

    title.textContent =
        "✓ Gaji Pokok sudah dibuat";


    const nominal =
        document.createElement(
            "small"
        );

    nominal.textContent =
        "Nominal Gaji Pokok: " +
        formatNominal(
            rule.nominal
        );


    item.appendChild(
        title
    );

    item.appendChild(
        nominal
    );

    result.prepend(
        item
    );

}


/* =====================================================
   HELPER :
   APPLY RULE GAJI UI
===================================================== */

function applyRuleGajiUI(
    sectionElement,
    locked,
    rule
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

    const addButton =
        sectionElement.querySelector(
            ".global-setting-add"
        );

    if(
        locked
    ){

        /*
         * Karena hanya ada satu opsi
         * Gaji Pokok, tidak ada alasan
         * untuk menampilkan tombol tambah
         * lagi ketika rule sudah ada.
         */

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

            form.innerHTML =
                "";

        }


        /*
         * Jangan mengubah result menjadi
         * data persistent baru.
         *
         * Ini hanya tampilan informasi
         * berdasarkan Rules Sheet.
         */

        renderGajiSheetResult(
            sectionElement,
            rule
        );

    }
    else{

        if(
            addButton
        ){

            addButton.style.display =
                "";

        }


        removeGajiSheetResult(
            sectionElement
        );


        if(
            form
        ){

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

        }

    }

}


/* =====================================================
   HELPER :
   REFRESH RULE GAJI STATE
===================================================== */

async function refreshRuleGajiState(
    sectionElement
){

    if(
        !sectionElement
    ){
        return;
    }

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


    let rule =
        null;


    if(
        locked
    ){

        const rules =
            await Payroll.getCurrentPeriodRules(
                PAYROLL_MODE
            );


        rule =
            rules.find(
                item => {

                    return (
                        normalizeCompareValue(
                            item?.type_rule
                        ) ===
                            "rule_gaji"
                        &&
                        normalizeCompareValue(
                            item?.nama
                        ) ===
                            "gaji"
                    );

                }
            )
            ??
            null;

    }


    applyRuleGajiUI(
        sectionElement,
        locked,
        rule
    );

}


/* =====================================================
   HELPER :
   APPLY ATTENDANCE UI
===================================================== */

function applyAttendanceUI(
    sectionElement,
    featureStates,
    newPeriodMode
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


    let allCreated =
        true;


    ATTENDANCE_FEATURES.forEach(
        feature => {

            const wrapper =
                form.querySelector(
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
             * -------------------------------------------------
             * NEW PERIOD
             * -------------------------------------------------
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

                    /*
                     * Default config tetap
                     * aktif untuk periode baru.
                     */

                    input.checked =
                        true;

                }


                if(
                    label
                ){

                    label.textContent =
                        feature.label;

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
                        feature.note;

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


                wrapper.classList.remove(
                    "is-used"
                );


                return;

            }


            /*
             * -------------------------------------------------
             * ACTIVE PERIOD
             * -------------------------------------------------
             */

            const created =
                featureStates[
                    feature.field
                ] === true;


            if(
                !created
            ){

                allCreated =
                    false;

            }


            /*
             * RULE SUDAH DIBUAT
             */

            if(
                created
            ){

                if(
                    input
                ){

                    /*
                     * Checkbox benar-benar
                     * dihilangkan dari UI.
                     */

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


                wrapper.classList.add(
                    "is-used"
                );


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
             * RULE BELUM DIBUAT
             */

            else{

                if(
                    input
                ){

                    input.disabled =
                        false;

                    input.style.display =
                        "";

                    /*
                     * Default tetap aktif,
                     * sehingga user bisa memilih
                     * fitur untuk dibuat.
                     */

                    input.checked =
                        true;

                }


                if(
                    label
                ){

                    label.textContent =
                        feature.label;

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
                        feature.note;

                }


                wrapper.classList.remove(
                    "is-used"
                );


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


    /*
     * Jika semua automatic attendance
     * sudah ada, tombol Simpan Rule
     * tidak diperlukan lagi.
     *
     * Saat periode baru, tombol dibuka
     * kembali oleh blok di atas.
     */

    const action =
        form.querySelector(
            ".global-setting-form-add"
        );

    if(
        action
    ){

        action.style.display =
            allCreated
                ?
            "none"
                :
            "";

    }

}


/* =====================================================
   HELPER :
   REFRESH ATTENDANCE STATE
===================================================== */

async function refreshAttendanceState(
    sectionElement
){

    if(
        !sectionElement
    ){
        return;
    }


    /*
     * Payroll membaca Rules Sheet terlebih
     * dahulu sebelum UI menentukan status.
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


    const newPeriodMode =
        periodState?.newPeriodMode ===
        true;


    if(
        newPeriodMode
    ){

        applyAttendanceUI(
            sectionElement,
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


                    await refreshRuleGajiState(
                        sectionElement
                    );


                    return Payroll.getRuleState(
                        {
                            mode :
                                PAYROLL_MODE,

                            sectionId :
                                "rule_gaji"
                        }
                    );

                },


            /*
             * Form Rule Gaji dibuat ulang oleh
             * Global Setting ketika tombol dibuka.
             *
             * Refresh lagi setelah render supaya
             * state Sheet tetap berlaku.
             */

            onRender :
                async function(
                    form,
                    sectionElement
                ){

                    await refreshRuleGajiState(
                        sectionElement
                    );

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


            getRuleState :
                async function(
                    {
                        sectionElement
                    } = {}
                ){

                    await refreshAttendanceState(
                        sectionElement
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


            /*
             * INI PENTING.
             *
             * Global Setting merender ulang form
             * ketika tombol Rule Attendance dibuka.
             *
             * Karena itu state dari Sheet harus
             * diterapkan lagi setelah render.
             */

            onRender :
                async function(
                    form,
                    sectionElement
                ){

                    await refreshAttendanceState(
                        sectionElement
                    );

                },


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

            const sourceData =
                Array.isArray(
                    context.data
                )
                    ?
                context.data
                    :
                payload;


            const settings =
                getMonthlyAttendanceSettings(
                    sourceData
                );


            /*
             * Source of truth tetap Payroll Engine.
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
                periodState?.periodExists ===
                false;


            const persistentPayload =
                Array.isArray(
                    payload
                )
                    ?
                payload
                    :
                [];


            /* =============================================
               NEW PERIOD
            ============================================= */

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


            /* =============================================
               NORMAL SAVE
            ============================================= */

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


                if(
                    rule.type ===
                    "payroll_monthly"
                ){
                    continue;
                }


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
