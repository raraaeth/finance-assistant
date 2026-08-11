/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Attendance
   File        : attendance.js
   Version     : 2.0.0

   Description :
   Attendance Processing Engine

   Sections :
   - State
   - Init
   - Normalize
   - Process Attendance
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


                const status =

                    normalizeStatus(

                        item.status

                    );


                const lateMinutes =

                    toNumber(

                        item.telat

                    );


                const izinTelatHours =

                    toNumber(

                        item.izin_telat

                    );


                const izinPulangHours =

                    toNumber(

                        item.izin_pulang

                    );


                const overtimeHours =

                    toNumber(

                        item.lembur_jam

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


                        status,


                    shift :

                        item.shift ?? "",


                    month :

                        item.Month ?? "",


                    year :

                        Number(

                            item.Year || 0

                        ),


                    /* ---------------------------------
                       INPUT ATTENDANCE
                    --------------------------------- */

                    lateMinutes :

                        lateMinutes,


                    izinTelatHours :

                        izinTelatHours,


                    izinPulangHours :

                        izinPulangHours,


                    overtimeHours :

                        overtimeHours,


                    /* ---------------------------------
                       PROCESSED ATTENDANCE
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
               STATUS MASUK
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
               STATUS LEMBUR
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

    /*
       Tidak ada check-in,
       check-out atau shift calculation.

       Semua nilai sudah diberikan
       langsung oleh Attendance Sheet.
    */


    /* ---------------------------------------------
       ATTENDANCE STATUS
    --------------------------------------------- */

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


    /* ---------------------------------------------
       RULE TELAT
    --------------------------------------------- */

    item.lateRule =

        findLateRule(

            item.lateMinutes

        );


    /* ---------------------------------------------
       RULE IZIN TELAT
    --------------------------------------------- */

    item.izinTelatRule =

        findIzinRule(

            "izin_telat"

        );


    /* ---------------------------------------------
       RULE IZIN PULANG
    --------------------------------------------- */

    item.izinPulangRule =

        findIzinRule(

            "izin_pulang"

        );


    /* ---------------------------------------------
       RULE LEMBUR JAM
    --------------------------------------------- */

    if(

        item.overtimeHours >

        0

    ){

        item.lemburRule =

            findOvertimeRule();

    }

}


/* =====================================================
   PROCESS LEMBUR
===================================================== */

function processLembur(

    item

){

    /*
       Status lembur berarti:

       1 hari lembur harian.

       Tidak peduli apakah:

       - Sabtu
       - Minggu
       - Libur nasional

       Status Attendance sudah
       menjadi sumber kebenaran.
    */

    item.overtimeDaily =

        1;


    /*
       Lembur tetap dapat mempunyai
       tambahan lembur per jam.
    */

    if(

        item.overtimeHours >

        0

    ){

        item.lemburRule =

            findOvertimeRule();

    }


    /*
       Lembur tetap dapat mempunyai
       izin telat.
    */

    if(

        item.izinTelatHours >

        0

    ){

        item.izinTelatRule =

            findIzinRule(

                "izin_telat"

            );

    }


    item.attendanceStatus =

        "lembur";

}


/* =====================================================
   PROCESS OTHER STATUS
===================================================== */

function processOtherStatus(

    item

){

    /*
       Cuti, sakit, libur,
       dan absen tidak membutuhkan
       proses attendance tambahan.
    */

    item.attendanceStatus =

        item.status;

}


/* =====================================================
   FIND LATE RULE
===================================================== */

function findLateRule(

    minutes

){

    if(

        minutes <= 0

    ){

        return null;

    }


    const rules =

        Rules.data.telat ?? [];


    const minuteRules =

        rules.filter(

            rule =>

                rule.waktu ===

                "menit"

        );


    /*
       Cari rule yang mencakup
       jumlah menit keterlambatan.
    */

    const matchedRule =

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

                    minutes >=

                    start

                )

                &&

                (

                    minutes <=

                    end

                );

            }

        );


    return matchedRule

        ?

        matchedRule.nama

        :

        null;

}


/* =====================================================
   FIND IZIN RULE
===================================================== */

function findIzinRule(

    name

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


/* =====================================================
   FIND OVERTIME RULE
===================================================== */

function findOvertimeRule(){

    const rules =

        Rules.data.lembur ?? [];


    const rule =

        rules.find(

            item =>

                item.nama ===

                "lembur_jam"

        );


    return rule

        ?

        rule.nama

        :

        null;

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


            /* -------------------------------------
               STATUS
            ------------------------------------- */

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


            /* -------------------------------------
               ONTIME / TELAT
            ------------------------------------- */

            if(

                item.attendanceStatus ===

                "ontime"

            ){

                summary.ontime++;

            }


            if(

                item.attendanceStatus ===

                "telat"

            ){

                summary.telat++;

            }


            /* -------------------------------------
               TELAT MENIT
            ------------------------------------- */

            summary.lateMinutes +=

                item.lateMinutes;


            /* -------------------------------------
               IZIN TELAT
            ------------------------------------- */

            summary.izinTelatHours +=

                item.izinTelatHours;


            /* -------------------------------------
               IZIN PULANG
            ------------------------------------- */

            summary.izinPulangHours +=

                item.izinPulangHours;


            /* -------------------------------------
               LEMBUR JAM
            ------------------------------------- */

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


    const [

        year,

        month,

        day

    ] =

        String(

            value

        )

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
