/* =====================================================
   GLOBAL STORAGE
   FILE : storage.js
   DESCRIPTION : Local Storage Engine
   VERSION : 3.0.0

   Sections :
   - Key
   - User
   - Workspace
   - Theme
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

    const data =

        localStorage.getItem(

            KEY

        );


    if(

        !data

    ){

        return null;

    }


    try{

        return JSON.parse(

            data

        );

    }catch(error){

        console.error(

            "Failed to load user",

            error

        );

        return null;

    }

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

const WORKSPACE_KEY =

    `${KEY}-workspace`;


/* =====================================================
   LOAD WORKSPACE
===================================================== */

export function loadWorkspace(){

    const data =

        localStorage.getItem(

            WORKSPACE_KEY

        );


    if(

        !data

    ){

        return null;

    }


    try{

        return JSON.parse(

            data

        );

    }catch(error){

        console.error(

            "Failed to load workspace",

            error

        );

        return null;

    }

}


/* =====================================================
   SAVE WORKSPACE
===================================================== */

export function saveWorkspace(

    data

){

    localStorage.setItem(

        WORKSPACE_KEY,

        JSON.stringify(

            data

        )

    );

}


/* =====================================================
   REMOVE WORKSPACE
===================================================== */

export function removeWorkspace(){

    localStorage.removeItem(

        WORKSPACE_KEY

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
