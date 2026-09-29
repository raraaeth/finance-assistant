/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Periode
   File        : periode.js
   Version     : 1.0.0

   Description :
   Payroll Daily Salary Period

   Logic :
   - Periode gaji berjalan : tanggal 28 → 27
   - Periode sebelumnya     : 28 → 27 sebelumnya
   - Tidak menggunakan
     periode_start / periode_end
     sebagai periode gaji
===================================================== */


/* =====================================================
   PERIODE
===================================================== */

export const Periode = {


    /* =================================================
       GET CURRENT PERIOD
    ================================================= */

    current(

        date = new Date()

    ){

        const currentDate =

            this.normalizeDate(

                date

            );


        /* ---------------------------------------------
           Jika tanggal >= 28
           periode dimulai tanggal 28 bulan ini
           dan berakhir tanggal 27 bulan berikutnya
        --------------------------------------------- */

        if(

            currentDate.getDate() >= 28

        ){

            const start =

                new Date(

                    currentDate.getFullYear(),

                    currentDate.getMonth(),

                    28

                );


            const end =

                new Date(

                    currentDate.getFullYear(),

                    currentDate.getMonth() + 1,

                    27

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
           Jika tanggal < 28
           periode dimulai tanggal 28 bulan sebelumnya
           dan berakhir tanggal 27 bulan ini
        --------------------------------------------- */

        const start =

            new Date(

                currentDate.getFullYear(),

                currentDate.getMonth() - 1,

                28

            );


        const end =

            new Date(

                currentDate.getFullYear(),

                currentDate.getMonth(),

                27

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

        date = new Date()

    ){

        const current =

            this.current(

                date

            );


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
