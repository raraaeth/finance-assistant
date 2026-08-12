/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Summary
   File        : summary.js
   Version     : 1.0.0

   Description :
   Payroll Monthly Salary Summary Controller

   Sections :
   - Import
   - State
   - Init
   - Last Completed Period
   - Current Period
   - Detail Overlay
   - Helper
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Process

} from "./process.js";

import {

    formatDate

} from "../../js/utils.js";


/* =====================================================
   STATE
===================================================== */

export const Summary = {

    periodOffset : 0,

    lastPeriod : null,

    currentPeriod : null

};


/* =====================================================
   INIT
===================================================== */

Summary.init = function(){

    renderLastPeriod();

    renderCurrentPeriod();

    registerEvents();

};


/* =====================================================
   LAST COMPLETED PERIOD
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


    const calculation =

        Process.calculation ?? {};


    const period =

        Process.period ?? {};


    Summary.lastPeriod = {

        start :

            period.start,

        end :

            period.end,

        startText :

            period.startText,

        endText :

            period.endText

    };


    card.innerHTML =

    `

        <div class="payroll-summary-period">

            <span>

                Periode Gaji

            </span>

            <strong>

                ${

                    formatPeriod(

                        period.start,

                        period.end

                    )

                }

            </strong>

        </div>


        <div class="payroll-summary-net">

            <span>

                Gaji Bersih

            </span>

            <strong>

                ${

                    formatRupiah(

                        calculation.netSalary

                    )

                }

            </strong>

        </div>


        <div class="payroll-summary-navigation">

            <button
                type="button"
                id="payroll-period-prev">

                ◀

            </button>


            <button
                type="button"
                id="payroll-period-detail">

                Tampilkan Rincian

            </button>


            <button
                type="button"
                id="payroll-period-next">

                ▶

            </button>

        </div>

    `;

}


/* =====================================================
   CURRENT PERIOD
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


    const period =

        Process.period ?? {};


    /*
       Process.period adalah
       periode gaji penuh terakhir.

       Periode berjalan dihitung
       berdasarkan periode tersebut.
    */

    if(

        !period.start ||

        !period.end

    ){

        card.innerHTML =

            `

            <div class="payroll-empty">

                Periode gaji belum tersedia.

            </div>

            `;

        return;

    }


    const currentStart =

        new Date(

            period.start.getFullYear(),

            period.start.getMonth() + 1,

            period.start.getDate()

        );


    const currentEnd =

        new Date(

            period.end.getFullYear(),

            period.end.getMonth() + 1,

            period.end.getDate()

        );


    Summary.currentPeriod = {

        start :

            currentStart,

        end :

            currentEnd

    };


    const attendance =

        Process.attendance?.data ?? [];


    const currentAttendance =

        attendance.filter(

            item => {

                if(

                    !item.dateObject

                ){

                    return false;

                }


                return (

                    item.dateObject >=

                    currentStart

                )

                &&

                (

                    item.dateObject <=

                    currentEnd

                );

            }

        );


    const summary =

        calculateCurrentSummary(

            currentAttendance

        );


    const gajiPokok =

        findRuleNominal(

            "gaji"

        );


    const tunjangan =

        findRuleNominal(

            "tunjangan"

        );


    const transport =

        findRuleNominal(

            "uang_transport"

        );


    const uangMakan =

        summary.masukMakan *

        findRuleNominal(

            "uang_makan"

        );


    const lemburHarian =

        summary.lembur *

        0;


    const lemburJam =

        calculateOvertimePay(

            currentAttendance

        );


    const gross =

        gajiPokok +

        tunjangan +

        transport +

        uangMakan +

        lemburHarian +

        lemburJam;


    card.innerHTML =

    `

        <div class="payroll-summary-period">

            <span>

                Periode Berjalan

            </span>

            <strong>

                ${

                    formatPeriod(

                        currentStart,

                        currentEnd

                    )

                }

            </strong>

        </div>


        <div class="payroll-current-grid">

            <div class="payroll-current-item">

                <span>

                    Masuk

                </span>

                <strong>

                    ${

                        summary.masuk

                    }

                </strong>

            </div>


            <div class="payroll-current-item">

                <span>

                    Lembur

                </span>

                <strong>

                    ${

                        summary.lembur

                    }

                </strong>

            </div>


            <div class="payroll-current-item">

                <span>

                    Lembur Jam

                </span>

                <strong>

                    ${

                        summary.lemburHours

                    }

                </strong>

            </div>

        </div>


        <div class="payroll-current-estimate">

            <span>

                Estimasi Penghasilan

            </span>

            <strong>

                ${

                    formatRupiah(

                        gross

                    )

                }

            </strong>

        </div>

    `;

}


/* =====================================================
   CURRENT SUMMARY
===================================================== */

