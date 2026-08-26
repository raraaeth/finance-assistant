/* ==========================================
   Finance Assistant
   Module      : AUTH
   File        : auth.js

   Version     : 7.0.0

   Description :
   Supabase Authentication Engine

   Google OAuth
   +
   Supabase Session

   Google :
   - Identity
   - Email
   - Avatar
   - Google Provider Token

   Finance Assistant :
   - Display Name
   - Currency
   - Theme
   - Onboarding

   Google Drive / Sheets :
   Ditangani oleh module.js
========================================== */


/* ==========================================
   IMPORT
========================================== */

import {

    supabase

} from "./supabase.js";


import {

    initializeModule,

    saveModuleInfo

} from "./module.js";


import {

    saveUser,

    loadUser,

    saveTheme

} from "./storage.js";


/* ==========================================
   CONFIG
========================================== */

const Auth = {

    session : null,

    user : null

};


/* ==========================================
   INITIALIZE
========================================== */

init();


async function init(){

    console.log(
        "=========================================="
    );

    console.log(
        "===== AUTH INITIALIZE ====="
    );

    console.log(
        "=========================================="
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


        /* ==================================
           EXISTING SESSION
        ================================== */

        if(

            data.session

        ){

            Auth.user =

                data.session.user;


            console.log(
                "Existing Supabase Session ditemukan."
            );


            console.log(
                "Supabase User:",
                data.session.user
            );


            /* ==================================
               RESTORE GOOGLE IDENTITY
            ================================== */

            restoreUser(

                data.session.user

            );


            /* ==================================
               DEBUG PROVIDER TOKEN
            ================================== */

            console.log(
                "Google Provider Token:",
                data.session.provider_token
                    ? "AVAILABLE"
                    : "MISSING"
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
                    "=========================================="
                );

                console.log(
                    "Auth Event:",
                    event
                );

                console.log(
                    "=========================================="
                );


                Auth.session =

                    session;


                Auth.user =

                    session?.user

                    ||

                    null;


                /* ==================================
                   SIGNED IN / SESSION EXISTS
                ================================== */

                if(

                    session?.user

                ){

                    console.log(
                        "Supabase User:",
                        session.user
                    );


                    /* ==============================
                       RESTORE IDENTITY
                    ============================== */

                    restoreUser(

                        session.user

                    );


                    /* ==============================
                       SIGNED IN
                    ============================== */

                    if(

                        event === "SIGNED_IN"

                    ){

                        console.log(
                            "Auth: SIGNED_IN terdeteksi."
                        );


                        /*
                           Jalankan Finance Module.

                           module.js yang menentukan:

                           Account belum ada
                               ↓
                           WRITE onboarding

                           Account sudah ada
                               ↓
                           READ account
                        */

                        initializeFinanceModule();

                    }

                }


                /* ==================================
                   SIGNED OUT
                ================================== */

                if(

                    event === "SIGNED_OUT"

                ){

                    console.log(
                        "Auth: SIGNED_OUT."
                    );


                    Auth.session =

                        null;


                    Auth.user =

                        null;

                }

            }

        );


    }catch(error){

        console.error(
            "=========================================="
        );

        console.error(
            "AUTH INITIALIZATION ERROR"
        );

        console.error(
            "=========================================="
        );


        console.error(
            error
        );

    }

}


/* ==========================================
   LOGIN GOOGLE
========================================== */

