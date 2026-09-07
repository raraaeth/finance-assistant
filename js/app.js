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

    location.href =

        "pages/dashboard/";

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
