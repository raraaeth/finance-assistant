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

    Filter

} from "../../js/filter.js";


import {

    Chart

} from "../../js/chart.js";


import {

    Insight

} from "./insight.js";


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

    summary : {

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

    },

    page : 1,

    perPage : 5

};


/* =====================================================
   INIT
===================================================== */

Statistics.init = function(){

    initializeFilter();

    Statistics.applyFilter();

    Statistics.renderSummary();

    Statistics.renderInsight();

    Statistics.renderChart();

    Statistics.renderTransaction();

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


    Statistics.filter.range =

        null;


    Filter.render({

        container :

            "#statistics-filter-list",

        period :

            formatPeriod(

                Statistics.filter.start,

                Statistics.filter.end

            ),

        range :

            null

    });


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


    refresh();


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

            item => {

                if(

                    !item.dateObject

                ){

                    return false;

                }


                const date =

                    item.dateObject;


                return (

                    date >=

                    Statistics.filter.start

                    &&

                    date <=

                    Statistics.filter.end

                );

            }

        );


    processSummary();

};


/* =====================================================
   SUMMARY
===================================================== */

function processSummary(){

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

                Number(

                    item.lateMinutes || 0

                );


            summary.izinTelatHours +=

                Number(

                    item.izinTelatHours || 0

                );


            summary.izinPulangHours +=

                Number(

                    item.izinPulangHours || 0

                );


            summary.lemburHours +=

                Number(

                    item.overtimeHours || 0

                );

        }

    );


    Statistics.summary =

        summary;

}


/* =====================================================
   RENDER SUMMARY
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


    const summary =

        Statistics.summary;


    const items = [];


    /*
       Hanya tampilkan nilai
       yang lebih dari 0.
    */

    if(

        summary.masuk > 0

    ){

        items.push({

            label : "Masuk",

            value :

                summary.masuk +

                " kali"

        });

    }


    if(

        summary.ontime > 0

    ){

        items.push({

            label : "Ontime",

            value :

                summary.ontime +

                " kali"

        });

    }


    if(

        summary.telat > 0

    ){

        items.push({

            label : "Telat",

            value :

                summary.lateMinutes +

                " menit"

        });

    }


    if(

        summary.izinTelatHours > 0

    ){

        items.push({

            label : "Izin Telat",

            value :

                summary.izinTelatHours +

                " jam"

        });

    }


    if(

        summary.izinPulangHours > 0

    ){

        items.push({

            label : "Izin Pulang",

            value :

                summary.izinPulangHours +

                " jam"

        });

    }


    if(

        summary.cuti > 0

    ){

        items.push({

            label : "Cuti",

            value :

                summary.cuti +

                " kali"

        });

    }


    if(

        summary.sakit > 0

    ){

        items.push({

            label : "Sakit",

            value :

                summary.sakit +

                " kali"

        });

    }


    if(

        summary.libur > 0

    ){

        items.push({

            label : "Libur",

            value :

                summary.libur +

                " kali"

        });

    }


    if(

        summary.lembur > 0

    ){

        items.push({

            label : "Lembur",

            value :

                summary.lembur +

                " kali"

        });

    }


    if(

        summary.lemburHours > 0

    ){

        items.push({

            label : "Lembur Per Jam",

            value :

                summary.lemburHours +

                " jam"

        });

    }


    if(

        summary.absen > 0

    ){

        items.push({

            label : "Absen",

            value :

                summary.absen +

                " kali"

        });

    }


    /*
       Tidak ada data.
    */

    if(

        items.length === 0

    ){

        section.classList.remove(

            "hidden"

        );


        card.innerHTML =

        `

            <div class="statistics-empty">

                Belum ada aktivitas

                pada periode ini.

            </div>

        `;

        return;

    }


    /*
       Render summary.
    */

    card.innerHTML =

        `

        <div class="statistics-summary-grid">

            ${

                items.map(

                    item => `

                    <div class="statistics-summary-item">

                        <span>

                            ${item.label}

                        </span>

                        <strong>

                            ${item.value}

                        </strong>

                    </div>

                    `

                ).join("")

            }

        </div>

        `;


    section.classList.remove(

        "hidden"

    );

}


/* =====================================================
   RENDER INSIGHT
===================================================== */

Statistics.renderInsight = function(){

    Insight.init();


    const motivation =

        document.getElementById(

            "statistics-motivation"

        );


    const periodInsight =

        document.getElementById(

            "statistics-period-insight"

        );


    if(

        motivation

    ){

        motivation.textContent =

            Insight.getMotivation();

    }


    if(

        periodInsight

    ){

        periodInsight.textContent =

            Insight.getPeriodInsight().text;

    }

};


