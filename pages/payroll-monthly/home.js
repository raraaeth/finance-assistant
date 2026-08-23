/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Home
   File        : home.js
   Version     : 1.1.0

   Description :
   Payroll Monthly Home Controller

   Sections :
   - Import
   - State
   - Init
   - Hero
   - Previous Salary
   - Attendance
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
            "payroll"

    });

   


    /* =============================================
       HERO
    ============================================= */

    renderHero();


   /* =============================================
       HOME CARD
    ============================================= */

    renderPreviousSalary();

    renderAttendance();

    renderInput();

    renderSetting();


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

    CONFIG.api.endpoint,

    CONFIG.data.attendance,

    CONFIG.data.rules

);
       
       console.log(
    "===== PAYROLL MONTHLY RAW FIRST =====",
    API.raw?.[0]
);

console.log(
    "===== PAYROLL MONTHLY RAW KEYS =====",
    Object.keys(

        API.raw?.[0] ?? {}

    )
);

console.log(
    "===== PAYROLL MONTHLY DATA =====",
    API.data
);

console.log(
    "===== PAYROLL MONTHLY DATA FIRST =====",
    API.data?.[0]
);

console.log(
    "===== PAYROLL MONTHLY DATA KEYS =====",
    Object.keys(

        API.data?.[0] ?? {}

    )
);

    }

    catch(error){

        console.error(

            "Payroll API Error:",

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
           Refresh Attendance
        ----------------------------------------- */

        renderAttendance();


        /* -----------------------------------------
           Statistics
        ----------------------------------------- */

        Statistics.init();
       

/* -----------------------------------------
   Summary
----------------------------------------- */

Summary.init();


/* -----------------------------------------
   Refresh Previous Salary
----------------------------------------- */

renderPreviousSalary();

    }

    catch(error){

        console.error(

            "Payroll Process Error:",

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
   PREVIOUS SALARY
===================================================== */

function renderPreviousSalary(){

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
       GET PREVIOUS PAYROLL
    ============================================= */

    const period =

        Summary.selectedPeriod;


    const result =

        Summary.historyData;


    if(

        !period ||

        !result

    ){

        return;

    }


    /* =============================================
       ATTENDANCE
       PREVIOUS PAYROLL PERIOD
    ============================================= */

    const attendance =

        result.attendance ?? [];


    const summary = {

        masuk : 0,

        telat : 0,

        lembur : 0

    };


    attendance.forEach(

        item => {

            /* -------------------------------------
               MASUK
            ------------------------------------- */

            if(

                item.status ===

                "masuk"

            ){

                summary.masuk++;

            }


            /* -------------------------------------
               TELAT
            ------------------------------------- */

            if(

                item.status ===

                "masuk"

                &&

                item.attendanceStatus ===

                "telat"

            ){

                summary.telat++;

            }


            /* -------------------------------------
               LEMBUR
            ------------------------------------- */

            if(

                item.status ===

                "lembur"

            ){

                summary.lembur++;

            }

        }

    );


    /* =============================================
       RENDER
    ============================================= */

    card.innerHTML =

    `

        <div class="home-payroll-title">

            Gaji Periode Sebelumnya

        </div>


        <div class="home-payroll-period">

            ${

                formatDate(

                    period.start

                )

            }

            -

            ${

                formatDate(

                    period.end

                )

            }

        </div>


        <div class="home-payroll-salary">

            ${

                new Intl.NumberFormat(

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

                    Number(

                        result.netSalary || 0

                    )

                )

            }

        </div>


        <div class="home-attendance-grid">


            <!-- MASUK -->

            <div class="home-attendance-item">

                <span>

                    🟢 Masuk

                </span>


                <strong>

                    ${

                        summary.masuk

                    }

                </strong>

            </div>


            <!-- TELAT -->

            <div class="home-attendance-item">

                <span>

                    🟠 Telat

                </span>


                <strong>

                    ${

                        summary.telat

                    }

                </strong>

            </div>


            <!-- LEMBUR -->

            <div class="home-attendance-item">

                <span>

                    🔵 Lembur

                </span>


                <strong>

                    ${

                        summary.lembur

                    }

                </strong>

            </div>


        </div>

    `;

       const salaryElement =

        card.querySelector(

            ".home-payroll-salary"

        );


    Animation.number(

        salaryElement,

        Number(

            result.netSalary || 0

        ),

        value =>

            new Intl.NumberFormat(

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

            )

    );

}


/* =====================================================
   ATTENDANCE
===================================================== */

function renderAttendance(){

    const section =

        document.getElementById(

            "attendance"

        );


    const card =

        document.getElementById(

            "attendance-card"

        );


    if(

        !section ||

        !card

    ){

        return;

    }


    /* =============================================
       SHOW SECTION
    ============================================= */

    section.classList.remove(

        "hidden"

    );


    /* =============================================
       CURRENT DATE
    ============================================= */

    const today =

        new Date();


    const currentYear =

        today.getFullYear();


    const currentMonth =

        today.getMonth();


    /* =============================================
       MONTH START
    ============================================= */

    const monthStart =

        new Date(

            currentYear,

            currentMonth,

            1

        );


    /* =============================================
       GET ATTENDANCE DATA
    ============================================= */

    const attendance =

        Process.attendance?.data ?? [];


    /* =============================================
       FILTER :
       CURRENT MONTH → TODAY
    ============================================= */

    const currentMonthAttendance =

        attendance.filter(

            item => {

                if(

                    !item.dateObject

                ){

                    return false;

                }


                const date =

                    item.dateObject;


                return (

                    date.getFullYear() ===

                    currentYear

                )

                &&

                (

                    date.getMonth() ===

                    currentMonth

                )

                &&

                (

                    date <=

                    today

                );

            }

        );


    /* =============================================
       SUMMARY
    ============================================= */

    const summary = {

        masuk : 0,

        telat : 0,

        lembur : 0

    };


    currentMonthAttendance.forEach(

        item => {

            /* -------------------------------------
               MASUK
            ------------------------------------- */

            if(

                item.status ===

                "masuk"

            ){

                summary.masuk++;

            }


            /* -------------------------------------
               TELAT
            ------------------------------------- */

            if(

                item.status ===

                "masuk"

                &&

                item.attendanceStatus ===

                "telat"

            ){

                summary.telat++;

            }


            /* -------------------------------------
               LEMBUR
            ------------------------------------- */

            if(

                item.status ===

                "lembur"

            ){

                summary.lembur++;

            }

        }

    );


    /* =============================================
       RENDER
    ============================================= */

    card.innerHTML =

    `

        <div class="attendance-period">

            ${

                formatDate(

                    monthStart

                )

            }

            -

            ${

                formatDate(

                    today

                )

            }

        </div>


        <div class="attendance-grid">


            <!-- MASUK -->

            <div class="attendance-item">

                <span>

                    🟢 Masuk

                </span>


                <strong>

                    ${

                        summary.masuk

                    }

                </strong>

            </div>


            <!-- TELAT -->

            <div class="attendance-item">

                <span>

                    🟠 Telat

                </span>


                <strong>

                    ${

                        summary.telat

                    }

                </strong>

            </div>


            <!-- LEMBUR -->

            <div class="attendance-item">

                <span>

                    🔵 Lembur

                </span>


                <strong>

                    ${

                        summary.lembur

                    }

                </strong>

            </div>


        </div>

    `;

};

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
            id="payroll-input-menu"
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

                        Tambahkan data Payroll

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

            "payroll-input-menu"

        );


    if(

        menu

    ){

        menu.addEventListener(

            "click",

            () => {

                Input.open(

                    "payroll-monthly"

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
            id="payroll-setting-menu"
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

                        Pengaturan Payroll

                    </span>


                    <span
                        class="profile-menu-description">

                        Atur rule dan konfigurasi Payroll

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

            "payroll-setting-menu"

        );


    if(

        menu

    ){

        menu.addEventListener(

            "click",

            () => {

                Setting.open(

                    "payroll-monthly"

                );

            }

        );

    }

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
