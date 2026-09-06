/* =====================================================
   Finance Assistant
   Component : Global Input
   File      : editrow.js
   Version   : 3.0.0

   Description :
   Generic Edit Input Row Engine

   UI / FLOW :
   - Full screen overlay
   - Direct record list
   - Search
   - Selected record detail
   - Workspace edit fields
   - Tambahkan
   - Temporary pending
   - Batch confirmation

   Target :
   - ID + Tanggal

   Locked :
   - ID
   - Tanggal

   Update :
   - Update.updateRow()

   Principle :
   - Workspace agnostic
   - Tidak bergantung pada UpdateData
   - Tidak mengubah Reward Airdrop
   - Tidak ada request saat record dipilih
   - Tidak ada request saat Tambahkan
   - Request hanya saat Konfirmasi
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

const MAX_RECORDS =
    20;


const OVERLAY_ID =
    "global-update-data-overlay";


/* =====================================================
   STATE
===================================================== */

let overlay =
    null;


let initialized =
    false;


let currentOptions =
    {};


let sourceRecords =
    [];


let currentRecords =
    [];


let selectedRecord =
    null;


let pendingChanges =
    [];


let isBusy =
    false;


/* =====================================================
   DEFAULTS
===================================================== */

const DEFAULTS = {

    title :
        "Edit Input Row",

    subtitle :
        "Ubah data yang sudah tersimpan",

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

    removeText :
        "Hapus",

    pendingTitle :
        "Sudah Ditambahkan",

    addedText :
        "Perubahan berhasil disimpan.",

    duplicateText :
        "Transaksi ini sudah ditambahkan.",

    confirmLoadingText :
        "Menyimpan perubahan...",

    closeOnEscape :
        true,

    allowBackdropClose :
        true,

    lockBody :
        true,

    strictFieldList :
        false

};


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
   NORMALIZE TEXT
===================================================== */

function normalizeText(
    value
){

    return safeText(
        value
    ).trim();

}


/* =====================================================
   NORMALIZE KEY
===================================================== */

function normalizeKey(
    value
){

    return normalizeText(
        value
    ).toLowerCase();

}


/* =====================================================
   OBJECT
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
   SAFE ARRAY
===================================================== */

function safeArray(
    value
){

    return Array.isArray(
        value
    )
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

        return fn(
            ...args
        );

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
   GET OPTION
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


    return DEFAULTS[
        name
    ];

}


/* =====================================================
   CREATE ELEMENT
===================================================== */

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
   IS ELEMENT
===================================================== */

function isElement(
    value
){

    return (
        typeof HTMLElement !== "undefined" &&
        value instanceof HTMLElement
    );

}


/* =====================================================
   RECORD TARGET
===================================================== */


/* =====================================================
   GET ID FIELD
===================================================== */

function getIdField(
    record
){

    if(
        typeof currentOptions.getIdField ===
        "function"
    ){

        const result =
            callFunction(
                currentOptions.getIdField,
                [
                    record
                ],
                undefined
            );


        if(
            result
        ){

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
   GET DATE FIELD
===================================================== */

function getDateField(
    record
){

    if(
        typeof currentOptions.getDateField ===
        "function"
    ){

        const result =
            callFunction(
                currentOptions.getDateField,
                [
                    record
                ],
                undefined
            );


        if(
            result
        ){

            return result;

        }

    }


    if(
        !record ||
        typeof record !== "object"
    ){

        return null;

    }


    const aliases = [
        "tanggal",
        "date"
    ];


    for(
        const key of Object.keys(
            record
        )
    ){

        if(
            aliases.includes(
                normalizeKey(
                    key
                )
            )
        ){

            return key;

        }

    }


    return null;

}


/* =====================================================
   GET RECORD ID
===================================================== */

function getRecordId(
    record
){

    const field =
        getIdField(
            record
        );


    return normalizeText(
        record?.[
            field
        ]
    );

}


/* =====================================================
   GET RECORD DATE
===================================================== */

function getRecordDate(
    record
){

    const field =
        getDateField(
            record
        );


    return field
        ? record?.[
            field
        ] ?? ""
        : "";

}


/* =====================================================
   TARGET KEY
===================================================== */

function getTargetKey(
    record
){

    if(
        typeof currentOptions.getTargetKey ===
        "function"
    ){

        const result =
            callFunction(
                currentOptions.getTargetKey,
                [
                    record
                ],
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
        getRecordId(
            record
        ) +
        "|" +
        normalizeText(
            getRecordDate(
                record
            )
        )
    );

}


/* =====================================================
   FIELD ADAPTER
===================================================== */


/* =====================================================
   GET SHEET FIELD
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


        if(
            result
        ){

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
   GET FIELD VALUE
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


    if(
        record &&
        Object.prototype.hasOwnProperty.call(
            record,
            field
        )
    ){

        return record[
            field
        ];

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
            sheetField
        )
    ){

        return record[
            sheetField
        ];

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


    row[
        sheetField
    ] =
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
        getIdField(
            record
        );


    const dateField =
        getDateField(
            record
        );


    if(
        field === idField ||
        normalizeKey(
            field
        ) === "id"
    ){

        return true;

    }


    if(
        field === dateField ||
        normalizeKey(
            field
        ) === "tanggal" ||
        normalizeKey(
            field
        ) === "date"
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


        if(
            result === true
        ){

            return true;

        }

    }


    return safeArray(
        currentOptions.lockedFields
    ).includes(
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

function getSteps(
    record
){

    let steps =
        currentOptions.steps;


    if(
        typeof steps === "function"
    ){

        steps =
            callFunction(
                steps,
                [
                    record
                ],
                []
            );

    }


    return safeArray(
        steps
    );

}


/* =====================================================
   STEP FIELD NAME
===================================================== */

function getStepFieldName(
    step
){

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

    return getSteps(
        record
    ).find(
        step =>
            getStepFieldName(
                step
            ) === field
    ) || null;

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
        isObject(
            condition
        )
    ){

        const field =
            condition.field ??
            condition.id;


        const actual =
            values?.[
                field
            ] ??
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

            return String(
                actual
            ) ===
            String(
                condition.equals
            );

        }


        if(
            Object.prototype.hasOwnProperty.call(
                condition,
                "notEquals"
            )
        ){

            return String(
                actual
            ) !==
            String(
                condition.notEquals
            );

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


    return Boolean(
        condition
    );

}


/* =====================================================
   STEP VISIBILITY
===================================================== */

function isStepVisible(
    step,
    record,
    values = {}
){

    if(
        !step
    ){

        return false;

    }


    const conditions = [
        "showIf",
        "visibleIf",
        "showWhen",
        "condition"
    ];


    for(
        const key of conditions
    ){

        if(
            step[key] !== undefined &&
            !evaluateCondition(
                step[key],
                values,
                record
            )
        ){

            return false;

        }

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

            return safeText(
                result
            );

        }

    }


    const step =
        findStep(
            field,
            record
        );


    /*
       IMPORTANT :

       label boleh berupa function:

       values =>
           values.jenis === "transfer"
               ? "Bank Tujuan"
               : "Nama Bank"

       Function HARUS dieksekusi.
       Jangan pernah ditampilkan
       sebagai source code.
    */

    if(
        typeof step?.label === "function"
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

            return safeText(
                result
            );

        }

    }


    if(
        step?.label !== undefined &&
        step?.label !== null
    ){

        return safeText(
            step.label
        );

    }


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


        if(
            result
        ){

            return result;

        }

    }


    const step =
        findStep(
            field,
            record
        );


    if(
        step?.type
    ){

        return step.type;

    }


    const normalized =
        normalizeKey(
            field
        );


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
        Array.isArray(
            value
        ) ||
        isObject(
            value
        )
    ){

        return "textarea";

    }


    return "text";

}


