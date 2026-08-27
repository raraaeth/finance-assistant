/* =====================================================
   GLOBAL PROFILE
   FILE        : script.js
   DESCRIPTION : Global Profile Component
   VERSION     : 4.0.0

   Architecture :

   Supabase Auth
        ↓
   module.js
        ↓
   Finance Core
        ↓
   workspace.js
        ↓
   Profile

   Profile hanya menangani UI.

   Tidak menangani:
   - Google Drive API
   - Google Sheets API
   - Apps Script API
   - pembuatan Finance Core
   - pengecekan sheet secara langsung

===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadUser,

    loadTheme

} from "../../js/storage.js";


import {

    loadSession,

    loginGoogle,

    logout

} from "../../js/auth.js";


import {

    getWorkspaceState,
    setActiveWorkspace

} from "../../js/workspace.js";


import {

    createWorkspace

} from "../../js/addworkspace.js";

/* =====================================================
   STATE
===================================================== */

const State = {

    session : null,

    user : null,

    workspace : {

        active : null,

        inactive : []

    },

    container : null,

    eventsBound : false,

    loadingWorkspace : false

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

   Hanya untuk kebutuhan UI.
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


        await init();

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

async function init(){

    initTheme();


    await initSession();


    initEvent();


    render();


    renderTheme();


    initThemeEvent();

}


/* =====================================================
   SESSION
===================================================== */

async function initSession(){

    State.session =

        await loadSession();


    State.user =

        loadUser();


    console.log(

        "===== PROFILE SESSION ====="

    );


    console.log(

        "Session:",

        State.session

    );


    console.log(

        "User:",

        State.user

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

                type="button"

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


    try{

        await loginGoogle();

    }catch(error){

        console.error(

            "Profile Google Login Error:",

            error

        );


        button.disabled =

            false;


        button.textContent =

            "Masuk dengan Google";

    }

}


/* =====================================================
   USER CARD
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

        ||

        "Guest";


    const email =

        State.session
        ?.user
        ?.email

        ||

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

                alt="${escapeHtml(name)}"

            >


            <span class="profile-greeting">

                ${getGreeting()}

            </span>


            <h2 class="profile-name">

                ${escapeHtml(name)}

            </h2>


            <p class="profile-email">

                ${escapeHtml(email)}

            </p>


            <p class="profile-description">

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

        State.session
        ?.user
        ?.user_metadata
        ?.avatar_url

    ){

        return State.session.user.user_metadata.avatar_url;

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
   WORKSPACE CARD
===================================================== */

async function renderWorkspaceCard(){

    const container =

        document.getElementById(

            "profile-workspace"

        );


    if(

        !container

    ){

        return;

    }


    container.innerHTML =

    `

        <article class="profile-card">

            <h2 class="profile-title">

                Workspace

            </h2>


            <div class="profile-workspace">

                <div class="workspace-loading">

                    Memeriksa Workspace...

                </div>

            </div>

        </article>

    `;


    try{

        await loadWorkspaceState();


        renderWorkspaceContent(

            container

        );

    }catch(error){

        console.error(

            "Gagal memuat Workspace:",

            error

        );


        container.innerHTML =

        `

            <article class="profile-card">

                <h2 class="profile-title">

                    Workspace

                </h2>


                <div class="profile-workspace">

                    <div class="workspace-empty">

                        Gagal memuat Workspace

                    </div>

                </div>

            </article>

        `;

    }

}


/* =====================================================
   LOAD WORKSPACE STATE

   Semua logic pengecekan workspace
   dikerjakan oleh workspace.js.
===================================================== */

async function loadWorkspaceState(){

    if(

        State.loadingWorkspace

    ){

        return;

    }


    State.loadingWorkspace =

        true;


    try{

        const result =

            await getWorkspaceState();


        State.workspace =

            normalizeWorkspaceState(

                result

            );


        console.log(

            "===== PROFILE WORKSPACE ====="

        );


        console.log(

            State.workspace

        );

    }finally{

        State.loadingWorkspace =

            false;

    }

}


/* =====================================================
   NORMALIZE WORKSPACE

   Menjaga Profile tetap sederhana.
===================================================== */

function normalizeWorkspaceState(

    result

){

    const active =

        result?.active

        ||

        null;


    const inactive =

        Array.isArray(

            result?.inactive

        )

        ?

        result.inactive

        :

        [];


    return {

        active :

            normalizeWorkspaceItem(

                active

            ),


        inactive :

            inactive

                .map(

                    normalizeWorkspaceItem

                )

                .filter(

                    Boolean

                )

    };

}


/* =====================================================
   NORMALIZE ITEM
===================================================== */

function normalizeWorkspaceItem(

    item

){

    if(

        !item

    ){

        return null;

    }


    const config =

        MODULES.find(

            module =>

                module.id === item.id

        );


    return {

        id :

            item.id,


        title :

            item.title

            ||

            config?.title

            ||

            item.id,


        icon :

            item.icon

            ||

            config?.icon

            ||

            "📁"

    };

}


/* =====================================================
   RENDER WORKSPACE CONTENT
===================================================== */

function renderWorkspaceContent(

    container

){

    const active =

        State.workspace.active

        ?

        [

            State.workspace.active

        ]

        :

        [];


    const inactive =

        State.workspace.inactive;


    const workspaceContainer =

        container.querySelector(

            ".profile-workspace"

        );


    if(

        !workspaceContainer

    ){

        return;

    }


    workspaceContainer.innerHTML =

    `

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

    `;

}


/* =====================================================
   WORKSPACE GROUP
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
   WORKSPACE ITEM
===================================================== */

function createWorkspaceItem(

    item

){

    return `

        <button

            class="workspace-item"

            type="button"

            data-id="${escapeHtml(item.id)}"

        >

            <div class="workspace-left">

                <div class="workspace-icon">

                    ${item.icon}

                </div>


                <span class="workspace-name">

                    ${escapeHtml(item.title)}

                </span>

            </div>


            <span

                class="workspace-status"

            >

                ${

                    item === State.workspace.active

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
   AVAILABLE WORKSPACE
===================================================== */

function getAvailableWorkspace(){

    const activeId =

        State.workspace.active?.id;


    const inactiveIds =

        new Set(

            State.workspace.inactive

                .map(

                    item => item.id

                )

        );


    return MODULES.filter(

        module =>

            module.id !== activeId

            &&

            !inactiveIds.has(

                module.id

            )

    );

}


/* =====================================================
   CREATE WORKSPACE EVENT
===================================================== */

async function onCreateWorkspace(){

    const available =

        getAvailableWorkspace();


    if(

        !available.length

    ){

        alert(

            "Semua Workspace sudah dibuat."

        );

        return;

    }


    const options =

        available

            .map(

                (

                    module,

                    index

                ) =>

                    `${index + 1}. ${module.title}`

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


    const confirmed =

        confirm(

            `Buat Workspace "${module.title}"?`

        );


    if(

        !confirmed

    ){

        return;

    }


    const button =

        document.querySelector(

            ".workspace-create"

        );


    try{

        if(

            button

        ){

            button.disabled =

                true;


            button.textContent =

                "Membuat Workspace...";

        }


        console.log(

            "===== PROFILE CREATE WORKSPACE ====="

        );


        console.log(

            "Workspace:",

            module

        );


        const result =

            await createWorkspace(

                module.id

            );


        console.log(

            "Create Workspace Result:",

            result

        );


        alert(

            `"${module.title}" berhasil dibuat.`

        );


        location.reload();

    }catch(error){

        console.error(

            "Create Workspace Error:",

            error

        );


        alert(

            error?.message

            ||

            "Gagal membuat Workspace."

        );


        if(

            button

        ){

            button.disabled =

                false;


            button.textContent =

                "➕ Create Workspace";

        }

    }

}


/* =====================================================
   CHANGE WORKSPACE
===================================================== */

async function onWorkspace(

    id

){

    if(

        !id

    ){

        return;

    }


    if(

        State.workspace.active?.id === id

    ){

        return;

    }


    const exists =

        State.workspace.inactive

            .some(

                item =>

                    item.id === id

            );


    if(

        !exists

    ){

        console.warn(

            "Workspace belum tersedia:",

            id

        );

        return;

    }


    try{

        console.log(

            "===== SET ACTIVE WORKSPACE ====="

        );


        console.log(

            "Workspace:",

            id

        );


        await setActiveWorkspace(

            id

        );


        location.reload();

    }catch(error){

        console.error(

            "Set Active Workspace Error:",

            error

        );


        alert(

            error?.message

            ||

            "Gagal mengaktifkan Workspace."

        );

    }

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
   THEME
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

                        class="profile-theme-option ${
                            current === theme.id
                            ? "active"
                            : ""
                        }"

                        data-theme="${theme.id}"

                    >

                        <span class="profile-theme-icon">

                            ${theme.icon}

                        </span>


                        <span class="profile-theme-info">

                            <strong>

                                ${theme.title}

                            </strong>


                            <small>

                                ${theme.description}

                            </small>

                        </span>


                        <span class="profile-theme-check">

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


            applyTheme(

                button.dataset.theme

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


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHtml(

    value

){

    return String(

        value

        ||

        ""

    )

    .replace(

        /&/g,

        "&amp;"

    )

    .replace(

        /</g,

        "&lt;"

    )

    .replace(

        />/g,

        "&gt;"

    )

    .replace(

        /"/g,

        "&quot;"

    )

    .replace(

        /'/g,

        "&#039;"

    );

}
