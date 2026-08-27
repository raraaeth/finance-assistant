/* =====================================================
   GLOBAL NAVIGATION
   FILE : navigation.js
   DESCRIPTION : Bottom Navigation Controller
   VERSION : 5.2.0

   ACCESS CONTROL :

   User BELUM LOGIN
        ↓
   Hanya Profile yang dapat diakses

   User SUDAH LOGIN
        ↓
   Home
   Statistik
   Ringkasan
   Profile

   Authentication :
   Supabase Auth

   Navigation hanya bertugas:
   - Render navigation
   - Mengecek session
   - Mengunci page tertentu
   - Mengarahkan user ke Profile
   - Mengatur active navigation
   - Load Profile

   TIDAK menangani:
   - Google OAuth
   - Google token refresh
   - Workspace
   - Finance Core
   - Google Drive
   - Google Sheets
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadSession

} from "./auth.js";


import {

    Profile

} from "../components/profile/script.js";


/* =====================================================
   MENU
===================================================== */

const MENU = [

    {

        id : "home",

        label : "Home",

        icon : "home",

        requiresAuth : true

    },

    {

        id : "statistics",

        label : "Statistik",

        icon : "bar_chart",

        requiresAuth : true

    },

    {

        id : "summary",

        label : "Ringkasan",

        icon : "description",

        requiresAuth : true

    },

    {

        id : "profile",

        label : "Profile",

        icon : "person",

        requiresAuth : false

    }

];


/* =====================================================
   PAGE STATE
===================================================== */

const PAGE_STATE = {

    profileLoaded :

        false,

    session :

        null,

    initialized :

        false

};


/* =====================================================
   INIT
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initNavigation

);


/* =====================================================
   INIT NAVIGATION
===================================================== */

async function initNavigation(){

    console.log(
        "=========================================="
    );

    console.log(
        "===== NAVIGATION INITIALIZE ====="
    );

    console.log(
        "=========================================="
    );


    const navigation =

        document.getElementById(

            "bottom-navigation"

        );


    if(

        !navigation

    ){

        console.error(

            "Navigation container tidak ditemukan."

        );

        return;

    }


    /* =========================================
       CHECK SUPABASE SESSION
    ========================================= */

    try{

        PAGE_STATE.session =

            await loadSession();


    }catch(error){

        console.error(

            "Navigation: gagal membaca session.",

            error

        );


        PAGE_STATE.session =

            null;

    }


    /* =========================================
       DEBUG AUTH STATE
    ========================================= */

    console.log(

        "NAV: Session:",

        PAGE_STATE.session

            ?

            "LOGGED IN"

            :

            "NOT LOGGED IN"

    );


    /* =========================================
       RENDER NAVIGATION
    ========================================= */

    renderNavigation(

        navigation

    );


    /* =========================================
       REGISTER EVENTS
    ========================================= */

    registerNavigation(

        navigation

    );


    /* =========================================
       LOG MENU ACCESS
    ========================================= */

    logNavigationAccess();


    /* =========================================
       INITIAL PAGE
    ========================================= */

    /*
       Belum login
           ↓
       Profile

       Sudah login
           ↓
       Home
    */

    if(

        PAGE_STATE.session

    ){

        console.log(

            "NAV: User login → membuka Home."

        );


        await showPage(

            "home"

        );

    }else{

        console.log(

            "NAV: User belum login → membuka Profile."

        );


        await showPage(

            "profile"

        );

    }


    PAGE_STATE.initialized =

        true;


    console.log(
        "=========================================="
    );

    console.log(
        "===== NAVIGATION READY ====="
    );

    console.log(
        "=========================================="
    );

}


/* =====================================================
   RENDER NAVIGATION
===================================================== */

function renderNavigation(

    navigation

){

    navigation.innerHTML =

        MENU

            .map(

                item => {

                    const locked =

                        item.requiresAuth

                        &&

                        !PAGE_STATE.session;


                    return `

                        <button

                            class="nav-item ${
                                locked
                                ? "nav-locked"
                                : ""
                            }"

                            data-page="${item.id}"

                            data-requires-auth="${
                                item.requiresAuth
                                ? "true"
                                : "false"
                            }"

                            type="button"

                            ${
                                locked
                                ? 'aria-disabled="true"'
                                : ""
                            }

                        >

                            <span

                                class="material-symbols-rounded nav-icon"

                            >

                                ${item.icon}

                            </span>


                            <span

                                class="nav-label"

                            >

                                ${item.label}

                            </span>


                            ${
                                locked

                                ?

                                `

                                    <span

                                        class="nav-lock"

                                        aria-hidden="true"

                                    >

                                        🔒

                                    </span>

                                `

                                :

                                ""

                            }

                        </button>

                    `;

                }

            )

            .join("");

}


/* =====================================================
   REGISTER NAVIGATION
===================================================== */

function registerNavigation(

    navigation

){

    navigation

        .querySelectorAll(

            ".nav-item"

        )

        .forEach(

            button => {

                button.addEventListener(

                    "click",

                    async () => {

                        const page =

                            button.dataset.page;


                        console.log(

                            "NAV: Click →",

                            page

                        );


                        await showPage(

                            page

                        );

                    }

                );

            }

        );

}


/* =====================================================
   CHECK PAGE ACCESS
===================================================== */

function canAccessPage(

    page

){

    const menu =

        MENU.find(

            item =>

                item.id === page

        );


    /* =========================================
       PAGE TIDAK TERDAFTAR
    ========================================= */

    if(

        !menu

    ){

        console.warn(

            "NAV: Page tidak terdaftar:",

            page

        );


        return false;

    }


    /* =========================================
       PAGE TIDAK MEMBUTUHKAN LOGIN
    ========================================= */

    if(

        !menu.requiresAuth

    ){

        return true;

    }


    /* =========================================
       PAGE MEMBUTUHKAN LOGIN
    ========================================= */

    if(

        PAGE_STATE.session

    ){

        return true;

    }


    return false;

}


