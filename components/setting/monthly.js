/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Monthly
   File         : monthly.js
   Version      : 4.2.0

   Description :
   Payroll Monthly Setting Definition

   Modules :
   - Rule Periode
   - Rule Gaji
   - Rule Potong
   - Rule Tambah
   - Rule Shift

   Principle :
   User only fills fields that are necessary.
   Internal engine values are generated automatically.

   UI CHANGE :
   - Tanggal periode cukup angka tanggal
   - Masa aktif cukup bulan + tahun
   - Normalize menghasilkan tanggal lengkap
   - Rule yang sudah dipilih tidak tersedia lagi
===================================================== */


/* =====================================================
   MONTHLY HELPERS
===================================================== */

/* =====================================================
   GET USED RULE NAMES
===================================================== */

function getUsedRuleNames(

    sectionId

){

    const used = new Set();


    const sectionElement =

        document.querySelector(

            `.global-setting-section[data-section="${

                sectionId

            }"]`

        );


    if(

        !sectionElement

    ){

        return used;

    }


    const result =

        sectionElement.querySelector(

            ".global-setting-result"

        );


    if(

        !result

    ){

        return used;

    }


    [

        ...result.children

    ].forEach(

        item => {

            if(

                !item.dataset.value

            ){

                return;

            }


            try{

                const data =

                    JSON.parse(

                        item.dataset.value

                    );


                if(

                    data &&

                    data.nama !== undefined

                ){

                    used.add(

                        String(

                            data.nama

                        )

                        .trim()

                        .toLowerCase()

                    );

                }

            }

            catch(error){

                console.warn(

                    "MONTHLY USED RULE PARSE ERROR:",

                    error

                );

            }

        }

    );


    return used;

}



/* =====================================================
   FILTER RULE OPTIONS
===================================================== */

function getAvailableRuleOptions(

    sectionId,

    options

){

    const used =

        getUsedRuleNames(

            sectionId

        );


    return options.filter(

        option => {

            const value =

                typeof option ===

                "object"

                    ?

                option.value

                    :

                option;


            return !used.has(

                String(

                    value

                )

                .trim()

                .toLowerCase()

            );

        }

    );

}



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

function createYearOptions(){

    const currentYear =

        new Date().getFullYear();


    const startYear =

        currentYear - 10;


    const endYear =

        currentYear + 15;


    const options = [];


    for(

        let year =

            startYear;

        year <=

            endYear;

        year++

    ){

        options.push({

            value :

                String(

                    year

                ),

            label :

                String(

                    year

                )

        });

    }


    return options;

}


const YEAR_OPTIONS =

    createYearOptions();



/* =====================================================
   MONTH + YEAR OPTIONS
===================================================== */

function createMonthYearOptions(){

    const options = [];


    YEAR_OPTIONS.forEach(

        year => {

            MONTH_OPTIONS.forEach(

                month => {

                    options.push({

                        value :

                            `${

                                year.value

                            }-${

                                month.value

                            }`,

                        label :

                            `${

                                month.label

                            } ${

                                year.label

                            }`

                    });

                }

            );

        }

    );


    return options;

}


const MONTH_YEAR_OPTIONS =

    createMonthYearOptions();



/* =====================================================
   CREATE ISO DATE
===================================================== */

function createISODate(

    year,

    month,

    day

){

    const yearNumber =

        Number(

            year

        );


    const monthNumber =

        Number(

            month

        );


    const dayNumber =

        Number(

            day

        );


    if(

        !Number.isInteger(

            yearNumber

        )

        ||

        !Number.isInteger(

            monthNumber

        )

        ||

        !Number.isInteger(

            dayNumber

        )

    ){

        return null;

    }


    if(

        monthNumber < 1 ||

        monthNumber > 12

    ){

        return null;

    }


    if(

        dayNumber < 1 ||

        dayNumber > 31

    ){

        return null;

    }


    /* =============================================
       VALIDATE ACTUAL DAY IN MONTH
    ============================================= */

    const lastDay =

        new Date(

            yearNumber,

            monthNumber,

            0

        ).getDate();


    if(

        dayNumber >

        lastDay

    ){

        return null;

    }


    return (

        `${

            String(

                yearNumber

            )

            .padStart(

                4,

                "0"

            )

        }-` +

        `${

            String(

                monthNumber

            )

            .padStart(

                2,

                "0"

            )

        }-` +

        `${

            String(

                dayNumber

            )

            .padStart(

                2,

                "0"

            )

        }`

    );

}



