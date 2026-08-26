/* ==========================================
   Finance Assistant
   Module      : AUTH
   File        : auth.js

   Version     : 6.0.0

   Description :
   Supabase Authentication Engine

   Google OAuth
   +
   Supabase Session

   NOTE:
   Google Drive / Sheets belum ditangani
   oleh file ini.
========================================== */


/* ==========================================
   IMPORT
========================================== */

import {

    supabase

} from "./supabase.js";


import {

    saveUser,

    saveTheme

} from "./storage.js";


/* ==========================================
   CONFIG
========================================== */

const Auth = {

    session: null,

    user: null

};


/* ==========================================
   INITIALIZE
========================================== */

init();


async function init(){

    console.log(

        "===== AUTH INITIALIZE ====="

    );


    try{

        /* ==================================
           GET CURRENT SESSION
        ================================== */

        const {

            data,

            error

        } = await supabase.auth.getSession();


        if(

            error

        ){

            throw error;

        }


        Auth.session =

            data.session;


        if(

            data.session

        ){

            Auth.user =

                data.session.user;


            restoreUser(

                data.session.user

            );


            console.log(

                "Existing Supabase Session:",

                data.session

            );

        }


        /* ==================================
           LISTEN SESSION CHANGES
        ================================== */

        supabase.auth.onAuthStateChange(

            (

                event,

                session

            ) => {

                console.log(

                    "Auth Event:",

                    event

                );


                Auth.session =

                    session;


                Auth.user =

                    session?.user

                    ||

                    null;


                if(

                    session?.user

                ){

                    restoreUser(

                        session.user

                    );

                }


                if(

                    event ===

                    "SIGNED_OUT"

                ){

                    Auth.session =

                        null;


                    Auth.user =

                        null;

                }

            }

        );


    }catch(error){

        console.error(

            "Auth initialization failed:",

            error

        );

    }

}


/* ==========================================
   LOGIN GOOGLE
========================================== */

export async function loginGoogle(){

    console.log(

        "===== GOOGLE LOGIN ====="

    );


    try{

        const {

            data,

            error

        } = await supabase.auth.signInWithOAuth({

            provider:

                "google",


            options: {

    redirectTo:
        window.location.origin
        +
        "/finance-assistant/pages/index.html",

    scopes:
        "https://www.googleapis.com/auth/drive.file " +
        "https://www.googleapis.com/auth/spreadsheets",

    queryParams: {

        access_type:
            "offline",

        prompt:
            "consent"

    }

}

                

        });


        if(

            error

        ){

            throw error;

        }


        console.log(

            "Google OAuth started:",

            data

        );


    }catch(error){

        console.error(

            "Google Login Error:",

            error

        );


        throw error;

    }

}


/* ==========================================
   GLOBAL LOGIN
========================================== */

window.loginGoogle =

    loginGoogle;


/* ==========================================
   GET SESSION
========================================== */

export async function getSession(){

    const {

        data,

        error

    } = await supabase.auth.getSession();


    if(

        error

    ){

        console.error(

            "Get session error:",

            error

        );


        return null;

    }


    Auth.session =

        data.session;


    Auth.user =

        data.session?.user

        ||

        null;


    return data.session;

}


/* ==========================================
   LOAD SESSION
========================================== */

export async function loadSession(){

    return await getSession();

}


/* ==========================================
   GET USER
========================================== */

export async function getUser(){

    const session =

        await getSession();


    return (

        session?.user

        ||

        null

    );

}


/* ==========================================
   GET ACCESS TOKEN
========================================== */

export async function getAccessToken(){

    const session =

        await getSession();


    return (

        session?.access_token

        ||

        null

    );

}


/* ==========================================
   GET VALID ACCESS TOKEN
========================================== */

export async function getValidAccessToken(){

    const {

        data,

        error

    } = await supabase.auth.getSession();


    if(

        error

    ){

        throw error;

    }


    if(

        !data.session

    ){

        throw new Error(

            "Session tidak ditemukan. Silakan login."

        );

    }


    Auth.session =

        data.session;


    Auth.user =

        data.session.user;


    return data.session.access_token;

}


/* ==========================================
   GET GOOGLE PROVIDER TOKEN
========================================== */

export async function getGoogleProviderToken(){

    const session =

        await getSession();


    return (

        session?.provider_token

        ||

        null

    );

}


/* ==========================================
   GET GOOGLE PROVIDER REFRESH TOKEN
========================================== */

export async function getGoogleProviderRefreshToken(){

    const session =

        await getSession();


    return (

        session?.provider_refresh_token

        ||

        null

    );

}


/* ==========================================
   CHECK LOGIN
========================================== */

export async function isLoggedIn(){

    const session =

        await getSession();


    return !!session;

}


/* ==========================================
   RESTORE USER
========================================== */

function restoreUser(

    user

){

    if(

        !user

    ){

        return;

    }


    console.log(

        "Restoring Supabase User:",

        user

    );


    const metadata =

        user.user_metadata

        ||

        {};


    /* ======================================
       USER DATA
    ====================================== */

    const userData = {

        id:

            user.id,


        email:

            user.email

            ||

            "",


        displayName:

            metadata.full_name

            ||

            metadata.name

            ||

            user.email

            ||

            "",


        avatar:

            metadata.avatar_url

            ||

            metadata.picture

            ||

            "",

    };


    /* ======================================
       SAVE USER
    ====================================== */

    try{

        saveUser(

            userData

        );

    }catch(error){

        console.warn(

            "saveUser failed:",

            error

        );

    }


    /* ======================================
       THEME
    ====================================== */

    const existingTheme =

        metadata.theme

        ||

        localStorage.getItem(

            "finance_theme"

        );


    if(

        existingTheme

    ){

        try{

            saveTheme(

                existingTheme

            );

        }catch(error){

            console.warn(

                "saveTheme failed:",

                error

            );

        }

    }

}


/* ==========================================
   LOGOUT
========================================== */

export async function logout(){

    console.log(

        "===== LOGOUT ====="

    );


    try{

        const {

            error

        } = await supabase.auth.signOut();


        if(

            error

        ){

            throw error;

        }


        Auth.session =

            null;


        Auth.user =

            null;


        window.location.replace(

            "/finance-assistant/pages/index.html"

        );


    }catch(error){

        console.error(

            "Logout failed:",

            error

        );

    }

}


/* ==========================================
   EXPORT AUTH
========================================== */

export {

    Auth

};
