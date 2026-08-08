/* =====================================================
   HOME
   FILE : home.js
   DESCRIPTION : Home Controller
   VERSION : 3.0.0
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

            "kas"

    });

    await API.load(

        CONFIG.api.transaction,

        CONFIG.api.member

    );

    Process.init(

        API.raw,

        API.data

    );

    Statistics.init();

    Summary.init();

    renderHero();

    renderSummary();

    renderInput();

    renderSetting();

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

        letter =>

            letter.toUpperCase()

    );

}


/* =====================================================
   HERO
===================================================== */

function renderHero(){

    const title =

        document.getElementById(

            "hero-title"

        );

    const description =

        document.getElementById(

            "hero-description"

        );

    const banner =

        document.getElementById(

            "hero-banner"

        );

    const name =

        capitalize(

            user?.displayName ??

            "Guest"

        );

    if(

        title

    ){

        title.innerHTML =

            `Halo, ${name} 👋`;

    }

    if(

        description

    ){

        description.textContent =

            CONFIG.hero.description;

    }

    if(

        banner

    ){

        banner.src =

            CONFIG.hero.image;

    }

}


/* =====================================================
   SUMMARY
===================================================== */

function renderSummary(){

    const total =

        document.getElementById(

            "summary-total"

        );

    const weeklyIncome =

        document.getElementById(

            "summary-weekly-income"

        );

    const monthlyIncome =

        document.getElementById(

            "summary-monthly-income"

        );

    if(

        !total ||

        !weeklyIncome ||

        !monthlyIncome

    ){

        return;

    }


    /* ==========================================
       TOTAL SALDO
    ========================================== */

    Animation.number(

        total,

        Process.summary.totalBalance,

        value => rupiah(value),

        1800

    );


    /* ==========================================
       PEMASUKAN MINGGU INI
    ========================================== */

    weeklyIncome.textContent =

        shortRupiah(

            Process.summary.weeklyIncome

        );


    /* ==========================================
       PEMASUKAN BULAN INI
    ========================================== */

    monthlyIncome.textContent =

        shortRupiah(

            Process.summary.totalIncome

        );

}


/* =====================================================
   INPUT
===================================================== */

function renderInput(){

    const card =

        document.getElementById(

            "input-card"

        );

    if(

        !card

    ){

        return;

    }

    card.innerHTML =

    `

        <div class="card-header">

            <span class="card-title">

                Tambah Transaksi

            </span>

        </div>

        <div class="card-body">

            <p>

                Gunakan modul Kas untuk
                mencatat pemasukan,
                pengeluaran, atau transaksi
                lainnya.

            </p>

        </div>

    `;

}


/* =====================================================
   SETTING
===================================================== */

function renderSetting(){

    const card =

        document.getElementById(

            "setting-card"

        );

    if(

        !card

    ){

        return;

    }

    card.innerHTML =

    `

        <div class="card-header">

            <span class="card-title">

                Pengaturan Kas

            </span>

        </div>

        <div class="card-body">

            <p>

                Pengaturan workspace Kas
                dapat dikelola melalui
                Profile.

            </p>

        </div>

    `;

}
