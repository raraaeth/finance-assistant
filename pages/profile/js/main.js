import { loginGoogle } from "../../../js/auth.js";

/*==================================
    Profile
==================================*/

document.addEventListener("DOMContentLoaded",init);


/*==================================
    Initialize
==================================*/

function init(){

    initEvents();

    initProfile();

}

/*==================================
    Events
==================================*/

function initEvents(){

    document
        .getElementById("pro-google-login-button")
        .addEventListener("click", onGoogleLogin);

}

/*==================================
    Login
==================================*/

async function onGoogleLogin(){

    const button = document.getElementById(
        "pro-google-login-button"
    );

    button.classList.add("loading");

    button.disabled = true;

    button.innerHTML = `
        <div class="spinner"></div>
        <span>Connecting...</span>
    `;

    await loginGoogle();

}



/*==================================
    Profile
==================================*/

function initProfile(){

    const isLogin=false;

    const login=document.getElementById("pro-login-section");

    const dashboard=document.getElementById("pro-dashboard-section");

    if(isLogin){

        login.classList.add("hidden");

        dashboard.classList.remove("hidden");

    }else{

        login.classList.remove("hidden");

        dashboard.classList.add("hidden");

    }

}
