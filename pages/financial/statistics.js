/* =====================================================
   Finance Assistant
   Page        : Financial
   Module      : Statistics
   File        : statistics.js
   Version     : 1.0.0

   Description :
   Financial Statistics Controller

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


    /* =============================================
       1 PAGE = 5 HARI
    ============================================= */

    perPage : 5

};


/* =====================================================
   INIT
===================================================== */

Statistics.init = function(){


    /* =============================================
       FILTER
    ============================================= */

    initializeFilter();


    /* =============================================
       APPLY FILTER
    ============================================= */

    Statistics.applyFilter();


    /* =============================================
       CHART
    ============================================= */

    Statistics.renderChart();


    /* =============================================
       TRANSACTION
    ============================================= */

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


    Statistics.filter.end.setHours(

        23,

        59,

        59,

        999

    );


    Statistics.filter.range =

        null;


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
       REGISTER FILTER
    ============================================= */

    Filter.register({

        onPeriod :

            value => {

                Statistics.applyPeriod(

                    value

                );

            },


        onRange :

            value => {

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

    if(

        !value ||

        !value.start ||

        !value.end

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


    /* =============================================
       END OF DAY
    ============================================= */

    Statistics.filter.start.setHours(

        0,

        0,

        0,

        0

    );


    Statistics.filter.end.setHours(

        23,

        59,

        59,

        999

    );


    Statistics.filter.range =

        null;


    Statistics.page =

        1;


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

    refresh();

};


/* =====================================================
   HANDLE RANGE
===================================================== */

function handleRange(

    value

){

    const today =

        new Date();


    if(

        !value ||

        Number(value) <= 0

    ){

        return;

    }


    /* =============================================
       RANGE = JUMLAH BULAN
    ============================================= */

    Statistics.filter.start =

        new Date(

            today.getFullYear(),

            today.getMonth()

            -

            (

                Number(value) - 1

            ),

            1

        );


    Statistics.filter.start.setHours(

        0,

        0,

        0,

        0

    );


    Statistics.filter.end =

        today;


    Statistics.filter.end.setHours(

        23,

        59,

        59,

        999

    );


    Statistics.filter.range =

        Number(value);


    Statistics.page =

        1;


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

        Number(value)

    );


    /* =============================================
       REFRESH
    ============================================= */

    refresh();

}


/* =====================================================
   APPLY FILTER
===================================================== */

Statistics.applyFilter = function(){

    const data =

        Process.data ?? [];


    const start =

        Statistics.filter.start;


    const end =

        Statistics.filter.end;


    if(

        !start ||

        !end

    ){

        Statistics.data = [];

        return;

    }


    Statistics.data =

        data.filter(

            item => {

                const date =

                    getItemDate(

                        item

                    );


                if(

                    !date

                ){

                    return false;

                }


                return (

                    date >= start

                )

                &&

                (

                    date <= end

                );

            }

        );

};


/* =====================================================
   REFRESH
===================================================== */

function refresh(){

    Statistics.applyFilter();


    /* =============================================
       CHART
    ============================================= */

    Statistics.renderChart();


    /* =============================================
       TRANSACTION
    ============================================= */

    Statistics.renderTransaction();

}


/* =====================================================
   CHART
===================================================== */

Statistics.renderChart = function(){

    const canvas =

        document.querySelector(

            "#statistics-chart-canvas"

        );


    if(

        !canvas

    ){

        return;

    }


    /* =============================================
       GROUP BY DATE
    ============================================= */

    const grouped = {};


    Statistics.data.forEach(

        item => {

            const date =

                getItemDate(

                    item

                );


            if(

                !date

            ){

                return;

            }


            const key =

                formatChartDate(

                    date

                );


            if(

                !grouped[key]

            ){

                grouped[key] = {

                    date :

                        date,

                    income :

                        0,

                    expense :

                        0

                };

            }


            const nominal =

                toNumber(

                    item.nominal

                );


            /* =====================================
               INCOME
               
               masuk
               hutang
               tarik
            ===================================== */

            if(

                item.category ===

                "income"

            ){

                grouped[key].income +=

                    nominal;

            }


            /* =====================================
               EXPENSE
               
               keluar
               bayar
               nabung
            ===================================== */

            if(

                item.category ===

                "expense"

            ){

                grouped[key].expense +=

                    nominal;

            }

        }

    );


    /* =============================================
       SORT DATE
    ============================================= */

    const entries =

        Object.values(

            grouped

        ).sort(

            (

                a,

                b

            ) =>

                a.date -

                b.date

        );


    /* =============================================
       EMPTY DATA
    ============================================= */

    if(

        !entries.length

    ){

        Chart.renderBar({

            canvas :

                "#statistics-chart-canvas",

            labels :

                [],

            datasets : [

                {

                    label :

                        "Pemasukan",

                    data :

                        []

                },

                {

                    label :

                        "Pengeluaran",

                    data :

                        []

                }

            ]

        });


        return;

    }


    /* =============================================
       CHART DATA
    ============================================= */

    Chart.renderBar({

        canvas :

            "#statistics-chart-canvas",


        labels :

            entries.map(

                item =>

                    formatChartDate(

                        item.date

                    )

            ),


        datasets : [

            {

                label :

                    "Pemasukan",

                data :

                    entries.map(

                        item =>

                            item.income

                    ),

                borderWidth :

                    1

            },


            {

                label :

                    "Pengeluaran",

                data :

                    entries.map(

                        item =>

                            item.expense

                    ),

                borderWidth :

                    1

            }

        ]

    });

};


/* =====================================================
   TRANSACTION
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
       GROUP DATA BY DATE
    ============================================= */

    const grouped = {};


    Statistics.data.forEach(

        item => {

            const date =

                getItemDate(

                    item

                );


            if(

                !date

            ){

                return;

            }


            const key =

                [

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


            if(

                !grouped[key]

            ){

                grouped[key] = {

                    date :

                        date,

                    items :

                        []

                };

            }


            grouped[key].items.push(

                item

            );

        }

    );


    /* =============================================
       SORT TERBARU
    ============================================= */

    const days =

        Object.values(

            grouped

        ).sort(

            (

                a,

                b

            ) =>

                b.date -

                a.date

        );


    /* =============================================
       PAGINATION
       
       1 PAGE = 5 HARI
    ============================================= */

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


    const pageData =

        days.slice(

            start,

            end

        );


    /* =============================================
       EMPTY
    ============================================= */

    if(

        !pageData.length

    ){

        list.innerHTML =

        `

            <div class="statistics-summary-empty">

                Belum ada data pada periode ini.

            </div>

        `;


        renderPagination(

            days.length

        );


        return;

    }


    /* =============================================
       RENDER PER DAY
    ============================================= */

    pageData.forEach(

        day => {


            /* =====================================
               CARD
            ===================================== */

            list.innerHTML +=

            `

                <div class="transaction-item">


                    <!-- =================================
                         DATE
                    ================================== -->

                    <div class="transaction-header">


                        <strong

                            class="transaction-date"

                        >

                            ${

                                formatDate(

                                    day.date

                                )

                            }

                        </strong>


                    </div>


                    <!-- =================================
                         TRANSACTION DETAILS
                    ================================== -->

                    <div class="transaction-detail">


                        ${

                            day.items.map(

                                item => `

                                    <div

                                        class="transaction-work-row"

                                    >

                                        <span

                                            class="transaction-name"

                                        >

                                            ${

                                                escapeHTML(

                                                    item.nama ??

                                                    "-"

                                                )

                                            }

                                        </span>


                                        <span

                                            class="${

                                                item.category ===

                                                "income"

                                                    ?

                                                    "transaction-income"

                                                    :

                                                    "transaction-expense"

                                            }"

                                        >

                                            ${

                                                rupiah(

                                                    toNumber(

                                                        item.nominal

                                                    )

                                                )

                                            }

                                        </span>

                                    </div>

                                `

                            ).join("")

                        }


                    </div>


                </div>

            `;

        }

    );


    /* =============================================
       PAGINATION
    ============================================= */

    renderPagination(

        days.length

    );

};


/* =====================================================
   PAGINATION
===================================================== */

function renderPagination(

    totalData

){

    const pagination =

        document.getElementById(

            "statistics-show-more"

        );


    if(

        !pagination

    ){

        return;

    }


    /* =============================================
       TOTAL PAGE
    ============================================= */

    const totalPage =

        Math.max(

            1,

            Math.ceil(

                totalData /

                Statistics.perPage

            )

        );


    if(

        Statistics.page >

        totalPage

    ){

        Statistics.page =

            totalPage;

    }


    pagination.innerHTML =

    `

        <div

            class="statistics-pagination"

        >

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

                    Statistics.page >= totalPage

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

    event => {


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


        const next =

            event.target.closest(

                "#statistics-next"

            );


        if(

            next

        ){

            /* =====================================
               HITUNG BERDASARKAN JUMLAH HARI
            ===================================== */

            const days =

                getGroupedDays();


            const totalPage =

                Math.max(

                    1,

                    Math.ceil(

                        days.length /

                        Statistics.perPage

                    )

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
   GROUPED DAYS
===================================================== */

function getGroupedDays(){

    const grouped = {};


    Statistics.data.forEach(

        item => {

            const date =

                getItemDate(

                    item

                );


            if(

                !date

            ){

                return;

            }


            const key =

                [

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


            grouped[key] = true;

        }

    );


    return Object.keys(

        grouped

    );

}


/* =====================================================
   GET ITEM DATE
===================================================== */

function getItemDate(

    item

){

    if(

        item.dateObject instanceof Date

        &&

        !Number.isNaN(

            item.dateObject.getTime()

        )

    ){

        return item.dateObject;

    }


    const value =

        item.date ??

        item.Date ??

        item.tanggal;


    return parseLocalDate(

        value

    );

}


/* =====================================================
   PARSE LOCAL DATE
===================================================== */

function parseLocalDate(

    value

){

    if(

        !value

    ){

        return null;

    }


    const parts =

        String(

            value

        )

        .split("-")

        .map(Number);


    if(

        parts.length !== 3

    ){

        return null;

    }


    const [

        year,

        month,

        day

    ] = parts;


    const date =

        new Date(

            year,

            month - 1,

            day

        );


    if(

        Number.isNaN(

            date.getTime()

        )

    ){

        return null;

    }


    return date;

}


/* =====================================================
   FORMAT CHART DATE
===================================================== */

function formatChartDate(

    date

){

    return date.toLocaleDateString(

        "id-ID",

        {

            day :

                "2-digit",

            month :

                "short"

        }

    );

}


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
   NUMBER
===================================================== */

function toNumber(

    value

){

    const number =

        Number(

            value

        );


    return Number.isFinite(

        number

    )

        ?

        number

        :

        0;

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
