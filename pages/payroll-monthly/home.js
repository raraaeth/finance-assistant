/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Home
   File        : home.js
   Version     : 2.0.0

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
       Render skeleton terlebih dahulu.
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


        /* =========================================
           RENDER ATTENDANCE
        ========================================= */

        renderAttendance();


        /* =========================================
           STATISTICS
        ========================================= */

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
       PAYROLL CALCULATION
       belum dibuat.

       Untuk sementara tetap skeleton.
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
       GET ATTENDANCE
    ============================================= */

    const attendance =

        Process.attendance?.data ?? [];


    /*
       Jika Process belum selesai,
       jangan tampilkan angka palsu.
    */

    if(

        !attendance.length

    ){

        card.innerHTML =

        `

            <div class="attendance-empty">

                Memuat data attendance...

            </div>

        `;

        return;

    }


    /* =============================================
       CURRENT MONTH
    ============================================= */

    const today =

        new Date();


    const currentYear =

        today.getFullYear();


    const currentMonth =

        today.getMonth();


    const monthStart =

        new Date(

            currentYear,

            currentMonth,

            1

        );


    const monthEnd =

        new Date(

            currentYear,

            currentMonth + 1,

            0

        );


    /* =============================================
       FILTER CURRENT MONTH
    ============================================= */

    const periodAttendance =

        attendance.filter(

            item => {

                const date =

                    item.dateObject;


                if(

                    !date

                ){

                    return false;

                }


                return (

                    date.getFullYear() ===

                    currentYear

                )

                &&

                (

                    date.getMonth() ===

                    currentMonth

                );

            }

        );


    /* =============================================
       SUMMARY
    ============================================= */

    const summary =

        calculateAttendanceSummary(

            periodAttendance

        );


    /* =============================================
       RENDER
    ============================================= */

    const items = [];


    /* ---------------------------------------------
       MASUK
    --------------------------------------------- */

    addSummaryItem(

        items,

        "🟢",

        "Masuk",

        summary.masuk

    );


    /* ---------------------------------------------
       ONTIME
    --------------------------------------------- */

    addSummaryItem(

        items,

        "✅",

        "Ontime",

        summary.ontime

    );


    /* ---------------------------------------------
       TELAT
    --------------------------------------------- */

    addSummaryItem(

        items,

        "🟠",

        "Telat",

        summary.telat

    );


    /* ---------------------------------------------
       TOTAL MENIT TELAT
    --------------------------------------------- */

    addSummaryItem(

        items,

        "⏱️",

        "Telat",

        summary.lateMinutes,

        "menit"

    );


    /* ---------------------------------------------
       IZIN TELAT
    --------------------------------------------- */

    addSummaryItem(

        items,

        "📝",

        "Izin Telat",

        summary.izinTelatHours,

        "jam"

    );


    /* ---------------------------------------------
       IZIN PULANG
    --------------------------------------------- */

    addSummaryItem(

        items,

        "🚪",

        "Izin Pulang",

        summary.izinPulangHours,

        "jam"

    );


    /* ---------------------------------------------
       CUTI
    --------------------------------------------- */

    addSummaryItem(

        items,

        "🏖️",

        "Cuti",

        summary.cuti

    );


    /* ---------------------------------------------
       SAKIT
    --------------------------------------------- */

    addSummaryItem(

        items,

        "🤒",

        "Sakit",

        summary.sakit

    );


    /* ---------------------------------------------
       LIBUR
    --------------------------------------------- */

    addSummaryItem(

        items,

        "📅",

        "Libur",

        summary.libur

    );


    /* ---------------------------------------------
       LEMBUR HARIAN
    --------------------------------------------- */

    addSummaryItem(

        items,

        "🔵",

        "Lembur",

        summary.lembur

    );


    /* ---------------------------------------------
       LEMBUR JAM
    --------------------------------------------- */

    addSummaryItem(

        items,

        "⏰",

        "Lembur",

        summary.lemburHours,

        "jam"

    );


    /* ---------------------------------------------
       ABSEN
    --------------------------------------------- */

    addSummaryItem(

        items,

        "❌",

        "Absen",

        summary.absen

    );


    /* =============================================
       EMPTY
    ============================================= */

    if(

        items.length === 0

    ){

        card.innerHTML =

        `

            <div class="attendance-empty">

                Belum ada data attendance bulan ini.

            </div>

        `;

        return;

    }


    /* =============================================
       PERIOD TEXT
    ============================================= */

    const periodText =

        `

        ${

            formatDate(

                monthStart

            )

        }

        -

        ${

            formatDate(

                monthEnd

            )

        }

        `;


    /* =============================================
       FINAL HTML
    ============================================= */

    card.innerHTML =

    `

        <div class="attendance-period">

            ${

                periodText

            }

        </div>


        <div class="attendance-grid">

            ${

                items.join("")

            }

        </div>

    `;

}


