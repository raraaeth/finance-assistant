/* =====================================================
   Finance Assistant
   FILE        : pwa.js
   DESCRIPTION : PWA Service Worker + Universal Install
   VERSION     : 1.3.0

   Struktur domain baru :

       https://financeassistant.web.id/

   Service Worker :

       /sw.js

   PWA Scope :

       /pages/

   INSTALL :

   - Native install prompt jika tersedia
   - Fallback installation guide jika prompt
     tidak tersedia
   - Mendukung tombol install pada landing
     maupun dashboard
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

                "/sw.js",

                {

                    scope :

                        "/pages/"

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
   INSTALL STATE
===================================================== */

/*
 * Browser yang menyediakan
 * beforeinstallprompt dapat menggunakan
 * native install dialog.
 *
 * Browser yang tidak menyediakan event ini
 * tetap dapat menggunakan tombol install
 * untuk membuka panduan instalasi.
 */


/* =====================================================
   CHECK INSTALLED STATE
===================================================== */

function isPWAInstalled(){

    /*
     * Standalone display mode
     */

    if(

        window.matchMedia(

            "(display-mode: standalone)"

        ).matches

    ){

        return true;

    }


    /*
     * iOS standalone
     */

    if(

        window.navigator.standalone === true

    ){

        return true;

    }


    /*
     * Android / browser tertentu
     */

    if(

        window.matchMedia(

            "(display-mode: fullscreen)"

        ).matches

    ){

        return true;

    }


    if(

        window.matchMedia(

            "(display-mode: minimal-ui)"

        ).matches

    ){

        return true;

    }


    return false;

}


/* =====================================================
   BEFORE INSTALL PROMPT
===================================================== */

window.addEventListener(

    "beforeinstallprompt",

    event => {

        /*
         * Browser menyediakan native
         * install prompt.
         *
         * Jangan tampilkan otomatis.
         * Simpan event untuk tombol install.
         */

        event.preventDefault();


        deferredPrompt = event;


        console.log(

            "PWA siap di-install melalui native prompt."

        );


        showInstallButton();

    }

);


/* =====================================================
   SHOW INSTALL BUTTON
===================================================== */

function showInstallButton(){

    if(

        isPWAInstalled()

    ){

        hideInstallButton();

        return;

    }


    const installButtons =

        document.querySelectorAll(

            "#install-pwa, .install-pwa"

        );


    if(

        !installButtons.length

    ){

        return;

    }


    installButtons.forEach(

        button => {

            button.style.display = "";

            button.disabled = false;

        }

    );

}


/* =====================================================
   HIDE INSTALL BUTTON
===================================================== */

function hideInstallButton(){

    const installButtons =

        document.querySelectorAll(

            "#install-pwa, .install-pwa"

        );


    if(

        !installButtons.length

    ){

        return;

    }


    installButtons.forEach(

        button => {

            button.style.display = "none";

        }

    );

}


/* =====================================================
   DETECT BROWSER
===================================================== */

function getBrowserInfo(){

    const userAgent =

        navigator.userAgent || "";


    const platform =

        navigator.platform || "";


    const isAndroid =

        /Android/i.test(

            userAgent

        );


    const isIOS =

        /iPhone|iPad|iPod/i.test(

            userAgent

        )

        ||

        (

            platform === "MacIntel"

            &&

            navigator.maxTouchPoints > 1

        );


    const isBrave =

        navigator.brave

        &&

        typeof navigator.brave.isBrave ===

            "function";


    const isChrome =

        /Chrome|CriOS/i.test(

            userAgent

        )

        &&

        !/Edg|OPR|Opera|Brave/i.test(

            userAgent

        );


    const isEdge =

        /Edg/i.test(

            userAgent

        );


    const isFirefox =

        /Firefox|FxiOS/i.test(

            userAgent

        );


    const isSamsung =

        /SamsungBrowser/i.test(

            userAgent

        );


    const isOpera =

        /OPR|Opera/i.test(

            userAgent

        );


    return {

        isAndroid,

        isIOS,

        isBrave,

        isChrome,

        isEdge,

        isFirefox,

        isSamsung,

        isOpera

    };

}


/* =====================================================
   INSTALL GUIDE
===================================================== */

