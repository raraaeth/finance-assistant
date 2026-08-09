/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Process
   File        : process.js
   Version     : 1.0.0

   Description :
   Business Engine Payroll Monthly

   Sections :
   - State
   - Init
   - Normalize
   - Period
   - Attendance
   - Calculation
   - Summary
   - Chart
   - Helper
===================================================== */


/* =====================================================
   STATE
===================================================== */

export const Process = {

    raw : [],

    rules : [],

    attendance : [],

    periods : [],

    currentPeriod : {},

    previousPeriod : {},

    calculation : {},

    summary : {},

    chart : []

};


/* =====================================================
   INIT
===================================================== */

Process.init = function(

    raw,

    rules

){

    Process.raw =

        raw || [];

    Process.rules =

        rules || [];

    normalizeRules();

    normalizeAttendance();

    processPeriods();

    processAttendance();

    processCalculation();

    processSummary();

    processChart();

};


/* =====================================================
   NORMALIZE RULES
===================================================== */

function normalizeRules(){

    Process.rules =

        Process.rules.map(

            item=>({

                ...item,

                nominal :

                    toNumber(

                        item.nominal

                    ),

                nilaiStart :

                    item.nilai_start ??

                    "",

                nilaiEnd :

                    item.nilai_end ??

                    "",

                berlakuStart :

                    parseDate(

                        item.berlaku_start

                    ),

                berlakuEnd :

                    parseDate(

                        item.berlaku_end

                    )

            })

        );

}


/* =====================================================
   NORMALIZE ATTENDANCE
===================================================== */

function normalizeAttendance(){

    Process.attendance =

        Process.raw

        .map(

            item=>{

                const date =

                    parseDate(

                        item.date

                    );

                const checkin =

                    parseTime(

                        item.checkin

                    );

                const pulang =

                    parseTime(

                        item.pulang

                    );

                return {

                    ...item,

                    date,

                    status :

                        (

                            item.status ??

                            ""

                        )

                        .trim()

                        .toLowerCase(),

                    checkin,

                    pulang,

                    checkinMinutes :

                        checkin.minutes,

                    pulangMinutes :

                        pulang.minutes,

                    durationMinutes :

                        calculateDuration(

                            checkin.minutes,

                            pulang.minutes

                        ),

                    period : null,

                    lateMinutes : 0,

                    shift : null

                };

            }

        )

        .filter(

            item=>

                item.date

        )

        .sort(

            (

                a,

                b

            )=>

                a.date -

                b.date

        );

}


/* =====================================================
   PERIOD
===================================================== */

function processPeriods(){

    const periodRules =

        Process.rules

        .filter(

            item=>

                item.type_rule ===

                "rule_periode"

                &&

                item.nama ===

                "periode_gaji"

        );

    const periods = [];

    periodRules.forEach(

        rule=>{

            if(

                !rule.nilaiStart ||

                !rule.nilaiEnd

            ){

                return;

            }

            const start =

                parseDate(

                    rule.nilaiStart

                );

            const end =

                parseDate(

                    rule.nilaiEnd

                );

            if(

                !start ||

                !end

            ){

                return;

            }

            periods.push({

                start,

                end,

                startText :

                    rule.nilaiStart,

                endText :

                    rule.nilaiEnd,

                years :

                    rule.years,

                berlakuStart :

                    rule.berlakuStart,

                berlakuEnd :

                    rule.berlakuEnd

            });

        }

    );

    Process.periods =

        periods.sort(

            (

                a,

                b

            )=>

                b.start -

                a.start

        );

    Process.currentPeriod =

        findCurrentPeriod();

    Process.previousPeriod =

        findPreviousPeriod();

}


/* =====================================================
   CURRENT PERIOD
===================================================== */

function findCurrentPeriod(){

    const today =

        new Date();

    today.setHours(

        0,

        0,

        0,

        0

    );

    const period =

        Process.periods.find(

            item=>

                today >= item.start &&

                today <= item.end

        );

    if(

        period

    ){

        return period;

    }

    return Process.periods[0] || {};

}


/* =====================================================
   PREVIOUS PERIOD
===================================================== */

function findPreviousPeriod(){

    if(

        !Process.currentPeriod.start

    ){

        return {};

    }

    return Process.periods.find(

        item=>

            item.end <

            Process.currentPeriod.start

    ) || {};

}


/* =====================================================
   ATTENDANCE
===================================================== */

