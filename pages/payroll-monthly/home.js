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

    Header

} from "../../components/header/script.js";

import {

    Profile

} from "../../components/profile/script.js";


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

            "attendance-card"

        );


    if(

        !section

    ){

        return;

    }


    /*
       SKELETON

       Calculation attendance belum digunakan.
    */

    section.innerHTML =

    `

        <div class="summary-grid">

            <div class="summary-item">

                <span>

                    Masuk

                </span>

                <strong>

                    -

                </strong>

            </div>


            <div class="summary-item">

                <span>

                    Lembur

                </span>

                <strong>

                    -

                </strong>

            </div>


            <div class="summary-item">

                <span>

                    Cuti

                </span>

                <strong>

                    -

                </strong>

            </div>


            <div class="summary-item">

                <span>

                    Sakit

                </span>

                <strong>

                    -

                </strong>

            </div>


            <div class="summary-item">

                <span>

                    Absen

                </span>

                <strong>

                    -

                </strong>

            </div>


            <div class="summary-item">

                <span>

                    Libur Nasional

                </span>

                <strong>

                    -

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


