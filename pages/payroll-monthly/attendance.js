/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Attendance
   File        : attendance.js
   Version     : 1.0.0

   Description :
   Attendance Processing Engine

   Sections :
   - State
   - Init
   - Normalize
   - Summary
   - Helper
===================================================== */

/* =====================================================
   IMPORT
===================================================== */

import {

    Rules

} from "./rules.js";


/* =====================================================
   STATE
===================================================== */

export const Attendance = {

    raw : [],

    data : [],

    summary : {

        total : 0,

        masuk : 0,

        cuti : 0,

        sakit : 0,

        liburNasional : 0,

        lembur : 0,

        absen : 0

    }

};


/* =====================================================
   INIT
===================================================== */

Attendance.init = function(

    raw

){

    Attendance.raw =

    raw ?? [];

normalize();

processAttendanceStatus();

processSummary();

};


/* =====================================================
   NORMALIZE
===================================================== */

function normalize(){

    Attendance.data =

        Attendance.raw

        .map(

            item => {

                const date =

                    parseDate(

                        item.date

                    );

               return {

    date :
        item.date ?? "",

    dateObject :
        date,

    status :
        normalizeStatus(
            item.status
        ),

    checkin :
        item.checkin ?? "",

    pulang :
        item.pulang ?? "",

    month :
        item.Month ?? "",

    year :
        Number(
            item.Year || 0
        ),

    shift :
        null,

    attendanceStatus :
        null,

    lateMinutes :
        0,

    earlyLeaveMinutes :
    0,

earlyLeaveHours :
    0,

earlyLeaveRule :
    null              

};

            }

        )

        .filter(

            item =>

                item.dateObject !== null

        )

        .sort(

            (

                a,

                b

            ) =>

                a.dateObject -

                b.dateObject

        );

}

/* =====================================================
   ATTENDANCE STATUS
===================================================== */

function processAttendanceStatus(){

    Attendance.data.forEach(

        item => {

            if(

                item.status !== "masuk"

            ){

                return;

            }


            const shift =

    findShift(

        item

    );


            if(

                !shift

            ){

                return;

            }


            item.shift =

                shift.nama;


            const result =

                calculateLate(

                    item,

                    shift

                );


            item.attendanceStatus =

                result.status;


            item.lateMinutes =

                result.lateMinutes;

           const earlyLeave =

    calculateEarlyLeave(

        item,

        shift

    );


item.earlyLeaveMinutes =

    earlyLeave.minutes;


item.earlyLeaveHours =

    earlyLeave.hours;


item.earlyLeaveRule =

    earlyLeave.rule;

console.log(

    "EARLY LEAVE:",

    item.date,

    "| Pulang:", item.pulang,

    "| Shift:", shift.nama,

    "| Pulang Shift:", shift.nilai_end,

    "| Izin:", earlyLeave.minutes,

    "menit",

    "| Jam:", earlyLeave.hours,

    "| Rule:", earlyLeave.rule

);           

        }

    );

}

/* =====================================================
   FIND SHIFT
===================================================== */

function findShift(

    item

){

    const rules =

        Rules.data.masuk ?? [];


    const shifts =

        rules.filter(

            rule =>

                rule.nama?.startsWith(

                    "masuk_shift"

                )

        );


    const checkinMinutes =

        timeToMinutes(

            item.checkin

        );


    if(

        checkinMinutes === null

    ){

        return null;

    }


    let bestShift =

        null;


    let smallestDistance =

        Infinity;


    shifts.forEach(

        shift => {

            const start =

                timeToMinutes(

                    shift.nilai_start

                );


            const end =

                timeToMinutes(

                    shift.nilai_end

                );


            if(

                start === null ||

                end === null

            ){

                return;

            }


            let distance =

                Math.abs(

                    checkinMinutes -

                    start

                );


            /*
               Shift melewati tengah malam.

               Contoh:

               Shift 3
               22:00 - 06:00

               Check-in:
               21:40

               Tetap dianggap dekat
               dengan jam mulai 22:00.
            */

            if(

                start > end

            ){

                const distanceFromPreviousDay =

                    Math.abs(

                        checkinMinutes +

                        1440 -

                        start

                    );


                const distanceFromNextDay =

                    Math.abs(

                        checkinMinutes -

                        start +

                        1440

                    );


                distance =

                    Math.min(

                        distance,

                        distanceFromPreviousDay,

                        distanceFromNextDay

                    );

            }


            if(

                distance <

                smallestDistance

            ){

                smallestDistance =

                    distance;


                bestShift =

                    shift;

            }

        }

    );


    return bestShift;

}


