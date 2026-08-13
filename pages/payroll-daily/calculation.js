/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Calculation
   File        : calculation.js
   Version     : 2.0.0

   Description :
   Payroll Daily Calculation

   Formula :
   Work       = qty × nominal
   Addition  = rule nominal
   Deduction = rule nominal
===================================================== */


/* =====================================================
   CALCULATION
===================================================== */

export const Calculation = {


    /* =================================================
       CALCULATE WORK ITEM
    ================================================= */

    item(

        item,

        rule = null

    ){

        const qty =

            this.number(

                item?.qty

            );


        const nominal =

            this.number(

                rule?.nominal

            );


        const total =

            qty *

            nominal;


        return {

            ...item,

            qty,

            nominal,

            total,

            workIncome :

                total,

            rule :

                rule || null

        };

    },


    /* =================================================
       CALCULATE ADDITIONS
    ================================================= */

    additions(

        rules = []

    ){

        if(

            !Array.isArray(rules)

        ){

            return [];

        }


        return rules.map(

            rule => ({

                name :

                    rule?.nama ??

                    "",

                nominal :

                    this.number(

                        rule?.nominal

                    ),

                rule

            })

        );

    },


    /* =================================================
       CALCULATE DEDUCTIONS
    ================================================= */

    deductions(

        rules = []

    ){

        if(

            !Array.isArray(rules)

        ){

            return [];

        }


        return rules.map(

            rule => ({

                name :

                    rule?.nama ??

                    "",

                nominal :

                    this.number(

                        rule?.nominal

                    ),

                rule

            })

        );

    },


    /* =================================================
       SUM RULES
    ================================================= */

    sumRules(

        rules = []

    ){

        if(

            !Array.isArray(rules)

        ){

            return 0;

        }


        return rules.reduce(

            (

                total,

                rule

            ) =>

                total +

                this.number(

                    rule?.nominal

                ),

            0

        );

    },


    /* =================================================
       DAILY TOTAL
    ================================================= */

    daily(

        workIncome = 0,

        additions = []

    ){

        const additionTotal =

            this.sumRules(

                additions

            );


        return {

            workIncome :

                this.number(

                    workIncome

                ),

            additionTotal,

            gross :

                this.number(

                    workIncome

                )

                +

                additionTotal

        };

    },


    /* =================================================
       PAYROLL TOTAL
    ================================================= */

    payroll(

        gross = 0,

        deductions = []

    ){

        const deductionTotal =

            this.sumRules(

                deductions

            );


        const grossNumber =

            this.number(

                gross

            );


        return {

            gross :

                grossNumber,

            deductionTotal,

            net :

                grossNumber -

                deductionTotal

        };

    },


    /* =================================================
       NUMBER
    ================================================= */

    number(

        value

    ){

        const number =

            Number(

                String(

                    value ?? 0

                )

                .replace(

                    /[^0-9.-]/g,

                    ""

                )

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
