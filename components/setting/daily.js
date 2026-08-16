/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Daily
   File         : daily.js
   Version      : 1.0.0

   Description :
   Payroll Daily Setting Definition

   Modules :
   - Rule Gaji
   - Rule Work
   - Rule Tambah
   - Rule Potong

   Principle :
   User only fills fields that are necessary.
   Internal engine values are generated automatically.

   Payroll Daily :
   - Rule Gaji    : menentukan periode gaji
   - Rule Work    : menentukan penghasilan berdasarkan pekerjaan
   - Rule Tambah  : tambahan berdasarkan hari
   - Rule Potong  : potongan standar periode gaji
===================================================== */


/* =====================================================
   PAYROLL DAILY SETTING
===================================================== */

export const DailySetting = {


    /* =================================================
       HEADER
    ================================================= */

    title :

        "Pengaturan Payroll Daily",


    subtitle :

        "Atur periode, pekerjaan, penambahan, dan potongan payroll daily",


    /* =================================================
       SECTIONS
    ================================================= */

    sections : [


        /* =================================================
           RULE GAJI
        ================================================= */

        {

            id :

                "rule_gaji",


            title :

                "📅 Periode Gaji",


            description :

                "Tentukan periode perhitungan gaji dan masa aktif payroll daily.",


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
               AUTO CLOSE
            ============================================= */

            autoCloseForm :

                true,


            /* =============================================
               FIELDS
            ============================================= */

            fields : [


                /* =========================================
                   PERIODE PERHITUNGAN
                ========================================= */

                {

                    name :

                        "nilai_start",


                    label :

                        "Periode Perhitungan Gaji\nTentukan tanggal mulai periode gaji",


                    type :

                        "date",


                    required :

                        true,


                    note :

                        "Contoh: 2026-01-28"

                },


                {

                    name :

                        "nilai_end",


                    label :

                        "Tentukan tanggal berakhir periode gaji",


                    type :

                        "date",


                    required :

                        true,


                    note :

                        "Contoh: 2026-02-27"

                },


                /* =========================================
                   PERIODE AKTIF
                ========================================= */

                {

                    name :

                        "periode_start",


                    label :

                        "Periode Aktif\nKapan rule payroll ini mulai berlaku",


                    type :

                        "date",


                    required :

                        true,


                    note :

                        "Contoh: 2026-01-28"

                },


                {

                    name :

                        "periode_end",


                    label :

                        "Kapan rule payroll ini berakhir",


                    type :

                        "date",


                    required :

                        true,


                    note :

                        "Contoh: 2027-02-27"

                },


                /* =========================================
                   YEARS
                ========================================= */

                {

                    name :

                        "years",


                    label :

                        "Tahun",


                    type :

                        "number",


                    placeholder :

                        "Contoh: 2026",


                    required :

                        true,


                    min :

                        2000,


                    max :

                        2100,


                    step :

                        1,


                    note :

                        "Masukkan tahun periode payroll. Contoh: 2026."

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


                        grade_1 :

                            "",


                        grade_2 :

                            "",


                        kondisi :

                            "periode",


                        nominal :

                            "",


                        waktu :

                            "bulanan",


                        nilai_start :

                            data.nilai_start,


                        nilai_end :

                            data.nilai_end,


                        periode_start :

                            data.periode_start,


                        periode_end :

                            data.periode_end,


                        years :

                            data.years

                    };

                }

        },


        /* =================================================
           RULE WORK
        ================================================= */

        {

            id :

                "rule_work",


            title :

                "🔧 Rule Work",


            description :

                "Tentukan nominal penghasilan berdasarkan nama pekerjaan dan variasinya.",


            /* =============================================
               BUTTON
            ============================================= */

            addLabel :

                "＋ Tambah Rule Work",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            /* =============================================
               DUPLICATE
            ============================================= */

            uniqueFields : [

                "nama",

                "grade_1",

                "grade_2"

            ],


            /* =============================================
               AUTO CLOSE
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

                        "Nama Pekerjaan",


                    type :

                        "text",


                    placeholder :

                        "Contoh: Baju",


                    required :

                        true,


                    note :

                        "Nama pekerjaan wajib diisi. Contoh: rear, front, headrest."

                },


                /* =========================================
                   GRADE 1
                ========================================= */

                {

                    name :

                        "grade_1",


                    label :

                        "Grade 1",


                    type :

                        "text",


                    placeholder :

                        "Contoh: atasan",


                    required :

                        false,


                    note :

                        "Opsional. Isi jika pekerjaan memiliki variasi pertama."

                },


                /* =========================================
                   GRADE 2
                ========================================= */

                {

                    name :

                        "grade_2",


                    label :

                        "Grade 2",


                    type :

                        "text",


                    placeholder :

                        "Contoh: XL",


                    required :

                        false,


                    note :

                        "Opsional. Isi jika masih terdapat variasi pekerjaan berikutnya."

                },


                /* =========================================
                   NOMINAL
                ========================================= */

                {

                    name :

                        "nominal",


                    label :

                        "Nominal per PCS",


                    type :

                        "number",


                    placeholder :

                        "Contoh: 405",


                    required :

                        true,


                    min :

                        0,


                    step :

                        1,


                    note :

                        "Masukkan nominal yang dibayarkan untuk setiap PCS."

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

                            "rule_work",


                        nama :

                            data.nama,


                        grade_1 :

                            data.grade_1 ?? "",


                        grade_2 :

                            data.grade_2 ?? "",


                        kondisi :

                            "pcs",


                        nominal :

                            data.nominal ?? "",


                        waktu :

                            "harian",


                        nilai_start :

                            "",


                        nilai_end :

                            "",


                        periode_start :

                            "",


                        periode_end :

                            "",


                        years :

                            ""

                    };

                }

        },


        /* =================================================
           RULE TAMBAH
        ================================================= */

        {

            id :

                "rule_tambah",


            title :

                "➕ Rule Tambah",


            description :

                "Atur tambahan penghasilan yang diberikan pada hari tertentu.",


            /* =============================================
               BUTTON
            ============================================= */

            addLabel :

                "＋ Tambah Rule Tambah",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            /* =============================================
               DUPLICATE
            ============================================= */

            uniqueFields : [

                "nama",

                "waktu"

            ],


            /* =============================================
               AUTO CLOSE
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

                        "Nama Tambahan",


                    type :

                        "select",


                    placeholder :

                        "Pilih tambahan",


                    required :

                        true,


                    options : [


                        {

                            value :

                                "uang_makan",


                            label :

                                "Uang Makan",


                            note :

                                "Tambahan uang makan berdasarkan hari yang dipilih."

                        },


                        {

                            value :

                                "uang_transport",


                            label :

                                "Uang Transport",


                            note :

                                "Tambahan uang transport berdasarkan hari yang dipilih."

                        }

                    ]

                },


                /* =========================================
                   HARI
                ========================================= */

                {

                    name :

                        "hari_sabtu",


                    label :

                        "Sabtu",


                    type :

                        "checkbox",


                    required :

                        false,

                   resultValue :

                         "sabtu"

                },


                {

                    name :

                        "hari_minggu",


                    label :

                        "Minggu",


                    type :

                        "checkbox",


                    required :

                        false,

                   resultValue :

                         "minggu"

                },


                {

                    name :

                        "hari_senin",


                    label :

                        "Senin",


                    type :

                        "checkbox",


                    required :

                        false,

                     resultValue :

                        "senin"

                },


                {

                    name :

                        "hari_selasa",


                    label :

                        "Selasa",


                    type :

                        "checkbox",


                    required :

                        false,

                     resultValue :
                        
                        "Selasa"

                },


                {

                    name :

                        "hari_rabu",


                    label :

                        "Rabu",


                    type :

                        "checkbox",


                    required :

                        false,

                     resultValue :
                        
                        "Rabu"

                },


                {

                    name :

                        "hari_kamis",


                    label :

                        "Kamis",


                    type :

                        "checkbox",


                    required :

                        false,

                     resultValue :
                        
                        "Kamis"

                },


                {

                    name :

                        "hari_jumat",


                    label :

                        "Jumat",


                    type :

                        "checkbox",


                    required :

                        false,

                     resultValue :
                        
                        "Jumat"

                },


                /* =========================================
                   NOMINAL
                ========================================= */

                {

                    name :

                        "nominal",


                    label :

                        "Nominal Tambahan",


                    type :

                        "number",


                    placeholder :

                        "Contoh: 10000",


                    required :

                        true,


                    min :

                        0,


                    step :

                        1,


                    note :

                        "Masukkan nominal tambahan yang diberikan pada hari yang dipilih."

                }

            ],


            /* =============================================
               NORMALIZE
            ============================================= */

            normalize :

                function(

                    data

                ){

                    const days = [];


                    /* =====================================
                       DAY ORDER
                    ===================================== */

                    if(

                        data.hari_senin

                    ){

                        days.push(

                            "senin"

                        );

                    }


                    if(

                        data.hari_selasa

                    ){

                        days.push(

                            "selasa"

                        );

                    }


                    if(

                        data.hari_rabu

                    ){

                        days.push(

                            "rabu"

                        );

                    }


                    if(

                        data.hari_kamis

                    ){

                        days.push(

                            "kamis"

                        );

                    }


                    if(

                        data.hari_jumat

                    ){

                        days.push(

                            "jumat"

                        );

                    }


                    if(

                        data.hari_sabtu

                    ){

                        days.push(

                            "sabtu"

                        );

                    }


                    if(

                        data.hari_minggu

                    ){

                        days.push(

                            "minggu"

                        );

                    }


                    /* =====================================
                       VALIDATE DAY
                    ===================================== */

                    if(

                        days.length === 0

                    ){

                        alert(

                            "Pilih minimal satu hari untuk rule tambah."

                        );


                        return null;

                    }


                    return {

                        type_rule :

                            "rule_tambah",


                        nama :

                            data.nama,


                        grade_1 :

                            "",


                        grade_2 :

                            "",


                        kondisi :

                            "masuk",


                        nominal :

                            data.nominal ?? "",


                        waktu :

                            days.join(

                                ","

                            ),


                        nilai_start :

                            "",


                        nilai_end :

                            "",


                        periode_start :

                            "",


                        periode_end :

                            "",


                        years :

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

                "Atur potongan standar yang mengikuti periode gaji.",


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
               AUTO CLOSE
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

                        "Nama Rule Potong",


                    type :

                        "select",


                    placeholder :

                        "Pilih rule potong",


                    required :

                        true,


                    options : [


                        {

                            value :

                                "bpjs",


                            label :

                                "BPJS",


                            note :

                                "Potongan BPJS tetap untuk setiap periode gaji."

                        },


                        {

                            value :

                                "jamsostek",


                            label :

                                "Jamsostek",


                            note :

                                "Potongan Jamsostek untuk setiap periode gaji."

                        },


                        {

                            value :

                                "tabungan",


                            label :

                                "Tabungan",


                            note :

                                "Potongan tabungan untuk setiap periode gaji."

                        },


                        {

                            value :

                                "koperasi",


                            label :

                                "Koperasi",


                            note :

                                "Potongan koperasi untuk setiap periode gaji."

                        },


                        {

                            value :

                                "lain-lain",


                            label :

                                "Lain-lain",


                            note :

                                "Potongan lain yang mengikuti periode gaji."

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

                        "Contoh: 50000",


                    required :

                        true,


                    min :

                        0,


                    step :

                        1,


                    note :

                        "Masukkan nominal potongan sesuai rule yang dipilih."

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

                            "rule_potong",


                        nama :

                            data.nama,


                        grade_1 :

                            "",


                        grade_2 :

                            "",


                        kondisi :

                            "periode_gaji",


                        nominal :

                            data.nominal ?? "",


                        waktu :

                            "bulanan",


                        nilai_start :

                            "",


                        nilai_end :

                            "",


                        periode_start :

                            "",


                        periode_end :

                            "",


                        years :

                            ""

                    };

                }

        }

    ]

};
