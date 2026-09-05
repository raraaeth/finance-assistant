/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : editrow.js
   Version      : 1.0.0

   Description :
   Generic Edit Input Row Engine

   Responsibility :
   - Menentukan maksimal 20 transaksi terkini
   - Mengambil 20 baris paling bawah dari source data
   - Menampilkan record terbaru terlebih dahulu
   - Target record menggunakan ID + Tanggal
   - ID dan Tanggal selalu locked
   - Field lain editable
   - Menyediakan default field renderer
   - Mendukung rule khusus workspace
   - Temporary staging
   - Multi-row editing
   - Duplicate protection
   - Batch confirmation
   - Komunikasi update hanya saat Konfirmasi

   Architecture :

   Workspace
       ↓
   EditRow.open()
       ↓
   getRecords()
       ↓
   ambil 20 baris terakhir
       ↓
   UpdateData
       ↓
   selected row
       ↓
   full detail
       ↓
   editable fields
       ↓
   Tambahkan
       ↓
   pending
       ↓
   Konfirmasi
       ↓
   Update.updateRow()
       ↓
   Apps Script
       ↓
   Google Sheet

   Principle :
   - Workspace agnostic
   - Tidak hardcode struktur Airdrop
   - Tidak hardcode field workspace
   - ID + Tanggal adalah target generic
   - Field khusus dapat diatur oleh workspace adapter
   - Tidak ada rule transaksi 1 minggu
   - Maksimal 20 transaksi terkini
   - Tidak melakukan update saat record dipilih
   - Tidak melakukan update saat Tambahkan
   - Apps Script hanya dipanggil saat Konfirmasi
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {
    getInputRaw
} from "./data.js";


import {
    Update
} from "./update.js";


import {
    UpdateData
} from "./updatedata.js";


/* =====================================================
   CONSTANT
===================================================== */

const MAX_RECORDS =
    20;


/* =====================================================
   STATE
===================================================== */

let currentOptions = {};

let sourceRecords = [];

let editableRecords = [];

let pendingChanges = [];

let selectedRecord = null;

let busy = false;


/* =====================================================
   NORMALIZE
===================================================== */

function normalizeText(
    value
){

    if(
        value === null ||
        value === undefined
    ){

        return "";

    }


    return String(
        value
    ).trim();

}


function normalizeKey(
    value
){

    return normalizeText(
        value
    ).toLowerCase();

}


/* =====================================================
   RECORD OBJECT
===================================================== */

function isObject(
    value
){

    return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
    );

}


/* =====================================================
   ID FIELD
===================================================== */

/*
   Workspace boleh override:

       getIdField(record)

   Kalau tidak ada,
   engine mencoba field umum.
*/

function getIdField(
    record
){

    if(
        typeof currentOptions.getIdField ===
        "function"
    ){

        try{

            const result =
                currentOptions.getIdField(
                    record
                );

            if(
                result
            ){

                return result;

            }

        }
        catch(error){

            console.warn(
                "[EditRow] getIdField failed:",
                error
            );

        }

    }


    const candidates = [

        "id",
        "ID",
        "Id",
        "key",
        "_id"

    ];


    for(
        const field of candidates
    ){

        if(
            record &&
            Object.prototype.hasOwnProperty.call(
                record,
                field
            )
        ){

            return field;

        }

    }


    return "id";

}


/* =====================================================
   DATE FIELD
===================================================== */

/*
   Workspace boleh override:

       getDateField(record)

   Default :
   tanggal / date / datetime
*/

function getDateField(
    record
){

    if(
        typeof currentOptions.getDateField ===
        "function"
    ){

        try{

            const result =
                currentOptions.getDateField(
                    record
                );

            if(
                result
            ){

                return result;

            }

        }
        catch(error){

            console.warn(
                "[EditRow] getDateField failed:",
                error
            );

        }

    }


    const candidates = [

        "tanggal",
        "Tanggal",
        "date",
        "Date",
        "datetime",
        "dateTime",
        "createdAt",
        "created_at"

    ];


    for(
        const field of candidates
    ){

        if(
            record &&
            Object.prototype.hasOwnProperty.call(
                record,
                field
            )
        ){

            return field;

        }

    }


    return "tanggal";

}


/* =====================================================
   GET ID
===================================================== */

