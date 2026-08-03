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

    formatDate

} from

"../../js/utils.js";


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

    Filter.render(

        "#statistics-filter-list",

        formatPeriod(

            Statistics.filter.start,

            Statistics.filter.end

        ),

        Statistics.filter.range

    );

    Filter.register(

        handleFilter

    );

}



/* =====================================================
   RENDER CHART
===================================================== */

Statistics.renderChart = function(){

    const canvas =

        document.getElementById(

            "statistics-chart-canvas"

        );

    if(

        !canvas

    ){

        return;

    }

    /* Chart.js
       Coming Soon */

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
   HANDLE FILTER
===================================================== */

function handleFilter(

    type,

    value

){

    switch(

        type

    ){

        case "period":

            Statistics.openDatePicker();

            break;

        case "range":

            Statistics.filter.range =

                value;

            Statistics.refresh();

            break;

    }

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
   START
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    Statistics.init

);



