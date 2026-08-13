/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Process
   File        : process.js
   Version     : 2.0.0

   Description :
   Payroll Daily Data Processor

   Flow :
   RAW
    ↓
   Filter status masuk
    ↓
   Rule
    ↓
   Period
    ↓
   Calculation
    ↓
   Processed Data
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


import {

    Period

} from "./periode.js";


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
       PERIOD
    ================================================= */

    period : {

        current : null,

        previous : null,

        next : null

    },


    /* =================================================
       SUMMARY
    ================================================= */

    summary : {

        currentGross : 0,

        currentNet : 0,

        currentWork : 0,

        currentAddition : 0,

        currentDeduction : 0,

        previousGross : 0,

        previousNet : 0

    },


    /* =================================================
       INIT
    ================================================= */

    init(

        raw = [],

        rules = []

    ){

        this.raw =

            Array.isArray(raw)

                ? raw

                : [];


        this.rules =

            Array.isArray(rules)

                ? rules

                : [];


        this.data = [];


        this.period = {

            current :

                Period.getCurrent(

                    this.rules

                ),

            previous :

                Period.getPrevious(

                    this.rules

                ),

            next :

                Period.getNext(

                    this.rules

                )

        };


        this.process();


        this.calculateSummary();


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

                        this.normalize(

                            item.status

                        )

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

        const date =

            this.getDate(

                item

            );


        /* ---------------------------------------------
           WORK RULE
        --------------------------------------------- */

        const workRule =

            Rule.find(

                item,

                this.rules,

                date

            );


        const calculation =

            Calculation.item(

                item,

                workRule

            );


        /* ---------------------------------------------
           RESULT
        --------------------------------------------- */

        return {

            ...item,

            dateObject :

                date,


            qty :

                calculation.qty,


            nominal :

                calculation.nominal,


            total :

                calculation.total,


            workIncome :

                calculation.workIncome,


            ruleFound :

                Boolean(

                    workRule

                ),


            ruleLevel :

                workRule

                    ?

                    workRule.matchLevel

                    :

                    null,


            rule :

                workRule || null

        };

    },


    /* =================================================
       CALCULATE SUMMARY
    ================================================= */

    calculateSummary(){

        const current =

            this.period.current;


        const previous =

            this.period.previous;


        const currentData =

            this.data.filter(

                item =>

                    Period.contains(

                        item.dateObject,

                        current

                    )

            );


        const previousData =

            this.data.filter(

                item =>

                    Period.contains(

                        item.dateObject,

                        previous

                    )

            );


        const currentWork =

            currentData.reduce(

                (

                    total,

                    item

                ) =>

                    total +

                    this.number(

                        item.workIncome

                    ),

                0

            );


        const previousWork =

            previousData.reduce(

                (

                    total,

                    item

                ) =>

                    total +

                    this.number(

                        item.workIncome

                    ),

                0

            );


        /* ---------------------------------------------
           CURRENT ADDITIONS
           Tambahan dihitung SEKALI PER HARI.
        --------------------------------------------- */

        const currentAddition =

            this.calculatePeriodAdditions(

                current

            );


        const previousAddition =

            this.calculatePeriodAdditions(

                previous

            );


        /* ---------------------------------------------
           GROSS
        --------------------------------------------- */

        const currentGross =

            currentWork +

            currentAddition;


        const previousGross =

            previousWork +

            previousAddition;


        /* ---------------------------------------------
           DEDUCTIONS
           Potongan hanya dikenakan satu kali
           pada periode gaji.
        --------------------------------------------- */

        const currentDeduction =

            this.calculatePeriodDeductions(

                current

            );


        const previousDeduction =

            this.calculatePeriodDeductions(

                previous

            );


        const currentNet =

            currentGross -

            currentDeduction;


        const previousNet =

            previousGross -

            previousDeduction;


        this.summary = {

            currentGross,

            currentNet,

            currentWork,

            currentAddition,

            currentDeduction,

            previousGross,

            previousNet

        };

    },


    /* =================================================
       CALCULATE PERIOD ADDITIONS
    ================================================= */

    calculatePeriodAdditions(

        period

    ){

        if(

            !period

        ){

            return 0;

        }


        const additions =

            Rule.findAdditions(

                this.rules

            );


        if(

            !additions.length

        ){

            return 0;

        }


        let total = 0;


        const dateMap = {};


        this.data.forEach(

            item => {

                if(

                    !item.dateObject

                ){

                    return;

                }


                if(

                    !Period.contains(

                        item.dateObject,

                        period

                    )

                ){

                    return;

                }


                const key =

                    this.dateKey(

                        item.dateObject

                    );


                dateMap[key] =

                    item.dateObject;

            }

        );


        Object.values(

            dateMap

        )

        .forEach(

            date => {

                additions.forEach(

                    rule => {

                        if(

                            Rule.matchesDay(

                                rule,

                                date

                            )

                        ){

                            total +=

                                Calculation.number(

                                    rule.nominal

                                );

                        }

                    }

                );

            }

        );


        return total;

    },


    /* =================================================
       CALCULATE PERIOD DEDUCTIONS
    ================================================= */

    calculatePeriodDeductions(

        period

    ){

        if(

            !period

        ){

            return 0;

        }


        const deductions =

            Rule.findDeductions(

                this.rules

            );


        return Calculation.sumRules(

            deductions

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


        return this.parseDate(

            item?.tanggal ??

            item?.date

        );

    },


    /* =================================================
       DATE KEY
    ================================================= */

    dateKey(

        date

    ){

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

            year +

            "-" +

            month +

            "-" +

            day

        );

    },


    /* =================================================
       PARSE DATE
    ================================================= */

    parseDate(

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

            .trim()

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


        return Number.isNaN(

            date.getTime()

        )

            ?

            null

            :

            date;

    },


    /* =================================================
       NORMALIZE
    ================================================= */

    normalize(

        value

    ){

        return String(

            value ?? ""

        )

        .trim()

        .toLowerCase();

    },


    /* =================================================
       NUMBER
    ================================================= */

    number(

        value

    ){

        return Calculation.number(

            value

        );

    }

};
