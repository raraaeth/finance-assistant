/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : field.js
   Version      : 2.0.0

   Description :
   Global Input Field Renderer

   Handles :
   - Custom Select
   - Responsive Dropdown
   - Select Option Note
   - Field Note
   - Text
   - Number
   - Field value
   - Field event
   - Progressive flow compatibility

   Principle :
   Global Input menggunakan custom control.

   Select :
       option.note
           ↓
       field.note
           ↓
       empty
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


    /* =================================================
       WRAPPER
    ================================================= */

    const wrapper =

        document.createElement(

            "div"

        );


    wrapper.className =

        "global-input-field";


    wrapper.dataset.field =

        field.id;


    /* =================================================
       LABEL
    ================================================= */

    const label =

        document.createElement(

            "label"

        );


    label.textContent =

        getFieldLabel(

            field

        );


    wrapper.appendChild(

        label

    );


    /* =================================================
       SELECT

       Semua select menggunakan custom dropdown.
    ================================================= */

    if(

        field.type ===

        "select"

    ){

        renderCustomSelect(

            field,

            wrapper,

            onComplete

        );


        container.appendChild(

            wrapper

        );


        return;

    }

/* =================================================
   CONDITION

   Checkbox group untuk progressive condition.
================================================= */

if(

    field.type ===
    "condition"

){

    renderCondition(

        field,
        wrapper,
        onComplete

    );


    container.appendChild(

        wrapper

    );


    return;

}

   
    /* =================================================
       NORMAL INPUT
    ================================================= */

    const element =

        createInputElement(

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


    /* =================================================
       FIELD NOTE
    ================================================= */

    if(

        field.note

    ){

        const note =

            document.createElement(

                "small"

            );


        note.className =

            "global-input-field-note";


        note.textContent =

            field.note;


        wrapper.appendChild(

            note

        );

    }


    /* =================================================
       APPEND
    ================================================= */

    container.appendChild(

        wrapper

    );


    /* =================================================
       EVENT
    ================================================= */

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


    /* =================================================
       ENTER
    ================================================= */

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


    /* =================================================
       FOCUS
    ================================================= */

    requestAnimationFrame(

        () => {

            element.focus();

        }

    );

}


/* =====================================================
   GET FIELD LABEL
===================================================== */

function getFieldLabel(

    field

){

    if(

        !field

    ){

        return "";

    }


    if(

        typeof field.label ===

            "function"

    ){

        try{

            return String(

                field.label(

                    State.values

                )

                ??

                ""

            );

        }

        catch(error){

            console.warn(

                "Field label error:",

                error

            );

            return "";

        }

    }


    return String(

        field.label

        ??

        ""

    );

}


/* =====================================================
   CREATE NORMAL INPUT
===================================================== */

function createInputElement(

    field

){

    let element;


    /* =================================================
       TEXTAREA
    ================================================= */

    if(

        field.type ===

        "textarea"

    ){

        element =

            document.createElement(

                "textarea"

            );

    }


    /* =================================================
       INPUT
    ================================================= */

    else{

        element =

            document.createElement(

                "input"

            );


        element.type =

            field.type ??

            "text";

    }


    /* =================================================
       PLACEHOLDER
    ================================================= */

    if(

        field.placeholder

    ){

        element.placeholder =

            field.placeholder;

    }


    /* =================================================
       VALUE
    ================================================= */

    if(

        field.value !==

        undefined

    ){

        element.value =

            field.value;

    }


    /* =================================================
       REQUIRED
    ================================================= */

    if(

        field.required

    ){

        element.required =

            true;

    }


    /* =================================================
       MIN
    ================================================= */

    if(

        field.min !==

        undefined

    ){

        element.min =

            field.min;

    }


    /* =================================================
       MAX
    ================================================= */

    if(

        field.max !==

        undefined

    ){

        element.max =

            field.max;

    }


    /* =================================================
       STEP
    ================================================= */

    if(

        field.step !==

        undefined

    ){

        element.step =

            field.step;

    }


    return element;

}

/* =====================================================
   RENDER CONDITION
===================================================== */

