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


    /* =============================================
       FUNCTION LABEL

       Label dapat berupa function yang menerima
       State.values untuk label dinamis.
    ============================================= */

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


    /* =============================================
       STATIC LABEL
    ============================================= */

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

        field.value ??

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
       SET VALUE
    ================================================= */

    hidden.value =

        value ??

        "";


    /* =================================================
       DISPLAY VALUE
    ================================================= */

    const valueElement =

        button.querySelector(

            ".global-input-custom-value"

        );


    if(

        valueElement

    ){

        valueElement.textContent =

            label ??

            value ??

            "Pilih...";

    }


    /* =================================================
       SELECT STATE
    ================================================= */

    if(

        hidden.value !== ""

    ){

        button.classList.add(

            "has-value"

        );

    }

    else{

        button.classList.remove(

            "has-value"

        );

    }


    /* =================================================
       NOTE

       Prioritas :

       option.note
           ↓
       field.note
           ↓
       kosong
    ================================================= */

    if(

        note

    ){

        note.textContent =

            getOptionNote(

                field,

                value,

                option

            );

    }


    /* =================================================
       UPDATE STATE
    ================================================= */

    State.values[

        field.id

    ] =

        value;


    /* =================================================
       CLOSE PICKER
    ================================================= */

    closeCustomPicker();


    /* =================================================
       COMPLETE FIELD
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

    if(

        !field

    ){

        return [];

    }


    /* =================================================
       FUNCTION OPTIONS
    ================================================= */

    if(

        typeof field.options ===

            "function"

    ){

        try{

            return (

                field.options(

                    State.values

                )

                ??

                []

            );

        }

        catch(error){

            console.warn(

                "Field options error:",

                error

            );

            return [];

        }

    }


    /* =================================================
       STATIC OPTIONS
    ================================================= */

    if(

        Array.isArray(

            field.options

        )

    ){

        return [

            ...field.options

        ];

    }


    return [];

}


/* =====================================================
   GET OPTION LABEL
===================================================== */

function getOptionLabel(

    field,

    value

){

    const options =

        getOptions(

            field

        );


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


                return String(

                    optionValue

                )

                ===

                String(

                    value

                );

            }

        );


    if(

        option &&

        typeof option ===

            "object"

    ){

        return String(

            option.label

            ??

            option.value

            ??

            value

        );

    }


    return String(

        value

        ??

        ""

    );

}


/* =====================================================
   GET OPTION NOTE
===================================================== */

function getOptionNote(

    field,

    value,

    selectedOption

){

    /* =================================================
       OPTION NOTE

       Prioritas tertinggi.
    ================================================= */

    if(

        selectedOption &&

        typeof selectedOption ===

            "object" &&

        selectedOption.note !==

            undefined &&

        selectedOption.note !==

            null &&

        String(

            selectedOption.note

        ).trim() !== ""

    ){

        return String(

            selectedOption.note

        );

    }


    /* =================================================
       CARI OPTION BERDASARKAN VALUE

       Dibutuhkan saat initial render / reset.
    ================================================= */

    const options =

        getOptions(

            field

        );


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


                return String(

                    optionValue

                )

                ===

                String(

                    value

                );

            }

        );


    /* =================================================
       OPTION NOTE
    ================================================= */

    if(

        option &&

        typeof option ===

            "object" &&

        option.note !==

            undefined &&

        option.note !==

            null &&

        String(

            option.note

        ).trim() !== ""

    ){

        return String(

            option.note

        );

    }


    /* =================================================
       FIELD NOTE

       Fallback apabila option tidak memiliki note.
    ================================================= */

    if(

        field &&

        field.note !==

            undefined &&

        field.note !==

            null

    ){

        return String(

            field.note

        );

    }


    return "";

}


/* =====================================================
   SUBMIT FIELD
===================================================== */

function submitField(

    field,

    element,

    onComplete

){

    if(

        !field ||

        !element

    ){

        return;

    }


    /* =================================================
       VALUE
    ================================================= */

    const value =

        element.value;


    /* =================================================
       REQUIRED
    ================================================= */

    if(

        field.required &&

        String(

            value

        ).trim() === ""

    ){

        element.classList.add(

            "is-invalid"

        );


        return;

    }


    element.classList.remove(

        "is-invalid"

    );


    /* =================================================
       STATE
    ================================================= */

    State.values[

        field.id

    ] =

        normalizeFieldValue(

            field,

            value

        );


    /* =================================================
       COMPLETE
    ================================================= */

    if(

        typeof onComplete ===

            "function"

    ){

        onComplete(

            field,

            State.values[

                field.id

            ]

        );

    }

}


