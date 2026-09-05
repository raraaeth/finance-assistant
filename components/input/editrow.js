/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : editrow.js
   Version      : 2.0.0

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
   UpdateData
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
   - Tetap kompatibel dengan UpdateData
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
    )
        .toLowerCase();

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

        const result =
            fn(
                ...args
            );

        return result;

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
                [record]
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
   DATE FIELD
===================================================== */

function getDateField(record){

    if(
        !record ||
        typeof record !== "object"
    ){

        return null;

    }


    const keys = Object.keys(record);


    /*
       Semua workspace menggunakan salah satu:

       tanggal
       Date
       date

       Pencarian dibuat case-insensitive
       agar tidak bergantung pada kapitalisasi.
    */

    const normalizedCandidates = [
        "tanggal",
        "date"
    ];


    for(
        const key of keys
    ){

        const normalizedKey =

            String(key)
                .trim()
                .toLowerCase();


        if(
            normalizedCandidates.includes(
                normalizedKey
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
   RECORD DATE
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
                [record]
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
   FIELD MAP
===================================================== */

/*
   Workspace dapat memberikan:

       fieldMap : {
           type     : "jenis",
           category : "kategori",
           member   : "nama",
           amount   : "nominal",
           note     : "keterangan"
       }

   atau:

       getSheetField(field, record)

   Jika tidak ada,
   field dianggap sama dengan key
   yang ada pada record.
*/

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
                ]
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
        typeof map === "object"
    ){

        if(
            map[field]
        ){

            return map[field];

        }

    }


    return field;

}


/* =====================================================
   FIELD UI VALUE
===================================================== */

/*
   Membaca nilai field berdasarkan:

   1. UI field
   2. Sheet field

   Ini penting untuk Kas:

       UI:
       type
       category
       member
       amount
       note

       Sheet:
       jenis
       kategori
       nama
       nominal
       keterangan
*/

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
        getIdField(
            record
        );

    const dateField =
        getDateField(
            record
        );


    /*
       ID selalu locked.
    */

    if(
        field === idField ||
        field === "id" ||
        field === "ID"
    ){

        return true;

    }


    /*
       Tanggal selalu locked
       di Edit Row.
    */

    if(
        field === dateField ||
        normalizeKey(field) ===
            "tanggal" ||
        normalizeKey(field) ===
            "date"
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


    const lockedFields =
        safeArray(
            currentOptions.lockedFields
        );


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


    /*
       Workspace override.
    */

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


    /*
       Explicit editableFields.
    */

    if(
        Array.isArray(
            currentOptions.editableFields
        )
    ){

        return currentOptions.editableFields.includes(
            field
        );

    }


    /*
       Default:
       semua field selain locked
       boleh diedit.
    */

    return true;

}


/* =====================================================
   STEP RESOLUTION
===================================================== */

/*
   Generic engine mengambil metadata
   dari workspace steps.

   Tidak perlu hardcode:

       Airdrop
       Financial
       Kas
       Payroll Monthly
       Payroll Daily
       Saving
*/

function getSteps(
    record
){

    let steps =
        currentOptions.steps;


    if(
        typeof steps ===
        "function"
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
   STEP FIELD
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

    const steps =
        getSteps(
            record
        );


    for(
        const step of steps
    ){

        const stepField =
            getStepFieldName(
                step
            );


        if(
            stepField ===
            field
        ){

            return step;

        }

    }


    return null;

}


/* =====================================================
   STEP CONDITION
===================================================== */

function evaluateCondition(
    condition,
    values,
    record
){

    if(
        condition ===
        undefined ||
        condition ===
        null
    ){

        return true;

    }


    if(
        typeof condition ===
        "function"
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


    /*
       Object condition:

       {
           field : "jenis",
           equals : "transfer"
       }
    */

    if(
        isObject(
            condition
        )
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


    /*
       showIf
    */

    if(
        step.showIf !==
        undefined
    ){

        if(
            !evaluateCondition(
                step.showIf,
                values,
                record
            )
        ){

            return false;

        }

    }


    /*
       visibleIf
    */

    if(
        step.visibleIf !==
        undefined
    ){

        if(
            !evaluateCondition(
                step.visibleIf,
                values,
                record
            )
        ){

            return false;

        }

    }


    /*
       hidden
    */

    if(
        step.hidden ===
        true
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
    record
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
                    record
                ],
                undefined
            );


        if(
            result !== undefined &&
            result !== null
        ){

            return String(
                result
            );

        }

    }


    const step =
        findStep(
            field,
            record
        );


    if(
        step?.label !==
        undefined
    ){

        return String(
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


    /*
       PENTING:

       steps adalah authoritative source
       untuk tipe control.

       Jadi jika Input mengatakan:

           type: "select"

       Edit Row juga select.

       Tidak boleh berubah menjadi text
       hanya karena value berupa string.
    */

    if(
        step?.type
    ){

        return step.type;

    }


    /*
       Fallback generic.
    */

    const normalizedField =
        normalizeKey(
            field
        );


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


    if(
        typeof value ===
        "number"
    ){

        return "number";

    }


    if(
        typeof value ===
        "boolean"
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
                option.disabled === true

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
   GET OPTIONS
===================================================== */

function getFieldOptions(
    field,
    record,
    values = {}
){

    /*
       Workspace override.
    */

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


    /*
       Dynamic options dari steps.
    */

    if(
        typeof options ===
        "function"
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
                "[EditRow] step options failed:",
                error
            );

            options =
                [];

        }

    }


    if(
        !Array.isArray(
            options
        )
    ){

        options =
            [];

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
            typeof result ===
            "object"
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


    /*
       Step metadata menjadi fallback utama.
    */

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
        typeof options ===
        "function"
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

            options =
                [];

        }

    }


    if(
        !Array.isArray(
            options
        ) &&
        type ===
            "select"
    ){

        options =
            getFieldOptions(
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
            config.label ??
            getFieldLabel(
                field,
                record
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
            Array.isArray(
                options
            )
                ? options.map(
                    normalizeOption
                )
                : [],

        rows :
            config.rows ||
            3,

        showIf :
            config.showIf,

        visibleIf :
            config.visibleIf,

        condition :
            config.condition,

        multiple :
            config.multiple === true

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


    /*
       Kalau steps tersedia,
       gunakan steps sebagai source
       field list.

       Ini membuat EditRow mengikuti
       Input workspace.
    */

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


                /*
                   Jangan tampilkan ID/Tanggal
                   di editor.
                */

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
           Tambahkan field Sheet lain
           yang belum ada di steps.

           Hanya jika workspace tidak
           memberikan strictFieldList.
        */

        if(
            currentOptions.strictFieldList !==
            true
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


    /*
       Fallback jika steps tidak tersedia.
    */

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


            if(
                config.showIf !==
                undefined
            ){

                if(
                    !evaluateCondition(
                        config.showIf,
                        values,
                        record
                    )
                ){

                    return false;

                }

            }


            if(
                config.visibleIf !==
                undefined
            ){

                if(
                    !evaluateCondition(
                        config.visibleIf,
                        values,
                        record
                    )
                ){

                    return false;

                }

            }


            if(
                config.condition !==
                undefined
            ){

                if(
                    !evaluateCondition(
                        config.condition,
                        values,
                        record
                    )
                ){

                    return false;

                }

            }


            return true;

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
        type ===
        "checkbox"
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
        isObject(value) ||
        Array.isArray(value)
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


    /*
       SELECT:

       Jangan mengubah option.value.

       Jika value:

           main_wallet

       maka yang dikembalikan:

           main_wallet

       bukan:

           main wallet
    */

    if(
        type ===
        "select"
    ){

        const options =
            config.options ||
            [];


        const match =
            options.find(
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
   BUILD VALUES FROM UI
===================================================== */

/*
   IMPORTANT

   Versi sebelumnya menggunakan:

       overlay.querySelector()

   sebagai satu-satunya cara membaca
   nilai form.

   Itu menyebabkan:

       TypeError:
       overlay.querySelector is not a function

   Engine baru menerima beberapa bentuk
   input dari UpdateData:

       values
       context.values
       DOM overlay

   Tetapi DOM hanya digunakan sebagai
   fallback terakhir.
*/

function normalizeIncomingValues(
    incoming,
    record
){

    if(
        !incoming
    ){

        return {};

    }


    /*
       Direct values object.
    */

    if(
        isObject(
            incoming.values
        )
    ){

        return {

            ...incoming.values

        };

    }


    /*
       Context object.
    */

    if(
        isObject(
            incoming.context
        ) &&
        isObject(
            incoming.context.values
        )
    ){

        return {

            ...incoming.context.values

        };

    }


    /*
       Kalau incoming sendiri adalah
       values object.

       Hindari menganggap DOM sebagai object.
    */

    if(
        isObject(
            incoming
        ) &&
        typeof incoming.querySelector !==
            "function"
    ){

        /*
           Jangan menganggap object
           seperti pending item sebagai values.

           Hanya ambil field yang dikenal.
        */

        const result = {};


        getFieldList(
            record
        ).forEach(
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
            Object.keys(
                result
            ).length
        ){

            return result;

        }

    }


    /*
       DOM fallback.
    */

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
    overlay
){

    const values = {};


    if(
        !overlay ||
        typeof overlay.querySelector !==
            "function"
    ){

        return values;

    }


    const fields =
        getFieldList(
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


            const selectorName =
                CSS?.escape
                    ? CSS.escape(field)
                    : field.replace(
                        /["\\]/g,
                        "\\$&"
                    );


            const element =
                overlay.querySelector(
                    `[name="${selectorName}"]`
                );


            if(
                !element
            ){

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
                element.type ===
                    "checkbox"
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

    /*
       Pertahankan seluruh row asli.

       Ini penting karena Edit Row
       tidak boleh kehilangan field
       Sheet yang tidak sedang diedit.
    */

    const row = {

        ...record

    };


    const inputValues =
        values || {};


    Object.keys(
        inputValues
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


    /*
       ID dan Tanggal SELALU dipertahankan.
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
    incoming
){

    const values =
        normalizeIncomingValues(
            incoming,
            record
        );


    /*
       Workspace dapat melakukan
       transform tambahan.

       Misalnya jika workspace mempunyai
       field controller yang harus dipetakan.
    */

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
            isObject(
                prepared
            )
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


    /*
       Workspace dapat mengubah full row
       sebelum dikirim.

       Ini hanya transform.
       Tidak ada Apps Script.
    */

    let finalRow =
        row;


    if(
        typeof currentOptions.prepareRow ===
        "function"
    ){

        const preparedRow =
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
            isObject(
                preparedRow
            )
        ){

            finalRow =
                preparedRow;

        }

    }


    /*
       Pastikan ID dan Tanggal tetap asli
       walaupun prepareRow melakukan perubahan.
    */

    const idField =
        getIdField(
            record
        );


    const dateField =
        getDateField(
            record
        );


    finalRow[idField] =
        record[idField];


    finalRow[dateField] =
        record[dateField];


    return {

        values :
            finalValues,

        row :
            finalRow,

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
    incoming
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


    const values =
        normalizeIncomingValues(
            incoming,
            record
        );


    /*
       Workspace validation.
    */

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


            /*
               Undefined dianggap valid.

               Ini penting agar workspace
               tidak wajib return true.
            */

            if(
                result === false
            ){

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


    /*
       Required validation.
    */

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
        getFieldList(
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


            const fieldValue =
                getFieldValue(
                    field,
                    record
                );


            value.textContent =
                serializeFieldValue(
                    fieldValue,
                    getFieldType(
                        field,
                        fieldValue,
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
   CREATE FIELD
===================================================== */

function createFieldElement(
    field,
    record,
    context = {}
){

    const values =
        context?.values ||
        {};


    const config =
        getFieldConfig(
            field,
            record,
            values
        );


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "global-update-data-field";


    /*
       SELECT
    */

    if(
        config.type ===
            "select"
    ){

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


        const select =
            document.createElement(
                "select"
            );


        select.name =
            field;


        select.className =
            "global-update-data-field-input";


        if(
            config.multiple
        ){

            select.multiple =
                true;

        }


        const currentValue =
            getFieldValue(
                field,
                record
            );


        /*
           Pastikan current canonical value
           tersedia walaupun options tidak
           memuat value tersebut.
        */

        let currentFound =
            false;


        config.options.forEach(
            option => {

                const optionElement =
                    document.createElement(
                        "option"
                    );


                /*
                   IMPORTANT:
                   value = canonical value
                   label = display value
                */

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


        /*
           Jika value lama tidak ada
           dalam options, jangan ubah
           menjadi value lain.

           Tambahkan sebagai option
           sementara agar data lama
           tetap aman.
        */

        if(
            currentValue !== "" &&
            currentValue !== null &&
            currentValue !== undefined &&
            !currentFound &&
            !config.multiple
        ){

            const fallbackOption =
                document.createElement(
                    "option"
                );


            fallbackOption.value =
                currentValue;


            fallbackOption.textContent =
                String(
                    currentValue
                );


            fallbackOption.selected =
                true;


            select.insertBefore(
                fallbackOption,
                select.firstChild
            );

        }


        select.disabled =
            config.disabled ||
            config.readonly;


        wrapper.appendChild(
            select
        );


        return wrapper;

    }


    /*
       CHECKBOX
    */

    if(
        config.type ===
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
            document.createElement(
                "span"
            );


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


    /*
       TEXTAREA
    */

    if(
        config.type ===
            "textarea"
    ){

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


    /*
       DEFAULT INPUT
    */

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


    const input =
        document.createElement(
            "input"
        );


    input.name =
        field;


    input.className =
        "global-update-data-field-input";


    input.type =
        config.type ===
            "number"
            ? "number"
            : config.type ===
                "date"
                ? "date"
                : "text";


    input.placeholder =
        config.placeholder;


    input.disabled =
        config.disabled;


    input.readOnly =
        config.readonly;


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
            getFieldValue(
                field,
                record
            ),
            config.type
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
        document.createElement(
            "div"
        );


    root.className =
        "global-update-data-fields-wrapper";


    const values =
        context?.values ||
        {};


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


            const element =
                createFieldElement(
                    field,
                    record,
                    {
                        ...context,

                        values

                    }
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
        getRecordId(
            record
        ) ||
        "Transaksi"
    );

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
   SEARCH
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
            ).toLowerCase();

        }

    }


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
            .join(
                " "
            );

    }
    catch{

        return "";

    }

}


/* =====================================================
   MATCH SEARCH
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


    return getSearchText(
        record
    ).includes(
        normalizedQuery
    );

}


/* =====================================================
   SOURCE DATA
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
   LATEST 20
===================================================== */

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


    /*
       Source diasumsikan mengikuti
       urutan Sheet:

           lama
           ...
           terbaru

       Ambil 20 paling bawah,
       lalu reverse agar terbaru
       berada paling atas.
    */

    return records
        .slice(
            -MAX_RECORDS
        )
        .reverse();

}


/* =====================================================
   PENDING KEY
===================================================== */

function getPendingKey(
    item
){

    if(
        item?.key
    ){

        return normalizeText(
            item.key
        );

    }


    if(
        item?.record
    ){

        return getTargetKey(
            item.record
        );

    }


    return "";

}


/* =====================================================
   IS DUPLICATE
===================================================== */

function isPending(
    record
){

    const key =
        getTargetKey(
            record
        );


    return pendingChanges.some(
        item =>
            getPendingKey(
                item
            ) ===
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

    if(
        !record
    ){

        return {

            success :
                false,

            message :
                "Transaksi tidak ditemukan."

        };

    }


    if(
        isPending(
            record
        )
    ){

        return {

            success :
                false,

            duplicate :
                true,

            message :
                currentOptions.duplicateText ||
                "Transaksi ini sudah ditambahkan."

        };

    }


    const valid =
        validateRecord(
            record,
            incoming
        );


    if(
        !valid
    ){

        return {

            success :
                false,

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
            getTargetKey(
                record
            ),

        record,

        changes,

        addedAt :
            Date.now()

    };


    pendingChanges.push(
        item
    );


    return {

        success :
            true,

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

function removePending(
    target
){

    const key =
        typeof target ===
            "string"
            ? target
            : getPendingKey(
                target
            );


    const index =
        pendingChanges.findIndex(
            item =>
                getPendingKey(
                    item
                ) ===
                key
        );


    if(
        index ===
        -1
    ){

        return false;

    }


    pendingChanges.splice(
        index,
        1
    );


    return true;

}


/* =====================================================
   UPDATE LOCAL SOURCE
===================================================== */

function applyLocalUpdate(
    item
){

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


    /*
       Update sourceRecords.
    */

    sourceRecords =
        sourceRecords.map(
            record =>
                getTargetKey(
                    record
                ) === key
                    ? {
                        ...record,
                        ...item.changes.row
                    }
                    : record
        );


    /*
       Update editableRecords.
    */

    editableRecords =
        editableRecords.map(
            record =>
                getTargetKey(
                    record
                ) === key
                    ? {
                        ...record,
                        ...item.changes.row
                    }
                    : record
        );


    /*
       Jika record sedang dipilih,
       update object lokal juga.
    */

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
   SHOW MESSAGE
===================================================== */

function showMessage(
    message,
    type = ""
){

    const overlay =
        document.getElementById(
            "global-update-data-overlay"
        );


    if(
        !overlay ||
        typeof overlay.querySelector !==
            "function"
    ){

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
   HANYA fungsi ini yang memanggil
   Apps Script.
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

        return {

            success :
                false,

            remaining :
                [],

            count :
                0,

            message :
                "Belum ada data yang ditambahkan."

        };

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


                const target = {

                    id :
                        getRecordId(
                            record
                        ),

                    tanggal :
                        getRecordDate(
                            record
                        )

                };


                let result;


                /*
                   Workspace custom update.
                */

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
                       Default global update.
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


                /*
                   Update local state hanya
                   setelah Apps Script sukses.
                */

                applyLocalUpdate(
                    item
                );


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


        /*
           Semua berhasil.
        */

        if(
            successCount ===
            pending.length
        ){

            pendingChanges =
                [];


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


        /*
           Partial success.

           Yang gagal tetap pending.
        */

        pendingChanges =
            remaining.slice();


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

            /*
               Jika true,
               field hanya berasal dari steps.

               Default false agar kompatibel
               dengan workspace lama.
            */

            strictFieldList :
                false,

            ...options

        };


        /*
           Ambil source.
        */

        sourceRecords =
            getSourceRecords();


        /*
           Ambil 20 transaksi terakhir.
        */

        editableRecords =
            getLatestRecords(
                sourceRecords
            );


        /*
           Reset session Edit Row.
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
           Adapter ke global UpdateData.

           UI tetap menggunakan desain
           Edit Input yang sudah disepakati:

           - direct list
           - search
           - selected record
           - detail
           - fields
           - Tambahkan
           - Sudah Ditambahkan
           - Konfirmasi
        */

        return UpdateData.open({

            ...currentOptions,

            /*
               Hanya 20 record terbaru.
            */

            records :
                editableRecords,


            /*
               ID UI untuk list harus
               tetap unik berdasarkan
               ID + Tanggal.
            */

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


            getSearchText :
                record =>
                    getSearchText(
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
                    context = {}
                ) =>
                    renderFields(
                        record,
                        context
                    ),


            /*
               Callback dibuat fleksibel.

               Jika UpdateData mengirim:

                   (record, values)

               atau:

                   (record, context)

               atau:

                   (record, overlay)

               semuanya ditangani.
            */

            validate :
                (
                    record,
                    incoming
                ) =>
                    validateRecord(
                        record,
                        incoming
                    ),


            buildChanges :
                (
                    record,
                    incoming
                ) =>
                    buildChanges(
                        record,
                        incoming
                    ),


            /*
               Pending label.
            */

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


            /*
               Add.

               Tidak ada Apps Script.
            */

            onAdd :
                (
                    record,
                    incoming
                ) => {

                    const result =
                        addPending(
                            record,
                            incoming
                        );


                    if(
                        typeof currentOptions.onAdd ===
                        "function"
                    ){

                        try{

                            currentOptions.onAdd(
                                record,
                                incoming,
                                result
                            );

                        }
                        catch(error){

                            console.warn(
                                "[EditRow] onAdd callback failed:",
                                error
                            );

                        }

                    }


                    return result;

                },


            /*
               Remove pending.
            */

            onRemove :
                item => {

                    const result =
                        removePending(
                            item
                        );


                    if(
                        result &&
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
                                "[EditRow] onRemove callback failed:",
                                error
                            );

                        }

                    }


                    return result;

                },


            /*
               Pending getter.
            */

            getPending :
                () =>
                    pendingChanges.slice(),


            getPendingCount :
                () =>
                    pendingChanges.length,


            /*
               Hanya Konfirmasi yang
               menjalankan Update.
            */

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
       GET FIELD LIST
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

        sourceRecords =
            getSourceRecords();


        editableRecords =
            getLatestRecords(
                sourceRecords
            );


        /*
           UpdateData versi baru dapat
           melakukan refresh list.
        */

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