function renderCondition(

    field,

    wrapper,

    onComplete

){

    const conditionList =

        document.createElement(

            "div"

        );


    conditionList.className =

        "global-input-condition-list";


    const options =

        getOptions(

            field

        );


    if(

        !Array.isArray(

            options

        )

    ){

        return;

    }


    options.forEach(

        option => {

            const value =

                typeof option ===

                "object"

                    ?

                option.value

                    :

                option;


            const label =

                typeof option ===

                "object"

                    ?

                option.label ??

                option.value

                    :

                option;


            if(

                !value

            ){

                return;

            }


            /* =========================================
               ITEM
            ========================================= */

            const item =

                document.createElement(

                    "label"

                );


            item.className =

                "global-input-condition-item";


            /* =========================================
               CHECKBOX
            ========================================= */

            const checkbox =

                document.createElement(

                    "input"

                );


            checkbox.type =

                "checkbox";


            checkbox.value =

                value;


            checkbox.dataset.condition =

                value;


            /* =========================================
               LABEL
            ========================================= */

            const text =

                document.createElement(

                    "span"

                );


            text.textContent =

                label;


            item.appendChild(

                checkbox

            );


            item.appendChild(

                text

            );


            conditionList.appendChild(

                item

            );


            /* =========================================
               CHANGE
            ========================================= */

            checkbox.addEventListener(

                "change",

                () => {

                    updateConditionValue(

                        field,

                        conditionList,

                        onComplete

                    );

                }

            );

        }

    );


    wrapper.appendChild(

        conditionList

    );


    /* =============================================
       NOTE
    ============================================= */

    if(

        field.note

    ){

        const note =

            document.createElement(

                "small"

            );


        note.className =

            "global-input-field-note";


        note.textContent =

            field.note;


        wrapper.appendChild(

            note

        );

    }

}
/* =====================================================
   UPDATE CONDITION VALUE
===================================================== */

function updateConditionValue(

    field,

    container,

    onComplete

){

    const checkboxes =

        container.querySelectorAll(

            'input[type="checkbox"]'

        );


    const values = [];


    checkboxes.forEach(

        checkbox => {

            if(

                checkbox.checked

            ){

                values.push(

                    checkbox.value

                );

            }

        }

    );


    /* =============================================
       SAVE STATE

       Array kosong tetap disimpan.
       Ini penting supaya kondisi bisa
       berubah kembali saat user uncheck.
    ============================================= */

    State.values[

        field.id

    ] =

        values;


    /* =============================================
       CALLBACK

       Kirim array kondisi ke flow.
    ============================================= */

    if(

        typeof onComplete ===

            "function"

    ){

        onComplete(

            field,

            values

        );

    }

}

/* =====================================================
   CUSTOM SELECT
===================================================== */

function renderCustomSelect(

    field,

    wrapper,

    onComplete

){

    /* =================================================
       SELECT WRAPPER
    ================================================= */

    const selectWrapper =

        document.createElement(

            "div"

        );


    selectWrapper.className =

        "global-input-custom-select-wrapper";


    /* =================================================
       SELECT BUTTON
    ================================================= */

    const button =

        document.createElement(

            "button"

        );


    button.type =

        "button";


    button.className =

        "global-input-custom-select";


    button.dataset.field =

        field.id;


    /* =================================================
       VALUE
    ================================================= */

    const valueElement =

        document.createElement(

            "span"

        );


    valueElement.className =

        "global-input-custom-value";


    valueElement.textContent =

        field.placeholder ??

        "Pilih...";


    /* =================================================
       ARROW
    ================================================= */

    const arrow =

        document.createElement(

            "span"

        );


    arrow.className =

        "global-input-custom-arrow";


    arrow.textContent =

        "▾";


    button.appendChild(

        valueElement

    );


    button.appendChild(

        arrow

    );


    /* =================================================
       HIDDEN VALUE

       Ini menggantikan <select>.
       Value tetap dapat dikirim
       ke State.values.
    ================================================= */

    const hidden =

        document.createElement(

            "input"

        );


    hidden.type =

        "hidden";


    hidden.name =

        field.id;


    hidden.value =

    State.values?.[field.id]

    ??

    field.value

    ??

    "";


    hidden.dataset.field =

        field.id;


    /* =================================================
       INITIAL VALUE
    ================================================= */

    if(

        hidden.value !== ""

    ){

        valueElement.textContent =

            getOptionLabel(

                field,

                hidden.value

            );


        button.classList.add(

            "has-value"

        );

    }


    /* =================================================
       APPEND
    ================================================= */

    selectWrapper.appendChild(

        button

    );


    selectWrapper.appendChild(

        hidden

    );


    wrapper.appendChild(

        selectWrapper

    );


    /* =================================================
       NOTE
    ================================================= */

    const note =

        document.createElement(

            "small"

        );


    note.className =

        "global-input-field-note";


    note.textContent =

        getOptionNote(

            field,

            hidden.value

        );


    wrapper.appendChild(

        note

    );


    /* =================================================
       REQUIRED
    ================================================= */

    if(

        field.required

    ){

        hidden.dataset.required =

            "true";

    }


    /* =================================================
       OPEN PICKER
    ================================================= */

    button.addEventListener(

        "click",

        event => {

            event.preventDefault();


            openCustomPicker(

                field,

                button,

                hidden,

                note,

                onComplete

            );

        }

    );


    /* =================================================
       SAVE CUSTOM SELECT REFERENCE
    ================================================= */

    wrapper._customSelect = {

        button,

        hidden,

        note

    };

}


