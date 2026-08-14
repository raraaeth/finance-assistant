/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Statistics
   File        : statistics.js
   Version     : 1.2.0

   Description :
   Payroll Daily Statistics Controller

   Sections :
   - Import
   - State
   - Init
   - Filter
   - Summary
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

    rupiah,

    shortRupiah

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

    /* =============================================
       FILTER
    ============================================= */

    initializeFilter();


    /* =============================================
       APPLY FILTER
    ============================================= */

    Statistics.applyFilter();


    /* =============================================
       SUMMARY
    ============================================= */

    Statistics.renderSummary();


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
       SUMMARY

       Tidak mengikuti filter.
    ============================================= */

    Statistics.renderSummary();


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
   SUMMARY
===================================================== */

Statistics.renderSummary = function(){

    const section =

        document.getElementById(

            "statistics-summary"

        );


    const card =

        document.getElementById(

            "statistics-summary-card"

        );


    if(

        !section ||

        !card

    ){

        return;

    }


    /* =============================================
       SHOW SUMMARY
    ============================================= */

    section.classList.remove(

        "hidden"

    );


    /* =============================================
       TODAY
    ============================================= */

    const today =

        new Date();


    const todayStart =

        new Date(

            today.getFullYear(),

            today.getMonth(),

            today.getDate()

        );


    const todayEnd =

        new Date(

            today.getFullYear(),

            today.getMonth(),

            today.getDate(),

            23,

            59,

            59,

            999

        );


    /* =============================================
       CURRENT WEEK
       SENIN - MINGGU
    ============================================= */

    const day =

        todayStart.getDay();


    const mondayOffset =

        day === 0

            ?

            6

            :

            day - 1;


    const currentWeekStart =

        new Date(

            todayStart

        );


    currentWeekStart.setDate(

        currentWeekStart.getDate()

        -

        mondayOffset

    );


    const currentWeekEnd =

        new Date(

            currentWeekStart

        );


    currentWeekEnd.setDate(

        currentWeekEnd.getDate()

        + 6

    );


    currentWeekEnd.setHours(

        23,

        59,

        59,

        999

    );


    /* =============================================
       PREVIOUS WEEK
       SENIN - MINGGU PENUH
    ============================================= */

    const previousWeekStart =

        new Date(

            currentWeekStart

        );


    previousWeekStart.setDate(

        previousWeekStart.getDate()

        - 7

    );


    const previousWeekEnd =

        new Date(

            currentWeekStart

        );


    previousWeekEnd.setDate(

        previousWeekEnd.getDate()

        - 1

    );


    previousWeekEnd.setHours(

        23,

        59,

        59,

        999

    );


    /* =============================================
       ALL DATA

       SUMMARY TIDAK MENGIKUTI FILTER
    ============================================= */

    const allData =

        Process.data ?? [];


    /* =============================================
       CALCULATION
    ============================================= */

    let todayIncome =

        0;


    let currentWeekIncome =

        0;


    let previousWeekIncome =

        0;


    allData.forEach(

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


            const income =

                getIncome(

                    item

                );


            /* -----------------------------------------
               TODAY
            ----------------------------------------- */

            if(

                date >= todayStart

                &&

                date <= todayEnd

            ){

                todayIncome += income;

            }


            /* -----------------------------------------
               CURRENT WEEK
            ----------------------------------------- */

            if(

                date >= currentWeekStart

                &&

                date <= currentWeekEnd

            ){

                currentWeekIncome += income;

            }


            /* -----------------------------------------
               PREVIOUS WEEK
            ----------------------------------------- */

            if(

                date >= previousWeekStart

                &&

                date <= previousWeekEnd

            ){

                previousWeekIncome += income;

            }

        }

    );


    /* =============================================
       RENDER
    ============================================= */

    card.innerHTML =

    `

        <div class="statistics-summary-content">


            <!-- =====================================
                 TODAY
            ====================================== -->

            <div class="statistics-summary-today">

                <span class="statistics-summary-today-label">

                    Pendapatan hari ini

                </span>


                <strong class="statistics-summary-today-value">

                    ${

                        shortRupiah(

                            todayIncome

                        )

                    }

                </strong>

            </div>


            <!-- =====================================
                 WEEKLY
            ====================================== -->

            <div class="statistics-summary-weekly">


                <!-- MINGGU INI -->

                <div class="statistics-summary-week-item">

                    <span>

                        Minggu Ini

                    </span>


                    <strong>

                        ${

                            shortRupiah(

                                currentWeekIncome

                            )

                        }

                    </strong>

                </div>


                <!-- MINGGU LALU -->

                <div class="statistics-summary-week-item">

                    <span>

                        Minggu Lalu

                    </span>


                    <strong>

                        ${

                            shortRupiah(

                                previousWeekIncome

                            )

                        }

                    </strong>

                </div>


            </div>


        </div>

    `;

};


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


            const income =

                getIncome(

                    item

                );


            if(

                !grouped[key]

            ){

                grouped[key] = 0;

            }


            grouped[key] += income;

        }

    );


    /* =============================================
       SORT DATE
    ============================================= */

    const entries =

        Object.entries(

            grouped

        ).sort(

            (

                a,

                b

            ) => {

                return (

                    parseChartDate(

                        a[0]

                    )

                    -

                    parseChartDate(

                        b[0]

                    )

                );

            }

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

                        "Pendapatan",

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

                ([

                    date

                ]) => date

            ),

        datasets : [

            {

                label :

                    "Pendapatan",

                data :

                    entries.map(

                        ([

                            ,

                            income

                        ]) => income

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

                    income :

                        0,

                    jobs : []

                };

            }


            /* =====================================
               TOTAL PENDAPATAN HARI
            ===================================== */

            grouped[key].income +=

                getIncome(

                    item

                );


            /* =====================================
               DETAIL PEKERJAAN
            ===================================== */

            grouped[key].jobs.push({

                nama :

                    item.nama ?? "",

                grade1 :

                    item.grade_1 ?? "",

                grade2 :

                    item.grade_2 ?? "",

                qty :

                    toNumber(

                        item.qty

                    )

            });

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
               GROUP PEKERJAAN YANG SAMA
            ===================================== */

            const jobs = {};


            day.jobs.forEach(

                job => {

                    const key =

                        [

                            normalizeText(

                                job.nama

                            ),

                            normalizeText(

                                job.grade1

                            ),

                            normalizeText(

                                job.grade2

                            )

                        ].join("|");


                    if(

                        !jobs[key]

                    ){

                        jobs[key] = {

                            nama :

                                job.nama,

                            grade1 :

                                job.grade1,

                            grade2 :

                                job.grade2,

                            qty :

                                0

                        };

                    }


                    jobs[key].qty +=

                        job.qty;

                }

            );


            const jobList =

                Object.values(

                    jobs

                );


            /* =====================================
               CARD
            ===================================== */

            list.innerHTML +=

            `

                <div class="transaction-item">


                    <!-- =================================
                         DATE + DAILY INCOME
                    ================================== -->

                    <div class="transaction-header">


                        <strong>

                            ${

                                formatDate(

                                    day.date

                                )

                            }

                        </strong>


                        <strong

                            class="transaction-income"

                        >

                            ${

                                rupiah(

                                    day.income

                                )

                            }

                        </strong>


                    </div>


                    <!-- =================================
                         WORK DETAILS
                    ================================== -->

                    <div class="transaction-detail">


                        ${

                            jobList.map(

                                job => `

                                    <div class="transaction-work-row">


                                        <span>

                                            ${

                                                buildWorkName(

                                                    job

                                                )

                                            }

                                            ×

                                            ${

                                                job.qty

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


    return Number.isNaN(

        date.getTime()

    )

        ?

        null

        :

        date;

}


/* =====================================================
   GET INCOME
===================================================== */

function getIncome(

    item

){

    return toNumber(

        item.income ??

        item.pendapatan ??

        item.total ??

        item.amount ??

        0

    );

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
   PARSE CHART DATE
===================================================== */

function parseChartDate(

    value

){

    const parts =

        String(

            value

        ).replace(

            ".",

            ""

        );


    const parsed =

        new Date(

            parts

        );


    return Number.isNaN(

        parsed.getTime()

    )

        ?

        0

        :

        parsed.getTime();

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
   BUILD WORK NAME
===================================================== */

function buildWorkName(

    item

){

    return [

        item.nama,

        item.grade1,

        item.grade2

    ]

    .filter(

        value =>

            value !== null

            &&

            value !== undefined

            &&

            String(

                value

            ).trim() !== ""

    )

    .map(

        value =>

            capitalize(

                value

            )

    )

    .join(" ");

}


/* =====================================================
   NORMALIZE TEXT
===================================================== */

function normalizeText(

    value

){

    return String(

        value ?? ""

    )

    .trim()

    .toLowerCase();

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


    return String(

        text

    ).replace(

        /\b\w/g,

        letter =>

            letter.toUpperCase()

    );

}
