/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : updatedata.js
   Version      : 1.0.0

   Description :
   Global Edit Data UI Engine

   Handles :
   - Full screen edit overlay
   - Custom picker
   - Searchable picker
   - Selected data detail
   - Dynamic edit fields
   - Add temporary changes
   - Pending changes list
   - Remove pending changes
   - Confirm batch changes
   - Loading state
   - Success / error state

   PRINCIPLE :

   Workspace Controller
           ↓
      UpdateData
           ↓
   ┌───────────────────────┐
   │                       │
   │ Custom Picker         │
   │ Selected Detail       │
   │ Edit Fields           │
   │ Tambahkan             │
   │ Pending Changes       │
   │ Konfirmasi            │
   │                       │
   └───────────────────────┘
           ↓
     Workspace Logic
           ↓
        Update.js

   IMPORTANT :

   File ini tidak mengetahui:
   - Airdrop
   - Reward
   - Payroll
   - Workspace tertentu
   - Apps Script
   - Spreadsheet
   - Target update

   Semua business logic diberikan melalui options.
===================================================== */


/* =====================================================
   STATE
===================================================== */

let overlay = null;

let initialized = false;

let currentOptions = null;

let currentRecords = [];

let selectedRecord = null;

let pendingChanges = [];

let selectedValue = null;

let isBusy = false;


/* =====================================================
   DOM IDS
===================================================== */

const IDS = {

    overlay:
        "global-update-data-overlay",

    backdrop:
        "global-update-data-backdrop",

    panel:
        "global-update-data-panel",

    title:
        "global-update-data-title",

    subtitle:
        "global-update-data-subtitle",

    close:
        "global-update-data-close",

    picker:
        "global-update-data-picker",

    pickerButton:
        "global-update-data-picker-button",

    pickerLabel:
        "global-update-data-picker-label",

    pickerArrow:
        "global-update-data-picker-arrow",

    pickerPanel:
        "global-update-data-picker-panel",

    pickerSearch:
        "global-update-data-picker-search",

    pickerList:
        "global-update-data-picker-list",

    detail:
        "global-update-data-detail",

    fields:
        "global-update-data-fields",

    action:
        "global-update-data-action",

    add:
        "global-update-data-add",

    pending:
        "global-update-data-pending",

    pendingTitle:
        "global-update-data-pending-title",

    pendingCount:
        "global-update-data-pending-count",

    pendingList:
        "global-update-data-pending-list",

    confirm:
        "global-update-data-confirm",

    result:
        "global-update-data-result"

};


/* =====================================================
   UPDATE DATA
===================================================== */

