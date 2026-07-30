/**
 * ==================================================
 * Finance Assistant
 * Module      : Onboarding
 * File        : script.js
 * Version     : 1.0.0
 *
 * Description :
 * Onboarding Wizard Controller
 * ==================================================
 */


//==================================
// State
//==================================

let currentStep = 0;

const onboardingData = {

    displayName : "",

    currency    : "IDR",

    theme       : "system"

};


//==================================
// DOM
//==================================

const onboarding =
document.getElementById(
    "onboarding"
);


//==================================
// Step
//==================================

const steps = [

    renderWelcome,

    renderDisplayName,

    renderCurrency,

    renderTheme

];


//==================================
// Navigation
//==================================

function nextStep(){

    if(currentStep >= steps.length-1)
        return;

    currentStep++;

    render();

}

function previousStep(){

    if(currentStep <= 0)
        return;

    currentStep--;

    render();

}


//==================================
// Render
//==================================

function render(){

    onboarding.innerHTML = "";

    steps[currentStep]();

}


//==================================
// Component
//==================================

function renderProgress(){

    return `

        <div class="progress">

            ${
                steps.map((_,index)=>`

                    <span class="${
                        index===currentStep
                        ? "active"
                        : ""
                    }"></span>

                `).join("")
            }

        </div>

    `;

}


//==================================
// Welcome
//==================================

function renderWelcome(){

    onboarding.innerHTML = `

        ${renderProgress()}

        <div class="illustration fade">

            <img
                src="../../assets/images/hero/hero-dashboard.png"
                alt="Finance Assistant">

        </div>

        <section class="content fade">

            <span class="badge">

                👋 Selamat Datang

            </span>

            <h1>

                Finance Assistant

            </h1>

            <p>

                Halo!

                Aku akan membantumu
                mengelola keuangan
                dengan lebih mudah.

            </p>

        </section>

        <footer class="footer">

            <button
                class="button"
                id="btnNext">

                Mulai

            </button>

        </footer>

    `;

    document
        .getElementById("btnNext")
        .addEventListener(
            "click",
            nextStep
        );

}


//==================================
// Display Name
//==================================

function renderDisplayName(){

    onboarding.innerHTML = `

        ${renderProgress()}

        <section class="content fade">

            <span class="badge">

                👤 Nama

            </span>

            <h1>

                Aku akan memanggilmu siapa?

            </h1>

            <p>

                Nama panggilan ini akan
                digunakan di seluruh aplikasi.

            </p>

        </section>

    `;

}


//==================================
// Currency
//==================================

function renderCurrency(){

    onboarding.innerHTML = `

        ${renderProgress()}

        <section class="content fade">

            <h1>

                Currency

            </h1>

        </section>

    `;

}


//==================================
// Theme
//==================================

function renderTheme(){

    onboarding.innerHTML = `

        ${renderProgress()}

        <section class="content fade">

            <h1>

                Theme

            </h1>

        </section>

    `;

}


//==================================
// Init
//==================================

render();