function processAttendance(){

    Process.attendance =

        Process.attendance.map(

            item=>{

                const period =

                    findPeriodByDate(

                        item.date

                    );

                const shift =

                    findShift(

                        item.checkinMinutes

                    );

                const lateMinutes =

                    calculateLate(

                        item,

                        shift

                    );

                return {

                    ...item,

                    period,

                    shift :

                        shift?.nama ??

                        "",

                    shiftStart :

                        shift?.start ??

                        null,

                    shiftEnd :

                        shift?.end ??

                        null,

                    lateMinutes

                };

            }

        );

}


/* =====================================================
   CALCULATION
===================================================== */

function processCalculation(){

    const period =

        Process.currentPeriod;

    if(

        !period.start

    ){

        Process.calculation =

            createEmptyCalculation();

        return;

    }

    Process.calculation =

        calculatePeriod(

            period

        );

}


/* =====================================================
   CALCULATE PERIOD
===================================================== */

function calculatePeriod(

    period

){

    const data =

        Process.attendance.filter(

            item=>

                item.date >= period.start &&

                item.date <= period.end

        );

    const gaji =

        findRule(

            "rule_gaji",

            "gaji"

        );

    const uangMakan =

        findRule(

            "rule_tambah",

            "uang_makan"

        );

    const tunjangan =

        findRule(

            "rule_tambah",

            "tunjangan"

        );

    const transport =

        findRule(

            "rule_tambah",

            "uang_transport"

        );

    const lembur =

        findRule(

            "rule_lembur",

            "lembur"

        );

    const lemburPertama =

        findRule(

            "rule_lembur",

            "lembur_kesatu"

        );

    const lemburKedua =

        findRule(

            "rule_lembur",

            "lembur_kedua"

        );

    const absen =

        findRule(

            "rule_potong",

            "absen"

        );

    const potonganRules =

        Process.rules.filter(

            rule=>

                rule.type_rule ===

                "rule_potong"

                &&

                rule.kondisi ===

                "periode"

                &&

                rule.waktu ===

                "gaji"

                &&

                isRuleActive(

                    rule,

                    period

                )

        );

    const penambahanRules =

        Process.rules.filter(

            rule=>

                rule.type_rule ===

                "rule_tambah"

                &&

                rule.kondisi ===

                "periode"

                &&

                rule.waktu ===

                "gaji"

                &&

                isRuleActive(

                    rule,

                    period

                )

        );

    let totalUangMakan = 0;

    let totalLembur = 0;

    let totalLemburJamPertama = 0;

    let totalLemburJamKedua = 0;

    let totalAbsen = 0;

    let totalTelat = 0;

    let totalIzinTerlambat = 0;

    let totalIzinPulang = 0;

    let totalHariMasuk = 0;

    let totalHariLembur = 0;

    let totalCuti = 0;

    let totalSakit = 0;

    let totalLiburNasional = 0;

    let totalDurasiKerja = 0;

    data.forEach(

        item=>{

            totalDurasiKerja +=

                item.durationMinutes || 0;

            switch(

                item.status

            ){

                case "masuk":

                    totalHariMasuk++;

                    if(

                        uangMakan

                    ){

                        totalUangMakan +=

                            uangMakan.nominal;

                    }

                    break;

                case "lembur":

                    totalHariLembur++;

                    if(

                        lembur

                    ){

                        totalLembur +=

                            lembur.nominal;

                    }

                    break;

                case "cuti":

                    totalCuti++;

                    break;

                case "sakit":

                    totalSakit++;

                    break;

                case "libur_nasional":

                    totalLiburNasional++;

                    break;

                case "absen":

                    totalAbsen +=

                        absen

                        ?

                        absen.nominal

                        :

                        0;

                    break;

            }

            const lateRule =

                findLateRule(

                    item.lateMinutes

                );

            if(

                lateRule

            ){

                totalTelat +=

                    lateRule.nominal;

            }

            if(

                item.status ===

                "masuk"

                &&

                item.lateMinutes > 45

            ){

                const rule =

                    findRule(

                        "rule_potong",

                        "izin_terlambat"

                    );

                if(

                    rule

                ){

                    totalIzinTerlambat +=

                        rule.nominal;

                }

            }

        }

    );

    const totalPenambahanPeriode =

        penambahanRules.reduce(

            (

                total,

                rule

            )=>

                total +

                rule.nominal,

            0

        );

    const totalPotonganPeriode =

        potonganRules.reduce(

            (

                total,

                rule

            )=>

                total +

                rule.nominal,

            0

        );

    const totalPenambahan =

        totalUangMakan +

        totalLembur +

        totalLemburJamPertama +

        totalLemburJamKedua +

        totalPenambahanPeriode;

    const totalPotongan =

        totalPotonganPeriode +

        totalAbsen +

        totalTelat +

        totalIzinTerlambat +

        totalIzinPulang;

    const gajiPokok =

        gaji

        ?

        gaji.nominal

        :

        0;

    const gajiBersih =

        gajiPokok +

        totalPenambahan -

        totalPotongan;

    Process.calculation = {

        period,

        gajiPokok,

        penambahan : {

            uangMakan :

                totalUangMakan,

            lembur :

                totalLembur,

            lemburJamPertama :

                totalLemburJamPertama,

            lemburJamKedua :

                totalLemburJamKedua,

            periode :

                totalPenambahanPeriode,

            total :

                totalPenambahan

        },

        potongan : {

            periode :

                totalPotonganPeriode,

            absen :

                totalAbsen,

            telat :

                totalTelat,

            izinTerlambat :

                totalIzinTerlambat,

            izinPulang :

                totalIzinPulang,

            total :

                totalPotongan

        },

        attendance : {

            masuk :

                totalHariMasuk,

            lembur :

                totalHariLembur,

            cuti :

                totalCuti,

            sakit :

                totalSakit,

            liburNasional :

                totalLiburNasional,

            absen :

                data.filter(

                    item=>

                        item.status ===

                        "absen"

                ).length,

            durasiKerja :

                totalDurasiKerja

        },

        gajiBersih

    };

}


