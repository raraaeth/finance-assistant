/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Period
   File        : period.js
   Version     : 2.0.0

   Description :
   Payroll Period Engine

   Sections :
   - State
   - Init
   - Find Period Rule
   - Current Period
   - Helper
===================================================== */


/* =====================================================
   STATE
===================================================== */

export const Period = {

    raw : [],

    data : {

        name : "",

        start : null,

        end : null,

        startText : "",

        endText : ""

    }

};


/* =====================================================
   INIT
===================================================== */

Period.init = function(

    rules

){

    Period.raw =

        rules ?? [];

    processPeriod();


};


/* =====================================================
   PROCESS PERIOD
===================================================== */

function processPeriod(){

    const rule =

        Period.raw.find(

            item =>

                item.nama ===

                    "periode_gaji"

        );


    if(

        !rule

    ){

        Period.data = {

            name : "",

            start : null,

            end : null,

            startText : "",

            endText : ""

        };

        return;

    }


    const start =

        parseDate(

            rule.nilai_start

        );


    const end =

        parseDate(

            rule.nilai_end

        );


    Period.data = {

        name :

            rule.nama,

        start,

        end,

        startText :

            rule.nilai_start,

        endText :

            rule.nilai_end

    };

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
