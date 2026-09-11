/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Daily
   File         : daily.js
   Version      : 3.0.0

   Description :
   Payroll Daily Setting Definition

   IMPORTANT :

   Daily tetap menggunakan struktur lama :

       rule_gaji
       nama = "gaji"

       periode_start
       periode_end
       years

   Tidak menggunakan :

       rule_periode

   Konsep Monthly yang diterapkan hanya :

   - Rule Gaji menjadi sumber periode aktif
   - Rule Gaji dikunci jika sudah ada
   - Menampilkan period result / note
   - Tambah Periode Baru membuka kembali Rule Gaji
   - Rule lama tetap menjadi history
   - Rule Work/Tambah/Potong mewarisi masa aktif
   - Rule Tambah/Potong menyembunyikan option
     yang sudah digunakan pada periode aktif
   - Rule Work tetap terbuka
   - Duplicate Work berdasarkan keseluruhan row

   process.js :
   TIDAK PERLU DIUBAH
===================================================== */


/* =====================================================
   PAYROLL
===================================================== */

import {
    Payroll
} from "./payroll.js";


/* =====================================================
   PAYROLL MODE
===================================================== */

const PAYROLL_MODE =
    "payroll-daily";


/* =====================================================
   DAILY STATE
===================================================== */

/*
   State ini khusus Daily.

   Tidak memakai state Rule Periode
   milik Monthly.
*/

let DAILY_PERIOD_CONTEXT =
    null;


let DAILY_NEW_PERIOD_MODE =
    false;


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
   DATE VALUE
===================================================== */

