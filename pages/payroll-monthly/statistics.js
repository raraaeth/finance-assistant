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

    data : []

};


/* =====================================================
   INIT
===================================================== */

Statistics.init = function(){

    initializeFilter();

    Statistics.applyFilter();

    Statistics.renderChart();

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


    console.log(

        "Payroll Statistics Range:",

        value

    );

}


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