/* =====================================================
   CALCULATE ATTENDANCE SUMMARY
===================================================== */

function calculateAttendanceSummary(

    attendance

){

    const summary = {

        masuk : 0,

        ontime : 0,

        telat : 0,

        lateMinutes : 0,

        izinTelatHours : 0,

        izinPulangHours : 0,

        cuti : 0,

        sakit : 0,

        libur : 0,

        lembur : 0,

        lemburHours : 0,

        absen : 0

    };


    attendance.forEach(

        item => {

            /* -----------------------------------------
               STATUS
            ----------------------------------------- */

            switch(

                item.status

            ){

                case "masuk":

                    summary.masuk++;

                    break;


                case "cuti":

                    summary.cuti++;

                    break;


                case "sakit":

                    summary.sakit++;

                    break;


                case "libur":

                    summary.libur++;

                    break;


                case "lembur":

                    summary.lembur++;

                    break;


                case "absen":

                    summary.absen++;

                    break;

            }


            /* -----------------------------------------
               ATTENDANCE STATUS
            ----------------------------------------- */

            if(

                item.attendanceStatus ===

                "ontime"

            ){

                summary.ontime++;

            }


            if(

                item.attendanceStatus ===

                "telat"

            ){

                summary.telat++;

            }


            /* -----------------------------------------
               TELAT MENIT
            ----------------------------------------- */

            summary.lateMinutes +=

                toNumber(

                    item.lateMinutes

                );


            /* -----------------------------------------
               IZIN TELAT
            ----------------------------------------- */

            summary.izinTelatHours +=

                toNumber(

                    item.izinTelatHours

                );


            /* -----------------------------------------
               IZIN PULANG
            ----------------------------------------- */

            summary.izinPulangHours +=

                toNumber(

                    item.izinPulangHours

                );


            /* -----------------------------------------
               LEMBUR JAM
            ----------------------------------------- */

            summary.lemburHours +=

                toNumber(

                    item.overtimeHours

                );

        }

    );


    return summary;

}


/* =====================================================
   ADD SUMMARY ITEM
===================================================== */

function addSummaryItem(

    items,

    icon,

    label,

    value,

    unit = ""

){

    const number =

        toNumber(

            value

        );


    /*
       Nilai 0 tidak ditampilkan.
    */

    if(

        number <= 0

    ){

        return;

    }


    const displayValue =

        unit

        ?

        `${number} ${unit}`

        :

        number;


    items.push(

        `

        <div class="attendance-item">

            <span>

                ${icon}

                ${label}

            </span>

            <strong>

                ${displayValue}

            </strong>

        </div>

        `

    );

}


/* =====================================================
   HELPER : NUMBER
===================================================== */

function toNumber(

    value

){

    if(

        value ===

        null

        ||

        value ===

        undefined

        ||

        value ===

        ""

    ){

        return 0;

    }


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
   HELPER : CAPITALIZE
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
