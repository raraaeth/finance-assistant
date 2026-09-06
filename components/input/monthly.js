/* =====================================================
   Finance Assistant
   Component    : Global Input
   Workspace    : Payroll Monthly
   File         : monthly.js
   Version      : 3.0.0

   Description :
   Global Input Configuration
   Payroll Monthly Attendance

   Source :
   Global Input Data Engine
       ↓
   workspace.sheets
       ↓
   Data.data
       ↓
   payroll_monthly_rules

   Output :
   date
   status
   shift
   telat
   izin_telat
   izin_pulang
   lembur_jam
   Month
   Year

   Flow :
   Tanggal
       ↓
   Status
       ↓
   Shift (jika rule_shift tersedia)
       ↓
   Tambahkan Kondisi
       ↓
   Pilih kondisi yang diperlukan
       ↓
   Isi nilai kondisi
       ↓
   Tambahkan

   Principle :
   - Tanggal sudah disediakan oleh Global Input
   - Status wajib
   - Shift optional
   - Kondisi tambahan semuanya optional
   - User tidak dipaksa mengisi kondisi
   - Kondisi hanya aktif jika dicentang
   - Telat menggunakan menit
   - Izin Telat menggunakan jam
   - Izin Pulang menggunakan jam
   - Lembur menggunakan jam
   - Status lembur = lembur harian
   - Data rule berasal dari Data Engine generic
   - Tidak ada getter Payroll Monthly khusus

   EDIT INPUT :
   - Menggunakan Global EditRow
   - Target : ID + date
   - ID locked
   - date locked
   - Status editable
   - Shift hanya ditampilkan jika record
     memang memiliki nilai shift
   - Jika record shift kosong, Shift wajib
     disembunyikan
   - Telat editable
   - Izin Telat editable
   - Izin Pulang editable
   - Lembur editable
   - Month dan Year otomatis
   - Month bukan angka, menggunakan nama bulan
   - Month dan Year tidak menjadi field pilihan
===================================================== */


/* =====================================================
   IMPORT DATA
===================================================== */

import {

    getInputData,

    getInputRaw

} from "./data.js";


/* =====================================================
   IMPORT EDIT ROW
===================================================== */

import {

    EditRow

} from "./editrow.js";


/* =====================================================
   PREFIX
===================================================== */

export const PREFIX =

    "PMR";


/* =====================================================
   GET RULES
===================================================== */

/*
   Data Engine generic sudah menentukan
   workspace aktif dan sheet sumber.

   Untuk Payroll Monthly :

       workspace
           ↓
       payroll_monthly
       payroll_monthly_rules
           ↓
       Data.data
           ↓
       getInputData()

   monthly.js tidak perlu mengetahui
   sumber sheet secara langsung.
*/

function getRules(){

    const rules =

        getInputData();


    return Array.isArray(

        rules

    )

        ?

    rules

        :

    [];

}


/* =====================================================
   GET RULE BY TYPE
===================================================== */

function getRuleByType(

    typeRule

){

    return getRules().find(

        rule =>

            rule &&

            rule.type_rule ===

                typeRule

    );

}


/* =====================================================
   GET RULE BY NAME
===================================================== */

function getRuleByName(

    name

){

    return getRules().find(

        rule =>

            rule &&

            rule.nama ===

                name

    );

}


/* =====================================================
   HAS RULE
===================================================== */

function hasRule(

    typeRule

){

    return Boolean(

        getRuleByType(

            typeRule

        )

    );

}


/* =====================================================
   HAS RULE NAME
===================================================== */

function hasRuleName(

    name

){

    return Boolean(

        getRuleByName(

            name

        )

    );

}


/* =====================================================
   PARSE LIST
===================================================== */

function parseList(

    value

){

    if(

        typeof value !==

            "string"

    ){

        return [];

    }


    return value

        .split(",")

        .map(

            item =>

                item.trim()

        )

        .filter(

            Boolean

        );

}


/* =====================================================
   FORMAT LABEL
===================================================== */

function formatLabel(

    value

){

    return String(

        value ??

        ""

    )

    .replace(

        /_/g,

        " "

    )

    .replace(

        /\b\w/g,

        character =>

            character.toUpperCase()

    );

}


/* =====================================================
   STATUS OPTIONS
=====================================================

   Status normal berasal dari rule_masuk.

   Contoh :

   masuk
   sakit
   cuti
   absen

   Status lembur berasal dari :

   rule_tambah
   nama    = lembur
   kondisi = lembur_harian
   waktu   = harian
===================================================== */

