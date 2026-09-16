/* =====================================================
   HOME
   FILE : home.js
   DESCRIPTION : Home Controller
   VERSION : 2.1.0
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

            "saving"

    });

    await API.load(

        CONFIG.data.saving,

        CONFIG.data.bank

    );

    Process.init(

        API.raw,

        API.data

    );

    Statistics.init();

    Summary.init();

    renderHero();

    renderSummary();

    renderInputSettingGuide();

    renderInput();

    renderEditInput();

    renderSetting();

    hideInputSettingHeaders();

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

        letter=>

            letter.toUpperCase()

    );

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

    document.getElementById(

        "hero-title"

    ).innerHTML =

        `Halo, ${name} 👋`;

    document.getElementById(

        "hero-description"

    ).textContent =

        CONFIG.hero.description;

    document.getElementById(

        "hero-banner"

    ).src =

        CONFIG.hero.image;

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

            <p>

                Total Saldo

            </p>

            <h2

    id="summary-total-value"

>

</h2>

        </div>

        <div class="summary-grid">

            <div class="summary-item">

                <span>

                    Masuk Minggu Ini

                </span>

                <strong>

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

                    Keluar Minggu Ini

                </span>

                <strong>

                    ${

                        shortRupiah(

                            Process.summary

                            .weeklyExpense

                        )

                    }

                </strong>

            </div>

        </div>

    `;

   Animation.number(

    document.getElementById(

        "summary-total-value"

    ),

    Process.summary

    .totalBalance,

    rupiah

);

}

/* =====================================================
   RENDER INPUT & PENGATURAN GUIDE
===================================================== */

function renderInputSettingGuide(){

    const inputSection =
        document.getElementById(
            "input"
        );

    if(
        !inputSection
    ){

        return;

    }

    /* Hindari render ganda */

    if(
        document.getElementById(
            "input-setting-guide"
        )
    ){

        return;

    }

    inputSection.insertAdjacentHTML(
        "beforebegin",
        `
        <section
            id="input-setting-guide"
            class="section">

            <div class="section-header">

                <span class="section-badge">
                    ✍️ Input & Pengaturan
                </span>

            </div>

            <p class="input-setting-guide-text">

                Untuk mempelajari cara menggunakan
                Input dan Pengaturan pada workspace ini,
                silakan baca
                <a
                    href="/docs/"
                    class="input-setting-guide-link">

                    panduan Finance Assistant

                </a>.

            </p>

        </section>
        `
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
            id="saving-input-menu"
            class="profile-menu-item">


            <div
                class="profile-menu-left">


                <div
                    class="profile-menu-icon">

                    💰

                </div>


                <div
                    class="profile-menu-content">


                    <span
                        class="profile-menu-title">

                        Input

                    </span>


                    <span
                        class="profile-menu-description">

                        Tambahkan transaksi Saving

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

            "saving-input-menu"

        );


    if(

        menu

    ){

        menu.addEventListener(

            "click",

            () => {

                Input.open(

                    "saving"

                );

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
            id="saving-edit-row-menu"
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
            "saving-edit-row-menu"
        );

    if(rowMenu){

        rowMenu.addEventListener(
            "click",
            () => {

                Input.openEdit(
                    "saving",
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
            id="saving-setting-menu"
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

                        Atur rekening dan tempat penyimpanan Saving

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

            "saving-setting-menu"

        );


    if(

        menu

    ){

        menu.addEventListener(

            "click",

            () => {

                Setting.open(

                    "saving"

                );

            }

        );

    }

}

/* =====================================================
   HIDE INPUT / EDIT / SETTING SECTION HEADERS
===================================================== */

function hideInputSettingHeaders(){

    const sections = [
        "input",
        "edit-input",
        "setting"
    ];

    sections.forEach(
        id => {

            const section =
                document.getElementById(
                    id
                );

            if(
                !section
            ){

                return;

            }

            const header =
                section.querySelector(
                    ".section-header"
                );

            if(
                header
            ){

                header.classList.add(
                    "hidden"
                );

            }

        }
    );

}
