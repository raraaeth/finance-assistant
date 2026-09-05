/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : updatedata.js
   Version      : 1.1.0

   Description :
   Reusable Global Update Data Engine

   Handles :
   - Full screen edit overlay
   - Custom record picker
   - Search
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
===================================================== */


/* =====================================================
   STATE
===================================================== */

let overlay = null;
let initialized = false;

let currentOptions = {};
let currentRecords = [];

let selectedRecord = null;
let selectedValue = null;

let pendingChanges = [];

let isBusy = false;


/* =====================================================
   CONSTANTS
===================================================== */

const DEFAULTS = {

    title: "Edit Input",

    subtitle: "Ubah data yang sudah tersimpan",

    pickerPlaceholder: "Pilih data",

    searchPlaceholder: "Cari data...",

    emptyText: "Tidak ada data yang tersedia.",

    addText: "Tambahkan",

    confirmText: "Konfirmasi",

    removeText: "Hapus",

    pendingTitle: "Sudah Ditambahkan",

    addedText: "Data berhasil ditambahkan.",

    duplicateText: "Data ini sudah ditambahkan.",

    confirmLoadingText: "Menyimpan perubahan..."
};


/* =====================================================
   DOM HELPERS
===================================================== */

function getElement(id) {
    return document.getElementById(id);
}


function createElement(tag, className = "", text = "") {

    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== "") {
        element.textContent = safeText(text);
    }

    return element;
}


function safeText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        return String(value);
    }

    try {

        return JSON.stringify(value);

    } catch {

        return String(value);

    }
}


/* =====================================================
   IDENTITY
===================================================== */

