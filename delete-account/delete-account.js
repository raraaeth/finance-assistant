/* =====================================================
   Finance Assistant
   Module      : DELETE ACCOUNT
   File        : delete-account.js
   Version     : 1.0.0

   Description :
   Halaman penghapusan akun.

   Handles :
   - Check Supabase session
   - Read logged-in user
   - Display account information
   - Prepare delete account action

   IMPORTANT :
   Penghapusan akun sebenarnya belum dilakukan
   di versi ini.

   Backend deletion akan dibuat terpisah.
===================================================== */


import {

    isLoggedIn,

    getUser

} from "../js/auth.js";


/* =====================================================
   DOM
===================================================== */

const loginMessage =

    document.getElementById(
        "loginMessage"
    );


const accountContent =

    document.getElementById(
        "accountContent"
    );


const accountEmail =

    document.getElementById(
        "accountEmail"
    );


const deleteButton =

    document.getElementById(
        "deleteButton"
    );


const statusMessage =

    document.getElementById(
        "statusMessage"
    );


/* =====================================================
   INITIALIZE
===================================================== */

initDeleteAccount();


/* =====================================================
   INIT
===================================================== */

async function initDeleteAccount(){

    console.log(
        "=========================================="
    );

    console.log(
        "===== DELETE ACCOUNT INITIALIZE ====="
    );

    console.log(
        "=========================================="
    );


    try{


        /* ======================================
           CHECK LOGIN
        ====================================== */

        const loggedIn =

            await isLoggedIn();


        console.log(

            "Delete Account - Logged In:",

            loggedIn

        );


        if(

            !loggedIn

        ){

            showLoggedOutState();

            return;

        }


        /* ======================================
           GET USER
        ====================================== */

        const user =

            await getUser();


        if(

            !user

        ){

            showLoggedOutState();

            return;

        }


        console.log(

            "Delete Account - User:",

            user

        );


        /* ======================================
           DISPLAY USER
        ====================================== */

        accountEmail.textContent =

            user.email

            ||

            "Email tidak tersedia";


        showLoggedInState();


    }catch(error){


        console.error(

            "DELETE ACCOUNT INIT ERROR:",

            error

        );


        showStatus(

            "Gagal memeriksa status akun. Silakan coba lagi."

        );

    }

}


/* =====================================================
   SHOW LOGGED OUT
===================================================== */

function showLoggedOutState(){


    loginMessage.classList.remove(
        "hidden"
    );


    accountContent.classList.add(
        "hidden"
    );


}


/* =====================================================
   SHOW LOGGED IN
===================================================== */

function showLoggedInState(){


    loginMessage.classList.add(
        "hidden"
    );


    accountContent.classList.remove(
        "hidden"
    );


}


/* =====================================================
   DELETE BUTTON
===================================================== */

deleteButton.addEventListener(

    "click",

    async function(){


        const confirmed =

            window.confirm(

                "Apakah kamu yakin ingin menghapus akun Finance Assistant?\n\n" +

                "Tindakan ini bersifat permanen."

            );


        if(

            !confirmed

        ){

            return;

        }


        /*
         * BELUM MELAKUKAN DELETE.
         *
         * Backend deletion akan dibuat
         * pada tahap berikutnya.
         */


        showStatus(

            "Fitur penghapusan akun sedang dipersiapkan."

        );


        console.log(

            "DELETE ACCOUNT: Confirmation received."

        );

    }

);


/* =====================================================
   STATUS
===================================================== */

function showStatus(message){


    statusMessage.textContent =

        message;


}