function getStatusOptions(){

    const options = [];


    /* =================================================
       RULE MASUK
    ================================================= */

    getRules()

        .filter(

            rule =>

                rule &&

                rule.type_rule ===

                    "rule_masuk"

        )

        .forEach(

            rule => {

                const value =

                    String(

                        rule.nama ??

                        ""

                    ).trim();


                if(

                    !value

                ){

                    return;

                }


                if(

                    !options.some(

                        option =>

                            option.value ===

                                value

                    )

                ){

                    options.push({

                        value :

                            value,

                        label :

                            formatLabel(

                                value

                            )

                    });

                }

            }

        );


    /* =================================================
       LEMBUR HARIAN
    ================================================= */

    const lemburRule =

        getRules().find(

            rule =>

                rule &&

                rule.type_rule ===

                    "rule_tambah"

                &&

                rule.nama ===

                    "lembur"

                &&

                rule.kondisi ===

                    "lembur_harian"

                &&

                rule.waktu ===

                    "harian"

        );


    if(

        lemburRule

        &&

        !options.some(

            option =>

                option.value ===

                    "lembur"

        )

    ){

        options.push({

            value :

                "lembur",

            label :

                "Lembur"

        });

    }


    return options;

}


/* =====================================================
   SHIFT OPTIONS
=====================================================

   Shift hanya tersedia jika rule_shift ada.

   Contoh :

   rule_shift.waktu

   "pagi,siang,malam"
===================================================== */

function getShiftOptions(){

    const rule =

        getRuleByType(

            "rule_shift"

        );


    if(

        !rule

    ){

        return [];

    }


    return parseList(

        rule.waktu

    )

    .map(

        value => ({

            value :

                value,

            label :

                formatLabel(

                    value

                )

        })

    );

}


/* =====================================================
   CONDITION OPTIONS
=====================================================

   Daftar kondisi tambahan yang ditampilkan
   sebagai checkbox.

   Telat
       → telat

   Izin Telat
       → izin_telat

   Izin Pulang
       → izin_pulang

   Lembur
       → lembur_jam
===================================================== */

function getConditionOptions(){

    const options = [];


    /* =================================================
       TELAT
    ================================================= */

    if(

        hasRuleName(

            "telat"

        )

    ){

        options.push({

            value :

                "telat",

            label :

                "Telat",

            note :

                "Masukkan keterlambatan dalam menit (5–60 menit).",

            display :

                value =>

                    `${value} menit`

        });

    }


    /* =================================================
       IZIN TELAT
    ================================================= */

    if(

        hasRuleName(

            "izin_telat"

        )

    ){

        options.push({

            value :

                "izin_telat",

            label :

                "Izin Telat",

            note :

                "Untuk keterlambatan lebih dari 1 jam. Masukkan jumlah jam.",

            display :

                value =>

                    `${value} jam`

        });

    }


    /* =================================================
       IZIN PULANG
    ================================================= */

    if(

        hasRuleName(

            "izin_pulang"

        )

    ){

        options.push({

            value :

                "izin_pulang",

            label :

                "Izin Pulang",

            note :

                "Masukkan waktu izin pulang dalam jam.",

            display :

                value =>

                    `${value} jam`

        });

    }


    /* =================================================
       LEMBUR JAM
    ================================================= */

    if(

        hasRuleName(

            "lembur_jam"

        )

    ){

        options.push({

            value :

                "lembur_jam",

            label :

                "Lembur",

            note :

                "Masukkan jumlah jam lembur.",

            display :

                value =>

                    `${value} jam`

        });

    }


    return options;

}


/* =====================================================
   CONDITION CONFIG
=====================================================

   Konfigurasi masing-masing kondisi.
===================================================== */

const CONDITION_CONFIG = {

    telat : {

        id :

            "telat",

        label :

            "Telat",

        type :

            "number",

        display :

            value =>

                `${value} menit`,

        placeholder :

            "Contoh: 15",

        min :

            5,

        max :

            60,

        step :

            1,

        note :

            "Masukkan keterlambatan dalam menit (5–60 menit)."

    },


    izin_telat : {

        id :

            "izin_telat",

        label :

            "Izin Telat",

        type :

            "number",

        display :

            value =>

                `${value} jam`,

        placeholder :

            "Contoh: 2",

        min :

            1,

        step :

            1,

        note :

            "Jika keterlambatan lebih dari 1 jam, masukkan jumlah jam."

    },


    izin_pulang : {

        id :

            "izin_pulang",

        label :

            "Izin Pulang",

        type :

            "number",

        display :

            value =>

                `${value} jam`,

        placeholder :

            "Contoh: 2",

        min :

            1,

        step :

            1,

        note :

            "Masukkan waktu izin pulang dalam jam."

    },


    lembur_jam : {

        id :

            "lembur_jam",

        label :

            "Lembur",

        type :

            "number",

        display :

            value =>

                `${value} jam`,

        placeholder :

            "Contoh: 2",

        min :

            1,

        step :

            1,

        note :

            "Masukkan jumlah jam lembur."

    }

};


