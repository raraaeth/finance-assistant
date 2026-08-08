/* =====================================================
   Finance Assistant
   Page        : Saving / Kas
   Module      : Summary
   File        : summary.js
   Version     : 3.0.0

   Description :
   Summary Controller

   Sections :
   - Import
   - State
   - Init
   - Overview
   - Debt
   - Active Debt
   - Debt History
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

} from "../../js/chart.js";

import {

    Animation

} from "../../js/animation.js";

import {

    rupiah,

    shortRupiah

} from "../../js/utils.js";

import {

    Icon

} from "../../js/icon.js";


/* =====================================================
   STATE
===================================================== */

export const Summary = {

    debtPage : 1,

    debtPerPage : 3

};


/* =====================================================
   INIT
===================================================== */

Summary.init = function(){

    renderOverview();

    renderDebt();

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

            <h2

                id="summary-overview-total">

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

                            .monthlyIncome

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


    /* ==============================================
       ANIMATION TOTAL SALDO
    ============================================== */

    const totalElement =

        document.getElementById(

            "summary-overview-total"

        );


    Animation.number(

        totalElement,

        Process.summary.totalBalance,

        value => rupiah(value),

        1800

    );

}


/* =====================================================
   DEBT
===================================================== */

function renderDebt(){

console.log(
    "DEBT CHECK:",
    Process.debt
);

console.log(
    "DEBT HISTORY:",
    Process.debtHistory
);
   

    const section =

        document.getElementById(

            "summary-debt"

        );

    const container =

        document.getElementById(

            "summary-debt-card"

        );


    if(

        !section ||

        !container

    ){

        return;

    }


    /* ==============================================
       NO DEBT FEATURE
    ============================================== */

    if(

        !Process.debtHistory ||

        Process.debtHistory.length === 0

    ){

        section.classList.add(

            "hidden"

        );

        return;

    }


    /* ==============================================
       SHOW DEBT SECTION
    ============================================== */

    section.classList.remove(

        "hidden"

    );


    renderDebtCards();

}


/* =====================================================
   DEBT CARDS
===================================================== */

function renderDebtCards(){

    const container =

        document.getElementById(

            "summary-debt-card"

        );


    if(

        !container

    ){

        return;

    }


    container.innerHTML =

    `

        <!-- ==========================================
             ACTIVE DEBT
        ========================================== -->

        <div class="debt-card">

            <div class="debt-card-header">

                <div>

                    <h3>

                        Hutang Aktif

                    </h3>

                    <p>

                        Anggota yang masih memiliki hutang

                    </p>

                </div>

            </div>


            <div

                id="summary-active-debt"

                class="debt-list">

            </div>

        </div>


        <!-- ==========================================
             DEBT HISTORY
        ========================================== -->

        <div class="debt-card">

            <div class="debt-card-header">

                <div>

                    <h3>

                        Riwayat Hutang

                    </h3>

                    <p>

                        Riwayat pinjam dan pembayaran

                    </p>

                </div>

            </div>


            <div

                id="summary-debt-history"

                class="debt-list">

            </div>


            <div

                id="summary-debt-pagination"

                class="debt-pagination">

            </div>

        </div>

    `;


    renderActiveDebt();

    renderDebtHistory();

}


/* =====================================================
   ACTIVE DEBT
===================================================== */

