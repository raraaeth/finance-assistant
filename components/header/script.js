/* =====================================================
   GLOBAL HEADER
   FILE : script.js
   DESCRIPTION : Header Component
   VERSION : 2.0.0
===================================================== */

/* =====================================================
   HEADER COMPONENT
===================================================== */

export const Header = {

    async render({

        container,

        theme = "saving",

        path

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

        const component =

            `${path}index.html`;

        const response =

            await fetch(

                component

            );

        element.innerHTML =

            await response.text();

        const banners = {

            saving :

                `${path}assets/saving-banner.webp`,

            financial :

                `${path}assets/financial-banner.webp`,

            payroll :

                `${path}assets/payroll-banner.webp`

        };

        const banner =

            element.querySelector(

                "#header-banner"

            );

        if(

            !banner

        ){

            return;

        }

        banner.src =

            banners[theme] ??

            banners.saving;

    }

};
