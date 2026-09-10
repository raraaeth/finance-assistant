/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Monthly
   File         : monthly.js
   Version      : 4.4.0

   Description :
   Payroll Monthly Setting Definition

   Modules :
   - Rule Periode
   - Rule Gaji
   - Rule Potong
   - Rule Tambah
   - Rule Attendance

   Principle :
   - Google Sheets / Payroll Engine = source of truth
   - Rule Periode adalah master periode
   - Active period diwariskan ke Rule Gaji / Tambah / Potong
   - Lock rule dibaca dari Payroll Shared Engine
   - DOM result bukan source of truth
   - History rule lama tetap dipertahankan
   - Rule Attendance bukan rule manual payroll
   - Attendance rule dibuat otomatis oleh Payroll Engine
===================================================== */


/* =====================================================
   IMPORT PAYROLL ENGINE
===================================================== */

import {
    Payroll
} from "./payroll.js";


/* =====================================================
   CONSTANT
===================================================== */

const PAYROLL_MODE =
    "payroll-monthly";


/* =====================================================
   MONTH OPTIONS
===================================================== */

const MONTH_OPTIONS = [

    {
        value :
            "01",
        label :
            "Januari"
    },

    {
        value :
            "02",
        label :
            "Februari"
    },

    {
        value :
            "03",
        label :
            "Maret"
    },

    {
        value :
            "04",
        label :
            "April"
    },

    {
        value :
            "05",
        label :
            "Mei"
    },

    {
        value :
            "06",
        label :
            "Juni"
    },

    {
        value :
            "07",
        label :
            "Juli"
    },

    {
        value :
            "08",
        label :
            "Agustus"
    },

    {
        value :
            "09",
        label :
            "September"
    },

    {
        value :
            "10",
        label :
            "Oktober"
    },

    {
        value :
            "11",
        label :
            "November"
    },

    {
        value :
            "12",
        label :
            "Desember"
    }

];


/* =====================================================
   YEAR OPTIONS
===================================================== */

const CURRENT_YEAR =
    new Date().getFullYear();

const YEAR_OPTIONS =
    Array.from(
        {
            length :
                18
        },
        (
            _,
            index
        ) => {

            const year =
                CURRENT_YEAR -
                2 +
                index;

            return {
                value :
                    String(
                        year
                    ),
                label :
                    String(
                        year
                    )
            };

        }
    );


/* =====================================================
   MONTH YEAR OPTIONS
===================================================== */

const MONTH_YEAR_OPTIONS = [];

YEAR_OPTIONS.forEach(
    year => {

        MONTH_OPTIONS.forEach(
            month => {

                MONTH_YEAR_OPTIONS.push({

                    value :
                        `${year.value}-${month.value}`,

                    label :
                        `${month.label} ${year.label}`

                });

            }
        );

    }
);


/* =====================================================
   CREATE ISO DATE
===================================================== */

function createISODate(
    year,
    month,
    day
){

    const y =
        Number(
            year
        );

    const m =
        Number(
            month
        );

    const d =
        Number(
            day
        );

    if(
        !Number.isInteger(y) ||
        !Number.isInteger(m) ||
        !Number.isInteger(d)
    ){

        return "";

    }


    if(
        m < 1 ||
        m > 12 ||
        d < 1 ||
        d > 31
    ){

        return "";

    }


    const date =
        new Date(
            Date.UTC(
                y,
                m - 1,
                d
            )
        );


    if(
        date.getUTCFullYear() !== y ||
        date.getUTCMonth() !== m - 1 ||
        date.getUTCDate() !== d
    ){

        return "";

    }


    return [
        String(y),
        String(m).padStart(
            2,
            "0"
        ),
        String(d).padStart(
            2,
            "0"
        )
    ].join("-");

}


/* =====================================================
   PARSE MONTH YEAR
===================================================== */

function parseMonthYear(
    value
){

    const normalized =
        String(
            value ??
            ""
        ).trim();


    const match =
        normalized.match(
            /^(\d{4})-(\d{2})$/
        );


    if(
        !match
    ){

        return null;

    }


    return {

        year :
            Number(
                match[1]
            ),

        month :
            Number(
                match[2]
            )

    };

}


/* =====================================================
   NEXT MONTH
===================================================== */

function getNextMonth(
    year,
    month
){

    let nextYear =
        Number(
            year
        );

    let nextMonth =
        Number(
            month
        ) + 1;


    if(
        nextMonth >
        12
    ){

        nextMonth =
            1;

        nextYear +=
            1;

    }


    return {

        year :
            nextYear,

        month :
            nextMonth

    };

}


/* =====================================================
   GET DAY NUMBER
===================================================== */

