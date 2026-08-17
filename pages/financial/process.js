/* =====================================================
   Finance Assistant
   Module      : Financial
   File        : process.js
   Version     : 1.0.0

   Description :
   Financial Processing Engine

   Flow :

   Raw Transactions
          ↓
   Normalize
          ↓
   Classify
          ↓
   Debt Engine
          ↓
   Saving Engine
          ↓
   Financial Summary
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Debt

} from "./debt.js";


import {

    Saving

} from "./saving.js";


/* =====================================================
   PROCESS
===================================================== */

export const Process = {


    /* =================================================
       STATE
    ================================================= */

    raw : [],

    rules : [],

    data : [],

    debt : null,

    saving : null,

    summary : {

        income : 0,

        expense : 0,

        balance : 0

    },


    /* =================================================
       INIT
    ================================================= */

    init : function(

        raw = [],

        rules = []

    ){

        Process.raw =

            Array.isArray(

                raw

            )

                ?

                raw

                :

                [];


        Process.rules =

            Array.isArray(

                rules

            )

                ?

                rules

                :

                [];


        /* =============================================
           NORMALIZE
        ============================================= */

        Process.data =

            Process.raw

                .map(

                    normalizeTransaction

                )

                .filter(

                    Boolean

                );


        /* =============================================
           DEBT
        ============================================= */

        Process.debt =

            Debt.init(

                Process.data

            );


        /* =============================================
           SAVING
        ============================================= */

        Process.saving =

            Saving.init(

                Process.data

            );


        /* =============================================
           FINANCIAL SUMMARY
        ============================================= */

        Process.summary =

            calculateSummary(

                Process.data

            );


        return Process;

    }

};


/* =====================================================
   NORMALIZE TRANSACTION
===================================================== */

function normalizeTransaction(

    item

){

    if(

        !item

    ){

        return null;

    }


    const date =

        parseLocalDate(

            item.Date ??

            item.date ??

            item.tanggal

        );


    if(

        !date

    ){

        return null;

    }


    const jenis =

        String(

            item.jenis ?? ""

        )

        .trim()

        .toLowerCase();


    const type =

        String(

            item.type ?? ""

        )

        .trim()

        .toLowerCase();


    const nominal =

        toNumber(

            item.nominal

        );


    if(

        !jenis

    ){

        return null;

    }


    let category =

        null;


    /* =============================================
       INCOME
       
       masuk
       hutang
       tarik
    ============================================= */

    if(

        jenis === "masuk"

        ||

        jenis === "hutang"

        ||

        jenis === "tarik"

    ){

        category =

            "income";

    }


    /* =============================================
       EXPENSE
       
       keluar
       bayar
       nabung
    ============================================= */

    else if(

        jenis === "keluar"

        ||

        jenis === "bayar"

        ||

        jenis === "nabung"

    ){

        category =

            "expense";

    }


    return {

        id :

            item.id ?? "",


        date :

            formatDateKey(

                date

            ),


        dateObject :

            date,


        jenis :


            jenis,


        type :

            type,


        nominal :


            nominal,


        keterangan :


            item.keterangan ?? "",


        category :


            category,


        nama :


            buildActivityName(

                type

            )

    };

}


/* =====================================================
   FINANCIAL SUMMARY
===================================================== */

function calculateSummary(

    data

){

    let income = 0;

    let expense = 0;


    data.forEach(

        item => {

            if(

                item.category ===

                "income"

            ){

                income +=

                    item.nominal;

            }


            if(

                item.category ===

                "expense"

            ){

                expense +=

                    item.nominal;

            }

        }

    );


    return {

        income,

        expense,

        balance :

            income -

            expense

    };

}


/* =====================================================
   ACTIVITY NAME
===================================================== */

function buildActivityName(

    value

){

    if(

        !value

    ){

        return "-";

    }


    return String(

        value

    )

    .replace(

        /_/g,

        " "

    )

    .replace(

        /\b\w/g,

        letter =>

            letter.toUpperCase()

    );

}


/* =====================================================
   DATE
===================================================== */

function parseLocalDate(

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

        .split("-")

        .map(Number);


    if(

        parts.length !== 3

    ){

        return null;

    }


    const [

        year,

        month,

        day

    ] = parts;


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
   DATE KEY
===================================================== */

function formatDateKey(

    date

){

    return [

        date.getFullYear(),

        String(

            date.getMonth() + 1

        ).padStart(

            2,

            "0"

        ),

        String(

            date.getDate()

        ).padStart(

            2,

            "0"

        )

    ].join("-");

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
