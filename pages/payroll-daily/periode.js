/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Period
   File        : periode.js
   Version     : 1.0.0

   Description :
   Payroll Daily Salary Period Manager

   RULE :
   - Periode aktif rule  :
     periode_start / periode_end

   - Periode gaji :
     nilai_start / nilai_end
===================================================== */


/* =====================================================
   PERIOD
===================================================== */

export const Period = {


    /* =================================================
       FIND SALARY RULE
    ================================================= */

    findSalaryRule(

        rules = []

    ){

        if(

            !Array.isArray(rules)

        ){

            return null;

        }


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
       GET INITIAL PERIOD
    ================================================= */

    getInitialPeriod(

        rules = []

    ){

        const rule =

            this.findSalaryRule(

                rules

            );


        if(

            !rule

        ){

            return null;

        }


        const start =

            this.parseDate(

                rule.nilai_start

            );


        const end =

            this.parseDate(

                rule.nilai_end

            );


        if(

            !start ||

            !end

        ){

            return null;

        }


        return this.createPeriod(

            start,

            end

        );

    },


    /* =================================================
       GET CURRENT PERIOD
    ================================================= */

    getCurrent(

        rules = [],

        date = new Date()

    ){

        const initial =

            this.getInitialPeriod(

                rules

            );


        if(

            !initial

        ){

            return null;

        }


        const target =

            this.startOfDay(

                date

            );


        let start =

            new Date(

                initial.start

            );


        let end =

            new Date(

                initial.end

            );


        /* ---------------------------------------------
           BEFORE INITIAL PERIOD
        --------------------------------------------- */

        if(

            target < start

        ){

            return initial;

        }


        /* ---------------------------------------------
           MOVE FORWARD
        --------------------------------------------- */

        while(

            target > end

        ){

            const next =

                this.next(

                    {

                        start,

                        end

                    }

                );


            start = next.start;

            end = next.end;

        }


        /* ---------------------------------------------
           RESULT
        --------------------------------------------- */

        return this.createPeriod(

            start,

            end

        );

    },


    /* =================================================
       GET PREVIOUS PERIOD
    ================================================= */

    getPrevious(

        rules = [],

        date = new Date()

    ){

        const current =

            this.getCurrent(

                rules,

                date

            );


        if(

            !current

        ){

            return null;

        }


        return this.previous(

            current

        );

    },


    /* =================================================
       GET NEXT PERIOD
    ================================================= */

    getNext(

        rules = [],

        date = new Date()

    ){

        const current =

            this.getCurrent(

                rules,

                date

            );


        if(

            !current

        ){

            return null;

        }


        return this.next(

            current

        );

    },


    /* =================================================
       NEXT PERIOD
    ================================================= */

    next(

        period

    ){

        if(

            !period ||

            !period.start ||

            !period.end

        ){

            return null;

        }


        const start =

            new Date(

                period.end

            );


        start.setDate(

            start.getDate() + 1

        );


        const duration =

            this.dayDifference(

                period.start,

                period.end

            );


        const end =

            new Date(

                start

            );


        end.setDate(

            end.getDate() + duration

        );


        return this.createPeriod(

            start,

            end

        );

    },


    /* =================================================
       PREVIOUS PERIOD
    ================================================= */

    previous(

        period

    ){

        if(

            !period ||

            !period.start ||

            !period.end

        ){

            return null;

        }


        const duration =

            this.dayDifference(

                period.start,

                period.end

            );


        const end =

            new Date(

                period.start

            );


        end.setDate(

            end.getDate() - 1

        );


        const start =

            new Date(

                end

            );


        start.setDate(

            start.getDate() - duration

        );


        return this.createPeriod(

            start,

            end

        );

    },


    /* =================================================
       CONTAINS
    ================================================= */

    contains(

        date,

        period

    ){

        if(

            !date ||

            !period

        ){

            return false;

        }


        const target =

            this.startOfDay(

                date

            );


        return (

            target >= period.start

        )

        &&

        (

            target <= period.end

        );

    },


    /* =================================================
       CREATE PERIOD
    ================================================= */

    createPeriod(

        start,

        end

    ){

        const startDate =

            this.startOfDay(

                start

            );


        const endDate =

            this.endOfDay(

                end

            );


        return {

            start :

                startDate,

            end :

                endDate,

            startValue :

                this.formatValue(

                    startDate

                ),

            endValue :

                this.formatValue(

                    endDate

                )

        };

    },


    /* =================================================
       DAY DIFFERENCE
    ================================================= */

    dayDifference(

        start,

        end

    ){

        const a =

            this.startOfDay(

                start

            );


        const b =

            this.startOfDay(

                end

            );


        return Math.round(

            (

                b.getTime()

                -

                a.getTime()

            )

            /

            86400000

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


        if(

            value instanceof Date

        ){

            return Number.isNaN(

                value.getTime()

            )

                ?

                null

                :

                new Date(

                    value

                );

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
       START OF DAY
    ================================================= */

    startOfDay(

        date

    ){

        const result =

            new Date(

                date

            );


        result.setHours(

            0,

            0,

            0,

            0

        );


        return result;

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

    },


    /* =================================================
       FORMAT VALUE
    ================================================= */

    formatValue(

        date

    ){

        const year =

            date.getFullYear();


        const month =

            String(

                date.getMonth() + 1

            ).padStart(

                2,

                "0"

            );


        const day =

            String(

                date.getDate()

            ).padStart(

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
