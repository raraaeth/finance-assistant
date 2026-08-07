/* =====================================================
   Finance Assistant
   Module      : API
   File        : api.js
   Version     : 3.0.0

   Description :
   OpenSheet API Engine

   Sections :
   - State
   - Load
===================================================== */


/* =====================================================
   STATE
===================================================== */

export const API = {

    raw : [],

    data : []

};


/* =====================================================
   LOAD
===================================================== */

API.load = async function(

    rawUrl,

    dataUrl

){

    const [

        raw,

        data

    ] = await Promise.all([

        fetch(

            rawUrl

        ),

        fetch(

            dataUrl

        )

    ]);

    API.raw =

        await raw.json();

    API.data =

        await data.json();

};
