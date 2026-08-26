/* ==========================================
   Finance Assistant
   Module      : AUTH
   File        : auth.js

   Version     : 5.0.0

   Description :
   Google OAuth + PKCE Authentication Engine

   Update :
   • Access Token auto refresh
   • Refresh Token persistence
   • expiresAt tracking
   • getValidAccessToken()
   • JSONP untuk Apps Script
   • Session recovery
   • Kompatibel dengan session lama
========================================== */


/* ==========================================
   IMPORT
========================================== */

import {

    saveUser,

    saveTheme

} from "./storage.js";


/* ==========================================
   CONFIG
========================================== */

const Auth = {

    clientId:

        "843959535705-0915g6v4o8ejpgf04aghhu0j87p35sh8.apps.googleusercontent.com",


    redirectUri:

        "https://raraaeth.github.io/finance-assistant/auth/callback.html",


    apiUrl:

        "https://script.google.com/macros/s/AKfycbxBiQSb1pioB0m0DbkAqd6S3y4T5CTByn2-6kW7-T1l5PdGYTBVDX4IXskxyu_QxokHDw/exec",


    scopes: [

        "openid",

        "email",

        "profile",

        "https://www.googleapis.com/auth/drive.file"

    ],


    session:

        null

};


/* ==========================================
   CONSTANT
========================================== */

/*
   Refresh beberapa menit sebelum
   access token benar-benar expired.

   Google biasanya memberikan token
   dengan lifetime sekitar 3600 detik.

   Dengan buffer 5 menit,
   kita tidak menunggu sampai token
   benar-benar expired.
*/

const TOKEN_REFRESH_BUFFER =

    5 * 60 * 1000;


/*
   Timeout request refresh.
*/

const REFRESH_TIMEOUT =

    30000;


/* ==========================================
   INITIALIZE
========================================== */

init();


function init(){

    console.log(

        "Auth loaded"

    );


    /* ======================================
       CALLBACK PAGE
    ====================================== */

    if(

        isCallbackPage()

    ){

        handleCallback();

        return;

    }


    /* ======================================
       AUTO LOGIN
    ====================================== */

    const session =

        loadSession();


    if(

        session

    ){

        console.log(

            "Auto Login Session:",

            session

        );

    }

}


/* ==========================================
   CHECK CALLBACK PAGE
========================================== */

function isCallbackPage(){

    return location.pathname.endsWith(

        "/auth/callback.html"

    );

}


/* ==========================================
   LOGIN
========================================== */

export async function loginGoogle(){

    await requestAuthorization();

}


window.loginGoogle =

    loginGoogle;


/* ==========================================
   REQUEST AUTHORIZATION
========================================== */

async function requestAuthorization(){

    /* ======================================
       CREATE PKCE
    ====================================== */

    const verifier =

        await generateCodeVerifier();


    const challenge =

        await generateCodeChallenge(

            verifier

        );


    /* ======================================
       SAVE VERIFIER
    ====================================== */

    saveCodeVerifier(

        verifier

    );


    /* ======================================
       GOOGLE PARAMS
    ====================================== */

    const params =

        new URLSearchParams({

            client_id:

                Auth.clientId,


            redirect_uri:

                Auth.redirectUri,


            response_type:

                "code",


            scope:

                Auth.scopes.join(

                    " "

                ),


            code_challenge:

                challenge,


            code_challenge_method:

                "S256",


            access_type:

                "offline",


            prompt:

                "consent"

        });


    /* ======================================
       REDIRECT GOOGLE
    ====================================== */

    location.href =

        "https://accounts.google.com/o/oauth2/v2/auth?"

        +

        params.toString();

}


/* ==========================================
   PKCE
========================================== */

async function generateCodeVerifier(){

    const random =

        new Uint8Array(

            32

        );


    crypto.getRandomValues(

        random

    );


    return base64UrlEncode(

        random

    );

}


/* ==========================================
   BASE64 URL ENCODE
========================================== */

function base64UrlEncode(

    buffer

){

    return btoa(

        String.fromCharCode(

            ...buffer

        )

    )

    .replace(

        /\+/g,

        "-"

    )

    .replace(

        /\//g,

        "_"

    )

    .replace(

        /=/g,

        ""

    );

}


/* ==========================================
   GENERATE CODE CHALLENGE
========================================== */

async function generateCodeChallenge(

    verifier

){

    const encoder =

        new TextEncoder();


    const data =

        encoder.encode(

            verifier

        );


    const hash =

        await crypto.subtle.digest(

            "SHA-256",

            data

        );


    return base64UrlEncode(

        new Uint8Array(

            hash

        )

    );

}


