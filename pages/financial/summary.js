/* =====================================================
   Finance Assistant
   Module      : Financial
   File        : summary.js
   Version     : 1.1.0

   Description :
   Financial Summary Controller

   Sections :
   - Import
   - State
   - Init
   - Overview
   - Financial Position
   - Distribution
   - Distribution List
   - Calculate Overview
   - Helper
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Process

} from "./process.js";


import {

    Chart

} from "../../js/chart.js";


import {

    Animation

} from "../../js/animation.js";


import {

    rupiah,

    shortRupiah

} from "../../js/utils.js";


/* =====================================================
   STATE
===================================================== */

export const Summary = {

    data : [],

    overview : {

        balance : 0,

        currentIncome : 0,

        currentExpense : 0,

        previousIncome : 0,

        previousExpense : 0

    }

};


/* =====================================================
   INIT
===================================================== */

Summary.init = function(

    data = []

){

    Summary.data =

        Array.isArray(

            data

        )

            ?

            data

            :

            [];


    Summary.overview =

        calculateOverview(

            Summary.data

        );


    renderOverview();

    renderFinancialPosition();

    renderDistribution();


    return Summary;

};


/* =====================================================
   OVERVIEW
===================================================== */

function renderOverview(){

    const card =

        document.getElementById(

            "summary-overview-card"

        );


    if(

        !card

    ){

        return;

    }


    const overview =

        Summary.overview;


    card.innerHTML =

    `

        <!-- ==========================================
             CURRENT BALANCE
        =========================================== -->

        <div class="financial-overview-balance">

            <span class="financial-overview-label">

                Total Sisa Saldo Saat Ini

            </span>


            <strong
                id="financial-overview-balance"
                class="financial-overview-balance-value">

                Rp 0

            </strong>

        </div>


        <!-- ==========================================
             MONTHLY SUMMARY
        =========================================== -->

        <div class="financial-overview-monthly">


            <!-- CURRENT MONTH INCOME -->

            <div class="financial-overview-item">

                <span>

                    Pemasukan Bulan Ini

                </span>


                <strong>

                    ${

                        shortRupiah(

                            overview.currentIncome

                        )

                    }

                </strong>

            </div>


            <!-- CURRENT MONTH EXPENSE -->

            <div class="financial-overview-item">

                <span>

                    Pengeluaran Bulan Ini

                </span>


                <strong>

                    ${

                        shortRupiah(

                            overview.currentExpense

                        )

                    }

                </strong>

            </div>


            <!-- PREVIOUS MONTH INCOME -->

            <div class="financial-overview-item">

                <span>

                    Pemasukan Bulan Sebelumnya

                </span>


                <strong>

                    ${

                        shortRupiah(

                            overview.previousIncome

                        )

                    }

                </strong>

            </div>


            <!-- PREVIOUS MONTH EXPENSE -->

            <div class="financial-overview-item">

                <span>

                    Pengeluaran Bulan Sebelumnya

                </span>


                <strong>

                    ${

                        shortRupiah(

                            overview.previousExpense

                        )

                    }

                </strong>

            </div>


        </div>

    `;


    /* =============================================
       BALANCE ANIMATION
    ============================================= */

    Animation.number(

        document.getElementById(

            "financial-overview-balance"

        ),

        overview.balance,

        rupiah,

        1800

    );

}


/* =====================================================
   FINANCIAL POSITION
===================================================== */