/* =====================================================
   TIME TO MINUTES
===================================================== */

function timeToMinutes(

    value

){

    if(

        !value

    ){

        return null;

    }


    const parts =

        String(

            value

        )

        .split(".")

        .map(Number);


    if(

        parts.length !== 3 ||

        parts.some(

            Number.isNaN

        )

    ){

        return null;

    }


    const [

        hour,

        minute,

        second

    ] = parts;


    if(

        hour < 0 ||

        hour > 23 ||

        minute < 0 ||

        minute > 59 ||

        second < 0 ||

        second > 59

    ){

        return null;

    }


    return (

        hour * 60

    )

    +

    minute

    +

    (

        second / 60

    );

       }

/* =====================================================
   CALCULATE LATE
===================================================== */

function calculateLate(

    item,

    shift

){

    /* =============================================
       CHECKIN
    ============================================= */

    const checkinMinutes =

        timeToMinutes(

            item.checkin

        );


    const shiftStartMinutes =

        timeToMinutes(

            shift.nilai_start

        );


    /*
       Jika waktu tidak valid,
       jangan dianggap telat.
    */

    if(

        checkinMinutes === null ||

        shiftStartMinutes === null

    ){

        return {

            status :

                "ontime",

            lateMinutes :

                0,

            lateHours :

                0,

            lateRule :

                null

        };

    }


    /* =============================================
       HITUNG KETERLAMBATAN
    ============================================= */

    let lateMinutes =

        checkinMinutes -

        shiftStartMinutes;


    /*
       Datang sebelum / tepat jam shift
       = ON TIME
    */

    if(

        lateMinutes <= 0

    ){

        return {

            status :

                "ontime",

            lateMinutes :

                0,

            lateHours :

                0,

            lateRule :

                null

        };

    }


    /*
       Detik dibulatkan ke atas.

       Contoh:

       06:20:01
       menjadi 21 menit
    */

    lateMinutes =

        Math.ceil(

            lateMinutes

        );


    /* =============================================
       AMBIL RULE TELAT
    ============================================= */

    const telatRules =

        Rules.data.telat ?? [];


    /* =============================================
       RULE MENIT
    ============================================= */

    const minuteRules =

        telatRules.filter(

            rule =>

                rule.waktu ===

                "menit"

        );


    /*
       Cari rule menit yang cocok
       berdasarkan start dan end.
    */

    const minuteRule =

        minuteRules.find(

            rule => {

                const start =

                    Number(

                        rule.nilai_start

                    );


                const end =

                    Number(

                        rule.nilai_end

                    );


                if(

                    Number.isNaN(

                        start

                    )

                    ||

                    Number.isNaN(

                        end

                    )

                ){

                    return false;

                }


                return (

                    lateMinutes >=

                    start

                )

                &&

                (

                    lateMinutes <=

                    end

                );

            }

        );


    /*
       Kalau cocok dengan rule menit,
       selesai di sini.
    */

    if(

        minuteRule

    ){

        return {

            status :

                "telat",

            lateMinutes :

                lateMinutes,

            lateHours :

                0,

            lateRule :

                minuteRule.nama

        };

    }


    /* =============================================
       RULE JAM
    ============================================= */

    const hourRule =

        telatRules.find(

            rule =>

                rule.waktu ===

                "jam"

        );


    /*
       Jika tidak ada rule jam,
       tetap tandai sebagai telat.
    */

    if(

        !hourRule

    ){

        return {

            status :

                "telat",

            lateMinutes :

                lateMinutes,

            lateHours :

                0,

            lateRule :

                null

        };

    }


    /* =============================================
       BATAS RULE MENIT
    ============================================= */

    const minuteEnds =

        minuteRules

        .map(

            rule =>

                Number(

                    rule.nilai_end

                )

        )

        .filter(

            value =>

                !Number.isNaN(

                    value

                )

        );


    const minuteLimit =

        minuteEnds.length

        ?

        Math.max(

            ...minuteEnds

        )

        :

        0;


    /* =============================================
       HITUNG JAM
    ============================================= */

    const minutesAfterLimit =

        lateMinutes -

        minuteLimit;


    /*
       Setiap 60 menit setelah
       batas rule menit = 1 jam.

       Contoh jika batas = 60:

       61–119  → 1 jam
       120–179 → 2 jam
       180–239 → 3 jam
    */

    const lateHours =

        Math.ceil(

            minutesAfterLimit /

            60

        );


    return {

        status :

            "telat",

        lateMinutes :

            lateMinutes,

        lateHours :

            lateHours,

        lateRule :

            hourRule.nama

    };

}

