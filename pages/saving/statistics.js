/* =====================================================
   Finance Assistant
   Page        : Saving
   Module      : Statistics
   File        : statistics.js
   Version     : 3.0.0

   Description :
   Statistics Controller

   Sections :
   - Import
   - State
   - Init
   - Filter
   - Chart
   - Transaction
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

    rupiah

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

    Statistics.filter.start =

        new Date(

            today.getFullYear(),

            today.getMonth(),

            1

        );

    Statistics.filter.end =

        today;

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

                    "Transaksi",

                data :

                    chart.values,

                borderWidth : 2,

                tension : .35,

                fill : false

            }

        ]

    });

};

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

    const start =

        (

            Statistics.page - 1

        )

        *

        Statistics.perPage;

    const end =

        start +

        Statistics.perPage;

    Statistics.data

        .sort(

            (

                a,

                b

            )=>

                b.date -

                a.date

        )

        .slice(

            start,

            end

        )

        .forEach(

            item=>{

                list.innerHTML +=

                `

                <div class="transaction-item">

                    <div class="transaction-info">

                        <strong>

                            ${item.kategori}

                        </strong>

                        <small>
                        ${formatDate(item.date)}
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

                    <div

                        class="transaction-amount transaction-${item.jenis}"

                    >

                        ${

                            rupiah(

                                item.nominal

                            )

                        }

                    </div>

                </div>

                `;

            }

        );

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

                ${

                    Statistics.page === 1

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

};


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

    Statistics.data =

        Process.transaction.filter(

            item=>

                item.date >=

                Statistics.filter.start &&

                item.date <=

                Statistics.filter.end

        );

};


/* =====================================================
   BUILD CHART
===================================================== */

function buildChart(){

    const chart = {};

    Statistics.data.forEach(

        item=>{

            if(

                !chart[

                    item.tanggal

                ]

            ){

                chart[

                    item.tanggal

                ] = 0;

            }

            switch(

                item.jenis

            ){

                case "masuk":

                    chart[

                        item.tanggal

                    ] +=

                        item.nominal;

                    break;

                case "keluar":

                    chart[

                        item.tanggal

                    ] -=

                        item.nominal;

                    break;

            }

        }

    );

    return {

        labels :

            Object.keys(

                chart

            ),

        values :

            Object.values(

                chart

            )

    };

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

            today.getMonth() - (value - 1),

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

        "Open Date Picker"

    );

};


/* =====================================================
   PAGINATION
===================================================== */

document.addEventListener(

    "click",

    event=>{

        const prev =

            event.target.closest(

                "#statistics-prev"

            );

        if(

            prev

        ){

            if(

                Statistics.page > 1

            ){

                Statistics.page--;

                Statistics.renderTransaction();

            }

            return;

        }

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
   HELPER
===================================================== */

function formatPeriod(

    start,

    end

){

    return(

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
