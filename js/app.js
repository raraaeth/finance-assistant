/**
 * ==============================================
 * Finance Assistant
 * Module      : App
 * File        : app.js
 * Version     : 2.0.0
 *
 * Description :
 * Landing Page Controller
 * ==============================================
 */


/* ==========================================
   IMPORT
========================================== */

import {

    loadUser

} from "./storage.js";


/* ==========================================
   START
========================================== */

const user =

    loadUser();


/* ==========================================
   BUTTON
========================================== */

const startButton =

    document.getElementById(

        "start-app"

    );

const registerButton =

    document.getElementById(

        "register-app"

    );


/* ==========================================
   OPEN APP
========================================== */

function openApp(){

    window.open(

        "https://play.google.com/store/apps/details?id=web.financeassistant.app",

        "_blank"

    );

}


/* ==========================================
   EVENT
========================================== */

startButton?.addEventListener(

    "click",

    openApp

);

registerButton?.addEventListener(

    "click",

    openApp

);
