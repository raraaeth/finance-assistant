/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Rule
   File        : rule.js
   Version     : 1.0.0

   Description :
   Payroll Daily Rule Matcher

   Logic :
   - Match berdasarkan nama + grade
   - Prioritas grade_2 → grade_1 → nama
   - Memeriksa masa berlaku rule
   - Tidak melakukan calculation
   - Tidak menentukan periode payroll
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

        rules = []

    ){

        if(

            !item ||

            !Array.isArray(rules)

        ){

            return null;

        }


        /* ---------------------------------------------
           ITEM DATE
        --------------------------------------------- */

        const itemDate =

            this.parseDate(

                item.dateObject ??

                item.date ??

                item.tanggal

            );


        /* ---------------------------------------------
           WORK RULE ONLY
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


        /* ---------------------------------------------
           RULE YANG MASIH AKTIF
        --------------------------------------------- */

        const activeRules =

            workRules.filter(

                rule =>

                    this.isActive(

                        rule,

                        itemDate

                    )

            );


        /* ---------------------------------------------
           PRIORITY 1
           nama + grade_1 + grade_2
        --------------------------------------------- */

        const exact =

            activeRules.find(

                rule =>

                    this.same(

                        rule?.nama,

                        item?.nama

                    )

                    &&

                    this.same(

                        rule?.grade_1,

                        item?.grade_1

                    )

                    &&

                    this.same(

                        rule?.grade_2,

                        item?.grade_2

                    )

                }

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


        /* ---------------------------------------------
           PRIORITY 2
           nama + grade_1

           grade_2 pada rule boleh kosong
        --------------------------------------------- */

        const grade1 =

            activeRules.find(

                rule =>

                    this.same(

                        rule?.nama,

                        item?.nama

                    )

                    &&

                    this.same(

                        rule?.grade_1,

                        item?.grade_1

                    )

                    &&

                    !this.hasValue(

                        rule?.grade_2

                    )

            );


        if(

            grade1

        ){

            return {

                ...grade1,

                matchLevel :

                    "grade_1"

            };

        }


        /* ---------------------------------------------
           PRIORITY 3
           NAMA SAJA

           grade rule kosong
        --------------------------------------------- */

        const nameOnly =

            activeRules.find(

                rule =>

                    this.same(

                        rule?.nama,

                        item?.nama

                    )

                    &&

                    !this.hasValue(

                        rule?.grade_1

                    )

                    &&

                    !this.hasValue(

                        rule?.grade_2

                    )

            );


        if(

            nameOnly

        ){

            return {

                ...nameOnly,

                matchLevel :

                    "nama"

            };

        }


        return null;

    },


    /* =================================================
       FIND RULE BY TYPE
    ================================================= */

    findByType(

        type,

        rules = [],

        itemDate = null

    ){

        if(

            !Array.isArray(rules)

        ){

            return [];

        }


        const normalizedType =

            this.normalize(

                type

            );


        const date =

            this.parseDate(

                itemDate

            );


        return rules.filter(

            rule =>

                this.normalize(

                    rule?.type_rule

                )

                ===

                normalizedType

                &&

                this.isActive(

                    rule,

                    date

                )

        );

    },


    /* =================================================
       CHECK RULE ACTIVE
    ================================================= */

    isActive(

        rule,

        date

    ){

        if(

            !rule

        ){

            return false;

        }


        /* ---------------------------------------------
           Jika tanggal tidak tersedia,
           jangan menggagalkan rule.
        --------------------------------------------- */

        if(

            !date

        ){

            return true;

        }


        const start =

            this.parseDate(

                rule?.periode_start

            );


        const end =

            this.parseDate(

                rule?.periode_end

            );


        /* ---------------------------------------------
           Tidak ada batas tanggal
        --------------------------------------------- */

        if(

            !start &&

            !end

        ){

            return true;

        }


        /* ---------------------------------------------
           Ada START
        --------------------------------------------- */

        if(

            start &&

            date < start

        ){

            return false;

        }


        /* ---------------------------------------------
           Ada END
        --------------------------------------------- */

        if(

            end &&

            date > end

        ){

            return false;

        }


        return true;

    },


    /* =================================================
       SAME VALUE
    ================================================= */

    same(

        a,

        b

    ){

        return (

            this.normalize(a)

            ===

            this.normalize(b)

        );

    },


    /* =================================================
       HAS VALUE
    ================================================= */

    hasValue(

        value

    ){

        return (

            value !== null

            &&

            value !== undefined

            &&

            String(

                value

            ).trim() !== ""

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

            if(

                Number.isNaN(

                    value.getTime()

                )

            ){

                return null;

            }


            return new Date(

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


        return Number.isNaN(

            date.getTime()

        )

            ?

            null

            :

            date;

    }

};