/* =====================================================
   OPTION NORMALIZATION
===================================================== */

function normalizeOption(
    option
){

    if(
        isObject(
            option
        )
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
                option.disabled === true ||
                option.ariaDisabled === true

        };

    }


    return {

        value :
            option,

        label :
            option,

        note :
            "",

        disabled :
            false

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
            Array.isArray(
                result
            )
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

        options =
            callFunction(
                options,
                [
                    values,
                    record
                ],
                []
            );

    }


    return safeArray(
        options
    ).map(
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

    let config =
        {};


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
            isObject(
                result
            )
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


    if(
        step
    ){

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

        options =
            callFunction(
                options,
                [
                    values,
                    record
                ],
                []
            );

    }


    if(
        !Array.isArray(
            options
        ) &&
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

        id :
            field,

        sheetField :
            config.sheetField ??
            getSheetField(
                field,
                record
            ),

        label :
            safeText(
                label
            ),

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
            safeArray(
                options
            ).map(
                normalizeOption
            ),

        rows :
            config.rows ||
            3,

        showIf :
            config.showIf,

        visibleIf :
            config.visibleIf,

        showWhen :
            config.showWhen,

        condition :
            config.condition,

        multiple :
            config.multiple === true,

        note :
            config.note ??
            ""

    };

}


/* =====================================================
   FIELD LIST
===================================================== */