/* =====================================================
   SUMMARY
===================================================== */

function processSummary(){

    const calculation =

        Process.calculation;

    Process.summary = {

        periode :

            calculation.period || {},

        gajiPokok :

            calculation.gajiPokok || 0,

        gajiBersih :

            calculation.gajiBersih || 0,

        totalPenambahan :

            calculation

            .penambahan

            ?

            calculation

            .penambahan

            .total

            :

            0,

        totalPotongan :

            calculation

            .potongan

            ?

            calculation

            .potongan

            .total

            :

            0,

        attendance :

            calculation.attendance || {}

    };

}


/* =====================================================
   CHART
===================================================== */

function processChart(){

    const chart = {};

    Process.attendance.forEach(

        item=>{

            if(

                !item.date

            ){

                return;

            }

            const key =

                formatDateKey(

                    item.date

                );

            if(

                !chart[key]

            ){

                chart[key] = {

                    masuk : 0,

                    lembur : 0,

                    cuti : 0,

                    sakit : 0,

                    absen : 0,

                    liburNasional : 0

                };

            }

            if(

                chart[key][

                    item.status

                ] !== undefined

            ){

                chart[key][

                    item.status

                ]++;

            }

        }

    );

    Process.chart =

        Object.entries(

            chart

        ).map(

            ([

                date,

                value

            ])=>({

                date,

                ...value

            })

        );

}


/* =====================================================
   FIND PERIOD BY DATE
===================================================== */

function findPeriodByDate(

    date

){

    return Process.periods.find(

        period=>

            date >= period.start &&

            date <= period.end

    ) || null;

}


/* =====================================================
   FIND SHIFT
===================================================== */

function findShift(

    checkinMinutes

){

    if(

        checkinMinutes === null

    ){

        return null;

    }

    const shifts =

        Process.rules.filter(

            rule=>

                rule.type_rule ===

                "rule_masuk"

                &&

                rule.nama.startsWith(

                    "masuk_shift"

                )

                &&

                rule.nilaiStart

                &&

                rule.nilaiEnd

        );

    let selected = null;

    let smallest =

        Infinity;

    shifts.forEach(

        rule=>{

            const start =

                timeToMinutes(

                    rule.nilaiStart

                );

            if(

                start === null

            ){

                return;

            }

            let difference =

                Math.abs(

                    checkinMinutes -

                    start

                );

            if(

                difference <

                smallest

            ){

                smallest =

                    difference;

                selected = {

                    nama :

                        rule.nama,

                    start,

                    end :

                        timeToMinutes(

                            rule.nilaiEnd

                        )

                };

            }

        }

    );

    return selected;

}


