/* =====================================================
   FINANCE ASSISTANT
   CONTACT & FEEDBACK

   File    : /contact/js/app.js
   Version : 1.0.0

   Description :
   Contact & Feedback Controller

   Handles :
   - User identity
   - Feedback form
   - Web3Forms submission
   - Success / error state
   - Authentication check
===================================================== */

import { getUser } from "../../js/auth.js";
import { loadUser } from "../../js/storage.js";


/* =====================================================
   CONFIGURATION
===================================================== */

const CONFIG = {

    /*
     * Web3Forms Access Key
     *
     * Jangan tampilkan key ini di UI.
     */
    WEB3FORMS_ACCESS_KEY:
        "9e887887-c3ed-45fc-b065-206a18e0d2e4",

    /*
     * Email tujuan
     *
     * Digunakan sebagai informasi internal.
     * Web3Forms tetap menentukan destination
     * berdasarkan konfigurasi Access Key.
     */
    DESTINATION_EMAIL:
        "ainurdragneel@gmail.com",

    SUBJECT:
        "Feedback Finance Assistant"
};


/* =====================================================
   STATE
===================================================== */

const State = {

    user: null,

    account: null,

    submitting: false,

    initialized: false
};


/* =====================================================
   DOM
===================================================== */

const DOM = {

    form: null,

    name: null,

    email: null,

    message: null,

    submit: null,

    status: null,

    loading: null,

    page: null
};


/* =====================================================
   INIT
===================================================== */

async function init(){

    if(State.initialized) return;

    cacheDOM();

    State.initialized = true;

    setLoading(true);

    try {

        await loadIdentity();

        renderIdentity();

        bindEvents();

    } catch(error){

        console.error(
            "Contact initialization error:",
            error
        );

        showStatus(
            "Terjadi kesalahan saat memuat data akun.",
            "error"
        );

    } finally {

        setLoading(false);

    }
}


/* =====================================================
   CACHE DOM
===================================================== */

function cacheDOM(){

    DOM.form =
        document.getElementById("feedbackForm");

    DOM.name =
        document.getElementById("feedbackName");

    DOM.email =
        document.getElementById("feedbackEmail");

    DOM.message =
        document.getElementById("feedbackMessage");

    DOM.submit =
        document.getElementById("feedbackSubmit");

    DOM.status =
        document.getElementById("feedbackStatus");

    DOM.loading =
        document.getElementById("feedbackLoading");

    DOM.page =
        document.getElementById("contactPage");

}


/* =====================================================
   LOAD USER IDENTITY
===================================================== */

async function loadIdentity(){

    /*
     * Account data
     *
     * Berisi data profile Finance Assistant:
     * - displayName
     * - email
     * - currency
     * - theme
     */
    let account = null;

    try {

        account = loadUser();

    } catch(error){

        console.warn(
            "Failed to load Finance Assistant account:",
            error
        );

    }

    /*
     * Supabase / Google session
     *
     * Digunakan sebagai fallback identity.
     */
    let authUser = null;

    try {

        authUser = await getUser();

    } catch(error){

        console.warn(
            "Failed to load authenticated user:",
            error
        );

    }


    State.account = account || null;
    State.user = authUser || null;


    /*
     * Pastikan user sudah login.
     */

    if(!State.user && !State.account){

        throw new Error(
            "User belum login."
        );

    }

}


/* =====================================================
   GET DISPLAY NAME
===================================================== */

function getDisplayName(){

    const account =
        State.account || {};

    const user =
        State.user || {};

    const metadata =
        user.user_metadata || {};


    return (
        account.displayName ||
        metadata.full_name ||
        metadata.name ||
        metadata.display_name ||
        user.email ||
        account.email ||
        "User"
    );

}


/* =====================================================
   GET EMAIL
===================================================== */

function getEmail(){

    const account =
        State.account || {};

    const user =
        State.user || {};


    return (
        account.email ||
        user.email ||
        ""
    );

}


/* =====================================================
   RENDER IDENTITY
===================================================== */

function renderIdentity(){

    const name =
        getDisplayName();

    const email =
        getEmail();


    if(DOM.name){

        DOM.name.value =
            name;

        DOM.name.readOnly =
            true;

    }


    if(DOM.email){

        DOM.email.value =
            email;

        DOM.email.readOnly =
            true;

    }

}


/* =====================================================
   EVENTS
===================================================== */

function bindEvents(){

    if(!DOM.form){

        console.warn(
            "Feedback form tidak ditemukan."
        );

        return;

    }


    DOM.form.addEventListener(
        "submit",
        handleSubmit
    );

}


