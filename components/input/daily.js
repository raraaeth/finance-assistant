/* =====================================================
   Finance Assistant
   Component    : Global Input
   Workspace    : Payroll Daily
   File         : daily.js
   Version      : 3.1.0

   Description :
   Global Input Configuration
   Payroll Daily

   Normal Input :
   - Dipertahankan seperti versi sebelumnya.
   - Tidak mengubah flow normal.

   Edit Input :
   - Menggunakan Global EditRow.
   - Target : ID + tanggal.
   - ID locked.
   - tanggal locked.
   - status TIDAK locked.
   - status hanya memiliki opsi "masuk".
   - Nama menggunakan rule Payroll Daily.
   - Grade 1 mengikuti Nama.
   - Grade 2 mengikuti Nama + Grade 1.
   - Hierarchy menggunakan hierarchy.js.
   - Qty dapat diedit.

   Sheet Payroll Daily :

       id
       tanggal
       status
       nama
       grade_1
       grade_2
       qty

   Normal Flow :

       Status
         ↓
       Nama
         ↓
       Grade 1
         ↓
       Grade 2
         ↓
       Qty

   Principle :
   - Status selalu "masuk".
   - Status ditampilkan sebagai input pertama.
   - Tanggal disediakan oleh Controller.
   - User memilih Nama dari rule Payroll Daily.
   - Grade 1 hanya digunakan jika tersedia.
   - Grade 2 hanya digunakan jika tersedia.
   - Level dengan satu pilihan dapat di-resolve
     otomatis oleh hierarchy engine.
   - User tidak mengetik Nama / Grade.
   - Qty wajib diisi.
   - Payroll Daily menggunakan nominal × qty.
===================================================== */


/* =====================================================
   IMPORT DATA
===================================================== */

import {

    getInputRules,

    getInputRaw

} from "./data.js";


/* =====================================================
   IMPORT HIERARCHY
===================================================== */

import {

    getNamaOptions,

    getGrade1Options,

    getGrade2Options,

    resolveHierarchy,

    isComplete,

    findMatchingRule

} from "./hierarchy.js";


/* =====================================================
   IMPORT EDIT ROW
===================================================== */

import {

    EditRow

} from "./editrow.js";


/* =====================================================
   PREFIX
=====================================================

   Prefix adalah identitas ID untuk workspace
   Payroll Daily.

   Prefix didefinisikan di workspace ini,
   bukan di Global Input dan bukan di session.js.

===================================================== */

export const PREFIX =

    "PDR";


/* =====================================================
   NORMALIZE VALUE
===================================================== */

function normalizeValue(

    value

){

    return String(

        value ??

        ""

    )

        .trim()

        .toLowerCase();

}


/* =====================================================
   FORMAT DAILY VALUE
===================================================== */

function formatDailyValue(

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

        return "-";

    }


    return String(

        value

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
   FORMAT QTY
===================================================== */

function formatQty(

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

        return "-";

    }


    const number =

        Number(

            value

        );


    if(

        !Number.isFinite(

            number

        )

    ){

        return String(

            value

        );

    }


    return number.toLocaleString(

        "id-ID"

    );

}


/* =====================================================
   GET RULES
===================================================== */

function getRules(){

    const rules =

        getInputRules();


    return Array.isArray(

        rules

    )

        ?

    rules

        :

    [];

}


/* =====================================================
   GET DAILY RECORDS
=====================================================

   Sumber data Edit Input Payroll Daily.

   PENTING :
   Jangan menggunakan EditRow.getEditableRecords()
   di sini.

   EditRow.reset() dapat mengosongkan internal
   editable-record state.

   Karena itu record selalu dibaca langsung
   dari getInputRaw().

===================================================== */

function getDailyRecords(){

    const records =

        getInputRaw();


    if(

        !Array.isArray(

            records

        )

    ){

        return [];

    }


    return records.filter(

        record =>

            record &&

            typeof record ===

                "object"

    );

}


/* =====================================================
   GET NAMA OPTIONS
===================================================== */

function getDailyNamaOptions(){

    return getNamaOptions(

        getRules()

    );

}


/* =====================================================
   GET GRADE 1 OPTIONS
===================================================== */

function getDailyGrade1Options(

    values = {}

){

    if(

        !values.nama

    ){

        return [];

    }


    return getGrade1Options(

        getRules(),

        values.nama

    );

}


/* =====================================================
   GET GRADE 2 OPTIONS
===================================================== */

function getDailyGrade2Options(

    values = {}

){

    if(

        !values.nama ||

        !values.grade_1

    ){

        return [];

    }


    return getGrade2Options(

        getRules(),

        values.nama,

        values.grade_1

    );

}


