/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Daily
   File         : daily.js
   Version      : 3.0.0

   Description :
   Payroll Daily Setting Definition

   Modules :
   - Rule Gaji
   - Rule Work
   - Rule Tambah
   - Rule Potong

   Concept :
   - Rule Gaji tetap menggunakan type_rule "rule_gaji"
   - Rule Gaji menjadi sumber periode aktif Daily
   - Rule Gaji dikunci setelah periode dibuat
   - Periode lama tetap menjadi history
   - Tambah Periode Baru membuka kembali Rule Gaji
   - Rule Work / Tambah / Potong mewarisi
     periode aktif Daily
   - Rule lama tidak mengunci periode baru
   - Duplicate rule dihitung berdasarkan
     periode aktif, bukan seluruh history

   IMPORTANT :
   Struktur payload Daily tetap menggunakan :

       periode_start
       periode_end
       years

   Tidak diganti menjadi :

       berlaku_start
       berlaku_end

   process.js tidak perlu diubah.
===================================================== */


/* =====================================================
   PAYROLL ENGINE
===================================================== */

import {
    Payroll
} from "./payroll.js";


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
   DAILY PERIOD CONTEXT
===================================================== */

let DAILY_PERIOD_CONTEXT = null;


/* =====================================================
   NORMALIZE VALUE
===================================================== */

function normalizeValue(

    value

){

    if(

        value === undefined

        ||

        value === null

    ){

        return "";

    }


    return String(
        value
    ).trim();

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

        rule.type_rule !==
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

        nilai_start :
            rule.nilai_start ?? "",

        nilai_end :
            rule.nilai_end ?? "",

        periode_start :
            rule.periode_start,

        periode_end :
            rule.periode_end,

        years :
            rule.years ?? ""

    };

}


/* =====================================================
   READ DAILY RULES FROM PAYROLL ENGINE
===================================================== */

async function getDailyRules(){

    try{

        await Payroll.ensureLoaded(
            PAYROLL_MODE
        );

    }

    catch(error){

        console.warn(
            "DAILY PAYROLL ENGINE LOAD ERROR:",
            error
        );

    }


    try{

        const rules =
            Payroll.getRules(
                PAYROLL_MODE
            );


        if(
            Array.isArray(rules)
        ){

            return rules;

        }

    }

    catch(error){

        console.warn(
            "DAILY PAYROLL RULE READ ERROR:",
            error
        );

    }


    return [];

}


/* =====================================================
   GET LATEST DAILY RULE GAJI
===================================================== */

function getLatestDailyPeriodFromRules(

    rules

){

    if(
        !Array.isArray(rules)
    ){

        return null;

    }


    const periods =

        rules.filter(

            rule =>

                rule

                &&

                rule.type_rule ===
                    "rule_gaji"

                &&

                rule.periode_start

                &&

                rule.periode_end

        );


    if(
        periods.length === 0
    ){

        return null;

    }


    periods.sort(

        (
            first,
            second
        ) => {

            const firstDate =
                new Date(
                    first.periode_start
                ).getTime();


            const secondDate =
                new Date(
                    second.periode_start
                ).getTime();


            if(
                Number.isNaN(
                    firstDate
                )
            ){

                return -1;

            }


            if(
                Number.isNaN(
                    secondDate
                )
            ){

                return 1;

            }


            return (
                firstDate -
                secondDate
            );

        }

    );


    const latest =
        periods[
            periods.length - 1
        ];


    return {

        nilai_start :
            latest.nilai_start ?? "",

        nilai_end :
            latest.nilai_end ?? "",

        periode_start :
            latest.periode_start,

        periode_end :
            latest.periode_end,

        years :
            latest.years ?? ""

    };

}


/* =====================================================
   GET ACTIVE DAILY PERIOD
===================================================== */

async function getDailyActivePeriod(){

    const rules =
        await getDailyRules();


    const period =
        getLatestDailyPeriodFromRules(
            rules
        );


    if(
        period
    ){

        DAILY_PERIOD_CONTEXT =
            period;


        return period;

    }


    return DAILY_PERIOD_CONTEXT;

}


/* =====================================================
   GET ACTIVE PERIOD FROM UI RESULT
===================================================== */

function getLatestDailyPeriodFromUI(){

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


    for(

        let index =
            items.length - 1;

        index >= 0;

        index--

    ){

        const item =
            items[index];


        if(
            !item.dataset.value
        ){

            continue;

        }


        try{

            const data =

                JSON.parse(
                    item.dataset.value
                );


            if(

                data

                &&

                data.type_rule ===
                    "rule_gaji"

                &&

                data.periode_start

                &&

                data.periode_end

            ){

                return {

                    nilai_start :
                        data.nilai_start ?? "",

                    nilai_end :
                        data.nilai_end ?? "",

                    periode_start :
                        data.periode_start,

                    periode_end :
                        data.periode_end,

                    years :
                        data.years ?? ""

                };

            }

        }

        catch(error){

            console.warn(
                "DAILY PERIOD UI PARSE ERROR:",
                error
            );

        }

    }


    return null;

}


