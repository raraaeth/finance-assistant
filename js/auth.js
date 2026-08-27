/* ==========================================
   Finance Assistant
   Module      : AUTH
   File        : auth.js

   Version     : 9.0.0

   Description :
   Supabase Authentication Engine

   Google OAuth
   +
   Supabase Session
   +
   Google Provider Token Refresh

   Google :
   - Identity
   - Email
   - Avatar
   - Google Provider Token
   - Google Provider Refresh Token

   Finance Assistant :
   - Display Name
   - Currency
   - Theme
   - Onboarding

   Google Drive / Sheets :
   Ditangani oleh module.js

   IMPORTANT :

   Google provider_token dari Supabase
   tidak selalu tersedia kembali setelah
   browser refresh.

   Karena itu :

   1. Token disimpan lokal
   2. Refresh token disimpan lokal
   3. Expiry token disimpan lokal
   4. Jika access token expired /
      mendekati expired,
      auth.js meminta refresh ke Apps Script
   5. Apps Script menggunakan refresh token
      Google untuk mendapatkan access token baru

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

    session :

        null,

    user :

        null

};


/* ==========================================
   GOOGLE TOKEN STORAGE
========================================== */

const GOOGLE_TOKEN_KEY =

    "finance_google_provider_token";


const GOOGLE_REFRESH_TOKEN_KEY =

    "finance_google_provider_refresh_token";


/* ==========================================
   GOOGLE TOKEN EXPIRY STORAGE
========================================== */

const GOOGLE_TOKEN_EXPIRES_KEY =

    "finance_google_provider_token_expires_at";


/* ==========================================
   APPS SCRIPT API
========================================== */

const GOOGLE_AUTH_API =

    "https://script.google.com/macros/s/AKfycbxBiQSb1pioB0mDbkAqd6S3y4T5CTByn2-6kW7-T1l-5PdGYTBVDX4IXskxyu_QxokHDw/exec";


/* ==========================================
   TOKEN REFRESH BUFFER
========================================== */

/*
   Refresh token sedikit lebih awal
   sebelum benar-benar expired.

   Buffer :
   60 detik.
*/

const TOKEN_REFRESH_BUFFER =

    60 * 1000;


/* ==========================================
   FALLBACK TOKEN LIFETIME
========================================== */

/*
   Google Provider Access Token umumnya
   berlaku sekitar 1 jam.

   Jika Supabase tidak memberikan
   provider_token_expires_in,
   kita gunakan 55 menit sebagai
   perkiraan expiry.

   Dengan begitu token akan dianggap
   perlu diperbarui sebelum benar-benar
   mencapai batas 1 jam.
*/

const FALLBACK_TOKEN_LIFETIME =

    55 * 60 * 1000;


/* ==========================================
   SAVE GOOGLE PROVIDER TOKENS
========================================== */

function saveGoogleTokens(

    session

){

    if(

        !session

    ){

        return;

    }


    /* ======================================
       PROVIDER ACCESS TOKEN
    ====================================== */

    if(

        session.provider_token

    ){

        localStorage.setItem(

            GOOGLE_TOKEN_KEY,

            session.provider_token

        );


        console.log(

            "AUTH: Google Provider Token disimpan."

        );

    }


    /* ======================================
       PROVIDER REFRESH TOKEN
    ====================================== */

    if(

        session.provider_refresh_token

    ){

        localStorage.setItem(

            GOOGLE_REFRESH_TOKEN_KEY,

            session.provider_refresh_token

        );


        console.log(

            "AUTH: Google Provider Refresh Token disimpan."

        );

    }


    /* ======================================
       TOKEN EXPIRY
    ====================================== */

    /*
       Prioritas :

       1. provider_token_expires_in
       2. fallback 55 menit

       Jangan overwrite expiry yang sudah
       ada hanya karena Supabase tidak
       mengirim expires_in.
    */

    if(

        session.provider_token_expires_in

    ){

        const expiresIn =

            Number(

                session.provider_token_expires_in

            );


        if(

            Number.isFinite(

                expiresIn

            )

            &&

            expiresIn > 0

        ){

            const expiresAt =

                Date.now()

                +

                (

                    expiresIn

                    *

                    1000

                );


            localStorage.setItem(

                GOOGLE_TOKEN_EXPIRES_KEY,

                String(

                    expiresAt

                )

            );


            console.log(

                "AUTH: Google Provider Token expiry disimpan."

            );

        }

    }

    else if(

        session.provider_token

        &&

        !loadGoogleTokenExpiry()

    ){

        const fallbackExpiresAt =

            Date.now()

            +

            FALLBACK_TOKEN_LIFETIME;


        localStorage.setItem(

            GOOGLE_TOKEN_EXPIRES_KEY,

            String(

                fallbackExpiresAt

            )

        );


        console.log(

            "AUTH: Google Provider Token expiry fallback 55 menit disimpan."

        );

    }

}


