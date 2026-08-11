/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Statistics
   File        : statistics.js
   Version     : 3.0.0

   Description :
   Payroll Monthly Statistics Controller

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

    Insight

} from "./insight.js";


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
       INSIGHT
    ============================================= */

    Insight.init();


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


    console.log(

        "========== STATISTICS =========="

    );

    console.log(

        "STATISTICS DATA:",

        Statistics.data

    );

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


    Statistics.filter.end.setHours(

        23,

        59,

        59,

        999

    );


    Statistics.filter.range =

        value;


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

        value

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

    const attendance =

        Process.attendance?.data ?? [];


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

        attendance.filter(

            item => {

                const date =

                    item.dateObject

                    ?

                    item.dateObject

                    :

                    parseLocalDate(

                        item.date

                    );


                if(

                    !date

                ){

                    return false;

                }


                return (

                    date >= start &&

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

    Statistics.renderSummary();

    Statistics.renderChart();

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
       GET INSIGHT
    ============================================= */

    const shortMotivation =

    Insight.getShortMotivation();


    const longMotivation =

    Insight.getMotivation();

    /* =============================================
       BUILD SUMMARY
    ============================================= */

    const summary = {

        masuk : 0,

        ontime : 0,

        telat : 0,

        lateMinutes : 0,

        izinTelatHours : 0,

        izinPulangHours : 0,

        cuti : 0,

        sakit : 0,

        libur : 0,

        lembur : 0,

        lemburHours : 0,

        absen : 0

    };


    Statistics.data.forEach(

        item => {

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


                case "libur":

                case "libur_nasional":

                    summary.libur++;

                    break;


                case "lembur":

                    summary.lembur++;

                    break;


                case "absen":

                    summary.absen++;

                    break;

            }


            if(

                item.attendanceStatus ===

                "ontime"

            ){

                summary.ontime++;

            }


            if(

                item.attendanceStatus ===

                "telat"

            ){

                summary.telat++;

            }


            summary.lateMinutes +=

                toNumber(

                    item.lateMinutes

                );


            summary.izinTelatHours +=

                toNumber(

                    item.izinTelatHours

                );


            summary.izinPulangHours +=

                toNumber(

                    item.izinPulangHours

                );


            summary.lemburHours +=

                toNumber(

                    item.overtimeHours

                );

        }

    );


    /* =============================================
       SUMMARY ITEMS
    ============================================= */

    const items = [

        {

            key :

                "masuk",

            label :

                "🟢 Masuk",

            value :

                formatCount(

                    summary.masuk

                )

        },


        {

            key :

                "ontime",

            label :

                "✅ Ontime",

            value :

                formatCount(

                    summary.ontime

                )

        },


        {

            key :

                "lateMinutes",

            label :

                "🟠 Telat",

            value :

                formatMinutes(

                    summary.lateMinutes

                )

        },


        {

            key :

                "izinTelatHours",

            label :

                "📝 Izin Telat",

            value :

                formatHours(

                    summary.izinTelatHours

                )

        },


        {

            key :

                "izinPulangHours",

            label :

                "🚪 Izin Pulang",

            value :

                formatHours(

                    summary.izinPulangHours

                )

        },


        {

            key :

                "cuti",

            label :

                "🌸 Cuti",

            value :

                formatCount(

                    summary.cuti

                )

        },


        {

            key :

                "sakit",

            label :

                "🔵 Sakit",

            value :

                formatCount(

                    summary.sakit

                )

        },


        {

            key :

                "libur",

            label :

                "🏖️ Libur",

            value :

                formatCount(

                    summary.libur

                )

        },


        {

            key :

                "lembur",

            label :

                "🔵 Lembur",

            value :

                formatCount(

                    summary.lembur

                )

        },


        {

            key :

                "lemburHours",

            label :

                "⏰ Lembur Jam",

            value :

                formatHours(

                    summary.lemburHours

                )

        },


        {

            key :

                "absen",

            label :

                "❌ Absen",

            value :

                formatCount(

                    summary.absen

                )

        }

    ];


    /* =============================================
       HANYA TAMPILKAN NILAI > 0
    ============================================= */

    const visibleItems =

        items.filter(

            item => {

                return hasValue(

                    item.key,

                    summary

                );

            }

        );


    /* =============================================
       RENDER
    ============================================= */

    card.innerHTML =

    `

        <div class="statistics-insight-content">

    <div class="statistics-short-motivation">

        ${shortMotivation.text}

    </div>


    <div class="statistics-long-motivation">

        ${longMotivation}

    </div>

</div>


        <div class="statistics-summary-grid">

            ${

                visibleItems.length

                ?

                visibleItems

                    .map(

                        item =>

                        `

                        <div

                            class="statistics-summary-item"

                        >

                            <span>

                                ${item.label}

                            </span>


                            <strong>

                                ${item.value}

                            </strong>

                        </div>

                        `

                    )

                    .join("")

                :

                `

                <div

                    class="statistics-summary-empty"

                >

                    Belum ada data attendance

                    pada periode ini.

                </div>

                `

            }

        </div>

    `;


    console.log(

        "STATISTICS SUMMARY:",

        summary

    );

};


/* =====================================================
   CHART
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

        item => {

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

                        a.dateObject

                        ?

                        a.dateObject

                        :

                        parseLocalDate(

                            a.date

                        );


                    const dateB =

                        b.dateObject

                        ?

                        b.dateObject

                        :

                        parseLocalDate(

                            b.date

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
       RENDER
    ============================================= */

    pageData.forEach(

        item => {

            const status =

                item.status ??

                "absen";


            const date =

                item.date ??

                "-";


            const shift =

                item.shift ??

                "";


            const statusText =

                getAttendanceStatus(

                    item

                );


            const detail =

                buildTransactionDetail(

                    item

                );


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

                            getStatusIcon(

                                status

                            )

                        }

                        ${

                            getStatusLabel(

                                status

                            )

                        }

                    </strong>


                    <small>

                        ${date}

                    </small>

                </div>


                <div

                    class="transaction-detail"

                >

                    ${

                        shift

                        ?

                        `

                        <div>

                            Shift

                            <strong>

                                ${shift}

                            </strong>

                        </div>

                        `

                        :

                        ""

                    }


                    ${

                        statusText

                        ?

                        `

                        <div>

                            Status

                            <strong>

                                ${statusText}

                            </strong>

                        </div>

                        `

                        :

                        ""

                    }


                    ${detail}

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
   TRANSACTION DETAIL
===================================================== */

function buildTransactionDetail(

    item

){

    const parts = [];


    /* =============================================
       TELAT
    ============================================= */

    if(

        item.lateMinutes >

        0

    ){

        parts.push(

            `

            <div>

                Telat

                <strong>

                    ${

                        formatMinutes(

                            item.lateMinutes

                        )

                    }

                </strong>

            </div>

            `

        );

    }


    /* =============================================
       IZIN TELAT
    ============================================= */

    if(

        item.izinTelatHours >

        0

    ){

        parts.push(

            `

            <div>

                Izin Telat

                <strong>

                    ${

                        formatHours(

                            item.izinTelatHours

                        )

                    }

                </strong>

            </div>

            `

        );

    }


    /* =============================================
       IZIN PULANG
    ============================================= */

    if(

        item.izinPulangHours >

        0

    ){

        parts.push(

            `

            <div>

                Izin Pulang

                <strong>

                    ${

                        formatHours(

                            item.izinPulangHours

                        )

                    }

                </strong>

            </div>

            `

        );

    }


    /* =============================================
       LEMBUR HARIAN
    ============================================= */

    if(

        item.status ===

        "lembur"

    ){

        parts.push(

            `

            <div>

                Jenis

                <strong>

                    Lembur Harian

                </strong>

            </div>

            `

        );

    }


    /* =============================================
       LEMBUR JAM
    ============================================= */

    if(

        item.overtimeHours >

        0

    ){

        parts.push(

            `

            <div>

                Lembur Jam

                <strong>

                    ${

                        formatHours(

                            item.overtimeHours

                        )

                    }

                </strong>

            </div>

            `

        );

    }


    return parts.join("");

}


/* =====================================================
   ATTENDANCE STATUS
===================================================== */

function getAttendanceStatus(

    item

){

    if(

        item.attendanceStatus ===

        "ontime"

    ){

        return "Ontime";

    }


    if(

        item.attendanceStatus ===

        "telat"

    ){

        return "Telat";

    }


    return "";

}


/* =====================================================
   STATUS LABEL
===================================================== */

function getStatusLabel(

    status

){

    const labels = {

        masuk :

            "Masuk",

        cuti :

            "Cuti",

        sakit :

            "Sakit",

        lembur :

            "Lembur",

        libur :

            "Libur",

        libur_nasional :

            "Libur Nasional",

        absen :

            "Absen"

    };


    return (

        labels[status] ??

        capitalize(status)

    );

}


/* =====================================================
   STATUS ICON
===================================================== */

function getStatusIcon(

    status

){

    const icons = {

        masuk :

            "🟢",

        cuti :

            "🌸",

        sakit :

            "🔵",

        lembur :

            "🔵",

        libur :

            "🏖️",

        libur_nasional :

            "🔴",

        absen :

            "⚪"

    };


    return (

        icons[status] ??

        "⚪"

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
   HAS VALUE
===================================================== */

function hasValue(

    key,

    summary

){

    return (

        toNumber(

            summary[key]

        ) > 0

    );

}


/* =====================================================
   FORMAT COUNT
===================================================== */

function formatCount(

    value

){

    return `${value} kali`;

}


/* =====================================================
   FORMAT MINUTES
===================================================== */

function formatMinutes(

    value

){

    if(

        value <= 0

    ){

        return "";

    }


    return `${value} menit`;

}


/* =====================================================
   FORMAT HOURS
===================================================== */

function formatHours(

    value

){

    if(

        value <= 0

    ){

        return "";

    }


    if(

        Number.isInteger(value)

    ){

        return `${value} jam`;

    }


    return `${value} jam`;

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
   HELPER : NUMBER
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
