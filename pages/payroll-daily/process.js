/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Process
   File        : process.js
   Version     : 1.1.0

   Description :
   Payroll Daily Data Processor

   Responsibility :
   - Menyatukan Periode
   - Menyatukan Rule
   - Menyatukan Calculation
   - Memproses pekerjaan
   - Menyiapkan penambahan
   - Menyiapkan potongan
   - Menentukan periode gaji berjalan

   Flow :

   API
     ↓
   Process
     ↓
   Periode
     ↓
   Rule
     ↓
   Calculation
     ↓
   Process.data

   Summary / Statistics / Home
   hanya membaca hasil Process
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
       CURRENT PERIOD DATA
    ================================================= */

    periodData : [],


    /* =================================================
       WORK DATA
    ================================================= */

    work : [],


    /* =================================================
       ADDITION RULES
    ================================================= */

    additions : [],


    /* =================================================
       DEDUCTION RULES
    ================================================= */

    deductions : [],


    /* =================================================
       INIT
    ================================================= */

    init(

        raw = [],

        rules = []

    ){

        /* =============================================
           RESET
        ============================================= */

        this.raw =

            Array.isArray(

                raw

            )

                ?

                raw

                :

                [];


        this.rules =

            Array.isArray(

                rules

            )

                ?

                rules

                :

                [];


        this.data = [];


        this.periodData = [];


        this.work = [];


        this.additions = [];


        this.deductions = [];


        /* =============================================
           SALARY PERIOD
        ============================================= */

        this.period =

            Periode.current();


        /* =============================================
           PROCESS WORK
        ============================================= */

        this.process();


        /* =============================================
           PROCESS RULE GROUPS
        ============================================= */

        this.processRuleGroups();


        return this.data;

    },


    /* =================================================
       PROCESS ATTENDANCE / WORK DATA
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


        /* =============================================
           CURRENT SALARY PERIOD DATA
        ============================================= */

        this.periodData =

            this.data.filter(

                item =>

                    Periode.contains(

                        item.dateObject,

                        this.period

                    )

            );


        /* =============================================
           WORK DATA
        ============================================= */

        this.work =

            this.periodData.slice();

    },


    /* =================================================
       PROCESS ITEM
    ================================================= */

    processItem(

        item

    ){

        /* =============================================
           DATE
        ============================================= */

        const date =

            this.getDate(

                item

            );


        if(

            !date

        ){

            return null;

        }


        /* =============================================
           FIND WORK RULE
        ============================================= */

        const rule =

            Rule.find(

                item,

                this.rules

            );


        /* =============================================
           CALCULATION
        ============================================= */

        const calculation =

            Calculation.calculate(

                item,

                rule

            );


        /* =============================================
           RESULT
        ============================================= */

        return {

            ...item,


            /* -----------------------------------------
               NORMALIZED DATE
            ----------------------------------------- */

            dateObject :

                date,


            /* -----------------------------------------
               SALARY PERIOD
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

                this.toNumber(

                    calculation?.qty ??

                    item?.qty

                ),


            /* -----------------------------------------
               NOMINAL
            ----------------------------------------- */

            nominal :

                this.toNumber(

                    calculation?.nominal

                ),


            /* -----------------------------------------
               TOTAL
            ----------------------------------------- */

            total :

                this.toNumber(

                    calculation?.total

                ),


            /* -----------------------------------------
               RULE INFORMATION
            ----------------------------------------- */

            ruleFound :

                Boolean(

                    rule

                ),


            ruleType :

                rule?.type_rule ??

                null,


            ruleName :

                rule?.nama ??

                null,


            ruleLevel :

                rule?.matchLevel ??

                null,


            rule :

                rule ||

                null

        };

    },


    /* =================================================
       PROCESS RULE GROUPS
    ================================================= */

    processRuleGroups(){

        /* =============================================
           ADDITION
        ============================================= */

        this.additions =

            Rule.findByType(

                "rule_tambah",

                this.rules,

                this.period?.start

            );


        /* =============================================
           DEDUCTION
        ============================================= */

        this.deductions =

            Rule.findByType(

                "rule_potong",

                this.rules,

                this.period?.start

            );

    },


    /* =================================================
       GET CURRENT PERIOD
    ================================================= */

    getCurrentPeriod(){

        if(

            !this.period

        ){

            return null;

        }


        return {

            start :

                new Date(

                    this.period.start

                ),

            end :

                new Date(

                    this.period.end

                )

        };

    },


    /* =================================================
       GET PREVIOUS PERIOD
    ================================================= */

    getPreviousPeriod(){

        return Periode.previous();

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
       GET WORK INCOME
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
       CHECK STATUS
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