/* =====================================================
   PARSE MONTH YEAR
===================================================== */

function parseMonthYear(

    value

){

    if(

        typeof value !==

        "string"

    ){

        return null;

    }


    const match =

        value.match(

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
   GET NEXT MONTH
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
   VALIDATE DAY
===================================================== */

function getDayNumber(

    value

){

    if(

        value === undefined ||

        value === null ||

        value === ""

    ){

        return null;

    }


    const number =

        Number(

            value

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
                   TANGGAL MULAI PERIODE
                ========================================= */

                {

                    name :

                        "nilai_start_day",


                    label :

                        "Tanggal Mulai Periode",


                    type :

                        "number",


                    placeholder :

                        "Contoh: 21",


                    required :

                        true,


                    min :

                        1,


                    max :

                        31,


                    step :

                        1,


                    note :

                        "Isi angka tanggal dimulainya periode gaji. Contoh: 21."

                },


                /* =========================================
                   TANGGAL AKHIR PERIODE
                ========================================= */

                {

                    name :

                        "nilai_end_day",


                    label :

                        "Tanggal Akhir Periode",


                    type :

                        "number",


                    placeholder :

                        "Contoh: 20",


                    required :

                        true,


                    min :

                        1,


                    max :

                        31,


                    step :

                        1,


                    note :

                        "Isi angka tanggal berakhirnya periode gaji. Contoh: 20."

                },


                /* =========================================
                   BULAN + TAHUN AWAL
                ========================================= */

                {

                    name :

                        "periode_start_month",


                    label :

                        "Periode Aktif Dimulai",


                    type :

                        "select",


                    placeholder :

                        "Pilih bulan dan tahun",


                    required :

                        true,


                    note :

                        "Pilih bulan dan tahun awal berlakunya periode gaji.",


                    options :

                        MONTH_YEAR_OPTIONS

                },


                /* =========================================
                   BULAN + TAHUN AKHIR
                ========================================= */

                {

                    name :

                        "periode_end_month",


                    label :

                        "Periode Aktif Diakhiri",


                    type :

                        "select",


                    placeholder :

                        "Pilih bulan dan tahun",


                    required :

                        true,


                    note :

                        "Pilih bulan dan tahun akhir berlakunya periode gaji.",


                    options :

                        MONTH_YEAR_OPTIONS

                }

            ],


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


                    /* =================================
                       VALIDATE DAY
                    ================================= */

                    if(

                        startDay === null

                    ){

                        alert(

                            "Tanggal mulai periode harus berupa angka 1 sampai 31."

                        );


                        return null;

                    }


                    if(

                        endDay === null

                    ){

                        alert(

                            "Tanggal akhir periode harus berupa angka 1 sampai 31."

                        );


                        return null;

                    }


                    /* =================================
                       PARSE ACTIVE START
                    ================================= */

                    const startPeriod =

                        parseMonthYear(

                            data.periode_start_month

                        );


                    if(

                        !startPeriod

                    ){

                        alert(

                            "Bulan dan tahun awal periode wajib dipilih."

                        );


                        return null;

                    }


                    /* =================================
                       PARSE ACTIVE END
                    ================================= */

                    const endPeriod =

                        parseMonthYear(

                            data.periode_end_month

                        );


                    if(

                        !endPeriod

                    ){

                        alert(

                            "Bulan dan tahun akhir periode wajib dipilih."

                        );


                        return null;

                    }


                    /* =================================
                       PERIOD CALCULATION START
                       
                       Contoh:
                       21
                       Januari 2026

                       → 2026-01-21
                    ================================= */

                    const nilaiStart =

                        createISODate(

                            startPeriod.year,

                            startPeriod.month,

                            startDay

                        );


                    if(

                        !nilaiStart

                    ){

                        alert(

                            "Tanggal mulai periode tidak valid untuk bulan dan tahun yang dipilih."

                        );


                        return null;

                    }


                    /* =================================
                       PERIOD CALCULATION END
                       
                       Tanggal akhir mengambil
                       SATU BULAN SETELAH BULAN START.

                       Contoh:
                       20
                       Januari 2026

                       → 2026-02-20
                    ================================= */

                    const nextPeriod =

                        getNextMonth(

                            startPeriod.year,

                            startPeriod.month

                        );


                    const nilaiEnd =

                        createISODate(

                            nextPeriod.year,

                            nextPeriod.month,

                            endDay

                        );


                    if(

                        !nilaiEnd

                    ){

                        alert(

                            "Tanggal akhir periode tidak valid untuk bulan berikutnya."

                        );


                        return null;

                    }


                    /* =================================
                       ACTIVE PERIOD START
                       
                       Menggunakan bulan/tahun
                       yang dipilih user + start day.
                    ================================= */

                    const berlakuStart =

                        createISODate(

                            startPeriod.year,

                            startPeriod.month,

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


                    /* =================================
                       ACTIVE PERIOD END
                       
                       Menggunakan bulan/tahun akhir
                       yang dipilih user + end day.
                    ================================= */

                    const berlakuEnd =

                        createISODate(

                            endPeriod.year,

                            endPeriod.month,

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


                    /* =================================
                       VALIDATE ACTIVE RANGE
                    ================================= */

                    if(

                        new Date(

                            berlakuStart

                        )

                        >

                        new Date(

                            berlakuEnd

                        )

                    ){

                        alert(

                            "Periode aktif berakhir sebelum periode aktif dimulai."

                        );


                        return null;

                    }


                    /* =================================
                       RETURN
                       
                       STRUKTUR RESULT TETAP SAMA
                       SEPERTI VERSI SEBELUMNYA.
                    ================================= */

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

                            nilaiStart,


                        nilai_end :

                            nilaiEnd,


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


                    get options(){

                        return getAvailableRuleOptions(

                            "rule_gaji",

                            [

                                {

                                    value :

                                        "gaji",


                                    label :

                                        "Gaji Pokok"

                                }

                            ]

                        );

                    }

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


                    get options(){

                        return getAvailableRuleOptions(

                            "rule_potong",

                            [

                                /* =========================
                                   POTONGAN PERIODE
                                ========================= */

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


                                /* =========================
                                   POTONGAN TELAT
                                ========================= */

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


                                /* =========================
                                   POTONGAN ATTENDANCE
                                ========================= */

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

                        );

                    }

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


                    get options(){

                        return getAvailableRuleOptions(

                            "rule_tambah",

                            [

                                /* =========================
                                   TAMBAHAN PERIODE
                                ========================= */

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


                                /* =========================
                                   UANG MAKAN
                                ========================= */

                                {

                                    value :

                                        "uang_makan",


                                    label :

                                        "Uang Makan"

                                },


                                /* =========================
                                   LEMBUR HARIAN
                                ========================= */

                                {

                                    value :

                                        "lembur",


                                    label :

                                        "Lembur Harian",


                                    note :

                                        "Masukkan nominal lembur per hari."

                                },


                                /* =========================
                                   LEMBUR PER JAM
                                ========================= */

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

                        );

                    }

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

        },


        /* =================================================
           PENGATURAN RULE SHIFT
        ================================================= */

        {

            id :

                "monthly_rules",


            title :

                "⚙️ Rule Shift Kerja",


            description :

                "Tentukan rule shift kerja di Payroll Monthly",


            addLabel :

                "＋ Simpan Rule",


            formAddLabel :

                "＋ Simpan Rule",


            deleteLabel :

                "Hapus",


            uniqueFields : [

                "gunakanRuleShift"

            ],


            autoCloseForm :

                true,


            fields : [

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

                        "Opsional. Aktifkan jika Payroll Monthly menggunakan shift kerja. Dengan mengaktifkan fitur ini, akan menambah input keterangan soal shift pada pencatatan attendance."

                }

            ],


            normalize :

                function(

                    data

                ){

                    return {

                        type :

                            "payroll_monthly",


                        gunakanRuleShift :

                            Boolean(

                                data.gunakanRuleShift

                            )

                    };

                }

        }

    ]

};