function getDayNumber(
    value
){

    const normalized =
        String(
            value ??
            ""
        ).trim();


    if(
        normalized === ""
    ){

        return null;

    }


    const number =
        Number(
            normalized
        );


    if(
        !Number.isInteger(
            number
        )
    ){

        return null;

    }


    if(
        number < 1 ||
        number > 31
    ){

        return null;

    }


    return number;

}


/* =====================================================
   GET ACTIVE PERIOD
===================================================== */

/*
   Active period selalu dibaca dari Payroll Engine.

   Payroll Engine:
   - membaca Google Sheets
   - menentukan active period
   - mengelola newPeriodMode

   monthly.js hanya menggunakan hasilnya.
*/

async function getActivePeriod(){

    try{

        return await Payroll
            .getExistingPeriod(
                PAYROLL_MODE
            );

    }
    catch(
        error
    ){

        console.error(
            "Payroll Monthly: gagal membaca active period.",
            error
        );

        return null;

    }

}


/* =====================================================
   PREPARE RULE WITH ACTIVE PERIOD
===================================================== */

/*
   Semua Rule Gaji / Tambah / Potong
   menggunakan active period dari Payroll Engine.

   Ketika newPeriodMode aktif,
   Payroll Engine sengaja tidak mewariskan
   periode lama.
*/

