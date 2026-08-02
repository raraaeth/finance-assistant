/* =====================================================
   HEADER
===================================================== */

import { loadUser } from "../../../../js/storage.js";

/* =====================================================
   INIT
===================================================== */

export function renderHeader(title){

    const user = loadUser();

    document.title = title;

    const appTitle =

        document.getElementById(

            "app-title"

        );

    if(appTitle){

        appTitle.textContent =

            title;

    }

}
