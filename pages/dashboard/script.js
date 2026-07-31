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

const HERO_IMAGE =
    "../../assets/images/hero/hero-dashboard.png";

import { loadUser }

from "../../js/storage.js";

const user = loadUser();

const dashboard =

    document.getElementById(
        "dashboard"
    );

render();

function createHero(){

    return `

        <section class="hero">

            <div class="hero-text">

                <span class="badge">

                    👋 Selamat Datang

                </span>

                <h1>

                    Halo,

                    ${user?.displayName ?? "Guest"}

                </h1>

                <p>

                    Kelola keuanganmu
                    dengan lebih mudah
                    bersama Finance Assistant.

                </p>

            </div>

            <img

                src="${HERO_IMAGE}"

                alt="Dashboard Hero"

            >

        </section>

    `;

}


function render(){

    dashboard.innerHTML = `

        ${createHero()}

    `;

}
