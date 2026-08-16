/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Monthly
   File         : monthly.js
   Version      : 2.0.0

   Description :
   Payroll Monthly Setting Definition

   Sections :
   - Periode Gaji
   - Rule Gaji
===================================================== */


/* =====================================================
   MONTHLY SETTING
===================================================== */

export const MonthlySetting = {


    /* =================================================
       HEADER
    ================================================= */

    title :

        "Pengaturan Payroll Monthly",


    subtitle :

        "Atur periode dan rule payroll monthly",


    /* =================================================
       SECTIONS
    ================================================= */

    sections : [


        /* =============================================
           PERIODE GAJI
        ============================================= */

        {

            id :

                "periode_gaji",


            title :

                "📅 Periode Gaji",


            description :

                "Tentukan periode perhitungan dan masa aktif rule gaji.",


            addLabel :

                "＋ Tambah Periode",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            /* =========================================
               FIELDS
            ========================================= */

            fields : [

                /* -------------------------------------
                   PERIODE PERHITUNGAN
                ------------------------------------- */

                {

                    name :

                        "periode_mulai",


                    label :

                        "Periode Perhitungan Gaji\nTentukan periode tanggal perhitungan gaji dimulai",


                    type :

                        "date",


                    required :

                        true,


                    note :

                        "Contoh tanggal: 2026-05-25"

                },


                {

                    name :

                        "periode_berakhir",


                    label :

                        "Tentukan periode tanggal perhitungan gaji berakhir",


                    type :

                        "date",


                    required :

                        true,


                    note :

                        "Contoh tanggal: 2026-06-24"

                },


                /* -------------------------------------
                   PERIODE AKTIF
                ------------------------------------- */

                {

                    name :

                        "periode_aktif_mulai",


                    label :

                        "Periode Aktif Gaji\nKapan Periode Aktif gaji ini dimulai",


                    type :

                        "date",


                    required :

                        true,


                    note :

                        "Contoh tanggal: 2026-05-25"

                },


                {

                    name :

                        "periode_aktif_berakhir",


                    label :

                        "Kapan Periode Aktif gaji ini diakhiri",


                    type :

                        "date",


                    required :

                        true,


                    note :

                        "Contoh tanggal: 2027-02-24"

                }

            ],


            /* =========================================
               DUPLICATE PERIODE
               
               Periode perhitungan yang sama
               tidak boleh dimasukkan dua kali.
            ========================================= */

            uniqueFields : [

                "periode_mulai",

                "periode_berakhir"

            ]

        },


        /* =============================================
           RULE GAJI
        ============================================= */

        {

            id :

                "rule_gaji",


            title :

                "💰 Rule Gaji",


            description :

                "Atur gaji, tambahan, dan potongan berdasarkan kebutuhan payroll.",


            addLabel :

                "＋ Tambah Rule",


            formAddLabel :

                "＋ Tambahkan Rule",


            deleteLabel :

                "Hapus",


            /* =========================================
               FIELDS
            ========================================= */

            fields : [

                /* -------------------------------------
                   TYPE RULE
                ------------------------------------- */

                {

                    name :

                        "type_rule",


                    label :

                        "Jenis Rule",


                    type :

                        "select",


                    required :

                        true,


                    placeholder :

                        "Pilih jenis rule",


                    options : [

                        {

                            value :

                                "rule_gaji",

                            label :

                                "Rule Gaji"

                        },


                        {

                            value :

                                "rule_tambah",

                            label :

                                "Rule Tambah"

                        },


                        {

                            value :

                                "rule_potong",

                            label :

                                "Rule Potong"

                        }

                    ]

                },


                /* -------------------------------------
                   NAMA RULE
                ------------------------------------- */

                {

                    name :

                        "nama",


                    label :

                        "Nama Rule",


                    type :

                        "select",


                    required :

                        true,


                    placeholder :

                        "Pilih nama rule",


                    options : [

                        /* =================================
                           RULE GAJI
                        ================================= */

                        {

                            value :

                                "gaji",

                            label :

                                "Gaji Pokok"

                        },


                        /* =================================
                           RULE TAMBAH
                        ================================= */

                        {

                            value :

                                "uang_makan",

                            label :

                                "Uang Makan"

                        },


                        {

                            value :

                                "tunjangan",

                            label :

                                "Tunjangan"

                        },


                        {

                            value :

                                "uang_transport",

                            label :

                                "Uang Transport"

                        },


                        {

                            value :

                                "lembur",

                            label :

                                "Lembur"

                        },


                        {

                            value :

                                "lembur_jam_1",

                            label :

                                "Lembur Jam 1"

                        },


                        {

                            value :

                                "lembur_jam_2",

                            label :

                                "Lembur Jam 2"

                        },


                        {

                            value :

                                "lembur_jam_3",

                            label :

                                "Lembur Jam 3"

                        },


                        {

                            value :

                                "lembur_jam_4",

                            label :

                                "Lembur Jam 4"

                        },


                        {

                            value :

                                "lembur_jam_5",

                            label :

                                "Lembur Jam 5"

                        },


                        {

                            value :

                                "lembur_jam_6",

                            label :

                                "Lembur Jam 6"

                        },


                        {

                            value :

                                "lembur_jam_7",

                            label :

                                "Lembur Jam 7"

                        },


                        {

                            value :

                                "lembur_jam_8",

                            label :

                                "Lembur Jam 8"

                        },


                        /* =================================
                           RULE POTONG
                        ================================= */

                        {

                            value :

                                "telat",

                            label :

                                "Telat"

                        },


                        {

                            value :

                                "izin_telat",

                            label :

                                "Izin Telat"

                        },


                        {

                            value :

                                "izin_pulang",

                            label :

                                "Izin Pulang"

                        },


                        {

                            value :

                                "absen",

                            label :

                                "Absen"

                        }

                    ]

                },


                /* -------------------------------------
                   KONDISI
                ------------------------------------- */

                {

                    name :

                        "kondisi",


                    label :

                        "Kondisi",


                    type :

                        "select",


                    required :

                        true,


                    placeholder :

                        "Pilih kondisi",


                    options : [

                        {

                            value :

                                "periode",

                            label :

                                "Periode"

                        },


                        {

                            value :

                                "masuk,lembur",

                            label :

                                "Masuk + Lembur"

                        }

                    ]

                },


                /* -------------------------------------
                   WAKTU
                ------------------------------------- */

                {

                    name :

                        "waktu",


                    label :

                        "Waktu",


                    type :

                        "select",


                    required :

                        true,


                    placeholder :

                        "Pilih waktu",


                    options : [

                        {

                            value :

                                "gaji",

                            label :

                                "Gaji"

                        },


                        {

                            value :

                                "harian",

                            label :

                                "Harian"

                        },


                        {

                            value :

                                "bulanan",

                            label :

                                "Bulanan"

                        },


                        {

                            value :

                                "menit",

                            label :

                                "Menit"

                        },


                        {

                            value :

                                "jam",

                            label :

                                "Jam"

                        }

                    ]

                },


                /* -------------------------------------
                   NILAI START
                ------------------------------------- */

                {

                    name :

                        "nilai_start",


                    label :

                        "Nilai Mulai",


                    type :

                        "number",


                    placeholder :

                        "Contoh: 1",


                    note :

                        "Contoh lembur_jam_1: 1. Lembur jam berikutnya dapat dimulai dari 2, 3, dan seterusnya."

                },


                /* -------------------------------------
                   NILAI END
                ------------------------------------- */

                {

                    name :

                        "nilai_end",


                    label :

                        "Nilai Akhir",


                    type :

                        "number",


                    placeholder :

                        "Contoh: 2",


                    note :

                        "Contoh lembur_jam_1: 2. Kosongkan jika rule berlaku mulai nilai tersebut dan seterusnya."

                },


                /* -------------------------------------
                   NOMINAL
                ------------------------------------- */

                {

                    name :

                        "nominal",


                    label :

                        "Nominal",


                    type :

                        "number",


                    required :

                        true,


                    min :

                        0,


                    step :

                        1,


                    placeholder :

                        "Masukkan nominal"

                }

            ],


            /* =========================================
               DUPLICATE RULE
            ========================================= */

            uniqueFields : [

                "type_rule",

                "nama",

                "kondisi",

                "waktu",

                "nilai_start",

                "nilai_end"

            ]

        }

    ]

};
