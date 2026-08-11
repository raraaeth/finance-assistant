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
   - Motivation
   - Summary
   - Insight
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
       APPLY DATA
    ============================================= */

    Statistics.applyFilter();


    /* =============================================
       RENDER
    ============================================= */

    Statistics.renderMotivation();

    Statistics.renderSummary();

    Statistics.renderInsight();

    Statistics.renderChart();

    Statistics.renderTransaction();


    console.log(

        "========== STATISTICS =========="

    );

    console.log(

        "STATISTICS FILTER:",

        Statistics.filter

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


    /* =============================================
       RESET PAGE
    ============================================= */

    Statistics.page = 1;


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
       REFRESH DATA
    ============================================= */

    Statistics.applyFilter();


    /* =============================================
       REFRESH UI
    ============================================= */

    Statistics.renderSummary();

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


    const start =

        Statistics.filter.start;


    const end =

        Statistics.filter.end;


    Statistics.data =

        attendance.filter(

            item=>{

                const date =

                    item.dateObject

                    ?

                    item.dateObject

                    :

                    new Date(

                        item.date

                    );


                if(

                    !date

                    ||

                    Number.isNaN(

                        date.getTime()

                    )

                ){

                    return false;

                }


                return (

                    date >= start

                    &&

                    date <= end

                );

            }

        );

};


/* =====================================================
   MOTIVATION
===================================================== */

Statistics.renderMotivation = function(){

    const section =

        document.getElementById(

            "statistics-motivation"

        );


    const card =

        document.getElementById(

            "statistics-motivation-card"

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


    card.innerHTML =

    `

        <div class="statistics-motivation-text">

            ${

                Insight.getMotivation()

            }

        </div>

    `;

};


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
       SUMMARY STATE
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


    /* =============================================
       PROCESS DATA
    ============================================= */

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


                case "libur":

                    summary.libur++;

                    break;


                case "lembur":

                    summary.lembur++;

                    break;


                case "absen":

                    summary.absen++;

                    break;

            }


            /* =====================================
               ONTIME
            ===================================== */

            if(

                item.attendanceStatus ===

                "ontime"

            ){

                summary.ontime++;

            }


            /* =====================================
               TELAT
            ===================================== */

            if(

                item.attendanceStatus ===

                "telat"

            ){

                summary.telat++;

            }


            /* =====================================
               TELAT MENIT
            ===================================== */

            summary.lateMinutes +=

                Number(

                    item.lateMinutes || 0

                );


            /* =====================================
               IZIN TELAT
            ===================================== */

            summary.izinTelatHours +=

                Number(

                    item.izinTelatHours || 0

                );


            /* =====================================
               IZIN PULANG
            ===================================== */

            summary.izinPulangHours +=

                Number(

                    item.izinPulangHours || 0

                );


            /* =====================================
               LEMBUR JAM
            ===================================== */

            summary.lemburHours +=

                Number(

                    item.overtimeHours || 0

                );

        }

    );


    /* =============================================
       ITEM SUMMARY
    ============================================= */

    const items = [

        {

            label :

                "🟢 Masuk",

            value :

                `${summary.masuk} kali`,

            show :

                summary.masuk > 0

        },


        {

            label :

                "✅ Ontime",

            value :

                `${summary.ontime} kali`,

            show :

                summary.ontime > 0

        },


        {

            label :

                "🟠 Telat",

            value :

                `${summary.lateMinutes} menit`,

            show :

                summary.lateMinutes > 0

        },


        {

            label :

                "📝 Izin Telat",

            value :

                `${summary.izinTelatHours} jam`,

            show :

                summary.izinTelatHours > 0

        },


        {

            label :

                "🚪 Izin Pulang",

            value :

                `${summary.izinPulangHours} jam`,

            show :

                summary.izinPulangHours > 0

        },


        {

            label :

                "🌸 Cuti",

            value :

                `${summary.cuti} kali`,

            show :

                summary.cuti > 0

        },


        {

            label :

                "🔵 Sakit",

            value :

                `${summary.sakit} kali`,

            show :

                summary.sakit > 0

        },


        {

            label :

                "🏖️ Libur",

            value :

                `${summary.libur} kali`,

            show :

                summary.libur > 0

        },


        {

            label :

                "🔵 Lembur",

            value :

                `${summary.lembur} kali`,

            show :

                summary.lembur > 0

        },


        {

            label :

                "⏰ Lembur Jam",

            value :

                `${summary.lemburHours} jam`,

            show :

                summary.lemburHours > 0

        },


        {

            label :

                "⚠️ Absen",

            value :

                `${summary.absen} kali`,

            show :

                summary.absen > 0

        }

    ];


    /* =============================================
       ONLY NON ZERO
    ============================================= */

    const visibleItems =

        items.filter(

            item =>

                item.show

        );


    /* =============================================
       SHOW SECTION
    ============================================= */

    section.classList.remove(

        "hidden"

    );


    /* =============================================
       EMPTY
    ============================================= */

    if(

        visibleItems.length === 0

    ){

        card.innerHTML =

        `

            <div class="attendance-empty">

                Belum ada aktivitas
                pada periode ini.

            </div>

        `;

        return;

    }


    /* =============================================
       RENDER CARDS
    ============================================= */

    card.innerHTML =

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

        .join("");

};