/* =====================================================
   LOG NAVIGATION ACCESS
===================================================== */

function logNavigationAccess(){

    console.log(

        "===== NAVIGATION ACCESS ====="

    );


    MENU.forEach(

        item => {

            const accessible =

                canAccessPage(

                    item.id

                );


            console.log(

                `NAV: ${item.label} = ${
                    accessible
                    ? "UNLOCKED"
                    : "LOCKED"
                }`

            );

        }

    );

}


/* =====================================================
   SHOW PAGE
===================================================== */

async function showPage(

    page

){

    console.log(

        "=========================================="

    );

    console.log(

        "NAV: Request page →",

        page

    );

    console.log(

        "=========================================="

    );


    /* =========================================
       ACCESS CHECK
    ========================================= */

    if(

        !canAccessPage(

            page

        )

    ){

        console.warn(

            `NAV: Page "${page}" terkunci karena user belum login.`

        );


        console.log(

            "NAV: Redirect ke Profile."

        );


        /*
           Pastikan Profile yang dibuka,
           bukan page yang dikunci.
        */

        if(

            page !== "profile"

        ){

            await showPage(

                "profile"

            );

        }


        return;

    }


    /* =========================================
       HIDE ALL PAGE
    ========================================= */

    document

        .querySelectorAll(

            ".page"

        )

        .forEach(

            section => {

                section.classList.remove(

                    "active-page"

                );


                section.classList.add(

                    "hidden"

                );

            }

        );


    /* =========================================
       FIND PAGE
    ========================================= */

    const activePage =

        document.getElementById(

            `${page}-page`

        );


    if(

        !activePage

    ){

        console.warn(

            "NAV: Page tidak ditemukan:",

            `${page}-page`

        );


        return;

    }


    /* =========================================
       SHOW PAGE
    ========================================= */

    activePage.classList.remove(

        "hidden"

    );


    activePage.classList.add(

        "active-page"

    );


    /* =========================================
       UPDATE NAVIGATION
    ========================================= */

    updateNavigation(

        page

    );


    /* =========================================
       PROFILE
    ========================================= */

    if(

        page === "profile"

        &&

        !PAGE_STATE.profileLoaded

    ){

        await loadProfile();

    }


    console.log(

        "NAV: Page aktif →",

        page

    );

}


/* =====================================================
   LOAD PROFILE
===================================================== */

async function loadProfile(){

    const container =

        document.getElementById(

            "profile-page"

        );


    if(

        !container

    ){

        console.error(

            "Container #profile-page tidak ditemukan."

        );

        return;

    }


    try{

        console.log(

            "NAV: Loading Profile..."

        );


        await Profile.render({

            container :

                "#profile-page"

        });


        PAGE_STATE.profileLoaded =

            true;


        console.log(

            "NAV: Profile loaded."

        );


    }catch(error){

        console.error(

            "NAV: Profile gagal dimuat:",

            error

        );

    }

}


/* =====================================================
   UPDATE NAVIGATION
===================================================== */

function updateNavigation(

    page

){

    document

        .querySelectorAll(

            ".nav-item"

        )

        .forEach(

            item => {

                item.classList.toggle(

                    "active",

                    item.dataset.page === page

                );

            }

        );

}


/* =====================================================
   REFRESH AUTH STATE
===================================================== */

/*
   Fungsi ini sengaja disediakan untuk
   kebutuhan setelah login / logout.

   Misalnya setelah Supabase Auth berubah,
   navigation dapat memanggil:

       refreshNavigationAuth()

   untuk memperbarui status lock.

   Tidak membuat authentication baru.
   Tetap menggunakan Supabase Auth.
*/

export async function refreshNavigationAuth(){

    console.log(

        "===== NAVIGATION AUTH REFRESH ====="

    );


    try{

        PAGE_STATE.session =

            await loadSession();


    }catch(error){

        console.error(

            "NAV: gagal refresh session.",

            error

        );


        PAGE_STATE.session =

            null;

    }


    console.log(

        "NAV: Session:",

        PAGE_STATE.session

            ?

            "LOGGED IN"

            :

            "NOT LOGGED IN"

    );


    const navigation =

        document.getElementById(

            "bottom-navigation"

        );


    if(

        navigation

    ){

        renderNavigation(

            navigation

        );


        registerNavigation(

            navigation

        );

    }


    logNavigationAccess();


    /*
       Jika user logout ketika sedang
       berada di page yang membutuhkan auth,
       langsung pindahkan ke Profile.
    */

    const activePage =

        document.querySelector(

            ".page.active-page"

        );


    const activePageId =

        activePage

            ?.id

            ?.replace(

                "-page",

                ""

            );


    if(

        activePageId

        &&

        !canAccessPage(

            activePageId

        )

    ){

        await showPage(

            "profile"

        );

    }


    /*
       Jika Profile belum pernah dimuat,
       tidak perlu memaksa reload.
    */

    return PAGE_STATE.session;

}


/* =====================================================
   GET CURRENT PAGE
===================================================== */

export function getCurrentPage(){

    const activePage =

        document.querySelector(

            ".page.active-page"

        );


    if(

        !activePage

    ){

        return null;

    }


    return activePage.id.replace(

        "-page",

        ""

    );

}


/* =====================================================
   GET AUTH STATE
===================================================== */

export function isNavigationUnlocked(){

    return !!PAGE_STATE.session;

}


/* =====================================================
   EXPORT
===================================================== */

export {

    MENU,

    PAGE_STATE,

    showPage

};