/* =====================================================
   RENDER CHART
===================================================== */

Statistics.renderChart = function(){

    const summary =

        Statistics.summary;


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


    refresh();


    console.log(

        "Payroll Statistics Range:",

        value

    );

}


/* =====================================================
   REFRESH
===================================================== */

function refresh(){

    Statistics.applyFilter();

    Statistics.renderSummary();

    Statistics.renderInsight();

    Statistics.renderChart();

    Statistics.renderTransaction();

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


    const start =

        (

            Statistics.page - 1

        )

        *

        Statistics.perPage;


    const end =

        start +

        Statistics.perPage;


    Statistics.data

        .slice()

        .sort(

            (

                a,

                b

            ) =>

                b.dateObject -

                a.dateObject

        )

        .slice(

            start,

            end

        )

        .forEach(

            item => {

                const status =

                    item.status ??

                    "-";


                const date =

                    item.date ??

                    "-";


                let detail = "";


                if(

                    status === "masuk"

                ){

                    detail = `

                        <div class="transaction-detail">

                            <span>

                                Shift

                            </span>

                            <strong>

                                ${

                                    item.shift ||

                                    "-"

                                }

                            </strong>

                        </div>


                        <div class="transaction-detail">

                            <span>

                                Kehadiran

                            </span>

                            <strong>

                                ${

                                    item.attendanceStatus ||

                                    "-"

                                }

                            </strong>

                        </div>


                        ${

                            item.lateMinutes > 0

                            ?

                            `

                            <div class="transaction-detail">

                                <span>

                                    Telat

                                </span>

                                <strong>

                                    ${

                                        item.lateMinutes

                                    }

                                    menit

                                </strong>

                            </div>

                            `

                            :

                            ""

                        }


                        ${

                            item.izinTelatHours > 0

                            ?

                            `

                            <div class="transaction-detail">

                                <span>

                                    Izin Telat

                                </span>

                                <strong>

                                    ${

                                        item.izinTelatHours

                                    }

                                    jam

                                </strong>

                            </div>

                            `

                            :

                            ""

                        }


                        ${

                            item.izinPulangHours > 0

                            ?

                            `

                            <div class="transaction-detail">

                                <span>

                                    Izin Pulang

                                </span>

                                <strong>

                                    ${

                                        item.izinPulangHours

                                    }

                                    jam

                                </strong>

                            </div>

                            `

                            :

                            ""

                        }


                        ${

                            item.overtimeHours > 0

                            ?

                            `

                            <div class="transaction-detail">

                                <span>

                                    Lembur

                                </span>

                                <strong>

                                    ${

                                        item.overtimeHours

                                    }

                                    jam

                                </strong>

                            </div>

                            `

                            :

                            ""

                        }

                    `;

                }


                else if(

                    status === "lembur"

                ){

                    detail = `

                        <div class="transaction-detail">

                            <span>

                                Jenis

                            </span>

                            <strong>

                                Lembur Harian

                            </strong>

                        </div>


                        ${

                            item.shift

                            ?

                            `

                            <div class="transaction-detail">

                                <span>

                                    Shift

                                </span>

                                <strong>

                                    ${item.shift}

                                </strong>

                            </div>

                            `

                            :

                            ""

                        }


                        ${

                            item.overtimeHours > 0

                            ?

                            `

                            <div class="transaction-detail">

                                <span>

                                    Lembur

                                </span>

                                <strong>

                                    ${

                                        item.overtimeHours

                                    }

                                    jam

                                </strong>

                            </div>

                            `

                            :

                            ""

                        }


                        ${

                            item.izinTelatHours > 0

                            ?

                            `

                            <div class="transaction-detail">

                                <span>

                                    Izin Telat

                                </span>

                                <strong>

                                    ${

                                        item.izinTelatHours

                                    }

                                    jam

                                </strong>

                            </div>

                            `

                            :

                            ""

                        }

                    `;

                }


                else {

                    detail = `

                        <div class="transaction-detail">

                            <span>

                                Status

                            </span>

                            <strong>

                                ${

                                    capitalize(

                                        status

                                    )

                                }

                            </strong>

                        </div>

                    `;

                }


                list.innerHTML +=

                `

                <div class="transaction-item status-${status}">

                    <div class="transaction-header">

                        <strong>

                            ${

                                capitalize(

                                    status

                                )

                            }

                        </strong>

                        <small>

                            ${date}

                        </small>

                    </div>


                    <div class="transaction-details">

                        ${detail}

                    </div>

                </div>

                `;

            }

        );


    renderPagination();

};


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

    event => {

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