function showInstallGuide(){

    const browser =

        getBrowserInfo();


    let title =

        "Install Finance Assistant";


    let message = "";


    /* =================================================
       iOS
    ================================================= */

    if(

        browser.isIOS

    ){

        title =

            "Install Finance Assistant";


        message =

            "Untuk memasang Finance Assistant sebagai aplikasi:\n\n"

            +

            "1. Buka menu Share / Bagikan pada browser.\n"

            +

            "2. Pilih \"Add to Home Screen\" / \"Tambahkan ke Layar Utama\".\n"

            +

            "3. Pilih Add / Tambahkan.\n\n"

            +

            "Setelah ditambahkan, buka Finance Assistant dari ikon aplikasi tersebut.";

    }


    /* =================================================
       Android
    ================================================= */

    else if(

        browser.isAndroid

    ){

        title =

            "Install Finance Assistant";


        /*
         * Brave
         */

        if(

            browser.isBrave

        ){

            message =

                "Finance Assistant siap digunakan sebagai PWA.\n\n"

                +

                "Jika dialog Install tidak muncul otomatis:\n\n"

                +

                "1. Buka menu browser (⋮).\n"

                +

                "2. Cari pilihan \"Install app\" jika tersedia.\n"

                +

                "3. Pilih Install.\n\n"

                +

                "Jika Brave hanya menampilkan \"Add to Home screen\", "

                +

                "pilihan tersebut dikendalikan oleh versi Brave/perangkat "

                +

                "dan tidak dapat dipaksa menjadi native install dialog "

                +

                "oleh JavaScript.";

        }


        /*
         * Samsung Internet
         */

        else if(

            browser.isSamsung

        ){

            message =

                "Finance Assistant siap digunakan sebagai PWA.\n\n"

                +

                "Buka menu browser dan pilih "

                +

                "\"Add page to\" → \"Home screen\" "

                +

                "atau pilihan install aplikasi jika tersedia.";

        }


        /*
         * Chrome / Edge / Opera
         */

        else if(

            browser.isChrome

            ||

            browser.isEdge

            ||

            browser.isOpera

        ){

            message =

                "Finance Assistant siap digunakan sebagai PWA.\n\n"

                +

                "Jika dialog install tidak muncul otomatis:\n\n"

                +

                "1. Buka menu browser (⋮).\n"

                +

                "2. Cari \"Install app\" atau \"Install Finance Assistant\".\n"

                +

                "3. Pilih Install.";

        }


        /*
         * Browser Android lainnya
         */

        else {

            message =

                "Finance Assistant siap digunakan sebagai PWA.\n\n"

                +

                "Buka menu browser dan cari pilihan "

                +

                "\"Install app\", \"Install\", "

                +

                "atau \"Add to Home screen\".\n\n"

                +

                "Pilihan yang tersedia bergantung pada browser.";

        }

    }


    /* =================================================
       Desktop
    ================================================= */

    else {

        title =

            "Install Finance Assistant";


        message =

            "Finance Assistant dapat dipasang sebagai aplikasi "

            +

            "jika browser mendukung instalasi PWA.\n\n"

            +

            "Buka menu browser dan cari pilihan "

            +

            "\"Install Finance Assistant\" atau \"Install app\".";

    }


    console.log(

        title,

        message

    );


    /*
     * Fallback paling kompatibel.
     *
     * Tidak membuat elemen HTML tambahan
     * sehingga tidak bergantung pada CSS
     * atau struktur halaman tertentu.
     */

    window.alert(

        message

    );

}


/* =====================================================
   INSTALL PWA
===================================================== */

async function installPWA(){

    /*
     * Jika sudah ter-install,
     * tidak perlu melakukan apa-apa.
     */

    if(

        isPWAInstalled()

    ){

        console.log(

            "Finance Assistant sudah ter-install."

        );

        hideInstallButton();

        return;

    }


    /* =================================================
       NATIVE INSTALL PROMPT
    ================================================= */

    if(

        deferredPrompt

    ){

        try{

            deferredPrompt.prompt();


            const result =

                await deferredPrompt.userChoice;


            console.log(

                "PWA install result:",

                result.outcome

            );


            /*
             * Prompt hanya dapat digunakan
             * sekali.
             */

            deferredPrompt =

                null;


            /*
             * Jika user memilih install,
             * tombol akan disembunyikan.
             */

            if(

                result.outcome ===

                    "accepted"

            ){

                hideInstallButton();

            }

        }

        catch(

            error

        ){

            console.error(

                "PWA install gagal:",

                error

            );


            deferredPrompt =

                null;

        }


        return;

    }


    /* =================================================
       FALLBACK
    ================================================= */

    console.log(

        "Native install prompt tidak tersedia."

    );


    showInstallGuide();

}


/* =====================================================
   INSTALL BUTTON EVENT
===================================================== */

/*
 * Menggunakan event delegation.
 *
 * Keuntungannya:
 *
 * - Tombol boleh sudah ada saat page load
 * - Tombol boleh dibuat secara dynamic
 * - Bisa dipakai di landing
 * - Bisa dipakai di dashboard
 * - Tidak perlu bind ulang setelah render
 */

document.addEventListener(

    "click",

    event => {

        const installButton =

            event.target.closest(

                "#install-pwa, .install-pwa"

            );


        if(

            !installButton

        ){

            return;

        }


        event.preventDefault();


        installPWA();

    }

);


/* =====================================================
   INITIALIZE INSTALL BUTTON
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        /*
         * Jika sudah ter-install sebagai PWA,
         * sembunyikan tombol.
         */

        if(

            isPWAInstalled()

        ){

            hideInstallButton();

            return;

        }


        /*
         * Tombol tetap ditampilkan walaupun
         * beforeinstallprompt belum tersedia.
         *
         * Ini penting untuk browser seperti
         * Brave/browser lain yang tidak mengirim
         * event tersebut.
         */

        showInstallButton();

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


/* =====================================================
   DISPLAY MODE CHANGE
===================================================== */

window.addEventListener(

    "resize",

    () => {

        if(

            isPWAInstalled()

        ){

            hideInstallButton();

        }

    }

);
