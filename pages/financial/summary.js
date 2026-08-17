/* =====================================================
   Finance Assistant
   Module      : Financial
   File        : summary.js
   Version     : 1.0.0

   Description :
   Financial Summary Controller

   Sections :
   - State
   - Init
   - Overview
   - Helper
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Process

} from "./process.js";


import {

    rupiah,

    shortRupiah

} from "../../js/utils.js";


/* =====================================================
   STATE
===================================================== */

export const Summary = {

    data : [],

    overview : {

        balance : 0,

        currentIncome : 0,

        currentExpense : 0,

        previousIncome : 0,

        previousExpense : 0

    }

};


/* =====================================================
   INIT
===================================================== */

Summary.init = function(

    data = []

){

    Summary.data =

        Array.isArray(

            data

        )

            ?

            data

            :

            [];


    Summary.overview =

        calculateOverview(

            Summary.data

        );


    renderOverview();


    return Summary;

};


/* =====================================================
   OVERVIEW
===================================================== */

function renderOverview(){

    const card =

        document.getElementById(

            "summary-overview-card"

        );


    if(

        !card

    ){

        return;

    }


    const overview =

        Summary.overview;


    card.innerHTML =

    `

        <!-- ==========================================
             CURRENT BALANCE
        =========================================== -->

        <div class="financial-overview-balance">

            <span class="financial-overview-label">

                Total Sisa Saldo Saat Ini

            </span>


            <strong class="financial-overview-balance-value">

                ${

                    rupiahSafe(

                        overview.balance

                    )

                }

            </strong>

        </div>


        <!-- ==========================================
             MONTHLY SUMMARY
        =========================================== -->

        <div class="financial-overview-monthly">


            <!-- CURRENT MONTH INCOME -->

            <div class="financial-overview-item">

                <span>

                    Pemasukan Bulan Ini

                </span>

                <strong>

                    ${

                        shortRupiahSafe(

                            overview.currentIncome

                        )

                    }

                </strong>

            </div>


            <!-- CURRENT MONTH EXPENSE -->

            <div class="financial-overview-item">

                <span>

                    Pengeluaran Bulan Ini

                </span>

                <strong>

                    ${

                        shortRupiahSafe(

                            overview.currentExpense

                        )

                    }

                </strong>

            </div>


            <!-- PREVIOUS MONTH INCOME -->

            <div class="financial-overview-item">

                <span>

                    Pemasukan Bulan Sebelumnya

                </span>

                <strong>

                    ${

                        shortRupiahSafe(

                            overview.previousIncome

                        )

                    }

                </strong>

            </div>


            <!-- PREVIOUS MONTH EXPENSE -->

            <div class="financial-overview-item">

                <span>

                    Pengeluaran Bulan Sebelumnya

                </span>

                <strong>

                    ${

                        shortRupiahSafe(

                            overview.previousExpense

                        )

                    }

                </strong>

            </div>


        </div>

    `;

}


/* =====================================================
   CALCULATE OVERVIEW
===================================================== */

function calculateOverview(

    data

){

    const now =

        new Date();


    const currentYear =

        now.getFullYear();


    const currentMonth =

        now.getMonth();


    const previousDate =

        new Date(

            currentYear,

            currentMonth - 1,

            1

        );


    const previousYear =

        previousDate.getFullYear();


    const previousMonth =

        previousDate.getMonth();


    let currentIncome = 0;

    let currentExpense = 0;

    let previousIncome = 0;

    let previousExpense = 0;


    data.forEach(

        item => {

            if(

                !item ||

                !item.date

            ){

                return;

            }


            const date =

                parseDate(

                    item.date

                );


            if(

                !date

            ){

                return;

            }


            const nominal =

                toNumber(

                    item.nominal

                );


            /* =====================================
               CURRENT MONTH
            ===================================== */

            if(

                date.getFullYear() ===

                    currentYear &&

                date.getMonth() ===

                    currentMonth

            ){

                if(

                    item.category ===

                    "income"

                ){

                    currentIncome +=

                        nominal;

                }


                else if(

                    item.category ===

                    "expense"

                ){

                    currentExpense +=

                        nominal;

                }

            }


            /* =====================================
               PREVIOUS MONTH
            ===================================== */

            if(

                date.getFullYear() ===

                    previousYear &&

                date.getMonth() ===

                    previousMonth

            ){

                if(

                    item.category ===

                    "income"

                ){

                    previousIncome +=

                        nominal;

                }


                else if(

                    item.category ===

                    "expense"

                ){

                    previousExpense +=

                        nominal;

                }

            }

        }

    );


    return {

        balance :

            Process.summary?.balance ??

            0,


        currentIncome,

        currentExpense,

        previousIncome,

        previousExpense

    };

}


/* =====================================================
   DATE
===================================================== */

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
