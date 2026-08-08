/* =====================================================
   GLOBAL STORAGE
   FILE : storage.js
   DESCRIPTION : Local Storage Engine
   VERSION : 2.0.0

   Sections :
   - Key
   - User
   - Workspace
===================================================== */


/* =====================================================
   KEY
===================================================== */

const KEY =

    "finance-assistant";


/* =====================================================
   USER
===================================================== */

export function loadUser(){

    return JSON.parse(

        localStorage.getItem(

            KEY

        )

    );

}

export function saveUser(

    data

){

    localStorage.setItem(

        KEY,

        JSON.stringify(

            data

        )

    );

}


/* =====================================================
   WORKSPACE
===================================================== */

export function loadWorkspace(){

    return JSON.parse(

        localStorage.getItem(

            `${KEY}-workspace`

        )

    ) ?? {

        app :

            "saving",

        workspace :

            "saving"

    };

}

export function saveWorkspace(

    data

){

    localStorage.setItem(

        `${KEY}-workspace`,

        JSON.stringify(

            data

        )

    );

}

/* =====================================================
   THEME
===================================================== */

const THEME_KEY =

    `${KEY}-theme`;


/* =====================================================
   LOAD THEME
===================================================== */

export function loadTheme(){

    return (

        localStorage.getItem(

            THEME_KEY

        )

        ||

        "light"

    );

}


/* =====================================================
   SAVE THEME
===================================================== */

export function saveTheme(

    theme

){

    localStorage.setItem(

        THEME_KEY,

        theme

    );

}
