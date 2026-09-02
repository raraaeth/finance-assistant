/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Daily
   File         : daily.js
   Version      : 2.0.2

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

   UI CHANGE :
   - Tanggal periode cukup angka tanggal
   - Masa aktif cukup bulan + tahun
   - Normalize menghasilkan tanggal lengkap
   - Masa aktif Rule Gaji diwariskan ke seluruh rule
   - Years dibuat otomatis dari tahun periode aktif
   - Rule lama tetap menjadi history
===================================================== */


/* =====================================================
   DAILY HELPERS
===================================================== */


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

        currentYear - 2;


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
                String(year),

            label :
                String(year)

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

                            `${year.value}-${month.value}`,

                        label :

                            `${month.label} ${year.label}`

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

        Number(year);


    const monthNumber =

        Number(month);


    const dayNumber =

        Number(day);


    if(

        !Number.isInteger(yearNumber)

        ||

        !Number.isInteger(monthNumber)

        ||

        !Number.isInteger(dayNumber)

    ){

        return null;

    }


    if(

        monthNumber < 1

        ||

        monthNumber > 12

    ){

        return null;

    }


    if(

        dayNumber < 1

        ||

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


    const year =

        Number(

            match[1]

        );


    const month =

        Number(

            match[2]

        );


    if(

        month < 1

        ||

        month > 12

    ){

        return null;

    }


    return {

        year :

            year,

        month :

            month

    };

}


/* =====================================================
   CREATE YEARS
===================================================== */

/*
   Years dibuat otomatis dari tahun awal
   masa aktif periode payroll.

   Contoh :

       periode_start = 2026-01-28
       periode_end   = 2027-02-27

   Maka :

       years = "2026"

   User tidak perlu mengisi years secara manual.
*/

function createYears(

    startPeriod

){

    if(

        !startPeriod

        ||

        !Number.isInteger(

            Number(

                startPeriod.year

            )

        )

    ){

        return "";

    }


    return String(

        startPeriod.year

    );

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

        value === undefined

        ||

        value === null

        ||

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

        number < 1

        ||

        number > 31

    ){

        return null;

    }


    return number;

}


/* =====================================================
   DAILY ACTIVE PERIOD CONTEXT
===================================================== */

/*
   Menyimpan periode aktif terakhir yang berhasil
   dibuat pada Payroll Daily.

   Context ini digunakan oleh :

   - Rule Work
   - Rule Tambah
   - Rule Potong

   User cukup menentukan masa aktif satu kali
   pada Rule Gaji.

   Daily menggunakan field :

       periode_start
       periode_end
       years

   Contoh :

       Rule Gaji

       periode_start = 2026-01-28
       periode_end   = 2027-02-27
       years         = 2026

   Maka seluruh rule berikutnya otomatis
   menggunakan periode dan years tersebut.

   Rule lama tetap menjadi history.
*/

let DAILY_PERIOD_CONTEXT = null;


/* =====================================================
   SET ACTIVE PERIOD CONTEXT
===================================================== */

/*
   Menyimpan periode dari Rule Gaji terakhir.

   PENTING :

   Daily menggunakan :

       periode_start
       periode_end
       years

   Bukan :

       berlaku_start
       berlaku_end
*/

function setDailyPeriodContext(

    rule

){

    if(

        !rule

    ){

        return;

    }


    if(

        rule.type_rule !==

        "rule_gaji"

    ){

        return;

    }


    if(

        !rule.periode_start

        ||

        !rule.periode_end

    ){

        return;

    }


    DAILY_PERIOD_CONTEXT = {

        periode_start :

            rule.periode_start,


        periode_end :

            rule.periode_end,


        years :

            rule.years ?? ""

    };

}


/* =====================================================
   GET LATEST PERIOD FROM UI RESULT
===================================================== */

/*
   Membaca Rule Gaji terakhir dari UI.

   Ini diperlukan ketika history payroll
   sudah dimuat kembali ke halaman.

   Rule baru akan menggunakan Rule Gaji
   terakhir sebagai active period context.

   Cari dari bawah karena Rule Gaji
   paling bawah dianggap sebagai periode
   terbaru.
*/

function getLatestDailyPeriodContext(){

    const sectionElement =

        document.querySelector(

            '.global-setting-section[data-section="rule_gaji"]'

        );


    if(

        sectionElement

    ){

        const result =

            sectionElement.querySelector(

                ".global-setting-result"

            );


        if(

            result

        ){

            const items = [

                ...result.children

            ];


            /* =========================================
               SEARCH LATEST RULE GAJI
            ========================================= */

            for(

                let index =

                    items.length - 1;

                index >= 0;

                index--

            ){

                const item =

                    items[index];


                if(

                    !item.dataset.value

                ){

                    continue;

                }


                try{

                    const data =

                        JSON.parse(

                            item.dataset.value

                        );


                    /* =================================
                       VALID RULE GAJI
                    ================================= */

                    if(

                        data

                        &&

                        data.type_rule ===

                            "rule_gaji"

                        &&

                        data.periode_start

                        &&

                        data.periode_end

                    ){

                        return {

                            periode_start :

                                data.periode_start,


                            periode_end :

                                data.periode_end,


                            years :

                                data.years ?? ""

                        };

                    }

                }

                catch(error){

                    console.warn(

                        "DAILY PERIOD CONTEXT PARSE ERROR:",

                        error

                    );

                }

            }

        }

    }


    /* =============================================
       FALLBACK

       Jika result belum masuk DOM,
       gunakan context terakhir.
    ============================================= */

    return DAILY_PERIOD_CONTEXT;

}


/* =====================================================
   GET ACTIVE PERIOD CONTEXT
===================================================== */

