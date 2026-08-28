/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Home
   File        : home.js
   Version     : 2.1.0

   Description :
   Payroll Daily Home Controller

   Responsibility :
   - Menjadi controller utama Payroll Daily
   - Load API
   - Menjalankan Process
   - Menjalankan Summary
   - Menjalankan Statistics
   - Menampilkan Home

   IMPORTANT :
   Home tidak menghitung payroll.
   Semua angka payroll dan ringkasan
   dibaca dari Summary.
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
       HOME MENU
    ============================================= */

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

        CONFIG.sheet.daily,

        CONFIG.sheet.rules

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
   DEBUG API
============================================= */

console.log(
    "===== PAYROLL DAILY RAW FIRST =====",
    API.raw?.[0]
);


console.log(
    "===== PAYROLL DAILY RAW KEYS =====",
    API.raw?.[0]
        ?
        Object.keys(
            API.raw[0]
        )
        :
        []
);


console.log(
    "===== PAYROLL DAILY DATA =====",
    API.data
);


console.log(
    "===== PAYROLL DAILY DATA FIRST =====",
    API.data?.[0]
);


console.log(
    "===== PAYROLL DAILY DATA KEYS =====",
    API.data?.[0]
        ?
        Object.keys(
            API.data[0]
        )
        :
        []
);


    /* =============================================
       PROCESS
    ============================================= */

    try{

        Process.init(

            API.raw,

            API.data

        );


        /* =========================================
           SUMMARY

           Summary menghitung seluruh data
           yang dibutuhkan Home.
        ========================================= */

        Summary.init();


        /* =========================================
           STATISTICS

           Statistics tetap dijalankan di sini
           karena home.js adalah controller utama.
        ========================================= */

        Statistics.init();


        /* =========================================
           HOME

           Home hanya membaca hasil Summary.
        ========================================= */

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
       SEMUA DATA HOME DARI SUMMARY
    ============================================= */

    const summary =

        Summary.current;


    if(

        !summary

    ){

        card.innerHTML = `

            <div class="summary-payroll-empty">

                Data gaji belum tersedia.

            </div>

        `;

        return;

    }


    /* =============================================
       PAYROLL
    ============================================= */

    const period =

        summary.period ?? null;


    const netSalary =

        Number(

            summary.net ?? 0

        );


    /* =============================================
       HOME DATA

       Tidak ada perhitungan Process.data
       di sini.
    ============================================= */

    const home =

        summary.home ?? {};


    const todayIncome =

        Number(

            home.todayIncome ?? 0

        );


    const weekIncome =

        Number(

            home.weekIncome ?? 0

        );


    /* =============================================
       RENDER
    ============================================= */

    card.innerHTML = `

        <!-- =========================================
             PAYROLL
        ========================================== -->

        <div class="home-payroll-title">

            Estimasi Gaji Periode Ini

        </div>


        <div class="home-payroll-period">

            ${

                period

                    ?

                    formatDate(

                        period.start

                    )

                    +

                    " - "

                    +

                    formatDate(

                        period.end

                    )

                    :

                    "Periode tidak tersedia"

            }

        </div>


        <div class="home-payroll-salary">

            ${

                rupiah(

                    netSalary

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

                            weekIncome

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

                            todayIncome

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

            netSalary,

            value =>

                rupiah(

                    value

                )

        );

    }

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

                        Tambahkan data Payroll Daily

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

                    "payroll-daily"

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

                        Atur rule dan konfigurasi Payroll Daily

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

                    "payroll-daily"

                );

            }

        );

    }

} 
