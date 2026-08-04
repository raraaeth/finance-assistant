/* =====================================================
   Finance Assistant
   Workspace   : Saving
   Module      : Statistics
   File        : statistics.js
   Version     : 2.0.0

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

} from

"../../shared/js/filter.js";

import {

    Chart

} from

"../../../../js/chart.js";

import {

    formatDate

} from

"../../../../js/utils.js";

/* =====================================================
   STATE
===================================================== */

export const Statistics = {

    filter : {

        start : null,

        end : null,

        range : 6

    },

    data : []

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

            ()=>{

                Statistics.openDatePicker();

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
         RENDER
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

                    "Saving",

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

    Statistics.data.forEach(

        item=>{

            list.innerHTML +=

            `

            <div class="transaction-item">

                <div>

                    <strong>

                        ${

                            item.keterangan ||

                            item.kategori

                        }

                    </strong>

                    <br>

                    <small>

                        ${item.tanggal}

                    </small>

                </div>

                <div>

                    ${item.nominal}

                </div>

            </div>

            `;

        }

    );

};



/* =====================================================
   REFRESH
===================================================== */

Statistics.refresh = function(){

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

            item=>{

                return(

                    item.date >=

                    Statistics.filter.start &&

                    item.date <=

                    Statistics.filter.end

                );

            }

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

                    ] += item.nominal;

                    break;

                case "keluar":

                    chart[

                        item.tanggal

                    ] -= item.nominal;

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
   HANDLE FILTER
===================================================== */

function handleFilter(

    type,

    value

){

    if(

        type === "period"

    ){

        Statistics.openDatePicker();

        return;

    }

    if(

        type === "range"

    ){

        const today =

            new Date();

        Statistics.filter.end =

            today;

        Statistics.filter.start =

            new Date(

                today.getFullYear(),

                today.getMonth() - (value - 1),

                1

            );

        Statistics.filter.range =

            value;

        Filter.setPeriod(

            formatPeriod(

                Statistics.filter.start,

                Statistics.filter.end

            )

        );

        Statistics.refresh();

    }

}



/* =====================================================
   HANDLE RANGE
===================================================== */

function handleRange(

    value

){

    Statistics.filter.range =

        value;

    Statistics.refresh();

}

/* =====================================================
   DATE PICKER
===================================================== */

Statistics.openDatePicker = function(){

    console.log(

        "Open Date Picker"

    );

};

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


/* =====================================================
   START
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    Statistics.init

);