/* =====================================================
   SUBMIT
===================================================== */

async function handleSubmit(event){

    event.preventDefault();


    if(State.submitting){

        return;

    }


    const message =
        DOM.message?.value?.trim() || "";


    /*
     * Validasi feedback
     */

    if(!message){

        showStatus(
            "Silakan tulis feedback terlebih dahulu.",
            "error"
        );

        DOM.message?.focus();

        return;

    }


    /*
     * Pastikan identitas tersedia.
     */

    const name =
        getDisplayName();

    const email =
        getEmail();


    if(!email){

        showStatus(
            "Email akun tidak ditemukan. Silakan login kembali.",
            "error"
        );

        return;

    }


    State.submitting = true;

    setSubmitting(true);

    clearStatus();


    try {

        await sendFeedback({

            name,

            email,

            message

        });


        /*
         * Bersihkan hanya isi feedback.
         *
         * Name dan Email tetap karena
         * berasal dari Account / Session.
         */

        if(DOM.message){

            DOM.message.value =
                "";

        }


        showStatus(
            "Feedback berhasil dikirim. Terima kasih sudah membantu mengembangkan Finance Assistant! 🙏",
            "success"
        );


    } catch(error){

        console.error(
            "Feedback submission error:",
            error
        );


        showStatus(
            error?.message ||
            "Feedback gagal dikirim. Silakan coba lagi.",
            "error"
        );


    } finally {

        State.submitting = false;

        setSubmitting(false);

    }

}


/* =====================================================
   SEND FEEDBACK
===================================================== */

async function sendFeedback({

    name,

    email,

    message

}){


    const formData =
        new FormData();


    /*
     * Web3Forms
     */

    formData.append(
        "access_key",
        CONFIG.WEB3FORMS_ACCESS_KEY
    );


    /*
     * Subject email
     */

    formData.append(
        "subject",
        CONFIG.SUBJECT
    );


    /*
     * Nama user
     */

    formData.append(
        "name",
        name
    );


    /*
     * Email user
     *
     * Digunakan juga sebagai reply-to.
     */

    formData.append(
        "email",
        email
    );

    formData.append(
        "replyto",
        email
    );


    /*
     * Feedback
     */

    formData.append(
        "message",
        message
    );


    /*
     * Tambahan informasi agar email
     * mudah dikenali.
     */

    formData.append(
        "from_name",
        "Finance Assistant"
    );


    /*
     * Honeypot.
     *
     * Field ini sengaja kosong.
     * Bot yang mengisinya dapat ditolak
     * oleh Web3Forms.
     */

    formData.append(
        "botcheck",
        ""
    );


    const response =
        await fetch(
            "https://api.web3forms.com/submit",
            {

                method:
                    "POST",

                headers: {

                    "Accept":
                        "application/json"

                },

                body:
                    formData

            }
        );


    let result = null;


    try {

        result =
            await response.json();

    } catch(error){

        throw new Error(
            "Server tidak memberikan respons yang valid."
        );

    }


    if(
        !response.ok ||
        !result?.success
    ){

        throw new Error(
            result?.message ||
            "Feedback gagal dikirim."
        );

    }


    return result;

}


/* =====================================================
   SUBMITTING STATE
===================================================== */

function setSubmitting(isSubmitting){

    if(DOM.submit){

        DOM.submit.disabled =
            isSubmitting;

    }


    if(DOM.message){

        DOM.message.disabled =
            isSubmitting;

    }


    if(DOM.submit){

        DOM.submit.textContent =
            isSubmitting
                ? "Mengirim..."
                : "Kirim Feedback";

    }

}


/* =====================================================
   LOADING
===================================================== */

function setLoading(isLoading){

    if(DOM.loading){

        DOM.loading.hidden =
            !isLoading;

    }


    if(DOM.form){

        DOM.form.hidden =
            isLoading;

    }

}


/* =====================================================
   STATUS
===================================================== */

function showStatus(
    message,
    type = "info"
){

    if(!DOM.status){

        return;

    }


    DOM.status.textContent =
        message;


    DOM.status.className =
        `feedback-status ${type}`;

    DOM.status.hidden =
        false;

}


/* =====================================================
   CLEAR STATUS
===================================================== */

function clearStatus(){

    if(!DOM.status){

        return;

    }


    DOM.status.textContent =
        "";

    DOM.status.className =
        "feedback-status";

    DOM.status.hidden =
        true;

}


/* =====================================================
   START
===================================================== */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        init,
        {
            once: true
        }
    );

} else {

    init();

}


/* =====================================================
   EXPORT
===================================================== */

export default {

    init

};
