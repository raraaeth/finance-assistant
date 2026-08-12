/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Period
   File        : period.js
   Version     : 3.0.0

   Description :
   Payroll Period Engine

   Sections :
   - State
   - Init
   - Find Period Rule
   - Process Current Period
   - Process Full Period
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

    },

    current : {

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

        resetPeriod();

        return;

    }


    /* =============================================
       AMBIL POLA PERIODE DARI RULE
       
       Contoh:
       26 Januari - 25 Februari

       Artinya:
       Mulai tanggal 26
       Berakhir tanggal 25
    ============================================= */

    const templateStart =

        parseDate(

            rule.nilai_start

        );


    const templateEnd =

        parseDate(

            rule.nilai_end

        );


    if(

        !templateStart ||

        !templateEnd

    ){

        resetPeriod();

        return;

    }


    const startDay =

        templateStart.getDate();


    const endDay =

        templateEnd.getDate();


    const today =

        new Date();


    today.setHours(

        0,

        0,

        0,

        0

    );


    const year =

        today.getFullYear();


    const month =

        today.getMonth();


    /* =============================================
       TENTUKAN PERIODE BERJALAN
    ============================================= */

    let currentStart;

    let currentEnd;


    if(

        today.getDate() >=

        startDay

    ){

        currentStart =

            new Date(

                year,

                month,

                startDay

            );


        currentEnd =

            new Date(

                year,

                month + 1,

                endDay

            );

    }

    else {

        currentStart =

            new Date(

                year,

                month - 1,

                startDay

            );


        currentEnd =

            new Date(

                year,

                month,

                endDay

            );

    }


    /* =============================================
       SIMPAN PERIODE BERJALAN
    ============================================= */

    Period.current = {

        start :

            currentStart,

        end :

            currentEnd,

        startText :

            formatDateText(

                currentStart

            ),

        endText :

            formatDateText(

                currentEnd

            )

    };


    /* =============================================
       PERIODE GAJI PENUH TERAKHIR
       
       Jika periode berjalan sudah selesai,
       maka periode berjalan adalah periode penuh.

       Jika belum selesai,
       ambil satu periode sebelumnya.
    ============================================= */

    let fullStart;

    let fullEnd;


    if(

        today >

        currentEnd

    ){

        fullStart =

            currentStart;


        fullEnd =

            currentEnd;

    }

    else {

        fullStart =

            new Date(

                currentStart.getFullYear(),

                currentStart.getMonth() - 1,

                startDay

            );


        fullEnd =

            new Date(

                currentStart.getFullYear(),

                currentStart.getMonth(),

                endDay

            );

    }


    /* =============================================
       SIMPAN PERIODE GAJI PENUH
    ============================================= */

    Period.data = {

        name :

            rule.nama,

        start :

            fullStart,

        end :

            fullEnd,

        startText :

            formatDateText(

                fullStart

            ),

        endText :

            formatDateText(

                fullEnd

            )

    };

}


/* =====================================================
   RESET
===================================================== */

function resetPeriod(){

    Period.data = {

        name : "",

        start : null,

        end : null,

        startText : "",

        endText : ""

    };


    Period.current = {

        start : null,

        end : null,

        startText : "",

        endText : ""

    };

}


/* =====================================================
   HELPER : PARSE DATE
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


    date.setHours(

        0,

        0,

        0,

        0

    );


    return date;

}


/* =====================================================
   HELPER : FORMAT DATE
===================================================== */

function formatDateText(

    date

){

    if(

        !date

    ){

        return "";

    }


    const year =

        date.getFullYear();


    const month =

        String(

            date.getMonth() + 1

        )

        .padStart(

            2,

            "0"

        );


    const day =

        String(

            date.getDate()

        )

        .padStart(

            2,

            "0"

        );


    return (

        `${year}-${month}-${day}`

    );

}
