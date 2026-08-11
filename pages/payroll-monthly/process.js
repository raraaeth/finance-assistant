/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Process
   File        : process.js
   Version     : 2.0.0

   Description :
   Payroll Process Orchestrator

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


/* =====================================================
   STATE
===================================================== */

export const Process = {

    period : {},

    rules : {},

    attendance : {},

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
       RULES
    ============================================= */

    Rules.init(

        rulesRaw

    );


    /* =============================================
       PERIOD
    ============================================= */

    Period.init(

        Rules.data.periode

    );


    /* =============================================
       ATTENDANCE
    ============================================= */

    Attendance.init(

        attendanceRaw

    );


    /* =============================================
       EXPOSE RESULT
    ============================================= */

    Process.period =

        Period.data;


    Process.rules =

        Rules.data;


    Process.attendance = {

        data :

            Attendance.data,

        summary :

            Attendance.summary

    };


    /* =============================================
       SUMMARY
    ============================================= */

    Process.summary = {

        period :

            Process.period,

        attendance :

            Process.attendance.summary

    };


        /* =============================================
       DEBUG PROCESS
    ============================================= */

    console.log(

        "========== PROCESS =========="

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

        "PROCESS SUMMARY:",

        Process.summary

    );

};