/* =====================================================
   GET SINGLE OPTION
=====================================================

   Jika hanya ada satu pilihan,
   nilai tersebut dapat digunakan otomatis.

===================================================== */

function getSingleOption(

    options

){

    if(

        !Array.isArray(

            options

        )

        ||

        options.length !== 1

    ){

        return null;

    }


    return options[0]?.value ??

        null;

}


/* =====================================================
   RESOLVE DAILY HIERARCHY
=====================================================

   Fungsi utama Payroll Daily.

===================================================== */

export function resolveDailyHierarchy(

    values = {}

){

    return resolveHierarchy(

        getRules(),

        values

    );

}


/* =====================================================
   RESOLVE DAILY VALUES
=====================================================

   Wrapper khusus input Payroll Daily.

   Fungsi ini memastikan :

   1. Nama sudah ada.
   2. Grade 1 otomatis jika hanya satu.
   3. Grade 2 otomatis jika hanya satu.

   Nilai user tetap dipertahankan
   jika sudah dipilih.

===================================================== */

export function resolveDailyValues(

    values = {}

){

    const result = {

        status :

            "masuk",


        nama :

            values.nama ??

            "",


        grade_1 :

            values.grade_1 ??

            "",


        grade_2 :

            values.grade_2 ??

            "",


        qty :

            values.qty ??

            ""

    };


    /* =================================================
       TANPA NAMA
    ================================================= */

    if(

        !result.nama

    ){

        return result;

    }


    /* =================================================
       RESOLVE HIERARCHY
    ================================================= */

    const resolved =

        resolveDailyHierarchy(

            result

        );


    result.grade_1 =

        resolved.grade_1 ??

        "";


    result.grade_2 =

        resolved.grade_2 ??

        "";


    return result;

}


/* =====================================================
   CHECK COMPLETE
===================================================== */

export function isDailyComplete(

    values = {}

){

    const resolved =

        resolveDailyValues(

            values

        );


    /* =================================================
       NAMA
    ================================================= */

    if(

        !resolved.nama

    ){

        return false;

    }


    /* =================================================
       HIERARCHY
    ================================================= */

    if(

        !isComplete(

            getRules(),

            resolved

        )

    ){

        return false;

    }


    /* =================================================
       QTY
    ================================================= */

    if(

        resolved.qty ===

        undefined

        ||

        resolved.qty ===

        null

        ||

        String(

            resolved.qty

        ).trim() ===

        ""

    ){

        return false;

    }


    const qty =

        Number(

            resolved.qty

        );


    if(

        !Number.isFinite(

            qty

        )

        ||

        qty < 1

    ){

        return false;

    }


    return true;

}


/* =====================================================
   GET MATCHING WORK RULE
===================================================== */

export function getDailyWorkRule(

    values = {}

){

    const resolved =

        resolveDailyValues(

            values

        );


    return findMatchingRule(

        getRules(),

        resolved

    );

}


/* =====================================================
   GET DAILY NOMINAL
=====================================================

   Mengambil nominal dari matching rule.

   Tidak melakukan perhitungan qty di sini.

===================================================== */

export function getDailyNominal(

    values = {}

){

    const rule =

        getDailyWorkRule(

            values

        );


    if(

        !rule

    ){

        return 0;

    }


    const nominal =

        Number(

            rule.nominal

        );


    return Number.isFinite(

        nominal

    )

        ?

    nominal

        :

    0;

}


/* =====================================================
   CALCULATE DAILY AMOUNT
=====================================================

   Rumus Payroll Daily :

       nominal × qty

===================================================== */

export function calculateDailyAmount(

    values = {}

){

    const nominal =

        getDailyNominal(

            values

        );


    const qty =

        Number(

            values.qty

        );


    if(

        !Number.isFinite(

            qty

        )

        ||

        qty < 1

    ){

        return 0;

    }


    return nominal * qty;

}


/* =====================================================
   PAYROLL DAILY CONFIG
===================================================== */

