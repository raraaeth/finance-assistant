/* =====================================================
   Finance Assistant
   Component    : Global Overlay
   File         : script.js
   Version      : 1.3.1

   Description :
   Reusable Global Overlay
   With PNG Export

   Export Support :
   - Browser
   - PWA
   - Android WebView / App

   Direction :
   Right → Left
===================================================== */


/* =====================================================
   STATE
===================================================== */

let initialized = false;

let html2canvasLoaded = false;


/* =====================================================
   LOAD HTML2CANVAS
===================================================== */

async function loadHtml2Canvas(){

    if(

        html2canvasLoaded

        &&

        window.html2canvas

    ){

        return true;

    }


    return new Promise(

        resolve => {

            const existing =

                document.querySelector(

                    'script[data-html2canvas]'

                );


            /* =========================================
               SCRIPT SUDAH ADA
            ========================================= */

            if(

                existing

            ){

                if(

                    window.html2canvas

                ){

                    html2canvasLoaded =

                        true;

                    resolve(

                        true

                    );

                    return;

                }


                let finished =

                    false;


                const success =

                    () => {

                        if(

                            finished

                        ){

                            return;

                        }


                        finished =

                            true;


                        html2canvasLoaded =

                            true;


                        resolve(

                            true

                        );

                    };


                const failed =

                    () => {

                        if(

                            finished

                        ){

                            return;

                        }


                        finished =

                            true;


                        resolve(

                            false

                        );

                    };


                existing.addEventListener(

                    "load",

                    success,

                    {

                        once : true

                    }

                );


                existing.addEventListener(

                    "error",

                    failed,

                    {

                        once : true

                    }

                );


                setTimeout(

                    () => {

                        if(

                            finished

                        ){

                            return;

                        }


                        finished =

                            true;


                        console.error(

                            "html2canvas timeout"

                        );


                        resolve(

                            false

                        );

                    },

                    10000

                );


                return;

            }


            /* =========================================
               BUAT SCRIPT
            ========================================= */

            const script =

                document.createElement(

                    "script"

                );


            script.src =

                "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";


            script.dataset.html2canvas =

                "true";


            let finished =

                false;


            script.onload =

                () => {

                    if(

                        finished

                    ){

                        return;

                    }


                    finished =

                        true;


                    html2canvasLoaded =

                        true;


                    resolve(

                        true

                    );

                };


            script.onerror =

                () => {

                    if(

                        finished

                    ){

                        return;

                    }


                    finished =

                        true;


                    console.error(

                        "html2canvas gagal dimuat"

                    );


                    resolve(

                        false

                    );

                };


            document.head.appendChild(

                script

            );


            /* =========================================
               TIMEOUT
            ========================================= */

            setTimeout(

                () => {

                    if(

                        finished

                    ){

                        return;

                    }


                    finished =

                        true;


                    console.error(

                        "html2canvas timeout"

                    );


                    resolve(

                        false

                    );

                },

                10000

            );

        }

    );

}


/* =====================================================
   CANVAS TO BLOB
===================================================== */

function canvasToBlob(

    canvas

){

    return new Promise(

        resolve => {

            canvas.toBlob(

                blob => {

                    resolve(

                        blob

                    );

                },

                "image/png"

            );

        }

    );

}


/* =====================================================
   FILE NAME
===================================================== */

function createExportFileName(){

    const title =

        document

            .getElementById(

                "global-overlay-title"

            )

            ?.textContent

            ||

            "Rincian-Gaji";


    const filename =

        title

            .trim()

            .replace(

                /[^a-z0-9]+/gi,

                "-"

            )

            .replace(

                /^-+|-+$/g,

                ""

            )

            .toLowerCase();


    return (

        `${

            filename ||

            "rincian-gaji"

        }.png`

    );

}


/* =====================================================
   DETECT ANDROID WEBVIEW / APP
===================================================== */

function isAndroidWebView(){

    const ua =

        navigator.userAgent ||

        "";


    const isAndroid =

        /Android/i.test(

            ua

        );


    if(

        !isAndroid

    ){

        return false;

    }


    /*
     * Android WebView biasanya mempunyai
     * "; wv)" pada User Agent.
     */

    if(

        /;\s*wv\)/i.test(

            ua

        )

    ){

        return true;

    }


    /*
     * Fallback untuk beberapa wrapper
     * Android yang menggunakan pola
     * Version/4.0 + Chrome.
     */

    if(

        /Version\/4\.0/i.test(

            ua

        )

        &&

        /Chrome\//i.test(

            ua

        )

        &&

        /Mobile/i.test(

            ua

        )

    ){

        return true;

    }


    return false;

}


