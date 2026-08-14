/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : flow.js
   Version      : 1.0.0

   Description :
   Global Input Flow Controller

   Handles :
   - Progressive field
   - Field visibility
   - Next field
   - Completed fields remain visible
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


    /* =============================================
       FIND NEXT VALID FIELD
    ============================================= */

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


    /* =============================================
       COMPLETE
    ============================================= */

    if(

        !field

    ){

        flowComplete();

        return;

    }


    /* =============================================
       RENDER ONLY NEW FIELD
    ============================================= */

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

    console.log(

        "Flow selesai:",

        field.id,

        value

    );


    /* =============================================
       NEXT
    ============================================= */

    State.step++;


    renderFlow();

}


/* =====================================================
   VISIBILITY
===================================================== */

function isVisible(

    field

){

    if(

        typeof field.showWhen !==

        "function"

    ){

        return true;

    }


    return field.showWhen(

        State.values

    );

}


/* =====================================================
   FLOW COMPLETE
===================================================== */

function flowComplete(){

    console.log(

        "Semua field selesai:",

        State.values

    );


    /*

       Jangan langsung memasukkan transaksi
       di sini.

       Transaction.js akan mengambil alih
       pada tahap berikutnya.

    */

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