export const Daily = {


    /* =================================================
       WORKSPACE
    ================================================= */

    workspace :

        "payroll-daily",


    /* =================================================
       PREFIX
    ================================================= */

    prefix :

        PREFIX,


    /* =================================================
       TITLE
    ================================================= */

    title :

        "Payroll Daily",


    /* =================================================
       SUBTITLE
    ================================================= */

    subtitle :

        "Catat hasil kerja Payroll Daily",


    /* =================================================
       INPUT STEPS
    ================================================= */

    steps : [


        /* =================================================
           STATUS

           Selalu "masuk".

           Diletakkan paling awal.
        ================================================= */

        {

            id :

                "status",


            label :

                "Status",


            type :

                "select",


            value :

                "masuk",


            required :

                true,


            disabled :

                true,


            options : [

                {

                    value :

                        "masuk",


                    label :

                        "Masuk"

                }

            ],


            note :

                "Status Payroll Daily otomatis menggunakan Masuk."

        },


        /* =================================================
           NAMA
        ================================================= */

        {

            id :

                "nama",


            label :

                "Nama",


            type :

                "select",


            placeholder :

                "Pilih nama",


            required :

                true,


            options :

                () =>

                    getDailyNamaOptions(),


            note :

                "Pilih nama pekerjaan berdasarkan rule Payroll Daily."

        },


        /* =================================================
           GRADE 1
        ================================================= */

        {

            id :

                "grade_1",


            label :

                "Grade 1",


            type :

                "select",


            placeholder :

                "Pilih grade 1",


            required :

                false,


            showWhen :

                values => {

                    if(

                        !values.nama

                    ){

                        return false;

                    }


                    return (

                        getDailyGrade1Options(

                            values

                        ).length > 0

                    );

                },


            options :

                values =>

                    getDailyGrade1Options(

                        values

                    ),


            note :

                "Pilih grade 1 jika tersedia pada rule."

        },


        /* =================================================
           GRADE 2
        ================================================= */

        {

            id :

                "grade_2",


            label :

                "Grade 2",


            type :

                "select",


            placeholder :

                "Pilih grade 2",


            required :

                false,


            showWhen :

                values => {

                    if(

                        !values.nama ||

                        !values.grade_1

                    ){

                        return false;

                    }


                    return (

                        getDailyGrade2Options(

                            values

                        ).length > 0

                    );

                },


            options :

                values =>

                    getDailyGrade2Options(

                        values

                    ),


            note :

                "Pilih grade 2 jika tersedia pada rule."

        },


        /* =================================================
           QTY
        ================================================= */

        {

            id :

                "qty",


            label :

                "Qty",


            type :

                "number",


            placeholder :

                "Contoh: 100",


            required :

                true,


            min :

                1,


            step :

                1,


            showWhen :

                values =>

                    Boolean(

                        values.nama

                    ),


            note :

                "Masukkan jumlah hasil kerja. Qty wajib diisi."

        }

    ],


    /* =================================================
       DEFAULT VALUES
    ================================================= */

    defaults : {

        status :

            "masuk"

    }

};


/* =====================================================
   EDIT INPUT
=====================================================

   Global EditRow Adapter.

   Sheet Payroll Daily :

       id
       tanggal
       status
       nama
       grade_1
       grade_2
       qty

   Target :

       ID + tanggal

   Locked :

       ID
       tanggal

   Editable :

       status
       nama
       grade_1
       grade_2
       qty

   Catatan :
   Status tetap hanya memiliki satu pilihan,
   yaitu "masuk".

===================================================== */


/* =====================================================
   EDITABLE FIELDS
===================================================== */

const EDITABLE_FIELDS = [

    "status",

    "nama",

    "grade_1",

    "grade_2",

    "qty"

];


/* =====================================================
   LOCKED FIELDS
=====================================================

   HANYA ID DAN TANGGAL.

===================================================== */

const LOCKED_FIELDS = [

    "id",

    "tanggal"

];


/* =====================================================
   EDIT FIELD TYPE
===================================================== */

function getDailyEditFieldType(

    field

){

    const normalized =

        normalizeValue(

            field

        );


    switch(

        normalized

    ){

        case "status":

        case "nama":

        case "grade_1":

        case "grade_2":

            return "select";


        case "qty":

            return "number";


        default:

            return "text";

    }

}


/* =====================================================
   EDIT FIELD LABEL
===================================================== */

function getDailyEditFieldLabel(

    field

){

    const normalized =

        normalizeValue(

            field

        );


    switch(

        normalized

    ){

        case "id":

            return "ID";


        case "tanggal":

            return "Tanggal";


        case "date":

            return "Tanggal";


        case "status":

            return "Status";


        case "nama":

            return "Nama";


        case "grade_1":

            return "Grade 1";


        case "grade_2":

            return "Grade 2";


        case "qty":

            return "Qty";


        default:

            return formatDailyValue(

                field

            );

    }

}


/* =====================================================
   EDIT FIELD OPTIONS
===================================================== */

