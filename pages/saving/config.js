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
       API

       Menggunakan Global Finance Assistant API.

       Endpoint ini menangani:

       - Login
       - Workspace
       - Modules
       - Create Module
       - Read Module Sheet
    ============================================= */

    api : {

        endpoint :

            "https://script.google.com/macros/s/AKfycbxBiQSb1pioB0mDbkAqd6S3y4T5CTByn2-6kW7-T1l-5PdGYTBVDX4IXskxyu_QxokHDw/exec"

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