function renderFinancialPosition(){

    const section =

        document.getElementById(

            "summary-financial-position"

        );


    const card =

        document.getElementById(

            "summary-financial-position-card"

        );


    if(

        !section ||

        !card

    ){

        return;

    }


    const debt =

        Process.debt;


    const saving =

        Process.saving;


    const danaDarurat =

        saving?.danaDarurat;


    const tabunganKaleng =

        saving?.tabunganKaleng;


    const debtBalance =

        toNumber(

            debt?.outstanding

        );


    const danaDaruratBalance =

        toNumber(

            danaDarurat?.balance

        );


    const tabunganKalengBalance =

        toNumber(

            tabunganKaleng?.balance

        );


    /* =============================================
       SEMUA KOSONG
    ============================================= */

    if(

        debtBalance <= 0 &&

        danaDaruratBalance <= 0 &&

        tabunganKalengBalance <= 0

    ){

        section.classList.add(

            "hidden"

        );

        card.innerHTML = "";

        return;

    }


    section.classList.remove(

        "hidden"

    );


    card.innerHTML = "";


    /* =============================================
       DANA DARURAT
    ============================================= */

    if(

        danaDaruratBalance > 0

    ){

        card.innerHTML +=

            createSavingCard(

                "Dana Darurat",

                danaDarurat,

                "../assets/icons/dana_darurat.webp"

            );

    }


    /* =============================================
       CELENGAN TOPLES
    ============================================= */

    if(

        tabunganKalengBalance > 0

    ){

        card.innerHTML +=

            createSavingCard(

                "Celengan Toples",

                tabunganKaleng,

                "../assets/icons/toples_brangkas.webp"

            );

    }


    /* =============================================
       HUTANG
    ============================================= */

    if(

        debtBalance > 0

    ){

        card.innerHTML +=

            createDebtCard(

                debt

            );

    }

}


/* =====================================================
   SAVING CARD
===================================================== */

function createSavingCard(

    title,

    data,

    icon

){

    const transactions =

        Array.isArray(

            data?.transactions

        )

            ?

            data.transactions

            :

            [];


    const last =

        transactions[

            transactions.length - 1

        ];


    let lastTransaction = "-";


    if(

        last

    ){

        const amount =

            toNumber(

                last.nominal

            );


        const sign =

            last.savingType ===

            "deposit"

                ?

                "+"

                :

                "-";


        lastTransaction =

            sign +

            shortRupiah(

                amount

            );

    }


    return `

        <div class="financial-position-card saving-card">


            <div class="financial-position-header">


                <img

                    class="financial-position-icon"

                    src="${icon}"

                    alt="${escapeHTML(title)}"


                >


                <strong>

                    ${escapeHTML(title)}

                </strong>


            </div>


            <div class="financial-position-value">

                ${

                    shortRupiah(

                        data?.balance ?? 0

                    )

                }

            </div>


            <div class="financial-position-last">

                Tx terakhir :

                ${lastTransaction}

            </div>


        </div>

    `;

}


/* =====================================================
   DEBT CARD
===================================================== */

function createDebtCard(

    debt

){

    return `

        <div class="financial-position-card debt-card">


            <div class="financial-position-header">


                <span class="financial-position-emoji">

                    🏦

                </span>


                <strong>

                    Hutang

                </strong>


            </div>


            <div class="financial-position-row">

                <span>

                    Hutang

                </span>


                <strong>

                    ${

                        shortRupiah(

                            debt?.borrowed ?? 0

                        )

                    }

                </strong>

            </div>


            <div class="financial-position-row">

                <span>

                    Dibayar

                </span>


                <strong>

                    ${

                        shortRupiah(

                            debt?.paid ?? 0

                        )

                    }

                </strong>

            </div>


            <div class="financial-position-row">

                <span>

                    Sisa

                </span>


                <strong>

                    ${

                        shortRupiah(

                            debt?.outstanding ?? 0

                        )

                    }

                </strong>

            </div>


        </div>

    `;

}


/* =====================================================
   DISTRIBUTION
===================================================== */

