/* =====================================================
   Finance Assistant
   Page        : Airdrop
   Module      : Summary
   File        : summary.js
   Version     : 1.1.0

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
   - Detail Rendering
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


    /* =============================================
       BUILD DATA
    ============================================= */

    buildWalletData();

    buildDetail();


    /* =============================================
       RENDER SUMMARY
    ============================================= */

    renderOverview();

    renderDistribution();

    renderWalletDistribution();


    /* =============================================
       RENDER AIRDROP DETAIL
    ============================================= */

    renderDetail();


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


            <!-- ======================================
                 TOTAL
            ======================================= -->

            <div class="airdrop-summary-total">

                <span class="airdrop-summary-total-icon">

                    🎁

                </span>

                <span class="airdrop-summary-total-label">

                    Total Campaign Airdrop

                </span>

                <strong>

                    ${total}

                </strong>

            </div>


            <!-- ======================================
                 STATUS GRID
            ======================================= -->

            <div class="airdrop-summary-status-grid">


                <!-- ONGOING -->

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


                <!-- WIN -->

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


                <!-- NOT WIN -->

                <div class="airdrop-summary-status">

                    <span class="airdrop-summary-status-icon">

                        👾

                    </span>

                    <span>

                        Not Win

                    </span>

                    <strong>

                        ${notWin}

                    </strong>

                </div>


                <!-- ENDED -->

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


    /* =============================================
       DATA STATUS
    ============================================= */

    const ongoing =

        Number(

            Process.summary?.totalOngoing

        ) || 0;


    const ended =

        Number(

            Process.summary?.totalEnded

        ) || 0;


    const win =

        Number(

            Process.summary?.totalWin

        ) || 0;


    const notWin =

        Number(

            Process.summary?.totalNotWin

        ) || 0;


    const labels = [

        "Ongoing",

        "Ended",

        "Win",

        "Not Win"

    ];


    const values = [

        ongoing,

        ended,

        win,

        notWin

    ];


    /* =============================================
       CEK DATA
    ============================================= */

    const total =

        values.reduce(

            (

                sum,

                value

            ) =>

                sum + value,

            0

        );


    if(

        total <= 0

    ){

        return;

    }


    /* =============================================
       DONUT
    ============================================= */

    Chart.renderDoughnut({

        canvas :

            "#summary-distribution-chart",


        labels,


        datasets : [

            {

                data :

                    values,

                backgroundColor : [

                    "#F59E0B", // Ongoing

                    "#94A3B8", // Ended

                    "#22C55E", // Win

                    "#EF4444"  // Not Win

                ]

            }

        ]

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
   DETAIL PREPARATION
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
   DETAIL RENDER
===================================================== */

function renderDetail(){

    const section =

        document.getElementById(

            "summary-airdrop-detail"

        );


    const card =

        document.getElementById(

            "summary-airdrop-detail-card"

        );


    if(

        !section ||

        !card

    ){

        return;

    }


    const win =

        Summary.detail.win;


    const ongoing =

        Summary.detail.ongoing;


    const ended =

        Summary.detail.ended;


    /* =============================================
       NO DETAIL
    ============================================= */

    if(

        !win.length &&

        !ongoing.length &&

        !ended.length

    ){

        section.classList.add(

            "hidden"

        );

        return;

    }


    /* =============================================
       SHOW SECTION
    ============================================= */

    section.classList.remove(

        "hidden"

    );


    /* =============================================
       RENDER WIN
    ============================================= */

    renderDetailGroup({

        group :

            document.getElementById(

                "airdrop-detail-win"

            ),

        count :

            document.getElementById(

                "airdrop-detail-win-count"

            ),

        list :

            document.getElementById(

                "airdrop-detail-win-list"

            ),

        data :

            win,

        type :

            "win"

    });


    /* =============================================
       RENDER ONGOING
    ============================================= */

    renderDetailGroup({

        group :

            document.getElementById(

                "airdrop-detail-ongoing"

            ),

        count :

            document.getElementById(

                "airdrop-detail-ongoing-count"

            ),

        list :

            document.getElementById(

                "airdrop-detail-ongoing-list"

            ),

        data :

            ongoing,

        type :

            "ongoing"

    });


    /* =============================================
       RENDER ENDED
    ============================================= */

    renderDetailGroup({

        group :

            document.getElementById(

                "airdrop-detail-ended"

            ),

        count :

            document.getElementById(

                "airdrop-detail-ended-count"

            ),

        list :

            document.getElementById(

                "airdrop-detail-ended-list"

            ),

        data :

            ended,

        type :

            "ended"

    });

}


/* =====================================================
   DETAIL GROUP
===================================================== */

function renderDetailGroup({

    group,

    count,

    list,

    data,

    type

}){

    if(

        !group ||

        !count ||

        !list

    ){

        return;

    }


    /* =============================================
       EMPTY GROUP
    ============================================= */

    if(

        !data.length

    ){

        group.classList.add(

            "hidden"

        );

        count.textContent =

            "0";

        list.innerHTML =

            "";

        return;

    }


    /* =============================================
       SHOW GROUP
    ============================================= */

    group.classList.remove(

        "hidden"

    );


    count.textContent =

        String(

            data.length

        );


    list.innerHTML =

        data

            .map(

                item =>

                    createDetailItem(

                        item,

                        type

                    )

            )

            .join("");

}


/* =====================================================
   DETAIL ITEM
===================================================== */

function createDetailItem(

    item,

    type

){

    const project =

        escapeHTML(

            item.project ||

            "-"

        );


    /* =============================================
       WIN
    ============================================= */

    if(

        type === "win"

    ){

        const reward =

            Number(

                item.reward

            ) || 0;


        return `

            <div class="airdrop-detail-item">


                <div class="airdrop-detail-item-info">

                    <strong>

                        ${project}

                    </strong>

                </div>


                <strong class="airdrop-detail-item-reward">

                    ${

                        usd(

                            reward

                        )

                    }

                </strong>


            </div>

        `;

    }


    /* =============================================
       ONGOING / ENDED
    ============================================= */

    return `

        <div class="airdrop-detail-item">


            <div class="airdrop-detail-item-info">

                <strong>

                    ${project}

                </strong>

            </div>


        </div>

    `;

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


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(

    value

){

    return String(

        value ??

        ""

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
