/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Rules
   File        : rules.js
   Version     : 2.0.0

   Description :
   Payroll Rules Engine

   Sections :
   - State
   - Init
   - Normalize
   - Group Rules
   - Active Rules
   - Helper
===================================================== */


/* =====================================================
   STATE
===================================================== */

export const Rules = {

    raw : [],

    data : {

        periode : [],

        gaji : [],

        libur : [],

        masuk : [],

        telat : [],

        lembur : [],

        tambah : [],

        potong : []

    }

};


/* =====================================================
   INIT
===================================================== */

Rules.init = function(

    rules

){

    Rules.raw =

        rules ?? [];


    normalize();

    groupRules();

};


/* =====================================================
   NORMALIZE
===================================================== */

function normalize(){

    Rules.raw =

        Rules.raw.map(

            item => ({

                ...item,

                nominal :

                    Number(

                        item.nominal || 0

                    ),

                nilai_start :

                    item.nilai_start

                    ?

                    item.nilai_start

                    :

                    "",

                nilai_end :

                    item.nilai_end

                    ?

                    item.nilai_end

                    :

                    "",

                berlaku_start :

                    item.berlaku_start

                    ?

                    item.berlaku_start

                    :

                    "",

                berlaku_end :

                    item.berlaku_end

                    ?

                    item.berlaku_end

                    :

                    ""

            })

        );

}


/* =====================================================
   GROUP RULES
===================================================== */

function groupRules(){

    Rules.data = {

        periode :

            Rules.raw.filter(

                item =>

                    item.type_rule ===

                    "rule_periode"

            ),


        gaji :

            Rules.raw.filter(

                item =>

                    item.type_rule ===

                    "rule_gaji"

            ),


        libur :

            Rules.raw.filter(

                item =>

                    item.type_rule ===

                    "rule_libur"

            ),


        masuk :

            Rules.raw.filter(

                item =>

                    item.type_rule ===

                    "rule_masuk"

            ),


        telat :

            Rules.raw.filter(

                item =>

                    item.type_rule ===

                    "rule_telat"

            ),


        lembur :

            Rules.raw.filter(

                item =>

                    item.type_rule ===

                    "rule_lembur"

            ),


        tambah :

            Rules.raw.filter(

                item =>

                    item.type_rule ===

                    "rule_tambah"

            ),


        potong :

            Rules.raw.filter(

                item =>

                    item.type_rule ===

                    "rule_potong"

            )

    };

}


/* =====================================================
   ACTIVE RULES
===================================================== */

Rules.active = function(

    type,

    date = new Date()

){

    const rules =

        Rules.data[

            type

        ] ?? [];


    return rules.filter(

        item =>

            isActive(

                item,

                date

            )

    );

}


/* =====================================================
   HELPER
===================================================== */

function isActive(

    rule,

    date

){

    const start =

        parseDate(

            rule.berlaku_start

        );


    const end =

        parseDate(

            rule.berlaku_end

        );


    if(

        start &&

        date < start

    ){

        return false;

    }


    if(

        end

    ){

        /*
           Berlaku sampai akhir tanggal.
        */

        const endDate =

            new Date(

                end.getFullYear(),

                end.getMonth(),

                end.getDate(),

                23,

                59,

                59,

                999

            );


        if(

            date > endDate

        ){

            return false;

        }

    }


    return true;

}


/* =====================================================
   PARSE DATE
===================================================== */

function parseDate(

    value

){

    if(

        !value

    ){

        return null;

    }


    const [

        year,

        month,

        day

    ] =

        String(

            value

        )

        .split(

            "-"

        )

        .map(

            Number

        );


    if(

        !year ||

        !month ||

        !day

    ){

        return null;

    }


    return new Date(

        year,

        month - 1,

        day

    );

}