/* ==========================================
   LOAD GOOGLE PROVIDER TOKEN
========================================== */

function loadGoogleToken(){

    return (

        localStorage.getItem(

            GOOGLE_TOKEN_KEY

        )

        ||

        null

    );

}


/* ==========================================
   LOAD GOOGLE REFRESH TOKEN
========================================== */

function loadGoogleRefreshToken(){

    return (

        localStorage.getItem(

            GOOGLE_REFRESH_TOKEN_KEY

        )

        ||

        null

    );

}


/* ==========================================
   LOAD GOOGLE TOKEN EXPIRY
========================================== */

function loadGoogleTokenExpiry(){

    const value =

        localStorage.getItem(

            GOOGLE_TOKEN_EXPIRES_KEY

        );


    if(

        !value

    ){

        return null;

    }


    const expiry =

        Number(

            value

        );


    if(

        !Number.isFinite(

            expiry

        )

    ){

        return null;

    }


    return expiry;

}


/* ==========================================
   CHECK GOOGLE TOKEN EXPIRED
========================================== */

function isGoogleTokenExpired(){

    const expiresAt =

        loadGoogleTokenExpiry();


    /*
       Jika expiry belum diketahui,
       jangan langsung menganggap expired.

       saveGoogleTokens() akan membuat
       fallback expiry 55 menit ketika
       provider token baru tersedia.
    */

    if(

        !expiresAt

    ){

        return false;

    }


    return (

        Date.now()

        >=

        (

            expiresAt

            -

            TOKEN_REFRESH_BUFFER

        )

    );

}


/* ==========================================
   CLEAR GOOGLE TOKENS
========================================== */

function clearGoogleTokens(){

    localStorage.removeItem(

        GOOGLE_TOKEN_KEY

    );


    localStorage.removeItem(

        GOOGLE_REFRESH_TOKEN_KEY

    );


    localStorage.removeItem(

        GOOGLE_TOKEN_EXPIRES_KEY

    );


    console.log(

        "AUTH: Google Provider Token dan Refresh Token dihapus."

    );

}


/* ==========================================
   JSONP REQUEST
========================================== */

/*
   Digunakan untuk komunikasi dengan
   Apps Script Web App dari GitHub Pages.

   Apps Script :

   action=refreshToken
*/

