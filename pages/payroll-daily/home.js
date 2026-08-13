/* =====================================================
   Finance Assistant
   Page        : Payroll Daily
   Module      : Home
   File        : home.js
   Version     : 1.1.0

   Description :
   Payroll Daily Home Controller

   Sections :
   - Import
   - State
   - Init
   - Hero
   - Summary
   - Statistics
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

    Summary

} from "./summary.js";


import {

    Statistics

} from "./statistics.js";


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
    ============================================= */

    renderHero();


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

            CONFIG.api.daily,

            CONFIG.api.rules

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
       PROCESS
    ============================================= */

    try{

        Process.init(

            API.raw,

            API.data

        );


        /* -----------------------------------------
           SUMMARY
        ----------------------------------------- */

        Summary.init();


        /* -----------------------------------------
           STATISTICS
        ----------------------------------------- */

        Statistics.init();

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


    if(title){

        title.innerHTML =

            `Halo, ${name} 👋`;

    }


    if(description){

        description.textContent =

            CONFIG.hero.description;

    }


    if(banner){

        banner.src =

            CONFIG.hero.image;

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