function calculateCurrentSummary(

    attendance

){

    const summary = {

        masuk : 0,

        masukMakan : 0,

        lembur : 0,

        lemburHours : 0

    };


    attendance.forEach(

        item => {

            if(

                item.status ===

                "masuk"

            ){

                summary.masuk++;

                summary.masukMakan++;

            }


            if(

                item.status ===

                "lembur"

            ){

                summary.lembur++;

            }


            summary.lemburHours +=

                Number(

                    item.overtimeHours || 0

                );

        }

    );


    return summary;

}


/* =====================================================
   OVERTIME PAY
===================================================== */

function calculateOvertimePay(

    attendance

){

    const rules =

        Process.rules?.tambah ?? [];


    const ruleOne =

        rules.find(

            rule =>

                rule.nama ===

                "lembur_jam_1"

        );


    const ruleTwo =

        rules.find(

            rule =>

                rule.nama ===

                "lembur_jam_2"

        );


    const nominalOne =

        Number(

            ruleOne?.nominal || 0

        );


    const nominalTwo =

        Number(

            ruleTwo?.nominal || 0

        );


    let total = 0;


    attendance.forEach(

        item => {

            const hours =

                Number(

                    item.overtimeHours || 0

                );


            if(

                hours <= 0

            ){

                return;

            }


            if(

                hours === 1

            ){

                total +=

                    nominalOne;

                return;

            }


            total +=

                nominalOne;


            if(

                hours > 1

            ){

                total +=

                    (

                        hours - 1

                    )

                    *

                    nominalTwo;

            }

        }

    );


    return total;

}


/* =====================================================
   DETAIL OVERLAY
===================================================== */

function openDetailOverlay(){

    const overlay =

        document.getElementById(

            "summary-payroll-overlay"

        );


    const content =

        document.getElementById(

            "summary-payroll-overlay-content"

        );


    const title =

        document.getElementById(

            "summary-payroll-overlay-title"

        );


    const period =

        document.getElementById(

            "summary-payroll-overlay-period"

        );


    if(

        !overlay ||

        !content

    ){

        return;

    }


    const calculation =

        Process.calculation ?? {};


    title.textContent =

        "Rincian Gaji";


    period.textContent =

        formatPeriod(

            Process.period?.start,

            Process.period?.end

        );


    content.innerHTML =

    `

        ${

            renderMoneyGroup(

                "Penghasilan",

                calculation.earnings ?? [],

                false

            )

        }


        ${

            renderMoneyGroup(

                "Potongan",

                calculation.deductions ?? [],

                true

            )

        }


        <div class="payroll-detail-total">

            <span>

                Gaji Bersih

            </span>

            <strong>

                ${

                    formatRupiah(

                        calculation.netSalary

                    )

                }

            </strong>

        </div>

    `;


    overlay.classList.remove(

        "hidden"

    );

}


/* =====================================================
   MONEY GROUP
===================================================== */

function renderMoneyGroup(

    title,

    items,

    negative

){

    if(

        !items.length

    ){

        return "";

    }


    return `

        <div class="payroll-detail-group">

            <h3>

                ${title}

            </h3>


            ${

                items.map(

                    item => `

                        <div class="payroll-detail-row">

                            <span>

                                ${

                                    item.nama ??

                                    item.name ??

                                    "-"

                                }

                            </span>

                            <strong>

                                ${

                                    negative

                                    ?

                                    "- "

                                    :

                                    ""

                                }

                                ${

                                    formatRupiah(

                                        item.total ??

                                        item.nominal ??

                                        0

                                    )

                                }

                            </strong>

                        </div>

                    `

                ).join("")

            }

        </div>

    `;

}


/* =====================================================
   CLOSE OVERLAY
===================================================== */

function closeDetailOverlay(){

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
   EVENTS
===================================================== */

function registerEvents(){

    document.addEventListener(

        "click",

        event => {

            if(

                event.target.closest(

                    "#payroll-period-detail"

                )

            ){

                openDetailOverlay();

                return;

            }


            if(

                event.target.closest(

                    "#summary-payroll-overlay-close"

                )

            ){

                closeDetailOverlay();

                return;

            }


            if(

                event.target.closest(

                    "[data-close-payroll-overlay]"

                )

            ){

                closeDetailOverlay();

            }

        }

    );

}


/* =====================================================
   FIND RULE NOMINAL
===================================================== */

function findRuleNominal(

    name

){

    const rules =

        Process.rules?.tambah ?? [];


    const rule =

        rules.find(

            item =>

                item.nama ===

                name

        );


    return Number(

        rule?.nominal || 0

    );

}


/* =====================================================
   FORMAT RUPIAH
===================================================== */

function formatRupiah(

    value

){

    return (

        "Rp" +

        Number(

            value || 0

        )

        .toLocaleString(

            "id-ID"

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

    if(

        !start ||

        !end

    ){

        return "-";

    }


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
