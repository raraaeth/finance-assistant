/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Rule
   File        : rule.js
   Version     : 1.0.0

   Description :
   Payroll Daily Rule Matcher

   Priority :
   1. nama + grade_1 + grade_2
   2. nama + grade_1
   3. nama
===================================================== */


/* =====================================================
   RULE
===================================================== */

export const Rule = {


    /* =================================================
       FIND
    ================================================= */

    find(

        item,

        rules = []

    ){

        /* ---------------------------------------------
           NORMALIZE DATA
        --------------------------------------------- */

        const nama =

            this.normalize(

                item?.nama

            );


        const grade1 =

            this.normalize(

                item?.grade_1

            );


        const grade2 =

            this.normalize(

                item?.grade_2

            );


        /* ---------------------------------------------
           ONLY WORK RULE
        --------------------------------------------- */

        const workRules =

            rules.filter(

                rule =>

                    this.normalize(

                        rule?.type_rule

                    )

                    ===

                    "rule_work"

            );


        /* =================================================
           LEVEL 1
           NAMA + GRADE 1 + GRADE 2
        ================================================= */

        if(

            nama &&

            grade1 &&

            grade2

        ){

            const exactRule =

                workRules.find(

                    rule =>

                        this.normalize(

                            rule.nama

                        )

                        ===

                        nama

                        &&

                        this.normalize(

                            rule.grade_1

                        )

                        ===

                        grade1

                        &&

                        this.normalize(

                            rule.grade_2

                        )

                        ===

                        grade2

                );


            if(

                exactRule

            ){

                return {

                    ...exactRule,

                    matchLevel :

                        "grade_2"

                };

            }

        }


        /* =================================================
           LEVEL 2
           NAMA + GRADE 1
        ================================================= */

        if(

            nama &&

            grade1

        ){

            const gradeRule =

                workRules.find(

                    rule =>

                        this.normalize(

                            rule.nama

                        )

                        ===

                        nama

                        &&

                        this.normalize(

                            rule.grade_1

                        )

                        ===

                        grade1

                        &&

                        !this.normalize(

                            rule.grade_2

                        )

                );


            if(

                gradeRule

            ){

                return {

                    ...gradeRule,

                    matchLevel :

                        "grade_1"

                };

            }

        }


        /* =================================================
           LEVEL 3
           NAMA SAJA
        ================================================= */

        if(

            nama

        ){

            const nameRule =

                workRules.find(

                    rule =>

                        this.normalize(

                            rule.nama

                        )

                        ===

                        nama

                        &&

                        !this.normalize(

                            rule.grade_1

                        )

                        &&

                        !this.normalize(

                            rule.grade_2

                        )

                );


            if(

                nameRule

            ){

                return {

                    ...nameRule,

                    matchLevel :

                        "nama"

                };

            }

        }


        /* =================================================
           NO RULE
        ================================================= */

        return null;

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