/* =====================================================
   PAYROLL MONTHLY CONFIG
===================================================== */

export const Monthly = {

    /* =================================================
       WORKSPACE
    ================================================= */

    workspace :

        "payroll-monthly",


    /* =================================================
       PREFIX
    =================================================

       Digunakan oleh Global Input Controller
       untuk membuat ID transaksi.

       Contoh :

           PMR-XXXXXXXX

    ================================================= */

    prefix :

        PREFIX,


    /* =================================================
       PREPARE TRANSACTION
    =================================================

       Month dan Year otomatis diambil dari
       tanggal transaksi.

       Contoh :

           date = 2026-06-05

           Month = June
           Year  = 2026

       Month menggunakan nama bulan English,
       sesuai struktur Payroll Monthly.
    ================================================= */

    prepareTransaction :

        function(

            values,

            context

        ){

            const date =

                context?.date ??

                "";


            if(

                !date

            ){

                return values;

            }


            const parts =

                String(

                    date

                )

                .split("-");


            if(

                parts.length !==

                    3

            ){

                return values;

            }


            const year =

                Number(

                    parts[0]

                );


            const monthNumber =

                Number(

                    parts[1]

                );


            if(

                !year ||

                !monthNumber ||

                monthNumber < 1 ||

                monthNumber > 12

            ){

                return values;

            }


            const monthNames = [

                "January",

                "February",

                "March",

                "April",

                "May",

                "June",

                "July",

                "August",

                "September",

                "October",

                "November",

                "December"

            ];


            return {

                ...values,

                Month :

                    monthNames[

                        monthNumber - 1

                    ],

                Year :

                    year

            };

        },


    /* =================================================
       TITLE
    ================================================= */

    title :

        "Payroll Monthly",


    /* =================================================
       INPUT STEPS
    ================================================= */

    steps : [

        /* =================================================
           STATUS

           Tanggal TIDAK dibuat di sini.

           Global Input sudah menyediakan tanggal.
        ================================================= */

        {

            id :

                "status",

            label :

                "Status",

            type :

                "select",

            placeholder :

                "Pilih status",

            required :

                true,

            options :

                () =>

                    getStatusOptions()

        },


        /* =================================================
           SHIFT

           OPTIONAL.

           Hanya muncul jika rule_shift tersedia.

           Status :

               masuk
               lembur
        ================================================= */

        {

            id :

                "shift",

            label :

                "Shift",

            type :

                "select",

            placeholder :

                "Pilih shift",

            required :

                false,

            showWhen :

                values =>

                    (

                        values.status ===

                            "masuk"

                        ||

                        values.status ===

                            "lembur"

                    )

                    &&

                    hasRule(

                        "rule_shift"

                    ),

            options :

                () =>

                    getShiftOptions(),

            note :

                "Opsional. Pilih shift kerja jika diperlukan."

        },


        /* =================================================
           TAMBAHKAN KONDISI

           Field ini menjadi titik masuk kondisi
           tambahan.

           Kondisi hanya tersedia untuk :

               masuk
               lembur

           Status :

               sakit
               cuti
               absen

           langsung dapat ditambahkan tanpa
           kondisi tambahan.
        ================================================= */

        {

            id :

                "conditions",

            label :

                "Tambahkan Kondisi",

            type :

                "condition",

            required :

                false,

            showWhen :

                values =>

                    (

                        values.status ===

                            "masuk"

                        ||

                        values.status ===

                            "lembur"

                    ),

            options :

                () =>

                    getConditionOptions(),

            conditionOptions :

                () =>

                    getConditionOptions(),

            placeholder :

                "Tambahkan",

            note :

                "Pilih kondisi yang terjadi pada hari ini. Semua kondisi bersifat opsional."

        },


        /* =================================================
           TELAT

           KONDISI :

           conditions.includes("telat")
        ================================================= */

        {

            id :

                "telat",

            label :

                "Telat",

            type :

                "number",

            display :

                value =>

                    `${value} menit`,

            placeholder :

                "Contoh: 15",

            required :

                false,

            min :

                5,

            max :

                60,

            step :

                1,

            showWhen :

                values =>

                    Array.isArray(

                        values.conditions

                    )

                    &&

                    values.conditions.includes(

                        "telat"

                    ),

            note :

                "Masukkan keterlambatan dalam menit (5–60 menit)."

        },


        /* =================================================
           IZIN TELAT

           KONDISI :

           conditions.includes("izin_telat")
        ================================================= */

        {

            id :

                "izin_telat",

            label :

                "Izin Telat",

            type :

                "number",

            display :

                value =>

                    `${value} jam`,

            placeholder :

                "Contoh: 2",

            required :

                false,

            min :

                1,

            step :

                1,

            showWhen :

                values =>

                    Array.isArray(

                        values.conditions

                    )

                    &&

                    values.conditions.includes(

                        "izin_telat"

                    ),

            note :

                "Jika keterlambatan lebih dari 1 jam, masukkan jumlah jam."

        },


        /* =================================================
           IZIN PULANG

           KONDISI :

           conditions.includes("izin_pulang")
        ================================================= */

        {

            id :

                "izin_pulang",

            label :

                "Izin Pulang",

            type :

                "number",

            display :

                value =>

                    `${value} jam`,

            placeholder :

                "Contoh: 2",

            required :

                false,

            min :

                1,

            step :

                1,

            showWhen :

                values =>

                    Array.isArray(

                        values.conditions

                    )

                    &&

                    values.conditions.includes(

                        "izin_pulang"

                    ),

            note :

                "Masukkan waktu izin pulang dalam jam."

        },


        /* =================================================
           LEMBUR JAM

           KONDISI :

           conditions.includes("lembur_jam")
        ================================================= */

        {

            id :

                "lembur_jam",

            label :

                "Lembur",

            type :

                "number",

            display :

                value =>

                    `${value} jam`,

            placeholder :

                "Contoh: 2",

            required :

                false,

            min :

                1,

            step :

                1,

            showWhen :

                values =>

                    Array.isArray(

                        values.conditions

                    )

                    &&

                    values.conditions.includes(

                        "lembur_jam"

                    ),

            note :

                "Masukkan jumlah jam lembur."

        }

    ],


    /* =================================================
       CONDITION OPTIONS
    ================================================= */

    conditionOptions :

        () =>

            getConditionOptions(),


    /* =================================================
       CONDITION FIELDS
    ================================================= */

    conditionFields :

        CONDITION_CONFIG

};


