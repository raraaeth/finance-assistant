/* =====================================================
   GLOBAL HEADER
   FILE : script.js
   DESCRIPTION : Header Component
   VERSION : 3.0.0
===================================================== */


/* =====================================================
   CONFIG
===================================================== */

const BASE =

    "/components/header/";


/* =====================================================
   THEMES
===================================================== */

const BANNERS = {

    saving :

        "saving-banner.webp",

    kas :

        "kas-banner.webp",

    financial :

        "financial-banner.webp",

    airdrop :

        "airdrop-banner.webp",

    payroll :

        "payroll-banner.webp"
   

};


/* =====================================================
   HEADER
===================================================== */

export const Header = {

    async render({

        container,

        theme = "saving"

    }){

        const target =

            document.querySelector(

                container

            );

        if(

            !target

        ){

            return;

        }

        const response =

            await fetch(

                `${BASE}index.html`

            );

        target.innerHTML =

            await response.text();

        const banner =

            target.querySelector(

                "#header-banner"

            );

        if(

            !banner

        ){

            return;

        }

        banner.src =

            `${BASE}assets/${

                BANNERS[theme] ??

                BANNERS.saving

            }`;

    }

};
