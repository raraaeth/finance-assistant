/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Insight
   File        : insight.js
   Version     : 1.0.0

   Description :
   Payroll Monthly Insight Engine

   Sections :
   - Import
   - State
   - Init
   - Motivation
   - Period Insight
   - Helper
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Process

} from "./process.js";


/* =====================================================
   STATE
===================================================== */

export const Insight = {

    motivation :

        "💪 Tetap semangat dan jaga konsistensimu!",

    period : {

        start : null,

        end : null,

        label : "",

        text : ""

    }

};


/* =====================================================
   INIT
===================================================== */

Insight.init = function(){

    processPeriodInsight();

};


/* =====================================================
   MOTIVATION
===================================================== */

Insight.getMotivation = function(){

    return Insight.motivation;

};


/* =====================================================
   PERIOD INSIGHT
===================================================== */

function processPeriodInsight(){

    const today =

        new Date();


    const year =

        today.getFullYear();


    const month =

        today.getMonth();


    const day =

        today.getDate();


    /* =============================================
       TENTUKAN PERIODE
    ============================================= */

    let startDay;

    let endDay;


    if(

        day <= 10

    ){

        startDay = 1;

        endDay = 10;

    }

    else if(

        day <= 20

    ){

        startDay = 11;

        endDay = 20;

    }

    else {

        startDay = 21;

        endDay =

            new Date(

                year,

                month + 1,

                0

            ).getDate();

    }


    const start =

        new Date(

            year,

            month,

            startDay

        );


    const end =

        new Date(

            year,

            month,

            endDay

        );


    Insight.period.start =

        start;


    Insight.period.end =

        end;


    Insight.period.label =

        `${startDay}-${endDay}`;


    /* =============================================
       AMBIL ATTENDANCE
    ============================================= */

    const attendance =

        Process.attendance?.data ?? [];


    const data =

        attendance.filter(

            item => {

                if(

                    !item.dateObject

                ){

                    return false;

                }


                const date =

                    item.dateObject;


                return (

                    date >= start &&

                    date <= end

                );

            }

        );


    /* =============================================
       HITUNG
    ============================================= */

    const summary = {

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


    data.forEach(

        item => {

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


            summary.lateMinutes +=

                Number(

                    item.lateMinutes || 0

                );


            summary.izinTelatHours +=

                Number(

                    item.izinTelatHours || 0

                );


            summary.izinPulangHours +=

                Number(

                    item.izinPulangHours || 0

                );


            summary.lemburHours +=

                Number(

                    item.overtimeHours || 0

                );

        }

    );


    /* =============================================
       BUAT KALIMAT
    ============================================= */

    Insight.period.text =

        buildInsight(

            summary

        );


    Insight.period.summary =

        summary;

}


/* =====================================================
   BUILD INSIGHT
===================================================== */

function buildInsight(

    summary

){

    const parts = [];


    /* =============================================
       MASUK
    ============================================= */

    if(

        summary.masuk > 0

    ){

        let text =

            `Kamu sudah masuk ${summary.masuk} kali`;


        if(

            summary.ontime > 0

        ){

            text +=

                `, dengan ${summary.ontime} kali ontime`;

        }


        if(

            summary.telat > 0

        ){

            text +=

                ` dan ${summary.telat} kali telat`;

        }


        parts.push(

            text

        );

    }


    /* =============================================
       TELAT
    ============================================= */

    if(

        summary.lateMinutes > 0

    ){

        parts.push(

            `total keterlambatan ${summary.lateMinutes} menit`

        );

    }


    /* =============================================
       IZIN TELAT
    ============================================= */

    if(

        summary.izinTelatHours > 0

    ){

        parts.push(

            `izin telat ${summary.izinTelatHours} jam`

        );

    }


    /* =============================================
       IZIN PULANG
    ============================================= */

    if(

        summary.izinPulangHours > 0

    ){

        parts.push(

            `izin pulang ${summary.izinPulangHours} jam`

        );

    }


    /* =============================================
       CUTI
    ============================================= */

    if(

        summary.cuti > 0

    ){

        parts.push(

            `cuti ${summary.cuti} kali`

        );

    }


    /* =============================================
       SAKIT
    ============================================= */

    if(

        summary.sakit > 0

    ){

        parts.push(

            `sakit ${summary.sakit} kali`

        );

    }


    /* =============================================
       LIBUR
    ============================================= */

    if(

        summary.libur > 0

    ){

        parts.push(

            `libur ${summary.libur} kali`

        );

    }


    /* =============================================
       LEMBUR
    ============================================= */

    if(

        summary.lembur > 0

    ){

        let text =

            `lembur ${summary.lembur} kali`;


        if(

            summary.lemburHours > 0

        ){

            text +=

                ` dengan total ${summary.lemburHours} jam`;

        }


        parts.push(

            text

        );

    }


    /* =============================================
       ABSEN
    ============================================= */

    if(

        summary.absen > 0

    ){

        parts.push(

            `absen ${summary.absen} kali`

        );

    }


    /* =============================================
       TIDAK ADA DATA
    ============================================= */

    if(

        parts.length === 0

    ){

        return (

            "Belum ada aktivitas attendance " +

            "pada periode ini."

        );

    }


    /* =============================================
       GABUNGKAN
    ============================================= */

    const sentence =

        parts.join(

            ", "

        );


    return (

        `Pada periode ${Insight.period.label}, ` +

        sentence +

        "."

    );

}


/* =====================================================
   HELPER : GET PERIOD INSIGHT
===================================================== */

Insight.getPeriodInsight = function(){

    return {

        ...Insight.period

    };

};
