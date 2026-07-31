/*==================================
    Profile
==================================*/

document.addEventListener("DOMContentLoaded",init);


/*==================================
    Initialize
==================================*/

function init(){

    initProfile();

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
