/* =====================================================
   Finance Assistant
   Workspace   : Saving
   Module      : Process
   File        : process.js
   Version     : 1.0.0

   Description :
   Business Engine Saving

   Sections :
   - State
   - Init
   - Normalize
   - Transaction
   - Balance
   - Statistics
   - Summary
   - Getter
   - Helper
===================================================== */


/* =====================================================
   STATE
===================================================== */

export const Process = {

    raw : [],

    bank : [],

    transaction : [],

    balance : {},

    statistics : {},

    summary : {}

};


/* =====================================================
   INIT
===================================================== */

Process.init = function(

    raw,

    bank

){

    Process.raw =

        raw;

    Process.bank =

        bank;

    normalize();

    processTransaction();

    processBalance();

    processStatistics();

    processSummary();

};


/* =====================================================
   NORMALIZE
===================================================== */

function normalize(){

    Process.raw =

        Process.raw

        .map(item=>({

            ...item,

            nominal :

                Number(

                    item.nominal

                ),

            date :

                new Date(

                    item.tanggal

                )

        }))

        .sort(

            (

                a,

                b

            )=>

                a.date -

                b.date

        );

}


/* =====================================================
   TRANSACTION
===================================================== */

function processTransaction(){

    Process.transaction =

        [

            ...Process.raw

        ];

}


/* =====================================================
   BALANCE
===================================================== */

function processBalance(){

    Process.balance = {};

}


/* =====================================================
   STATISTICS
===================================================== */

function processStatistics(){

    Process.statistics = {

        monthly : {},

        category : {},

        bank : {},

        type : {}

    };

}


/* =====================================================
   SUMMARY
===================================================== */

function processSummary(){

    Process.summary = {

        totalBalance : 0,

        totalIncome : 0,

        totalExpense : 0,

        totalTransfer : 0,

        totalTransaction :

            Process.transaction

            .length

    };

}


/* =====================================================
   GETTER
===================================================== */

Process.getTransaction =

    function(){

        return Process.transaction;

    };

Process.getBalance =

    function(){

        return Process.balance;

    };

Process.getStatistics =

    function(){

        return Process.statistics;

    };

Process.getSummary =

    function(){

        return Process.summary;

    };


/* =====================================================
   HELPER
===================================================== */

function calculateIncome(){

}


function calculateExpense(){

}


function calculateTransfer(){

}


function calculateBalance(){

}


function sortTransaction(){

}
