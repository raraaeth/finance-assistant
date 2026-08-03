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

import {

    rupiah

} from "../../../../js/utils.js";


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


    Process.init(

        API.raw,

        API.bank

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

    document.getElementById(

        "summary-total"

    ).textContent =

        rupiah(

            Process.summary

            .totalBalance

        );

    document.getElementById(

        "summary-change"

    ).textContent =

        `${

            Process.summary

            .totalTransaction

        } Transaksi`;

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


