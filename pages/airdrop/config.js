/* =====================================================
   Finance Assistant
   Page        : Airdrop
   Module      : Core
   File        : config.js
   Version     : 1.0.0

   Description :
   Airdrop Configuration

   Sections :
   - API
   - Sheet
   - Status
   - Type
   - Wallet
   - Home
   - Statistics
   - Summary
===================================================== */


/* =====================================================
   API
===================================================== */

export const CONFIG = {

    /* =================================================
       API
    ================================================= */

    api : {

        airdrop :

            "",

        activity :

            ""

    },


    /* =================================================
       SHEET
    ================================================= */

    sheet : {

        name :

            "airdrop"

    },


    /* =================================================
       STATUS
    ================================================= */

    status : {

        WIN :

            "win",

        ONGOING :

            "ongoing",

        ENDED :

            "ended",

        NOT_WIN :

            "not_win"

    },


    /* =================================================
       TYPE
    ================================================= */

    type : {

        TESTNET :

            "testnet",

        RETRO :

            "retro",

        BANSOS :

            "bansos",

        DAILY :

            "daily",

        CAMPAIGN :

            "campaign"

    },


    /* =================================================
       WALLET
    ================================================= */

    wallet : {

        MAIN :

            "main_wallet",

        SECOND :

            "second_wallet",

        GATE :

            "gate_wallet"

    },


    /* =================================================
       HOME
    ================================================= */

    home : {

        title :

            "Airdrop",

        description :

            "Pantau airdrop, campaign, dan hasil reward kamu."

    },


    /* =================================================
       STATISTICS
    ================================================= */

    statistics : {

        defaultPeriod :

            "all",

        perPage :

            5

    },


    /* =================================================
       SUMMARY
    ================================================= */

    summary : {

        winLimit :

            5,

        ongoingLimit :

            5,

        endedLimit :

            5

    }

};
