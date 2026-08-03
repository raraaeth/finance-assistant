/* =====================================================
   PROFILE
   FILE : profile.js
   DESCRIPTION : Saving Profile
   VERSION : 1.0.0
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadUser

} from "../../../../js/storage.js";

import {

    loadSession,

    loginGoogle,

    logout

} from "../../../../js/auth.js";


/* =====================================================
   STATE
===================================================== */

const Profile = {

    session : null,

    user : null,

    app : "saving"

};


/* =====================================================
   INIT
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    init

);

function init(){

    Profile.session =

        loadSession();

    Profile.user =

        loadUser();

    render();

}


/* =====================================================
   RENDER
===================================================== */

function render(){

    const page =

        document.getElementById(

            "profile-page"

        );

    if(

        !page

    ){

        return;

    }

    if(

        !Profile.session

    ){

        renderGuest();

        return;

    }

    renderUserCard();

    renderWorkspaceCard();

    renderMenuCard();

    renderLogoutCard();

}

/* =====================================================
   GUEST
===================================================== */

function renderGuest(){

    document.getElementById(

        "profile-page"

    ).innerHTML =

    `

        <section class="profile-card">

            <div class="profile-guest">

                <img

                    class="profile-guest-image"

                    src="../../assets/images/hero/hero-dashboard.png"

                    alt="Finance Assistant"

                >

                <h2 class="profile-guest-title">

                    Finance Assistant

                </h2>

                <p class="profile-guest-description">

                    Masuk menggunakan akun Google
                    untuk membuat workspace
                    pribadimu.

                </p>

                <button

                    id="profile-login-button"

                    class="profile-login-button"

                >

                    Masuk dengan Google

                </button>

            </div>

        </section>

    `;

    document

        .getElementById(

            "profile-login-button"

        )

        .addEventListener(

            "click",

            onGoogleLogin

        );

}

/* =====================================================
   GOOGLE LOGIN
===================================================== */

async function onGoogleLogin(){

    const button =

        document.getElementById(

            "profile-login-button"

        );

    button.disabled = true;

    button.textContent =

        "Menyiapkan Workspace...";

    await loginGoogle();

}

/* =====================================================
   USER
===================================================== */

function renderUserCard(){

    document.getElementById(

        "profile-page"

    ).innerHTML =

    `

        <section

            id="profile-user"

        >

        </section>

    `;

    const name =

        Profile.user?.displayName

        ??

        "Guest";

    const email =

        Profile.session?.user?.email

        ??

        "-";

    document.getElementById(

        "profile-user"

    ).innerHTML =

    `

        <article

            class="profile-card profile-user"

        >

            <img

                class="profile-avatar"

                src="${getAvatar()}"

                alt="${name}"

            >

            <span

                class="profile-greeting"

            >

                ${getGreeting()}

            </span>

            <h2

                class="profile-name"

            >

                ${name}

            </h2>

            <p

                class="profile-email"

            >

                ${email}

            </p>

            <p

                class="profile-description"

            >

                Kelola seluruh
                workspace Finance
                Assistant milikmu.

            </p>

        </article>

    `;

}

/* =====================================================
   GREETING
===================================================== */

function getGreeting(){

    const hour =

        new Date()

        .getHours();

    if(hour < 11){

        return "🌅 Selamat Pagi";

    }

    if(hour < 15){

        return "☀️ Selamat Siang";

    }

    if(hour < 18){

        return "🌇 Selamat Sore";

    }

    return "🌙 Selamat Malam";

}

/* =====================================================
   AVATAR
===================================================== */

function getAvatar(){

    if(

        Profile.session?.user?.picture

    ){

        return Profile.session.user.picture;

    }

    return

    "../../../../assets/images/avatar/guest.webp";

}