/* =====================================================
   EDIT INPUT
=====================================================

   Global EditRow Adapter.

   Sheet Payroll Monthly :

       id
       date
       status
       shift
       telat
       izin_telat
       izin_pulang
       lembur_jam
       Month
       Year

   Target :

       ID + date

   Locked :

       ID
       date

   Editable :

       status
       shift (jika record memiliki shift)
       telat
       izin_telat
       izin_pulang
       lembur_jam

   Month / Year :

       otomatis
       tidak editable
       tidak menjadi pilihan
===================================================== */


/* =====================================================
   EDITABLE FIELDS
===================================================== */

const EDITABLE_FIELDS = [

    "status",

    "shift",

    "telat",

    "izin_telat",

    "izin_pulang",

    "lembur_jam"

];


/* =====================================================
   LOCKED FIELDS
===================================================== */

const LOCKED_FIELDS = [

    "id",

    "date"

];


/* =====================================================
   ATTENDANCE CONDITION FIELDS
===================================================== */

const CONDITION_FIELDS = [

    "telat",

    "izin_telat",

    "izin_pulang",

    "lembur_jam"

];


/* =====================================================
   MONTH NAME FROM DATE
===================================================== */

function getMonthYearFromDate(

    date

){

    const value =

        String(

            date ??

            ""

        ).trim();


    const parts =

        value.split("-");


    if(

        parts.length !==

            3

    ){

        return {

            Month :

                "",

            Year :

                ""

        };

    }


    const year =

        Number(

            parts[0]

        );


    const monthNumber =

        Number(

            parts[1]

        );


    if(

        !year ||

        monthNumber < 1 ||

        monthNumber > 12

    ){

        return {

            Month :

                "",

            Year :

                ""

        };

    }


    const monthNames = [

        "January",

        "February",

        "March",

        "April",

        "May",

        "June",

        "July",

        "August",

        "September",

        "October",

        "November",

        "December"

    ];


    return {

        Month :

            monthNames[

                monthNumber - 1

            ],

        Year :

            year

    };

}


/* =====================================================
   GET MONTHLY RECORDS
=====================================================

   Penting :

   Jangan menggunakan :

       EditRow.getEditableRecords()

   setelah EditRow.reset().

   Sumber record langsung dari
   getInputRaw().
===================================================== */

