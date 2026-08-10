/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Statistics
   File        : statistics.js
   Version     : 1.0.0

   Description :
   Payroll Monthly Statistics Controller

   Tahap :
   - Filter
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


    /*
       DEFAULT :

       Bulan berjalan
    */

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


    Filter.setRange(

        null

    );


    Filter.setPeriod(

        formatPeriod(

            Statistics.filter.start,

            Statistics.filter.end

        )

    );

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

            "#4CAF50",  // Masuk - hijau

            "#EC4899",  // Cuti - pink

            "#3B82F6",  // Sakit - biru

            "#8B5CF6",  // Lembur - ungu

            "#EF4444",  // Libur Nasional - merah

            "#F59E0B"   // Absen - kuning

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

   Statistics.applyFilter();

   Statistics.renderChart();


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

                list.innerHTML +=

                `

                <div class="transaction-item">

                    <div class="transaction-info">

                        <strong>

                            ${

                                capitalize(

                                    item.status

                                )

                            }

                        </strong>

                        <small>

                            ${

                                item.date

                            }

                        </small>

                    </div>


                    <div class="transaction-amount">

                        <span>

                            Masuk :

                            ${

                                item.checkin ??

                                "-"

                            }

                        </span>


                        <span>

                            Pulang :

                            ${

                                item.pulang ??

                                "-"

                            }

                        </span>

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

        letter =>

            letter.toUpperCase()

    );

}
