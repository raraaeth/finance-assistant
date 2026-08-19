/* =====================================================
   Finance Assistant
   Component    : Payroll Daily
   File         : hierarchy.js
   Version      : 1.0.0

   Description :
   Payroll Daily Hierarchy Engine

   Purpose :
   Membentuk struktur input bertingkat berdasarkan
   payroll_daily_rules.

   Hierarchy :

       nama
         ↓
       grade_1
         ↓
       grade_2

   Principle :
   - User memilih dari rule.
   - User tidak mengetik nama / grade.
   - Level yang tidak tersedia tidak ditampilkan.
   - Level dengan satu pilihan dapat diisi otomatis.
   - Level dengan banyak pilihan ditampilkan sebagai select.
   - Struktur mengikuti payroll_daily_rules.
===================================================== */


/* =====================================================
   CONSTANT
===================================================== */

const RULE_TYPE =

    "rule_work";


/* =====================================================
   NORMALIZE VALUE
===================================================== */

function normalizeValue(

    value

){

    return String(

        value ??

        ""

    )

        .trim();

}


/* =====================================================
   GET WORK RULES
===================================================== */

export function getWorkRules(

    rules

){

    if(

        !Array.isArray(

            rules

        )

    ){

        return [];

    }


    return rules.filter(

        rule =>

            rule &&

            rule.type_rule ===

                RULE_TYPE

    );

}


/* =====================================================
   BUILD HIERARCHY
=====================================================

   Input :

       payroll_daily_rules

   Output :

       {

           nama : {

               grade_1 : {

                   grade_2 : ...

               }

           }

       }

===================================================== */

export function buildHierarchy(

    rules

){

    const workRules =

        getWorkRules(

            rules

        );


    const tree = {};


    workRules.forEach(

        rule => {

            const nama =

                normalizeValue(

                    rule.nama

                );


            if(

                !nama

            ){

                return;

            }


            const grade1 =

                normalizeValue(

                    rule.grade_1

                );


            const grade2 =

                normalizeValue(

                    rule.grade_2

                );


            /* =========================================
               NAMA
            ========================================= */

            if(

                !tree[nama]

            ){

                tree[nama] = {

                    grade_1 : {}

                };

            }


            /* =========================================
               TANPA GRADE 1
            ========================================= */

            if(

                !grade1

            ){

                return;

            }


            /* =========================================
               GRADE 1
            ========================================= */

            if(

                !tree[nama].grade_1[

                    grade1

                ]

            ){

                tree[nama].grade_1[

                    grade1

                ] = {

                    grade_2 : {}

                };

            }


            /* =========================================
               TANPA GRADE 2
            ========================================= */

            if(

                !grade2

            ){

                return;

            }


            /* =========================================
               GRADE 2
            ========================================= */

            tree[nama]

                .grade_1[

                    grade1

                ]

                .grade_2[

                    grade2

                ] = true;

        }

    );


    return tree;

}


/* =====================================================
   GET NAMA OPTIONS
===================================================== */

export function getNamaOptions(

    rules

){

    const tree =

        buildHierarchy(

            rules

        );


    return Object.keys(

        tree

    )

    .map(

        value => ({

            value :

                value,

            label :

                formatLabel(

                    value

                )

        })

    );

}


/* =====================================================
   GET GRADE 1 OPTIONS
===================================================== */

export function getGrade1Options(

    rules,

    nama

){

    const tree =

        buildHierarchy(

            rules

        );


    const namaValue =

        normalizeValue(

            nama

        );


    if(

        !namaValue ||

        !tree[namaValue]

    ){

        return [];

    }


    return Object.keys(

        tree[namaValue].grade_1

    )

    .map(

        value => ({

            value :

                value,

            label :

                formatLabel(

                    value

                )

        })

    );

}


/* =====================================================
   GET GRADE 2 OPTIONS
===================================================== */

