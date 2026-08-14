/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Home
   File        : home.js
   Version     : 2.0.0

   Description :
   Payroll Daily Home Controller

   Flow :

   Load user
        ↓
   Render header
        ↓
   Render hero
        ↓
   Render profile
        ↓
   Load payroll data
        ↓
   Process data
        ↓
   Initialize Summary
        ↓
   Initialize Statistics
        ↓
   Render Home
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

    Header

} from "../../components/header/script.js";


import {

    Profile

} from "../../components/profile/script.js";


import {

    Summary

} from "./summary.js";


import {

    Statistics

} from "./statistics.js";


import {

    formatDate,

    rupiah,

    shortRupiah

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
       PROCESS DATA
    ============================================= */

    try{

        Process.init(

            API.raw,

            API.data

        );


        /* -----------------------------------------
           PAYROLL SUMMARY
        ----------------------------------------- */

        Summary.init();


        /* -----------------------------------------
           DAILY STATISTICS
        ----------------------------------------- */

        Statistics.init();


        /* -----------------------------------------
           HOME
           Render setelah semua data siap
        ----------------------------------------- */

        renderHomeSummary();

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
   HOME SUMMARY
===================================================== */

function renderHomeSummary(){

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
       PAYROLL SUMMARY
       
       Home tidak menghitung payroll sendiri.

       Semua nilai payroll mengikuti Summary.
    ============================================= */

    const payroll =

        getPayrollSummary();


    /* =============================================
       DAILY DATA
       
       Hanya untuk:
       - Minggu Ini
       - Hari Ini
       
       Tidak digunakan untuk menghitung gaji.
    ============================================= */

    const weekly =

        calculateWeeklyIncome();


    /* =============================================
       RENDER
    ============================================= */

    card.innerHTML =

    `

        <!-- =========================================
             PAYROLL
        ========================================== -->

        <div class="home-payroll-title">

            Estimasi Gaji Periode Ini

        </div>


        <div class="home-payroll-period">

            ${

                payroll.period

                    ?

                    formatDate(

                        payroll.period.start

                    )

                    +

                    " - "

                    +

                    formatDate(

                        payroll.period.end

                    )

                    :

                    "Periode tidak tersedia"

            }

        </div>


        <div class="home-payroll-salary">

            ${

                rupiah(

                    payroll.netSalary

                )

            }

        </div>


        <!-- =========================================
             SMALL SUMMARY
        ========================================== -->

        <div class="home-income-grid">


            <!-- MINGGU -->

            <div class="home-income-item">

                <span>

                    Minggu Ini

                </span>


                <strong>

                    ${

                        shortRupiah(

                            weekly.weekIncome

                        )

                    }

                </strong>

            </div>


            <!-- HARI INI -->

            <div class="home-income-item">

                <span>

                    Hari Ini

                </span>


                <strong>

                    ${

                        shortRupiah(

                            weekly.todayIncome

                        )

                    }

                </strong>

            </div>


        </div>

    `;


    /* =============================================
       NUMBER ANIMATION
    ============================================= */

    const salaryElement =

        card.querySelector(

            ".home-payroll-salary"

        );


    if(

        salaryElement

    ){

        Animation.number(

            salaryElement,

            payroll.netSalary,

            value =>

                rupiah(

                    value

                )

        );

    }

}


/* =====================================================
   GET PAYROLL SUMMARY
===================================================== */

function getPayrollSummary(){

    /* =============================================
       DAILY SUMMARY
       
       Payroll Daily menyimpan hasil perhitungan
       periode berjalan di Summary.current.
    ============================================= */

    const summary =

        Summary.current;


    if(

        !summary

    ){

        return {

            period : null,

            netSalary : 0

        };

    }


    return {

        period :

            summary.period ?? null,

        netSalary :

            Number(

                summary.net ?? 0

            )

    };

}

    /* =============================================
       FALLBACK
       Menggunakan current period jika Summary
       sudah menentukan period tetapi belum
       mempunyai historyData.
    ============================================= */

    return {

        period :

            Summary.currentPeriod ??

            Summary.selectedPeriod ??

            null,

        netSalary :

            0

    };

}


/* =====================================================
   CALCULATE WEEKLY INCOME
===================================================== */

function calculateWeeklyIncome(){

    const data =

        Process.data ?? [];


    const today =

        new Date();


    const todayStart =

        new Date(

            today.getFullYear(),

            today.getMonth(),

            today.getDate()

        );


    const todayEnd =

        new Date(

            today.getFullYear(),

            today.getMonth(),

            today.getDate(),

            23,

            59,

            59,

            999

        );


    /* =============================================
       CURRENT WEEK
       SENIN - MINGGU
    ============================================= */

    const day =

        todayStart.getDay();


    const mondayOffset =

        day === 0

            ?

            6

            :

            day - 1;


    const weekStart =

        new Date(

            todayStart

        );


    weekStart.setDate(

        weekStart.getDate()

        -

        mondayOffset

    );


    const weekEnd =

        new Date(

            weekStart

        );


    weekEnd.setDate(

        weekEnd.getDate()

        + 6

    );


    weekEnd.setHours(

        23,

        59,

        59,

        999

    );


    let todayIncome =

        0;


    let weekIncome =

        0;


    data.forEach(

        item => {

            const date =

                getItemDate(

                    item

                );


            if(

                !date

            ){

                return;

            }


            const income =

                getIncome(

                    item

                );


            /* -----------------------------------------
               TODAY
            ----------------------------------------- */

            if(

                date >= todayStart

                &&

                date <= todayEnd

            ){

                todayIncome +=

                    income;

            }


            /* -----------------------------------------
               CURRENT WEEK
            ----------------------------------------- */

            if(

                date >= weekStart

                &&

                date <= weekEnd

            ){

                weekIncome +=

                    income;

            }

        }

    );


    return {

        todayIncome,

        weekIncome

    };

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

        return item.dateObject;

    }


    return parseLocalDate(

        item?.date ??

        item?.tanggal

    );

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


    const [

        year,

        month,

        day

    ] =

        parts;


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
   GET INCOME
===================================================== */

function getIncome(

    item

){

    return toNumber(

        item?.income ??

        item?.pendapatan ??

        item?.total ??

        item?.amount ??

        0

    );

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