function getRecordId(
    record
){

    const field =
        getIdField(
            record
        );


    return normalizeText(
        record?.[field]
    );

}


/* =====================================================
   GET DATE
===================================================== */

function getRecordDate(
    record
){

    const field =
        getDateField(
            record
        );


    return record?.[field] ??
           "";

}


/* =====================================================
   TARGET KEY
===================================================== */

/*
   Edit Row target :

       ID + Tanggal

   Contoh :

       AIR-001|2026-09-05

*/

function getTargetKey(
    record
){

    if(
        typeof currentOptions.getTargetKey ===
        "function"
    ){

        try{

            return normalizeText(
                currentOptions.getTargetKey(
                    record
                )
            );

        }
        catch(error){

            console.warn(
                "[EditRow] getTargetKey failed:",
                error
            );

        }

    }


    return [

        getRecordId(
            record
        ),

        normalizeText(
            getRecordDate(
                record
            )
        )

    ].join(
        "|"
    );

}


/* =====================================================
   FIELD LOCK
===================================================== */

function isLockedField(
    field,
    record
){

    const idField =
        getIdField(
            record
        );

    const dateField =
        getDateField(
            record
        );


    /*
       ID dan Tanggal selalu locked.
    */

    if(
        field === idField ||
        field === dateField
    ){

        return true;

    }


    /*
       Workspace dapat menambahkan
       field locked lain.
    */

    if(
        typeof currentOptions.isFieldLocked ===
        "function"
    ){

        try{

            return (
                currentOptions.isFieldLocked(
                    field,
                    record
                ) === true
            );

        }
        catch(error){

            console.warn(
                "[EditRow] isFieldLocked failed:",
                error
            );

        }

    }


    const lockedFields =
        Array.isArray(
            currentOptions.lockedFields
        )
            ? currentOptions.lockedFields
            : [];


    return lockedFields.includes(
        field
    );

}


/* =====================================================
   FIELD EDITABLE
===================================================== */

function isEditableField(
    field,
    record
){

    if(
        isLockedField(
            field,
            record
        )
    ){

        return false;

    }


    if(
        typeof currentOptions.isFieldEditable ===
        "function"
    ){

        try{

            return (
                currentOptions.isFieldEditable(
                    field,
                    record
                ) !== false
            );

        }
        catch(error){

            console.warn(
                "[EditRow] isFieldEditable failed:",
                error
            );

        }

    }


    const editableFields =
        currentOptions.editableFields;


    /*
       Jika workspace memberikan daftar
       editableFields, hanya field tersebut
       yang boleh diedit.
    */

    if(
        Array.isArray(
            editableFields
        )
    ){

        return editableFields.includes(
            field
        );

    }


    /*
       Default :
       semua field selain locked
       dapat diedit.
    */

    return true;

}


/* =====================================================
   FIELD LABEL
===================================================== */

