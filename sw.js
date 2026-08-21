/* =====================================================
   Finance Assistant
   FILE : sw.js
   DESCRIPTION : Progressive Web App Service Worker
   VERSION : 1.0.0

   Handles :
   - PWA application shell
   - Global CSS cache
   - Global JS cache
   - Application assets cache
   - Header assets
   - Theme assets
   - PWA icons
   - Hero assets

   IMPORTANT :

   PWA hanya berjalan pada :

       /finance-assistant/pages/

   Root landing page :

       /finance-assistant/

   tidak menjadi bagian dari PWA cache.

   Landing assets juga tidak dicache :

   - landing.css
   - landing.js
   - images/slide/*
===================================================== */


/* =====================================================
   CONFIG
===================================================== */

const CACHE_NAME =

    "finance-assistant-v2";


const BASE_PATH =

    "/finance-assistant";


const APP_PATH =

    BASE_PATH + "/pages";


/* =====================================================
   STATIC CACHE
===================================================== */

const STATIC_ASSETS = [

    /* ================================================
       APPLICATION ENTRY
    ================================================ */

    APP_PATH + "/",


    /* ================================================
       GLOBAL CSS
    ================================================ */

    BASE_PATH + "/css/global.css",

    BASE_PATH + "/css/filter.css",

    BASE_PATH + "/css/navigation.css",


    /* ================================================
       THEMES
    ================================================ */

    BASE_PATH + "/css/themes/dark.css",

    BASE_PATH + "/css/themes/pink.css",

    BASE_PATH + "/css/themes/green.css",


    /* ================================================
       GLOBAL JS
    ================================================ */

    BASE_PATH + "/js/animation.js",

    BASE_PATH + "/js/api.js",

    BASE_PATH + "/js/app.js",

    BASE_PATH + "/js/auth.js",

    BASE_PATH + "/js/chart.js",

    BASE_PATH + "/js/config.js",

    BASE_PATH + "/js/filter.js",

    BASE_PATH + "/js/icon.js",

    BASE_PATH + "/js/navigation.js",

    BASE_PATH + "/js/pwa.js",

    BASE_PATH + "/js/storage.js",

    BASE_PATH + "/js/utils.js",

    BASE_PATH + "/js/workspace.js",


    /* ================================================
       HEADER
    ================================================ */

    BASE_PATH + "/components/header/assets/financial-banner.webp",

    BASE_PATH + "/components/header/assets/saving-banner.webp",

    BASE_PATH + "/components/header/assets/payroll-banner.webp",


    /* ================================================
       PWA ICON
    ================================================ */

    BASE_PATH + "/assets/icons/icon-192.png",

    BASE_PATH + "/assets/icons/icon-512.png",


    /* ================================================
       BANK / PAYMENT ICON
    ================================================ */

    BASE_PATH + "/assets/icons/bca.webp",

    BASE_PATH + "/assets/icons/bri.webp",

    BASE_PATH + "/assets/icons/mandiri.webp",

    BASE_PATH + "/assets/icons/bni.webp",

    BASE_PATH + "/assets/icons/gopay.webp",

    BASE_PATH + "/assets/icons/dana.webp",

    BASE_PATH + "/assets/icons/seabank.webp",

    BASE_PATH + "/assets/icons/shopee.webp",

    BASE_PATH + "/assets/icons/dana_darurat.webp",

    BASE_PATH + "/assets/icons/defaultbank.webp",

    BASE_PATH + "/assets/icons/toples_brangkas.webp",

    BASE_PATH + "/assets/icons/ovo.webp",


    /* ================================================
       HERO
    ================================================ */

    BASE_PATH + "/assets/images/hero/hero-financial.png",

    BASE_PATH + "/assets/images/hero/hero-saving.png",

    BASE_PATH + "/assets/images/hero/hero-payroll.png",

    BASE_PATH + "/assets/images/hero/hero-airdrop.png"

];


/* =====================================================
   INSTALL
===================================================== */

self.addEventListener(

    "install",

    event => {

        event.waitUntil(

            caches.open(

                CACHE_NAME

            )

            .then(

                cache => {

                    return cache.addAll(

                        STATIC_ASSETS

                    );

                }

            )

            .then(

                () => {

                    return self.skipWaiting();

                }

            )

        );

    }

);


/* =====================================================
   ACTIVATE
===================================================== */

self.addEventListener(

    "activate",

    event => {

        event.waitUntil(

            caches.keys()

                .then(

                    cacheNames => {

                        return Promise.all(

                            cacheNames

                                .filter(

                                    cacheName =>

                                        cacheName !==

                                        CACHE_NAME

                                )

                                .map(

                                    cacheName =>

                                        caches.delete(

                                            cacheName

                                        )

                                )

                        );

                    }

                )

                .then(

                    () => {

                        return self.clients.claim();

                    }

                )

        );

    }

);


/* =====================================================
   FETCH
===================================================== */

self.addEventListener(

    "fetch",

    event => {

        const request =

            event.request;


        /* --------------------------------------------
           Hanya handle GET
        -------------------------------------------- */

        if(

            request.method !== "GET"

        ){

            return;

        }


        const url =

            new URL(

                request.url

            );


        /* --------------------------------------------
           Hanya handle aplikasi PWA
           
           /finance-assistant/pages/
        -------------------------------------------- */

        if(

            !url.pathname.startsWith(

                APP_PATH

            )

        ){

            return;

        }


        /* --------------------------------------------
           STATIC ASSETS
           
           Cache First
        -------------------------------------------- */

        if(

            isStaticAsset(

                url.pathname

            )

        ){

            event.respondWith(

                cacheFirst(

                    request

                )

            );

            return;

        }


        /* --------------------------------------------
           PAGE / HTML
           
           Network First
           
           Auth dan redirect tetap mendapatkan
           kondisi terbaru dari server.
        -------------------------------------------- */

        if(

            request.mode === "navigate"

        ){

            event.respondWith(

                networkFirst(

                    request

                )

            );

            return;

        }

    }

);


/* =====================================================
   STATIC ASSET CHECK
===================================================== */

function isStaticAsset(

    pathname

){

    return STATIC_ASSETS.some(

        asset => {

            return asset === pathname;

        }

    );

}


/* =====================================================
   CACHE FIRST
===================================================== */

async function cacheFirst(

    request

){

    const cached =

        await caches.match(

            request

        );


    if(

        cached

    ){

        return cached;

    }


    try{

        const response =

            await fetch(

                request

            );


        if(

            response.ok

        ){

            const cache =

                await caches.open(

                    CACHE_NAME

                );


            await cache.put(

                request,

                response.clone()

            );

        }


        return response;

    }

    catch(

        error

    ){

        return new Response(

            "",

            {

                status : 503,

                statusText :

                    "Offline"

            }

        );

    }

}


/* =====================================================
   NETWORK FIRST
===================================================== */

async function networkFirst(

    request

){

    try{

        const response =

            await fetch(

                request

            );


        if(

            response.ok

        ){

            const cache =

                await caches.open(

                    CACHE_NAME

                );


            await cache.put(

                request,

                response.clone()

            );

        }


        return response;

    }

    catch(

        error

    ){

        const cached =

            await caches.match(

                request

            );


        if(

            cached

        ){

            return cached;

        }


        return new Response(

            "Finance Assistant sedang offline.",

            {

                status : 503,

                statusText :

                    "Offline",

                headers : {

                    "Content-Type" :

                        "text/plain; charset=utf-8"

                }

            }

        );

    }

}