/* =====================================================
   NORMAL DOWNLOAD
===================================================== */

function downloadPNG(

    blob,

    filename

){

    try{

        const url =

            URL.createObjectURL(

                blob

            );


        const link =

            document.createElement(

                "a"

            );


        link.href =

            url;


        link.download =

            filename;


        link.style.display =

            "none";


        document.body.appendChild(

            link

        );


        link.click();


        setTimeout(

            () => {

                link.remove();

                URL.revokeObjectURL(

                    url

                );

            },

            1500

        );


        return true;

    }

    catch(error){

        console.error(

            "Download PNG Error:",

            error

        );


        return false;

    }

}


/* =====================================================
   OPEN BLOB URL
===================================================== */

function openBlobURL(

    blob

){

    try{

        const url =

            URL.createObjectURL(

                blob

            );


        const opened =

            window.open(

                url,

                "_blank"

            );


        if(

            !opened

        ){

            /*
             * Fallback navigasi langsung.
             */

            window.location.href =

                url;

        }


        /*
         * Jangan langsung revoke karena
         * halaman baru masih membutuhkan URL.

         * Biarkan browser mengelolanya.
         */

        return true;

    }

    catch(error){

        console.error(

            "Open Blob URL Error:",

            error

        );


        return false;

    }

}


/* =====================================================
   WEB SHARE WITH TIMEOUT
===================================================== */

async function tryWebShare(

    blob,

    filename

){

    if(

        typeof navigator.share !==

        "function"

    ){

        return false;

    }


    const file =

        new File(

            [

                blob

            ],

            filename,

            {

                type :

                    "image/png"

            }

        );


    /*
     * Kalau canShare tersedia,
     * pastikan file memang bisa dishare.
     */

    if(

        typeof navigator.canShare ===

        "function"

    ){

        try{

            const supported =

                navigator.canShare({

                    files : [

                        file

                    ]

                });


            if(

                !supported

            ){

                return false;

            }

        }

        catch(error){

            return false;

        }

    }


    /*
     * Jangan biarkan WebView menggantung
     * selamanya pada navigator.share().
     */

    const sharePromise =

        navigator.share({

            title :

                "Rincian Gaji",

            text :

                "Rincian gaji Finance Assistant",

            files : [

                file

            ]

        })

        .then(

            () => true

        )

        .catch(

            error => {

                /*
                 * User membatalkan share.
                 */

                if(

                    error?.name ===

                    "AbortError"

                ){

                    return true;

                }


                console.error(

                    "Web Share Error:",

                    error

                );


                return false;

            }

        );


    const timeoutPromise =

        new Promise(

            resolve => {

                setTimeout(

                    () => {

                        resolve(

                            false

                        );

                    },

                    2500

                );

            }

        );


    return Promise.race(

        [

            sharePromise,

            timeoutPromise

        ]

    );

}


/* =====================================================
   APP EXPORT
===================================================== */

async function exportForApp(

    blob,

    filename

){

    /*
     * METODE 1
     *
     * Web Share API
     *
     * Kalau WebView mendukung,
     * Android akan membuka Share Sheet.
     */

    const shared =

        await tryWebShare(

            blob,

            filename

        );


    if(

        shared

    ){

        return true;

    }


    /*
     * METODE 2
     *
     * Download biasa.
     *
     * Beberapa WebView tetap meneruskan
     * download ke sistem Android.
     */

    const downloaded =

        downloadPNG(

            blob,

            filename

        );


    if(

        downloaded

    ){

        /*
         * Kita tidak langsung menganggap
         * berhasil secara native, tetapi
         * metode sudah dipanggil.
         */

        return true;

    }


    /*
     * METODE 3
     *
     * Buka Blob URL.
     *
     * Ini menjadi fallback terakhir untuk
     * WebView yang tidak menjalankan
     * <a download>.
     */

    return openBlobURL(

        blob

    );

}


/* =====================================================
   OVERLAY
===================================================== */