function renderActiveDebt(){

    const container =

        document.getElementById(

            "summary-active-debt"

        );


    if(

        !container

    ){

        return;

    }


    const activeDebt =

        Object.entries(

            Process.debt || {}

        )

        .filter(

            ([

                name,

                item

            ])=>

                item.balance > 0

        );


    if(

        activeDebt.length === 0

    ){

        container.innerHTML =

        `

            <div class="debt-empty">

                <span>

                    ✅

                </span>

                <p>

                    Tidak ada anggota yang masih memiliki hutang.

                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =

        activeDebt

        .map(

            ([

                name,

                item

            ])=>`

                <div class="debt-member">

                    <div class="debt-member-info">

                        <strong>

                       ${capitalizeName(name)}

                        </strong>

                        <small>

                            Hutang aktif

                        </small>

                    </div>

                    <strong class="debt-active-amount">

                        ${

                            rupiah(

                                item.balance

                            )

                        }

                    </strong>

                </div>

            `

        )

        .join("");

}


/* =====================================================
   DEBT HISTORY
===================================================== */

function renderDebtHistory(){

    const container =

        document.getElementById(

            "summary-debt-history"

        );

    const pagination =

        document.getElementById(

            "summary-debt-pagination"

        );


    if(

        !container

    ){

        return;

    }


    const history =

        Process.debtHistory || [];


    const total =

        history.length;


    const totalPage =

        Math.ceil(

            total /

            Summary.debtPerPage

        );


    if(

        Summary.debtPage > totalPage

    ){

        Summary.debtPage =

            totalPage || 1;

    }


    const start =

        (

            Summary.debtPage - 1

        ) *

        Summary.debtPerPage;


    const end =

        start +

        Summary.debtPerPage;


    const pageData =

        history.slice(

            start,

            end

        );


    /* ==============================================
       EMPTY
    ============================================== */

    if(

        pageData.length === 0

    ){

        container.innerHTML =

        `

            <div class="debt-empty">

                <span>

                    📄

                </span>

                <p>

                    Belum ada riwayat hutang.

                </p>

            </div>

        `;

    }

    else{

        container.innerHTML =

            pageData

            .map(

                createDebtHistoryItem

            )

            .join("");

    }


    renderDebtPagination(

        pagination,

        totalPage

    );

}


/* =====================================================
   DEBT HISTORY ITEM
===================================================== */

function createDebtHistoryItem(

    item

){

    const isBorrow =

        item.jenis === "pinjam";


    const typeText =

        isBorrow

        ?

        "Pinjam"

        :

        "Bayar";


    const icon =

        isBorrow

        ?

        "📤"

        :

        "💰";


    const className =

        isBorrow

        ?

        "debt-borrow"

        :

        "debt-paid";


    return `

        <div class="debt-history-item">


            <div class="debt-history-icon">

                ${icon}

            </div>


            <div class="debt-history-info">

                <strong>

                    ${item.nama}

                </strong>


                <small>

                    ${typeText}

                    ·

                    ${item.tanggal}

                </small>


                ${

                    item.keterangan

                    ?

                    `

                    <p>

                        ${item.keterangan}

                    </p>

                    `

                    :

                    ""

                }


            </div>


            <strong

                class="debt-history-amount ${className}">

                ${

                    rupiah(

                        item.nominal

                    )

                }

            </strong>


        </div>

    `;

}


/* =====================================================
   DEBT PAGINATION
===================================================== */

function renderDebtPagination(

    container,

    totalPage

){

    if(

        !container

    ){

        return;

    }


    if(

        totalPage <= 1

    ){

        container.innerHTML =

            "";

        return;

    }


    container.innerHTML =

    `

        <button

            type="button"

            class="debt-page-button"

            data-debt-page="prev"

            ${

                Summary.debtPage <= 1

                ?

                "disabled"

                :

                ""

            }

        >

            ← Sebelumnya

        </button>


        <span class="debt-page-info">

            ${

                Summary.debtPage

            }

            /

            ${

                totalPage

            }

        </span>


        <button

            type="button"

            class="debt-page-button"

            data-debt-page="next"

            ${

                Summary.debtPage >= totalPage

                ?

                "disabled"

                :

                ""

            }

        >

            Berikutnya →

        </button>

    `;

}


/* =====================================================
   DEBT PAGINATION EVENT
===================================================== */

document.addEventListener(

    "click",

    event=>{

        const button =

            event.target.closest(

                "[data-debt-page]"

            );


        if(

            !button

        ){

            return;

        }


        const action =

            button.dataset.debtPage;


        const totalPage =

            Math.ceil(

                (

                    Process.debtHistory ||

                    []

                ).length /

                Summary.debtPerPage

            );


        if(

            action === "prev" &&

            Summary.debtPage > 1

        ){

            Summary.debtPage--;

        }


        if(

            action === "next" &&

            Summary.debtPage < totalPage

        ){

            Summary.debtPage++;

        }


        renderDebtHistory();

    }

);


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

        )

        .map(

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

        Process.summary

        .totalBalance;


    Object.entries(

        Process.balance

    )

    .forEach(

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

                ) *

                100;


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

                            style="width:${percent}%"

                        >

                        </div>


                    </div>


                    <div class="distribution-percent">

                        ${

                            percent.toFixed(

                                1

                            )

                        }%

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

function capitalizeName(

    name

){

    return name

        .toLowerCase()

        .replace(

            /\b\w/g,

            letter =>

                letter.toUpperCase()

        );

}