function preparePayrollRule(
    rule
){

    return Payroll
        .prepareRule(
            PAYROLL_MODE,
            rule
        );

}


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
       SHARED RULE STATE
    ================================================= */

    /*
       Global Setting Controller dapat mengambil
       state dari Payroll Engine.

       Source :
       Google Sheets → Payroll Engine
    */

    getRuleState :
        async function(
            {
                sectionId
            } = {}
        ){

            return Payroll
                .getRuleState({

                    mode :
                        PAYROLL_MODE,

                    sectionId :
                        sectionId ?? ""

                });

        },


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


            /*
               Rule Periode adalah master.

               UI note, lock, dan tombol
               Tambah Periode ditangani oleh
               Payroll.applyPeriodUI().
            */

            getRuleState :
                async function(){

                    return Payroll
                        .getRuleState({

                            mode :
                                PAYROLL_MODE,

                            sectionId :
                                "rule_periode"

                        });

                },


            fields : [

                /* =========================================
                   TANGGAL AWAL PERIODE PERHITUNGAN
                ========================================= */

                {

                    name :
                        "nilai_start_day",

                    label :
                        "Tanggal Awal Periode Perhitungan\nTentukan tanggal awal periode perhitungan gaji",

                    type :
                        "number",

                    placeholder :
                        "Contoh: 25",

                    required :
                        true,

                    min :
                        1,

                    max :
                        31,

                    step :
                        1,

                    note :
                        "Masukkan tanggal saja. Contoh: 25."

                },


                /* =========================================
                   TANGGAL AKHIR PERIODE PERHITUNGAN
                ========================================= */

                {

                    name :
                        "nilai_end_day",

                    label :
                        "Tanggal Akhir Periode Perhitungan\nTentukan tanggal akhir periode perhitungan gaji",

                    type :
                        "number",

                    placeholder :
                        "Contoh: 24",

                    required :
                        true,

                    min :
                        1,

                    max :
                        31,

                    step :
                        1,

                    note :
                        "Masukkan tanggal saja. Contoh: 24."

                },


                /* =========================================
                   BULAN / TAHUN AWAL MASA AKTIF
                ========================================= */

                {

                    name :
                        "periode_start_month",

                    label :
                        "Masa Aktif Gaji\nTentukan bulan dan tahun mulai berlakunya rule payroll",

                    type :
                        "select",

                    placeholder :
                        "Pilih bulan dan tahun",

                    required :
                        true,

                    options :
                        MONTH_YEAR_OPTIONS,

                    note :
                        "Pilih bulan dan tahun mulai masa aktif payroll."

                },


                /* =========================================
                   BULAN / TAHUN AKHIR MASA AKTIF
                ========================================= */

                {

                    name :
                        "periode_end_month",

                    label :
                        "Masa Aktif Gaji\nTentukan bulan dan tahun berakhirnya rule payroll",

                    type :
                        "select",

                    placeholder :
                        "Pilih bulan dan tahun",

                    required :
                        true,

                    options :
                        MONTH_YEAR_OPTIONS,

                    note :
                        "Pilih bulan dan tahun akhir masa aktif payroll."

                }

            ],


            /* =============================================
               NORMALIZE
            ============================================= */

            normalize :
                function(
                    data
                ){

                    const startDay =
                        getDayNumber(
                            data.nilai_start_day
                        );

                    const endDay =
                        getDayNumber(
                            data.nilai_end_day
                        );


                    if(
                        startDay ===
                        null
                    ){

                        alert(
                            "Tanggal awal periode harus diisi antara 1–31."
                        );

                        return null;

                    }


                    if(
                        endDay ===
                        null
                    ){

                        alert(
                            "Tanggal akhir periode harus diisi antara 1–31."
                        );

                        return null;

                    }


                    const start =
                        parseMonthYear(
                            data.periode_start_month
                        );

                    const end =
                        parseMonthYear(
                            data.periode_end_month
                        );


                    if(
                        !start
                    ){

                        alert(
                            "Bulan dan tahun awal masa aktif belum dipilih."
                        );

                        return null;

                    }


                    if(
                        !end
                    ){

                        alert(
                            "Bulan dan tahun akhir masa aktif belum dipilih."
                        );

                        return null;

                    }


                    /*
                       Periode perhitungan:

                       nilai_start =
                       start month + start day

                       nilai_end =
                       satu bulan setelah start month
                       + end day
                    */

                    const next =
                        getNextMonth(
                            start.year,
                            start.month
                        );


                    const nilaiStart =
                        createISODate(
                            start.year,
                            start.month,
                            startDay
                        );


                    const nilaiEnd =
                        createISODate(
                            next.year,
                            next.month,
                            endDay
                        );


                    if(
                        !nilaiStart
                    ){

                        alert(
                            "Tanggal awal periode tidak valid untuk bulan yang dipilih."
                        );

                        return null;

                    }


                    if(
                        !nilaiEnd
                    ){

                        alert(
                            "Tanggal akhir periode tidak valid untuk bulan berikutnya."
                        );

                        return null;

                    }


                    /*
                       Masa aktif:

                       berlaku_start =
                       start month + start day

                       berlaku_end =
                       end month + end day
                    */

                    const berlakuStart =
                        createISODate(
                            start.year,
                            start.month,
                            startDay
                        );


                    const berlakuEnd =
                        createISODate(
                            end.year,
                            end.month,
                            endDay
                        );


                    if(
                        !berlakuStart ||
                        !berlakuEnd
                    ){

                        alert(
                            "Masa aktif tidak valid untuk bulan yang dipilih."
                        );

                        return null;

                    }


                    if(
                        berlakuEnd <
                        berlakuStart
                    ){

                        alert(
                            "Masa aktif akhir tidak boleh sebelum masa aktif awal."
                        );

                        return null;

                    }


                    const rule = {

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
                            nilaiStart,

                        nilai_end :
                            nilaiEnd,

                        berlaku_start :
                            berlakuStart,

                        berlaku_end :
                            berlakuEnd

                    };


                    /*
                       Payroll Engine akan melakukan
                       validasi period final kembali
                       ketika prepareSave().
                    */

                    return rule;

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


            /*
               Rule Gaji dikunci oleh Payroll Engine
               apabila Rule Gaji untuk active period
               sudah ada di Sheet.
            */

            getRuleState :
                async function(){

                    return Payroll
                        .getRuleState({

                            mode :
                                PAYROLL_MODE,

                            sectionId :
                                "rule_gaji"

                        });

                },


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

                    options : [

                        {

                            value :
                                "gaji",

                            label :
                                "Gaji Pokok"

                        }

                    ],

                    note :
                        "Pilih jenis gaji yang akan digunakan."

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

                    const rule = {

                        type_rule :
                            "rule_gaji",

                        nama :
                            "gaji",

                        kondisi :
                            "gaji_pokok",

                        waktu :
                            "bulanan",

                        nominal :
                            data.nominal ??
                            "",

                        nilai_start :
                            "",

                        nilai_end :
                            "",

                        berlaku_start :
                            "",

                        berlaku_end :
                            ""

                    };


                    /*
                       Active period tidak diambil
                       dari DOM.

                       Payroll Engine yang akan
                       memasang active period.
                    */

                    return preparePayrollRule(
                        rule
                    );

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

            autoCloseForm :
                true,


            getRuleState :
                async function(){

                    return Payroll
                        .getRuleState({

                            mode :
                                PAYROLL_MODE,

                            sectionId :
                                "rule_potong"

                        });

                },


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
                                "Izin Telat",

                            note :
                                "Masukkan nominal potongan per jam."
                        },

                        {
                            value :
                                "izin_pulang",

                            label :
                                "Izin Pulang",

                            note :
                                "Masukkan nominal potongan per jam."
                        },

                        {
                            value :
                                "absen",

                            label :
                                "Absen",

                            note :
                                "Masukkan nominal potongan per hari."
                        }

                    ],

                    note :
                        "Pilih jenis potongan yang ingin digunakan."

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
                        "Khusus rule telat. Isi batas awal keterlambatan dalam menit."

                },


                /* =========================================
                   NILAI END
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
                        "Khusus rule telat. Isi batas akhir keterlambatan dalam menit."

                }

            ],


            normalize :
                function(
                    data
                ){

                    const nama =
                        String(
                            data.nama ??
                            ""
                        ).trim();


                    if(
                        !nama
                    ){

                        alert(
                            "Rule Potong harus dipilih."
                        );

                        return null;

                    }


                    let kondisi =
                        "";

                    let waktu =
                        "";


                    /* =====================================
                       TELAT
                    ===================================== */

                    if(

                        nama ===
                            "telat_1"

                        ||

                        nama ===
                            "telat_2"

                        ||

                        nama ===
                            "telat_3"

                        ||

                        nama ===
                            "telat_4"

                    ){

                        kondisi =
                            "telat";

                        waktu =
                            "menit";


                        if(

                            data.nilai_start ===
                                ""

                            &&

                            data.nilai_end !==
                                ""

                        ){

                            alert(
                                "Nilai Start harus diisi jika Nilai End diisi."
                            );

                            return null;

                        }


                        if(

                            data.nilai_start !==
                                ""

                            &&

                            data.nilai_end !==
                                ""

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
                       IZIN TELAT
                    ===================================== */

                    else if(

                        nama ===
                            "izin_telat"

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

                        nama ===
                            "izin_pulang"

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

                        nama ===
                            "absen"

                    ){

                        kondisi =
                            "absen";

                        waktu =
                            "harian";

                    }


                    /* =====================================
                       POTONGAN PERIODE
                    ===================================== */

                    else{

                        kondisi =
                            "periode";

                        waktu =
                            "gaji";

                    }


                    const rule = {

                        type_rule :
                            "rule_potong",

                        nama :
                            nama,

                        kondisi :
                            kondisi,

                        waktu :
                            waktu,

                        nominal :
                            data.nominal ??
                            "",

                        nilai_start :
                            data.nilai_start ??
                            "",

                        nilai_end :
                            data.nilai_end ??
                            "",

                        berlaku_start :
                            "",

                        berlaku_end :
                            ""

                    };


                    return preparePayrollRule(
                        rule
                    );

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
                "Atur aturan penambahan gaji dan tunjangan.",

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


            getRuleState :
                async function(){

                    return Payroll
                        .getRuleState({

                            mode :
                                PAYROLL_MODE,

                            sectionId :
                                "rule_tambah"

                        });

                },


            fields : [

                /* =========================================
                   NAMA RULE
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

                    options : [

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

                    ],

                    note :
                        "Pilih jenis rule tambahan yang ingin digunakan."

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

                    options : [

                        {

                            value :
                                "masuk,lembur",

                            label :
                                "Masuk / Lembur"

                        },

                        {

                            value :
                                "periode",

                            label :
                                "Periode"

                        }

                    ],

                    dependsOn : {

                        field :
                            "nama",

                        values : [

                            "uang_makan"

                        ]

                    },

                    note :
                        "Kondisi hanya digunakan untuk Uang Makan."

                },


                /* =========================================
                   NOMINAL
                ========================================= */

                {

                    name :
                        "nominal",

                    label :
                        "Nominal",

                    type :
                        "number",

                    placeholder :
                        "Contoh: 25000",

                    required :
                        true,

                    min :
                        0,

                    step :
                        1,

                    note :
                        "Masukkan nominal rule."

                },


                /* =========================================
                   NILAI START
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
                        "Khusus rule lembur per jam."

                },


                /* =========================================
                   NILAI END
                ========================================= */

                {

                    name :
                        "nilai_end",

                    label :
                        "Nilai End",

                    type :
                        "number",

                    placeholder :
                        "Contoh: 2",

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
                        "Khusus rule lembur per jam."

                }

            ],


            normalize :
                function(
                    data
                ){

                    const nama =
                        String(
                            data.nama ??
                            ""
                        ).trim();


                    if(
                        !nama
                    ){

                        alert(
                            "Rule Tambah harus dipilih."
                        );

                        return null;

                    }


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
                                "Kondisi Uang Makan harus dipilih."
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

                        nama.startsWith(
                            "lembur_jam_"
                        )

                    ){

                        kondisi =
                            "masuk,lembur";

                        waktu =
                            "jam";


                        if(

                            data.nilai_start ===
                                ""

                            &&

                            data.nilai_end !==
                                ""

                        ){

                            alert(
                                "Nilai Start harus diisi jika Nilai End diisi."
                            );

                            return null;

                        }


                        if(

                            data.nilai_start !==
                                ""

                            &&

                            data.nilai_end !==
                                ""

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
                       TUNJANGAN / TRANSPORT
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


                    const rule = {

                        type_rule :
                            "rule_tambah",

                        nama :
                            nama,

                        kondisi :
                            kondisi,

                        waktu :
                            waktu,

                        nominal :
                            data.nominal ??
                            "",

                        nilai_start :
                            data.nilai_start ??
                            "",

                        nilai_end :
                            data.nilai_end ??
                            "",

                        berlaku_start :
                            "",

                        berlaku_end :
                            ""

                    };


                    return preparePayrollRule(
                        rule
                    );

                }

        },


        /* =================================================
           RULE ATTENDANCE
        ================================================= */

        {

            id :
                "monthly_rules",

            title :
                "⚙️ Rule Attendance",

            description :
                "Atur fitur attendance yang digunakan dalam Payroll Monthly.",

            addLabel :
                "＋ Simpan Rule",

            formAddLabel :
                "＋ Simpan Rule",

            deleteLabel :
                "Hapus",

            uniqueFields : [

                "aktifkanRuleLembur",

                "aktifkanRuleIzin",

                "gunakanRuleTelat",

                "gunakanRuleShift"

            ],

            autoCloseForm :
                true,


            /*
               Ini bukan rule payroll manual.

               Section ini hanya merupakan pilihan
               fitur input Attendance.

               Rule aktual:
               - rule_masuk
               - rule_lembur
               - rule_izin
               - rule_telat
               - rule_shift

               dibuat oleh Payroll Engine.
            */

            getRuleState :
                async function(){

                    return Payroll
                        .getRuleState({

                            mode :
                                PAYROLL_MODE,

                            sectionId :
                                "monthly_rules"

                        });

                },


            fields : [

                /* =========================================
                   LEMBUR
                ========================================= */

                {

                    name :
                        "aktifkanRuleLembur",

                    label :
                        "Aktifkan Rule Lembur",

                    type :
                        "checkbox",

                    value :
                        false,

                    required :
                        false,

                    note :
                        "Aktifkan jika Payroll Monthly menggunakan lembur."

                },


                /* =========================================
                   IZIN
                ========================================= */

                {

                    name :
                        "aktifkanRuleIzin",

                    label :
                        "Aktifkan Rule Izin",

                    type :
                        "checkbox",

                    value :
                        false,

                    required :
                        false,

                    note :
                        "Aktifkan jika Payroll Monthly menggunakan izin pulang."

                },


                /* =========================================
                   TELAT
                ========================================= */

                {

                    name :
                        "gunakanRuleTelat",

                    label :
                        "Gunakan Rule Telat",

                    type :
                        "checkbox",

                    value :
                        false,

                    required :
                        false,

                    note :
                        "Aktifkan jika Payroll Monthly menggunakan perhitungan telat."

                },


                /* =========================================
                   SHIFT
                ========================================= */

                {

                    name :
                        "gunakanRuleShift",

                    label :
                        "Gunakan Rule Shift",

                    type :
                        "checkbox",

                    value :
                        false,

                    required :
                        false,

                    note :
                        "Aktifkan jika Payroll Monthly menggunakan shift kerja."

                }

            ],


            normalize :
                function(
                    data
                ){

                    return {

                        type :
                            "payroll_monthly",

                        aktifkanRuleLembur :
                            Boolean(
                                data.aktifkanRuleLembur
                            ),

                        aktifkanRuleIzin :
                            Boolean(
                                data.aktifkanRuleIzin
                            ),

                        gunakanRuleTelat :
                            Boolean(
                                data.gunakanRuleTelat
                            ),

                        gunakanRuleShift :
                            Boolean(
                                data.gunakanRuleShift
                            )

                    };

                }

        }

    ]

};


/* =====================================================
   OPTIONAL PAYROLL HELPERS
===================================================== */

/*
   Export helper agar modul lain yang memang membutuhkan
   state Payroll Monthly dapat menggunakan shared engine.

   Tidak digunakan sebagai source state UI.
*/

export async function getMonthlyPayrollState(){

    return Payroll.getState(
        PAYROLL_MODE
    );

}


export async function getMonthlyActivePeriod(){

    return Payroll.getExistingPeriod(
        PAYROLL_MODE
    );

}


export async function getMonthlyRuleState(
    sectionId
){

    return Payroll.getRuleState({

        mode :
            PAYROLL_MODE,

        sectionId :
            sectionId ?? ""

    });

}