/* ==========================================
   CODE VERIFIER STORAGE
========================================== */

function saveCodeVerifier(

    verifier

){

    sessionStorage.setItem(

        "code_verifier",

        verifier

    );

}


/* ==========================================
   GET CODE VERIFIER
========================================== */

function getCodeVerifier(){

    return sessionStorage.getItem(

        "code_verifier"

    );

}


/* ==========================================
   REMOVE CODE VERIFIER
========================================== */

function removeCodeVerifier(){

    sessionStorage.removeItem(

        "code_verifier"

    );

}


/* ==========================================
   LOAD ONBOARDING DATA
========================================== */

function loadOnboardingData(){

    const data =

        localStorage.getItem(

            "finance-assistant"

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

            "Failed to load onboarding data",

            error

        );


        return null;

    }

}


/* ==========================================
   CALLBACK
========================================== */

async function handleCallback(){

    try{

        console.log(

            "===== CALLBACK START ====="

        );


        /* ==================================
           GET AUTHORIZATION CODE
        ================================== */

        const params =

            new URLSearchParams(

                location.search

            );


        const code =

            params.get(

                "code"

            );


        if(

            !code

        ){

            throw new Error(

                "Authorization code tidak ditemukan"

            );

        }


        console.log(

            "Authorization Code ditemukan"

        );


        /* ==================================
           GET CODE VERIFIER
        ================================== */

        const verifier =

            getCodeVerifier();


        if(

            !verifier

        ){

            throw new Error(

                "Code verifier tidak ditemukan"

            );

        }


        console.log(

            "Code Verifier ditemukan"

        );


        /* ==================================
           LOAD ONBOARDING
        ================================== */

        const onboarding =

            loadOnboardingData();


        console.log(

            "Onboarding Data:",

            onboarding

        );


        /* ==================================
           CALLBACK NAME
        ================================== */

        const callbackName =

            "__financeAssistantLogin_"

            +

            Date.now();


        /* ==================================
           JSONP PROMISE
        ================================== */

        const result =

            await new Promise(

                (

                    resolve,

                    reject

                ) => {


                    const script =

                        document.createElement(

                            "script"

                        );


                    /* ==========================
                       CALLBACK
                    ========================== */

                    window[

                        callbackName

                    ] = function(

                        data

                    ){

                        console.log(

                            "Apps Script Response:",

                            data

                        );


                        cleanup();


                        resolve(

                            data

                        );

                    };


                    /* ==========================
                       PARAMS
                    ========================== */

                    const requestParams =

                        new URLSearchParams();


                    requestParams.set(

                        "action",

                        "login"

                    );


                    requestParams.set(

                        "code",

                        code

                    );


                    requestParams.set(

                        "verifier",

                        verifier

                    );


                    requestParams.set(

                        "callback",

                        callbackName

                    );


                    /* ==========================
                       ONBOARDING
                    ========================== */

                    if(

                        onboarding

                    ){

                        requestParams.set(

                            "displayName",

                            onboarding.displayName

                            ||

                            ""

                        );


                        requestParams.set(

                            "currency",

                            onboarding.currency

                            ||

                            "IDR"

                        );


                        requestParams.set(

                            "theme",

                            onboarding.theme

                            ||

                            "system"

                        );


                        requestParams.set(

                            "onboardingCompleted",

                            onboarding.onboardingCompleted === true

                            ?

                            "true"

                            :

                            "false"

                        );

                    }


                    /* ==========================
                       SCRIPT URL
                    ========================== */

                    script.src =

                        Auth.apiUrl

                        +

                        "?"

                        +

                        requestParams.toString();


                    console.log(

                        "Login API URL:",

                        script.src

                    );


                    /* ==========================
                       ERROR
                    ========================== */

                    script.onerror = function(){

                        cleanup();


                        reject(

                            new Error(

                                "Gagal menghubungi Apps Script"

                            )

                        );

                    };


                    /* ==========================
                       TIMEOUT
                    ========================== */

                    const timeout =

                        setTimeout(

                            () => {

                                cleanup();


                                reject(

                                    new Error(

                                        "Login API terlalu lama"

                                    )

                                );

                            },

                            30000

                        );


                    /* ==========================
                       CLEANUP
                    ========================== */

                    function cleanup(){

                        clearTimeout(

                            timeout

                        );


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

                    }


                    /* ==========================
                       SEND
                    ========================== */

                    document.head.appendChild(

                        script

                    );

                }

            );


        /* ==================================
           CHECK RESULT
        ================================== */

        if(

            !result

        ){

            throw new Error(

                "Response Apps Script kosong"

            );

        }


        if(

            !result.success

        ){

            throw new Error(

                result.error

                ||

                result.message

                ||

                "Login gagal"

            );

        }


        /* ==================================
           CHECK TOKEN
        ================================== */

        if(

            !result.token

            ||

            !result.token.accessToken

        ){

            throw new Error(

                "Access Token tidak ditemukan dari login"

            );

        }


        /* ==================================
           CHECK WORKSPACE
        ================================== */

        if(

            result.workspace

            &&

            result.workspace.success === false

        ){

            throw new Error(

                result.workspace.error

                ||

                "Setup Workspace gagal"

            );

        }


        console.log(

            "Login berhasil"

        );


        /* ==================================
           NORMALIZE TOKEN
        ================================== */

        const token =

            normalizeToken(

                result.token

            );


        result.token =

            token;


        console.log(

            "Normalized Token:",

            {

                expiresAt:

                    token.expiresAt,

                expiresIn:

                    token.expiresIn,

                hasAccessToken:

                    !!token.accessToken,

                hasRefreshToken:

                    !!token.refreshToken

            }

        );


        /* ==================================
           RESTORE ACCOUNT DATA
        ================================== */

        const accountData =

            result.workspace

            ?.accountData

            ||

            null;


        if(

            accountData

        ){

            saveUser(

                accountData

            );


            saveTheme(

                accountData.theme

                ||

                "system"

            );


            console.log(

                "Account Data Restored:",

                accountData

            );

        }


        /* ==================================
           FALLBACK USER
        ================================== */

        else if(

            result.user

        ){

            saveUser(

                result.user

            );


            console.log(

                "User Saved:",

                result.user

            );


            if(

                onboarding

            ){

                saveTheme(

                    onboarding.theme

                    ||

                    "system"

                );

            }

        }


        /* ==================================
           SAVE SESSION
        ================================== */

        saveSession(

            result

        );


        console.log(

            "Session Saved"

        );


        /* ==================================
           CLEANUP
        ================================== */

        removeCodeVerifier();


        /* ==================================
           REDIRECT
        ================================== */

        console.log(

            "Redirecting..."

        );


        window.location.replace(

            "/finance-assistant/pages/index.html"

        );


    }catch(error){

        console.error(

            "===== CALLBACK ERROR ====="

        );


        console.error(

            error

        );


        console.error(

            error.stack

        );


        document.body.innerHTML =

        `

            <div style="
                font-family: sans-serif;
                max-width: 600px;
                margin: 60px auto;
                padding: 24px;
                text-align: center;
            ">

                <h2>

                    Login gagal

                </h2>

                <p>

                    ${error.message}

                </p>

                <button

                    onclick="
                        window.location.replace(
                            '/finance-assistant/pages/index.html'
                        )
                    "

                >

                    Kembali

                </button>

            </div>

        `;

    }

}


