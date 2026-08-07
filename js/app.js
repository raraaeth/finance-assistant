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

    if(

        user?.onboardingCompleted

    ){

        location.href =

            "pages/dashboard/";

        return;

    }

    location.href =

        "pages/onboarding/";

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
