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

    Workspace milikmu sudah siap digunakan.
    Sekarang pelajari setiap modul agar kamu
    memahami cara menggunakan aplikasi
    sebelum mulai mencatat keuangan.

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
    "📚 Panduan Memulai"
)}

        <section class="modules">

            ${createModuleCard({

                id : "financial",

                icon : "💰",

                title : "Financial",

                description :
    "Pelajari cara mengelola pemasukan, pengeluaran, dan laporan keuangan."

            })}

            ${createModuleCard({

                id : "saving",

                icon : "🏦",

                title : "Saving",

                description :
    "Pahami cara mengatur tabungan dan mencapai target keuanganmu."

            })}

            ${createModuleCard({

                id : "payroll",

                icon : "💼",

                title : "Payroll",

                description :
    "Pelajari sistem absensi dan pengelolaan gaji pribadi dan tahu besaran gaji sejak dini."
            })}

        </section>
        
       ${createSectionTitle(
    "📲 Install Finance Assistant"
)}

<section class="install-card">

    <h3>

        Semua sudah siap.
        Tinggal satu langkah lagi.

    </h3>

    <p>

        Install Finance Assistant ke perangkatmu agar dapat diakses lebih cepat dan memberikan pengalaman terbaik dalam mengelola keuanganmu setiap hari.
    </p>

    <button

        id="installApp"

        class="install-button"

    >

        📲 Install Finance Assistant

    </button>

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
// Navigation
//==================================

function openFinancial(){

    window.location.href =
        "../financial/";

}

function openSaving(){

    window.location.href =
        "../saving/";

}

function openPayroll(){

    window.location.href =
        "../payroll/";

}

function openProfile(){

    window.location.href =
        "../profile/";

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

                    switch(card.id){

                        case "financial":

                            openFinancial();

                            break;

                        case "saving":

                            openSaving();

                            break;

                        case "payroll":

                            openPayroll();

                            break;

                        case "profile":

                            openProfile();

                            break;

                    }

                }

            );

        });

}


//==================================
// Init
//==================================

render();
