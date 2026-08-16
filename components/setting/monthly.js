/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Monthly
   File         : monthly.js
   Version      : 2.1.0

   Description :
   Payroll Monthly Setting Definition

   Fokus tahap ini :
   - Rule Periode

   Prinsip :
   - Periode gaji menggunakan tanggal lengkap
   - Input tanggal menggunakan calendar
   - Format data :
     YYYY-MM-DD

   Contoh :
   nilai_start :
   2026-05-25

   nilai_end :
   2026-06-24

   Catatan :
   Tanggal periode disimpan sebagai tanggal
   sebenarnya agar dapat digunakan langsung
   oleh Period Engine dan Summary.

   Section berikutnya masih skeleton :
   - Rule Gaji
   - Rule Attendance
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

        /* =============================================
           RULE PERIODE
        ============================================= */

        {

            id :

                "periode",


            title :

                "📅 Rule Periode",


            description :

                "Tentukan periode tanggal perhitungan gaji dan masa aktif rule.",


            addLabel :

                "＋ Tambah",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            /* =========================================
               FIELDS
            ========================================= */

            fields : [

                /* -------------------------------------
                   NAMA
                ------------------------------------- */

                {

                    name :

                        "nama",


                    label :

                        "Nama Rule",


                    type :

                        "text",


                    value :

                        "periode_gaji",


                    placeholder :

                        "Contoh: periode_gaji",


                    required :

                        true

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


                    options : [

                        {

                            value :

                                "bulanan",

                            label :

                                "Bulanan"

                        }

                    ]

                },


                /* -------------------------------------
                   PERIODE MULAI
                ------------------------------------- */

                {

                    name :

                        "nilai_start",


                    label :

                        "Tentukan periode tanggal perhitungan gaji dimulai",


                    type :

                        "date",


                    note :

                        "Contoh tanggal: 2026-05-25",


                    required :

                        true

                },


                /* -------------------------------------
                   PERIODE BERAKHIR
                ------------------------------------- */

                {

                    name :

                        "nilai_end",


                    label :

                        "Tentukan periode tanggal perhitungan gaji berakhir",


                    type :

                        "date",


                    note :

                        "Contoh tanggal: 2026-06-24",


                    required :

                        true

                },


                /* -------------------------------------
                   PERIODE AKTIF MULAI
                ------------------------------------- */

                {

                    name :

                        "berlaku_start",


                    label :

                        "Kapan Periode Aktif gaji ini dimulai",


                    type :

                        "date",


                    note :

                        "Contoh tanggal: 2026-01-25",


                    required :

                        true

                },


                /* -------------------------------------
                   PERIODE AKTIF BERAKHIR
                ------------------------------------- */

                {

                    name :

                        "berlaku_end",


                    label :

                        "Kapan Periode Aktif gaji ini diakhiri",


                    type :

                        "date",


                    note :

                        "Contoh tanggal: 2027-02-24",


                    required :

                        true

                }

            ]

        },


        /* =============================================
           RULE GAJI
           SKELETON
        ============================================= */

        {

            id :

                "gaji",


            title :

                "💰 Rule Gaji",


            description :

                "Aturan gaji, tambahan dan potongan.",


            addLabel :

                "＋ Tambah",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            fields : []

        },


        /* =============================================
           RULE ATTENDANCE
           SKELETON
        ============================================= */

        {

            id :

                "attendance",


            title :

                "📅 Rule Attendance",


            description :

                "Aturan masuk, telat, izin dan lembur.",


            addLabel :

                "＋ Tambah",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            fields : []

        }

    ]

};
