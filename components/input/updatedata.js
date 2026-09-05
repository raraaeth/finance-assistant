/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : updatedata.js
   Version      : 1.2.0

   Description :
   Reusable Global Update Data Engine

   Handles :
   - Full screen edit overlay
   - Direct record card list
   - Search
   - Internal record list scrolling
   - Selected record detail
   - Dynamic edit fields
   - Temporary pending changes
   - Remove pending change
   - Batch confirmation
   - Loading state
   - Result state

   Architecture :
   - Workspace agnostic
   - No Apps Script logic
   - No Spreadsheet logic
   - No Airdrop logic
   - Business logic supplied by adapter

   UI Concept :
   - Tidak menggunakan picker / dropdown record
   - Daftar record langsung tampil
   - Search berada di atas daftar
   - User klik card untuk memilih record
   - Detail + field edit muncul setelah record dipilih
   - Tambahkan hanya melakukan staging
   - Konfirmasi melakukan batch confirmation
===================================================== */


/* =====================================================
   STATE
===================================================== */

let overlay = null;

let initialized = false;

let currentOptions = {};

let currentRecords = [];

let selectedRecord = null;

let pendingChanges = [];

let isBusy = false;


/* =====================================================
   CONSTANTS
===================================================== */

const DEFAULTS = {

    title :
        "Edit Input",

    subtitle :
        "Ubah data yang sudah tersimpan",

    listTitle :
        "Daftar Data",

    searchPlaceholder :
        "Cari data...",

    emptyText :
        "Tidak ada data yang tersedia.",

    addText :
        "Tambahkan",

    confirmText :
        "Konfirmasi",

    removeText :
        "Hapus",

    pendingTitle :
        "Sudah Ditambahkan",

    addedText :
        "Data berhasil ditambahkan.",

    duplicateText :
        "Data ini sudah ditambahkan.",

    confirmLoadingText :
        "Menyimpan perubahan...",

    closeOnEscape :
        true,

    lockBody :
        true

};


/* =====================================================
   DOM HELPERS
===================================================== */

function getElement(id){

    return document.getElementById(id);

}


function createElement(

    tag,

    className = "",

    text = ""

){

    const element =

        document.createElement(

            tag

        );


    if(

        className

    ){

        element.className =

            className;

    }


    if(

        text !== ""

    ){

        element.textContent =

            safeText(

                text

            );

    }


    return element;

}


/* =====================================================
   SAFE TEXT
===================================================== */

function safeText(

    value

){

    if(

        value === null ||

        value === undefined

    ){

        return "";

    }


    if(

        typeof value === "string" ||

        typeof value === "number" ||

        typeof value === "boolean"

    ){

        return String(

            value

        );

    }


    try{

        return JSON.stringify(

            value

        );

    }

    catch{

        return String(

            value

        );

    }

}


/* =====================================================
   VALUE HELPERS
===================================================== */

function isElement(

    value

){

    return (

        typeof HTMLElement !== "undefined" &&

        value instanceof HTMLElement

    );

}


function normalizeBoolean(

    value,

    fallback = false

){

    if(

        value === undefined ||

        value === null

    ){

        return fallback;

    }


    if(

        typeof value === "boolean"

    ){

        return value;

    }


    const normalized =

        String(

            value

        )

        .trim()

        .toLowerCase();


    if(

        normalized === "true" ||

        normalized === "1" ||

        normalized === "yes"

    ){

        return true;

    }


    if(

        normalized === "false" ||

        normalized === "0" ||

        normalized === "no"

    ){

        return false;

    }


    return fallback;

}


/* =====================================================
   IDENTITY
===================================================== */

function getRecordId(

    record

){

    if(

        !record

    ){

        return "";

    }


    if(

        typeof currentOptions.getRecordId ===

        "function"

    ){

        try{

            const result =

                currentOptions.getRecordId(

                    record

                );


            return safeText(

                result

            );

        }

        catch(error){

            console.warn(

                "[UpdateData] getRecordId failed:",

                error

            );

        }

    }


    const candidates = [

        record.id,

        record.ID,

        record.Id,

        record.key,

        record._id

    ];


    for(

        const value of candidates

    ){

        if(

            value !== null &&

            value !== undefined &&

            value !== ""

        ){

            return safeText(

                value

            );

        }

    }


    try{

        return JSON.stringify(

            record

        );

    }

    catch{

        return String(

            record

        );

    }

}


/* =====================================================
   RECORD LABEL
===================================================== */

function getRecordLabel(

    record

){

    if(

        !record

    ){

        return "";

    }


    if(

        typeof currentOptions.getRecordLabel ===

        "function"

    ){

        try{

            return safeText(

                currentOptions.getRecordLabel(

                    record

                )

            );

        }

        catch(error){

            console.warn(

                "[UpdateData] getRecordLabel failed:",

                error

            );

        }

    }


    const candidates = [

        record.project,

        record.Project,

        record.nama,

        record.name,

        record.title,

        record.id,

        record.ID

    ];


    for(

        const value of candidates

    ){

        if(

            value !== null &&

            value !== undefined &&

            value !== ""

        ){

            return safeText(

                value

            );

        }

    }


    return "Data";

}


/* =====================================================
   RECORD META
===================================================== */

function getRecordMeta(

    record

){

    if(

        !record

    ){

        return "";

    }


    if(

        typeof currentOptions.getRecordMeta ===

        "function"

    ){

        try{

            return safeText(

                currentOptions.getRecordMeta(

                    record

                )

            );

        }

        catch(error){

            console.warn(

                "[UpdateData] getRecordMeta failed:",

                error

            );

        }

    }


    const values = [];


    if(

        record.type !== undefined &&

        record.type !== null &&

        record.type !== ""

    ){

        values.push(

            record.type

        );

    }


    if(

        record.status !== undefined &&

        record.status !== null &&

        record.status !== ""

    ){

        values.push(

            record.status

        );

    }


    return values

        .map(

            value =>

                safeText(

                    value

                )

        )

        .filter(

            Boolean

        )

        .join(

            " · "

        );

}


/* =====================================================
   RECORD KEY
===================================================== */

function makeRecordKey(

    record

){

    return getRecordId(

        record

    );

}


/* =====================================================
   NORMALIZE RECORDS
===================================================== */

function normalizeRecords(

    records

){

    if(

        !Array.isArray(

            records

        )

    ){

        return [];

    }


    return records.filter(

        record =>

            record !== null &&

            record !== undefined

    );

}


