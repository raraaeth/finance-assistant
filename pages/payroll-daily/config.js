/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Config
   File        : config.js
   Version     : 2.0.0

   Description :
   Payroll Daily Configuration
===================================================== */


/* =====================================================
   CONFIG
===================================================== */

export const CONFIG = {


    /* =================================================
       MODULE
    ================================================= */

    module : {

        key :

            "payrollDaily",

        name :

            "Payroll Daily"

    },


    /* =================================================
       APP
    ================================================= */

    app : {

        name :

            "Payroll Daily",

        version :

            "1.0.0"

    },


    /* =================================================
       SHEET
    ================================================= */

    sheet : {

        daily :

            "payroll_daily",

        rules :

            "payroll_daily_rules"

    },


    /* =================================================
       DATA
    ================================================= */

    data : {

        statusMasuk :

            "masuk",

        productionName :

            "nama",

        grade1 :

            "grade_1",

        grade2 :

            "grade_2",

        quantity :

            "qty"

    },


    /* =================================================
       RULE
    ================================================= */

    rule : {

        typeWork :

            "rule_work",

        typeAdd :

            "rule_tambah",

        typeDeduct :

            "rule_potong",

        typeSalary :

            "rule_gaji"

    },


    /* =================================================
       RULE MATCHING
    ================================================= */

    matching : {

        /* ---------------------------------------------
           Prioritas pencarian tarif
        --------------------------------------------- */

        priority : [

            "grade_2",

            "grade_1",

            "nama"

        ]

    },


    /* =================================================
       PERIOD
    ================================================= */

    period : {

        salary :

            "bulanan",

        daily :

            "harian"

    },


    /* =================================================
       CURRENCY
    ================================================= */

    currency : {

        code :

            "IDR",

        locale :

            "id-ID"

    },


    /* =================================================
       HERO
    ================================================= */

    hero : {

        description :

            "Lihat hasil kerja dan penghasilan kamu hari ini.",

        image :

            "../assets/images/hero/hero-payroll.png"

    }

};
