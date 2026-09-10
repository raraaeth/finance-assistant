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
   - Rule Periode adalah master periode.
   - Active period berasal dari Payroll engine.
   - Google Sheets adalah source of truth.
   - DOM result bukan source of truth untuk lock.
   - Rule baru mewarisi active period melalui Payroll.
   - Rule lama tetap menjadi history.
   - Rule Attendance otomatis dibuat oleh Payroll.
   - Rule Periode UI dikelola Payroll.
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {
    Payroll
} from "./payroll.js";


/* =====================================================
   CONSTANT
===================================================== */

const PAYROLL_MODE =
    Payroll.WORKSPACE.monthly;


/* =====================================================
   OPTION HELPERS
===================================================== */

const MONTH_OPTIONS = [
    {
        value : "01",
        label : "Januari"
    },
    {
        value : "02",
        label : "Februari"
    },
    {
        value : "03",
        label : "Maret"
    },
    {
        value : "04",
        label : "April"
    },
    {
        value : "05",
        label : "Mei"
    },
    {
        value : "06",
        label : "Juni"
    },
    {
        value : "07",
        label : "Juli"
    },
    {
        value : "08",
        label : "Agustus"
    },
    {
        value : "09",
        label : "September"
    },
    {
        value : "10",
        label : "Oktober"
    },
    {
        value : "11",
        label : "November"
    },
    {
        value : "12",
        label : "Desember"
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
            length : 18
        },
        (
            _,
            index
        ) =>
            CURRENT_YEAR -
            2 +
            index
    );


/* =====================================================
   MONTH YEAR OPTIONS
===================================================== */

const MONTH_YEAR_OPTIONS =
    YEAR_OPTIONS.flatMap(
        year =>
            MONTH_OPTIONS.map(
                month => ({
                    value :
                        `${year}-${month.value}`,

                    label :
                        `${month.label} ${year}`
                })
            )
    );


/* =====================================================
   DATE HELPERS
===================================================== */