/* =====================================================
   INSIGHT
===================================================== */

Statistics.renderInsight = function(){

    const section =

        document.getElementById(

            "statistics-insight"

        );


    const card =

        document.getElementById(

            "statistics-insight-card"

        );


    if(

        !section ||

        !card

    ){

        return;

    }


    const insight =

        Insight.getPeriodInsight();


    section.classList.remove(

        "hidden"

    );


    card.innerHTML =

    `

        <div class="statistics-insight-text">

            ${

                insight.text

            }

        </div>

    `;

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


    /* =============================================
       RESET PAGE
    ============================================= */

    Statistics.page = 1;


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
       REFRESH DATA
    ============================================= */

    Statistics.applyFilter();


    /* =============================================
       REFRESH UI
    ============================================= */

    Statistics.renderSummary();

    Statistics.renderChart();

    Statistics.renderTransaction();


    console.log(

        "Payroll Statistics Range:",

        value

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
       SORT
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


    /* =============================================
       RENDER
    ============================================= */

    sortedData

        .slice(

            start,

            end

        )

        .forEach(

            item=>{

                const status =

                    item.status ??

                    "absen";


                const date =

                    item.date ??

                    "-";


                const shift =

                    item.shift ??

                    "-";


                const checkin =

                    item.checkin ??

                    "-";


                const pulang =

                    item.pulang ??

                    "-";


                let detail = "";


                /* =================================
                   MASUK
                ================================= */

                if(

                    status ===

                    "masuk"

                ){

                    detail +=

                    `

                        <span>

                            Shift

                            <strong>

                                ${capitalize(

                                    shift

                                )}

                            </strong>

                        </span>

                    `;


                    if(

                        item.attendanceStatus

                    ){

                        detail +=

                        `

                            <span>

                                Status

                                <strong>

                                    ${capitalize(

                                        item.attendanceStatus

                                    )}

                                </strong>

                            </span>

                        `;

                    }


                    if(

                        item.lateMinutes >

                        0

                    ){

                        detail +=

                        `

                            <span>

                                Telat

                                <strong>

                                    ${

                                        item.lateMinutes

                                    }

                                    menit

                                </strong>

                            </span>

                        `;

                    }


                    if(

                        item.izinTelatHours >

                        0

                    ){

                        detail +=

                        `

                            <span>

                                Izin Telat

                                <strong>

                                    ${

                                        item.izinTelatHours

                                    }

                                    jam

                                </strong>

                            </span>

                        `;

                    }


                    if(

                        item.izinPulangHours >

                        0

                    ){

                        detail +=

                        `

                            <span>

                                Izin Pulang

                                <strong>

                                    ${

                                        item.izinPulangHours

                                    }

                                    jam

                                </strong>

                            </span>

                        `;

                    }

                }


                /* =================================
                   LEMBUR
                ================================= */

                else if(

                    status ===

                    "lembur"

                ){

                    detail +=

                    `

                        <span>

                            Shift

                            <strong>

                                ${capitalize(

                                    shift

                                )}

                            </strong>

                        </span>


                        <span>

                            Jenis

                            <strong>

                                Lembur Harian

                            </strong>

                        </span>

                    `;


                    if(

                        item.overtimeHours >

                        0

                    ){

                        detail +=

                        `

                            <span>

                                Lembur Jam

                                <strong>

                                    ${

                                        item.overtimeHours

                                    }

                                    jam

                                </strong>

                            </span>

                        `;

                    }

                }


                /* =================================
                   STATUS LAIN
                ================================= */

                else {

                    detail +=

                    `

                        <span>

                            Status

                            <strong>

                                ${capitalize(

                                    status

                                )}

                            </strong>

                        </span>

                    `;

                }


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

                                    statusLabel(

                                        status

                                    )

                                }

                            </strong>


                            <small>

                                ${date}

                            </small>

                        </div>


                        <div

                            class="transaction-time"

                        >

                            ${detail}

                        </div>

                    </div>

                `;

            }

        );


    /* =============================================
       EMPTY
    ============================================= */

    if(

        sortedData.length === 0

    ){

        list.innerHTML =

        `

            <div class="attendance-empty">

                Tidak ada aktivitas
                pada periode ini.

            </div>

        `;

    }


    /* =============================================
       PAGINATION
    ============================================= */

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
   HELPER : FORMAT PERIOD
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
   HELPER : STATUS LABEL
===================================================== */

function statusLabel(

    status

){

    const labels = {

        masuk :

            "🟢 Masuk",

        cuti :

            "🌸 Cuti",

        sakit :

            "🔵 Sakit",

        lembur :

            "🔵 Lembur",

        libur :

            "🏖️ Libur",

        libur_nasional :

            "🔴 Libur Nasional",

        absen :

            "⚠️ Absen"

    };


    return (

        labels[status]

        ??

        capitalize(

            status

        )

    );

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

    )

    .replace(

        /\b\w/g,

        letter =>

            letter.toUpperCase()

    );

}