function dateValue(

    value

){

    const normalized =
        String(
            value ?? ""
        ).trim();


    if(

        !normalized

    ){

        return 0;

    }


    const time =
        Date.parse(
            normalized
        );


    return Number.isNaN(
        time
    )
        ?
        0
        :
        time;

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(

    value

){

    if(

        !value

    ){

        return "";

    }


    const date =
        new Date(
            value
        );


    if(

        Number.isNaN(
            date.getTime()
        )

    ){

        return String(
            value
        );

    }


    return new Intl.DateTimeFormat(

        "id-ID",

        {

            day :
                "numeric",

            month :
                "long",

            year :
                "numeric"

        }

    ).format(
        date
    );

}


/* =====================================================
   GET DAILY RULES
===================================================== */

/*
   Sheet tetap menjadi source of truth.

   Payroll engine digunakan hanya untuk
   membaca rules Daily yang sudah tersedia.

   Tidak menggunakan rule_periode.
*/

async function getDailyRules(){

    await Payroll.ensureLoaded(
        PAYROLL_MODE
    );


    const rules =
        Payroll.getRules(
            PAYROLL_MODE
        );


    if(

        !Array.isArray(
            rules
        )

    ){

        return [];

    }


    return rules;

}


/* =====================================================
   GET RULE GAJI FROM SHEET
===================================================== */

async function getDailyPeriodRules(){

    const rules =
        await getDailyRules();


    return rules.filter(

        rule =>

            normalizeValue(
                rule?.type_rule
            ) ===
            "rule_gaji"

            &&

            normalizeValue(
                rule?.nama
            ) ===
            "gaji"

            &&

            rule?.periode_start

            &&

            rule?.periode_end

    );

}


/* =====================================================
   GET LATEST DAILY PERIOD
===================================================== */

async function getLatestDailyPeriod(){

    const periods =
        await getDailyPeriodRules();


    if(

        periods.length === 0

    ){

        return null;

    }


    let latest =
        null;


    periods.forEach(

        rule => {

            if(

                !latest

            ){

                latest =
                    rule;

                return;

            }


            const currentTime =
                dateValue(
                    rule.periode_start
                );


            const latestTime =
                dateValue(
                    latest.periode_start
                );


            if(

                currentTime >
                latestTime

            ){

                latest =
                    rule;

                return;

            }


            if(

                currentTime ===
                latestTime

            ){

                latest =
                    rule;

            }

        }

    );


    return latest;

}


/* =====================================================
   SET DAILY PERIOD CONTEXT
===================================================== */

function setDailyPeriodContext(

    rule

){

    if(

        !rule

    ){

        return;

    }


    if(

        normalizeValue(
            rule.type_rule
        ) !==
        "rule_gaji"

    ){

        return;

    }


    if(

        !rule.periode_start

        ||

        !rule.periode_end

    ){

        return;

    }


    DAILY_PERIOD_CONTEXT = {

        periode_start :
            rule.periode_start,

        periode_end :
            rule.periode_end,

        years :
            rule.years ?? ""

    };

}


/* =====================================================
   GET PERIOD FROM DOM RESULT
===================================================== */

function getLatestDailyPeriodFromDOM(){

    const sectionElement =
        document.querySelector(

            '.global-setting-section[data-section="rule_gaji"]'

        );


    if(

        !sectionElement

    ){

        return null;

    }


    const result =
        sectionElement.querySelector(

            ".global-setting-result"

        );


    if(

        !result

    ){

        return null;

    }


    const items = [

        ...result.children

    ];


    let latest =
        null;


    items.forEach(

        item => {

            if(

                !item.dataset.value

            ){

                return;

            }


            try{

                const data =
                    JSON.parse(
                        item.dataset.value
                    );


                if(

                    normalizeValue(
                        data?.type_rule
                    ) !==
                    "rule_gaji"

                ){

                    return;

                }


                if(

                    normalizeValue(
                        data?.nama
                    ) !==
                    "gaji"

                ){

                    return;

                }


                if(

                    !data.periode_start

                    ||

                    !data.periode_end

                ){

                    return;

                }


                if(

                    !latest

                ){

                    latest =
                        data;

                    return;

                }


                const currentTime =
                    dateValue(
                        data.periode_start
                    );


                const latestTime =
                    dateValue(
                        latest.periode_start
                    );


                if(

                    currentTime >=
                    latestTime

                ){

                    latest =
                        data;

                }

            }

            catch(error){

                console.warn(

                    "DAILY PERIOD DOM PARSE ERROR:",

                    error

                );

            }

        }

    );


    return latest;

}


/* =====================================================
   GET ACTIVE DAILY PERIOD
===================================================== */

function getDailyActivePeriodContext(){

    /*
       Jika sedang membuat periode baru
       dan periode baru sudah masuk result,
       gunakan result tersebut.
    */

    const domPeriod =
        getLatestDailyPeriodFromDOM();


    if(

        domPeriod

    ){

        return {

            periode_start :
                domPeriod.periode_start,

            periode_end :
                domPeriod.periode_end,

            years :
                domPeriod.years ?? ""

        };

    }


    return DAILY_PERIOD_CONTEXT;

}


/* =====================================================
   REQUIRE ACTIVE PERIOD
===================================================== */

function requireDailyActivePeriod(

    ruleName

){

    /*
       Saat user sedang membuat periode baru,
       rule lain belum boleh mengambil
       periode lama.

       Tunggu sampai Rule Gaji baru
       benar-benar ditambahkan.
    */

    if(

        DAILY_NEW_PERIOD_MODE

        &&

        !getLatestDailyPeriodFromDOM()

    ){

        alert(

            `Tambahkan Periode Gaji baru terlebih dahulu sebelum menambahkan ${

                ruleName

            }.`

        );


        return null;

    }


    const periodContext =
        getDailyActivePeriodContext();


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
   GET CURRENT PERIOD RULES
===================================================== */

async function getDailyCurrentPeriodRules(){

    const period =
        getDailyActivePeriodContext();


    if(

        !period

    ){

        return [];

    }


    const rules =
        await getDailyRules();


    return rules.filter(

        rule =>

            normalizeValue(
                rule?.periode_start
            ) ===
            normalizeValue(
                period.periode_start
            )

            &&

            normalizeValue(
                rule?.periode_end
            ) ===
            normalizeValue(
                period.periode_end
            )

    );

}


/* =====================================================
   GET CURRENT PERIOD RULES FROM DOM
===================================================== */

function getDailyCurrentPeriodRulesFromDOM(){

    const period =
        getDailyActivePeriodContext();


    if(

        !period

    ){

        return [];

    }


    const output = [];


    document
        .querySelectorAll(
            '.global-setting-section .global-setting-result > *'
        )
        .forEach(

            item => {

                if(

                    !item.dataset.value

                ){

                    return;

                }


                try{

                    const rule =
                        JSON.parse(
                            item.dataset.value
                        );


                    if(

                        !rule

                    ){

                        return;

                    }


                    if(

                        normalizeValue(
                            rule.periode_start
                        ) ===
                        normalizeValue(
                            period.periode_start
                        )

                        &&

                        normalizeValue(
                            rule.periode_end
                        ) ===
                        normalizeValue(
                            period.periode_end
                        )

                    ){

                        output.push(
                            rule
                        );

                    }

                }

                catch(error){

                    console.warn(

                        "DAILY RESULT PARSE ERROR:",

                        error

                    );

                }

            }

        );


    return output;

}


/* =====================================================
   GET USED NAMES IN CURRENT PERIOD
===================================================== */

async function getUsedNames(

    typeRule

){

    const sheetRules =
        await getDailyCurrentPeriodRules();


    const domRules =
        getDailyCurrentPeriodRulesFromDOM();


    const rules = [

        ...sheetRules,
        ...domRules

    ];


    const names =
        new Set();


    rules.forEach(

        rule => {

            if(

                normalizeValue(
                    rule?.type_rule
                ) !==
                normalizeValue(
                    typeRule
                )

            ){

                return;

            }


            if(

                rule?.nama

            ){

                names.add(
                    normalizeValue(
                        rule.nama
                    )
                );

            }

        }

    );


    return names;

}


/* =====================================================
   FILTER SELECT OPTIONS
===================================================== */

async function applyDailySelectOptions(

    section,
    typeRule

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


    const usedNames =
        await getUsedNames(
            typeRule
        );


    section.fields.forEach(

        field => {

            if(

                field.name !==
                "nama"

            ){

                return;

            }


            if(

                !Array.isArray(
                    field.options
                )

            ){

                return;

            }


            field.options =
                field.options.filter(

                    option =>

                        !usedNames.has(

                            normalizeValue(
                                option.value
                            )

                        )

                );

        }

    );

}


/* =====================================================
   RULE IDENTITY
===================================================== */

function getRuleIdentity(

    rule

){

    if(

        !rule

    ){

        return "";

    }


    return [

        "type_rule",

        "nama",

        "grade_1",

        "grade_2",

        "kondisi",

        "nominal",

        "waktu",

        "nilai_start",

        "nilai_end",

        "periode_start",

        "periode_end",

        "years"

    ]

        .map(

            field =>

                normalizeValue(
                    rule[field]
                )

        )

        .join(
            "||"
        );

}


/* =====================================================
   CHECK EXISTING EXACT RULE
===================================================== */

async function isDailyExactDuplicate(

    rule

){

    const rules =
        await getDailyRules();


    const identity =
        getRuleIdentity(
            rule
        );


    return rules.some(

        existing =>

            getRuleIdentity(
                existing
            ) ===
            identity

    );

}


/* =====================================================
   CHECK DOM EXACT RULE
===================================================== */

function isDailyDOMDuplicate(

    sectionId,
    rule

){

    const sectionElement =
        document.querySelector(

            `.global-setting-section[data-section="${sectionId}"]`

        );


    if(

        !sectionElement

    ){

        return false;

    }


    const result =
        sectionElement.querySelector(

            ".global-setting-result"

        );


    if(

        !result

    ){

        return false;

    }


    const identity =
        getRuleIdentity(
            rule
        );


    return [

        ...result.children

    ].some(

        item => {

            if(

                !item.dataset.value

            ){

                return false;

            }


            try{

                const data =
                    JSON.parse(
                        item.dataset.value
                    );


                return (

                    getRuleIdentity(
                        data
                    ) ===
                    identity

                );

            }

            catch(error){

                return false;

            }

        }

    );

}


/* =====================================================
   PERIOD NOTE
===================================================== */

function buildDailyPeriodNote(

    period

){

    if(

        !period

    ){

        return {

            calculation :
                "",

            active :
                ""

        };

    }


    return {

        calculation :

            `${

                formatDate(
                    period.nilai_start
                )

            } – ${

                formatDate(
                    period.nilai_end
                )

            }`,

        active :

            `${

                formatDate(
                    period.periode_start
                )

            } – ${

                formatDate(
                    period.periode_end
                )

            }`

    };

}


/* =====================================================
   RENDER DAILY PERIOD NOTE
===================================================== */

function renderDailyPeriodNote(

    sectionElement,
    period

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


    let note =
        result.querySelector(

            ".payroll-period-note"

        );


    if(

        !period

    ){

        if(

            note

        ){

            note.remove();

        }

        return;

    }


    if(

        !note

    ){

        note =
            document.createElement(
                "div"
            );

        note.className =
            "payroll-period-note";

        result.prepend(
            note
        );

    }


    const periodNote =
        buildDailyPeriodNote(
            period
        );


    note.innerHTML =

        `
            <strong>
                ✓ Periode Gaji sudah dibuat
            </strong>

            <div class="payroll-period-note-row">

                <span>
                    Periode perhitungan
                </span>

                <strong>
                    ${periodNote.calculation}
                </strong>

            </div>

            <div class="payroll-period-note-row">

                <span>
                    Masa aktif
                </span>

                <strong>
                    ${periodNote.active}
                </strong>

            </div>
        `;

}


/* =====================================================
   LOCK DAILY PERIOD UI
===================================================== */

function lockDailyPeriodUI(

    sectionElement,
    period

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

        form

    ){

        form.querySelectorAll(

            "input, select, textarea"

        ).forEach(

            input => {

                input.disabled =
                    true;

            }

        );

    }


    const addButton =
        sectionElement.querySelector(

            ".global-setting-add"

        );


    if(

        addButton

    ){

        addButton.style.display =
            "";

        addButton.textContent =
            "＋ Tambah Periode Baru";

    }


    renderDailyPeriodNote(

        sectionElement,
        period

    );

}


/* =====================================================
   UNLOCK DAILY PERIOD UI
===================================================== */

function unlockDailyPeriodUI(

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

        form

    ){

        form.querySelectorAll(

            "input, select, textarea, button"

        ).forEach(

            element => {

                if(

                    element.classList.contains(
                        "global-setting-confirm"
                    )

                ){

                    return;

                }


                if(

                    element.classList.contains(
                        "global-setting-result-delete"
                    )

                ){

                    return;

                }


                element.disabled =
                    false;

            }

        );

    }


    const addButton =
        sectionElement.querySelector(

            ".global-setting-add"

        );


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
        null

    );

}