function createISODate(
    year,
    month,
    day
){
    const y =
        Number(year);

    const m =
        Number(month);

    const d =
        Number(day);

    if(
        !Number.isInteger(y) ||
        !Number.isInteger(m) ||
        !Number.isInteger(d)
    ){
        return "";
    }

    const date =
        new Date(
            y,
            m - 1,
            d
        );

    /*
     * JavaScript akan overflow jika
     * tanggal tidak valid.
     *
     * Contoh:
     * 31 Februari → Maret.
     */
    if(
        date.getFullYear() !== y ||
        date.getMonth() !== m - 1 ||
        date.getDate() !== d
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
    const parts =
        String(
            value ??
            ""
        )
        .split("-");

    if(
        parts.length !== 2
    ){
        return null;
    }

    const year =
        Number(
            parts[0]
        );

    const month =
        Number(
            parts[1]
        );

    if(
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        month < 1 ||
        month > 12
    ){
        return null;
    }

    return {
        year,
        month
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
        Number(year);

    let nextMonth =
        Number(month) + 1;

    if(
        nextMonth > 12
    ){
        nextMonth = 1;
        nextYear++;
    }

    return {
        year :
            nextYear,

        month :
            nextMonth
    };
}


/* =====================================================
   DAY NUMBER
===================================================== */

function getDayNumber(
    value
){
    if(
        value ===
        null ||
        value ===
        undefined ||
        value === ""
    ){
        return null;
    }

    const day =
        Number(value);

    if(
        !Number.isInteger(day)
    ){
        return null;
    }

    return day;
}


/* =====================================================
   NORMALIZE COMPARE
===================================================== */

function normalizeCompareValue(
    value
){
    return String(
        value ??
        ""
    )
    .trim()
    .toLowerCase();
}


/* =====================================================
   PAYROLL RULE PREPARATION
===================================================== */

async function preparePayrollRule(
    rule
){
    if(
        !rule
    ){
        return null;
    }

    return Payroll.prepareRule(
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


            /* =============================================
               RULE STATE
            ============================================= */

            getRuleState :
                async function(){
                    /*
                     * Payroll menjadi satu-satunya
                     * sumber state periode.
                     *
                     * Payroll juga mengurus:
                     * - existing period
                     * - new period mode
                     * - note
                     * - tombol Tambah Periode
                     * - lock period
                     */

                    return Payroll.getRuleState(
                        PAYROLL_MODE,
                        "rule_periode"
                    );
                },


            /* =============================================
               FIELDS
            ============================================= */

            fields : [

                /* -----------------------------------------
                   NILAI START DAY
                ----------------------------------------- */

                {
                    name :
                        "nilai_start_day",

                    label :
                        "Tanggal Mulai Perhitungan\nTentukan tanggal mulai periode perhitungan gaji",

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
                        "Hanya masukkan tanggal. Bulan dan tahun mengikuti periode yang dipilih."
                },


                /* -----------------------------------------
                   NILAI END DAY
                ----------------------------------------- */

                {
                    name :
                        "nilai_end_day",

                    label :
                        "Tanggal Akhir Perhitungan\nTentukan tanggal akhir periode perhitungan gaji",

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
                        "Tanggal akhir otomatis menggunakan satu bulan setelah bulan mulai."
                },


                /* -----------------------------------------
                   PERIODE AKTIF START
                ----------------------------------------- */

                {
                    name :
                        "periode_start_month",

                    label :
                        "Masa Aktif Gaji\nTentukan bulan dan tahun mulai berlakunya payroll",

                    type :
                        "select",

                    placeholder :
                        "Pilih bulan dan tahun",

                    required :
                        true,

                    options :
                        MONTH_YEAR_OPTIONS,

                    note :
                        "Menentukan awal masa aktif seluruh rule Payroll Monthly."
                },


                /* -----------------------------------------
                   PERIODE AKTIF END
                ----------------------------------------- */

                {
                    name :
                        "periode_end_month",

                    label :
                        "Masa Aktif Berakhir\nTentukan bulan dan tahun berakhirnya payroll",

                    type :
                        "select",

                    placeholder :
                        "Pilih bulan dan tahun",

                    required :
                        true,

                    options :
                        MONTH_YEAR_OPTIONS,

                    note :
                        "Menentukan akhir masa aktif seluruh rule Payroll Monthly."
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


                    /* -------------------------------------
                       VALIDATE DAY
                    ------------------------------------- */

                    if(
                        startDay === null ||
                        startDay < 1 ||
                        startDay > 31
                    ){
                        alert(
                            "Tanggal mulai perhitungan harus antara 1 sampai 31."
                        );

                        return null;
                    }


                    if(
                        endDay === null ||
                        endDay < 1 ||
                        endDay > 31
                    ){
                        alert(
                            "Tanggal akhir perhitungan harus antara 1 sampai 31."
                        );

                        return null;
                    }


                    /* -------------------------------------
                       PARSE ACTIVE MONTH
                    ------------------------------------- */

                    const activeStart =
                        parseMonthYear(
                            data.periode_start_month
                        );

                    const activeEnd =
                        parseMonthYear(
                            data.periode_end_month
                        );


                    if(
                        !activeStart
                    ){
                        alert(
                            "Masa aktif mulai belum dipilih."
                        );

                        return null;
                    }


                    if(
                        !activeEnd
                    ){
                        alert(
                            "Masa aktif berakhir belum dipilih."
                        );

                        return null;
                    }


                    /* -------------------------------------
                       VALIDATE ACTIVE PERIOD
                    ------------------------------------- */

                    const activeStartValue =
                        activeStart.year * 100 +
                        activeStart.month;

                    const activeEndValue =
                        activeEnd.year * 100 +
                        activeEnd.month;


                    if(
                        activeEndValue <
                        activeStartValue
                    ){
                        alert(
                            "Masa aktif berakhir tidak boleh sebelum masa aktif dimulai."
                        );

                        return null;
                    }


                    /* -------------------------------------
                       CALCULATION START
                    ------------------------------------- */

                    const calculationStart =
                        createISODate(
                            activeStart.year,
                            activeStart.month,
                            startDay
                        );


                    if(
                        !calculationStart
                    ){
                        alert(
                            "Tanggal mulai perhitungan tidak valid untuk bulan yang dipilih."
                        );

                        return null;
                    }


                    /* -------------------------------------
                       CALCULATION END
                    ------------------------------------- */

                    const nextMonth =
                        getNextMonth(
                            activeStart.year,
                            activeStart.month
                        );


                    const calculationEnd =
                        createISODate(
                            nextMonth.year,
                            nextMonth.month,
                            endDay
                        );


                    if(
                        !calculationEnd
                    ){
                        alert(
                            "Tanggal akhir perhitungan tidak valid untuk bulan berikutnya."
                        );

                        return null;
                    }


                    /* -------------------------------------
                       ACTIVE START
                    ------------------------------------- */

                    const berlakuStart =
                        createISODate(
                            activeStart.year,
                            activeStart.month,
                            startDay
                        );


                    if(
                        !berlakuStart
                    ){
                        alert(
                            "Tanggal awal masa aktif tidak valid."
                        );

                        return null;
                    }


                    /* -------------------------------------
                       ACTIVE END
                    ------------------------------------- */

                    const berlakuEnd =
                        createISODate(
                            activeEnd.year,
                            activeEnd.month,
                            endDay
                        );


                    if(
                        !berlakuEnd
                    ){
                        alert(
                            "Tanggal akhir masa aktif tidak valid."
                        );

                        return null;
                    }


                    /* -------------------------------------
                       FINAL VALIDATION
                    ------------------------------------- */

                    if(
                        calculationEnd <
                        calculationStart
                    ){
                        alert(
                            "Tanggal akhir periode perhitungan tidak boleh sebelum tanggal awal."
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


                    /* -------------------------------------
                       RULE PERIOD
                    ------------------------------------- */

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
                            calculationStart,

                        nilai_end :
                            calculationEnd,

                        berlaku_start :
                            berlakuStart,

                        berlaku_end :
                            berlakuEnd
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


            /* =============================================
               RULE STATE
            ============================================= */

            getRuleState :
                async function(){
                    return Payroll.getRuleState(
                        PAYROLL_MODE,
                        "rule_gaji"
                    );
                },


            /* =============================================
               FIELDS
            ============================================= */

            fields : [

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


            /* =============================================
               NORMALIZE
            ============================================= */

            normalize :
                async function(
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


            /* =============================================
               RULE STATE
            ============================================= */

            getRuleState :
                async function(){
                    return Payroll.getRuleState(
                        PAYROLL_MODE,
                        "rule_potong"
                    );
                },


            /* =============================================
               FIELDS
            ============================================= */

            fields : [

                /* -----------------------------------------
                   NAMA
                ----------------------------------------- */

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

                    ]

                },


                /* -----------------------------------------
                   NOMINAL
                ----------------------------------------- */

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


                /* -----------------------------------------
                   NILAI START
                ----------------------------------------- */

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


                /* -----------------------------------------
                   NILAI END
                ----------------------------------------- */

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


            /* =============================================
               NORMALIZE
            ============================================= */

            normalize :
                async function(
                    data
                ){

                    const nama =
                        normalizeCompareValue(
                            data.nama
                        );


                    let kondisi =
                        "periode";

                    let waktu =
                        "gaji";


                    /* -------------------------------------
                       TELAT
                    ------------------------------------- */

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


                        if(
                            data.nilai_start ===
                                "" ||
                            data.nilai_end ===
                                ""
                        ){
                            alert(
                                "Rule telat wajib memiliki Nilai Start dan Nilai End."
                            );

                            return null;
                        }


                        if(
                            Number(
                                data.nilai_start
                            ) >
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


                    /* -------------------------------------
                       IZIN TELAT
                    ------------------------------------- */

                    else if(
                        nama ===
                        "izin_telat"
                    ){

                        kondisi =
                            "izin_telat";

                        waktu =
                            "jam";

                    }


                    /* -------------------------------------
                       IZIN PULANG
                    ------------------------------------- */

                    else if(
                        nama ===
                        "izin_pulang"
                    ){

                        kondisi =
                            "izin_pulang";

                        waktu =
                            "jam";

                    }


                    /* -------------------------------------
                       ABSEN
                    ------------------------------------- */

                    else if(
                        nama ===
                        "absen"
                    ){

                        kondisi =
                            "absen";

                        waktu =
                            "harian";

                    }


                    /* -------------------------------------
                       RULE
                    ------------------------------------- */

                    const rule = {

                        type_rule :
                            "rule_potong",

                        nama :
                            data.nama,

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


            /* =============================================
               RULE STATE
            ============================================= */

            getRuleState :
                async function(){
                    return Payroll.getRuleState(
                        PAYROLL_MODE,
                        "rule_tambah"
                    );
                },


            /* =============================================
               FIELDS
            ============================================= */

            fields : [

                /* -----------------------------------------
                   NAMA
                ----------------------------------------- */

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
                                "Lembur Harian",

                            note :
                                "Masukkan nominal lembur per hari."
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

                    ]

                },


                /* -----------------------------------------
                   KONDISI UANG MAKAN
                ----------------------------------------- */

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


                /* -----------------------------------------
                   NOMINAL
                ----------------------------------------- */

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


                /* -----------------------------------------
                   NILAI START
                ----------------------------------------- */

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
                        "Khusus Lembur Jam. Isi jam awal yang digunakan untuk rule ini."
                },


                /* -----------------------------------------
                   NILAI END
                ----------------------------------------- */

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
                        "Khusus Lembur Jam. Isi jam akhir jika rule mencakup beberapa jam."
                }

            ],


            /* =============================================
               NORMALIZE
            ============================================= */

            normalize :
                async function(
                    data
                ){

                    const nama =
                        normalizeCompareValue(
                            data.nama
                        );


                    let kondisi =
                        "periode";

                    let waktu =
                        "gaji";


                    /* -------------------------------------
                       UANG MAKAN
                    ------------------------------------- */

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


                    /* -------------------------------------
                       LEMBUR HARIAN
                    ------------------------------------- */

                    else if(
                        nama ===
                        "lembur"
                    ){

                        kondisi =
                            "lembur_harian";

                        waktu =
                            "harian";

                    }


                    /* -------------------------------------
                       LEMBUR PER JAM
                    ------------------------------------- */

                    else if(
                        nama ===
                            "lembur_jam_1" ||
                        nama ===
                            "lembur_jam_2" ||
                        nama ===
                            "lembur_jam_3" ||
                        nama ===
                            "lembur_jam_4" ||
                        nama ===
                            "lembur_jam_5" ||
                        nama ===
                            "lembur_jam_6" ||
                        nama ===
                            "lembur_jam_7" ||
                        nama ===
                            "lembur_jam_8"
                    ){

                        kondisi =
                            "masuk,lembur";

                        waktu =
                            "jam";


                        if(
                            data.nilai_start ===
                                "" &&
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
                                "" &&
                            data.nilai_end !==
                                "" &&
                            Number(
                                data.nilai_start
                            ) >
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


                    /* -------------------------------------
                       TUNJANGAN / TRANSPORT
                    ------------------------------------- */

                    else if(
                        nama ===
                            "tunjangan" ||
                        nama ===
                            "uang_transport"
                    ){

                        kondisi =
                            "periode";

                        waktu =
                            "gaji";

                    }


                    /* -------------------------------------
                       RULE
                    ------------------------------------- */

                    const rule = {

                        type_rule :
                            "rule_tambah",

                        nama :
                            data.nama,

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
             * Konfigurasi Attendance adalah data internal
             * untuk Payroll engine.
             *
             * Bukan rule payroll biasa.
             */
            persist :
                false,


            /* =============================================
               RULE STATE
            ============================================= */

            getRuleState :
                async function(){
                    return Payroll.getRuleState(
                        PAYROLL_MODE,
                        "monthly_rules"
                    );
                },


            /* =============================================
               RULE STATE FIELDS
            ============================================= */

            ruleStateFields : {

                aktifkanRuleLembur : {

                    field :
                        "aktifkanRuleLembur",

                    label :
                        "Aktifkan Rule Lembur",

                    replaceWithStatus :
                        true

                },

                aktifkanRuleIzin : {

                    field :
                        "aktifkanRuleIzin",

                    label :
                        "Aktifkan Rule Izin",

                    replaceWithStatus :
                        true

                },

                gunakanRuleTelat : {

                    field :
                        "gunakanRuleTelat",

                    label :
                        "Gunakan Rule Telat",

                    replaceWithStatus :
                        true

                },

                gunakanRuleShift : {

                    field :
                        "gunakanRuleShift",

                    label :
                        "Gunakan Rule Shift",

                    replaceWithStatus :
                        true

                }

            },


            /* =============================================
               FIELDS
            ============================================= */

            fields : [

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
                        "Aktifkan jika Payroll Monthly menggunakan perhitungan lembur."
                },


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
                        "Aktifkan jika Payroll Monthly menggunakan perhitungan izin."
                },


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
                        "Aktifkan jika keterlambatan digunakan dalam perhitungan payroll."
                },


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


            /* =============================================
               NORMALIZE
            ============================================= */

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

    ],


    /* =====================================================
       PREPARE SAVE
    ===================================================== */

    prepareSave :
        async function(
            payload,
            context
        ){

            const data =
                Array.isArray(
                    payload
                )
                    ?
                payload.slice()
                    :
                [];


            /*
             * Cari konfigurasi Attendance.
             *
             * Section monthly_rules bersifat
             * persist:false sehingga data ini tidak
             * dikirim sebagai rule biasa.
             *
             * Tetapi datanya masih tersedia dari
             * context.data sebelum filtering.
             */

            const allData =
                Array.isArray(
                    context?.data
                )
                    ?
                context.data
                    :
                [];


            const attendanceItem =
                allData.find(
                    item =>
                        item?.section ===
                        "monthly_rules"
                );


            const settings =
                attendanceItem?.data ??
                {};


            /*
             * Payroll.prepareSave() menangani:
             *
             * - Rule Periode baru
             * - active period
             * - inheritance active period
             * - automatic Monthly Attendance rules
             * - exit new period mode
             */

            const prepared =
                await Payroll.prepareSave(
                    PAYROLL_MODE,
                    data,
                    {
                        settings :
                            settings
                    }
                );


            return prepared;

        }

};


/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default MonthlySetting;
