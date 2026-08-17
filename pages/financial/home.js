/* =====================================================
   Finance Assistant
   Page        : Financial
   Module      : Home
   File        : home.js
   Version     : 1.2.0

   Description :
   Financial Home Controller

   Sections :
   - Import
   - State
   - Init
   - Hero
   - Summary
   - Input
   - Setting
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

    shortRupiah,

    rupiah

} from "../../js/utils.js";


import {

    Animation

} from "../../js/animation.js";

import {
   
    Setting
   
} from "../../components/setting/script.js";


import {
   
    Input
   
} from "../../components/input/script.js";



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

            "financial"

    });


    /* =============================================
       HERO
    ============================================= */

    renderHero();


    /* =============================================
       LOAD FINANCIAL DATA
    ============================================= */

    try{

        await API.load(

            CONFIG.api.financial,

            CONFIG.api.activity

        );

    }

    catch(error){

        console.error(

            "[Financial] API Error:",

            error

        );

        return;

    }


    /* =============================================
       PROCESS DATA
    ============================================= */

    try{

        Process.init(

            API.raw,

            API.data

        );

       /* =========================================
           SUMMARY
        ========================================= */

       Summary.init(

           Process.data

      );


        /* =========================================
           STATISTICS
        ========================================= */

        Statistics.init(

            Process.data

        );


        /* =========================================
           SUMMARY
        ========================================= */

        renderSummary();


        /* =========================================
           INPUT
        ========================================= */

        renderInput();


        /* =========================================
           SETTING
        ========================================= */

        renderSetting();

    }

    catch(error){

        console.error(

            "[Financial] Process Error:",

            error

        );

    }


    /* =============================================
       PROFILE
    ============================================= */

    await Profile.render({

        container :

            "#profile-page"

    });

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


    const summary =

        Process.summary ??

        {

            balance : 0

        };


    const statistics =

        calculateHomeExpenses(

            Process.data

        );


    card.innerHTML =

    `

        <div class="financial-home-summary">


            <!-- ======================================
                 TOTAL SALDO ACTUAL
            ======================================= -->

            <div class="financial-home-balance">

                <span class="financial-home-balance-label">

                    Total Saldo Actual

                </span>


                <strong
                    id="financial-home-balance"
                    class="financial-home-balance-value">

                    Rp 0

                </strong>

            </div>


            <!-- ======================================
                 EXPENSE SUMMARY
            ======================================= -->

            <div class="financial-home-expense-grid">


                <div class="financial-home-expense-item">

                    <span>

                        Pengeluaran Hari Ini

                    </span>


                    <strong>

                        ${

                            shortRupiah(

                                statistics.today

                            )

                        }

                    </strong>

                </div>


                <div class="financial-home-expense-item">

                    <span>

                        Pengeluaran Minggu Ini

                    </span>


                    <strong>

                        ${

                            shortRupiah(

                                statistics.week

                            )

                        }

                    </strong>

                </div>


                <div class="financial-home-expense-item">

                    <span>

                        Pengeluaran Bulan Ini

                    </span>


                    <strong>

                        ${

                            shortRupiah(

                                statistics.currentMonth

                            )

                        }

                    </strong>

                </div>


                <div class="financial-home-expense-item">

                    <span>

                        Pengeluaran Bulan Sebelumnya

                    </span>


                    <strong>

                        ${

                            shortRupiah(

                                statistics.previousMonth

                            )

                        }

                    </strong>

                </div>


            </div>


            <!-- ======================================
                 HIGHEST EXPENSE DAYS
            ======================================= -->

            <div class="financial-home-expense-grid">


                <!-- CURRENT MONTH -->

                <div class="financial-home-expense-item">

                    <span>

                        Pengeluaran Terbesar Bulan Ini

                    </span>


                    <strong>

                        ${

                            statistics.currentHighest

                                ?

                                formatHighestExpense(

                                    statistics.currentHighest

                                )

                                :

                                "Belum ada pengeluaran"

                        }

                    </strong>

                </div>


                <!-- PREVIOUS MONTH -->

                <div class="financial-home-expense-item">

                    <span>

                        Pengeluaran Terbesar Bulan Lalu

                    </span>


                    <strong>

                        ${

                            statistics.previousHighest

                                ?

                                formatHighestExpense(

                                    statistics.previousHighest

                                )

                                :

                                "Belum ada pengeluaran"

                        }

                    </strong>

                </div>


            </div>


        </div>

    `;


    /* =============================================
       BALANCE ANIMATION
    ============================================= */

    Animation.number(

        document.getElementById(

            "financial-home-balance"

        ),

        summary.balance,

        rupiah,

    );

}

/* =====================================================
   HOME EXPENSE CALCULATION
===================================================== */

