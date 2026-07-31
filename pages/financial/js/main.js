/*==================================
    Financial
==================================*/

document.addEventListener("DOMContentLoaded", init);


/*==================================
    Initialize
==================================*/

function init() {

    initTabs();

}


/*==================================
    Tab Navigation
==================================*/

function initTabs() {

    const tabs = document.querySelectorAll(".tab-button");

    const pages = document.querySelectorAll(".page");

    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            const target = tab.dataset.page;

            tabs.forEach(item => {

                item.classList.remove("active");

            });

            tab.classList.add("active");

            pages.forEach(page => {

                page.classList.remove("active-page");

            });

            const activePage = document.getElementById(`fin-${target}`);

            if (activePage) {

                activePage.classList.add("active-page");

            }

        });

    });

}