export function getGrade2Options(

    rules,

    nama,

    grade1

){

    const tree =

        buildHierarchy(

            rules

        );


    const namaValue =

        normalizeValue(

            nama

        );


    const grade1Value =

        normalizeValue(

            grade1

        );


    if(

        !namaValue ||

        !grade1Value ||

        !tree[namaValue] ||

        !tree[namaValue].grade_1[

            grade1Value

        ]

    ){

        return [];

    }


    return Object.keys(

        tree[namaValue]

            .grade_1[

                grade1Value

            ]

            .grade_2

    )

    .map(

        value => ({

            value :

                value,

            label :

                formatLabel(

                    value

                )

        })

    );

}


/* =====================================================
   GET NAMA NODE
===================================================== */

export function getNamaNode(

    rules,

    nama

){

    const tree =

        buildHierarchy(

            rules

        );


    const value =

        normalizeValue(

            nama

        );


    if(

        !value ||

        !tree[value]

    ){

        return null;

    }


    return tree[value];

}


/* =====================================================
   GET GRADE 1 NODE
===================================================== */

export function getGrade1Node(

    rules,

    nama,

    grade1

){

    const node =

        getNamaNode(

            rules,

            nama

        );


    const value =

        normalizeValue(

            grade1

        );


    if(

        !node ||

        !value

    ){

        return null;

    }


    return (

        node.grade_1[

            value

        ]

        ??

        null

    );

}


/* =====================================================
   HAS GRADE 1
===================================================== */

export function hasGrade1(

    rules,

    nama

){

    return (

        getGrade1Options(

            rules,

            nama

        ).length > 0

    );

}


/* =====================================================
   HAS GRADE 2
===================================================== */

export function hasGrade2(

    rules,

    nama,

    grade1

){

    return (

        getGrade2Options(

            rules,

            nama,

            grade1

        ).length > 0

    );

}


/* =====================================================
   GET LEVEL INFO
=====================================================

   Menentukan kondisi suatu Nama.

   Contoh :

   headrest
       → tidak punya grade

   baju
       → punya grade 1

   baju + kebaya
       → tidak punya grade 2

   baju + gamis
       → punya grade 2

===================================================== */

export function getLevelInfo(

    rules,

    nama,

    grade1

){

    const grade1Options =

        getGrade1Options(

            rules,

            nama

        );


    const grade2Options =

        getGrade2Options(

            rules,

            nama,

            grade1

        );


    return {

        hasGrade1 :

            grade1Options.length > 0,


        hasGrade2 :

            grade2Options.length > 0,


        grade1Options :

            grade1Options,


        grade2Options :

            grade2Options

    };

}


/* =====================================================
   RESOLVE AUTOMATIC VALUE
=====================================================

   Jika hanya ada satu pilihan,
   engine dapat menentukan nilai otomatis.

   Jika lebih dari satu :
       null

   Jika tidak ada :
       null

===================================================== */

export function resolveSingleOption(

    options

){

    if(

        !Array.isArray(

            options

        )

    ){

        return null;

    }


    if(

        options.length !== 1

    ){

        return null;

    }


    return options[0].value;

}


/* =====================================================
   RESOLVE GRADE 1
===================================================== */

export function resolveGrade1(

    rules,

    nama

){

    const options =

        getGrade1Options(

            rules,

            nama

        );


    return resolveSingleOption(

        options

    );

}


/* =====================================================
   RESOLVE GRADE 2
===================================================== */

export function resolveGrade2(

    rules,

    nama,

    grade1

){

    const options =

        getGrade2Options(

            rules,

            nama,

            grade1

        );


    return resolveSingleOption(

        options

    );

}


/* =====================================================
   RESOLVE HIERARCHY
=====================================================

   Fungsi ini menentukan nilai otomatis
   sebanyak mungkin berdasarkan rule.

   Contoh :

   sepatu
       ↓
   sneaker
       ↓
   trendy

===================================================== */

