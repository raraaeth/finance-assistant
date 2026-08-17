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

import {

    Animation

} from "../../js/animation.js";


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
    renderFinancialPosition();


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


            <strong
    id="financial-overview-balance"
    class="financial-overview-balance-value">

    Rp 0

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
   
   Animation.number(

    document.getElementById(

        "financial-overview-balance"

    ),

    overview.balance,

    rupiahSafe

);

}

/* =====================================================
   Financial Position
===================================================== */
function renderFinancialPosition(){

    const section =

        document.getElementById(
            "summary-financial-position"
        );


    const card =

        document.getElementById(
            "summary-financial-position-card"
        );


    if(
        !section ||
        !card
    ){

        return;

    }


    const debt =

        Process.debt;


    const saving =

        Process.saving;


    const danaDarurat =

        saving?.danaDarurat;


    const tabunganKaleng =

        saving?.tabunganKaleng;


    const debtBalance =

        debt?.outstanding ?? 0;


    const danaDaruratBalance =

        danaDarurat?.balance ?? 0;


    const tabunganKalengBalance =

        tabunganKaleng?.balance ?? 0;


    /*
     * Kalau semuanya 0,
     * section disembunyikan.
     */

    if(

        debtBalance <= 0 &&

        danaDaruratBalance <= 0 &&

        tabunganKalengBalance <= 0

    ){

        section.classList.add("hidden");

        return;

    }


    section.classList.remove("hidden");


    card.innerHTML = "";


    /*
     * DANA DARURAT
     */

    if(

        danaDaruratBalance > 0

    ){

        card.innerHTML +=

        createSavingCard(

            "Dana Darurat",

            danaDarurat,

            "../assets/icons/dana_darurat.webp"

        );

    }


    /*
     * TABUNGAN KALENG
     */

    if(

        tabunganKalengBalance > 0

    ){

        card.innerHTML +=

        createSavingCard(

            "Celengan Toples",

            tabunganKaleng,

            "../assets/icons/toples_brangkas.webp"

        );

    }


    /*
     * HUTANG
     */

    if(

        debtBalance > 0

    ){

        card.innerHTML +=

        createDebtCard(

            debt

        );

    }

}

/* =====================================================
   SAVING CARD
===================================================== */

function createSavingCard(

    title,

    data,

    icon

){

    const transactions =

        data?.transactions ?? [];


    const last =

        transactions[

            transactions.length - 1

        ];


    let lastTransaction = "-";


    if(

        last

    ){

        const amount =

            toNumber(

                last.nominal

            );


        const sign =

            last.savingType ===

            "deposit"

                ?

                "+"

                :

                "-";


        lastTransaction =

            sign +

            shortRupiah(

                amount

            );

    }


    return `

        <div class="financial-position-card saving-card">


            <div class="financial-position-header">


                <img

                    class="financial-position-icon"

                    src="${icon}"

                    alt="${title}">


                <strong>

                    ${title}

                </strong>


            </div>


            <div class="financial-position-value">

                ${shortRupiah(

                    data.balance

                )}

            </div>


            <div class="financial-position-last">

                Tx terakhir :

                ${lastTransaction}

            </div>


        </div>

    `;

}

/* =====================================================
   DEBT CARD
===================================================== */

function createDebtCard(

    debt

){

    return `

        <div class="financial-position-card debt-card">


            <div class="financial-position-header">

                <strong>

                    Hutang

                </strong>

            </div>


            <div class="financial-position-row">

                <span>

                    Hutang

                </span>

                <strong>

                    ${shortRupiah(

                        debt.borrowed

                    )}

                </strong>

            </div>


            <div class="financial-position-row">

                <span>

                    Dibayar

                </span>

                <strong>

                    ${shortRupiah(

                        debt.paid

                    )}

                </strong>

            </div>


            <div class="financial-position-row">

                <span>

                    Sisa

                </span>

                <strong>

                    ${shortRupiah(

                        debt.outstanding

                    )}

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

function shortRupiahSafe(

    value

){

    if(

        typeof shortRupiah ===

        "function"

    ){

        return shortRupiah(

            value

        );

    }


    return rupiahSafe(

        value

    );

}