/* =====================================================
   NORMALIZE PENDING
===================================================== */

function normalizePending(

    pending

){

    if(

        !Array.isArray(

            pending

        )

    ){

        return [];

    }


    return pending.filter(

        item =>

            item !== null &&

            item !== undefined

    );

}


/* =====================================================
   OPTION GETTER
===================================================== */

function getOption(

    name

){

    if(

        currentOptions &&

        currentOptions[name] !== undefined

    ){

        return currentOptions[name];

    }


    return DEFAULTS[name];

}


/* =====================================================
   AVAILABLE RECORDS
===================================================== */

function getAvailableRecords(){

    const pendingKeys =

        new Set(

            pendingChanges.map(

                item =>

                    item.key

            )

        );


    return currentRecords.filter(

        record => {

            const key =

                makeRecordKey(

                    record

                );


            return !pendingKeys.has(

                key

            );

        }

    );

}


/* =====================================================
   SEARCH FILTER
===================================================== */

function getFilteredRecords(){

    const search =

        overlay?.querySelector(

            '[data-role="record-search"]'

        );


    const query =

        safeText(

            search?.value

        )

        .trim()

        .toLowerCase();


    return getAvailableRecords()

        .filter(

            record => {

                if(

                    !query

                ){

                    return true;

                }


                const label =

                    getRecordLabel(

                        record

                    )

                    .toLowerCase();


                const meta =

                    getRecordMeta(

                        record

                    )

                    .toLowerCase();


                const id =

                    getRecordId(

                        record

                    )

                    .toLowerCase();


                return (

                    label.includes(

                        query

                    )

                    ||

                    meta.includes(

                        query

                    )

                    ||

                    id.includes(

                        query

                    )

                );

            }

        );

}


/* =====================================================
   CREATE OVERLAY
===================================================== */

function createOverlay(){

    if(

        overlay

    ){

        return overlay;

    }


    overlay =

        createElement(

            "div",

            "global-update-data-overlay"

        );


    overlay.id =

        "global-update-data-overlay";


    overlay.innerHTML = `

        <div
            class="global-update-data-backdrop"
            data-role="backdrop"
        ></div>


        <div
            class="global-update-data-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="global-update-data-title"
        >


            <!-- HEADER -->

            <div
                class="global-update-data-header"
            >

                <div
                    class="global-update-data-heading"
                >

                    <h2
                        id="global-update-data-title"
                    >
                        Edit Input
                    </h2>


                    <span
                        id="global-update-data-subtitle"
                    >
                        Ubah data yang sudah tersimpan
                    </span>

                </div>


                <button
                    type="button"
                    class="global-update-data-close"
                    data-role="close"
                    aria-label="Tutup"
                >
                    ×
                </button>

            </div>


            <!-- CONTENT -->

            <div
                class="global-update-data-content"
            >


                <!-- RECORD LIST -->

                <section
                    class="global-update-data-record-section"
                    data-role="record-section"
                >

                    <div
                        class="global-update-data-record-header"
                    >

                        <h3
                            class="global-update-data-record-title"
                            data-role="record-title"
                        >
                            Daftar Data
                        </h3>

                    </div>


                    <div
                        class="global-update-data-record-search-wrap"
                    >

                        <span
                            class="global-update-data-record-search-icon"
                            aria-hidden="true"
                        >
                            🔎
                        </span>


                        <input
                            type="search"
                            class="global-update-data-record-search"
                            data-role="record-search"
                            autocomplete="off"
                            spellcheck="false"
                        />

                    </div>


                    <div
                        class="global-update-data-record-list"
                        data-role="record-list"
                    ></div>

                </section>


                <!-- DETAIL -->

                <section
                    class="global-update-data-detail hidden"
                    data-role="detail"
                ></section>


                <!-- FIELDS -->

                <section
                    class="global-update-data-fields hidden"
                    data-role="fields"
                ></section>


                <!-- ADD -->

                <div
                    class="global-update-data-action hidden"
                    data-role="action"
                >

                    <button
                        type="button"
                        class="global-update-data-add"
                        data-role="add"
                        disabled
                    >
                        Tambahkan
                    </button>

                </div>


                <!-- PENDING -->

                <section
                    class="global-update-data-pending hidden"
                    data-role="pending"
                >

                    <div
                        class="global-update-data-pending-header"
                    >

                        <h3
                            data-role="pending-title"
                        >
                            Sudah Ditambahkan
                        </h3>


                        <span
                            class="global-update-data-pending-count"
                            data-role="pending-count"
                        >
                            0
                        </span>

                    </div>


                    <div
                        class="global-update-data-pending-list"
                        data-role="pending-list"
                    ></div>

                </section>


                <!-- RESULT -->

                <div
                    class="global-update-data-result hidden"
                    data-role="result"
                ></div>


            </div>


            <!-- CONFIRM -->

            <div
                class="global-update-data-confirm hidden"
                data-role="confirm-container"
            >

                <button
                    type="button"
                    data-role="confirm"
                    disabled
                >
                    Konfirmasi
                </button>

            </div>


        </div>
    `;


    document.body.appendChild(

        overlay

    );


    bindEvents();


    return overlay;

}


/* =====================================================
   BIND EVENTS
===================================================== */

function bindEvents(){

    if(

        !overlay

    ){

        return;

    }


    const closeButton =

        overlay.querySelector(

            '[data-role="close"]'

        );


    const backdrop =

        overlay.querySelector(

            '[data-role="backdrop"]'

        );


    const search =

        overlay.querySelector(

            '[data-role="record-search"]'

        );


    const addButton =

        overlay.querySelector(

            '[data-role="add"]'

        );


    const confirmButton =

        overlay.querySelector(

            '[data-role="confirm"]'

        );


    closeButton?.addEventListener(

        "click",

        () => {

            UpdateData.close();

        }

    );


    backdrop?.addEventListener(

        "click",

        () => {

            if(

                currentOptions.allowBackdropClose ===

                false

            ){

                return;

            }


            UpdateData.close();

        }

    );


    search?.addEventListener(

        "input",

        () => {

            renderRecordList();

        }

    );


    addButton?.addEventListener(

        "click",

        () => {

            UpdateData.add();

        }

    );


    confirmButton?.addEventListener(

        "click",

        () => {

            UpdateData.confirm();

        }

    );


    document.addEventListener(

        "keydown",

        handleKeydown

    );

}