export function resolveHierarchy(

    rules,

    values = {}

){

    const result = {

        nama :

            normalizeValue(

                values.nama

            ),

        grade_1 :

            normalizeValue(

                values.grade_1

            ),

        grade_2 :

            normalizeValue(

                values.grade_2

            )

    };


    /* =============================================
       TANPA NAMA
    ============================================= */

    if(

        !result.nama

    ){

        return result;

    }


    /* =============================================
       GRADE 1
    ============================================= */

    if(

        !result.grade_1

    ){

        const grade1 =

            resolveGrade1(

                rules,

                result.nama

            );


        if(

            grade1

        ){

            result.grade_1 =

                grade1;

        }

    }


    /* =============================================
       GRADE 2
    ============================================= */

    if(

        result.grade_1 &&

        !result.grade_2

    ){

        const grade2 =

            resolveGrade2(

                rules,

                result.nama,

                result.grade_1

            );


        if(

            grade2

        ){

            result.grade_2 =

                grade2;

        }

    }


    return result;

}


/* =====================================================
   IS COMPLETE
=====================================================

   Menentukan apakah kombinasi yang dipilih
   sudah merupakan kombinasi rule yang valid.

===================================================== */

export function isComplete(

    rules,

    values = {}

){

    const resolved =

        resolveHierarchy(

            rules,

            values

        );


    if(

        !resolved.nama

    ){

        return false;

    }


    const grade1Options =

        getGrade1Options(

            rules,

            resolved.nama

        );


    /* =============================================
       TIDAK ADA GRADE
    ============================================= */

    if(

        grade1Options.length === 0

    ){

        return true;

    }


    /* =============================================
       GRADE 1 BELUM ADA
    ============================================= */

    if(

        !resolved.grade_1

    ){

        return false;

    }


    const grade2Options =

        getGrade2Options(

            rules,

            resolved.nama,

            resolved.grade_1

        );


    /* =============================================
       TIDAK ADA GRADE 2
    ============================================= */

    if(

        grade2Options.length === 0

    ){

        return true;

    }


    /* =============================================
       GRADE 2 WAJIB
    ============================================= */

    return Boolean(

        resolved.grade_2

    );

}


/* =====================================================
   FIND MATCHING RULE
=====================================================

   Mencari rule berdasarkan kombinasi input.

   Prioritas :

   nama + grade_1 + grade_2
   nama + grade_1
   nama

===================================================== */

export function findMatchingRule(

    rules,

    values = {}

){

    const workRules =

        getWorkRules(

            rules

        );


    const nama =

        normalizeValue(

            values.nama

        );


    const grade1 =

        normalizeValue(

            values.grade_1

        );


    const grade2 =

        normalizeValue(

            values.grade_2

        );


    if(

        !nama

    ){

        return null;

    }


    /* =============================================
       LEVEL 3
    ============================================= */

    if(

        grade1 &&

        grade2

    ){

        const match =

            workRules.find(

                rule =>

                    normalizeValue(

                        rule.nama

                    ) === nama

                    &&

                    normalizeValue(

                        rule.grade_1

                    ) === grade1

                    &&

                    normalizeValue(

                        rule.grade_2

                    ) === grade2

            );


        if(

            match

        ){

            return match;

        }

    }


    /* =============================================
       LEVEL 2
    ============================================= */

    if(

        grade1

    ){

        const match =

            workRules.find(

                rule =>

                    normalizeValue(

                        rule.nama

                    ) === nama

                    &&

                    normalizeValue(

                        rule.grade_1

                    ) === grade1

                    &&

                    !normalizeValue(

                        rule.grade_2

                    )

            );


        if(

            match

        ){

            return match;

        }

    }


    /* =============================================
       LEVEL 1
    ============================================= */

    const match =

        workRules.find(

            rule =>

                normalizeValue(

                    rule.nama

                ) === nama

                &&

                !normalizeValue(

                    rule.grade_1

                )

                &&

                !normalizeValue(

                    rule.grade_2

                )

        );


    return match ??

        null;

}


/* =====================================================
   FORMAT LABEL
===================================================== */

function formatLabel(

    value

){

    return String(

        value ??

        ""

    )

    .replace(

        /_/g,

        " "

    )

    .replace(

        /\b\w/g,

        character =>

            character.toUpperCase()

    );

}


/* =====================================================
   DEBUG
===================================================== */

export function debugHierarchy(

    rules

){

    const tree =

        buildHierarchy(

            rules

        );


    console.log(

        "PAYROLL DAILY HIERARCHY:",

        tree

    );


    return tree;

}
