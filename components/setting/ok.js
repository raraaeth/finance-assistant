/* =====================================================
   Finance Assistant
   Component    : Global Setting
   File         : script.js
   Version      : 4.1.0

   Description :
   Global Setting Controller

   Responsibility :
   - Load HTML
   - Init
   - Open
   - Close
   - Module Registry
   - Render Section
   - Render Dynamic Fields
   - Custom Select
   - Conditional Fields
   - Collect Input
   - Normalize Input
   - Render Result
   - Delete Result
   - Confirm

   Principle :
   Controller is generic.

   Module-specific configuration lives in:
   - kas.js
   - monthly.js
   - saving.js
   - payroll-daily.js
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    KasSetting

} from "./kas.js";


import {

    MonthlySetting

} from "./monthly.js";


import {

    SavingSetting

} from "./saving.js";


/* =====================================================
   MODULE REGISTRY
===================================================== */

const SETTINGS = {

    "payroll-monthly":

        MonthlySetting,


    "kas":

        KasSetting,


    "saving":

        SavingSetting

};


/* =====================================================
   STATE
===================================================== */

let initialized = false;

let currentWorkspace = null;

let currentConfig = null;


/* =====================================================
   SETTING
===================================================== */

export const Setting = {


    /* =================================================
       INIT
    ================================================= */

    async init(){

        if(

            initialized

        ){

            return true;

        }


        const overlay =

            await loadHTML();


        if(

            !overlay

        ){

            return false;

        }


        /* =============================================
           CLOSE BUTTON
        ============================================= */

        const closeButton =

            document.getElementById(

                "global-setting-close"

            );


        if(

            closeButton

        ){

            closeButton.addEventListener(

                "click",

                () => {

                    Setting.close();

                }

            );

        }


        /* =============================================
           BACKDROP
        ============================================= */

        const backdrop =

            document.getElementById(

                "global-setting-backdrop"

            );


        if(

            backdrop

        ){

            backdrop.addEventListener(

                "click",

                () => {

                    Setting.close();

                }

            );

        }


        /* =============================================
           ESC
        ============================================= */

        document.addEventListener(

            "keydown",

            event => {

                if(

                    event.key === "Escape"

                ){

                    Setting.close();

                }

            }

        );


        /* =============================================
           CONFIRM
        ============================================= */

        const confirmButton =

            document.getElementById(

                "global-setting-confirm"

            );


        if(

            confirmButton

        ){

            confirmButton.addEventListener(

                "click",

                () => {

                    Setting.confirm();

                }

            );

        }


        initialized =

            true;


        return true;

    },


    /* =================================================
       OPEN
    ================================================= */

    async open(

        workspace

    ){

        const ready =

            await Setting.init();


        if(

            !ready

        ){

            return;

        }


        /* =============================================
           GET MODULE CONFIG
        ============================================= */

        const config =

            SETTINGS[

                workspace

            ];


        if(

            !config

        ){

            console.error(

                "Setting module tidak ditemukan:",

                workspace

            );

            return;

        }


        /* =============================================
           SAVE STATE
        ============================================= */

        currentWorkspace =

            workspace;


        currentConfig =

            config;


        /* =============================================
           GET OVERLAY
        ============================================= */

        const overlay =

            document.getElementById(

                "global-setting-overlay"

            );


        if(

            !overlay

        ){

            console.error(

                "Global Setting overlay tidak ditemukan."

            );

            return;

        }


        /* =============================================
           HEADER
        ============================================= */

        renderHeader(

            config

        );


        /* =============================================
           CONTENT
        ============================================= */

        renderContent(

            config

        );


        /* =============================================
           OPEN
        ============================================= */

        overlay.classList.add(

            "is-open"

        );


        document.body.classList.add(

            "setting-open"

        );

    },


    /* =================================================
       CLOSE
    ================================================= */

    close(){

        closeCustomPicker();


        const overlay =

            document.getElementById(

                "global-setting-overlay"

            );


        if(

            !overlay

        ){

            return;

        }


        overlay.classList.remove(

            "is-open"

        );


        document.body.classList.remove(

            "setting-open"

        );

    },


    /* =================================================
       CONFIRM
    ================================================= */

    confirm(){

        closeCustomPicker();


        const data =

            collectAllResults();


        console.log(

            "SETTING CONFIRM",

            {

                workspace :

                    currentWorkspace,

                data :

                    data

            }

        );


        /*
         * Apps Script belum dipanggil.
         *
         * Untuk sekarang data hanya dikumpulkan
         * dan ditampilkan di console.
         *
         * Tahap berikutnya:
         *
         * API / Apps Script
         *        ↓
         * Sheet setting
         */

    }

};


/* =====================================================
   LOAD HTML
===================================================== */

