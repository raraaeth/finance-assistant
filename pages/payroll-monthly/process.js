/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Process
   File        : process.js
   Version     : 2.0.0

   Description :
   Payroll Process Orchestrator

   Flow :
   - Period
   - Rules
   - Attendance
   - Calculation

   Sections :
   - Import
   - State
   - Init
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Period

} from "./period.js";


import {

    Rules

} from "./rules.js";


import {

    Attendance

} from "./attendance.js";


import {

    Calculation

} from "./calculation.js";


/* =====================================================
   STATE
===================================================== */

export const Process = {

    period : {},

    rules : {},

    attendance : {},

    calculation : {},

    summary : {}

};


/* =====================================================
   INIT
===================================================== */

Process.init = function(

    attendanceRaw,

    rulesRaw

){

    /* =============================================
       PERIOD
    ============================================= */

    Period.init(

        rulesRaw

    );


    /* =============================================
       RULES
    ============================================= */

    Rules.init(

        rulesRaw

    );


    /* =============================================
       ATTENDANCE
    ============================================= */

    Attendance.init(

        attendanceRaw

    );


    /* =============================================
       CALCULATION
    ============================================= */

    Calculation.init();


    /* =============================================
       EXPOSE PERIOD
    ============================================= */

    Process.period =

        Period.data;


    /* =============================================
       EXPOSE RULES
    ============================================= */

    Process.rules =

        Rules.data;


    /* =============================================
       EXPOSE ATTENDANCE
    ============================================= */

    Process.attendance = {

        data :

            Attendance.data,

        summary :

            Attendance.summary

    };


    /* =============================================
       EXPOSE CALCULATION
    ============================================= */

    Process.calculation =

        Calculation.data;


    /* =============================================
       SUMMARY
    ============================================= */

    Process.summary = {

        period :

            Process.period,

        attendance :

            Process.attendance.summary,

        calculation : {

            gajiPokok :

                Process.calculation.gajiPokok,

            totalEarnings :

                Process.calculation.totalEarnings,

            totalDeductions :

                Process.calculation.totalDeductions,

            grossSalary :

                Process.calculation.grossSalary,

            netSalary :

                Process.calculation.netSalary

        }

    };


    /* =============================================
       DEBUG PROCESS
    ============================================= */

    console.log(

        "========== PAYROLL PROCESS =========="

    );


    console.log(

        "PROCESS PERIOD:",

        Process.period

    );


    console.log(

        "PROCESS RULES:",

        Process.rules

    );


    console.log(

        "PROCESS ATTENDANCE:",

        Process.attendance

    );


    console.log(

        "PROCESS CALCULATION:",

        Process.calculation

    );


    console.log(

        "PROCESS SUMMARY:",

        Process.summary

    );

};
