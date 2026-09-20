/* =====================================================
   Finance Assistant
   Component    : Global Overlay
   File         : script.js
   Version      : 1.3.0

   Description :
   Reusable Global Overlay
   With PNG Export

   Export Support :
   - Browser Download
   - PWA
   - Android WebView / App
   - Web Share API
   - Share to Files / Save to Device

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
               EXISTING SCRIPT
            ========================================= */

            if(

                existing

            ){

                /*
                 * Script sudah selesai dimuat.
                 */

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


                /*
                 * Jangan menunggu selamanya.
                 */

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
               CREATE SCRIPT
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
   CREATE FILE NAME
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
   SHARE PNG
===================================================== */

async function sharePNG(

    blob,

    filename

){

    /*
     * Pastikan Web Share tersedia.
     */

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
     * Tidak semua browser/WebView
     * mendukung sharing file.
     */

    if(

        typeof navigator.canShare ===

        "function"

    ){

        let canShareFiles =

            false;


        try{

            canShareFiles =

                navigator.canShare({

                    files : [

                        file

                    ]

                });

        }

        catch(error){

            canShareFiles =

                false;

        }


        if(

            !canShareFiles

        ){

            return false;

        }

    }


    try{

        await navigator.share({

            title :

                "Rincian Gaji",

            text :

                "Rincian gaji Finance Assistant",

            files : [

                file

            ]

        });


        return true;

    }

    catch(error){

        /*
         * Jika user menutup Share Sheet,
         * jangan dianggap sebagai error fatal.
         */

        if(

            error?.name ===

            "AbortError"

        ){

            return true;

        }


        console.error(

            "Share PNG Error:",

            error

        );


        return false;

    }

}


/* =====================================================
   DOWNLOAD PNG
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


        /*
         * Tunggu sebentar sebelum
         * menghapus object URL.
         */

        setTimeout(

            () => {

                link.remove();

                URL.revokeObjectURL(

                    url

                );

            },

            1000

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
           RESET EXPORT BUTTON
        ============================================= */

        const exportButton =

            document.getElementById(

                "global-overlay-export"

            );


        if(

            exportButton

        ){

            exportButton.textContent =

                "Simpan sebagai gambar";

            exportButton.disabled =

                false;

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


        /*
         * Cegah klik berkali-kali ketika
         * proses export sedang berlangsung.
         */

        if(

            exportButton

        ){

            exportButton.disabled =

                true;

            exportButton.textContent =

                "Menyiapkan gambar...";

        }


        /* =============================================
           LOAD HTML2CANVAS
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

                    "Export tidak tersedia";

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
               CANVAS → PNG BLOB
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
               TRY WEB SHARE
            ========================================= */

            const shared =

                await sharePNG(

                    blob,

                    filename

                );


            if(

                shared

            ){

                /*
                 * Jika Share Sheet berhasil dibuka
                 * atau user menutup Share Sheet,
                 * proses selesai.
                 */

                return;

            }


            /* =========================================
               FALLBACK DOWNLOAD
            ========================================= */

            const downloaded =

                downloadPNG(

                    blob,

                    filename

                );


            if(

                !downloaded

            ){

                console.error(

                    "PNG tidak dapat disimpan"

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
