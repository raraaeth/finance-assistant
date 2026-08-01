/**
 * ==================================================
 * Finance Assistant
 * Module      : Onboarding
 * File        : script.js
 * Version     : 1.0.0
 *
 * Description :
 * Mengatur seluruh proses Onboarding Wizard.
 * ==================================================
 */

import { saveUser } from "../../js/storage.js";

//==================================
// Constant
//==================================

const HERO_IMAGE =
    "../../assets/images/hero/hero-dashboard.png";


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

    renderTheme,

    renderGoogleLogin

];


//==================================
// Navigation
//==================================

function nextStep(){

    if(currentStep >= steps.length - 1)
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

function createProgress(){

    return `

        <div class="progress">

            ${steps.map((_, index) => `

                <span class="${
                    index === currentStep
                    ? "active"
                    : ""
                }"></span>

            `).join("")}

        </div>

    `;

}


function createIllustration(image = HERO_IMAGE){

    return `

        <div class="illustration fade">

            <img
                src="${image}"
                alt="Finance Assistant">

        </div>

    `;

}


function createBadge(icon, text){

    return `

        <span class="badge">

            ${icon}

            ${text}

        </span>

    `;

}


function createTitle(text){

    return `

        <h1>

            ${text}

        </h1>

    `;

}


function createDescription(text){

    return `

        <p>

            ${text}

        </p>

    `;

}

function createInput({

    id,

    placeholder = "",

    value = "",

    maxlength = 20

}){

    return `

        <div class="form">

            <input

                id="${id}"

                class="input"

                type="text"

                placeholder="${placeholder}"

                value="${value}"

                maxlength="${maxlength}"

                autocomplete="off"

                spellcheck="false"

            >

        </div>

    `;

}


function createButton({

    id,

    text,

    disabled = false

}){

    return `

        <button

            id="${id}"

            class="button"

            ${disabled ? "disabled" : ""}

        >

            ${text}

        </button>

    `;

}


function createOption({

    icon = "",

    title,

    description = "",

    value,

    selected = false

}){

    return `

        <div

            class="option ${selected ? "active" : ""}"

            data-value="${value}"

        >

            <div class="option-content">

                <h3>

                    ${icon} ${title}

                </h3>

                ${
                    description
                    ? `
                        <p>

                            ${description}

                        </p>
                    `
                    : ""
                }

            </div>

        </div>

    `;

}

//==================================
// Screen
//==================================

function renderWelcome(){

    onboarding.innerHTML = `

        ${createProgress()}

        ${createIllustration()}

        <section class="content fade">

            ${createBadge(
                "👋",
                "Selamat Datang"
            )}

            ${createTitle(
                "Finance Assistant"
            )}

            ${createDescription(
                "Halo! Aku akan membantumu mengelola keuangan dengan lebih mudah."
            )}

        </section>

        <footer class="footer">

            ${createButton({

                id : "btnStart",

                text : "Mulai"

            })}

        </footer>

    `;

    bindWelcomeEvent();

}

function renderDisplayName(){

    onboarding.innerHTML = `

        ${createProgress()}

        <section class="content fade">

            ${createBadge(
                "👤",
                "Nama"
            )}

            ${createTitle(
                "Aku akan memanggilmu siapa?"
            )}

            ${createDescription(
                "Nama panggilan ini akan digunakan di seluruh aplikasi."
            )}

            ${createInput({

                id : "displayName",

                placeholder : "Nama Panggilan",

                value : onboardingData.displayName

            })}

        </section>

        <footer class="footer">

            ${createButton({

                id : "btnNext",

                text : "Lanjut",

                disabled :
                    onboardingData.displayName
                    .trim() === ""

            })}

        </footer>

    `;

    bindDisplayNameEvent();

}

function renderCurrency(){

    onboarding.innerHTML = `

        ${createProgress()}

        <section class="content fade">

            ${createBadge(
                "💱",
                "Mata Uang"
            )}

            ${createTitle(
                "Pilih mata uang"
            )}

            ${createDescription(
                "Pilih mata uang yang paling sering kamu gunakan."
            )}

            ${createOption({

    icon : "🇮🇩",

    title : "Indonesian Rupiah (IDR)",

    value : "IDR",

    selected :
        onboardingData.currency === "IDR"

})}

${createOption({

    icon : "🇺🇸",

    title : "US Dollar (USD)",

    value : "USD",

    selected :
        onboardingData.currency === "USD"

})}

        </section>

        <footer class="footer">

            ${createButton({

                id : "btnNext",

                text : "Lanjut"

            })}

        </footer>

    `;

    bindCurrencyEvent();

}