/* =====================================================
   KEYBOARD
===================================================== */

function handleKeydown(

    event

){

    if(

        !overlay

    ){

        return;

    }


    if(

        !overlay.classList.contains(

            "is-open"

        )

    ){

        return;

    }


    if(

        event.key === "Escape" &&

        getOption(

            "closeOnEscape"

        ) !== false

    ){

        UpdateData.close();

    }

}


/* =====================================================
   RECORD LIST
===================================================== */

function renderRecordList(){

    const list =

        overlay?.querySelector(

            '[data-role="record-list"]'

        );


    if(

        !list

    ){

        return;

    }


    const records =

        getFilteredRecords();


    list.innerHTML = "";


    if(

        !records.length

    ){

        const search =

            overlay?.querySelector(

                '[data-role="record-search"]'

            );


        const query =

            safeText(

                search?.value

            )

            .trim();


        const empty =

            createElement(

                "div",

                "global-update-data-empty",

                query

                    ? "Data tidak ditemukan."

                    : getOption(

                        "emptyText"

                    )

            );


        list.appendChild(

            empty

        );


        return;

    }


    records.forEach(

        record => {

            const item =

                createElement(

                    "button",

                    "global-update-data-record-item"

                );


            item.type =

                "button";


            const key =

                makeRecordKey(

                    record

                );


            item.dataset.key =

                key;


            if(

                selectedRecord &&

                makeRecordKey(

                    selectedRecord

                ) === key

            ){

                item.classList.add(

                    "selected"

                );

                item.setAttribute(

                    "aria-current",

                    "true"

                );

            }


            const content =

                createElement(

                    "div",

                    "global-update-data-record-item-content"

                );


            const title =

                createElement(

                    "strong",

                    "global-update-data-record-item-title",

                    getRecordLabel(

                        record

                    )

                );


            content.appendChild(

                title

            );


            const metaText =

                getRecordMeta(

                    record

                );


            if(

                metaText

            ){

                const meta =

                    createElement(

                        "span",

                        "global-update-data-record-item-meta",

                        metaText

                    );


                content.appendChild(

                    meta

                );

            }


            const id =

                getRecordId(

                    record

                );


            if(

                id

            ){

                const idElement =

                    createElement(

                        "span",

                        "global-update-data-record-item-id",

                        id

                    );


                content.appendChild(

                    idElement

                );

            }


            const arrow =

                createElement(

                    "span",

                    "global-update-data-record-item-arrow",

                    "›"

                );


            arrow.setAttribute(

                "aria-hidden",

                "true"

            );


            item.appendChild(

                content

            );


            item.appendChild(

                arrow

            );


            item.addEventListener(

                "click",

                () => {

                    if(

                        isBusy

                    ){

                        return;

                    }


                    UpdateData.selectRecord(

                        record

                    );

                }

            );


            list.appendChild(

                item

            );

        }

    );

}


/* =====================================================
   SELECT RECORD
===================================================== */

function selectRecordInternal(

    record

){

    if(

        !record ||

        isBusy

    ){

        return;

    }


    const key =

        makeRecordKey(

            record

        );


    const duplicate =

        pendingChanges.some(

            item =>

                item.key === key

        );


    if(

        duplicate

    ){

        showResult(

            getOption(

                "duplicateText"

            ),

            "error"

        );


        return;

    }


    selectedRecord =

        record;


    if(

        typeof currentOptions.onSelect ===

        "function"

    ){

        try{

            currentOptions.onSelect(

                record

            );

        }

        catch(error){

            console.error(

                "[UpdateData] onSelect failed:",

                error

            );

        }

    }


    hideResult();


    renderRecordList();

    renderDetail();

    renderFields();

    renderAction();


    requestAnimationFrame(

        () => {

            const detail =

                overlay?.querySelector(

                    '[data-role="detail"]'

                );


            if(

                detail &&

                typeof detail.scrollIntoView ===

                "function"

            ){

                detail.scrollIntoView({

                    behavior :

                        "smooth",

                    block :

                        "nearest"

                });

            }

        }

    );

}


/* =====================================================
   RENDER DETAIL
===================================================== */

function renderDetail(){

    const container =

        overlay?.querySelector(

            '[data-role="detail"]'

        );


    if(

        !container

    ){

        return;

    }


    container.innerHTML = "";


    if(

        !selectedRecord

    ){

        container.classList.add(

            "hidden"

        );

        return;

    }


    container.classList.remove(

        "hidden"

    );


    let result = null;


    if(

        typeof currentOptions.renderDetail ===

        "function"

    ){

        try{

            result =

                currentOptions.renderDetail(

                    selectedRecord

                );

        }

        catch(error){

            console.error(

                "[UpdateData] renderDetail failed:",

                error

            );

            result = null;

        }

    }


    if(

        isElement(

            result

        )

    ){

        container.appendChild(

            result

        );

        return;

    }


    if(

        typeof result === "string"

    ){

        container.innerHTML =

            result;

        return;

    }


    if(

        result &&

        typeof result === "object"

    ){

        renderDetailDescriptor(

            container,

            result

        );

        return;

    }


    renderDefaultDetail(

        container

    );

}


/* =====================================================
   DETAIL DESCRIPTOR
===================================================== */

function renderDetailDescriptor(

    container,

    descriptor

){

    const card =

        createElement(

            "div",

            "global-update-data-detail-card"

        );


    const titleText =

        descriptor.title ||

        "Detail Data";


    const title =

        createElement(

            "h3",

            "global-update-data-detail-title",

            titleText

        );


    card.appendChild(

        title

    );


    const items =

        Array.isArray(

            descriptor.items

        )

            ?

            descriptor.items

            :

            [];


    items.forEach(

        item => {

            if(

                !item ||

                typeof item !== "object"

            ){

                return;

            }


            addDetailRow(

                card,

                item.label,

                item.value,

                item.locked

            );

        }

    );


    container.appendChild(

        card

    );

}


/* =====================================================
   DEFAULT DETAIL
===================================================== */

