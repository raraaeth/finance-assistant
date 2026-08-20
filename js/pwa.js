/* =====================================================
   Finance Assistant
   FILE : pwa.js
   DESCRIPTION : PWA Service Worker + Install
===================================================== */


/* =====================================================
   SERVICE WORKER
===================================================== */

if (

    "serviceWorker" in navigator

){

    window.addEventListener(

        "load",

        () => {

            navigator.serviceWorker.register(

                "/finance-assistant/sw.js",

                {

                    scope :

                        "/finance-assistant/pages/"

                }

            )

            .then(

                registration => {

                    console.log(

                        "Finance Assistant PWA aktif.",

                        registration.scope

                    );

                }

            )

            .catch(

                error => {

                    console.error(

                        "PWA Service Worker gagal:",

                        error

                    );

                }

            );

        }

    );

}


/* =====================================================
   PWA INSTALL
===================================================== */

let deferredPrompt = null;


/* =====================================================
   BEFORE INSTALL PROMPT
===================================================== */

window.addEventListener(

    "beforeinstallprompt",

    event => {

        /*
         * Browser menahan prompt otomatis.
         * Kita simpan event agar install bisa
         * dipanggil melalui tombol sendiri.
         */

        event.preventDefault();

        deferredPrompt = event;


        console.log(

            "PWA siap di-install."

        );


        showInstallButton();

    }

);


/* =====================================================
   SHOW INSTALL BUTTON
===================================================== */

function showInstallButton(){

    const installButton =

        document.querySelector(

            "#install-pwa"

        );


    if(

        !installButton

    ){

        return;

    }


    installButton.style.display =

        "";


    installButton.disabled =

        false;

}


/* =====================================================
   INSTALL PWA
===================================================== */

async function installPWA(){

    if(

        !deferredPrompt

    ){

        console.log(

            "Install prompt belum tersedia."

        );

        return;

    }


    deferredPrompt.prompt();


    const result =

        await deferredPrompt.userChoice;


    console.log(

        "PWA install result:",

        result.outcome

    );


    deferredPrompt =

        null;


    hideInstallButton();

}


/* =====================================================
   HIDE INSTALL BUTTON
===================================================== */

function hideInstallButton(){

    const installButton =

        document.querySelector(

            "#install-pwa"

        );


    if(

        !installButton

    ){

        return;

    }


    installButton.style.display =

        "none";

}


/* =====================================================
   INSTALL BUTTON EVENT
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        const installButton =

            document.querySelector(

                "#install-pwa"

            );


        if(

            !installButton

        ){

            return;

        }


        /*
         * Sembunyikan dulu.
         * Akan muncul ketika browser
         * menyatakan PWA siap di-install.
         */

        installButton.style.display =

            "none";


        installButton.addEventListener(

            "click",

            installPWA

        );

    }

);


/* =====================================================
   APP INSTALLED
===================================================== */

window.addEventListener(

    "appinstalled",

    () => {

        console.log(

            "Finance Assistant berhasil di-install."

        );


        deferredPrompt =

            null;


        hideInstallButton();

    }

);
