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


            if(

                existing

            ){

                existing.addEventListener(

                    "load",

                    () => {

                        html2canvasLoaded = true;

                        resolve(true);

                    }

                );


                existing.addEventListener(

                    "error",

                    () => {

                        resolve(false);

                    }

                );


                return;

            }


            const script =

                document.createElement(

                    "script"

                );


            script.src =

                "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";


            script.dataset.html2canvas =

                "true";


            script.onload =

                () => {

                    html2canvasLoaded = true;

                    resolve(true);

                };


            script.onerror =

                () => {

                    console.error(

                        "html2canvas gagal dimuat"

                    );

                    resolve(false);

                };


            document.head.appendChild(

                script

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


                overlay = element;

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

            alert(

                "Export PNG tidak tersedia saat ini."

            );

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


            link.click();

        }

        catch(error){

            console.error(

                "Export PNG Error:",

                error

            );


            alert(

                "Gagal membuat PNG."

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