function getMonthlyRecords(){

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
   NORMALIZE VALUE
===================================================== */

function normalizeMonthlyValue(

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
   FORMAT EDIT VALUE
===================================================== */

function formatMonthlyValue(

    value

){

    if(

        value ===

            undefined

        ||

        value ===

            null

        ||

        String(

            value

        ).trim() ===

            ""

    ){

        return "-";

    }


    return formatLabel(

        value

    );

}


/* =====================================================
   FORMAT NUMBER
===================================================== */

function formatMonthlyNumber(

    value

){

    if(

        value ===

            undefined

        ||

        value ===

            null

        ||

        String(

            value

        ).trim() ===

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
   CHECK OPTION
===================================================== */

function monthlyOptionExists(

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


    const target =

        String(

            value ??

            ""

        ).trim();


    return options.some(

        option =>

            String(

                option?.value ??

                ""

            ).trim() ===

                target

    );

}


/* =====================================================
   RECORD HAS SHIFT
=====================================================

   Ini adalah aturan khusus Payroll Monthly.

   Shift TIDAK ditentukan hanya dari rule_shift.

   Yang menentukan apakah field Shift muncul
   pada Edit Input adalah NILAI RECORD.

   Jika record :

       shift = pagi

   → Shift tampil.

   Jika record :

       shift = ""

   → Shift disembunyikan.

===================================================== */

function recordHasShift(

    record

){

    return Boolean(

        String(

            record?.shift ??

            ""

        ).trim()

    );

}


/* =====================================================
   GET EDIT FIELD TYPE
===================================================== */

function getMonthlyEditFieldType(

    field

){

    const normalized =

        normalizeMonthlyValue(

            field

        );


    switch(

        normalized

    ){

        case "status":

        case "shift":

            return "select";


        case "telat":

        case "izin_telat":

        case "izin_pulang":

        case "lembur_jam":

            return "number";


        default:

            return "text";

    }

}


/* =====================================================
   GET EDIT FIELD LABEL
===================================================== */

function getMonthlyEditFieldLabel(

    field

){

    const normalized =

        normalizeMonthlyValue(

            field

        );


    switch(

        normalized

    ){

        case "id":

            return "ID";


        case "date":

            return "Tanggal";


        case "status":

            return "Status";


        case "shift":

            return "Shift";


        case "telat":

            return "Telat";


        case "izin_telat":

            return "Izin Telat";


        case "izin_pulang":

            return "Izin Pulang";


        case "lembur_jam":

            return "Lembur";


        case "month":

            return "Month";


        case "year":

            return "Year";


        default:

            return formatLabel(

                field

            );

    }

}


/* =====================================================
   GET EDIT FIELD OPTIONS
===================================================== */

function getMonthlyEditFieldOptions(

    field,

    values = {},

    record = null

){

    const normalized =

        normalizeMonthlyValue(

            field

        );


    /* =================================================
       STATUS
    ================================================= */

    if(

        normalized ===

            "status"

    ){

        return getStatusOptions();

    }


    /* =================================================
       SHIFT
    ================================================= */

    if(

        normalized ===

            "shift"

    ){

        if(

            !recordHasShift(

                record

            )

        ){

            return [];

        }


        return getShiftOptions();

    }


    return [];

}


/* =====================================================
   GET CONDITION CONFIG
===================================================== */

function getMonthlyConditionConfig(

    field

){

    const normalized =

        normalizeMonthlyValue(

            field

        );


    if(

        normalized ===

            "telat"

    ){

        return {

            type :

                "number",

            required :

                false,

            min :

                5,

            max :

                60,

            step :

                1,

            placeholder :

                "Contoh: 15",

            note :

                "Masukkan keterlambatan dalam menit (5–60 menit)."

        };

    }


    if(

        normalized ===

            "izin_telat"

    ){

        return {

            type :

                "number",

            required :

                false,

            min :

                1,

            step :

                1,

            placeholder :

                "Contoh: 2",

            note :

                "Jika keterlambatan lebih dari 1 jam, masukkan jumlah jam."

        };

    }


    if(

        normalized ===

            "izin_pulang"

    ){

        return {

            type :

                "number",

            required :

                false,

            min :

                1,

            step :

                1,

            placeholder :

                "Contoh: 2",

            note :

                "Masukkan waktu izin pulang dalam jam."

        };

    }


    if(

        normalized ===

            "lembur_jam"

    ){

        return {

            type :

                "number",

            required :

                false,

            min :

                1,

            step :

                1,

            placeholder :

                "Contoh: 2",

            note :

                "Masukkan jumlah jam lembur."

        };

    }


    return null;

}


/* =====================================================
   PREPARE EDIT VALUES
=====================================================

   Prinsip :

   1. Status tetap menggunakan nilai user.
   2. Shift hanya dipertahankan jika record
      memang mempunyai shift.
   3. Jika record tidak mempunyai shift,
      shift dikosongkan.
   4. Kondisi angka dipertahankan.
   5. Nilai kondisi dikonversi secara aman.
===================================================== */

function prepareMonthlyEditValues(

    values = {},

    record = null

){

    const prepared = {

        status :

            values?.status ??

            record?.status ??

            "",

        shift :

            values?.shift ??

            record?.shift ??

            "",

        telat :

            values?.telat ??

            record?.telat ??

            "",

        izin_telat :

            values?.izin_telat ??

            record?.izin_telat ??

            "",

        izin_pulang :

            values?.izin_pulang ??

            record?.izin_pulang ??

            "",

        lembur_jam :

            values?.lembur_jam ??

            record?.lembur_jam ??

            ""

    };


    /* =================================================
       STATUS
    ================================================= */

    prepared.status =

        String(

            prepared.status ??

            ""

        ).trim();


    /* =================================================
       SHIFT

       Record tanpa shift tidak boleh
       tiba-tiba mendapatkan shift
       melalui Edit Input.
    ================================================= */

    if(

        !recordHasShift(

            record

        )

    ){

        prepared.shift = "";

    }

    else {

        prepared.shift =

            String(

                prepared.shift ??

                ""

            ).trim();

    }


    /* =================================================
       SHIFT VALIDATION

       Jika record memang menggunakan shift,
       nilai harus berasal dari opsi shift.
    ================================================= */

    if(

        prepared.shift

    ){

        const shiftOptions =

            getShiftOptions();


        if(

            shiftOptions.length > 0

            &&

            !monthlyOptionExists(

                shiftOptions,

                prepared.shift

            )

        ){

            prepared.shift = "";

        }

    }


    return prepared;

}


/* =====================================================
   VALIDATE NUMBER FIELD
===================================================== */

function validateMonthlyNumber(

    field,

    value

){

    const normalized =

        normalizeMonthlyValue(

            field

        );


    if(

        value ===

            undefined

        ||

        value ===

            null

        ||

        String(

            value

        ).trim() ===

            ""

    ){

        return true;

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

        return false;

    }


    /* =================================================
       TELAT
    ================================================= */

    if(

        normalized ===

            "telat"

    ){

        return (

            number >= 5

            &&

            number <= 60

        );

    }


    /* =================================================
       JAM
    ================================================= */

    if(

        normalized ===

            "izin_telat"

        ||

        normalized ===

            "izin_pulang"

        ||

        normalized ===

            "lembur_jam"

    ){

        return number >= 1;

    }


    return true;

}


/* =====================================================
   VALIDATE EDIT
===================================================== */

function validateMonthlyEdit(

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

            "[Payroll Monthly EditRow] Record tidak ditemukan."

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

        console.warn(

            "[Payroll Monthly EditRow] ID kosong."

        );


        return false;

    }


    /* =================================================
       DATE
    ================================================= */

    const date =

        String(

            record?.date ??

            ""

        ).trim();


    if(

        !date

    ){

        console.warn(

            "[Payroll Monthly EditRow] date kosong."

        );


        return false;

    }


    /* =================================================
       STATUS
    ================================================= */

    const status =

        String(

            values?.status ??

            ""

        ).trim();


    if(

        !status

    ){

        console.warn(

            "[Payroll Monthly EditRow] Status wajib diisi."

        );


        return false;

    }


    const statusOptions =

        getStatusOptions();


    if(

        !monthlyOptionExists(

            statusOptions,

            status

        )

    ){

        console.warn(

            "[Payroll Monthly EditRow] Status tidak valid:",

            status

        );


        return false;

    }


    /* =================================================
       SHIFT
    =================================================

       Hanya divalidasi jika record awal
       memang mempunyai shift.

       Record tanpa shift :

           shift = ""

       tidak diwajibkan mengisi shift.
    ================================================= */

    const originalHasShift =

        recordHasShift(

            record

        );


    const shift =

        String(

            values?.shift ??

            ""

        ).trim();


    if(

        originalHasShift

    ){

        const shiftOptions =

            getShiftOptions();


        if(

            shiftOptions.length === 0

        ){

            console.warn(

                "[Payroll Monthly EditRow] Record memiliki shift tetapi rule shift tidak tersedia."

            );


            return false;

        }


        if(

            !shift

        ){

            console.warn(

                "[Payroll Monthly EditRow] Shift wajib dipertahankan untuk record yang menggunakan shift."

            );


            return false;

        }


        if(

            !monthlyOptionExists(

                shiftOptions,

                shift

            )

        ){

            console.warn(

                "[Payroll Monthly EditRow] Shift tidak valid:",

                shift

            );


            return false;

        }

    }

    else if(

        shift

    ){

        console.warn(

            "[Payroll Monthly EditRow] Record tanpa shift tidak boleh memiliki shift."

        );


        return false;

    }


    /* =================================================
       CONDITIONS
    ================================================= */

    for(

        const field of CONDITION_FIELDS

    ){

        if(

            !validateMonthlyNumber(

                field,

                values?.[field]

            )

        ){

            console.warn(

                "[Payroll Monthly EditRow] Nilai tidak valid:",

                field,

                values?.[field]

            );


            return false;

        }

    }


    return true;

}


/* =====================================================
   GET RECORD LABEL
===================================================== */

function getMonthlyRecordLabel(

    record

){

    const status =

        String(

            record?.status ??

            ""

        ).trim();


    const shift =

        String(

            record?.shift ??

            ""

        ).trim();


    const date =

        String(

            record?.date ??

            ""

        ).trim();


    const parts = [];


    if(

        status

    ){

        parts.push(

            formatLabel(

                status

            )

        );

    }


    if(

        shift

    ){

        parts.push(

            formatLabel(

                shift

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


    return date ||

        "Payroll Monthly";

}


/* =====================================================
   GET RECORD META
===================================================== */

function getMonthlyRecordMeta(

    record

){

    const date =

        String(

            record?.date ??

            ""

        ).trim();


    const status =

        String(

            record?.status ??

            ""

        ).trim();


    const shift =

        String(

            record?.shift ??

            ""

        ).trim();


    const parts = [];


    if(

        date

    ){

        parts.push(

            date

        );

    }


    if(

        status

    ){

        parts.push(

            formatLabel(

                status

            )

        );

    }


    if(

        shift

    ){

        parts.push(

            formatLabel(

                shift

            )

        );

    }


    return parts.join(

        " · "

    );

}


/* =====================================================
   GET SEARCH TEXT
===================================================== */

function getMonthlySearchText(

    record

){

    return [

        record?.id,

        record?.date,

        record?.status,

        record?.shift,

        record?.telat,

        record?.izin_telat,

        record?.izin_pulang,

        record?.lembur_jam,

        record?.Month,

        record?.Year

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
   RENDER DETAIL
=====================================================

   Month dan Year ditampilkan sebagai informasi
   otomatis, bukan sebagai field edit.
===================================================== */

function renderMonthlyDetail(

    record

){

    const autoDate =

        getMonthYearFromDate(

            record?.date

        );


    const month =

        String(

            record?.Month ??

            autoDate.Month ??

            ""

        ).trim();


    const year =

        String(

            record?.Year ??

            autoDate.Year ??

            ""

        ).trim();


    return {

        title :

            "Informasi Payroll Monthly",

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

                        record?.date ??

                        "-"

                    ),

                locked :

                    true

            },

            {

                label :

                    "Status",

                value :

                    formatMonthlyValue(

                        record?.status

                    )

            },

            {

                label :

                    "Shift",

                value :

                    recordHasShift(

                        record

                    )

                        ?

                    formatMonthlyValue(

                        record?.shift

                    )

                        :

                    "-"

            },

            {

                label :

                    "Telat",

                value :

                    record?.telat

                        ?

                    `${formatMonthlyNumber(record.telat)} menit`

                        :

                    "-"

            },

            {

                label :

                    "Izin Telat",

                value :

                    record?.izin_telat

                        ?

                    `${formatMonthlyNumber(record.izin_telat)} jam`

                        :

                    "-"

            },

            {

                label :

                    "Izin Pulang",

                value :

                    record?.izin_pulang

                        ?

                    `${formatMonthlyNumber(record.izin_pulang)} jam`

                        :

                    "-"

            },

            {

                label :

                    "Lembur",

                value :

                    record?.lembur_jam

                        ?

                    `${formatMonthlyNumber(record.lembur_jam)} jam`

                        :

                    "-"

            },

            {

                label :

                    "Month",

                value :

                    month ||

                    "-",

                locked :

                    true

            },

            {

                label :

                    "Year",

                value :

                    year ||

                    "-",

                locked :

                    true

            }

        ]

    };

}


/* =====================================================
   EDIT FIELD CONFIG
===================================================== */

function getMonthlyEditFieldConfig(

    field,

    record,

    values = {}

){

    const normalized =

        normalizeMonthlyValue(

            field

        );


    /* =================================================
       STATUS
    ================================================= */

    if(

        normalized ===

            "status"

    ){

        return {

            type :

                "select",

            options :

                getStatusOptions(),

            required :

                true,

            placeholder :

                "Pilih status"

        };

    }


    /* =================================================
       SHIFT
    ================================================= */

    if(

        normalized ===

            "shift"

    ){

        return {

            type :

                "select",

            options :

                getShiftOptions(),

            required :

                true,

            placeholder :

                "Pilih shift",

            visibleIf :

                (

                    currentValues,

                    currentRecord

                ) => {

                    return recordHasShift(

                        currentRecord ??

                        record

                    );

                }

        };

    }


    /* =================================================
       CONDITIONS
    ================================================= */

    if(

        CONDITION_FIELDS.includes(

            normalized

        )

    ){

        return getMonthlyConditionConfig(

            normalized

        );

    }


    return {

        type :

            getMonthlyEditFieldType(

                normalized

            )

    };

}


/* =====================================================
   EDIT INPUT ROW
===================================================== */

async function openMonthlyEditRow(){

    console.log(

        "===== PAYROLL MONTHLY EDIT INPUT ROW OPEN ====="

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

            "[Payroll Monthly] EditRow.open() tidak tersedia."

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
    ================================================= */

    const records =

        getMonthlyRecords();


    console.log(

        "Payroll Monthly Edit Row records:",

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

            "payroll-monthly",


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

            "Pilih data Payroll Monthly dari daftar untuk mengubah data.",


        /* =============================================
           RECORD SOURCE
        =============================================

           PENTING :

           Jangan mengambil dari :

               EditRow.getEditableRecords()

           karena reset() sudah membersihkan
           internal state.

        ============================================= */

        getRecords :

            () => {

                const currentRecords =

                    getMonthlyRecords();


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

                return "date";

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
        =============================================

           Month dan Year tidak dimasukkan ke
           form edit karena keduanya otomatis.

        ============================================= */

        getFieldOrder :

            record => {

                const fields = [

                    "id",

                    "date",

                    "status",

                    "shift",

                    "telat",

                    "izin_telat",

                    "izin_pulang",

                    "lembur_jam"

                ];


                return fields.filter(

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

            shift :

                "shift",

            telat :

                "telat",

            izin_telat :

                "izin_telat",

            izin_pulang :

                "izin_pulang",

            lembur_jam :

                "lembur_jam"

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

                return getMonthlyEditFieldType(

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

                return getMonthlyEditFieldLabel(

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

                return getMonthlyEditFieldConfig(

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

                return getMonthlyRecordLabel(

                    record

                );

            },


        /* =============================================
           RECORD META
        ============================================= */

        getRecordMeta :

            record => {

                return getMonthlyRecordMeta(

                    record

                );

            },


        /* =============================================
           SEARCH
        ============================================= */

        getSearchText :

            record => {

                return getMonthlySearchText(

                    record

                );

            },


        /* =============================================
           DETAIL
        ============================================= */

        renderDetail :

            record => {

                return renderMonthlyDetail(

                    record

                );

            },


        /* =============================================
           FIELD LOCK CHECK
        ============================================= */

        isFieldLocked :

            (

                field,

                record

            ) => {

                const normalized =

                    normalizeMonthlyValue(

                        field

                    );


                /* -------------------------------------
                   ID
                ------------------------------------- */

                if(

                    normalized ===

                        "id"

                ){

                    return true;

                }


                /* -------------------------------------
                   DATE
                ------------------------------------- */

                if(

                    normalized ===

                        "date"

                ){

                    return true;

                }


                /* -------------------------------------
                   MONTH / YEAR

                   Jika suatu saat ikut masuk ke
                   field list, tetap tidak boleh
                   diedit karena otomatis.
                ------------------------------------- */

                if(

                    normalized ===

                        "month"

                    ||

                    normalized ===

                        "year"

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

                    normalizeMonthlyValue(

                        field

                    );


                if(

                    normalized ===

                        "shift"

                ){

                    return (

                        recordHasShift(

                            record

                        )

                    );

                }


                return EDITABLE_FIELDS.includes(

                    normalized

                );

            },


        /* =============================================
           PREPARE VALUES
        ============================================= */

        prepareValues :

            (

                values,

                record

            ) => {

                return prepareMonthlyEditValues(

                    values,

                    record

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

                return validateMonthlyEdit(

                    record,

                    values,

                    context

                );

            },


        /* =============================================
           UI TEXT
        ============================================= */

        listTitle :

            "Daftar Payroll Monthly",


        searchPlaceholder :

            "Cari ID, tanggal, status, shift...",


        emptyText :

            "Tidak ada data Payroll Monthly yang dapat diedit.",


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

Monthly.openEdit =

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

            normalizeMonthlyValue(

                mode

            );


        /* =================================================
           PAYROLL MONTHLY HANYA MEMILIKI
           EDIT INPUT ROW
        ================================================= */

        if(

            normalizedMode

            &&

            normalizedMode !==

                "row"

        ){

            console.warn(

                "[Payroll Monthly] Mode Edit Input tidak dikenal:",

                mode

            );

        }


        return openMonthlyEditRow();

    };


/* =====================================================
   BACKWARD COMPATIBILITY
===================================================== */

export const MonthlyInput =

    Monthly;


/* =====================================================
   GET CONFIG
===================================================== */

export function getMonthlyInputConfig(){

    return Monthly;

}
