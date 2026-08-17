/* =====================================================
   Finance Assistant
   Module      : Financial
   File        : statistics.js
   Version     : 1.1.0

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

        Process.data ??

        [];


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

                formatDateKey(

                    date

                );


            if(

                !grouped[key]

            ){

                grouped[key] = {

                    income : 0,

                    expense : 0

                };

            }


            const nominal =

                toNumber(

                    item.nominal

                );


            /* =====================================
               PEMASUKAN
            ===================================== */

            if(

                item.category ===

                "income"

            ){

                grouped[key].income +=

                    nominal;

            }


            /* =====================================
               PENGELUARAN
            ===================================== */

            else if(

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

    const dates =

        Object.keys(

            grouped

        ).sort();


    /* =============================================
       LABEL
    ============================================= */

    const labels =

        dates.map(

            date =>

                formatChartDate(

                    date

                )

        );


    /* =============================================
       DATA
    ============================================= */

    const income =

        dates.map(

            date =>

                grouped[date].income

        );


    const expense =

        dates.map(

            date =>

                grouped[date].expense

        );


    /* =============================================
       RENDER CHART
    ============================================= */

    Chart.renderBar({

        canvas :

            "#statistics-chart-canvas",


        labels :


            labels,


        datasets : [

            {

                label :

                    "Pemasukan",


                data :

                    income,


                backgroundColor :

                    getThemeColor(

                        "--success",

                        "#16a34a"

                    ),


                borderRadius :

                    6

            },


            {

                label :

                    "Pengeluaran",


                data :

                    expense,


                backgroundColor :

                    getThemeColor(

                        "--danger",

                        "#dc2626"

                    ),


                borderRadius :

                    6

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

                formatDateKey(

                    date

                );


            if(

                !grouped[key]

            ){

                grouped[key] = {

                    date :

                        date,

                    items : []

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

            (a, b) =>

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

                Belum ada transaksi pada periode ini.

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


            const items =

                groupActivities(

                    day.items

                );


            list.innerHTML +=

            `

                <div class="transaction-item">


                    <!-- =================================
                         DATE
                    ================================== -->

                    <div class="transaction-date">

                        ${

                            formatDate(

                                day.date

                            )

                        }

                    </div>


                    <!-- =================================
                         TRANSACTION DETAILS
                    ================================== -->

                    <div class="transaction-detail">

                        ${

                            items.map(

                                item => `

                                    <div

                                        class="transaction-work-row"

                                    >


                                        <div

                                            class="transaction-info"

                                        >


                                            <div

                                                class="transaction-name"

                                            >

                                                ${

                                                    escapeHTML(

                                                        item.name

                                                    )

                                                }

                                            </div>


                                            ${

                                                item.keterangan

                                                    ?

                                                    `

                                                        <div

                                                            class="transaction-note"

                                                        >

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


                                        <div

                                            class="transaction-amount"

                                        >

                                            ${

                                                rupiahSafe(

                                                    item.nominal

                                                )

                                            }

                                        </div>


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
   GROUP ACTIVITIES
===================================================== */

function groupActivities(

    items

){


    const grouped = {};


    items.forEach(

        item => {


            const key =

                [

                    item.category,

                    item.type,

                    item.nama,

                    item.keterangan ?? ""

                ].join("|");


            if(

                !grouped[key]

            ){

                grouped[key] = {

                    name :

                        item.nama ??

                        "-",


                    nominal :

                        0,


                    category :

                        item.category,


                    keterangan :

                        item.keterangan ??

                        ""

                };

            }


            grouped[key].nominal +=

                toNumber(

                    item.nominal

                );

        }

    );


    return Object.values(

        grouped

    );

}


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


    /* =============================================
       HIDE PAGINATION
    ============================================= */

    if(

        totalPage <= 1

    ){

        pagination.innerHTML = "";

        return;

    }


    pagination.innerHTML =

    `

        <div

            class="statistics-pagination"

        >


            <button

                type="button"

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

                type="button"

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


        /* =============================================
           PREVIOUS
        ============================================= */

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


        /* =============================================
           NEXT
        ============================================= */

        const next =

            event.target.closest(

                "#statistics-next"

            );


        if(

            next

        ){

            const totalPage =

                Math.ceil(

                    getTotalDays()

                    /

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
   TOTAL DAYS
===================================================== */

function getTotalDays(){


    const dates =

        new Set();


    Statistics.data.forEach(

        item => {


            const date =

                getItemDate(

                    item

                );


            if(

                date

            ){

                dates.add(

                    formatDateKey(

                        date

                    )

                );

            }

        }

    );


    return dates.size;

}


/* =====================================================
   GET ITEM DATE
===================================================== */

function getItemDate(

    item

){


    /* =============================================
       PROCESSED DATE
    ============================================= */

    if(

        item.dateObject instanceof Date &&

        !Number.isNaN(

            item.dateObject.getTime()

        )

    ){

        return item.dateObject;

    }


    /* =============================================
       NORMALIZED DATE
    ============================================= */

    const value =

        item.date ??

        item.tanggal;


    return parseLocalDate(

        value

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
   FORMAT CHART DATE
===================================================== */

function formatChartDate(

    value

){


    const date =

        parseLocalDate(

            value

        );


    if(

        !date

    ){

        return value;

    }


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


    /* =============================================
       ALREADY DATE
    ============================================= */

    if(

        value instanceof Date

    ){

        return Number.isNaN(

            value.getTime()

        )

            ?

            null

            :

            value;

    }


    /* =============================================
       STRING YYYY-MM-DD
    ============================================= */

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


    const date =

        new Date(

            parts[0],

            parts[1] - 1,

            parts[2]

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
   THEME COLOR
===================================================== */

function getThemeColor(

    variable,

    fallback

){


    return getComputedStyle(

        document.documentElement

    )

    .getPropertyValue(

        variable

    )

    .trim()

        ||

        fallback;

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
   RUPIAH
===================================================== */

function rupiahSafe(

    value

){


    if(

        typeof rupiah ===

        "function"

    ){

        return rupiah(

            value

        );

    }


    return new Intl.NumberFormat(

        "id-ID",

        {

            style :

                "currency",

            currency :

                "IDR",

            maximumFractionDigits :

                0

        }

    ).format(

        value

    );

}


/* =====================================================
   COMPACT RUPIAH
===================================================== */

function formatCompactRupiah(

    value

){


    if(

        value >= 1000000

    ){

        return (

            "Rp " +

            (

                value /

                1000000

            ).toFixed(1) +

            " jt"

        );

    }


    if(

        value >= 1000

    ){

        return (

            "Rp " +

            Math.round(

                value /

                1000

            ) +

            " rb"

        );

    }


    return (

        "Rp " +

        value

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
