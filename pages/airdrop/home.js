/* =====================================================
   Finance Assistant
   Page        : Airdrop
   Module      : Home
   File        : home.js
   Version     : 2.0.0

   Description :
   Airdrop Home Controller

   Sections :
   - Import
   - State
   - Init
   - Hero
   - Summary
   - Reminder
   - Helper
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

    Process

} from "./process.js";


import {

    Header

} from "../../components/header/script.js";


import {

    Profile

} from "../../components/profile/script.js";


import {

    Animation

} from "../../js/animation.js";


import {

    usd

} from "../../js/utils.js";


/* =====================================================
   STATE
===================================================== */

const user =

    loadUser();


let reminderAnimation =

    null;


/* =====================================================
   INIT
===================================================== */

export async function init(){

    /* =============================================
       HEADER
    ============================================= */

    await Header.render({

        container :

            "#header-container",

        theme :

            "airdrop"

    });


    /* =============================================
       HERO
    ============================================= */

    renderHero();


    /* =============================================
       PROCESS
    ============================================= */

    initProcess();


    /* =============================================
       SUMMARY
    ============================================= */

    renderSummary();


    /* =============================================
       REMINDER
    ============================================= */

    renderReminder();


    /* =============================================
       PROFILE
    ============================================= */

    await Profile.render({

        container :

            "#profile-page"

    });

}


/* =====================================================
   PROCESS
===================================================== */

function initProcess(){

    /*
     * Process sudah menjadi business engine
     * workspace Airdrop.
     *
     * Jika data sudah diproses oleh engine,
     * Home langsung menggunakan hasilnya.
     */

    if(

        !Process

    ){

        console.warn(

            "Airdrop Process tidak tersedia."

        );

        return;

    }


    /*
     * Jika Process memiliki init()
     * tetapi belum dijalankan, jalankan.
     *
     * Bagian ini dibuat defensif agar
     * tidak merusak workspace ketika
     * engine nantinya dipindahkan ke
     * app.js / workspace loader.
     */

    if(

        typeof Process.init ===

        "function"

    ){

        /*
         * Jangan memaksa init apabila
         * data sudah tersedia.
         */

        if(

            !Array.isArray(

                Process.data

            )

            ||

            Process.data.length === 0

        ){

            Process.init();

        }

    }

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


    const title =

        document.getElementById(

            "hero-title"

        );


    const description =

        document.getElementById(

            "hero-description"

        );


    const image =

        document.getElementById(

            "hero-banner"

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

            CONFIG.hero?.description ??

            "Pantau airdrop dan reward kamu.";

    }


    if(

        image

    ){

        image.src =

            CONFIG.hero?.image ??

            "";


        image.alt =

            "Airdrop";

    }

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


    const data =

        getSummaryData();


    card.innerHTML =

    `

        <!-- ==========================================
             TOTAL REWARD
        =========================================== -->

        <div class="airdrop-summary-total">

            <span class="airdrop-summary-label">

                Total Reward

            </span>


            <strong

                id="airdrop-summary-reward"

                class="airdrop-summary-value">

                $0

            </strong>

        </div>


        <!-- ==========================================
             STATUS SUMMARY
        =========================================== -->

        <div class="airdrop-summary-grid">


            <!-- ALL AIRDROP -->

            <div class="airdrop-summary-item">

                <div class="airdrop-summary-icon">

                    🎯

                </div>


                <span>

                    Campaign

                </span>


                <strong>

                    ${data.total}

                </strong>

            </div>


            <!-- ONGOING -->

            <div class="airdrop-summary-item">

                <div class="airdrop-summary-icon">

                    ⏳

                </div>


                <span>

                    Ongoing

                </span>


                <strong>

                    ${data.ongoing}

                </strong>

            </div>


            <!-- WINNER -->

            <div class="airdrop-summary-item">

                <div class="airdrop-summary-icon">

                    🏆

                </div>


                <span>

                    Winner

                </span>


                <strong>

                    ${data.win}

                </strong>

            </div>


        </div>

    `;


    /*
     * Number animation.
     */

    Animation.number(

        document.getElementById(

            "airdrop-summary-reward"

        ),

        data.totalReward,

        usd,

        1800

    );

}


/* =====================================================
   SUMMARY DATA
===================================================== */

function getSummaryData(){

    /*
     * Process menjadi sumber utama.
     */

    const data =

        Array.isArray(

            Process?.data

        )

            ?

            Process.data

            :

            [];


    /*
     * TOTAL AIRDROP
     *
     * Semua entry dihitung:
     *
     * campaign
     * retro
     * testnet
     * daily
     * bansos
     * dll.
     */

    const total =

        data.length;


    /*
     * TOTAL REWARD
     *
     * Hanya nominal reward yang
     * memang tersedia.
     */

    const totalReward =

        data.reduce(

            (

                total,

                item

            ) => {

                return (

                    total +

                    toNumber(

                        item?.reward ??

                        item?.["$reward"]

                    )

                );

            },

            0

        );


    /*
     * ONGOING
     */

    const ongoing =

        data.filter(

            item =>

                String(

                    item?.status ??

                    ""

                )

                .toLowerCase()

                ===

                "ongoing"

        ).length;


    /*
     * WINNER
     */

    const win =

        data.filter(

            item =>

                String(

                    item?.status ??

                    ""

                )

                .toLowerCase()

                ===

                "win"

        ).length;


    return {

        total,

        totalReward,

        ongoing,

        win

    };

}