function renderDistribution(){

    const canvas =

        document.getElementById(

            "summary-distribution-chart"

        );


    const list =

        document.getElementById(

            "summary-distribution-list"

        );


    if(

        !canvas ||

        !list

    ){

        return;

    }


    /* =============================================
       BULAN BERJALAN
    ============================================= */

    const now =

        new Date();


    const currentMonth =

        [

            now.getFullYear(),

            String(

                now.getMonth() + 1

            ).padStart(

                2,

                "0"

            )

        ].join("-");


    /* =============================================
       FILTER TRANSAKSI

       HANYA:

       masuk
       keluar

       Abaikan:

       hutang
       bayar
       nabung
       tarik
    ============================================= */

    const transactions =

        Process.data.filter(

            item => {

                if(

                    !item?.date ||

                    !item.date.startsWith(

                        currentMonth

                    )

                ){

                    return false;

                }


                return (

                    item.jenis === "masuk" ||

                    item.jenis === "keluar"

                );

            }

        );


    /* =============================================
       GROUP ACTIVITY
    ============================================= */

    const income = {};

    const expense = {};


    transactions.forEach(

        item => {

            const name =

                item.nama ??

                "-";


            const nominal =

                toNumber(

                    item.nominal

                );


            if(

                nominal <= 0

            ){

                return;

            }


            if(

                item.jenis === "masuk"

            ){

                income[name] =

                    (

                        income[name] ??

                        0

                    ) +

                    nominal;

            }


            else if(

                item.jenis === "keluar"

            ){

                expense[name] =

                    (

                        expense[name] ??

                        0

                    ) +

                    nominal;

            }

        }

    );


    /* =============================================
       DONUT
    ============================================= */

    renderDistributionDonut(

        canvas,

        income,

        expense

    );


    /* =============================================
       HORIZONTAL BAR
    ============================================= */

    renderDistributionList(

        list,

        income,

        expense

    );

}


/* =====================================================
   DISTRIBUTION DONUT
===================================================== */

function renderDistributionDonut(

    canvas,

    income,

    expense

){

    const incomeLabels =

        Object.keys(

            income

        );


    const expenseLabels =

        Object.keys(

            expense

        );


    const labels = [

        ...incomeLabels,

        ...expenseLabels

    ];


    const values = [

        ...Object.values(

            income

        ),

        ...Object.values(

            expense

        )

    ];


    if(

        !labels.length

    ){

        return;

    }


    /*
     * Mengikuti metode Saving:
     * gunakan Chart.renderDoughnut()
     */

    Chart.renderDoughnut({

        canvas :

            "#summary-distribution-chart",


        labels,


        datasets : [

            {

                data :

                    values,

                backgroundColor : [

                    "#4F7CFF",

                    "#64B5F6",

                    "#4DD0E1",

                    "#81C784",

                    "#FFD54F",

                    "#FF8A65",

                    "#9575CD",

                    "#90A4AE"

                ]

            }

        ]

    });

}


/* =====================================================
   DISTRIBUTION LIST
===================================================== */

function renderDistributionList(

    container,

    income,

    expense

){

    container.innerHTML = "";


    const incomeItems =

        Object.entries(

            income

        )

        .sort(

            (a, b) =>

                b[1] - a[1]

        );


    const expenseItems =

        Object.entries(

            expense

        )

        .sort(

            (a, b) =>

                b[1] - a[1]

        );


    const maxIncome =

        Math.max(

            ...Object.values(

                income

            ),

            0

        );


    const maxExpense =

        Math.max(

            ...Object.values(

                expense

            ),

            0

        );


    /* =============================================
       PEMASUKAN
    ============================================= */

    if(

        incomeItems.length

    ){

        container.innerHTML +=

        `

            <div class="distribution-group">

                <div class="distribution-group-title">

                    Pemasukan

                </div>


                ${

                    incomeItems.map(

                        ([

                            name,

                            value

                        ]) =>

                            createDistributionBar(

                                name,

                                value,

                                maxIncome,

                                "income"

                            )

                    ).join("")

                }

            </div>

        `;

    }


    /* =============================================
       JEDA PEMASUKAN / PENGELUARAN
    ============================================= */

    if(

        incomeItems.length &&

        expenseItems.length

    ){

        container.innerHTML +=

        `

            <div class="distribution-divider">

            </div>

        `;

    }


    /* =============================================
       PENGELUARAN
    ============================================= */

    if(

        expenseItems.length

    ){

        container.innerHTML +=

        `

            <div class="distribution-group">

                <div class="distribution-group-title">

                    Pengeluaran

                </div>


                ${

                    expenseItems.map(

                        ([

                            name,

                            value

                        ]) =>

                            createDistributionBar(

                                name,

                                value,

                                maxExpense,

                                "expense"

                            )

                    ).join("")

                }

            </div>

        `;

    }


    /* =============================================
       EMPTY
    ============================================= */

    if(

        !incomeItems.length &&

        !expenseItems.length

    ){

        container.innerHTML =

        `

            <div class="distribution-empty">

                Belum ada transaksi bulan ini.

            </div>

        `;

    }

}


