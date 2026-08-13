/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Summary
   File        : summary.js
   Version     : 1.2.0

   Description :
   Payroll Daily Salary Summary

   Responsibility :
   - Menampilkan periode terakhir
   - Menampilkan periode berjalan
   - Menampilkan gaji bersih
   - Menampilkan rincian pekerjaan
   - Menampilkan penambahan
   - Menampilkan potongan
   - Membaca hasil Process
   - Tidak menjalankan Rule / Calculation / Periode

   Sections :
   - Last Completed Period
   - Current Salary Period
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Process

} from "./process.js";


import {

    rupiah,

    formatDate

} from "../../js/utils.js";


/* =====================================================
   STATE
===================================================== */

export const Summary = {

    current : null,

    previous : null

};


/* =====================================================
   INIT
===================================================== */

Summary.init = function(){

    /* =============================================
       HIDE GLOBAL SUMMARY SECTIONS
       Payroll Daily hanya menggunakan
       section payroll khusus.
    ============================================= */

    hideDefaultSections();


    /* =============================================
       CURRENT PERIOD
    ============================================= */

    const currentPeriod =

        Process.getCurrentPeriod();


    /* =============================================
       PREVIOUS PERIOD
    ============================================= */

    const previousPeriod =

        Process.getPreviousPeriod();


    /* =============================================
       BUILD VIEW DATA
    ============================================= */

    Summary.current =

        buildSummary(

            currentPeriod

        );


    Summary.previous =

        buildSummary(

            previousPeriod

        );


    /* =============================================
       RENDER
    ============================================= */

    renderLastPeriod();

    renderCurrentPeriod();


    /* =============================================
       OVERLAY
    ============================================= */

    setupOverlay();

};


/* =====================================================
   HIDE DEFAULT SECTIONS
===================================================== */

function hideDefaultSections(){

    const overview =

        document.getElementById(

            "summary-overview"

        );


    const distribution =

        document.getElementById(

            "summary-distribution"

        );


    if(

        overview

    ){

        overview.classList.add(

            "hidden"

        );

    }


    if(

        distribution

    ){

        distribution.classList.add(

            "hidden"

        );

    }

}


/* =====================================================
   BUILD SUMMARY
===================================================== */

function buildSummary(

    period

){

    if(

        !period

    ){

        return emptySummary();

    }


    /* =============================================
       PERIOD DATA
    ============================================= */

    const data =

        Process.getPeriodData(

            period

        );


    /* =============================================
       WORK
    ============================================= */

    const work =

        groupWork(

            data

        );


    /* =============================================
       ADDITIONS
    ============================================= */

    const additions =

        calculateAdditions(

            data,

            Process.additions ?? []

        );


    /* =============================================
       DEDUCTIONS
    ============================================= */

    const deductions =

        calculateDeductions(

            Process.deductions ?? []

        );


    /* =============================================
       TOTAL
    ============================================= */

    const workTotal =

        work.total;


    const additionTotal =

        additions.total;


    const deductionTotal =

        deductions.total;


    const gross =

        workTotal +

        additionTotal;


    const net =

        gross -

        deductionTotal;


    return {

        period,

        data,

        work,

        additions,

        deductions,

        gross,

        deductionTotal,

        net

    };

}


/* =====================================================
   GROUP WORK
===================================================== */

