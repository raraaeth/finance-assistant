/* =====================================================
   Finance Assistant
   Page        : Airdrop
   Module      : Process
   File        : process.js
   Version     : 1.0.0

   Description :
   Airdrop Data Processing Engine

   Handles :
   - Fetch Airdrop Data
   - Fetch Airdrop Rules
   - Normalize Data
   - Calculate Reward
   - Status Grouping
   - Campaign Processing
   - Reminder Detection
   - Input Options
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    CONFIG

} from "./config.js";


/* =====================================================
   PROCESS
===================================================== */

export const Process = {

    /* =============================================
       RAW DATA
    ============================================= */

    raw : [],

    rawRules : [],


    /* =============================================
       NORMALIZED DATA
    ============================================= */

    data : [],

    rules : [],


    /* =============================================
       GROUP
    ============================================= */

    win : [],

    notWin : [],

    ongoing : [],

    ended : [],


    /* =============================================
       CAMPAIGN
    ============================================= */

    campaigns : [],

    reminders : [],


    /* =============================================
       SUMMARY
    ============================================= */

    summary : {

        totalReward : 0,

        totalWin : 0,

        totalNotWin : 0,

        totalOngoing : 0,

        totalEnded : 0

    },


    /* =============================================
       OPTIONS
    ============================================= */

    options : {

        wallet : [],

        type : []

    }

};


/* =====================================================
   INIT
===================================================== */
Process.init = function(

    raw = [],

    rules = []

){

    reset();

    Process.raw =

        Array.isArray(raw)

            ?

            raw

            :

            [];

    Process.rawRules =

        Array.isArray(rules)

            ?

            rules

            :

            [];

    processRules();

    processData();

    calculateSummary();

    processCampaigns();

    processOptions();

    return Process;

};



/* =====================================================
   RESET
===================================================== */

function reset(){

    Process.raw = [];

    Process.rawRules = [];

    Process.data = [];

    Process.rules = [];

    Process.win = [];

    Process.notWin = [];

    Process.ongoing = [];

    Process.ended = [];

    Process.campaigns = [];

    Process.reminders = [];


    Process.summary = {

        totalReward : 0,

        totalWin : 0,

        totalNotWin : 0,

        totalOngoing : 0,

        totalEnded : 0

    };


    Process.options = {

        wallet : [],

        type : []

    };

}
       

/* =====================================================
   PROCESS RULES
===================================================== */

function processRules(){

    Process.rules =

        Process.rawRules.map(

            rule => ({

                rules :

                    normalizeText(

                        rule.rules

                    ),

                target :

                    normalizeText(

                        rule.target

                    ),

                type :

                    normalizeText(

                        rule.type

                    ),

                value :

                    toNumber(

                        rule.value

                    ),

                unit :

                    normalizeText(

                        rule.unit

                    ),

                active :

                    normalizeBoolean(

                        rule.active

                    )

            })

        );

}


/* =====================================================
   PROCESS DATA
===================================================== */

function processData(){

    Process.data =

        Process.raw.map(

            item => {

                const status =

                    normalizeStatus(

                        item.status

                    );


                const type =

                    normalizeText(

                        item.type

                    );


                const reward =

                    toNumber(

                        item["$reward"]

                    );


                const date =

                    parseDate(

                        item.tanggal

                    );


                const start =

                    parseDate(

                        item.start

                    );


                const end =

                    parseDate(

                        item.end

                    );


                return {

                    id :

                        String(

                            item.id ??

                            ""

                        ).trim(),


                    tanggal :

                        String(

                            item.tanggal ??

                            ""

                        ).trim(),


                    date,


                    type,


                    wallet :

                        normalizeText(

                            item.nama

                        ),


                    project :

                        String(

                            item.project ??

                            ""

                        ).trim(),


                    start :

                        String(

                            item.start ??

                            ""

                        ).trim(),


                    startDate :

                        start,


                    end :

                        String(

                            item.end ??

                            ""

                        ).trim(),


                    endDate :

                        end,


                    status,


                    reward,


                    rewardRaw :

                        item["$reward"] ?? ""

                };

            }

        );

}


/* =====================================================
   CALCULATE SUMMARY
===================================================== */

function calculateSummary(){

    Process.data.forEach(

        item => {

            switch(

                item.status

            ){

                case "win":

                    Process.win.push(

                        item

                    );

                    Process.summary.totalWin++;

                    Process.summary.totalReward +=

                        item.reward;

                    break;


                case "not_win":

                    Process.notWin.push(

                        item

                    );

                    Process.summary.totalNotWin++;

                    break;


                case "ongoing":

                    Process.ongoing.push(

                        item

                    );

                    Process.summary.totalOngoing++;

                    break;


                case "ended":

                    Process.ended.push(

                        item

                    );

                    Process.summary.totalEnded++;

                    break;

            }

        }

    );

}


/* =====================================================
   CAMPAIGN
===================================================== */

