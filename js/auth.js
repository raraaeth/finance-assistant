
/* ==========================================
   GOOGLE AUTH
========================================== */

const Auth = {

    clientId: "768306848932-j88fhhepq1o6d2jr6itv5c1v8020uf3a.apps.googleusercontent.com",

    redirectUri: "https://raraaeth.github.io/finance-assistant/auth/callback.html",

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

    const session = loadSession();

    if(session){

        console.log(

            "Auto Login",

            session

        );

        return;

    }

    if(isCallbackPage()){

        handleCallback();

    }

}


/* ==========================================
   PAGE
========================================== */

function isCallbackPage() {

    return location.pathname.endsWith("/auth/callback.html");

}



/* ==========================================
   LOGIN
========================================== */

export async function loginGoogle() {

    await requestAuthorization();

}
window.loginGoogle = loginGoogle;

async function requestAuthorization() {

    const verifier = await generateCodeVerifier();

    const challenge = await generateCodeChallenge(verifier);

    saveCodeVerifier(verifier);

    const params = new URLSearchParams({

        client_id: Auth.clientId,

        redirect_uri: Auth.redirectUri,

        response_type: "code",

        scope: Auth.scopes.join(" "),

        code_challenge: challenge,

        code_challenge_method: "S256",

        access_type: "offline",

        prompt: "consent"

    });

    location.href =
        "https://accounts.google.com/o/oauth2/v2/auth?"
        + params.toString();

}

async function generateCodeVerifier() {

    const random = new Uint8Array(32);

    crypto.getRandomValues(random);

    return base64UrlEncode(random);

}

function base64UrlEncode(buffer) {

    return btoa(String.fromCharCode(...buffer))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

}

async function generateCodeChallenge(verifier) {

    const encoder = new TextEncoder();

    const data = encoder.encode(verifier);

    const hash = await crypto.subtle.digest("SHA-256", data);

    return base64UrlEncode(new Uint8Array(hash));

}

function saveCodeVerifier(verifier) {

    sessionStorage.setItem(
        "code_verifier",
        verifier
    );

}

function getCodeVerifier() {

    return sessionStorage.getItem(
        "code_verifier"
    );

}

function removeCodeVerifier() {

    sessionStorage.removeItem(
        "code_verifier"
    );

}

/* ==========================================
   CALLBACK
========================================== */

    async function handleCallback(){

    const params=new URLSearchParams(
        location.search
    );

    const code=params.get("code");

    if(!code){

        console.error(
            "Authorization code not found."
        );

        return;

    }

    console.log(
        "Authorization Code:",
        code
    );

    const verifier=getCodeVerifier();

    if(!verifier){

        console.error(
            "Code verifier not found."
        );

        return;

    }

    console.log(
        "Code Verifier:",
        verifier
    );

   const form=new URLSearchParams();

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
       
       const response=await fetch(

        "https://script.google.com/macros/s/AKfycbwqjDC7jXtaCACwAp8HeA8ZeEE7NxexBhEPNQpP2JdeY2-n4LmWVg1psD-M3PXwmC-d/exec",

        {

            method:"POST",

        body:form

    }

);

const result=await response.json();

console.log(
    "Apps Script Response:",
    result
);

if(!result.success){

    console.error(result);

    return;

}

saveSession(result);

console.log(

    "Session Saved",

    result

);

removeCodeVerifier();

console.log("Redirecting...");

location.replace(
    "../pages/dashboard/index.html"
);

}


/*=========================================
   SAVE SESSION
=========================================*/

function saveSession(session){

    Auth.session = session;

    localStorage.setItem(

        "finance_session",

        JSON.stringify(session)

    );

}

/*=========================================
   LOAD SESSION
=========================================*/

function loadSession(){

    const data = localStorage.getItem(

        "finance_session"

    );

    if(!data){

        return null;

    }

    try{

        Auth.session = JSON.parse(data);

        return Auth.session;

    }catch(error){

        localStorage.removeItem(

            "finance_session"

        );

        return null;

    }

}


/*=========================================
   LOGOUT
=========================================*/

function logout(){

    Auth.session = null;

    localStorage.removeItem(

        "finance_session"

    );

    removeCodeVerifier();

    location.href = "/";

}
