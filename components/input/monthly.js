/* =====================================================
   Finance Assistant
   Component    : Global Input
   Workspace    : Payroll Monthly
   File         : monthly.js
   Version      : 2.0.0

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
===================================================== */


/* =====================================================
   IMPORT DATA
===================================================== */

import {

    getInputData

} from "./data.js";


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
