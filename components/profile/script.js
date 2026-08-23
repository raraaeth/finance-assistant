/* =====================================================
   GLOBAL PROFILE
   FILE        : script.js
   DESCRIPTION : Global Profile Component
   VERSION     : 3.1.0
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadUser,

    loadWorkspace,

    saveWorkspace,

    loadTheme,

    saveTheme

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

    container : null,

    eventsBound : false

};


/* =====================================================
   THEME
===================================================== */

const THEMES = [

    {

        id : "light",

        icon : "☀️",

        title : "Light",

        description : "Tampilan terang"

    },

    {

        id : "dark",

        icon : "🌙",

        title : "Dark",

        description : "Tampilan gelap"

    },

    {

        id : "green",

        icon : "🌿",

        title : "Green",

        description : "Tampilan hijau"

    },

    {

        id : "pink",

        icon : "🌸",

        title : "Pink",

        description : "Tampilan pink"

    }

];


/* =====================================================
   MODULE CONFIG
===================================================== */

const MODULES = [

    {

        id : "financial",

        icon : "📊",

        title : "Financial"

    },

    {

        id : "saving",

        icon : "🏦",

        title : "Saving"

    },

    {

        id : "kas",

        icon : "👥",

        title : "Kas Bersama"

    },

    {

        id : "payroll-daily",

        icon : "💰",

        title : "Payroll Daily"

    },

    {

        id : "payroll-monthly",

        icon : "💼",

        title : "Payroll Monthly"

    },

    {

        id : "airdrop",

        icon : "🎁",

        title : "Airdrop"

    }

];


/* =====================================================
   RENDER THEME
===================================================== */

function renderTheme(){

    const container =

        document.getElementById(

            "profile-theme-options"

        );


    if(

        !container

    ){

        return;

    }


    const current =

        loadTheme();


    container.innerHTML =

        THEMES

        .map(

            theme => `

                <button

                    type="button"

                    class="profile-theme-option

                    ${

                        current === theme.id

                        ?

                        "active"

                        :

                        ""

                    }"

                    data-theme="${theme.id}"

                >

                    <span

                        class="profile-theme-icon"

                    >

                        ${theme.icon}

                    </span>


                    <span

                        class="profile-theme-info"

                    >

                        <strong>

                            ${theme.title}

                        </strong>


                        <small>

                            ${theme.description}

                        </small>

                    </span>


                    <span

                        class="profile-theme-check"

                    >

                        ✓

                    </span>

                </button>

            `

        )

        .join(

            ""

        );

}


/* =====================================================
   THEME EVENT
===================================================== */

function initThemeEvent(){

    const container =

        document.getElementById(

            "profile-theme-options"

        );


    if(

        !container

    ){

        return;

    }


    container.addEventListener(

        "click",

        event => {

            const button =

                event.target.closest(

                    "[data-theme]"

                );


            if(

                !button

            ){

                return;

            }


            const theme =

                button.dataset.theme;


            applyTheme(

                theme

            );

        }

    );

}


/* =====================================================
   APPLY THEME
===================================================== */

function applyTheme(

    theme

){

    saveTheme(

        theme

    );


    if(

        theme === "light"

    ){

        document.documentElement

            .removeAttribute(

                "data-theme"

            );

    }else{

        document.documentElement

            .setAttribute(

                "data-theme",

                theme

            );

    }


    renderTheme();

}


/* =====================================================
   INIT THEME
===================================================== */

function initTheme(){

    const theme =

        loadTheme();


    if(

        theme === "light"

    ){

        document.documentElement

            .removeAttribute(

                "data-theme"

            );

        return;

    }


    document.documentElement

        .setAttribute(

            "data-theme",

            theme

        );

}


/* =====================================================
   BASE
===================================================== */

const BASE =

    new URL(

        "./",

        import.meta.url

    ).href;


/* =====================================================
   COMPONENT
===================================================== */

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

                BASE +

                "index.html"

            );


        if(

            !response.ok

        ){

            console.error(

                "Profile HTML gagal dimuat:",

                response.status

            );

            return;

        }


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

        BASE +

        "style.css";


    document.head.appendChild(

        link

    );

}


/* =====================================================
   INIT
===================================================== */

function init(){

    initTheme();

    initSession();

    initEvent();

    render();

    renderTheme();

    initThemeEvent();

}


/* =====================================================
   SESSION
===================================================== */

