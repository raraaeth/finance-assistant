/* =====================================================
   Finance Assistant
   Page        : Financial
   Module      : Config
   File        : config.js
   Version     : 3.0.0

   Description :
   Financial Configuration

   Architecture :

       Financial
           ↓
       config.js
           ↓
       api.js
           ↓
       sheets.js
           ↓
       Google Sheets API
           ↓
       Finance Core milik user

   CONFIG TIDAK menyimpan :
   - Apps Script endpoint
   - Spreadsheet ID
   - Google Access Token

   Spreadsheet ID dan token ditentukan
   secara global berdasarkan session /
   Finance Core user.

   Sections :
   - Module
   - Hero
   - Data
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

            "financial",

        name :

            "Financial"

    },


    /* =============================================
       HERO
    ============================================= */

    hero : {

        title :

            "Financial",

        description :

            "Pantau kondisi keuangan dan saldo aktualmu dengan lebih mudah.",

        image :

            "../assets/images/hero/hero-financial.png"

    },


    /* =============================================
       DATA
       
       Nama sheet yang digunakan module.
       
       BUKAN endpoint.
       BUKAN Spreadsheet ID.
       
       api.js akan mengambil nama sheet ini
       lalu meneruskannya ke sheets.js.
    ============================================= */

    data : {

        financial :

            "financial",

        activity :

            "financial_activity"

    }

};
