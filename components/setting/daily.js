/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Daily
   File         : daily.js
   Version      : 2.2.0

   Description :
   Payroll Daily Setting Definition

   Modules :
   - Rule Gaji
   - Rule Work
   - Rule Tambah
   - Rule Potong

   Principle :
   User only fills fields that are necessary.
   Internal engine values are generated automatically.

   Payroll Daily :
   - Rule Gaji    : menentukan periode gaji
   - Rule Work    : menentukan penghasilan berdasarkan pekerjaan
   - Rule Tambah  : tambahan berdasarkan hari
   - Rule Potong  : potongan standar periode gaji

   Architecture :
   - DailyRules = source of truth untuk state/rule Daily
   - daily.js   = UI / setting definition / normalize input

   Daily schema :
   Rule Gaji :
       type_rule      = rule_gaji
       nama           = gaji
       periode_start
       periode_end
       years

   Rule Work / Tambah / Potong :
       periode_start
       periode_end
       years
===================================================== */


/* =====================================================
   IMPORT DAILY RULE ENGINE
===================================================== */

import {
    DailyRules
} from "./dailyrules.js";


/* =====================================================
   PAYROLL MODE
===================================================== */

const PAYROLL_MODE =
    "payroll-daily";


/* =====================================================
   MONTH OPTIONS
===================================================== */

const MONTH_OPTIONS = [

    {
        value :
            "01",

        label :
            "Januari"
    },

    {
        value :
            "02",

        label :
            "Februari"
    },

    {
        value :
            "03",

        label :
            "Maret"
    },

    {
        value :
            "04",

        label :
            "April"
    },

    {
        value :
            "05",

        label :
            "Mei"
    },

    {
        value :
            "06",

        label :
            "Juni"
    },

    {
        value :
            "07",

        label :
            "Juli"
    },

    {
        value :
            "08",

        label :
            "Agustus"
    },

    {
        value :
            "09",

        label :
            "September"
    },

    {
        value :
            "10",

        label :
            "Oktober"
    },

    {
        value :
            "11",

        label :
            "November"
    },

    {
        value :
            "12",

        label :
            "Desember"
    }

];


/* =====================================================
   YEAR OPTIONS
===================================================== */

function createYearOptions(){

    const currentYear =
        new Date().getFullYear();

    const startYear =
        currentYear - 2;

    const endYear =
        currentYear + 15;

    const options = [];

    for(
        let year =
            startYear;

        year <=
            endYear;

        year++
    ){

        options.push({

            value :
                String(year),

            label :
                String(year)

        });

    }

    return options;

}


const YEAR_OPTIONS =
    createYearOptions();


/* =====================================================
   MONTH + YEAR OPTIONS
===================================================== */

function createMonthYearOptions(){

    const options = [];

    YEAR_OPTIONS.forEach(

        year => {

            MONTH_OPTIONS.forEach(

                month => {

                    options.push({

                        value :
                            `${year.value}-${month.value}`,

                        label :
                            `${month.label} ${year.label}`

                    });

                }

            );

        }

    );

    return options;

}


const MONTH_YEAR_OPTIONS =
    createMonthYearOptions();


/* =====================================================
   CREATE ISO DATE
===================================================== */

function createISODate(

    year,

    month,

    day

){

    const yearNumber =
        Number(year);

    const monthNumber =
        Number(month);

    const dayNumber =
        Number(day);


    if(

        !Number.isInteger(
            yearNumber
        )

        ||

        !Number.isInteger(
            monthNumber
        )

        ||

        !Number.isInteger(
            dayNumber
        )

    ){

        return null;

    }


    if(

        monthNumber < 1

        ||

        monthNumber > 12

    ){

        return null;

    }


    if(

        dayNumber < 1

        ||

        dayNumber > 31

    ){

        return null;

    }


    const lastDay =

        new Date(

            yearNumber,

            monthNumber,

            0

        ).getDate();


    if(

        dayNumber >

        lastDay

    ){

        return null;

    }


    return (

        `${

            String(

                yearNumber

            ).padStart(

                4,

                "0"

            )

        }-` +

        `${

            String(

                monthNumber

            ).padStart(

                2,

                "0"

            )

        }-` +

        `${

            String(

                dayNumber

            ).padStart(

                2,

                "0"

            )

        }`

    );

}