function getDailyActivePeriodContext(){

    return getLatestDailyPeriodContext();

}


/* =====================================================
   REQUIRE ACTIVE PERIOD
===================================================== */

/*
   Semua rule selain Rule Gaji wajib memiliki
   active period.

   Rule Gaji menjadi sumber :

       periode_start
       periode_end
       years
*/

function requireDailyActivePeriod(

    ruleName

){

    const periodContext =

        getDailyActivePeriodContext();


    if(

        !periodContext

        ||

        !periodContext.periode_start

        ||

        !periodContext.periode_end

    ){

        alert(

            `Tambahkan Periode Gaji terlebih dahulu sebelum menambahkan ${

                ruleName

            }.`

        );


        return null;

    }


    return periodContext;

}


/* =====================================================
   DAILY SETTING
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

                "Tentukan periode perhitungan dan masa aktif payroll daily.",


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

                        "Contoh: 28",


                    required :

                        true,


                    min :

                        1,


                    max :

                        31,


                    step :

                        1,


                    note :

                        "Isi angka tanggal dimulainya periode gaji. Contoh: 28."

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

                        "Contoh: 27",


                    required :

                        true,


                    min :

                        1,


                    max :

                        31,


                    step :

                        1,


                    note :

                        "Isi angka tanggal berakhirnya periode gaji. Contoh: 27."

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

                        "Pilih bulan dan tahun awal berlakunya payroll daily.",


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

                        "Pilih bulan dan tahun akhir berlakunya payroll daily.",


                    options :

                        MONTH_YEAR_OPTIONS

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


                    /* =====================================
                       VALIDATE DAY
                    ===================================== */

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


                    /* =====================================
                       PARSE ACTIVE START
                    ===================================== */

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


                    /* =====================================
                       PARSE ACTIVE END
                    ===================================== */

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


                    /* =====================================
                       PERIOD START
                    ===================================== */

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


                    /* =====================================
                       PERIOD END

                       Bulan akhir periode perhitungan
                       otomatis satu bulan setelah
                       bulan mulai.

                       Contoh :

                       28 Januari 2026
                       →
                       27 Februari 2026
                    ===================================== */

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


                    /* =====================================
                       ACTIVE PERIOD START
                    ===================================== */

                    const periodeStart =

                        createISODate(

                            startPeriod.year,

                            startPeriod.month,

                            startDay

                        );


                    if(

                        !periodeStart

                    ){

                        alert(

                            "Tanggal awal masa aktif tidak valid."

                        );


                        return null;

                    }


                    /* =====================================
                       ACTIVE PERIOD END
                    ===================================== */

                    const periodeEnd =

                        createISODate(

                            endPeriod.year,

                            endPeriod.month,

                            endDay

                        );


                    if(

                        !periodeEnd

                    ){

                        alert(

                            "Tanggal akhir masa aktif tidak valid."

                        );


                        return null;

                    }


                    /* =====================================
                       VALIDATE ACTIVE RANGE
                    ===================================== */

                    if(

                        new Date(

                            periodeStart

                        )

                        >

                        new Date(

                            periodeEnd

                        )

                    ){

                        alert(

                            "Periode aktif berakhir sebelum periode aktif dimulai."

                        );


                        return null;

                    }


                    /* =====================================
                       CREATE YEARS

                       Years otomatis mengikuti
                       tahun awal masa aktif.
                    ===================================== */

                    const years =

                        createYears(

                            startPeriod

                        );


                    /* =====================================
                       NORMALIZED RULE
                    ===================================== */

                    const normalizedRule = {

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

                            nilaiStart,


                        nilai_end :

                            nilaiEnd,


                        periode_start :

                            periodeStart,


                        periode_end :

                            periodeEnd,


                        years :

                            years

                    };


                    /* =====================================
                       SET ACTIVE PERIOD CONTEXT

                       Rule berikutnya otomatis
                       menggunakan :

                       periode_start
                       periode_end
                       years
                    ===================================== */

                    setDailyPeriodContext(

                        normalizedRule

                    );


                    return normalizedRule;

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

                    const periodContext =

                        requireDailyActivePeriod(

                            "Rule Work"

                        );


                    if(

                        !periodContext

                    ){

                        return null;

                    }


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

                            periodContext.periode_start,


                        periode_end :

                            periodContext.periode_end,


                        years :

                            periodContext.years ?? ""

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
                   HARI SABTU
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


                /* =========================================
                   HARI MINGGU
                ========================================= */

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


                /* =========================================
                   HARI SENIN
                ========================================= */

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


                /* =========================================
                   HARI SELASA
                ========================================= */

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

                        "selasa"

                },


                /* =========================================
                   HARI RABU
                ========================================= */

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

                        "rabu"

                },


                /* =========================================
                   HARI KAMIS
                ========================================= */

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

                        "kamis"

                },


                /* =========================================
                   HARI JUMAT
                ========================================= */

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

                        "jumat"

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


                    /* =====================================
                       ACTIVE PERIOD
                    ===================================== */

                    const periodContext =

                        requireDailyActivePeriod(

                            "Rule Tambah"

                        );


                    if(

                        !periodContext

                    ){

                        return null;

                    }


                    /* =====================================
                       RETURN
                    ===================================== */

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

                            periodContext.periode_start,


                        periode_end :

                            periodContext.periode_end,


                        years :

                            periodContext.years ?? ""

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

                    const periodContext =

                        requireDailyActivePeriod(

                            "Rule Potong"

                        );


                    if(

                        !periodContext

                    ){

                        return null;

                    }


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

                            periodContext.periode_start,


                        periode_end :

                            periodContext.periode_end,


                        years :

                            periodContext.years ?? ""

                    };

                }

        }

    ]

};


/* =====================================================
   END
===================================================== */
