/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Statistics
   File        : statistics.js
   Version     : 2.1.0

   Description :
   Payroll Monthly Statistics Controller

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


    Statistics.page = 1;


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

                    item.dateObject;


                if(

                    !date

                ){

                    return false;

                }


                return (

                    date >=

                    Statistics.filter.start

                )

                &&

                (

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

        libur : 0,

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


                case "libur":

                    summary.libur++;

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

            "Libur",

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

                    summary.libur,

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


    Statistics.page = 1;


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


    Statistics.renderTransaction();


    console.log(

        "Payroll Statistics Range:",

        value

    );

}


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


    list.innerHTML = "";


    /* =============================================
       SORT
       Terbaru → terlama
    ============================================= */

    const sortedData =

        Statistics.data

        .slice()

        .sort(

            (

                a,

                b

            ) =>

                b.dateObject -

                a.dateObject

        );


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


    const pageData =

        sortedData.slice(

            start,

            end

        );


    /* =============================================
       RENDER
    ============================================= */

    pageData.forEach(

        item=>{

            list.innerHTML +=

                createTransaction(

                    item

                );

        }

    );


    /* =============================================
       PAGINATION
    ============================================= */

    renderPagination();

};


/* =====================================================
   CREATE TRANSACTION
===================================================== */

function createTransaction(

    item

){

    const status =

        item.status ??

        "absen";


    const date =

        item.dateObject

        ?

        formatDate(

            item.dateObject

        )

        :

        "-";


    const icon =

        getStatusIcon(

            status

        );


    const statusLabel =

        getStatusLabel(

            status

        );


    /* =============================================
       DETAIL
    ============================================= */

    const details = [];


    /* ---------------------------------------------
       SHIFT
    --------------------------------------------- */

    if(

        item.shift

    ){

        details.push(

            `

            <div class="transaction-detail">

                <span>Shift</span>

                <strong>

                    ${capitalize(item.shift)}

                </strong>

            </div>

            `

        );

    }


    /* ---------------------------------------------
       ATTENDANCE STATUS
    --------------------------------------------- */

    if(

        status === "masuk"

        &&

        item.attendanceStatus

    ){

        const label =

            item.attendanceStatus ===

            "ontime"

            ?

            "Ontime"

            :

            "Telat";


        details.push(

            `

            <div class="transaction-detail">

                <span>Status</span>

                <strong>

                    ${label}

                </strong>

            </div>

            `

        );

    }


    /* ---------------------------------------------
       TELAT
    --------------------------------------------- */

    if(

        toNumber(

            item.lateMinutes

        ) > 0

    ){

        details.push(

            `

            <div class="transaction-detail">

                <span>Telat</span>

                <strong>

                    ${item.lateMinutes} menit

                </strong>

            </div>

            `

        );

    }


    /* ---------------------------------------------
       IZIN TELAT
    --------------------------------------------- */

    if(

        toNumber(

            item.izinTelatHours

        ) > 0

    ){

        details.push(

            `

            <div class="transaction-detail">

                <span>Izin Telat</span>

                <strong>

                    ${item.izinTelatHours} jam

                </strong>

            </div>

            `

        );

    }


    /* ---------------------------------------------
       IZIN PULANG
    --------------------------------------------- */

    if(

        toNumber(

            item.izinPulangHours

        ) > 0

    ){

        details.push(

            `

            <div class="transaction-detail">

                <span>Izin Pulang</span>

                <strong>

                    ${item.izinPulangHours} jam

                </strong>

            </div>

            `

        );

    }


    /* ---------------------------------------------
       LEMBUR HARIAN
    --------------------------------------------- */

    if(

        status === "lembur"

    ){

        details.push(

            `

            <div class="transaction-detail">

                <span>Jenis</span>

                <strong>

                    Lembur Harian

                </strong>

            </div>

            `

        );

    }


    /* ---------------------------------------------
       LEMBUR JAM
    --------------------------------------------- */

    if(

        toNumber(

            item.overtimeHours

        ) > 0

    ){

        details.push(

            `

            <div class="transaction-detail">

                <span>Lembur Jam</span>

                <strong>

                    ${item.overtimeHours} jam

                </strong>

            </div>

            `

        );

    }


    return `

        <div

            class="transaction-item status-${status}"

        >


            <div

                class="transaction-header"

            >


                <div

                    class="transaction-title"

                >

                    <span

                        class="transaction-icon"

                    >

                        ${icon}

                    </span>


                    <strong>

                        ${statusLabel}

                    </strong>

                </div>


                <small>

                    ${date}

                </small>


            </div>


            ${

                details.length

                ?

                `

                <div

                    class="transaction-details"

                >

                    ${

                        details.join("")

                    }

                </div>

                `

                :

                ""

            }


        </div>

    `;

}


/* =====================================================
   STATUS ICON
===================================================== */

function getStatusIcon(

    status

){

    switch(

        status

    ){

        case "masuk":

            return "🟢";


        case "lembur":

            return "🔵";


        case "cuti":

            return "🏖️";


        case "sakit":

            return "🤒";


        case "libur":

            return "📅";


        case "absen":

            return "❌";


        default:

            return "📌";

    }

}


/* =====================================================
   STATUS LABEL
===================================================== */

function getStatusLabel(

    status

){

    switch(

        status

    ){

        case "masuk":

            return "Masuk";


        case "lembur":

            return "Lembur";


        case "cuti":

            return "Cuti";


        case "sakit":

            return "Sakit";


        case "libur":

            return "Libur";


        case "absen":

            return "Absen";


        default:

            return capitalize(

                status

            );

    }

}


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
   HELPER : PERIOD
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
   HELPER : NUMBER
===================================================== */

function toNumber(

    value

){

    if(

        value ===

        null

        ||

        value ===

        undefined

        ||

        value ===

        ""

    ){

        return 0;

    }


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
   HELPER : CAPITALIZE
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
