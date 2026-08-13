/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Home
   File        : home.js
   Version     : 1.1.0

   Description :
   Payroll Daily Home Controller

   Sections :
   - Import
   - State
   - Init
   - Hero
   - Summary
   - Helper
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadUser

} from "../../js/storage.js";


import {

    CONFIG

} from "./config.js";


import {

    API

} from "../../js/api.js";


import {

    Process

} from "./process.js";


import {

    Statistics

} from "./statistics.js";


import {

    Summary

} from "./summary.js";


import {

    Header

} from "../../components/header/script.js";


import {

    Profile

} from "../../components/profile/script.js";


import {

    formatDate

} from "../../js/utils.js";


import {

    Animation

} from "../../js/animation.js";


/* =====================================================
   STATE
===================================================== */

const user =

    loadUser();


/* =====================================================
   INIT
===================================================== */

export async function init(){


    /* =============================================
       HEADER
    ============================================= */

    await Header.render({

        container :
            "#header-container",

        theme :
            "payroll"

    });


    /* =============================================
       HERO
    ============================================= */

    renderHero();


    /* =============================================
       SUMMARY
    ============================================= */

    renderSummary();


    /* =============================================
       PROFILE
    ============================================= */

    await Profile.render({

        container :
            "#profile-page"

    });


    /* =============================================
       LOAD DATA
    ============================================= */

    try{

        await API.load(

            CONFIG.api.daily,

            CONFIG.api.rules

        );

    }

    catch(error){

        console.error(

            "Payroll Daily API Error:",

            error

        );

        return;

    }


    /* =============================================
       PROCESS
    ============================================= */

    try{

        Process.init(

            API.raw,

            API.data

        );


        /* -----------------------------------------
           Refresh Summary
        ----------------------------------------- */

        renderSummary();


        /* -----------------------------------------
           Statistics
        ----------------------------------------- */

        Statistics.init();


        /* -----------------------------------------
           Summary Module
        ----------------------------------------- */

        Summary.init();

    }

    catch(error){

        console.error(

            "Payroll Daily Process Error:",

            error

        );

    }

}


/* =====================================================
   HERO
===================================================== */

function renderHero(){


    const name =

        capitalize(

            user?.displayName ??

            "Guest"

        );


    const title =

        document.getElementById(

            "hero-title"

        );


    const description =

        document.getElementById(

            "hero-description"

        );


    const banner =

        document.getElementById(

            "hero-banner"

        );


    if(

        title

    ){

        title.innerHTML =

            `Halo, ${name} 👋`;

    }


    if(

        description

    ){

        description.textContent =

            CONFIG.hero.description;

    }


    if(

        banner

    ){

        banner.src =

            CONFIG.hero.image;

    }

}


/* =====================================================
   SUMMARY
===================================================== */

