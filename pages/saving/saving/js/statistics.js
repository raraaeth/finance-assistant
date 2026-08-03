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

    Statistics.renderFilter();

    Statistics.registerFilter();

    Statistics.refresh();

};

/* =====================================================
   RENDER FILTER
===================================================== */

Statistics.renderFilter = function(){

    const container =

        document.getElementById(

            "statistics-filter-list"

        );

    if(

        !container

    ){

        return;

    }

    container.innerHTML =

    `

        <div class="filter-item">

            <label
                class="filter-label">

                📅 Periode

            </label>

            <input

                id="filter-period"

                class="filter-input"

                type="text"

                readonly

            >

        </div>

        <div class="filter-item">

            <label
                class="filter-label">

                📊 Rentang

            </label>

            <select

                id="filter-range"

                class="filter-select"

            >

            </select>

        </div>

    `;

    document.getElementById(

        "filter-period"

    ).value =

        formatPeriod(

            Statistics.filter.start,

            Statistics.filter.end

        );

    Filter.setRange(

        "filter-range",

        Statistics.filter.range

    );

};


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
   REGISTER FILTER
===================================================== */

Statistics.registerFilter = function(){

    const period =

        document.getElementById(

            "filter-period"

        );

    const range =

        document.getElementById(

            "filter-range"

        );

    if(

        !period ||

        !range

    ){

        return;

    }

    period.addEventListener(

        "change",

        ()=>{

            /* Date Range Picker */

        }

    );

    range.addEventListener(

        "change",

        event=>{

            Statistics.filter.range =

                Number(

                    event.target.value

                );

            Statistics.refresh();

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
   FORMAT DATE
===================================================== */

function formatDate(

    date

){

    return new Date(

        date

    ).toLocaleDateString(

        "id-ID",

        {

            day :

                "2-digit",

            month :

                "short",

            year :

                "numeric"

        }

    );

}


/* =====================================================
   START
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    Statistics.init

);

/* =====================================================
   START
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    Statistics.init

);