function getFieldLabel(
    field,
    record
){

    if(
        typeof currentOptions.getFieldLabel ===
        "function"
    ){

        try{

            const result =
                currentOptions.getFieldLabel(
                    field,
                    record
                );

            if(
                result !== null &&
                result !== undefined
            ){

                return String(
                    result
                );

            }

        }
        catch(error){

            console.warn(
                "[EditRow] getFieldLabel failed:",
                error
            );

        }

    }


    /*
       Default sederhana.
       Contoh :

       $reward → $ Reward
       created_at → Created At
    */

    return String(
        field
    )
        .replace(
            /_/g,
            " "
        )
        .replace(
            /\$/g,
            "$ "
        )
        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/* =====================================================
   FIELD TYPE
===================================================== */

function getFieldType(
    field,
    value,
    record
){

    if(
        typeof currentOptions.getFieldType ===
        "function"
    ){

        try{

            const result =
                currentOptions.getFieldType(
                    field,
                    value,
                    record
                );

            if(
                result
            ){

                return result;

            }

        }
        catch(error){

            console.warn(
                "[EditRow] getFieldType failed:",
                error
            );

        }

    }


    const normalizedField =
        normalizeKey(
            field
        );


    /*
       Date
    */

    if(
        normalizedField ===
            "tanggal" ||
        normalizedField ===
            "date" ||
        normalizedField ===
            "datetime"
    ){

        return "date";

    }


    /*
       Number
    */

    if(
        typeof value ===
        "number"
    ){

        return "number";

    }


    /*
       Boolean
    */

    if(
        typeof value ===
        "boolean"
    ){

        return "checkbox";

    }


    /*
       Object / Array
       → textarea agar tidak
       kehilangan struktur.
    */

    if(
        Array.isArray(
            value
        ) ||
        isObject(
            value
        )
    ){

        return "textarea";

    }


    /*
       Field yang umum mengandung
       nominal.
    */

    if(
        normalizedField.includes(
            "amount"
        ) ||
        normalizedField.includes(
            "nominal"
        ) ||
        normalizedField.includes(
            "reward"
        ) ||
        normalizedField.includes(
            "price"
        ) ||
        normalizedField.includes(
            "saldo"
        )
    ){

        return "number";

    }


    return "text";

}


/* =====================================================
   FIELD VALUE SERIALIZATION
===================================================== */

function serializeFieldValue(
    value,
    type
){

    if(
        type === "checkbox"
    ){

        return Boolean(
            value
        );

    }


    if(
        value === null ||
        value === undefined
    ){

        return "";

    }


    if(
        isObject(
            value
        ) ||
        Array.isArray(
            value
        )
    ){

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


    return String(
        value
    );

}


/* =====================================================
   PARSE FIELD VALUE
===================================================== */

function parseFieldValue(
    field,
    rawValue,
    originalValue,
    record
){

    const type =
        getFieldType(
            field,
            originalValue,
            record
        );


    if(
        type ===
        "checkbox"
    ){

        return Boolean(
            rawValue
        );

    }


    if(
        type ===
        "number"
    ){

        if(
            rawValue === "" ||
            rawValue === null ||
            rawValue === undefined
        ){

            return "";

        }


        const number =
            Number(
                rawValue
            );


        return Number.isNaN(
            number
        )
            ? rawValue
            : number;

    }


    /*
       Object / Array
    */

    if(
        isObject(
            originalValue
        ) ||
        Array.isArray(
            originalValue
        )
    ){

        try{

            return JSON.parse(
                rawValue
            );

        }
        catch{

            return rawValue;

        }

    }


    return rawValue;

}


/* =====================================================
   FIELD CONFIG
===================================================== */

function getFieldConfig(
    field,
    record
){

    let config = {};


    if(
        typeof currentOptions.getFieldConfig ===
        "function"
    ){

        try{

            const result =
                currentOptions.getFieldConfig(
                    field,
                    record
                );

            if(
                result &&
                typeof result ===
                "object"
            ){

                config = {
                    ...result
                };

            }

        }
        catch(error){

            console.warn(
                "[EditRow] getFieldConfig failed:",
                error
            );

        }

    }


    const value =
        record?.[field];


    const type =
        config.type ||
        getFieldType(
            field,
            value,
            record
        );


    return {

        label :
            config.label ||
            getFieldLabel(
                field,
                record
            ),

        type,

        placeholder :
            config.placeholder ||
            "",

        required :
            config.required === true,

        min :
            config.min,

        max :
            config.max,

        step :
            config.step,

        options :
            Array.isArray(
                config.options
            )
                ? config.options
                : null,

        rows :
            config.rows ||
            3

    };

}


/* =====================================================
   GET FIELD LIST
===================================================== */

function getEditableFieldList(
    record
){

    if(
        !isObject(
            record
        )
    ){

        return [];

    }


    let fields =
        Object.keys(
            record
        );


    /*
       Workspace dapat menentukan
       urutan field.
    */

    if(
        typeof currentOptions.getFieldOrder ===
        "function"
    ){

        try{

            const result =
                currentOptions.getFieldOrder(
                    record
                );

            if(
                Array.isArray(
                    result
                )
            ){

                const ordered =
                    [];

                result.forEach(
                    field => {

                        if(
                            fields.includes(
                                field
                            )
                        ){

                            ordered.push(
                                field
                            );

                        }

                    }
                );


                fields.forEach(
                    field => {

                        if(
                            !ordered.includes(
                                field
                            )
                        ){

                            ordered.push(
                                field
                            );

                        }

                    }
                );


                fields =
                    ordered;

            }

        }
        catch(error){

            console.warn(
                "[EditRow] getFieldOrder failed:",
                error
            );

        }

    }


    return fields;

}


/* =====================================================
   SOURCE DATA
===================================================== */

function getSourceRecords(
){

    if(
        typeof currentOptions.getRecords ===
        "function"
    ){

        try{

            const records =
                currentOptions.getRecords();

            if(
                Array.isArray(
                    records
                )
            ){

                return records;

            }

        }
        catch(error){

            console.error(
                "[EditRow] getRecords failed:",
                error
            );

        }

    }


    /*
       Default menggunakan data Global Input.
       Data source workspace tetap ditentukan
       oleh data.js.
    */

    const records =
        getInputRaw();


    return Array.isArray(
        records
    )
        ? records
        : [];

}


/* =====================================================
   LAST 20 RECORDS
===================================================== */

/*
   Rule utama Edit Row :

       maksimal 20 transaksi terkini

   Jika source mengikuti urutan Sheet :

       lama
       lama
       ...
       terbaru

   maka:

       slice(-20)

   mengambil 20 baris paling bawah.

   Untuk UI :
   terbaru ditampilkan paling atas.

   Karena itu hasilnya di-reverse().
*/

function getLatestRecords(
    records
){

    if(
        !Array.isArray(
            records
        )
    ){

        return [];

    }


    const latest =
        records.slice(
            -MAX_RECORDS
        );


    return latest.reverse();

}


/* =====================================================
   FILTER
===================================================== */

function matchesSearch(
    record,
    query
){

    const normalizedQuery =
        normalizeText(
            query
        ).toLowerCase();


    if(
        !normalizedQuery
    ){

        return true;

    }


    /*
       Workspace dapat menentukan
       data pencarian.
    */

    if(
        typeof currentOptions.getSearchText ===
        "function"
    ){

        try{

            const text =
                normalizeText(
                    currentOptions.getSearchText(
                        record
                    )
                ).toLowerCase();

            return text.includes(
                normalizedQuery
            );

        }
        catch(error){

            console.warn(
                "[EditRow] getSearchText failed:",
                error
            );

        }

    }


    /*
       Default :
       cari di seluruh field record.
    */

    try{

        return Object.values(
            record
        )
            .map(
                value =>
                    normalizeText(
                        value
                    ).toLowerCase()
            )
            .some(
                value =>
                    value.includes(
                        normalizedQuery
                    )
            );

    }
    catch{

        return false;

    }

}


/* =====================================================
   BUILD VALUES
===================================================== */

function readFieldValues(
    record,
    overlay
){

    const values = {};


    if(
        !overlay
    ){

        return values;

    }


    const fields =
        getEditableFieldList(
            record
        );


    fields.forEach(
        field => {

            if(
                !isEditableField(
                    field,
                    record
                )
            ){

                return;

            }


            const element =
                overlay.querySelector(
                    `[name="${CSS.escape(field)}"]`
                );


            if(
                !element
            ){

                return;

            }


            const originalValue =
                record?.[field];


            values[field] =
                parseFieldValue(
                    field,
                    element.type ===
                        "checkbox"
                        ? element.checked
                        : element.value,
                    originalValue,
                    record
                );

        }
    );


    return values;

}


/* =====================================================
   BUILD ROW
===================================================== */

function buildUpdatedRow(
    record,
    values
){

    /*
       Seluruh row asli dipertahankan.

       Field editable diganti
       dengan nilai baru.

       ID dan Tanggal tidak pernah
       diambil dari input UI.
    */

    const row = {

        ...record

    };


    Object.keys(
        values || {}
    ).forEach(
        field => {

            if(
                isLockedField(
                    field,
                    record
                )
            ){

                return;

            }


            if(
                !isEditableField(
                    field,
                    record
                )
            ){

                return;

            }


            row[field] =
                values[field];

        }
    );


    /*
       Pastikan ID dan Tanggal
       tetap identik dengan data asli.
    */

    const idField =
        getIdField(
            record
        );

    const dateField =
        getDateField(
            record
        );


    row[idField] =
        record[idField];


    row[dateField] =
        record[dateField];


    return row;

}


/* =====================================================
   BUILD CHANGES
===================================================== */

function buildChanges(
    record,
    overlay
){

    const values =
        readFieldValues(
            record,
            overlay
        );


    const row =
        buildUpdatedRow(
            record,
            values
        );


    return {

        values,

        row,

        target : {

            id :
                getRecordId(
                    record
                ),

            tanggal :
                getRecordDate(
                    record
                )

        }

    };

}


/* =====================================================
   VALIDATE
===================================================== */

function validateRecord(
    record,
    overlay
){

    if(
        !record
    ){

        return false;

    }


    const id =
        getRecordId(
            record
        );


    const tanggal =
        normalizeText(
            getRecordDate(
                record
            )
        );


    if(
        !id
    ){

        showMessage(
            "ID transaksi tidak ditemukan.",
            "error"
        );

        return false;

    }


    if(
        !tanggal
    ){

        showMessage(
            "Tanggal transaksi tidak ditemukan.",
            "error"
        );

        return false;

    }


    if(
        typeof currentOptions.validate ===
        "function"
    ){

        try{

            return (
                currentOptions.validate(
                    record,
                    overlay,
                    {
                        values :
                            readFieldValues(
                                record,
                                overlay
                            )
                    }
                ) === true
            );

        }
        catch(error){

            console.error(
                "[EditRow] validate failed:",
                error
            );

            showMessage(
                error?.message ||
                "Data tidak valid.",
                "error"
            );

            return false;

        }

    }


    /*
       Required field default.
    */

    const fields =
        getEditableFieldList(
            record
        );


    for(
        const field of fields
    ){

        if(
            !isEditableField(
                field,
                record
            )
        ){

            continue;

        }


        const config =
            getFieldConfig(
                field,
                record
            );


        if(
            !config.required
        ){

            continue;

        }


        const element =
            overlay?.querySelector(
                `[name="${CSS.escape(field)}"]`
            );


        if(
            !element
        ){

            continue;

        }


        const value =
            element.type ===
                "checkbox"
                ? element.checked
                : normalizeText(
                    element.value
                );


        if(
            value === "" ||
            value === null ||
            value === undefined
        ){

            showMessage(
                `${config.label} wajib diisi.`,
                "error"
            );

            return false;

        }

    }


    return true;

}


/* =====================================================
   WORKSPACE VALIDATION
===================================================== */

async function validateBatch(
    pending
){

    if(
        typeof currentOptions.validateBatch ===
        "function"
    ){

        return (
            await currentOptions.validateBatch(
                pending
            )
        ) !== false;

    }


    return true;

}


/* =====================================================
   DETAIL
===================================================== */

function renderDetail(
    record
){

    if(
        typeof currentOptions.renderDetail ===
        "function"
    ){

        return currentOptions.renderDetail(
            record
        );

    }


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "global-update-data-detail-card";


    const title =
        document.createElement(
            "h3"
        );


    title.className =
        "global-update-data-detail-title";


    title.textContent =
        "Informasi Transaksi";


    card.appendChild(
        title
    );


    const fields =
        getEditableFieldList(
            record
        );


    fields.forEach(
        field => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "global-update-data-detail-row";


            const label =
                document.createElement(
                    "span"
                );


            label.textContent =
                getFieldLabel(
                    field,
                    record
                );


            const value =
                document.createElement(
                    "strong"
                );


            value.textContent =
                serializeFieldValue(
                    record[field],
                    getFieldType(
                        field,
                        record[field],
                        record
                    )
                );


            row.appendChild(
                label
            );


            row.appendChild(
                value
            );


            card.appendChild(
                row
            );

        }
    );


    return card;

}


/* =====================================================
   FIELD ELEMENT
===================================================== */

function createFieldElement(
    field,
    record,
    context
){

    const config =
        getFieldConfig(
            field,
            record
        );


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "global-update-data-field";


    const label =
        document.createElement(
            "label"
        );


    label.className =
        "global-update-data-field-label";


    label.textContent =
        config.label;


    wrapper.appendChild(
        label
    );


    const value =
        record[field];


    const type =
        config.type;


    /*
       SELECT
    */

    if(
        type ===
        "select" &&
        Array.isArray(
            config.options
        )
    ){

        const select =
            document.createElement(
                "select"
            );


        select.name =
            field;


        select.className =
            "global-update-data-field-input";


        config.options.forEach(
            option => {

                const optionElement =
                    document.createElement(
                        "option"
                    );


                if(
                    typeof option ===
                    "object"
                ){

                    optionElement.value =
                        option.value ??
                        "";


                    optionElement.textContent =
                        option.label ??
                        option.value ??
                        "";

                }
                else{

                    optionElement.value =
                        option;


                    optionElement.textContent =
                        option;

                }


                if(
                    String(
                        optionElement.value
                    ) ===
                    String(
                        value
                    )
                ){

                    optionElement.selected =
                        true;

                }


                select.appendChild(
                    optionElement
                );

            }
        );


        wrapper.appendChild(
            select
        );


        return wrapper;

    }


    /*
       CHECKBOX
    */

    if(
        type ===
        "checkbox"
    ){

        const checkboxWrapper =
            document.createElement(
                "label"
            );


        checkboxWrapper.className =
            "global-update-data-checkbox";


        const checkbox =
            document.createElement(
                "input"
            );


        checkbox.type =
            "checkbox";


        checkbox.name =
            field;


        checkbox.checked =
            Boolean(
                value
            );


        checkboxWrapper.appendChild(
            checkbox
        );


        const text =
            document.createElement(
                "span"
            );


        text.textContent =
            config.label;


        checkboxWrapper.appendChild(
            text
        );


        /*
           Label utama tidak perlu
           ditampilkan dua kali.
        */

        label.remove();


        wrapper.appendChild(
            checkboxWrapper
        );


        return wrapper;

    }


    /*
       TEXTAREA
    */

    if(
        type ===
        "textarea"
    ){

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.name =
            field;


        textarea.className =
            "global-update-data-field-input";


        textarea.rows =
            config.rows;


        textarea.placeholder =
            config.placeholder;


        textarea.value =
            serializeFieldValue(
                value,
                type
            );


        wrapper.appendChild(
            textarea
        );


        return wrapper;

    }


    /*
       DEFAULT INPUT
    */

    const input =
        document.createElement(
            "input"
        );


    input.name =
        field;


    input.className =
        "global-update-data-field-input";


    input.type =
        type === "number"
            ? "number"
            : type === "date"
                ? "date"
                : "text";


    input.placeholder =
        config.placeholder;


    if(
        config.min !==
        undefined
    ){

        input.min =
            config.min;

    }


    if(
        config.max !==
        undefined
    ){

        input.max =
            config.max;

    }


    if(
        config.step !==
        undefined
    ){

        input.step =
            config.step;

    }


    input.value =
        serializeFieldValue(
            value,
            type
        );


    wrapper.appendChild(
        input
    );


    return wrapper;

}


/* =====================================================
   FIELDS
===================================================== */

function renderFields(
    record,
    context
){

    if(
        typeof currentOptions.renderFields ===
        "function"
    ){

        return currentOptions.renderFields(
            record,
            context
        );

    }


    const root =
        document.createElement(
            "div"
        );


    root.className =
        "global-update-data-fields-wrapper";


    const fields =
        getEditableFieldList(
            record
        );


    fields.forEach(
        field => {

            if(
                !isEditableField(
                    field,
                    record
                )
            ){

                return;

            }


            const element =
                createFieldElement(
                    field,
                    record,
                    context
                );


            root.appendChild(
                element
            );

        }
    );


    return root;

}


/* =====================================================
   LIST LABEL
===================================================== */

function getRecordLabel(
    record
){

    if(
        typeof currentOptions.getRecordLabel ===
        "function"
    ){

        try{

            return normalizeText(
                currentOptions.getRecordLabel(
                    record
                )
            );

        }
        catch(error){

            console.warn(
                "[EditRow] getRecordLabel failed:",
                error
            );

        }

    }


    const id =
        getRecordId(
            record
        );


    return id ||
           "Transaksi";

}


/* =====================================================
   LIST META
===================================================== */

function getRecordMeta(
    record
){

    if(
        typeof currentOptions.getRecordMeta ===
        "function"
    ){

        try{

            return normalizeText(
                currentOptions.getRecordMeta(
                    record
                )
            );

        }
        catch(error){

            console.warn(
                "[EditRow] getRecordMeta failed:",
                error
            );

        }

    }


    const tanggal =
        normalizeText(
            getRecordDate(
                record
            )
        );


    return tanggal;

}


/* =====================================================
   SHOW MESSAGE
===================================================== */

function showMessage(
    message,
    type = ""
){

    /*
       UpdateData akan menangani result UI.
       Kita coba akses result element agar
       engine tetap tidak bergantung pada
       fungsi internal UpdateData.
    */

    const overlay =
        document.getElementById(
            "global-update-data-overlay"
        );


    const result =
        overlay?.querySelector(
            '[data-role="result"]'
        );


    if(
        !result
    ){

        console.warn(
            "[EditRow]",
            message
        );

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
        message;


    result.classList.remove(
        "hidden"
    );

}


/* =====================================================
   CONFIRM
===================================================== */

/*
   Hanya fungsi ini yang melakukan
   Update ke Apps Script.
*/

async function confirm(
    pending
){

    if(
        busy
    ){

        return false;

    }


    if(
        !Array.isArray(
            pending
        ) ||
        !pending.length
    ){

        return false;

    }


    const valid =
        await validateBatch(
            pending
        );


    if(
        valid === false
    ){

        return {

            success :
                false,

            remaining :
                pending

        };

    }


    busy =
        true;


    const remaining =
        [];


    let successCount =
        0;


    try{

        for(
            const item of pending
        ){

            try{

                const record =
                    item.record;


                const changes =
                    item.changes;


                const target =
                    {

                        id :
                            getRecordId(
                                record
                            ),

                        tanggal :
                            getRecordDate(
                                record
                            )

                    };


                /*
                   Workspace dapat mengambil alih
                   update jika mempunyai kebutuhan
                   khusus.
                */

                let result;


                if(
                    typeof currentOptions.update ===
                    "function"
                ){

                    result =
                        await currentOptions.update(
                            {
                                workspace :
                                    currentOptions.workspace,

                                target,

                                row :
                                    changes.row,

                                record,

                                changes
                            }
                        );

                }
                else{

                    /*
                       Default :
                       gunakan Update.updateRow()
                    */

                    result =
                        await Update.updateRow(
                            currentOptions.workspace,
                            target,
                            changes.row
                        );

                }


                if(
                    result?.success === false ||
                    result?.ok === false
                ){

                    throw new Error(
                        result?.message ||
                        result?.error ||
                        "Update transaksi gagal."
                    );

                }


                successCount++;

            }
            catch(error){

                console.error(
                    "[EditRow] Update failed:",
                    error
                );


                remaining.push(
                    item
                );

            }

        }


        if(
            successCount ===
            pending.length
        ){

            /*
               Semua berhasil.
            */

            if(
                typeof currentOptions.onConfirmed ===
                "function"
            ){

                try{

                    await currentOptions.onConfirmed(
                        {
                            success :
                                true,

                            count :
                                successCount,

                            pending
                        }
                    );

                }
                catch(error){

                    console.warn(
                        "[EditRow] onConfirmed failed:",
                        error
                    );

                }

            }


            return {

                success :
                    true,

                remaining :
                    [],

                count :
                    successCount,

                message :
                    `${successCount} data berhasil diperbarui.`

            };

        }


        if(
            successCount > 0
        ){

            return {

                success :
                    false,

                remaining,

                count :
                    successCount,

                message :
                    `${successCount} data berhasil diperbarui. ` +
                    `${remaining.length} data gagal diperbarui.`

            };

        }


        return {

            success :
                false,

            remaining,

            count :
                0,

            message :
                "Tidak ada data yang berhasil diperbarui."

        };

    }
    finally{

        busy =
            false;

    }

}


/* =====================================================
   PUBLIC API
===================================================== */

export const EditRow = {


    /* =================================================
       CONSTANT
    ================================================= */

    MAX_RECORDS,


    /* =================================================
       OPEN
    ================================================= */

    open(
        options = {}
    ){

        currentOptions = {

            workspace :
                options.workspace ||
                null,

            title :
                "Edit Input Row",

            subtitle :
                "Ubah transaksi yang sudah tersimpan",

            listTitle :
                "Transaksi Terbaru",

            searchPlaceholder :
                "Cari transaksi...",

            emptyText :
                "Tidak ada transaksi yang dapat diedit.",

            addText :
                "Tambahkan",

            confirmText :
                "Konfirmasi",

            confirmLoadingText :
                "Menyimpan perubahan...",

            removeText :
                "Hapus",

            pendingTitle :
                "Sudah Ditambahkan",

            duplicateText :
                "Transaksi ini sudah ditambahkan.",

            ...options

        };


        /*
           Ambil seluruh source.
        */

        sourceRecords =
            getSourceRecords();


        /*
           Ambil 20 baris paling bawah.
        */

        editableRecords =
            getLatestRecords(
                sourceRecords
            );


        /*
           Reset temporary state.
        */

        pendingChanges =
            [];


        selectedRecord =
            null;


        busy =
            false;


        /*
           Pastikan UpdateData tersedia.
        */

        if(
            !UpdateData ||
            typeof UpdateData.open !==
                "function"
        ){

            console.error(
                "[EditRow] UpdateData.open() tidak tersedia."
            );


            return null;

        }


        /*
           Adapter ke global UI.
        */

        return UpdateData.open({

            ...currentOptions,

            /*
               IMPORTANT :
               direct list menggunakan
               20 record hasil EditRow.
            */

            records :
                editableRecords,


            listTitle :
                currentOptions.listTitle,


            searchPlaceholder :
                currentOptions.searchPlaceholder,


            emptyText :
                currentOptions.emptyText,


            getRecordId :
                record =>
                    getTargetKey(
                        record
                    ),


            getRecordLabel :
                record =>
                    getRecordLabel(
                        record
                    ),


            getRecordMeta :
                record =>
                    getRecordMeta(
                        record
                    ),


            onSelect :
                record => {

                    selectedRecord =
                        record;


                    if(
                        typeof currentOptions.onSelect ===
                        "function"
                    ){

                        currentOptions.onSelect(
                            record
                        );

                    }

                },


            renderDetail :
                record =>
                    renderDetail(
                        record
                    ),


            renderFields :
                (
                    record,
                    context
                ) =>
                    renderFields(
                        record,
                        context
                    ),


            validate :
                (
                    record,
                    overlay
                ) =>
                    validateRecord(
                        record,
                        overlay
                    ),


            buildChanges :
                (
                    record,
                    overlay
                ) =>
                    buildChanges(
                        record,
                        overlay
                    ),


            getPendingLabel :
                item => {

                    if(
                        typeof currentOptions.getPendingLabel ===
                        "function"
                    ){

                        return currentOptions.getPendingLabel(
                            item
                        );

                    }


                    return getRecordLabel(
                        item.record
                    );

                },


            onConfirm :
                pending =>
                    confirm(
                        pending
                    )

        });

    },


    /* =================================================
       GET SOURCE
    ================================================= */

    getRecords(){

        return sourceRecords.slice();

    },


    /* =================================================
       GET EDITABLE RECORDS
    ================================================= */

    getEditableRecords(){

        return editableRecords.slice();

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
       GET ID
    ================================================= */

    getId(
        record
    ){

        return getRecordId(
            record
        );

    },


    /* =================================================
       GET DATE
    ================================================= */

    getDate(
        record
    ){

        return getRecordDate(
            record
        );

    },


    /* =================================================
       GET TARGET
    ================================================= */

    getTarget(
        record
    ){

        return {

            id :
                getRecordId(
                    record
                ),

            tanggal :
                getRecordDate(
                    record
                )

        };

    },


    /* =================================================
       GET TARGET KEY
    ================================================= */

    getKey(
        record
    ){

        return getTargetKey(
            record
        );

    },


    /* =================================================
       GET FIELD LIST
    ================================================= */

    getFields(
        record
    ){

        return getEditableFieldList(
            record
        );

    },


    /* =================================================
       IS LOCKED
    ================================================= */

    isLocked(
        field,
        record
    ){

        return isLockedField(
            field,
            record
        );

    },


    /* =================================================
       IS EDITABLE
    ================================================= */

    isEditable(
        field,
        record
    ){

        return isEditableField(
            field,
            record
        );

    },


    /* =================================================
       BUILD ROW
    ================================================= */

    buildRow(
        record,
        values
    ){

        return buildUpdatedRow(
            record,
            values
        );

    },


    /* =================================================
       REFRESH SOURCE
    ================================================= */

    refresh(){

        sourceRecords =
            getSourceRecords();


        editableRecords =
            getLatestRecords(
                sourceRecords
            );


        if(
            typeof UpdateData.setRecords ===
            "function"
        ){

            UpdateData.setRecords(
                editableRecords
            );

        }


        return editableRecords.slice();

    },


    /* =================================================
       RESET
    ================================================= */

    reset(){

        currentOptions =
            {};

        sourceRecords =
            [];

        editableRecords =
            [];

        pendingChanges =
            [];

        selectedRecord =
            null;

        busy =
            false;

    }

};


/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default EditRow;
