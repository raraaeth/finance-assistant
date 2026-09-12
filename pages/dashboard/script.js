/**
 * ==============================================
 * Finance Assistant
 * Module      : Dashboard
 * File        : script.js
 * Version     : 2.1.0
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


const DOCUMENTATION_URL =

    "https://financeassistant.web.id/docs/";


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

                    Pelajari cara kerja Finance Assistant

                    sebelum mulai menggunakannya.

                </p>

            </div>

            <img

                src="${HERO_IMAGE}"

                alt="Dashboard Hero"

            >

        </section>

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
   DOCUMENTATION CARD
========================================== */

function createDocumentationCard(){

    return `

        <section class="guide-card">

            <div class="guide-content">

                <h3>

                    📖 Baca Panduan Terlebih Dahulu

                </h3>

                <p>

                    Sebelum mulai menggunakan Finance Assistant,

                    sebaiknya baca panduan terlebih dahulu.

                    Beberapa fitur berkaitan dengan setting dan

                    konfigurasi workspace yang penting untuk

                    dipahami agar aplikasi dapat digunakan

                    dengan benar.

                </p>

                <a

                    href="${DOCUMENTATION_URL}"

                    class="guide-button"

                >

                    📖 Buka Dokumentasi

                </a>

            </div>

        </section>

    `;

}


/* ==========================================
   INSTALL CARD
========================================== */

function createInstallCard(){

    return `

        <section class="install-card">

            <h3>

                Semua sudah siap.

                Tinggal satu langkah lagi.

            </h3>

            <p>

                Install Finance Assistant ke perangkatmu

                agar dapat diakses lebih cepat dan

                memberikan pengalaman terbaik.

            </p>

            <button

                id="install-pwa"

                class="install-button"

                type="button">

                📲 Install Finance Assistant

            </button>

        </section>

    `;

}


/* ==========================================
   START CARD
========================================== */

function createStartCard(){

    return `

        <article

            id="app"

            class="module-card"

        >

            <div class="module-content">

                <h2>

                    🚀

                    Mulai Finance Assistant

                </h2>

                <p>

                    Masuk ke aplikasi Finance Assistant

                    dan mulai mengelola keuanganmu.

                </p>

            </div>

            <span class="module-arrow">

                →

            </span>

        </article>

    `;

}

/* ==========================================
   FOOTER
========================================== */
function createFooter(){
    return `
        <!-- ==========================================
             PUBLIC LINKS
        ========================================== -->

        <footer>

            <nav
                aria-label="Tautan informasi">

                <a
                    href="/privacy/">
                    Privacy Policy
                </a>

                <span>*</span>

                <a
                    href="/terms/">
                    Terms of Service
                </a>

                <span>*</span>

                <a
                    href="/docs/">
                    User Guide
                </a>

                <span>*</span>

                <a
                    href="/app/">
                    About App
                </a>

            </nav>

        </footer>
    `;
}


/* ==========================================
   RENDER
========================================== */

function render(){

    dashboard.innerHTML = `

        ${createHero()}


        ${createSectionTitle(

            "📚 Panduan"

        )}


        ${createDocumentationCard()}


        ${createSectionTitle(

            "📲 Install Finance Assistant"

        )}


        ${createInstallCard()}


        ${createSectionTitle(

            "🚀 Mulai"

        )}


        <section class="modules">

            ${createStartCard()}

        </section>

         ${createFooter()}
      

    `;


    bindModuleEvents();

}


/* ==========================================
   DOCUMENTATION
========================================== */

function openDocumentation(){

    window.location.href =

        DOCUMENTATION_URL;

}


/* ==========================================
   OPEN APP
========================================== */

function openApp(){

    /*
       Belum login
       atau onboarding belum selesai
       → masuk onboarding
    */

    if(

        !user

        ||

        !user.onboardingCompleted

    ){

        window.location.href =

            "../onboarding/";

        return;

    }


    /*
       Sudah login
       dan onboarding selesai
       → masuk aplikasi utama
    */

    window.location.href =

        "../index.html";

}


/* ==========================================
   EVENT
========================================== */

function bindModuleEvents(){

    const appCard =

        document.getElementById(

            "app"

        );


    if(

        appCard

    ){

        appCard.addEventListener(

            "click",

            openApp

        );

    }

}


/* ==========================================
   INIT
========================================== */

render();
