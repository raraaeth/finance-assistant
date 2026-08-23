/* =====================================================
   Finance Assistant
   Page        : Kas
   Module      : Statistics
   File        : statistics.js
   Version     : 4.0.0

   Description :
   Statistics Controller

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


    /* ==============================================
       PAGINATION RANGE
    ============================================== */

    const start =

        (

            Statistics.page - 1

        )

        *

        Statistics.perPage;


    const end =

        start +

        Statistics.perPage;


    /* ==============================================
       RENDER TRANSACTIONS
    ============================================== */

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

                <div class="transaction-item kas-transaction-item">


                    <!-- =================================
                         TOP ROW
                    ================================== -->

                    <div class="kas-transaction-top">


                        <span class="kas-transaction-date">

                            ${

                                formatDate(

                                    item.date

                                )

                            }

                        </span>


                        <strong

                            class="transaction-amount transaction-${

                                item.jenis

                            }"

                        >

                            ${

                                rupiah(

                                    item.nominal

                                )

                            }

                        </strong>


                    </div>


                    <!-- =================================
                         TRANSACTION TYPE
                    ================================== -->

                    <div class="kas-transaction-type">

                        ${

                            capitalize(

                                item.kategori

                            )

                        }

                    </div>


                    <!-- =================================
                         MEMBER
                    ================================== -->

                    <div class="kas-transaction-member">

                        ${

                            capitalize(

                                item.nama

                            )

                        }

                    </div>


                    <!-- =================================
                         DESCRIPTION
                    ================================== -->

                    ${

                        item.keterangan

                        ?

                        `

                        <div class="kas-transaction-description">

                            ${

                                escapeHTML(

                                    item.keterangan

                                )

                            }

                        </div>

                        `

                        :

                        ""

                    }


                </div>

                `;

            }

        );


    /* ==============================================
       PAGINATION
    ============================================== */

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

        Process.data.filter(

            item=>{

                if(

                    !item ||

                    !item.date

                ){

                    return false;

                }


                return (

                    item.date >=

                    Statistics.filter.start

                    &&

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

            /* ==========================================
               USE NORMALIZED DATE
            =========================================== */

            const date =

                item.date;


            if(

                !date

            ){

                return;

            }


            /* ==========================================
               DATE KEY
               
               YYYY-MM-DD
               
               Digunakan sebagai key agar transaksi
               pada hari yang sama digabung.
            =========================================== */

            const dateKey =

                formatDateKey(

                    date

                );


            if(

                !chart[

                    dateKey

                ]

            ){

                chart[

                    dateKey

                ] = 0;

            }


            switch(

                item.jenis

            ){

                case "masuk":

                    chart[

                        dateKey

                    ] +=

                        item.nominal;

                    break;


                case "keluar":

                    chart[

                        dateKey

                    ] -=

                        item.nominal;

                    break;

            }

        }

    );


    /* ==============================================
       SORT DATE
    ============================================== */

    const entries =

        Object.entries(

            chart

        )

        .sort(

            (

                a,

                b

            )=>

                a[0].localeCompare(

                    b[0]

                )

        );


    return {

        labels :

            entries.map(

                ([

                    date

                ])=>

                    formatDate(

                        date

                    )

            ),


        values :

            entries.map(

                ([

                    ,

                    value

                ])=>

                    value

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


/* =====================================================
   FORMAT PERIOD
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
   FORMAT DATE KEY
===================================================== */

function formatDateKey(

    date

){

    return [

        date.getFullYear(),

        String(

            date.getMonth() + 1

        ).padStart(

            2,

            "0"

        ),

        String(

            date.getDate()

        ).padStart(

            2,

            "0"

        )

    ].join("-");

}


/* =====================================================
   CAPITALIZE
===================================================== */

function capitalize(

    value

){

    return String(

        value ?? ""

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

        value ?? ""

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