export const UpdateData = {


    /* =================================================
       INIT
    ================================================= */

    init(){

        if(
            initialized
        ){

            return UpdateData;

        }


        createOverlay();

        bindEvents();

        initialized =
            true;


        return UpdateData;

    },


    /* =================================================
       OPEN

       options :

       {
           title,
           subtitle,

           records,

           getRecordId,
           getRecordLabel,
           getRecordMeta,

           renderDetail,
           renderFields,

           validate,
           buildChanges,

           onSelect,
           onAdd,
           onAdded,
           onRemove,

           validateBatch,

           onConfirm,
           onConfirmed,

           getPendingLabel,

           emptyText
       }
    ================================================= */

    async open(
        options = {}
    ){

        UpdateData.init();


        currentOptions =
            normalizeOptions(
                options
            );


        currentRecords =
            Array.isArray(
                currentOptions.records
            )
            ? [
                ...currentOptions.records
            ]
            : [];


        selectedRecord =
            null;


        selectedValue =
            null;


        pendingChanges =
            normalizePending(
                currentOptions.pending
            );


        isBusy =
            false;


        renderBase();


        renderPicker();


        renderDetail();


        renderPending();


        show();


        return UpdateData;

    },


    /* =================================================
       CLOSE
    ================================================= */

    close(){

        hide();


        selectedRecord =
            null;


        selectedValue =
            null;


        isBusy =
            false;


        currentOptions =
            null;


        currentRecords =
            [];


        pendingChanges =
            [];


        return UpdateData;

    },


    /* =================================================
       GET STATE
    ================================================= */

    getSelectedRecord(){

        return selectedRecord;

    },


    getPending(){

        return [
            ...pendingChanges
        ];

    },


    getPendingCount(){

        return pendingChanges.length;

    },


    /* =================================================
       SET RECORDS

       Bisa dipakai workspace setelah data
       berubah tanpa membuka ulang overlay.
    ================================================= */

    setRecords(
        records = []
    ){

        currentRecords =
            Array.isArray(records)
            ? [
                ...records
            ]
            : [];


        if(
            selectedRecord
        ){

            const selectedId =
                getRecordIdentity(
                    selectedRecord
                );


            const stillExists =
                currentRecords.find(
                    record =>
                        getRecordIdentity(
                            record
                        ) === selectedId
                );


            if(
                !stillExists
            ){

                selectedRecord =
                    null;

                selectedValue =
                    null;

                renderDetail();

            }

        }


        renderPicker();

        return UpdateData;

    },


    /* =================================================
       SET PENDING
    ================================================= */

    setPending(
        pending = []
    ){

        pendingChanges =
            normalizePending(
                pending
            );


        renderPending();


        renderPicker();


        updateButtons();


        return UpdateData;

    },


    /* =================================================
       SELECT RECORD
    ================================================= */

    selectRecord(
        record
    ){

        if(
            isBusy
        ){

            return;

        }


        if(
            !record
        ){

            return;

        }


        selectedRecord =
            record;


        selectedValue =
            getRecordIdentity(
                record
            );


        closePicker();


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
                    "UpdateData onSelect error:",
                    error
                );

            }

        }


        renderPicker();

        renderDetail();


        return UpdateData;

    },


    /* =================================================
       ADD
    ================================================= */

    async add(){

        if(
            isBusy
        ){

            return;

        }


        if(
            !selectedRecord
        ){

            return;

        }


        const validation =
            validateCurrent();


        if(
            validation !== true
        ){

            showValidationMessage(
                validation
            );

            return;

        }


        const changes =
            buildCurrentChanges();


        if(
            changes === null
            ||
            typeof changes === "undefined"
        ){

            return;

        }


        const item = {

            record:
                selectedRecord,

            changes:
                changes

        };


        /* =============================================
           WORKSPACE CALLBACK

           Workspace dapat melakukan business-rule
           khusus sebelum item dimasukkan ke batch.
        ============================================= */

        let result =
            item;


        if(
            typeof currentOptions.onAdd ===
            "function"
        ){

            try{

                result =
                    await currentOptions.onAdd(
                        item,
                        {
                            record:
                                selectedRecord,

                            changes:
                                changes,

                            pending:
                                [
                                    ...pendingChanges
                                ]
                        }
                    );

            }
            catch(error){

                console.error(
                    "UpdateData onAdd error:",
                    error
                );

                showResult(
                    "error",
                    getErrorMessage(
                        error
                    )
                );

                return;

            }

        }


        /* =============================================
           RESULT NORMALIZATION
        ============================================= */

        if(
            result === false
        ){

            return;

        }


        const pendingItem =
            result === true
            ? item
            : (
                result
                &&
                typeof result === "object"
                ? result
                : item
            );


        /* =============================================
           DUPLICATE PROTECTION
        ============================================= */

        const duplicate =
            pendingChanges.some(
                existing =>
                    isSamePending(
                        existing,
                        pendingItem
                    )
            );


        if(
            duplicate
        ){

            showResult(
                "warning",
                currentOptions.duplicateText
            );

            return;

        }


        pendingChanges.push(
            pendingItem
        );


        /* =============================================
           CALLBACK
        ============================================= */

        if(
            typeof currentOptions.onAdded ===
            "function"
        ){

            try{

                await currentOptions.onAdded(
                    pendingItem,
                    [
                        ...pendingChanges
                    ]
                );

            }
            catch(error){

                console.error(
                    "UpdateData onAdded error:",
                    error
                );

            }

        }


        /* =============================================
           REFRESH
        ============================================= */

        renderPending();


        renderPicker();


        clearCurrentEditor();


        updateButtons();


        showResult(
            "success",
            currentOptions.addedText
        );


        return pendingItem;

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

            return;

        }


        if(
            index < 0
            ||
            index >= pendingChanges.length
        ){

            return;

        }


        const removed =
            pendingChanges[
                index
            ];


        pendingChanges.splice(
            index,
            1
        );


        if(
            typeof currentOptions.onRemove ===
            "function"
        ){

            try{

                await currentOptions.onRemove(
                    removed,
                    index,
                    [
                        ...pendingChanges
                    ]
                );

            }
            catch(error){

                console.error(
                    "UpdateData onRemove error:",
                    error
                );

            }

        }


        renderPending();


        renderPicker();


        updateButtons();


        return removed;

    },


    /* =================================================
       CLEAR PENDING
    ================================================= */

    clearPending(){

        pendingChanges =
            [];


        renderPending();


        renderPicker();


        updateButtons();


        return UpdateData;

    },


    /* =================================================
       CONFIRM
    ================================================= */

    async confirm(){

        if(
            isBusy
        ){

            return;

        }


        if(
            pendingChanges.length === 0
        ){

            return;

        }


        /* =============================================
           VALIDATE BATCH
        ============================================= */

        if(
            typeof currentOptions.validateBatch ===
            "function"
        ){

            let validation;


            try{

                validation =
                    await currentOptions.validateBatch(
                        [
                            ...pendingChanges
                        ]
                    );

            }
            catch(error){

                console.error(
                    "UpdateData validateBatch error:",
                    error
                );

                showResult(
                    "error",
                    getErrorMessage(
                        error
                    )
                );

                return;

            }


            if(
                validation !== true
            ){

                showResult(
                    "warning",
                    validation
                );

                return;

            }

        }


        /* =============================================
           BUSY
        ============================================= */

        setBusy(
            true
        );


        showResult(
            "loading",
            currentOptions.confirmLoadingText
        );


        let result;


        try{

            if(
                typeof currentOptions.onConfirm ===
                "function"
            ){

                result =
                    await currentOptions.onConfirm(
                        [
                            ...pendingChanges
                        ]
                    );

            }
            else{

                result = {

                    success:
                        true,

                    updated:
                        [
                            ...pendingChanges
                        ]

                };

            }

        }
        catch(error){

            console.error(
                "UpdateData confirm error:",
                error
            );


            result = {

                success:
                    false,

                message:
                    getErrorMessage(
                        error
                    ),

                error

            };

        }


        setBusy(
            false
        );


        /* =============================================
           HANDLE RESULT
        ============================================= */

        const normalized =
            normalizeConfirmResult(
                result
            );


        if(
            normalized.success
        ){

            pendingChanges =
                normalized.remaining;


            renderPending();


            renderPicker();


            renderDetail();


            updateButtons();


            showResult(
                "success",
                normalized.message
            );


            if(
                typeof currentOptions.onConfirmed ===
                "function"
            ){

                try{

                    await currentOptions.onConfirmed(
                        normalized
                    );

                }
                catch(error){

                    console.error(
                        "UpdateData onConfirmed error:",
                        error
                    );

                }

            }

        }
        else{

            pendingChanges =
                normalized.remaining;


            renderPending();


            renderPicker();


            updateButtons();


            showResult(
                "error",
                normalized.message
            );

        }


        return normalized;

    }

};