/* ==========================================
   NORMALIZE TOKEN
========================================== */

function normalizeToken(

    token

){

    const normalized = {

        accessToken:

            token.accessToken

            ||

            null,


        /*
           Jangan kehilangan refresh token
           jika response refresh hanya
           mengirim access token.
        */

        refreshToken:

            token.refreshToken

            ||

            null,


        expiresIn:

            Number(

                token.expiresIn

                ||

                3600

            ),


        expiresAt:

            token.expiresAt

            ||

            null,


        scope:

            token.scope

            ||

            null,


        tokenType:

            token.tokenType

            ||

            "Bearer"

    };


    /*
       Jika expiresAt belum tersedia,
       hitung dari expiresIn.
    */

    if(

        !normalized.expiresAt

        &&

        normalized.expiresIn

    ){

        normalized.expiresAt =

            Date.now()

            +

            (

                normalized.expiresIn

                *

                1000

            );

    }


    return normalized;

}


/* ==========================================
   SAVE SESSION
========================================== */

function saveSession(

    session

){

    Auth.session =

        session;


    localStorage.setItem(

        "finance_session",

        JSON.stringify(

            session

        )

    );

}


/* ==========================================
   LOAD SESSION
========================================== */

export function loadSession(){

    const data =

        localStorage.getItem(

            "finance_session"

        );


    if(

        !data

    ){

        Auth.session =

            null;


        return null;

    }


    try{

        Auth.session =

            JSON.parse(

                data

            );


        /*
           Compatibility dengan
           session versi lama.

           Kalau belum punya expiresAt,
           buat berdasarkan expiresIn.

           Kalau tidak ada expiresIn,
           beri default 1 jam.
        */

        if(

            Auth.session.token

        ){

            Auth.session.token =

                normalizeToken(

                    Auth.session.token

                );


            /*
               Session lama akan langsung
               disimpan ulang dengan struktur
               token baru.
            */

            localStorage.setItem(

                "finance_session",

                JSON.stringify(

                    Auth.session

                )

            );

        }


        return Auth.session;


    }catch(error){

        console.error(

            "Failed to load session",

            error

        );


        localStorage.removeItem(

            "finance_session"


        );


        Auth.session =

            null;


        return null;

    }

}


