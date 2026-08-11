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
===================================================== */


/* =====================================================
   STATE
===================================================== */

export const Rules = {

    raw : [],

    data : {

        gaji : [],

        periode : [],

        masuk : [],

        telat : [],

        izin : [],

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

        /* ---------------------------------------------
           GAJI
        --------------------------------------------- */

        gaji :

            Rules.raw.filter(

                item =>

                    item.type_rule ===

                    "rule_gaji"

            ),


        /* ---------------------------------------------
           PERIODE
        --------------------------------------------- */

        periode :

            Rules.raw.filter(

                item =>

                    item.type_rule ===

                    "rule_periode"

            ),


        /* ---------------------------------------------
           MASUK
        --------------------------------------------- */

        masuk :

            Rules.raw.filter(

                item =>

                    item.type_rule ===

                    "rule_masuk"

            ),


        /* ---------------------------------------------
           TELAT
        --------------------------------------------- */

        telat :

            Rules.raw.filter(

                item =>

                    item.type_rule ===

                    "rule_telat"

            ),


        /* ---------------------------------------------
           IZIN
        --------------------------------------------- */

        izin :

            Rules.raw.filter(

                item =>

                    item.type_rule ===

                    "rule_izin"

            ),


        /* ---------------------------------------------
           LEMBUR
        --------------------------------------------- */

        lembur :

            Rules.raw.filter(

                item =>

                    item.type_rule ===

                    "rule_lembur"

            ),


        /* ---------------------------------------------
           TAMBAHAN
        --------------------------------------------- */

        tambah :

            Rules.raw.filter(

                item =>

                    item.type_rule ===

                    "rule_tambah"

            ),


        /* ---------------------------------------------
           POTONGAN
        --------------------------------------------- */

        potong :

            Rules.raw.filter(

                item =>

                    item.type_rule ===

                    "rule_potong"

            )

    };

}
