/* =====================================================
   Finance Assistant
   Component    : Global Input
   Workspace    : Payroll Daily
   File         : daily.js
   Version      : 2.0.0

   Description :
   Global Input Configuration
   Payroll Daily

   Flow :

       Status
         ↓
       Nama
         ↓
       Grade 1
         ↓
       Grade 2
         ↓
       Qty

   Principle :
   - Status selalu "masuk".
   - Status ditampilkan sebagai input pertama.
   - Tanggal disediakan oleh Controller.
   - User memilih Nama dari rule Payroll Daily.
   - Grade 1 hanya digunakan jika tersedia.
   - Grade 2 hanya digunakan jika tersedia.
   - Level dengan satu pilihan dapat di-resolve
     otomatis oleh hierarchy engine.
   - User tidak mengetik Nama / Grade.
   - Qty wajib diisi.
   - Payroll Daily menggunakan nominal × qty.

   DATA SOURCE :

   Global Workspace
        ↓
   data.js
        ↓
   getInputRules()

   Tidak ada lagi getter khusus
   getPayrollDailyRules().
===================================================== */


/* =====================================================
   IMPORT DATA
===================================================== */

import {

    getInputRules

} from "./data.js";


/* =====================================================
   IMPORT HIERARCHY
===================================================== */

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

        getInputRules();


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

    values = {}

){

    if(

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

    values = {}

){

    if(

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
   GET SINGLE OPTION
=====================================================

   Jika hanya ada satu pilihan,
   nilai tersebut dapat digunakan otomatis.
===================================================== */

function getSingleOption(

    options

){

    if(

        !Array.isArray(

            options

        )

        ||

        options.length !== 1

    ){

        return null;

    }


    return options[0]?.value ??

        null;

}


/* =====================================================
   RESOLVE DAILY HIERARCHY
=====================================================

   Fungsi utama Payroll Daily.

   Contoh :

       nama = headrest

           ↓

       grade_1 kosong
       grade_2 kosong


   Contoh :

       nama = sepatu

           ↓

       grade_1 = sneaker
       grade_2 = trendy


   Contoh :

       nama = baju

           ↓

       grade_1 mempunyai beberapa pilihan

           ↓

       user harus memilih grade_1

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
   RESOLVE DAILY VALUES
=====================================================

   Wrapper khusus input Payroll Daily.

   Fungsi ini memastikan :

   1. Nama sudah ada
   2. Grade 1 otomatis jika hanya satu
   3. Grade 2 otomatis jika hanya satu

   Nilai user tetap dipertahankan jika sudah dipilih.

===================================================== */

export function resolveDailyValues(

    values = {}

){

    const result = {

        status :

            "masuk",


        nama :

            values.nama ??

            "",


        grade_1 :

            values.grade_1 ??

            "",


        grade_2 :

            values.grade_2 ??

            "",


        qty :

            values.qty ??

            ""

    };


    /* =================================================
       TANPA NAMA
    ================================================= */

    if(

        !result.nama

    ){

        return result;

    }


    /* =================================================
       RESOLVE HIERARCHY
    ================================================= */

    const resolved =

        resolveDailyHierarchy(

            result

        );


    result.grade_1 =

        resolved.grade_1 ??

        "";


    result.grade_2 =

        resolved.grade_2 ??

        "";


    return result;

}


/* =====================================================
   CHECK COMPLETE
===================================================== */

export function isDailyComplete(

    values = {}

){

    const resolved =

        resolveDailyValues(

            values

        );


    /* =================================================
       NAMA
    ================================================= */

    if(

        !resolved.nama

    ){

        return false;

    }


    /* =================================================
       HIERARCHY
    ================================================= */

    if(

        !isComplete(

            getRules(),

            resolved

        )

    ){

        return false;

    }


    /* =================================================
       QTY
    ================================================= */

    if(

        resolved.qty ===

        undefined

        ||

        resolved.qty ===

        null

        ||

        String(

            resolved.qty

        ).trim() ===

        ""

    ){

        return false;

    }


    const qty =

        Number(

            resolved.qty

        );


    if(

        !Number.isFinite(

            qty

        )

        ||

        qty < 1

    ){

        return false;

    }


    return true;

}


/* =====================================================
   GET MATCHING WORK RULE
===================================================== */

export function getDailyWorkRule(

    values = {}

){

    const resolved =

        resolveDailyValues(

            values

        );


    return findMatchingRule(

        getRules(),

        resolved

    );

}


/* =====================================================
   GET DAILY NOMINAL
=====================================================

   Mengambil nominal dari matching rule.

   Tidak melakukan perhitungan qty di sini.

===================================================== */

export function getDailyNominal(

    values = {}

){

    const rule =

        getDailyWorkRule(

            values

        );


    if(

        !rule

    ){

        return 0;

    }


    const nominal =

        Number(

            rule.nominal

        );


    return Number.isFinite(

        nominal

    )

        ?

    nominal

        :

    0;

}


/* =====================================================
   CALCULATE DAILY AMOUNT
=====================================================

   Rumus Payroll Daily :

       nominal × qty

===================================================== */

export function calculateDailyAmount(

    values = {}

){

    const nominal =

        getDailyNominal(

            values

        );


    const qty =

        Number(

            values.qty

        );


    if(

        !Number.isFinite(

            qty

        )

        ||

        qty < 1

    ){

        return 0;

    }


    return nominal * qty;

}


/* =====================================================
   PAYROLL DAILY CONFIG
===================================================== */

export const Daily = {


    /* =================================================
       WORKSPACE
    ================================================= */

    workspace :

        "payroll-daily",


    /* =================================================
       TITLE
    ================================================= */

    title :

        "Payroll Daily",


    /* =================================================
       SUBTITLE
    ================================================= */

    subtitle :

        "Catat hasil kerja Payroll Daily",


    /* =================================================
       INPUT STEPS
    ================================================= */

    steps : [


        /* =================================================
           STATUS
           
           Selalu "masuk".
           
           Diletakkan paling awal.
        ================================================= */

        {

            id :

                "status",


            label :

                "Status",


            type :

                "select",


            value :

                "masuk",


            required :

                true,


            disabled :

                true,


            options : [

                {

                    value :

                        "masuk",


                    label :

                        "Masuk"

                }

            ],


            note :

                "Status Payroll Daily otomatis menggunakan Masuk."

        },


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
           
           Ditampilkan hanya jika Nama
           memiliki Grade 1.
           
           Jika hanya satu pilihan,
           hierarchy dapat mengisinya otomatis.
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

                values => {

                    if(

                        !values.nama

                    ){

                        return false;

                    }


                    return (

                        getDailyGrade1Options(

                            values

                        ).length > 0

                    );

                },


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
           
           Ditampilkan hanya jika kombinasi
           Nama + Grade 1 mempunyai Grade 2.
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

                values => {

                    if(

                        !values.nama ||

                        !values.grade_1

                    ){

                        return false;

                    }


                    return (

                        getDailyGrade2Options(

                            values

                        ).length > 0

                    );

                },


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
           
           Rumus :

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
   GET GRADE 1 OPTIONS
===================================================== */

export function getDailyGrade1(

    values = {}

){

    return getDailyGrade1Options(

        values

    );

}


/* =====================================================
   GET GRADE 2 OPTIONS
===================================================== */

export function getDailyGrade2(

    values = {}

){

    return getDailyGrade2Options(

        values

    );

}


/* =====================================================
   GET SINGLE GRADE 1
===================================================== */

export function getDailyAutoGrade1(

    nama

){

    return getSingleOption(

        getDailyGrade1Options({

            nama :

                nama

        })

    );

}


/* =====================================================
   GET SINGLE GRADE 2
===================================================== */

export function getDailyAutoGrade2(

    nama,

    grade1

){

    return getSingleOption(

        getDailyGrade2Options({

            nama :

                nama,

            grade_1 :

                grade1

        })

    );

}


/* =====================================================
   DEBUG
===================================================== */

export function debugDailyInput(

    values = {}

){

    const resolved =

        resolveDailyValues(

            values

        );


    const complete =

        isDailyComplete(

            resolved

        );


    const rule =

        getDailyWorkRule(

            resolved

        );


    const nominal =

        getDailyNominal(

            resolved

        );


    const amount =

        calculateDailyAmount(

            resolved

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

                rule,

            nominal :

                nominal,

            qty :

                resolved.qty,

            amount :

                amount

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

            rule,

        nominal :

            nominal,

        qty :

            resolved.qty,

        amount :

            amount

    };

}