/* =====================================================
   REMINDER
===================================================== */

function renderReminder(){

    const section =

        document.getElementById(

            "airdrop-reminder"

        );


    const container =

        document.getElementById(

            "airdrop-reminder-list"

        );


    /*
     * HTML reminder hanya khusus
     * workspace Airdrop.
     *
     * Kalau HTML belum ditambahkan,
     * Home tidak error.
     */

    if(

        !section ||

        !container

    ){

        return;

    }


    const reminders =

        getReminders();


    if(

        !reminders.length

    ){

        section.classList.add(

            "hidden"

        );

        container.innerHTML =

            "";

        return;

    }


    section.classList.remove(

        "hidden"

    );


    /*
     * Maksimal 3 reminder.
     */

    container.innerHTML =

        reminders

            .slice(

                0,

                3

            )

            .map(

                createReminder

            )

            .join("");


    /*
     * Hentikan animation lama
     * jika Home di-init ulang.
     */

    if(

        reminderAnimation

        &&

        typeof reminderAnimation.stop ===

        "function"

    ){

        reminderAnimation.stop();

    }


    /*
     * Jalankan vertical loop
     * hanya jika lebih dari satu item.
     */

    if(

        reminders.length > 1

    ){

        reminderAnimation =

            Animation.verticalLoop(

                container,

                {

                    duration :

                        9000,

                    pause :

                        1400

                }

            );

    }

}


/* =====================================================
   GET REMINDERS
===================================================== */

function getReminders(){

    const data =

        Array.isArray(

            Process?.data

        )

            ?

            Process.data

            :

            [];


    const now =

        new Date();


    /*
     * Reminder hanya campaign.
     *
     * Syarat:
     *
     * - type campaign
     * - status ongoing
     * - memiliki end
     */

    return data

        .filter(

            item => {

                const type =

                    String(

                        item?.type ??

                        ""

                    )

                    .toLowerCase();


                const status =

                    String(

                        item?.status ??

                        ""

                    )

                    .toLowerCase();


                return (

                    type ===

                    "campaign"

                    &&

                    status ===

                    "ongoing"

                    &&

                    item?.end

                );

            }

        )

        .map(

            item => {

                const endDate =

                    parseDate(

                        item.end

                    );


                if(

                    !endDate

                ){

                    return null;

                }


                const diff =

                    Math.ceil(

                        (

                            endDate.getTime() -

                            now.getTime()

                        ) /

                        86400000

                    );


                return {

                    ...item,

                    endDate,

                    daysLeft :

                        diff

                };

            }

        )

        .filter(

            item =>

                item

                &&

                item.daysLeft >= 0

        )

        .sort(

            (

                a,

                b

            ) =>

                a.endDate -

                b.endDate

        );

}


/* =====================================================
   CREATE REMINDER
===================================================== */

function createReminder(

    item

){

    const project =

        escapeHTML(

            item.project ??

            "-"

        );


    const wallet =

        formatWallet(

            item.nama

        );


    const type =

        capitalize(

            item.type ??

            "campaign"

        );


    const days =

        item.daysLeft;


    let message =

        "";


    if(

        days === 0

    ){

        message =

            "Berakhir hari ini";

    }

    else if(

        days === 1

    ){

        message =

            "Berakhir 1 hari lagi";

    }

    else{

        message =

            `Berakhir ${days} hari lagi`;

    }


    return `

        <article

            class="airdrop-reminder-item"


            data-project="${project}">

            <div

                class="airdrop-reminder-main">

                <strong>

                    ${project}

                </strong>


                <span>

                    ${wallet} · ${type}

                </span>

            </div>


            <strong

                class="airdrop-reminder-time">

                ${message}

            </strong>

        </article>

    `;

}


/* =====================================================
   WALLET FORMAT
===================================================== */

function formatWallet(

    value

){

    if(

        !value

    ){

        return "-";

    }


    return String(

        value

    )

        .replace(

            /_/g,

            " "

        )

        .replace(

            /\b\w/g,

            letter =>

                letter.toUpperCase()

        );

}


/* =====================================================
   DATE
===================================================== */

function parseDate(

    value

){

    if(

        !value

    ){

        return null;

    }


    const parts =

        String(

            value

        )

        .split("-")

        .map(

            Number

        );


    if(

        parts.length !== 3

    ){

        return null;

    }


    const date =

        new Date(

            parts[0],

            parts[1] - 1,

            parts[2]

        );


    return Number.isNaN(

        date.getTime()

    )

        ?

        null

        :

        date;

}


/* =====================================================
   NUMBER
===================================================== */

function toNumber(

    value

){

    const number =

        Number(

            value

        );


    return Number.isFinite(

        number

    )

        ?

        number

        :

        0;

}


/* =====================================================
   HTML
===================================================== */

function escapeHTML(

    value

){

    return String(

        value ??

        ""

    )

        .replace(

            /&/g,

            "&amp;"

        )

        .replace(

            /</g,

            "&lt;"

        )

        .replace(

            />/g,

            "&gt;"

        )

        .replace(

            /"/g,

            "&quot;"

        )

        .replace(

            /'/g,

            "&#039;"

        );

}


/* =====================================================
   CAPITALIZE
===================================================== */

function capitalize(

    text

){

    return String(

        text

    ).replace(

        /\b\w/g,

        letter =>

            letter.toUpperCase()

    );

}
