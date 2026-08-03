/* =====================================================
   GLOBAL NAVIGATION
   FILE : navigation.js
   DESCRIPTION : Bottom Navigation Controller
   VERSION : 5.0.0
===================================================== */


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

        id : "statistik",

        label : "Statistik",

        icon : "bar_chart"

    },

    {

        id : "ringkasan",

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

function showPage(

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

                item.dataset.page===page

            );

        });

}
