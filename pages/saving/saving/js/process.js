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
   - Summary
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

    summary : {},

    chart : []

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

    processSummary();

    processChart();

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

        Process.raw.map(item=>({

            id :

                item.id,

            tanggal :

                item.tanggal,

            date :

                item.date,

            jenis :

                item.jenis,

            kategori :

                item.kategori,

            bank :

                item.bank,

            tujuan :

                item.nama,

            nominal :

                item.nominal,

            keterangan :

                item.keterangan ??

                ""

        }));

}


/* =====================================================
   BALANCE
===================================================== */

function processBalance(){

    Process.balance = {};

    Process.transaction.forEach(

        calculateBalance

    );

}


/* =====================================================
   SUMMARY
===================================================== */

function processSummary(){

    let totalBalance = 0;

    let totalIncome = 0;

    let totalExpense = 0;

    let totalTransfer = 0;

    Object.values(

        Process.balance

    ).forEach(item=>{

        totalBalance +=

            item.balance;

        totalIncome +=

            item.income;

        totalExpense +=

            item.expense;

        totalTransfer +=

            item.transferIn;

    });

    Process.summary = {

        totalBalance,

        totalIncome,

        totalExpense,

        totalTransfer,

        totalTransaction :

            Process.transaction

            .length

    };

}

/* =====================================================
   CHART
===================================================== */

function processChart(){

    const chart = {};

    Process.transaction.forEach(

        item=>{

            const date =

                item.tanggal;

            if(

                !chart[date]

            ){

                chart[date] = 0;

            }

            switch(

                item.jenis

            ){

                case "masuk":

                    chart[date] +=

                        item.nominal;

                    break;

                case "keluar":

                    chart[date] -=

                        item.nominal;

                    break;

            }

        }

    );

    Process.chart =

        Object.entries(

            chart

        ).map(

            ([

                date,

                total

            ])=>({

                date,

                total

            })

        );

}


/* =====================================================
   HELPER
===================================================== */

function calculateBalance(

    item

){

    const from =

        item.bank;

    const to =

        item.tujuan;

    const amount =

        item.nominal;

    if(

        from &&

        !Process.balance[from]

    ){

        Process.balance[from] = {

            income : 0,

            expense : 0,

            transferIn : 0,

            transferOut : 0,

            balance : 0

        };

    }

    if(

        to &&

        !Process.balance[to]

    ){

        Process.balance[to] = {

            income : 0,

            expense : 0,

            transferIn : 0,

            transferOut : 0,

            balance : 0

        };

    }

    switch(

        item.jenis

    ){

        case "masuk":

            Process.balance[from]

                .income += amount;

            Process.balance[from]

                .balance += amount;

            break;

        case "keluar":

            Process.balance[from]

                .expense += amount;

            Process.balance[from]

                .balance -= amount;

            break;

        case "transfer":

            Process.balance[from]

                .transferOut += amount;

            Process.balance[from]

                .balance -= amount;

            if(

                to

            ){

                Process.balance[to]

                    .transferIn += amount;

                Process.balance[to]

                    .balance += amount;

            }

            break;

    }

}
