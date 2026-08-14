/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Summary
   File        : summary.js
   Version     : 2.0.0

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

   Navigation :
   - Back / Next menggunakan periodOffset
   - Global event delegation
   - Mengikuti pola Payroll Monthly
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Process

} from "./process.js";


import {

    Overlay

} from "../../components/overlay/script.js";


import {

    rupiah,

    formatDate

} from "../../js/utils.js";


/* =====================================================
   STATE
===================================================== */

export const Summary = {

    current : null,

    previous : null,

    periodOffset : -1,

    initialized : false

};


/* =====================================================
   INIT
===================================================== */

Summary.init = function(){

    if(

        Summary.initialized

    ){

        return;

    }


    Summary.initialized = true;


    /* =============================================
       HIDE GLOBAL SUMMARY SECTIONS
    ============================================= */

    hideDefaultSections();


    /* =============================================
       RESET NAVIGATION
    ============================================= */

    Summary.periodOffset = -1;


    /* =============================================
       CURRENT PERIOD
    ============================================= */

    const currentPeriod =

        Process.getCurrentPeriod();


    Summary.current =

        buildSummary(

            currentPeriod

        );


    /* =============================================
       PREVIOUS PERIOD
    ============================================= */

    Summary.previous =

        buildPreviousSummary();


    /* =============================================
       RENDER
    ============================================= */

    renderLastPeriod();

    renderCurrentPeriod();


    /* =============================================
       EVENTS
    ============================================= */

    setupEvents();

};


/* =====================================================
   HIDE DEFAULT SECTIONS
===================================================== */

function hideDefaultSections(){

    [

        "summary-overview",

        "summary-debt",

        "summary-distribution"

    ].forEach(

        id => {

            const section =

                document.getElementById(

                    id

                );


            if(

                section

            ){

                section.classList.add(

                    "hidden"

                );

            }

        }

    );

}


/* =====================================================
   BUILD PREVIOUS SUMMARY
===================================================== */

