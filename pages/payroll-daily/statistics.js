/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Statistics
   File        : statistics.js
   Version     : 1.0.0

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
       
       SENGAJA DIKOSONGKAN DULU
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
       Supaya tanggal terakhir ikut terhitung.
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
       
       Mengikuti behavior Monthly.
    ============================================= */

    Statistics.filter.start =

        new Date(

            today.getFullYear(),

            today.getMonth() -

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
       Untuk sementara tidak menggunakan filter.
       Logic akan dibuat setelah bagian utama selesai.
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


    section.classList.remove(

        "hidden"

    );


    /* =============================================
       KOSONG DULU
       
       Ringkasan Daily akan dibuat terpisah:
       - Pendapatan hari ini
       - Pendapatan minggu ini
       - Pendapatan minggu lalu
       
       Dan tidak mengikuti filter.
    ============================================= */

    card.innerHTML = "";

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
       SORT TERBARU
    ============================================= */

    const sortedData =

        Statistics.data

            .slice()

            .sort(

                (

                    a,

                    b

                ) => {

                    const dateA =

                        getItemDate(

                            a

                        );


                    const dateB =

                        getItemDate(

                            b

                        );


                    return (

                        dateB -

                        dateA

                    );

                }

            );


    /* =============================================
       PAGINATION
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

        sortedData.slice(

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

    }


    /* =============================================
       RENDER
    ============================================= */

    pageData.forEach(

        item => {

            const date =

                getItemDate(

                    item

                );


            const nama =

                item.nama ??

                "-";


            const grade1 =

                item.grade_1 ??

                "";


            const grade2 =

                item.grade_2 ??

                "";


            const qty =

                toNumber(

                    item.qty

                );


            const income =

                getIncome(

                    item

                );


            const grade =

                [

                    grade1,

                    grade2

                ]

                    .filter(Boolean)

                    .join(" • ");


            list.innerHTML +=

            `

                <div class="transaction-item">

                    <div class="transaction-header">

                        <strong>

                            📦 ${

                                capitalize(

                                    nama

                                )

                            }

                        </strong>


                        <small>

                            ${

                                date

                                    ?

                                    formatDate(

                                        date

                                    )

                                    :

                                    "-"

                            }

                        </small>

                    </div>


                    <div class="transaction-detail">


                        <div>

                            Grade

                            <strong>

                                ${

                                    grade ||

                                    "-"

                                }

                            </strong>

                        </div>


                        <div>

                            Qty

                            <strong>

                                ${

                                    qty

                                }

                                pcs

                            </strong>

                        </div>


                        <div>

                            Pendapatan

                            <strong>

                                ${

                                    formatRupiah(

                                        income

                                    )

                                }

                            </strong>

                        </div>


                    </div>

                </div>

            `;

        }

    );


    renderPagination(

        sortedData.length

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

    /* =============================================
       NAMA FIELD UTAMA
       Nanti kita sesuaikan dengan calculation.js
    ============================================= */

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
   FORMAT RUPIAH
===================================================== */

function formatRupiah(

    value

){

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

        toNumber(

            value

        )

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
