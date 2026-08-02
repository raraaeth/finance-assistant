/* ==========================================
   GLOBAL NAVIGATION
   FILE : navigation.js
   DESCRIPTION : Bottom Navigation Controller
   VERSION : 2.0.0
========================================== */

/* ==========================================
   MENU
========================================== */

const MENU = [

    {
        id: "home",
        label: "Home",
        icon: "🏠"
    },

    {
        id: "statistik",
        label: "Statistik",
        icon: "📊"
    },

    {
        id: "ringkasan",
        label: "Ringkasan",
        icon: "📄"
    },

    {
        id: "profile",
        label: "Profile",
        icon: "👤"
    }

];

/* ==========================================
   INIT
========================================== */

document.addEventListener(

    "DOMContentLoaded",

    initNavigation

);

/* ==========================================
   INIT NAVIGATION
========================================== */

function initNavigation(){

    const container =

        document.getElementById(

            "bottom-navigation"

        );

    if(!container){

        return;

    }

    renderNavigation(container);

    registerNavigation(container);

    showPage("home");

}

/* ==========================================
   RENDER
========================================== */

function renderNavigation(container){

    container.innerHTML =

        MENU.map(item => `

            <button
                class="nav-item"
                data-page="${item.id}">

                <span class="nav-icon">

                    ${item.icon}

                </span>

                <span class="nav-label">

                    ${item.label}

                </span>

            </button>

        `).join("");

}

/* ==========================================
   EVENTS
========================================== */

function registerNavigation(container){

    const buttons =

        container.querySelectorAll(

            ".nav-item"

        );

    buttons.forEach(button=>{

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

/* ==========================================
   SHOW PAGE
========================================== */

function showPage(page){

    document

        .querySelectorAll(".page")

        .forEach(section=>{

            section.classList.remove(

                "active-page"

            );

            section.classList.add(

                "hidden"

            );

        });

    const active =

        document.getElementById(

            `${page}-page`

        );

    if(active){

        active.classList.remove(

            "hidden"

        );

        active.classList.add(

            "active-page"

        );

    }

    updateNavigation(page);

}

/* ==========================================
   ACTIVE NAVIGATION
========================================== */

function updateNavigation(page){

    document

        .querySelectorAll(".nav-item")

        .forEach(button=>{

            button.classList.toggle(

                "active",

                button.dataset.page===page

            );

        });

}