/* =====================================================
   NORMALIZE OPTIONS
===================================================== */

function normalizeOptions(
    options
){

    return {

        title:
            options.title
            ??
            "Edit Input",

        subtitle:
            options.subtitle
            ??
            "Ubah data yang sudah tersimpan",

        records:
            Array.isArray(
                options.records
            )
            ? options.records
            : [],

        pending:
            Array.isArray(
                options.pending
            )
            ? options.pending
            : [],

        getRecordId:
            typeof options.getRecordId ===
            "function"
            ? options.getRecordId
            : defaultGetRecordId,

        getRecordLabel:
            typeof options.getRecordLabel ===
            "function"
            ? options.getRecordLabel
            : defaultGetRecordLabel,

        getRecordMeta:
            typeof options.getRecordMeta ===
            "function"
            ? options.getRecordMeta
            : defaultGetRecordMeta,

        renderDetail:
            typeof options.renderDetail ===
            "function"
            ? options.renderDetail
            : defaultRenderDetail,

        renderFields:
            typeof options.renderFields ===
            "function"
            ? options.renderFields
            : null,

        getFieldValue:
            typeof options.getFieldValue ===
            "function"
            ? options.getFieldValue
            : defaultGetFieldValue,

        validate:
            typeof options.validate ===
            "function"
            ? options.validate
            : defaultValidate,

        buildChanges:
            typeof options.buildChanges ===
            "function"
            ? options.buildChanges
            : defaultBuildChanges,

        onSelect:
            typeof options.onSelect ===
            "function"
            ? options.onSelect
            : null,

        onAdd:
            typeof options.onAdd ===
            "function"
            ? options.onAdd
            : null,

        onAdded:
            typeof options.onAdded ===
            "function"
            ? options.onAdded
            : null,

        onRemove:
            typeof options.onRemove ===
            "function"
            ? options.onRemove
            : null,

        validateBatch:
            typeof options.validateBatch ===
            "function"
            ? options.validateBatch
            : null,

        onConfirm:
            typeof options.onConfirm ===
            "function"
            ? options.onConfirm
            : null,

        onConfirmed:
            typeof options.onConfirmed ===
            "function"
            ? options.onConfirmed
            : null,

        getPendingLabel:
            typeof options.getPendingLabel ===
            "function"
            ? options.getPendingLabel
            : defaultGetPendingLabel,

        emptyText:
            options.emptyText
            ??
            "Tidak ada data yang dapat diedit.",

        searchPlaceholder:
            options.searchPlaceholder
            ??
            "Cari data...",

        pickerPlaceholder:
            options.pickerPlaceholder
            ??
            "Pilih data",

        addedText:
            options.addedText
            ??
            "Perubahan ditambahkan.",

        duplicateText:
            options.duplicateText
            ??
            "Data tersebut sudah ditambahkan.",

        confirmLoadingText:
            options.confirmLoadingText
            ??
            "Menyimpan perubahan...",

        confirmText:
            options.confirmText
            ??
            "Konfirmasi",

        addText:
            options.addText
            ??
            "Tambahkan",

        removeText:
            options.removeText
            ??
            "Hapus"

    };

}


/* =====================================================
   CREATE OVERLAY
===================================================== */

