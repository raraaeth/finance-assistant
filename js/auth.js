/* ==========================================
   Finance Assistant
   Module      : AUTH
   File        : auth.js

   Version     : 9.5.0

   Description :
   Supabase Authentication Engine

   Google OAuth
   +
   Supabase Session
   +
   Google Provider Token Refresh
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
   LOADING
========================================== */

import {

    Loading

} from "../components/loading/script.js";


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
   FINANCE MODULE INITIALIZATION LOCK
========================================== */

let financeModuleInitializationPromise =

    null;


/* ==========================================
   LOGIN REDIRECT FLAG
========================================== */

const LOGIN_REDIRECT_KEY =

    "finance_login_redirect_pending";


/* ==========================================
   DASHBOARD REDIRECT
========================================== */

function redirectToDashboard(){

    const dashboardPath =

        "/pages/dashboard/";


    if(

        window.location.pathname.startsWith(

            dashboardPath

        )

    ){

        return;

    }


    console.log(

        "AUTH: User sudah login dan onboarding selesai."

    );


    console.log(

        "AUTH: Redirect ke Dashboard..."

    );


    window.location.replace(

        dashboardPath

    );

}


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
   THEME STORAGE KEY
========================================== */

const THEME_STORAGE_KEY =

    "finance-assistant-theme";


/* ==========================================
   APPS SCRIPT API
========================================== */

const GOOGLE_AUTH_API =

    "https://script.google.com/macros/s/AKfycbxBiQSb1pioB0mDbkAqd6S3y4T5CTByn2-6kW7-T1l-5PdGYTBVDX4IXskxyu_QxokHDw/exec";


/* ==========================================
   TOKEN REFRESH BUFFER
========================================== */

const TOKEN_REFRESH_BUFFER =

    60 * 1000;


/* ==========================================
   FALLBACK TOKEN LIFETIME
========================================== */

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
   LOAD LOCAL THEME
========================================== */

function loadLocalTheme(){

    return (

        localStorage.getItem(

            THEME_STORAGE_KEY

        )

        ||

        null

    );

}


/* ==========================================
   CHECK LOCAL THEME
========================================== */

function hasLocalTheme(){

    const theme =

        loadLocalTheme();


    return !!theme;

}


/* ==========================================
   JSONP REQUEST
========================================== */

function jsonpRequest(

    params = {}

){

    return new Promise(

        (

            resolve,

            reject

        ) => {


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


            const script =

                document.createElement(

                    "script"

                );


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


            requestParams.set(

                "callback",

                callbackName

            );


            let timeout =

                null;


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


            script.onerror = function(){

                cleanup();


                reject(

                    new Error(

                        "Gagal menghubungi Apps Script untuk refresh token."

                    )

                );

            };


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


            script.src =

                GOOGLE_AUTH_API

                +

                "?"

                +

                requestParams.toString();


            console.log(

                "AUTH: Mengirim request refreshToken ke Apps Script..."

            );


            document.head.appendChild(

                script

            );

        }

    );

}