async function loadHTML(){

    let overlay =

        document.getElementById(

            "global-setting-overlay"

        );


    /* =============================================
       EXISTING
    ============================================= */

    if(

        overlay

    ){

        return overlay;

    }


    /* =============================================
       FETCH
    ============================================= */

    try{

        const response =

            await fetch(

                new URL(

                    "./index.html",

                    import.meta.url

                )

            );


        if(

            !response.ok

        ){

            throw new Error(

                `HTTP ${response.status}`

            );

        }


        const html =

            await response.text();


        /* =========================================
           CREATE DOM
        ========================================= */

        const wrapper =

            document.createElement(

                "div"

            );


        wrapper.innerHTML =

            html.trim();


        overlay =

            wrapper.firstElementChild;


        if(

            !overlay

        ){

            throw new Error(

                "Global Setting root tidak ditemukan."

            );

        }


        /* =========================================
           APPEND
        ========================================= */

        document.body.appendChild(

            overlay

        );


        return overlay;

    }

    catch(error){

        console.error(

            "Global Setting HTML Error:",

            error

        );


        return null;

    }

}


/* =====================================================
   RENDER HEADER
===================================================== */

function renderHeader(

    config

){

    const title =

        document.getElementById(

            "global-setting-title"

        );


    const subtitle =

        document.getElementById(

            "global-setting-subtitle"

        );


    if(

        title

    ){

        title.textContent =

            config.title ??

            "Pengaturan";

    }


    if(

        subtitle

    ){

        subtitle.textContent =

            config.subtitle ??

            "Atur konfigurasi workspace";

    }

}


/* =====================================================
   RENDER CONTENT
===================================================== */

function renderContent(

    config

){

    const content =

        document.getElementById(

            "global-setting-content"

        );


    if(

        !content

    ){

        return;

    }


    /* =============================================
       RESET
    ============================================= */

    content.innerHTML = "";


    /* =============================================
       CLOSE OLD PICKER
    ============================================= */

    closeCustomPicker();


    /* =============================================
       VALIDATE
    ============================================= */

    if(

        !Array.isArray(

            config.sections

        )

    ){

        console.error(

            "Setting sections tidak ditemukan:",

            config

        );

        return;

    }


    /* =============================================
       RENDER
    ============================================= */

    config.sections.forEach(

        section => {

            renderSection(

                content,

                section

            );

        }

    );

}


/* =====================================================
   RENDER SECTION
===================================================== */

function renderSection(

    container,

    section

){

    const element =

        document.createElement(

            "section"

        );


    element.className =

        "global-setting-section";


    element.dataset.section =

        section.id;


    element.innerHTML =

    `

        <!-- ======================================
             SECTION HEADER
        ====================================== -->

        <div
            class="global-setting-section-header">

            <div>

                <h3>

                    ${escapeHTML(

                        section.title

                    )}

                </h3>


                <p>

                    ${escapeHTML(

                        section.description ??

                        ""

                    )}

                </p>

            </div>

        </div>


        <!-- ======================================
             FORM
        ====================================== -->

        <div
            class="global-setting-form hidden">

        </div>


        <!-- ======================================
             ADD BUTTON
        ====================================== -->

        <button
            type="button"
            class="global-setting-add">

            ${escapeHTML(

                section.addLabel ??

                "＋ Tambah"

            )}

        </button>


        <!-- ======================================
             RESULT
        ====================================== -->

        <div
            class="global-setting-result">

        </div>

    `;


    container.appendChild(

        element

    );


    /* =============================================
       ADD BUTTON
    ============================================= */

    const addButton =

        element.querySelector(

            ".global-setting-add"

        );


    if(

        addButton

    ){

        addButton.addEventListener(

            "click",

            () => {

                toggleForm(

                    section,

                    element

                );

            }

        );

    }

}


/* =====================================================
   TOGGLE FORM
===================================================== */

function toggleForm(

    section,

    sectionElement

){

    const form =

        sectionElement.querySelector(

            ".global-setting-form"

        );


    if(

        !form

    ){

        return;

    }


    /* =============================================
       IF FORM ALREADY OPEN
    ============================================= */

    if(

        !form.classList.contains(

            "hidden"

        )

    ){

        closeCustomPicker();


        form.classList.add(

            "hidden"

        );


        form.innerHTML = "";


        return;

    }


    /* =============================================
       RENDER FORM
    ============================================= */

    renderForm(

        section,

        sectionElement

    );

}


/* =====================================================
   RENDER FORM
===================================================== */