/* =====================================================
   CALCULATE EARLY LEAVE
===================================================== */

function calculateEarlyLeave(

    item,

    shift

){

    /*
       Untuk sementara kita hitung:

       jam selesai shift
       dikurangi
       jam pulang aktual

       Contoh:

       Shift 1
       06.00 - 15.00

       Pulang:
       14.00

       Hasil:
       60 menit
    */


    const shiftEnd =

        timeToMinutes(

            shift.nilai_end

        );


    const actualLeave =

        timeToMinutes(

            item.pulang

        );


    if(

        shiftEnd === null ||

        actualLeave === null

    ){

        return {

            minutes : 0,

            hours : 0,

            rule : null

        };

    }


    let earlyMinutes =

        shiftEnd -

        actualLeave;


    /*
       Shift melewati tengah malam.

       Contoh:

       Shift 3
       22.00 - 06.00

       Pulang:
       05.00

       Maka:

       06.00 - 05.00
       = 60 menit
    */

    if(

        earlyMinutes < 0

    ){

        earlyMinutes +=

            1440;

    }


    /*
       Pulang tepat waktu
       atau lebih lambat
    */

    if(

        earlyMinutes <= 0

    ){

        return {

            minutes : 0,

            hours : 0,

            rule : null

        };

    }


    const rules =

        Rules.data.izin ?? [];


    /*
       Cari rule izin yang berlaku
       untuk kondisi pulang.
    */

    const applicableRules =

        rules.filter(

            rule =>

                rule.kondisi ===

                "pulang"

        );


    let matchedRule =

        null;


    applicableRules.forEach(

        rule => {

            if(

                rule.waktu ===

                "menit"

            ){

                const start =

                    Number(

                        rule.nilai_start

                    );


                const end =

                    Number(

                        rule.nilai_end

                    );


                if(

                    earlyMinutes >= start &&

                    earlyMinutes <= end

                ){

                    matchedRule =

                        rule;

                }

            }

        }

    );


    /*
       Untuk rule waktu "jam",
       sementara kita simpan
       hasil jamnya.
    */

    let hours =

        0;


    if(

        earlyMinutes > 0

    ){

        hours =

            Math.floor(

                earlyMinutes / 60

            );

    }


    return {

        minutes :

            earlyMinutes,

        hours :

            hours,

        rule :

            matchedRule

            ?

            matchedRule.nama

            :

            null

    };

}


/* =====================================================
   SUMMARY
===================================================== */

function processSummary(){

    const summary = {

        total : 0,

        masuk : 0,

        cuti : 0,

        sakit : 0,

        liburNasional : 0,

        lembur : 0,

        absen : 0

    };


    Attendance.data.forEach(

        item => {

            summary.total++;


            switch(

                item.status

            ){

                case "masuk":

                    summary.masuk++;

                    break;


                case "cuti":

                    summary.cuti++;

                    break;


                case "sakit":

                    summary.sakit++;

                    break;


                case "libur_nasional":

                    summary.liburNasional++;

                    break;


                case "lembur":

                    summary.lembur++;

                    break;


                case "absen":

                    summary.absen++;

                    break;

            }

        }

    );


    Attendance.summary =

        summary;

}


/* =====================================================
   HELPER
===================================================== */

function parseDate(

    value

){

    if(

        !value

    ){

        return null;

    }


    const [

        year,

        month,

        day

    ] =

        value

        .split("-")

        .map(Number);


    if(

        !year ||

        !month ||

        !day

    ){

        return null;

    }


    return new Date(

        year,

        month - 1,

        day

    );

}


/* =====================================================
   NORMALIZE STATUS
===================================================== */

function normalizeStatus(

    status

){

    return String(

        status ?? ""

    )

    .trim()

    .toLowerCase();

}
