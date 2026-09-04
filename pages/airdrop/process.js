/* =====================================================
   Finance Assistant
   Page        : Airdrop
   Module      : Process
   File        : process.js
   Version     : 1.1.0

   Description :
   Airdrop Data Processing Engine

   Handles :
   - Fetch Airdrop Data
   - Fetch Airdrop Rules
   - Normalize Data
   - Normalize Date
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

import {
   
    Update
   
} from "../../js/update.js";


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

        Array.isArray(

            raw

        )

            ?

            raw

            :

            [];


    Process.rawRules =

        Array.isArray(

            rules

        )

            ?

            rules

            :

            [];


    processRules();


    processData();


    calculateSummary();


    processCampaigns();


    processOptions();

   processEndedCampaigns();


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

                /* =====================================
                   STATUS
                ===================================== */

                const status =

                    normalizeStatus(

                        item.status

                    );


                /* =====================================
                   TYPE
                ===================================== */

                const type =

                    normalizeText(

                        item.type

                    );


                /* =====================================
                   REWARD
                ===================================== */

                const reward =

                    toNumber(

                        item["$reward"]

                    );


                /* =====================================
                   DATE

                   Semua tanggal dari API dinormalisasi
                   menjadi YYYY-MM-DD terlebih dahulu.

                   Contoh:

                   2026-08-25

                   2026-08-25T00:00:00.000Z

                   keduanya menjadi:

                   2026-08-25
                ===================================== */

                const tanggal =

                    normalizeDateString(

                        item.tanggal

                    );


                const start =

                    normalizeDateString(

                        item.start

                    );


                const end =

                    normalizeDateString(

                        item.end

                    );


                /* =====================================
                   DATE OBJECT

                   Date dibuat dari YYYY-MM-DD
                   menggunakan waktu LOCAL.

                   Ini penting supaya tidak terjadi
                   pergeseran tanggal karena UTC.
                ===================================== */

                const date =

                    parseDate(

                        tanggal

                    );


                const startDate =

                    parseDate(

                        start

                    );


                const endDate =

                    parseDate(

                        end

                    );


                /* =====================================
                   NORMALIZED RESULT
                ===================================== */

                return {

                    id :

                        String(

                            item.id ??

                            ""

                        ).trim(),


                    /*
                     * String tanggal standar
                     *
                     * YYYY-MM-DD
                     */

                    tanggal,


                    /*
                     * Date object lokal
                     */

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


                    /*
                     * String tanggal standar
                     */

                    start,


                    /*
                     * Date object lokal
                     */

                    startDate,


                    /*
                     * String tanggal standar
                     */

                    end,


                    /*
                     * Date object lokal
                     */

                    endDate,


                    status,


                    reward,


                    /*
                     * Nilai asli reward
                     * tetap dipertahankan.
                     */

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
   AUTO UPDATE ENDED CAMPAIGN
===================================================== */

/*
 * Mencari campaign yang sudah memenuhi
 * kondisi shouldEnd.
 *
 * Process tetap bertanggung jawab terhadap
 * business logic.
 *
 * Update hanya bertanggung jawab mengirim
 * perubahan ke Apps Script.
 *
 * Target :
 *
 *     ID + Project
 *
 * Update :
 *
 *     status → ended
 */

function processEndedCampaigns(){

    const endedCampaigns =
        Process.campaigns.filter(
            item =>
                item.shouldEnd === true
                &&
                item.status === "ongoing"
                &&
                item.id
                &&
                item.project
        );


    /* =============================================
       TIDAK ADA YANG PERLU DI-UPDATE
    ============================================= */

    if(
        endedCampaigns.length === 0
    ){

        return;

    }


    console.log(
        "===== AIRDROP AUTO END ====="
    );


    console.log(
        "Campaign yang memenuhi shouldEnd:",
        endedCampaigns.map(
            item => ({

                id :
                    item.id,

                project :
                    item.project,

                end :
                    item.end,

                status :
                    item.status,

                shouldEnd :
                    item.shouldEnd

            })
        )
    );


    /* =============================================
       UPDATE SATU PER SATU
    ============================================= */

    endedCampaigns.forEach(
        item => {

            Update.updateField(

                "airdrop",

                {
                    id :
                        item.id,

                    project :
                        item.project
                },

                {
                    status :
                        "ended"
                }

            )
            .then(
                result => {

                    console.log(
                        "===== AIRDROP AUTO END RESULT ====="
                    );


                    console.log(
                        {
                            id :
                                item.id,

                            project :
                                item.project,

                            result :
                                result
                        }
                    );


                    /* =================================
                       SUCCESS
                    ================================= */

                    if(
                        result &&
                        result.success === true
                    ){

                        updateLocalEndedState(
                            item.id,
                            item.project
                        );

                    }

                }
            )
            .catch(
                error => {

                    console.error(
                        "===== AIRDROP AUTO END ERROR ====="
                    );


                    console.error(
                        {
                            id :
                                item.id,

                            project :
                                item.project,

                            error :
                                error
                        }
                    );

                }
            );

        }
    );

}


/* =====================================================
   UPDATE LOCAL ENDED STATE
===================================================== */

/*
 * Dipanggil hanya setelah UPDATE Apps Script
 * berhasil.
 *
 * Tujuan :
 * menyamakan state frontend dengan
 * state yang sudah berhasil ditulis ke Sheet.
 */

function updateLocalEndedState(
    id,
    project
){

    const normalizedId =
        String(
            id ?? ""
        ).trim();


    const normalizedProject =
        String(
            project ?? ""
        ).trim();


    if(
        !normalizedId ||
        !normalizedProject
    ){

        return;

    }


    /* =============================================
       UPDATE NORMALIZED DATA
    ============================================= */

    Process.data =
        Process.data.map(
            item => {

                if(
                    String(
                        item.id ?? ""
                    ).trim()
                    ===
                    normalizedId
                    &&
                    String(
                        item.project ?? ""
                    ).trim()
                    ===
                    normalizedProject
                ){

                    return {

                        ...item,

                        status :
                            "ended"

                    };

                }


                return item;

            }
        );


    /* =============================================
       RESET GROUP
    ============================================= */

    Process.win = [];

    Process.notWin = [];

    Process.ongoing = [];

    Process.ended = [];


    Process.summary = {

        totalReward : 0,

        totalWin : 0,

        totalNotWin : 0,

        totalOngoing : 0,

        totalEnded : 0

    };


    /* =============================================
       REBUILD SUMMARY
    ============================================= */

    calculateSummary();


    /* =============================================
       REBUILD CAMPAIGN
    ============================================= */

    processCampaigns();


    console.log(
        "AIRDROP LOCAL STATE UPDATED:",
        {
            id :
                normalizedId,

            project :
                normalizedProject,

            status :
                "ended"
        }
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
   NORMALIZE DATE STRING
===================================================== */

function normalizeDateString(

    value

){

    if(

        value === null ||

        value === undefined

    ){

        return "";

    }


    const text =

        String(

            value

        )

        .trim();


    if(

        !text

    ){

        return "";

    }


    /* =============================================
       SUPPORT:

       2026-08-25

       2026-08-25T00:00:00.000Z

       2026-08-25T00:00:00Z
    ============================================= */

    const match =

        text.match(

            /^(\d{4})-(\d{2})-(\d{2})/

        );


    if(

        !match

    ){

        return "";

    }


    const year =

        Number(

            match[1]

        );


    const month =

        Number(

            match[2]

        );


    const day =

        Number(

            match[3]

        );


    /* =============================================
       VALIDASI
    ============================================= */

    if(

        month < 1 ||

        month > 12 ||

        day < 1 ||

        day > 31

    ){

        return "";

    }


    /*
     * Validasi tanggal sebenarnya.
     *
     * Contoh:
     *
     * 2026-02-31
     *
     * tidak dianggap valid.
     */

    const date =

        new Date(

            year,

            month - 1,

            day

        );


    if(

        date.getFullYear() !== year ||

        date.getMonth() !== month - 1 ||

        date.getDate() !== day

    ){

        return "";

    }


    /*
     * Selalu kembalikan format:
     *
     * YYYY-MM-DD
     */

    return (

        `${match[1]}-${match[2]}-${match[3]}`

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


    if(

        !text

    ){

        return null;

    }


    /*
     * Ambil YYYY-MM-DD saja.
     *
     * Support:
     *
     * 2026-08-25
     *
     * 2026-08-25T00:00:00.000Z
     *
     * 2026-08-25T00:00:00Z
     */

    const match =

        text.match(

            /^(\d{4})-(\d{2})-(\d{2})/

        );


    if(

        !match

    ){

        return null;

    }


    const year =

        Number(

            match[1]

        );


    const month =

        Number(

            match[2]

        );


    const day =

        Number(

            match[3]

        );


    /* =============================================
       VALIDASI DASAR
    ============================================= */

    if(

        month < 1 ||

        month > 12 ||

        day < 1 ||

        day > 31

    ){

        return null;

    }


    /*
     * PENTING:
     *
     * Gunakan constructor numeric.
     *
     * Jangan:
     *
     * new Date("2026-08-25")
     *
     * karena itu dapat diproses sebagai UTC.
     */

    const date =

        new Date(

            year,

            month - 1,

            day

        );


    /* =============================================
       VALIDASI TANGGAL SEBENARNYA
    ============================================= */

    if(

        date.getFullYear() !== year ||

        date.getMonth() !== month - 1 ||

        date.getDate() !== day

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

}


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
