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

    Header

} from "../../components/header/script.js";


import {

    Profile

} from "../../components/profile/script.js";


import {

    formatDate

} from "../../js/utils.js";


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

            CONFIG.api.attendance,

            CONFIG.api.rules

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


    /*
       SKELETON

       Perhitungan gaji belum menjadi
       bagian dari Home.

       Untuk sekarang tetap tampil
       sebagai placeholder.
    */

    card.innerHTML =

    `

        <div class="summary-total">

            <p>

                Gaji Periode Sebelumnya

            </p>


            <h2>

                -

            </h2>

        </div>


        <div class="summary-grid">

            <div class="summary-item">

                <span>

                    Periode

                </span>


                <strong>

                    -

                </strong>

            </div>


            <div class="summary-item">

                <span>

                    Gaji Bersih

                </span>


                <strong>

                    -

                </strong>

            </div>

        </div>

    `;

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


    /* =============================================
       DEBUG
    ============================================= */

    console.log(

        "HOME ATTENDANCE:",

        {

            period :

                `${

                    currentYear

                }-${

                    String(

                        currentMonth + 1

                    )

                    .padStart(

                        2,

                        "0"

                    )

                }`,

            totalData :

                currentMonthAttendance.length,

            masuk :

                summary.masuk,

            telat :

                summary.telat,

            lembur :

                summary.lembur

        }

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
