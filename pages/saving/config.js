/* =====================================================
   Finance Assistant
   Page        : Saving
   Module      : Config
   File        : config.js
   Version     : 4.1.0

   Description :
   Saving Configuration

   Architecture :

   Saving Module
        ↓
   Global Finance Assistant API
        ↓
   Finance Core
        ↓
   Saving Sheets

   Sections :
   - Module
   - Hero
   - API
   - DATA
===================================================== */


/* =====================================================
   CONFIG
===================================================== */

export const CONFIG = {


    /* =============================================
       MODULE
    ============================================= */

    module : {

        key :

            "saving",


        name :

            "Saving"

    },


    /* =============================================
       HERO
    ============================================= */

    hero : {

        title :

            "Saving",


        description :

            "Wujudkan tujuan keuanganmu sedikit demi sedikit.",


        image :

            "../assets/images/hero/hero-saving.png"

    },



    /* =============================================
       DATA

       Nama sheet di Finance Core.
    ============================================= */

    data : {

        saving :

            "saving",


        bank :

            "saving_bank"

    }

};
