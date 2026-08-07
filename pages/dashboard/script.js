/**
 * ==============================================
 * Finance Assistant
 * Module      : Dashboard
 * File        : script.js
 * Version     : 2.0.0
 *
 * Description :
 * Dashboard Learning Center
 * ==============================================
 */


/* ==========================================
   IMPORT
========================================== */

import {

    loadUser

} from "../../js/storage.js";


/* ==========================================
   CONSTANT
========================================== */

const HERO_IMAGE =

    "../../assets/images/hero/hero-dashboard.png";


/* ==========================================
   STATE
========================================== */

const user =

    loadUser();


/* ==========================================
   DOM
========================================== */

const dashboard =

    document.getElementById(

        "dashboard"

    );


/* ==========================================
   COMPONENT
========================================== */

function createHero(){

    return `

        <section class="hero">

            <div class="hero-text">

                <span class="badge">

                    👋 Selamat Datang

                </span>

                <h1>

                    Halo,

                    ${

                        user?.displayName ??

                        "Guest"

                    }

                </h1>

                <p>

                    Workspace milikmu sudah siap digunakan.

                    Pelajari setiap modul terlebih dahulu

                    agar lebih memahami cara menggunakan

                    Finance Assistant.

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


function createSectionTitle(

    title

){

    return `

        <h2 class="section-title">

            ${title}

        </h2>

    `;

}

/* ==========================================
   RENDER
========================================== */

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

                    "Pelajari cara mengatur tabungan dan mencapai target keuangan."

            })}

            ${createModuleCard({

                id : "payroll",

                icon : "💼",

                title : "Payroll",

                description :

                    "Pelajari sistem absensi, payroll, dan penggajian."

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

                Install Finance Assistant ke perangkatmu agar dapat diakses lebih cepat dan memberikan pengalaman terbaik.

            </p>

            <button

                id="installApp"

                class="install-button"

            >

                📲 Install Finance Assistant

            </button>

        </section>

        ${createSectionTitle(

            "🚀 Mulai"

        )}

        <section class="modules">

            ${createModuleCard({

                id : "app",

                icon : "🚀",

                title : "Mulai Finance Assistant",

                description :

                    "Masuk ke aplikasi Finance Assistant dan mulai mengelola keuanganmu."

            })}

        </section>

    `;

    bindModuleEvents();

}

/* ==========================================
   NAVIGATION
========================================== */

function openFinancial(){

    alert(

        "Panduan Financial akan segera hadir."

    );

}

function openSaving(){

    alert(

        "Panduan Saving akan segera hadir."

    );

}

function openPayroll(){

    alert(

        "Panduan Payroll akan segera hadir."

    );

}

function openApp(){

    window.location.href =

        "../index.html";

}


/* ==========================================
   INSTALL APP
========================================== */

let deferredPrompt = null;

window.addEventListener(

    "beforeinstallprompt",

    event=>{

        event.preventDefault();

        deferredPrompt = event;

    }

);

async function installApp(){

    if(

        !deferredPrompt

    ){

        alert(

            "Install aplikasi belum tersedia pada perangkat ini."

        );

        return;

    }

    deferredPrompt.prompt();

    await deferredPrompt.userChoice;

    deferredPrompt = null;

}


/* ==========================================
   EVENT
========================================== */

function bindModuleEvents(){

    document

        .querySelectorAll(

            ".module-card"

        )

        .forEach(

            card=>{

                card.addEventListener(

                    "click",

                    ()=>{

                        switch(

                            card.id

                        ){

                            case "financial":

                                openFinancial();

                                break;

                            case "saving":

                                openSaving();

                                break;

                            case "payroll":

                                openPayroll();

                                break;

                            case "app":

                                openApp();

                                break;

                        }

                    }

                );

            }

        );

    const installButton =

        document.getElementById(

            "installApp"

        );

    if(

        installButton

    ){

        installButton.addEventListener(

            "click",

            installApp

        );

    }

}


/* ==========================================
   INIT
========================================== */

render();

