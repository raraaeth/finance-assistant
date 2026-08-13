/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Process
   File        : process.js
   Version     : 1.0.0

   Description :
   Payroll Daily Data Processor

   Flow :
   - Receive raw payroll data
   - Receive payroll rules
   - Determine salary period
   - Match work rule
   - Calculate work income
   - Produce processed data

   Salary Period :
   - 28 → 27
   - Tidak menggunakan periode_start / periode_end
     sebagai periode gaji
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Periode

} from "./periode.js";


import {

    Rule

} from "./rule.js";


import {

    Calculation

} from "./calculation.js";


/* =====================================================
   PROCESS
===================================================== */

export const Process = {


    /* =================================================
       RAW DATA
    ================================================= */

    raw : [],


    /* =================================================
       RULE DATA
    ================================================= */

    rules : [],


    /* =================================================
       PROCESSED DATA
    ================================================= */

    data : [],


    /* =================================================
       CURRENT SALARY PERIOD
    ================================================= */

    period : null,


    /* =================================================
       INIT
    ================================================= */

    init(

        raw = [],

        rules = []

    ){

        /* ---------------------------------------------
           RESET RAW
        --------------------------------------------- */

        this.raw =

            Array.isArray(

                raw

            )

                ?

                raw

                :

                [];


        /* ---------------------------------------------
           RESET RULES
        --------------------------------------------- */

        this.rules =

            Array.isArray(

                rules

            )

                ?

                rules

                :

                [];


        /* ---------------------------------------------
           RESET DATA
        --------------------------------------------- */

        this.data = [];


        /* ---------------------------------------------
           CURRENT SALARY PERIOD
        --------------------------------------------- */

        this.period =

            Periode.current();


        /* ---------------------------------------------
           PROCESS
        --------------------------------------------- */

        this.process();


        return this.data;

    },


    /* =================================================
       PROCESS DATA
    ================================================= */

    process(){

        this.data =

            this.raw

                .filter(

                    item =>

                        item &&

                        this.isMasuk(

                            item

                        )

                )

                .map(

                    item =>

                        this.processItem(

                            item

                        )

                )

                .filter(

                    item =>

                        item !== null

                );

    },


    /* =================================================
       PROCESS ITEM
    ================================================= */

    processItem(

        item

    ){

        /* ---------------------------------------------
           DATE
        --------------------------------------------- */

        const date =

            this.getDate(

                item

            );


        if(

            !date

        ){

            return null;

        }


        /* ---------------------------------------------
           FIND WORK RULE
        --------------------------------------------- */

        const rule =

            Rule.find(

                item,

                this.rules

            );


        /* ---------------------------------------------
           CALCULATION
        --------------------------------------------- */

        const calculation =

            Calculation.calculate(

                item,

                rule

            );


        /* ---------------------------------------------
           RESULT
        --------------------------------------------- */

        return {

            ...item,


            /* -----------------------------------------
               DATE
            ----------------------------------------- */

            dateObject :

                date,


            /* -----------------------------------------
               PERIOD STATUS
            ----------------------------------------- */

            inSalaryPeriod :

                Periode.contains(

                    date,

                    this.period

                ),


            /* -----------------------------------------
               QTY
            ----------------------------------------- */

            qty :

                calculation.qty ?? 0,


            /* -----------------------------------------
               NOMINAL
            ----------------------------------------- */

            nominal :

                calculation.nominal ?? 0,


            /* -----------------------------------------
               TOTAL
            ----------------------------------------- */

            total :

                calculation.total ?? 0,


            /* -----------------------------------------
               RULE
            ----------------------------------------- */

            ruleFound :

                Boolean(

                    rule

                ),


            ruleType :

                rule?.type_rule ?? null,


            ruleName :

                rule?.nama ?? null,


            ruleLevel :

                rule?.matchLevel ?? null,


            rule :

                rule || null

        };

    },


    /* =================================================
       GET CURRENT PERIOD
    ================================================= */

    getCurrentPeriod(){

        return this.period

            ?

            {

                start :

                    new Date(

                        this.period.start

                    ),

                end :

                    new Date(

                        this.period.end

                    )

            }

            :

            null;

    },


    /* =================================================
       GET PERIOD DATA
    ================================================= */

    getPeriodData(

        period = this.period

    ){

        if(

            !period

        ){

            return [];

        }


        return this.data.filter(

            item =>

                Periode.contains(

                    item.dateObject,

                    period

                )

        );

    },


    /* =================================================
       GET ALL WORK INCOME
    ================================================= */

    getWorkIncome(

        period = this.period

    ){

        return this.getPeriodData(

            period

        )

        .reduce(

            (

                total,

                item

            ) =>

                total +

                this.toNumber(

                    item.total

                ),

            0

        );

    },


    /* =================================================
       GET TOTAL QTY
    ================================================= */

    getTotalQty(

        period = this.period

    ){

        return this.getPeriodData(

            period

        )

        .reduce(

            (

                total,

                item

            ) =>

                total +

                this.toNumber(

                    item.qty

                ),

            0

        );

    },


    /* =================================================
       GET DATE
    ================================================= */

    getDate(

        item

    ){

        if(

            item?.dateObject instanceof Date

            &&

            !Number.isNaN(

                item.dateObject.getTime()

            )

        ){

            return new Date(

                item.dateObject

            );

        }


        return Periode.parse(

            item?.tanggal ??

            item?.date

        );

    },


    /* =================================================
       CHECK STATUS MASUK
    ================================================= */

    isMasuk(

        item

    ){

        return (

            String(

                item?.status ?? ""

            )

            .trim()

            .toLowerCase()

            ===

            "masuk"

        );

    },


    /* =================================================
       NUMBER
    ================================================= */

    toNumber(

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

};