export async function loginGoogle(){

    console.log(
        "=========================================="
    );

    console.log(
        "===== GOOGLE LOGIN ====="
    );

    console.log(
        "=========================================="
    );


    try{

        const {

            data,

            error

        } = await supabase.auth.signInWithOAuth({

            provider :

                "google",


            options : {

                redirectTo :

                    window.location.origin

                    +

                    "/finance-assistant/pages/index.html",


                scopes :

                    "https://www.googleapis.com/auth/drive.file "

                    +

                    "https://www.googleapis.com/auth/spreadsheets",


                queryParams : {

                    access_type :

                        "offline",


                    prompt :

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
            "=========================================="
        );

        console.error(
            "GOOGLE LOGIN ERROR"
        );

        console.error(
            "=========================================="
        );


        console.error(
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
   INITIALIZE FINANCE MODULE
========================================== */

async function initializeFinanceModule(){

    console.log(
        "=========================================="
    );

    console.log(
        "===== FINANCE MODULE START ====="
    );

    console.log(
        "=========================================="
    );


    try{

        /* ======================================
           SESSION
        ====================================== */

        const session =

            Auth.session;


        if(

            !session

        ){

            console.warn(
                "Module: Session tidak ditemukan."
            );


            return null;

        }


        console.log(
            "Module: Session OK."
        );


        /* ======================================
           GOOGLE USER
        ====================================== */

        console.log(
            "Module: Google User:",
            session.user
        );


        /* ======================================
           PROVIDER TOKEN
        ====================================== */

        const providerToken =

            session.provider_token;


        console.log(
            "Module: Google Provider Token:",
            providerToken
                ? "AVAILABLE"
                : "MISSING"
        );


        if(

            !providerToken

        ){

            throw new Error(

                "Google Provider Token tidak tersedia."

            );

        }


        /* ======================================
           LOCAL USER / ONBOARDING DATA
        ====================================== */

        const localUser =

            loadUser()

            ||

            {};


        console.log(
            "Module: Local Finance Assistant User:",
            localUser
        );


        /* ======================================
           IMPORTANT

           Jangan membuat onboarding
           dari Google metadata.

           Data onboarding berasal dari
           onboarding/script.js yang sudah
           disimpan melalui saveUser().
        ====================================== */

        const onboarding = {

            displayName :

                localUser.displayName

                ||

                "",


            currency :

                localUser.currency

                ||

                "IDR",


            theme :

                localUser.theme

                ||

                "system",


            onboardingCompleted :

                localUser.onboardingCompleted === true

        };


        console.log(
            "Module: Local Onboarding Data:",
            onboarding
        );


        /* ======================================
           INITIALIZE MODULE
        ====================================== */

        console.log(
            "Module: Memulai Finance Core setup..."
        );


        const result =

            await initializeModule(

                onboarding

            );


        console.log(
            "Module: Initialize result:",
            result
        );


        /* ======================================
           SAVE MODULE INFO
        ====================================== */

        if(

            result

            &&

            result.success

        ){

            saveModuleInfo(

                result

            );


            console.log(
                "Module: Info berhasil disimpan."
            );


            /* ==================================
               RESTORE ACCOUNT DATA

               Account dari Finance Core
               adalah source of truth.

               Ini penting untuk browser
               atau perangkat baru.
            ================================== */

            if(

                result.accountData

            ){

                console.log(
                    "Module: Restoring Finance Account Data..."
                );


                console.log(
                    "Module: Account Data:",
                    result.accountData
                );


                try{

                    saveUser({

                        ...result.accountData

                    });


                    console.log(
                        "Module: Finance Account berhasil dipulihkan."
                    );


                }catch(error){

                    console.warn(
                        "Module: Gagal restore Finance Account:",
                        error
                    );

                }


                /* ==============================
                   RESTORE THEME
                ============================== */

                if(

                    result
                    ?.accountData
                    ?.theme

                ){

                    try{

                        saveTheme(

                            result.accountData.theme

                        );


                        console.log(
                            "Module: Theme dipulihkan:",
                            result.accountData.theme
                        );


                    }catch(error){

                        console.warn(
                            "Module: Gagal restore theme:",
                            error
                        );

                    }

                }

            }

        }


        console.log(
            "=========================================="
        );

        console.log(
            "===== FINANCE MODULE SUCCESS ====="
        );

        console.log(
            "=========================================="
        );


        return result;


    }catch(error){

        console.error(
            "=========================================="
        );

        console.error(
            "===== FINANCE MODULE FAILED ====="
        );

        console.error(
            "=========================================="
        );


        console.error(
            "Module Error:",
            error
        );


        console.error(
            "Module Error Message:",
            error?.message
        );


        console.error(
            "Module Error Stack:",
            error?.stack
        );


        /*
           Login Supabase tetap berhasil
           meskipun Drive / Sheets gagal.

           Ini penting supaya error module
           tidak membuat user dianggap
           logout.
        */

        return {

            success :

                false,


            error :

                error?.message

                ||

                "Finance Module gagal"

        };

    }

}


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
   RESTORE GOOGLE IDENTITY
========================================== */

/*
   PENTING :

   Function ini hanya memulihkan
   identity dari Google.

   Jangan gunakan Google full_name
   untuk menimpa Display Name
   Finance Assistant yang sudah
   diberikan user melalui onboarding.

   Finance profile akan dipulihkan
   kembali dari Finance Core oleh
   initializeFinanceModule().
*/

function restoreUser(

    user

){

    if(

        !user

    ){

        return;

    }


    console.log(
        "=========================================="
    );

    console.log(
        "===== RESTORE GOOGLE IDENTITY ====="
    );

    console.log(
        "=========================================="
    );


    console.log(
        "Google User:",
        user
    );


    const metadata =

        user.user_metadata

        ||

        {};


    /* ======================================
       EXISTING LOCAL FINANCE USER
    ====================================== */

    const existingUser =

        loadUser()

        ||

        {};


    console.log(
        "Existing Finance User:",
        existingUser
    );


    /* ======================================
       USER DATA

       Google identity :

       - id
       - email
       - avatar

       Finance profile :

       - displayName
       - currency
       - theme
       - onboardingCompleted
    ====================================== */

    const userData = {

        id :

            user.id,


        email :

            user.email

            ||

            existingUser.email

            ||

            "",


        displayName :

            existingUser.displayName

            ||

            "",


        currency :

            existingUser.currency

            ||

            "IDR",


        theme :

            existingUser.theme

            ||

            "system",


        onboardingCompleted :

            existingUser.onboardingCompleted === true,


        avatar :

            existingUser.avatar

            ||

            metadata.avatar_url

            ||

            metadata.picture

            ||

            ""

    };


    /* ======================================
       SAVE USER
    ====================================== */

    try{

        saveUser(

            userData

        );


        console.log(
            "Finance User berhasil disimpan."
        );


        console.log(
            "Display Name:",
            userData.displayName
        );


    }catch(error){

        console.warn(
            "saveUser failed:",
            error
        );

    }


    /* ======================================
       THEME

       Hanya gunakan theme lokal.

       Jangan mengambil theme dari
       Google metadata.
    ====================================== */

    if(

        userData.theme

    ){

        try{

            saveTheme(

                userData.theme

            );


            console.log(
                "Theme:",
                userData.theme
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
        "=========================================="
    );

    console.log(
        "===== LOGOUT ====="
    );

    console.log(
        "=========================================="
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


        console.log(
            "Supabase logout berhasil."
        );


        window.location.replace(

            "/finance-assistant/pages/index.html"

        );


    }catch(error){

        console.error(
            "=========================================="
        );

        console.error(
            "LOGOUT FAILED"
        );

        console.error(
            "=========================================="
        );


        console.error(
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