function renderDefaultDetail(

    container

){

    const card =

        createElement(

            "div",

            "global-update-data-detail-card"

        );


    const title =

        createElement(

            "h3",

            "global-update-data-detail-title",

            "Detail Data"

        );


    card.appendChild(

        title

    );


    addDetailRow(

        card,

        "ID",

        getRecordId(

            selectedRecord

        ),

        true

    );


    addDetailRow(

        card,

        "Data",

        getRecordLabel(

            selectedRecord

        )

    );


    const meta =

        getRecordMeta(

            selectedRecord

        );


    if(

        meta

    ){

        addDetailRow(

            card,

            "Info",

            meta

        );

    }


    container.appendChild(

        card

    );

}


/* =====================================================
   DETAIL ROW
===================================================== */

function addDetailRow(

    parent,

    label,

    value,

    locked = false

){

    const row =

        createElement(

            "div",

            "global-update-data-detail-row"

        );


    if(

        normalizeBoolean(

            locked

        )

    ){

        row.classList.add(

            "locked"

        );

    }


    const labelElement =

        createElement(

            "span",

            "global-update-data-detail-label",

            label

        );


    const valueElement =

        createElement(

            "strong",

            "global-update-data-detail-value",

            value

        );


    row.appendChild(

        labelElement

    );


    const valueWrap =

        createElement(

            "div",

            "global-update-data-detail-value-wrap"

        );


    valueWrap.appendChild(

        valueElement

    );


    if(

        normalizeBoolean(

            locked

        )

    ){

        const lock =

            createElement(

                "span",

                "global-update-data-detail-lock",

                "🔒"

            );


        lock.setAttribute(

            "aria-hidden",

            "true"

        );


        valueWrap.appendChild(

            lock

        );

    }


    row.appendChild(

        valueWrap

    );


    parent.appendChild(

        row

    );

}


/* =====================================================
   RENDER FIELDS
===================================================== */

function renderFields(){

    const container =

        overlay?.querySelector(

            '[data-role="fields"]'

        );


    if(

        !container

    ){

        return;

    }


    container.innerHTML = "";


    if(

        !selectedRecord

    ){

        container.classList.add(

            "hidden"

        );

        return;

    }


    container.classList.remove(

        "hidden"

    );


    if(

        typeof currentOptions.renderFields !==

        "function"

    ){

        return;

    }


    let result = null;


    try{

        result =

            currentOptions.renderFields(

                selectedRecord,

                {

                    root :

                        container,

                    getValue :

                        field =>

                            getFieldValue(

                                field

                            ),

                    setValue :

                        (

                            field,

                            value

                        ) =>

                            setFieldValue(

                                field,

                                value

                            ),

                    onChange :

                        () =>

                            renderAction()

                }

            );

    }

    catch(error){

        console.error(

            "[UpdateData] renderFields failed:",

            error

        );


        return;

    }


    if(

        isElement(

            result

        )

    ){

        container.appendChild(

            result

        );

    }

    else if(

        typeof result === "string"

    ){

        container.innerHTML =

            result;

    }

    else if(

        Array.isArray(

            result

        ) || (

            result &&

            typeof result === "object" &&

            Array.isArray(

                result.fields

            )

        )

    ){

        const fields =

            Array.isArray(

                result

            )

                ?

                result

                :

                result.fields;


        renderFieldDescriptors(

            container,

            fields

        );

    }


    bindFieldChanges();

    updateConditionalFields();

    renderAction();

}


/* =====================================================
   FIELD DESCRIPTORS
===================================================== */

function renderFieldDescriptors(

    container,

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

                !field ||

                typeof field !== "object"

            ){

                return;

            }


            const wrapper =

                createElement(

                    "div",

                    "global-update-data-field"

                );


            wrapper.dataset.fieldId =

                safeText(

                    field.id

                );


            const label =

                createElement(

                    "label",

                    "global-update-data-field-label",

                    field.label ||

                    field.id ||

                    "Field"

                );


            wrapper.appendChild(

                label

            );


            let control;


            const type =

                String(

                    field.type ||

                    "text"

                )

                .trim()

                .toLowerCase();


            if(

                type === "select"

            ){

                control =

                    renderSelectField(

                        field

                    );

            }

            else if(

                type === "number"

            ){

                control =

                    renderNumberField(

                        field

                    );

            }

            else if(

                type === "textarea"

            ){

                control =

                    renderTextareaField(

                        field

                    );

            }

            else{

                control =

                    renderTextField(

                        field

                    );

            }


            if(

                control

            ){

                wrapper.appendChild(

                    control

                );

            }


            if(

                field.note

            ){

                const note =

                    createElement(

                        "small",

                        "global-update-data-field-note",

                        field.note

                    );


                wrapper.appendChild(

                    note

                );

            }


            container.appendChild(

                wrapper

            );

        }

    );

}


/* =====================================================
   SELECT FIELD
===================================================== */

function renderSelectField(

    field

){

    const select =

        document.createElement(

            "select"

        );


    select.className =

        "global-update-data-field-control global-update-data-field-select";


    select.name =

        safeText(

            field.id

        );


    select.dataset.updateField =

        "true";


    if(

        field.required !== undefined

    ){

        select.required =

            normalizeBoolean(

                field.required

            );

    }


    const placeholder =

        createElement(

            "option",

            "",

            field.placeholder ||

            "Pilih..."

        );


    placeholder.value =

        "";


    placeholder.disabled =

        false;


    select.appendChild(

        placeholder

    );


    let options =

        field.options;


    if(

        typeof options === "function"

    ){

        try{

            options =

                options(

                    selectedRecord

                );

        }

        catch(error){

            console.warn(

                "[UpdateData] select options failed:",

                error

            );

            options = [];

        }

    }


    if(

        !Array.isArray(

            options

        )

    ){

        options = [];

    }


    options.forEach(

        option => {

            let value;

            let label;

            let disabled = false;


            if(

                option &&

                typeof option === "object"

            ){

                value =

                    option.value;


                label =

                    option.label ??

                    option.value;


                disabled =

                    normalizeBoolean(

                        option.disabled ||

                        option.ariaDisabled

                    );

            }

            else{

                value =

                    option;

                label =

                    option;

            }


            const element =

                createElement(

                    "option",

                    "",

                    label

                );


            element.value =

                safeText(

                    value

                );


            element.disabled =

                disabled;


            select.appendChild(

                element

            );

        }

    );


    const initialValue =

        getInitialFieldValue(

            field

        );


    if(

        initialValue !== null &&

        initialValue !== undefined

    ){

        select.value =

            safeText(

                initialValue

            );

    }


    return select;

}


/* =====================================================
   NUMBER FIELD
===================================================== */

