/**
 * ==============================================
 * Finance Assistant
 * Module      : Onboarding
 * File        : script.js
 * Version     : 1.0.0
 *
 * Description :
 * Mengatur seluruh proses onboarding.
 * ==============================================
 */


//======================================
// State
//======================================

let currentStep = 0;

const onboardingData = {

    displayName : "",
    currency    : "IDR",
    theme       : "system"

};


//======================================
// Step List
//======================================

const steps = [

    renderWelcome,
    renderDisplayName,
    renderCurrency,
    renderTheme

];


//======================================
// DOM
//======================================

const container =
document.getElementById(
    "onboarding"
);


//======================================
// Navigation
//======================================

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


//======================================
// Render
//======================================

function render(){

    steps[currentStep]();

}


//======================================
// Welcome
//======================================

function renderWelcome(){

    container.innerHTML = `

        Welcome Screen

    `;

}


//======================================
// Display Name
//======================================

function renderDisplayName(){

    container.innerHTML = `

        Display Name

    `;

}


//======================================
// Currency
//======================================

function renderCurrency(){

    container.innerHTML = `

        Currency

    `;

}


//======================================
// Theme
//======================================

function renderTheme(){

    container.innerHTML = `

        Theme

    `;

}


//======================================
// Init
//======================================

render();
