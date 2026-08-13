/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Summary
   File        : summary.js
   Version     : 1.0.0

   Description :
   Payroll Daily Summary

   Sections :
   - Gaji Periode Terakhir
   - Estimasi Gaji Bulan Ini

   Period Source :
   - nilai_start
   - nilai_end

   IMPORTANT :
   - periode_start / periode_end bukan periode payroll
   - periode_start / periode_end hanya masa berlaku rule
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Process

} from "./process.js";


import {

    formatDate,

    rupiah

} from "../../js/utils.js";


/* =====================================================
   STATE
===================================================== */

export const Summary = {

    /* ---------------------------------------------
       ALL SALARY RULES
    --------------------------------------------- */

    salaryRules : [],


    /* ---------------------------------------------
       AVAILABLE PERIODS
    --------------------------------------------- */

    periods : [],


    /* ---------------------------------------------
       CURRENT PERIOD
    --------------------------------------------- */

    currentPeriod : null,


    /* ---------------------------------------------
       PREVIOUS PERIOD
    --------------------------------------------- */

    previousPeriod : null,


    /* ---------------------------------------------
       SELECTED PREVIOUS PERIOD
    --------------------------------------------- */

    selectedPeriodIndex : 0,


    /* ---------------------------------------------
       CURRENT PERIOD DATA
    --------------------------------------------- */

    currentData : [],


    /* ---------------------------------------------
       PREVIOUS PERIOD DATA
    --------------------------------------------- */

    previousData : [],


    /* ---------------------------------------------
       TOTAL
    --------------------------------------------- */

    currentTotal : 0,

    previousTotal : 0,


    /* ---------------------------------------------
       ESTIMATE
    --------------------------------------------- */

    estimatedTotal : 0

};


/* =====================================================
   INIT
===================================================== */

Summary.init = function(){

    /* =============================================
       LOAD RULE
    ============================================= */

    this.loadSalaryRules();


    /* =============================================
       BUILD PERIOD
    ============================================= */

    this.buildPeriods();


    /* =============================================
       FIND CURRENT PERIOD
    ============================================= */

    this.findCurrentPeriod();


    /* =============================================
       FIND PREVIOUS PERIOD
    ============================================= */

    this.findPreviousPeriod();


    /* =============================================
       CALCULATE
    ============================================= */

    this.calculate();


    /* =============================================
       RENDER
    ============================================= */

    this.render();

};


/* =====================================================
   LOAD SALARY RULES
===================================================== */

Summary.loadSalaryRules = function(){

    const rules =

        Process.rules ?? [];


    this.salaryRules =

        rules.filter(

            rule =>

                String(

                    rule?.type_rule ?? ""

                )

                .trim()

                .toLowerCase()

                ===

                "rule_gaji"

        );

};


/* =====================================================
   BUILD PERIODS
===================================================== */

Summary.buildPeriods = function(){

    const periods = [];


    this.salaryRules.forEach(

        rule => {

            const start =

                parseDate(

                    rule?.nilai_start

                );


            const end =

                parseDate(

                    rule?.nilai_end

                );


            if(

                !start ||

                !end

            ){

                return;

            }


            periods.push({

                start,

                end,

                rule

            });

        }

    );


    /* =============================================
       REMOVE DUPLICATE PERIOD
    ============================================= */

    const unique = [];


    periods.forEach(

        period => {

            const exists =

                unique.some(

                    item =>

                        item.start.getTime()

                        ===

                        period.start.getTime()

                        &&

                        item.end.getTime()

                        ===

                        period.end.getTime()

                );


            if(

                !exists

            ){

                unique.push(

                    period

                );

            }

        }

    );


    /* =============================================
       SORT TERBARU → TERLAMA
    ============================================= */

    unique.sort(

        (

            a,

            b

        ) =>

            b.start.getTime()

            -

            a.start.getTime()

    );


    this.periods =

        unique;

};


/* =====================================================
   FIND CURRENT PERIOD
===================================================== */