function jsonpRequest(

    params = {}

){

    return new Promise(

        (

            resolve,

            reject

        ) => {


            /* =================================
               CALLBACK NAME
            ================================= */

            const callbackName =

                "__financeAssistantAuth_"

                +

                Date.now()

                +

                "_"

                +

                Math.random()

                .toString(

                    36

                )

                .slice(

                    2

                );


            /* =================================
               SCRIPT
            ================================= */

            const script =

                document.createElement(

                    "script"

                );


            /* =================================
               REQUEST PARAMS
            ================================= */

            const requestParams =

                new URLSearchParams();


            Object.entries(

                params

            )

            .forEach(

                ([

                    key,

                    value

                ]) => {


                    if(

                        value !==

                        undefined

                        &&

                        value !==

                        null

                    ){

                        requestParams.set(

                            key,

                            value

                        );

                    }

                }

            );


            /* =================================
               CALLBACK
            ================================= */

            requestParams.set(

                "callback",

                callbackName

            );


            /* =================================
               TIMEOUT
            ================================= */

            let timeout =

                null;


            /* =================================
               CLEANUP
            ================================= */

            const cleanup = () => {


                if(

                    timeout

                ){

                    clearTimeout(

                        timeout

                    );

                }


                if(

                    window[

                        callbackName

                    ]

                ){

                    delete window[

                        callbackName

                    ];

                }


                if(

                    script.parentNode

                ){

                    script.remove();

                }

            };


            /* =================================
               CALLBACK HANDLER
            ================================= */

            window[

                callbackName

            ] = function(

                data

            ){

                cleanup();


                resolve(

                    data

                );

            };


            /* =================================
               SCRIPT ERROR
            ================================= */

            script.onerror = function(){

                cleanup();


                reject(

                    new Error(

                        "Gagal menghubungi Apps Script untuk refresh token."

                    )

                );

            };


            /* =================================
               TIMEOUT
            ================================= */

            timeout =

                setTimeout(

                    () => {

                        cleanup();


                        reject(

                            new Error(

                                "Refresh token request timeout."

                            )

                        );

                    },

                    30000

                );


            /* =================================
               BUILD URL
            ================================= */

            script.src =

                GOOGLE_AUTH_API

                +

                "?"

                +

                requestParams.toString();


            /* =================================
               DEBUG

               Jangan tampilkan URL karena
               URL berisi refresh token.
            ================================= */

            console.log(

                "AUTH: Mengirim request refreshToken ke Apps Script..."

            );


            /* =================================
               SEND
            ================================= */

            document.head.appendChild(

                script

            );

        }

    );

}


/* ==========================================
   REFRESH GOOGLE PROVIDER TOKEN
========================================== */

/*
   Flow :

   Local Refresh Token
          ↓
      Apps Script
          ↓
   refreshAccessToken()
          ↓
   Google Access Token Baru
          ↓
   Local Storage
*/

export async function refreshGoogleProviderToken(){

    console.log(
        "=========================================="
    );

    console.log(
        "===== GOOGLE TOKEN REFRESH ====="
    );

    console.log(
        "=========================================="
    );


    /* ======================================
       REFRESH TOKEN
    ====================================== */

    const refreshToken =

        loadGoogleRefreshToken();


    console.log(

        "AUTH: Refresh Token lokal:",

        refreshToken

            ?

            "AVAILABLE"

            :

            "MISSING"

    );


    if(

        !refreshToken

    ){

        throw new Error(

            "Google Provider Refresh Token tidak tersedia."

        );

    }


    try{

        /* ==================================
           REQUEST APPS SCRIPT
        ================================== */

        console.log(

            "AUTH: Meminta access token baru..."

        );


        const result =

            await jsonpRequest({

                action :

                    "refreshToken",


                refreshToken :

                    refreshToken

            });


        /* ==================================
           DEBUG RESPONSE
        ================================== */

        console.log(

            "AUTH: Refresh response diterima."

        );


        console.log(

            "AUTH: Refresh success:",

            result?.success === true

        );


        /* ==================================
           VALIDATE RESPONSE
        ================================== */

        if(

            !result

        ){

            throw new Error(

                "Response refresh token kosong."

            );

        }


        if(

            result.success !== true

        ){

            throw new Error(

                result.error

                ||

                result.message

                ||

                "Google token refresh gagal."

            );

        }


        /* ==================================
           ACCESS TOKEN
        ================================== */

        const accessToken =

            result.accessToken

            ||

            result.access_token

            ||

            null;


        if(

            !accessToken

        ){

            throw new Error(

                "Apps Script tidak mengembalikan access token baru."

            );

        }


        /* ==================================
           SAVE ACCESS TOKEN
        ================================== */

        localStorage.setItem(

            GOOGLE_TOKEN_KEY,

            accessToken

        );


        console.log(

            "AUTH: Google Provider Token baru berhasil disimpan."

        );


        /* ==================================
           SAVE EXPIRY
        ================================== */

        const expiresIn =

            result.expiresIn

            ||

            result.expires_in

            ||

            null;


        if(

            expiresIn

        ){

            const expiresAt =

                Date.now()

                +

                (

                    Number(

                        expiresIn

                    )

                    *

                    1000

                );


            localStorage.setItem(

                GOOGLE_TOKEN_EXPIRES_KEY,

                String(

                    expiresAt

                )


            );


            console.log(

                "AUTH: Token expiry berhasil disimpan."

            );

        }

        else{

            /*
               Jika Apps Script tidak
               mengembalikan expiresIn,
               gunakan fallback 55 menit.
            */

            const fallbackExpiresAt =

                Date.now()

                +

                FALLBACK_TOKEN_LIFETIME;


            localStorage.setItem(

                GOOGLE_TOKEN_EXPIRES_KEY,

                String(

                    fallbackExpiresAt

                )

            );


            console.log(

                "AUTH: Token expiry fallback 55 menit disimpan."

            );

        }


        /* ==================================
           UPDATE AUTH SESSION MEMORY
        ================================== */

        if(

            Auth.session

        ){

            Auth.session = {

                ...Auth.session,

                provider_token :

                    accessToken

            };

        }


        /* ==================================
           SUCCESS
        ================================== */

        console.log(

            "=========================================="

        );

        console.log(

            "===== GOOGLE TOKEN REFRESH SUCCESS ====="

        );

        console.log(

            "=========================================="

        );


        return accessToken;


    }catch(error){

        console.error(

            "=========================================="

        );

        console.error(

            "===== GOOGLE TOKEN REFRESH FAILED ====="

        );

        console.error(

            "=========================================="

        );


        console.error(

            "AUTH Refresh Error:",

            error

        );


        throw error;

    }

}