function buildPreviousSummary(){

    const currentPeriod =

        Process.getCurrentPeriod();


    if(

        !currentPeriod

    ){

        return emptySummary();

    }


    const start =

        new Date(

            currentPeriod.start

        );


    const end =

        new Date(

            currentPeriod.end

        );


    start.setMonth(

        start.getMonth() -

        1

    );


    end.setMonth(

        end.getMonth() -

        1

    );


    return buildSummary({

        start,

        end

    });

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

                Data gaji periode sebelumnya belum tersedia.

            </div>

        `;

        return;

    }


    const canNext =

        Summary.periodOffset < -1;


    card.innerHTML = `

        <div class="summary-payroll-card">


            <!-- =================================
                 PERIODE
            ================================== -->

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


            <!-- =================================
                 GAJI BERSIH
            ================================== -->

            <div class="summary-payroll-total">

                ${

                    rupiah(

                        result.net

                    )

                }

            </div>


            <!-- =================================
                 NAVIGATION
            ================================== -->

            <div class="summary-payroll-navigation">


                <button

                    type="button"

                    class="summary-payroll-nav"

                    id="summary-payroll-last-back"

                >

                    &lt; Back

                </button>


                <button

                    type="button"

                    class="summary-payroll-nav

                        ${

                            canNext

                                ? ""

                                : "disabled"

                        }"

                    id="summary-payroll-last-next"

                    ${

                        canNext

                            ? ""

                            : "disabled"

                    }

                >

                    Next &gt;

                </button>


            </div>


            <!-- =================================
                 DETAIL
            ================================== -->

            <button

                type="button"

                class="summary-payroll-detail-button"

                id="summary-payroll-last-detail"

            >

                Tampilkan Rincian

            </button>


        </div>

    `;

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
                 FINAL NET
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

                    -${

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
   GLOBAL EVENTS
===================================================== */

function setupEvents(){

    document.addEventListener(

        "click",

        event => {


            /* =====================================
               BACK
            ===================================== */

            if(

                event.target.closest(

                    "#summary-payroll-last-back"

                )

            ){

                changePeriod(

                    -1

                );

                return;

            }


            /* =====================================
               NEXT
            ===================================== */

            if(

                event.target.closest(

                    "#summary-payroll-last-next"

                )

            ){

                changePeriod(

                    1

                );

                return;

            }


            /* =====================================
               DETAIL
            ===================================== */

            if(

                event.target.closest(

                    "#summary-payroll-last-detail"

                )

            ){

                openDetailOverlay();

            }

        }

    );

}


/* =====================================================
   CHANGE PERIOD
===================================================== */

function changePeriod(

    direction

){

    const newOffset =

        Summary.periodOffset +

        direction;


    /* =============================================
       TIDAK BOLEH MASUK CURRENT PERIOD
    ============================================= */

    if(

        newOffset >= 0

    ){

        return;

    }


    const base =

        Process.getCurrentPeriod();


    if(

        !base

    ){

        return;

    }


    const start =

        new Date(

            base.start

        );


    const end =

        new Date(

            base.end

        );


    start.setMonth(

        start.getMonth() +

        newOffset

    );


    end.setMonth(

        end.getMonth() +

        newOffset

    );


    Summary.periodOffset =

        newOffset;


    Summary.previous =

        buildSummary({

            start,

            end

        });


    renderLastPeriod();

}


/* =====================================================
   OPEN DETAIL OVERLAY
===================================================== */

function openDetailOverlay(){

    const result =

        Summary.previous;


    if(

        !result

        ||

        !result.period

    ){

        return;

    }


    const rows = [];


    /* =============================================
       WORK
    ============================================= */

    rows.push(

        `

        <div class="global-overlay-subtitle">

            🏭 Rincian Pekerjaan

        </div>

        `

    );


    result.work.items.forEach(

        item => {

            rows.push(

                overlayRow(

                    `${

                        buildWorkName(

                            item

                        )

                    } ${

                        item.qty

                    } pcs`,

                    rupiah(

                        item.total

                    )

                )

            );

        }

    );


    rows.push(

        overlayRow(

            "Total Pekerjaan",

            rupiah(

                result.work.total

            )

        )

    );


    /* =============================================
       ADDITIONS
    ============================================= */

    rows.push(

        `

        <div class="global-overlay-divider"></div>

        <div class="global-overlay-subtitle">

            ➕

            Penambahan

        </div>

        `

    );


    if(

        result.additions.items.length

    ){

        result.additions.items.forEach(

            item => {

                rows.push(

                    overlayRow(

                        `${

                            capitalize(

                                item.nama

                            )

                        } ${

                            item.qty

                        } hari`,

                        rupiah(

                            item.total

                        )

                    )

                );

            }

        );

    }

    else {

        rows.push(

            `

            <div class="global-overlay-empty">

                Tidak ada penambahan.

            </div>

            `

        );

    }


    rows.push(

        overlayRow(

            "Total Penambahan",

            rupiah(

                result.additions.total

            )

        )

    );


    /* =============================================
       DEDUCTIONS
    ============================================= */

    rows.push(

        `

        <div class="global-overlay-divider"></div>

        <div class="global-overlay-subtitle">

            ➖

            Potongan

        </div>

        `

    );


    if(

        result.deductions.items.length

    ){

        result.deductions.items.forEach(

            item => {

                rows.push(

                    overlayRow(

                        capitalize(

                            item.nama

                        ),

                        `-${

                            rupiah(

                                item.total

                            )

                        }`

                    )

                );

            }

        );

    }

    else {

        rows.push(

            `

            <div class="global-overlay-empty">

                Tidak ada potongan.

            </div>

            `

        );

    }


    rows.push(

        overlayRow(

            "Total Potongan",

            `-${

                rupiah(

                    result.deductionTotal

                )

            }`

        )

    );


    /* =============================================
       NET
    ============================================= */

    rows.push(

        `

        <div class="global-overlay-divider"></div>


        <div class="global-overlay-row global-overlay-total">

            <span>

                Gaji Bersih

            </span>


            <strong>

                ${

                    rupiah(

                        result.net

                    )

                }

            </strong>

        </div>

        `

    );


    Overlay.open({

        title :

            "Rincian Gaji",

        period :

            formatDate(

                result.period.start

            )

            +

            " - "

            +

            formatDate(

                result.period.end

            ),

        userName :

            getAppUserName(),

        content :

            rows.join("")

    });

}


/* =====================================================
   OVERLAY ROW
===================================================== */

function overlayRow(

    label,

    value

){

    return `

        <div class="global-overlay-row">

            <span>

                ${

                    label

                }

            </span>


            <strong>

                ${

                    value

                }

            </strong>

        </div>

    `;

}


/* =====================================================
   USER NAME
===================================================== */

function getAppUserName(){

    return (

        window.currentUser?.displayName ??

        window.currentUser?.name ??

        window.user?.displayName ??

        window.user?.name ??

        localStorage.getItem(

            "displayName"

        ) ??

        localStorage.getItem(

            "userName"

        ) ??

        "Finance User"

    );

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

        return new Date(

            item.dateObject

        );

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