Summary.findCurrentPeriod = function(){

    const today =

        new Date();


    today.setHours(

        0,

        0,

        0,

        0

    );


    /* =============================================
       CARI PERIODE YANG MEMUAT HARI INI
    ============================================= */

    const active =

        this.periods.find(

            period =>

                today >= period.start

                &&

                today <= period.end

        );


    if(

        active

    ){

        this.currentPeriod =

            active;

        return;

    }


    /* =============================================
       FALLBACK :
       PERIODE TERBARU YANG SUDAH DIMULAI
    ============================================= */

    const started =

        this.periods.find(

            period =>

                period.start <= today

        );


    this.currentPeriod =

        started ?? null;

};


/* =====================================================
   FIND PREVIOUS PERIOD
===================================================== */

Summary.findPreviousPeriod = function(){

    if(

        !this.currentPeriod

    ){

        this.previousPeriod =

            null;

        return;

    }


    /* =============================================
       CARI PERIODE SEBELUM CURRENT
    ============================================= */

    const currentStart =

        this.currentPeriod.start;


    this.previousPeriod =

        this.periods.find(

            period =>

                period.end < currentStart

        )

        ?? null;

};


/* =====================================================
   CALCULATE
===================================================== */

Summary.calculate = function(){

    const data =

        Process.data ?? [];


    /* =============================================
       CURRENT
    ============================================= */

    this.currentData =

        this.filterPeriodData(

            data,

            this.currentPeriod

        );


    this.currentTotal =

        this.sumIncome(

            this.currentData

        );


    /* =============================================
       PREVIOUS
    ============================================= */

    this.previousData =

        this.filterPeriodData(

            data,

            this.previousPeriod

        );


    this.previousTotal =

        this.sumIncome(

            this.previousData

        );


    /* =============================================
       ESTIMATE
    ============================================= */

    this.estimatedTotal =

        this.calculateEstimate(

            this.currentPeriod,

            this.currentTotal

        );

};


/* =====================================================
   FILTER PERIOD DATA
===================================================== */

Summary.filterPeriodData = function(

    data,

    period

){

    if(

        !Array.isArray(data)

        ||

        !period

    ){

        return [];

    }


    return data.filter(

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

                date >= period.start

            )

            &&

            (

                date <= period.end

            );

        }

    );

};


/* =====================================================
   SUM INCOME
===================================================== */

Summary.sumIncome = function(

    data

){

    if(

        !Array.isArray(data)

    ){

        return 0;

    }


    return data.reduce(

        (

            total,

            item

        ) => {

            return (

                total +

                toNumber(

                    item?.total

                )

            );

        },

        0

    );

};


/* =====================================================
   CALCULATE ESTIMATE
===================================================== */

Summary.calculateEstimate = function(

    period,

    currentTotal

){

    if(

        !period

    ){

        return 0;

    }


    const today =

        new Date();


    today.setHours(

        23,

        59,

        59,

        999

    );


    /* =============================================
       BELUM DIMULAI
    ============================================= */

    if(

        today < period.start

    ){

        return 0;

    }


    /* =============================================
       SUDAH SELESAI
       ESTIMASI = TOTAL AKTUAL
    ============================================= */

    if(

        today >= period.end

    ){

        return currentTotal;

    }


    /* =============================================
       HITUNG HARI BERJALAN
    ============================================= */

    const elapsedDays =

        Math.floor(

            (

                today -

                period.start

            )

            /

            86400000

        )

        + 1;


    const totalDays =

        Math.floor(

            (

                period.end -

                period.start

            )

            /

            86400000

        )

        + 1;


    if(

        elapsedDays <= 0

        ||

        totalDays <= 0

    ){

        return currentTotal;

    }


    /* =============================================
       ESTIMASI SEDERHANA

       Pendapatan berjalan / hari berjalan
       × total hari periode
    ============================================= */

    const average =

        currentTotal /

        elapsedDays;


    return Math.round(

        average *

        totalDays

    );

};


