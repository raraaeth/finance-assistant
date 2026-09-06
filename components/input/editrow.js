/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : editrow.js
   Version      : 2.1.0

   Description :
   Generic Edit Input Row Engine

   Responsibility :
   - Menentukan maksimal 20 transaksi terkini
   - Mengambil 20 baris paling bawah dari source data
   - Menampilkan record terbaru terlebih dahulu
   - Target record menggunakan ID + Tanggal
   - ID dan Tanggal selalu locked
   - Mengikuti definisi field/control dari workspace
   - Mempertahankan canonical option.value
   - Mendukung select / number / date / text / textarea /
     checkbox / condition
   - Mendukung dynamic options
   - Mendukung conditional fields
   - Mendukung perbedaan field UI dan field Sheet
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
   Direct Record List
       ↓
   Search
       ↓
   selected row
       ↓
   detail
       ↓
   workspace steps
       ↓
   editable controls
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
   - Tidak hardcode struktur workspace
   - Tidak hardcode field Airdrop
   - Tidak hardcode field Financial
   - Tidak hardcode field Kas
   - Tidak hardcode field Payroll
   - ID + Tanggal adalah target generic
   - Control mengikuti steps workspace
   - option.value adalah nilai authoritative
   - option.label hanya untuk presentation
   - Tidak melakukan update saat record dipilih
   - Tidak melakukan update saat Tambahkan
   - Apps Script hanya dipanggil saat Konfirmasi

   Compatibility :
   - Tidak bergantung pada UpdateData
   - Tidak mengubah Reward Airdrop
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {
    getInputRaw
} from "./data.js";


import {
    Update
} from "../../js/update.js";


/* =====================================================
   CONSTANT
===================================================== */

const MAX_RECORDS = 20;

const OVERLAY_ID =
    "global-update-data-overlay";


/* =====================================================
   STATE
===================================================== */

let currentOptions = {};

let sourceRecords = [];

let editableRecords = [];

let pendingChanges = [];

let selectedRecord = null;

let busy = false;

let overlay = null;

let searchQuery = "";


/* =====================================================
   NORMALIZE
===================================================== */

function normalizeText(value){

    if(
        value === null ||
        value === undefined
    ){

        return "";

    }

    return String(value).trim();

}


function normalizeKey(value){

    return normalizeText(value)
        .toLowerCase();

}


/* =====================================================
   OBJECT
===================================================== */

function isObject(value){

    return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
    );

}


/* =====================================================
   SAFE ARRAY
===================================================== */

function safeArray(value){

    return Array.isArray(value)
        ? value
        : [];

}


/* =====================================================
   SAFE FUNCTION
===================================================== */

function callFunction(
    fn,
    args = [],
    fallback = undefined
){

    if(
        typeof fn !== "function"
    ){

        return fallback;

    }

    try{

        return fn(...args);

    }
    catch(error){

        console.warn(
            "[EditRow] callback failed:",
            error
        );

        return fallback;

    }

}


/* =====================================================
   ID FIELD
===================================================== */

