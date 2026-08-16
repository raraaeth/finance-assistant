/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Monthly
   File         : monthly.js
   Version      : 2.0.0

   Description :
   Payroll Monthly Setting Definition

   Rule Periode :
   - UI hanya menampilkan 4 tanggal
   - Data internal otomatis:
       type_rule      = rule_periode
       nama           = gaji
       kondisi        = gaji_pokok
       waktu          = bulanan

   Periode Perhitungan Gaji :
   - nilai_start
   - nilai_end

   Periode Aktif Gaji :
   - periode_start
   - periode_end
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
           RULE PERIODE
        ============================================= */

        {

            id :

                "rule_periode",


            title :

                "📅 Periode Gaji",


            description :

                "Tentukan periode perhitungan dan masa aktif rule gaji.",


            /* =========================================
               BUTTON
            ========================================= */

            addLabel :

                "＋ Tambah Periode",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            /* =========================================
               UNIQUE
               
               Satu kombinasi periode yang sama
               tidak boleh dimasukkan dua kali.
            ========================================= */

            uniqueFields : [

                "nilai_start",

                "nilai_end",

                "periode_start",

                "periode_end"

            ],


            /* =========================================
               FIELDS
            ========================================= */

            fields : [

                /* =====================================
                   PERIODE PERHITUNGAN GAJI
                ===================================== */

                {

                    name :

                        "nilai_start",


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

                        "nilai_end",


                    label :

                        "Tentukan periode tanggal perhitungan gaji berakhir",


                    type :

                        "date",


                    required :

                        true,


                    note :

                        "Contoh tanggal: 2026-06-24"

                },


                /* =====================================
                   PERIODE AKTIF GAJI
                ===================================== */

                {

                    name :

                        "periode_start",


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

                        "periode_end",


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
               NORMALIZE
               
               UI hanya mengisi 4 tanggal.
               
               Data rule lengkap dibuat otomatis
               di sini.
            ========================================= */

            normalize :

                function(

                    data

                ){

                    return {

                        type_rule :

                            "rule_periode",


                        nama :

                            "gaji",


                        kondisi :

                            "gaji_pokok",


                        waktu :

                            "bulanan",


                        nilai_start :

                            data.nilai_start,


                        nilai_end :

                            data.nilai_end,


                        periode_start :

                            data.periode_start,


                        periode_end :

                            data.periode_end

                    };

                }

        },


        /* =============================================
           RULE GAJI
           
           Skeleton sementara.
           Kita isi bertahap setelah Rule Periode
           benar-benar selesai.
        ============================================= */

        {

            id :

                "rule_gaji",


            title :

                "💰 Rule Gaji",


            description :

                "Atur komponen gaji dan aturan pembayaran.",


            addLabel :

                "＋ Tambah Rule Gaji",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            fields : []

        },


        /* =============================================
           RULE POTONG
           
           Skeleton
        ============================================= */

        {

            id :

                "rule_potong",


            title :

                "➖ Rule Potong",


            description :

                "Atur aturan pemotongan gaji.",


            addLabel :

                "＋ Tambah Rule Potong",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            fields : []

        },


        /* =============================================
           RULE TAMBAH
           
           Skeleton
        ============================================= */

        {

            id :

                "rule_tambah",


            title :

                "➕ Rule Tambah",


            description :

                "Atur tunjangan dan tambahan penghasilan.",


            addLabel :

                "＋ Tambah Rule Tambah",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            fields : []

        }

    ]

};