function calculateHomeExpenses(

    data = []

){

    const now =

        new Date();


    const todayKey =

        formatDateKey(

            now

        );


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


    /* =============================================
       START OF WEEK

       Senin → hari ini
    ============================================= */

    const startOfWeek =

        new Date(

            now

        );


    const day =

        startOfWeek.getDay();


    const diff =

        day === 0

            ?

            6

            :

            day - 1;


    startOfWeek.setDate(

        now.getDate() - diff

    );


    startOfWeek.setHours(

        0,

        0,

        0,

        0

    );


    let today = 0;

    let week = 0;

    let currentMonthTotal = 0;

    let previousMonthTotal = 0;


    const currentDays = {};

    const previousDays = {};


    data.forEach(

        item => {

            if(

                !item ||

                item.jenis !== "keluar" ||

                !item.date

            ){

                return;

            }


            const date =

                parseLocalDate(

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


            if(

                nominal <= 0

            ){

                return;

            }


            /* =====================================
               TODAY
            ===================================== */

            if(

                item.date ===

                todayKey

            ){

                today +=

                    nominal;

            }


            /* =====================================
               THIS WEEK
            ===================================== */

            if(

                date >=

                startOfWeek &&

                date <=

                now

            ){

                week +=

                    nominal;

            }


            /* =====================================
               CURRENT MONTH
            ===================================== */

            if(

                date.getFullYear() ===

                    currentYear &&

                date.getMonth() ===

                    currentMonth

            ){

                currentMonthTotal +=

                    nominal;


                currentDays[item.date] =

                    (

                        currentDays[item.date] ??

                        0

                    ) +

                    nominal;

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

                previousMonthTotal +=

                    nominal;


                previousDays[item.date] =

                    (

                        previousDays[item.date] ??

                        0

                    ) +

                    nominal;

            }

        }

    );


    return {

        today,

        week,

        currentMonth :

            currentMonthTotal,

        previousMonth :

            previousMonthTotal,

        currentHighest :

            getHighestExpenseDay(

                currentDays

            ),

        previousHighest :

            getHighestExpenseDay(

                previousDays

            )

    };

}

/* =====================================================
   HIGHEST EXPENSE DAY
===================================================== */

function getHighestExpenseDay(

    days

){

    const entries =

        Object.entries(

            days

        );


    if(

        !entries.length

    ){

        return null;

    }


    entries.sort(

        (a, b) =>

            b[1] - a[1]

    );


    return {

        date :

            entries[0][0],

        total :

            entries[0][1]

    };

}

/* =====================================================
   HIGHEST EXPENSE FORMAT
===================================================== */

function formatHighestExpense(

    data

){

    const date =

        parseLocalDate(

            data.date

        );


    if(

        !date

    ){

        return shortRupiah(

            data.total

        );

    }


    const dateText =

        date.toLocaleDateString(

            "id-ID",

            {

                day :

                    "numeric",

                month :

                    "long"

            }

        );


    return `

        <span class="financial-home-highest-date">

            ${dateText}

        </span>


        <span class="financial-home-highest-value">

            ${shortRupiah(data.total)}

        </span>

    `;

}

/* =====================================================
   INPUT
===================================================== */

function renderInput(){

    const card =

        document.getElementById(

            "input-card"

        );


    if(

        !card

    ){

        return;

    }


    card.innerHTML =

    `

        <div
            id="financial-input-menu"
            class="profile-menu-item">


            <div
                class="profile-menu-left">


                <div
                    class="profile-menu-icon">

                    ✍️

                </div>


                <div
                    class="profile-menu-content">


                    <span
                        class="profile-menu-title">

                        Input

                    </span>


                    <span
                        class="profile-menu-description">

                        Tambahkan data Financial

                    </span>


                </div>


            </div>


            <div
                class="profile-menu-arrow">

                ›

            </div>


        </div>

    `;


    const menu =

        document.getElementById(

            "financial-input-menu"

        );


    if(

        menu

    ){

        menu.addEventListener(

            "click",

            () => {

                Input.open(

                    "financial"

                );

            }

        );

    }

}


/* =====================================================
   SETTING
===================================================== */

function renderSetting(){

    const card =

        document.getElementById(

            "setting-card"

        );


    if(

        !card

    ){

        return;

    }


    card.innerHTML =

    `

        <div
            id="financial-setting-menu"
            class="profile-menu-item">


            <div
                class="profile-menu-left">


                <div
                    class="profile-menu-icon">

                    ⚙️

                </div>


                <div
                    class="profile-menu-content">


                    <span
                        class="profile-menu-title">

                        Pengaturan Financial

                    </span>


                    <span
                        class="profile-menu-description">

                        Atur rule dan konfigurasi Financial

                    </span>


                </div>


            </div>


            <div
                class="profile-menu-arrow">

                ›

            </div>


        </div>

    `;


    const menu =

        document.getElementById(

            "financial-setting-menu"

        );


    if(

        menu

    ){

        menu.addEventListener(

            "click",

            () => {

                Setting.open(

                    "financial"

                );

            }

        );

    }

}


/* =====================================================
   DATE KEY
===================================================== */

function formatDateKey(

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
   PARSE LOCAL DATE
===================================================== */

function parseLocalDate(

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


    if(

        Number.isNaN(

            date.getTime()

        )

    ){

        return null;

    }


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
