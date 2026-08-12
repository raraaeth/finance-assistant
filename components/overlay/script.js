/* =====================================================
   Finance Assistant
   Component    : Global Overlay
   File         : script.js
   Version      : 1.0.0

   Description :
   Global reusable overlay component

   Features :
   - Open overlay
   - Close overlay
   - Dynamic title
   - Dynamic period
   - Dynamic content
   - User display name
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


    Overlay.initialized =

        true;


    registerEvents();

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

                    class="global-overlay-user">

                    <span

                        id="global-overlay-user-name">

                    </span>

                </div>


                <button

                    type="button"

                    id="global-overlay-close"

                    class="global-overlay-close">

                    ✕

                </button>


            </div>


            <!-- TITLE -->

            <div

                class="global-overlay-title">


                <strong

                    id="global-overlay-title">

                </strong>


                <small

                    id="global-overlay-period">

                </small>


            </div>


            <!-- CONTENT -->

            <div

                id="global-overlay-content"

                class="global-overlay-content">

            </div>


            <!-- FOOTER -->

            <div

                class="global-overlay-footer">

                — Finance Assistant App —

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


    const backdrop =

        document.querySelector(

            "[data-overlay-close]"

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


    const contentElement =

        document.getElementById(

            "global-overlay-content"

        );


    const userElement =

        document.getElementById(

            "global-overlay-user-name"

        );


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

        contentElement

    ){

        contentElement.innerHTML =

            content;

    }


    if(

        userElement

    ){

        userElement.textContent =

            userName;

    }


    Overlay.element.classList.remove(

        "hidden"

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


    Overlay.element.classList.add(

        "hidden"

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
