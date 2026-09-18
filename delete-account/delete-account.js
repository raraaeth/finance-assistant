/* =====================================================
   Finance Assistant
   Module      : DELETE ACCOUNT
   File        : delete-account.js
   Version     : 2.0.0

   Description :
   Halaman penghapusan akun.

   Handles :
   - Check Supabase session
   - Read logged-in user
   - Display account information
   - Delete current Supabase Auth user
   - Logout after successful deletion

   IMPORTANT :
   - Hanya menghapus akun Supabase Auth
   - Tidak menghapus Google Sheets
   - Tidak menghapus data aplikasi
   - Tidak menghapus user lain
===================================================== */

import {
    isLoggedIn,
    getUser,
    getAccessToken,
    logout
} from "../js/auth.js";


// =====================================================
// ELEMENT
// =====================================================

const loginMessage =
    document.getElementById("loginMessage");

const accountContent =
    document.getElementById("accountContent");

const accountEmail =
    document.getElementById("accountEmail");

const deleteButton =
    document.getElementById("deleteButton");

const statusMessage =
    document.getElementById("statusMessage");


// =====================================================
// EDGE FUNCTION
// =====================================================

const DELETE_ACCOUNT_URL =
    "https://vimijrijelqarbyyqwhq.supabase.co/functions/v1/delete-account";


// =====================================================
// INITIALIZE
// =====================================================

initDeleteAccount();


// =====================================================
// CHECK LOGIN
// =====================================================

async function initDeleteAccount(){

    console.log("==========================================");
    console.log("===== DELETE ACCOUNT INITIALIZE =====");
    console.log("==========================================");

    try{

        const loggedIn =
            await isLoggedIn();

        console.log(
            "Delete Account - Logged In:",
            loggedIn
        );

        if(!loggedIn){

            showLoggedOutState();

            return;
        }


        const user =
            await getUser();


        if(!user){

            showLoggedOutState();

            return;
        }


        console.log(
            "Delete Account - User:",
            user
        );


        accountEmail.textContent =
            user.email ||
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


// =====================================================
// LOGGED OUT STATE
// =====================================================

function showLoggedOutState(){

    loginMessage.classList.remove("hidden");

    accountContent.classList.add("hidden");
}


// =====================================================
// LOGGED IN STATE
// =====================================================

function showLoggedInState(){

    loginMessage.classList.add("hidden");

    accountContent.classList.remove("hidden");
}


// =====================================================
// DELETE BUTTON
// =====================================================

deleteButton.addEventListener(
    "click",
    async function(){

        const confirmed =
            window.confirm(
                "Apakah kamu yakin ingin menghapus akun Finance Assistant?\n\n" +
                "Akun Supabase Auth akan dihapus secara permanen.\n" +
                "Data Google Sheets tidak akan dihapus.\n\n" +
                "Tindakan ini tidak dapat dibatalkan."
            );


        if(!confirmed){

            return;
        }


        await deleteAccount();
    }
);


// =====================================================
// DELETE ACCOUNT
// =====================================================

async function deleteAccount(){

    try{

        // -------------------------------------------------
        // Disable button
        // -------------------------------------------------

        deleteButton.disabled = true;

        deleteButton.textContent =
            "Menghapus akun...";


        showStatus(
            "Sedang memproses penghapusan akun..."
        );


        // -------------------------------------------------
        // Get current access token
        // -------------------------------------------------

        const accessToken =
            await getAccessToken();


        if(!accessToken){

            showStatus(
                "Sesi login tidak ditemukan. Silakan login kembali."
            );

            resetDeleteButton();

            return;
        }


        // -------------------------------------------------
        // Call Supabase Edge Function
        // -------------------------------------------------

        const response =
            await fetch(
                DELETE_ACCOUNT_URL,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${accessToken}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        // -------------------------------------------------
        // Read response
        // -------------------------------------------------

        let result = {};

        try{

            result =
                await response.json();

        }catch(error){

            console.warn(
                "DELETE ACCOUNT RESPONSE JSON ERROR:",
                error
            );
        }


        console.log(
            "Delete Account Response:",
            response.status,
            result
        );


        // -------------------------------------------------
        // Error response
        // -------------------------------------------------

        if(!response.ok){

            showStatus(
                result.error ||
                "Gagal menghapus akun. Silakan coba lagi."
            );

            resetDeleteButton();

            return;
        }


        // -------------------------------------------------
        // Success
        // -------------------------------------------------

        if(result.success === true){

            showStatus(
                "Akun berhasil dihapus. Mengakhiri sesi..."
            );


            deleteButton.disabled = true;


            // -------------------------------------------------
            // Logout / clear local Supabase session
            // -------------------------------------------------

            setTimeout(
                async function(){

                    try{

                        await logout();

                    }catch(error){

                        console.error(
                            "LOGOUT AFTER DELETE ERROR:",
                            error
                        );

                        // Fallback jika logout gagal
                        window.location.replace(
                            "/pages/index.html"
                        );
                    }

                },
                1200
            );


            return;
        }


        // -------------------------------------------------
        // Unexpected response
        // -------------------------------------------------

        showStatus(
            "Penghapusan akun belum dapat dikonfirmasi."
        );

        resetDeleteButton();


    }catch(error){

        console.error(
            "DELETE ACCOUNT REQUEST ERROR:",
            error
        );

        showStatus(
            "Terjadi kesalahan koneksi. Silakan coba lagi."
        );

        resetDeleteButton();
    }
}


// =====================================================
// RESET BUTTON
// =====================================================

function resetDeleteButton(){

    deleteButton.disabled = false;

    deleteButton.textContent =
        "Hapus Akun";
}


// =====================================================
// STATUS
// =====================================================

function showStatus(message){

    statusMessage.textContent =
        message;
}