/* ==========================================
   GET ACCESS TOKEN
========================================== */

export function getAccessToken(){

    const session =

        loadSession();


    return (

        session
        ?.token
        ?.accessToken

        ||

        null

    );

}


/* ==========================================
   GET REFRESH TOKEN
========================================== */

export function getRefreshToken(){

    const session =

        loadSession();


    return (

        session
        ?.token
        ?.refreshToken

        ||

        null

    );

}


/* ==========================================
   CHECK TOKEN EXPIRY
========================================== */

export function isAccessTokenExpired(){

    const session =

        loadSession();


    const token =

        session
        ?.token;


    if(

        !token

        ||

        !token.accessToken

    ){

        return true;

    }


    /*
       Session lama mungkin belum
       mempunyai expiresAt.

       Dalam kondisi ini kita anggap
       token masih valid untuk sementara.
       API akan menangani 401/invalid token
       melalui refresh berikutnya.

       Tetapi untuk session baru,
       expiresAt selalu tersedia.
    */

    if(

        !token.expiresAt

    ){

        return false;

    }


    return (

        Date.now()

        >=

        (

            Number(

                token.expiresAt

            )

            -

            TOKEN_REFRESH_BUFFER

        )

    );

}


/* ==========================================
   UPDATE TOKEN SESSION
========================================== */

function updateAccessToken(

    tokenResponse

){

    const session =

        loadSession();


    if(

        !session

    ){

        throw new Error(

            "Session tidak ditemukan"

        );

    }


    if(

        !tokenResponse

        ||

        !tokenResponse.accessToken

    ){

        throw new Error(

            "Access Token baru tidak ditemukan"

        );

    }


    const currentRefreshToken =

        session
        ?.token
        ?.refreshToken

        ||

        null;


    /*
       Google biasanya TIDAK mengirim
       refresh_token baru saat melakukan
       refresh.

       Karena itu refresh token lama
       harus dipertahankan.
    */

    const newToken =

        normalizeToken({

            accessToken:

                tokenResponse.accessToken,


            refreshToken:

                tokenResponse.refreshToken

                ||

                currentRefreshToken,


            expiresIn:

                tokenResponse.expiresIn

                ||

                3600,


            expiresAt:

                tokenResponse.expiresAt

                ||

                null,


            scope:

                tokenResponse.scope

                ||

                session
                ?.token
                ?.scope

                ||

                null,


            tokenType:

                tokenResponse.tokenType

                ||

                session
                ?.token
                ?.tokenType

                ||

                "Bearer"

        });


    session.token =

        newToken;


    saveSession(

        session

    );


    console.log(

        "Access Token session diperbarui"

    );


    return session;

}


/* ==========================================
   REFRESH ACCESS TOKEN
========================================== */

