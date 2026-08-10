/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Home
   File        : home.js
   Version     : 1.0.0

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
       Render terlebih dahulu agar UI tidak
       bergantung pada proses data.
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

    }catch(error){

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

renderAttendance();

Statistics.init();       

    }catch(error){

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

       Belum mengambil nilai gaji dari
       Process.calculation.

       Kita pastikan dulu HTML dan Home
       berhasil berjalan.
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
       SHOW ATTENDANCE
    ============================================= */

    section.classList.remove(

        "hidden"

    );


    /* =============================================
       CURRENT MONTH
    ============================================= */

    const today =

        new Date();


    const monthStart =

        new Date(

            today.getFullYear(),

            today.getMonth(),

            1

        );


    const monthEnd =

        new Date(

            today.getFullYear(),

            today.getMonth() + 1,

            0

        );


    /* =============================================
       GET ATTENDANCE DATA
    ============================================= */

    const attendance =

        Process.attendance?.data;


    if(

        !attendance

    ){

        return;

    }


    /* =============================================
       FILTER CURRENT MONTH
    ============================================= */

    const periodAttendance =

        attendance.filter(

            item=>{

                const date =

                    new Date(

                        item.date

                    );

                return (

                    date >=

                    monthStart

                    &&

                    date <=

                    monthEnd

                );

            }

        );


    /* =============================================
       COUNT
    ============================================= */

    const summary = {

        masuk : 0,

        cuti : 0,

        lembur : 0

    };


    periodAttendance.forEach(

        item=>{

            switch(

                item.status

            ){

                case "masuk":

                    summary.masuk++;

                    break;


                case "cuti":

                    summary.cuti++;

                    break;


                case "lembur":

                    summary.lembur++;

                    break;

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

                    monthEnd

                )

            }

        </div>


        <div class="attendance-grid">


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


            <div class="attendance-item">

                <span>

                    🟡 Cuti

                </span>

                <strong>

                    ${

                        summary.cuti

                    }

                </strong>

            </div>


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

}


/* =====================================================
   HELPER
===================================================== */

function capitalize(

    text

){

    return text.replace(

        /\b\w/g,

        letter =>

            letter.toUpperCase()

    );

}


