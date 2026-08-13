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
   - Find matching rule
   - Calculate income
   - Produce processed data
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

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
       INIT
    ================================================= */

    init(

        raw = [],

        rules = []

    ){

        /* ---------------------------------------------
           RESET
        --------------------------------------------- */

        this.raw =

            Array.isArray(raw)

                ? raw

                : [];


        this.rules =

            Array.isArray(rules)

                ? rules

                : [];


        this.data = [];


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

                        String(

                            item.status ?? ""

                        )

                        .trim()

                        .toLowerCase()

                        ===

                        "masuk"

                )

                .map(

                    item =>

                        this.processItem(

                            item

                        )

                );

    },


    /* =================================================
       PROCESS ITEM
    ================================================= */

    processItem(

        item

    ){

        /* ---------------------------------------------
           FIND RULE
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

            qty :

                calculation.qty,

            nominal :

                calculation.nominal,

            total :

                calculation.total,

            ruleFound :

                calculation.ruleFound,

            ruleLevel :

                calculation.ruleLevel

        };

    }

};