function createOverlay(){

    if(
        document.getElementById(
            IDS.overlay
        )
    ){

        overlay =
            document.getElementById(
                IDS.overlay
            );

        return;

    }


    overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        IDS.overlay;


    overlay.className =
        "global-update-data-overlay";


    overlay.innerHTML = `

        <div
            id="${IDS.backdrop}"
            class="global-update-data-backdrop"
        ></div>


        <div
            id="${IDS.panel}"
            class="global-update-data-panel"
            role="dialog"
            aria-modal="true"
        >

            <header
                class="global-update-data-header"
            >

                <div
                    class="global-update-data-header-content"
                >

                    <h2
                        id="${IDS.title}"
                        class="global-update-data-title"
                    >
                        Edit Input
                    </h2>

                    <p
                        id="${IDS.subtitle}"
                        class="global-update-data-subtitle"
                    >
                        Ubah data yang sudah tersimpan
                    </p>

                </div>


                <button
                    id="${IDS.close}"
                    class="global-update-data-close"
                    type="button"
                    aria-label="Tutup"
                >
                    ×
                </button>

            </header>


            <main
                class="global-update-data-content"
            >

                <!-- ==================================
                     PICKER
                =================================== -->

                <section
                    id="${IDS.picker}"
                    class="global-update-data-picker-section"
                >

                    <div
                        class="global-update-data-section-label"
                    >
                        Pilih data
                    </div>


                    <div
                        class="global-update-data-picker"
                    >

                        <button
                            id="${IDS.pickerButton}"
                            class="global-update-data-picker-button"
                            type="button"
                            aria-expanded="false"
                        >

                            <span
                                id="${IDS.pickerLabel}"
                                class="global-update-data-picker-label"
                            >
                                Pilih data
                            </span>


                            <span
                                id="${IDS.pickerArrow}"
                                class="global-update-data-picker-arrow"
                            >
                                ⌄
                            </span>

                        </button>


                        <div
                            id="${IDS.pickerPanel}"
                            class="global-update-data-picker-panel"
                            hidden
                        >

                            <div
                                class="global-update-data-picker-search-wrap"
                            >

                                <input
                                    id="${IDS.pickerSearch}"
                                    class="global-update-data-picker-search"
                                    type="search"
                                    autocomplete="off"
                                    placeholder="Cari data..."
                                >

                            </div>


                            <div
                                id="${IDS.pickerList}"
                                class="global-update-data-picker-list"
                            ></div>

                        </div>

                    </div>

                </section>


                <!-- ==================================
                     DETAIL
                =================================== -->

                <section
                    id="${IDS.detail}"
                    class="global-update-data-detail"
                ></section>


                <!-- ==================================
                     FIELDS
                =================================== -->

                <section
                    id="${IDS.fields}"
                    class="global-update-data-fields"
                ></section>


                <!-- ==================================
                     ADD
                =================================== -->

                <section
                    id="${IDS.action}"
                    class="global-update-data-action"
                >

                    <button
                        id="${IDS.add}"
                        class="global-update-data-add"
                        type="button"
                    >
                        Tambahkan
                    </button>

                </section>


                <!-- ==================================
                     PENDING
                =================================== -->

                <section
                    id="${IDS.pending}"
                    class="global-update-data-pending"
                >

                    <div
                        class="global-update-data-pending-header"
                    >

                        <div
                            id="${IDS.pendingTitle}"
                            class="global-update-data-pending-title"
                        >
                            Sudah Ditambahkan
                        </div>


                        <span
                            id="${IDS.pendingCount}"
                            class="global-update-data-pending-count"
                        >
                            0
                        </span>

                    </div>


                    <div
                        id="${IDS.pendingList}"
                        class="global-update-data-pending-list"
                    ></div>

                </section>


                <!-- ==================================
                     CONFIRM
                =================================== -->

                <section
                    class="global-update-data-confirm-section"
                >

                    <button
                        id="${IDS.confirm}"
                        class="global-update-data-confirm"
                        type="button"
                    >
                        Konfirmasi
                    </button>

                </section>


                <!-- ==================================
                     RESULT
                =================================== -->

                <section
                    id="${IDS.result}"
                    class="global-update-data-result"
                    aria-live="polite"
                ></section>

            </main>

        </div>

    `;


    document.body.appendChild(
        overlay
    );

}


/* =====================================================
   BIND EVENTS
===================================================== */

function bindEvents(){

    if(
        !overlay
    ){

        overlay =
            document.getElementById(
                IDS.overlay
            );

    }


    if(
        !overlay
    ){

        return;

    }


    const closeButton =
        document.getElementById(
            IDS.close
        );


    const backdrop =
        document.getElementById(
            IDS.backdrop
        );


    const pickerButton =
        document.getElementById(
            IDS.pickerButton
        );


    const search =
        document.getElementById(
            IDS.pickerSearch
        );


    const addButton =
        document.getElementById(
            IDS.add
        );


    const confirmButton =
        document.getElementById(
            IDS.confirm
        );


    if(
        closeButton
    ){

        closeButton.addEventListener(
            "click",
            () => {

                if(
                    !isBusy
                ){

                    UpdateData.close();

                }

            }
        );

    }


    if(
        backdrop
    ){

        backdrop.addEventListener(
            "click",
            () => {

                if(
                    !isBusy
                ){

                    UpdateData.close();

                }

            }
        );

    }


    if(
        pickerButton
    ){

        pickerButton.addEventListener(
            "click",
            () => {

                if(
                    isBusy
                ){

                    return;

                }


                togglePicker();

            }
        );

    }


    if(
        search
    ){

        search.addEventListener(
            "input",
            () => {

                renderPickerList(
                    search.value
                );

            }
        );

    }


    if(
        addButton
    ){

        addButton.addEventListener(
            "click",
            () => {

                UpdateData.add();

            }
        );

    }


    if(
        confirmButton
    ){

        confirmButton.addEventListener(
            "click",
            () => {

                UpdateData.confirm();

            }
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if(
                !overlay
                ||
                !overlay.classList.contains(
                    "is-open"
                )
            ){

                return;

            }


            if(
                event.key === "Escape"
            ){

                if(
                    isPickerOpen()
                ){

                    closePicker();

                    return;

                }


                if(
                    !isBusy
                ){

                    UpdateData.close();

                }

            }

        }
    );

}


/* =====================================================
   RENDER BASE
===================================================== */

function renderBase(){

    const title =
        document.getElementById(
            IDS.title
        );


    const subtitle =
        document.getElementById(
            IDS.subtitle
        );


    if(
        title
    ){

        title.textContent =
            currentOptions.title;

    }


    if(
        subtitle
    ){

        subtitle.textContent =
            currentOptions.subtitle;

    }


    const search =
        document.getElementById(
            IDS.pickerSearch
        );


    if(
        search
    ){

        search.placeholder =
            currentOptions.searchPlaceholder;

    }


    const addButton =
        document.getElementById(
            IDS.add
        );


    if(
        addButton
    ){

        addButton.textContent =
            currentOptions.addText;

    }


    const confirmButton =
        document.getElementById(
            IDS.confirm
        );


    if(
        confirmButton
    ){

        confirmButton.textContent =
            currentOptions.confirmText;

    }

}