function getDailyEditFieldOptions(

    field,

    values = {},

    record = null

){

    const normalized =

        normalizeValue(

            field

        );


    /* =================================================
       STATUS
    ================================================= */

    if(

        normalized ===

        "status"

    ){

        return [

            {

                value :

                    "masuk",


                label :

                    "Masuk"

            }

        ];

    }


    /* =================================================
       NAMA
    ================================================= */

    if(

        normalized ===

        "nama"

    ){

        return getDailyNamaOptions();

    }


    /* =================================================
       GRADE 1
    ================================================= */

    if(

        normalized ===

        "grade_1"

    ){

        const nama =

            values?.nama

            ??

            record?.nama

            ??

            "";


        if(

            !nama

        ){

            return [];

        }


        return getDailyGrade1Options({

            nama :

                nama

        });

    }


    /* =================================================
       GRADE 2
    ================================================= */

    if(

        normalized ===

        "grade_2"

    ){

        const nama =

            values?.nama

            ??

            record?.nama

            ??

            "";


        const grade1 =

            values?.grade_1

            ??

            record?.grade_1

            ??

            "";


        if(

            !nama ||

            !grade1

        ){

            return [];

        }


        return getDailyGrade2Options({

            nama :

                nama,


            grade_1 :

                grade1

        });

    }


    return [];

}


/* =====================================================
   CHECK OPTION
===================================================== */

function optionExists(

    options,

    value

){

    if(

        !Array.isArray(

            options

        )

    ){

        return false;

    }


    const normalizedValue =

        String(

            value ??

            ""

        );


    return options.some(

        option =>

            String(

                option?.value ??

                ""

            ) ===

            normalizedValue

    );

}


/* =====================================================
   PREPARE EDIT VALUES
=====================================================

   Digunakan agar perubahan Nama / Grade
   tetap mengikuti hierarchy Payroll Daily.

===================================================== */

function prepareDailyEditValues(

    values = {}

){

    const prepared = {

        status :

            "masuk",


        nama :

            values.nama ??

            "",


        grade_1 :

            values.grade_1 ??

            "",


        grade_2 :

            values.grade_2 ??

            "",


        qty :

            values.qty ??

            ""

    };


    /* =================================================
       TANPA NAMA
    ================================================= */

    if(

        !prepared.nama

    ){

        prepared.grade_1 = "";

        prepared.grade_2 = "";

        return prepared;

    }


    /* =================================================
       VALIDATE GRADE 1
    ================================================= */

    const grade1Options =

        getDailyGrade1Options({

            nama :

                prepared.nama

        });


    if(

        grade1Options.length === 0

    ){

        prepared.grade_1 = "";

        prepared.grade_2 = "";

    }

    else if(

        prepared.grade_1 &&

        !optionExists(

            grade1Options,

            prepared.grade_1

        )

    ){

        prepared.grade_1 = "";

        prepared.grade_2 = "";

    }


    /* =================================================
       RESOLVE GRADE 1
    ================================================= */

    const resolvedGrade1 =

        getSingleOption(

            grade1Options

        );


    if(

        !prepared.grade_1 &&

        resolvedGrade1

    ){

        prepared.grade_1 =

            resolvedGrade1;

    }


    /* =================================================
       VALIDATE GRADE 2
    ================================================= */

    const grade2Options =

        getDailyGrade2Options({

            nama :

                prepared.nama,


            grade_1 :

                prepared.grade_1

        });


    if(

        grade2Options.length === 0

    ){

        prepared.grade_2 = "";

    }

    else if(

        prepared.grade_2 &&

        !optionExists(

            grade2Options,

            prepared.grade_2

        )

    ){

        prepared.grade_2 = "";

    }


    /* =================================================
       RESOLVE GRADE 2
    ================================================= */

    const resolvedGrade2 =

        getSingleOption(

            grade2Options

        );


    if(

        !prepared.grade_2 &&

        resolvedGrade2

    ){

        prepared.grade_2 =

            resolvedGrade2;

    }


    return prepared;

}


/* =====================================================
   EDIT RECORD LABEL
===================================================== */

function getDailyRecordLabel(

    record

){

    const nama =

        String(

            record?.nama ??

            ""

        ).trim();


    const grade1 =

        String(

            record?.grade_1 ??

            ""

        ).trim();


    const grade2 =

        String(

            record?.grade_2 ??

            ""

        ).trim();


    const id =

        String(

            record?.id ??

            ""

        ).trim();


    const parts = [];


    if(

        nama

    ){

        parts.push(

            nama

        );

    }


    if(

        grade1

    ){

        parts.push(

            formatDailyValue(

                grade1

            )

        );

    }


    if(

        grade2

    ){

        parts.push(

            formatDailyValue(

                grade2

            )

        );

    }


    if(

        parts.length > 0

    ){

        return parts.join(

            " · "

        );

    }


    return id ||

        "Payroll Daily";

}


/* =====================================================
   EDIT RECORD META
===================================================== */

