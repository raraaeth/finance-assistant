/* =====================================================
   HOME
   FILE : home.js
   DESCRIPTION : Home Controller
   VERSION : 3.0.0
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

    rupiah,

    shortRupiah

} from "../../js/utils.js";

import {

    Animation

} from "../../js/animation.js";

import {

    Input

} from "../../components/input/script.js";

import {

    Setting

} from "../../components/setting/script.js";

/* =====================================================
   INIT DATA
===================================================== */

const user =

    loadUser();


/* =====================================================
   INIT
===================================================== */

export async function init(){

    await Header.render({

        container :

            "#header-container",

        theme :

            "kas"

    });

   /* =============================================
       INPUT
    ============================================= */

    await Input.init();

   /* =============================================
       LOAD DATA
    ============================================= */

    await API.load(

    CONFIG.data.transaction,

    CONFIG.data.member

);
   console.log(
    "===== KAS RAW FIRST =====",
    API.raw[0]
);

console.log(
    "===== KAS RAW KEYS =====",
    Object.keys(
        API.raw[0] || {}
    )
);

console.log(
    "===== KAS MEMBER FIRST =====",
    API.data[0]
);

console.log(
    "===== KAS MEMBER KEYS =====",
    Object.keys(
        API.data[0] || {}
    )
);

    Process.init(

        API.raw,

        API.data

    );

    Statistics.init();

    Summary.init();

    renderHero();

    renderSummary();

    renderInput();

    renderEditInput();

    renderSetting();

    /* =============================================
       PROFILE
    ============================================= */

    await Profile.render({

        container :

            "#profile-page"

    });

}


/* =====================================================
   HOME
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


/* =====================================================
   HERO
===================================================== */

function renderHero(){

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

    const name =

        capitalize(

            user?.displayName ??

            "Guest"

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

    card.innerHTML =

    `

        <div class="summary-total">

            <p id="summary-label">

                Total Saldo Kas

            </p>

            <h2 id="summary-total">

            </h2>

        </div>

        <div class="summary-grid">

            <div class="summary-item">

                <span>

                    Pemasukan Minggu Ini

                </span>

                <strong id="summary-weekly-income">

                    ${

                        shortRupiah(

                            Process.summary

                            .weeklyIncome

                        )

                    }

                </strong>

            </div>

            <div class="summary-item">

                <span>

                    Pemasukan Bulan Ini

                </span>

                <strong id="summary-monthly-income">

    ${

        shortRupiah(

            Process.summary

                .monthlyIncome

        )

    }

</strong>

            </div>

        </div>

    `;


    /* ==========================================
       TOTAL SALDO ANIMATION
    ========================================== */

    Animation.number(

        document.getElementById(

            "summary-total"

        ),

        Process.summary.totalBalance,

        rupiah,

        1800

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
            id="kas-input-menu"
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

                        Input

                    </span>


                    <span
                        class="profile-menu-description">

                        Tambahkan transaksi Kas

                    </span>


                </div>

            </div>


            <div
                class="profile-menu-arrow">

                ›

            </div>


        </div>

    `;


    /* =============================================
       OPEN GLOBAL INPUT
    ============================================= */

    const menu =

        document.getElementById(

            "kas-input-menu"

        );


    if(

        menu

    ){

        menu.addEventListener(

            "click",

            ()=>{

                Input.open("kas");
            }

        );

    }

}

/* =====================================================
   EDIT INPUT
===================================================== */

function renderEditInput(){

    const card =
        document.getElementById(
            "edit-input-card"
        );

    if(!card){
        return;
    }

    card.innerHTML = `

        <div
            id="workspace-edit-row-menu"
            class="profile-menu-item">

            <div class="profile-menu-left">

                <div class="profile-menu-icon">
                    ✏️
                </div>

                <div class="profile-menu-content">

                    <span class="profile-menu-title">
                        Edit Input Row
                    </span>

                    <span class="profile-menu-description">
                        Edit data yang sudah tersimpan
                    </span>

                </div>

            </div>

            <div class="profile-menu-arrow">
                ›
            </div>

        </div>

    `;

    const rowMenu =
        document.getElementById(
            "workspace-edit-row-menu"
        );

    if(rowMenu){

        rowMenu.addEventListener(
            "click",
            () => {

                Input.openEdit(
                    "kas",
                    "row"
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
            id="kas-setting-menu"
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

                        Pengaturan

                    </span>


                    <span
                        class="profile-menu-description">

                        Atur konfigurasi Kas

                    </span>


                </div>

            </div>


            <div
                class="profile-menu-arrow">

                ›

            </div>


        </div>

    `;


    /* =============================================
       OPEN GLOBAL SETTING
    ============================================= */

    const menu =

        document.getElementById(

            "kas-setting-menu"

        );


    if(

        menu

    ){

        menu.addEventListener(

            "click",

            () => {

                Setting.open(

                    "kas"

                );

            }

        );

    }

}

