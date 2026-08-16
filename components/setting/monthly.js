/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Monthly
   File         : monthly.js
   Version      : 2.0.0

   Description :
   Payroll Monthly Setting Definition

   Fokus tahap ini :
   - Rule Periode

   Prinsip :
   - Periode gaji disimpan sebagai tanggal lengkap
   - Tidak menggunakan angka tanggal seperti 25 / 24
   - Format tanggal :
     YYYY-MM-DD

   Contoh :
   nilai_start :
   2026-05-25

   nilai_end :
   2026-06-24

   Catatan :
   Period Engine tetap menerima start dan end.
   Tanggal periode dihitung langsung dari data
   yang disimpan pada rule.

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

                "Tentukan tanggal periode perhitungan gaji dan masa aktif rule.",


            /* =========================================
               BUTTON
            ========================================= */

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
                   NILAI START
                ------------------------------------- */

                {

                    name :

                        "nilai_start",


                    label :

                        "Tentukan periode tanggal perhitungan gaji dimulai",


                    type :

                        "text",


                    placeholder :

                        "Contoh: 2026-05-25",


                    required :

                        true

                },


                /* -------------------------------------
                   NILAI END
                ------------------------------------- */

                {

                    name :

                        "nilai_end",


                    label :

                        "Tentukan periode tanggal perhitungan gaji berakhir",


                    type :

                        "text",


                    placeholder :

                        "Contoh: 2026-06-24",


                    required :

                        true

                },


                /* -------------------------------------
                   BERLAKU START
                ------------------------------------- */

                {

                    name :

                        "berlaku_start",


                    label :

                        "Kapan Periode Aktif gaji ini dimulai",


                    type :

                        "text",


                    placeholder :

                        "Contoh: 2026-05-25",


                    required :

                        true

                },


                /* -------------------------------------
                   BERLAKU END
                ------------------------------------- */

                {

                    name :

                        "berlaku_end",


                    label :

                        "Kapan Periode Aktif gaji ini diakhiri",


                    type :

                        "text",


                    placeholder :

                        "Contoh: 2026-06-24",


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