function renderForm(

    section,

    sectionElement

){

    const form =

        sectionElement.querySelector(

            ".global-setting-form"

        );


    if(

        !form

    ){

        return;

    }


    closeCustomPicker();


    form.classList.remove(

        "hidden"

    );


    form.innerHTML = "";


    /* =============================================
       VALIDATE FIELDS
    ============================================= */

    if(

        !Array.isArray(

            section.fields

        )

        ||

        section.fields.length === 0

    ){

        return;

    }


    /* =============================================
       RENDER FIELDS
    ============================================= */

    section.fields.forEach(

        field => {

            renderField(

                form,

                field

            );

        }

    );


    /* =============================================
       CONDITIONAL FIELD LISTENER
    ============================================= */

    bindConditionalFields(

        form,

        section.fields

    );


    /* =============================================
       DYNAMIC SELECT LISTENER
    ============================================= */

    bindDynamicSelects(

        form,

        section.fields

    );


    /* =============================================
       FORM ACTION
    ============================================= */

    const action =

        document.createElement(

            "button"

        );


    action.type =

        "button";


    action.className =

        "global-setting-form-add";


    action.textContent =

        section.formAddLabel ??

        "＋ Tambahkan";


    form.appendChild(

        action

    );


    action.addEventListener(

        "click",

        () => {

            addResult(

                section,

                sectionElement

            );

        }

    );


    /* =============================================
       INITIAL CONDITION
    ============================================= */

    updateConditionalFields(

        form,

        section.fields

    );


    /* =============================================
       FOCUS
    ============================================= */

    const firstVisibleInput =

        getFirstVisibleInput(

            form

        );


    if(

        firstVisibleInput

    ){

        firstVisibleInput.focus();

    }

}


/* =====================================================
   BIND DYNAMIC SELECTS
===================================================== */

function bindDynamicSelects(

    form,

    fields

){

    if(

        !Array.isArray(

            fields

        )

    ){

        return;

    }


    fields.forEach(

        field => {

            if(

                !field.optionsBy

            ){

                return;

            }


            const controller =

                form.querySelector(

                    `[name="${escapeSelector(

                        field.optionsByField

                    )}"]`

                );


            const hidden =

                form.querySelector(

                    `[name="${escapeSelector(

                        field.name

                    )}"]`

                );


            const button =

                form.querySelector(

                    `.global-setting-custom-select[data-name="${escapeSelector(

                        field.name

                    )}"]`

                );


            if(

                !controller ||

                !hidden ||

                !button

            ){

                return;

            }


            controller.addEventListener(

                "change",

                () => {

                    /* =========================
                       RESET VALUE
                    ========================= */

                    hidden.value = "";


                    button.classList.remove(

                        "has-value"

                    );


                    const valueElement =

                        button.querySelector(

                            ".global-setting-custom-value"

                        );


                    if(

                        valueElement

                    ){

                        valueElement.textContent =

                            field.placeholder ??

                            "Pilih...";

                    }


                    /* =========================
                       RESET NOTE
                    ========================= */

                    const wrapper =

                        button.closest(

                            ".global-setting-field"

                        );


                    const noteElement =

                        wrapper?.querySelector(

                            ".global-setting-field-note"

                        );


                    if(

                        noteElement

                    ){

                        noteElement.textContent =

                            field.note ??

                            "";

                    }

                }

            );

        }

    );

}


/* =====================================================
   RENDER FIELD
===================================================== */

function renderField(

    container,

    field

){

    const wrapper =

        document.createElement(

            "div"

        );


    wrapper.className =

        "global-setting-field";


    wrapper.dataset.field =

        field.name;


    /* =============================================
       CONDITIONAL METADATA
    ============================================= */

    if(

        field.dependsOn

    ){

        wrapper.dataset.dependsOnField =

            field.dependsOn.field;


        wrapper.dataset.dependsOnValue =

            field.dependsOn.value;

    }


    /* =============================================
       LABEL
    ============================================= */

    const label =

        document.createElement(

            "label"

        );


    label.textContent =

        field.label ??

        field.name;


    wrapper.appendChild(

        label

    );


    /* =============================================
       CUSTOM SELECT
       Semua type "select" otomatis
       menggunakan picker custom.
    ============================================= */

    if(

        field.type ===

        "select"

    ){

        renderCustomSelect(

            wrapper,

            field

        );


        /* =============================================
           FIELD NOTE
        ============================================= */

        if(

            field.note

        ){

            const note =

                document.createElement(

                    "small"

                );


            note.className =

                "global-setting-field-note";


            note.textContent =

                field.note;


            wrapper.appendChild(

                note

            );

        }


        container.appendChild(

            wrapper

        );


        return;

    }


    /* =============================================
       FIELD
    ============================================= */

    let input;


    /* =============================================
       TEXTAREA
    ============================================= */

    if(

        field.type ===

        "textarea"

    ){

        input =

            document.createElement(

                "textarea"

            );

    }


    /* =============================================
       CHECKBOX
    ============================================= */

    else if(

        field.type ===

        "checkbox"

    ){

        input =

            document.createElement(

                "input"

            );


        input.type =

            "checkbox";

    }


    /* =============================================
       DEFAULT INPUT
    ============================================= */

    else{

        input =

            document.createElement(

                "input"

            );


        input.type =

            field.type ??

            "text";

    }


    /* =============================================
       COMMON ATTRIBUTES
    ============================================= */

    applyFieldAttributes(

        input,

        field

    );


    /* =============================================
       APPEND INPUT
    ============================================= */

    wrapper.appendChild(

        input

    );


    /* =============================================
       FIELD NOTE
    ============================================= */

    if(

        field.note

    ){

        const note =

            document.createElement(

                "small"

            );


        note.className =

            "global-setting-field-note";


        note.textContent =

            field.note;


        wrapper.appendChild(

            note

        );

    }


    /* =============================================
       APPEND WRAPPER
    ============================================= */

    container.appendChild(

        wrapper

    );

}