/* =====================================================
   PARSE MONTH YEAR
===================================================== */

function parseMonthYear(

    value

){

    if(

        typeof value !==

        "string"

    ){

        return null;

    }


    const match =

        value.match(

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

        year :
            year,

        month :
            month

    };

}


/* =====================================================
   CREATE YEARS
===================================================== */

function createYears(

    startPeriod

){

    if(

        !startPeriod

        ||

        !Number.isInteger(

            Number(

                startPeriod.year

            )

        )

    ){

        return "";

    }


    return String(

        startPeriod.year

    );

}


/* =====================================================
   GET NEXT MONTH
===================================================== */

function getNextMonth(

    year,

    month

){

    let nextYear =
        Number(year);

    let nextMonth =
        Number(month) + 1;


    if(

        nextMonth > 12

    ){

        nextMonth = 1;

        nextYear++;

    }


    return {

        year :
            nextYear,

        month :
            nextMonth

    };

}


/* =====================================================
   VALIDATE DAY
===================================================== */

function getDayNumber(

    value

){

    if(

        value === undefined

        ||

        value === null

        ||

        value === ""

    ){

        return null;

    }


    const number =
        Number(value);


    if(

        !Number.isInteger(
            number
        )

    ){

        return null;

    }


    if(

        number < 1

        ||

        number > 31

    ){

        return null;

    }


    return number;

}


/* =====================================================
   DAILY RULE HELPERS
===================================================== */

/*
   Semua state periode Daily sekarang
   berasal dari DailyRules.

   Tidak ada lagi:

       DAILY_PERIOD_CONTEXT

   Tidak ada lagi:

       DAILY_NEW_PERIOD_MODE
*/


function getDailyActivePeriod(){

    return DailyRules.getActivePeriod();

}


/* =====================================================
   REQUIRE ACTIVE DAILY PERIOD
===================================================== */

function requireDailyActivePeriod(

    ruleName

){

    const periodContext =

        getDailyActivePeriod();


    if(

        !periodContext

        ||

        !periodContext.periode_start

        ||

        !periodContext.periode_end

    ){

        alert(

            `Tambahkan Periode Gaji terlebih dahulu sebelum menambahkan ${

                ruleName

            }.`

        );


        return null;

    }


    return periodContext;

}


/* =====================================================
   FORMAT DAILY DATE
===================================================== */

function formatDailyDate(

    value

){

    if(

        !value

    ){

        return "-";

    }


    const normalized =
        String(value);


    const date =
        new Date(

            normalized.length === 10

                ?

            `${normalized}T00:00:00`

                :

            normalized

        );


    if(

        Number.isNaN(
            date.getTime()
        )

    ){

        return normalized;

    }


    return date.toLocaleDateString(

        "id-ID",

        {

            day :
                "numeric",

            month :
                "long",

            year :
                "numeric"

        }

    );

}


/* =====================================================
   REMOVE DAILY PERIOD NOTE
===================================================== */