export const Overlay = {


    /* =================================================
       INIT
    ================================================= */

    async init(){

        if(

            initialized

        ){

            return;

        }


        /* =============================================
           CHECK EXISTING
        ============================================= */

        let overlay =

            document.getElementById(

                "global-overlay"

            );


        /* =============================================
           LOAD HTML
        ============================================= */

        if(

            !overlay

        ){

            try{

                const response =

                    await fetch(

                        new URL(

                            "./index.html",

                            import.meta.url

                        )

                    );


                if(

                    !response.ok

                ){

                    throw new Error(

                        "Overlay HTML gagal dimuat"

                    );

                }


                const html =

                    await response.text();


                const wrapper =

                    document.createElement(

                        "div"

                    );


                wrapper.innerHTML =

                    html;


                const element =

                    wrapper.firstElementChild;


                document.body.appendChild(

                    element

                );


                overlay =

                    element;

            }

            catch(error){

                console.error(

                    "Global Overlay Error:",

                    error

                );

                return;

            }

        }


        /* =============================================
           CLOSE BUTTON
        ============================================= */

        const closeButton =

            document.getElementById(

                "global-overlay-close"

            );


        if(

            closeButton

        ){

            closeButton.addEventListener(

                "click",

                () => {

                    Overlay.close();

                }

            );

        }


        /* =============================================
           BACKDROP
        ============================================= */

        const backdrop =

            document.getElementById(

                "global-overlay-backdrop"

            );


        if(

            backdrop

        ){

            backdrop.addEventListener(

                "click",

                () => {

                    Overlay.close();

                }

            );

        }


        /* =============================================
           EXPORT BUTTON
        ============================================= */

        const exportButton =

            document.getElementById(

                "global-overlay-export"

            );


        if(

            exportButton

        ){

            exportButton.addEventListener(

                "click",

                () => {

                    Overlay.exportPNG();

                }

            );

        }


        /* =============================================
           ESC
        ============================================= */

        document.addEventListener(

            "keydown",

            event => {

                if(

                    event.key === "Escape"

                ){

                    Overlay.close();

                }

            }

        );


        initialized =

            true;

    },


    /* =================================================
       OPEN
    ================================================= */

    async open({

        title = "Rincian",

        period = "",

        content = ""

    } = {}){


        await Overlay.init();


        const overlay =

            document.getElementById(

                "global-overlay"

            );


        const titleElement =

            document.getElementById(

                "global-overlay-title"

            );


        const periodElement =

            document.getElementById(

                "global-overlay-period"

            );


        const contentElement =

            document.getElementById(

                "global-overlay-content"

            );


        if(

            !overlay

        ){

            return;

        }


        /* =============================================
           TITLE
        ============================================= */

        if(

            titleElement

        ){

            titleElement.textContent =

                title;

        }


        /* =============================================
           PERIOD
        ============================================= */

        if(

            periodElement

        ){

            periodElement.textContent =

                period;

        }


        /* =============================================
           CONTENT
        ============================================= */

        if(

            contentElement

        ){

            contentElement.innerHTML =

                content;

        }


        /* =============================================
           RESET BUTTON
        ============================================= */

        const exportButton =

            document.getElementById(

                "global-overlay-export"

            );


        if(

            exportButton

        ){

            exportButton.disabled =

                false;


            exportButton.textContent =

                "Simpan sebagai gambar";

        }


        /* =============================================
           SHOW
        ============================================= */

        overlay.classList.add(

            "is-open"

        );


        document.body.classList.add(

            "overlay-open"

        );

    },


    /* =================================================
       EXPORT PNG
    ================================================= */

    async exportPNG(){

        const panel =

            document.getElementById(

                "global-overlay-panel"

            );


        if(

            !panel

        ){

            return;

        }


        const exportButton =

            document.getElementById(

                "global-overlay-export"

            );


        /* =============================================
           LOCK BUTTON
        ============================================= */

        if(

            exportButton

        ){

            exportButton.disabled =

                true;


            exportButton.textContent =

                "Menyiapkan gambar...";

        }


        /* =============================================
           LOAD LIBRARY
        ============================================= */

        const ready =

            await loadHtml2Canvas();


        if(

            !ready

            ||

            !window.html2canvas

        ){

            if(

                exportButton

            ){

                exportButton.disabled =

                    false;


                exportButton.textContent =

                    "Simpan sebagai gambar";

            }


            return;

        }


        /* =============================================
           CREATE CLONE
        ============================================= */

        const clone =

            panel.cloneNode(

                true

            );


        /* =============================================
           REMOVE CLOSE BUTTON
        ============================================= */

        const closeButton =

            clone.querySelector(

                "#global-overlay-close"

            );


        if(

            closeButton

        ){

            closeButton.remove();

        }


        /* =============================================
           REMOVE EXPORT BUTTON
        ============================================= */

        const clonedExportButton =

            clone.querySelector(

                "#global-overlay-export"

            );


        if(

            clonedExportButton

        ){

            clonedExportButton.remove();

        }


        /* =============================================
           CLONE STYLE
        ============================================= */

        clone.style.position =

            "absolute";


        clone.style.left =

            "0";


        clone.style.top =

            "0";


        clone.style.right =

            "auto";


        clone.style.bottom =

            "auto";


        clone.style.width =

            `${panel.offsetWidth}px`;


        clone.style.height =

            "auto";


        clone.style.maxHeight =

            "none";


        clone.style.minHeight =

            "0";


        clone.style.overflow =

            "visible";


        clone.style.overflowY =

            "visible";


        clone.style.transform =

            "none";


        clone.style.backgroundColor =

            "#ffffff";


        clone.style.boxSizing =

            "border-box";


        /* =============================================
           EXPORT CONTAINER
        ============================================= */

        const container =

            document.createElement(

                "div"

            );


        container.style.position =

            "absolute";


        container.style.left =

            "-100000px";


        container.style.top =

            "0";


        container.style.width =

            `${panel.offsetWidth}px`;


        container.style.backgroundColor =

            "#ffffff";


        container.style.zIndex =

            "-1";


        container.appendChild(

            clone

        );


        document.body.appendChild(

            container

        );


        /* =============================================
           WAIT FOR LAYOUT
        ============================================= */

        await new Promise(

            resolve =>

                requestAnimationFrame(

                    () =>

                        requestAnimationFrame(

                            resolve

                        )

                )

        );


        /* =============================================
           CAPTURE
        ============================================= */

        try{

            const canvas =

                await window.html2canvas(

                    clone,

                    {

                        backgroundColor :

                            "#ffffff",

                        scale :

                            2,

                        useCORS :

                            true,

                        logging :

                            false,

                        width :

                            clone.scrollWidth,

                        height :

                            clone.scrollHeight,

                        windowWidth :

                            clone.scrollWidth,

                        windowHeight :

                            clone.scrollHeight

                    }

                );


            /* =========================================
               CANVAS → PNG
            ========================================= */

            const blob =

                await canvasToBlob(

                    canvas

                );


            if(

                !blob

            ){

                throw new Error(

                    "PNG Blob gagal dibuat"

                );

            }


            /* =========================================
               FILE NAME
            ========================================= */

            const filename =

                createExportFileName();


            /* =========================================
               DETECT APP
            ========================================= */

            const appMode =

                isAndroidWebView();


            /* =========================================
               APP
            ========================================= */

            if(

                appMode

            ){

                await exportForApp(

                    blob,

                    filename

                );

            }

            /* =========================================
               BROWSER / PWA
            ========================================= */

            else{

                /*
                 * Browser dan PWA sengaja langsung
                 * menggunakan download seperti
                 * versi awal.
                 */

                downloadPNG(

                    blob,

                    filename

                );

            }

        }

        catch(error){

            console.error(

                "Export PNG Error:",

                error

            );

        }

        finally{

            /* =========================================
               REMOVE CLONE
            ========================================= */

            container.remove();


            /* =========================================
               RESTORE BUTTON
            ========================================= */

            if(

                exportButton

            ){

                exportButton.disabled =

                    false;


                exportButton.textContent =

                    "Simpan sebagai gambar";

            }

        }

    },


    /* =================================================
       CLOSE
    ================================================= */

    close(){

        const overlay =

            document.getElementById(

                "global-overlay"

            );


        if(

            !overlay

        ){

            return;

        }


        overlay.classList.remove(

            "is-open"

        );


        document.body.classList.remove(

            "overlay-open"

        );

    }

};