/* =====================================================
   CALCULATE LATE
===================================================== */

function calculateLate(

    item,

    shift

){

    if(

        item.status !==

        "masuk"

        ||

        !shift

        ||

        item.checkinMinutes === null

    ){

        return 0;

    }

    let late =

        item.checkinMinutes -

        shift.start;

    if(

        late < 0

    ){

        late = 0;

    }

    return late;

}


/* =====================================================
   FIND LATE RULE
===================================================== */

function findLateRule(

    minutes

){

    if(

        !minutes ||

        minutes <= 0

    ){

        return null;

    }

    return Process.rules.find(

        rule=>

            rule.type_rule ===

            "rule_potong"

            &&

            rule.waktu ===

            "menit"

            &&

            rule.nilaiStart !== ""

            &&

            rule.nilaiEnd !== ""

            &&

            minutes >=

                Number(

                    rule.nilaiStart

                )

            &&

            minutes <=

                Number(

                    rule.nilaiEnd

                )

    ) || null;

}


/* =====================================================
   FIND RULE
===================================================== */

function findRule(

    type,

    name

){

    return Process.rules.find(

        rule=>

            rule.type_rule ===

            type

            &&

            rule.nama ===

            name

    ) || null;

}


/* =====================================================
   RULE ACTIVE
===================================================== */

function isRuleActive(

    rule,

    period

){

    if(

        !period.start

    ){

        return false;

    }

    if(

        rule.berlakuStart

        &&

        period.end <

        rule.berlakuStart

    ){

        return false;

    }

    if(

        rule.berlakuEnd

        &&

        period.start >

        rule.berlakuEnd

    ){

        return false;

    }

    return true;

}


/* =====================================================
   CREATE EMPTY CALCULATION
===================================================== */

function createEmptyCalculation(){

    return {

        period : {},

        gajiPokok : 0,

        penambahan : {

            uangMakan : 0,

            lembur : 0,

            lemburJamPertama : 0,

            lemburJamKedua : 0,

            periode : 0,

            total : 0

        },

        potongan : {

            periode : 0,

            absen : 0,

            telat : 0,

            izinTerlambat : 0,

            izinPulang : 0,

            total : 0

        },

        attendance : {

            masuk : 0,

            lembur : 0,

            cuti : 0,

            sakit : 0,

            liburNasional : 0,

            absen : 0,

            durasiKerja : 0

        },

        gajiBersih : 0

    };

}


/* =====================================================
   DATE HELPER
===================================================== */

function parseDate(

    value

){

    if(

        !value

    ){

        return null;

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

        return null;

    }

    date.setHours(

        0,

        0,

        0,

        0

    );

    return date;

}


/* =====================================================
   TIME HELPER
===================================================== */

function parseTime(

    value

){

    if(

        !value

    ){

        return {

            minutes : null,

            hours : null,

            seconds : null

        };

    }

    const parts =

        String(

            value

        )

        .split(".")

        .map(Number);

    const hours =

        parts[0] || 0;

    const minutes =

        parts[1] || 0;

    const seconds =

        parts[2] || 0;

    return {

        minutes :

            (

                hours * 60

            ) +

            minutes +

            (

                seconds / 60

            ),

        hours,

        minutes,

        seconds

    };

}


/* =====================================================
   TIME TO MINUTES
===================================================== */

function timeToMinutes(

    value

){

    const parsed =

        parseTime(

            value

        );

    if(

        parsed.minutes === null

    ){

        return null;

    }

    return parsed.minutes;

}


/* =====================================================
   DURATION
===================================================== */

function calculateDuration(

    start,

    end

){

    if(

        start === null ||

        end === null

    ){

        return 0;

    }

    let duration =

        end -

        start;

    if(

        duration < 0

    ){

        duration +=

            24 * 60;

    }

    return duration;

}


/* =====================================================
   DATE KEY
===================================================== */

function formatDateKey(

    date

){

    const year =

        date.getFullYear();

    const month =

        String(

            date.getMonth() + 1

        ).padStart(

            2,

            "0"

        );

    const day =

        String(

            date.getDate()

        ).padStart(

            2,

            "0"

        );

    return `${year}-${month}-${day}`;

}


/* =====================================================
   NUMBER
===================================================== */

function toNumber(

    value

){

    const number =

        Number(

            value

        );

    return Number.isFinite(

        number

    )

        ?

        number

        :

        0;

}
