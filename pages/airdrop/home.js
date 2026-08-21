/* =====================================================
   Finance Assistant
   Page        : Airdrop
   Module      : Home
   File        : home.js
   Version     : 1.0.0

   Description :
   Airdrop Home Controller
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

            "airdrop"

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

            CONFIG.home.description;

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

        <div class="airdrop-home-welcome">

            <div class="airdrop-home-icon">

                🎁

            </div>


            <div>

                <strong>

                    Airdrop Workspace

                </strong>


                <p>

                    Pantau campaign, airdrop,

                    dan reward kamu.

                </p>

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

    return String(

        text

    ).replace(

        /\b\w/g,

        letter =>

            letter.toUpperCase()

    );

}
