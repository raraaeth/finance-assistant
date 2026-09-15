/* =====================================================
   FINANCE ASSISTANT
   CONTACT & FEEDBACK

   File    : /contact/js/app.js
   Version : 1.1.0

   Handles :
   - User identity
   - Feedback form
   - Web3Forms submission
   - Navigation drawer
   - Success / error state
   - Authentication check
===================================================== */

import { getUser } from "../../js/auth.js";
import { loadUser } from "../../js/storage.js";


/* =====================================================
   CONFIGURATION
===================================================== */

const CONFIG = {

    WEB3FORMS_ACCESS_KEY:
        "9e887887-c3ed-45fc-b065-206a18e0d2e4",

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

    initialized: false,

    menuOpen: false

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

    page: null,

    menuButton: null,

    menuOverlay: null,

    drawer: null,

    drawerClose: null

};


/* =====================================================
   INIT
===================================================== */

async function init(){

    if(State.initialized) return;

    cacheDOM();

    State.initialized = true;

    initMenu();

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
        document.getElementById(
            "feedbackForm"
        );

    DOM.name =
        document.getElementById(
            "feedbackName"
        );

    DOM.email =
        document.getElementById(
            "feedbackEmail"
        );

    DOM.message =
        document.getElementById(
            "feedbackMessage"
        );

    DOM.submit =
        document.getElementById(
            "feedbackSubmit"
        );

    DOM.status =
        document.getElementById(
            "feedbackStatus"
        );

    DOM.loading =
        document.getElementById(
            "feedbackLoading"
        );

    DOM.page =
        document.getElementById(
            "contactPage"
        );


    /* Navigation */

    DOM.menuButton =
        document.getElementById(
            "contactMenuButton"
        );

    DOM.menuOverlay =
        document.getElementById(
            "contactMenuOverlay"
        );

    DOM.drawer =
        document.getElementById(
            "contactDrawer"
        );

    DOM.drawerClose =
        document.getElementById(
            "contactDrawerClose"
        );

}


/* =====================================================
   NAVIGATION MENU
===================================================== */

function initMenu(){

    if(
        !DOM.menuButton ||
        !DOM.drawer
    ){

        return;

    }


    DOM.menuButton.addEventListener(
        "click",
        toggleMenu
    );


    DOM.drawerClose?.addEventListener(
        "click",
        closeMenu
    );


    DOM.menuOverlay?.addEventListener(
        "click",
        closeMenu
    );


    /*
     * Tutup drawer ketika memilih
     * salah satu navigasi.
     */

    const links =
        DOM.drawer.querySelectorAll(
            ".contact-navigation-link"
        );


    links.forEach(link => {

        link.addEventListener(
            "click",
            closeMenu
        );

    });


    /*
     * ESC untuk menutup drawer.
     */

    document.addEventListener(
        "keydown",
        event => {

            if(
                event.key === "Escape" &&
                State.menuOpen
            ){

                closeMenu();

            }

        }
    );

}


/* =====================================================
   TOGGLE MENU
===================================================== */

function toggleMenu(){

    if(State.menuOpen){

        closeMenu();

    } else {

        openMenu();

    }

}


/* =====================================================
   OPEN MENU
===================================================== */

function openMenu(){

    if(!DOM.drawer){

        return;

    }


    State.menuOpen =
        true;


    DOM.drawer.classList.add(
        "open"
    );


    if(DOM.menuOverlay){

        DOM.menuOverlay.hidden =
            false;

    }


    if(DOM.menuButton){

        DOM.menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        DOM.menuButton.setAttribute(
            "aria-label",
            "Tutup navigasi"
        );

    }


    DOM.drawer.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =====================================================
   CLOSE MENU
===================================================== */

function closeMenu(){

    if(!DOM.drawer){

        return;

    }


    State.menuOpen =
        false;


    DOM.drawer.classList.remove(
        "open"
    );


    if(DOM.menuOverlay){

        DOM.menuOverlay.hidden =
            true;

    }


    if(DOM.menuButton){

        DOM.menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        DOM.menuButton.setAttribute(
            "aria-label",
            "Buka navigasi"
        );

    }


    DOM.drawer.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/* =====================================================
   LOAD USER IDENTITY
===================================================== */

async function loadIdentity(){

    let account = null;


    try {

        account =
            loadUser();

    } catch(error){

        console.warn(
            "Failed to load Finance Assistant account:",
            error
        );

    }


    let authUser = null;


    try {

        authUser =
            await getUser();

    } catch(error){

        console.warn(
            "Failed to load authenticated user:",
            error
        );

    }


    State.account =
        account || null;

    State.user =
        authUser || null;


    if(
        !State.user &&
        !State.account
    ){

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
   FORM EVENTS
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


    if(!message){

        showStatus(
            "Silakan tulis feedback terlebih dahulu.",
            "error"
        );

        DOM.message?.focus();

        return;

    }


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


    State.submitting =
        true;


    setSubmitting(true);

    clearStatus();


    try {

        await sendFeedback({

            name,

            email,

            message

        });


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

        State.submitting =
            false;

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


    formData.append(
        "access_key",
        CONFIG.WEB3FORMS_ACCESS_KEY
    );


    formData.append(
        "subject",
        CONFIG.SUBJECT
    );


    formData.append(
        "name",
        name
    );


    formData.append(
        "email",
        email
    );


    formData.append(
        "replyto",
        email
    );


    formData.append(
        "message",
        message
    );


    formData.append(
        "from_name",
        "Finance Assistant"
    );


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

function setSubmitting(
    isSubmitting
){

    if(DOM.submit){

        DOM.submit.disabled =
            isSubmitting;

        DOM.submit.textContent =
            isSubmitting
                ? "Mengirim..."
                : "Kirim Feedback";

    }


    if(DOM.message){

        DOM.message.disabled =
            isSubmitting;

    }

}


/* =====================================================
   LOADING
===================================================== */

function setLoading(
    isLoading
){

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
