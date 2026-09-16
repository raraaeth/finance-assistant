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


const APK_URL =

    "../../assets/download/app-release.apk";


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
   APK DOWNLOAD CARD
========================================== */

function createApkCard(){

    return `

        <section class="install-card">

            <h3>

                Download Finance Assistant

            </h3>

            <p>

                Gunakan aplikasi Android Finance Assistant

                langsung dari perangkatmu untuk pengalaman

                yang lebih praktis.

            </p>

            <button

                id="download-apk"

                class="install-button"

                type="button">

                📱 Download APK

            </button>

        </section>

    `;

}


/* ==========================================
   PWA INSTALL CARD
========================================== */

function createInstallCard(){

    return `

        <section class="install-card">

            <h3>

                Install Finance Assistant

            </h3>

            <p>

                Tambahkan Finance Assistant ke homescreen

                perangkatmu agar dapat diakses lebih cepat

                seperti aplikasi.

            </p>

            <button

                id="install-pwa"

                class="install-button"

                type="button">

                📲 Tambahkan ke Homescreen

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

                    Daftar/Masuk ke aplikasi Finance Assistant

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

        <footer class="site-footer">

            <div class="site-footer-divider"></div>


            <div class="site-footer-content">


                <!-- BRAND -->

                <div class="site-footer-brand">

                    <strong>
                        Finance Assistant
                    </strong>

                    <span>
                        Create with Love ❤️
                    </span>

                </div>


                <!-- NAVIGATION -->

                <nav
                    class="site-footer-nav"
                    aria-label="Footer Navigation"
                >

                    <a href="/app/">
                        About App
                    </a>

                    <a href="/docs/">
                        User Guide
                    </a>

                    <a href="/news/">
                        News and Update
                    </a>

                    <a href="/contact/">
                        Contact dan Feedback
                    </a>

                    <a href="/privacy/">
                        Privacy Policy
                    </a>

                </nav>


                <!-- COPYRIGHT -->

                <div class="site-footer-bottom">

                    <p>
                        © 2026 Finance Assistant. All rights reserved.
                    </p>

                    <a href="/terms/">
                        Terms of Services
                    </a>

                </div>


            </div>

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

            "📱 Install Finance Assistant"

        )}


        ${createApkCard()}


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
   DOWNLOAD APK
========================================== */

function downloadAPK(){

    const link =

        document.createElement(

            "a"

        );


    link.href =

        APK_URL;


    link.download =

        "app-release.apk";


    document.body.appendChild(

        link

    );


    link.click();


    link.remove();

}


/* ==========================================
   OPEN APP
========================================== */

function openApp(){

    /*
       Jika user sudah memiliki nama akun
       ATAU onboarding sudah pernah selesai,
       langsung masuk Homepage.
    */

    if(

        user?.displayName

        ||

        user?.onboardingCompleted === true

    ){

        window.location.href =

            "../index.html";

        return;

    }


    /*
       Tidak memiliki nama akun
       dan belum pernah menyelesaikan onboarding
       → masuk onboarding.
    */

    window.location.href =

        "../onboarding/";

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


    const apkButton =

        document.getElementById(

            "download-apk"

        );


    if(

        apkButton

    ){

        apkButton.addEventListener(

            "click",

            downloadAPK

        );

    }

}


/* ==========================================
   INIT
========================================== */

render();
