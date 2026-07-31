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


/* ==============================================
   INIT
============================================== */

function init() {

    renderAppShell();

    loadPage("onboarding");
    
}

/* ==============================================
   APP SHELL
============================================== */

function renderAppShell() {

    const app = document.getElementById("app");

    app.innerHTML = `

        <div id="app-shell">

            <header id="app-header"></header>

            <main id="app-main"></main>

            <nav id="app-bottom-navigation"></nav>

        </div>

    `;

}

/* ==============================================
   PAGE LOADER
============================================== */

async function loadPage(page) {

    const main = document.getElementById("app-main");

    const response = await fetch(
        `pages/${page}/page.html`
    );

    const html = await response.text();

    main.innerHTML = html;

}