/* =====================================================
   APPLY FIELD ATTRIBUTES
===================================================== */

function applyFieldAttributes(

    input,

    field

){

    input.name =

        field.name;


    input.id =

        `setting-${
            currentWorkspace
        }-${
            field.name
        }`;


    if(

        field.placeholder

    ){

        input.placeholder =

            field.placeholder;

    }


    if(

        field.required

    ){

        input.required =

            true;

    }


    if(

        field.min !== undefined

    ){

        input.min =

            field.min;

    }


    if(

        field.max !== undefined

    ){

        input.max =

            field.max;

    }


    if(

        field.step !== undefined

    ){

        input.step =

            field.step;

    }


    if(

        field.value !== undefined

    ){

        if(

            field.type ===

            "checkbox"

        ){

            input.checked =

                Boolean(

                    field.value

                );

        }

        else{

            input.value =

                field.value;

        }

    }

}


/* =====================================================
   RENDER CUSTOM SELECT
===================================================== */

function renderCustomSelect(

    wrapper,

    field

){

    /* =============================================
       SELECT BUTTON
    ============================================= */

    const button =

        document.createElement(

            "button"

        );


    button.type =

        "button";


    button.className =

        "global-setting-custom-select";


    button.dataset.name =

        field.name;


    /* =============================================
       VALUE
    ============================================= */

    const valueElement =

        document.createElement(

            "span"

        );


    valueElement.className =

        "global-setting-custom-value";


    valueElement.textContent =

        getOptionLabel(

            field,

            field.value

        ) ??

        field.placeholder ??

        "Pilih...";


    /* =============================================
       ARROW
    ============================================= */

    const arrow =

        document.createElement(

            "span"

        );


    arrow.className =

        "global-setting-custom-arrow";


    arrow.textContent =

        "▾";


    button.appendChild(

        valueElement

    );


    button.appendChild(

        arrow

    );


    /* =============================================
       HIDDEN VALUE
    ============================================= */

    const hidden =

        document.createElement(

            "input"

        );


    hidden.type =

        "hidden";


    hidden.name =

        field.name;


    hidden.id =

        `setting-${
            currentWorkspace
        }-${
            field.name
        }`;


    hidden.value =

        field.value ??

        "";


    if(

        field.required

    ){

        hidden.dataset.required =

            "true";

    }


    /* =============================================
       APPEND
    ============================================= */

    wrapper.appendChild(

        button

    );


    wrapper.appendChild(

        hidden

    );


    /* =============================================
       STATE
    ============================================= */

    if(

        hidden.value !== ""

    ){

        button.classList.add(

            "has-value"

        );

    }


    /* =============================================
       OPEN PICKER
    ============================================= */

    button.addEventListener(

        "click",

        event => {

            event.preventDefault();


            openCustomPicker(

                field,

                button,

                hidden

            );

        }

    );

}


/* =====================================================
   OPEN CUSTOM PICKER
===================================================== */