function removeDailyPeriodNote(

    sectionElement

){

    if(

        !sectionElement

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


    result
        .querySelectorAll(
            ".payroll-daily-period-note"
        )
        .forEach(

            element => {

                element.remove();

            }

        );

}


/* =====================================================
   RENDER DAILY PERIOD NOTE
===================================================== */

function renderDailyPeriodNote(

    sectionElement,

    rule

){

    if(

        !sectionElement

    ){

        return;

    }


    removeDailyPeriodNote(

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


    const note =

        document.createElement(
            "div"
        );


    note.className =
        "payroll-daily-period-note";


    const title =

        document.createElement(
            "strong"
        );


    title.textContent =
        "✓ Periode Gaji sudah dibuat";


    note.appendChild(
        title
    );


    const calculationRow =

        document.createElement(
            "div"
        );


    calculationRow.className =
        "payroll-period-note-row";


    const calculationLabel =

        document.createElement(
            "span"
        );


    calculationLabel.textContent =
        "Periode perhitungan";


    const calculationValue =

        document.createElement(
            "strong"
        );


    calculationValue.textContent =

        `${

            formatDailyDate(
                rule.nilai_start
                ||
                rule.periode_start
            )

        } – ${

            formatDailyDate(
                rule.nilai_end
                ||
                rule.periode_end
            )

        }`;


    calculationRow.appendChild(
        calculationLabel
    );


    calculationRow.appendChild(
        calculationValue
    );


    const activeRow =

        document.createElement(
            "div"
        );


    activeRow.className =
        "payroll-period-note-row";


    const activeLabel =

        document.createElement(
            "span"
        );


    activeLabel.textContent =
        "Masa aktif";


    const activeValue =

        document.createElement(
            "strong"
        );


    activeValue.textContent =

        `${

            formatDailyDate(
                rule.periode_start
            )

        } – ${

            formatDailyDate(
                rule.periode_end
            )

        }`;


    activeRow.appendChild(
        activeLabel
    );


    activeRow.appendChild(
        activeValue
    );


    note.appendChild(
        calculationRow
    );


    note.appendChild(
        activeRow
    );


    result.prepend(
        note
    );

}


/* =====================================================
   UNLOCK DAILY PERIOD FORM
===================================================== */

function unlockDailyPeriodForm(

    sectionElement

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


    form
        .querySelectorAll(
            "input, select, textarea, button"
        )
        .forEach(

            element => {

                if(

                    element.classList.contains(
                        "global-setting-result-delete"
                    )

                ){

                    return;

                }


                if(

                    element.classList.contains(
                        "global-setting-confirm"
                    )

                ){

                    return;

                }


                element.disabled =
                    false;

            }

        );

}


/* =====================================================
   LOCK DAILY PERIOD FORM
===================================================== */

function lockDailyPeriodForm(

    sectionElement

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


    form
        .querySelectorAll(
            "input, select, textarea"
        )
        .forEach(

            element => {

                element.disabled =
                    true;

            }

        );


    form
        .querySelectorAll(
            "button"
        )
        .forEach(

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


/* =====================================================
   APPLY DAILY PERIOD UI
===================================================== */

function applyDailyPeriodUI(

    sectionElement,

    periodRule

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


    const newPeriodMode =

        DailyRules.isNewPeriodMode();


    /*
       BELUM ADA PERIODE
    */

    if(

        !periodRule

    ){

        removeDailyPeriodNote(

            sectionElement

        );


        if(

            addButton

        ){

            addButton.style.display =
                "";

            addButton.textContent =
                "＋ Tambah Periode";

        }


        if(

            form

        ){

            form.classList.remove(
                "hidden"
            );

        }


        return;

    }


    /*
       PERIODE BARU
    */

    if(

        newPeriodMode

    ){

        removeDailyPeriodNote(

            sectionElement

        );


        if(

            addButton

        ){

            addButton.style.display =
                "";

            addButton.textContent =
                "＋ Tambah Periode";

        }


        if(

            form

        ){

            form.classList.remove(
                "hidden"
            );

        }


        unlockDailyPeriodForm(

            sectionElement

        );


        return;

    }


    /*
       PERIODE SUDAH ADA
    */

    if(

        form

    ){

        form.classList.add(
            "hidden"
        );

    }


    if(

        addButton

    ){

        addButton.style.display =
            "";

        addButton.textContent =
            "＋ Tambah Periode";

    }


    renderDailyPeriodNote(

        sectionElement,

        periodRule

    );


    lockDailyPeriodForm(

        sectionElement

    );

}


/* =====================================================
   BIND DAILY NEW PERIOD BUTTON
===================================================== */

function bindDailyNewPeriodButton(

    sectionElement

){

    if(

        !sectionElement

    ){

        return;

    }


    const addButton =

        sectionElement.querySelector(

            ".global-setting-add"

        );


    if(

        !addButton

    ){

        return;

    }


    if(

        addButton.dataset.dailyPeriodBound ===
        "true"

    ){

        return;

    }


    addButton.dataset.dailyPeriodBound =
        "true";


    /*
       Capture phase dipakai supaya
       mode periode baru aktif sebelum
       controller generic membuka form.
    */

    addButton.addEventListener(

        "click",

        () => {

            const form =

                sectionElement.querySelector(

                    ".global-setting-form"

                );


            /*
               Jika form sedang terbuka,
               klik dianggap menutup form,
               bukan membuat periode baru.
            */

            if(

                form

                &&

                !form.classList.contains(
                    "hidden"
                )

            ){

                return;

            }


            DailyRules.enterNewPeriodMode();


            removeDailyPeriodNote(

                sectionElement

            );


            if(

                form

            ){

                form.classList.remove(
                    "hidden"
                );

            }


            unlockDailyPeriodForm(

                sectionElement

            );

        },

        true

    );

}


/* =====================================================
   APPLY DAILY DEPENDENT SECTION STATE
===================================================== */

async function applyDailyDependentSectionState(

    sectionElement,

    sectionId

){

    if(

        !sectionElement

    ){

        return;

    }


    await DailyRules.ensureLoaded();


    /*
       Saat mode periode baru aktif,
       semua option Tambah dan Potong
       kembali tersedia.
    */

    if(

        DailyRules.isNewPeriodMode()

    ){

        const select =

            sectionElement.querySelector(

                "select[name=nama]"

            );


        if(

            select

        ){

            DailyRules.applySelectLockState(

                select,

                []

            );

        }


        return;

    }


    const state =

        DailyRules.getLockSummary();


    /* =================================================
       RULE TAMBAH
    ================================================= */

    if(

        sectionId ===
        "rule_tambah"

    ){

        const select =

            sectionElement.querySelector(

                "select[name=nama]"

            );


        if(

            select

        ){

            DailyRules.applySelectLockState(

                select,

                state.tambahLocked || []

            );

        }


        return;

    }


    /* =================================================
       RULE POTONG
    ================================================= */

    if(

        sectionId ===
        "rule_potong"

    ){

        const select =

            sectionElement.querySelector(

                "select[name=nama]"

            );


        if(

            select

        ){

            DailyRules.applySelectLockState(

                select,

                state.potongLocked || []

            );

        }


        return;

    }

}


/* =====================================================
   REFRESH DAILY DEPENDENT SECTION
===================================================== */

async function refreshDailyDependentSection(

    sectionElement,

    sectionId

){

    if(

        !sectionElement

    ){

        return;

    }


    await DailyRules.ensureLoaded();


    await applyDailyDependentSectionState(

        sectionElement,

        sectionId

    );

}
        

/* =====================================================
   DAILY SETTING
===================================================== */

export const DailySetting = {


    /* =================================================
       HEADER
    ================================================= */

    title :

        "Pengaturan Payroll Daily",


    subtitle :

        "Atur periode, pekerjaan, penambahan, dan potongan payroll daily",


    /* =================================================
       SECTIONS
    ================================================= */

    sections : [


        /* =================================================
           RULE GAJI
        ================================================= */

        {

            id :

                "rule_gaji",


            title :

                "📅 Periode Gaji",


            description :

                "Tentukan periode perhitungan dan masa aktif payroll daily.",


            /* =============================================
               BUTTON
            ============================================= */

            addLabel :

                "＋ Tambah Periode",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            /* =============================================
               DUPLICATE
            ============================================= */

            uniqueFields : [

                "nilai_start",

                "nilai_end",

                "periode_start",

                "periode_end"

            ],


            /* =============================================
               AUTO CLOSE
            ============================================= */

            autoCloseForm :

                true,


            /* =============================================
               FIELDS
            ============================================= */

            fields : [


                /* =========================================
                   TANGGAL MULAI PERIODE
                ========================================= */

                {

                    name :

                        "nilai_start_day",


                    label :

                        "Tanggal Mulai Periode",


                    type :

                        "number",


                    placeholder :

                        "Contoh: 28",


                    required :

                        true,


                    min :

                        1,


                    max :

                        31,


                    step :

                        1,


                    note :

                        "Isi angka tanggal dimulainya periode gaji. Contoh: 28."

                },


                /* =========================================
                   TANGGAL AKHIR PERIODE
                ========================================= */

                {

                    name :

                        "nilai_end_day",


                    label :

                        "Tanggal Akhir Periode",


                    type :

                        "number",


                    placeholder :

                        "Contoh: 27",


                    required :

                        true,


                    min :

                        1,


                    max :

                        31,


                    step :

                        1,


                    note :

                        "Isi angka tanggal berakhirnya periode gaji. Contoh: 27."

                },


                /* =========================================
                   BULAN + TAHUN AWAL
                ========================================= */

                {

                    name :

                        "periode_start_month",


                    label :

                        "Periode Aktif Dimulai",


                    type :

                        "select",


                    placeholder :

                        "Pilih bulan dan tahun",


                    required :

                        true,


                    note :

                        "Pilih bulan dan tahun awal berlakunya payroll daily.",


                    options :

                        MONTH_YEAR_OPTIONS

                },


                /* =========================================
                   BULAN + TAHUN AKHIR
                ========================================= */

                {

                    name :

                        "periode_end_month",


                    label :

                        "Periode Aktif Diakhiri",


                    type :

                        "select",


                    placeholder :

                        "Pilih bulan dan tahun",


                    required :

                        true,


                    note :

                        "Pilih bulan dan tahun akhir berlakunya payroll daily.",


                    options :

                        MONTH_YEAR_OPTIONS

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

                        startDay === null

                    ){

                        alert(

                            "Tanggal mulai periode harus berupa angka 1 sampai 31."

                        );


                        return null;

                    }


                    if(

                        endDay === null

                    ){

                        alert(

                            "Tanggal akhir periode harus berupa angka 1 sampai 31."

                        );


                        return null;

                    }


                    const startPeriod =

                        parseMonthYear(

                            data.periode_start_month

                        );


                    if(

                        !startPeriod

                    ){

                        alert(

                            "Bulan dan tahun awal periode wajib dipilih."

                        );


                        return null;

                    }


                    const endPeriod =

                        parseMonthYear(

                            data.periode_end_month

                        );


                    if(

                        !endPeriod

                    ){

                        alert(

                            "Bulan dan tahun akhir periode wajib dipilih."

                        );


                        return null;

                    }


                    const nilaiStart =

                        createISODate(

                            startPeriod.year,

                            startPeriod.month,

                            startDay

                        );


                    if(

                        !nilaiStart

                    ){

                        alert(

                            "Tanggal mulai periode tidak valid untuk bulan dan tahun yang dipilih."

                        );


                        return null;

                    }


                    const nextPeriod =

                        getNextMonth(

                            startPeriod.year,

                            startPeriod.month

                        );


                    const nilaiEnd =

                        createISODate(

                            nextPeriod.year,

                            nextPeriod.month,

                            endDay

                        );


                    if(

                        !nilaiEnd

                    ){

                        alert(

                            "Tanggal akhir periode tidak valid untuk bulan berikutnya."

                        );


                        return null;

                    }


                    const periodeStart =

                        createISODate(

                            startPeriod.year,

                            startPeriod.month,

                            startDay

                        );


                    if(

                        !periodeStart

                    ){

                        alert(

                            "Tanggal awal masa aktif tidak valid."

                        );


                        return null;

                    }


                    const periodeEnd =

                        createISODate(

                            endPeriod.year,

                            endPeriod.month,

                            endDay

                        );


                    if(

                        !periodeEnd

                    ){

                        alert(

                            "Tanggal akhir masa aktif tidak valid."

                        );


                        return null;

                    }


                    if(

                        new Date(
                            periodeStart
                        )

                        >

                        new Date(
                            periodeEnd
                        )

                    ){

                        alert(

                            "Periode aktif berakhir sebelum periode aktif dimulai."

                        );


                        return null;

                    }


                    const years =

                        createYears(

                            startPeriod

                        );


                    const normalizedRule = {

                        type_rule :

                            "rule_gaji",


                        nama :

                            "gaji",


                        grade_1 :

                            "",


                        grade_2 :

                            "",


                        kondisi :

                            "periode",


                        nominal :

                            "",


                        waktu :

                            "bulanan",


                        nilai_start :

                            nilaiStart,


                        nilai_end :

                            nilaiEnd,


                        periode_start :

                            periodeStart,


                        periode_end :

                            periodeEnd,


                        years :

                            years

                    };


                    /*
                       Rule Gaji adalah pembentuk
                       namespace periode baru.

                       DailyRules menyimpan state
                       sementara agar rule lain yang
                       dinormalisasi setelahnya dapat
                       langsung mewarisi periode baru.
                    */

                    if(

                        DailyRules.isNewPeriodMode()

                    ){

                        DailyRules.markPeriodSaved(

                            normalizedRule

                        );

                    }


                    return normalizedRule;

                },


            /* =============================================
               RULE STATE
            ============================================= */

            getRuleState :

                async function({

                    sectionElement

                } = {}){

                    await DailyRules.ensureLoaded();


                    const state =

                        await DailyRules.getRuleState({

                            sectionId :
                                "rule_gaji"

                        });


                    bindDailyNewPeriodButton(

                        sectionElement

                    );


                    applyDailyPeriodUI(

                        sectionElement,

                        state.activePeriod

                    );


                    return {

                        gaji :
                            Boolean(
                                state.created
                            ),

                        created :
                            Boolean(
                                state.created
                            ),

                        periodExists :
                            Boolean(
                                state.periodExists
                            ),

                        lockPeriod :
                            Boolean(
                                state.lockPeriod
                            ),

                        newPeriodMode :
                            Boolean(
                                state.newPeriodMode
                            ),

                        activePeriod :
                            state.activePeriod

                    };

                },


            /* =============================================
               FORM RENDER
            ============================================= */

            onRender :

                async function(

                    form,

                    sectionElement

                ){

                    await DailyRules.ensureLoaded();


                    const newPeriodMode =

                        DailyRules.isNewPeriodMode();


                    if(

                        newPeriodMode

                    ){

                        unlockDailyPeriodForm(

                            sectionElement

                        );


                        removeDailyPeriodNote(

                            sectionElement

                        );


                        return;

                    }


                    const periodRule =

                        DailyRules.getActivePeriod();


                    if(

                        periodRule

                    ){

                        applyDailyPeriodUI(

                            sectionElement,

                            periodRule

                        );

                    }

                }

        },


        /* =================================================
           RULE WORK
        ================================================= */

        {

            id :

                "rule_work",


            title :

                "🔧 Rule Work",


            description :

                "Tentukan nominal penghasilan berdasarkan nama pekerjaan dan variasinya.",


            addLabel :

                "＋ Tambah Rule Work",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            uniqueFields : [

                "nama",

                "grade_1",

                "grade_2"

            ],


            autoCloseForm :

                true,


            fields : [


                {

                    name :

                        "nama",


                    label :

                        "Nama Pekerjaan",


                    type :

                        "text",


                    placeholder :

                        "Contoh: Baju",


                    required :

                        true,


                    note :

                        "Nama pekerjaan wajib diisi. Contoh: rear, front, headrest."

                },


                {

                    name :

                        "grade_1",


                    label :

                        "Grade 1",


                    type :

                        "text",


                    placeholder :

                        "Contoh: atasan",


                    required :

                        false,


                    note :

                        "Opsional. Isi jika pekerjaan memiliki variasi pertama."

                },


                {

                    name :

                        "grade_2",


                    label :

                        "Grade 2",


                    type :

                        "text",


                    placeholder :

                        "Contoh: XL",


                    required :

                        false,


                    note :

                        "Opsional. Isi jika masih terdapat variasi pekerjaan berikutnya."

                },


                {

                    name :

                        "nominal",


                    label :

                        "Nominal per PCS",


                    type :

                        "number",


                    placeholder :

                        "Contoh: 405",


                    required :

                        true,


                    min :

                        0,


                    step :

                        1,


                    note :

                        "Masukkan nominal yang dibayarkan untuk setiap PCS."

                }

            ],


            normalize :

                function(

                    data

                ){

                    const periodContext =

                        requireDailyActivePeriod(

                            "Rule Work"

                        );


                    if(

                        !periodContext

                    ){

                        return null;

                    }


                    const normalizedRule = {

                        type_rule :

                            "rule_work",


                        nama :

                            data.nama,


                        grade_1 :

                            data.grade_1 ?? "",


                        grade_2 :

                            data.grade_2 ?? "",


                        kondisi :

                            "pcs",


                        nominal :

                            data.nominal ?? "",


                        waktu :

                            "harian",


                        nilai_start :

                            "",


                        nilai_end :

                            "",


                        periode_start :

                            periodContext.periode_start,


                        periode_end :

                            periodContext.periode_end,


                        years :

                            periodContext.years ?? ""

                    };


                    /*
                       DailyRules tetap menjadi
                       sumber state dan duplicate check.
                    */

                    return DailyRules.prepareRule(

                        normalizedRule

                    );

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

                "Atur tambahan penghasilan yang diberikan pada hari tertentu.",


            addLabel :

                "＋ Tambah Rule Tambah",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            uniqueFields : [

                "nama",

                "waktu"

            ],


            autoCloseForm :

                true,


            fields : [


                {

                    name :

                        "nama",


                    label :

                        "Nama Tambahan",


                    type :

                        "select",


                    placeholder :

                        "Pilih tambahan",


                    required :

                        true,


                    options : [


                        {

                            value :

                                "uang_makan",


                            label :

                                "Uang Makan",


                            note :

                                "Tambahan uang makan berdasarkan hari yang dipilih."

                        },


                        {

                            value :

                                "uang_transport",


                            label :

                                "Uang Transport",


                            note :

                                "Tambahan uang transport berdasarkan hari yang dipilih."

                        }

                    ]

                },


                {

                    name :

                        "hari_sabtu",


                    label :

                        "Sabtu",


                    type :

                        "checkbox",


                    required :

                        false,


                    resultValue :

                        "sabtu"

                },


                {

                    name :

                        "hari_minggu",


                    label :

                        "Minggu",


                    type :

                        "checkbox",


                    required :

                        false,


                    resultValue :

                        "minggu"

                },


                {

                    name :

                        "hari_senin",


                    label :

                        "Senin",


                    type :

                        "checkbox",


                    required :

                        false,


                    resultValue :

                        "senin"

                },


                {

                    name :

                        "hari_selasa",


                    label :

                        "Selasa",


                    type :

                        "checkbox",


                    required :

                        false,


                    resultValue :

                        "selasa"

                },


                {

                    name :

                        "hari_rabu",


                    label :

                        "Rabu",


                    type :

                        "checkbox",


                    required :

                        false,


                    resultValue :

                        "rabu"

                },


                {

                    name :

                        "hari_kamis",


                    label :

                        "Kamis",


                    type :

                        "checkbox",


                    required :

                        false,


                    resultValue :

                        "kamis"

                },


                {

                    name :

                        "hari_jumat",


                    label :

                        "Jumat",


                    type :

                        "checkbox",


                    required :

                        false,


                    resultValue :

                        "jumat"

                },


                {

                    name :

                        "nominal",


                    label :

                        "Nominal Tambahan",


                    type :

                        "number",


                    placeholder :

                        "Contoh: 10000",


                    required :

                        true,


                    min :

                        0,


                    step :

                        1,


                    note :

                        "Masukkan nominal tambahan yang diberikan pada hari yang dipilih."

                }

            ],


            normalize :

                function(

                    data

                ){

                    const days = [];


                    if(

                        data.hari_senin

                    ){

                        days.push(
                            "senin"
                        );

                    }


                    if(

                        data.hari_selasa

                    ){

                        days.push(
                            "selasa"
                        );

                    }


                    if(

                        data.hari_rabu

                    ){

                        days.push(
                            "rabu"
                        );

                    }


                    if(

                        data.hari_kamis

                    ){

                        days.push(
                            "kamis"
                        );

                    }


                    if(

                        data.hari_jumat

                    ){

                        days.push(
                            "jumat"
                        );

                    }


                    if(

                        data.hari_sabtu

                    ){

                        days.push(
                            "sabtu"
                        );

                    }


                    if(

                        data.hari_minggu

                    ){

                        days.push(
                            "minggu"
                        );

                    }


                    if(

                        days.length === 0

                    ){

                        alert(

                            "Pilih minimal satu hari untuk rule tambah."

                        );


                        return null;

                    }


                    const periodContext =

                        requireDailyActivePeriod(

                            "Rule Tambah"

                        );


                    if(

                        !periodContext

                    ){

                        return null;

                    }


                    const normalizedRule = {

                        type_rule :

                            "rule_tambah",


                        nama :

                            data.nama,


                        grade_1 :

                            "",


                        grade_2 :

                            "",


                        kondisi :

                            "masuk",


                        nominal :

                            data.nominal ?? "",


                        waktu :

                            days.join(","),


                        nilai_start :

                            "",


                        nilai_end :

                            "",


                        periode_start :

                            periodContext.periode_start,


                        periode_end :

                            periodContext.periode_end,


                        years :

                            periodContext.years ?? ""

                    };


                    return DailyRules.prepareRule(

                        normalizedRule

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

                "Atur potongan standar yang mengikuti periode gaji.",


            addLabel :

                "＋ Tambah Rule Potong",


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

                        "Nama Rule Potong",


                    type :

                        "select",


                    placeholder :

                        "Pilih rule potong",


                    required :

                        true,


                    options : [


                        {

                            value :

                                "bpjs",


                            label :

                                "BPJS",


                            note :

                                "Potongan BPJS tetap untuk setiap periode gaji."

                        },


                        {

                            value :

                                "jamsostek",


                            label :

                                "Jamsostek",


                            note :

                                "Potongan Jamsostek untuk setiap periode gaji."

                        },


                        {

                            value :

                                "tabungan",


                            label :

                                "Tabungan",


                            note :

                                "Potongan tabungan untuk setiap periode gaji."

                        },


                        {

                            value :

                                "koperasi",


                            label :

                                "Koperasi",


                            note :

                                "Potongan koperasi untuk setiap periode gaji."

                        },


                        {

                            value :

                                "lain-lain",


                            label :

                                "Lain-lain",


                            note :

                                "Potongan lain yang mengikuti periode gaji."

                        }

                    ]

                },


                {

                    name :

                        "nominal",


                    label :

                        "Nominal Potongan",


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

                        "Masukkan nominal potongan sesuai rule yang dipilih."

                }

            ],


            normalize :

                function(

                    data

                ){

                    const periodContext =

                        requireDailyActivePeriod(

                            "Rule Potong"

                        );


                    if(

                        !periodContext

                    ){

                        return null;

                    }


                    const normalizedRule = {

                        type_rule :

                            "rule_potong",


                        nama :

                            data.nama,


                        grade_1 :

                            "",


                        grade_2 :

                            "",


                        kondisi :

                            "periode_gaji",


                        nominal :

                            data.nominal ?? "",


                        waktu :

                            "bulanan",


                        nilai_start :

                            "",


                        nilai_end :

                            "",


                        periode_start :

                            periodContext.periode_start,


                        periode_end :

                            periodContext.periode_end,


                        years :

                            periodContext.years ?? ""

                    };


                    return DailyRules.prepareRule(

                        normalizedRule

                    );

                }

        }

    ]

};


/* =====================================================
   OPTIONAL ENGINE HELPERS
===================================================== */

/*
   Helper ini tidak dipakai oleh generic controller
   secara langsung, tetapi tersedia melalui config
   jika nanti Daily UI membutuhkan refresh state
   setelah save.
*/

DailySetting.refreshRules =

    async function(){

        return DailyRules.reload();

    };


DailySetting.getActivePeriod =

    function(){

        return DailyRules.getActivePeriod();

    };


DailySetting.isNewPeriodMode =

    function(){

        return DailyRules.isNewPeriodMode();

    };


DailySetting.enterNewPeriodMode =

    function(){

        return DailyRules.enterNewPeriodMode();

    };


DailySetting.exitNewPeriodMode =

    function(){

        return DailyRules.exitNewPeriodMode();

    };


/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default DailySetting;
