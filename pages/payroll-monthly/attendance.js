/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Attendance
   File        : attendance.js
   Version     : 2.1.0

   Description :
   Attendance Processing Engine

   Attendance Source :
   - status
   - shift
   - telat
   - izin_telat
   - izin_pulang
   - lembur_jam

   Principle :
   Status Attendance adalah sumber kebenaran.

   Sections :
   - Import
   - State
   - Init
   - Normalize
   - Process Attendance
   - Process Masuk
   - Process Lembur
   - Process Other Status
   - Find Rules
   - Summary
   - Helpers
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

        ontime : 0,

        telat : 0,

        lateMinutes : 0,

        izinTelatHours : 0,

        izinPulangHours : 0,

        cuti : 0,

        sakit : 0,

        libur : 0,

        lembur : 0,

        lemburHours : 0,

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


    processAttendance();


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

                    /* ---------------------------------
                       BASIC
                    --------------------------------- */

                    id :

                        item.id ?? "",


                    date :

                        item.date ?? "",


                    dateObject :

                        date,


                    status :

                        normalizeStatus(

                            item.status

                        ),


                    shift :

                        item.shift ?? "",


                    month :

                        item.Month ?? "",


                    year :

                        Number(

                            item.Year || 0

                        ),


                    /* ---------------------------------
                       ATTENDANCE INPUT
                    --------------------------------- */

                    lateMinutes :

                        toNumber(

                            item.telat

                        ),


                    izinTelatHours :

                        toNumber(

                            item.izin_telat

                        ),


                    izinPulangHours :

                        toNumber(

                            item.izin_pulang

                        ),


                    overtimeHours :

                        toNumber(

                            item.lembur_jam

                        ),


                    /* ---------------------------------
                       PROCESSED DATA
                    --------------------------------- */

                    attendanceStatus :

                        null,


                    overtimeDaily :

                        0,


                    lateRule :

                        null,


                    izinTelatRule :

                        null,


                    izinPulangRule :

                        null,


                    lemburRule :

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
   PROCESS ATTENDANCE
===================================================== */

function processAttendance(){

    Attendance.data.forEach(

        item => {

            /* -----------------------------------------
               MASUK
            ----------------------------------------- */

            if(

                item.status ===

                "masuk"

            ){

                processMasuk(

                    item

                );

                return;

            }


            /* -----------------------------------------
               LEMBUR HARIAN
            ----------------------------------------- */

            if(

                item.status ===

                "lembur"

            ){

                processLembur(

                    item

                );

                return;

            }


            /* -----------------------------------------
               STATUS LAIN
            ----------------------------------------- */

            processOtherStatus(

                item

            );

        }

    );

}


/* =====================================================
   PROCESS MASUK
===================================================== */

function processMasuk(

    item

){

    /* =============================================
       ATTENDANCE STATUS
    ============================================= */

    if(

        item.lateMinutes >

        0

    ){

        item.attendanceStatus =

            "telat";

    }

    else {

        item.attendanceStatus =

            "ontime";

    }


    /* =============================================
       TELAT
    ============================================= */

    if(

        item.lateMinutes >

        0

    ){

        item.lateRule =

            findRule(

                "telat"

            );

    }


    /* =============================================
       IZIN TELAT
    ============================================= */

    if(

        item.izinTelatHours >

        0

    ){

        item.izinTelatRule =

            findRule(

                "izin_telat"

            );

    }


    /* =============================================
       IZIN PULANG
    ============================================= */

    if(

        item.izinPulangHours >

        0

    ){

        item.izinPulangRule =

            findRule(

                "izin_pulang"

            );

    }


    /* =============================================
       LEMBUR JAM
    ============================================= */

    if(

        item.overtimeHours >

        0

    ){

        item.lemburRule =

            findRule(

                "lembur_jam"

            );

    }

}


/* =====================================================
   PROCESS LEMBUR
===================================================== */

function processLembur(

    item

){

    /*
       Status "lembur" berarti
       1 hari lembur harian.

       Tidak peduli apakah hari tersebut:

       - Sabtu
       - Minggu
       - Libur nasional

       Status Attendance adalah
       sumber kebenaran.
    */

    item.overtimeDaily =

        1;


    item.attendanceStatus =

        "lembur";


    /* =============================================
       RULE LEMBUR HARIAN
    ============================================= */

    item.lemburRule =

        findRule(

            "lembur_harian"

        );


    /*
       Jika rule lembur_harian
       belum tersedia, tetap coba
       rule lembur_jam jika ada
       untuk data lembur jam.
    */


    /* =============================================
       LEMBUR JAM
    ============================================= */

    if(

        item.overtimeHours >

        0

    ){

        item.lemburRule =

            findRule(

                "lembur_jam"

            );

    }


    /* =============================================
       IZIN TELAT
    ============================================= */

    if(

        item.izinTelatHours >

        0

    ){

        item.izinTelatRule =

            findRule(

                "izin_telat"

            );

    }


    /* =============================================
       IZIN PULANG
    ============================================= */

    if(

        item.izinPulangHours >

        0

    ){

        item.izinPulangRule =

            findRule(

                "izin_pulang"

            );

    }

}