function openCustomPicker(

    field,

    button,

    hidden

){

    closeCustomPicker();


    /* =============================================
       PICKER
    ============================================= */

    const picker =

        document.createElement(

            "div"

        );


    picker.className =

        "global-setting-picker";


    picker.innerHTML =

    `

        <div
            class="global-setting-picker-backdrop">

        </div>


        <div
            class="global-setting-picker-panel">


            <div
                class="global-setting-picker-header">


                <strong>

                    ${escapeHTML(

                        field.label ??

                        "Pilih"

                    )}

                </strong>


                <button
                    type="button"
                    class="global-setting-picker-close">

                    ×

                </button>


            </div>


            <div
                class="global-setting-picker-list">

            </div>


        </div>

    `;


    document.body.appendChild(

        picker

    );


    const list =

        picker.querySelector(

            ".global-setting-picker-list"

        );


    /* =============================================
       OPTIONS
    ============================================= */

    const options =

        getFieldOptions(

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


                const item =

                    document.createElement(

                        "button"

                    );


                item.type =

                    "button";


                item.className =

                    "global-setting-picker-option";


                const selected =

                    String(

                        hidden.value

                    )

                    ===

                    String(

                        value

                    );


                if(

                    selected

                ){

                    item.classList.add(

                        "selected"

                    );

                }


                item.innerHTML =

                `

                    <span>

                        ${escapeHTML(

                            label

                        )}

                    </span>


                    <span class="picker-radio">

                        ${

                            selected

                                ?

                            "●"

                                :

                            "○"

                        }

                    </span>

                `;


                item.addEventListener(

                    "click",

                    () => {

                        selectCustomOption(

                            value,

                            label,

                            option,

                            field,

                            button,

                            hidden,

                            picker

                        );

                    }

                );


                list.appendChild(

                    item

                );

            }

        );

    }


    /* =============================================
       CLOSE EVENTS
    ============================================= */

    const closeButton =

        picker.querySelector(

            ".global-setting-picker-close"

        );


    const backdrop =

        picker.querySelector(

            ".global-setting-picker-backdrop"

        );


    if(

        closeButton

    ){

        closeButton.addEventListener(

            "click",

            closeCustomPicker

        );

    }


    if(

        backdrop

    ){

        backdrop.addEventListener(

            "click",

            closeCustomPicker

        );

    }


    /* =============================================
       ESC
    ============================================= */

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

}


/* =====================================================
   SELECT CUSTOM OPTION
===================================================== */

function selectCustomOption(

    value,

    label,

    option,

    field,

    button,

    hidden,

    picker

){

    hidden.value =

        value;


    const valueElement =

        button.querySelector(

            ".global-setting-custom-value"

        );


    if(

        valueElement

    ){

        valueElement.textContent =

            label;

    }


    /* =============================================
       UPDATE OPTION NOTE
    ============================================= */

    const wrapper =

        button.closest(

            ".global-setting-field"

        );


    const noteElement =

        wrapper?.querySelector(

            ".global-setting-field-note"

        );


    if(

        noteElement

    ){

        const optionNote =

            typeof option === "object"

                ?

            option.note

                :

            "";


        noteElement.textContent =

            optionNote ||

            field.note ||

            "";

    }


    button.classList.add(

        "has-value"

    );


    /* =============================================
       CHANGE EVENT
       Penting untuk conditional fields.
    ============================================= */

    hidden.dispatchEvent(

        new Event(

            "change",

            {

                bubbles :

                    true

            }

        )

    );


    closeCustomPicker();

}


/* =====================================================
   CLOSE CUSTOM PICKER
===================================================== */

