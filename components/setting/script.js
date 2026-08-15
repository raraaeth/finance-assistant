/* =====================================================
   Finance Assistant
   Component    : Global Setting
   File         : script.js
   Version      : 1.0.0

   Description :
   Global Setting Controller

   Handles :
   - Load HTML
   - Init
   - Open
   - Close
===================================================== */


/* =====================================================
   STATE
===================================================== */

let initialized = false;

let currentWorkspace = null;


/* =====================================================
   SETTING
===================================================== */

export const Setting = {


    /* =================================================
       INIT
    ================================================= */

    async init(){

        if(

            initialized

        ){

            return;

        }


        const overlay =

            await loadHTML();


        if(

            !overlay

        ){

            return;

        }


        /* =============================================
           CLOSE
        ============================================= */

        const closeButton =

            document.getElementById(

                "global-setting-close"

            );


        if(

            closeButton

        ){

            closeButton.addEventListener(

                "click",

                () => {

                    Setting.close();

                }

            );

        }


        /* =============================================
           BACKDROP
        ============================================= */

        const backdrop =

            document.getElementById(

                "global-setting-backdrop"

            );


        if(

            backdrop

        ){

            backdrop.addEventListener(

                "click",

                () => {

                    Setting.close();

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

                    Setting.close();

                }

            }

        );


        /* =============================================
           ADD BUTTONS
        ============================================= */

        document

            .querySelectorAll(

                ".global-setting-add"

            )

            .forEach(

                button => {

                    button.addEventListener(

                        "click",

                        () => {

                            addResult(

                                button.dataset.rule

                            );

                        }

                    );

                }

            );


        /* =============================================
           CONFIRM
        ============================================= */

        const confirmButton =

            document.getElementById(

                "global-setting-confirm"

            );


        if(

            confirmButton

        ){

            confirmButton.addEventListener(

                "click",

                () => {

                    confirm();

                }

            );

        }


        initialized =

            true;

    },


    /* =================================================
       OPEN
    ================================================= */

    async open(

        workspace = "kas"

    ){

        await Setting.init();


        if(

            !initialized

        ){

            return;

        }


        currentWorkspace =

            workspace;


        const overlay =

            document.getElementById(

                "global-setting-overlay"

            );


        if(

            !overlay

        ){

            return;

        }


        /* =============================================
           TITLE
        ============================================= */

        const title =

            document.getElementById(

                "global-setting-title"

            );


        const subtitle =

            document.getElementById(

                "global-setting-subtitle"

            );


        if(

            workspace ===

            "payroll-monthly"

        ){

            if(title){

                title.textContent =

                    "Pengaturan Payroll Monthly";

            }


            if(subtitle){

                subtitle.textContent =

                    "Atur rule Payroll Monthly";

            }

        }

        else{

            if(title){

                title.textContent =

                    "Pengaturan";

            }


            if(subtitle){

                subtitle.textContent =

                    "Atur konfigurasi workspace";

            }

        }


        /* =============================================
           SHOW
        ============================================= */

        overlay.classList.add(

            "is-open"

        );


        document.body.classList.add(

            "setting-open"

        );

    },


    /* =================================================
       CLOSE
    ================================================= */

    close(){

        const overlay =

            document.getElementById(

                "global-setting-overlay"

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

            "setting-open"

        );

    }

};


/* =====================================================
   LOAD HTML
===================================================== */

async function loadHTML(){

    let overlay =

        document.getElementById(

            "global-setting-overlay"

        );


    if(

        overlay

    ){

        return overlay;

    }


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

                `HTTP ${response.status}`

            );

        }


        const html =

            await response.text();


        const wrapper =

            document.createElement(

                "div"

            );


        wrapper.innerHTML =

            html.trim();


        overlay =

            wrapper.firstElementChild;


        if(

            !overlay

        ){

            throw new Error(

                "Global Setting root tidak ditemukan."

            );

        }


        document.body.appendChild(

            overlay

        );


        return overlay;

    }

    catch(error){

        console.error(

            "Global Setting HTML Error:",

            error

        );


        return null;

    }

}


/* =====================================================
   ADD RESULT
===================================================== */

function addResult(

    rule

){

    let containerId =

        "";


    let title =

        "";


    if(

        rule === "periode"

    ){

        containerId =

            "setting-periode-result";

        title =

            "Periode Gaji";

    }


    if(

        rule === "gaji"

    ){

        containerId =

            "setting-gaji-result";

        title =

            "Rule Gaji";

    }


    if(

        rule === "attendance"

    ){

        containerId =

            "setting-attendance-result";

        title =

            "Rule Attendance";

    }


    const container =

        document.getElementById(

            containerId

        );


    if(

        !container

    ){

        return;

    }


    const item =

        document.createElement(

            "div"

        );


    item.className =

        "global-setting-result-item";


    item.innerHTML =

    `

        <div
            class="global-setting-result-title">

            ${title}

        </div>

        <div
            class="global-setting-result-detail">

            Prototype result.
            Detail rule akan dibuat pada tahap berikutnya.

        </div>

        <button
            type="button"
            class="global-setting-result-delete">

            Hapus

        </button>

    `;


    const deleteButton =

        item.querySelector(

            ".global-setting-result-delete"

        );


    deleteButton.addEventListener(

        "click",

        () => {

            item.remove();

        }

    );


    container.appendChild(

        item

    );

}


/* =====================================================
   CONFIRM
===================================================== */

function confirm(){

    console.log(

        "SETTING CONFIRM",

        {

            workspace :

                currentWorkspace

        }

    );

}