/* =====================================================
   GET ACTIVE PERIOD CONTEXT
===================================================== */

async function getActivePeriodContext(){

    const sheetPeriod =
        await getDailyActivePeriod();


    if(
        sheetPeriod
    ){

        return sheetPeriod;

    }


    const uiPeriod =
        getLatestDailyPeriodFromUI();


    if(
        uiPeriod
    ){

        DAILY_PERIOD_CONTEXT =
            uiPeriod;


        return uiPeriod;

    }


    return DAILY_PERIOD_CONTEXT;

}


/* =====================================================
   REQUIRE ACTIVE PERIOD
===================================================== */

async function requireDailyActivePeriod(

    ruleName

){

    const periodContext =
        await getActivePeriodContext();


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
   PERIOD MATCH
===================================================== */

function sameDailyPeriod(

    rule,

    period

){

    if(

        !rule

        ||

        !period

    ){

        return false;

    }


    return (

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

    );

}


/* =====================================================
   GET RULES IN ACTIVE PERIOD
===================================================== */

async function getDailyCurrentPeriodRules(){

    const rules =
        await getDailyRules();


    const period =
        await getActivePeriodContext();


    if(
        !period
    ){

        return [];

    }


    return rules.filter(

        rule =>
            sameDailyPeriod(
                rule,
                period
            )

    );

}


/* =====================================================
   DAILY EXACT DUPLICATE
===================================================== */

function sameValue(

first,

second

){

    return (

        normalizeValue(first) ===
        normalizeValue(second)

    );

}


/* =====================================================
   WORK DUPLICATE
===================================================== */

function isDailyWorkDuplicate(

rule,

existingRules

){

    return existingRules.some(

        existing =>

            existing.type_rule ===
                "rule_work"

            &&

            sameValue(
                existing.nama,
                rule.nama
            )

            &&

            sameValue(
                existing.grade_1,
                rule.grade_1
            )

            &&

            sameValue(
                existing.grade_2,
                rule.grade_2
            )

            &&

            sameValue(
                existing.nominal,
                rule.nominal
            )

            &&

            sameValue(
                existing.waktu,
                rule.waktu
            )

    );

}


/* =====================================================
   TAMBAH DUPLICATE
===================================================== */

function isDailyTambahDuplicate(

rule,

existingRules

){

    return existingRules.some(

        existing =>

            existing.type_rule ===
                "rule_tambah"

            &&

            sameValue(
                existing.nama,
                rule.nama
            )

            &&

            sameValue(
                existing.waktu,
                rule.waktu
            )

            &&

            sameValue(
                existing.nominal,
                rule.nominal
            )

    );

}


/* =====================================================
   POTONG DUPLICATE
===================================================== */

function isDailyPotongDuplicate(

rule,

existingRules

){

    return existingRules.some(

        existing =>

            existing.type_rule ===
                "rule_potong"

            &&

            sameValue(
                existing.nama,
                rule.nama
            )

            &&

            sameValue(
                existing.nominal,
                rule.nominal
            )

    );

}


/* =====================================================
   CHECK DAILY DUPLICATE
===================================================== */

async function checkDailyDuplicate(

rule

){

    const currentRules =
        await getDailyCurrentPeriodRules();


    if(

        rule.type_rule ===
        "rule_work"

    ){

        return isDailyWorkDuplicate(
            rule,
            currentRules
        );

    }


    if(

        rule.type_rule ===
        "rule_tambah"

    ){

        return isDailyTambahDuplicate(
            rule,
            currentRules
        );

    }


    if(

        rule.type_rule ===
        "rule_potong"

    ){

        return isDailyPotongDuplicate(
            rule,
            currentRules
        );

    }


    return false;

}


/* =====================================================
   PERIOD DISPLAY
===================================================== */

function createDailyPeriodDisplay(

period

){

    if(
        !period
    ){

        return null;

    }


    return {

        nilai_start :
            period.nilai_start ?? "",

        nilai_end :
            period.nilai_end ?? "",

        berlaku_start :
            period.periode_start ?? "",

        berlaku_end :
            period.periode_end ?? ""

    };

}


/* =====================================================
   APPLY PERIOD NOTE
===================================================== */

function applyDailyPeriodNote(

sectionElement,

period

){

    if(
        !sectionElement
    ){

        return;

    }


    let note =

        sectionElement.querySelector(

            ".payroll-period-note-wrapper"

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


    const displayPeriod =
        createDailyPeriodDisplay(
            period
        );


    let periodNote;


    try{

        periodNote =
            Payroll.buildPeriodNote(
                displayPeriod
            );

    }

    catch(error){

        console.warn(
            "DAILY PERIOD NOTE ERROR:",
            error
        );


        return;

    }


    if(
        !periodNote
    ){

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
            "payroll-period-note-wrapper";


        const form =
            sectionElement.querySelector(
                ".global-setting-form"
            );


        if(
            form
        ){

            form.parentNode.insertBefore(
                note,
                form
            );

        }

        else{

            sectionElement.appendChild(
                note
            );

        }

    }


    note.innerHTML =
        periodNote.html ?? "";

}


/* =====================================================
   DAILY PERIOD UI
===================================================== */

function applyDailyPeriodUI(

sectionElement,

period,

newPeriodMode = false

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


    /* =============================================
       NEW PERIOD MODE
    ============================================= */

    if(
        newPeriodMode
    ){

        applyDailyPeriodNote(
            sectionElement,
            null
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


            const controls =

                form.querySelectorAll(

                    "input, select, textarea, button"

                );


            controls.forEach(

                control => {

                    control.disabled =
                        false;

                }

            );

        }


        return;

    }


    /* =============================================
       NO PERIOD
    ============================================= */

    if(
        !period
    ){

        applyDailyPeriodNote(
            sectionElement,
            null
        );


        if(
            form
        ){

            form.classList.remove(
                "hidden"
            );


            const controls =

                form.querySelectorAll(

                    "input, select, textarea, button"

                );


            controls.forEach(

                control => {

                    control.disabled =
                        false;

                }

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


        return;

    }


    /* =============================================
       EXISTING PERIOD
    ============================================= */

    applyDailyPeriodNote(
        sectionElement,
        period
    );


    if(
        form
    ){

        form.classList.add(
            "hidden"
        );


        const controls =

            form.querySelectorAll(

                "input, select, textarea, button"

            );


        controls.forEach(

            control => {

                control.disabled =
                    true;

            }

        );

    }


    if(
        addButton
    ){

        addButton.style.display =
            "";

        addButton.textContent =
            "＋ Tambah Periode Baru";

    }

}


/* =====================================================
   BIND NEW PERIOD BUTTON
===================================================== */

function bindDailyNewPeriodButton(

sectionElement

){

    if(

        !sectionElement

        ||

        sectionElement
            ._dailyPeriodButtonBound

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


    sectionElement
        ._dailyPeriodButtonBound =
        true;


    /*
       Capture phase digunakan supaya
       Daily menentukan newPeriodMode
       sebelum controller generic
       membuka form.
    */

    button.addEventListener(

        "click",

        event => {

            const period =
                getLatestDailyPeriodFromUI();


            if(
                !period
            ){

                return;

            }


            /*
               Periode lama ada.

               Klik tombol berarti user
               memang ingin membuat periode baru.
            */

            try{

                Payroll.enterNewPeriodMode(
                    PAYROLL_MODE
                );

            }

            catch(error){

                console.warn(
                    "DAILY NEW PERIOD MODE ERROR:",
                    error
                );

            }


            applyDailyPeriodUI(
                sectionElement,
                period,
                true
            );

        },

        true

    );

}


/* =====================================================
   OBSERVE DAILY PERIOD RESULT
===================================================== */

function bindDailyPeriodObserver(

sectionElement

){

    if(

        !sectionElement

        ||

        sectionElement
            ._dailyPeriodObserver

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


    const observer =

        new MutationObserver(

            async () => {

                const period =
                    getLatestDailyPeriodFromUI();


                if(
                    !period
                ){

                    return;

                }


                const newPeriodMode =

                    (() => {

                        try{

                            return Payroll.isNewPeriodMode(
                                PAYROLL_MODE
                            );

                        }

                        catch(error){

                            return false;

                        }

                    })();


                /*
                   Jika result baru sudah dibuat,
                   periode baru selesai.
                */

                if(
                    newPeriodMode
                ){

                    try{

                        Payroll.exitNewPeriodMode(
                            PAYROLL_MODE
                        );

                    }

                    catch(error){

                        console.warn(
                            "DAILY EXIT NEW PERIOD MODE ERROR:",
                            error
                        );

                    }

                }


                DAILY_PERIOD_CONTEXT =
                    period;


                applyDailyPeriodUI(
                    sectionElement,
                    period,
                    false
                );

            }

        );


    observer.observe(

        result,

        {

            childList :
                true,

            subtree :
                true

        }

    );


    sectionElement
        ._dailyPeriodObserver =
        observer;

}


/* =====================================================
   DAILY RULE STATE
===================================================== */

async function getDailyRuleState(

sectionId,

sectionElement

){

    const rules =
        await getDailyRules();


    const period =
        getLatestDailyPeriodFromRules(
            rules
        )
        ??

        getLatestDailyPeriodFromUI();


    if(
        period
    ){

        DAILY_PERIOD_CONTEXT =
            period;

    }


    let newPeriodMode =
        false;


    try{

        newPeriodMode =
            Payroll.isNewPeriodMode(
                PAYROLL_MODE
            );

    }

    catch(error){

        newPeriodMode =
            false;

    }


    /* =============================================
       RULE GAJI
    ============================================= */

    if(
        sectionId ===
        "rule_gaji"
    ){

        applyDailyPeriodUI(
            sectionElement,
            period,
            newPeriodMode
        );


        bindDailyNewPeriodButton(
            sectionElement
        );


        bindDailyPeriodObserver(
            sectionElement
        );


        return {

            gaji :
                Boolean(period)
                &&
                !newPeriodMode,

            created : {

                gaji :
                    Boolean(period)
                    &&
                    !newPeriodMode

            },

            periodExists :
                Boolean(period),

            lockPeriod :
                Boolean(period)
                &&
                !newPeriodMode,

            newPeriodMode :
                newPeriodMode,

            activePeriod :
                period

        };

    }


    /* =============================================
       RULE WORK
    ============================================= */

    if(
        sectionId ===
        "rule_work"
    ){

        return {

            activePeriod :
                period,

            newPeriodMode :
                newPeriodMode,

            work :
                false

        };

    }


    /* =============================================
       RULE TAMBAH
    ============================================= */

    if(
        sectionId ===
        "rule_tambah"
    ){

        return {

            activePeriod :
                period,

            newPeriodMode :
                newPeriodMode,

            tambah :
                false

        };

    }


    /* =============================================
       RULE POTONG
    ============================================= */

    if(
        sectionId ===
        "rule_potong"
    ){

        return {

            activePeriod :
                period,

            newPeriodMode :
                newPeriodMode,

            potong :
                false

        };

    }


    return {

        activePeriod :
            period,

        newPeriodMode :
            newPeriodMode

    };

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
       RULE GAJI
    ================================================= */

    sections : [

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


            autoCloseForm :
                true,


            /*
               Daily menggunakan state sendiri
               karena payload periodenya tetap
               rule_gaji + periode_start/end.
            */

            getRuleState :

                async function({

                    sectionElement

                }){

                    return getDailyRuleState(

                        "rule_gaji",

                        sectionElement

                    );

                },


            fields : [

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


                    /* =================================
                       NILAI START
                    ================================= */

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


                    /* =================================
                       NILAI END
                    ================================= */

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


                    /* =================================
                       MASA AKTIF START
                    ================================= */

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


                    /* =================================
                       MASA AKTIF END
                    ================================= */

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


                    /* =================================
                       VALIDATE ACTIVE RANGE
                    ================================= */

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


                    /* =================================
                       DAILY RULE GAJI PAYLOAD

                       TETAP SAMA DENGAN VERSI LAMA
                    ================================= */

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


            autoCloseForm :
                true,


            getRuleState :

                async function({

                    sectionElement

                }){

                    return getDailyRuleState(

                        "rule_work",

                        sectionElement

                    );

                },


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

                async function(

                    data

                ){

                    const periodContext =

                        await requireDailyActivePeriod(

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


                    if(
                        await checkDailyDuplicate(
                            rule
                        )
                    ){

                        alert(
                            "Rule Work yang sama sudah dibuat pada periode gaji aktif."
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


            autoCloseForm :
                true,


            getRuleState :

                async function({

                    sectionElement

                }){

                    return getDailyRuleState(

                        "rule_tambah",

                        sectionElement

                    );

                },


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

                        await requireDailyActivePeriod(

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


                    if(
                        await checkDailyDuplicate(
                            rule
                        )
                    ){

                        alert(
                            "Rule Tambah yang sama sudah dibuat pada periode gaji aktif."
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


            autoCloseForm :
                true,


            getRuleState :

                async function({

                    sectionElement

                }){

                    return getDailyRuleState(

                        "rule_potong",

                        sectionElement

                    );

                },


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

                async function(

                    data

                ){

                    const periodContext =

                        await requireDailyActivePeriod(

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


                    if(
                        await checkDailyDuplicate(
                            rule
                        )
                    ){

                        alert(
                            "Rule Potong yang sama sudah dibuat pada periode gaji aktif."
                        );


                        return null;

                    }


                    return rule;

                }

        }

    ]

};


/* =====================================================
   END
===================================================== */
