/* =====================================================
   Finance Assistant
   Page        : Airdrop
   Module      : Home
   File        : home.js
   Version     : 2.1.0

   Description :
   Airdrop Home Controller

   Sections :
   - Import
   - State
   - Init
   - Hero
   - Summary
   - Reminder
   - Reminder Animation
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

const State = {

    user :

        loadUser(),

    reminderTimer :

        null,

    reminderDirection :

        1

};


/* =====================================================
   INIT
===================================================== */

export async function init(){

    try {

        /* =============================================
           PROCESS
        ============================================= */

        await Process.init();


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

    catch(

        error

    ){

        console.error(

            "Airdrop Home gagal dimuat:",

            error

        );

    }

}


/* =====================================================
   HERO
===================================================== */

function renderHero(){

    const name =

        capitalize(

            State.user?.displayName ??

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


    const banner =

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

            CONFIG.hero.description;

    }


    if(

        banner

    ){

        banner.src =

            CONFIG.hero.image;

        banner.alt =

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


    /* =============================================
       DATA
    ============================================= */

    const totalReward =

        Number(

            Process.summary?.totalReward

        ) || 0;


    const totalAirdrop =

        Array.isArray(

            Process.data

        )

        ?

        Process.data.length

        :

        0;


    const totalOngoing =

        Array.isArray(

            Process.ongoing

        )

        ?

        Process.ongoing.length

        :

        0;


    const totalWinner =

        Array.isArray(

            Process.win

        )

        ?

        Process.win.length

        :

        0;


    /* =============================================
       HTML
    ============================================= */

    card.innerHTML =

    `

        <!-- ==========================================
             TOTAL REWARD
        =========================================== -->

        <div class="airdrop-home-total">

            <span class="airdrop-home-total-label">

                Total Reward

            </span>


            <strong

                id="airdrop-home-total-reward"

                class="airdrop-home-total-value">

                $0

            </strong>

        </div>


        <!-- ==========================================
             SUMMARY GRID
        =========================================== -->

        <div class="airdrop-home-grid">


            <!-- ======================================
                 TOTAL AIRDROP
            ======================================= -->

            <div class="airdrop-home-item">

                <div class="airdrop-home-item-icon">

                    🎯

                </div>

                <span>

                    Campaign

                </span>

                <strong>

                    ${totalAirdrop}

                </strong>

            </div>


            <!-- ======================================
                 ONGOING
            ======================================= -->

            <div class="airdrop-home-item">

                <div class="airdrop-home-item-icon">

                    ⏳

                </div>

                <span>

                    Ongoing

                </span>

                <strong>

                    ${totalOngoing}

                </strong>

            </div>


            <!-- ======================================
                 WINNER
            ======================================= -->

            <div class="airdrop-home-item">

                <div class="airdrop-home-item-icon">

                    🏆

                </div>

                <span>

                    Winner

                </span>

                <strong>

                    ${totalWinner}

                </strong>

            </div>


        </div>

    `;


    /* =============================================
       TOTAL REWARD ANIMATION
    ============================================= */

    const element =

        document.getElementById(

            "airdrop-home-total-reward"

        );


    if(

        element

    ){

        Animation.number(

            element,

            totalReward,

            usd,

            1800

        );

    }

}


/* =====================================================
   REMINDER
===================================================== */

function renderReminder(){

    const section =

        document.getElementById(

            "airdrop-reminder"

        );


    const list =

        document.getElementById(

            "airdrop-reminder-list"

        );


    if(

        !section ||

        !list

    ){

        return;

    }


    const reminders =

        Process.getReminders();


    /* =============================================
       NO REMINDER
    ============================================= */

    if(

        !reminders.length

    ){

        section.classList.add(

            "hidden"

        );

        clearInterval(

            State.reminderTimer

        );

        return;

    }


    section.classList.remove(

        "hidden"

    );


    /* =============================================
       MAXIMUM 3 VISIBLE ITEMS
    ============================================= */

    list.innerHTML =

        reminders

            .map(

                createReminderItem

            )

            .join("");


    initReminderAnimation();

}


/* =====================================================
   REMINDER ITEM
===================================================== */

function createReminderItem(

    item

){

    const remaining =

        getRemainingDays(

            item.endDate

        );


    let deadlineText =

        "";


    if(

        remaining === 0

    ){

        deadlineText =

            "Berakhir hari ini";

    }

    else if(

        remaining === 1

    ){

        deadlineText =

            "Berakhir besok";

    }

    else if(

        remaining > 1

    ){

        deadlineText =

            `Berakhir ${remaining} hari lagi`;

    }

    else {

        deadlineText =

            "Campaign telah berakhir";

    }


    return `

        <article

            class="airdrop-reminder-item">


            <div

                class="airdrop-reminder-main">


                <strong>

                    ${escapeHTML(

                        item.project

                    )}

                </strong>


                <span>

                    ${escapeHTML(

                        formatWallet(

                            item.wallet

                        )

                    )}

                    ·

                    ${escapeHTML(

                        formatType(

                            item.type

                        )

                    )}

                </span>


            </div>


            <div

                class="airdrop-reminder-deadline">


                ${deadlineText}


            </div>


        </article>

    `;

}


/* =====================================================
   REMINDER ANIMATION
===================================================== */

function initReminderAnimation(){

    const viewport =

        document.getElementById(

            "airdrop-reminder-viewport"

        );


    const list =

        document.getElementById(

            "airdrop-reminder-list"

        );


    if(

        !viewport ||

        !list

    ){

        return;

    }


    clearInterval(

        State.reminderTimer

    );


    const items =

        list.children;


    /* =============================================
       THREE OR LESS
    ============================================= */

    if(

        items.length <= 3

    ){

        list.style.transform =

            "translateY(0)";

        return;

    }


    let position = 0;

    let direction = 1;


    const itemHeight =

        items[0].offsetHeight;


    const gap =

        parseFloat(

            getComputedStyle(

                list

            ).gap

        ) || 0;


    const step =

        itemHeight +

        gap;


    const maxPosition =

        Math.max(

            0,

            (

                items.length -

                3

            ) *

            step

        );


    State.reminderTimer =

        setInterval(

            () => {

                position +=

                    direction *

                    step;


                if(

                    position >=

                    maxPosition

                ){

                    position =

                        maxPosition;

                    direction =

                        -1;

                }


                else if(

                    position <= 0

                ){

                    position =

                        0;

                    direction =

                        1;

                }


                list.style.transform =

                    `translateY(-${position}px)`;

            },

            3500

        );

}


/* =====================================================
   REMAINING DAYS
===================================================== */

function getRemainingDays(

    date

){

    if(

        !date

    ){

        return -1;

    }


    const today =

        startOfDay(

            new Date()

        );


    const end =

        startOfDay(

            date

        );


    return Math.ceil(

        (

            end.getTime() -

            today.getTime()

        )

        /

        86400000

    );

}


/* =====================================================
   DATE
===================================================== */

function startOfDay(

    date

){

    const result =

        new Date(

            date

        );


    result.setHours(

        0,

        0,

        0,

        0

    );


    return result;

}


/* =====================================================
   FORMAT WALLET
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
   FORMAT TYPE
===================================================== */

function formatType(

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


/* =====================================================
   ESCAPE HTML
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
