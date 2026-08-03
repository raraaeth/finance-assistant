/* =====================================================
   Finance Assistant
   Workspace   : Saving
   Module      : API
   File        : api.js
   Version     : 1.0.0

   Description :
   OpenSheet API Engine
===================================================== */


/* =====================================================
   STATE
===================================================== */

export const API = {

    raw : [],

    bank : []

};


/* =====================================================
   LOAD
===================================================== */

API.load = async function(

    savingUrl,

    bankUrl

){

    const [

        saving,

        bank

    ] = await Promise.all([

        fetch(

            savingUrl

        ),

        fetch(

            bankUrl

        )

    ]);

    API.raw =

        await saving.json();

    API.bank =

        await bank.json();

};
