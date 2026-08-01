/**
 * ==================================================
 * Finance Assistant
 * Module      : Profile
 * File        : main.js
 * Version     : 2.0.0
 *
 * Description :
 * Profile & Account Center
 *
 * Features :
 * - Google Authentication
 * - User Profile
 * - Workspace
 * - Application Settings
 * - Synchronization
 * - Logout
 * ==================================================
 */


//==================================
// Import
//==================================

import {

    loginGoogle,

    loadSession,

    logout

} from "../../../js/auth.js";


//==================================
// Initialize
//==================================

document.addEventListener(

    "DOMContentLoaded",

    init

);

function init(){

    initEvents();

    initProfile();

}


//==================================
// Event
//==================================

function initEvents(){

    document

        .getElementById(
            "pro-google-login-button"
        )

        .addEventListener(

            "click",

            onGoogleLogin

        );

}


//==================================
// Google Login
//==================================

async function onGoogleLogin(){

    const button =

        document.getElementById(
            "pro-google-login-button"
        );

    button.classList.add(
        "loading"
    );

    button.disabled = true;

    button.innerHTML = `

        <div class="spinner"></div>

        <span>

            Menyiapkan Workspace...

        </span>

    `;

    await loginGoogle();

}


//==================================
// Profile
//==================================

function initProfile(){

    const session = loadSession();

    const loginSection =

        document.getElementById(
            "pro-login-section"
        );

    const dashboardSection =

        document.getElementById(
            "pro-dashboard-section"
        );

    if(session){

        loginSection.classList.add(
            "hidden"
        );

        dashboardSection.classList.remove(
            "hidden"
        );

        console.log(

            "Profile Mode : Login",

            session

        );

        return;

    }

    loginSection.classList.remove(
        "hidden"
    );

    dashboardSection.classList.add(
        "hidden"
    );

    console.log(

        "Profile Mode : Guest"

    );

}


