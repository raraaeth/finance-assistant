/* =====================================================
   Finance Assistant
   Page        : Airdrop
   Module      : Statistics
   File        : statistics.js
   Version     : 1.0.0

   Description :
   Airdrop Statistics Controller

   Sections :
   - Import
   - State
   - Init
   - Filter
   - Chart
   - Transaction
   - Pagination
   - Helper
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Process

} from "./process.js";


import {

    Filter

} from "../../js/filter.js";


import {

    Chart

} from "../../js/chart.js";


import {

    formatDate,

    usd

} from "../../js/utils.js";


/* =====================================================
   STATE
===================================================== */

export const Statistics = {

    filter : {

        start : null,

        end : null,

        range : null

    },


    data : [],


    page : 1,


    perPage : 5

};


/* =====================================================
   INIT
===================================================== */

Statistics.init = function(){

    initializeFilter();

    Statistics.refresh();

};


/* =====================================================
   INITIALIZE FILTER
===================================================== */

function initializeFilter(){

    const today =

        new Date();


    /* =============================================
       DEFAULT : BULAN INI
    ============================================= */

    Statistics.filter.start =

        new Date(

            today.getFullYear(),

            today.getMonth(),

            1

        );


    Statistics.filter.end =

        today;


    /* =============================================
       RENDER FILTER
    ============================================= */

    Filter.render({

        container :

            "#statistics-filter-list",

        period :

            formatPeriod(

                Statistics.filter.start,

                Statistics.filter.end

            ),

        range :

            Statistics.filter.range

    });


    /* =============================================
       REGISTER EVENT
    ============================================= */

    Filter.register({

        onPeriod :

            value=>{

                Statistics.applyPeriod(

                    value

                );

            },


        onRange :

            value=>{

                handleRange(

                    value

                );

            }

    });

}


/* =====================================================
   REFRESH
===================================================== */

Statistics.refresh = function(){

    Statistics.page = 1;


    Statistics.applyFilter();


    Statistics.renderChart();


    Statistics.renderTransaction();

};


/* =====================================================
   APPLY FILTER
===================================================== */

Statistics.applyFilter = function(){

    if(

        !Array.isArray(

            Process.data

        )

    ){

        Statistics.data = [];

        return;

    }


    Statistics.data =

        Process.data.filter(

            item=>{

                if(

                    !item.date

                ){

                    return false;

                }


                return (

                    item.date >=

                    Statistics.filter.start

                )

                &&

                (

                    item.date <=

                    Statistics.filter.end

                );

            }

        );

};


/* =====================================================
   RENDER CHART
===================================================== */

Statistics.renderChart = function(){

    const chart =

        buildChart();


    Chart.renderLine({

        canvas :

            "#statistics-chart-canvas",


        labels :

            chart.labels,


        datasets : [

            {

                label :

                    "Reward",


                data :

                    chart.values,


                borderWidth :

                    2,


                tension :

                    .35,


                fill :

                    false

            }

        ]

    });

};


/* =====================================================
   BUILD CHART
===================================================== */

function buildChart(){

    const chart = {};


    Statistics.data.forEach(

        item=>{

            /* ======================================
               CHART HANYA UNTUK WIN
            ====================================== */

            if(

                item.status !==

                "win"

            ){

                return;

            }


            /* ======================================
               DATE

               Gunakan date hasil Process
               bukan tanggal mentah API.
            ====================================== */

            if(

                !(

                    item.date

                    instanceof Date

                )

                ||

                Number.isNaN(

                    item.date.getTime()

                )

            ){

                return;

            }


            /* ======================================
               DATE KEY

               Satu tanggal = satu titik chart
            ====================================== */

            const year =

                item.date.getFullYear();


            const month =

                String(

                    item.date.getMonth() + 1

                )

                .padStart(

                    2,

                    "0"

                );


            const day =

                String(

                    item.date.getDate()

                )

                .padStart(

                    2,

                    "0"

                );


            const dateKey =

                `${year}-${month}-${day}`;


            if(

                !chart[dateKey]

            ){

                chart[dateKey] = {

                    date :

                        new Date(

                            year,

                            item.date.getMonth(),

                            item.date.getDate()

                        ),

                    reward : 0

                };

            }


            chart[dateKey].reward +=

                Number(

                    item.reward

                ) || 0;

        }

    );


    /* =============================================
       SORT DATE
    ============================================= */

    const entries =

        Object.values(

            chart

        )

        .sort(

            (

                a,

                b

            ) =>

                a.date -

                b.date

        );


    /* =============================================
       RESULT
    ============================================= */

    return {

        labels :

            entries.map(

                item =>

                    formatDate(

                        item.date

                    )

            ),


        values :

            entries.map(

                item =>

                    item.reward

            )

    };

}


/* =====================================================
   RENDER TRANSACTION
===================================================== */

Statistics.renderTransaction = function(){

    const list =

        document.getElementById(

            "statistics-transaction-list"

        );


    if(

        !list

    ){

        return;

    }


    list.innerHTML =

        "";


    /* ==============================================
       PAGINATION RANGE
    ============================================== */

    const start =

        (

            Statistics.page -

            1

        )

        *

        Statistics.perPage;


    const end =

        start +

        Statistics.perPage;


    /* ==============================================
       SORT NEWEST FIRST
    ============================================== */

    const data =

        [

            ...Statistics.data

        ]

        .sort(

            (

                a,

                b

            )=>{

                return (

                    b.date -

                    a.date

                );

            }

        );


    /* ==============================================
       RENDER
    ============================================== */

    data

        .slice(

            start,

            end

        )

        .forEach(

            item=>{

                list.innerHTML +=

                    createAirdropItem(

                        item

                    );

            }

        );


    renderPagination();

};


