/* =====================================================
   FINANCE ASSISTANT
   NEWS & UPDATE

   File    : /news/js/app.js
   Version : 1.0.0

   Description :
   Entry point News & Update.

   Handles :
   - Initialisasi News
   - Router
   - Hamburger menu
   - Navigation drawer
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import router from "./router.js";


/* =====================================================
   STATE
===================================================== */

const State = {

    menuOpen: false,

    eventsBound: false

};


/* =====================================================
   INIT
===================================================== */

function init(){

    initMenu();

    initEvent();

    router.init();

}


/* =====================================================
   MENU
===================================================== */

function initMenu(){

    const button =
        document.getElementById(
            "newsMenuButton"
        );

    const overlay =
        document.getElementById(
            "newsMenuOverlay"
        );

    const drawer =
        document.getElementById(
            "newsDrawer"
        );


    if(
        !button ||
        !overlay ||
        !drawer
    ){
        return;
    }


    button.addEventListener(
        "click",
        toggleMenu
    );


    overlay.addEventListener(
        "click",
        closeMenu
    );


    drawer.addEventListener(
        "click",
        onDrawerClick
    );

}


/* =====================================================
   TOGGLE MENU
===================================================== */

function toggleMenu(){

    if(
        State.menuOpen
    ){

        closeMenu();

    }else{

        openMenu();

    }

}


/* =====================================================
   OPEN MENU
===================================================== */

function openMenu(){

    State.menuOpen =
        true;


    document.body.classList.add(
        "news-menu-open"
    );


    const button =
        document.getElementById(
            "newsMenuButton"
        );


    const overlay =
        document.getElementById(
            "newsMenuOverlay"
        );


    if(button){

        button.setAttribute(
            "aria-expanded",
            "true"
        );

    }


    if(overlay){

        overlay.setAttribute(
            "aria-hidden",
            "false"
        );

    }

}


/* =====================================================
   CLOSE MENU
===================================================== */

function closeMenu(){

    State.menuOpen =
        false;


    document.body.classList.remove(
        "news-menu-open"
    );


    const button =
        document.getElementById(
            "newsMenuButton"
        );


    const overlay =
        document.getElementById(
            "newsMenuOverlay"
        );


    if(button){

        button.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    if(overlay){

        overlay.setAttribute(
            "aria-hidden",
            "true"
        );

    }

}


/* =====================================================
   DRAWER CLICK
===================================================== */

function onDrawerClick(
    event
){

    const link =
        event.target.closest(
            "a"
        );


    if(
        !link
    ){
        return;
    }


    closeMenu();

}


/* =====================================================
   EVENT
===================================================== */

function initEvent(){

    if(
        State.eventsBound
    ){
        return;
    }


    document.addEventListener(
        "keydown",
        onKeyDown
    );


    State.eventsBound =
        true;

}


/* =====================================================
   KEYBOARD
===================================================== */

function onKeyDown(
    event
){

    if(
        event.key === "Escape" &&
        State.menuOpen
    ){

        closeMenu();

    }

}


/* =====================================================
   START
===================================================== */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        init,
        {
            once: true
        }
    );

}else{

    init();

}
