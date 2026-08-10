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

                        )

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