function groupWork(

    data

){

    const grouped = {};


    data.forEach(

        item => {

            const nama =

                normalize(

                    item?.nama

                );


            const grade1 =

                normalize(

                    item?.grade_1

                );


            const grade2 =

                normalize(

                    item?.grade_2

                );


            const key =

                [

                    nama,

                    grade1,

                    grade2

                ].join(

                    "|"

                );


            if(

                !grouped[key]

            ){

                grouped[key] = {

                    nama :

                        item?.nama ?? "",

                    grade1 :

                        item?.grade_1 ?? "",

                    grade2 :

                        item?.grade_2 ?? "",

                    qty :

                        0,

                    nominal :

                        0,

                    total :

                        0

                };

            }


            /* =====================================
               QTY
            ===================================== */

            grouped[key].qty +=

                toNumber(

                    item?.qty

                );


            /* =====================================
               NOMINAL
            ===================================== */

            if(

                !grouped[key].nominal

                &&

                item?.nominal

            ){

                grouped[key].nominal =

                    toNumber(

                        item.nominal

                    );

            }


            /* =====================================
               TOTAL
            ===================================== */

            grouped[key].total +=

                toNumber(

                    item?.total

                );

        }

    );


    const items =

        Object.values(

            grouped

        );


    const total =

        items.reduce(

            (

                sum,

                item

            ) =>

                sum +

                item.total,

            0

        );


    const qty =

        items.reduce(

            (

                sum,

                item

            ) =>

                sum +

                item.qty,

            0

        );


    return {

        items,

        qty,

        total

    };

}


/* =====================================================
   ADDITIONS
===================================================== */

function calculateAdditions(

    data,

    rules

){

    if(

        !Array.isArray(

            rules

        )

    ){

        return {

            items : [],

            total : 0

        };

    }


    /* =============================================
       UNIQUE WORKING DAYS
    ============================================= */

    const dates =

        new Set();


    data.forEach(

        item => {

            const date =

                getDate(

                    item

                );


            if(

                date

            ){

                dates.add(

                    dateKey(

                        date

                    )

                );

            }

        }

    );


    const items = [];

    let total = 0;


    /* =============================================
       EACH ADDITION RULE
    ============================================= */

    rules.forEach(

        rule => {

            const kondisi =

                normalize(

                    rule?.kondisi

                );


            const waktu =

                normalize(

                    rule?.waktu

                );


            if(

                kondisi !==

                "masuk"

            ){

                return;

            }


            let count = 0;


            dates.forEach(

                key => {

                    const date =

                        parseDateKey(

                            key

                        );


                    if(

                        !date

                    ){

                        return;

                    }


                    const day =

                        date.getDay();


                    /* ---------------------------------
                       SABTU + MINGGU
                    --------------------------------- */

                    if(

                        waktu.includes(

                            "sabtu"

                        )

                        &&

                        waktu.includes(

                            "minggu"

                        )

                    ){

                        if(

                            day === 6

                            ||

                            day === 0

                        ){

                            count++;

                        }

                    }

                }

            );


            const nominal =

                toNumber(

                    rule?.nominal

                );


            const amount =

                count *

                nominal;


            if(

                amount > 0

            ){

                items.push({

                    nama :

                        rule?.nama ?? "",

                    qty :

                        count,

                    nominal,

                    total :

                        amount

                });


                total +=

                    amount;

            }

        }

    );


    return {

        items,

        total

    };

}


/* =====================================================
   DEDUCTIONS
===================================================== */

function calculateDeductions(

    rules

){

    if(

        !Array.isArray(

            rules

        )

    ){

        return {

            items : [],

            total : 0

        };

    }


    const items = [];

    let total = 0;


    rules.forEach(

        rule => {

            if(

                normalize(

                    rule?.kondisi

                )

                !==

                "periode_gaji"

            ){

                return;

            }


            const nominal =

                toNumber(

                    rule?.nominal

                );


            if(

                nominal <= 0

            ){

                return;

            }


            items.push({

                nama :

                    rule?.nama ?? "",

                nominal,

                total :

                    nominal

            });


            total +=

                nominal;

        }

    );


    return {

        items,

        total

    };

}


/* =====================================================
   RENDER LAST PERIOD
===================================================== */

