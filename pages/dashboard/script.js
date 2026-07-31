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

function createModuleCard({

    icon,

    title,

    description,

    id

}){

    return `

        <article

            class="module-card"

            id="${id}"

        >

            <div class="module-content">

                <h2>

                    ${icon}

                    ${title}

                </h2>

                <p>

                    ${description}

                </p>

            </div>

            <span class="module-arrow">

                →

            </span>

        </article>

    `;

}


function render(){

    dashboard.innerHTML = `

        ${createHero()}

        <section class="modules">

            ${createModuleCard({

                id : "financial",

                icon : "💰",

                title : "Financial",

                description :
                    "Kelola pemasukan, pengeluaran, dan laporan."

            })}

            ${createModuleCard({

                id : "saving",

                icon : "🏦",

                title : "Saving",

                description :
                    "Pantau tabungan dan target keuangan."

            })}

            ${createModuleCard({

                id : "payroll",

                icon : "💼",

                title : "Payroll",

                description :
                    "Kelola absensi dan perhitungan gaji."

            })}

            ${createModuleCard({

                id : "profile",

                icon : "👤",

                title : "Profile",

                description :
                    "Kelola akun dan pengaturan aplikasi."

            })}

        </section>

    `;

}


