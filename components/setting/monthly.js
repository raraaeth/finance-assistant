/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Monthly
   File         : monthly.js
   Version      : 4.1.0

   Description :
   Payroll Monthly Setting Definition

   Modules :
   - Rule Periode
   - Rule Gaji
   - Rule Potong
   - Rule Tambah

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


            addLabel :

                "＋ Tambah Periode",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            uniqueFields : [

                "nilai_start",

                "nilai_end",

                "periode_start",

                "periode_end"

            ],


            autoCloseForm :

                true,


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

                        "Tentukan tanggal awal periode perhitungan gaji. Contoh: 2026-05-25."

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

                        "Tentukan tanggal akhir periode perhitungan gaji. Contoh: 2026-06-24."

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

                        "Tentukan tanggal mulai berlakunya rule payroll. Contoh: 2026-05-25."

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

                        "Tentukan tanggal berakhirnya masa aktif rule payroll. Contoh: 2027-02-24."

                }

            ],


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


            addLabel :

                "＋ Tambah Rule Gaji",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            uniqueFields : [

                "nama"

            ],


            autoCloseForm :

                true,


            fields : [


                /* =========================================
                   NAMA GAJI
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


                    note :

                        "Pilih jenis gaji yang akan digunakan.",


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

                        "Masukkan nominal gaji pokok untuk satu periode gaji."

                }

            ],


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


            addLabel :

                "＋ Tambah Rule Potong",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            uniqueFields : [

                "nama"

            ],


            fields : [


                /* =========================================
                   NAMA RULE POTONG
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


                    note :

                        "Pilih jenis potongan yang ingin digunakan.",


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

                        "Masukkan nominal potongan sesuai rule yang dipilih."

                },


                /* =========================================
                   NILAI START
                   
                   Khusus Telat 1–4.
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


                    dependsOn : {

                        field :

                            "nama",


                        values : [

                            "telat_1",

                            "telat_2",

                            "telat_3",

                            "telat_4"

                        ]

                    },


                    note :

                        "Khusus rule telat. Isi batas awal keterlambatan dalam menit. Contoh: 1."

                },


                /* =========================================
                   NILAI END
                   
                   Khusus Telat 1–4.
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


                    dependsOn : {

                        field :

                            "nama",


                        values : [

                            "telat_1",

                            "telat_2",

                            "telat_3",

                            "telat_4"

                        ]

                    },


                    note :

                        "Khusus rule telat. Isi batas akhir keterlambatan dalam menit. Contoh: 30."

                }

            ],


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
                       VALIDATE TELAT
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

                "Atur tunjangan, uang makan, transport, dan lembur.",


            addLabel :

                "＋ Tambah Rule Tambah",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


            uniqueFields : [

                "nama"

            ],


            autoCloseForm :

                true,


            fields : [


                /* =========================================
                   NAMA RULE TAMBAH
                ========================================= */

                {

                    name :

                        "nama",


                    label :

                        "Nama Rule Tambah",


                    type :

                        "select",


                    placeholder :

                        "Pilih rule tambah",


                    required :

                        true,


                    note :

                        "Pilih jenis tambahan yang ingin dibuat.",


                    options : [


                        /* =================================
                           TAMBAHAN PERIODE
                        ================================= */

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


                        /* =================================
                           UANG MAKAN
                        ================================= */

                        {

                            value :

                                "uang_makan",


                            label :

                                "Uang Makan"

                        },


                        /* =================================
                           LEMBUR HARIAN
                        ================================= */

                        {

                            value :

                                "lembur",


                            label :

                                "Lembur Harian"

                        },


                        /* =================================
                           LEMBUR PER JAM
                        ================================= */

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

                        }

                    ]

                },


                /* =========================================
                   KONDISI UANG MAKAN
                ========================================= */

                {

                    name :

                        "kondisi",


                    label :

                        "Kondisi Uang Makan",


                    type :

                        "select",


                    placeholder :

                        "Pilih kondisi",


                    required :

                        true,


                    dependsOn : {

                        field :

                            "nama",


                        value :

                            "uang_makan"

                    },


                    note :

                        "Masuk + Lembur dihitung harian. Periode dihitung bulanan.",


                    options : [

                        {

                            value :

                                "masuk,lembur",


                            label :

                                "Masuk + Lembur"

                        },


                        {

                            value :

                                "periode",


                            label :

                                "Periode"

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

                        "Nominal Tambahan",


                    type :

                        "number",


                    placeholder :

                        "Contoh: 8000",


                    required :

                        true,


                    min :

                        0,


                    step :

                        1,


                    note :

                        "Masukkan nominal tambahan sesuai rule yang dipilih."

                },


                /* =========================================
                   NILAI START
                   
                   Hanya untuk Lembur Jam 1–8.
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


                    dependsOn : {

                        field :

                            "nama",


                        values : [

                            "lembur_jam_1",

                            "lembur_jam_2",

                            "lembur_jam_3",

                            "lembur_jam_4",

                            "lembur_jam_5",

                            "lembur_jam_6",

                            "lembur_jam_7",

                            "lembur_jam_8"

                        ]

                    },


                    note :

                        "Khusus Lembur Jam. Isi jam awal yang digunakan untuk rule ini. Contoh: 1."

                },


                /* =========================================
                   NILAI END
                   
                   Hanya untuk Lembur Jam 1–8.
                ========================================= */

                {

                    name :

                        "nilai_end",


                    label :

                        "Nilai End",


                    type :

                        "number",


                    placeholder :

                        "Contoh: 8",


                    required :

                        false,


                    min :

                        1,


                    step :

                        1,


                    dependsOn : {

                        field :

                            "nama",


                        values : [

                            "lembur_jam_1",

                            "lembur_jam_2",

                            "lembur_jam_3",

                            "lembur_jam_4",

                            "lembur_jam_5",

                            "lembur_jam_6",

                            "lembur_jam_7",

                            "lembur_jam_8"

                        ]

                    },


                    note :

                        "Khusus Lembur Jam. Isi jam akhir jika rule mencakup beberapa jam. Contoh: 8."

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
                       UANG MAKAN
                    ===================================== */

                    if(

                        nama ===

                        "uang_makan"

                    ){

                        if(

                            data.kondisi ===

                            "masuk,lembur"

                        ){

                            kondisi =

                                "masuk,lembur";


                            waktu =

                                "harian";

                        }

                        else if(

                            data.kondisi ===

                            "periode"

                        ){

                            kondisi =

                                "periode";


                            waktu =

                                "bulanan";

                        }

                        else{

                            alert(

                                "Kondisi Uang Makan wajib dipilih."

                            );


                            return null;

                        }

                    }


                    /* =====================================
                       LEMBUR HARIAN
                    ===================================== */

                    else if(

                        nama ===

                        "lembur"

                    ){

                        kondisi =

                            "lembur_harian";


                        waktu =

                            "harian";

                    }


                    /* =====================================
                       LEMBUR PER JAM
                    ===================================== */

                    else if(

                        nama ===

                            "lembur_jam_1"

                        ||

                        nama ===

                            "lembur_jam_2"

                        ||

                        nama ===

                            "lembur_jam_3"

                        ||

                        nama ===

                            "lembur_jam_4"

                        ||

                        nama ===

                            "lembur_jam_5"

                        ||

                        nama ===

                            "lembur_jam_6"

                        ||

                        nama ===

                            "lembur_jam_7"

                        ||

                        nama ===

                            "lembur_jam_8"

                    ){

                        kondisi =

                            "masuk,lembur";


                        waktu =

                            "jam";


                        /* =================================
                           VALIDATE RANGE
                        ================================= */

                        if(

                            data.nilai_start === ""

                            &&

                            data.nilai_end !== ""

                        ){

                            alert(

                                "Nilai Start harus diisi jika Nilai End diisi."

                            );


                            return null;

                        }


                        if(

                            data.nilai_start !== ""

                            &&

                            data.nilai_end !== ""

                            &&

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
                       TUNJANGAN
                       UANG TRANSPORT
                    ===================================== */

                    else if(

                        nama ===

                            "tunjangan"

                        ||

                        nama ===

                            "uang_transport"

                    ){

                        kondisi =

                            "periode";


                        waktu =

                            "gaji";

                    }


                    /* =====================================
                       RETURN
                    ===================================== */

                    return {

                        type_rule :

                            "rule_tambah",


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

    ]

};
