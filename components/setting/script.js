/* =====================================================
   Finance Assistant
   Component    : Global Setting
   File         : script.js
   Version      : 4.4.0

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
   - Dynamic Select
   - Field Note
   - Option Note Override
   - Checkbox Group
   - Collect Input
   - Normalize Input
   - Multiple Result
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
   - financial.js

   New :
   - normalize() boleh menghasilkan object
   - normalize() boleh menghasilkan array object
   - Satu form checkbox dapat menghasilkan
     beberapa result terpisah
   - Result normalized dapat dirender
   - Checkbox yang sudah menjadi result
     tidak dapat dipilih ulang
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

    AirdropSetting

} from "./airdrop.js";


import {

    DailySetting

} from "./daily.js";


import {

    SavingSetting

} from "./saving.js";


import {

    FinancialSetting

} from "./financial.js";


import {

    saveSetting

} from "../../js/write.js";

import {

    Loading

} from "../loading/script.js";



/* =====================================================
   MODULE REGISTRY
===================================================== */

const SETTINGS = {

    "payroll-monthly":

        MonthlySetting,

    "payroll-daily":

        DailySetting,

    "financial":

        FinancialSetting,

    "airdrop":

        AirdropSetting,

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
   CONFIRM LOCK
===================================================== */

let isConfirming = false;



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

                    event.key ===

                    "Escape"

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

async confirm(){

    /* =============================================
       FRONTEND CONFIRM LOCK
       
       Mencegah satu proses confirm dijalankan
       lebih dari satu kali secara bersamaan.
    ============================================= */

    if(

        isConfirming

    ){

        console.warn(

            "SETTING CONFIRM BLOCKED: proses masih berjalan."

        );

        return {

            success :

                false,

            error :

                "Proses penyimpanan masih berjalan."

        };

    }


    /* =============================================
       LOCK
    ============================================= */

    isConfirming =

        true;


    /* =============================================
       LOCK BUTTON
    ============================================= */

    const confirmButton =

        document.getElementById(

            "global-setting-confirm"

        );


    if(

        confirmButton

    ){

        confirmButton.disabled =

            true;


        confirmButton.setAttribute(

            "aria-disabled",

            "true"

        );


        confirmButton.setAttribute(

            "aria-busy",

            "true"

        );

    }

/* =============================================
   SHOW GLOBAL LOADING
============================================= */

await Loading.show();

/*
 * Beri browser kesempatan untuk
 * merender fullscreen loading terlebih dahulu.
 */
await new Promise(

    resolve =>

        requestAnimationFrame(

            resolve

        )

);


/* =============================================
   PROCESS
============================================= */

try{

        closeCustomPicker();


        /* =============================================
           COLLECT RESULT
        ============================================= */

        const data =

            collectAllResults();


        /* =============================================
           FINANCIAL AUTO RULE
        ============================================= */

        if(

            currentWorkspace ===

            "financial"

        ){

            applyFinancialAutoRules(

                data

            );

        }


        /* =============================================
           PAYROLL MONTHLY AUTO RULE
        ============================================= */

        if(

            currentWorkspace ===

            "payroll-monthly"

        ){

            applyMonthlyAutoRules(

                data

            );

        }


        /* =============================================
           DEBUG
        ============================================= */

        console.log(

            "SETTING CONFIRM",

            {

                workspace :

                    currentWorkspace,

                data :

                    data

            }

        );


        /* =============================================
           SEND TO APPS SCRIPT
        ============================================= */

        const result =

            await saveSetting(

                currentWorkspace,

                data

            );


        console.log(

            "SETTING SAVE RESULT",

            result

        );


/* =========================================
   SUCCESS
========================================= */

if(

    result?.success === true

){

    /* =====================================
       CLOSE SETTING
    ===================================== */

    Setting.close();


    /* =====================================
       HIDE LOADING
       
       Save sudah benar-benar berhasil.
       Setelah ini user kembali melihat Home.
    ===================================== */

    Loading.hide();


    return result;

}


        /* =========================================
           BACKEND ERROR
        ========================================= */

        throw new Error(

            result?.error

            ||

            result?.message

            ||

            "Gagal menyimpan pengaturan."

        );

    }

    catch(error){

        console.error(

            "SETTING SAVE ERROR:",

            error

        );

       Loading.hide();


        alert(

            "Gagal menyimpan pengaturan:\n" +

            error.message

        );


        return {

            success :

                false,

            error :

                error.message

        };

    }

    finally{

        /* =============================================
           UNLOCK
           
           Selalu dijalankan:
           - berhasil
           - backend error
           - exception
        ============================================= */

        isConfirming =

            false;


        /* =============================================
           ENABLE BUTTON
        ============================================= */

        if(

            confirmButton

        ){

            confirmButton.disabled =

                false;


            confirmButton.removeAttribute(

                "aria-disabled"

            );


            confirmButton.removeAttribute(

                "aria-busy"

            );

        }

    }

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

        <div class="global-setting-section-header">

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


        <div class="global-setting-form hidden">

        </div>


        <button
            type="button"
            class="global-setting-add">

            ${escapeHTML(

                section.addLabel ??

                "＋ Tambah"

            )}

        </button>


        <div class="global-setting-result">

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
       CLOSE
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
       OPEN
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
       VALIDATE
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
       CONDITIONAL
    ============================================= */

    bindConditionalFields(

        form,

        section.fields

    );


    /* =============================================
       DYNAMIC SELECT
    ============================================= */

    bindDynamicSelects(

        form,

        section.fields

    );


    /* =============================================
       PREVENT DUPLICATE CHECKBOX
    ============================================= */

    if(

        section.inputMode ===

        "checkbox-group"

    ){

        applyUsedCheckboxState(

            section,

            sectionElement,

            form

        );

    }


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
       MODULE HOOK
    ============================================= */

    if(

        typeof section.onRender ===

        "function"

    ){

        section.onRender(

            form,

            sectionElement

        );

    }


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
   APPLY USED CHECKBOX STATE
===================================================== */

function applyUsedCheckboxState(

    section,

    sectionElement,

    form

){

    const result =

        sectionElement.querySelector(

            ".global-setting-result"

        );


    if(

        !result

    ){

        return;

    }


    const usedNames =

        new Set();


    /* =============================================
       READ EXISTING RESULTS
    ============================================= */

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


                /* =================================
                   nama
                ================================= */

                if(

                    data &&

                    data.nama !== undefined

                ){

                    usedNames.add(

                        normalizeCompareValue(

                            data.nama

                        )

                    );

                }


                /* =================================
                   resultName
                ================================= */

                if(

                    data &&

                    data.resultName !== undefined

                ){

                    usedNames.add(

                        normalizeCompareValue(

                            data.resultName

                        )

                    );

                }

            }

            catch(error){

                console.warn(

                    "Checkbox result parse error:",

                    error

                );

            }

        }

    );


    /* =============================================
       DISABLE USED CHECKBOX
    ============================================= */

    section.fields.forEach(

        field => {

            if(

                field.type !==

                "checkbox"

            ){

                return;

            }


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


            const resultName =

                field.resultName ??

                field.label ??

                field.name;


            const used =

                usedNames.has(

                    normalizeCompareValue(

                        resultName

                    )

                );


            if(

                used

            ){

                input.disabled =

                    true;


                const wrapper =

                    input.closest(

                        ".global-setting-field"

                    );


                if(

                    wrapper

                ){

                    wrapper.classList.add(

                        "is-used"

                    );

                }

            }

        }

    );

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


    if(

        field.type ===

        "checkbox"

    ){

        wrapper.classList.add(

            "global-setting-checkbox-field"

        );

    }


    wrapper.dataset.field =

        field.name;


    /* =============================================
       ACTIVITY RULE
    ============================================= */

    if(

        field.activityRule

    ){

        wrapper.dataset.activityRule =

            field.activityRule;

    }


    /* =============================================
       CONDITIONAL
    ============================================= */

    if(

        field.dependsOn

    ){

        wrapper.dataset.dependsOnField =

            field.dependsOn.field;


        if(

            field.dependsOn.value !== undefined

        ){

            wrapper.dataset.dependsOnValue =

                field.dependsOn.value;

        }

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
    ============================================= */

    if(

        field.type ===

        "select"

    ){

        renderCustomSelect(

            wrapper,

            field

        );


        const note =

            document.createElement(

                "small"

            );


        note.className =

            "global-setting-field-note";


        note.textContent =

            getOptionNote(

                field,

                field.value

            );


        wrapper.appendChild(

            note

        );


        container.appendChild(

            wrapper

        );


        return;

    }


    /* =============================================
       INPUT
    ============================================= */

    let input;


    if(

        field.type ===

        "textarea"

    ){

        input =

            document.createElement(

                "textarea"

            );

    }

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
       ATTRIBUTES
    ============================================= */

    applyFieldAttributes(

        input,

        field

    );


    /* =============================================
       CHECKBOX
       
       Untuk checkbox ber-logo, input tetap
       berada di dalam wrapper agar CSS dapat
       mengatur layout.
    ============================================= */

    wrapper.appendChild(

        input

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

        )

        ||

        field.placeholder

        ||

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
       OPEN
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


    const picker =

        document.createElement(

            "div"

        );


    picker.className =

        "global-setting-picker";


    picker.innerHTML =

    `

        <div class="global-setting-picker-backdrop">

        </div>


        <div class="global-setting-picker-panel">

            <div class="global-setting-picker-header">

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


            <div class="global-setting-picker-list">

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

                    <span class="global-setting-picker-option-label">

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
       CLOSE
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


    /* =============================================
       LABEL
    ============================================= */

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
       NOTE
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

        let optionNote =

            "";


        if(

            option &&

            typeof option ===

            "object"

        ){

            optionNote =

                option.note ??

                "";

        }


        noteElement.textContent =

            optionNote ||

            field.note ||

            "";

    }


    /* =============================================
       STATE
    ============================================= */

    button.classList.add(

        "has-value"

    );


    /* =============================================
       CHANGE
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


    const options =

        getFieldOptions(

            field

        );


    if(

        !Array.isArray(

            options

        )

    ){

        return value;

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
   GET OPTION NOTE
===================================================== */

function getOptionNote(

    field,

    value

){

    if(

        value === undefined ||

        value === null ||

        value === ""

    ){

        return (

            field.note ??

            ""

        );

    }


    const options =

        getFieldOptions(

            field

        );


    if(

        !Array.isArray(

            options

        )

    ){

        return (

            field.note ??

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


    if(

        option &&

        typeof option ===

        "object" &&

        option.note

    ){

        return option.note;

    }


    return (

        field.note ??

        ""

    );

}



/* =====================================================
   GET FIELD OPTIONS
===================================================== */

function getFieldOptions(

    field

){

    /* =============================================
       STATIC
    ============================================= */

    if(

        Array.isArray(

            field.options

        )

    ){

        return field.options;

    }


    /* =============================================
       DYNAMIC
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


            let shouldShow =

                false;


            /* =====================================
               MULTIPLE
            ===================================== */

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


            /* =====================================
               SINGLE
            ===================================== */

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


            /* =====================================
               SHOW
            ===================================== */

            if(

                shouldShow

            ){

                wrapper.classList.remove(

                    "hidden"

                );

            }


            /* =====================================
               HIDE
            ===================================== */

            else{

                wrapper.classList.add(

                    "hidden"

                );


                const input =

                    wrapper.querySelector(

                        "input:not([type='hidden']), select, textarea"

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


                /* =================================
                   RESET CUSTOM SELECT
                ================================= */

                const hidden =

                    wrapper.querySelector(

                        "input[type='hidden']"

                    );


                const button =

                    wrapper.querySelector(

                        ".global-setting-custom-select"

                    );


                if(

                    hidden

                ){

                    hidden.value =

                        "";

                }


                if(

                    button

                ){

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

                            "Pilih...";

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

            "input, select, textarea, button.global-setting-custom-select"

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

            if(

                input.type ===

                "hidden"

            ){

                continue;

            }


            if(

                input.disabled

            ){

                continue;

            }


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
       NORMALIZE RESULT
       
       Bisa:
       
       object
       atau
       array object
    ============================================= */

    const normalizedResults =

        Array.isArray(

            data

        )

            ?

        data

            :

        [

            data

        ];


    /* =============================================
       VALIDATE NORMALIZED RESULT
    ============================================= */

    const validResults =

        normalizedResults.filter(

            item =>

                item &&

                typeof item ===

                "object"

        );


    if(

        validResults.length === 0

    ){

        alert(

            "Tidak ada data yang dapat ditambahkan."

        );

        return;

    }


    /* =============================================
       DEBUG
    ============================================= */

    console.log(

        "SETTING ADD RESULT",

        {

            section :

                section.id,

            data :

                data,

            normalized :

                validResults

        }

    );


    /* =============================================
       CHECK DUPLICATE
       
       Cek SEMUA result sebelum menambahkan.
       
       Jika salah satu duplicate,
       seluruh proses dibatalkan.
    ============================================= */

    for(

        const normalizedData of

            validResults

    ){

        if(

            isDuplicate(

                result,

                normalizedData,

                section.uniqueFields

            )

        ){

            alert(

                "Rule dengan pilihan yang sama sudah ada."

            );

            return;

        }

    }


    /* =============================================
       CREATE ALL RESULTS
    ============================================= */

    validResults.forEach(

        normalizedData => {

            createResultItem(

                section,

                sectionElement,

                result,

                normalizedData

            );

        }

    );


    /* =============================================
       RESET FORM
    ============================================= */

    resetForm(

        section,

        form

    );


    /* =============================================
       AUTO CLOSE
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
   CREATE RESULT ITEM
===================================================== */

function createResultItem(

    section,

    sectionElement,

    result,

    data

){

    /* =============================================
       ITEM
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
       RESULT CONTENT
    ============================================= */

    const body =

        document.createElement(

            "div"

        );


    body.className =

        "global-setting-result-content";


    renderResultBody(

        section,

        data,

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

        body

    );


    item.appendChild(

        deleteButton

    );


    result.appendChild(

        item

    );

}



/* =====================================================
   RENDER RESULT BODY
===================================================== */

function renderResultBody(

    section,

    data,

    body

){

    let rendered =

        false;


    /* =============================================
       NORMAL FIELD MAPPING
       
       Digunakan module lama.
       
       Contoh:
       
       data = {
           activity : "gaji"
       }
    ============================================= */

    if(

        Array.isArray(

            section.fields

        )

    ){

        section.fields.forEach(

            field => {

                if(

                    !Object.prototype.hasOwnProperty.call(

                        data,

                        field.name

                    )

                ){

                    return;

                }


                /* =================================
                   CONDITIONAL HIDDEN
                ================================= */

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


                label.className =

                    "global-setting-result-label";


                label.textContent =

                    field.resultLabel ??

                    field.label ??

                    field.name;


                const value =

                    document.createElement(

                        "strong"

                    );


                value.className =

                    "global-setting-result-value";


                value.textContent =

                    formatResultValue(

                        field,

                        data[field.name],

                        data

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


                rendered =

                    true;

            }

        );

    }


    /* =============================================
       NORMALIZED OBJECT FALLBACK
       
       Penting untuk Saving:
       
       normalize()
       ↓
       {
           nama : "Mandiri"
       }
       
       Karena "nama" bukan field checkbox,
       controller tetap harus bisa merendernya.
    ============================================= */

    if(

        !rendered &&

        data &&

        typeof data ===

            "object"

    ){

        Object.entries(

            data

        ).forEach(

            ([key, value]) => {

                /* =================================
                   INTERNAL DATA
                ================================= */

                if(

                    key.startsWith(

                        "__"

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


                label.className =

                    "global-setting-result-label";


                label.textContent =

                    formatResultKey(

                        key

                    );


                const resultValue =

                    document.createElement(

                        "strong"

                    );


                resultValue.className =

                    "global-setting-result-value";


                resultValue.textContent =

                    formatGenericResultValue(

                        value

                    );


                row.appendChild(

                    label

                );


                row.appendChild(

                    resultValue

                );


                body.appendChild(

                    row

                );


                rendered =

                    true;

            }

        );

    }


    /* =============================================
       FALLBACK
    ============================================= */

    if(

        !rendered

    ){

        const emptyRow =

            document.createElement(

                "div"

            );


        emptyRow.className =

            "global-setting-result-row";


        emptyRow.textContent =

            "Data pengaturan";


        body.appendChild(

            emptyRow

        );

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
           CONDITIONAL
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

                let shouldCollect =

                    false;


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

                String(

                    input.value ?? ""

                ).trim();

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

                                existing[field] ??

                                ""

                            )

                            ===

                            String(

                                data[field] ??

                                ""

                            )

                    );

                }


                /* =========================================
                   DEFAULT
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


            /* =========================================
               CHECKBOX
            ========================================= */

            if(

                field.type ===

                "checkbox"

            ){

                input.checked =

                    Boolean(

                        field.value

                    );

            }


            /* =========================================
               OTHER
            ========================================= */

            else{

                input.value =

                    field.value ??

                    "";

            }


            /* =========================================
               SELECT
            ========================================= */

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


                const noteElement =

                    button?.closest(

                        ".global-setting-field"

                    )?.querySelector(

                        ".global-setting-field-note"

                    );


                if(

                    noteElement

                ){

                    noteElement.textContent =

                        getOptionNote(

                            field,

                            input.value

                        );

                }

            }

        }

    );


    /* =============================================
       CONDITIONAL
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

        firstVisibleInput &&

        firstVisibleInput.type !==

            "hidden"

    ){

        firstVisibleInput.focus();

    }

}



/* =====================================================
   FORMAT RESULT VALUE
===================================================== */

function formatResultValue(

    field,

    value,

    data

){

    /* =============================================
       FINANCIAL DISPLAY
    ============================================= */

    if(

        field.type ===

        "checkbox" &&

        data?.__display &&

        Object.prototype.hasOwnProperty.call(

            data.__display,

            field.name

        )

    ){

        return data.__display[field.name]

            ?

            "Ya"

            :

            "Tidak";

    }


    /* =============================================
       CHECKBOX ARRAY
    ============================================= */

    if(

        field.type ===

        "checkbox" &&

        Array.isArray(

            data

        ) &&

        field.resultValue &&

        field.resultTarget

    ){

        const active =

            data.some(

                item =>

                    item &&

                    item.target ===

                        field.resultTarget &&

                    item.type ===

                        field.resultValue

            );


        return active

            ?

            "Ya"

            :

            "Tidak";

    }


    /* =============================================
       RESULT VALUE
    ============================================= */

    if(

        field.resultValue

    ){

        const resultSource =

            field.resultField

                ?

            data?.[

                field.resultField

            ]

                :

            data?.waktu;


        const values =

            String(

                resultSource ?? ""

            )

            .split(",")

            .map(

                item =>

                    item.trim()

            )

            .filter(

                Boolean

            );


        return values.includes(

            String(

                field.resultValue

            )

        )

            ?

            "Ya"

            :

            "Tidak";

    }


    /* =============================================
       EMPTY
    ============================================= */

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
   FORMAT GENERIC RESULT VALUE
===================================================== */

function formatGenericResultValue(

    value

){

    if(

        value === undefined ||

        value === null ||

        value === ""

    ){

        return "-";

    }


    if(

        typeof value ===

        "boolean"

    ){

        return value

            ?

            "Ya"

            :

            "Tidak";

    }


    if(

        Array.isArray(

            value

        )

    ){

        return value.join(

            ", "

        );

    }


    if(

        typeof value ===

        "object"

    ){

        return JSON.stringify(

            value

        );

    }


    return String(

        value

    );

}



/* =====================================================
   FORMAT RESULT KEY
===================================================== */

function formatResultKey(

    key

){

    const labels = {

        nama :

            "Nama",

        activity :

            "Aktivitas",

        type :

            "Tipe",

        rules :

            "Rule",

        waktu :

            "Waktu",

        kondisi :

            "Kondisi",

        nominal :

            "Nominal",

        nama_bank :

            "Nama Bank"

    };


    if(

        labels[key]

    ){

        return labels[key];

    }


    return String(

        key

    )

        .replace(

            /_/g,

            " "

        )

        .replace(

            /\b\w/g,

            char =>

                char.toUpperCase()

        );

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
   NORMALIZE COMPARE VALUE
===================================================== */

function normalizeCompareValue(

    value

){

    return String(

        value ?? ""

    )

        .trim()

        .toLowerCase();

}



/* =====================================================
   FINANCIAL AUTO RULE
===================================================== */

function applyFinancialAutoRules(

    data

){

    if(

        !Array.isArray(

            data

        )

    ){

        return;

    }


    const ruleItem =

        data.find(

            item =>

                item.section ===

                "financial_rules"

        );


    if(

        !ruleItem ||

        !ruleItem.data

    ){

        return;

    }


    const rules =

        ruleItem.data;


    /* =============================================
       PEMASUKAN
    ============================================= */

    const pemasukanItem =

        data.find(

            item =>

                item.section ===

                "financial_activity_pemasukan"

        );


    const pemasukanActivity =

        pemasukanItem?.data?.activity ??

        "";


    /* =============================================
       PENGELUARAN
    ============================================= */

    const pengeluaranItem =

        data.find(

            item =>

                item.section ===

                "financial_activity_pengeluaran"

        );


    const pengeluaranActivity =

        pengeluaranItem?.data?.activity ??

        "";


    /* =============================================
       RULE HUTANG
    ============================================= */

    if(

        rules.gunakanRuleHutang ===

        true

    ){

        data.push({

            section :

                "financial_auto_rule_hutang",

            data : {

                rules :

                    "rule_hutang",

                type :

                    "hutang,bayar",

                activity :

                    "hutang_piutang"

            }

        });

    }


    /* =============================================
       RULE TABUNGAN
    ============================================= */

    if(

        rules.gunakanRuleTabungan ===

        true

    ){

        const tabunganActivity = [

            ...new Set(

                (

                    pemasukanActivity

                    +

                    ","

                    +

                    pengeluaranActivity

                )

                .split(",")

                .map(

                    item =>

                        item.trim()

                )

                .filter(

                    item =>

                        item ===

                            "dana_darurat"

                        ||

                        item ===

                            "tabungan_kaleng"

                )

            )

        ];


        if(

            tabunganActivity.length > 0

        ){

            data.push({

                section :

                    "financial_auto_rule_tabungan",

                data : {

                    rules :

                        "rule_tabungan",

                    type :

                        "nabung,tarik",

                    activity :

                        tabunganActivity.join(",")

                }

            });

        }

    }


    console.log(

        "FINANCIAL AUTO RULE",

        {

            rules :

                rules,

            pemasukan :

                pemasukanActivity,

            pengeluaran :

                pengeluaranActivity

        }

    );

}



/* =====================================================
   FINANCIAL SELECTED ACTIVITIES
===================================================== */

function getFinancialSelectedActivities(

    data

){

    const activities =

        new Set();


    const pemasukan =

        data.find(

            item =>

                item.section ===

                "financial_activity_pemasukan"

        );


    if(

        pemasukan?.data?.activity

    ){

        String(

            pemasukan.data.activity

        )

        .split(",")

        .map(

            item =>

                item.trim()

        )

        .filter(Boolean)

        .forEach(

            item => {

                activities.add(

                    item

                );

            }

        );

    }


    const pengeluaran =

        data.find(

            item =>

                item.section ===

                "financial_activity_pengeluaran"

        );


    if(

        pengeluaran?.data?.activity

    ){

        String(

            pengeluaran.data.activity

        )

        .split(",")

        .map(

            item =>

                item.trim()

        )

        .filter(Boolean)

        .forEach(

            item => {

                activities.add(

                    item

                );

            }

        );

    }


    return [

        ...activities

    ];

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



/* =====================================================
   APPLY MONTHLY AUTO RULES
===================================================== */

function applyMonthlyAutoRules(

    data

){

    const setting =

        data.find(

            item =>

                item &&

                item.section ===

                    "monthly_rules"

        );


    if(

        !setting ||

        !setting.data

    ){

        return;

    }


    const gunakanRuleShift =

        Boolean(

            setting.data.gunakanRuleShift

        );


    if(

        !gunakanRuleShift

    ){

        return;

    }


    const ruleShift = {

        type_rule :

            "rule_shift",

        nama :

            "shift",

        kondisi :

            "masuk",

        waktu :

            "pagi,siang,malam",

        nominal :

            "",

        nilai_start :

            "",

        nilai_end :

            "",

        berlaku_start :

            "",

        berlaku_end :

            ""

    };


    const alreadyExists =

        data.some(

            item =>

                item &&

                item.data &&

                item.data.type_rule ===

                    "rule_shift"

        );


    if(

        alreadyExists

    ){

        return;

    }


    data.push({

        section :

            "rule_shift",

        data :

            ruleShift

    });

}