/* =====================================================
   CREATE AIRDROP ITEM
===================================================== */

function createAirdropItem(

    item

){

    const status =

        getStatusLabel(

            item.status

        );


    const reward =

        Number(

            item.reward

        ) || 0;


    return `

        <div class="transaction-item">


            <div class="transaction-info">


                <!-- =================================
                     PROJECT
                ================================== -->

                <strong>

                    ${escapeHTML(

                        item.project

                    )}

                </strong>


                <!-- =================================
                     DATE
                ================================== -->

                <small>

                    ${formatDate(

                        item.date

                    )}

                </small>


                <!-- =================================
                     WALLET / TYPE
                ================================== -->

                <p>

                    ${escapeHTML(

                        formatWallet(

                            item.wallet

                        )

                    )}

                    ·

                    ${escapeHTML(

                        formatType(

                            item.type

                        )

                    )}

                </p>


            </div>


            <!-- =====================================
                 STATUS / REWARD
            ====================================== -->

            <div

                class="transaction-amount"

            >

                <strong>

                    ${status.icon}

                    ${status.label}

                </strong>


                ${

                    item.status ===

                    "win"

                    ?

                    `

                        <small>

                            ${usd(

                                reward

                            )}

                        </small>

                    `

                    :

                    ""

                }

            </div>


        </div>

    `;

}


/* =====================================================
   STATUS LABEL
===================================================== */

function getStatusLabel(

    status

){

    switch(

        status

    ){

        case "win":

            return {

                icon :

                    "🏆",

                label :

                    "Win"

            };


        case "not_win":

            return {

                icon :

                    "❌",

                label :

                    "Not Win"

            };


        case "ongoing":

            return {

                icon :

                    "⏳",

                label :

                    "Ongoing"

            };


        case "ended":

            return {

                icon :

                    "⏹️",

                label :

                    "Ended"

            };


        default:

            return {

                icon :

                    "•",

                label :

                    "-"

            };

    }

}


/* =====================================================
   RENDER PAGINATION
===================================================== */

function renderPagination(){

    const pagination =

        document.getElementById(

            "statistics-show-more"

        );


    if(

        !pagination

    ){

        return;

    }


    const totalPage =

        Math.max(

            1,

            Math.ceil(

                Statistics.data.length /

                Statistics.perPage

            )

        );


    pagination.innerHTML =

    `

        <div class="statistics-pagination">


            <button

                id="statistics-prev"

                type="button"

                ${

                    Statistics.page ===

                    1

                    ?

                    "disabled"

                    :

                    ""

                }

            >

                ◀ Sebelumnya

            </button>


            <span>

                ${Statistics.page}

                /

                ${totalPage}

            </span>


            <button

                id="statistics-next"

                type="button"

                ${

                    Statistics.page >=

                    totalPage

                    ?

                    "disabled"

                    :

                    ""

                }

            >

                Berikutnya ▶

            </button>


        </div>

    `;

}


/* =====================================================
   HANDLE RANGE
===================================================== */

function handleRange(

    value

){

    const today =

        new Date();


    Statistics.filter.start =

        new Date(

            today.getFullYear(),

            today.getMonth() -

            (

                value -

                1

            ),

            1

        );


    Statistics.filter.end =

        today;


    Statistics.filter.range =

        value;


    Filter.setDate(

        Statistics.filter.start,

        Statistics.filter.end

    );


    Filter.setPeriod(

        formatPeriod(

            Statistics.filter.start,

            Statistics.filter.end

        )

    );


    Filter.setRange(

        value

    );


    Statistics.refresh();

}


/* =====================================================
   APPLY PERIOD
===================================================== */

Statistics.applyPeriod = function(

    value

){

    if(

        !value

    ){

        return;

    }


    Statistics.filter.start =

        new Date(

            value.start

        );


    Statistics.filter.end =

        new Date(

        value.end

        );


    Statistics.filter.range =

        null;


    Filter.setRange(

        null

    );


    Filter.setPeriod(

        formatPeriod(

            Statistics.filter.start,

            Statistics.filter.end

        )

    );


    Statistics.refresh();

};


/* =====================================================
   DATE PICKER
===================================================== */

Statistics.openDatePicker = function(){

    console.log(

        "Open Airdrop Date Picker"

    );

};


/* =====================================================
   PAGINATION EVENT
===================================================== */

document.addEventListener(

    "click",

    event=>{

        /* ==========================================
           PREVIOUS
        ========================================== */

        const prev =

            event.target.closest(

                "#statistics-prev"

            );


        if(

            prev

        ){

            if(

                Statistics.page >

                1

            ){

                Statistics.page--;

                Statistics.renderTransaction();

            }


            return;

        }


        /* ==========================================
           NEXT
        ========================================== */

        const next =

            event.target.closest(

                "#statistics-next"

            );


        if(

            next

        ){

            const totalPage =

                Math.ceil(

                    Statistics.data.length /

                    Statistics.perPage

                );


            if(

                Statistics.page <

                totalPage

            ){

                Statistics.page++;

                Statistics.renderTransaction();

            }

        }

    }

);


/* =====================================================
   FORMAT PERIOD
===================================================== */

function formatPeriod(

    start,

    end

){

    return (

        formatDate(

            start

        )

        +

        " - "

        +

        formatDate(

            end

        )

    );

}


/* =====================================================
   FORMAT WALLET
===================================================== */

function formatWallet(

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
   FORMAT TYPE
===================================================== */

function formatType(

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
