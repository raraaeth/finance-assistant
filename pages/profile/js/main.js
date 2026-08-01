/**
 * ==================================================
 * Finance Assistant
 * Module      : Profile
 * File        : main.js
 * Version     : 2.0.0
 *
 * Description :
 * Profile & Account Center
 *
 * Features :
 * - Google Authentication
 * - User Profile
 * - Workspace
 * - Application Settings
 * - Synchronization
 * - Logout
 * ==================================================
 */


//==================================
// Import
//==================================

import {

    loginGoogle,

    loadSession,

    logout

} from "../../../js/auth.js";

//==================================
// State
//==================================

const Profile = {

    session : null,

    user : null,

    workspace : [],

    settings : [],

    guides : []

};


//==================================
// Initialize
//==================================

document.addEventListener(

    "DOMContentLoaded",

    init

);

function init(){

    initEvents();

    initProfile();

    initData();

    renderProfile();

}


//==================================
// Event
//==================================

function initEvents(){

    document

        .getElementById(
            "pro-google-login-button"
        )

        .addEventListener(

            "click",

            onGoogleLogin

        );
    document

    .getElementById(
        "pro-logout-button"
    )

    .addEventListener(

        "click",

        onLogout

    );

    

}


//==================================
// Google Login
//==================================

async function onGoogleLogin(){

    const button =

        document.getElementById(
            "pro-google-login-button"
        );

    button.classList.add(
        "loading"
    );

    button.disabled = true;

    button.innerHTML = `

        <div class="spinner"></div>

        <span>

            Menyiapkan Workspace...

        </span>

    `;

    await loginGoogle();

}


//==================================
// Profile
//==================================

function initProfile(){

    const session = loadSession();

    const loginSection =

        document.getElementById(
            "pro-login-section"
        );

    const dashboardSection =

        document.getElementById(
            "pro-dashboard-section"
        );

    if(session){

        loginSection.classList.add(
            "hidden"
        );

        dashboardSection.classList.remove(
            "hidden"
        );

        console.log(

            "Profile Mode : Login",

            session

        );

        return;

    }

    loginSection.classList.remove(
        "hidden"
    );

    dashboardSection.classList.add(
        "hidden"
    );

    console.log(

        "Profile Mode : Guest"

    );

}

//==================================
// Data
//==================================

function initData(){

    const session = loadSession();

    if(!session){

        return;

    }

    Profile.session = session;

    Profile.user = {

        name :

            session.user?.name ??

            "Guest",

        email :

            session.user?.email ??

            "",

        photo :

            session.user?.picture ??

            ""

    };

Profile.workspace = [

    {

        id : "financial",

        icon : "💰",

        title : "Financial",

        status : "active"

    },

    {

        id : "saving",

        icon : "🏦",

        title : "Saving",

        status : "inactive"

    },

    {

        id : "payroll",

        icon : "💼",

        title : "Payroll",

        status : "inactive"

    }

];

    Profile.settings = [

    {

        id : "theme",

        icon : "🎨",

        title : "Tema",

        value : "Light"

    },

    {

        id : "language",

        icon : "🌐",

        title : "Bahasa",

        value : "Indonesia"

    },

    {

        id : "currency",

        icon : "💵",

        title : "Mata Uang",

        value : "Rupiah (IDR)"

    },

    {

        id : "date",

        icon : "📅",

        title : "Format Tanggal",

        value : "DD/MM/YYYY"

    },

    {

        id : "week",

        icon : "📆",

        title : "Hari Pertama Minggu",

        value : "Senin"

    }

];

Profile.sync = {

    status : "Terhubung",

    lastSync : "1 Agustus 2026"

};

Profile.about = {

    version : "v1.0.0",

    developer : "Raraa Studio"

};    

Profile.guides = [

    {

        id : "docs",

        icon : "📖",

        title : "Dokumentasi",

        description :

            "Pelajari cara menggunakan setiap modul."

    },

    {

        id : "readme",

        icon : "📄",

        title : "README",

        description :

            "Visi, roadmap, dan informasi aplikasi."

    }

];

}

//==================================
// Render
//==================================

function renderProfile(){

    renderHero();

    renderWorkspace();

    renderSettings();

    renderSync();

    renderGuide();

    renderLogout();

}

//==================================
// Hero
//==================================

