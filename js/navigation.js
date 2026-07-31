/* ==========================================
   GLOBAL BOTTOM NAVIGATION
========================================== */

/* ==========================================
   MENU CONFIG
========================================== */

const MENU = [

    {
        id: "financial",
        label: "Financial",
        icon: `<span class="nav-icon">💰</span>`,
        href: "../financial/index.html"
    },

    {
        id: "payroll",
        label: "Payroll",
        icon: `<span class="nav-icon">💼</span>`,
        href: "../payroll/index.html"
    },

    {
        id: "saving",
        label: "Saving",
        icon: `<span class="nav-icon">🏦</span>`,
        href: "../saving/index.html"
    },

    {
        id: "profile",
        label: "Profile",
        icon: `<span class="nav-icon">👤</span>`,
        href: "../profile/index.html"
    }

];

/* ==========================================
   INITIALIZE NAVIGATION
========================================== */

const container = document.getElementById("bottom-navigation");

if (container) {

    const currentPage = getCurrentPage();

    renderNavigation(currentPage);

    registerNavigationEvents();

}

/* ==========================================
   GET CURRENT PAGE
========================================== */

function getCurrentPage() {

    const paths = window.location.pathname.split("/");

    return paths[paths.length - 2];

}

/* ==========================================
   RENDER NAVIGATION
========================================== */

function renderNavigation(currentPage) {

    container.innerHTML = MENU.map(item => `

        <button
            class="nav-item ${item.id === currentPage ? "active" : ""}"
            data-href="${item.href}"
        >

            ${item.icon}

            <span class="nav-label">
                ${item.label}
            </span>

        </button>

    `).join("");

}

/* ==========================================
   NAVIGATION EVENTS
========================================== */

function registerNavigationEvents() {

    const buttons = container.querySelectorAll(".nav-item");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const href = button.dataset.href;

            if (!href) return;

            window.location.href = href;

        });

    });

}
