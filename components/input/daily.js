/* =====================================================
   Finance Assistant
   Component    : Global Input
   Workspace    : Payroll Daily
   File         : daily.js
   Version      : 1.0.0

   Description :
   Global Input Configuration
   Payroll Daily

   Flow :

       Nama
         ↓
       Grade 1
         ↓
       Grade 2
         ↓
       Qty

   Principle :
   - Tanggal disediakan oleh Controller.
   - Status selalu "masuk".
   - User memilih Nama dari payroll_daily_rules.
   - Grade 1 hanya muncul jika tersedia.
   - Grade 2 hanya muncul jika tersedia.
   - Level dengan satu pilihan dapat diisi otomatis.
   - User tidak mengetik Nama / Grade.
   - Qty wajib diisi.
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    getPayrollDailyRules

} from "./data.js";


import {

    getNamaOptions,
    getGrade1Options,
    getGrade2Options,
    resolveHierarchy,
    isComplete,
    findMatchingRule

} from "./hierarchy.js";


/* =====================================================
   HELPERS
===================================================== */


/* =====================================================
   GET RULES
===================================================== */

function getRules(){

    const rules =

        getPayrollDailyRules();


    return Array.isArray(

        rules

    )

        ?

    rules

        :

    [];

}


/* =====================================================
   GET NAMA OPTIONS
===================================================== */

function getDailyNamaOptions(){

    return getNamaOptions(

        getRules()

    );

}


/* =====================================================
   GET GRADE 1 OPTIONS
===================================================== */

function getDailyGrade1Options(

    values

){

    if(

        !values ||

        !values.nama

    ){

        return [];

    }


    return getGrade1Options(

        getRules(),

        values.nama

    );

}


/* =====================================================
   GET GRADE 2 OPTIONS
===================================================== */

function getDailyGrade2Options(

    values

){

    if(

        !values ||

        !values.nama ||

        !values.grade_1

    ){

        return [];

    }


    return getGrade2Options(

        getRules(),

        values.nama,

        values.grade_1

    );

}


/* =====================================================
   RESOLVE HIERARCHY
===================================================== */

export function resolveDailyHierarchy(

    values = {}

){

    return resolveHierarchy(

        getRules(),

        values

    );

}


/* =====================================================
   CHECK COMPLETE
===================================================== */

export function isDailyComplete(

    values = {}

){

    return isComplete(

        getRules(),

        values

    );

}


/* =====================================================
   GET MATCHING WORK RULE
===================================================== */

export function getDailyWorkRule(

    values = {}

){

    return findMatchingRule(

        getRules(),

        values

    );

}


/* =====================================================
   PAYROLL DAILY CONFIG
===================================================== */

export const Daily = {

    workspace :

        "payroll-daily",


    title :

        "Payroll Daily",


    steps : [

        /* =================================================
           NAMA
        ================================================= */

        {

            id :

                "nama",

            label :

                "Nama",

            type :

                "select",

            placeholder :

                "Pilih nama",

            required :

                true,

            options :

                () =>

                    getDailyNamaOptions(),

            note :

                "Pilih nama pekerjaan berdasarkan rule Payroll Daily."

        },


        /* =================================================
           GRADE 1
           
           Hanya muncul jika Nama mempunyai
           Grade 1 pada rule.
        ================================================= */

        {

            id :

                "grade_1",

            label :

                "Grade 1",

            type :

                "select",

            placeholder :

                "Pilih grade 1",

            required :

                false,

            showWhen :

                values =>

                    Boolean(

                        values.nama

                    )

                    &&

                    getDailyGrade1Options(

                        values

                    ).length > 0,

            options :

                values =>

                    getDailyGrade1Options(

                        values

                    ),

            note :

                "Pilih grade 1 jika tersedia pada rule."

        },


        /* =================================================
           GRADE 2
           
           Hanya muncul jika kombinasi Nama +
           Grade 1 mempunyai Grade 2.
        ================================================= */

        {

            id :

                "grade_2",

            label :

                "Grade 2",

            type :

                "select",

            placeholder :

                "Pilih grade 2",

            required :

                false,

            showWhen :

                values =>

                    Boolean(

                        values.nama

                    )

                    &&

                    Boolean(

                        values.grade_1

                    )

                    &&

                    getDailyGrade2Options(

                        values

                    ).length > 0,

            options :

                values =>

                    getDailyGrade2Options(

                        values

                    ),

            note :

                "Pilih grade 2 jika tersedia pada rule."

        },


        /* =================================================
           QTY
           
           WAJIB.
           
           Qty digunakan oleh Payroll Daily Engine
           untuk menghitung :
           
               nominal × qty
        ================================================= */

        {

            id :

                "qty",

            label :

                "Qty",

            type :

                "number",

            placeholder :

                "Contoh: 100",

            required :

                true,

            min :

                1,

            step :

                1,

            showWhen :

                values =>

                    Boolean(

                        values.nama

                    ),

            note :

                "Masukkan jumlah hasil kerja. Qty wajib diisi."

        }

    ],


    /* =================================================
       DEFAULT VALUES
       
       Status Payroll Daily selalu masuk.
       
       Tidak ditampilkan sebagai field.
    ================================================= */

    defaults : {

        status :

            "masuk"

    }

};


/* =====================================================
   GET CONFIG
===================================================== */

export function getDailyInputConfig(){

    return Daily;

}


/* =====================================================
   GET DEFAULT STATUS
===================================================== */

export function getDailyDefaultStatus(){

    return "masuk";

}


/* =====================================================
   GET NAMA OPTIONS
===================================================== */

export function getDailyNama(){

    return getDailyNamaOptions();

}


/* =====================================================
   DEBUG
===================================================== */

export function debugDailyInput(

    values = {}

){

    const resolved =

        resolveDailyHierarchy(

            values

        );


    const complete =

        isDailyComplete(

            values

        );


    const rule =

        getDailyWorkRule(

            values

        );


    console.log(

        "PAYROLL DAILY INPUT:",

        {

            values :

                values,

            resolved :

                resolved,

            complete :

                complete,

            rule :

                rule

        }

    );


    return {

        values :

            values,

        resolved :

            resolved,

        complete :

            complete,

        rule :

            rule

    };

}
