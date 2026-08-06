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

import {

    Icon

} from

"../../../../js/icon.js";

import {

    Animation

} from

"../../../../js/animation.js";


/* =====================================================
   SUMMARY
===================================================== */

export const Summary = {};


/* =====================================================
   INIT
===================================================== */

Summary.init = function(){

    renderOverview();

    renderDistribution();

    renderDistributionList();

};

/* =====================================================
   PLAY
===================================================== */

Summary.play = function(){

    renderDistribution();

    Animation.play(

        "#summary-page"

    );

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

            <h2

    id="summary-overview-total"

    data-animation="count"

    data-target="${Process.summary.totalBalance}"

>

    Rp0

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

            data : values,

            backgroundColor : [

                "#4F7CFF",

                "#64B5F6",

                "#4DD0E1",

                "#81C784",

                "#FFD54F",

                "#FF8A65"

            ]

        }

    ]

});

}

/* =====================================================
   DISTRIBUTION LIST
===================================================== */

function renderDistributionList(){

    const list =

        document.getElementById(

            "summary-distribution-list"

        );

    if(

        !list

    ){

        return;

    }

    list.innerHTML =

        "";

    const total =

        Process.summary.totalBalance;

    Object.entries(

        Process.balance

    ).forEach(

        ([

            name,

            item

        ])=>{

            const percent =

                total === 0

                ?

                0

                :

                (

                    item.balance /

                    total

                ) * 100;

            list.innerHTML +=

            `

            <div class="distribution-item">

                <div class="distribution-header">

    <div class="distribution-bank">

        <img

            class="distribution-icon"

            src="${

                Icon.bank(

                    name

                )

            }"

            alt="${name}"

        >

        <span>

            ${

                formatBankName(

                    name

                )

            }

        </span>

    </div>

    <strong>

        ${

            rupiah(

                item.balance

            )

        }

    </strong>

</div>

                <div class="distribution-bar">

                    <div

    class="distribution-fill"

    data-animation="bar"

    data-width="${percent}%"

>

</div>

                <div class="distribution-percent">

                    ${percent.toFixed(1)}%

                </div>

            </div>

            `;

        }
       
       );

}


/* =====================================================
   HELPER
===================================================== */

function formatBankName(

    name

){

    return name

        .replace(

            /_/g,

            " "

        )

        .replace(

            /\b\w/g,

            letter=>

                letter.toUpperCase()

        );

}