export async function refreshAccessToken(){

    const session =

        loadSession();


    if(

        !session

    ){

        throw new Error(

            "Session tidak ditemukan"

        );

    }


    const refreshToken =

        session
        ?.token
        ?.refreshToken

        ||

        null;


    if(

        !refreshToken

    ){

        throw new Error(

            "Refresh Token tidak ditemukan. Silakan login kembali."

        );

    }


    console.log(

        "===== ACCESS TOKEN REFRESH ====="

    );


    const callbackName =

        "__financeAssistantRefresh_"

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


    const result =

        await new Promise(

            (

                resolve,

                reject

            ) => {


                const script =

                    document.createElement(

                        "script"

                    );


                let finished =

                    false;


                const timeout =

                    setTimeout(

                        () => {

                            finishError(

                                new Error(

                                    "Refresh token request terlalu lama"

                                )

                            );

                        },

                        REFRESH_TIMEOUT

                    );


                /* ==============================
                   CALLBACK
                ============================== */

                window[

                    callbackName

                ] = function(

                    data

                ){

                    if(

                        finished

                    ){

                        return;

                    }


                    finished =

                        true;


                    clearTimeout(

                        timeout

                    );


                    cleanup();


                    resolve(

                        data

                    );

                };


                /* ==============================
                   ERROR
                ============================== */

                script.onerror = function(){

                    finishError(

                        new Error(

                            "Gagal menghubungi Apps Script untuk refresh token"

                        )

                    );

                };


                /* ==============================
                   FINISH ERROR
                ============================== */

                function finishError(

                    error

                ){

                    if(

                        finished

                    ){

                        return;

                    }


                    finished =

                        true;


                    clearTimeout(

                        timeout

                    );


                    cleanup();


                    reject(

                        error

                    );

                }


                /* ==============================
                   CLEANUP
                ============================== */

                function cleanup(){

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

                }


                /* ==============================
                   PARAMS
                ============================== */

                const params =

                    new URLSearchParams();


                params.set(

                    "action",

                    "refreshToken"

                );


                params.set(

                    "refreshToken",

                    refreshToken

                );


                params.set(

                    "callback",

                    callbackName

                );


                /* ==============================
                   URL
                ============================== */

                script.src =

                    Auth.apiUrl

                    +

                    "?"

                    +

                    params.toString();


                console.log(

                    "Refresh request dikirim"

                );


                /* ==============================
                   SEND
                ============================== */

                document.head.appendChild(

                    script

                );

            }

        );


    /* ======================================
       VALIDATE RESPONSE
    ====================================== */

    if(

        !result

    ){

        throw new Error(

            "Response refresh token kosong"

        );

    }


    if(

        !result.success

    ){

        console.error(

            "Refresh Token Error:",

            result

        );


        /*
           Refresh token invalid / revoked.

           Session memang tidak dapat
           dipulihkan lagi.

           Baru di kondisi ini user
           perlu login ulang.
        */

        if(

            result.error

            &&

            (

                result.error.includes(

                    "invalid_grant"

                )

                ||

                result.error.includes(

                    "Refresh Token"

                )

                ||

                result.error.includes(

                    "invalid"

                )

            )

        ){

            clearSession();

        }


        throw new Error(

            result.error

            ||

            result.message

            ||

            "Gagal refresh Access Token"

        );

    }


    /* ======================================
       VALIDATE NEW TOKEN
    ====================================== */

    if(

        !result.token

        ||

        !result.token.accessToken

    ){

        throw new Error(

            "Access Token baru tidak ditemukan"

        );

    }


    /* ======================================
       UPDATE SESSION
    ====================================== */

    const updatedSession =

        updateAccessToken(

            result.token

        );


    console.log(

        "===== ACCESS TOKEN REFRESH SUCCESS ====="

    );


    console.log(

        "New expiresAt:",

        updatedSession
        ?.token
        ?.expiresAt

    );


    return (

        updatedSession
        ?.token
        ?.accessToken

        ||

        null

    );

}


/* ==========================================
   VALID ACCESS TOKEN
========================================== */

/*
   Ini function penting yang nantinya
   digunakan api.js.

   Alurnya:

   Session ada?
        ↓
   Access token ada?
        ↓
   Masih valid?
        ↓
      YES
        ↓
   return token

   Kalau hampir expired:
        ↓
   refreshAccessToken()
        ↓
   simpan token baru
        ↓
   return token baru
*/

export async function getValidAccessToken(){

    let session =

        loadSession();


    if(

        !session

    ){

        throw new Error(

            "Session tidak ditemukan. Silakan login."

        );

    }


    let accessToken =

        session
        ?.token
        ?.accessToken

        ||

        null;


    if(

        !accessToken

    ){

        throw new Error(

            "Access Token tidak ditemukan. Silakan login."

        );

    }


    /* ======================================
       TOKEN MASIH VALID
    ====================================== */

    if(

        !isAccessTokenExpired()

    ){

        return accessToken;

    }


    /* ======================================
       TOKEN HAMPIR EXPIRED
    ====================================== */

    console.log(

        "Access Token hampir expired."

    );


    console.log(

        "Mencoba refresh otomatis..."

    );


    try{

        accessToken =

            await refreshAccessToken();


        if(

            !accessToken

        ){

            throw new Error(

                "Access Token baru kosong"

            );

        }


        return accessToken;


    }catch(error){

        console.error(

            "Auto refresh gagal:",

            error

        );


        throw error;

    }

}


/* ==========================================
   CLEAR SESSION
========================================== */

function clearSession(){

    Auth.session =

        null;


    localStorage.removeItem(

        "finance_session"

    );

}


/* ==========================================
   LOGOUT
========================================== */

export function logout(){

    console.log(

        "===== LOGOUT ====="

    );


    clearSession();


    removeCodeVerifier();


    window.location.replace(

        "/finance-assistant/pages/index.html"

    );

}


/* ==========================================
   EXPORT AUTH OBJECT
========================================== */

export {

    Auth

};
