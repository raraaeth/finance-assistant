/* =====================================================
   Finance Assistant
   Page        : Airdrop
   Module      : Summary
   File        : summary.js
   Version     : 1.0.0

   Description :
   Airdrop Summary Controller

   Sections :
   - Import
   - State
   - Init
   - Overview
   - Distribution
   - Wallet Distribution
   - Detail Preparation
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

    usd

} from "../../js/utils.js";


/* =====================================================
   STATE
===================================================== */

export const Summary = {

    initialized : false,

    walletData : [],

    detail : {

        win : [],

        ongoing : [],

        ended : []

    }

};


/* =====================================================
   INIT
===================================================== */

Summary.init = function(){

    if(

        !Process.data ||

        !Array.isArray(

            Process.data

        )

    ){

        return;

    }


    buildWalletData();

    buildDetail();


    renderOverview();

    renderDistribution();

    renderWalletDistribution();


    Summary.initialized =

        true;

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


    const total =

        Process.data.length;


    const ongoing =

        Process.summary.totalOngoing;


    const win =

        Process.summary.totalWin;


    const notWin =

        Process.summary.totalNotWin;


    const ended =

        Process.summary.totalEnded;


    card.innerHTML =

    `

        <div class="airdrop-summary-overview">


            <!-- TOTAL -->

            <div class="airdrop-summary-total">

                <span class="airdrop-summary-total-icon">

                    🎯

                </span>

                <span class="airdrop-summary-total-label">

                    Total Airdrop

                </span>

                <strong>

                    ${total}

                </strong>

            </div>


            <!-- STATUS GRID -->

            <div class="airdrop-summary-status-grid">


                <div class="airdrop-summary-status">

                    <span class="airdrop-summary-status-icon">

                        ⏳

                    </span>

                    <span>

                        Ongoing

                    </span>

                    <strong>

                        ${ongoing}

                    </strong>

                </div>


                <div class="airdrop-summary-status">

                    <span class="airdrop-summary-status-icon">

                        🏆

                    </span>

                    <span>

                        Win

                    </span>

                    <strong>

                        ${win}

                    </strong>

                </div>


                <div class="airdrop-summary-status">

                    <span class="airdrop-summary-status-icon">

                        ❌

                    </span>

                    <span>

                        Not Win

                    </span>

                    <strong>

                        ${notWin}

                    </strong>

                </div>


                <div class="airdrop-summary-status">

                    <span class="airdrop-summary-status-icon">

                        ⏹️

                    </span>

                    <span>

                        Ended

                    </span>

                    <strong>

                        ${ended}

                    </strong>

                </div>


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


    const data = [

        Process.summary.totalOngoing,

        Process.summary.totalEnded,

        Process.summary.totalWin,

        Process.summary.totalNotWin

    ];


    Chart.renderDoughnut({

        canvas :

            "#summary-distribution-chart",

        labels : [

            "Ongoing",

            "Ended",

            "Win",

            "Not Win"

        ],

        data

    });

}


/* =====================================================
   WALLET DISTRIBUTION
===================================================== */

function renderWalletDistribution(){

    const container =

        document.getElementById(

            "summary-distribution-list"

        );


    if(

        !container

    ){

        return;

    }


    if(

        !Summary.walletData.length

    ){

        container.innerHTML =

            `

            <div class="summary-empty">

                Belum ada data wallet.

            </div>

            `;

        return;

    }


    container.innerHTML =

        Summary.walletData

            .map(

                createWalletItem

            )

            .join("");

}


/* =====================================================
   WALLET ITEM
===================================================== */

function createWalletItem(

    wallet

){

    const total =

        wallet.ongoing +

        wallet.ended +

        wallet.win +

        wallet.notWin;


    if(

        total === 0

    ){

        return "";

    }


    return `

        <div class="airdrop-wallet-item">


            <div class="airdrop-wallet-header">

                <strong>

                    ${formatText(

                        wallet.wallet

                    )}

                </strong>


                <span>

                    ${total}

                </span>

            </div>


            <div class="airdrop-wallet-bars">


                ${

                    createWalletBar(

                        "ongoing",

                        "⏳",

                        "Ongoing",

                        wallet.ongoing,

                        total

                    )

                }


                ${

                    createWalletBar(

                        "ended",

                        "⏹️",

                        "Ended",

                        wallet.ended,

                        total

                    )

                }


                ${

                    createWalletBar(

                        "win",

                        "🏆",

                        "Win",

                        wallet.win,

                        total

                    )

                }


                ${

                    createWalletBar(

                        "not-win",

                        "❌",

                        "Not Win",

                        wallet.notWin,

                        total

                    )

                }


            </div>


        </div>

    `;

}


/* =====================================================
   WALLET BAR
===================================================== */

function createWalletBar(

    status,

    icon,

    label,

    value,

    total

){

    if(

        value <= 0

    ){

        return "";

    }


    const percentage =

        Math.round(

            (

                value /

                total

            ) *

            100

        );


    return `

        <div

            class="airdrop-wallet-bar-row

            airdrop-wallet-${status}">


            <div class="airdrop-wallet-bar-label">

                <span>

                    ${icon}

                </span>

                <small>

                    ${label}

                </small>

                <strong>

                    ${value}

                </strong>

            </div>


            <div class="airdrop-wallet-bar-track">

                <div

                    class="airdrop-wallet-bar-fill"

                    style="width:${percentage}%">

                </div>

            </div>


        </div>

    `;

}


/* =====================================================
   BUILD WALLET DATA
===================================================== */

function buildWalletData(){

    const wallets = {};


    Process.data.forEach(

        item => {

            const wallet =

                item.wallet ||

                "unknown";


            if(

                !wallets[wallet]

            ){

                wallets[wallet] = {

                    wallet,

                    ongoing : 0,

                    ended : 0,

                    win : 0,

                    notWin : 0

                };

            }


            switch(

                item.status

            ){

                case "ongoing":

                    wallets[wallet].ongoing++;

                    break;


                case "ended":

                    wallets[wallet].ended++;

                    break;


                case "win":

                    wallets[wallet].win++;

                    break;


                case "not_win":

                    wallets[wallet].notWin++;

                    break;

            }

        }

    );


    Summary.walletData =

        Object.values(

            wallets

        );

}


/* =====================================================
   DETAIL
===================================================== */

function buildDetail(){

    Summary.detail = {

        win :

            Process.win.map(

                item => ({

                    ...item

                })

            ),


        ongoing :

            Process.ongoing.map(

                item => ({

                    ...item

                })

            ),


        ended :

            Process.ended.map(

                item => ({

                    ...item

                })

            )

    };

}


/* =====================================================
   PUBLIC DETAIL
===================================================== */

Summary.getDetail = function(){

    return {

        win :

            [

                ...Summary.detail.win

            ],


        ongoing :

            [

                ...Summary.detail.ongoing

            ],


        ended :

            [

                ...Summary.detail.ended

            ]

    };

};


/* =====================================================
   PUBLIC WALLET DATA
===================================================== */

Summary.getWalletData = function(){

    return Summary.walletData.map(

        item => ({

            ...item

        })

    );

};


/* =====================================================
   HELPER
===================================================== */

function formatText(

    value

){

    if(

        !value

    ){

        return "-";

    }


    return String(

        value

    )

        .replace(

            /_/g,

            " "

        )

        .replace(

            /\b\w/g,

            letter =>

                letter.toUpperCase()

        );

}