function renderSummary(){


    const card =

        document.getElementById(

            "summary-card"

        );


    if(

        !card

    ){

        return;

    }


    /* =============================================
       CURRENT DATE
    ============================================= */

    const today =

        new Date();


    today.setHours(

        0,

        0,

        0,

        0

    );


    /* =============================================
       CURRENT PAYROLL PERIOD
    ============================================= */

    const period =

        Process.currentPeriod;


    /* =============================================
       DATA
    ============================================= */

    const data =

        Process.data ?? [];


    /* =============================================
       TOTAL PERIOD
    ============================================= */

    let periodIncome =

        0;


    /* =============================================
       TODAY
    ============================================= */

    let todayIncome =

        0;


    /* =============================================
       WEEK
    ============================================= */

    let weekIncome =

        0;


    const weekStart =

        getWeekStart(

            today

        );


    data.forEach(

        item => {


            if(

                !item.dateObject

            ){

                return;

            }


            const date =

                new Date(

                    item.dateObject

                );


            date.setHours(

                0,

                0,

                0,

                0

            );


            const amount =

                Number(

                    item.amount

                ) || 0;


            /* -------------------------------------
               PERIOD
            ------------------------------------- */

            if(

                period

                &&

                date >=

                    new Date(

                        period.start

                    )

                &&

                date <=

                    new Date(

                        period.end

                    )

                &&

                date <=

                    today

            ){

                periodIncome +=

                    amount;

            }


            /* -------------------------------------
               TODAY
            ------------------------------------- */

            if(

                date.getTime() ===

                today.getTime()

            ){

                todayIncome +=

                    amount;

            }


            /* -------------------------------------
               WEEK
            ------------------------------------- */

            if(

                date >=

                    weekStart

                &&

                date <=

                    today

            ){

                weekIncome +=

                    amount;

            }

        }

    );


    /* =============================================
       RENDER
    ============================================= */

    card.innerHTML =

    `

        <div class="summary-total">


            <span id="summary-label">

                Total Gaji Berjalan

            </span>


            <strong id="summary-total">

                ${

                    formatCurrency(

                        periodIncome

                    )

                }

            </strong>


            <span id="summary-period">

                ${

                    period

                    ?

                    `${

                        formatDate(

                            period.start

                        )

                    }

                    -

                    ${

                        formatDate(

                            period.end

                        )

                    }`

                    :

                    "Periode berjalan"

                }

            </span>


        </div>


        <div class="summary-grid">


            <!-- HARI INI -->

            <div class="summary-item">

                <span>

                    Pendapatan Hari Ini

                </span>


                <strong>

                    ${

                        formatShortCurrency(

                            todayIncome

                        )

                    }

                </strong>

            </div>


            <!-- MINGGU INI -->

            <div class="summary-item">

                <span>

                    Pendapatan Minggu Ini

                </span>


                <strong>

                    ${

                        formatShortCurrency(

                            weekIncome

                        )

                }

            </strong>

            </div>


        </div>

    `;


    /* =============================================
       TOTAL ANIMATION
    ============================================= */

    const totalElement =

        card.querySelector(

            "#summary-total"

        );


    Animation.number(

        totalElement,

        periodIncome,

        value =>

            formatCurrency(

                value

            )

    );

}


/* =====================================================
   WEEK START
===================================================== */

function getWeekStart(

    date

){

    const result =

        new Date(

            date

        );


    const day =

        result.getDay();


    const difference =

        day === 0

            ? -6

            : 1 - day;


    result.setDate(

        result.getDate() +

        difference

    );


    result.setHours(

        0,

        0,

        0,

        0

    );


    return result;

}


/* =====================================================
   CURRENCY
===================================================== */

function formatCurrency(

    value

){

    return new Intl.NumberFormat(

        CONFIG.currency.locale,

        {

            style :

                "currency",

            currency :

                CONFIG.currency.code,

            maximumFractionDigits :

                0

        }

    ).format(

        Number(

            value

        ) || 0

    );

}


/* =====================================================
   SHORT CURRENCY
===================================================== */

function formatShortCurrency(

    value

){

    value =

        Number(

            value

        ) || 0;


    if(

        value >=

        1000000000

    ){

        return `Rp${

            trimDecimal(

                value /

                1000000000

            )

        }M`;

    }


    if(

        value >=

        1000000

    ){

        return `Rp${

            trimDecimal(

                value /

                1000000

            )

        }jt`;

    }


    if(

        value >=

        1000

    ){

        return `Rp${

            trimDecimal(

                value /

                1000

            )

        }rb`;

    }


    return `Rp${

        value.toLocaleString(

            "id-ID"

        )

    }`;

}


/* =====================================================
   TRIM DECIMAL
===================================================== */

function trimDecimal(

    value

){

    return value

        .toFixed(2)

        .replace(

            /\.00$/,

            ""

        )

        .replace(

            /(\.\d)0$/,

            "$1"

        );

}


/* =====================================================
   HELPER
===================================================== */

function capitalize(

    text

){

    return String(

        text

    ).replace(

        /\b\w/g,

        letter =>

            letter.toUpperCase()

    );

}
