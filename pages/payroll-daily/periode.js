/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Periode
   File        : periode.js
   Version     : 2.0.0

   Description :
   Payroll Daily Salary Period

   Logic :
   - Periode gaji mengikuti Rule Gaji dari sheet
   - Mengambil nilai_start sebagai tanggal mulai
   - Mengambil nilai_end sebagai tanggal akhir
   - Tidak menggunakan periode_start / periode_end
     sebagai pola periode gaji
   - Periode sebelumnya mengikuti periode berjalan
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


        const salaryRule =

            rules.find(

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

            );


        return salaryRule ?? null;

    },


    /* =================================================
       GET PERIOD CONFIG
    ================================================= */

    getPeriodConfig(

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

            !startDate

            ||

            !endDate

        ){

            return null;

        }


        const startDay =

            startDate.getDate();


        const endDay =

            endDate.getDate();


        if(

            !startDay

            ||

            !endDay

        ){

            return null;

        }


        return {

            startDay,

            endDay

        };

    },


    /* =================================================
       CREATE PERIOD
    ================================================= */

    createPeriod(

        year,

        month,

        startDay,

        endDay

    ){

        const start =

            new Date(

                year,

                month,

                startDay

            );


        const end =

            new Date(

                year,

                month + 1,

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


        const config =

            this.getPeriodConfig(

                rules

            );


        /* ---------------------------------------------
           Rule Gaji tidak tersedia
        --------------------------------------------- */

        if(

            !config

        ){

            return null;

        }


        const {

            startDay,

            endDay

        } = config;


        /* ---------------------------------------------
           Menentukan apakah tanggal sekarang sudah
           masuk periode yang dimulai bulan ini.

           Contoh:

           Rule Gaji:
           21 → 20

           Tanggal:
           29 September

           Maka:
           21 September → 20 Oktober
        --------------------------------------------- */

        if(

            currentDate.getDate() >= startDay

        ){

            return this.createPeriod(

                currentDate.getFullYear(),

                currentDate.getMonth(),

                startDay,

                endDay

            );

        }


        /* ---------------------------------------------
           Jika tanggal sekarang masih sebelum
           tanggal mulai periode:

           Contoh:

           Rule Gaji:
           21 → 20

           Tanggal:
           10 September

           Maka:
           21 Agustus → 20 September
        --------------------------------------------- */

        return this.createPeriod(

            currentDate.getFullYear(),

            currentDate.getMonth() - 1,

            startDay,

            endDay

        );

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

            !period

            ||

            !period.start

            ||

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


        if(

            !year

            ||

            !month

            ||

            !day

        ){

            return null;

        }


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
