/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Config
   File        : config.js
   Version     : 2.0.0

   Description :
   Payroll Monthly Configuration

   Sections :
   - Module
   - Hero
   - API
   - Data
===================================================== */


/* =====================================================
   CONFIG
===================================================== */

export const CONFIG = {


    /* =============================================
       MODULE
    ============================================= */

    module : {

        key :

            "payrollMonthly",

        name :

            "Payroll Monthly"

    },


    /* =============================================
       HERO
    ============================================= */

    hero : {

        title :

            "Payroll Monthly",

        description :

            "Pantau kehadiran dan hitung perkiraan gajimu setiap periode.",

        image :

            "../assets/images/hero/hero-payroll.png"

    },


    /* =============================================
       API
    ============================================= */

    api : {

        endpoint :

            "https://script.google.com/macros/s/AKfycbxBiQSb1pioB0mDbkAqd6S3y4T5CTByn2-6kW7-T1l-5PdGYTBVDX4IXskxyu_QxokHDw/exec"

    },



    /* =============================================
       DATA
    ============================================= */

    data : {

        attendance :

            "payroll_monthly",

        rules :

            "payroll_monthly_rules"

    }

};