/* ==========================================
   REFRESH GOOGLE PROVIDER TOKEN
========================================== */

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


        console.log(

            "AUTH: Refresh response diterima."

        );


        console.log(

            "AUTH: Refresh success:",

            result?.success === true

        );


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


        localStorage.setItem(

            GOOGLE_TOKEN_KEY,

            accessToken

        );


        console.log(

            "AUTH: Google Provider Token baru berhasil disimpan."

        );


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


        if(

            Auth.session

        ){

            Auth.session = {

                ...Auth.session,

                provider_token :

                    accessToken

            };

        }


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


    const session =

        await getSession();


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


        saveGoogleTokens(

            session

        );


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


    if(

        localToken

    ){

        console.log(

            "AUTH: Menggunakan Google Provider Token dari localStorage."

        );


        return localToken;

    }


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


            console.log(

                "Existing Supabase Session ditemukan."

            );


            console.log(

                "Supabase User:",

                data.session.user

            );


            saveGoogleTokens(

                data.session

            );


            restoreUser(

                data.session.user

            );


            const currentUser =

                loadUser();


            const loginRedirectPending =

                sessionStorage.getItem(

                    LOGIN_REDIRECT_KEY

                );


            /* ==================================
               LOGIN LOADING
            ================================== */

            if(

                loginRedirectPending === "true"

            ){

                await Loading.show(

                    "Menyiapkan Finance Assistant...",

                    "Menghubungkan akun dan menyiapkan data kamu."

                );

            }


            if(

                loginRedirectPending === "true"

            ){

                if(

                    currentUser?.onboardingCompleted === true

                ){

                    console.log(

                        "AUTH: Google Login terdeteksi. Menunggu Finance Module..."

                    );

                }

            }


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


            /* ==================================
               FINANCE MODULE RESTORE
            ================================== */

            try{

                console.log(

                    "AUTH: Existing session → initialize Finance Module..."

                );


                const financeResult =

                    await initializeFinanceModule();


                console.log(

                    "AUTH: Finance Module berhasil diproses."

                );


                /* ==============================
                   LOGIN REDIRECT
                ============================== */

                if(

                    loginRedirectPending === "true"

                    &&

                    currentUser?.onboardingCompleted === true

                    &&

                    financeResult?.success === true

                ){

                    await showFinanceSetupMessage(

                        financeResult

                    );


                    sessionStorage.removeItem(

                        LOGIN_REDIRECT_KEY

                    );


                    redirectToDashboard();

                }


            }catch(error){

                console.warn(

                    "AUTH: Finance Module restore gagal:",

                    error?.message

                );


                /* ==============================
                   HIDE LOGIN LOADING
                ============================== */

                if(

                    loginRedirectPending === "true"

                ){

                    Loading.hide();

                }

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


                Auth.session =

                    session;


                Auth.user =

                    session?.user

                    ||

                    null;


                if(

                    session?.user

                ){

                    console.log(

                        "Supabase User:",

                        session.user

                    );


                    saveGoogleTokens(

                        session

                    );


                    restoreUser(

                        session.user

                    );


                    if(

                        event === "SIGNED_IN"

                    ){

                        console.log(

                            "Auth: SIGNED_IN terdeteksi."

                        );


                        initializeFinanceModule();

                    }

                }


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

        sessionStorage.setItem(

            LOGIN_REDIRECT_KEY,

            "true"

        );


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

                    "/pages/index.html",


                scopes :

                    "https://www.googleapis.com/auth/drive.file ",


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

            sessionStorage.removeItem(

                LOGIN_REDIRECT_KEY

            );


            throw error;

        }


        console.log(

            "Google OAuth started:",

            data

        );


    }catch(error){

        sessionStorage.removeItem(

            LOGIN_REDIRECT_KEY

        );


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
   FINANCE SETUP MESSAGE
========================================== */

async function showFinanceSetupMessage(

    result

){

    try{

        if(

            !result

            ||

            result.success !== true

        ){

            return;

        }


        const createdItems = [];


        /* ==================================
           FOLDER
        ================================== */

        if(

            result.folder?.created === true

        ){

            createdItems.push(

                "Folder Finance Assistant"

            );

        }


        /* ==================================
           FINANCE CORE
        ================================== */

        if(

            result.financeCore?.created === true

        ){

            createdItems.push(

                "Finance Core"

            );

        }


        /* ==================================
           ACCOUNT
        ================================== */

        if(

            result.account?.created === true

        ){

            createdItems.push(

                "Sheet account"

            );

        }


        /* ==================================
           MESSAGE
        ================================== */

        let message =

            "Finance Assistant berhasil disiapkan.";


        if(

            createdItems.length > 0

        ){

            message =

                "Workspace Finance Assistant berhasil disiapkan.\n\n"

                +

                createdItems.join(

                    "\n"

                )

                +

                "\n\nSemua data disimpan di Google Drive kamu.";

        }


        /* ==================================
           HIDE LOADING
        ================================== */

        Loading.hide();


        /* ==================================
           HTML ALERT
        ================================== */

        await Loading.alert({

            title :

                "Login berhasil",


            message :

                message,


            buttonText :

                "OK",


            icon :

                "✓"

        });


    }catch(error){

        console.warn(

            "AUTH: Gagal menampilkan message setup:",

            error

        );


        Loading.hide();

    }

}


/* ==========================================
   INITIALIZE FINANCE MODULE
========================================== */

async function initializeFinanceModule(){

    if(

        financeModuleInitializationPromise

    ){

        console.log(

            "AUTH: Finance Module initialization sedang berjalan."

        );


        console.log(

            "AUTH: Menggunakan initialization Promise yang sama."

        );


        return (

            financeModuleInitializationPromise

        );

    }


    financeModuleInitializationPromise =

        (

            async () => {

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


                    console.log(

                        "Module: Google User:",

                        session.user

                    );


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


                    const localUser =

                        loadUser()

                        ||

                        {};


                    console.log(

                        "Module: Local Finance Assistant User:",

                        localUser

                    );


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

                            "light",


                        onboardingCompleted :

                            localUser.onboardingCompleted === true

                    };


                    console.log(

                        "Module: Local Onboarding Data:",

                        onboarding

                    );


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

                                const currentUser =

                                    loadUser()

                                    ||

                                    {};


                                const restoredUser = {

                                    ...currentUser,

                                    ...result.accountData

                                };


                                const localTheme =

                                    loadLocalTheme();


                                if(

                                    localTheme

                                ){

                                    restoredUser.theme =

                                        localTheme;

                                }


                                saveUser(

                                    restoredUser

                                );


                                console.log(

                                    "Module: Finance Account berhasil dipulihkan."

                                );


                            }catch(error){

                                console.warn(

                                    "Module: Gagal restore Finance Account:",

                                    error

                                );

                            }


                            const localTheme =

                                loadLocalTheme();


                            const financeTheme =

                                result
                                ?.accountData
                                ?.theme;


                            if(

                                !localTheme

                                &&

                                financeTheme

                            ){

                                try{

                                    saveTheme(

                                        financeTheme

                                    );


                                    console.log(

                                        "Module: Theme dipulihkan dari Finance Core:",

                                        financeTheme

                                    );


                                }catch(error){

                                    console.warn(

                                        "Module: Gagal restore theme:",

                                        error

                                    );

                                }

                            }

                            else if(

                                localTheme

                            ){

                                console.log(

                                    "Module: Theme lokal dipertahankan:",

                                    localTheme

                                );

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

        )();


    try{

        return await financeModuleInitializationPromise;

    }finally{

        financeModuleInitializationPromise =

            null;

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


    const existingUser =

        loadUser()

        ||

        {};


    console.log(

        "Existing Finance User:",

        existingUser

    );


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

            "light",


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


        clearGoogleTokens();


        sessionStorage.removeItem(

            LOGIN_REDIRECT_KEY

        );


        console.log(

            "Supabase logout berhasil."

        );


        console.log(

            "Google Provider Token dibersihkan."

        );


        window.location.replace(

            "/pages/index.html"

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
