/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : field.js
   Version      : 2.1.0

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

   Edit Input :
   - Readonly field
   - Edit select
   - Edit number
   - Edit text
   - Edit value
   - Edit field event

   Principle :
   Global Input menggunakan custom control.

   Select :
       option.note
       ↓
       field.note
       ↓
       empty

   Edit Input :
       Edit field
       ↓
       State.editSelectedRecord
       ↓
       callback
       ↓
       Render / Controller
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
   EDIT INPUT FIELD
===================================================== */

/*
   Renderer tambahan untuk Edit Input.

   Fungsi ini sengaja dipisahkan dari renderField()
   agar Normal Input tidak berubah.

   Contoh :

   renderEditField(
       {
           id        : "status",
           type      : "edit-select",
           label     : "Hasil",
           options   : [
               {
                   value : "win",
                   label : "Win"
               },
               {
                   value : "not_win",
                   label : "Not Win"
               }
           ]
       },
       container,
       value => {}
   );

   Value awal dibaca dari :

       State.editSelectedRecord

   Bukan State.values.
===================================================== */

export function renderEditField(

    field,

    container,

    onChange

){

    if(

        !field

        ||

        !container

    ){

        return null;

    }


    /* =================================================
       WRAPPER
    ================================================= */

    const wrapper =

        document.createElement(

            "div"

        );


    wrapper.className =

        "global-input-edit-field";


    wrapper.dataset.field =

        field.id;


    /* =================================================
       LABEL
    ================================================= */

    if(

        field.label !==

        false

    ){

        const label =

            document.createElement(

                "label"

            );


        label.className =

            "global-input-edit-label";


        label.textContent =

            getEditFieldLabel(

                field

            );


        wrapper.appendChild(

            label

        );

    }


    /* =================================================
       INITIAL VALUE
    ================================================= */

    const initialValue =

        getEditFieldValue(

            field

        );


    /* =================================================
       READONLY
    ================================================= */

    if(

        field.type ===

        "readonly"

        ||

        field.readonly ===

        true

    ){

        const valueElement =

            document.createElement(

                "div"

            );


        valueElement.className =

            "global-input-edit-readonly";


        valueElement.dataset.field =

            field.id;


        valueElement.textContent =

            initialValue

            ??

            "";


        wrapper.appendChild(

            valueElement

        );


        appendEditNote(

            field,

            wrapper

        );


        container.appendChild(

            wrapper

        );


        return {

            wrapper,

            element :

                valueElement,

            value :

                initialValue

        };

    }


    /* =================================================
       SELECT
    ================================================= */

    if(

        field.type ===

        "edit-select"

        ||

        field.type ===

        "select"

    ){

        const result =

            renderEditSelect(

                field,

                wrapper,

                initialValue,

                onChange

            );


        appendEditNote(

            field,

            wrapper

        );


        container.appendChild(

            wrapper

        );


        return result;

    }


    /* =================================================
       INPUT
    ================================================= */

    const element =

        document.createElement(

            "input"

        );


    element.type =

        field.type ===

        "edit-number"

        ?

        "number"

        :

        "text";


    element.className =

        "global-input-edit-control";


    element.dataset.field =

        field.id;


    if(

        initialValue !==

        undefined

        &&

        initialValue !==

        null

    ){

        element.value =

            initialValue;

    }


    if(

        field.placeholder

    ){

        element.placeholder =

            field.placeholder;

    }


    if(

        field.required

    ){

        element.required =

            true;

    }


    if(

        field.min !==

        undefined

    ){

        element.min =

            field.min;

    }


    if(

        field.max !==

        undefined

    ){

        element.max =

            field.max;

    }


    if(

        field.step !==

        undefined

    ){

        element.step =

            field.step;

    }


    wrapper.appendChild(

        element

    );


    appendEditNote(

        field,

        wrapper

    );


    container.appendChild(

        wrapper

    );


    /* =================================================
       CHANGE
    ================================================= */

    const handleChange =

        () => {

            const value =

                getEditElementValue(

                    element

                );


            if(

                typeof onChange ===

                "function"

            ){

                onChange(

                    field,

                    value

                );

            }

        };


    element.addEventListener(

        "input",

        handleChange

    );


    element.addEventListener(

        "change",

        handleChange

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

                handleChange();

            }

        }

    );


    return {

        wrapper,

        element,

        value :

            initialValue

    };

}