/* ==========================================
   GET VALID GOOGLE PROVIDER TOKEN
========================================== */

/*
   Prioritas :

   1. Cek apakah local token expired
   2. Jika expired → refresh
   3. Session provider token
   4. Local token
   5. Refresh token

   IMPORTANT :

   Jangan langsung percaya
   session.provider_token.

   Token Google dapat tetap terlihat
   tersedia di Supabase session meskipun
   access token Google sebenarnya sudah
   expired.
*/

export async function getValidGoogleProviderToken(){

    console.log(
        "=========================================="
    );

    console.log(
        "===== GET VALID GOOGLE TOKEN ====="
    );

    console.log(
        "=========================================="
    );


    /* ======================================
       SESSION
    ====================================== */

    const session =

        await getSession();


    /* ======================================
       LOCAL TOKEN
    ====================================== */

    const localToken =

        loadGoogleToken();


    console.log(

        "AUTH: Local Google Token:",

        localToken

            ?

            "AVAILABLE"

            :

            "MISSING"

    );


    /* ======================================
       CHECK EXPIRY FIRST
    ====================================== */

    if(

        localToken

        &&

        isGoogleTokenExpired()

    ){

        console.log(

            "AUTH: Google Provider Token expired / mendekati expired."

        );


        console.log(

            "AUTH: Refresh diperlukan."

        );


        return await refreshGoogleProviderToken();

    }


    /* ======================================
       SESSION PROVIDER TOKEN
    ====================================== */

    const sessionToken =

        session?.provider_token

        ||

        null;


    if(

        sessionToken

    ){

        console.log(

            "AUTH: Provider Token tersedia dari Supabase session."

        );


        /*
           Pastikan token dan expiry
           tersimpan.
        */

        saveGoogleTokens(

            session

        );


        /*
           Cek kembali setelah save.
           Ini penting jika saveGoogleTokens()
           baru membuat fallback expiry.
        */

        if(

            isGoogleTokenExpired()

        ){

            console.log(

                "AUTH: Session Provider Token sudah mendekati expiry."

            );


            console.log(

                "AUTH: Melakukan refresh..."

            );


            return await refreshGoogleProviderToken();

        }


        return sessionToken;

    }


    /* ======================================
       LOCAL TOKEN
    ====================================== */

    if(

        localToken

    ){

        console.log(

            "AUTH: Menggunakan Google Provider Token dari localStorage."

        );


        return localToken;

    }


    /* ======================================
       TOKEN MISSING
    ====================================== */

    console.log(

        "AUTH: Google Provider Token tidak tersedia."

    );


    console.log(

        "AUTH: Mencoba refresh Google token..."

    );


    return await refreshGoogleProviderToken();

}


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
               SAVE PROVIDER TOKENS
            ================================== */

            saveGoogleTokens(

                data.session

            );


            /* ==================================
               RESTORE USER
            ================================== */

            restoreUser(

                data.session.user

            );


            /* ==================================
               DEBUG TOKEN STATE
            ================================== */

            const providerToken =

                data.session.provider_token

                ||

                loadGoogleToken();


            const providerRefreshToken =

                data.session.provider_refresh_token

                ||

                loadGoogleRefreshToken();


            console.log(

                "Google Provider Token:",

                providerToken

                    ?

                    "AVAILABLE"

                    :

                    "MISSING"

            );


            console.log(

                "Google Provider Refresh Token:",

                providerRefreshToken

                    ?

                    "AVAILABLE"

                    :

                    "MISSING"

            );


            /* ==================================
               TOKEN VALIDATION / REFRESH
            ================================== */

            try{

                await getValidGoogleProviderToken();


                console.log(

                    "AUTH: Google Provider Token siap digunakan."

                );

            }catch(error){

                console.warn(

                    "AUTH: Automatic Google token refresh gagal:",

                    error?.message

                );

            }

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


                /* ==================================
                   UPDATE AUTH STATE
                ================================== */

                Auth.session =

                    session;


                Auth.user =

                    session?.user

                    ||

                    null;


                /* ==================================
                   SESSION EXISTS
                ================================== */

                if(

                    session?.user

                ){

                    console.log(

                        "Supabase User:",

                        session.user

                    );


                    /* ==============================
                       SAVE GOOGLE TOKENS
                    ============================== */

                    saveGoogleTokens(

                        session

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


                        initializeFinanceModule();

                    }

                }


                /* ==================================
                   TOKEN REFRESHED
                ================================== */

                if(

                    event === "TOKEN_REFRESHED"

                ){

                    console.log(

                        "Auth: Supabase TOKEN_REFRESHED."

                    );


                    saveGoogleTokens(

                        session

                    );

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


                    clearGoogleTokens();

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

        /*
           Gunakan getValidGoogleProviderToken()
           agar token yang digunakan module
           sudah melalui pengecekan expiry /
           refresh.
        */

        let providerToken =

            null;


        try{

            providerToken =

                await getValidGoogleProviderToken();

        }catch(error){

            console.error(

                "Module: Gagal mendapatkan Google Provider Token:",

                error

            );


            throw error;

        }


        console.log(

            "Module: Google Provider Token:",

            providerToken

                ?

                "AVAILABLE"

                :

                "MISSING"

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
           ONBOARDING
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

           Error module tidak membuat
           user dianggap logout.
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


    /* ======================================
       SAVE PROVIDER TOKENS
    ====================================== */

    if(

        data.session

    ){

        saveGoogleTokens(

            data.session

        );

    }


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
   GET SUPABASE ACCESS TOKEN
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
   GET VALID SUPABASE ACCESS TOKEN
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


    saveGoogleTokens(

        data.session

    );


    return data.session.access_token;

}


/* ==========================================
   GET GOOGLE PROVIDER TOKEN
========================================== */

export async function getGoogleProviderToken(){

    const session =

        await getSession();


    /*
       Jangan langsung refresh di fungsi ini.

       Fungsi ini hanya mengambil token
       yang tersedia.

       Untuk token yang dijamin valid,
       gunakan :

       getValidGoogleProviderToken()
    */

    return (

        session?.provider_token

        ||

        loadGoogleToken()

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

        loadGoogleRefreshToken()

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


        /* ======================================
           CLEAR AUTH STATE
        ====================================== */

        Auth.session =

            null;


        Auth.user =

            null;


        /* ======================================
           CLEAR GOOGLE TOKENS
        ====================================== */

        clearGoogleTokens();


        console.log(

            "Supabase logout berhasil."

        );


        console.log(

            "Google Provider Token dibersihkan."

        );


        /* ======================================
           REDIRECT
        ====================================== */

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
