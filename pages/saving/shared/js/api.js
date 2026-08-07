/* =====================================================
   Finance Assistant
   Module      : API
   File        : api.js
   Version     : 2.0.0

   Description :
   Shared OpenSheet API Engine
===================================================== */


/* =====================================================
   STATE
===================================================== */

export const API = {

    raw : [],

    master : [],

    bank : [],

    member : []

};


/* =====================================================
   LOAD
===================================================== */

API.load = async function(

    rawUrl,

    masterUrl

){

    const [

        raw,

        master

    ] = await Promise.all([

        fetch(

            rawUrl

        ),

        fetch(

            masterUrl

        )

    ]);

    API.raw =

        await raw.json();

    API.master =

        await master.json();

    API.bank =

        API.master;

    API.member =

        API.master;

};
