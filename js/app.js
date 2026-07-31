/**
 * ==============================================
 * Finance Assistant
 * Module      : App
 * File        : app.js
 * Version     : 2.0.0
 *
 * Description :
 * Entry Point Finance Assistant
 * ==============================================
 */

import { loadUser } from "./storage.js";

document.addEventListener("DOMContentLoaded", init);

function init() {

    const user = loadUser();

    if (user?.onboardingCompleted) {

        loadPage("dashboard");

    } else {

        loadPage("onboarding");

    }

}

function loadPage(page) {

    const frame = document.getElementById("app-frame");

    frame.src = `pages/${page}/page.html`;

}
