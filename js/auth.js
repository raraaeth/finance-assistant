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

        "https://script.google.com/macros/s/AKfycbxBiQSb1pioB0mDbkAqd6S3y4T5CTByn2-6kW7-T1l-5PdGYTBVDX4IXskxyu_QxokHDw/exec",


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

            "Auto Login",

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


        /* ======================================
           GET AUTHORIZATION CODE
        ====================================== */

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


        /* ======================================
           GET CODE VERIFIER
        ====================================== */

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


        /* ======================================
           LOAD ONBOARDING
        ====================================== */

        const onboarding =

            loadOnboardingData();


        console.log(

            "Onboarding Data:",

            onboarding

        );


        /* ======================================
           REQUEST APPS SCRIPT
           JSONP

           Tidak menggunakan fetch()
           karena Apps Script Web App
           tidak menyediakan CORS header
           untuk request ini.
        ====================================== */

        console.log(

            "Sending request to Apps Script..."

        );


        /* ======================================
           CREATE CALLBACK NAME
        ====================================== */

        const callbackName =

            "__financeAssistantLogin_"

            +

            Date.now();


        /* ======================================
           JSONP PROMISE
        ====================================== */

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


                    /* ==================================
                       REGISTER CALLBACK
                    ================================== */

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


                    /* ==================================
                       BUILD PARAMS
                    ================================== */

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


                    /* ==================================
                       ONBOARDING DATA
                    ================================== */

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


                    /* ==================================
                       BUILD SCRIPT URL
                    ================================== */

                    script.src =

                        Auth.apiUrl

                        +

                        "?"

                        +

                        requestParams.toString();


                    console.log(

                        "API URL:",

                        script.src

                    );


                    /* ==================================
                       ERROR
                    ================================== */

                    script.onerror = function(){

                        cleanup();


                        reject(

                            new Error(

                                "Gagal menghubungi Apps Script"

                            )

                        );

                    };


                    /* ==================================
                       CLEANUP
                    ================================== */

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


                    /* ==================================
                       SEND REQUEST
                    ================================== */

                    document.head.appendChild(

                        script

                    );

                }

            );


        /* ======================================
           CHECK RESULT
        ====================================== */

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


        /* ======================================
           CHECK WORKSPACE
        ====================================== */

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


        /* ======================================
           RESTORE ACCOUNT DATA

           Data utama sekarang berasal
           dari Account sheet.
        ====================================== */

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


        /* ======================================
           FALLBACK USER

           Tetap mendukung response lama
           jika backend mengirim result.user.
        ====================================== */

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


        /* ======================================
           SAVE SESSION
        ====================================== */

        saveSession(

            result

        );


        console.log(

            "Session Saved"

        );


        /* ======================================
           CLEANUP
        ====================================== */

        removeCodeVerifier();


        console.log(

            "Redirecting..."

        );


        /* ======================================
           REDIRECT
        ====================================== */

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


        /* ======================================
           SHOW ERROR
        ====================================== */

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

        return null;

    }


    try{

        Auth.session =

            JSON.parse(

                data

            );


        return Auth.session;


    }catch(error){

        localStorage.removeItem(

            "finance_session"

        );


        return null;

    }

}


/* ==========================================
   LOGOUT
========================================== */

export function logout(){

    Auth.session =

        null;


    localStorage.removeItem(

        "finance_session"

    );


    removeCodeVerifier();


    window.location.replace(

        "/finance-assistant/pages/index.html"

    );

}
