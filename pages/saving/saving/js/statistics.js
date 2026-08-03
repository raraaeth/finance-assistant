/* =====================================================
   Finance Assistant
   Workspace   : Saving
   Module      : Statistics
   File        : statistics.js
   Version     : 1.0.0

   Description :
   Statistics Controller

   Sections :
   - State
   - Init
   - Filter
   - Chart
   - Transaction
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Process

} from "./process.js";


/* =====================================================
   STATE
===================================================== */

export const Statistics = {

    filter : {

        period :

            "all",

        type :

            "all",

        bank :

            "all",

        category :

            "all",

        method :

            "all"

    },

    data : []

};


/* =====================================================
   INIT
===================================================== */

Statistics.init = function(){

    Statistics.data =

        Process.transaction;

};


/* =====================================================
   FILTER
===================================================== */

Statistics.applyFilter = function(){

};


/* =====================================================
   CHART
===================================================== */

Statistics.renderChart = function(){

};


/* =====================================================
   TRANSACTION
===================================================== */

Statistics.renderTransaction = function(){

};