function renderTheme(){

    onboarding.innerHTML = `

        ${createProgress()}

        <section class="content fade">

            ${createBadge(
                "🎨",
                "Tampilan"
            )}

            ${createTitle(
                "Pilih tema"
            )}

            ${createDescription(
                "Pilih tampilan yang paling nyaman untukmu."
            )}

            ${createOption({

                icon : "☀️",

                title : "Terang",

                description :
                    "Cocok digunakan pada siang hari.",

                value : "light",

                selected :
                    onboardingData.theme === "light"

            })}

            ${createOption({

                icon : "🌙",

                title : "Gelap",

                description :
                    "Nyaman digunakan pada malam hari.",

                value : "dark",

                selected :
                    onboardingData.theme === "dark"

            })}

            ${createOption({

                icon : "⚙️",

                title : "Ikuti Sistem",

                description :
                    "Mengikuti pengaturan perangkat.",

                value : "system",

                selected :
                    onboardingData.theme === "system"

            })}

        </section>

        <footer class="footer">

            ${createButton({

                id : "btnNext",

                text : "Lanjut"

            })}

        </footer>

    `;

    bindThemeEvent();

                    }
function renderGoogleLogin(){

    onboarding.innerHTML = `

        ${createProgress()}

        <section class="content fade">

            ${createBadge(
                "🔐",
                "Google"
            )}

            ${createTitle(
                "Hubungkan Akun Google"
            )}

            ${createDescription(
                "Satu langkah lagi. Finance Assistant akan membuat workspace pribadi di Google Drive milikmu."
            )}

            ${createOption({

                icon : "✅",

                title : "Workspace Pribadi",

                description :
                    "Folder dan Finance Core akan dibuat otomatis.",

                value : "google",

                selected : true

            })}

        </section>

        <footer class="footer">

            ${createButton({

                id : "btnGoogle",

                text : "Lanjutkan dengan Google"

            })}

        </footer>

    `;

    bindGoogleLogin();

}


//==================================
// Event
//==================================

function bindWelcomeEvent(){

    document

        .getElementById(
            "btnStart"
        )

        .addEventListener(

            "click",

            nextStep

        );

}

function bindDisplayNameEvent(){

    const input =

        document.getElementById(
            "displayName"
        );

    const button =

        document.getElementById(
            "btnNext"
        );


    input.focus();


    input.addEventListener(

        "input",

        () => {

            onboardingData.displayName =

                input.value.trimStart();

            button.disabled =

                onboardingData.displayName
                .trim() === "";

        }

    );


    button.addEventListener(

        "click",

        () => {

            onboardingData.displayName =

                input.value.trim();

            nextStep();

        }

    );

}

function bindCurrencyEvent(){

    const options =

        document.querySelectorAll(
            ".option"
        );

    const button =

        document.getElementById(
            "btnNext"
        );


    options.forEach(option => {

        option.addEventListener(

            "click",

            () => {

                options.forEach(item =>

                    item.classList.remove(
                        "active"
                    )

                );

                option.classList.add(
                    "active"
                );

                onboardingData.currency =

                    option.dataset.value;

            }

        );

    });


    button.addEventListener(

        "click",

        nextStep

    );

}

function bindThemeEvent(){

    const options =

        document.querySelectorAll(
            ".option"
        );

    const button =

    document.getElementById(
        "btnNext"
    );


    options.forEach(option => {

        option.addEventListener(

            "click",

            () => {

                options.forEach(item =>

                    item.classList.remove(
                        "active"
                    )

                );

                option.classList.add(
                    "active"
                );

                onboardingData.theme =

                    option.dataset.value;

            }

        );

    });


    button.addEventListener(

    "click",

    nextStep

);

}

function bindGoogleLogin(){

    document

        .getElementById(
            "btnGoogle"
        )

        .addEventListener(

            "click",

            () => {

                loginGoogle();

            }

        );

}


//==================================
// Function
//==================================

function finishOnboarding(){

    saveUser({

        ...onboardingData,

        onboardingCompleted : true

    });

    location.replace(
        "../dashboard/index.html"
    );

}

//==================================
// Init
//==================================

render();


