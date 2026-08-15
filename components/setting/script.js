/* =====================================================
   Finance Assistant
   Component    : Global Setting
   File         : script.js
   Version      : 2.1.0

   Description :
   Global Setting Controller

   Module :
   - Payroll Monthly
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    KasSetting

} from "./kas.js";

import {

    MonthlySetting

} from "./monthly.js";


/* =====================================================
   MODULE REGISTRY
===================================================== */

const SETTINGS = {

    "payroll-monthly":

        MonthlySetting

};


/* =====================================================
   STATE
===================================================== */

let initialized = false;

let currentWorkspace = null;

let currentConfig = null;


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

                    Setting.confirm();

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

        workspace

    ){

        await Setting.init();


        if(

            !initialized

        ){

            return;

        }


        /* =============================================
           GET CONFIG
        ============================================= */

        const config =

            SETTINGS[

                workspace

            ];


        if(

            !config

        ){

            console.error(

                "Setting module tidak ditemukan:",

                workspace

            );

            return;

        }


        currentWorkspace =

            workspace;


        currentConfig =

            config;


        /* =============================================
           GET OVERLAY
        ============================================= */

        const overlay =

            document.getElementById(

                "global-setting-overlay"

            );


        if(

            !overlay

        ){

            console.error(

                "Global Setting overlay tidak ditemukan."

            );

            return;

        }


        /* =============================================
           HEADER
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

            title

        ){

            title.textContent =

                config.title ??

                "Pengaturan";

        }


        if(

            subtitle

        ){

            subtitle.textContent =

                config.subtitle ??

                "Atur konfigurasi workspace";

        }


        /* =============================================
           RENDER
        ============================================= */

        renderContent(

            config

        );


        /* =============================================
           OPEN
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

    },


    /* =================================================
       CONFIRM
    ================================================= */

    confirm(){

        console.log(

            "SETTING CONFIRM",

            {

                workspace :

                    currentWorkspace,

                config :

                    currentConfig

            }

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
   RENDER CONTENT
===================================================== */

function renderContent(

    config

){

    const content =

        document.getElementById(

            "global-setting-content"

        );


    if(

        !content

    ){

        return;

    }


    content.innerHTML = "";


    if(

        !Array.isArray(

            config.sections

        )

    ){

        console.error(

            "Setting sections tidak ditemukan:",

            config

        );

        return;

    }


    config.sections.forEach(

        section => {

            renderSection(

                content,

                section

            );

        }

    );

}


/* =====================================================
   RENDER SECTION
===================================================== */

function renderSection(

    container,

    section

){

    const element =

        document.createElement(

            "section"

        );


    element.className =

        "global-setting-section";


    element.dataset.section =

        section.id;


    element.innerHTML =

    `

        <div
            class="global-setting-section-header">

            <div>

                <h3>

                    ${escapeHTML(

                        section.title

                    )}

                </h3>

                <p>

                    ${escapeHTML(

                        section.description ??

                        ""

                    )}

                </p>

            </div>

        </div>


        <button
            type="button"
            class="global-setting-add">

            ＋ Tambah

        </button>


        <div
            class="global-setting-result">

        </div>

    `;


    container.appendChild(

        element

    );


    const addButton =

        element.querySelector(

            ".global-setting-add"

        );


    if(

        addButton

    ){

        addButton.addEventListener(

            "click",

            () => {

                addResult(

                    section,

                    element

                );

            }

        );

    }

}


/* =====================================================
   ADD RESULT
===================================================== */

function addResult(

    section,

    sectionElement

){

    const result =

        sectionElement.querySelector(

            ".global-setting-result"

        );


    if(

        !result

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

            ${escapeHTML(

                section.resultTitle ??

                section.title

            )}

        </div>


        <div
            class="global-setting-result-detail">

            Prototype result.

            Detail rule akan dibuat

            pada tahap berikutnya.

        </div>


        <button
            type="button"
            class="global-setting-result-delete">

            Hapus

        </button>

    `;


    result.appendChild(

        item

    );


    const deleteButton =

        item.querySelector(

            ".global-setting-result-delete"

        );


    if(

        deleteButton

    ){

        deleteButton.addEventListener(

            "click",

            () => {

                item.remove();

            }

        );

    }

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(

    value

){

    return String(

        value ?? ""

    )

        .replace(

            /&/g,

            "&amp;"

        )

        .replace(

            /</g,

            "&lt;"

        )

        .replace(

            />/g,

            "&gt;"

        )

        .replace(

            /"/g,

            "&quot;"

        )

        .replace(

            /'/g,

            "&#039;"

        );

}
