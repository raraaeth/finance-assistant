/* =====================================================
   GLOBAL PROFILE
   FILE : script.js
   DESCRIPTION : Profile Component
   VERSION : 1.0.0
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadUser

} from "../../js/storage.js";

import {

    loadSession,

    loginGoogle,

    logout

} from "../../js/auth.js";


/* =====================================================
   STATE
===================================================== */

const Profile = {

    session : null,

    user : null,

    workspace : [],

    currentApp : null

};


/* =====================================================
   COMPONENT
===================================================== */

const BASE =

    "components/profile/";

export const Profile = {
   
    async render({

    container,

    app

}){

        Profile.currentApp =

    app;

        const element =

            document.querySelector(

                container

            );

        if(

            !element

        ){

            return;

        }

        const response =

            await fetch(

    `${BASE}index.html`

);

        element.innerHTML =

            await response.text();

        init();

    }

};


/* =====================================================
   INIT
===================================================== */

function init(){

    initSession();

    initData();

    initEvent();

    render();

}


/* =====================================================
   SESSION
===================================================== */

function initSession(){

    Profile.session =

        loadSession();

    Profile.user =

        loadUser();

}


/* =====================================================
   DATA
===================================================== */

function initData(){

    if(

        !Profile.session

    ){

        return;

    }

}


/* =====================================================
   EVENT
===================================================== */

function initEvent(){

    document.addEventListener(

        "click",

        onClick

    );

}

function onClick(

    event

){

    const menu =

        event.target.closest(

            ".profile-menu-item"

        );

    if(

        menu

    ){

        openMenu(

            menu.dataset.id

        );

        return;

    }

    const logoutButton =

        event.target.closest(

            "#profile-logout-button"

        );

    if(

        logoutButton

    ){

        onLogout();

    }

}

/* =====================================================
   RENDER
===================================================== */

function render(){

    if(

        !Profile.session

    ){

        renderLogin();

        return;

    }

    renderUserCard();

    renderWorkspaceCard();

    renderMenuCard();

    renderLogoutCard();

}


/* =====================================================
   LOGIN
===================================================== */

function renderLogin(){

    const login =

        document.getElementById(

            "profile-login"

        );

    const dashboard =

        document.getElementById(

            "profile-dashboard"

        );

    login.classList.remove(

        "hidden"

    );

    dashboard.classList.add(

        "hidden"

    );

    login.innerHTML =

    `

        <div class="profile-login">

            <img

                class="profile-login-image"

                src="../../assets/images/hero/hero-dashboard.png"

                alt="Finance Assistant"

            >

            <h2 class="profile-login-title">

                Finance Assistant

            </h2>

            <p class="profile-login-description">

                Masuk menggunakan akun Google
                untuk membuat workspace
                pribadimu.

            </p>

            <button

                id="profile-login-button"

                class="profile-login-button"

            >

                Masuk dengan Google

            </button>

        </div>

    `;

    document

        .getElementById(

            "profile-login-button"

        )

        .addEventListener(

            "click",

            loginGoogle

        );

}


/* =====================================================
   USER
===================================================== */

function renderUserCard(){

    const login =

        document.getElementById(

            "profile-login"

        );

    const dashboard =

        document.getElementById(

            "profile-dashboard"

        );

    login.classList.add(

        "hidden"

    );

    dashboard.classList.remove(

        "hidden"

    );

    const photo =

        Profile.session.user?.picture

        ||

        "../../components/profile/assets/guest.webp";

    const name =

        Profile.user?.displayName

        ||

        "Guest";

    const email =

        Profile.session.user?.email

        ||

        "-";

    document.getElementById(

        "profile-user"

    ).innerHTML =

    `

        <article class="profile-card profile-user">

            <img

                class="profile-avatar"

                src="${photo}"

                alt="${name}"

            >

            <span class="profile-greeting">

                ${getGreeting()}

            </span>

            <h2 class="profile-name">

                ${name}

            </h2>

            <p class="profile-email">

                ${email}

            </p>

            <p class="profile-description">

                Kelola akun dan workspace
                Finance Assistant milikmu.

            </p>

        </article>

    `;

}


/* =====================================================
   GREETING
===================================================== */

function getGreeting(){

    const hour =

        new Date()

        .getHours();

    if(

        hour < 11

    ){

        return "🌅 Selamat Pagi";

    }

    if(

        hour < 15

    ){

        return "☀️ Selamat Siang";

    }

    if(

        hour < 18

    ){

        return "🌇 Selamat Sore";

    }

    return "🌙 Selamat Malam";

}

  /* =====================================================
   WORKSPACE
===================================================== */