/* =====================================================
   RENDER
===================================================== */

Summary.render = function(){

    const page =

        document.getElementById(

            "summary-page"

        );


    if(

        !page

    ){

        return;

    }


    page.innerHTML =

    `

        <!-- =========================================
             LAST PAYROLL
        ========================================== -->

        <section class="section summary-last-section">

            <div class="section-header">

                <span class="section-badge">

                    💰 Gaji Periode Terakhir

                </span>

            </div>


            <div class="card summary-period-card">


                <div class="summary-period">

                    ${

                        this.previousPeriod

                            ?

                            formatPeriod(

                                this.previousPeriod

                            )

                            :

                            "-"

                    }

                </div>


                <div class="summary-period-total">

                    ${

                        rupiah(

                            this.previousTotal

                        )

                    }

                </div>


                <div class="summary-navigation">


                    <button

                        type="button"

                        id="summary-prev"

                        disabled

                    >

                        &lt; Back

                    </button>


                    <button

                        type="button"

                        id="summary-next"

                        disabled

                    >

                        Next &gt;

                    </button>


                </div>


                <button

                    type="button"

                    class="summary-detail-button"

                    id="summary-detail-button"

                >

                    Tampilkan Rincian

                </button>


            </div>

        </section>


        <!-- =========================================
             CURRENT PAYROLL
        ========================================== -->

        <section class="section summary-current-section">

            <div class="section-header">

                <span class="section-badge">

                    📅 Estimasi Gaji Bulan Ini

                </span>

            </div>


            <div class="card summary-estimate-card">


                <div class="summary-estimate-period">

                    ${

                        this.currentPeriod

                            ?

                            formatPeriod(

                                this.currentPeriod

                            )

                            :

                            "-"

                    }

                </div>


                <div class="summary-estimate-row">

                    <span>

                        Estimasi Total Gaji

                    </span>


                    <strong>

                        ${

                            rupiah(

                                this.estimatedTotal

                            )

                        }

                    </strong>

                </div>


                <div class="summary-estimate-divider"></div>


                <div class="summary-estimate-info">

                    Pendapatan berjalan :

                    <strong>

                        ${

                            rupiah(

                                this.currentTotal

                            )

                        }

                    </strong>

                </div>


            </div>

        </section>

    `;


    this.registerEvents();

};


/* =====================================================
   REGISTER EVENTS
===================================================== */

Summary.registerEvents = function(){

    const detailButton =

        document.getElementById(

            "summary-detail-button"

        );


    if(

        detailButton

    ){

        detailButton.addEventListener(

            "click",

            () => {

                console.log(

                    "Payroll Daily Detail:",

                    this.previousData

                );

            }

        );

    }

};


/* =====================================================
   FORMAT PERIOD
===================================================== */

function formatPeriod(

    period

){

    if(

        !period

    ){

        return "-";

    }


    return (

        formatDate(

            period.start

        )

        +

        " - "

        +

        formatDate(

            period.end

        )

    );

}


/* =====================================================
   GET ITEM DATE
===================================================== */

function getItemDate(

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


    return parseDate(

        item?.date ??

        item?.tanggal

    );

}


/* =====================================================
   PARSE DATE
===================================================== */

function parseDate(

    value

){

    if(

        !value

    ){

        return null;

    }


    if(

        value instanceof Date

    ){

        return new Date(

            value

        );

    }


    const parts =

        String(

            value

        )

        .trim()

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


    if(

        Number.isNaN(

            date.getTime()

        )

    ){

        return null;

    }


    date.setHours(

        0,

        0,

        0,

        0

    );


    return date;

}


/* =====================================================
   NUMBER
===================================================== */

function toNumber(

    value

){

    const number =

        Number(

            String(

                value ?? 0

            )

            .replace(

                /[^0-9.-]/g,

                ""

            )

        );


    return Number.isFinite(

        number

    )

        ?

        number

        :

        0;

   }
