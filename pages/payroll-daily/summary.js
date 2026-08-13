/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Summary
   File        : summary.js
   Version     : 1.1.0

   Description :
   Payroll Daily Salary Summary

   Responsibility :
   - Menampilkan periode terakhir
   - Menampilkan periode berjalan
   - Menggabungkan rincian pekerjaan
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
       CURRENT
    ============================================= */

    const currentPeriod =

        Process.getCurrentPeriod();


    /* =============================================
       PREVIOUS
    ============================================= */

    const previousPeriod =

        Process.getPreviousPeriod();


    /* =============================================
       CALCULATE VIEW DATA
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

};


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
       GET PERIOD DATA
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


    card.innerHTML =

        renderPeriod(

            Summary.previous

        );

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

        renderPeriod(

            Summary.current

        );

}


/* =====================================================
   RENDER PERIOD
===================================================== */

function renderPeriod(

    result

){

    if(

        !result

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

            <div class="summary-payroll-total">

                ${

                    rupiah(

                        result.net

                    )

                }

            </div>


            <!-- =====================================
                 WORK
            ====================================== -->

            <div class="summary-payroll-group">


                <div class="summary-payroll-group-title">

                    🏭 Pekerjaan

                </div>


                ${

                    renderWork(

                        result.work.items

                    )

                }


                <div class="summary-payroll-subtotal">

                    Total Pekerjaan

                    <strong>

                        ${

                            rupiah(

                                result.work.total

                            )

                        }

                    </strong>

                </div>


            </div>


            <!-- =====================================
                 ADDITION
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

                    Total Penambahan

                    <strong>

                        ${

                            rupiah(

                                result.additions.total

                            )

                        }

                    </strong>

                </div>


            </div>


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

                    Total Potongan

                    <strong>

                        ${

                            rupiah(

                                result.deductionTotal

                            )

                        }

                    </strong>

                </div>


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

            <div class="summary-payroll-row">


                <div class="summary-payroll-row-main">

                    <strong>

                        ${

                            buildWorkName(

                                item

                            )

                        }

                    </strong>


                    <small>

                        ${

                            item.qty

                        }

                        pcs

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
