/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Calculation
   File        : calculation.js
   Version     : 1.0.0

   Description :
   Payroll Daily Calculation Engine

   Logic :
   - rule_work   : qty × nominal
   - rule_tambah : nominal tambahan
   - rule_potong : nominal potongan
   - Tidak mencari rule
   - Tidak menentukan periode
===================================================== */


/* =====================================================
   CALCULATION
===================================================== */

export const Calculation = {


    /* =================================================
       WORK
       qty × nominal
    ================================================= */

    work(

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

            type :

                "work",

            qty,

            nominal,

            total,

            rule :

                rule || null

        };

    },


    /* =================================================
       ADDITION
       rule_tambah
    ================================================= */

    addition(

        rule = null

    ){

        const nominal =

            this.number(

                rule?.nominal

            );


        return {

            type :

                "addition",

            qty :

                1,

            nominal,

            total :

                nominal,

            rule :

                rule || null

        };

    },


    /* =================================================
       DEDUCTION
       rule_potong
    ================================================= */

    deduction(

        rule = null

    ){

        const nominal =

            this.number(

                rule?.nominal

            );


        return {

            type :

                "deduction",

            qty :

                1,

            nominal,

            total :

                nominal,

            rule :

                rule || null

        };

    },


    /* =================================================
       CALCULATE
       GENERAL DISPATCHER
    ================================================= */

    calculate(

        item,

        rule = null

    ){

        const type =

            this.normalize(

                rule?.type_rule

            );


        /* ---------------------------------------------
           WORK
        --------------------------------------------- */

        if(

            type ===

            "rule_work"

        ){

            return this.work(

                item,

                rule

            );

        }


        /* ---------------------------------------------
           ADDITION
        --------------------------------------------- */

        if(

            type ===

            "rule_tambah"

        ){

            return this.addition(

                rule

            );

        }


        /* ---------------------------------------------
           DEDUCTION
        --------------------------------------------- */

        if(

            type ===

            "rule_potong"

        ){

            return this.deduction(

                rule

            );

        }


        /* ---------------------------------------------
           NO RULE
        --------------------------------------------- */

        return {

            type :

                "none",

            qty :

                this.number(

                    item?.qty

                ),

            nominal :

                0,

            total :

                0,

            rule :

                null

        };

    },


    /* =================================================
       CALCULATE COLLECTION
    ================================================= */

    all(

        data = [],

        ruleFinder = null,

        rules = []

    ){

        if(

            !Array.isArray(

                data

            )

        ){

            return [];

        }


        return data.map(

            item => {

                const rule =

                    typeof ruleFinder ===

                    "function"

                        ?

                        ruleFinder(

                            item,

                            rules

                        )

                        :

                        null;


                return {

                    ...item,

                    calculation :

                        this.calculate(

                            item,

                            rule

                        )

                };

            }

        );

    },


    /* =================================================
       NUMBER
    ================================================= */

    number(

        value

    ){

        if(

            typeof value ===

            "number"

        ){

            return Number.isFinite(

                value

            )

                ?

                value

                :

                0;

        }


        const cleaned =

            String(

                value ?? 0

            )

            .replace(

                /[^0-9.-]/g,

                ""

            );


        const number =

            Number(

                cleaned

            );


        return Number.isFinite(

            number

        )

            ?

            number

            :

            0;

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

    }

};
