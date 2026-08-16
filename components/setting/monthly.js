/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Monthly
   File         : monthly.js
   Version      : 1.0.0

   Description :
   Payroll Monthly Setting Definition

   Structure :
   - Rule Periode
   - Rule Gaji
   - Rule Attendance

   Principle :
   - Periode Aktif berlaku untuk seluruh rule
   - Rule ditentukan berdasarkan nama
   - Tidak semua field bebas diubah
   - Field waktu mengikuti jenis rule
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


            fields : [

                /* -----------------------------------------
                   NAMA RULE
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

                    value :

                        "bulanan",

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
                   
                   Disimpan sebagai nilai_start
                   agar tetap mengikuti struktur
                   payroll_monthly_rules.
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


            addLabel :

                "＋ Tambah",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


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

                        /* GAJI */

                        {

                            value :

                                "gaji",

                            label :

                                "Gaji"

                        },

                        /* TAMBAHAN */

                        {

                            value :

                                "uang_makan",

                            label :

                                "Uang Makan"

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

                        /* POTONGAN */

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


                /* -----------------------------------------
                   KONDISI
                ----------------------------------------- */

                {

                    name :

                        "kondisi",

                    label :

                        "Kondisi",

                    type :

                        "select",

                    required :

                        true,

                    options : [

                        "gaji_pokok",

                        "masuk",

                        "lembur",

                        "masuk,lembur",

                        "lembur_harian",

                        "periode",

                        "telat",

                        "izin_telat",

                        "izin_pulang",

                        "absen"

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

                        "bulanan",

                        "harian",

                        "jam",

                        "gaji",

                        "menit"

                    ]

                },


                /* -----------------------------------------
                   NOMINAL
                ----------------------------------------- */

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

                },


                /* -----------------------------------------
                   NILAI START
                ----------------------------------------- */

                {

                    name :

                        "nilai_start",

                    label :

                        "Nilai Mulai",

                    type :

                        "number",

                    min :

                        0,

                    step :

                        1,

                    placeholder :

                        "Opsional"

                },


                /* -----------------------------------------
                   NILAI END
                ----------------------------------------- */

                {

                    name :

                        "nilai_end",

                    label :

                        "Nilai Sampai",

                    type :

                        "number",

                    min :

                        0,

                    step :

                        1,

                    placeholder :

                        "Opsional"

                },


                /* -----------------------------------------
                   PERIODE AKTIF
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


            normalize :

                data => ({

                    type_rule :

                        getSalaryRuleType(

                            data.nama

                        ),

                    ...data

                })

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


            addLabel :

                "＋ Tambah",


            formAddLabel :

                "＋ Tambahkan",


            deleteLabel :

                "Hapus",


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

                                "masuk",

                            label :

                                "Masuk"

                        },

                        {

                            value :

                                "sakit",

                            label :

                                "Sakit"

                        },

                        {

                            value :

                                "cuti",

                            label :

                                "Cuti"

                        },

                        {

                            value :

                                "absen",

                            label :

                                "Absen"

                        },

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

                                "lembur_jam",

                            label :

                                "Lembur Jam"

                        }

                    ]

                },


                /* -----------------------------------------
                   KONDISI
                ----------------------------------------- */

                {

                    name :

                        "kondisi",

                    label :

                        "Kondisi",

                    type :

                        "select",

                    required :

                        true,

                    options : [

                        {

                            value :

                                "masuk",

                            label :

                                "Masuk"

                        },

                        {

                            value :

                                "libur",

                            label :

                                "Libur"

                        },

                        {

                            value :

                                "absen",

                            label :

                                "Absen"

                        }

                    ]

                },


                /* -----------------------------------------
                   WAKTU
                   
                   Nilainya akan disesuaikan dengan
                   nama rule.
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

                                "menit",

                            label :

                                "Menit"

                        },

                        {

                            value :

                                "jam",

                            label :

                                "Jam"

                        },

                        {

                            value :

                                "harian",

                            label :

                                "Harian"

                        }

                    ]

                },


                /* -----------------------------------------
                   HARI MASUK
                   
                   Hanya digunakan untuk rule "masuk".
                ----------------------------------------- */

                {

                    name :

                        "hari_masuk",

                    label :

                        "Hari Masuk Normal",

                    type :

                        "text",

                    placeholder :

                        "Senin, Selasa, Rabu, Kamis, Jumat",

                    dependsOn : {

                        field :

                            "nama",

                        value :

                            "masuk"

                    }

                },


                /* -----------------------------------------
                   NILAI START
                ----------------------------------------- */

                {

                    name :

                        "nilai_start",

                    label :

                        "Nilai Mulai",

                    type :

                        "number",

                    min :

                        0,

                    step :

                        1

                },


                /* -----------------------------------------
                   NILAI END
                ----------------------------------------- */

                {

                    name :

                        "nilai_end",

                    label :

                        "Nilai Sampai",

                    type :

                        "number",

                    min :

                        0,

                    step :

                        1

                },


                /* -----------------------------------------
                   NOMINAL
                ----------------------------------------- */

                {

                    name :

                        "nominal",

                    label :

                        "Nominal",

                    type :

                        "number",

                    min :

                        0,

                    step :

                        1

                },


                /* -----------------------------------------
                   PERIODE AKTIF
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


            normalize :

                data => ({

                    type_rule :

                        getAttendanceRuleType(

                            data.nama

                        ),

                    ...data

                })

        }

    ]

};


/* =====================================================
   SALARY RULE TYPE
===================================================== */

function getSalaryRuleType(

    nama

){

    /* ---------------------------------------------
       GAJI
    --------------------------------------------- */

    if(

        nama === "gaji"

    ){

        return "rule_gaji";

    }


    /* ---------------------------------------------
       TAMBAHAN
    --------------------------------------------- */

    const tambah = [

        "uang_makan",

        "lembur",

        "lembur_jam_1",

        "lembur_jam_2",

        "tunjangan",

        "uang_transport"

    ];


    if(

        tambah.includes(

            nama

        )

    ){

        return "rule_tambah";

    }


    /* ---------------------------------------------
       POTONGAN
    --------------------------------------------- */

    return "rule_potong";

}


/* =====================================================
   ATTENDANCE RULE TYPE
===================================================== */

function getAttendanceRuleType(

    nama

){

    /* ---------------------------------------------
       MASUK
    --------------------------------------------- */

    if(

        [

            "masuk",

            "sakit",

            "cuti",

            "absen"

        ].includes(

            nama

        )

    ){

        return "rule_masuk";

    }


    /* ---------------------------------------------
       TELAT
    --------------------------------------------- */

    if(

        [

            "telat",

            "izin_telat"

        ].includes(

            nama

        )

    ){

        return "rule_telat";

    }


    /* ---------------------------------------------
       IZIN
    --------------------------------------------- */

    if(

        nama === "izin_pulang"

    ){

        return "rule_izin";

    }


    /* ---------------------------------------------
       LEMBUR
    --------------------------------------------- */

    if(

        nama === "lembur_jam"

    ){

        return "rule_lembur";

    }


    return "";

}
