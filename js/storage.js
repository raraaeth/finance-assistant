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
