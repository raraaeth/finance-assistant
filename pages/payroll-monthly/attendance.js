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
        0

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
