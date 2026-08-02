/* ==========================================
   IMPORT
========================================== */

import {

    loadUser

} from "../../../js/storage.js";


/* ==========================================
   INIT DATA
========================================== */

const user = loadUser();


/* ==========================================
   INIT
========================================== */

document.addEventListener(

    "DOMContentLoaded",

    init

);


/* ==========================================
   INIT APP
========================================== */

function init(){

    renderHero();

}


/* ==========================================
   HERO
========================================== */

function renderHero(){

    document.getElementById(

        "hero-title"

    ).textContent =

        `Halo, ${user?.displayName ?? "Guest"} 👋`;


    document.getElementById(

        "hero-description"

    ).textContent =

        "Wujudkan tujuan keuanganmu sedikit demi sedikit.";

}