/* =====================================================
   RENDER PICKER
===================================================== */

function renderPicker(){

    const label =
        document.getElementById(
            IDS.pickerLabel
        );


    if(
        label
    ){

        if(
            selectedRecord
        ){

            label.textContent =
                getRecordLabel(
                    selectedRecord
                );

        }
        else{

            label.textContent =
                currentOptions?.pickerPlaceholder
                ??
                "Pilih data";

        }

    }


    renderPickerList();

}


/* =====================================================
   RENDER PICKER LIST
===================================================== */

function renderPickerList(
    searchTerm = ""
){

    const list =
        document.getElementById(
            IDS.pickerList
        );


    if(
        !list
    ){

        return;

    }


    const term =
        String(
            searchTerm
            ??
            ""
        )
        .trim()
        .toLowerCase();


    const filtered =
        currentRecords.filter(
            record => {

                if(
                    !term
                ){

                    return true;

                }


                const label =
                    String(
                        getRecordLabel(
                            record
                        )
                        ??
                        ""
                    )
                    .toLowerCase();


                const meta =
                    String(
                        getRecordMeta(
                            record
                        )
                        ??
                        ""
                    )
                    .toLowerCase();


                const id =
                    String(
                        currentOptions.getRecordId(
                            record
                        )
                        ??
                        ""
                    )
                    .toLowerCase();


                return (
                    label.includes(term)
                    ||
                    meta.includes(term)
                    ||
                    id.includes(term)
                );

            }
        );


    if(
        filtered.length === 0
    ){

        list.innerHTML = `

            <div
                class="global-update-data-picker-empty"
            >
                ${escapeHTML(
                    term
                    ? "Data tidak ditemukan."
                    : currentOptions.emptyText
                )}
            </div>

        `;


        return;

    }


    list.innerHTML =
        filtered
        .map(
            record =>
                renderPickerItem(
                    record
                )
        )
        .join("");


    list
        .querySelectorAll(
            "[data-update-record]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                element.dataset.index
                            );


                        const record =
                            filtered[
                                index
                            ];


                        if(
                            record
                        ){

                            UpdateData.selectRecord(
                                record
                            );

                        }

                    }
                );

            }
        );

}


/* =====================================================
   PICKER ITEM
===================================================== */

function renderPickerItem(
    record
){

    const identity =
        getRecordIdentity(
            record
        );


    const label =
        getRecordLabel(
            record
        );


    const meta =
        getRecordMeta(
            record
        );


    const selected =
        selectedRecord
        &&
        getRecordIdentity(
            selectedRecord
        ) === identity;


    const pending =
        hasPendingRecord(
            record
        );


    return `

        <button
            type="button"
            class="
                global-update-data-picker-item
                ${selected ? "is-selected" : ""}
                ${pending ? "is-pending" : ""}
            "
            data-update-record="true"
            data-index="${getFilteredIndex(
                record
            )}"
        >

            <span
                class="global-update-data-picker-item-main"
            >

                <span
                    class="global-update-data-picker-item-label"
                >
                    ${escapeHTML(
                        label
                    )}
                </span>


                ${
                    meta
                    ?
                    `
                    <span
                        class="global-update-data-picker-item-meta"
                    >
                        ${escapeHTML(
                            meta
                        )}
                    </span>
                    `
                    :
                    ""
                }

            </span>


            ${
                pending
                ?
                `
                <span
                    class="global-update-data-picker-item-status"
                >
                    Sudah ditambahkan
                </span>
                `
                :
                ""
            }

        </button>

    `;

}


/* =====================================================
   GET FILTERED INDEX
===================================================== */

function getFilteredIndex(
    record
){

    if(
        !currentRecords.length
    ){

        return 0;

    }


    const search =
        document.getElementById(
            IDS.pickerSearch
        );


    const term =
        String(
            search?.value
            ??
            ""
        )
        .trim()
        .toLowerCase();


    const filtered =
        currentRecords.filter(
            item => {

                if(
                    !term
                ){

                    return true;

                }


                const label =
                    String(
                        getRecordLabel(
                            item
                        )
                        ??
                        ""
                    )
                    .toLowerCase();


                const meta =
                    String(
                        getRecordMeta(
                            item
                        )
                        ??
                        ""
                    )
                    .toLowerCase();


                const id =
                    String(
                        currentOptions.getRecordId(
                            item
                        )
                        ??
                        ""
                    )
                    .toLowerCase();


                return (
                    label.includes(term)
                    ||
                    meta.includes(term)
                    ||
                    id.includes(term)
                );

            }
        );


    return filtered.indexOf(
        record
    );

}


/* =====================================================
   RENDER DETAIL
===================================================== */

function renderDetail(){

    const container =
        document.getElementById(
            IDS.detail
        );


    if(
        !container
    ){

        return;

    }


    if(
        !selectedRecord
    ){

        container.innerHTML = `

            <div
                class="global-update-data-empty-detail"
            >

                <div
                    class="global-update-data-empty-detail-icon"
                >
                    ✏️
                </div>


                <div
                    class="global-update-data-empty-detail-title"
                >
                    Pilih data untuk diedit
                </div>


                <div
                    class="global-update-data-empty-detail-text"
                >
                    Pilih salah satu data dari picker di atas.
                </div>

            </div>

        `;


        renderFields();

        updateButtons();

        return;

    }


    let html =
        "";


    try{

        html =
            currentOptions.renderDetail(
                selectedRecord
            );

    }
    catch(error){

        console.error(
            "UpdateData renderDetail error:",
            error
        );


        html =
            defaultRenderDetail(
                selectedRecord
            );

    }


    container.innerHTML =
        html
        ??
        "";


    renderFields();


    updateButtons();

}


