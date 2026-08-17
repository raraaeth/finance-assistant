/* =====================================================
   Finance Assistant
   Module      : Financial
   File        : process.js
   Version     : 1.1.0

   Description :
   Financial Processing Engine

   Flow :

   Raw Transactions
          ↓
   Normalize
          ↓
   Apply Rules
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
           NORMALIZE + CLASSIFY
        ============================================= */

        Process.data =

            Process.raw

                .map(

                    item =>

                        normalizeTransaction(

                            item,

                            Process.rules

                        )

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

    item,

    rules = []

){

    if(

        !item

    ){

        return null;

    }


    /* =============================================
       DATE
    ============================================= */

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


    /* =============================================
       BASIC DATA
    ============================================= */

    const jenis =

        normalizeText(

            item.jenis

        );


    const type =

        normalizeText(

            item.type

        );


    const nominal =

        toNumber(

            item.nominal

        );


    if(

        !jenis ||

        !type

    ){

        return null;

    }


    /* =============================================
       RULE MATCHING
    ============================================= */

    const matchedRules =

        findRules(

            jenis,

            type,

            rules

        );


    /* =============================================
       CASHFLOW CATEGORY
       
       Ditentukan dari rule_pemasukan /
       rule_pengeluaran.
    ============================================= */

    const category =

        getCashflowCategory(

            matchedRules

        );


    /* =============================================
       ENGINE FLAGS
       
       Satu transaksi boleh mempunyai
       lebih dari satu fungsi.
    ============================================= */

    const debtAction =

        getDebtAction(

            matchedRules,

            jenis,

            type

        );


    const savingAction =

        getSavingAction(

            matchedRules,

            jenis,

            type

        );


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


        debtAction :


            debtAction,


        savingAction :


            savingAction,


        nama :


            buildActivityName(

                type

            )

    };

}


/* =====================================================
   FIND RULES
===================================================== */

function findRules(

    jenis,

    type,

    rules

){

    if(

        !Array.isArray(

            rules

        )

    ){

        return [];

    }


    return rules.filter(

        rule => {


            const ruleType =

                splitRuleValues(

                    rule?.type

                );


            const activity =

                splitRuleValues(

                    rule?.activity

                );


            const typeMatch =

                ruleType.includes(

                    jenis

                );


            const activityMatch =

                activity.includes(

                    type

                );


            return (

                typeMatch

                &&

                activityMatch

            );

        }

    );

}


/* =====================================================
   CASHFLOW CATEGORY
===================================================== */

function getCashflowCategory(

    matchedRules

){

    const incomeRule =

        matchedRules.find(

            rule =>

                normalizeText(

                    rule?.rules

                )

                ===

                "rule_pemasukan"

        );


    if(

        incomeRule

    ){

        return "income";

    }


    const expenseRule =

        matchedRules.find(

            rule =>

                normalizeText(

                    rule?.rules

                )

                ===

                "rule_pengeluaran"

        );


    if(

        expenseRule

    ){

        return "expense";

    }


    return null;

}


/* =====================================================
   DEBT ACTION
===================================================== */

function getDebtAction(

    matchedRules,

    jenis,

    type

){

    const debtRule =

        matchedRules.find(

            rule =>

                normalizeText(

                    rule?.rules

                )

                ===

                "rule_hutang"

        );


    if(

        !debtRule

    ){

        return null;

    }


    if(

        jenis === "hutang"

        &&

        type === "hutang_piutang"

    ){

        return "borrow";

    }


    if(

        jenis === "bayar"

        &&

        type === "hutang_piutang"

    ){

        return "payment";

    }


    return null;

}


/* =====================================================
   SAVING ACTION
===================================================== */

function getSavingAction(

    matchedRules,

    jenis,

    type

){

    const savingRule =

        matchedRules.find(

            rule =>

                normalizeText(

                    rule?.rules

                )

                ===

                "rule_tabungan"

        );


    if(

        !savingRule

    ){

        return null;

    }


    if(

        jenis === "nabung"

    ){

        return "deposit";

    }


    if(

        jenis === "tarik"

    ){

        return "withdraw";

    }


    return null;

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


            else if(

                item.category ===

                "expense"

            ){

                expense +=

                    item.nominal;

            }

        }

    );


    return {

        income :


            income,


        expense :


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
   SPLIT RULE VALUES
===================================================== */

function splitRuleValues(

    value

){

    if(

        !value

    ){

        return [];

    }


    return String(

        value

    )

        .split(",")

        .map(

            value =>

                normalizeText(

                    value

                )

        )

        .filter(

            Boolean

        );

}


/* =====================================================
   NORMALIZE TEXT
===================================================== */

function normalizeText(

    value

){

    return String(

        value ?? ""

    )

        .trim()

        .toLowerCase();

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

        .map(

            Number

        );


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
