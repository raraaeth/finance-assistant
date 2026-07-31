/**
 * ==============================================
 * Finance Assistant
 * Module      : Dashboard
 * File        : script.js
 * Version     : 1.0.0
 *
 * Description :
 * Dashboard Platform
 * ==============================================
 */

import { loadUser }

from "../../js/storage.js";

const user = loadUser();

const dashboard =

    document.getElementById(
        "dashboard"
    );

render();


function render(){

    dashboard.innerHTML = `

        <h1>

            Halo,

            ${user?.displayName ?? "Guest"}

            👋

        </h1>

        <br>

        <p>

            Selamat datang di

            Finance Assistant

        </p>

    `;

}
