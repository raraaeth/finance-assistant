/* =====================================================
   GLOBAL NAVIGATION
   FILE : navigation.js
   DESCRIPTION : Bottom Navigation Controller
   VERSION : 5.1.0
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

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

        icon : "home"

    },

    {

        id : "statistics",

        label : "Statistik",

        icon : "bar_chart"

    },

    {

        id : "summary",

        label : "Ringkasan",

        icon : "description"

    },

    {

        id : "profile",

        label : "Profile",

        icon : "person"

    }

];


/* =====================================================
   PAGE STATE
===================================================== */

const PAGE_STATE = {

    profileLoaded :

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

function initNavigation(){

    const navigation =

        document.getElementById(

            "bottom-navigation"

        );

    if(

        !navigation

    ){

        return;

    }

    renderNavigation(

        navigation

    );

    registerNavigation(

        navigation

    );

    showPage(

        "home"

    );

}


/* =====================================================
   RENDER NAVIGATION
===================================================== */

function renderNavigation(

    navigation

){

    navigation.innerHTML =

        MENU.map(item=>`

            <button

                class="nav-item"

                data-page="${item.id}"

                type="button"

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

            </button>

        `).join("");

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

        .forEach(button=>{

            button.addEventListener(

                "click",

                ()=>{

                    showPage(

                        button.dataset.page

                    );

                }

            );

        });

}


/* =====================================================
   SHOW PAGE
===================================================== */

async function showPage(

    page

){

    document

        .querySelectorAll(

            ".page"

        )

        .forEach(section=>{

            section.classList.remove(

                "active-page"

            );

            section.classList.add(

                "hidden"

            );

        });


    const activePage =

        document.getElementById(

            `${page}-page`

        );


    if(

        !activePage

    ){

        console.warn(

            "Page tidak ditemukan:",

            `${page}-page`

        );

        return;

    }


    activePage.classList.remove(

        "hidden"

    );

    activePage.classList.add(

        "active-page"

    );


    updateNavigation(

        page

    );


    /* =================================================
       PROFILE
    ================================================= */

    if(

        page === "profile"

        &&

        !PAGE_STATE.profileLoaded

    ){

        await loadProfile();

    }

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

            "Loading Profile..."

        );


        await Profile.render({

            container :

                "#profile-page"

        });


        PAGE_STATE.profileLoaded =

            true;


        console.log(

            "Profile loaded."

        );

    }catch(error){

        console.error(

            "Profile gagal dimuat:",

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

        .forEach(item=>{

            item.classList.toggle(

                "active",

                item.dataset.page === page

            );

        });

}