function getDailyRecordMeta(

    record

){

    const tanggal =

        String(

            record?.tanggal ??

            ""

        ).trim();


    const status =

        String(

            record?.status ??

            ""

        ).trim();


    const qty =

        record?.qty;


    const parts = [];


    if(

        tanggal

    ){

        parts.push(

            tanggal

        );

    }


    if(

        status

    ){

        parts.push(

            formatDailyValue(

                status

            )

        );

    }


    if(

        qty !==

            undefined

        &&

        qty !==

            null

        &&

        qty !==

            ""

    ){

        parts.push(

            `Qty ${formatQty(qty)}`

        );

    }


    return parts.join(

        " · "

    );

}


/* =====================================================
   EDIT SEARCH TEXT
===================================================== */

function getDailySearchText(

    record

){

    return [

        record?.id,

        record?.tanggal,

        record?.status,

        record?.nama,

        record?.grade_1,

        record?.grade_2,

        record?.qty

    ]

        .filter(

            value =>

                value !==

                    undefined

                &&

                value !==

                    null

        )

        .join(

            " "

        );

}


/* =====================================================
   EDIT DETAIL
===================================================== */

function renderDailyDetail(

    record

){

    return {

        title :

            "Informasi Payroll Daily",

        items : [

            {

                label :

                    "ID",

                value :

                    String(

                        record?.id ??

                        "-"

                    ),

                locked :

                    true

            },

            {

                label :

                    "Tanggal",

                value :

                    String(

                        record?.tanggal ??

                        "-"

                    ),

                locked :

                    true

            },

            {

                label :

                    "Status",

                value :

                    formatDailyValue(

                        record?.status

                    )

            },

            {

                label :

                    "Nama",

                value :

                    String(

                        record?.nama ??

                        ""

                    ).trim() ||

                    "-"

            },

            {

                label :

                    "Grade 1",

                value :

                    formatDailyValue(

                        record?.grade_1

                    )

            },

            {

                label :

                    "Grade 2",

                value :

                    formatDailyValue(

                        record?.grade_2

                    )

            },

            {

                label :

                    "Qty",

                value :

                    formatQty(

                        record?.qty

                    )

            }

        ]

    };

}


/* =====================================================
   EDIT VALIDATION
===================================================== */

function validateDailyEdit(

    record,

    values,

    context

){

    /* =================================================
       RECORD
    ================================================= */

    if(

        !record

    ){

        console.warn(

            "[Payroll Daily EditRow] Record tidak ditemukan."

        );


        return false;

    }


    /* =================================================
       ID
    ================================================= */

    const id =

        String(

            record?.id ??

            ""

        ).trim();


    if(

        !id

    ){

        console.error(

            "[Payroll Daily EditRow] ID kosong."

        );


        return false;

    }


    /* =================================================
       TANGGAL
    ================================================= */

    const tanggal =

        String(

            record?.tanggal ??

            ""

        ).trim();


    if(

        !tanggal

    ){

        console.error(

            "[Payroll Daily EditRow] tanggal kosong."

        );


        return false;

    }


    /* =================================================
       STATUS
    ================================================= */

    const status =

        normalizeValue(

            values?.status

        );


    if(

        status !==

            "masuk"

    ){

        console.warn(

            "[Payroll Daily EditRow] Status harus masuk."

        );


        return false;

    }


    /* =================================================
       NAMA
    ================================================= */

    const nama =

        String(

            values?.nama ??

            ""

        ).trim();


    if(

        !nama

    ){

        console.warn(

            "[Payroll Daily EditRow] Nama wajib diisi."

        );


        return false;

    }


    const namaOptions =

        getDailyNamaOptions();


    if(

        !optionExists(

            namaOptions,

            nama

        )

    ){

        console.warn(

            "[Payroll Daily EditRow] Nama tidak tersedia dalam rule:",

            nama

        );


        return false;

    }


    /* =================================================
       GRADE 1
    ================================================= */

    const grade1 =

        String(

            values?.grade_1 ??

            ""

        ).trim();


    const grade1Options =

        getDailyGrade1Options({

            nama :

                nama

        });


    if(

        grade1Options.length > 0 &&

        !grade1

    ){

        console.warn(

            "[Payroll Daily EditRow] Grade 1 wajib dipilih."

        );


        return false;

    }


    if(

        grade1 &&

        !optionExists(

            grade1Options,

            grade1

        )

    ){

        console.warn(

            "[Payroll Daily EditRow] Grade 1 tidak valid:",

            grade1

        );


        return false;

    }


    /* =================================================
       GRADE 2
    ================================================= */

    const grade2 =

        String(

            values?.grade_2 ??

            ""

        ).trim();


    const grade2Options =

        getDailyGrade2Options({

            nama :

                nama,


            grade_1 :

                grade1

        });


    if(

        grade2Options.length > 0 &&

        !grade2

    ){

        console.warn(

            "[Payroll Daily EditRow] Grade 2 wajib dipilih."

        );


        return false;

    }


    if(

        grade2 &&

        !optionExists(

            grade2Options,

            grade2

        )

    ){

        console.warn(

            "[Payroll Daily EditRow] Grade 2 tidak valid:",

            grade2

        );


        return false;

    }


    /* =================================================
       RESOLVE
    ================================================= */

    const resolved =

        resolveDailyValues({

            status :

                "masuk",


            nama :

                nama,


            grade_1 :

                grade1,


            grade_2 :

                grade2,


            qty :

                values?.qty

        });


    /* =================================================
       HIERARCHY COMPLETE
    ================================================= */

    if(

        !isComplete(

            getRules(),

            resolved

        )

    ){

        console.warn(

            "[Payroll Daily EditRow] Hierarchy tidak lengkap.",

            resolved

        );


        return false;

    }


    /* =================================================
       MATCHING RULE
    ================================================= */

    const matchingRule =

        findMatchingRule(

            getRules(),

            resolved

        );


    if(

        !matchingRule

    ){

        console.warn(

            "[Payroll Daily EditRow] Matching work rule tidak ditemukan.",

            resolved

        );


        return false;

    }


    /* =================================================
       QTY
    ================================================= */

    if(

        values?.qty ===

            undefined

        ||

        values?.qty ===

            null

        ||

        String(

            values?.qty

        ).trim() ===

            ""

    ){

        console.warn(

            "[Payroll Daily EditRow] Qty wajib diisi."

        );


        return false;

    }


    const qty =

        Number(

            values.qty

        );


    if(

        !Number.isFinite(

            qty

        ) ||

        qty < 1

    ){

        console.warn(

            "[Payroll Daily EditRow] Qty tidak valid:",

            values?.qty

        );


        return false;

    }


    return true;

}


