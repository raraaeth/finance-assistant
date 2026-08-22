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

            "https://script.google.com/macros/s/AKfycbwqjDC7jXtaCACwAp8HeA8ZeEE7NxexBhEPNQpP2JdeY2-n4LmWVg1psD-M3PXwmC-d/exec"

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
