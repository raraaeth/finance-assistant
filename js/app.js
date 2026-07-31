/**
 * ==============================================
 * Finance Assistant
 * Module      : App
 * File        : app.js
 * ==============================================
 */

import { loadUser } from "./storage.js";

document.addEventListener("DOMContentLoaded", init);


/* ==============================================
   INIT
============================================== */

function init() {

    renderApp();

}


/* ==============================================
   APP
============================================== */

function renderApp() {

    document.getElementById("app").innerHTML = `

        <iframe
            id="app-frame"
            frameborder="0">
        </iframe>

    `;

    const user = loadUser();

    if (user?.onboardingCompleted) {

        loadPage("dashboard");

    } else {

        loadPage("onboarding");

    }

}


/* ==============================================
   PAGE
============================================== */

function loadPage(page) {

    const frame = document.getElementById("app-frame");

    frame.src = `pages/${page}/page.html`;

}