/* =====================================================
   EDIT FIELD CONFIG
===================================================== */

function getDailyEditFieldConfig(

    field,

    record,

    values = {}

){

    const normalized =

        normalizeValue(

            field

        );


    /* =================================================
       STATUS
=====================================================

       STATUS TIDAK LOCKED.

       Tetapi opsi hanya satu :

           masuk

       Jadi user tetap bisa membuka field,
       namun tidak ada pilihan status lain.

    ================================================= */

    if(

        normalized ===

        "status"

    ){

        return {

            type :

                "select",

            options : [

                {

                    value :

                        "masuk",

                    label :

                        "Masuk"

                }

            ],

            required :

                true,

            placeholder :

                "Pilih status"

        };

    }


    /* =================================================
       NAMA
    ================================================= */

    if(

        normalized ===

        "nama"

    ){

        return {

            type :

                "select",

            options :

                getDailyNamaOptions(),

            required :

                true,

            placeholder :

                "Pilih nama"

        };

    }


    /* =================================================
       GRADE 1
    ================================================= */

    if(

        normalized ===

        "grade_1"

    ){

        return {

            type :

                "select",

            options :

                currentValues =>

                    getDailyGrade1Options(

                        currentValues

                    ),

            required :

                currentValues => {

                    return (

                        getDailyGrade1Options(

                            currentValues

                        ).length > 0

                    );

                },

            placeholder :

                "Pilih grade 1",

            visibleIf :

                currentValues => {

                    if(

                        !currentValues?.nama

                    ){

                        return false;

                    }


                    return (

                        getDailyGrade1Options(

                            currentValues

                        ).length > 0

                    );

                }

        };

    }


    /* =================================================
       GRADE 2
    ================================================= */

    if(

        normalized ===

        "grade_2"

    ){

        return {

            type :

                "select",

            options :

                currentValues =>

                    getDailyGrade2Options(

                        currentValues

                    ),

            required :

                currentValues => {

                    return (

                        getDailyGrade2Options(

                            currentValues

                        ).length > 0

                    );

                },

            placeholder :

                "Pilih grade 2",

            visibleIf :

                currentValues => {

                    if(

                        !currentValues?.nama ||

                        !currentValues?.grade_1

                    ){

                        return false;

                    }


                    return (

                        getDailyGrade2Options(

                            currentValues

                        ).length > 0

                    );

                }

        };

    }


    /* =================================================
       QTY
    ================================================= */

    if(

        normalized ===

        "qty"

    ){

        return {

            type :

                "number",

            required :

                true,

            min :

                1,

            step :

                1,

            placeholder :

                "Contoh: 100"

        };

    }


    return {

        type :

            getDailyEditFieldType(

                normalized

            )

    };

}


/* =====================================================
   EDIT INPUT ROW
===================================================== */