/* =====================================================
   DISTRIBUTION BAR
===================================================== */

function createDistributionBar(

    name,

    value,

    max,

    type

){

    const percentage =

        max > 0

            ?

            (

                value /

                max

            ) *

            100

            :

            0;


    return `

        <div class="distribution-item">


            <div class="distribution-item-header">


                <span>

                    ${escapeHTML(name)}

                </span>


                <strong>

                    ${shortRupiah(value)}

                </strong>


            </div>


            <div class="distribution-bar-track">


                <div

                    class="distribution-bar-fill ${type}"

                    style="width:${percentage}%">

                </div>


            </div>


        </div>

    `;

}


/* =====================================================
   CALCULATE OVERVIEW
===================================================== */

function calculateOverview(

    data

){

    const now =

        new Date();


    const currentYear =

        now.getFullYear();


    const currentMonth =

        now.getMonth();


    const previousDate =

        new Date(

            currentYear,

            currentMonth - 1,

            1

        );


    const previousYear =

        previousDate.getFullYear();


    const previousMonth =

        previousDate.getMonth();


    let currentIncome = 0;

    let currentExpense = 0;

    let previousIncome = 0;

    let previousExpense = 0;


    data.forEach(

        item => {

            if(

                !item ||

                !item.date

            ){

                return;

            }


            const date =

                parseDate(

                    item.date

                );


            if(

                !date

            ){

                return;

            }


            const nominal =

                toNumber(

                    item.nominal

                );


            /* =====================================
               CURRENT MONTH
            ===================================== */

            if(

                date.getFullYear() ===

                    currentYear &&

                date.getMonth() ===

                    currentMonth

            ){

                if(

                    item.category ===

                    "income"

                ){

                    currentIncome +=

                        nominal;

                }


                else if(

                    item.category ===

                    "expense"

                ){

                    currentExpense +=

                        nominal;

                }

            }


            /* =====================================
               PREVIOUS MONTH
            ===================================== */

            if(

                date.getFullYear() ===

                    previousYear &&

                date.getMonth() ===

                    previousMonth

            ){

                if(

                    item.category ===

                    "income"

                ){

                    previousIncome +=

                        nominal;

                }


                else if(

                    item.category ===

                    "expense"

                ){

                    previousExpense +=

                        nominal;

                }

            }

        }

    );


    return {

        balance :

            Process.summary?.balance ??

            0,


        currentIncome,

        currentExpense,

        previousIncome,

        previousExpense

    };

}


/* =====================================================
   DATE
===================================================== */

function parseDate(

    value

){

    if(

        !value

    ){

        return null;

    }


    const parts =

        String(

            value

        )

        .split("-")

        .map(Number);


    if(

        parts.length !== 3

    ){

        return null;

    }


    const date =

        new Date(

            parts[0],

            parts[1] - 1,

            parts[2]

        );


    return Number.isNaN(

        date.getTime()

    )

        ?

        null

        :

        date;

}


/* =====================================================
   NUMBER
===================================================== */

function toNumber(

    value

){

    const number =

        Number(

            value

        );


    return Number.isFinite(

        number

    )

        ?

        number

        :

        0;

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(

    value

){

    return String(

        value ?? ""

    )

    .replace(

        /&/g,

        "&amp;"

    )

    .replace(

        /</g,

        "&lt;"

    )

    .replace(

        />/g,

        "&gt;"

    )

    .replace(

        /"/g,

        "&quot;"

    )

    .replace(

        /'/g,

        "&#039;"

    );

}
