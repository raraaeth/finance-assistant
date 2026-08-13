/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Rule
   File        : rule.js
   Version     : 2.0.0

   Description :
   Payroll Daily Rule Manager

   Rule Types :
   - rule_gaji
   - rule_work
   - rule_tambah
   - rule_potong
===================================================== */


/* =====================================================
   RULE
===================================================== */

export const Rule = {


    /* =================================================
       FIND WORK RULE
    ================================================= */

    find(

        item,

        rules = [],

        date = null

    ){

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


        const workRules =

            this.activeRules(

                rules,

                "rule_work",

                date

            );


        /* ---------------------------------------------
           NAMA + GRADE 1 + GRADE 2
        --------------------------------------------- */

        if(

            nama &&

            grade1 &&

            grade2

        ){

            const exact =

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

                exact

            ){

                return {

                    ...exact,

                    matchLevel :

                        "grade_2"

                };

            }

        }


        /* ---------------------------------------------
           NAMA + GRADE 1
        --------------------------------------------- */

        if(

            nama &&

            grade1

        ){

            const grade =

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

                grade

            ){

                return {

                    ...grade,

                    matchLevel :

                        "grade_1"

                };

            }

        }


        /* ---------------------------------------------
           NAMA ONLY
        --------------------------------------------- */

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


        return null;

    },


    /* =================================================
       FIND ADDITION RULES
    ================================================= */

    findAdditions(

        rules = [],

        date = null

    ){

        return this.activeRules(

            rules,

            "rule_tambah",

            date

        );

    },


    /* =================================================
       FIND DEDUCTION RULES
    ================================================= */

    findDeductions(

        rules = [],

        date = null

    ){

        return this.activeRules(

            rules,

            "rule_potong",

            date

        );

    },


    /* =================================================
       FIND SALARY RULE
    ================================================= */

    findSalary(

        rules = []

    ){

        return (

            rules.find(

                rule =>

                    this.normalize(

                        rule?.type_rule

                    )

                    ===

                    "rule_gaji"

            )

            || null

        );

    },


    /* =================================================
       ACTIVE RULES
    ================================================= */

    activeRules(

        rules,

        type,

        date

    ){

        if(

            !Array.isArray(rules)

        ){

            return [];

        }


        return rules.filter(

            rule => {

                if(

                    this.normalize(

                        rule?.type_rule

                    )

                    !==

                    type

                ){

                    return false;

                }


                if(

                    !date

                ){

                    return true;

                }


                return this.isActive(

                    rule,

                    date

                );

            }

        );

    },


    /* =================================================
       IS ACTIVE
    ================================================= */

    isActive(

        rule,

        date

    ){

        const target =

            this.parseDate(

                date

            );


        if(

            !target

        ){

            return false;

        }


        const start =

            this.parseDate(

                rule?.periode_start

            );


        const end =

            this.parseDate(

                rule?.periode_end

            );


        if(

            start &&

            target < start

        ){

            return false;

        }


        if(

            end &&

            target > this.endOfDay(

                end

            )

        ){

            return false;

        }


        return true;

    },


    /* =================================================
       IS WEEKEND RULE
    ================================================= */

    isWeekendRule(

        rule

    ){

        const waktu =

            this.normalize(

                rule?.waktu

            );


        return (

            waktu === "sabtu,minggu"

        )

        ||

        (

            waktu === "sabtu"

        )

        ||

        (

            waktu === "minggu"

        );

    },


    /* =================================================
       MATCH ADDITION DAY
    ================================================= */

    matchesDay(

        rule,

        date

    ){

        if(

            !date

        ){

            return false;

        }


        const waktu =

            this.normalize(

                rule?.waktu

            );


        const day =

            this.parseDate(

                date

            );


        if(

            !day

        ){

            return false;

        }


        const dayNumber =

            day.getDay();


        if(

            waktu === "sabtu,minggu"

        ){

            return (

                dayNumber === 0

                ||

                dayNumber === 6

            );

        }


        if(

            waktu === "sabtu"

        ){

            return dayNumber === 6;

        }


        if(

            waktu === "minggu"

        ){

            return dayNumber === 0;

        }


        return false;

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
       PARSE DATE
    ================================================= */

    parseDate(

        value

    ){

        if(

            value instanceof Date

        ){

            return new Date(

                value

            );

        }


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


        const date =

            new Date(

                parts[0],

                parts[1] - 1,

                parts[2]

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
       END OF DAY
    ================================================= */

    endOfDay(

        date

    ){

        const result =

            new Date(

                date

            );


        result.setHours(

            23,

            59,

            59,

            999

        );


        return result;

    }

};