/* =====================================================
   PREPARE NEW PERIOD MODE
===================================================== */

function enterDailyNewPeriodMode(

    sectionElement

){

    DAILY_NEW_PERIOD_MODE =
        true;


    DAILY_PERIOD_CONTEXT =
        null;


    if(

        sectionElement

    ){

        /*
           Hilangkan state lock yang sebelumnya
           disimpan controller.

           Ketika generic controller membuka
           form, form baru harus terbuka normal.
        */

        sectionElement._ruleState = {};

    }


    unlockDailyPeriodUI(

        sectionElement

    );

}


/* =====================================================
   BIND NEW PERIOD BUTTON
===================================================== */

function bindDailyNewPeriodButton(

    sectionElement

){

    if(

        !sectionElement

    ){

        return;

    }


    const button =
        sectionElement.querySelector(

            ".global-setting-add"

        );


    if(

        !button

    ){

        return;

    }


    if(

        button.dataset.dailyPeriodBound ===
        "1"

    ){

        return;

    }


    button.dataset.dailyPeriodBound =
        "1";


    button.addEventListener(

        "click",

        event => {

            /*
               Jika tidak ada periode,
               biarkan controller normal.
            */

            if(

                button.dataset.dailyAllowGenericClick ===
                "1"

            ){

                delete button.dataset.dailyAllowGenericClick;

                return;

            }


            const existingPeriod =
                getLatestDailyPeriodFromDOM();


            /*
               Jika DOM belum memiliki result,
               cek Sheet.
            */

            if(

                !existingPeriod

            ){

                return;

            }


            /*
               Periode sudah ada.

               Ambil alih click sebelum
               generic controller menjalankan
               toggleForm().
            */

            event.preventDefault();

            event.stopImmediatePropagation();


            enterDailyNewPeriodMode(

                sectionElement

            );


            /*
               Generic controller tetap digunakan
               untuk membuat form.

               Hanya state lock yang dibersihkan
               terlebih dahulu.
            */

            button.dataset.dailyAllowGenericClick =
                "1";


            setTimeout(

                () => {

                    button.click();

                },

                0

            );

        },

        true

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


            addLabel :
                "＋ Tambah Periode",


            formAddLabel :
                "＋ Tambahkan",


            deleteLabel :
                "Hapus",


            uniqueFields : [

                "nilai_start",

                "nilai_end",

                "periode_start",

                "periode_end"

            ],


            autoCloseForm :
                true,


            fields : [


                /* =====================================
                   TANGGAL MULAI
                ===================================== */

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


                /* =====================================
                   TANGGAL AKHIR
                ===================================== */

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


                /* =====================================
                   AKTIF START
                ===================================== */

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


                /* =====================================
                   AKTIF END
                ===================================== */

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
               RULE STATE
            ============================================= */

            getRuleState :

                async function({

                    sectionElement

                } = {}){

                    const periods =
                        await getDailyPeriodRules();


                    const period =
                        periods.length > 0
                            ?
                        periods.reduce(

                            (latest, current) => {

                                if(

                                    !latest

                                ){

                                    return current;

                                }


                                const currentTime =
                                    dateValue(
                                        current.periode_start
                                    );


                                const latestTime =
                                    dateValue(
                                        latest.periode_start
                                    );


                                return currentTime >=
                                    latestTime
                                    ?
                                    current
                                    :
                                    latest;

                            },

                            null

                        )
                            :
                        null;


                    if(

                        period

                    ){

                        setDailyPeriodContext(
                            period
                        );

                    }


                    bindDailyNewPeriodButton(
                        sectionElement
                    );


                    /*
                       Jika sedang membuat periode baru,
                       jangan lock kembali.
                    */

                    if(

                        DAILY_NEW_PERIOD_MODE

                    ){

                        return {

                            created :
                                false,

                            newPeriodMode :
                                true

                        };

                    }


                    /*
                       Tidak ada periode.
                    */

                    if(

                        !period

                    ){

                        if(

                            sectionElement

                        ){

                            const button =
                                sectionElement.querySelector(

                                    ".global-setting-add"

                                );


                            if(

                                button

                            ){

                                button.textContent =
                                    "＋ Tambah Periode";

                                button.style.display =
                                    "";

                            }

                        }


                        return {

                            created :
                                false,

                            periodExists :
                                false

                        };

                    }


                    /*
                       Period sudah ada.

                       Tampilkan note dan lock.
                    */

                    if(

                        sectionElement

                    ){

                        const form =
                            sectionElement.querySelector(

                                ".global-setting-form"

                            );


                        if(

                            form

                            &&

                            !form.classList.contains(
                                "hidden"
                            )

                        ){

                            form.classList.add(
                                "hidden"
                            );

                            form.innerHTML =
                                "";

                        }


                        lockDailyPeriodUI(

                            sectionElement,
                            period

                        );

                    }


                    return {

                        created :
                            true,

                        periodExists :
                            true,

                        lockPeriod :
                            true,

                        activePeriod :
                            {

                                periode_start :
                                    period.periode_start,

                                periode_end :
                                    period.periode_end,

                                years :
                                    period.years ?? ""

                            }

                    };

                },


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


                    const periodeEnd =
                        createISODate(

                            endPeriod.year,
                            endPeriod.month,
                            endDay

                        );


                    if(

                        !periodeStart

                    ){

                        alert(
                            "Tanggal awal masa aktif tidak valid."
                        );

                        return null;

                    }


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
                       Periode baru sekarang menjadi
                       context Daily sementara.

                       History lama tidak disentuh.
                    */

                    setDailyPeriodContext(
                        normalizedRule
                    );


                    return normalizedRule;

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


            /*
               Tidak menggunakan uniqueFields.

               Karena Daily Work boleh membuat
               rule yang sama pada periode baru.

               Duplicate ditentukan berdasarkan
               keseluruhan row.
            */

            uniqueFields :
                [],


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


            getRuleState :

                async function(){

                    return {

                        created :
                            false

                    };

                },


            normalize :

                async function(

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


                    const rule = {

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


                    const duplicateSheet =
                        await isDailyExactDuplicate(
                            rule
                        );


                    const duplicateDOM =
                        isDailyDOMDuplicate(
                            "rule_work",
                            rule
                        );


                    if(

                        duplicateSheet

                        ||

                        duplicateDOM

                    ){

                        alert(
                            "Rule Work dengan data yang sama sudah dibuat pada periode tersebut."
                        );

                        return null;

                    }


                    return rule;

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


            uniqueFields :
                [],


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


            getRuleState :

                async function({

                    section

                } = {}){

                    /*
                       Filter berdasarkan periode aktif.
                    */

                    if(

                        !DAILY_NEW_PERIOD_MODE

                    ){

                        await applyDailySelectOptions(

                            section,

                            "rule_tambah"

                        );

                    }


                    return {

                        created :
                            false

                    };

                },


            normalize :

                async function(

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


                    const rule = {

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


                    const duplicateSheet =
                        await isDailyExactDuplicate(
                            rule
                        );


                    const duplicateDOM =
                        isDailyDOMDuplicate(
                            "rule_tambah",
                            rule
                        );


                    if(

                        duplicateSheet

                        ||

                        duplicateDOM

                    ){

                        alert(
                            "Rule Tambah dengan data yang sama sudah dibuat pada periode tersebut."
                        );

                        return null;

                    }


                    return rule;

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


            uniqueFields :
                [],


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


            getRuleState :

                async function({

                    section

                } = {}){

                    if(

                        !DAILY_NEW_PERIOD_MODE

                    ){

                        await applyDailySelectOptions(

                            section,

                            "rule_potong"

                        );

                    }


                    return {

                        created :
                            false

                    };

                },


            normalize :

                async function(

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


                    const rule = {

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


                    const duplicateSheet =
                        await isDailyExactDuplicate(
                            rule
                        );


                    const duplicateDOM =
                        isDailyDOMDuplicate(
                            "rule_potong",
                            rule
                        );


                    if(

                        duplicateSheet

                        ||

                        duplicateDOM

                    ){

                        alert(
                            "Rule Potong dengan data yang sama sudah dibuat pada periode tersebut."
                        );

                        return null;

                    }


                    return rule;

                }

        }

    ],


    /* =====================================================
       PREPARE SAVE
    ===================================================== */

    /*
       Daily TIDAK menggunakan :

           Payroll.prepareSave()

       karena shared engine tersebut menggunakan
       rule_periode.

       Daily sudah menghasilkan :

           periode_start
           periode_end
           years

       langsung pada normalize masing-masing rule.

       Jadi payload Daily dipertahankan
       apa adanya agar process.js menerima
       struktur lama.
    */

    prepareSave :

        async function(

            payload

        ){

            if(

                !Array.isArray(
                    payload
                )

            ){

                return [];

            }


            /*
               Pastikan setiap rule baru yang
               belum memiliki periode mendapatkan
               context Daily.

               Rule lama tidak disentuh.
            */

            const period =
                getLatestDailyPeriodFromDOM()

                ||

                DAILY_PERIOD_CONTEXT;


            if(

                !period

            ){

                DAILY_NEW_PERIOD_MODE =
                    false;

                return payload;

            }


            const output =
                payload.map(

                    item => {

                        if(

                            !item

                        ){

                            return item;

                        }


                        const rule =
                            item.data ??
                            item;


                        if(

                            !rule

                        ){

                            return item;

                        }


                        /*
                           Rule Gaji dibiarkan
                           persis seperti struktur Daily.
                        */

                        if(

                            normalizeValue(
                                rule.type_rule
                            ) ===
                            "rule_gaji"

                        ){

                            return item;

                        }


                        /*
                           Rule yang sudah memiliki
                           periode tidak disentuh.

                           Ini penting untuk menjaga
                           history lama.
                        */

                        if(

                            rule.periode_start

                            &&

                            rule.periode_end

                        ){

                            return item;

                        }


                        /*
                           Hanya rule tanpa periode
                           yang diberi active period.
                        */

                        const prepared = {

                            ...rule,

                            periode_start :
                                period.periode_start,

                            periode_end :
                                period.periode_end,

                            years :
                                period.years ?? ""

                        };


                        if(

                            item.data

                        ){

                            return {

                                ...item,

                                data :
                                    prepared

                            };

                        }


                        return prepared;

                    }

                );


            DAILY_NEW_PERIOD_MODE =
                false;


            DAILY_PERIOD_CONTEXT =
                period;


            return output;

        }

};


/* =====================================================
   END
===================================================== */
