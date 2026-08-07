/* =====================================================
   HOME
   FILE : home.js
   DESCRIPTION : Home Controller
   VERSION : 2.0.0
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    loadUser

} from "../../js/storage.js";

import {

    CONFIG

} from "./config.js";

import {

    API

} from "../../js/api.js";

import {

    Process

} from "./process.js";

import {

    Statistics

} from "./statistics.js";

import {

    Summary

} from "./summary.js";

import {

    Header

} from "../../components/header/script.js";

import {

    Profile

} from "../../components/profile/script.js";

import {

    rupiah,

    shortRupiah

} from "../../js/utils.js";

import {

    Animation

} from "../../js/animation.js";



/* =====================================================
   INIT DATA
===================================================== */

const user =

    loadUser();


/* =====================================================
   INIT
===================================================== */

export async function init(){

    await Header.render({

        container :

            "#header-container",

        theme :

            "saving"

    });

    await API.load(

        CONFIG.api.transaction,

        CONFIG.api.bank

    );

    Process.init(

        API.raw,

        API.data

    );

    Statistics.init();

    Summary.init();

    renderHero();

    renderSummary();

    await Profile.render({

        container :

            "#profile-page"

    });

}


/* =====================================================
   HOME
===================================================== */

function capitalize(

    text

){

    return text.replace(

        /\b\w/g,

        letter=>

            letter.toUpperCase()

    );

}

/* =====================================================
   HERO
===================================================== */

function renderHero(){

    const name =

        capitalize(

            user?.displayName ??

            "Guest"

        );

    document.getElementById(

        "hero-title"

    ).innerHTML =

        `Halo, ${name} 👋`;

    document.getElementById(

        "hero-description"

    ).textContent =

        CONFIG.hero.description;

    document.getElementById(

        "hero-banner"

    ).src =

        CONFIG.hero.image;

}


/* =====================================================
   SUMMARY
===================================================== */

function renderSummary(){

    const card =

        document.getElementById(

            "summary-card"

        );

    if(

        !card

    ){

        return;

    }

    card.innerHTML =

    `

        <div class="summary-total">

            <p>

                Total Saldo

            </p>

            <h2

    id="summary-total-value"

>

</h2>

        </div>

        <div class="summary-grid">

            <div class="summary-item">

                <span>

                    Masuk Minggu Ini

                </span>

                <strong>

                    ${

                        shortRupiah(

                            Process.summary

                            .weeklyIncome

                        )

                    }

                </strong>

            </div>

            <div class="summary-item">

                <span>

                    Keluar Minggu Ini

                </span>

                <strong>

                    ${

                        shortRupiah(

                            Process.summary

                            .weeklyExpense

                        )

                    }

                </strong>

            </div>

        </div>

    `;

   Animation.number(

    document.getElementById(

        "summary-total-value"

    ),

    Process.summary

    .totalBalance,

    rupiah

);

}