function closeCustomPicker(){

    const picker =

        document.querySelector(

            ".global-setting-picker"

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
   GET OPTION LABEL
===================================================== */

function getOptionLabel(

    field,

    value

){

    if(

        value === undefined ||

        value === null ||

        value === ""

    ){

        return "";

    }


    if(

        !Array.isArray(

            field.options

        )

    ){

        return value;

    }


    const option =

        field.options.find(

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

        option === undefined

    ){

        return value;

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
   GET FIELD OPTIONS
===================================================== */

function getFieldOptions(

    field

){

    /* =============================================
       STATIC OPTIONS
    ============================================= */

    if(

        Array.isArray(

            field.options

        )

    ){

        return field.options;

    }


    /* =============================================
       DYNAMIC OPTIONS
    ============================================= */

    if(

        field.optionsBy

    ){

        const form =

            document.querySelector(

                ".global-setting-form:not(.hidden)"

            );


        if(

            !form

        ){

            return [];

        }


        const controller =

            form.querySelector(

                `[name="${escapeSelector(

                    field.optionsByField

                )}"]`

            );


        if(

            !controller

        ){

            return [];

        }


        return (

            field.optionsBy[

                controller.value

            ]

            ??

            []

        );

    }


    return [];

}


/* =====================================================
   CONDITIONAL FIELD LISTENER
===================================================== */

function bindConditionalFields(

    form,

    fields

){

    if(

        !Array.isArray(

            fields

        )

    ){

        return;

    }


    fields.forEach(

        field => {

            if(

                !field.dependsOn

            ){

                return;

            }


            const controller =

                form.querySelector(

                    `[name="${escapeSelector(

                        field.dependsOn.field

                    )}"]`

                );


            if(

                !controller

            ){

                return;

            }


            controller.addEventListener(

                "change",

                () => {

                    updateConditionalFields(

                        form,

                        fields

                    );

                }

            );

        }

    );

}


/* =====================================================
   UPDATE CONDITIONAL FIELDS
===================================================== */

function updateConditionalFields(

    form,

    fields

){

    if(

        !Array.isArray(

            fields

        )

    ){

        return;

    }


    fields.forEach(

        field => {

            if(

                !field.dependsOn

            ){

                return;

            }


            const wrapper =

                form.querySelector(

                    `[data-field="${escapeSelector(

                        field.name

                    )}"]`

                );


            const controller =

                form.querySelector(

                    `[name="${escapeSelector(

                        field.dependsOn.field

                    )}"]`

                );


            if(

                !wrapper ||

                !controller

            ){

                return;

            }


            /* =============================================
               SHOULD SHOW
            ============================================= */

            let shouldShow = false;


            /* =============================================
               MULTIPLE VALUES
            ============================================= */

            if(

                Array.isArray(

                    field.dependsOn.values

                )

            ){

                shouldShow =

                    field.dependsOn.values.some(

                        value =>

                            String(

                                controller.value

                            )

                            ===

                            String(

                                value

                            )

                    );

            }


            /* =============================================
               SINGLE VALUE
            ============================================= */

            else if(

                field.dependsOn.value !== undefined

            ){

                shouldShow =

                    String(

                        controller.value

                    )

                    ===

                    String(

                        field.dependsOn.value

                    );

            }


            /* =============================================
               APPLY STATE
            ============================================= */

            if(

                shouldShow

            ){

                wrapper.classList.remove(

                    "hidden"

                );

            }

            else{

                wrapper.classList.add(

                    "hidden"

                );


                const input =

                    wrapper.querySelector(

                        "input, select, textarea"

                    );


                if(

                    input

                ){

                    if(

                        input.type ===

                        "checkbox"

                    ){

                        input.checked =

                            false;

                    }

                    else{

                        input.value =

                            "";

                    }

                }

            }

        }

    );

}


/* =====================================================
   FIRST VISIBLE INPUT
===================================================== */

function getFirstVisibleInput(

    form

){

    const inputs =

        form.querySelectorAll(

            "input, select, textarea"

        );


    for(

        const input of inputs

    ){

        const wrapper =

            input.closest(

                ".global-setting-field"

            );


        if(

            !wrapper

        ){

            continue;

        }


        if(

            !wrapper.classList.contains(

                "hidden"

            )

        ){

            return input;

        }

    }


    return null;

}

/* =====================================================
   ADD RESULT
===================================================== */

function addResult(

    section,

    sectionElement

){

    const form =

        sectionElement.querySelector(

            ".global-setting-form"

        );


    const result =

        sectionElement.querySelector(

            ".global-setting-result"

        );


    if(

        !form ||

        !result

    ){

        return;

    }


    /* =============================================
       COLLECT
    ============================================= */

    const data =

        collectFormData(

            section,

            form

        );


    if(

        data === null

    ){

        return;

    }


    /* =============================================
       DUPLICATE
    ============================================= */

    if(

        isDuplicate(

            result,

            data,

            section.uniqueFields

        )

    ){

        alert(

            "Rule dengan pilihan yang sama sudah ada."

        );

        return;

    }


    /* =============================================
       CREATE RESULT
    ============================================= */

    const item =

        document.createElement(

            "div"

        );


    item.className =

        "global-setting-result-item";


    item.dataset.value =

        JSON.stringify(

            data

        );


    /* =============================================
       RESULT BODY
    ============================================= */

    const body =

        document.createElement(

            "div"

        );


    body.className =

        "global-setting-result-content";


    /* =============================================
       RESULT FIELDS
    ============================================= */

    if(

        Array.isArray(

            section.fields

        )

    ){

        section.fields.forEach(

            field => {

                /*
                 * Field conditional yang sedang
                 * tidak aktif tidak perlu ditampilkan.
                 */

                if(

                    field.dependsOn &&

                    !Object.prototype.hasOwnProperty.call(

                        data,

                        field.name

                    )

                ){

                    return;

                }


                const row =

                    document.createElement(

                        "div"

                    );


                row.className =

                    "global-setting-result-row";


                const label =

                    document.createElement(

                        "span"

                    );


                label.textContent =

                    field.label ??

                    field.name;


                const value =

                    document.createElement(

                        "strong"

                    );


                value.textContent =

                    formatResultValue(

                        field,

                        data[field.name]

                    );


                row.appendChild(

                    label

                );


                row.appendChild(

                    value

                );


                body.appendChild(

                    row

                );

            }

        );

    }


    item.appendChild(

        body

    );


    /* =============================================
       DELETE
    ============================================= */

    const deleteButton =

        document.createElement(

            "button"

        );


    deleteButton.type =

        "button";


    deleteButton.className =

        "global-setting-result-delete";


    deleteButton.textContent =

        section.deleteLabel ??

        "Hapus";


    deleteButton.addEventListener(

        "click",

        () => {

            item.remove();

        }

    );


    item.appendChild(

        deleteButton

    );


    result.appendChild(

        item

    );


    /* =============================================
       RESET FORM
    ============================================= */

    resetForm(

        section,

        form

    );


    /* =============================================
       AUTO CLOSE FORM
    ============================================= */

    if(

        section.autoCloseForm !== false

    ){

        closeCustomPicker();


        form.classList.add(

            "hidden"

        );


        form.innerHTML = "";

    }

}


/* =====================================================
   COLLECT FORM DATA
===================================================== */

function collectFormData(

    section,

    form

){

    const data = {};


    if(

        !Array.isArray(

            section.fields

        )

    ){

        return data;

    }


    for(

        const field of

            section.fields

    ){

        const input =

            form.querySelector(

                `[name="${escapeSelector(

                    field.name

                )}"]`

            );


        if(

            !input

        ){

            continue;

        }


        /* =========================================
           CONDITIONAL FIELD
        ========================================= */

        if(

            field.dependsOn

        ){

            const controller =

                form.querySelector(

                    `[name="${escapeSelector(

                        field.dependsOn.field

                    )}"]`

                );


            if(

                controller

            ){

                let shouldCollect = false;


                /* =====================================
                   MULTIPLE VALUES
                ===================================== */

                if(

                    Array.isArray(

                        field.dependsOn.values

                    )

                ){

                    shouldCollect =

                        field.dependsOn.values.some(

                            value =>

                                String(

                                    controller.value

                                )

                                ===

                                String(

                                    value

                                )

                        );

                }


                /* =====================================
                   SINGLE VALUE
                ===================================== */

                else if(

                    field.dependsOn.value !== undefined

                ){

                    shouldCollect =

                        String(

                            controller.value

                        )

                        ===

                        String(

                            field.dependsOn.value

                        );

                }


                /* =====================================
                   FIELD TIDAK AKTIF
                ===================================== */

                if(

                    !shouldCollect

                ){

                    continue;

                }

            }

        }


        let value;


        /* =========================================
           CHECKBOX
        ========================================= */

        if(

            field.type ===

            "checkbox"

        ){

            value =

                input.checked;

        }


        /* =========================================
           OTHER
        ========================================= */

        else{

            value =

                input.value.trim();

        }


        /* =========================================
           REQUIRED
        ========================================= */

        if(

            field.required &&

            (

                value === "" ||

                value === null ||

                value === undefined

            )

        ){

            alert(

                `${

                    field.label ??

                    field.name

                } wajib diisi.`

            );


            /*
             * Hidden input dari custom select
             * tidak bisa di-focus seperti field biasa.
             */

            if(

                input.type ===

                "hidden"

            ){

                const wrapper =

                    input.closest(

                        ".global-setting-field"

                    );


                const button =

                    wrapper?.querySelector(

                        ".global-setting-custom-select"

                    );


                if(

                    button

                ){

                    button.focus();

                }

            }

            else{

                input.focus();

            }


            return null;

        }


        data[field.name] =

            value;

    }


    /* =============================================
       NORMALIZE
    ============================================= */

    if(

        typeof section.normalize ===

        "function"

    ){

        return section.normalize(

            data

        );

    }


    return data;

}


/* =====================================================
   DUPLICATE CHECK
===================================================== */

function isDuplicate(

    result,

    data,

    uniqueFields = []

){

    return [

        ...result.children

    ].some(

        item => {

            if(

                !item.dataset.value

            ){

                return false;

            }


            try{

                const existing =

                    JSON.parse(

                        item.dataset.value

                    );


                /* =========================================
                   CUSTOM UNIQUE FIELDS

                   Jika module menentukan uniqueFields,
                   hanya field tersebut yang dibandingkan.
                ========================================= */

                if(

                    Array.isArray(

                        uniqueFields

                    )

                    &&

                    uniqueFields.length > 0

                ){

                    return uniqueFields.every(

                        field =>

                            String(

                                existing[field] ?? ""

                            )

                            ===

                            String(

                                data[field] ?? ""

                            )

                    );

                }


                /* =========================================
                   DEFAULT

                   Jika module tidak menentukan
                   uniqueFields, gunakan perbandingan
                   seluruh data seperti sebelumnya.
                ========================================= */

                return (

                    JSON.stringify(

                        existing

                    )

                    ===

                    JSON.stringify(

                        data

                    )

                );

            }

            catch(error){

                return false;

            }

        }

    );

}


/* =====================================================
   RESET FORM
===================================================== */

function resetForm(

    section,

    form

){

    if(

        !Array.isArray(

            section.fields

        )

    ){

        return;

    }


    section.fields.forEach(

        field => {

            const input =

                form.querySelector(

                    `[name="${escapeSelector(

                        field.name

                    )}"]`

                );


            if(

                !input

            ){

                return;

            }


            if(

                field.type ===

                "checkbox"

            ){

                input.checked =

                    Boolean(

                        field.value

                    );

            }

            else{

                input.value =

                    field.value ??

                    "";

            }


            /* =====================================
               CUSTOM SELECT DISPLAY
            ===================================== */

            if(

                field.type ===

                "select"

            ){

                const button =

                    form.querySelector(

                        `.global-setting-custom-select[data-name="${escapeSelector(

                            field.name

                        )}"]`

                    );


                const valueElement =

                    button?.querySelector(

                        ".global-setting-custom-value"

                    );


                if(

                    valueElement

                ){

                    valueElement.textContent =

                        getOptionLabel(

                            field,

                            input.value

                        )

                        ||

                        field.placeholder

                        ||

                        "Pilih...";

                }


                if(

                    button

                ){

                    button.classList.toggle(

                        "has-value",

                        input.value !== ""

                    );

                }


                /* =====================================
                   RESET SELECT NOTE
                ===================================== */

                const wrapper =

                    button?.closest(

                        ".global-setting-field"

                    );


                const noteElement =

                    wrapper?.querySelector(

                        ".global-setting-field-note"

                    );


                if(

                    noteElement

                ){

                    let resetNote =

                        field.note ??

                        "";


                    if(

                        input.value !== ""

                    ){

                        const options =

                            getFieldOptions(

                                field

                            );


                        if(

                            Array.isArray(

                                options

                            )

                        ){

                            const selectedOption =

                                options.find(

                                    option => {

                                        const optionValue =

                                            typeof option ===

                                            "object"

                                            ?

                                            option.value

                                            :

                                            option;


                                        return (

                                            String(

                                                optionValue

                                            )

                                            ===

                                            String(

                                                input.value

                                            )

                                        );

                                    }

                                );


                            if(

                                selectedOption &&

                                typeof selectedOption ===

                                "object"

                            ){

                                resetNote =

                                    selectedOption.note ||

                                    field.note ||

                                    "";

                            }

                        }

                    }


                    noteElement.textContent =

                        resetNote;

                }

            }

        }

    );


    /* =============================================
       RESET CONDITIONAL STATE
    ============================================= */

    updateConditionalFields(

        form,

        section.fields

    );


    /* =============================================
       FOCUS
    ============================================= */

    const firstVisibleInput =

        getFirstVisibleInput(

            form

        );


    if(

        firstVisibleInput

    ){

        /*
         * Jangan focus hidden input dari
         * custom select.
         */

        if(

            firstVisibleInput.type !==

            "hidden"

        ){

            firstVisibleInput.focus();

        }

    }

}


/* =====================================================
   FORMAT RESULT VALUE
===================================================== */

function formatResultValue(

    field,

    value

){

    if(

        value === undefined ||

        value === null ||

        value === ""

    ){

        return "-";

    }


    /* =============================================
       SELECT
    ============================================= */

    if(

        field.type ===

        "select"

        &&

        Array.isArray(

            field.options

        )

    ){

        return getOptionLabel(

            field,

            value

        );

    }


    /* =============================================
       CHECKBOX
    ============================================= */

    if(

        field.type ===

        "checkbox"

    ){

        return value

            ?

            "Ya"

            :

            "Tidak";

    }


    return value;

}


/* =====================================================
   COLLECT ALL RESULTS
===================================================== */

function collectAllResults(){

    const content =

        document.getElementById(

            "global-setting-content"

        );


    if(

        !content

    ){

        return [];

    }


    const output = [];


    const sections =

        content.querySelectorAll(

            ".global-setting-section"

        );


    sections.forEach(

        sectionElement => {

            const sectionId =

                sectionElement.dataset.section;


            const result =

                sectionElement.querySelector(

                    ".global-setting-result"

                );


            if(

                !result

            ){

                return;

            }


            [

                ...result.children

            ].forEach(

                item => {

                    if(

                        !item.dataset.value

                    ){

                        return;

                    }


                    try{

                        const data =

                            JSON.parse(

                                item.dataset.value

                            );


                        output.push({

                            section :

                                sectionId,

                            data :

                                data

                        });

                    }

                    catch(error){

                        console.error(

                            "Setting result parse error:",

                            error

                        );

                    }

                }

            );

        }

    );


    return output;

}


/* =====================================================
   ESCAPE SELECTOR
===================================================== */

function escapeSelector(

    value

){

    if(

        window.CSS &&

        typeof CSS.escape ===

        "function"

    ){

        return CSS.escape(

            value

        );

    }


    return String(

        value

    )

        .replace(

            /([^\w-])/g,

            "\\$1"

        );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(

    value

){

    return String(

        value ?? ""

    )

        .replace(

            /&/g,

            "&amp;"

        )

        .replace(

            /</g,

            "&lt;"

        )

        .replace(

            />/g,

            "&gt;"

        )

        .replace(

            /"/g,

            "&quot;"

        )

        .replace(

            /'/g,

            "&#039;"

        );

}