function renderNumberField(

    field

){

    const input =

        document.createElement(

            "input"

        );


    input.type =

        "number";


    input.className =

        "global-update-data-field-control global-update-data-field-number";


    input.name =

        safeText(

            field.id

        );


    input.dataset.updateField =

        "true";


    if(

        field.placeholder

    ){

        input.placeholder =

            safeText(

                field.placeholder

            );

    }


    if(

        field.min !== undefined

    ){

        input.min =

            safeText(

                field.min

            );

    }


    if(

        field.max !== undefined

    ){

        input.max =

            safeText(

                field.max

            );

    }


    if(

        field.step !== undefined

    ){

        input.step =

            safeText(

                field.step

            );

    }


    if(

        field.required !== undefined

    ){

        input.required =

            normalizeBoolean(

                field.required

            );

    }


    const initialValue =

        getInitialFieldValue(

            field

        );


    if(

        initialValue !== null &&

        initialValue !== undefined

    ){

        input.value =

            safeText(

                initialValue

            );

    }


    return input;

}


/* =====================================================
   TEXT FIELD
===================================================== */

function renderTextField(

    field

){

    const input =

        document.createElement(

            "input"

        );


    input.type =

        "text";


    input.className =

        "global-update-data-field-control global-update-data-field-text";


    input.name =

        safeText(

            field.id

        );


    input.dataset.updateField =

        "true";


    if(

        field.placeholder

    ){

        input.placeholder =

            safeText(

                field.placeholder

            );

    }


    if(

        field.required !== undefined

    ){

        input.required =

            normalizeBoolean(

                field.required

            );

    }


    const initialValue =

        getInitialFieldValue(

            field

        );


    if(

        initialValue !== null &&

        initialValue !== undefined

    ){

        input.value =

            safeText(

                initialValue

            );

    }


    return input;

}


/* =====================================================
   TEXTAREA FIELD
===================================================== */

function renderTextareaField(

    field

){

    const textarea =

        document.createElement(

            "textarea"

        );


    textarea.className =

        "global-update-data-field-control global-update-data-field-textarea";


    textarea.name =

        safeText(

            field.id

        );


    textarea.dataset.updateField =

        "true";


    if(

        field.placeholder

    ){

        textarea.placeholder =

            safeText(

                field.placeholder

            );

    }


    if(

        field.rows !== undefined

    ){

        textarea.rows =

            Number(

                field.rows

            );

    }


    if(

        field.required !== undefined

    ){

        textarea.required =

            normalizeBoolean(

                field.required

            );

    }


    const initialValue =

        getInitialFieldValue(

            field

        );


    if(

        initialValue !== null &&

        initialValue !== undefined

    ){

        textarea.value =

            safeText(

                initialValue

            );

    }


    return textarea;

}


/* =====================================================
   INITIAL FIELD VALUE
===================================================== */

function getInitialFieldValue(

    field

){

    if(

        !field

    ){

        return "";

    }


    if(

        field.value !== undefined

    ){

        return field.value;

    }


    if(

        field.defaultValue !== undefined

    ){

        return field.defaultValue;

    }


    if(

        typeof currentOptions.getFieldValue ===

        "function"

    ){

        try{

            return currentOptions.getFieldValue(

                selectedRecord,

                field,

                overlay

            );

        }

        catch(error){

            console.warn(

                "[UpdateData] getFieldValue failed:",

                error

            );

        }

    }


    return "";

}


/* =====================================================
   GET FIELD VALUE
===================================================== */

function getFieldValue(

    field

){

    const name =

        typeof field === "string"

            ?

            field

            :

            field?.id;


    if(

        !name

    ){

        return "";

    }


    const element =

        overlay?.querySelector(

            `[name="${escapeSelector(name)}"]`

        );


    if(

        !element

    ){

        return "";

    }


    return element.value ?? "";

}


/* =====================================================
   SET FIELD VALUE
===================================================== */

function setFieldValue(

    field,

    value

){

    const name =

        typeof field === "string"

            ?

            field

            :

            field?.id;


    if(

        !name

    ){

        return;

    }


    const element =

        overlay?.querySelector(

            `[name="${escapeSelector(name)}"]`

        );


    if(

        !element

    ){

        return;

    }


    element.value =

        value === null ||

        value === undefined

            ?

            ""

            :

            String(

                value

            );

}


/* =====================================================
   ESCAPE SELECTOR
===================================================== */

