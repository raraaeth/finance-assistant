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

} from "../../shared/js/process.js";


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


/* =====================================================
   INIT APP
===================================================== */

function init(){

    renderHero();

}


/* =====================================================
   HERO
===================================================== */

function renderHero(){

    document.getElementById(

        "hero-badge"

    ).textContent =

        CONFIG.hero.badge;


    document.getElementById(

        "hero-title"

    ).textContent =

        `Halo, ${user?.displayName ?? "Guest"} 👋`;


    document.getElementById(

        "hero-description"

    ).textContent =

        CONFIG.hero.description;

}