function getFieldList(
    record
){

    if(
        !isObject(
            record
        )
    ){

        return [];

    }


    /*
       Workspace explicit order.
    */

    if(
        typeof currentOptions.getFieldOrder ===
        "function"
    ){

        const result =
            callFunction(
                currentOptions.getFieldOrder,
                [
                    record
                ],
                undefined
            );


        if(
            Array.isArray(
                result
            )
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
        getSteps(
            record
        );


    if(
        steps.length
    ){

        const fields =
            [];


        steps.forEach(
            step => {

                const field =
                    getStepFieldName(
                        step
                    );


                if(
                    !field
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


                if(
                    !fields.includes(
                        field
                    )
                ){

                    fields.push(
                        field
                    );

                }

            }
        );


        /*
           Tambahkan field lain
           bila strictFieldList false.
        */

        if(
            currentOptions.strictFieldList !== true
        ){

            Object.keys(
                record
            ).forEach(
                field => {

                    if(
                        fields.includes(
                            field
                        )
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


                    fields.push(
                        field
                    );

                }
            );

        }


        return fields;

    }


    return Object.keys(
        record
    ).filter(
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

    return getFieldList(
        record
    ).filter(
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

        return Boolean(
            rawValue
        );

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
            Number(
                rawValue
            );


        return Number.isNaN(
            number
        )
            ? rawValue
            : number;

    }


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


    if(
        type === "select"
    ){

        const match =
            safeArray(
                config.options
            ).find(
                option =>
                    String(
                        option.value
                    ) ===
                    String(
                        rawValue
                    )
            );


        if(
            match
        ){

            return match.value;

        }

    }


    return rawValue;

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
   COLLECT FIELD VALUES
===================================================== */

function collectFieldValues(){

    const values =
        {};


    const fields =
        overlay?.querySelectorAll(
            "[data-update-field]"
        ) ||
        [];


    fields.forEach(
        element => {

            const name =
                element.name;


            if(
                !name
            ){

                return;

            }


            const original =
                getFieldValue(
                    name,
                    selectedRecord
                );


            const config =
                getFieldConfig(
                    name,
                    selectedRecord,
                    values
                );


            const raw =
                element.type === "checkbox"
                    ? element.checked
                    : element.value;


            values[
                name
            ] =
                parseFieldValue(
                    name,
                    raw,
                    original,
                    selectedRecord,
                    config
                );

        }
    );


    return values;

}


/* =====================================================
   READ VALUES FROM ROOT
===================================================== */

function readValuesFromRoot(
    root,
    record
){

    const values =
        {};


    if(
        !root ||
        typeof root.querySelectorAll !==
        "function"
    ){

        return values;

    }


    root.querySelectorAll(
        "[data-update-field], [name]"
    ).forEach(
        element => {

            const name =
                element.name;


            if(
                !name ||
                !isEditableField(
                    name,
                    record
                )
            ){

                return;

            }


            const original =
                getFieldValue(
                    name,
                    record
                );


            const config =
                getFieldConfig(
                    name,
                    record,
                    values
                );


            const raw =
                element.type === "checkbox"
                    ? element.checked
                    : element.value;


            values[
                name
            ] =
                parseFieldValue(
                    name,
                    raw,
                    original,
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
    values = {}
){

    const row = {
        ...record
    };


    Object.keys(
        values
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


            const config =
                getFieldConfig(
                    field,
                    record,
                    values
                );


            const original =
                getFieldValue(
                    field,
                    record
                );


            const parsed =
                parseFieldValue(
                    field,
                    values[field],
                    original,
                    record,
                    config
                );


            setFieldValue(
                row,
                field,
                parsed,
                record
            );

        }
    );


    const idField =
        getIdField(
            record
        );


    const dateField =
        getDateField(
            record
        );


    /*
       ID selalu dari record asli.
    */

    row[
        idField
    ] =
        record[
            idField
        ];


    /*
       Tanggal selalu dari record asli.
    */

    if(
        dateField
    ){

        row[
            dateField
        ] =
            record[
                dateField
            ];

    }


    return row;

}


/* =====================================================
   BUILD CHANGES
===================================================== */

async function buildChanges(
    record,
    incoming
){

    let values = {

        ...(incoming || {})

    };


    /*
       Workspace preprocessing.
    */

    if(
        typeof currentOptions.prepareValues ===
        "function"
    ){

        const prepared =
            await callFunction(
                currentOptions.prepareValues,
                [
                    values,
                    record
                ],
                undefined
            );


        if(
            isObject(
                prepared
            )
        ){

            values =
                prepared;

        }

    }


    /*
       Workspace custom builder.

       Returning undefined berarti
       gunakan generic builder.
    */

    if(
        typeof currentOptions.buildChanges ===
        "function"
    ){

        const custom =
            await callFunction(
                currentOptions.buildChanges,
                [
                    record,
                    values
                ],
                undefined
            );


        if(
            custom !== undefined
        ){

            if(
                isObject(
                    custom
                ) &&
                custom.row
            ){

                const customRow = {
                    ...custom.row
                };


                const idField =
                    getIdField(
                        record
                    );


                const dateField =
                    getDateField(
                        record
                    );


                customRow[
                    idField
                ] =
                    record[
                        idField
                    ];


                if(
                    dateField
                ){

                    customRow[
                        dateField
                    ] =
                        record[
                            dateField
                        ];

                }


                return {

                    values :
                        custom.values ??
                        values,

                    row :
                        customRow,

                    target :
                        custom.target ??
                        {

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


            if(
                isObject(
                    custom
                )
            ){

                return custom;

            }


            if(
                custom === null ||
                custom === false
            ){

                return custom;

            }

        }

    }


    /*
       Generic full-row builder.
    */

    let row =
        buildUpdatedRow(
            record,
            values
        );


    /*
       Workspace postprocessing.
    */

    if(
        typeof currentOptions.prepareRow ===
        "function"
    ){

        const prepared =
            await callFunction(
                currentOptions.prepareRow,
                [
                    row,
                    record,
                    values
                ],
                undefined
            );


        if(
            isObject(
                prepared
            )
        ){

            row =
                prepared;

        }

    }


    /*
       ID + tanggal selalu authoritative.
    */

    const idField =
        getIdField(
            record
        );


    const dateField =
        getDateField(
            record
        );


    row[
        idField
    ] =
        record[
            idField
        ];


    if(
        dateField
    ){

        row[
            dateField
        ] =
            record[
                dateField
            ];

    }


    return {

        values :
            values,

        row :
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
   RECORD SOURCE
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


        return Array.isArray(
            records
        )
            ? records
            : [];

    }


    const records =
        getInputRaw();


    return Array.isArray(
        records
    )
        ? records
        : [];

}


/* =====================================================
   LATEST RECORDS
===================================================== */

function getLatestRecords(
    records
){

    return safeArray(
        records
    )
        .slice(
            -MAX_RECORDS
        )
        .reverse();

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
        record =>
            !pendingKeys.has(
                getTargetKey(
                    record
                )
            )
    );

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
                [
                    record
                ],
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
        normalizeText(
            record?.project
        ) ||
        normalizeText(
            record?.nama
        ) ||
        normalizeText(
            record?.name
        ) ||
        normalizeText(
            record?.title
        ) ||
        getRecordId(
            record
        ) ||
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
                [
                    record
                ],
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
        getRecordDate(
            record
        )
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

        return normalizeText(
            callFunction(
                currentOptions.getSearchText,
                [
                    record
                ],
                ""
            )
        ).toLowerCase();

    }


    try{

        return Object.values(
            record || {}
        )
            .map(
                value =>
                    normalizeText(
                        value
                    ).toLowerCase()
            )
            .join(
                " "
            );

    }
    catch{

        return "";

    }

}


/* =====================================================
   FILTER RECORDS
===================================================== */

function getFilteredRecords(){

    const search =
        overlay?.querySelector(
            '[data-role="record-search"]'
        );


    const query =
        normalizeText(
            search?.value
        ).toLowerCase();


    const records =
        getAvailableRecords();


    if(
        !query
    ){

        return records;

    }


    return records.filter(
        record => {

            const label =
                getRecordLabel(
                    record
                ).toLowerCase();


            const meta =
                getRecordMeta(
                    record
                ).toLowerCase();


            const id =
                getRecordId(
                    record
                ).toLowerCase();


            const all =
                getSearchText(
                    record
                );


            return (
                label.includes(
                    query
                ) ||
                meta.includes(
                    query
                ) ||
                id.includes(
                    query
                ) ||
                all.includes(
                    query
                )
            );

        }
    );

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


/* =====================================================
   HIDE RESULT
===================================================== */

function hideResult(){

    const result =
        overlay?.querySelector(
            '[data-role="result"]'
        );


    if(
        result
    ){

        result.classList.add(
            "hidden"
        );

    }

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
        OVERLAY_ID;


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
                        class="global-update-data-title"
                        data-role="title"
                    >
                        Edit Input Row
                    </h2>


                    <span
                        id="global-update-data-subtitle"
                        class="global-update-data-subtitle"
                        data-role="subtitle"
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
                            Transaksi Terbaru
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


                <!-- ACTION -->

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
   UPDATE OVERLAY TEXT
===================================================== */

function updateOverlayText(){

    if(
        !overlay
    ){

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


    const listTitle =
        overlay.querySelector(
            '[data-role="record-title"]'
        );


    const search =
        overlay.querySelector(
            '[data-role="record-search"]'
        );


    const pendingTitle =
        overlay.querySelector(
            '[data-role="pending-title"]'
        );


    const confirm =
        overlay.querySelector(
            '[data-role="confirm"]'
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
                )
            );

    }


    if(
        pendingTitle
    ){

        pendingTitle.textContent =
            safeText(
                getOption(
                    "pendingTitle"
                )
            );

    }


    if(
        confirm
    ){

        confirm.disabled =
            isBusy ||
            pendingChanges.length === 0;


        confirm.textContent =
            safeText(
                isBusy
                    ? getOption(
                        "confirmLoadingText"
                    )
                    : getOption(
                        "confirmText"
                    )
            );

    }

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

            EditRow.close();

        }
    );


    backdrop?.addEventListener(
        "click",
        () => {

            if(
                getOption(
                    "allowBackdropClose"
                ) === false
            ){

                return;

            }


            EditRow.close();

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

            EditRow.add();

        }
    );


    confirmButton?.addEventListener(
        "click",
        () => {

            EditRow.confirm();

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

        EditRow.close();

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


    list.innerHTML =
        "";


    const records =
        getFilteredRecords();


    if(
        !records.length
    ){

        const search =
            normalizeText(
                overlay?.querySelector(
                    '[data-role="record-search"]'
                )?.value
            );


        list.appendChild(
            createElement(
                "div",
                "global-update-data-empty",
                search
                    ? "Data tidak ditemukan."
                    : getOption(
                        "emptyText"
                    )
            )
        );


        return;

    }


    records.forEach(
        record => {

            const key =
                getTargetKey(
                    record
                );


            const item =
                createElement(
                    "button",
                    "global-update-data-record-item"
                );


            item.type =
                "button";


            item.dataset.key =
                key;


            if(
                selectedRecord &&
                getTargetKey(
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

                content.appendChild(
                    createElement(
                        "span",
                        "global-update-data-record-item-meta",
                        metaText
                    )
                );

            }


            const id =
                getRecordId(
                    record
                );


            if(
                id
            ){

                content.appendChild(
                    createElement(
                        "span",
                        "global-update-data-record-item-id",
                        id
                    )
                );

            }


            item.appendChild(
                content
            );


            item.appendChild(
                createElement(
                    "span",
                    "global-update-data-record-item-arrow",
                    "›"
                )
            );


            item.addEventListener(
                "click",
                () => {

                    if(
                        isBusy
                    ){

                        return;

                    }


                    selectRecord(
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

function selectRecord(
    record
){

    if(
        !record ||
        isBusy
    ){

        return false;

    }


    const key =
        getTargetKey(
            record
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

            console.warn(
                "[EditRow] onSelect failed:",
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


    return true;

}


/* =====================================================
   DETAIL
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


    container.innerHTML =
        "";


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


    let result =
        null;


    if(
        typeof currentOptions.renderDetail ===
        "function"
    ){

        result =
            callFunction(
                currentOptions.renderDetail,
                [
                    selectedRecord
                ],
                null
            );

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


    card.appendChild(
        createElement(
            "h3",
            "global-update-data-detail-title",
            descriptor.title ||
            "Informasi Transaksi"
        )
    );


    safeArray(
        descriptor.items
    ).forEach(
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


    card.appendChild(
        createElement(
            "h3",
            "global-update-data-detail-title",
            "Informasi Transaksi"
        )
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
        "Tanggal",
        getRecordDate(
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
        locked
    ){

        row.classList.add(
            "locked"
        );

    }


    row.appendChild(
        createElement(
            "span",
            "global-update-data-detail-label",
            label
        )
    );


    const valueWrap =
        createElement(
            "div",
            "global-update-data-detail-value-wrap"
        );


    valueWrap.appendChild(
        createElement(
            "strong",
            "global-update-data-detail-value",
            value
        )
    );


    if(
        locked
    ){

        valueWrap.appendChild(
            createElement(
                "span",
                "global-update-data-detail-lock",
                "🔒"
            )
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


    container.innerHTML =
        "";


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


    /*
       Workspace custom renderer.
    */

    if(
        typeof currentOptions.renderFields ===
        "function"
    ){

        let result =
            null;


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
                                    field,
                                    selectedRecord
                                ),

                        setValue :
                            (
                                field,
                                value
                            ) =>
                                setDOMFieldValue(
                                    field,
                                    value
                                ),

                        onChange :
                            () => {

                                updateConditionalFields();

                                renderAction();

                            }

                    }
                );

        }
        catch(error){

            console.error(
                "[EditRow] renderFields failed:",
                error
            );

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
            )
        ){

            renderFieldDescriptors(
                container,
                result
            );

        }
        else if(
            result &&
            Array.isArray(
                result.fields
            )
        ){

            renderFieldDescriptors(
                container,
                result.fields
            );

        }

    }
    else{

        /*
           Generic renderer.
        */

        const values =
            getInitialValues(
                selectedRecord
            );


        const root =
            createElement(
                "div",
                "global-update-data-fields-wrapper"
            );


        getFieldList(
            selectedRecord
        ).forEach(
            field => {

                const config =
                    getFieldConfig(
                        field,
                        selectedRecord,
                        values
                    );


                root.appendChild(
                    createFieldElement(
                        field,
                        selectedRecord,
                        values,
                        config
                    )
                );

            }
        );


        container.appendChild(
            root
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

    safeArray(
        fields
    ).forEach(
        field => {

            if(
                !field ||
                typeof field !== "object" ||
                !field.id
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
                    field.id
                );


            wrapper.appendChild(
                label
            );


            const type =
                normalizeKey(
                    field.type ||
                    "text"
                );


            let control =
                null;


            if(
                type === "select"
            ){

                control =
                    renderSelectControl(
                        field
                    );

            }
            else if(
                type === "number"
            ){

                control =
                    renderNumberControl(
                        field
                    );

            }
            else if(
                type === "textarea"
            ){

                control =
                    renderTextareaControl(
                        field
                    );

            }
            else if(
                type === "checkbox"
            ){

                control =
                    renderCheckboxControl(
                        field
                    );

            }
            else{

                control =
                    renderTextControl(
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

                wrapper.appendChild(
                    createElement(
                        "small",
                        "global-update-data-field-note",
                        field.note
                    )
                );

            }


            container.appendChild(
                wrapper
            );

        }
    );

}


/* =====================================================
   CREATE FIELD ELEMENT
===================================================== */

function createFieldElement(
    field,
    record,
    values,
    config
){

    const wrapper =
        createElement(
            "div",
            "global-update-data-field"
        );


    wrapper.dataset.fieldId =
        field;


    const label =
        createElement(
            "label",
            "global-update-data-field-label",
            config.label
        );


    wrapper.appendChild(
        label
    );


    let control =
        null;


    if(
        config.type === "select"
    ){

        control =
            createSelect(
                field,
                record,
                config
            );

    }
    else if(
        config.type === "number"
    ){

        control =
            createInput(
                field,
                record,
                config,
                "number"
            );

    }
    else if(
        config.type === "date"
    ){

        control =
            createInput(
                field,
                record,
                config,
                "date"
            );

    }
    else if(
        config.type === "checkbox"
    ){

        wrapper.innerHTML =
            "";


        createCheckbox(
            field,
            record,
            config,
            wrapper
        );

    }
    else if(
        config.type === "textarea"
    ){

        control =
            createTextarea(
                field,
                record,
                config
            );

    }
    else{

        control =
            createInput(
                field,
                record,
                config,
                "text"
            );

    }


    if(
        control &&
        !wrapper.contains(
            control
        )
    ){

        wrapper.appendChild(
            control
        );

    }


    if(
        config.note
    ){

        wrapper.appendChild(
            createElement(
                "small",
                "global-update-data-field-note",
                config.note
            )
        );

    }


    return wrapper;

}


/* =====================================================
   BASE CONTROL
===================================================== */

function baseControl(
    element,
    field
){

    element.name =
        field;


    element.dataset.updateField =
        "true";


    element.className =
        "global-update-data-field-control " +
        "global-update-data-field-input";


    return element;

}


/* =====================================================
   CREATE SELECT
===================================================== */

function createSelect(
    field,
    record,
    config
){

    const select =
        baseControl(
            document.createElement(
                "select"
            ),
            field
        );


    if(
        config.multiple
    ){

        select.multiple =
            true;

    }


    if(
        config.required
    ){

        select.required =
            true;

    }


    const placeholder =
        createElement(
            "option",
            "",
            config.placeholder ||
            "Pilih..."
        );


    placeholder.value =
        "";


    select.appendChild(
        placeholder
    );


    const currentValue =
        getFieldValue(
            field,
            record
        );


    let currentFound =
        false;


    config.options.forEach(
        option => {

            const optionElement =
                createElement(
                    "option",
                    "",
                    option.label ??
                    option.value ??
                    ""
                );


            optionElement.value =
                safeText(
                    option.value ??
                    ""
                );


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


    /*
       Canonical value lama tetap dipertahankan.
    */

    if(
        currentValue !== "" &&
        currentValue !== null &&
        currentValue !== undefined &&
        !currentFound &&
        !config.multiple
    ){

        const fallback =
            createElement(
                "option",
                "",
                currentValue
            );


        fallback.value =
            currentValue;


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


    return select;

}


/* =====================================================
   CREATE INPUT
===================================================== */

function createInput(
    field,
    record,
    config,
    type
){

    const input =
        baseControl(
            document.createElement(
                "input"
            ),
            field
        );


    input.type =
        type;


    input.placeholder =
        safeText(
            config.placeholder
        );


    input.disabled =
        config.disabled;


    input.readOnly =
        config.readonly;


    if(
        config.required
    ){

        input.required =
            true;

    }


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
            type
        );


    return input;

}


/* =====================================================
   CREATE TEXTAREA
===================================================== */

function createTextarea(
    field,
    record,
    config
){

    const textarea =
        baseControl(
            document.createElement(
                "textarea"
            ),
            field
        );


    textarea.rows =
        config.rows;


    textarea.placeholder =
        safeText(
            config.placeholder
        );


    textarea.disabled =
        config.disabled;


    textarea.readOnly =
        config.readonly;


    if(
        config.required
    ){

        textarea.required =
            true;

    }


    textarea.value =
        serializeFieldValue(
            getFieldValue(
                field,
                record
            ),
            "textarea"
        );


    return textarea;

}


/* =====================================================
   CREATE CHECKBOX
===================================================== */

function createCheckbox(
    field,
    record,
    config,
    wrapper
){

    const checkboxWrapper =
        createElement(
            "label",
            "global-update-data-checkbox"
        );


    const checkbox =
        document.createElement(
            "input"
        );


    checkbox.type =
        "checkbox";


    checkbox.name =
        field;


    checkbox.dataset.updateField =
        "true";


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


    checkboxWrapper.appendChild(
        createElement(
            "span",
            "",
            config.label
        )
    );


    wrapper.appendChild(
        checkboxWrapper
    );

}


/* =====================================================
   DESCRIPTOR SELECT
===================================================== */

function renderSelectControl(
    field
){

    const select =
        document.createElement(
            "select"
        );


    select.name =
        field.id;


    select.dataset.updateField =
        "true";


    select.className =
        "global-update-data-field-control " +
        "global-update-data-field-select";


    if(
        field.required
    ){

        select.required =
            true;

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


    select.appendChild(
        placeholder
    );


    addOptions(
        select,
        field.options,
        field.value
    );


    return select;

}


/* =====================================================
   DESCRIPTOR NUMBER
===================================================== */

function renderNumberControl(
    field
){

    return renderTextLikeControl(
        field,
        "number"
    );

}


/* =====================================================
   DESCRIPTOR TEXT
===================================================== */

function renderTextControl(
    field
){

    return renderTextLikeControl(
        field,
        "text"
    );

}


/* =====================================================
   DESCRIPTOR TEXT LIKE
===================================================== */

function renderTextLikeControl(
    field,
    type
){

    const input =
        document.createElement(
            "input"
        );


    input.type =
        type;


    input.name =
        field.id;


    input.dataset.updateField =
        "true";


    input.className =
        "global-update-data-field-control " +
        "global-update-data-field-input";


    input.value =
        field.value ??
        "";


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
        field.disabled
    ){

        input.disabled =
            true;

    }


    if(
        field.readonly
    ){

        input.readOnly =
            true;

    }


    return input;

}


/* =====================================================
   DESCRIPTOR TEXTAREA
===================================================== */

function renderTextareaControl(
    field
){

    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.name =
        field.id;


    textarea.dataset.updateField =
        "true";


    textarea.className =
        "global-update-data-field-control " +
        "global-update-data-field-input";


    textarea.rows =
        field.rows ||
        3;


    textarea.value =
        field.value ??
        "";


    if(
        field.placeholder
    ){

        textarea.placeholder =
            field.placeholder;

    }


    if(
        field.required
    ){

        textarea.required =
            true;

    }


    if(
        field.disabled
    ){

        textarea.disabled =
            true;

    }


    if(
        field.readonly
    ){

        textarea.readOnly =
            true;

    }


    return textarea;

}


/* =====================================================
   DESCRIPTOR CHECKBOX
===================================================== */

function renderCheckboxControl(
    field
){

    const input =
        document.createElement(
            "input"
        );


    input.type =
        "checkbox";


    input.name =
        field.id;


    input.dataset.updateField =
        "true";


    input.checked =
        Boolean(
            field.value
        );


    if(
        field.disabled
    ){

        input.disabled =
            true;

    }


    return input;

}


/* =====================================================
   ADD OPTIONS
===================================================== */

function addOptions(
    select,
    options,
    currentValue
){

    safeArray(
        options
    ).forEach(
        option => {

            const element =
                createElement(
                    "option",
                    "",
                    option.label ??
                    option.value ??
                    ""
                );


            element.value =
                safeText(
                    option.value ??
                    ""
                );


            element.disabled =
                option.disabled === true;


            if(
                String(
                    element.value
                ) ===
                String(
                    currentValue
                )
            ){

                element.selected =
                    true;

            }


            select.appendChild(
                element
            );

        }
    );

}


/* =====================================================
   INITIAL VALUES
===================================================== */

function getInitialValues(
    record
){

    const values =
        {};


    getFieldList(
        record
    ).forEach(
        field => {

            values[
                field
            ] =
                getFieldValue(
                    field,
                    record
                );

        }
    );


    return values;

}


/* =====================================================
   SET DOM FIELD VALUE
===================================================== */

function setDOMFieldValue(
    field,
    value
){

    const element =
        overlay?.querySelector(
            `[name="${escapeSelector(
                field
            )}"]`
        );


    if(
        !element
    ){

        return;

    }


    if(
        element.type === "checkbox"
    ){

        element.checked =
            Boolean(
                value
            );

    }
    else{

        element.value =
            value ??
            "";

    }

}


/* =====================================================
   FIELD EVENTS
===================================================== */

function bindFieldChanges(){

    const fields =
        overlay?.querySelectorAll(
            "[data-update-field]"
        ) ||
        [];


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

    if(
        !selectedRecord ||
        !overlay
    ){

        return;

    }


    const values =
        collectFieldValues();


    overlay.querySelectorAll(
        "[data-field-id]"
    ).forEach(
        wrapper => {

            const field =
                wrapper.dataset.fieldId;


            const config =
                getFieldConfig(
                    field,
                    selectedRecord,
                    values
                );


            const visible =
                isStepVisible(
                    config,
                    selectedRecord,
                    values
                );


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

                    if(
                        control.type === "checkbox"
                    ){

                        control.checked =
                            false;

                    }
                    else{

                        control.value =
                            "";

                    }

                }

            }

        }
    );

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
        isBusy ||
        !validation.valid;


    button.textContent =
        safeText(
            getOption(
                "addText"
            )
        );

}


/* =====================================================
   VALIDATE CURRENT
===================================================== */

async function validateCurrent(){

    if(
        !selectedRecord
    ){

        return {

            valid :
                false,

            message :
                "Data belum dipilih.",

            values :
                {}

        };

    }


    const values =
        collectFieldValues();


    if(
        typeof currentOptions.validate ===
        "function"
    ){

        try{

            const result =
                await currentOptions.validate(
                    selectedRecord,
                    values,
                    {

                        values,

                        record :
                            selectedRecord,

                        overlay,

                        fields :
                            getVisibleFields(
                                selectedRecord,
                                values
                            )

                    }
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

    }


    /*
       Generic required validation.
    */

    for(
        const field of getVisibleFields(
            selectedRecord,
            values
        )
    ){

        const config =
            getFieldConfig(
                field,
                selectedRecord,
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
                selectedRecord
            );


        if(
            value === "" ||
            value === null ||
            value === undefined
        ){

            return {

                valid :
                    false,

                values,

                message :
                    `${config.label} wajib diisi.`

            };

        }

    }


    return {

        valid :
            true,

        values

    };

}


/* =====================================================
   ADD / STAGE
===================================================== */

async function addCurrent(){

    if(
        isBusy ||
        !selectedRecord
    ){

        return false;

    }


    hideResult();


    const validation =
        await validateCurrent();


    if(
        !validation.valid
    ){

        showResult(
            validation.message ||
            "Data belum lengkap atau tidak valid.",
            "error"
        );


        return false;

    }


    const key =
        getTargetKey(
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


    let changes;


    try{

        changes =
            await buildChanges(
                selectedRecord,
                validation.values
            );

    }
    catch(error){

        showResult(
            error?.message ||
            "Data perubahan tidak dapat dibuat.",
            "error"
        );


        return false;

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


    /*
       onAdd hanya staging.
       Tidak ada Update API di sini.
    */

    if(
        typeof currentOptions.onAdd ===
        "function"
    ){

        try{

            await currentOptions.onAdd(
                selectedRecord,
                validation.values,
                changes,
                {

                    pending :
                        pendingChanges.slice()

                }
            );

        }
        catch(error){

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

        values :
            validation.values,

        changes,

        label :
            getRecordLabel(
                selectedRecord
            ),

        meta :
            getRecordMeta(
                selectedRecord
            )

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
                "[EditRow] onAdded failed:",
                error
            );

        }

    }


    /*
       Setelah staging,
       record kembali ke list.
    */

    selectedRecord =
        null;


    hideResult();


    renderRecordList();

    renderDetail();

    renderFields();

    renderAction();

    renderPending();

    updateOverlayText();


    return true;

}


/* =====================================================
   REMOVE PENDING
===================================================== */

async function removePending(
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
        pendingChanges[
            index
        ];


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
                "[EditRow] onRemove failed:",
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

    updateOverlayText();


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


    list.innerHTML =
        "";


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
                getOption(
                    "confirmText"
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


            let label =
                item.label ||
                getRecordLabel(
                    item.record
                );


            if(
                typeof currentOptions.getPendingLabel ===
                "function"
            ){

                label =
                    callFunction(
                        currentOptions.getPendingLabel,
                        [
                            item
                        ],
                        label
                    );

            }


            content.appendChild(
                createElement(
                    "strong",
                    "global-update-data-pending-item-title",
                    label
                )
            );


            const meta =
                item.meta ||
                getRecordMeta(
                    item.record
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

                    removePending(
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


        confirmButton.textContent =
            isBusy
                ? getOption(
                    "confirmLoadingText"
                )
                : getOption(
                    "confirmText"
                );

    }

}


/* =====================================================
   NORMALIZE CONFIRM RESULT
===================================================== */

function normalizeConfirmResult(
    result,
    fallbackPending
){

    if(
        result === true
    ){

        return {

            success :
                true,

            remaining :
                [],

            count :
                fallbackPending.length

        };

    }


    if(
        result === false
    ){

        return {

            success :
                false,

            remaining :
                fallbackPending.slice(),

            count :
                0

        };

    }


    if(
        result &&
        typeof result === "object"
    ){

        return {

            success :
                result.success === true ||
                result.ok === true,

            remaining :
                Array.isArray(
                    result.remaining
                )
                    ? result.remaining
                    : [],

            count :
                Number(
                    result.count ||
                    0
                ),

            message :
                result.message ||
                result.error ||
                ""

        };

    }


    return {

        success :
            false,

        remaining :
            fallbackPending.slice(),

        count :
            0

    };

}


/* =====================================================
   CONFIRM
===================================================== */

async function confirm(){

    if(
        isBusy ||
        !pendingChanges.length
    ){

        return false;

    }


    /*
       Batch validation.
    */

    if(
        typeof currentOptions.validateBatch ===
        "function"
    ){

        try{

            const result =
                await currentOptions.validateBatch(
                    pendingChanges.slice()
                );


            if(
                result === false ||
                (
                    result &&
                    typeof result === "object" &&
                    result.valid === false
                )
            ){

                showResult(
                    result?.message ||
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


    const snapshot =
        pendingChanges.slice();


    let result =
        null;


    try{

        /*
           Sama seperti UpdateData:

           Jika workspace menyediakan
           onConfirm(), engine menyerahkan
           proses confirmation ke workspace.

           Jika tidak ada,
           gunakan Update.updateRow().
        */

        if(
            typeof currentOptions.onConfirm ===
            "function"
        ){

            try{

                result =
                    await currentOptions.onConfirm(
                        snapshot
                    );

            }
            catch(error){

                result = {

                    success :
                        false,

                    remaining :
                        snapshot,

                    count :
                        0,

                    error

                };

            }

        }
        else{

            const remaining =
                [];


            let successCount =
                0;


            for(
                const item of snapshot
            ){

                try{

                    let updateResult;


                    if(
                        typeof currentOptions.update ===
                        "function"
                    ){

                        updateResult =
                            await currentOptions.update({

                                workspace :
                                    currentOptions.workspace,

                                target :
                                    item.changes.target,

                                row :
                                    item.changes.row,

                                record :
                                    item.record,

                                changes :
                                    item.changes

                            });

                    }
                    else{

                        /*
                           SATU-SATUNYA DEFAULT
                           SERVER UPDATE POINT.
                        */

                        updateResult =
                            await Update.updateRow(

                                currentOptions.workspace,

                                item.changes.target,

                                item.changes.row

                            );

                    }


                    if(
                        updateResult?.success === false ||
                        updateResult?.ok === false
                    ){

                        throw new Error(

                            updateResult?.message ||
                            updateResult?.error ||
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


            result = {

                success :
                    remaining.length === 0,

                remaining,

                count :
                    successCount,

                message :
                    remaining.length === 0

                        ? `${successCount} data berhasil diperbarui.`

                        : `${successCount} data berhasil diperbarui. ` +
                          `${remaining.length} data gagal diperbarui.`

            };

        }


        const normalized =
            normalizeConfirmResult(
                result,
                snapshot
            );


        const remaining =
            normalized.remaining;


        const failedKeys =
            new Set(
                remaining.map(
                    item =>
                        item.key
                )
            );


        const successfulKeys =
            new Set(

                snapshot
                    .map(
                        item =>
                            item.key
                    )
                    .filter(
                        key =>
                            !failedKeys.has(
                                key
                            )
                    )

            );


        /*
           Yang gagal tetap pending.
        */

        pendingChanges =
            remaining.slice();


        /*
           Yang berhasil langsung hilang
           dari daftar Edit Row.
        */

        currentRecords =
            currentRecords.filter(
                record =>
                    !successfulKeys.has(
                        getTargetKey(
                            record
                        )
                    )
            );


        selectedRecord =
            null;


        /*
           Callback setelah confirmation.
        */

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

                console.warn(
                    "[EditRow] onConfirmed failed:",
                    error
                );

            }

        }


        renderRecordList();

        renderDetail();

        renderFields();

        renderAction();

        renderPending();

        updateOverlayText();


        showResult(

            normalized.message ||

            (
                normalized.success

                    ? getOption(
                        "addedText"
                    )

                    : "Sebagian atau seluruh perubahan gagal disimpan."
            ),

            normalized.success
                ? "success"
                : "error"

        );


        return normalized.success;

    }
    finally{

        isBusy =
            false;


        renderPending();

        renderAction();

        updateOverlayText();

    }

}


/* =====================================================
   OPEN
===================================================== */

function open(
    options = {}
){

    currentOptions = {

        ...DEFAULTS,

        ...options

    };


    /*
       Source data.
    */

    sourceRecords =
        getSourceRecords();


    /*
       Maksimal 20 record terakhir.
    */

    currentRecords =
        getLatestRecords(
            sourceRecords
        );


    /*
       Reset session.
    */

    selectedRecord =
        null;


    pendingChanges =
        [];


    isBusy =
        false;


    /*
       Pastikan overlay tersedia.
    */

    createOverlay();


    /*
       Update text.
    */

    updateOverlayText();

    hideResult();


    /*
       INI PENTING.

       CSS menggunakan:

       .global-update-data-overlay.is-open

       Jadi class harus ditambahkan
       ketika open().
    */

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


    /*
       Reset search.
    */

    const search =
        overlay.querySelector(
            '[data-role="record-search"]'
        );


    if(
        search
    ){

        search.value =
            "";

    }


    /*
       Render UI sesuai urutan
       updatedata.js.
    */

    renderRecordList();

    renderDetail();

    renderFields();

    renderAction();

    renderPending();


    initialized =
        true;


    return EditRow;

}


/* =====================================================
   CLOSE
===================================================== */

function close(){

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
                "[EditRow] onClose failed:",
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


    /*
       Overlay sengaja tidak dihapus.

       Ini mengikuti lifecycle
       updatedata.js:

       init() membuat overlay
       satu kali,
       open() hanya membuka.
    */

    selectedRecord =
        null;


    currentOptions =
        {};


    currentRecords =
        [];


    sourceRecords =
        [];


    pendingChanges =
        [];


    isBusy =
        false;

}


/* =====================================================
   REFRESH
===================================================== */

function refresh(){

    sourceRecords =
        getSourceRecords();


    currentRecords =
        getLatestRecords(
            sourceRecords
        );


    selectedRecord =
        null;


    const search =
        overlay?.querySelector(
            '[data-role="record-search"]'
        );


    if(
        search
    ){

        search.value =
            "";

    }


    renderRecordList();

    renderDetail();

    renderFields();

    renderAction();

    renderPending();

    updateOverlayText();


    return currentRecords.slice();

}


/* =====================================================
   INIT
===================================================== */

function init(){

    if(
        initialized &&
        overlay
    ){

        return EditRow;

    }


    createOverlay();


    initialized =
        true;


    return EditRow;

}


/* =====================================================
   PUBLIC API
===================================================== */

const EditRow = {

    /* =================================================
       CONSTANT
    ================================================= */

    MAX_RECORDS,


    /* =================================================
       INIT
    ================================================= */

    init(){


        return init();

    },


    /* =================================================
       OPEN
    ================================================= */

    open(
        options = {}
    ){


        return open(
            options
        );

    },


    /* =================================================
       CLOSE
    ================================================= */

    close(){


        close();

    },


    /* =================================================
       REFRESH
    ================================================= */

    refresh(){


        return refresh();

    },


    /* =================================================
       GET SOURCE RECORDS
    ================================================= */

    getRecords(){


        return sourceRecords.slice();

    },


    /* =================================================
       GET EDITABLE RECORDS
    ================================================= */

    getEditableRecords(){


        return currentRecords.slice();

    },


    /* =================================================
       GET SELECTED RECORD
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
       GET KEY
    ================================================= */

    getKey(
        record
    ){


        return getTargetKey(
            record
        );

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
       GET FIELDS
    ================================================= */

    getFields(
        record
    ){


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
       GET FIELD OPTIONS
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

    async buildChanges(
        record,
        values
    ){


        return await buildChanges(
            record,
            values
        );

    },


    /* =================================================
       SELECT RECORD
    ================================================= */

    selectRecord(
        record
    ){

        selectRecord(
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


        return await removePending(
            index
        );

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


        pendingChanges =
            [];


        renderPending();

        renderRecordList();

        updateOverlayText();


        return this;

    },


    /* =================================================
       CONFIRM
    ================================================= */

    async confirm(){


        return await confirm();

    },


    /* =================================================
       RESET
    ================================================= */

    reset(){

        close();


        initialized =
            false;


        currentOptions =
            {};


        sourceRecords =
            [];


        currentRecords =
            [];


        selectedRecord =
            null;


        pendingChanges =
            [];


        isBusy =
            false;


        return this;

    }

};


/* =====================================================
   EXPORT
===================================================== */

export {
    EditRow
};


export default EditRow;