/* =====================================================
   OPEN CUSTOM PICKER
===================================================== */

function openCustomPicker(

    field,

    button,

    hidden,

    note,

    onComplete

){

    closeCustomPicker();


    /* =================================================
       PICKER ROOT
    ================================================= */

    const picker =

        document.createElement(

            "div"

        );


    picker.className =

        "global-input-picker";


    /* =================================================
       BACKDROP
    ================================================= */

    const backdrop =

        document.createElement(

            "div"

        );


    backdrop.className =

        "global-input-picker-backdrop";


    /* =================================================
       PANEL
    ================================================= */

    const panel =

        document.createElement(

            "div"

        );


    panel.className =

        "global-input-picker-panel";


    /* =================================================
       HEADER
    ================================================= */

    const header =

        document.createElement(

            "div"

        );


    header.className =

        "global-input-picker-header";


    const title =

        document.createElement(

            "strong"

        );


    title.textContent =

        getFieldLabel(

            field

        ) ||

        "Pilih";


    const closeButton =

        document.createElement(

            "button"

        );


    closeButton.type =

        "button";


    closeButton.className =

        "global-input-picker-close";


    closeButton.textContent =

        "×";


    header.appendChild(

        title

    );


    header.appendChild(

        closeButton

    );


    /* =================================================
       LIST
    ================================================= */

    const list =

        document.createElement(

            "div"

        );


    list.className =

        "global-input-picker-list";


    /* =================================================
       OPTIONS
    ================================================= */

    const options =

        getOptions(

            field

        );


    if(

        Array.isArray(

            options

        )

    ){

        options.forEach(

            option => {

                const value =

                    typeof option ===

                    "object"

                        ?

                    option.value

                        :

                    option;


                const label =

                    typeof option ===

                    "object"

                        ?

                    option.label ??

                    option.value

                        :

                    option;


                const selected =

                    String(

                        hidden.value

                    )

                    ===

                    String(

                        value

                    );


                /* =====================================
                   OPTION BUTTON
                ===================================== */

                const item =

                    document.createElement(

                        "button"

                    );


                item.type =

                    "button";


                item.className =

                    "global-input-picker-option";


                if(

                    selected

                ){

                    item.classList.add(

                        "selected"

                    );

                }


                /* =================================
                   OPTION CONTENT
                ================================= */

                const optionContent =

                    document.createElement(

                        "span"

                    );


                optionContent.className =

                    "global-input-picker-option-content";


                optionContent.textContent =

                    label;


                /* =================================
                   OPTION RADIO
                ================================= */

                const radio =

                    document.createElement(

                        "span"

                    );


                radio.className =

                    "global-input-picker-radio";


                radio.textContent =

                    selected

                        ?

                    "●"

                        :

                    "○";


                item.appendChild(

                    optionContent

                );


                item.appendChild(

                    radio

                );


                /* =================================
                   OPTION NOTE
                ================================= */

                if(

                    option &&

                    typeof option ===

                    "object" &&

                    option.note

                ){

                    const optionNote =

                        document.createElement(

                            "small"

                        );


                    optionNote.className =

                        "global-input-picker-option-note";


                    optionNote.textContent =

                        option.note;


                    item.appendChild(

                        optionNote

                    );

                }


                /* =================================
                   SELECT
                ================================= */

                item.addEventListener(

                    "click",

                    () => {

                        selectCustomOption(

                            field,

                            option,

                            value,

                            label,

                            button,

                            hidden,

                            note,

                            onComplete

                        );

                    }

                );


                list.appendChild(

                    item

                );

            }

        );

    }


    /* =================================================
       PANEL APPEND
    ================================================= */

    panel.appendChild(

        header

    );


    panel.appendChild(

        list

    );


    picker.appendChild(

        backdrop

    );


    picker.appendChild(

        panel

    );


    document.body.appendChild(

        picker

    );


    /* =================================================
       CLOSE EVENTS
    ================================================= */

    closeButton.addEventListener(

        "click",

        closeCustomPicker

    );


    backdrop.addEventListener(

        "click",

        closeCustomPicker

    );


    /* =================================================
       ESC
    ================================================= */

    picker._escapeHandler =

        event => {

            if(

                event.key ===

                "Escape"

            ){

                closeCustomPicker();

            }

        };


    document.addEventListener(

        "keydown",

        picker._escapeHandler

    );


    /* =================================================
       OPEN STATE
    ================================================= */

    requestAnimationFrame(

        () => {

            picker.classList.add(

                "is-open"

            );

        }

    );

}


/* =====================================================
   SELECT CUSTOM OPTION
===================================================== */

