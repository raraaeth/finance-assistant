/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Statistics
   File        : statistics.js
   Version     : 2.0.0

   Description :
   Payroll Monthly Statistics Controller

   Sections :
   - Import
   - State
   - Init
   - Filter
   - Chart
   - Attendance
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

    formatDate

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

    Statistics.applyFilter();

    Statistics.renderChart();

    Statistics.renderTransaction();

};


/* =====================================================
   INITIALIZE FILTER
===================================================== */

function initializeFilter(){

    const today =

        new Date();


    /* =============================================
       DEFAULT :
       BULAN BERJALAN
    ============================================= */

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


    /* =============================================
       RESET PAGE
    ============================================= */

    Statistics.page = 1;


    /* =============================================
       UPDATE FILTER UI
    ============================================= */

    Filter.setRange(

        null

    );


    Filter.setPeriod(

        formatPeriod(

            Statistics.filter.start,

            Statistics.filter.end

        )

    );


    /* =============================================
       REFRESH
    ============================================= */

    Statistics.applyFilter();

    Statistics.renderChart();

    Statistics.renderTransaction();


    console.log(

        "Payroll Statistics Period:",

        Statistics.filter.start,

        Statistics.filter.end

    );

};


/* =====================================================
   APPLY FILTER
===================================================== */

Statistics.applyFilter = function(){

    const attendance =

        Process.attendance?.data ?? [];


    Statistics.data =

        attendance.filter(

            item=>{

                const date =

                    new Date(

                        item.date

                    );


                return (

                    date >=

                    Statistics.filter.start

                    &&

                    date <=

                    Statistics.filter.end

                );

            }

        );

};


/* =====================================================
   RENDER CHART
===================================================== */

Statistics.renderChart = function(){

    const summary = {

        masuk : 0,

        cuti : 0,

        sakit : 0,

        lembur : 0,

        liburNasional : 0,

        absen : 0

    };


    Statistics.data.forEach(

        item=>{

            switch(

                item.status

            ){

                case "masuk":

                    summary.masuk++;

                    break;


                case "cuti":

                    summary.cuti++;

                    break;


                case "sakit":

                    summary.sakit++;

                    break;


                case "lembur":

                    summary.lembur++;

                    break;


                case "libur_nasional":

                    summary.liburNasional++;

                    break;


                case "absen":

                    summary.absen++;

                    break;

            }

        }

    );


    Chart.renderBar({

        canvas :

            "#statistics-chart-canvas",

        labels : [

            "Masuk",

            "Cuti",

            "Sakit",

            "Lembur",

            "Libur Nasional",

            "Absen"

        ],

        datasets : [

            {

                label :

                    "Attendance",

                data : [

                    summary.masuk,

                    summary.cuti,

                    summary.sakit,

                    summary.lembur,

                    summary.liburNasional,

                    summary.absen

                ],

                backgroundColor : [

                    "#4CAF50",

                    "#EC4899",

                    "#3B82F6",

                    "#8B5CF6",

                    "#EF4444",

                    "#F59E0B"

                ],

                borderWidth : 1

            }

        ]

    });

};


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

                value - 1

            ),

            1

        );


    Statistics.filter.end =

        today;


    Statistics.filter.range =

        value;


    /* =============================================
       RESET PAGE
    ============================================= */

    Statistics.page = 1;


    /* =============================================
       UPDATE FILTER UI
    ============================================= */

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


    /* =============================================
       REFRESH
    ============================================= */

    Statistics.applyFilter();

    Statistics.renderChart();

    Statistics.renderTransaction();


    console.log(

        "Payroll Statistics Range:",

        value

    );

}


/* =====================================================
   RENDER ATTENDANCE
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


    list.innerHTML = "";


    /* =============================================
       PAGINATION RANGE
    ============================================= */

    const start =

        (

            Statistics.page - 1

        )

        *

        Statistics.perPage;


    const end =

        start +

        Statistics.perPage;


    /* =============================================
       SORT + RENDER
    ============================================= */

    Statistics.data

        .slice()

        .sort(

            (

                a,

                b

            ) =>

                b.dateObject -

                a.dateObject

        )

        .slice(

            start,

            end

        )

        .forEach(

            item=>{

                const status =

                    item.status ??

                    "absen";


                const date =

                    item.date ??

                    "-";


                const checkin =

                    item.checkin ??

                    "-";


                const pulang =

                    item.pulang ??

                    "-";


                list.innerHTML +=

                `

                <div

                    class="transaction-item status-${status}"

                >

                    <div

                        class="transaction-header"

                    >

                        <strong>

                            ${

                                capitalize(

                                    status

                                )

                            }

                        </strong>


                        <small>

                            ${date}

                        </small>

                    </div>


                    <div

                        class="transaction-time"

                    >

                        <span>

                            Masuk :

                            <strong>

                                ${checkin}

                            </strong>

                        </span>


                        <span>

                            Pulang :

                            <strong>

                                ${pulang}

                            </strong>

                        </span>

                    </div>

                </div>

                `;

            }

        );


    /* =============================================
       PAGINATION
    ============================================= */

    renderPagination();

};


/* =====================================================
   PAGINATION
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

}


/* =====================================================
   PAGINATION EVENT
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


/* =====================================================
   CAPITALIZE
===================================================== */

function capitalize(

    text

){

    if(

        !text

    ){

        return "-";

    }


    return text.replace(

        /\b\w/g,

        letter=>

            letter.toUpperCase()

    );

   }