/* =====================================================
   PROCESS OTHER STATUS
===================================================== */

function processOtherStatus(

    item

){

    /*
       Status berikut tidak membutuhkan
       perhitungan jam:

       - cuti
       - sakit
       - libur
       - absen

       Status langsung diteruskan.
    */

    item.attendanceStatus =

        item.status;

}


/* =====================================================
   FIND RULE
===================================================== */

function findRule(

    name

){

    /* =============================================
       TELAT
    ============================================= */

    if(

        name ===

        "telat"

    ){

        const rules =

            Rules.data.telat ?? [];


        const rule =

            rules.find(

                item =>

                    item.nama ===

                    "telat"

            );


        return rule

            ?

            rule.nama

            :

            null;

    }


    /* =============================================
       IZIN
    ============================================= */

    if(

        name ===

        "izin_telat"

        ||

        name ===

        "izin_pulang"

    ){

        const rules =

            Rules.data.izin ?? [];


        const rule =

            rules.find(

                item =>

                    item.nama ===

                    name

            );


        return rule

            ?

            rule.nama

            :

            null;

    }


    /* =============================================
       LEMBUR
    ============================================= */

    if(

        name ===

        "lembur_harian"

        ||

        name ===

        "lembur_jam"

    ){

        const rules =

            Rules.data.lembur ?? [];


        const rule =

            rules.find(

                item =>

                    item.nama ===

                    name

            );


        return rule

            ?

            rule.nama

            :

            null;

    }


    return null;

}


/* =====================================================
   SUMMARY
===================================================== */

function processSummary(){

    const summary = {

        total : 0,

        masuk : 0,

        ontime : 0,

        telat : 0,

        lateMinutes : 0,

        izinTelatHours : 0,

        izinPulangHours : 0,

        cuti : 0,

        sakit : 0,

        libur : 0,

        lembur : 0,

        lemburHours : 0,

        absen : 0

    };


    Attendance.data.forEach(

        item => {

            summary.total++;


            /* =====================================
               STATUS
            ===================================== */

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


                case "libur":

                    summary.libur++;

                    break;


                case "lembur":

                    summary.lembur++;

                    break;


                case "absen":

                    summary.absen++;

                    break;

            }


            /* =====================================
               ONTIME
            ===================================== */

            if(

                item.attendanceStatus ===

                "ontime"

            ){

                summary.ontime++;

            }


            /* =====================================
               TELAT
            ===================================== */

            if(

                item.attendanceStatus ===

                "telat"

            ){

                summary.telat++;

            }


            /* =====================================
               TOTAL MENIT TELAT
            ===================================== */

            summary.lateMinutes +=

                item.lateMinutes;


            /* =====================================
               IZIN TELAT
            ===================================== */

            summary.izinTelatHours +=

                item.izinTelatHours;


            /* =====================================
               IZIN PULANG
            ===================================== */

            summary.izinPulangHours +=

                item.izinPulangHours;


            /* =====================================
               LEMBUR JAM
            ===================================== */

            summary.lemburHours +=

                item.overtimeHours;

        }

    );


    Attendance.summary =

        summary;

}


/* =====================================================
   HELPER : NUMBER
===================================================== */

function toNumber(

    value

){

    if(

        value ===

        null

        ||

        value ===

        undefined

        ||

        value ===

        ""

    ){

        return 0;

    }


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


/* =====================================================
   HELPER : DATE
===================================================== */
function parseDate(

    value

){

    if(

        !value

    ){

        return null;

    }


    /* =============================================
       NORMALIZE API DATE

       API sekarang dapat mengirim:

       2026-08-22T00:00:00.000Z

       Ambil hanya:

       2026-08-22

       supaya tidak terkena timezone.
    ============================================= */

    const dateString =

        String(

            value

        )

        .slice(

            0,

            10

        );


    const [

        year,

        month,

        day

    ] =

        dateString

            .split("-")

            .map(Number);


    if(

        !year ||

        !month ||

        !day

    ){

        return null;

    }


    const date =

        new Date(

            year,

            month - 1,

            day

        );


    if(

        Number.isNaN(

            date.getTime()

        )

    ){

        return null;

    }


    return date;

}
      

/* =====================================================
   HELPER : STATUS
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
