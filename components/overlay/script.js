/* =====================================================
   Finance Assistant
   Component    : Global Overlay
   File         : script.js
   Version      : 1.2.0

   Description :
   Reusable Global Overlay
   With PNG Export

   Direction :
   Right → Left
===================================================== */


/* =====================================================
   STATE
===================================================== */

let initialized = false;

let html2canvasLoaded = false;


/* =====================================================
   EXPORT STATUS
===================================================== */

function setExportStatus(
    text
){

    const button =
        document.getElementById(
            "global-overlay-export"
        );


    if(
        button
    ){

        button.textContent =
            text;

    }

}


/* =====================================================
   LOAD HTML2CANVAS
===================================================== */

async function loadHtml2Canvas(){

    /* =============================================
       ALREADY LOADED
    ============================================= */

    if(

        html2canvasLoaded

        &&

        window.html2canvas

    ){

        return true;

    }


    /* =============================================
       EXISTING SCRIPT
    ============================================= */

    return new Promise(

        resolve => {

            const existing =

                document.querySelector(

                    'script[data-html2canvas]'

                );


            if(

                existing

            ){

                /*
                 * Jika script sebenarnya sudah selesai
                 * dimuat sebelum listener dipasang.
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
                 * Timeout.
                 *
                 * Supaya APK tidak menunggu
                 * selamanya jika CDN tidak merespons.
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


            /* =====================================
               CREATE SCRIPT
            ===================================== */

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


            /* =====================================
               TIMEOUT
            ===================================== */

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

                    /*
                     * Diagnosis:
                     * memastikan event click
                     * benar-benar diterima APK.
                     */

                    setExportStatus(

                        "1. EXPORT DIPANGGIL"

                    );


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

        /* =============================================
           STEP 1
        ============================================= */

        setExportStatus(

            "1. EXPORT DIPANGGIL"

        );


        const panel =

            document.getElementById(

                "global-overlay-panel"

            );


        /* =============================================
           CHECK PANEL
        ============================================= */

        if(

            !panel

        ){

            setExportStatus(

                "2. PANEL TIDAK DITEMUKAN"

            );

            return;

        }


        setExportStatus(

            "2. PANEL DITEMUKAN"

        );


        /* =============================================
           LOAD LIBRARY
        ============================================= */

        setExportStatus(

            "3. MEMUAT HTML2CANVAS..."

        );


        const ready =

            await loadHtml2Canvas();


        /* =============================================
           HTML2CANVAS RESULT
        ============================================= */

        if(

            !ready

            ||

            !window.html2canvas

        ){

            setExportStatus(

                "3. HTML2CANVAS GAGAL"

            );

            return;

        }


        setExportStatus(

            "4. HTML2CANVAS SIAP"

        );


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

        const exportButton =

            clone.querySelector(

                "#global-overlay-export"

            );


        if(

            exportButton

        ){

            exportButton.remove();

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

        setExportStatus(

            "5. MENYIAPKAN GAMBAR..."

        );


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

            setExportStatus(

                "6. MEMBUAT PNG..."

            );


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


            setExportStatus(

                "7. PNG BERHASIL DIBUAT"

            );


            /* =========================================
               DOWNLOAD
            ========================================= */

            const link =

                document.createElement(

                    "a"

                );


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


            link.download =

                `${

                    filename ||

                    "rincian-gaji"

                }.png`;


            link.href =

                canvas.toDataURL(

                    "image/png"

                );


            setExportStatus(

                "8. MENYIAPKAN DOWNLOAD..."

            );


            link.click();


            setExportStatus(

                "9. DOWNLOAD DIPANGGIL"

            );

        }

        catch(error){

            console.error(

                "Export PNG Error:",

                error

            );


            setExportStatus(

                "GAGAL MEMBUAT PNG"

            );

        }


        finally{

            /* =========================================
               REMOVE CLONE
            ========================================= */

            container.remove();

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
