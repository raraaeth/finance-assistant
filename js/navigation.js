/* ==========================================
   GLOBAL BOTTOM NAVIGATION
========================================== */

/* ==========================================
   MENU CONFIG
========================================== */

const MENU = [

    {
        id: "home",
        label: "Home",
        icon: `<span class="nav-icon">🏠</span>`
    },

    {
        id: "statistik",
        label: "Statistik",
        icon: `<span class="nav-icon">📊</span>`
    },

    {
        id: "ringkasan",
        label: "Ringkasan",
        icon: `<span class="nav-icon">📄</span>`
    },

    {
        id: "profile",
        label: "Profile",
        icon: `<span class="nav-icon">👤</span>`
    }

];

/* ==========================================
   INITIALIZE
========================================== */

const container =

    document.getElementById(

        "bottom-navigation"

    );

if(container){

    renderNavigation();

}


