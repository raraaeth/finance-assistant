/* =====================================================
   Finance Assistant
   Module      : Financial
   File        : statistics.js
   Version     : 1.0.0

   Description :
   Financial Statistics Controller

   Sections :
   - State
   - Init
   - Filter
   - Chart
   - Transaction
   - Pagination
   - Helper
===================================================== */


/* =====================================================
   STATE
===================================================== */

export const Statistics = {

    data : [],

    filteredData : [],

    page : 1,

    perPage : 5,

    month : "all",

    category : "all",

    chart : null

};


/* =====================================================
   INIT
===================================================== */

Statistics.init = function(

    data = []

){

    Statistics.data =

        Array.isArray(

            data

        )

            ?

            data

            :

            [];


    Statistics.page = 1;

    Statistics.month = "all";

    Statistics.category = "all";


    Statistics.filteredData =

        Statistics.data;


    renderFilter();

    renderChart();

    Statistics.renderTransaction();

};


/* =====================================================
   FILTER
===================================================== */

function renderFilter(){

    const filter =

        document.getElementById(

            "statistics-filter-list"

        );


    if(

        !filter

    ){

        return;

    }


    const months =

        getAvailableMonths(

            Statistics.data

        );


    filter.innerHTML =

    `

        <button

            type="button"

            class="statistics-filter-item active"

            data-month="all"

        >

            Semua

        </button>


        ${

            months.map(

                month => `

                    <button

                        type="button"

                        class="statistics-filter-item"

                        data-month="${month.value}"

                    >

                        ${month.label}

                    </button>

                `

            ).join("")

        }

    `;


    filter

        .querySelectorAll(

            ".statistics-filter-item"

        )

        .forEach(

            button => {

                button.addEventListener(

                    "click",

                    () => {

                        Statistics.month =

                            button.dataset.month;


                        Statistics.page = 1;


                        filter

                            .querySelectorAll(

                                ".statistics-filter-item"

                            )

                            .forEach(

                                item => {

                                    item.classList.toggle(

                                        "active",

                                        item === button

                                    );

                                }

                            );


                        applyFilter();

                    }

                );

            }

        );

}


/* =====================================================
   APPLY FILTER
===================================================== */

function applyFilter(){

    Statistics.filteredData =

        Statistics.data.filter(

            item => {

                if(

                    Statistics.month !==

                    "all"

                ){

                    if(

                        !item.date ||

                        !item.date.startsWith(

                            Statistics.month

                        )

                    ){

                        return false;

                    }

                }


                if(

                    Statistics.category !==

                    "all"

                ){

                    if(

                        item.category !==

                        Statistics.category

                    ){

                        return false;

                    }

                }


                return true;

            }

        );


    renderChart();

    Statistics.renderTransaction();

}


/* =====================================================
   CHART
===================================================== */

