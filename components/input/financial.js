/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Financial
   File         : financial.js
   Version      : 1.0.0

   Description :
   Input Flow Configuration for Financial

   Flow :
   Jenis
   → Activity
   → Nominal
   → Keterangan

   Source :
   data.js
   → financial_activity
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    getFinancialActivity

} from "./data.js";


/* =====================================================
   RULE CONFIGURATION
===================================================== */

const TYPE_RULE = {

    masuk :
        "rule_pemasukan",

    keluar :
        "rule_pengeluaran",

    hutang :
        "rule_hutang",

    bayar :
        "rule_hutang",

    nabung :
        "rule_tabungan",

    tarik :
        "rule_tabungan"

};


/* =====================================================
   TYPE LABEL
===================================================== */

const TYPE_LABEL = {

    masuk :
        "💰 Masuk",

    keluar :
        "💸 Keluar",

    bayar :
        "💳 Bayar",

    tarik :
        "↩️ Tarik",

    nabung :
        "🏦 Nabung",

    hutang :
        "🤝 Hutang"

};


/* =====================================================
   NORMALIZE RULE DATA
===================================================== */

function getRules(){

    const data =

        getFinancialActivity();


    return data.map(

        item => ({

            rules :

                String(

                    item?.rules ??

                        ""

                )

                    .trim()

                    .toLowerCase(),

            type :

                String(

                    item?.type ??

                        ""

                )

                    .split(",")

                    .map(

                        value =>

                            value

                                .trim()

                                .toLowerCase()

                    )

                    .filter(

                        Boolean

                    ),

            activity :

                String(

                    item?.activity ??

                        ""

                )

                    .split(",")

                    .map(

                        value =>

                            value

                                .trim()

                                .toLowerCase()

                    )

                    .filter(

                        Boolean

                    )

        })

    );

}


/* =====================================================
   GET RULE
===================================================== */

function getRule(

    ruleName

){

    return getRules().find(

        rule =>

            rule.rules ===

            ruleName

    );

}


/* =====================================================
   GET AVAILABLE TYPES
===================================================== */

function getAvailableTypes(){

    const available = [];


    const types = [

        "masuk",

        "keluar",

        "bayar",

        "tarik",

        "nabung",

        "hutang"

    ];


    types.forEach(

        type => {

            const ruleName =

                TYPE_RULE[type];


            const rule =

                getRule(

                    ruleName

                );


            if(

                !rule

            ){

                return;

            }


            if(

                !rule.type.includes(

                    type

                )

            ){

                return;

            }


            available.push({

                value :

                    type,

                label :

                    TYPE_LABEL[type]

            });

        }

    );


    return available;

}


/* =====================================================
   GET ACTIVITY BY TYPE
===================================================== */

function getActivityByType(

    type

){

    const ruleName =

        TYPE_RULE[type];


    const rule =

        getRule(

            ruleName

        );


    if(

        !rule

    ){

        return [];

    }


    return rule.activity.map(

        activity => ({

            value :

                activity,

            label :

                formatActivity(

                    activity

                )

        })

    );

}


/* =====================================================
   FORMAT ACTIVITY LABEL
===================================================== */

function formatActivity(

    value

){

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
   FINANCIAL
===================================================== */

export const Financial = {

    workspace :

        "financial",


    title :

        "Input Financial",


    subtitle :

        "Tambahkan transaksi Financial",


    /* =============================================
       FLOW
    ============================================= */

    steps : [

        /* =========================================
           1. JENIS TRANSAKSI
        ========================================= */

        {

            id :

                "jenis",

            label :

                "Jenis Transaksi",

            type :

                "select",

            options :

                () =>

                    getAvailableTypes()

        },


        /* =========================================
           2. ACTIVITY
        ========================================= */

        {

            id :

                "type",

            label :

                "Aktivitas",

            type :

                "select",

            options :

                values =>

                    getActivityByType(

                        values.jenis

                    )

        },


        /* =========================================
           3. NOMINAL
        ========================================= */

        {

            id :

                "nominal",

            label :

                "Nominal",

            type :

                "number",

            placeholder :

                "Masukkan nominal"

        },


        /* =========================================
           4. KETERANGAN
        ========================================= */

        {

            id :

                "keterangan",

            label :

                "Keterangan",

            type :

                "text",

            placeholder :

                "Keterangan transaksi"

        }

    ]

};