function renderHero(){

    const greeting =

        document.getElementById(
            "pro-user-greeting"
        );

    const name =

        document.getElementById(
            "pro-user-name"
        );

    const email =

        document.getElementById(
            "pro-user-email"
        );

    const photo =

        document.getElementById(
            "pro-user-photo"
        );

    greeting.textContent =

        getGreeting();

    name.textContent =

        Profile.user.name;

    email.textContent =

        Profile.user.email;

    photo.src =

        Profile.user.photo;

}

//==================================
// Greeting
//==================================

function getGreeting(){

    const hour = new Date().getHours();

    if(hour < 11){

        return "🌅 Selamat Pagi";

    }

    if(hour < 15){

        return "☀️ Selamat Siang";

    }

    if(hour < 18){

        return "🌇 Selamat Sore";

    }

    return "🌙 Selamat Malam";

}

//==================================
// Workspace
//==================================
function renderWorkspace(){

    const active =

        document.getElementById(
            "pro-active-workspace"
        );

    const inactive =

        document.getElementById(
            "pro-inactive-workspace"
        );

    const activeWorkspace =

        Profile.workspace.filter(

            item => item.status === "active"

        );

    const inactiveWorkspace =

        Profile.workspace.filter(

            item => item.status !== "active"

        );

    const divider =

    document.getElementById(
        "pro-workspace-divider"
    );

divider.style.display =

    inactiveWorkspace.length

        ? ""

        : "none";

    active.innerHTML =

        activeWorkspace

            .map(createWorkspaceCard)

            .join("");

    inactive.innerHTML =

        inactiveWorkspace

            .map(createWorkspaceCard)

            .join("");

}

function createWorkspaceCard(item){

    const active =

        item.status === "active";

    return `

        <article

            class="workspace-card"

            data-id="${item.id}"

        >

            <div class="workspace-icon">

                ${item.icon}

            </div>

            <h3>

                ${item.title}

            </h3>

            <span

                class="workspace-status ${

                    active

                    ? "active"

                    : "inactive"

                }"

            >

                ${

                    active

                    ? "🟢 Aktif"

                    : "🟡 Belum Dibuat"

                }

            </span>

        </article>

    `;

}

//==================================
// Setting
//==================================

function renderSettings(){

    const container =

        document.getElementById(
            "pro-setting-list"
        );

    container.innerHTML =

        Profile.settings

            .map(createSettingItem)

            .join("");

}
function createSettingItem(item){

    return `

        <article

            class="setting-item"

            data-id="${item.id}"

        >

            <div class="setting-left">

                <span class="setting-icon">

                    ${item.icon}

                </span>

                <div>

                    <h3>

                        ${item.title}

                    </h3>

                    <p>

                        ${item.value}

                    </p>

                </div>

            </div>

            <span class="setting-arrow">

                ›

            </span>

        </article>

    `;

}

//==================================
// Sync
//==================================
function renderSync(){

    renderSyncCard();

    renderAboutCard();

}

function renderSyncCard(){

    const card =

        document.getElementById(
            "pro-sync-card"
        );

    card.innerHTML = `

        <div class="info-card">

            <div class="info-icon">

                ☁️

            </div>

            <h3>

                Google Drive

            </h3>

            <p>

                ${Profile.sync.status}

            </p>

            <small>

                ${Profile.sync.lastSync}

            </small>

        </div>

    `;

}

function renderAboutCard(){

    const card =

        document.getElementById(
            "pro-about-card"
        );

    card.innerHTML = `

        <div class="info-card">

            <div class="info-icon">

                ℹ️

            </div>

            <h3>

                Tentang

            </h3>

            <p>

                ${Profile.about.version}

            </p>

            <small>

                ${Profile.about.developer}

            </small>

        </div>

    `;

}

//==================================
// Guide
//==================================
function renderGuide(){

    const container =

        document.getElementById(
            "pro-guide-grid"
        );

    container.innerHTML =

        Profile.guides

            .map(createGuideCard)

            .join("");

}

function createGuideCard(item){

    return `

        <article

            class="guide-card"

            data-id="${item.id}"

        >

            <div class="guide-icon">

                ${item.icon}

            </div>

            <h3>

                ${item.title}

            </h3>

            <p>

                ${item.description}

            </p>

        </article>

    `;

}


//==================================
// Logout
//==================================

function renderLogout(){

    const button =

        document.getElementById(
            "pro-logout-button"
        );

    button.innerHTML = `

        <span>

            🚪

        </span>

        <span>

            Keluar dari Akun

        </span>

    `;

}

function onLogout(){

    if(

        !confirm(

            "Yakin ingin keluar?"

        )

    ){

        return;

    }

    logout();

}