function renderWorkspaceCard(){

    initWorkspace();

    const container =

        document.getElementById(

            "profile-workspace"

        );

    const active =

        Profile.workspace.filter(

            item => item.active

        );

    const inactive =

        Profile.workspace.filter(

            item => !item.active

        );

    container.innerHTML =

    `

        <article class="profile-card">

            <h2 class="profile-title">

                Workspace Saya

            </h2>

            <div class="profile-workspace">

                ${renderWorkspaceGroup(

                    "🟢 Active",

                    active

                )}

                ${renderWorkspaceGroup(

                    "🟡 Inactive",

                    inactive

                )}

                ${renderCreateWorkspace()}

            </div>

        </article>

    `;

}


/* =====================================================
   INIT WORKSPACE
===================================================== */

function initWorkspace(){

    Profile.workspace = [

        {

            id : "saving",

            icon : "🏦",

            title : "Saving"

        },

        {

            id : "financial",

            icon : "💰",

            title : "Financial"

        },

        {

            id : "payroll",

            icon : "💼",

            title : "Payroll"

        }

    ]

    .filter(

        workspaceExists

    )

    .map(item=>({

        ...item,

        active :

            item.id ===

            Profile.currentWorkspace

    }));

}


/* =====================================================
   WORKSPACE EXISTS
===================================================== */

function workspaceExists(

    item

){

    /*
        Sementara semua workspace
        dianggap belum dibuat.

        Nanti fungsi ini membaca
        Storage / Database.
    */

    return true;

}


/* =====================================================
   GROUP
===================================================== */

function renderWorkspaceGroup(

    title,

    items

){

    return `

        <div class="workspace-group">

            <div class="workspace-group-title">

                ${title}

            </div>

            ${

                items.length

                ?

                items.map(

                    createWorkspaceItem

                ).join("")

                :

                `

                    <div class="workspace-empty">

                        Belum ada

                    </div>

                `

            }

        </div>

    `;

}


/* =====================================================
   ITEM
===================================================== */

function createWorkspaceItem(

    item

){

    return `

        <div

            class="workspace-item"

            data-id="${item.id}"

        >

            <div class="workspace-left">

                <div class="workspace-icon">

                    ${item.icon}

                </div>

                <span class="workspace-name">

                    ${item.title}

                </span>

            </div>

            <span

                class="workspace-status

                ${

                    item.active

                    ?

                    "active"

                    :

                    "inactive"

                }"

            >

                ${

                    item.active

                    ?

                    "Aktif"

                    :

                    "Tidak Aktif"

                }

            </span>

        </div>

    `;

}


/* =====================================================
   CREATE
===================================================== */

function renderCreateWorkspace(){

    return `

        <div

            class="workspace-create"

        >

            ➕ Create Workspace

        </div>

    `;

}

/* =====================================================
   MENU
===================================================== */

function renderMenuCard(){

    const container =

        document.getElementById(

            "profile-menu"

        );

    const menu = [

        {

            id : "settings",

            icon : "⚙️",

            title : "Pengaturan",

            description :

                "Tema, Bahasa, Mata Uang"

        },

        {

            id : "sync",

            icon : "☁️",

            title : "Sinkronisasi & Tentang",

            description :

                "Google Drive & Informasi"

        },

        {

            id : "guide",

            icon : "📖",

            title : "Panduan",

            description :

                "Dokumentasi & README"

        }

    ];

    container.innerHTML =

        menu

            .map(

                createMenuItem

            )

            .join("");

}


/* =====================================================
   MENU ITEM
===================================================== */

function createMenuItem(

    item

){

    return `

        <article

            class="profile-menu-item"

            data-id="${item.id}"

        >

            <div

                class="profile-menu-left"

            >

                <div

                    class="profile-menu-icon"

                >

                    ${item.icon}

                </div>

                <div

                    class="profile-menu-content"

                >

                    <div

                        class="profile-menu-title"

                    >

                        ${item.title}

                    </div>

                    <div

                        class="profile-menu-description"

                    >

                        ${item.description}

                    </div>

                </div>

            </div>

            <span

                class="profile-menu-arrow"

            >

                ›

            </span>

        </article>

    `;

}

/* =====================================================
   OPEN MENU
===================================================== */

function openMenu(

    id

){

    switch(

        id

    ){

        case "settings":

            console.log(

                "Open Settings"

            );

            break;

        case "sync":

            console.log(

                "Open Sync"

            );

            break;

        case "guide":

            console.log(

                "Open Guide"

            );

            break;

    }

}

/* =====================================================
   LOGOUT
===================================================== */

function renderLogoutCard(){

    document.getElementById(

        "profile-logout"

    ).innerHTML =

    `

        <button

            id="profile-logout-button"

            class="profile-logout-button"

        >

            🚪 Keluar dari Akun

        </button>

    `;

}

/* =====================================================
   LOGOUT
===================================================== */

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