/* =====================================================
   RENDER FIELDS
===================================================== */

function renderFields(){

    const container =
        document.getElementById(
            IDS.fields
        );


    if(
        !container
    ){

        return;

    }


    container.innerHTML =
        "";


    if(
        !selectedRecord
    ){

        return;

    }


    if(
        typeof currentOptions.renderFields !==
        "function"
    ){

        return;

    }


    try{

        currentOptions.renderFields(
            selectedRecord,
            container,
            {
                getValue:
                    field =>
                        currentOptions.getFieldValue(
                            selectedRecord,
                            field
                        ),

                getSelectedRecord:
                    () =>
                        selectedRecord,

                getPending:
                    () =>
                        [
                            ...pendingChanges
                        ]

            }
        );

    }
    catch(error){

        console.error(
            "UpdateData renderFields error:",
            error
        );

    }

}


/* =====================================================
   CLEAR CURRENT EDITOR
===================================================== */

function clearCurrentEditor(){

    selectedRecord =
        null;


    selectedValue =
        null;


    const search =
        document.getElementById(
            IDS.pickerSearch
        );


    if(
        search
    ){

        search.value =
            "";

    }


    closePicker();


    renderPicker();


    renderDetail();

}


/* =====================================================
   VALIDATE CURRENT
===================================================== */

function validateCurrent(){

    if(
        !selectedRecord
    ){

        return "Pilih data terlebih dahulu.";

    }


    try{

        const result =
            currentOptions.validate(
                selectedRecord,
                {
                    pending:
                        [
                            ...pendingChanges
                        ]
                }
            );


        if(
            result === true
        ){

            return true;

        }


        if(
            typeof result === "string"
            &&
            result.trim()
        ){

            return result;

        }


        return "Periksa kembali data yang diubah.";

    }
    catch(error){

        console.error(
            "UpdateData validation error:",
            error
        );


        return getErrorMessage(
            error
        );

    }

}


/* =====================================================
   BUILD CHANGES
===================================================== */

function buildCurrentChanges(){

    try{

        return currentOptions.buildChanges(
            selectedRecord,
            {
                pending:
                    [
                        ...pendingChanges
                    ]
            }
        );

    }
    catch(error){

        console.error(
            "UpdateData buildChanges error:",
            error
        );


        showResult(
            "error",
            getErrorMessage(
                error
            )
        );


        return null;

    }

}


/* =====================================================
   RENDER PENDING
===================================================== */

function renderPending(){

    const section =
        document.getElementById(
            IDS.pending
        );


    const title =
        document.getElementById(
            IDS.pendingTitle
        );


    const count =
        document.getElementById(
            IDS.pendingCount
        );


    const list =
        document.getElementById(
            IDS.pendingList
        );


    if(
        !section
        ||
        !title
        ||
        !count
        ||
        !list
    ){

        return;

    }


    count.textContent =
        String(
            pendingChanges.length
        );


    if(
        pendingChanges.length === 0
    ){

        section.classList.remove(
            "has-items"
        );


        list.innerHTML = `

            <div
                class="global-update-data-pending-empty"
            >
                Belum ada perubahan yang ditambahkan.
            </div>

        `;


        return;

    }


    section.classList.add(
        "has-items"
    );


    list.innerHTML =
        pendingChanges
        .map(
            (
                item,
                index
            ) =>
                renderPendingItem(
                    item,
                    index
                )
        )
        .join("");


    list
        .querySelectorAll(
            "[data-remove-index]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        UpdateData.remove(
                            Number(
                                button.dataset.removeIndex
                            )
                        );

                    }
                );

            }
        );

}


/* =====================================================
   RENDER PENDING ITEM
===================================================== */

function renderPendingItem(
    item,
    index
){

    const label =
        currentOptions.getPendingLabel(
            item,
            index
        );


    return `

        <article
            class="global-update-data-pending-item"
        >

            <div
                class="global-update-data-pending-item-content"
            >

                <div
                    class="global-update-data-pending-item-title"
                >
                    ${escapeHTML(
                        label?.title
                        ??
                        "Perubahan"
                    )}
                </div>


                ${
                    label?.description
                    ?
                    `
                    <div
                        class="global-update-data-pending-item-description"
                    >
                        ${escapeHTML(
                            label.description
                        )}
                    </div>
                    `
                    :
                    ""
                }

            </div>


            <button
                type="button"
                class="global-update-data-pending-remove"
                data-remove-index="${index}"
            >
                ${escapeHTML(
                    currentOptions.removeText
                )}
            </button>

        </article>

    `;

}


/* =====================================================
   UPDATE BUTTONS
===================================================== */

function updateButtons(){

    const addButton =
        document.getElementById(
            IDS.add
        );


    const confirmButton =
        document.getElementById(
            IDS.confirm
        );


    if(
        addButton
    ){

        addButton.disabled =
            isBusy
            ||
            !selectedRecord;

    }


    if(
        confirmButton
    ){

        confirmButton.disabled =
            isBusy
            ||
            pendingChanges.length === 0;

    }

}


/* =====================================================
   BUSY
===================================================== */