function processCampaigns(){

    const reminderRule =

        getRule(

            "reminder",

            "end",

            "campaign"

        );


    const endedRule =

        getRule(

            "ended",

            "end",

            "campaign"

        );


    Process.campaigns =

        Process.data.filter(

            item =>

                item.type ===

                "campaign"

        );


    Process.reminders =

        Process.campaigns.filter(

            item => {

                if(

                    item.status !==

                    "ongoing"

                ){

                    return false;

                }


                if(

                    !item.endDate

                ){

                    return false;

                }


                return isReminder(

                    item.endDate,

                    reminderRule

                );

            }

        );


    /*
     * endedRule sengaja hanya dihitung
     * sebagai informasi frontend.
     *
     * Tidak melakukan perubahan status.
     *
     * Update Sheet akan dilakukan
     * oleh Apps Script nantinya.
     */

    Process.campaigns =

        Process.campaigns.map(

            item => ({

                ...item,

                shouldEnd :

                    item.status ===

                    "ongoing"

                    &&

                    isEnded(

                        item.endDate,

                        endedRule

                    )

            })

        );

}


/* =====================================================
   OPTIONS
===================================================== */

function processOptions(){

    Process.options.wallet =

        Process.rules

            .filter(

                rule =>

                    rule.rules ===

                    "option"

                    &&

                    rule.target ===

                    "wallet"

            )

            .map(

                rule =>

                    rule.type

            );


    Process.options.type =

        Process.rules

            .filter(

                rule =>

                    rule.rules ===

                    "option"

                    &&

                    rule.target ===

                    "type"

            )

            .map(

                rule =>

                    rule.type

            );


    /*
     * Campaign wajib tersedia.
     */

    if(

        !Process.options.type.includes(

            "campaign"

        )

    ){

        Process.options.type.push(

            "campaign"

        );

    }

}


/* =====================================================
   GET RULE
===================================================== */

function getRule(

    rules,

    target,

    type

){

    return Process.rules.find(

        rule =>

            rule.rules === rules

            &&

            rule.target === target

            &&

            rule.type === type

            &&

            (

                rule.active !== false

            )

    );

}


/* =====================================================
   REMINDER
===================================================== */

function isReminder(

    endDate,

    rule

){

    if(

        !endDate ||

        !rule

    ){

        return false;

    }


    const today =

        startOfDay(

            new Date()

        );


    const end =

        startOfDay(

            endDate

        );


    const diff =

        Math.ceil(

            (

                end.getTime() -

                today.getTime()

            )

            /

            86400000

        );


    return (

        diff >= 0 &&

        diff <= rule.value

    );

}


/* =====================================================
   ENDED
===================================================== */

function isEnded(

    endDate,

    rule

){

    if(

        !endDate ||

        !rule

    ){

        return false;

    }


    const today =

        startOfDay(

            new Date()

        );


    const end =

        startOfDay(

            endDate

        );


    const diff =

        Math.floor(

            (

                today.getTime() -

                end.getTime()

            )

            /

            86400000

        );


    return (

        diff >= rule.value

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


    const text =

        String(

            value

        )

        .trim();


    /* =============================================
       AMBIL BAGIAN TANGGAL SAJA

       Support:

       2026-08-25

       2026-08-25T00:00:00.000Z
    ============================================= */

    const datePart =

        text.slice(

            0,

            10

        );


    const parts =

        datePart

            .split("-")

            .map(Number);


    if(

        parts.length !== 3 ||

        parts.some(

            Number.isNaN

        )

    ){

        return null;

    }


    const [

        year,

        month,

        day

    ] = parts;


    const date =

        new Date(

            year,

            month - 1,

            day

        );


    if(

        Number.isNaN(

            date.getTime()

        )

    ){

        return null;

    }


    return date;

}


/* =====================================================
   START OF DAY
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
   NUMBER
===================================================== */

function toNumber(

    value

){

    if(

        value ===

        null ||

        value ===

        undefined ||

        value ===

        ""

    ){

        return 0;

    }


    if(

        typeof value ===

        "number"

    ){

        return Number.isFinite(

            value

        )

            ?

            value

            :

            0;

    }


    const cleaned =

        String(

            value

        )

        .replace(

            /[$,\s]/g,

            ""

        );


    const number =

        Number(

            cleaned

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
   BOOLEAN
===================================================== */

function normalizeBoolean(

    value

){

    if(

        typeof value ===

        "boolean"

    ){

        return value;

    }


    return (

        String(

            value ?? ""

        )

        .trim()

        .toLowerCase()

    ) === "true";

}


/* =====================================================
   TEXT
===================================================== */

function normalizeText(

    value

){

    return String(

        value ??

        ""

    )

    .trim()

    .toLowerCase();

}


/* =====================================================
   STATUS
===================================================== */

function normalizeStatus(

    value

){

    const status =

        normalizeText(

            value

        );


    switch(

        status

    ){

        case "win":

            return "win";


        case "not_win":

        case "not win":

        case "notwin":

            return "not_win";


        case "ongoing":

            return "ongoing";


        case "ended":

            return "ended";


        default:

            return "ongoing";

    }

};


/* =====================================================
   PUBLIC HELPERS
===================================================== */

Process.getRule =

    function(

        rules,

        target,

        type

    ){

        return getRule(

            rules,

            target,

            type

        );

    };


Process.getWalletOptions =

    function(){

        return [

            ...Process.options.wallet

        ];

    };


Process.getTypeOptions =

    function(){

        return [

            ...Process.options.type

        ];

    };


Process.getReminders =

    function(){

        return [

            ...Process.reminders

        ];

    };


Process.getCampaigns =

    function(){

        return [

            ...Process.campaigns

        ];

    };