function getIdField(record){

    if(
        typeof currentOptions.getIdField ===
        "function"
    ){

        const result =
            callFunction(
                currentOptions.getIdField,
                [record],
                undefined
            );

        if(result){

            return result;

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

function getDateField(record){

    if(
        !record ||
        typeof record !== "object"
    ){

        return null;

    }

    const keys =
        Object.keys(record);

    const candidates = [
        "tanggal",
        "date"
    ];

    for(
        const key of keys
    ){

        const normalized =
            String(key)
                .trim()
                .toLowerCase();

        if(
            candidates.includes(
                normalized
            )
        ){

            return key;

        }

    }

    return null;

}


/* =====================================================
   RECORD ID
===================================================== */

function getRecordId(record){

    const field =
        getIdField(record);

    return normalizeText(
        record?.[field]
    );

}


/* =====================================================
   RECORD DATE
===================================================== */

function getRecordDate(record){

    const field =
        getDateField(record);

    return field
        ? record?.[field] ?? ""
        : "";

}


/* =====================================================
   TARGET KEY
===================================================== */

function getTargetKey(record){

    if(
        typeof currentOptions.getTargetKey ===
        "function"
    ){

        const result =
            callFunction(
                currentOptions.getTargetKey,
                [record],
                undefined
            );

        if(
            result !== undefined &&
            result !== null
        ){

            return normalizeText(result);

        }

    }

    return [

        getRecordId(record),

        normalizeText(
            getRecordDate(record)
        )

    ].join("|");

}


/* =====================================================
   SHEET FIELD
===================================================== */

function getSheetField(
    field,
    record
){

    if(
        typeof currentOptions.getSheetField ===
        "function"
    ){

        const result =
            callFunction(
                currentOptions.getSheetField,
                [
                    field,
                    record
                ],
                undefined
            );

        if(result){

            return result;

        }

    }

    const map =
        currentOptions.fieldMap;

    if(
        map &&
        typeof map === "object" &&
        map[field]
    ){

        return map[field];

    }

    return field;

}


/* =====================================================
   FIELD VALUE
===================================================== */

function getFieldValue(
    field,
    record
){

    if(
        typeof currentOptions.getFieldValue ===
        "function"
    ){

        const result =
            callFunction(
                currentOptions.getFieldValue,
                [
                    field,
                    record
                ],
                undefined
            );

        if(
            result !== undefined
        ){

            return result;

        }

    }

    const sheetField =
        getSheetField(
            field,
            record
        );

    if(
        record &&
        Object.prototype.hasOwnProperty.call(
            record,
            field
        )
    ){

        return record[field];

    }

    if(
        record &&
        Object.prototype.hasOwnProperty.call(
            record,
            sheetField
        )
    ){

        return record[sheetField];

    }

    return "";

}


/* =====================================================
   SET FIELD VALUE
===================================================== */

function setFieldValue(
    row,
    field,
    value,
    record
){

    const sheetField =
        getSheetField(
            field,
            record
        );

    row[sheetField] =
        value;

}


/* =====================================================
   FIELD LOCK
===================================================== */

function isLockedField(
    field,
    record
){

    const idField =
        getIdField(record);

    const dateField =
        getDateField(record);

    if(
        field === idField ||
        field === "id" ||
        field === "ID"
    ){

        return true;

    }

    if(
        field === dateField ||
        normalizeKey(field) === "tanggal" ||
        normalizeKey(field) === "date"
    ){

        return true;

    }

    if(
        typeof currentOptions.isFieldLocked ===
        "function"
    ){

        const result =
            callFunction(
                currentOptions.isFieldLocked,
                [
                    field,
                    record
                ],
                false
            );

        if(result === true){

            return true;

        }

    }

    const lockedFields =
        safeArray(
            currentOptions.lockedFields
        );

    return lockedFields.includes(field);

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

        const result =
            callFunction(
                currentOptions.isFieldEditable,
                [
                    field,
                    record
                ],
                undefined
            );

        if(
            result !== undefined
        ){

            return result !== false;

        }

    }

    if(
        Array.isArray(
            currentOptions.editableFields
        )
    ){

        return currentOptions.editableFields.includes(
            field
        );

    }

    return true;

}


/* =====================================================
   STEPS
===================================================== */

function getSteps(record){

    let steps =
        currentOptions.steps;

    if(
        typeof steps === "function"
    ){

        steps =
            callFunction(
                steps,
                [record],
                []
            );

    }

    return safeArray(steps);

}


/* =====================================================
   STEP FIELD
===================================================== */

function getStepFieldName(step){

    if(
        !step ||
        typeof step !== "object"
    ){

        return null;

    }

    return (
        step.id ??
        step.field ??
        step.name ??
        null
    );

}


/* =====================================================
   FIND STEP
===================================================== */

function findStep(
    field,
    record
){

    const steps =
        getSteps(record);

    for(
        const step of steps
    ){

        if(
            getStepFieldName(step) ===
            field
        ){

            return step;

        }

    }

    return null;

}


/* =====================================================
   CONDITION
===================================================== */

function evaluateCondition(
    condition,
    values,
    record
){

    if(
        condition === undefined ||
        condition === null
    ){

        return true;

    }

    if(
        typeof condition === "function"
    ){

        try{

            return condition(
                values,
                record
            ) !== false;

        }
        catch(error){

            console.warn(
                "[EditRow] condition failed:",
                error
            );

            return false;

        }

    }

    if(
        isObject(condition)
    ){

        const field =
            condition.field ??
            condition.id;

        const actual =
            values?.[field] ??
            getFieldValue(
                field,
                record
            );

        if(
            Object.prototype.hasOwnProperty.call(
                condition,
                "equals"
            )
        ){

            return String(actual) ===
                String(condition.equals);

        }

        if(
            Object.prototype.hasOwnProperty.call(
                condition,
                "notEquals"
            )
        ){

            return String(actual) !==
                String(condition.notEquals);

        }

        if(
            Array.isArray(
                condition.includes
            )
        ){

            return condition.includes.includes(
                actual
            );

        }

        return true;

    }

    return Boolean(condition);

}


/* =====================================================
   STEP VISIBILITY
===================================================== */

function isStepVisible(
    step,
    record,
    values = {}
){

    if(!step){

        return false;

    }

    if(
        step.showIf !== undefined &&
        !evaluateCondition(
            step.showIf,
            values,
            record
        )
    ){

        return false;

    }

    if(
        step.visibleIf !== undefined &&
        !evaluateCondition(
            step.visibleIf,
            values,
            record
        )
    ){

        return false;

    }

    if(
        step.showWhen !== undefined &&
        !evaluateCondition(
            step.showWhen,
            values,
            record
        )
    ){

        return false;

    }

    if(
        step.condition !== undefined &&
        !evaluateCondition(
            step.condition,
            values,
            record
        )
    ){

        return false;

    }

    if(
        step.hidden === true
    ){

        return false;

    }

    return true;

}


/* =====================================================
   FIELD LABEL
===================================================== */

function getFieldLabel(
    field,
    record,
    values = {}
){

    if(
        typeof currentOptions.getFieldLabel ===
        "function"
    ){

        const result =
            callFunction(
                currentOptions.getFieldLabel,
                [
                    field,
                    record,
                    values
                ],
                undefined
            );

        if(
            result !== undefined &&
            result !== null
        ){

            return String(result);

        }

    }

    const step =
        findStep(
            field,
            record
        );

    if(
        typeof step?.label ===
        "function"
    ){

        const result =
            callFunction(
                step.label,
                [
                    values,
                    record
                ],
                undefined
            );

        if(
            result !== undefined &&
            result !== null
        ){

            return String(result);

        }

    }

    if(
        step?.label !== undefined
    ){

        return String(
            step.label
        );

    }

    return String(field)
        .replace(/_/g, " ")
        .replace(/\$/g, "$ ")
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

        const result =
            callFunction(
                currentOptions.getFieldType,
                [
                    field,
                    value,
                    record
                ],
                undefined
            );

        if(result){

            return result;

        }

    }

    const step =
        findStep(
            field,
            record
        );

    if(step?.type){

        return step.type;

    }

    const normalized =
        normalizeKey(field);

    if(
        normalized === "tanggal" ||
        normalized === "date" ||
        normalized === "datetime"
    ){

        return "date";

    }

    if(
        typeof value === "number"
    ){

        return "number";

    }

    if(
        typeof value === "boolean"
    ){

        return "checkbox";

    }

    if(
        Array.isArray(value) ||
        isObject(value)
    ){

        return "textarea";

    }

    return "text";

}


/* =====================================================
   OPTION NORMALIZATION
===================================================== */

function normalizeOption(option){

    if(
        isObject(option)
    ){

        return {

            value :
                option.value ??
                option.id ??
                "",

            label :
                option.label ??
                option.name ??
                option.value ??
                "",

            note :
                option.note ??
                "",

            disabled :
                option.disabled === true

        };

    }

    return {

        value : option,

        label : option,

        note : "",

        disabled : false

    };

}


/* =====================================================
   FIELD OPTIONS
===================================================== */

function getFieldOptions(
    field,
    record,
    values = {}
){

    if(
        typeof currentOptions.getFieldOptions ===
        "function"
    ){

        const result =
            callFunction(
                currentOptions.getFieldOptions,
                [
                    field,
                    record,
                    values
                ],
                undefined
            );

        if(
            Array.isArray(result)
        ){

            return result.map(
                normalizeOption
            );

        }

    }

    const step =
        findStep(
            field,
            record
        );

    let options =
        step?.options;

    if(
        typeof options === "function"
    ){

        try{

            options =
                options(
                    values,
                    record
                );

        }
        catch(error){

            console.warn(
                "[EditRow] options failed:",
                error
            );

            options = [];

        }

    }

    if(
        !Array.isArray(options)
    ){

        options = [];

    }

    return options.map(
        normalizeOption
    );

}


/* =====================================================
   FIELD CONFIG
===================================================== */

function getFieldConfig(
    field,
    record,
    values = {}
){

    let config = {};

    if(
        typeof currentOptions.getFieldConfig ===
        "function"
    ){

        const result =
            callFunction(
                currentOptions.getFieldConfig,
                [
                    field,
                    record,
                    values
                ],
                undefined
            );

        if(
            result &&
            typeof result === "object"
        ){

            config = {
                ...result
            };

        }

    }

    const step =
        findStep(
            field,
            record
        );

    if(step){

        config = {
            ...step,
            ...config
        };

    }

    const value =
        getFieldValue(
            field,
            record
        );

    const type =
        config.type ||
        getFieldType(
            field,
            value,
            record
        );

    let options =
        config.options;

    if(
        typeof options === "function"
    ){

        try{

            options =
                options(
                    values,
                    record
                );

        }
        catch(error){

            console.warn(
                "[EditRow] dynamic options failed:",
                error
            );

            options = [];

        }

    }

    if(
        !Array.isArray(options) &&
        type === "select"
    ){

        options =
            getFieldOptions(
                field,
                record,
                values
            );

    }

    let label =
        config.label;

    if(
        typeof label === "function"
    ){

        label =
            callFunction(
                label,
                [
                    values,
                    record
                ],
                undefined
            );

    }

    if(
        label === undefined ||
        label === null
    ){

        label =
            getFieldLabel(
                field,
                record,
                values
            );

    }

    return {

        id : field,

        sheetField :
            config.sheetField ??
            getSheetField(
                field,
                record
            ),

        label,

        type,

        placeholder :
            config.placeholder ??
            "",

        required :
            config.required === true,

        disabled :
            config.disabled === true,

        readonly :
            config.readonly === true,

        min :
            config.min,

        max :
            config.max,

        step :
            config.step,

        options :
            Array.isArray(options)
                ? options.map(
                    normalizeOption
                )
                : [],

        rows :
            config.rows || 3,

        showIf :
            config.showIf,

        visibleIf :
            config.visibleIf,

        showWhen :
            config.showWhen,

        condition :
            config.condition,

        multiple :
            config.multiple === true

    };

}


/* =====================================================
   FIELD LIST
===================================================== */

function getFieldList(record){

    if(
        !isObject(record)
    ){

        return [];

    }

    if(
        typeof currentOptions.getFieldOrder ===
        "function"
    ){

        const result =
            callFunction(
                currentOptions.getFieldOrder,
                [record],
                undefined
            );

        if(
            Array.isArray(result)
        ){

            return result.filter(
                field =>
                    field &&
                    isEditableField(
                        field,
                        record
                    )
            );

        }

    }

    const steps =
        getSteps(record);

    if(
        steps.length
    ){

        const fields = [];

        steps.forEach(
            step => {

                const field =
                    getStepFieldName(step);

                if(!field){

                    return;

                }

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

                if(
                    !fields.includes(field)
                ){

                    fields.push(field);

                }

            }
        );

        if(
            currentOptions.strictFieldList !== true
        ){

            Object.keys(record)
                .forEach(
                    field => {

                        if(
                            fields.includes(field)
                        ){

                            return;

                        }

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

                        fields.push(field);

                    }
                );

        }

        return fields;

    }

    return Object.keys(record)
        .filter(
            field =>
                isEditableField(
                    field,
                    record
                )
        );

}


/* =====================================================
   VISIBLE FIELDS
===================================================== */

function getVisibleFields(
    record,
    values = {}
){

    return getFieldList(record)
        .filter(
            field => {

                const config =
                    getFieldConfig(
                        field,
                        record,
                        values
                    );

                return isStepVisible(
                    config,
                    record,
                    values
                );

            }
        );

}


/* =====================================================
   SERIALIZE
===================================================== */

function serializeFieldValue(
    value,
    type
){

    if(
        type === "checkbox"
    ){

        return Boolean(value);

    }

    if(
        value === null ||
        value === undefined
    ){

        return "";

    }

    if(
        isObject(value) ||
        Array.isArray(value)
    ){

        try{

            return JSON.stringify(value);

        }
        catch{

            return String(value);

        }

    }

    return String(value);

}


/* =====================================================
   PARSE
===================================================== */

function parseFieldValue(
    field,
    rawValue,
    originalValue,
    record,
    config = {}
){

    const type =
        config.type ||
        getFieldType(
            field,
            originalValue,
            record
        );

    if(
        type === "checkbox"
    ){

        return Boolean(rawValue);

    }

    if(
        type === "number"
    ){

        if(
            rawValue === "" ||
            rawValue === null ||
            rawValue === undefined
        ){

            return "";

        }

        const number =
            Number(rawValue);

        return Number.isNaN(number)
            ? rawValue
            : number;

    }

    if(
        isObject(originalValue) ||
        Array.isArray(originalValue)
    ){

        try{

            return JSON.parse(rawValue);

        }
        catch{

            return rawValue;

        }

    }

    if(
        type === "select"
    ){

        const options =
            config.options || [];

        const match =
            options.find(
                option =>
                    String(option.value) ===
                    String(rawValue)
            );

        if(match){

            return match.value;

        }

    }

    return rawValue;

}


/* =====================================================
   NORMALIZE INCOMING VALUES
===================================================== */

function normalizeIncomingValues(
    incoming,
    record
){

    if(!incoming){

        return {};

    }

    if(
        isObject(incoming.values)
    ){

        return {
            ...incoming.values
        };

    }

    if(
        isObject(incoming.context) &&
        isObject(incoming.context.values)
    ){

        return {
            ...incoming.context.values
        };

    }

    if(
        isObject(incoming) &&
        typeof incoming.querySelector !==
        "function"
    ){

        const result = {};

        getFieldList(record)
            .forEach(
                field => {

                    if(
                        Object.prototype.hasOwnProperty.call(
                            incoming,
                            field
                        )
                    ){

                        result[field] =
                            incoming[field];

                    }

                }
            );

        if(
            Object.keys(result).length
        ){

            return result;

        }

    }

    if(
        typeof incoming.querySelector ===
        "function"
    ){

        return readValuesFromDOM(
            record,
            incoming
        );

    }

    return {};

}


/* =====================================================
   READ DOM VALUES
===================================================== */

function readValuesFromDOM(
    record,
    root
){

    const values = {};

    if(
        !root ||
        typeof root.querySelector !==
        "function"
    ){

        return values;

    }

    getFieldList(record)
        .forEach(
            field => {

                if(
                    !isEditableField(
                        field,
                        record
                    )
                ){

                    return;

                }

                let selector =
                    field;

                if(
                    globalThis.CSS &&
                    typeof CSS.escape ===
                    "function"
                ){

                    selector =
                        CSS.escape(field);

                }
                else{

                    selector =
                        String(field)
                            .replace(
                                /["\\]/g,
                                "\\$&"
                            );

                }

                const element =
                    root.querySelector(
                        `[name="${selector}"]`
                    );

                if(!element){

                    return;

                }

                const originalValue =
                    getFieldValue(
                        field,
                        record
                    );

                const config =
                    getFieldConfig(
                        field,
                        record,
                        values
                    );

                const rawValue =
                    element.type === "checkbox"
                        ? element.checked
                        : element.value;

                values[field] =
                    parseFieldValue(
                        field,
                        rawValue,
                        originalValue,
                        record,
                        config
                    );

            }
        );

    return values;

}


/* =====================================================
   BUILD UPDATED ROW
===================================================== */

function buildUpdatedRow(
    record,
    values
){

    const row = {
        ...record
    };

    const inputValues =
        values || {};

    Object.keys(inputValues)
        .forEach(
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

                const config =
                    getFieldConfig(
                        field,
                        record,
                        inputValues
                    );

                const originalValue =
                    getFieldValue(
                        field,
                        record
                    );

                const parsedValue =
                    parseFieldValue(
                        field,
                        inputValues[field],
                        originalValue,
                        record,
                        config
                    );

                setFieldValue(
                    row,
                    field,
                    parsedValue,
                    record
                );

            }
        );

    const idField =
        getIdField(record);

    const dateField =
        getDateField(record);

    row[idField] =
        record[idField];

    if(dateField){

        row[dateField] =
            record[dateField];

    }

    return row;

}


/* =====================================================
   BUILD CHANGES
===================================================== */

function buildChanges(
    record,
    incoming
){

    const values =
        normalizeIncomingValues(
            incoming,
            record
        );

    let finalValues = {
        ...values
    };

    if(
        typeof currentOptions.prepareValues ===
        "function"
    ){

        const prepared =
            callFunction(
                currentOptions.prepareValues,
                [
                    finalValues,
                    record
                ],
                undefined
            );

        if(
            isObject(prepared)
        ){

            finalValues =
                prepared;

        }

    }

    const row =
        buildUpdatedRow(
            record,
            finalValues
        );

    let finalRow =
        row;

    if(
        typeof currentOptions.prepareRow ===
        "function"
    ){

        const prepared =
            callFunction(
                currentOptions.prepareRow,
                [
                    row,
                    record,
                    finalValues
                ],
                undefined
            );

        if(
            isObject(prepared)
        ){

            finalRow =
                prepared;

        }

    }

    const idField =
        getIdField(record);

    const dateField =
        getDateField(record);

    finalRow[idField] =
        record[idField];

    if(dateField){

        finalRow[dateField] =
            record[dateField];

    }

    return {

        values :
            finalValues,

        row :
            finalRow,

        target : {

            id :
                getRecordId(record),

            tanggal :
                getRecordDate(record)

        }

    };

}


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(
    message,
    type = ""
){

    if(!overlay){

        console.warn(
            "[EditRow]",
            message
        );

        return;

    }

    const result =
        overlay.querySelector(
            '[data-role="result"]'
        );

    if(!result){

        return;

    }

    result.className =
        "global-update-data-result";

    if(type){

        result.classList.add(type);

    }

    result.textContent =
        message;

    result.classList.remove(
        "hidden"
    );

}


/* =====================================================
   HIDE MESSAGE
===================================================== */

function hideMessage(){

    if(!overlay){

        return;

    }

    const result =
        overlay.querySelector(
            '[data-role="result"]'
        );

    if(result){

        result.className =
            "global-update-data-result hidden";

        result.textContent =
            "";

    }

}


/* =====================================================
   VALIDATE
===================================================== */

function validateRecord(
    record,
    incoming
){

    if(!record){

        return false;

    }

    const id =
        getRecordId(record);

    const tanggal =
        normalizeText(
            getRecordDate(record)
        );

    if(!id){

        showMessage(
            "ID transaksi tidak ditemukan.",
            "error"
        );

        return false;

    }

    if(!tanggal){

        showMessage(
            "Tanggal transaksi tidak ditemukan.",
            "error"
        );

        return false;

    }

    const values =
        normalizeIncomingValues(
            incoming,
            record
        );

    if(
        typeof currentOptions.validate ===
        "function"
    ){

        try{

            const result =
                currentOptions.validate(
                    record,
                    values,
                    {
                        values,

                        record,

                        fields :
                            getVisibleFields(
                                record,
                                values
                            )

                    }
                );

            if(result === false){

                return false;

            }

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

    const fields =
        getVisibleFields(
            record,
            values
        );

    for(
        const field of fields
    ){

        const config =
            getFieldConfig(
                field,
                record,
                values
            );

        if(
            !config.required
        ){

            continue;

        }

        const value =
            values[field] ??
            getFieldValue(
                field,
                record
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
   VALIDATE BATCH
===================================================== */

async function validateBatch(
    pending
){

    if(
        typeof currentOptions.validateBatch ===
        "function"
    ){

        const result =
            await currentOptions.validateBatch(
                pending
            );

        return result !== false;

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
        document.createElement("div");

    card.className =
        "global-update-data-detail-card";

    const title =
        document.createElement("h3");

    title.className =
        "global-update-data-detail-title";

    title.textContent =
        "Informasi Transaksi";

    card.appendChild(title);

    Object.keys(record)
        .forEach(
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

                row.appendChild(label);
                row.appendChild(value);

                card.appendChild(row);

            }
        );

    return card;

}


/* =====================================================
   CREATE FIELD ELEMENT
===================================================== */

function createFieldElement(
    field,
    record,
    context = {}
){

    const values =
        context?.values || {};

    const config =
        getFieldConfig(
            field,
            record,
            values
        );

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "global-update-data-field";


    /* =================================================
       SELECT
    ================================================= */

    if(
        config.type === "select"
    ){

        const label =
            document.createElement("label");

        label.className =
            "global-update-data-field-label";

        label.textContent =
            config.label;

        wrapper.appendChild(label);

        const select =
            document.createElement("select");

        select.name =
            field;

        select.className =
            "global-update-data-field-input";

        if(config.multiple){

            select.multiple =
                true;

        }

        const currentValue =
            getFieldValue(
                field,
                record
            );

        let currentFound =
            false;

        config.options
            .forEach(
                option => {

                    const optionElement =
                        document.createElement(
                            "option"
                        );

                    optionElement.value =
                        option.value ??
                        "";

                    optionElement.textContent =
                        option.label ??
                        option.value ??
                        "";

                    optionElement.disabled =
                        option.disabled === true;

                    if(
                        String(
                            optionElement.value
                        ) ===
                        String(
                            currentValue
                        )
                    ){

                        optionElement.selected =
                            true;

                        currentFound =
                            true;

                    }

                    select.appendChild(
                        optionElement
                    );

                }
            );

        if(
            currentValue !== "" &&
            currentValue !== null &&
            currentValue !== undefined &&
            !currentFound &&
            !config.multiple
        ){

            const fallback =
                document.createElement(
                    "option"
                );

            fallback.value =
                currentValue;

            fallback.textContent =
                String(currentValue);

            fallback.selected =
                true;

            select.insertBefore(
                fallback,
                select.firstChild
            );

        }

        select.disabled =
            config.disabled ||
            config.readonly;

        wrapper.appendChild(select);

        return wrapper;

    }


    /* =================================================
       CHECKBOX
    ================================================= */

    if(
        config.type === "checkbox"
    ){

        const checkboxWrapper =
            document.createElement("label");

        checkboxWrapper.className =
            "global-update-data-checkbox";

        const checkbox =
            document.createElement("input");

        checkbox.type =
            "checkbox";

        checkbox.name =
            field;

        checkbox.checked =
            Boolean(
                getFieldValue(
                    field,
                    record
                )
            );

        checkbox.disabled =
            config.disabled ||
            config.readonly;

        checkboxWrapper.appendChild(
            checkbox
        );

        const text =
            document.createElement("span");

        text.textContent =
            config.label;

        checkboxWrapper.appendChild(
            text
        );

        wrapper.appendChild(
            checkboxWrapper
        );

        return wrapper;

    }


    /* =================================================
       TEXTAREA
    ================================================= */

    if(
        config.type === "textarea"
    ){

        const label =
            document.createElement("label");

        label.className =
            "global-update-data-field-label";

        label.textContent =
            config.label;

        wrapper.appendChild(label);

        const textarea =
            document.createElement("textarea");

        textarea.name =
            field;

        textarea.className =
            "global-update-data-field-input";

        textarea.rows =
            config.rows;

        textarea.placeholder =
            config.placeholder;

        textarea.disabled =
            config.disabled;

        textarea.readOnly =
            config.readonly;

        textarea.value =
            serializeFieldValue(
                getFieldValue(
                    field,
                    record
                ),
                config.type
            );

        wrapper.appendChild(
            textarea
        );

        return wrapper;

    }


    /* =================================================
       DEFAULT INPUT
    ================================================= */

    const label =
        document.createElement("label");

    label.className =
        "global-update-data-field-label";

    label.textContent =
        config.label;

    wrapper.appendChild(label);

    const input =
        document.createElement("input");

    input.name =
        field;

    input.className =
        "global-update-data-field-input";

    input.type =
        config.type === "number"
            ? "number"
            : config.type === "date"
                ? "date"
                : "text";

    input.placeholder =
        config.placeholder;

    input.disabled =
        config.disabled;

    input.readOnly =
        config.readonly;

    if(
        config.min !== undefined
    ){

        input.min =
            config.min;

    }

    if(
        config.max !== undefined
    ){

        input.max =
            config.max;

    }

    if(
        config.step !== undefined
    ){

        input.step =
            config.step;

    }

    input.value =
        serializeFieldValue(
            getFieldValue(
                field,
                record
            ),
            config.type
        );

    wrapper.appendChild(input);

    return wrapper;

}


/* =====================================================
   RENDER FIELDS
===================================================== */

function renderFields(
    record,
    context = {}
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
        document.createElement("div");

    root.className =
        "global-update-data-fields-wrapper";

    const values = {

        ...(record || {}),

        ...(context?.values || {})

    };

    const fields =
        getVisibleFields(
            record,
            values
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

            root.appendChild(
                createFieldElement(
                    field,
                    record,
                    {
                        ...context,
                        values
                    }
                )
            );

        }
    );

    return root;

}


/* =====================================================
   RECORD LABEL
===================================================== */

function getRecordLabel(
    record
){

    if(
        typeof currentOptions.getRecordLabel ===
        "function"
    ){

        const result =
            callFunction(
                currentOptions.getRecordLabel,
                [record],
                undefined
            );

        if(
            result !== undefined &&
            result !== null
        ){

            return normalizeText(
                result
            );

        }

    }

    return (
        getRecordId(record) ||
        "Transaksi"
    );

}


/* =====================================================
   RECORD META
===================================================== */

function getRecordMeta(
    record
){

    if(
        typeof currentOptions.getRecordMeta ===
        "function"
    ){

        const result =
            callFunction(
                currentOptions.getRecordMeta,
                [record],
                undefined
            );

        if(
            result !== undefined &&
            result !== null
        ){

            return normalizeText(
                result
            );

        }

    }

    return normalizeText(
        getRecordDate(record)
    );

}


/* =====================================================
   SEARCH TEXT
===================================================== */

function getSearchText(
    record
){

    if(
        typeof currentOptions.getSearchText ===
        "function"
    ){

        const result =
            callFunction(
                currentOptions.getSearchText,
                [record],
                undefined
            );

        if(
            result !== undefined &&
            result !== null
        ){

            return normalizeText(
                result
            ).toLowerCase();

        }

    }

    try{

        return Object.values(record)
            .map(
                value =>
                    normalizeText(
                        value
                    ).toLowerCase()
            )
            .join(" ");

    }
    catch{

        return "";

    }

}


/* =====================================================
   SEARCH MATCH
===================================================== */

function matchesSearch(
    record,
    query
){

    const normalized =
        normalizeText(
            query
        ).toLowerCase();

    if(!normalized){

        return true;

    }

    return getSearchText(
        record
    ).includes(
        normalized
    );

}


/* =====================================================
   SOURCE RECORDS
===================================================== */

function getSourceRecords(){

    if(
        typeof currentOptions.getRecords ===
        "function"
    ){

        const records =
            callFunction(
                currentOptions.getRecords,
                [],
                []
            );

        return Array.isArray(records)
            ? records
            : [];

    }

    const records =
        getInputRaw();

    return Array.isArray(records)
        ? records
        : [];

}


/* =====================================================
   LATEST RECORDS
===================================================== */

function getLatestRecords(
    records
){

    if(
        !Array.isArray(records)
    ){

        return [];

    }

    return records
        .slice(-MAX_RECORDS)
        .reverse();

}


/* =====================================================
   PENDING KEY
===================================================== */

function getPendingKey(item){

    if(item?.key){

        return normalizeText(
            item.key
        );

    }

    if(item?.record){

        return getTargetKey(
            item.record
        );

    }

    return "";

}


/* =====================================================
   IS PENDING
===================================================== */

function isPending(record){

    const key =
        getTargetKey(record);

    return pendingChanges.some(
        item =>
            getPendingKey(item) ===
            key
    );

}


/* =====================================================
   ADD PENDING
===================================================== */

function addPending(
    record,
    incoming
){

    if(!record){

        return {

            success : false,

            message :
                "Transaksi tidak ditemukan."

        };

    }

    if(
        isPending(record)
    ){

        return {

            success : false,

            duplicate : true,

            message :
                currentOptions.duplicateText ||
                "Transaksi ini sudah ditambahkan."

        };

    }

    if(
        !validateRecord(
            record,
            incoming
        )
    ){

        return {

            success : false,

            message :
                "Data tidak valid."

        };

    }

    const changes =
        buildChanges(
            record,
            incoming
        );

    const item = {

        key :
            getTargetKey(record),

        record,

        changes,

        addedAt :
            Date.now()

    };

    pendingChanges.push(item);

    return {

        success : true,

        item,

        pending :
            pendingChanges.slice(),

        count :
            pendingChanges.length

    };

}


/* =====================================================
   REMOVE PENDING
===================================================== */

function removePending(target){

    const key =
        typeof target === "string"
            ? target
            : getPendingKey(target);

    const index =
        pendingChanges.findIndex(
            item =>
                getPendingKey(item) ===
                key
        );

    if(index === -1){

        return false;

    }

    pendingChanges.splice(
        index,
        1
    );

    return true;

}


/* =====================================================
   APPLY LOCAL UPDATE
===================================================== */

function applyLocalUpdate(item){

    if(
        !item?.record ||
        !item?.changes?.row
    ){

        return;

    }

    const key =
        getTargetKey(
            item.record
        );

    sourceRecords =
        sourceRecords.map(
            record =>
                getTargetKey(record) === key
                    ? {
                        ...record,
                        ...item.changes.row
                    }
                    : record
        );

    editableRecords =
        editableRecords.map(
            record =>
                getTargetKey(record) === key
                    ? {
                        ...record,
                        ...item.changes.row
                    }
                    : record
        );

    if(
        selectedRecord &&
        getTargetKey(
            selectedRecord
        ) === key
    ){

        selectedRecord = {

            ...selectedRecord,

            ...item.changes.row

        };

    }

}


/* =====================================================
   CONFIRM
===================================================== */

async function confirm(
    pending
){

    if(busy){

        return false;

    }

    if(
        !Array.isArray(pending) ||
        !pending.length
    ){

        return {

            success : false,

            remaining : [],

            count : 0,

            message :
                "Belum ada data yang ditambahkan."

        };

    }

    const valid =
        await validateBatch(
            pending
        );

    if(valid === false){

        return {

            success : false,

            remaining :
                pending

        };

    }

    busy = true;

    const remaining = [];

    let successCount = 0;

    try{

        for(
            const item of pending
        ){

            try{

                const record =
                    item.record;

                const changes =
                    item.changes;

                const target = {

                    id :
                        getRecordId(record),

                    tanggal :
                        getRecordDate(record)

                };

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

                applyLocalUpdate(item);

                successCount++;

            }
            catch(error){

                console.error(
                    "[EditRow] Update failed:",
                    error
                );

                remaining.push(item);

            }

        }

        if(
            successCount ===
            pending.length
        ){

            pendingChanges = [];

            if(
                typeof currentOptions.onConfirmed ===
                "function"
            ){

                try{

                    await currentOptions.onConfirmed(
                        {

                            success : true,

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

                success : true,

                remaining : [],

                count :
                    successCount,

                message :
                    `${successCount} data berhasil diperbarui.`

            };

        }

        pendingChanges =
            remaining.slice();

        if(
            successCount > 0
        ){

            return {

                success : false,

                remaining,

                count :
                    successCount,

                message :
                    `${successCount} data berhasil diperbarui. ` +
                    `${remaining.length} data gagal diperbarui.`

            };

        }

        return {

            success : false,

            remaining,

            count : 0,

            message :
                "Tidak ada data yang berhasil diperbarui."

        };

    }
    finally{

        busy = false;

    }

}


/* =====================================================
   UI TEXT
===================================================== */

function uiText(
    value,
    fallback = ""
){

    return normalizeText(
        value
    ) || fallback;

}


/* =====================================================
   CREATE ELEMENT
===================================================== */

function uiCreateElement(
    tag,
    className = "",
    text = ""
){

    const element =
        document.createElement(tag);

    if(className){

        element.className =
            className;

    }

    if(text){

        element.textContent =
            text;

    }

    return element;

}


/* =====================================================
   CREATE OVERLAY
===================================================== */

function createEditOverlay(){

    const old =
        document.getElementById(
            OVERLAY_ID
        );

    if(old){

        old.remove();

    }

    const root =
        uiCreateElement(
            "div",
            "global-update-data-overlay"
        );

    root.id =
        OVERLAY_ID;

    root.innerHTML = `
        <div class="global-update-data-panel">

            <div class="global-update-data-header">

                <div>
                    <h2
                        class="global-update-data-title"
                        data-role="title">
                    </h2>

                    <div
                        class="global-update-data-subtitle"
                        data-role="subtitle">
                    </div>
                </div>

                <button
                    type="button"
                    class="global-update-data-close"
                    data-action="close"
                    aria-label="Tutup">
                    ×
                </button>

            </div>


            <div class="global-update-data-search-wrapper">

                <input
                    type="search"
                    class="global-update-data-search"
                    data-role="search"
                    autocomplete="off">

            </div>


            <div
                class="global-update-data-list-wrapper"
                data-role="list">
            </div>


            <div
                class="global-update-data-selected"
                data-role="selected">
            </div>


            <div
                class="global-update-data-editor"
                data-role="editor">
            </div>


            <div
                class="global-update-data-pending"
                data-role="pending">
            </div>


            <div
                class="global-update-data-bottom">

                <div
                    class="global-update-data-result hidden"
                    data-role="result">
                </div>

                <button
                    type="button"
                    class="global-update-data-confirm"
                    data-action="confirm">
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(root);

root.classList.add("is-open");
document.body.classList.add("input-open");

overlay = root;

    updateOverlayText();

    bindEditOverlayEvents();

    return root;

}


/* =====================================================
   UPDATE OVERLAY TEXT
===================================================== */

function updateOverlayText(){

    if(!overlay){

        return;

    }

    const title =
        overlay.querySelector(
            '[data-role="title"]'
        );

    const subtitle =
        overlay.querySelector(
            '[data-role="subtitle"]'
        );

    const search =
        overlay.querySelector(
            '[data-role="search"]'
        );

    const confirmButton =
        overlay.querySelector(
            '[data-action="confirm"]'
        );

    if(title){

        title.textContent =
            uiText(
                currentOptions.title,
                "Edit Input Row"
            );

    }

    if(subtitle){

        subtitle.textContent =
            uiText(
                currentOptions.subtitle,
                "Ubah transaksi yang sudah tersimpan"
            );

    }

    if(search){

        search.placeholder =
            uiText(
                currentOptions.searchPlaceholder,
                "Cari transaksi..."
            );

    }

    if(confirmButton){

        confirmButton.textContent =
            busy
                ? uiText(
                    currentOptions.confirmLoadingText,
                    "Menyimpan perubahan..."
                )
                : uiText(
                    currentOptions.confirmText,
                    "Konfirmasi"
                );

        confirmButton.disabled =
            busy ||
            pendingChanges.length === 0;

    }

}


/* =====================================================
   BIND OVERLAY EVENTS
===================================================== */

function bindEditOverlayEvents(){

    if(!overlay){

        return;

    }

    const search =
        overlay.querySelector(
            '[data-role="search"]'
        );

    if(search){

        search.addEventListener(
            "input",
            event => {

                searchQuery =
                    event.target.value || "";

                renderRecordList();

            }
        );

    }

    const close =
        overlay.querySelector(
            '[data-action="close"]'
        );

    if(close){

        close.addEventListener(
            "click",
            closeEditOverlay
        );

    }

    const confirmButton =
        overlay.querySelector(
            '[data-action="confirm"]'
        );

    if(confirmButton){

        confirmButton.addEventListener(
            "click",
            async () => {

                await handleConfirmUI();

            }
        );

    }

}


/* =====================================================
   CLOSE OVERLAY
===================================================== */

function closeEditOverlay(){

    if(!overlay){
        return;
    }

    overlay.classList.remove("is-open");
    document.body.classList.remove("input-open");

    overlay.remove();

    overlay = null;

    selectedRecord = null;

    searchQuery = "";

}


/* =====================================================
   GET VISIBLE EDITABLE RECORDS
===================================================== */

function getVisibleEditableRecords(){

    return editableRecords.filter(
        record =>
            !isPending(record) &&
            matchesSearch(
                record,
                searchQuery
            )
    );

}


/* =====================================================
   RENDER RECORD LIST
===================================================== */

function renderRecordList(){

    if(!overlay){

        return;

    }

    const root =
        overlay.querySelector(
            '[data-role="list"]'
        );

    if(!root){

        return;

    }

    root.innerHTML = "";

    const records =
        getVisibleEditableRecords();

    if(
        !records.length
    ){

        const empty =
            uiCreateElement(
                "div",
                "global-update-data-empty",
                uiText(
                    currentOptions.emptyText,
                    "Tidak ada transaksi yang dapat diedit."
                )
            );

        root.appendChild(empty);

        return;

    }

    records.forEach(
        record => {

            const card =
                uiCreateElement(
                    "button",
                    "global-update-data-record",
                    ""
                );

            card.type =
                "button";

            card.dataset.key =
                getTargetKey(record);

            if(
                selectedRecord &&
                getTargetKey(
                    selectedRecord
                ) ===
                getTargetKey(record)
            ){

                card.classList.add(
                    "selected"
                );

            }

            const title =
                uiCreateElement(
                    "div",
                    "global-update-data-record-title",
                    getRecordLabel(record)
                );

            const meta =
                uiCreateElement(
                    "div",
                    "global-update-data-record-meta",
                    getRecordMeta(record)
                );

            card.appendChild(title);
            card.appendChild(meta);

            card.addEventListener(
                "click",
                () => {

                    selectRecordForEdit(
                        record
                    );

                }
            );

            root.appendChild(card);

        }
    );

}


/* =====================================================
   SELECT RECORD
===================================================== */

function selectRecordForEdit(
    record
){

    selectedRecord =
        record;

    hideMessage();

    renderRecordList();

    renderSelectedEditor();

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

            console.warn(
                "[EditRow] onSelect failed:",
                error
            );

        }

    }

}


/* =====================================================
   INITIAL EDITOR VALUES
===================================================== */

function getInitialEditorValues(
    record
){

    const values = {};

    getFieldList(record)
        .forEach(
            field => {

                values[field] =
                    getFieldValue(
                        field,
                        record
                    );

            }
        );

    return values;

}


/* =====================================================
   READ CURRENT FORM
===================================================== */

function readCurrentFormValues(){

    if(
        !selectedRecord ||
        !overlay
    ){

        return {};

    }

    const editor =
        overlay.querySelector(
            '[data-role="editor"]'
        );

    if(!editor){

        return {};

    }

    return readValuesFromDOM(
        selectedRecord,
        editor
    );

}


/* =====================================================
   RENDER SELECTED EDITOR
===================================================== */

function renderSelectedEditor(){

    if(!overlay){

        return;

    }

    const selectedRoot =
        overlay.querySelector(
            '[data-role="selected"]'
        );

    const editorRoot =
        overlay.querySelector(
            '[data-role="editor"]'
        );

    if(!selectedRoot ||
       !editorRoot
    ){

        return;

    }

    selectedRoot.innerHTML = "";

    editorRoot.innerHTML = "";

    if(!selectedRecord){

        return;

    }

    const card =
        uiCreateElement(
            "div",
            "global-update-data-selected-card"
        );

    const title =
        uiCreateElement(
            "div",
            "global-update-data-selected-title",
            getRecordLabel(
                selectedRecord
            )
        );

    const meta =
        uiCreateElement(
            "div",
            "global-update-data-selected-meta",
            getRecordMeta(
                selectedRecord
            )
        );

    card.appendChild(title);
    card.appendChild(meta);

    selectedRoot.appendChild(card);

    renderEditorFieldsFromRecord();

}


/* =====================================================
   RENDER EDITOR FIELDS
===================================================== */

function renderEditorFieldsFromRecord(
    valuesOverride = null
){

    if(
        !overlay ||
        !selectedRecord
    ){

        return;

    }

    const editorRoot =
        overlay.querySelector(
            '[data-role="editor"]'
        );

    if(!editorRoot){

        return;

    }

    const existingValues =
        valuesOverride ||
        readCurrentFormValues();

    const values = {

        ...getInitialEditorValues(
            selectedRecord
        ),

        ...existingValues

    };

    const fields =
        renderFields(
            selectedRecord,
            {
                values
            }
        );

    editorRoot.innerHTML = "";

    editorRoot.appendChild(
        fields
    );

    bindEditorFieldEvents();

    renderAddState();

}


/* =====================================================
   BIND FIELD EVENTS
===================================================== */

function bindEditorFieldEvents(){

    if(!overlay){

        return;

    }

    const editor =
        overlay.querySelector(
            '[data-role="editor"]'
        );

    if(!editor){

        return;

    }

    const elements =
        editor.querySelectorAll(
            "input, select, textarea"
        );

    elements.forEach(
        element => {

            element.addEventListener(
                "input",
                () => {

                    rerenderEditorKeepingValues();

                }
            );

            element.addEventListener(
                "change",
                () => {

                    rerenderEditorKeepingValues();

                }
            );

        }
    );

}


/* =====================================================
   RERENDER EDITOR KEEPING VALUES
===================================================== */

function rerenderEditorKeepingValues(){

    if(
        !selectedRecord
    ){

        return;

    }

    const values =
        readCurrentFormValues();

    renderEditorFieldsFromRecord(
        values
    );

}


/* =====================================================
   RENDER ADD STATE
===================================================== */

function renderAddState(){

    if(!overlay){

        return;

    }

    const editor =
        overlay.querySelector(
            '[data-role="editor"]'
        );

    if(!editor){

        return;

    }

    let button =
        editor.querySelector(
            '[data-action="add"]'
        );

    if(!button){

        button =
            uiCreateElement(
                "button",
                "global-update-data-add",
                uiText(
                    currentOptions.addText,
                    "Tambahkan"
                )
            );

        button.type =
            "button";

        button.dataset.action =
            "add";

        editor.appendChild(
            button
        );

        button.addEventListener(
            "click",
            () => {

                handleAddUI();

            }
        );

    }

    button.disabled =
        !selectedRecord ||
        busy ||
        isPending(selectedRecord);

    button.textContent =
        isPending(selectedRecord)
            ? "Sudah Ditambahkan"
            : uiText(
                currentOptions.addText,
                "Tambahkan"
            );

}


/* =====================================================
   HANDLE ADD UI
===================================================== */

function handleAddUI(){

    if(
        !selectedRecord ||
        busy
    ){

        return;

    }

    hideMessage();

    const values =
        readCurrentFormValues();

    const result =
        addPending(
            selectedRecord,
            values
        );

    if(!result.success){

        showMessage(
            result.message ||
            "Data tidak dapat ditambahkan.",
            "error"
        );

        return;

    }

    if(
        typeof currentOptions.onAdd ===
        "function"
    ){

        try{

            currentOptions.onAdd(
                selectedRecord,
                values,
                result
            );

        }
        catch(error){

            console.warn(
                "[EditRow] onAdd failed:",
                error
            );

        }

    }

    selectedRecord = null;

    renderRecordList();

    renderSelectedEditor();

    renderPendingUI();

    updateOverlayText();

}


/* =====================================================
   RENDER PENDING
===================================================== */

function renderPendingUI(){

    if(!overlay){

        return;

    }

    const root =
        overlay.querySelector(
            '[data-role="pending"]'
        );

    if(!root){

        return;

    }

    root.innerHTML = "";

    if(
        !pendingChanges.length
    ){

        return;

    }

    const title =
        uiCreateElement(
            "div",
            "global-update-data-pending-title",
            uiText(
                currentOptions.pendingTitle,
                "Sudah Ditambahkan"
            )
        );

    root.appendChild(title);

    const list =
        uiCreateElement(
            "div",
            "global-update-data-pending-list"
        );

    pendingChanges.forEach(
        item => {

            const row =
                uiCreateElement(
                    "div",
                    "global-update-data-pending-item"
                );

            const text =
                uiCreateElement(
                    "div",
                    "global-update-data-pending-item-text",
                    typeof currentOptions.getPendingLabel ===
                    "function"
                        ? currentOptions.getPendingLabel(
                            item
                        )
                        : getRecordLabel(
                            item.record
                        )
                );

            const meta =
                uiCreateElement(
                    "div",
                    "global-update-data-pending-item-meta",
                    getRecordMeta(
                        item.record
                    )
                );

            const remove =
                uiCreateElement(
                    "button",
                    "global-update-data-pending-remove",
                    uiText(
                        currentOptions.removeText,
                        "Hapus"
                    )
                );

            remove.type =
                "button";

            remove.addEventListener(
                "click",
                () => {

                    const removed =
                        removePending(item);

                    if(
                        removed &&
                        typeof currentOptions.onRemove ===
                        "function"
                    ){

                        try{

                            currentOptions.onRemove(
                                item
                            );

                        }
                        catch(error){

                            console.warn(
                                "[EditRow] onRemove failed:",
                                error
                            );

                        }

                    }

                    renderPendingUI();

                    renderRecordList();

                    updateOverlayText();

                }
            );

            const info =
                uiCreateElement(
                    "div",
                    "global-update-data-pending-item-info"
                );

            info.appendChild(text);
            info.appendChild(meta);

            row.appendChild(info);
            row.appendChild(remove);

            list.appendChild(row);

        }
    );

    root.appendChild(list);

}


/* =====================================================
   HANDLE CONFIRM UI
===================================================== */

async function handleConfirmUI(){

    if(
        busy ||
        !pendingChanges.length
    ){

        return;

    }

    hideMessage();

    updateOverlayText();

    const snapshot =
        pendingChanges.slice();

    const result =
        await confirm(
            snapshot
        );

    if(
        result?.success
    ){

        /*
           Record yang sukses sudah
           diperbarui secara lokal.

           Sekarang keluarkan dari
           editableRecords agar langsung
           hilang dari daftar edit.
        */

        const successfulKeys =
            new Set(
                snapshot
                    .filter(
                        item =>
                            !result.remaining?.some(
                                failed =>
                                    getPendingKey(
                                        failed
                                    ) ===
                                    getPendingKey(
                                        item
                                    )
                            )
                    )
                    .map(
                        item =>
                            getPendingKey(item)
                    )
            );

        editableRecords =
            editableRecords.filter(
                record =>
                    !successfulKeys.has(
                        getTargetKey(record)
                    )
            );

        if(
            selectedRecord &&
            successfulKeys.has(
                getTargetKey(
                    selectedRecord
                )
            )
        ){

            selectedRecord = null;

        }

    }
    else if(
        result?.remaining
    ){

        const failedKeys =
            new Set(
                result.remaining.map(
                    item =>
                        getPendingKey(item)
                )
            );

        /*
           Record yang berhasil disimpan
           dikeluarkan dari editable list.
        */

        const successfulKeys =
            new Set(
                snapshot
                    .map(
                        item =>
                            getPendingKey(item)
                    )
                    .filter(
                        key =>
                            !failedKeys.has(key)
                    )
            );

        editableRecords =
            editableRecords.filter(
                record =>
                    !successfulKeys.has(
                        getTargetKey(record)
                    )
            );

        if(
            selectedRecord &&
            successfulKeys.has(
                getTargetKey(
                    selectedRecord
                )
            )
        ){

            selectedRecord = null;

        }

    }

    renderRecordList();

    renderSelectedEditor();

    renderPendingUI();

    updateOverlayText();

    if(
        result?.message
    ){

        showMessage(
            result.message,
            result.success
                ? "success"
                : "error"
        );

    }

}


/* =====================================================
   OPEN
===================================================== */

function open(options = {}){

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

        strictFieldList :
            false,

        ...options

    };

    sourceRecords =
        getSourceRecords();

    editableRecords =
        getLatestRecords(
            sourceRecords
        );

    pendingChanges = [];

    selectedRecord = null;

    busy = false;

    searchQuery = "";

    overlay =
        createEditOverlay();

    renderRecordList();

    renderSelectedEditor();

    renderPendingUI();

    updateOverlayText();

    return {

        close :
            closeEditOverlay,

        refresh :
            () => {

                refresh();

            },

        getPending :
            () =>
                pendingChanges.slice(),

        getPendingCount :
            () =>
                pendingChanges.length

    };

}


/* =====================================================
   REFRESH
===================================================== */

function refresh(){

    sourceRecords =
        getSourceRecords();

    editableRecords =
        getLatestRecords(
            sourceRecords
        );

    selectedRecord = null;

    searchQuery = "";

    if(overlay){

        const search =
            overlay.querySelector(
                '[data-role="search"]'
            );

        if(search){

            search.value =
                "";

        }

        renderRecordList();

        renderSelectedEditor();

        renderPendingUI();

        updateOverlayText();

    }

    return editableRecords.slice();

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

    open,


    /* =================================================
       GET SOURCE
    ================================================= */

    getRecords(){

        return sourceRecords.slice();

    },


    /* =================================================
       GET EDITABLE
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

    getId(record){

        return getRecordId(record);

    },


    /* =================================================
       GET DATE
    ================================================= */

    getDate(record){

        return getRecordDate(record);

    },


    /* =================================================
       GET TARGET
    ================================================= */

    getTarget(record){

        return {

            id :
                getRecordId(record),

            tanggal :
                getRecordDate(record)

        };

    },


    /* =================================================
       GET KEY
    ================================================= */

    getKey(record){

        return getTargetKey(record);

    },


    /* =================================================
       GET SHEET FIELD
    ================================================= */

    getSheetField(
        field,
        record
    ){

        return getSheetField(
            field,
            record
        );

    },


    /* =================================================
       GET FIELD VALUE
    ================================================= */

    getFieldValue(
        field,
        record
    ){

        return getFieldValue(
            field,
            record
        );

    },


    /* =================================================
       GET FIELD LIST
    ================================================= */

    getFields(record){

        return getFieldList(
            record
        );

    },


    /* =================================================
       GET VISIBLE FIELDS
    ================================================= */

    getVisibleFields(
        record,
        values = {}
    ){

        return getVisibleFields(
            record,
            values
        );

    },


    /* =================================================
       GET FIELD CONFIG
    ================================================= */

    getFieldConfig(
        field,
        record,
        values = {}
    ){

        return getFieldConfig(
            field,
            record,
            values
        );

    },


    /* =================================================
       GET OPTIONS
    ================================================= */

    getFieldOptions(
        field,
        record,
        values = {}
    ){

        return getFieldOptions(
            field,
            record,
            values
        );

    },


    /* =================================================
       GET STEP
    ================================================= */

    getStep(
        field,
        record
    ){

        return findStep(
            field,
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
       BUILD CHANGES
    ================================================= */

    buildChanges(
        record,
        values
    ){

        return buildChanges(
            record,
            values
        );

    },


    /* =================================================
       REFRESH
    ================================================= */

    refresh(){


        return refresh();

    },


    /* =================================================
       CLOSE
    ================================================= */

    close(){

        closeEditOverlay();

    },


    /* =================================================
       RESET
    ================================================= */

    reset(){

        closeEditOverlay();

        currentOptions = {};

        sourceRecords = [];

        editableRecords = [];

        pendingChanges = [];

        selectedRecord = null;

        busy = false;

        searchQuery = "";

    }

};


/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default EditRow;