function setBusy(
    value
){

    isBusy =
        Boolean(
            value
        );


    if(
        overlay
    ){

        overlay.classList.toggle(
            "is-busy",
            isBusy
        );

    }


    updateButtons();

}


/* =====================================================
   SHOW
===================================================== */

function show(){

    if(
        !overlay
    ){

        return;

    }


    overlay.classList.add(
        "is-open"
    );


    document.body.classList.add(
        "update-data-open"
    );


    updateButtons();

}


/* =====================================================
   HIDE
===================================================== */

function hide(){

    if(
        overlay
    ){

        overlay.classList.remove(
            "is-open",
            "is-busy"
        );

    }


    document.body.classList.remove(
        "update-data-open"
    );


    closePicker();

}


/* =====================================================
   PICKER TOGGLE
===================================================== */

function togglePicker(){

    if(
        isPickerOpen()
    ){

        closePicker();

    }
    else{

        openPicker();

    }

}


/* =====================================================
   PICKER OPEN
===================================================== */

function openPicker(){

    const panel =
        document.getElementById(
            IDS.pickerPanel
        );


    const button =
        document.getElementById(
            IDS.pickerButton
        );


    const search =
        document.getElementById(
            IDS.pickerSearch
        );


    if(
        !panel
    ){

        return;

    }


    panel.hidden =
        false;


    button?.setAttribute(
        "aria-expanded",
        "true"
    );


    button?.classList.add(
        "is-open"
    );


    renderPickerList(
        search?.value
        ??
        ""
    );


    requestAnimationFrame(
        () => {

            search?.focus();

        }
    );

}


/* =====================================================
   PICKER CLOSE
===================================================== */

function closePicker(){

    const panel =
        document.getElementById(
            IDS.pickerPanel
        );


    const button =
        document.getElementById(
            IDS.pickerButton
        );


    if(
        panel
    ){

        panel.hidden =
            true;

    }


    button?.setAttribute(
        "aria-expanded",
        "false"
    );


    button?.classList.remove(
        "is-open"
    );

}


/* =====================================================
   PICKER STATE
===================================================== */

function isPickerOpen(){

    const panel =
        document.getElementById(
            IDS.pickerPanel
        );


    return Boolean(
        panel
        &&
        !panel.hidden
    );

}


/* =====================================================
   RESULT
===================================================== */

