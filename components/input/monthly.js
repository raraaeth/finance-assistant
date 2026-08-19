/* =====================================================
   Finance Assistant
   Component    : Global Input
   Workspace    : Payroll Monthly
   File         : monthly.js
   Version      : 1.0.1

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
   CHECK RULE
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
   CHECK RULE NAME
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
   STRING LIST
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
   LABEL
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
       RULE MASUK

       Status :

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
       RULE LEMBUR HARIAN

       Status :

       lembur

       Sumber :

       rule_tambah
       nama    = lembur
       kondisi = lembur_harian
       waktu   = harian
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

    ){

        if(

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
   PAYROLL MONTHLY CONFIG
===================================================== */

export const MonthlyInput = {

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

           Status berasal dari payroll_monthly_rules.

           rule_masuk :
               masuk
               sakit
               cuti
               absen

           rule_tambah :
               lembur_harian
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

           Pilihan berasal dari :

           rule_shift.waktu
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

           OPTIONAL.

           Hitungan :

           MENIT

           Range :

           5 - 60
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

                "Masukkan keterlambatan dalam menit (5–60 menit)."

        },


        /* =================================================
           IZIN TELAT

           OPTIONAL.

           Hitungan :

           JAM

           Digunakan untuk keterlambatan
           lebih dari 1 jam.
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

                "Digunakan jika keterlambatan lebih dari 1 jam. Masukkan dalam jam."

        },


        /* =================================================
           IZIN PULANG

           OPTIONAL.

           Hitungan :

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

                "Masukkan waktu izin pulang dalam jam."

        },


        /* =================================================
           LEMBUR JAM

           OPTIONAL.

           Ini berbeda dengan :

           status = lembur

           Status lembur :

               lembur harian

           Field ini :

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

                "Masukkan jumlah jam lembur."

        }

    ]

};


/* =====================================================
   GET CONFIG
===================================================== */

export function getMonthlyInputConfig(){

    return MonthlyInput;

}
