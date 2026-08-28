/* =====================================================
   Finance Assistant
   Page        : Airdrop
   Module      : Summary
   File        : summary.js
   Version     : 1.2.0

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
   - Detail Pagination
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

    },

    pagination : {

        win : 1,

        ongoing : 1,

        ended : 1

    },

    perPage : 3

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
       RESET PAGINATION
    ============================================= */

    Summary.pagination = {

        win : 1,

        ongoing : 1,

        ended : 1

    };


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


        labels : labels,


        datasets : [

            {

                data : values,

                backgroundColor : [

                    "#F59E0B",

                    "#94A3B8",

                    "#22C55E",

                    "#EF4444"

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

            sortNewest(

                Process.win

            ),


        ongoing :

            sortNewest(

                Process.ongoing

            ),


        ended :

            sortNewest(

                Process.ended

            )

    };

}


/* =====================================================
   SORT NEWEST
===================================================== */

function sortNewest(

    data

){

    return [

        ...(

            Array.isArray(

                data

            )

                ?

                data

                :

                []

        )

    ].sort(

        (

            a,

            b

        ) => {

            const dateA =

                a?.date

                    ?

                    new Date(

                        a.date

                    ).getTime()

                    :

                    0;


            const dateB =

                b?.date

                    ?

                    new Date(

                        b.date

                    ).getTime()

                    :

                    0;


            return dateB - dateA;

        }

    );

}


/* =====================================================
   DETAIL
===================================================== */

function renderDetail(){

    const section =

        document.getElementById(

            "summary-airdrop-detail"

        );


    if(

        !section

    ){

        return;

    }


    const hasData =

        Summary.detail.win.length ||

        Summary.detail.ongoing.length ||

        Summary.detail.ended.length;


    if(

        !hasData

    ){

        section.classList.add(

            "hidden"

        );

        return;

    }


    section.classList.remove(

        "hidden"

    );


    /* =============================================
       WIN
    ============================================= */

    renderDetailGroup({

        type :

            "win",

        group :

            "airdrop-detail-win",

        count :

            "airdrop-detail-win-count",

        list :

            "airdrop-detail-win-list"

    });


    /* =============================================
       ONGOING
    ============================================= */

    renderDetailGroup({

        type :

            "ongoing",

        group :

            "airdrop-detail-ongoing",

        count :

            "airdrop-detail-ongoing-count",

        list :

            "airdrop-detail-ongoing-list"

    });


    /* =============================================
       ENDED
    ============================================= */

    renderDetailGroup({

        type :

            "ended",

        group :

            "airdrop-detail-ended",

        count :

            "airdrop-detail-ended-count",

        list :

            "airdrop-detail-ended-list"

    });

}


/* =====================================================
   DETAIL GROUP
===================================================== */

function renderDetailGroup({

    type,

    group,

    count,

    list

}){

    const groupElement =

        document.getElementById(

            group

        );


    const countElement =

        document.getElementById(

            count

        );


    const listElement =

        document.getElementById(

            list

        );


    if(

        !groupElement ||

        !countElement ||

        !listElement

    ){

        return;

    }


    const data =

        Summary.detail[type] || [];


    /* =============================================
       EMPTY
    ============================================= */

    if(

        !data.length

    ){

        groupElement.classList.add(

            "hidden"

        );

        countElement.textContent =

            "0";

        listElement.innerHTML =

            "";

        return;

    }


    groupElement.classList.remove(

        "hidden"

    );


    countElement.textContent =

        String(

            data.length

        );


    /* =============================================
       PAGINATION
    ============================================= */

    const totalPage =

        Math.max(

            1,

            Math.ceil(

                data.length /

                Summary.perPage

            )

        );


    let page =

        Summary.pagination[type] || 1;


    if(

        page > totalPage

    ){

        page = totalPage;

        Summary.pagination[type] =

            page;

    }


    const start =

        (

            page - 1

        )

        *

        Summary.perPage;


    const end =

        start +

        Summary.perPage;


    const pageData =

        data.slice(

            start,

            end

        );


    /* =============================================
       RENDER ITEMS
    ============================================= */

    listElement.innerHTML =

        pageData

            .map(

                item =>

                    createDetailItem(

                        item,

                        type

                    )

            )

            .join("");


    /* =============================================
       PAGINATION
    ============================================= */

    renderDetailPagination(

        listElement,

        type,

        page,

        totalPage

    );

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


    const wallet =

        formatText(

            item.wallet

        );


    const campaignType =

        formatText(

            item.type

        );


    const tanggal =

        escapeHTML(

            item.tanggal ||

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

            <article

                class="airdrop-detail-item">


                <div

                    class="airdrop-detail-item-info">


                    <strong>

                        ${project}

                    </strong>


                    <div

                        class="airdrop-detail-item-meta">


                        <span>

                            👛 ${escapeHTML(wallet)}

                        </span>


                        <span>

                            🎯 ${escapeHTML(campaignType)}

                        </span>


                        <span>

                            📅 ${tanggal}

                        </span>


                    </div>


                </div>


                <strong

                    class="airdrop-detail-item-reward">


                    ${

                        usd(

                            reward

                        )

                    }


                </strong>


            </article>

        `;

    }


    /* =============================================
       ONGOING / ENDED
    ============================================= */

    return `

        <article

            class="airdrop-detail-item">


            <div

                class="airdrop-detail-item-info">


                <strong>

                    ${project}

                </strong>


                <div

                    class="airdrop-detail-item-meta">


                    <span>

                        👛 ${escapeHTML(wallet)}

                    </span>


                    <span>

                        🎯 ${escapeHTML(campaignType)}

                    </span>


                    <span>

                        📅 ${tanggal}

                    </span>


                </div>


            </div>


        </article>

    `;

}


/* =====================================================
   DETAIL PAGINATION
===================================================== */

function renderDetailPagination(

    listElement,

    type,

    page,

    totalPage

){

    /* =============================================
       REMOVE OLD PAGINATION
    ============================================= */

    const oldPagination =

        listElement.parentElement.querySelector(

            `.airdrop-detail-pagination[data-type="${type}"]`

        );


    if(

        oldPagination

    ){

        oldPagination.remove();

    }


    /* =============================================
       ONLY ONE PAGE
    ============================================= */

    if(

        totalPage <= 1

    ){

        return;

    }


    const pagination =

        document.createElement(

            "div"

        );


    pagination.className =

        "airdrop-detail-pagination";


    pagination.dataset.type =

        type;


    pagination.innerHTML =

    `

        <button

            type="button"

            class="airdrop-detail-page-button"

            data-detail-prev="${type}"

            ${

                page <= 1

                    ?

                    "disabled"

                    :

                    ""

            }>


            ◀ Sebelumnya

        </button>


        <span

            class="airdrop-detail-page-info">


            ${page}

            /

            ${totalPage}


        </span>


        <button

            type="button"

            class="airdrop-detail-page-button"

            data-detail-next="${type}"

            ${

                page >= totalPage

                    ?

                    "disabled"

                    :

                    ""

            }>


            Berikutnya ▶

        </button>

    `;


    listElement.parentElement.appendChild(

        pagination

    );

}


/* =====================================================
   DETAIL PAGINATION EVENT
===================================================== */

document.addEventListener(

    "click",

    event => {

        const prev =

            event.target.closest(

                "[data-detail-prev]"

            );


        if(

            prev

        ){

            const type =

                prev.dataset.detailPrev;


            if(

                Summary.pagination[type] > 1

            ){

                Summary.pagination[type]--;

                renderDetailGroup({

                    type,

                    group :

                        `airdrop-detail-${type}`,

                    count :

                        `airdrop-detail-${type}-count`,

                    list :

                        `airdrop-detail-${type}-list`

                });

            }


            return;

        }


        const next =

            event.target.closest(

                "[data-detail-next]"

            );


        if(

            next

        ){

            const type =

                next.dataset.detailNext;


            const data =

                Summary.detail[type] || [];


            const totalPage =

                Math.ceil(

                    data.length /

                    Summary.perPage

                );


            if(

                Summary.pagination[type] <

                totalPage

            ){

                Summary.pagination[type]++;


                renderDetailGroup({

                    type,

                    group :

                        `airdrop-detail-${type}`,

                    count :

                        `airdrop-detail-${type}-count`,

                    list :

                        `airdrop-detail-${type}-list`

                });

            }

        }

    }

);


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