function showResult(
    type,
    message
){

    const container =
        document.getElementById(
            IDS.result
        );


    if(
        !container
    ){

        return;

    }


    const safeMessage =
        escapeHTML(
            message
            ??
            ""
        );


    container.className =
        `global-update-data-result ${type}`;


    if(
        type === "loading"
    ){

        container.innerHTML = `

            <div
                class="global-update-data-result-icon"
            >
                ⏳
            </div>


            <div
                class="global-update-data-result-message"
            >
                ${safeMessage}
            </div>

        `;

        return;

    }


    if(
        type === "success"
    ){

        container.innerHTML = `

            <div
                class="global-update-data-result-icon"
            >
                ✓
            </div>


            <div
                class="global-update-data-result-message"
            >
                ${safeMessage}
            </div>

        `;

        return;

    }


    if(
        type === "error"
    ){

        container.innerHTML = `

            <div
                class="global-update-data-result-icon"
            >
                !
            </div>


            <div
                class="global-update-data-result-message"
            >
                ${safeMessage}
            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div
            class="global-update-data-result-icon"
        >
            •
        </div>


        <div
            class="global-update-data-result-message"
        >
            ${safeMessage}
        </div>

    `;

}


/* =====================================================
   VALIDATION MESSAGE
===================================================== */

function showValidationMessage(
    message
){

    showResult(
        "warning",
        message
        ||
        "Periksa kembali data."
    );

}


/* =====================================================
   HAS PENDING RECORD
===================================================== */

function hasPendingRecord(
    record
){

    return pendingChanges.some(
        item => {

            const pendingRecord =
                item?.record
                ??
                item;


            return (
                getRecordIdentity(
                    pendingRecord
                )
                ===
                getRecordIdentity(
                    record
                )
            );

        }
    );

}


/* =====================================================
   SAME PENDING
===================================================== */

function isSamePending(
    first,
    second
){

    const firstRecord =
        first?.record
        ??
        first;


    const secondRecord =
        second?.record
        ??
        second;


    return (
        getRecordIdentity(
            firstRecord
        )
        ===
        getRecordIdentity(
            secondRecord
        )
    );

}


/* =====================================================
   RECORD IDENTITY
===================================================== */

function getRecordIdentity(
    record
){

    if(
        !record
    ){

        return "";

    }


    try{

        return String(
            currentOptions?.getRecordId(
                record
            )
            ??
            ""
        );

    }
    catch(error){

        return String(
            defaultGetRecordId(
                record
            )
        );

    }

}


/* =====================================================
   DEFAULT RECORD ID
===================================================== */

function defaultGetRecordId(
    record
){

    if(
        !record
    ){

        return "";

    }


    return (
        record.id
        ??
        record.ID
        ??
        record.Id
        ??
        record.key
        ??
        JSON.stringify(
            record
        )
    );

}


/* =====================================================
   DEFAULT RECORD LABEL
===================================================== */

function defaultGetRecordLabel(
    record
){

    if(
        !record
    ){

        return "-";

    }


    return (
        record.project
        ??
        record.nama
        ??
        record.name
        ??
        record.title
        ??
        record.id
        ??
        "-"
    );

}


/* =====================================================
   DEFAULT RECORD META
===================================================== */

function defaultGetRecordMeta(
    record
){

    if(
        !record
    ){

        return "";

    }


    const type =
        record.type
        ??
        record.Type
        ??
        "";


    const status =
        record.status
        ??
        record.Status
        ??
        "";


    return [
        type,
        status
    ]
    .filter(
        Boolean
    )
    .join(
        " · "
    );

}


/* =====================================================
   DEFAULT DETAIL
===================================================== */

function defaultRenderDetail(
    record
){

    if(
        !record
    ){

        return "";

    }


    const id =
        record.id
        ??
        record.ID
        ??
        "-";


    const project =
        record.project
        ??
        record.nama
        ??
        "-";


    const type =
        record.type
        ??
        record.Type
        ??
        "-";


    const status =
        record.status
        ??
        record.Status
        ??
        "-";


    return `

        <div
            class="global-update-data-detail-card"
        >

            <div
                class="global-update-data-detail-row"
            >

                <span
                    class="global-update-data-detail-label"
                >
                    ID
                </span>


                <strong
                    class="global-update-data-detail-value"
                >
                    ${escapeHTML(
                        id
                    )}
                </strong>

            </div>


            <div
                class="global-update-data-detail-row"
            >

                <span
                    class="global-update-data-detail-label"
                >
                    Project
                </span>


                <strong
                    class="global-update-data-detail-value"
                >
                    ${escapeHTML(
                        project
                    )}
                </strong>

            </div>


            <div
                class="global-update-data-detail-row"
            >

                <span
                    class="global-update-data-detail-label"
                >
                    Type
                </span>


                <strong
                    class="global-update-data-detail-value"
                >
                    ${escapeHTML(
                        type
                    )}
                </strong>

            </div>


            <div
                class="global-update-data-detail-row"
            >

                <span
                    class="global-update-data-detail-label"
                >
                    Status
                </span>


                <strong
                    class="global-update-data-detail-value"
                >
                    ${escapeHTML(
                        status
                    )}
                </strong>

            </div>

        </div>

    `;

}


/* =====================================================
   DEFAULT FIELD VALUE
===================================================== */

function defaultGetFieldValue(
    record,
    field
){

    if(
        !record
    ){

        return "";

    }


    if(
        typeof field === "string"
    ){

        return (
            record[
                field
            ]
            ??
            ""
        );

    }


    if(
        field
        &&
        field.id
    ){

        return (
            record[
                field.id
            ]
            ??
            ""
        );

    }


    return "";

}


/* =====================================================
   DEFAULT VALIDATE
===================================================== */

function defaultValidate(){

    return true;

}


/* =====================================================
   DEFAULT BUILD CHANGES
===================================================== */

function defaultBuildChanges(
    record
){

    return {

        ...record

    };

}


/* =====================================================
   DEFAULT PENDING LABEL
===================================================== */

function defaultGetPendingLabel(
    item
){

    const record =
        item?.record
        ??
        item;


    const changes =
        item?.changes
        ??
        {};


    const title =
        currentOptions.getRecordLabel(
            record
        );


    const changeText =
        Object.entries(
            changes
        )
        .map(
            (
                [
                    key,
                    value
                ]
            ) =>
                `${key}: ${value}`
        )
        .join(
            " · "
        );


    return {

        title:
            title
            ??
            "Perubahan",

        description:
            changeText

    };

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


    return pending
        .filter(
            Boolean
        )
        .map(
            item => {

                if(
                    item
                    &&
                    Object.prototype.hasOwnProperty.call(
                        item,
                        "record"
                    )
                ){

                    return item;

                }


                return {

                    record:
                        item,

                    changes:
                        {}

                };

            }
        );

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

            success:
                true,

            message:
                "Semua perubahan berhasil dikonfirmasi.",

            remaining:
                [],

            updated:
                [],

            failed:
                []

        };

    }


    if(
        result === false
        ||
        result === null
        ||
        typeof result === "undefined"
    ){

        return {

            success:
                false,

            message:
                "Perubahan belum berhasil dikonfirmasi.",

            remaining:
                [
                    ...pendingChanges
                ],

            updated:
                [],

            failed:
                []

        };

    }


    if(
        typeof result === "object"
    ){

        return {

            success:
                result.success !== false,

            message:
                result.message
                ??
                (
                    result.success !== false
                    ?
                    "Semua perubahan berhasil dikonfirmasi."
                    :
                    "Sebagian atau seluruh perubahan gagal dikonfirmasi."
                ),

            remaining:
                Array.isArray(
                    result.remaining
                )
                ?
                result.remaining
                :
                (
                    result.success !== false
                    ?
                    []
                    :
                    [
                        ...pendingChanges
                    ]
                ),

            updated:
                result.updated
                ??
                [],

            failed:
                result.failed
                ??
                [],

            raw:
                result

        };

    }


    return {

        success:
            false,

        message:
            "Hasil konfirmasi tidak dikenali.",

        remaining:
            [
                ...pendingChanges
            ],

        updated:
            [],

        failed:
            []

    };

}


/* =====================================================
   ERROR MESSAGE
===================================================== */

function getErrorMessage(
    error
){

    if(
        !error
    ){

        return "Terjadi kesalahan.";

    }


    if(
        typeof error === "string"
    ){

        return error;

    }


    return (
        error.message
        ??
        error.error
        ??
        "Terjadi kesalahan."
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
    value
){

    return String(
        value
        ??
        ""
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
   EXPORT
===================================================== */

export default UpdateData;
