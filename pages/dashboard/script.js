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

//==================================
// Import
//==================================

import {

    loadUser

} from "../../js/storage.js";


//==================================
// Constant
//==================================

const HERO_IMAGE =
    "../../assets/images/hero/hero-dashboard.png";


//==================================
// State
//==================================

const user =
    loadUser();


//==================================
// DOM
//==================================

const dashboard =

    document.getElementById(
        "dashboard"
    );


//==================================
// Component
//==================================

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

    id,

    icon,

    title,

    description

}){

    return `

        <article

            id="${id}"

            class="module-card"

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

function createSectionTitle(title){

    return `

        <h2 class="section-title">

            ${title}

        </h2>

    `;

}


//==================================
// Render
//==================================

function render(){

    dashboard.innerHTML = `

        ${createHero()}

        ${createSectionTitle(
            "Modul"
        )}

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

        </section>

        ${createSectionTitle(
            "Akun"
        )}

        <section class="modules">

            ${createModuleCard({

                id : "profile",

                icon : "👤",

                title : "Profile",

                description :
                    "Kelola akun dan pengaturan aplikasi."

            })}

        </section>

    `;

    bindModuleEvents();

}


//==================================
// Event
//==================================

function bindModuleEvents(){

    document

        .querySelectorAll(
            ".module-card"
        )

        .forEach(card => {

            card.addEventListener(

                "click",

                () => {

                    console.log(

                        card.id

                    );

                }

            );

        });

}


//==================================
// Init
//==================================

render();
