/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : flow.js
   Version      : 1.1.0

   Description :
   Global Input Flow Controller

   Handles :
   - Progressive field
   - Field visibility
   - Next field
   - Completed fields remain visible
   - Condition multi-select
   - Terminal attendance status

   Principle :

   Normal field :
       input
          ↓
       complete
          ↓
       next field

   Condition field :
       checkbox
          ↓
       collect all checked values
          ↓
       remain on condition field
          ↓
       next field

   Terminal status :
       cuti
       sakit
       absen
          ↓
       flow complete
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    State

} from "./state.js";


import {

    renderField

} from "./field.js";


/* =====================================================
   START FLOW
===================================================== */

export function startFlow(){

    State.values = {};

    State.step = 0;

    renderFlow();

}


/* =====================================================
   RENDER FLOW
===================================================== */

export function renderFlow(){

    const container =

        document.getElementById(

            "global-input-form"

        );


    if(

        !container

    ){

        return;

    }


    const steps =

        State.config?.steps ??

        [];


    /* =================================================
       FIND NEXT VALID FIELD
    ================================================= */

    let field =

        steps[

            State.step

        ];


    while(

        field

        &&

        !isVisible(

            field

        )

    ){

        State.step++;


        field =

            steps[

                State.step

            ];

    }


    /* =================================================
       COMPLETE
    ================================================= */

    if(

        !field

    ){

        flowComplete();

        return;

    }


    /* =================================================
       RENDER ONLY NEW FIELD
    ================================================= */

    renderField(

        field,

        container,

        handleFieldComplete

    );

}


/* =====================================================
   FIELD COMPLETE
===================================================== */

function handleFieldComplete(

    field,

    value

){

    if(

        !field

    ){

        return;

    }


    console.log(

        "Flow field complete:",

        field.id,

        value

    );


    /* =================================================
       CONDITION FIELD
       
       Condition adalah multi-select.

       Checkbox dapat berubah berkali-kali.
       Karena itu JANGAN langsung menaikkan
       State.step setiap kali checkbox berubah.
       
       Value tetap sudah disimpan oleh field.js
       ke State.values.
    ================================================= */

    if(

        field.type ===

            "condition"

    ){

        console.log(

            "Condition updated:",

            value

        );


        return;

    }


    /* =================================================
       TERMINAL STATUS
       
       Attendance status :

       cuti
       sakit
       absen

       Setelah status dipilih, tidak perlu
       shift ataupun condition.
    ================================================= */

    if(

        isTerminalStatus(

            field,

            value

        )

    ){

        console.log(

            "Terminal attendance status:",

            value

        );


        flowComplete();


        return;

    }


    /* =================================================
       NEXT
    ================================================= */

    State.step++;


    renderFlow();

}


/* =====================================================
   TERMINAL STATUS
===================================================== */

function isTerminalStatus(

    field,

    value

){

    /* =================================================
       Hanya field status yang boleh menjadi
       terminal status.
    ================================================= */

    if(

        !field

        ||

        field.id !==

            "status"

    ){

        return false;

    }


    const status =

        String(

            value ??

            ""

        )

        .trim()

        .toLowerCase();


    /* =================================================
       TERMINAL ATTENDANCE STATUS

       cuti
       sakit
       absen
    ================================================= */

    return (

        status ===

            "cuti"

        ||

        status ===

            "sakit"

        ||

        status ===

            "absen"

    );

}


/* =====================================================
   VISIBILITY
===================================================== */

function isVisible(

    field

){

    if(

        !field

        ||

        typeof field.showWhen !==

            "function"

    ){

        return true;

    }


    try{

        return Boolean(

            field.showWhen(

                State.values

            )

        );

    }

    catch(error){

        console.warn(

            "Global Input flow showWhen error:",

            error

        );


        return false;

    }

}


/* =====================================================
   FLOW COMPLETE
===================================================== */

function flowComplete(){

    console.log(

        "Semua field selesai:",

        State.values

    );


    /* =================================================
       Jangan langsung memasukkan transaksi di sini.

       Transaction.js akan mengambil alih
       pada tahap berikutnya.
    ================================================= */

    document.dispatchEvent(

        new CustomEvent(

            "global-input-flow-complete",

            {

                detail : {

                    values :

                        {

                            ...State.values

                        }

                }

            }

        )

    );

}
