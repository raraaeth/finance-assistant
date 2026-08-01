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
// State
//==================================

const Profile = {

    session : null,

    user : null,

    workspace : [],

    settings : [],

    guides : []

};


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

    initData();

    renderProfile();

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

//==================================
// Data
//==================================

function initData(){

    const session = loadSession();

    if(!session){

        return;

    }

    Profile.session = session;

    Profile.user = {

        name :

            session.user?.name ??

            "Guest",

        email :

            session.user?.email ??

            "",

        photo :

            session.user?.picture ??

            ""

    };

}

//==================================
// Render
//==================================

function renderProfile(){

    renderHero();

}

//==================================
// Hero
//==================================

function renderHero(){

    const greeting =

        document.getElementById(
            "pro-user-greeting"
        );

    const name =

        document.getElementById(
            "pro-user-name"
        );

    const email =

        document.getElementById(
            "pro-user-email"
        );

    const photo =

        document.getElementById(
            "pro-user-photo"
        );

    greeting.textContent =

        getGreeting();

    name.textContent =

        Profile.user.name;

    email.textContent =

        Profile.user.email;

    photo.src =

        Profile.user.photo;

}

//==================================
// Greeting
//==================================

function getGreeting(){

    const hour = new Date().getHours();

    if(hour < 11){

        return "🌅 Selamat Pagi";

    }

    if(hour < 15){

        return "☀️ Selamat Siang";

    }

    if(hour < 18){

        return "🌇 Selamat Sore";

    }

    return "🌙 Selamat Malam";

}

//==================================
// Workspace
//==================================


//==================================
// Setting
//==================================


//==================================
// Sync
//==================================


//==================================
// Guide
//==================================


//==================================
// Logout
//==================================

