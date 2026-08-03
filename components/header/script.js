/* =====================================================
   GLOBAL HEADER
   FILE : script.js
   DESCRIPTION : Header Component
   VERSION : 1.0.0
===================================================== */


/* =====================================================
   CONFIG
===================================================== */

const BANNERS = {

    saving :

        "components/header/assets/saving-banner.webp",

    financial :

        "components/header/assets/financial-banner.webp",

    payroll :

        "components/header/assets/payroll-banner.webp"

};


/* =====================================================
   HEADER
===================================================== */

export const Header = {

    async render({

        container,

        theme = "saving"

    }){

        const element =

            document.querySelector(

                container

            );

        if(

            !element

        ){

            return;

        }

        const response =

            await fetch(

                "components/header/index.html"

            );

        element.innerHTML =

            await response.text();

        const banner =

            element.querySelector(

                "#header-banner"

            );

        banner.src =

            BANNERS[theme];

    }

};
