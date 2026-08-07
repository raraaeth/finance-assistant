/* =====================================================
   GLOBAL PROFILE
   FILE : script.js
   DESCRIPTION : Profile Component
   VERSION : 2.0.0
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadUser,

    loadWorkspace,

    saveWorkspace

} from "../../js/storage.js";

import {

    loadSession,

    loginGoogle,

    logout

} from "../../js/auth.js";


/* =====================================================
   STATE
===================================================== */

const State = {

    session : null,

    user : null,

    workspace : [],

    container : null

};

/* =====================================================
   COMPONENT
===================================================== */

const BASE =

    "../../components/profile/";


export const Profile = {

    async render({

        container

    }){

        State.container =

            document.querySelector(

                container

            );

        if(

            !State.container

        ){

            return;

        }

        await loadStyle();

const response =

    await fetch(

        `${BASE}index.html`

    );

State.container.innerHTML =

    await response.text();

init();

    }

};

/* =====================================================
   LOAD STYLE
===================================================== */

async function loadStyle(){

    const id =

        "profile-component-style";

    if(

        document.getElementById(

            id

        )

    ){

        return;

    }

    const link =

        document.createElement(

            "link"

        );

    link.id =

        id;

    link.rel =

        "stylesheet";

    link.href =

        `${BASE}style.css`;

    document.head.appendChild(

        link

    );

}

/* =====================================================
   INIT
===================================================== */

function init(){

    initSession();

    initEvent();

    render();

}


/* =====================================================
   SESSION
===================================================== */

function initSession(){

    State.session =

        loadSession();

    State.user =

        loadUser();

}


/* =====================================================
   RENDER
===================================================== */

function render(){

    if(

        !State.session

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

    if(

        !login ||

        !dashboard

    ){

        return;

    }

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
    src="${getAvatar()}"
    alt="Guest"
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

            onGoogleLogin

        );

}


/* =====================================================
   GOOGLE LOGIN
===================================================== */

async function onGoogleLogin(){

    const button =

        document.getElementById(

            "profile-login-button"

        );

    if(

        !button

    ){

        return;

    }

    button.disabled =

        true;

    button.textContent =

        "Menyiapkan Workspace...";

    await loginGoogle();

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

    const name =

        State.user?.displayName ??

        "Guest";

    const email =

        State.session?.user?.email ??

        "-";

    document.getElementById(

        "profile-user"

    ).innerHTML =

    `

        <article

            class="profile-card profile-user"

        >

            <img

                class="profile-avatar"

                src="${getAvatar()}"

                alt="${name}"

            >

            <span

                class="profile-greeting"

            >

                ${getGreeting()}

            </span>

            <h2

                class="profile-name"

            >

                ${name}

            </h2>

            <p

                class="profile-email"

            >

                ${email}

            </p>

            <p

                class="profile-description"

            >

                Kelola akun dan workspace
                Finance Assistant milikmu.

            </p>

        </article>

    `;

}


/* =====================================================
   AVATAR
===================================================== */

function getAvatar(){

    if(

        State.user?.avatar

    ){

        return State.user.avatar;

    }

    if(

        State.session?.user?.picture

    ){

        return State.session.user.picture;

    }

    return `${BASE}assets/avatar.webp`;

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

    if(

        !container

    ){

        return;

    }

    const active =

        State.workspace.filter(

            item => item.active

        );

    const inactive =

        State.workspace.filter(

            item => !item.active

        );

    container.innerHTML =

    `

        <article class="profile-card">

            <h2 class="profile-title">

                Workspace

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
   LOAD WORKSPACE
===================================================== */

function loadWorkspaceList(

    current

){

    return [

        {

            id : "saving",

            icon : "🏦",

            title : "Saving",

            active :

                current.workspace ===

                "saving"

        }

    ];

}


/* =====================================================
   INIT WORKSPACE
===================================================== */

function initWorkspace(){

    const current =

        loadWorkspace();

    State.workspace =

    loadWorkspaceList(

        current

    );



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

                        Belum ada Workspace

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

        <button

            class="workspace-item"

            type="button"

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

                    "Inactive"

                }

            </span>

        </button>

    `;

}


/* =====================================================
   CREATE
===================================================== */

function renderCreateWorkspace(){

    return `

        <button

            class="workspace-create"

            type="button"

        >

            ➕ Create Workspace

        </button>

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

    if(

        !container

    ){

        return;

    }

    const menu = [

        {

            id : "settings",

            icon : "⚙️",

            title : "Pengaturan",

            description :

                "Tema, Bahasa dan Mata Uang"

        },

        {

            id : "sync",

            icon : "☁️",

            title : "Sinkronisasi & Tentang",

            description :

                "Google Drive dan Informasi"

        },

        {

            id : "guide",

            icon : "📖",

            title : "Panduan",

            description :

                "Dokumentasi dan README"

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

            <div class="profile-menu-left">

                <div class="profile-menu-icon">

                    ${item.icon}

                </div>

                <div class="profile-menu-content">

                    <div class="profile-menu-title">

                        ${item.title}

                    </div>

                    <div class="profile-menu-description">

                        ${item.description}

                    </div>

                </div>

            </div>

            <span class="profile-menu-arrow">

                ›

            </span>

        </article>

    `;

}


/* =====================================================
   LOGOUT
===================================================== */

function renderLogoutCard(){

    const container =

        document.getElementById(

            "profile-logout"

        );

    if(

        !container

    ){

        return;

    }

    container.innerHTML =

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
   OPEN MENU
===================================================== */

function openMenu(

    id

){

    console.log(

        "Open",

        id

    );

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