function initSession(){

    State.session =

        loadSession();


    State.user =

        loadUser();


    console.log(

        "===== PROFILE SESSION ====="

    );

    console.log(

        State.session

    );

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


    if(

        !login ||

        !dashboard

    ){

        return;

    }


    login.classList.add(

        "hidden"

    );


    dashboard.classList.remove(

        "hidden"

    );


    const name =

        State.user?.displayName

        ??

        "Guest";


    const email =

        State.session?.user?.email

        ??

        "-";


    const user =

        document.getElementById(

            "profile-user"

        );


    if(

        !user

    ){

        return;

    }


    user.innerHTML =

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


    return (

        BASE +

        "assets/avatar.webp"

    );

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

                ${

                    renderWorkspaceGroup(

                        "🟢 Active",

                        active

                    )

                }


                ${

                    renderWorkspaceGroup(

                        "🟡 Inactive",

                        inactive

                    )

                }


                ${

                    renderCreateWorkspace()

                }

            </div>

        </article>

    `;

}


/* =====================================================
   LOAD WORKSPACE
===================================================== */

function loadWorkspaceList(){

    const current =

        loadWorkspace();


    const modules =

        State.session
        ?.workspace
        ?.modules

        ||

        {};


    return MODULES

        .filter(

            module => {

                return (

                    modules[
                        module.id
                    ]

                    ?.exists

                    === true

                );

            }

        )

        .map(

            module => {

                const workspace =

                    modules[
                        module.id
                    ];


                return {

                    id :

                        module.id,


                    icon :

                        module.icon,


                    title :

                        module.title,


                    /*
                     * Workspace aktif hanya jika
                     * workspace ini sedang dipilih.
                    */

                    active :

                        current
                        ?.workspace

                        ===

                        module.id,


                    /*
                     * Menandakan workspace memang
                     * sudah dibuat dan tersedia.
                    */

                    exists :

                        workspace
                        ?.exists

                        === true,


                    selected :

                        current
                        ?.workspace

                        ===

                        module.id

                };

            }

        );

}

/* =====================================================
   INIT WORKSPACE
===================================================== */

function initWorkspace(){

    State.workspace =

        loadWorkspaceList();

}

/* =====================================================
   GET AVAILABLE WORKSPACE
===================================================== */

function getAvailableWorkspace(){

    const modules =

        State.session
        ?.workspace
        ?.modules

        ||

        {};


    return MODULES.filter(

        module =>

            modules[
                module.id
            ]
            ?.exists

            !== true

    );

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

                items

                    .map(

                        createWorkspaceItem

                    )

                    .join(

                        ""

                    )

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

                    "Active"

                    :

                    "Inactive"

                }

            </span>

        </button>

    `;

}

/* =====================================================
   CREATE WORKSPACE
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

            .join(

                ""

            );

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

            type="button"

        >

            🚪 Keluar dari Akun

        </button>

    `;

}


/* =====================================================
   EVENT
===================================================== */

function initEvent(){

    if(

        State.eventsBound

    ){

        return;

    }


    document.addEventListener(

        "click",

        onClick

    );


    State.eventsBound =

        true;

}


/* =====================================================
   CLICK
===================================================== */

function onClick(

    event

){

    const loginButton =

        event.target.closest(

            "#profile-login-button"

        );


    if(

        loginButton

    ){

        onGoogleLogin();

        return;

    }


    const workspace =

        event.target.closest(

            ".workspace-item"

        );


    if(

        workspace

    ){

        onWorkspace(

            workspace.dataset.id

        );

        return;

    }


    const createWorkspace =

        event.target.closest(

            ".workspace-create"

        );


    if(

    createWorkspace

){

    onCreateWorkspace();

    return;

}

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


    const settingsBack =

        event.target.closest(

            "#profile-settings-back"

        );


    if(

        settingsBack

    ){

        closeSettings();

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
   CREATE WORKSPACE
===================================================== */

function onCreateWorkspace(){

    const available =

        getAvailableWorkspace();


    /* =============================================
       NO AVAILABLE WORKSPACE
    ============================================= */

    if(

        !available.length

    ){

        alert(

            "Semua Workspace sudah dibuat."

        );

        return;

    }


    /* =============================================
       TEMPORARY MODULE SELECT
    ============================================= */

    const options =

        available

        .map(

            (

                module,

                index

            ) =>

                `${

                    index + 1

                }. ${

                    module.title

                }`

        )

        .join(

            "\n"

        );


    const selected =

        prompt(

            `Pilih Workspace yang ingin dibuat:\n\n${options}`

        );


    if(

        !selected

    ){

        return;

    }


    const index =

        Number(

            selected

        )

        -

        1;


    const module =

        available[index];


    if(

        !module

    ){

        alert(

            "Pilihan Workspace tidak valid."

        );

        return;

    }


    console.log(

        "Create Workspace:",

        module

    );

}

/* =====================================================
   CHANGE WORKSPACE
===================================================== */

function onWorkspace(

    id

){

    const workspace =

        State.workspace.find(

            item =>

                item.id === id

        );


    if(

        !workspace

    ){

        return;

    }


    /*
     * Semua workspace yang tampil
     * sudah dibuat dan tersedia.
    */

    if(

        !workspace.exists

    ){

        return;

    }


    const current =

        loadWorkspace();


    /*
     * Sudah menjadi workspace aktif.
    */

    if(

        current
        ?.workspace

        ===

        id

    ){

        return;

    }


    /*
     * Simpan workspace baru
     * sebagai workspace aktif.
    */

    saveWorkspace({

        ...current,

        workspace :

            id

    });


    location.reload();

}


/* =====================================================
   OPEN MENU
===================================================== */

function openMenu(

    id

){

    if(

        id === "settings"

    ){

        openSettings();

        return;

    }


    console.log(

        "Open",

        id

    );

}


/* =====================================================
   SETTINGS OVERLAY
===================================================== */

function openSettings(){

    const overlay =

        document.getElementById(

            "profile-settings-overlay"

        );


    if(

        !overlay

    ){

        return;

    }


    overlay.classList.remove(

        "hidden"

    );

}


/* =====================================================
   CLOSE SETTINGS
===================================================== */

function closeSettings(){

    const overlay =

        document.getElementById(

            "profile-settings-overlay"

        );


    if(

        !overlay

    ){

        return;

    }


    overlay.classList.add(

        "hidden"

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
