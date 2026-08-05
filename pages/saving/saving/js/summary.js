/* =====================================================
   Finance Assistant
   Workspace   : Saving
   Module      : Summary
   File        : summary.js
   Version     : 1.0.0

   Description :
   Summary Controller

   Sections :
   - Import
   - Init
   - Overview
   - Bank
   - Distribution
   - Distribution List
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

} from

"../../../../js/chart.js";

import {

    rupiah,

    shortRupiah

} from

"../../../../js/utils.js";


/* =====================================================
   SUMMARY
===================================================== */

export const Summary = {};


/* =====================================================
   INIT
===================================================== */

Summary.init = function(){

   console.log(
    Process.summary
);

console.log(
    Process.balance
);

    renderOverview();

    renderBank();

    renderDistribution();

    renderDistributionList();

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

    card.innerHTML =

    `

        <div class="summary-total">

            <p>

                Total Saldo

            </p>

            <h2>

                ${

                    rupiah(

                        Process.summary

                        .totalBalance

                    )

                }

            </h2>

        </div>

        <div class="summary-grid">

            <div class="summary-item">

                <span>

                    Masuk Minggu Ini

                </span>

                <strong>

                    ${

                        shortRupiah(

                            Process.summary

                            .weeklyIncome

                        )

                    }

                </strong>

            </div>

            <div class="summary-item">

                <span>

                    Masuk Bulan Ini

                </span>

                <strong>

                    ${

                        shortRupiah(

                            Process.summary

                            .totalIncome

                        )

                    }

                </strong>

            </div>

            <div class="summary-item">

                <span>

                    Keluar Minggu Ini

                </span>

                <strong>

                    ${

                        shortRupiah(

                            Process.summary

                            .weeklyExpense

                        )

                    }

                </strong>

            </div>

            <div class="summary-item">

                <span>

                    Keluar Bulan Ini

                </span>

                <strong>

                    ${

                        shortRupiah(

                            Process.summary

                            .totalExpense

                        )

                    }

                </strong>

            </div>

        </div>

    `;

}

/* =====================================================
   BANK
===================================================== */

function renderBank(){

    const card =

        document.getElementById(

            "summary-bank-card"

        );

    if(

        !card

    ){

        return;

    }

    card.innerHTML =

        "";

    Object.entries(

        Process.balance

    ).forEach(

        ([

            name,

            item

        ])=>{

            card.innerHTML +=

            `

            <div class="bank-item">

                <div>

                    <strong>

                        ${name}

                    </strong>

                </div>

                <div class="bank-balance">

                    ${

                        rupiah(

                            item.balance

                        )

                    }

                </div>

            </div>

            `;

        }

    );

}


/* =====================================================
   DISTRIBUTION
===================================================== */

function renderDistribution(){

    const canvas =

        document.getElementById(

            "summary-distribution-chart"

        );

    if(

        !canvas

    ){

        return;

    }

    const labels =

        Object.keys(

            Process.balance

        );

    const values =

        Object.values(

            Process.balance

        ).map(

            item=>

                item.balance

        );

    Chart.renderDoughnut({

        canvas :

            "#summary-distribution-chart",

        labels,

        datasets : [

            {

                data :

                    values

            }

        ]

    });

}

/* =====================================================
   DISTRIBUTION LIST
===================================================== */

function renderDistributionList(){

    const card =
    document.getElementById(
        "summary-distribution-list"
    );

    if(

        !card

    ){

        return;

    }

    card.innerHTML =

        "";

}


/* =====================================================
   START
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    Summary.init

);



