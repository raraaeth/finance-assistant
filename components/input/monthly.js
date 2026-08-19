/* =====================================================
   Finance Assistant
   Component    : Global Input
   Workspace    : Payroll Monthly
   File         : monthly.js
   Version      : 1.0.2

   Description :
   Global Input Configuration
   Payroll Monthly Attendance

   Source :
   payroll_monthly_rules

   Output :
   date
   status
   shift
   telat
   izin_telat
   izin_pulang
   lembur_jam

   Principle :
   - Status mengikuti rule payroll monthly
   - Shift bersifat optional
   - Shift hanya muncul jika rule_shift tersedia
   - Telat bersifat optional dan dihitung dalam menit
   - Izin Telat bersifat optional dan dihitung dalam jam
   - Izin Pulang bersifat optional dan dihitung dalam jam
   - Lembur Jam bersifat optional dan dihitung dalam jam
   - Status lembur = lembur harian
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    getPayrollMonthlyRules

} from "./data.js";


/* =====================================================
   HELPERS
===================================================== */


/* =====================================================
   GET RULES
===================================================== */

function getRules(){

    const rules =

        getPayrollMonthlyRules();


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
   PARSE STRING LIST
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
===================================================== */

function getStatusOptions(){

    const options = [];


    /* =================================================
       STATUS DARI RULE MASUK

       Contoh :

       masuk
       sakit
       cuti
       absen
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
       STATUS LEMBUR

       Lembur harian berasal dari rule :

       type_rule = rule_tambah
       nama      = lembur
       kondisi   = lembur_harian
       waktu     = harian
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
===================================================== */

function getShiftOptions(){

    const rule =

        getRuleByType(

            "rule_shift"

        );


    /* =================================================
       TIDAK ADA RULE SHIFT

       Maka pilihan shift tidak tersedia.
    ================================================= */

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
   MONTHLY INPUT CONFIG
===================================================== */

export const Monthly = {

    workspace :

        "payroll-monthly",


    title :

        "Payroll Monthly",


    steps : [

        /* =================================================
           DATE
        ================================================= */

        {

            id :

                "date",

            label :

                "Tanggal",

            type :

                "date",

            required :

                true

        },


        /* =================================================
           STATUS
        =================================================

           Status berasal dari :

           rule_masuk
               masuk
               sakit
               cuti
               absen

           dan :

           rule_tambah
               lembur_harian

           Jika rule lembur harian tersedia,
           status "lembur" tersedia.
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
        =================================================

           OPTIONAL.

           Shift hanya tersedia jika :

           type_rule = rule_shift

           Contoh :

           pagi,siang,malam
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
           TELAT
        =================================================

           OPTIONAL.

           Satuan :

           MENIT

           Contoh :

           5
           10
           15
           30
           60

           Digunakan untuk keterlambatan
           sampai dengan 60 menit.
        ================================================= */

        {

            id :

                "telat",

            label :

                "Telat",

            type :

                "number",

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

                    values.status ===

                        "masuk"

                    &&

                    hasRuleName(

                        "telat"

                    ),

            note :

                "Opsional. Masukkan keterlambatan dalam menit (5–60 menit)."

        },


        /* =================================================
           IZIN TELAT
        =================================================

           OPTIONAL.

           Satuan :

           JAM

           Digunakan untuk keterlambatan
           di atas 1 jam.
        ================================================= */

        {

            id :

                "izin_telat",

            label :

                "Izin Telat",

            type :

                "number",

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

                    values.status ===

                        "masuk"

                    &&

                    hasRuleName(

                        "izin_telat"

                    ),

            note :

                "Opsional. Jika keterlambatan lebih dari 1 jam, masukkan jumlah jam."

        },


        /* =================================================
           IZIN PULANG
        =================================================

           OPTIONAL.

           Satuan :

           JAM
        ================================================= */

        {

            id :

                "izin_pulang",

            label :

                "Izin Pulang",

            type :

                "number",

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

                    values.status ===

                        "masuk"

                    &&

                    hasRuleName(

                        "izin_pulang"

                    ),

            note :

                "Opsional. Masukkan waktu izin pulang dalam jam."

        },


        /* =================================================
           LEMBUR JAM
        =================================================

           OPTIONAL.

           Ini berbeda dengan :

           status = lembur

           Status lembur :

               lembur harian

           Sedangkan field ini :

               lembur berdasarkan jumlah jam.
        ================================================= */

        {

            id :

                "lembur_jam",

            label :

                "Lembur Jam",

            type :

                "number",

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

                    (

                        values.status ===

                            "masuk"

                        ||

                        values.status ===

                            "lembur"

                    )

                    &&

                    hasRuleName(

                        "lembur_jam"

                    ),

            note :

                "Opsional. Masukkan jumlah jam lembur."

        }

    ]

};


/* =====================================================
   BACKWARD COMPATIBILITY
=====================================================

   Jika ada file lama yang masih menggunakan :

       MonthlyInput

   tetap akan bekerja.
===================================================== */

export const MonthlyInput =

    Monthly;


/* =====================================================
   GET CONFIG
===================================================== */

export function getMonthlyInputConfig(){

    return Monthly;

}
