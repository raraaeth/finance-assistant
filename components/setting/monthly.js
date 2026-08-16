/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Monthly
   File         : monthly.js
   Version      : 1.1.0

   Description :
   Payroll Monthly Setting Definition

   Stage :
   - Rule Periode : ACTIVE
   - Rule Gaji    : SKELETON
   - Attendance   : SKELETON

   Principle :
   - Periode Gaji hanya dapat dibuat satu kali
   - Rule lain akan dikembangkan bertahap
===================================================== */


/* =====================================================
   PAYROLL MONTHLY SETTING
===================================================== */

export const MonthlySetting = {


    /* =================================================
       HEADER
    ================================================= */

    title :

        "Pengaturan Payroll Monthly",


    subtitle :

        "Atur rule Payroll Monthly",


    /* =================================================
       SECTIONS
    ================================================= */

    sections : [


        /* =================================================
           RULE PERIODE
        ================================================= */

        {

            id :

                "periode",


            title :

                "📅 Rule Periode",


            description :

                "Aturan periode perhitungan gaji.",


            addLabel :

                "＋ Tambah",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            /* ---------------------------------------------
               FIELD YANG DIANGGAP UNIK
               
               Artinya:
               nama yang sama tidak boleh dibuat lagi
               di section ini.
            --------------------------------------------- */

            uniqueFields : [

                "nama"

            ],


            fields : [

                /* -----------------------------------------
                   NAMA
                ----------------------------------------- */

                {

                    name :

                        "nama",

                    label :

                        "Nama",

                    type :

                        "select",

                    required :

                        true,

                    options : [

                        {

                            value :

                                "periode_gaji",

                            label :

                                "Periode Gaji"

                        }

                    ]

                },


                /* -----------------------------------------
                   WAKTU
                ----------------------------------------- */

                {

                    name :

                        "waktu",

                    label :

                        "Waktu",

                    type :

                        "select",

                    required :

                        true,

                    options : [

                        {

                            value :

                                "bulanan",

                            label :

                                "Bulanan"

                        }

                    ]

                },


                /* -----------------------------------------
                   MULAI TANGGAL
                ----------------------------------------- */

                {

                    name :

                        "nilai_start",

                    label :

                        "Mulai tanggal",

                    type :

                        "number",

                    required :

                        true,

                    min :

                        1,

                    max :

                        31,

                    placeholder :

                        "Contoh: 28"

                },


                /* -----------------------------------------
                   SAMPAI TANGGAL
                ----------------------------------------- */

                {

                    name :

                        "nilai_end",

                    label :

                        "Sampai tanggal",

                    type :

                        "number",

                    required :

                        true,

                    min :

                        1,

                    max :

                        31,

                    placeholder :

                        "Contoh: 27"

                },


                /* -----------------------------------------
                   PERIODE AKTIF MULAI
                ----------------------------------------- */

                {

                    name :

                        "berlaku_start",

                    label :

                        "Periode Aktif Mulai",

                    type :

                        "date",

                    required :

                        true

                },


                /* -----------------------------------------
                   PERIODE AKTIF SAMPAI
                ----------------------------------------- */

                {

                    name :

                        "berlaku_end",

                    label :

                        "Periode Aktif Sampai",

                    type :

                        "date",

                    required :

                        true

                }

            ],


            /* ---------------------------------------------
               NORMALIZE
            --------------------------------------------- */

            normalize :

                data => ({

                    type_rule :

                        "rule_periode",

                    ...data

                })

        },


        /* =================================================
           RULE GAJI
        ================================================= */

        {

            id :

                "gaji",


            title :

                "💰 Rule Gaji",


            description :

                "Aturan gaji, tambahan dan potongan.",


            skeleton :

                true,


            addLabel :

                "Segera",


            fields : []

        },


        /* =================================================
           RULE ATTENDANCE
        ================================================= */

        {

            id :

                "attendance",


            title :

                "📅 Rule Attendance",


            description :

                "Aturan masuk, telat, izin dan lembur.",


            skeleton :

                true,


            addLabel :

                "Segera",


            fields : []

        }

    ]

};
