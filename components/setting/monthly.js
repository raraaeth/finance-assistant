/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Monthly
   File         : monthly.js
   Version      : 3.0.0

   Description :
   Payroll Monthly Setting Definition

   Modules :
   - Rule Periode
   - Rule Gaji
   - Rule Potong
   - Rule Tambah

   Current Development :
   - Rule Periode : active
   - Rule Gaji    : active
   - Rule Potong  : skeleton
   - Rule Tambah  : skeleton

   Principle :
   User only fills fields that are necessary.
   Internal engine values are generated automatically.
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


        /* =================================================
           RULE PERIODE
        ================================================= */

        {

            id :

                "rule_periode",


            title :

                "📅 Periode Gaji",


            description :

                "Tentukan periode perhitungan dan masa aktif gaji.",


            /* =============================================
               BUTTON
            ============================================= */

            addLabel :

                "＋ Tambah Periode",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            /* =============================================
               DUPLICATE
            ============================================= */

            uniqueFields : [

                "nilai_start",

                "nilai_end",

                "periode_start",

                "periode_end"

            ],


            /* =============================================
               AUTO CLOSE FORM
            ============================================= */

            autoCloseForm :

                true,


            /* =============================================
               FIELDS
            ============================================= */

            fields : [


                /* =========================================
                   PERIODE PERHITUNGAN GAJI
                ========================================= */

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


                /* =========================================
                   PERIODE AKTIF GAJI
                ========================================= */

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


            /* =============================================
               NORMALIZE
            ============================================= */

            normalize :

                function(

                    data

                ){

                    return {

                        type_rule :

                            "rule_periode",


                        nama :

                            "periode_gaji",


                        kondisi :

                            "periode",


                        waktu :

                            "bulanan",


                        nominal :

                            "",


                        nilai_start :

                            data.nilai_start,


                        nilai_end :

                            data.nilai_end,


                        berlaku_start :

                            data.periode_start,


                        berlaku_end :

                            data.periode_end

                    };

                }

        },


        /* =================================================
           RULE GAJI
        ================================================= */

        {

            id :

                "rule_gaji",


            title :

                "💰 Rule Gaji",


            description :

                "Tentukan gaji pokok yang digunakan dalam perhitungan payroll.",


            /* =============================================
               BUTTON
            ============================================= */

            addLabel :

                "＋ Tambah Rule Gaji",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            /* =============================================
               DUPLICATE
            ============================================= */

            uniqueFields : [

                "nama"

            ],


            /* =============================================
               AUTO CLOSE FORM
            ============================================= */

            autoCloseForm :

                true,


            /* =============================================
               FIELDS
            ============================================= */

            fields : [


                /* =========================================
                   NAMA
                ========================================= */

                {

                    name :

                        "nama",


                    label :

                        "Nama Gaji",


                    type :

                        "select",


                    placeholder :

                        "Pilih gaji",


                    required :

                        true,


                    options : [

                        {

                            value :

                                "gaji",


                            label :

                                "Gaji Pokok"

                        }

                    ]

                },


                /* =========================================
                   NOMINAL
                ========================================= */

                {

                    name :

                        "nominal",


                    label :

                        "Nominal Gaji Pokok",


                    type :

                        "number",


                    placeholder :

                        "Contoh: 5157500",


                    required :

                        true,


                    min :

                        0,


                    step :

                        1,


                    note :

                        "Masukkan nominal gaji pokok per periode gaji."

                }

            ],


            /* =============================================
               NORMALIZE
            ============================================= */

            normalize :

                function(

                    data

                ){

                    return {

                        type_rule :

                            "rule_gaji",


                        nama :

                            "gaji",


                        kondisi :

                            "gaji_pokok",


                        waktu :

                            "bulanan",


                        nominal :

                            data.nominal,


                        nilai_start :

                            "",


                        nilai_end :

                            "",


                        berlaku_start :

                            "",


                        berlaku_end :

                            ""

                    };

                }

        },


/* =================================================
   RULE POTONG
================================================= */

{

    id :

        "rule_potong",


    title :

        "➖ Rule Potong",


    description :

        "Atur aturan pemotongan gaji dan attendance.",


    /* =============================================
       BUTTON
    ============================================= */

    addLabel :

        "＋ Tambah Rule Potong",


    formAddLabel :

        "＋ Tambahkan",


    deleteLabel :

        "Hapus",


    /* =============================================
       DUPLICATE
    ============================================= */

    uniqueFields : [

        "nama"

    ],


    /* =============================================
       FIELDS
    ============================================= */

    fields : [


        /* =========================================
           NAMA RULE
        ========================================= */

        {

            name :

                "nama",


            label :

                "Nama Rule Potong",


            type :

                "select",


            placeholder :

                "Pilih rule potong",


            required :

                true,


            options : [

                /* =================================
                   POTONGAN PERIODE
                ================================= */

                {

                    value :

                        "BPJS",

                    label :

                        "BPJS"

                },

                {

                    value :

                        "tabungan",

                    label :

                        "Tabungan"

                },

                {

                    value :

                        "Jamsostek",

                    label :

                        "Jamsostek"

                },

                {

                    value :

                        "koperasi",

                    label :

                        "Koperasi"

                },

                {

                    value :

                        "lain-lain",

                    label :

                        "Lain-lain"

                },


                /* =================================
                   POTONGAN TELAT
                ================================= */

                {

                    value :

                        "telat_1",

                    label :

                        "Telat 1"

                },

                {

                    value :

                        "telat_2",

                    label :

                        "Telat 2"

                },

                {

                    value :

                        "telat_3",

                    label :

                        "Telat 3"

                },

                {

                    value :

                        "telat_4",

                    label :

                        "Telat 4"

                },


                /* =================================
                   POTONGAN ATTENDANCE
                ================================= */

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


        /* =========================================
           NOMINAL
        ========================================= */

        {

            name :

                "nominal",


            label :

                "Nominal Potongan",


            type :

                "number",


            placeholder :

                "Contoh: 40000",


            required :

                true,


            min :

                0,


            step :

                1,


            note :

                "Masukkan nominal potongan."

        },


        /* =========================================
           NILAI START
           
           Dipakai khusus untuk Telat 1–4.
        ========================================= */

        {

            name :

                "nilai_start",


            label :

                "Nilai Start",


            type :

                "number",


            placeholder :

                "Contoh: 1",


            required :

                false,


            min :

                1,


            step :

                1,


            note :

                "Khusus rule telat. Isi batas awal dalam menit. Contoh: 1."

        },


        /* =========================================
           NILAI END
           
           Dipakai khusus untuk Telat 1–4.
        ========================================= */

        {

            name :

                "nilai_end",


            label :

                "Nilai End",


            type :

                "number",


            placeholder :

                "Contoh: 30",


            required :

                false,


            min :

                1,


            step :

                1,


            note :

                "Khusus rule telat. Isi batas akhir dalam menit. Contoh: 30."

        }

    ],


    /* =============================================
       NORMALIZE
    ============================================= */

    normalize :

        function(

            data

        ){

            const nama =

                data.nama;


            let kondisi =

                "periode";


            let waktu =

                "gaji";


            /* =====================================
               TELAT
            ===================================== */

            if(

                nama === "telat_1" ||

                nama === "telat_2" ||

                nama === "telat_3" ||

                nama === "telat_4"

            ){

                kondisi =

                    "telat";


                waktu =

                    "menit";

            }


            /* =====================================
               IZIN TELAT
            ===================================== */

            else if(

                nama === "izin_telat"

            ){

                kondisi =

                    "izin_telat";


                waktu =

                    "jam";

            }


            /* =====================================
               IZIN PULANG
            ===================================== */

            else if(

                nama === "izin_pulang"

            ){

                kondisi =

                    "izin_pulang";


                waktu =

                    "jam";

            }


            /* =====================================
               ABSEN
            ===================================== */

            else if(

                nama === "absen"

            ){

                kondisi =

                    "absen";


                waktu =

                    "harian";

            }


            /* =====================================
               VALIDATE RANGE TELAT
            ===================================== */

            if(

                nama === "telat_1" ||

                nama === "telat_2" ||

                nama === "telat_3" ||

                nama === "telat_4"

            ){

                if(

                    data.nilai_start === "" ||

                    data.nilai_end === ""

                ){

                    alert(

                        "Rule telat wajib memiliki Nilai Start dan Nilai End."

                    );


                    return null;

                }


                if(

                    Number(

                        data.nilai_start

                    )

                    >

                    Number(

                        data.nilai_end

                    )

                ){

                    alert(

                        "Nilai Start tidak boleh lebih besar dari Nilai End."

                    );


                    return null;

                }

            }


            /* =====================================
               RETURN
            ===================================== */

            return {

                type_rule :

                    "rule_potong",


                nama :

                    nama,


                kondisi :

                    kondisi,


                waktu :

                    waktu,


                nominal :

                    data.nominal ?? "",


                nilai_start :

                    data.nilai_start ?? "",


                nilai_end :

                    data.nilai_end ?? "",


                berlaku_start :

                    "",


                berlaku_end :

                    ""

            };

        }

}


        /* =================================================
           RULE TAMBAH
        ================================================= */

        {

            id :

                "rule_tambah",


            title :

                "➕ Rule Tambah",


            description :

                "Atur tunjangan, uang makan, transport, dan lembur.",


            addLabel :

                "＋ Tambah Rule Tambah",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            autoCloseForm :

                true,


            fields : []

        }

    ]

};
