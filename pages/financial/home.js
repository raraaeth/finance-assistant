/* =====================================================
   Finance Assistant
   Page        : Financial
   Module      : Home
   File        : home.js
   Version     : 1.0.0

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

            "financial"

    });


    /* =============================================
       HERO
    ============================================= */

    renderHero();


    /* =============================================
       SUMMARY
    ============================================= */

    renderSummary();


    /* =============================================
       INPUT
    ============================================= */

    renderInput();


    /* =============================================
       SETTING
    ============================================= */

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


    card.innerHTML =

    `

        <div class="summary-total">

            <p>

                Ringkasan Keuangan

            </p>

            <h2>

                -

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

        <div class="summary-total">

            <p>

                Input

            </p>

            <h2>

                -

            </h2>

        </div>

    `;

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

        <div class="summary-total">

            <p>

                Pengaturan

            </p>

            <h2>

                -

            </h2>

        </div>

    `;

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
