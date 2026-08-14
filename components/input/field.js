/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : field.js
   Version      : 1.0.0

   Description :
   Global Input Field Renderer

   Handles :
   - Select
   - Text
   - Number
   - Field value
   - Field event
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    State

} from "./state.js";


/* =====================================================
   RENDER FIELD
===================================================== */

export function renderField(

    field,

    container,

    onComplete

){

    if(

        !field

        ||

        !container

    ){

        return;

    }


    /* =============================================
       WRAPPER
    ============================================= */

    const wrapper =

        document.createElement(

            "div"

        );


    wrapper.className =

        "global-input-field";


    wrapper.dataset.field =

        field.id;


    /* =============================================
       LABEL
    ============================================= */

    const label =

        document.createElement(

            "label"

        );


    label.textContent =

        field.label;


    wrapper.appendChild(

        label

    );


    /* =============================================
       ELEMENT
    ============================================= */

    const element =

        createElement(

            field

        );


    if(

        !element

    ){

        return;

    }


    element.className =

        "global-input-control";


    element.dataset.field =

        field.id;


    wrapper.appendChild(

        element

    );


    /* =============================================
       APPEND
    ============================================= */

    container.appendChild(

        wrapper

    );


    /* =============================================
       EVENT
    ============================================= */

    element.addEventListener(

        "change",

        () => {

            submitField(

                field,

                element,

                onComplete

            );

        }

    );


    element.addEventListener(

        "keydown",

        event => {

            if(

                event.key ===

                "Enter"

            ){

                event.preventDefault();

                submitField(

                    field,

                    element,

                    onComplete

                );

            }

        }

    );


    /* =============================================
       FOCUS
    ============================================= */

    requestAnimationFrame(

        () => {

            element.focus();

        }

    );

}


/* =====================================================
   CREATE ELEMENT
===================================================== */

function createElement(

    field

){

    let element;


    /* =============================================
       SELECT
    ============================================= */

    if(

        field.type ===

        "select"

    ){

        element =

            document.createElement(

                "select"

            );


        const placeholder =

            document.createElement(

                "option"

            );


        placeholder.value =

            "";


        placeholder.textContent =

            "Pilih...";


        placeholder.disabled =

            true;


        placeholder.selected =

            true;


        element.appendChild(

            placeholder

        );


        const options =

            getOptions(

                field

            );


        options.forEach(

            option => {

                const item =

                    document.createElement(

                        "option"

                    );


                item.value =

                    option.value;


                item.textContent =

                    option.label;


                element.appendChild(

                    item

                );

            }

        );

    }


    /* =============================================
       INPUT
    ============================================= */

    else{

        element =

            document.createElement(

                "input"

            );


        element.type =

            field.type ??

            "text";


        if(

            field.placeholder

        ){

            element.placeholder =

                field.placeholder;

        }

    }


    return element;

}


/* =====================================================
   GET OPTIONS
===================================================== */

function getOptions(

    field

){

    if(

        typeof field.options ===

        "function"

    ){

        return field.options(

            State.values

        ) ?? [];

    }


    return field.options ??

        [];

}


/* =====================================================
   SUBMIT FIELD
===================================================== */

function submitField(

    field,

    element,

    onComplete

){

    const value =

        element.value.trim();


    /* =============================================
       VALIDATION
    ============================================= */

    if(

        !value

    ){

        return;

    }


    /* =============================================
       SAVE VALUE
    ============================================= */

    State.values[

        field.id

    ] =

        value;


    /* =============================================
       CALLBACK
    ============================================= */

    if(

        typeof onComplete ===

        "function"

    ){

        onComplete(

            field,

            value

        );

    }

}
