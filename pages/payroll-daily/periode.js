/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Periode
   File        : periode.js
   Version     : 1.1.0

   Description :
   Payroll Daily Salary Period

   Logic :
   - Periode gaji berjalan mengikuti Rule Gaji
   - Periode sebelumnya mengikuti periode berjalan
   - nilai_start menentukan tanggal mulai
   - nilai_end menentukan tanggal akhir
   - periode_start / periode_end tidak digunakan
     sebagai pola periode gaji
===================================================== */


/* =====================================================
   PERIODE
===================================================== */

export const Periode = {


    /* =================================================
       GET SALARY RULE
    ================================================= */

    getSalaryRule(

        rules = []

    ){

        if(

            !Array.isArray(

                rules

            )

        ){

            return null;

        }


        return rules.find(

            rule =>

                String(

                    rule?.type_rule ?? ""

                )

                .trim()

                .toLowerCase()

                ===

                "rule_gaji"

                &&

                String(

                    rule?.nama ?? ""

                )

                .trim()

                .toLowerCase()

                ===

                "gaji"

                &&

                String(

                    rule?.kondisi ?? ""

                )

                .trim()

                .toLowerCase()

                ===

                "periode"

        )

        ||

        null;

    },


    /* =================================================
       GET PERIOD DAY
    ================================================= */

    getPeriodDays(

        rules = []

    ){

        const salaryRule =

            this.getSalaryRule(

                rules

            );


        if(

            !salaryRule

        ){

            return null;

        }


        const startDate =

            this.parse(

                salaryRule.nilai_start

            );


        const endDate =

            this.parse(

                salaryRule.nilai_end

            );


        if(

            !startDate ||

            !endDate

        ){

            return null;

        }


        return {

            startDay :

                startDate.getDate(),

            endDay :

                endDate.getDate()

        };

    },


    /* =================================================
       GET CURRENT PERIOD
    ================================================= */

    current(

        date = new Date(),

        rules = []

    ){

        const currentDate =

            this.normalizeDate(

                date

            );


        const periodDays =

            this.getPeriodDays(

                rules

            );


        /* ---------------------------------------------
           Jika Rule Gaji tidak ditemukan
           jangan membuat periode palsu.
        --------------------------------------------- */

        if(

            !periodDays

        ){

            return null;

        }


        const startDay =

            periodDays.startDay;


        const endDay =

            periodDays.endDay;


        /* ---------------------------------------------
           Jika tanggal >= tanggal mulai
           periode dimulai tanggal mulai bulan ini
           dan berakhir tanggal akhir bulan berikutnya
        --------------------------------------------- */

        if(

            currentDate.getDate() >= startDay

        ){

            const start =

                new Date(

                    currentDate.getFullYear(),

                    currentDate.getMonth(),

                    startDay

                );


            const end =

                new Date(

                    currentDate.getFullYear(),

                    currentDate.getMonth() + 1,

                    endDay

                );


            return {

                start :

                    this.startOfDay(

                        start

                    ),

                end :

                    this.endOfDay(

                        end

                    )

            };

        }


        /* ---------------------------------------------
           Jika tanggal < tanggal mulai
           periode dimulai tanggal mulai bulan sebelumnya
           dan berakhir tanggal akhir bulan ini
        --------------------------------------------- */

        const start =

            new Date(

                currentDate.getFullYear(),

                currentDate.getMonth() - 1,

                startDay

            );


        const end =

            new Date(

                currentDate.getFullYear(),

                currentDate.getMonth(),

                endDay

            );


        return {

            start :

                this.startOfDay(

                    start

                ),

            end :

                this.endOfDay(

                    end

                )

        };

    },


    /* =================================================
       GET PREVIOUS PERIOD
    ================================================= */

    previous(

        date = new Date(),

        rules = []

    ){

        const current =

            this.current(

                date,

                rules

            );


        if(

            !current

        ){

            return null;

        }


        const start =

            new Date(

                current.start

            );


        start.setMonth(

            start.getMonth() - 1

        );


        const end =

            new Date(

                current.end

            );


        end.setMonth(

            end.getMonth() - 1

        );


        return {

            start :

                this.startOfDay(

                    start

                ),

            end :

                this.endOfDay(

                    end

                )

        };

    },


    /* =================================================
       CHECK DATE IN PERIOD
    ================================================= */

    contains(

        date,

        period

    ){

        if(

            !(

                date instanceof Date

            )

            ||

            Number.isNaN(

                date.getTime()

            )

        ){

            return false;

        }


        if(

            !period ||

            !period.start ||

            !period.end

        ){

            return false;

        }


        return (

            date >= period.start

        )

        &&

        (

            date <= period.end

        );

    },


    /* =================================================
       PARSE DATE
    ================================================= */

    parse(

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

            .map(

                Number

            );


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


        if(

            Number.isNaN(

                date.getTime()

            )

        ){

            return null;

        }


        return date;

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
       NORMALIZE DATE
    ================================================= */

    normalizeDate(

        date

    ){

        const parsed =

            this.parse(

                date

            );


        return parsed

            ?

            this.startOfDay(

                parsed

            )

            :

            this.startOfDay(

                new Date()

            );

    }

};
