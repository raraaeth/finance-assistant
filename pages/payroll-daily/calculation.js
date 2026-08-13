/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Calculation
   File        : calculation.js
   Version     : 1.0.0

   Description :
   Payroll Daily Calculation

   Formula :
   qty × nominal = total
===================================================== */


/* =====================================================
   CALCULATION
===================================================== */

export const Calculation = {


    /* =================================================
       CALCULATE ITEM
    ================================================= */

    item(

        item,

        rule = null

    ){

        /* ---------------------------------------------
           QTY
        --------------------------------------------- */

        const qty =

            this.number(

                item?.qty

            );


        /* ---------------------------------------------
           NOMINAL
        --------------------------------------------- */

        const nominal =

            this.number(

                rule?.nominal

            );


        /* ---------------------------------------------
           TOTAL
        --------------------------------------------- */

        const total =

            qty *

            nominal;


        /* ---------------------------------------------
           RESULT
        --------------------------------------------- */

        return {

            ...item,

            qty,

            nominal,

            total,

            rule :

                rule || null

        };

    },


    /* =================================================
       CALCULATE COLLECTION
    ================================================= */

    all(

        data = [],

        rules = [],

        ruleFinder = null

    ){

        if(

            !Array.isArray(data)

        ){

            return [];

        }


        return data.map(

            item => {

                const rule =

                    ruleFinder

                    ?

                    ruleFinder(

                        item,

                        rules

                    )

                    :

                    null;


                return this.item(

                    item,

                    rule

                );

            }

        );

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

                ).replace(

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