function renderLastPeriod(){

    const section =

        document.getElementById(

            "summary-payroll-last"

        );


    const card =

        document.getElementById(

            "summary-payroll-last-card"

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


    const result =

        Summary.previous;


    if(

        !result

        ||

        !result.period

    ){

        card.innerHTML = `

            <div class="summary-payroll-empty">

                Data belum tersedia.

            </div>

        `;

        return;

    }


    card.innerHTML = `

        <div class="summary-payroll-card">

            <div class="summary-payroll-period">

                ${

                    formatDate(

                        result.period.start

                    )

                }

                -

                ${

                    formatDate(

                        result.period.end

                    )

                }

            </div>


            <div class="summary-payroll-total">

                ${

                    rupiah(

                        result.net

                    )

                }

            </div>


            <div class="summary-payroll-navigation">

                <button

                    type="button"

                    class="summary-payroll-nav disabled"

                >

                    &lt; Back

                </button>


                <button

                    type="button"

                    class="summary-payroll-nav disabled"

                >

                    Next &gt;

                </button>

            </div>


            <button

                type="button"

                class="summary-payroll-detail-button"

                id="summary-payroll-detail-button"

            >

                Tampilkan Rincian

            </button>

        </div>

    `;


    const detailButton =

        document.getElementById(

            "summary-payroll-detail-button"

        );


    if(

        detailButton

    ){

        detailButton.addEventListener(

            "click",

            () => {

                openOverlay(

                    result

                );

            }

        );

    }

}


/* =====================================================
   RENDER CURRENT PERIOD
===================================================== */

function renderCurrentPeriod(){

    const section =

        document.getElementById(

            "summary-payroll-current"

        );


    const card =

        document.getElementById(

            "summary-payroll-current-card"

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

        renderCurrentDetail(

            Summary.current

        );

}


/* =====================================================
   CURRENT PERIOD DETAIL
===================================================== */

function renderCurrentDetail(

    result

){

    if(

        !result

        ||

        !result.period

    ){

        return `

            <div class="summary-payroll-empty">

                Data belum tersedia.

            </div>

        `;

    }


    return `

        <div class="summary-payroll-card">


            <!-- =====================================
                 PERIOD
            ====================================== -->

            <div class="summary-payroll-period">

                ${

                    formatDate(

                        result.period.start

                    )

                }

                -

                ${

                    formatDate(

                        result.period.end

                    )

                }

            </div>


            <!-- =====================================
                 NET
            ====================================== -->

            <div class="summary-payroll-net-row">

                <strong>

                    Gaji Bersih

                </strong>


                <strong>

                    ${

                        rupiah(

                            result.net

                        )

                    }

                </strong>

            </div>


            <div class="summary-payroll-divider"></div>


            <!-- =====================================
                 WORK
            ====================================== -->

            <div class="summary-payroll-group">


                <div class="summary-payroll-group-title">

                    🏭 Rincian Pekerjaan

                </div>


                <div class="summary-payroll-work-list">

                    ${

                        renderWork(

                            result.work.items

                        )

                    }

                </div>


                <div class="summary-payroll-subtotal">

                    <span>

                        Total Pekerjaan

                    </span>


                    <strong>

                        ${

                            rupiah(

                                result.work.total

                            )

                        }

                    </strong>

                </div>


            </div>


            <div class="summary-payroll-divider"></div>


            <!-- =====================================
                 ADDITIONS
            ====================================== -->

            <div class="summary-payroll-group">


                <div class="summary-payroll-group-title">

                    ➕

                    Penambahan

                </div>


                ${

                    renderAdditions(

                        result.additions.items

                    )

                }


                <div class="summary-payroll-subtotal">

                    <span>

                        Total Penambahan

                    </span>


                    <strong>

                        ${

                            rupiah(

                                result.additions.total

                            )

                        }

                    </strong>

                </div>


            </div>


            <div class="summary-payroll-divider"></div>


            <!-- =====================================
                 DEDUCTION
            ====================================== -->

            <div class="summary-payroll-group">


                <div class="summary-payroll-group-title">

                    ➖

                    Potongan

                </div>


                ${

                    renderDeductions(

                        result.deductions.items

                    )

                }


                <div class="summary-payroll-subtotal">

                    <span>

                        Total Potongan

                    </span>


                    <strong>

                        ${

                            rupiah(

                                result.deductionTotal

                            )

                        }

                    </strong>

                </div>


            </div>


            <div class="summary-payroll-divider"></div>


            <!-- =====================================
                 TOTAL / NET
            ====================================== -->

            <div class="summary-payroll-net-row summary-payroll-net-final">

                <strong>

                    Gaji Bersih

                </strong>


                <strong>

                    ${

                        rupiah(

                            result.net

                        )

                    }

                </strong>

            </div>


        </div>

    `;

}


/* =====================================================
   RENDER WORK
===================================================== */

function renderWork(

    items

){

    if(

        !items.length

    ){

        return `

            <div class="summary-payroll-empty">

                Belum ada pekerjaan.

            </div>

        `;

    }


    return items.map(

        item => `

            <div class="summary-payroll-work-row">


                <div class="summary-payroll-work-info">

                    <strong>

                        ${

                            buildWorkName(

                                item

                            )

                        }

                    </strong>


                    <span>

                        ${

                            item.qty

                        }

                        pcs

                    </span>

                </div>


                <div class="summary-payroll-row-value">

                    ${

                        rupiah(

                            item.total

                        )

                    }

                </div>


            </div>

        `

    ).join("");

}


/* =====================================================
   RENDER ADDITIONS
===================================================== */

function renderAdditions(

    items

){

    if(

        !items.length

    ){

        return `

            <div class="summary-payroll-empty">

                Tidak ada penambahan.

            </div>

        `;

    }


    return items.map(

        item => `

            <div class="summary-payroll-row">


                <div class="summary-payroll-row-main">

                    <strong>

                        ${

                            capitalize(

                                item.nama

                            )

                        }

                    </strong>


                    <small>

                        ${

                            item.qty

                        }

                        hari

                    </small>

                </div>


                <div class="summary-payroll-row-value">

                    ${

                        rupiah(

                            item.total

                        )

                    }

                </div>


            </div>

        `

    ).join("");

}


/* =====================================================
   RENDER DEDUCTIONS
===================================================== */

function renderDeductions(

    items

){

    if(

        !items.length

    ){

        return `

            <div class="summary-payroll-empty">

                Tidak ada potongan.

            </div>

        `;

    }


    return items.map(

        item => `

            <div class="summary-payroll-row">


                <div class="summary-payroll-row-main">

                    <strong>

                        ${

                            capitalize(

                                item.nama

                            )

                        }

                    </strong>

                </div>


                <div class="summary-payroll-row-value">

                    ${

                        rupiah(

                            item.total

                        )

                    }

                </div>


            </div>

        `

    ).join("");

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
   OVERLAY SETUP
===================================================== */

function setupOverlay(){

    const overlay =

        document.getElementById(

            "summary-payroll-overlay"

        );


    if(

        !overlay

    ){

        return;

    }


    const closeButton =

        document.getElementById(

            "summary-payroll-overlay-close"

        );


    const backdrop =

        overlay.querySelector(

            "[data-close-payroll-overlay]"

        );


    if(

        closeButton

    ){

        closeButton.addEventListener(

            "click",

            closeOverlay

        );

    }


    if(

        backdrop

    ){

        backdrop.addEventListener(

            "click",

            closeOverlay

        );

    }

}


/* =====================================================
   OPEN OVERLAY
===================================================== */

function openOverlay(

    result

){

    const overlay =

        document.getElementById(

            "summary-payroll-overlay"

        );


    const title =

        document.getElementById(

            "summary-payroll-overlay-title"

        );


    const period =

        document.getElementById(

            "summary-payroll-overlay-period"

        );


    const content =

        document.getElementById(

            "summary-payroll-overlay-content"

        );


    if(

        !overlay ||

        !content ||

        !result

    ){

        return;

    }


    if(

        title

    ){

        title.textContent =

            "Rincian Gaji";

    }


    if(

        period

    ){

        period.textContent =

            formatDate(

                result.period.start

            )

            +

            " - "

            +

            formatDate(

                result.period.end

            );

    }


    content.innerHTML =

        renderDetailContent(

            result

        );


    overlay.classList.remove(

        "hidden"

    );

}


/* =====================================================
   DETAIL OVERLAY CONTENT
===================================================== */

function renderDetailContent(

    result

){

    return `

        <div class="summary-payroll-overlay-total">

            Gaji Bersih

            <strong>

                ${

                    rupiah(

                        result.net

                    )

                }

            </strong>

        </div>


        <div class="summary-payroll-divider"></div>


        <div class="summary-payroll-group">

            <div class="summary-payroll-group-title">

                🏭 Rincian Pekerjaan

            </div>


            ${

                renderWork(

                    result.work.items

                )

            }


            <div class="summary-payroll-subtotal">

                <span>

                    Total Pekerjaan

                </span>


                <strong>

                    ${

                        rupiah(

                            result.work.total

                        )

                    }

                </strong>

            </div>

        </div>


        <div class="summary-payroll-divider"></div>


        <div class="summary-payroll-group">

            <div class="summary-payroll-group-title">

                ➕

                Penambahan

            </div>


            ${

                renderAdditions(

                    result.additions.items

                )

            }


            <div class="summary-payroll-subtotal">

                <span>

                    Total Penambahan

                </span>


                <strong>

                    ${

                        rupiah(

                            result.additions.total

                        )

                    }

                </strong>

            </div>

        </div>


        <div class="summary-payroll-divider"></div>


        <div class="summary-payroll-group">

            <div class="summary-payroll-group-title">

                ➖

                Potongan

            </div>


            ${

                renderDeductions(

                    result.deductions.items

                )

            }


            <div class="summary-payroll-subtotal">

                <span>

                    Total Potongan

                </span>


                <strong>

                    ${

                        rupiah(

                            result.deductionTotal

                        )

                    }

                </strong>

            </div>

        </div>


        <div class="summary-payroll-divider"></div>


        <div class="summary-payroll-net-row">

            <strong>

                Gaji Bersih

            </strong>


            <strong>

                ${

                    rupiah(

                        result.net

                    )

                }

            </strong>

        </div>

    `;

}


/* =====================================================
   CLOSE OVERLAY
===================================================== */

function closeOverlay(){

    const overlay =

        document.getElementById(

            "summary-payroll-overlay"

        );


    if(

        overlay

    ){

        overlay.classList.add(

            "hidden"

        );

    }

}


/* =====================================================
   GET DATE
===================================================== */

function getDate(

    item

){

    if(

        item?.dateObject instanceof Date

        &&

        !Number.isNaN(

            item.dateObject.getTime()

        )

    ){

        return item.dateObject;

    }


    const value =

        item?.tanggal ??

        item?.date;


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

        .map(

            Number

        );


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
   DATE KEY
===================================================== */

function dateKey(

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
   PARSE DATE KEY
===================================================== */

function parseDateKey(

    value

){

    const parts =

        String(

            value

        )

        .split("-")

        .map(

            Number

        );


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


    return new Date(

        year,

        month - 1,

        day

    );

}


/* =====================================================
   EMPTY SUMMARY
===================================================== */

function emptySummary(){

    return {

        period : null,

        data : [],

        work : {

            items : [],

            qty : 0,

            total : 0

        },

        additions : {

            items : [],

            total : 0

        },

        deductions : {

            items : [],

            total : 0

        },

        gross : 0,

        deductionTotal : 0,

        net : 0

    };

}


/* =====================================================
   NORMALIZE
===================================================== */

function normalize(

    value

){

    return String(

        value ?? ""

    )

    .trim()

    .toLowerCase();

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