/* =====================================================
   GET EDIT FIELD LABEL
===================================================== */

function getEditFieldLabel(

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

                    State.editSelectedRecord

                )

                ??

                ""

            );

        }

        catch(error){

            console.warn(

                "Edit field label error:",

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
   GET EDIT FIELD VALUE
===================================================== */

function getEditFieldValue(

    field

){

    if(

        !field

        ||

        !field.id

    ){

        return "";

    }


    const record =

        State.editSelectedRecord;


    if(

        !record

    ){

        if(

            field.value !==

            undefined

        ){

            return field.value;

        }


        return "";

    }


    /* =================================================
       FUNCTION VALUE
    ================================================= */

    if(

        typeof field.value ===

        "function"

    ){

        try{

            return (

                field.value(

                    record

                )

                ??

                ""

            );

        }

        catch(error){

            console.warn(

                "Edit field value error:",

                error

            );

        }

    }


    /* =================================================
       RECORD VALUE
    ================================================= */

    if(

        record[field.id] !==

        undefined

    ){

        return record[field.id];

    }


    /* =================================================
       ALTERNATIVE KEY
    ================================================= */

    if(

        field.key

        &&

        record[field.key] !==

        undefined

    ){

        return record[field.key];

    }


    /* =================================================
       FIELD DEFAULT
    ================================================= */

    return (

        field.value

        ??

        ""

    );

}


/* =====================================================
   GET EDIT ELEMENT VALUE
===================================================== */

function getEditElementValue(

    element

){

    if(

        !element

    ){

        return "";

    }


    return String(

        element.value

        ??

        ""

    ).trim();

}


/* =====================================================
   APPEND EDIT NOTE
===================================================== */

function appendEditNote(

    field,

    wrapper

){

    if(

        !field

        ||

        !field.note

    ){

        return;

    }


    const note =

        document.createElement(

            "small"

        );


    note.className =

        "global-input-edit-field-note";


    note.textContent =

        field.note;


    wrapper.appendChild(

        note

    );

}


/* =====================================================
   RENDER EDIT SELECT
===================================================== */

function renderEditSelect(

    field,

    wrapper,

    initialValue,

    onChange

){

    const selectWrapper =

        document.createElement(

            "div"

        );


    selectWrapper.className =

        "global-input-edit-select-wrapper";


    const button =

        document.createElement(

            "button"

        );


    button.type =

        "button";


    button.className =

        "global-input-edit-select";


    button.dataset.field =

        field.id;


    const valueElement =

        document.createElement(

            "span"

        );


    valueElement.className =

        "global-input-edit-value";


    const arrow =

        document.createElement(

            "span"

        );


    arrow.className =

        "global-input-edit-arrow";


    arrow.textContent =

        "▾";


    const hidden =

        document.createElement(

            "input"

        );


    hidden.type =

        "hidden";


    hidden.value =

        initialValue

        ??

        "";


    hidden.dataset.field =

        field.id;


    valueElement.textContent =

        getEditOptionLabel(

            field,

            hidden.value

        );


    if(

        hidden.value !==

        ""

    ){

        button.classList.add(

            "has-value"

        );

    }


    button.appendChild(

        valueElement

    );


    button.appendChild(

        arrow

    );


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
       CLICK
    ================================================= */

    button.addEventListener(

        "click",

        event => {

            event.preventDefault();


            openEditPicker(

                field,

                button,

                hidden,

                valueElement,

                onChange

            );

        }

    );


    return {

        wrapper,

        element :

            hidden,

        button,

        valueElement,

        value :

            initialValue

    };

}


/* =====================================================
   OPEN EDIT PICKER
===================================================== */

function openEditPicker(

    field,

    button,

    hidden,

    valueElement,

    onChange

){

    closeEditPicker();


    const picker =

        document.createElement(

            "div"

        );


    picker.className =

        "global-input-edit-picker";


    const backdrop =

        document.createElement(

            "div"

        );


    backdrop.className =

        "global-input-edit-picker-backdrop";


    const panel =

        document.createElement(

            "div"

        );


    panel.className =

        "global-input-edit-picker-panel";


    const header =

        document.createElement(

            "div"

        );


    header.className =

        "global-input-edit-picker-header";


    const title =

        document.createElement(

            "strong"

        );


    title.textContent =

        getEditFieldLabel(

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

        "global-input-edit-picker-close";


    closeButton.textContent =

        "×";


    header.appendChild(

        title

    );


    header.appendChild(

        closeButton

    );


    const list =

        document.createElement(

            "div"

        );


    list.className =

        "global-input-edit-picker-list";


    const options =

        getEditOptions(

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

                    option.label

                    ??

                    option.value

                    :

                    option;


                if(

                    value ===

                    undefined

                    ||

                    value ===

                    null

                ){

                    return;

                }


                const item =

                    document.createElement(

                        "button"

                    );


                item.type =

                    "button";


                item.className =

                    "global-input-edit-picker-option";


                if(

                    String(

                        hidden.value

                    )

                    ===

                    String(

                        value

                    )

                ){

                    item.classList.add(

                        "selected"

                    );

                }


                const content =

                    document.createElement(

                        "span"

                    );


                content.className =

                    "global-input-edit-picker-option-content";


                content.textContent =

                    label;


                const radio =

                    document.createElement(

                        "span"

                    );


                radio.className =

                    "global-input-edit-picker-radio";


                radio.textContent =

                    String(

                        hidden.value

                    )

                    ===

                    String(

                        value

                    )

                    ?

                    "●"

                    :

                    "○";


                item.appendChild(

                    content

                );


                item.appendChild(

                    radio

                );


                if(

                    option

                    &&

                    typeof option ===

                    "object"

                    &&

                    option.note

                ){

                    const note =

                        document.createElement(

                            "small"

                        );


                    note.className =

                        "global-input-edit-picker-option-note";


                    note.textContent =

                        option.note;


                    item.appendChild(

                        note

                    );

                }


                item.addEventListener(

                    "click",

                    () => {

                        hidden.value =

                            value;


                        valueElement.textContent =

                            label;


                        button.classList.add(

                            "has-value"

                        );


                        closeEditPicker();


                        if(

                            typeof onChange ===

                            "function"

                        ){

                            onChange(

                                field,

                                value

                            );

                        }

                    }

                );


                list.appendChild(

                    item

                );

            }

        );

    }


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


    closeButton.addEventListener(

        "click",

        closeEditPicker

    );


    backdrop.addEventListener(

        "click",

        closeEditPicker

    );


    picker._escapeHandler =

        event => {

            if(

                event.key ===

                "Escape"

            ){

                closeEditPicker();

            }

        };


    document.addEventListener(

        "keydown",

        picker._escapeHandler

    );


    requestAnimationFrame(

        () => {

            picker.classList.add(

                "is-open"

            );

        }

    );

}


/* =====================================================
   GET EDIT OPTIONS
===================================================== */

function getEditOptions(

    field

){

    if(

        !field

    ){

        return [];

    }


    if(

        typeof field.options ===

        "function"

    ){

        try{

            return (

                field.options(

                    State.editSelectedRecord,

                    State.editMode

                )

                ??

                []

            );

        }

        catch(error){

            console.warn(

                "Edit field options error:",

                error

            );


            return [];

        }

    }


    return (

        field.options

        ??

        []

    );

}


/* =====================================================
   GET EDIT OPTION LABEL
===================================================== */

function getEditOptionLabel(

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

        getEditOptions(

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


    return (

        typeof option ===

        "object"

        ?

        option.label

        ??

        option.value

        :

        option

    );

}


/* =====================================================
   CLOSE EDIT PICKER
===================================================== */

function closeEditPicker(){

    const picker =

        document.querySelector(

            ".global-input-edit-picker"

        );


    if(

        !picker

    ){

        return;

    }


    if(

        picker._escapeHandler

    ){

        document.removeEventListener(

            "keydown",

            picker._escapeHandler

        );

    }


    picker.remove();

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

            field.type

            ??

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

                option.label

                ??

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

        field.placeholder

        ??

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

        hidden.value !==

        ""

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

        )

        ||

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

                    option.label

                    ??

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

                    "object"

                    &&

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

            element.value

            ??

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

        option.label

        ??

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