/* =====================================================
   NORMALIZE FIELD VALUE
===================================================== */

function normalizeFieldValue(

    field,

    value

){

    /* =================================================
       NUMBER
    ================================================= */

    if(

        field.type ===

        "number"

    ){

        if(

            String(

                value

            ).trim() === ""

        ){

            return "";

        }


        return String(

            value

        )

        .replace(

            /[^0-9.-]/g,

            ""

        );

    }


    /* =================================================
       DEFAULT
    ================================================= */

    return value;

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


/* =====================================================
   RESET FIELD
===================================================== */

export function resetField(

    field,

    wrapper

){

    if(

        !field ||

        !wrapper

    ){

        return;

    }


    /* =================================================
       STATE
    ================================================= */

    if(

        State.values

    ){

        delete State.values[

            field.id

        ];

    }


    /* =================================================
       NORMAL INPUT
    ================================================= */

    const input =

        wrapper.querySelector(

            `[data-field="${field.id}"]`

        );


    if(

        input &&

        input.tagName !==

            "BUTTON"

    ){

        if(

            input.type ===

                "hidden"

        ){

            input.value =

                "";

        }

        else{

            input.value =

                "";

        }

    }


    /* =================================================
       CUSTOM SELECT
    ================================================= */

    const customSelect =

        wrapper.querySelector(

            ".global-input-custom-select"

        );


    if(

        customSelect

    ){

        const valueElement =

            customSelect.querySelector(

                ".global-input-custom-value"

            );


        if(

            valueElement

        ){

            valueElement.textContent =

                field.placeholder ??

                "Pilih...";

        }


        customSelect.classList.remove(

            "has-value"

        );

    }


    /* =================================================
       NOTE RESET

       Setelah reset, kembali ke field.note.
       Bukan note option sebelumnya.
    ================================================= */

    const note =

        wrapper.querySelector(

            ".global-input-field-note"

        );


    if(

        note

    ){

        note.textContent =

            field.note ??

            "";

    }

}


/* =====================================================
   UPDATE FIELD
===================================================== */

export function updateField(

    field,

    wrapper

){

    if(

        !field ||

        !wrapper

    ){

        return;

    }


    /* =================================================
       LABEL
    ================================================= */

    const label =

        wrapper.querySelector(

            "label"

        );


    if(

        label

    ){

        label.textContent =

            getFieldLabel(

                field

            );

    }


    /* =================================================
       CUSTOM SELECT
    ================================================= */

    if(

        field.type ===

        "select"

    ){

        updateCustomSelect(

            field,

            wrapper

        );

    }

}


/* =====================================================
   UPDATE CUSTOM SELECT
===================================================== */

function updateCustomSelect(

    field,

    wrapper

){

    const button =

        wrapper.querySelector(

            ".global-input-custom-select"

        );


    const hidden =

        wrapper.querySelector(

            `input[type="hidden"][data-field="${field.id}"]`

        );


    const note =

        wrapper.querySelector(

            ".global-input-field-note"

        );


    if(

        !button ||

        !hidden

    ){

        return;

    }


    const value =

        State.values?.[

            field.id

        ]

        ??

        hidden.value

        ??

        "";


    hidden.value =

        value;


    const valueElement =

        button.querySelector(

            ".global-input-custom-value"

        );


    if(

        valueElement

    ){

        valueElement.textContent =

            value !== ""

                ?

            getOptionLabel(

                field,

                value

            )

                :

            field.placeholder ??

            "Pilih...";

    }


    if(

        value !== ""

    ){

        button.classList.add(

            "has-value"

        );

    }

    else{

        button.classList.remove(

            "has-value"

        );

    }


    /* =================================================
       NOTE

       option.note → field.note
    ================================================= */

    if(

        note

    ){

        note.textContent =

            getOptionNote(

                field,

                value

            );

    }

}

/* =====================================================
   SET FIELD VALUE
===================================================== */

export function setFieldValue(

    field,

    wrapper,

    value

){

    if(

        !field ||

        !wrapper

    ){

        return;

    }


    /* =================================================
       STATE
    ================================================= */

    State.values[

        field.id

    ] =

        value;


    /* =================================================
       NORMAL INPUT
    ================================================= */

    if(

        field.type !==

        "select"

    ){

        const input =

            wrapper.querySelector(

                `[data-field="${field.id}"]`

            );


        if(

            input

        ){

            input.value =

                value

                ??

                "";

        }


        return;

    }


    /* =================================================
       CUSTOM SELECT
    ================================================= */

    const hidden =

        wrapper.querySelector(

            `input[type="hidden"][data-field="${field.id}"]`

        );


    const button =

        wrapper.querySelector(

            ".global-input-custom-select"

        );


    const note =

        wrapper.querySelector(

            ".global-input-field-note"

        );


    if(

        hidden

    ){

        hidden.value =

            value

            ??

            "";

    }


    if(

        button

    ){

        const valueElement =

            button.querySelector(

                ".global-input-custom-value"

            );


        if(

            valueElement

        ){

            valueElement.textContent =

                value !== ""

                    ?

                getOptionLabel(

                    field,

                    value

                )

                    :

                field.placeholder ??

                "Pilih...";

        }


        if(

            value !== ""

        ){

            button.classList.add(

                "has-value"

            );

        }

        else{

            button.classList.remove(

                "has-value"

            );

        }

    }


    /* =================================================
       NOTE
    ================================================= */

    if(

        note

    ){

        note.textContent =

            getOptionNote(

                field,

                value

            );

    }

}


/* =====================================================
   CLEAR FIELD VALUE
===================================================== */

export function clearFieldValue(

    field,

    wrapper

){

    if(

        !field ||

        !wrapper

    ){

        return;

    }


    setFieldValue(

        field,

        wrapper,

        ""

    );


    /* =================================================
       RESET NOTE
    ================================================= */

    const note =

        wrapper.querySelector(

            ".global-input-field-note"

        );


    if(

        note

    ){

        note.textContent =

            field.note ??

            "";

    }

}


/* =====================================================
   REFRESH FIELD OPTIONS
===================================================== */

export function refreshFieldOptions(

    field,

    wrapper

){

    if(

        !field ||

        !wrapper ||

        field.type !==

        "select"

    ){

        return;

    }


    const hidden =

        wrapper.querySelector(

            `input[type="hidden"][data-field="${field.id}"]`

        );


    const button =

        wrapper.querySelector(

            ".global-input-custom-select"

        );


    if(

        !hidden ||

        !button

    ){

        return;

    }


    const currentValue =

        State.values?.[

            field.id

        ]

        ??

        hidden.value

        ??

        "";


    const options =

        getOptions(

            field

        );


    const exists =

        options.some(

            option => {

                const optionValue =

                    typeof option ===

                    "object"

                        ?

                    option.value

                        :

                    option;


                return String(

                    optionValue

                )

                ===

                String(

                    currentValue

                );

            }

        );


    /* =================================================
       VALUE NO LONGER EXISTS
    ================================================= */

    if(

        currentValue !== "" &&

        !exists

    ){

        setFieldValue(

            field,

            wrapper,

            ""

        );


        return;

    }


    /* =================================================
       REFRESH DISPLAY
    ================================================= */

    updateCustomSelect(

        field,

        wrapper

    );

}


/* =====================================================
   VALIDATE FIELD
===================================================== */

export function validateField(

    field,

    value

){

    if(

        !field

    ){

        return true;

    }


    /* =================================================
       OPTIONAL FIELD
    ================================================= */

    if(

        !field.required &&

        String(

            value ??

            ""

        ).trim() === ""

    ){

        return true;

    }


    /* =================================================
       REQUIRED
    ================================================= */

    if(

        field.required &&

        (

            value ===

                undefined

            ||

            value ===

                null

            ||

            String(

                value

            ).trim() === ""

        )

    ){

        return false;

    }


    /* =================================================
       CUSTOM VALIDATION
    ================================================= */

    if(

        typeof field.validate ===

            "function"

    ){

        try{

            return Boolean(

                field.validate(

                    value,

                    State.values

                )

            );

        }

        catch(error){

            console.warn(

                "Field validation error:",

                error

            );

            return false;

        }

    }


    return true;

}


/* =====================================================
   FIELD NOTE HELPER
===================================================== */

export function getFieldNote(

    field,

    value

){

    return getOptionNote(

        field,

        value

    );

}


/* =====================================================
   FIELD DISPLAY LABEL
===================================================== */

export function getResolvedFieldLabel(

    field

){

    return getFieldLabel(

        field

    );

}


/* =====================================================
   FIELD OPTIONS PUBLIC
===================================================== */

export function getResolvedFieldOptions(

    field

){

    return getOptions(

        field

    );

}


/* =====================================================
   FIELD OPTION NOTE PUBLIC
===================================================== */

export function getResolvedOptionNote(

    field,

    value

){

    return getOptionNote(

        field,

        value

    );

}


/* =====================================================
   FIELD VALUE PUBLIC
===================================================== */

export function getFieldValue(

    field

){

    if(

        !field

    ){

        return "";

    }


    return State.values?.[

        field.id

    ]

    ??

    "";

}


/* =====================================================
   FIELD HAS VALUE
===================================================== */

export function fieldHasValue(

    field

){

    const value =

        getFieldValue(

            field

        );


    return (

        value !==

            undefined

        &&

        value !==

            null

        &&

        String(

            value

        ).trim() !== ""

    );

}


/* =====================================================
   REFRESH FIELD LABEL
===================================================== */

export function refreshFieldLabel(

    field,

    wrapper

){

    if(

        !field ||

        !wrapper

    ){

        return;

    }


    const label =

        wrapper.querySelector(

            "label"

        );


    if(

        !label

    ){

        return;

    }


    label.textContent =

        getFieldLabel(

            field

        );

}


/* =====================================================
   REFRESH FIELD NOTE
===================================================== */

export function refreshFieldNote(

    field,

    wrapper

){

    if(

        !field ||

        !wrapper

    ){

        return;

    }


    const note =

        wrapper.querySelector(

            ".global-input-field-note"

        );


    if(

        !note

    ){

        return;

    }


    const value =

        getFieldValue(

            field

        );


    note.textContent =

        getOptionNote(

            field,

            value

        );

}


/* =====================================================
   REFRESH FIELD UI
===================================================== */

export function refreshField(

    field,

    wrapper

){

    if(

        !field ||

        !wrapper

    ){

        return;

    }


    refreshFieldLabel(

        field,

        wrapper

    );


    if(

        field.type ===

        "select"

    ){

        refreshFieldOptions(

            field,

            wrapper

        );

    }

    else{

        const input =

            wrapper.querySelector(

                `[data-field="${field.id}"]`

            );


        if(

            input

        ){

            input.value =

                getFieldValue(

                    field

                );

        }

    }


    refreshFieldNote(

        field,

        wrapper

    );

}


/* =====================================================
   DESTROY FIELD
===================================================== */

export function destroyField(

    field,

    wrapper

){

    if(

        !wrapper

    ){

        return;

    }


    closeCustomPicker();


    if(

        field &&

        State.values

    ){

        delete State.values[

            field.id

        ];

    }


    wrapper.remove();

}


/* =====================================================
   FIELD INPUT EVENT
===================================================== */

export function bindFieldInput(

    field,

    element,

    onComplete

){

    if(

        !field ||

        !element

    ){

        return;

    }


    element.addEventListener(

        "input",

        () => {

            State.values[

                field.id

            ] =

                normalizeFieldValue(

                    field,

                    element.value

                );

        }

    );


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

}


/* =====================================================
   FIELD COMPLETE
===================================================== */

export function completeField(

    field,

    value,

    onComplete

){

    if(

        !field

    ){

        return;

    }


    const normalizedValue =

        normalizeFieldValue(

            field,

            value

        );


    if(

        !validateField(

            field,

            normalizedValue

        )

    ){

        return false;

    }


    State.values[

        field.id

    ] =

        normalizedValue;


    if(

        typeof onComplete ===

            "function"

    ){

        onComplete(

            field,

            normalizedValue

        );

    }


    return true;

}


/* =====================================================
   EXPORT DEFAULT
===================================================== */

export default {

    renderField,

    resetField,

    updateField,

    setFieldValue,

    clearFieldValue,

    refreshFieldOptions,

    refreshField,

    validateField,

    getFieldNote,

    getResolvedFieldLabel,

    getResolvedFieldOptions,

    getResolvedOptionNote,

    getFieldValue,

    fieldHasValue,

    refreshFieldLabel,

    refreshFieldNote,

    destroyField,

    bindFieldInput,

    completeField

};
