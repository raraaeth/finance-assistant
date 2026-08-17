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

    Header

} from "../../components/header/script.js";


import {

    Profile

} from "../../components/profile/script.js";


import {

    rupiah

} from "../../js/utils.js";

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

            income : 0,

            expense : 0,

            balance : 0

        };


    card.innerHTML =

    `

        <div class="summary-total">

            <p>

                Saldo Saat Ini

            </p>


            <h2>

                ${

                    rupiah(

                        summary.balance

                    )

                }

            </h2>

        </div>

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
