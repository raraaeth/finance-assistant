/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Process
   File        : process.js
   Version     : 1.1.0

   Description :
   Payroll Daily Data Processor

   Flow :
   - Receive payroll data
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

            Calculation.item(

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

                Boolean(

                    rule

                ),

            ruleLevel :

                rule

                    ? this.getRuleLevel(

                        item,

                        rule

                    )

                    : null

        };

    },


    /* =================================================
       RULE LEVEL
    ================================================= */

    getRuleLevel(

        item,

        rule

    ){

        if(

            !rule

        ){

            return null;

        }


        /* ---------------------------------------------
           GRADE 2
        --------------------------------------------- */

        if(

            item.grade_2 &&

            rule.grade_2 &&

            String(

                item.grade_2

            ).trim().toLowerCase()

            ===

            String(

                rule.grade_2

            ).trim().toLowerCase()

        ){

            return "grade_2";

        }


        /* ---------------------------------------------
           GRADE 1
        --------------------------------------------- */

        if(

            item.grade_1 &&

            rule.grade_1 &&

            String(

                item.grade_1

            ).trim().toLowerCase()

            ===

            String(

                rule.grade_1

            ).trim().toLowerCase()

        ){

            return "grade_1";

        }


        /* ---------------------------------------------
           NAME
        --------------------------------------------- */

        if(

            item.nama &&

            rule.nama &&

            String(

                item.nama

            ).trim().toLowerCase()

            ===

            String(

                rule.nama

            ).trim().toLowerCase()

        ){

            return "nama";

        }


        return null;

    }

};