async function openEditRow(){

    console.log(

        "===== PAYROLL DAILY EDIT INPUT ROW OPEN ====="

    );


    /* =================================================
       OPEN CHECK
    ================================================= */

    if(

        !EditRow ||

        typeof EditRow.open !==

            "function"

    ){

        console.error(

            "[Payroll Daily] EditRow.open() tidak tersedia."

        );


        return null;

    }


    /* =================================================
       RESET CURRENT EDIT STATE
    ================================================= */

    if(

        typeof EditRow.reset ===

            "function"

    ){

        EditRow.reset();

    }


    /* =================================================
       RECORD SOURCE
    =================================================

       PENTING :

       Jangan mengambil :

           EditRow.getEditableRecords()

       karena reset() dapat mengosongkan state tersebut.

       Langsung gunakan getDailyRecords().

    ================================================= */

    const records =

        getDailyRecords();


    console.log(

        "Payroll Daily Edit Row records:",

        records

    );


    /* =================================================
       OPEN GLOBAL EDIT ROW
    ================================================= */

    return EditRow.open({

        /* =============================================
           WORKSPACE
        ============================================= */

        workspace :

            "payroll-daily",


        /* =============================================
           MODE
        ============================================= */

        mode :

            "row",


        /* =============================================
           HEADER
        ============================================= */

        title :

            "Edit Input Row",


        subtitle :

            "Pilih data Payroll Daily dari daftar untuk mengubah data.",


        /* =============================================
           RECORD SOURCE
        =============================================

           DIRECT SOURCE.

        ============================================= */

        getRecords :

            () => {

                const currentRecords =

                    getDailyRecords();


                return Array.isArray(

                    currentRecords

                )

                    ?

                    currentRecords

                    :

                    [];

            },


        /* =============================================
           ID FIELD
        ============================================= */

        getIdField :

            record => {

                if(

                    record &&

                    Object.prototype.hasOwnProperty.call(

                        record,

                        "id"

                    )

                ){

                    return "id";

                }


                if(

                    record &&

                    Object.prototype.hasOwnProperty.call(

                        record,

                        "ID"

                    )

                ){

                    return "ID";

                }


                return "id";

            },


        /* =============================================
           DATE FIELD
        ============================================= */

        getDateField :

            record => {

                return "tanggal";

            },


        /* =============================================
           EDITABLE FIELDS
        ============================================= */

        editableFields :

            [

                ...EDITABLE_FIELDS

            ],


        /* =============================================
           LOCKED FIELDS
        ============================================= */

        lockedFields :

            [

                ...LOCKED_FIELDS

            ],


        /* =============================================
           STRICT FIELD LIST
        ============================================= */

        strictFieldList :

            true,


        /* =============================================
           FIELD ORDER
        ============================================= */

        getFieldOrder :

            record => {

                return [

                    "id",

                    "tanggal",

                    "status",

                    "nama",

                    "grade_1",

                    "grade_2",

                    "qty"

                ].filter(

                    field =>

                        record &&

                        Object.prototype.hasOwnProperty.call(

                            record,

                            field

                        )

                );

            },


        /* =============================================
           FIELD MAP
        ============================================= */

        fieldMap : {

            status :

                "status",

            nama :

                "nama",

            grade_1 :

                "grade_1",

            grade_2 :

                "grade_2",

            qty :

                "qty"

        },


        /* =============================================
           FIELD TYPE
        ============================================= */

        getFieldType :

            (

                field,

                value,

                record

            ) => {

                return getDailyEditFieldType(

                    field

                );

            },


        /* =============================================
           FIELD LABEL
        ============================================= */

        getFieldLabel :

            (

                field,

                record

            ) => {

                return getDailyEditFieldLabel(

                    field

                );

            },


        /* =============================================
           FIELD CONFIG
        ============================================= */

        getFieldConfig :

            (

                field,

                record,

                values

            ) => {

                return getDailyEditFieldConfig(

                    field,

                    record,

                    values

                );

            },


        /* =============================================
           RECORD LABEL
        ============================================= */

        getRecordLabel :

            record => {

                return getDailyRecordLabel(

                    record

                );

            },


        /* =============================================
           RECORD META
        ============================================= */

        getRecordMeta :

            record => {

                return getDailyRecordMeta(

                    record

                );

            },


        /* =============================================
           SEARCH
        ============================================= */

        getSearchText :

            record => {

                return getDailySearchText(

                    record

                );

            },


        /* =============================================
           DETAIL
        ============================================= */

        renderDetail :

            record => {

                return renderDailyDetail(

                    record

                );

            },


        /* =============================================
           FIELD LOCK CHECK
        =============================================

           HANYA :

               ID
               tanggal

           yang locked.

        ============================================= */

        isFieldLocked :

            (

                field,

                record

            ) => {

                const normalized =

                    normalizeValue(

                        field

                    );


                if(

                    normalized ===

                        "id"

                ){

                    return true;

                }


                if(

                    normalized ===

                        "tanggal"

                    ||

                    normalized ===

                        "date"

                ){

                    return true;

                }


                return false;

            },


        /* =============================================
           FIELD EDIT CHECK
        ============================================= */

        isFieldEditable :

            (

                field,

                record

            ) => {

                const normalized =

                    normalizeValue(

                        field

                    );


                return EDITABLE_FIELDS.includes(

                    normalized

                );

            },


        /* =============================================
           PREPARE VALUES
        ============================================= */

        prepareValues :

            values => {

                return prepareDailyEditValues(

                    values

                );

            },


        /* =============================================
           VALIDATE
        ============================================= */

        validate :

            (

                record,

                values,

                context

            ) => {

                return validateDailyEdit(

                    record,

                    values,

                    context

                );

            },


        /* =============================================
           UI TEXT
        ============================================= */

        listTitle :

            "Daftar Payroll Daily",


        searchPlaceholder :

            "Cari ID, tanggal, nama, grade...",


        emptyText :

            "Tidak ada data Payroll Daily yang dapat diedit.",


        addText :

            "Tambahkan",


        confirmText :

            "Konfirmasi",


        removeText :

            "Hapus",


        pendingTitle :

            "Sudah Ditambahkan",


        addedText :

            "Sudah Ditambahkan",


        duplicateText :

            "Data ini sudah ditambahkan.",


        confirmLoadingText :

            "Menyimpan...",


        /* =============================================
           UI MODE
        ============================================= */

        fullscreen :

            true,


        allowBackdropClose :

            true,


        allowEscapeClose :

            true

    });

}


