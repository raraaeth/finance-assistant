/* =====================================================
   Finance Assistant
   Workspace   : Kas
   Module      : Process
   File        : process.js
   Version     : 2.1.0

   Description :
   Business Engine Kas

   Sections :
   - State
   - Init
   - Normalize
   - Data
   - Balance
   - Debt
   - Summary
   - Chart
   - Helper
===================================================== */


/* =====================================================
   STATE
===================================================== */

export const Process = {

    raw : [],

    member : [],

    data : [],

    balance : {},

    summary : {},

    chart : [],

    debt : {},

    debtHistory : []

};


/* =====================================================
   INIT
===================================================== */

Process.init = function(

    raw,

    member

){

    Process.raw =

        raw;

    Process.member =

        member;

    normalize();

    processData();

    processBalance();

    processDebt();

    processSummary();

    processChart();

};


/* =====================================================
   NORMALIZE
===================================================== */

function normalize(){

    Process.raw =

        Process.raw

        .map(item=>{

            const date =

                new Date(

                    item.tanggal

                );

            return {

                ...item,

                nominal :

                    Number(

                        item.nominal

                    ),

                date,

                month :

                    date.getMonth() + 1,

                year :

                    date.getFullYear()

            };

        })

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
   DATA
===================================================== */

function processData(){

    Process.data =

        Process.raw.map(item=>({

            id :

                item.id,

            tanggal :

                item.tanggal,

            date :

                item.date,

            month :

                item.month,

            year :

                item.year,

            jenis :

                item.jenis,

            kategori :

                item.kategori,

            nama :

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

    Process.member.forEach(

        item=>{

            Process.balance[

                item.nama

            ] = {

                income : 0,

                expense : 0,

                balance : 0

            };

        }

    );

    Process.data.forEach(

        calculateBalance

    );

}


/* =====================================================
   DEBT
===================================================== */

function processDebt(){

    Process.debt = {};

    Process.debtHistory = [];


    /* ==============================================
       INIT MEMBER
    ============================================== */

    Process.member.forEach(

        item=>{

            Process.debt[

                item.nama

            ] = {

                borrowed : 0,

                paid : 0,

                balance : 0

            };

        }

    );


    /* ==============================================
       PROCESS TRANSACTION
    ============================================== */

    Process.data.forEach(

        item=>{

            if(

                item.jenis !== "pinjam" &&

                item.jenis !== "bayar"

            ){

                return;

            }


            const member =

                item.nama;

            const amount =

                Math.abs(

                    item.nominal

                );


            /* ======================================
               CREATE MEMBER IF NOT EXIST
            ====================================== */

            if(

                !Process.debt[

                    member

                ]

            ){

                Process.debt[

                    member

                ] = {

                    borrowed : 0,

                    paid : 0,

                    balance : 0

                };

            }


            /* ======================================
               PINJAM
            ====================================== */

            if(

                item.jenis ===

                "pinjam"

            ){

                Process.debt[

                    member

                ].borrowed +=

                    amount;

                Process.debt[

                    member

                ].balance +=

                    amount;

            }


            /* ======================================
               BAYAR
            ====================================== */

            if(

                item.jenis ===

                "bayar"

            ){

                Process.debt[

                    member

                ].paid +=

                    amount;

                Process.debt[

                    member

                ].balance -=

                    amount;

            }


            /* ======================================
               HISTORY
            ====================================== */

            Process.debtHistory.push({

                id :

                    item.id,

                tanggal :

                    item.tanggal,

                date :

                    item.date,

                jenis :

                    item.jenis,

                nama :

                    member,

                nominal :

                    amount,

                keterangan :

                    item.keterangan

            });

        }

    );


    /* ==============================================
       SORT HISTORY
       Terbaru → Terlama
    ============================================== */

    Process.debtHistory.sort(

        (

            a,

            b

        )=>

            b.date -

            a.date

    );

}


/* =====================================================
   HELPER
===================================================== */

function calculateBalance(

    item

){

    const member =

        item.nama;

    const amount =

        item.nominal;

    if(

        !Process.balance[

            member

        ]

    ){

        Process.balance[

            member

        ] = {

            income : 0,

            expense : 0,

            balance : 0

        };

    }

    switch(

        item.jenis

    ){

        case "masuk":

            Process.balance[

                member

            ].income +=

                amount;

            Process.balance[

                member

            ].balance +=

                amount;

            break;


        case "keluar":

            Process.balance[

                member

            ].expense +=

                amount;

            Process.balance[

                member

            ].balance -=

                amount;

            break;

    }

}


/* =====================================================
   SUMMARY
===================================================== */

function processSummary(){

    let totalBalance = 0;

    let totalIncome = 0;

    let totalExpense = 0;

    let weeklyIncome = 0;

    let weeklyExpense = 0;

    let monthlyIncome = 0;

    let monthlyExpense = 0;


    /* ==============================================
       TOTAL
    ============================================== */

    Object.values(

        Process.balance

    ).forEach(

        item=>{

            totalBalance +=

                item.balance;

            totalIncome +=

                item.income;

            totalExpense +=

                item.expense;

        }

    );


    /* ==============================================
       CURRENT DATE
    ============================================== */

    const today =

        new Date();


    const currentMonth =

        today.getMonth() + 1;


    const currentYear =

        today.getFullYear();


    /* ==============================================
       7 DAYS AGO
    ============================================== */

    const weekAgo =

        new Date(

            today

        );

    weekAgo.setDate(

        weekAgo.getDate() - 7

    );


    /* ==============================================
       PERIODIC SUMMARY
    ============================================== */

    Process.data.forEach(

        item=>{


            /* ======================================
               WEEKLY
            ====================================== */

            if(

                item.date >=

                weekAgo &&

                item.date <=

                today

            ){

                switch(

                    item.jenis

                ){

                    case "masuk":

                        weeklyIncome +=

                            item.nominal;

                        break;


                    case "keluar":

                        weeklyExpense +=

                            item.nominal;

                        break;

                }

            }


            /* ======================================
               MONTHLY
            ====================================== */

            if(

                item.month ===

                currentMonth &&

                item.year ===

                currentYear

            ){

                switch(

                    item.jenis

                ){

                    case "masuk":

                        monthlyIncome +=

                            item.nominal;

                        break;


                    case "keluar":

                        monthlyExpense +=

                            item.nominal;

                        break;

                }

            }

        }

    );


    /* ==============================================
       SUMMARY
    ============================================== */

    Process.summary = {

        totalBalance,

        totalIncome,

        totalExpense,

        weeklyIncome,

        weeklyExpense,

        monthlyIncome,

        monthlyExpense,

        totalMember :

            Process.member.length,

        totalTransaction :

            Process.data.length

    };

}


/* =====================================================
   CHART
===================================================== */

function processChart(){

    const chart = {};

    Process.data.forEach(

        item=>{

            const date =

                item.tanggal;

            if(

                !chart[

                    date

                ]

            ){

                chart[

                    date

                ] = 0;

            }

            switch(

                item.jenis

            ){

                case "masuk":

                    chart[

                        date

                    ] +=

                        item.nominal;

                    break;


                case "keluar":

                    chart[

                        date

                    ] -=

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
