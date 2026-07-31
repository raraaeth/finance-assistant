/* ==========================================
   GOOGLE AUTH
========================================== */

const Auth = {

    clientId: "http://768306848932-j88fhhepq1o6d2jr6itv5c1v8020uf3a.apps.googleusercontent.com",

    redirectUri: "https://raraaeth.github.io/finance-assistant/auth/callback.html",

    scopes: [
        "openid",
        "email",
        "profile"
    ]

};

/* ==========================================
   INITIALIZE
========================================== */

init();

function init() {

    console.log("Auth loaded");

    if (isCallbackPage()) {

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



/* ==========================================
   CALLBACK
========================================== */
function handleCallback() {

    const params = new URLSearchParams(location.search);

    console.log(location.search);

    console.log(params);

}


/* ==========================================
   SESSION
========================================== */



/* ==========================================
   LOGOUT
========================================== */