function escapeSelector(

    value

){

    const text =

        String(

            value

        );


    if(

        typeof CSS !== "undefined" &&

        typeof CSS.escape === "function"

    ){

        return CSS.escape(

            text

        );

    }


    return text.replace(

        /["\\]/g,

        "\\$&"

    );

}


/* =====================================================
   FIELD EVENTS
===================================================== */

function bindFieldChanges(){

    const fields =

        overlay?.querySelectorAll(

            "[data-update-field], [name]"

        );


    if(

        !fields

    ){

        return;

    }


    fields.forEach(

        field => {

            if(

                field.dataset.updateBound ===

                "true"

            ){

                return;

            }


            field.dataset.updateBound =

                "true";


            field.addEventListener(

                "input",

                () => {

                    updateConditionalFields();

                    renderAction();

                }

            );


            field.addEventListener(

                "change",

                () => {

                    updateConditionalFields();

                    renderAction();

                }

            );

        }

    );

}


/* =====================================================
   CONDITIONAL FIELDS
===================================================== */

function updateConditionalFields(){

    const fieldWrappers =

        overlay?.querySelectorAll(

            "[data-field-id]"

        );


    if(

        !fieldWrappers

    ){

        return;

    }


    fieldWrappers.forEach(

        wrapper => {

            const fieldId =

                wrapper.dataset.fieldId;


            const fieldConfig =

                findFieldConfig(

                    fieldId

                );


            if(

                !fieldConfig

            ){

                return;

            }


            if(

                typeof fieldConfig.showWhen !==

                "function"

            ){

                wrapper.classList.remove(

                    "hidden"

                );

                return;

            }


            let values =

                collectFieldValues();


            let visible = false;


            try{

                visible =

                    fieldConfig.showWhen(

                        values,

                        selectedRecord

                    ) !== false;

            }

            catch(error){

                console.warn(

                    "[UpdateData] showWhen failed:",

                    error

                );


                visible = false;

            }


            wrapper.classList.toggle(

                "hidden",

                !visible

            );


            if(

                !visible

            ){

                const control =

                    wrapper.querySelector(

                        "[name]"

                    );


                if(

                    control

                ){

                    control.value =

                        "";

                }

            }

        }

    );

}


/* =====================================================
   FIELD CONFIG
===================================================== */

function getRenderedFieldConfigs(){

    if(

        typeof currentOptions.renderFields !==

        "function"

    ){

        return [];

    }


    try{

        const result =

            currentOptions.renderFields(

                selectedRecord,

                {

                    root :

                        overlay?.querySelector(

                            '[data-role="fields"]'

                        ),

                    getValue :

                        field =>

                            getFieldValue(

                                field

                            ),

                    setValue :

                        (

                            field,

                            value

                        ) =>

                            setFieldValue(

                                field,

                                value

                            ),

                    onChange :

                        () =>

                            renderAction()

                }

            );


        if(

            Array.isArray(

                result

            )

        ){

            return result;

        }


        if(

            result &&

            Array.isArray(

                result.fields

            )

        ){

            return result.fields;

        }

    }

    catch{

        return [];

    }


    return [];

}


function findFieldConfig(

    id

){

    const fields =

        getRenderedFieldConfigs();


    return fields.find(

        field =>

            safeText(

                field?.id

            ) ===

            safeText(

                id

            )

    ) || null;

}


/* =====================================================
   COLLECT FIELD VALUES
===================================================== */

function collectFieldValues(){

    const values = {};


    const fields =

        overlay?.querySelectorAll(

            "[name]"

        );


    if(

        fields

    ){

        fields.forEach(

            field => {

                const name =

                    field.name;


                if(

                    !name

                ){

                    return;

                }


                values[name] =

                    field.value ?? "";

            }

        );

    }


    return values;

}


/* =====================================================
   VALIDATION
===================================================== */

async function validateCurrent(){

    if(

        !selectedRecord

    ){

        return {

            valid :

                false,

            message :

                "Data belum dipilih."

        };

    }


    const values =

        collectFieldValues();


    if(

        typeof currentOptions.validate !==

        "function"

    ){

        return {

            valid :

                true,

            values

        };

    }


    try{

        const result =

            await currentOptions.validate(

                selectedRecord,

                values

            );


        if(

            result === true

        ){

            return {

                valid :

                    true,

                values

            };

        }


        if(

            result === false

        ){

            return {

                valid :

                    false,

                values,

                message :

                    "Data belum lengkap atau tidak valid."

            };

        }


        if(

            result &&

            typeof result === "object"

        ){

            return {

                valid :

                    result.valid === true,

                values,

                message :

                    result.message ||

                    result.error ||

                    ""

            };

        }

    }

    catch(error){

        return {

            valid :

                false,

            values,

            message :

                error?.message ||

                "Validasi gagal."

        };

    }


    return {

        valid :

            false,

        values,

        message :

            "Data belum lengkap atau tidak valid."

    };

}


/* =====================================================
   ACTION
===================================================== */

async function renderAction(){

    const action =

        overlay?.querySelector(

            '[data-role="action"]'

        );


    const button =

        overlay?.querySelector(

            '[data-role="add"]'

        );


    if(

        !action ||

        !button

    ){

        return;

    }


    if(

        !selectedRecord

    ){

        action.classList.add(

            "hidden"

        );

        button.disabled =

            true;

        return;

    }


    action.classList.remove(

        "hidden"

    );


    const validation =

        await validateCurrent();


    button.disabled =

        !validation.valid ||

        isBusy;

}


/* =====================================================
   RESULT
===================================================== */

function showResult(

    message,

    type = ""

){

    const result =

        overlay?.querySelector(

            '[data-role="result"]'

        );


    if(

        !result

    ){

        return;

    }


    result.className =

        "global-update-data-result";


    if(

        type

    ){

        result.classList.add(

            type

        );

    }


    result.textContent =

        safeText(

            message

        );


    result.classList.remove(

        "hidden"

    );

}


function hideResult(){

    const result =

        overlay?.querySelector(

            '[data-role="result"]'

        );


    result?.classList.add(

        "hidden"

    );

}


/* =====================================================
   CLEAR EDITOR
===================================================== */

function clearEditor(){

    selectedRecord =

        null;


    renderRecordList();

    renderDetail();

    renderFields();

    renderAction();

}


/* =====================================================
   ADD / STAGE
===================================================== */

async function addCurrent(){

    if(

        isBusy

    ){

        return false;

    }


    if(

        !selectedRecord

    ){

        return false;

    }


    const validation =

        await validateCurrent();


    if(

        !validation.valid

    ){

        if(

            validation.message

        ){

            showResult(

                validation.message,

                "error"

            );

        }

        return false;

    }


    const values =

        validation.values;


    const key =

        makeRecordKey(

            selectedRecord

        );


    if(

        pendingChanges.some(

            item =>

                item.key === key

        )

    ){

        showResult(

            getOption(

                "duplicateText"

            ),

            "error"

        );


        return false;

    }


    let changes = {};


    if(

        typeof currentOptions.buildChanges ===

        "function"

    ){

        try{

            changes =

                await currentOptions.buildChanges(

                    selectedRecord,

                    values

                );

        }

        catch(error){

            console.error(

                "[UpdateData] buildChanges failed:",

                error

            );


            showResult(

                error?.message ||

                "Data perubahan tidak dapat dibuat.",

                "error"

            );


            return false;

        }

    }


    if(

        changes === null ||

        changes === false

    ){

        showResult(

            "Data perubahan tidak dapat dibuat.",

            "error"

        );


        return false;

    }


    let callbackResult = null;


    if(

        typeof currentOptions.onAdd ===

        "function"

    ){

        try{

            callbackResult =

                await currentOptions.onAdd(

                    selectedRecord,

                    values,

                    changes,

                    {

                        pending :

                            pendingChanges.slice()

                    }

                );

        }

        catch(error){

            console.error(

                "[UpdateData] onAdd failed:",

                error

            );


            showResult(

                error?.message ||

                "Data gagal ditambahkan.",

                "error"

            );


            return false;

        }

    }


    const pendingItem = {

        key,

        record :

            selectedRecord,

        values,

        changes,

        label :

            getRecordLabel(

                selectedRecord

            ),

        meta :

            getRecordMeta(

                selectedRecord

            ),

        callbackResult

    };


    pendingChanges.push(

        pendingItem

    );


    if(

        typeof currentOptions.onAdded ===

        "function"

    ){

        try{

            await currentOptions.onAdded(

                pendingItem,

                pendingChanges.slice()

            );

        }

        catch(error){

            console.warn(

                "[UpdateData] onAdded failed:",

                error

            );

        }

    }


    clearEditor();


    hideResult();


    renderPending();


    renderRecordList();


    return true;

}


/* =====================================================
   PENDING
===================================================== */

function renderPending(){

    const section =

        overlay?.querySelector(

            '[data-role="pending"]'

        );


    const list =

        overlay?.querySelector(

            '[data-role="pending-list"]'

        );


    const count =

        overlay?.querySelector(

            '[data-role="pending-count"]'

        );


    const title =

        overlay?.querySelector(

            '[data-role="pending-title"]'

        );


    const confirmContainer =

        overlay?.querySelector(

            '[data-role="confirm-container"]'

        );


    const confirmButton =

        overlay?.querySelector(

            '[data-role="confirm"]'

        );


    if(

        !section ||

        !list

    ){

        return;

    }


    list.innerHTML = "";


    if(

        title

    ){

        title.textContent =

            safeText(

                getOption(

                    "pendingTitle"

                )

            );

    }


    if(

        count

    ){

        count.textContent =

            String(

                pendingChanges.length

            );

    }


    if(

        !pendingChanges.length

    ){

        section.classList.add(

            "hidden"

        );


        confirmContainer?.classList.add(

            "hidden"

        );


        if(

            confirmButton

        ){

            confirmButton.disabled =

                true;

            confirmButton.textContent =

                safeText(

                    getOption(

                        "confirmText"

                    )

                );

        }


        return;

    }


    section.classList.remove(

        "hidden"

    );


    confirmContainer?.classList.remove(

        "hidden"

    );


    pendingChanges.forEach(

        (

            item,

            index

        ) => {

            const row =

                createElement(

                    "div",

                    "global-update-data-pending-item"

                );


            const content =

                createElement(

                    "div",

                    "global-update-data-pending-item-content"

                );


            let label = "";


            if(

                typeof currentOptions.getPendingLabel ===

                "function"

            ){

                try{

                    label =

                        safeText(

                            currentOptions.getPendingLabel(

                                item

                            )

                        );

                }

                catch(error){

                    console.warn(

                        "[UpdateData] getPendingLabel failed:",

                        error

                    );

                }

            }


            if(

                !label

            ){

                label =

                    safeText(

                        item.label ||

                        item.name ||

                        item.key ||

                        "Data"

                    );

            }


            const strong =

                createElement(

                    "strong",

                    "global-update-data-pending-item-title",

                    label

                );


            content.appendChild(

                strong

            );


            const meta =

                safeText(

                    item.meta ||

                    item.status ||

                    ""

                );


            if(

                meta

            ){

                content.appendChild(

                    createElement(

                        "span",

                        "global-update-data-pending-item-meta",

                        meta

                    )

                );

            }


            const remove =

                createElement(

                    "button",

                    "global-update-data-remove",

                    getOption(

                        "removeText"

                    )

                );


            remove.type =

                "button";


            remove.addEventListener(

                "click",

                () => {

                    if(

                        isBusy

                    ){

                        return;

                    }


                    UpdateData.remove(

                        index

                    );

                }

            );


            row.appendChild(

                content

            );


            row.appendChild(

                remove

            );


            list.appendChild(

                row

            );

        }

    );


    if(

        confirmButton

    ){

        confirmButton.disabled =

            isBusy ||

            pendingChanges.length === 0;

    }

}


/* =====================================================
   NORMALIZE CONFIRM RESULT
===================================================== */

function normalizeConfirmResult(

    result

){

    if(

        result === true

    ){

        return {

            success :

                true,

            remaining :

                []

        };

    }


    if(

        result === false

    ){

        return {

            success :

                false,

            remaining :

                pendingChanges.slice()

        };

    }


    if(

        !result ||

        typeof result !== "object"

    ){

        return {

            success :

                false,

            remaining :

                pendingChanges.slice()

        };

    }


    const success =

        result.success === true ||

        result.ok === true;


    let remaining;


    if(

        Array.isArray(

            result.remaining

        )

    ){

        remaining =

            result.remaining;

    }

    else if(

        Array.isArray(

            result.failed

        )

    ){

        remaining =

            result.failed;

    }

    else{

        remaining =

            success

                ?

                []

                :

                pendingChanges.slice();

    }


    return {

        success,

        remaining

    };

}


/* =====================================================
   LOADING
===================================================== */

function showLoading(){

    const content =

        overlay?.querySelector(

            ".global-update-data-content"

        );


    if(

        !content

    ){

        return null;

    }


    const existing =

        content.querySelector(

            ".global-update-data-loading"

        );


    if(

        existing

    ){

        return existing;

    }


    const loading =

        createElement(

            "div",

            "global-update-data-loading"

        );


    const spinner =

        createElement(

            "span",

            "global-update-data-loading-spinner"

        );


    spinner.setAttribute(

        "aria-hidden",

        "true"

    );


    const text =

        createElement(

            "span",

            "",

            getOption(

                "confirmLoadingText"

            )

        );


    loading.appendChild(

        spinner

    );


    loading.appendChild(

        text

    );


    content.appendChild(

        loading

    );


    return loading;

}


/* =====================================================
   PUBLIC API
===================================================== */

export const UpdateData = {


    /* =================================================
       INIT
    ================================================= */

    init(){

        if(

            initialized

        ){

            return this;

        }


        createOverlay();


        initialized =

            true;


        return this;

    },


    /* =================================================
       OPEN
    ================================================= */

    open(

        options = {}

    ){

        this.init();


        currentOptions = {

            ...DEFAULTS,

            ...options

        };


        currentRecords =

            normalizeRecords(

                options.records

            );


        pendingChanges =

            normalizePending(

                options.pending

            );


        selectedRecord =

            null;


        isBusy =

            false;


        const title =

            overlay.querySelector(

                "#global-update-data-title"

            );


        const subtitle =

            overlay.querySelector(

                "#global-update-data-subtitle"

            );


        const listTitle =

            overlay.querySelector(

                '[data-role="record-title"]'

            );


        const search =

            overlay.querySelector(

                '[data-role="record-search"]'

            );


        if(

            title

        ){

            title.textContent =

                safeText(

                    getOption(

                        "title"

                    )

                );

        }


        if(

            subtitle

        ){

            subtitle.textContent =

                safeText(

                    getOption(

                        "subtitle"

                    )

                );

        }


        if(

            listTitle

        ){

            listTitle.textContent =

                safeText(

                    getOption(

                        "listTitle"

                    )

                );

        }


        if(

            search

        ){

            search.placeholder =

                safeText(

                    getOption(

                        "searchPlaceholder"

                    ));


            search.value =

                "";

        }


        hideResult();


        overlay.classList.add(

            "is-open"

        );


        if(

            getOption(

                "lockBody"

            ) !== false

        ){

            document.body.classList.add(

                "input-open"

            );

        }


        renderRecordList();

        renderDetail();

        renderFields();

        renderAction();

        renderPending();


        return this;

    },


    /* =================================================
       CLOSE
    ================================================= */

    close(){

        if(

            !overlay

        ){

            return;

        }


        if(

            typeof currentOptions.onClose ===

            "function"

        ){

            try{

                currentOptions.onClose();

            }

            catch(error){

                console.warn(

                    "[UpdateData] onClose failed:",

                    error

                );

            }

        }


        overlay.classList.remove(

            "is-open"

        );


        if(

            getOption(

                "lockBody"

            ) !== false

        ){

            document.body.classList.remove(

                "input-open"

            );

        }


        currentOptions = {};

        currentRecords = [];

        selectedRecord = null;

        pendingChanges = [];

        isBusy = false;

    },


    /* =================================================
       GET SELECTED
    ================================================= */

    getSelectedRecord(){

        return selectedRecord;

    },


    /* =================================================
       GET PENDING
    ================================================= */

    getPending(){

        return pendingChanges.slice();

    },


    /* =================================================
       GET PENDING COUNT
    ================================================= */

    getPendingCount(){

        return pendingChanges.length;

    },


    /* =================================================
       SET RECORDS
    ================================================= */

    setRecords(

        records

    ){

        currentRecords =

            normalizeRecords(

                records

            );


        renderRecordList();


        return this;

    },


    /* =================================================
       SET PENDING
    ================================================= */

    setPending(

        pending

    ){

        pendingChanges =

            normalizePending(

                pending

            );


        renderPending();

        renderRecordList();


        return this;

    },


    /* =================================================
       SELECT RECORD
    ================================================= */

    selectRecord(

        record

    ){

        selectRecordInternal(

            record

        );


        return this;

    },


    /* =================================================
       ADD
    ================================================= */

    async add(){

        return await addCurrent();

    },


    /* =================================================
       REMOVE
    ================================================= */

    async remove(

        index

    ){

        if(

            isBusy

        ){

            return false;

        }


        if(

            index < 0 ||

            index >= pendingChanges.length

        ){

            return false;

        }


        const item =

            pendingChanges[index];


        if(

            typeof currentOptions.onRemove ===

            "function"

        ){

            try{

                await currentOptions.onRemove(

                    item,

                    index,

                    pendingChanges.slice()

                );

            }

            catch(error){

                console.warn(

                    "[UpdateData] onRemove failed:",

                    error

                );

            }

        }


        pendingChanges.splice(

            index,

            1

        );


        renderPending();

        renderRecordList();


        return true;

    },


    /* =================================================
       CLEAR PENDING
    ================================================= */

    clearPending(){

        if(

            isBusy

        ){

            return this;

        }


        pendingChanges = [];


        renderPending();

        renderRecordList();


        return this;

    },


    /* =================================================
       CONFIRM
    ================================================= */

    async confirm(){

        if(

            isBusy

        ){

            return false;

        }


        if(

            !pendingChanges.length

        ){

            return false;

        }


        if(

            typeof currentOptions.validateBatch ===

            "function"

        ){

            try{

                const valid =

                    await currentOptions.validateBatch(

                        pendingChanges.slice()

                    );


                if(

                    valid === false ||

                    (

                        valid &&

                        typeof valid === "object" &&

                        valid.valid === false

                    )

                ){

                    showResult(

                        valid?.message ||

                        "Data belum dapat dikonfirmasi.",

                        "error"

                    );


                    return false;

                }

            }

            catch(error){

                showResult(

                    error?.message ||

                    "Validasi gagal.",

                    "error"

                );


                return false;

            }

        }


        isBusy =

            true;


        renderPending();

        renderAction();


        const confirmButton =

            overlay?.querySelector(

                '[data-role="confirm"]'

            );


        if(

            confirmButton

        ){

            confirmButton.disabled =

                true;


            confirmButton.textContent =

                safeText(

                    getOption(

                        "confirmLoadingText"

                    )

                );

        }


        const loading =

            showLoading();


        let result;


        try{

            if(

                typeof currentOptions.onConfirm ===

                "function"

            ){

                result =

                    await currentOptions.onConfirm(

                        pendingChanges.slice()

                    );

            }

            else{

                result = {

                    success :

                        true,

                    remaining :

                        []

                };

            }

        }

        catch(error){

            result = {

                success :

                    false,

                remaining :

                    pendingChanges.slice(),

                error

            };

        }


        loading?.remove();


        const normalized =

            normalizeConfirmResult(

                result

            );


        pendingChanges =

            normalizePending(

                normalized.remaining

            );


        isBusy =

            false;


        if(

            confirmButton

        ){

            confirmButton.textContent =

                safeText(

                    getOption(

                        "confirmText"

                    )

                );

        }


        if(

            normalized.success

        ){

            selectedRecord =

                null;


            if(

                typeof currentOptions.onConfirmed ===

                "function"

            ){

                try{

                    await currentOptions.onConfirmed(

                        result

                    );

                }

                catch(error){

                    console.warn(

                        "[UpdateData] onConfirmed failed:",

                        error

                    );

                }

            }


            renderRecordList();

            renderDetail();

            renderFields();

            renderAction();

            renderPending();


            showResult(

                result?.message ||

                getOption(

                    "addedText"

                ) ||

                "Perubahan berhasil disimpan.",

                "success"

            );


            return true;

        }


        renderPending();

        renderRecordList();

        renderAction();


        showResult(

            result?.message ||

            result?.error?.message ||

            "Sebagian atau seluruh perubahan gagal disimpan.",

            "error"

        );


        return false;

    }

};


export default UpdateData;