/* =====================================================
   OPEN EDIT
===================================================== */

Daily.openEdit =

    async function(

        context = null

    ){

        const mode =

            typeof context ===

                "object"

            &&

            context !== null

                ?

            context.mode

                :

            context;


        const normalizedMode =

            normalizeValue(

                mode

            );


        /* =================================================
           PAYROLL DAILY HANYA MEMILIKI
           EDIT INPUT ROW
        ================================================= */

        if(

            normalizedMode &&

            normalizedMode !==

                "row"

        ){

            console.warn(

                "[Payroll Daily] Mode Edit Input tidak dikenal:",

                mode

            );

        }


        return openEditRow();

    };


/* =====================================================
   GET CONFIG
===================================================== */

export function getDailyInputConfig(){

    return Daily;

}


/* =====================================================
   GET DEFAULT STATUS
===================================================== */

export function getDailyDefaultStatus(){

    return "masuk";

}


/* =====================================================
   GET NAMA OPTIONS
===================================================== */

export function getDailyNama(){

    return getDailyNamaOptions();

}


/* =====================================================
   GET GRADE 1 OPTIONS
===================================================== */

export function getDailyGrade1(

    values = {}

){

    return getDailyGrade1Options(

        values

    );

}


/* =====================================================
   GET GRADE 2 OPTIONS
===================================================== */

export function getDailyGrade2(

    values = {}

){

    return getDailyGrade2Options(

        values

    );

}


/* =====================================================
   GET SINGLE GRADE 1
===================================================== */

export function getDailyAutoGrade1(

    nama

){

    return getSingleOption(

        getDailyGrade1Options({

            nama :

                nama

        })

    );

}


/* =====================================================
   GET SINGLE GRADE 2
===================================================== */

export function getDailyAutoGrade2(

    nama,

    grade1

){

    return getSingleOption(

        getDailyGrade2Options({

            nama :

                nama,

            grade_1 :

                grade1

        })

    );

}


/* =====================================================
   DEBUG
===================================================== */

export function debugDailyInput(

    values = {}

){

    const resolved =

        resolveDailyValues(

            values

        );


    const complete =

        isDailyComplete(

            resolved

        );


    const rule =

        getDailyWorkRule(

            resolved

        );


    const nominal =

        getDailyNominal(

            resolved

        );


    const amount =

        calculateDailyAmount(

            resolved

        );


    const editRecords =

        getDailyRecords();


    console.log(

        "PAYROLL DAILY INPUT:",

        {

            values :

                values,

            resolved :

                resolved,

            complete :

                complete,

            rule :

                rule,

            nominal :

                nominal,

            qty :

                resolved.qty,

            amount :

                amount,

            editRecords :

                editRecords

        }

    );


    return {

        values :

            values,

        resolved :

            resolved,

        complete :

            complete,

        rule :

            rule,

        nominal :

            nominal,

        qty :

            resolved.qty,

        amount :

            amount,

        editRecords :

            [

                ...editRecords

            ]

    };

}