function selectCustomOption(

    field,

    option,

    value,

    label,

    button,

    hidden,

    note,

    onComplete

){

    /* =================================================
       SAVE VALUE
    ================================================= */

    hidden.value =

        value;


    /* =================================================
       UPDATE DISPLAY
    ================================================= */

    const valueElement =

        button.querySelector(

            ".global-input-custom-value"

        );


    if(

        valueElement

    ){

        valueElement.textContent =

            label;

    }


    /* =================================================
       STATE
    ================================================= */

    button.classList.add(

        "has-value"

    );


    /* =================================================
       UPDATE NOTE

       PRIORITY :

       option.note
       ↓
       field.note
       ↓
       empty
    ================================================= */

    note.textContent =

        getOptionNoteFromOption(

            field,

            option

        );


    /* =================================================
       CLOSE PICKER
    ================================================= */

    closeCustomPicker();


    /* =================================================
       SUBMIT

       Custom select tetap mengikuti
       mekanisme flow lama.
    ================================================= */

    submitValue(

        field,

        value,

        onComplete

    );

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

        String(

            element.value ??

            ""

        ).trim();


    submitValue(

        field,

        value,

        onComplete

    );

}


/* =====================================================
   SUBMIT VALUE
===================================================== */

function submitValue(

    field,

    value,

    onComplete

){

    /* =================================================
       VALIDATION
    ================================================= */

    if(

        !value

    ){

        return;

    }


    /* =================================================
       SAVE VALUE
    ================================================= */

    State.values[

        field.id

    ] =

        value;


    /* =================================================
       CALLBACK
    ================================================= */

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


/* =====================================================
   GET OPTIONS
===================================================== */

function getOptions(

    field

){

    /* =================================================
       FUNCTION OPTIONS

       Contoh Kas :

       options : values =>

           CATEGORY[values.type] ?? []
    ================================================= */

    if(

        typeof field.options ===

            "function"

    ){

        return (

            field.options(

                State.values

            )

            ??

            []

        );

    }


    /* =================================================
       STATIC OPTIONS
    ================================================= */

    return (

        field.options

        ??

        []

    );

}


/* =====================================================
   GET OPTION LABEL
===================================================== */

function getOptionLabel(

    field,

    value

){

    if(

        value ===

        undefined

        ||

        value ===

        null

        ||

        value ===

        ""

    ){

        return (

            field.placeholder

            ??

            "Pilih..."

        );

    }


    const options =

        getOptions(

            field

        );


    if(

        !Array.isArray(

            options

        )

    ){

        return String(

            value

        );

    }


    const option =

        options.find(

            item => {

                const optionValue =

                    typeof item ===

                    "object"

                        ?

                    item.value

                        :

                    item;


                return (

                    String(

                        optionValue

                    )

                    ===

                    String(

                        value

                    )

                );

            }

        );


    if(

        option ===

        undefined

    ){

        return String(

            value

        );

    }


    return typeof option ===

        "object"

            ?

        option.label ??

        option.value

            :

        option;

}


/* =====================================================
   GET OPTION NOTE
===================================================== */

function getOptionNote(

    field,

    value

){

    if(

        value ===

        undefined

        ||

        value ===

        null

        ||

        value ===

        ""

    ){

        return (

            field.note

            ??

            ""

        );

    }


    const options =

        getOptions(

            field

        );


    if(

        !Array.isArray(

            options

        )

    ){

        return (

            field.note

            ??

            ""

        );

    }


    const option =

        options.find(

            item => {

                const optionValue =

                    typeof item ===

                    "object"

                        ?

                    item.value

                        :

                    item;


                return (

                    String(

                        optionValue

                    )

                    ===

                    String(

                        value

                    )

                );

            }

        );


    return getOptionNoteFromOption(

        field,

        option

    );

}


/* =====================================================
   GET OPTION NOTE FROM OPTION
===================================================== */

function getOptionNoteFromOption(

    field,

    option

){

    /* =================================================
       OPTION NOTE
    ================================================= */

    if(

        option &&

        typeof option ===

        "object"

        &&

        option.note

    ){

        return option.note;

    }


    /* =================================================
       FIELD NOTE
    ================================================= */

    return (

        field.note

        ??

        ""

    );

}


/* =====================================================
   CLOSE CUSTOM PICKER
===================================================== */

function closeCustomPicker(){

    const picker =

        document.querySelector(

            ".global-input-picker"

        );


    if(

        !picker

    ){

        return;

    }


    /* =================================================
       REMOVE ESC HANDLER
    ================================================= */

    if(

        picker._escapeHandler

    ){

        document.removeEventListener(

            "keydown",

            picker._escapeHandler

        );

    }


    /* =================================================
       REMOVE
    ================================================= */

    picker.remove();

}
