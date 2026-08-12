/* =====================================================
   Finance Assistant
   Component    : Global Overlay
   File         : script.js
   Version      : 1.1.0

   Description :
   Global reusable overlay component

   Animation :
   Right → Left

   Features :
   - Open
   - Close
   - Dynamic title
   - Dynamic period
   - Dynamic content
   - User name
   - Footer branding
===================================================== */


/* =====================================================
   STATE
===================================================== */

export const Overlay = {

    element : null,

    initialized : false

};


/* =====================================================
   INIT
===================================================== */

Overlay.init = function(){

    if(

        Overlay.initialized

    ){

        return;

    }


    createOverlay();


    registerEvents();


    Overlay.initialized =

        true;

};


/* =====================================================
   CREATE OVERLAY
===================================================== */

function createOverlay(){

    const existing =

        document.getElementById(

            "global-overlay"

        );


    if(

        existing

    ){

        Overlay.element =

            existing;

        return;

    }


    const overlay =

        document.createElement(

            "div"

        );


    overlay.id =

        "global-overlay";


    overlay.className =

        "global-overlay hidden";


    overlay.innerHTML =

    `

        <!-- BACKDROP -->

        <div

            class="global-overlay-backdrop"

            data-overlay-close>

        </div>


        <!-- PANEL -->

        <div

            class="global-overlay-panel">


            <!-- HEADER -->

            <div

                class="global-overlay-header">


                <div

                    class="global-overlay-header-info">


                    <strong

                        id="global-overlay-title"

                        class="global-overlay-title">

                    </strong>


                    <small

                        id="global-overlay-period"

                        class="global-overlay-period">

                    </small>


                    <span

                        id="global-overlay-user"

                        class="global-overlay-user">

                    </span>


                </div>


                <button

                    type="button"

                    id="global-overlay-close"

                    class="global-overlay-close">

                    ✕

                </button>


            </div>


            <!-- CONTENT -->

            <div

                id="global-overlay-content"

                class="global-overlay-content">

            </div>


            <!-- FOOTER -->

            <div

                class="global-overlay-footer">


                <small>

                    — Finance Assistant App —

                </small>


            </div>


        </div>

    `;


    document.body.appendChild(

        overlay

    );


    Overlay.element =

        overlay;

}


/* =====================================================
   EVENTS
===================================================== */

function registerEvents(){

    document.addEventListener(

        "click",

        event => {


            /* -----------------------------------------
               CLOSE BUTTON
            ----------------------------------------- */

            if(

                event.target.closest(

                    "#global-overlay-close"

                )

            ){

                Overlay.close();

                return;

            }


            /* -----------------------------------------
               BACKDROP
            ----------------------------------------- */

            if(

                event.target.closest(

                    "[data-overlay-close]"

                )

            ){

                Overlay.close();

                return;

            }

        }

    );


    /* =============================================
       ESCAPE
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

}


/* =====================================================
   OPEN
===================================================== */

Overlay.open = function({

    title = "",

    period = "",

    content = "",

    userName = ""

} = {}){


    if(

        !Overlay.initialized

    ){

        Overlay.init();

    }


    const titleElement =

        document.getElementById(

            "global-overlay-title"

        );


    const periodElement =

        document.getElementById(

            "global-overlay-period"

        );


    const userElement =

        document.getElementById(

            "global-overlay-user"

        );


    const contentElement =

        document.getElementById(

            "global-overlay-content"

        );


    /* =============================================
       DATA
    ============================================= */

    if(

        titleElement

    ){

        titleElement.textContent =

            title;

    }


    if(

        periodElement

    ){

        periodElement.textContent =

            period;

    }


    if(

        userElement

    ){

        userElement.textContent =

            userName;

    }


    if(

        contentElement

    ){

        contentElement.innerHTML =

            content;

    }


    /* =============================================
       SHOW
    ============================================= */

    Overlay.element.classList.remove(

        "hidden"

    );


    /*
       Tunggu satu frame supaya browser
       sempat membaca posisi awal
       translateX(100%).
    */

    requestAnimationFrame(

        () => {

            Overlay.element.classList.add(

                "active"

            );

        }

    );


    document.body.classList.add(

        "overlay-open"

    );

};


/* =====================================================
   CLOSE
===================================================== */

Overlay.close = function(){

    if(

        !Overlay.element

    ){

        return;

    }


    Overlay.element.classList.remove(

        "active"

    );


    /*
       Tunggu animasi selesai,
       baru benar-benar hidden.
    */

    setTimeout(

        () => {

            if(

                Overlay.element

            ){

                Overlay.element.classList.add(

                    "hidden"

                );

            }

        },

        300

    );


    document.body.classList.remove(

        "overlay-open"

    );

};


/* =====================================================
   SET CONTENT
===================================================== */

Overlay.setContent = function(

    content

){

    const element =

        document.getElementById(

            "global-overlay-content"

        );


    if(

        !element

    ){

        return;

    }


    element.innerHTML =

        content;

};


/* =====================================================
   SET TITLE
===================================================== */

Overlay.setTitle = function(

    title

){

    const element =

        document.getElementById(

            "global-overlay-title"

        );


    if(

        !element

    ){

        return;

    }


    element.textContent =

        title;

};


/* =====================================================
   SET PERIOD
===================================================== */

Overlay.setPeriod = function(

    period

){

    const element =

        document.getElementById(

            "global-overlay-period"

        );


    if(

        !element

    ){

        return;

    }


    element.textContent =

        period;

};


/* =====================================================
   SET USER
===================================================== */

Overlay.setUser = function(

    userName

){

    const element =

        document.getElementById(

            "global-overlay-user"

        );


    if(

        !element

    ){

        return;

    }


    element.textContent =

        userName;

};