function getRecordId(record) {

    if (!record) {
        return "";
    }

    if (typeof currentOptions.getRecordId === "function") {

        try {

            const result =
                currentOptions.getRecordId(record);

            return safeText(result);

        } catch (error) {

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

    for (const value of candidates) {

        if (
            value !== null &&
            value !== undefined &&
            value !== ""
        ) {
            return safeText(value);
        }

    }

    try {

        return JSON.stringify(record);

    } catch {

        return String(record);

    }
}


function getRecordLabel(record) {

    if (!record) {
        return "";
    }

    if (typeof currentOptions.getRecordLabel === "function") {

        try {

            return safeText(
                currentOptions.getRecordLabel(record)
            );

        } catch (error) {

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

    for (const value of candidates) {

        if (
            value !== null &&
            value !== undefined &&
            value !== ""
        ) {
            return safeText(value);
        }

    }

    return "Data";
}


function getRecordMeta(record) {

    if (!record) {
        return "";
    }

    if (typeof currentOptions.getRecordMeta === "function") {

        try {

            return safeText(
                currentOptions.getRecordMeta(record)
            );

        } catch (error) {

            console.warn(
                "[UpdateData] getRecordMeta failed:",
                error
            );

        }

    }

    const values = [];

    if (
        record.type !== undefined &&
        record.type !== null &&
        record.type !== ""
    ) {
        values.push(record.type);
    }

    if (
        record.status !== undefined &&
        record.status !== null &&
        record.status !== ""
    ) {
        values.push(record.status);
    }

    return values
        .map(value => safeText(value))
        .filter(Boolean)
        .join(" · ");
}


function makeRecordKey(record) {

    return getRecordId(record);
}


/* =====================================================
   NORMALIZE RECORDS
===================================================== */

function normalizeRecords(records) {

    if (!Array.isArray(records)) {
        return [];
    }

    return records.filter(record => {
        return record !== null &&
               record !== undefined;
    });

}


function normalizePending(pending) {

    if (!Array.isArray(pending)) {
        return [];
    }

    return pending.filter(item => {
        return item !== null &&
               item !== undefined;
    });

}


/* =====================================================
   OPTION GETTERS
===================================================== */

function getOption(name) {

    if (
        currentOptions &&
        currentOptions[name] !== undefined
    ) {
        return currentOptions[name];
    }

    return DEFAULTS[name];

}


/* =====================================================
   RECORD FILTER
===================================================== */

function getAvailableRecords() {

    const pendingKeys = new Set(
        pendingChanges.map(item => {
            return item.key;
        })
    );

    return currentRecords.filter(record => {

        const key = makeRecordKey(record);

        return !pendingKeys.has(key);

    });

}


/* =====================================================
   CREATE OVERLAY
===================================================== */

function createOverlay() {

    if (overlay) {
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

            <div class="global-update-data-header">

                <div class="global-update-data-heading">

                    <h2 id="global-update-data-title">
                        Edit Input
                    </h2>

                    <span id="global-update-data-subtitle">
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


            <div class="global-update-data-content">

                <div class="global-update-data-picker">

                    <label
                        class="global-update-data-picker-label"
                    >
                        Pilih Data
                    </label>

                    <button
                        type="button"
                        class="global-update-data-picker-button"
                        data-role="picker-button"
                    >

                        <span
                            class="global-update-data-picker-value"
                            data-role="picker-value"
                        >
                            Pilih data
                        </span>

                        <span
                            class="global-update-data-picker-arrow"
                            aria-hidden="true"
                        >
                            ▾
                        </span>

                    </button>


                    <div
                        class="global-update-data-picker-panel hidden"
                        data-role="picker-panel"
                    >

                        <input
                            type="search"
                            class="global-update-data-picker-search"
                            data-role="picker-search"
                            autocomplete="off"
                        />

                        <div
                            class="global-update-data-picker-list"
                            data-role="picker-list"
                        ></div>

                    </div>

                </div>


                <div
                    class="global-update-data-detail hidden"
                    data-role="detail"
                ></div>


                <div
                    class="global-update-data-fields hidden"
                    data-role="fields"
                ></div>


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


                <div
                    class="global-update-data-pending hidden"
                    data-role="pending"
                >

                    <div
                        class="global-update-data-pending-header"
                    >

                        <h3>
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

                </div>


                <div
                    class="global-update-data-result hidden"
                    data-role="result"
                ></div>

            </div>


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

    document.body.appendChild(overlay);

    bindEvents();

    return overlay;
}


/* =====================================================
   BIND EVENTS
===================================================== */

function bindEvents() {

    if (!overlay) {
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

    const pickerButton =
        overlay.querySelector(
            '[data-role="picker-button"]'
        );

    const pickerSearch =
        overlay.querySelector(
            '[data-role="picker-search"]'
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
            UpdateData.close();
        }
    );


    pickerButton?.addEventListener(
        "click",
        () => {
            togglePicker();
        }
    );


    pickerSearch?.addEventListener(
        "input",
        () => {
            renderPickerList();
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

function handleKeydown(event) {

    if (!overlay) {
        return;
    }

    if (
        !overlay.classList.contains("is-open")
    ) {
        return;
    }

    if (
        event.key === "Escape" &&
        currentOptions.closeOnEscape !== false
    ) {

        const pickerPanel =
            getElement(
                "global-update-data-overlay"
            )?.querySelector(
                '[data-role="picker-panel"]'
            );

        if (
            pickerPanel &&
            !pickerPanel.classList.contains("hidden")
        ) {

            closePicker();

            return;

        }

        UpdateData.close();

    }

}


/* =====================================================
   PICKER
===================================================== */

function togglePicker() {

    if (isBusy) {
        return;
    }

    const panel =
        overlay.querySelector(
            '[data-role="picker-panel"]'
        );

    if (!panel) {
        return;
    }

    if (panel.classList.contains("hidden")) {

        openPicker();

    } else {

        closePicker();

    }

}


function openPicker() {

    const panel =
        overlay.querySelector(
            '[data-role="picker-panel"]'
        );

    const button =
        overlay.querySelector(
            '[data-role="picker-button"]'
        );

    const search =
        overlay.querySelector(
            '[data-role="picker-search"]'
        );

    if (!panel) {
        return;
    }

    panel.classList.remove("hidden");

    button?.classList.add("is-open");

    renderPickerList();

    if (search) {

        search.value = "";

        requestAnimationFrame(() => {
            search.focus();
        });

    }

}


function closePicker() {

    const panel =
        overlay?.querySelector(
            '[data-role="picker-panel"]'
        );

    const button =
        overlay?.querySelector(
            '[data-role="picker-button"]'
        );

    if (!panel) {
        return;
    }

    panel.classList.add("hidden");

    button?.classList.remove("is-open");

}


/* =====================================================
   PICKER LIST
===================================================== */

function renderPickerList() {

    const list =
        overlay?.querySelector(
            '[data-role="picker-list"]'
        );

    const search =
        overlay?.querySelector(
            '[data-role="picker-search"]'
        );

    if (!list) {
        return;
    }

    const query =
        safeText(search?.value)
            .trim()
            .toLowerCase();


    const records =
        getAvailableRecords()
            .filter(record => {

                if (!query) {
                    return true;
                }

                const label =
                    getRecordLabel(record)
                        .toLowerCase();

                const meta =
                    getRecordMeta(record)
                        .toLowerCase();

                const id =
                    getRecordId(record)
                        .toLowerCase();

                return (
                    label.includes(query) ||
                    meta.includes(query) ||
                    id.includes(query)
                );

            });


    list.innerHTML = "";


    if (!records.length) {

        const empty =
            createElement(
                "div",
                "global-update-data-empty",
                query
                    ? "Data tidak ditemukan."
                    : getOption("emptyText")
            );

        list.appendChild(empty);

        return;
    }


    records.forEach(record => {

        const option =
            createElement(
                "button",
                "global-update-data-picker-option"
            );

        option.type = "button";

        const key =
            makeRecordKey(record);

        if (
            selectedRecord &&
            makeRecordKey(selectedRecord) === key
        ) {
            option.classList.add("selected");
        }

        option.dataset.key = key;


        const content =
            createElement(
                "div",
                "global-update-data-picker-option-content"
            );


        const strong =
            createElement(
                "strong",
                "",
                getRecordLabel(record)
            );


        const metaText =
            getRecordMeta(record);

        const span =
            createElement(
                "span",
                "",
                metaText
            );


        content.appendChild(strong);

        if (metaText) {
            content.appendChild(span);
        }


        const arrow =
            createElement(
                "span",
                "global-update-data-picker-option-arrow",
                "›"
            );

        arrow.setAttribute(
            "aria-hidden",
            "true"
        );


        option.appendChild(content);
        option.appendChild(arrow);


        option.addEventListener(
            "click",
            () => {

                if (isBusy) {
                    return;
                }

                UpdateData.selectRecord(record);

            }
        );


        list.appendChild(option);

    });

}


/* =====================================================
   SELECT RECORD
===================================================== */

function selectRecordInternal(record) {

    if (!record) {
        return;
    }

    const key =
        makeRecordKey(record);

    const duplicate =
        pendingChanges.some(
            item => item.key === key
        );

    if (duplicate) {
        return;
    }

    selectedRecord = record;

    selectedValue = null;


    if (
        typeof currentOptions.onSelect ===
        "function"
    ) {

        try {

            currentOptions.onSelect(
                record
            );

        } catch (error) {

            console.error(
                "[UpdateData] onSelect failed:",
                error
            );

        }

    }


    closePicker();

    renderPickerButton();

    renderDetail();

    renderFields();

    renderAction();

}


/* =====================================================
   PICKER BUTTON
===================================================== */

function renderPickerButton() {

    const valueElement =
        overlay?.querySelector(
            '[data-role="picker-value"]'
        );

    if (!valueElement) {
        return;
    }

    if (!selectedRecord) {

        valueElement.textContent =
            getOption(
                "pickerPlaceholder"
            );

        return;

    }

    valueElement.textContent =
        getRecordLabel(
            selectedRecord
        );

}


/* =====================================================
   DETAIL
===================================================== */

function renderDetail() {

    const container =
        overlay?.querySelector(
            '[data-role="detail"]'
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";


    if (!selectedRecord) {

        container.classList.add("hidden");

        return;

    }


    container.classList.remove("hidden");


    if (
        typeof currentOptions.renderDetail ===
        "function"
    ) {

        try {

            const result =
                currentOptions.renderDetail(
                    selectedRecord
                );

            if (result instanceof HTMLElement) {

                container.appendChild(result);

            } else {

                container.innerHTML =
                    safeText(result);

            }

            return;

        } catch (error) {

            console.error(
                "[UpdateData] renderDetail failed:",
                error
            );

        }

    }


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


    card.appendChild(title);


    addDetailRow(
        card,
        "ID",
        getRecordId(selectedRecord)
    );


    addDetailRow(
        card,
        "Data",
        getRecordLabel(selectedRecord)
    );


    const meta =
        getRecordMeta(selectedRecord);

    if (meta) {

        addDetailRow(
            card,
            "Info",
            meta
        );

    }


    container.appendChild(card);

}


function addDetailRow(
    parent,
    label,
    value
) {

    const row =
        createElement(
            "div",
            "global-update-data-detail-row"
        );

    const labelElement =
        createElement(
            "span",
            "",
            label
        );

    const valueElement =
        createElement(
            "strong",
            "",
            value
        );

    row.appendChild(labelElement);
    row.appendChild(valueElement);

    parent.appendChild(row);

}


/* =====================================================
   FIELDS
===================================================== */

function renderFields() {

    const container =
        overlay?.querySelector(
            '[data-role="fields"]'
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";


    if (!selectedRecord) {

        container.classList.add("hidden");

        return;

    }


    container.classList.remove("hidden");


    if (
        typeof currentOptions.renderFields !==
        "function"
    ) {
        return;
    }


    try {

        const result =
            currentOptions.renderFields(
                selectedRecord,
                {
                    root: container,
                    getValue:
                        getFieldValue,
                    setValue:
                        setFieldValue,
                    onChange:
                        renderAction
                }
            );


        if (
            result instanceof HTMLElement
        ) {

            container.appendChild(result);

        } else if (
            typeof result === "string"
        ) {

            container.innerHTML = result;

        }


        bindFieldChanges();

    } catch (error) {

        console.error(
            "[UpdateData] renderFields failed:",
            error
        );

        container.innerHTML = "";

    }

}


/* =====================================================
   FIELD VALUE
===================================================== */

function getFieldValue(name) {

    if (
        typeof currentOptions.getFieldValue ===
        "function"
    ) {

        try {

            return currentOptions.getFieldValue(
                name,
                selectedRecord,
                overlay
            );

        } catch (error) {

            console.warn(
                "[UpdateData] getFieldValue failed:",
                error
            );

        }

    }

    const field =
        overlay?.querySelector(
            `[name="${CSS.escape(name)}"]`
        );

    if (!field) {
        return "";
    }

    return field.value;

}


function setFieldValue(
    name,
    value
) {

    const field =
        overlay?.querySelector(
            `[name="${CSS.escape(name)}"]`
        );

    if (!field) {
        return;
    }

    field.value =
        value === null ||
        value === undefined
            ? ""
            : String(value);

}


/* =====================================================
   FIELD EVENTS
===================================================== */

function bindFieldChanges() {

    const fields =
        overlay?.querySelectorAll(
            '[data-update-field], [name]'
        );

    if (!fields) {
        return;
    }

    fields.forEach(field => {

        field.addEventListener(
            "input",
            () => {
                renderAction();
            }
        );

        field.addEventListener(
            "change",
            () => {
                renderAction();
            }
        );

    });

}


/* =====================================================
   ACTION
===================================================== */

function renderAction() {

    const action =
        overlay?.querySelector(
            '[data-role="action"]'
        );

    const button =
        overlay?.querySelector(
            '[data-role="add"]'
        );

    if (!action || !button) {
        return;
    }


    if (!selectedRecord) {

        action.classList.add("hidden");

        button.disabled = true;

        return;

    }


    action.classList.remove("hidden");


    let valid = false;


    if (
        typeof currentOptions.validate ===
        "function"
    ) {

        try {

            valid =
                currentOptions.validate(
                    selectedRecord,
                    overlay
                ) === true;

        } catch (error) {

            console.warn(
                "[UpdateData] validate failed:",
                error
            );

            valid = false;

        }

    } else {

        valid = true;

    }


    button.disabled =
        !valid ||
        isBusy;

}


/* =====================================================
   PENDING
===================================================== */

function renderPending() {

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

    const confirmContainer =
        overlay?.querySelector(
            '[data-role="confirm-container"]'
        );

    const confirmButton =
        overlay?.querySelector(
            '[data-role="confirm"]'
        );


    if (!section || !list) {
        return;
    }


    list.innerHTML = "";


    if (count) {
        count.textContent =
            String(pendingChanges.length);
    }


    if (!pendingChanges.length) {

        section.classList.add("hidden");

        confirmContainer?.classList.add(
            "hidden"
        );

        if (confirmButton) {
            confirmButton.disabled = true;
        }

        return;

    }


    section.classList.remove("hidden");

    confirmContainer?.classList.remove(
        "hidden"
    );


    pendingChanges.forEach(
        (item, index) => {

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


            const title =
                safeText(
                    typeof currentOptions.getPendingLabel ===
                    "function"
                        ? currentOptions.getPendingLabel(
                            item
                        )
                        : item.label ||
                          item.name ||
                          item.key
                );


            const strong =
                createElement(
                    "strong",
                    "",
                    title
                );


            const meta =
                safeText(
                    item.meta ||
                    item.status ||
                    ""
                );


            content.appendChild(strong);


            if (meta) {

                content.appendChild(
                    createElement(
                        "span",
                        "",
                        meta
                    )
                );

            }


            const remove =
                createElement(
                    "button",
                    "global-update-data-remove",
                    getOption("removeText")
                );

            remove.type = "button";


            remove.addEventListener(
                "click",
                () => {

                    if (isBusy) {
                        return;
                    }

                    UpdateData.remove(index);

                }
            );


            row.appendChild(content);
            row.appendChild(remove);

            list.appendChild(row);

        }
    );


    if (confirmButton) {
        confirmButton.disabled =
            isBusy ||
            pendingChanges.length === 0;
    }

}


/* =====================================================
   RESULT
===================================================== */

function showResult(
    message,
    type = ""
) {

    const result =
        overlay?.querySelector(
            '[data-role="result"]'
        );

    if (!result) {
        return;
    }

    result.className =
        "global-update-data-result";


    if (type) {
        result.classList.add(type);
    }


    result.textContent =
        safeText(message);


    result.classList.remove(
        "hidden"
    );

}


function hideResult() {

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

function clearEditor() {

    selectedRecord = null;

    selectedValue = null;

    renderPickerButton();

    renderDetail();

    renderFields();

    renderAction();

}


/* =====================================================
   CONFIRM RESULT
===================================================== */

function normalizeConfirmResult(result) {

    if (result === true) {

        return {
            success: true,
            remaining: []
        };

    }


    if (result === false) {

        return {
            success: false,
            remaining: pendingChanges.slice()
        };

    }


    if (!result || typeof result !== "object") {

        return {
            success: false,
            remaining: pendingChanges.slice()
        };

    }


    const success =
        result.success === true ||
        result.ok === true;


    let remaining;


    if (Array.isArray(result.remaining)) {

        remaining =
            result.remaining;

    } else if (
        Array.isArray(result.failed)
    ) {

        remaining =
            result.failed;

    } else {

        remaining =
            success
                ? []
                : pendingChanges.slice();

    }


    return {
        success,
        remaining
    };

}


/* =====================================================
   PUBLIC API
===================================================== */

export const UpdateData = {


    /* =================================================
       INIT
    ================================================= */

    init() {

        if (initialized) {
            return this;
        }

        createOverlay();

        initialized = true;

        return this;

    },


    /* =================================================
       OPEN
    ================================================= */

    open(options = {}) {

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


        selectedRecord = null;
        selectedValue = null;

        isBusy = false;


        const title =
            overlay.querySelector(
                "#global-update-data-title"
            );

        const subtitle =
            overlay.querySelector(
                "#global-update-data-subtitle"
            );

        const search =
            overlay.querySelector(
                '[data-role="picker-search"]'
            );


        if (title) {

            title.textContent =
                safeText(
                    getOption("title")
                );

        }


        if (subtitle) {

            subtitle.textContent =
                safeText(
                    getOption("subtitle")
                );

        }


        if (search) {

            search.placeholder =
                safeText(
                    getOption(
                        "searchPlaceholder"
                    )
                );

        }


        hideResult();

        renderPickerButton();

        renderDetail();

        renderFields();

        renderAction();

        renderPending();


        overlay.classList.add(
            "is-open"
        );


        if (
            currentOptions.lockBody !== false
        ) {

            document.body.classList.add(
                "input-open"
            );

        }


        renderPickerList();


        return this;

    },


    /* =================================================
       CLOSE
    ================================================= */

    close() {

        if (!overlay) {
            return;
        }

        if (
            typeof currentOptions.onClose ===
            "function"
        ) {

            try {

                currentOptions.onClose();

            } catch (error) {

                console.warn(
                    "[UpdateData] onClose failed:",
                    error
                );

            }

        }


        overlay.classList.remove(
            "is-open"
        );


        closePicker();


        if (
            currentOptions.lockBody !== false
        ) {

            document.body.classList.remove(
                "input-open"
            );

        }


        currentOptions = {};

        currentRecords = [];

        selectedRecord = null;

        selectedValue = null;

        pendingChanges = [];

        isBusy = false;

    },


    /* =================================================
       GET SELECTED
    ================================================= */

    getSelectedRecord() {

        return selectedRecord;

    },


    /* =================================================
       GET PENDING
    ================================================= */

    getPending() {

        return pendingChanges.slice();

    },


    /* =================================================
       GET PENDING COUNT
    ================================================= */

    getPendingCount() {

        return pendingChanges.length;

    },


    /* =================================================
       SET RECORDS
    ================================================= */

    setRecords(records) {

        currentRecords =
            normalizeRecords(records);

        renderPickerList();

        return this;

    },


    /* =================================================
       SET PENDING
    ================================================= */

    setPending(pending) {

        pendingChanges =
            normalizePending(pending);

        renderPending();

        renderPickerList();

        return this;

    },


    /* =================================================
       SELECT RECORD
    ================================================= */

    selectRecord(record) {

        selectRecordInternal(record);

        return this;

    },


    /* =================================================
       ADD
    ================================================= */

    async add() {

        if (isBusy) {
            return false;
        }

        if (!selectedRecord) {
            return false;
        }


        let valid = true;


        if (
            typeof currentOptions.validate ===
            "function"
        ) {

            try {

                valid =
                    currentOptions.validate(
                        selectedRecord,
                        overlay
                    ) === true;

            } catch (error) {

                console.error(
                    "[UpdateData] Validation failed:",
                    error
                );

                valid = false;

            }

        }


        if (!valid) {
            return false;
        }


        const key =
            makeRecordKey(
                selectedRecord
            );


        if (
            pendingChanges.some(
                item => item.key === key
            )
        ) {

            showResult(
                getOption(
                    "duplicateText"
                ),
                "error"
            );

            return false;

        }


        let changes = {};


        if (
            typeof currentOptions.buildChanges ===
            "function"
        ) {

            try {

                changes =
                    await currentOptions.buildChanges(
                        selectedRecord,
                        overlay
                    );

            } catch (error) {

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


        let callbackResult = null;


        if (
            typeof currentOptions.onAdd ===
            "function"
        ) {

            try {

                callbackResult =
                    await currentOptions.onAdd(
                        selectedRecord,
                        changes,
                        {
                            pending:
                                pendingChanges.slice()
                        }
                    );

            } catch (error) {

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

            record:
                selectedRecord,

            changes,

            label:
                getRecordLabel(
                    selectedRecord
                ),

            meta:
                getRecordMeta(
                    selectedRecord
                ),

            callbackResult

        };


        pendingChanges.push(
            pendingItem
        );


        if (
            typeof currentOptions.onAdded ===
            "function"
        ) {

            try {

                await currentOptions.onAdded(
                    pendingItem,
                    pendingChanges.slice()
                );

            } catch (error) {

                console.warn(
                    "[UpdateData] onAdded failed:",
                    error
                );

            }

        }


        clearEditor();

        hideResult();

        renderPending();

        renderPickerList();


        return true;

    },


    /* =================================================
       REMOVE
    ================================================= */

    async remove(index) {

        if (isBusy) {
            return false;
        }


        if (
            index < 0 ||
            index >= pendingChanges.length
        ) {
            return false;
        }


        const item =
            pendingChanges[index];


        if (
            typeof currentOptions.onRemove ===
            "function"
        ) {

            try {

                await currentOptions.onRemove(
                    item,
                    index,
                    pendingChanges.slice()
                );

            } catch (error) {

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

        renderPickerList();


        return true;

    },


    /* =================================================
       CLEAR PENDING
    ================================================= */

    clearPending() {

        if (isBusy) {
            return this;
        }

        pendingChanges = [];

        renderPending();

        renderPickerList();

        return this;

    },


    /* =================================================
       CONFIRM
    ================================================= */

    async confirm() {

        if (isBusy) {
            return false;
        }


        if (!pendingChanges.length) {
            return false;
        }


        if (
            typeof currentOptions.validateBatch ===
            "function"
        ) {

            try {

                const valid =
                    await currentOptions.validateBatch(
                        pendingChanges.slice()
                    );

                if (valid === false) {

                    showResult(
                        "Data belum dapat dikonfirmasi.",
                        "error"
                    );

                    return false;

                }

            } catch (error) {

                showResult(
                    error?.message ||
                    "Validasi gagal.",
                    "error"
                );

                return false;

            }

        }


        isBusy = true;

        renderPending();

        renderAction();


        const confirmButton =
            overlay?.querySelector(
                '[data-role="confirm"]'
            );


        if (confirmButton) {

            confirmButton.disabled = true;

            confirmButton.textContent =
                getOption(
                    "confirmLoadingText"
                );

        }


        const loading =
            createElement(
                "div",
                "global-update-data-loading"
            );


        loading.innerHTML = `
            <span
                class="global-update-data-loading-spinner"
                aria-hidden="true"
            ></span>
            <span></span>
        `;


        const loadingText =
            loading.querySelector(
                "span:last-child"
            );


        if (loadingText) {

            loadingText.textContent =
                getOption(
                    "confirmLoadingText"
                );

        }


        const content =
            overlay?.querySelector(
                ".global-update-data-content"
            );


        const existingLoading =
            content?.querySelector(
                ".global-update-data-loading"
            );


        if (!existingLoading && content) {

            content.appendChild(
                loading
            );

        }


        let result;


        try {

            if (
                typeof currentOptions.onConfirm ===
                "function"
            ) {

                result =
                    await currentOptions.onConfirm(
                        pendingChanges.slice()
                    );

            } else {

                result = {
                    success: true,
                    remaining: []
                };

            }

        } catch (error) {

            result = {
                success: false,
                remaining:
                    pendingChanges.slice(),
                error
            };

        }


        existingLoading?.remove();

        loading.remove();


        const normalized =
            normalizeConfirmResult(
                result
            );


        pendingChanges =
            normalizePending(
                normalized.remaining
            );


        isBusy = false;


        if (confirmButton) {

            confirmButton.textContent =
                getOption(
                    "confirmText"
                );

        }


        if (normalized.success) {

            clearEditor();

            renderPending();

            renderPickerList();


            if (
                typeof currentOptions.onConfirmed ===
                "function"
            ) {

                try {

                    await currentOptions.onConfirmed(
                        result
                    );

                } catch (error) {

                    console.warn(
                        "[UpdateData] onConfirmed failed:",
                        error
                    );

                }

            }


            showResult(
                result?.message ||
                "Perubahan berhasil disimpan.",
                "success"
            );


            return true;

        }


        renderPending();

        renderPickerList();

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
