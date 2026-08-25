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

        "768306848932-j88fhhepq1o6d2jr6itv5c1v8020uf3a.apps.googleusercontent.com",


    redirectUri:

        "https://raraaeth.github.io/finance-assistant/auth/callback.html",


    apiUrl:

        "https://script.google.com/macros/s/AKfycbwqjDC7jXtaCACwAp8HeA8ZeEE7NxexBhEPNQpP2JdeY2-n4LmWVg1psD-M3PXwmC-d/exec",


    scopes: [

        "openid",

        "email",

        "profile",

        "https://www.googleapis.com/auth/drive.file"

    ],


    client: null,

    session: null

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
           BUILD REQUEST DATA
        ====================================== */

        const form =

            new URLSearchParams();


        form.append(

            "action",

            "login"

        );


        form.append(

            "code",

            code

        );


        form.append(

            "verifier",

            verifier

        );


        /* ======================================
           ONBOARDING DATA
        ====================================== */

        if(

            onboarding

        ){

            form.append(

                "displayName",

                onboarding.displayName

                ||

                ""

            );


            form.append(

                "currency",

                onboarding.currency

                ||

                "IDR"

            );


            form.append(

                "theme",

                onboarding.theme

                ||

                "system"

            );


            form.append(

                "onboardingCompleted",

                onboarding.onboardingCompleted === true

                    ?

                    "true"

                    :

                    "false"

            );

        }

/* ======================================
   REQUEST APPS SCRIPT
   JSONP

   Tidak menggunakan fetch()
   sehingga tidak terkena CORS.
====================================== */

console.log(

    "Sending request to Apps Script..."

);


/* ======================================
   CREATE CALLBACK
====================================== */

const callbackName =

    "__financeAssistantLogin_" +

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

            window[

                callbackName

            ] = function(

                data

            ){

                console.log(

                    "Apps Script Response:",

                    data

                );


                delete window[

                    callbackName

                ];


                script.remove();


                resolve(

                    data

                );

            };


            const script =

                document.createElement(

                    "script"

                );


            const params =

                new URLSearchParams();


            params.set(

                "action",

                "login"

            );


            params.set(

                "code",

                code

            );


            params.set(

                "verifier",

                verifier

            );


            params.set(

                "callback",

                callbackName

            );


            /* ==================================
               ONBOARDING
            ================================== */

            if(

                onboarding

            ){

                params.set(

                    "displayName",

                    onboarding.displayName

                    ||

                    ""

                );


                params.set(

                    "currency",

                    onboarding.currency

                    ||

                    "IDR"

                );


                params.set(

                    "theme",

                    onboarding.theme

                    ||

                    "system"

                );


                params.set(

                    "onboardingCompleted",

                    onboarding.onboardingCompleted === true

                        ?

                        "true"

                        :

                        "false"

                );

            }


            script.src =

                Auth.apiUrl

                +

                "?"

                +

                params.toString();


            script.onerror = function(){

                delete window[

                    callbackName

                ];


                script.remove();


                reject(

                    new Error(

                        "Gagal menghubungi Apps Script"

                    )

                );

            };


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
        ====================================== */

        const accountData =

            result.workspace

            ?.accountData;


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
           SHOW ERROR ON CALLBACK PAGE
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