function renderChart(){

    const canvas =

        document.getElementById(

            "statistics-chart-canvas"

        );


    if(

        !canvas ||

        typeof Chart ===

        "undefined"

    ){

        return;

    }


    if(

        Statistics.chart

    ){

        Statistics.chart.destroy();

        Statistics.chart = null;

    }


    const grouped = {};


    Statistics.filteredData.forEach(

        item => {

            if(

                !item.date

            ){

                return;

            }


            if(

                !grouped[item.date]

            ){

                grouped[item.date] = {

                    income : 0,

                    expense : 0

                };

            }


            if(

                item.category ===

                "income"

            ){

                grouped[item.date].income +=

                    toNumber(

                        item.nominal

                    );

            }


            else if(

                item.category ===

                "expense"

            ){

                grouped[item.date].expense +=

                    toNumber(

                        item.nominal

                    );

            }

        }

    );


    const dates =

        Object.keys(

            grouped

        ).sort();


    const labels =

        dates.map(

            date =>

                formatShortDate(

                    date

                )

        );


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


    Statistics.chart =

        new Chart(

            canvas,

            {

                type :

                    "bar",


                data : {

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

                            borderRadius : 6

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

                            borderRadius : 6

                        }

                    ]

                },


                options : {

                    responsive : true,

                    maintainAspectRatio : false,


                    interaction : {

                        mode :

                            "index",

                        intersect :

                            false

                    },


                    plugins : {

                        legend : {

                            display : true

                        }

                    },


                    scales : {

                        y : {

                            beginAtZero : true,


                            ticks : {

                                callback :

                                    value =>

                                        formatCompactRupiah(

                                            value

                                        )

                            }

                        }

                    }

                }

            }

        );

}


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
       GROUP BY DATE
    ============================================= */

    const grouped = {};


    Statistics.filteredData.forEach(

        item => {

            if(

                !item.date

            ){

                return;

            }


            if(

                !grouped[item.date]

            ){

                grouped[item.date] = {

                    date :

                        item.date,

                    items : []

                };

            }


            grouped[item.date].items.push(

                item

            );

        }

    );


    /* =============================================
       SORT DATE
    ============================================= */

    const days =

        Object.values(

            grouped

        ).sort(

            (a, b) =>

                b.date.localeCompare(

                    a.date

                )

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
       RENDER
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


                    <div class="transaction-date">

                        ${

                            formatLongDate(

                                day.date

                            )

                        }

                    </div>


                    <div class="transaction-detail">

                        ${

                            items.map(

                                item => `

                                    <div

                                        class="transaction-work-row"

                                    >


                                        <span

                                            class="transaction-name"

                                        >

                                            ${

                                                escapeHTML(

                                                    item.name

                                                )

                                            }

                                        </span>


                                        <span

                                            class="transaction-amount

                                            ${

                                                item.category ===

                                                "income"

                                                    ?

                                                    "transaction-income"

                                                    :

                                                    "transaction-expense"

                                            }"

                                        >

                                            ${

                                                rupiahSafe(

                                                    item.nominal

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

                    item.nama

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

                        item.category

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

    totalDays

){

    const container =

        document.getElementById(

            "statistics-show-more"

        );


    if(

        !container

    ){

        return;

    }


    const totalPage =

        Math.ceil(

            totalDays /

            Statistics.perPage

        );


    if(

        totalPage <= 1

    ){

        container.innerHTML = "";

        return;

    }


    container.innerHTML =

    `

        <div class="statistics-pagination">


            <button

                type="button"

                data-page="prev"

                ${

                    Statistics.page <= 1

                        ?

                        "disabled"

                        :

                        ""

                }

            >

                ◀ Sebelumnya

            </button>


            <span>

                ${

                    Statistics.page

                }

                /

                ${

                    totalPage

                }

            </span>


            <button

                type="button"

                data-page="next"

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


    const previous =

        container.querySelector(

            '[data-page="prev"]'

        );


    const next =

        container.querySelector(

            '[data-page="next"]'

        );


    if(

        previous

    ){

        previous.addEventListener(

            "click",

            () => {

                if(

                    Statistics.page <= 1

                ){

                    return;

                }


                Statistics.page--;


                Statistics.renderTransaction();

            }

        );

    }


    if(

        next

    ){

        next.addEventListener(

            "click",

            () => {

                if(

                    Statistics.page >= totalPage

                ){

                    return;

                }


                Statistics.page++;


                Statistics.renderTransaction();

            }

        );

    }

}


/* =====================================================
   AVAILABLE MONTHS
===================================================== */

function getAvailableMonths(

    data

){

    const values =

        [

            ...new Set(

                data

                    .map(

                        item =>

                            item.date

                            ?

                            item.date.slice(

                                0,

                                7

                            )

                            :

                            null

                    )

                    .filter(

                        Boolean

                    )

            )

        ];


    values.sort(

        (a, b) =>

            b.localeCompare(a)

    );


    return values.map(

        value => ({

            value,

            label :

                formatMonth(

                    value

                )

        })

    );

}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatLongDate(

    value

){

    const date =

        parseDate(

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

                "numeric",

            month :

                "long",

            year :

                "numeric"

        }

    );

}


function formatShortDate(

    value

){

    const date =

        parseDate(

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


function formatMonth(

    value

){

    const date =

        parseDate(

            `${value}-01`

        );


    if(

        !date

    ){

        return value;

    }


    return date.toLocaleDateString(

        "id-ID",

        {

            month :

                "long",

            year :

                "numeric"

        }

    );

}


function parseDate(

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
