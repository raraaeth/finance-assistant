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

    loginGoogle

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

    const isLogin = false;

    const login =

        document.getElementById(
            "pro-login-section"
        );

    const dashboard =

        document.getElementById(
            "pro-dashboard-section"
        );

    if(isLogin){

        login.classList.add(
            "hidden"
        );

        dashboard.classList.remove(
            "hidden"
        );

    }else{

        login.classList.remove(
            "hidden"
        );

        dashboard.classList.add(
            "hidden"
        );

    }

}
