/* =====================================================
   HOME
   FILE : home.js
   DESCRIPTION : Home Controller
   VERSION : 1.0.0
===================================================== */

/* =====================================================
   IMPORT
===================================================== */

import {

    loadUser

} from "../../../../js/storage.js";

import {

    CONFIG

} from "../../shared/js/config.js";

import {

    API

} from "../../shared/js/api.js";

import {

    Process

} from "./process.js";

import {

    Header

} from

"../../../../components/header/script.js";

import {

    Profile

} from

"../../../../components/profile/script.js";


/* =====================================================
   INIT DATA
===================================================== */

const user = loadUser();


/* =====================================================
   INIT
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    init

);

async function init(){

    await Header.render({

        container :

            "#header-container",

        theme :

            "saving"

    });

    await API.load(

        CONFIG.api.saving,

        CONFIG.api.bank

    );

   console.log(

    "CONFIG",

    CONFIG

);

console.log(

    "API",

    API

);

   

    Process.init(

        API.raw,

        API.bank

    );

   console.log(

    "PROCESS",

    Process

);

   

    renderHero();

    renderSummary();

    renderSaving();

    await Profile.render({

        container :

            "#profile-page",

        app :

            "saving"

    });

}


/* =====================================================
   HOME
===================================================== */

function capitalize(text){

    return text.replace(

        /\b\w/g,

        letter => letter.toUpperCase()

    );

}

/* =====================================================
   HERO
===================================================== */

function renderHero(){

    const name = capitalize(

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

}

/* =====================================================
   SUMMARY
===================================================== */

function renderSummary(){

    console.log(

        Process.summary

    );

}

/* =====================================================
   SAVING
===================================================== */

function renderSaving(){

    document.getElementById(

        "saving-list"

    ).innerHTML =

    `

        <div class="saving-item">

            <span class="saving-name">

                🏦 Mandiri

            </span>

            <span class="saving-balance">

                Rp0

            </span>

        </div>

        <div class="saving-item">

            <span class="saving-name">

                🏦 SeaBank

            </span>

            <span class="saving-balance">

                Rp0

            </span>

        </div>

        <div class="saving-item">

            <span class="saving-name">

                🏦 DANA

            </span>

            <span class="saving-balance">

                Rp0

            </span>

        </div>

    `;

}


