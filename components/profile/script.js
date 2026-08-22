/* =====================================================
   Finance Assistant
   Component   : Profile
   File        : profile.js

   Description :
   Profile Component Controller
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadUser,

    loadWorkspace,

    saveWorkspace,

    loadTheme,

    saveTheme

} from "../../js/storage.js";


import {

    loadSession,

    logout

} from "../../js/auth.js";


/* =====================================================
   STATE
===================================================== */

const State = {

    user :

        null,


    session :

        null,


    workspace :

        [],


    theme :

        null

};


/* =====================================================
   MODULE CONFIG
===================================================== */

const MODULE_CONFIG = [

    {

        id :

            "financial",


        icon :

            "💰",


        title :

            "Financial"

    },


    {

        id :

            "saving",


        icon :

            "🏦",


        title :

            "Saving"

    },


    {

        id :

            "kas",


        icon :

            "👥",


        title :

            "Kas Bersama"

    },


    {

        id :

            "payroll-daily",


        icon :

            "💼",


        title :

            "Payroll Daily"

    },


    {

        id :

            "payroll-monthly",


        icon :

            "💵",


        title :

            "Payroll Monthly"

    },


    {

        id :

            "airdrop",


        icon :

            "🎁",


        title :

            "Airdrop"

    }

];


/* =====================================================
   INIT
===================================================== */

export function initProfile(){

    initUser();

    initSession();

    initTheme();

    initWorkspace();

}


/* =====================================================
   USER
===================================================== */

function initUser(){

    State.user =

        loadUser();

}


/* =====================================================
   SESSION
===================================================== */

function initSession(){

    State.session =

        loadSession();

}


/* =====================================================
   THEME
===================================================== */

function initTheme(){

    State.theme =

        loadTheme();

}


/* =====================================================
   LOAD WORKSPACE LIST
===================================================== */

function loadWorkspaceList(){

    const modules =

        State.session
        ?.workspace
        ?.modules

        ||

        {};


    const current =

        loadWorkspace();


    return MODULE_CONFIG.map(

        config => {

            const module =

                modules[

                    config.id

                ];


            return {

                id :

                    config.id,


                icon :

                    config.icon,


                title :

                    config.title,


                active :

                    module
                    ?.active

                    === true,


                selected :

                    current
                    ?.module

                    ===

                    config.id,


                folderId :

                    module
                    ?.folderId

                    ||

                    null

            };

        }

    );

}


/* =====================================================
   INIT WORKSPACE
===================================================== */

function initWorkspace(){

    State.workspace =

        loadWorkspaceList();

}


/* =====================================================
   GET ACTIVE WORKSPACE
===================================================== */

function getActiveWorkspace(){

    return State.workspace.filter(

        workspace =>

            workspace.active

    );

}


/* =====================================================
   GET INACTIVE WORKSPACE
===================================================== */

function getInactiveWorkspace(){

    return State.workspace.filter(

        workspace =>

            !workspace.active

    );

}


/* =====================================================
   CHANGE WORKSPACE
===================================================== */

function onWorkspace(

    id

){

    const workspace =

        State.workspace.find(

            item =>

                item.id === id

        );


    if(

        !workspace

    ){

        console.warn(

            "Workspace tidak ditemukan:",

            id

        );

        return;

    }


    /* =============================================
       INACTIVE
    ============================================= */

    if(

        !workspace.active

    ){

        console.warn(

            `Workspace "${id}" belum dibuat.`

        );

        return;

    }


    /* =============================================
       CURRENT WORKSPACE
    ============================================= */

    const current =

        loadWorkspace();


    if(

        current
        ?.module

        ===

        id

    ){

        return;

    }


    /* =============================================
       SAVE WORKSPACE
    ============================================= */

    saveWorkspace({

        module :

            id

    });


    /* =============================================
       RELOAD
    ============================================= */

    location.reload();

}


/* =====================================================
   RENDER WORKSPACE CARD
===================================================== */

function renderWorkspaceCard(

    workspace

){

    return `

        <button

            class="workspace-card

            ${

                workspace.selected

                ?

                "selected"

                :

                ""

            }

            ${

                workspace.active

                ?

                "active"

                :

                "inactive"

            }"

            data-workspace="${

                workspace.id

            }"

        >

            <div

                class="workspace-icon"

            >

                ${

                    workspace.icon

                }

            </div>


            <div

                class="workspace-content"

            >

                <h4>

                    ${

                        workspace.title

                    }

                </h4>


                <span>

                    ${

                        workspace.active

                        ?

                        "Active"

                        :

                        "Inactive"

                    }

                </span>

            </div>

        </button>

    `;

}


/* =====================================================
   RENDER ACTIVE WORKSPACE
===================================================== */

function renderActiveWorkspace(){

    const workspaces =

        getActiveWorkspace();


    if(

        !workspaces.length

    ){

        return `

            <div

                class="workspace-empty"

            >

                Belum ada workspace aktif.

            </div>

        `;

    }


    return workspaces.map(

        renderWorkspaceCard

    )

    .join(

        ""

    );

}


/* =====================================================
   RENDER INACTIVE WORKSPACE
===================================================== */

function renderInactiveWorkspace(){

    const workspaces =

        getInactiveWorkspace();


    if(

        !workspaces.length

    ){

        return "";

    }


    return workspaces.map(

        renderWorkspaceCard

    )

    .join(

        ""

    );

}


/* =====================================================
   RENDER WORKSPACE
===================================================== */

export function renderWorkspace(){

    return `

        <section

            class="profile-section"

        >

            <div

                class="profile-section-header"

            >

                <h3>

                    Workspace

                </h3>

            </div>


            <div

                class="workspace-group"

            >

                <h4

                    class="workspace-label"

                >

                    Active

                </h4>


                <div

                    class="workspace-list"

                >

                    ${

                        renderActiveWorkspace()

                    }

                </div>

            </div>


            <div

                class="workspace-group"

            >

                <h4

                    class="workspace-label"

                >

                    Inactive

                </h4>


                <div

                    class="workspace-list"

                >

                    ${

                        renderInactiveWorkspace()

                    }

                </div>

            </div>


            <button

                id="createWorkspace"

                class="create-workspace"

            >

                + Create Workspace

            </button>

        </section>

    `;

}


/* =====================================================
   WORKSPACE EVENT
===================================================== */

export function bindWorkspaceEvents(){

    document

        .querySelectorAll(

            "[data-workspace]"

        )

        .forEach(

            element => {

                element.addEventListener(

                    "click",

                    () => {

                        const id =

                            element.dataset
                            .workspace;


                        onWorkspace(

                            id

                        );

                    }

                );

            }

        );


    const createButton =

        document.getElementById(

            "createWorkspace"

        );


    if(

        createButton

    ){

        createButton.addEventListener(

            "click",

            () => {

                console.log(

                    "Create Workspace"

                );

            }

        );

    }

}


/* =====================================================
   THEME CHANGE
===================================================== */

function onTheme(

    theme

){

    saveTheme(

        theme

    );


    State.theme =

        theme;


    document.documentElement.setAttribute(

        "data-theme",

        theme

    );

}


/* =====================================================
   LOGOUT
===================================================== */

function onLogout(){

    logout();

}


/* =====================================================
   EXPORT
===================================================== */

export {

    State,

    onWorkspace,

    onTheme,

    onLogout

};
