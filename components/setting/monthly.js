/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Monthly
   File         : monthly.js
   Version      : 5.0.0

   Description :
   Payroll Monthly Setting Definition

   Modules :
   - Rule Periode
   - Rule Gaji
   - Rule Potong
   - Rule Tambah
   - Rule Attendance

   ARCHITECTURE :

   payroll.js
       ↓
   Sheet Payroll Rules
       ↓
   Existing Rule State
       ↓
   Active Period
       ↓
   Lock / Unlock
       ↓
   monthly.js

   PRINCIPLE :

   - Sheet adalah source of truth.
   - Result DOM bukan sumber existing rule.
   - Rule Periode menjadi dasar seluruh rule Monthly.
   - Rule Periode hanya dibuat satu kali untuk satu
     konfigurasi periode aktif.
   - Setelah dibuat, Rule Periode terkunci.
   - User dapat memilih "Tambah Periode" untuk
     membuka konfigurasi periode baru.
   - Membuka periode baru juga membuka kembali
     Rule Gaji, Rule Tambah, dan Rule Potong.
   - Rule lama tetap menjadi history.
   - Rule Tambah dan Rule Potong dikunci berdasarkan
     rule nyata pada active period.
   - Rule Gaji mengikuti state rule nyata.
   - Rule Attendance dibuat otomatis oleh Rule Periode.
   - User hanya mengaktifkan / menggunakan fitur
     Attendance melalui checkbox yang merepresentasikan
     rule yang sudah tersedia.
===================================================== */


/* =====================================================
   PAYROLL ENGINE
===================================================== */

/*
   payroll.js adalah pusat state Payroll.

   monthly.js tidak lagi membaca:
       .global-setting-result

   untuk menentukan rule existing.

   Semua status rule berasal dari:
       Payroll
           ↓
       Sheet
           ↓
       Rule State
*/

import {
    Payroll
} from "./payroll.js";


/* =====================================================
   PAYROLL MODE
===================================================== */

const PAYROLL_MODE =
    "monthly";


/* =====================================================
   PAYROLL STATE HELPER
===================================================== */

/*
   Ambil state dari payroll.js.

   payroll.js menjadi satu-satunya tempat untuk:
   - membaca sheet
   - menentukan active period
   - menentukan rule existing
   - menentukan lock
*/

function getPayrollState(
    sectionId
){

    try{

        if(
            !Payroll ||
            typeof Payroll.getRuleState !==
                "function"
        ){

            return {};

        }


        /*
           getRuleState() dapat menggunakan cache
           state yang sudah dibaca dari sheet.

           Untuk section dinamis seperti:
           rule_tambah
           rule_potong

           state tetap berasal dari Payroll.
        */

        const state =
            Payroll.getRuleState({

                mode :
                    PAYROLL_MODE,

                sectionId :
                    sectionId

            });


        /*
           Jika payroll.js mengembalikan Promise,
           state tidak dapat digunakan secara
           synchronous oleh getter options.

           Payroll seharusnya menyediakan state
           synchronous setelah controller selesai
           membaca rule.

           Jika Promise ditemukan, abaikan di sini.
        */

        if(
            state &&
            typeof state.then ===
                "function"
        ){

            return {};

        }


        return state || {};

    }
    catch(error){

        console.error(
            "MONTHLY PAYROLL STATE ERROR:",
            error
        );


        return {};

    }

}


/* =====================================================
   ACTIVE PERIOD
===================================================== */

function getActivePeriod(){

    try{

        if(
            Payroll &&
            typeof Payroll.getActivePeriod ===
                "function"
        ){

            return Payroll.getActivePeriod(
                PAYROLL_MODE
            );

        }

    }
    catch(error){

        console.error(
            "MONTHLY ACTIVE PERIOD ERROR:",
            error
        );

    }


    return null;

}


/* =====================================================
   NORMALIZE ACTIVE PERIOD
===================================================== */

function normalizeActivePeriod(
    period
){

    if(
        !period ||
        typeof period !==
            "object"
    ){

        return null;

    }


    const start =
        period.berlaku_start ??
        period.start ??
        "";


    const end =
        period.berlaku_end ??
        period.end ??
        "";


    if(
        !start ||
        !end
    ){

        return null;

    }


    return {

        berlaku_start :
            start,

        berlaku_end :
            end

    };

}


/* =====================================================
   GET ACTIVE PERIOD CONTEXT
===================================================== */

function getMonthlyActivePeriodContext(){

    const period =
        normalizeActivePeriod(
            getActivePeriod()
        );


    return period;

}


/* =====================================================
   GET AVAILABLE OPTIONS
===================================================== */

/*
   Semua filtering option dilakukan payroll.js.

   monthly.js hanya menyediakan daftar pilihan
   yang memang dimiliki oleh module Monthly.

   payroll.js kemudian menentukan:
       pilihan mana yang sudah digunakan
       pada active period.

   History periode lama tidak ikut mengunci
   periode baru.
*/

function getAvailableRuleOptions(
    sectionId,
    options
){

    if(
        !Array.isArray(
            options
        )
    ){

        return [];

    }


    try{

        if(
            Payroll &&
            typeof Payroll.getAvailableRuleOptions ===
                "function"
        ){

            const available =
                Payroll.getAvailableRuleOptions({

                    mode :
                        PAYROLL_MODE,

                    sectionId :
                        sectionId,

                    options :
                        options

                });


            if(
                Array.isArray(
                    available
                )
            ){

                return available;

            }

        }

    }
    catch(error){

        console.error(
            "MONTHLY AVAILABLE OPTION ERROR:",
            error
        );

    }


    /*
       Jangan fallback ke DOM.

       Jika payroll.js belum memberikan state,
       semua opsi dikembalikan agar module tidak
       membuat keputusan existing rule berdasarkan
       state UI.
    */

    return options.slice();

}


/* =====================================================
   CHECK RULE CREATED
===================================================== */

function isRuleCreated(
    sectionId,
    ruleKey
){

    const state =
        getPayrollState(
            sectionId
        );


    if(
        !state ||
        typeof state !==
            "object"
    ){

        return false;

    }


    if(
        state.created &&
        typeof state.created ===
            "object"
    ){

        if(
            state.created[
                ruleKey
            ] === true
        ){

            return true;

        }

    }


    return (
        state[
            ruleKey
        ] === true
    );

}


/* =====================================================
   ADD NEW PERIOD
===================================================== */

/*
   Dipanggil ketika user memilih:

       Tambah Periode

   payroll.js yang mengatur state.

   Efek yang diharapkan:

   - Rule Periode kembali terbuka.
   - Active period lama tidak dihapus.
   - Rule Gaji kembali tersedia.
   - Rule Tambah kembali tersedia.
   - Rule Potong kembali tersedia.
   - Rule lama tetap history.
*/

function addNewPeriod(){

    try{

        if(
            Payroll &&
            typeof Payroll.addNewPeriod ===
                "function"
        ){

            Payroll.addNewPeriod(
                PAYROLL_MODE
            );

            return true;

        }

    }
    catch(error){

        console.error(
            "MONTHLY ADD NEW PERIOD ERROR:",
            error
        );

    }


    return false;

}


/* =====================================================
   BIND NEW PERIOD ACTION
===================================================== */

/*
   payroll.js bertanggung jawab menyediakan
   mekanisme pembukaan periode baru.

   Hook ini sengaja dibuat aman jika controller
   belum membutuhkan binding tambahan.

   Jika payroll.js menyediakan bindNewPeriod(),
   module menggunakannya.
*/

function bindNewPeriodAction(){

    try{

        if(
            Payroll &&
            typeof Payroll.bindNewPeriod ===
                "function"
        ){

            Payroll.bindNewPeriod({

                mode :
                    PAYROLL_MODE

            });

        }

    }
    catch(error){

        console.error(
            "MONTHLY BIND NEW PERIOD ERROR:",
            error
        );

    }

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
        new Date()
            .getFullYear();


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
   MONTH YEAR OPTIONS
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
        ) ||
        !Number.isInteger(
            monthNumber
        ) ||
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


    const lastDay =
        new Date(
            yearNumber,
            monthNumber,
            0
        )
        .getDate();


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
        nextMonth >
        12
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
        value ===
            undefined ||

        value ===
            null ||

        value ===
            ""
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
   AUTOMATIC RULE MASUK
===================================================== */

/*
   Rule Attendance dibuat otomatis oleh Rule Periode.

   User tidak pernah membuat Rule Masuk secara manual.

   Rule yang dihasilkan:

   - masuk
   - cuti
   - sakit
   - libur
   - absen
*/

function createAutomaticRuleMasuk(
    berlakuStart,
    berlakuEnd
){

    if(
        !berlakuStart ||
        !berlakuEnd
    ){

        return [];

    }


    const statusList = [

        {

            nama :
                "masuk",

            kondisi :
                "masuk",

            waktu :
                "senin,selasa,rabu,kamis,jumat"

        },

        {

            nama :
                "cuti",

            kondisi :
                "cuti",

            waktu :
                "senin,selasa,rabu,kamis,jumat"

        },

        {

            nama :
                "sakit",

            kondisi :
                "sakit",

            waktu :
                "senin,selasa,rabu,kamis,jumat"

        },

        {

            nama :
                "libur",

            kondisi :
                "libur",

            waktu :
                "senin,selasa,rabu,kamis,jumat"

        },

        {

            nama :
                "absen",

            kondisi :
                "absen",

            waktu :
                "senin,selasa,rabu,kamis,jumat"

        }

    ];


    return statusList.map(

        status => ({

            type_rule :
                "rule_masuk",

            nama :
                status.nama,

            kondisi :
                status.kondisi,

            waktu :
                status.waktu,

            nominal :
                "",

            nilai_start :
                "",

            nilai_end :
                "",

            berlaku_start :
                berlakuStart,

            berlaku_end :
                berlakuEnd

        })

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
       MODULE INIT
    ================================================= */

    init(){

        bindNewPeriodAction();

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


            /*
               Tombol ini bukan sekadar membuka form.

               Jika periode sudah ada, payroll.js akan
               mengubah state menjadi NEW PERIOD sehingga:

               - Rule Periode unlock
               - Rule Gaji unlock
               - Rule Tambah unlock
               - Rule Potong unlock
            */

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
               Rule Periode adalah fixed rule.

               State existing berasal dari payroll.js,
               bukan result DOM.
            */

            getRuleState(){

                return getPayrollState(
                    "rule_periode"
                );

            },


            /*
               payroll.js menggunakan hook ini untuk
               mengetahui bahwa section ini merupakan
               fondasi periode Monthly.
            */

            payrollRule :
                "periode",


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
                        "Isi angka tanggal dimulainya periode gaji. Contoh: 21.",


                    resultLabel :
                        "Tanggal Mulai Periode"

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
                        "Isi angka tanggal berakhirnya periode gaji. Contoh: 20.",


                    resultLabel :
                        "Tanggal Akhir Periode"

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
                        MONTH_YEAR_OPTIONS,


                    resultLabel :
                        "Masa Aktif Mulai"

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
                        MONTH_YEAR_OPTIONS,


                    resultLabel :
                        "Masa Aktif Berakhir"

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


                    /*
                       Periode perhitungan:

                       contoh:
                       21 Januari → 20 Februari
                    */

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


                    /*
                       Masa aktif.
                    */

                    const berlakuStart =
                        createISODate(

                            startPeriod.year,

                            startPeriod.month,

                            startDay

                        );


                    const berlakuEnd =
                        createISODate(

                            endPeriod.year,

                            endPeriod.month,

                            endDay

                        );


                    if(
                        !berlakuStart
                    ){

                        alert(
                            "Tanggal awal masa aktif tidak valid."
                        );


                        return null;

                    }


                    if(
                        !berlakuEnd
                    ){

                        alert(
                            "Tanggal akhir masa aktif tidak valid."
                        );


                        return null;

                    }


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


                    /*
                       Rule Periode.

                       auto_rules tetap menjadi bagian
                       internal payload.

                       Rule Masuk tidak mempunyai section
                       sendiri.
                    */

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
                            berlakuEnd,


                        auto_rules :
                            createAutomaticRuleMasuk(

                                berlakuStart,

                                berlakuEnd

                            )

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


            /*
               Existing Rule Gaji dibaca dari sheet
               melalui payroll.js.

               Ketika gaji sudah ada pada active period,
               controller dapat menonaktifkan input.
            */

            getRuleState(){

                return getPayrollState(
                    "rule_gaji"
                );

            },


            payrollRule :
                "gaji",


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

                    const periodContext =
                        getMonthlyActivePeriodContext();


                    if(
                        !periodContext
                    ){

                        alert(
                            "Tambahkan Periode Gaji terlebih dahulu sebelum menambahkan Rule Gaji."
                        );


                        return null;

                    }


                    /*
                       Pastikan rule nyata belum ada.

                       Ini bukan pemeriksaan DOM.
                    */

                    if(
                        isRuleCreated(
                            "rule_gaji",
                            "gaji"
                        )
                    ){

                        alert(
                            "Rule Gaji Pokok sudah dibuat untuk periode aktif."
                        );


                        return null;

                    }


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
                            periodContext.berlaku_start,


                        berlaku_end :
                            periodContext.berlaku_end

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


            payrollRule :
                "potong",


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


                    note :
                        "Pilih jenis potongan yang ingin digunakan.",


                    get options(){

                        return getAvailableRuleOptions(

                            "rule_potong",

                            [

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
                        data.nama;


                    let kondisi =
                        "periode";


                    let waktu =
                        "gaji";


                    if(

                        nama ===
                            "telat_1" ||

                        nama ===
                            "telat_2" ||

                        nama ===
                            "telat_3" ||

                        nama ===
                            "telat_4"

                    ){

                        kondisi =
                            "telat";


                        waktu =
                            "menit";

                    }


                    else if(
                        nama ===
                            "izin_telat"
                    ){

                        kondisi =
                            "izin_telat";


                        waktu =
                            "jam";

                    }


                    else if(
                        nama ===
                            "izin_pulang"
                    ){

                        kondisi =
                            "izin_pulang";


                        waktu =
                            "jam";

                    }


                    else if(
                        nama ===
                            "absen"
                    ){

                        kondisi =
                            "absen";


                        waktu =
                            "harian";

                    }


                    if(

                        nama ===
                            "telat_1" ||

                        nama ===
                            "telat_2" ||

                        nama ===
                            "telat_3" ||

                        nama ===
                            "telat_4"

                    ){

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


                    const periodContext =
                        getMonthlyActivePeriodContext();


                    if(
                        !periodContext
                    ){

                        alert(
                            "Tambahkan Periode Gaji terlebih dahulu sebelum menambahkan Rule Potong."
                        );


                        return null;

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
                            periodContext.berlaku_start,


                        berlaku_end :
                            periodContext.berlaku_end

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


            payrollRule :
                "tambah",


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


                    note :
                        "Pilih jenis tambahan yang ingin dibuat.",


                    get options(){

                        return getAvailableRuleOptions(

                            "rule_tambah",

                            [

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
                        "Khusus Lembur Jam. Isi jam awal yang digunakan untuk rule ini."

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


                    else if(
                        nama ===
                            "lembur"
                    ){

                        kondisi =
                            "lembur_harian";


                        waktu =
                            "harian";

                    }


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


                    const periodContext =
                        getMonthlyActivePeriodContext();


                    if(
                        !periodContext
                    ){

                        alert(
                            "Tambahkan Periode Gaji terlebih dahulu sebelum menambahkan Rule Tambah."
                        );


                        return null;

                    }


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
                            periodContext.berlaku_start,


                        berlaku_end :
                            periodContext.berlaku_end

                    };

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


            /*
               Ini bukan rule payroll yang disimpan
               sebagai konfigurasi tersendiri.

               Checkbox hanya merepresentasikan rule
               Attendance yang telah dibuat otomatis
               oleh Rule Periode.
            */

            persist :
                false,


            addLabel :
                "＋ Simpan Rule",


            formAddLabel :
                "＋ Simpan Rule",


            deleteLabel :
                "Hapus",


            autoCloseForm :
                true,


            /*
               State berasal dari sheet.

               Controller kemudian menggunakan state
               tersebut untuk mengunci checkbox.
            */

            getRuleState(){

                return getPayrollState(
                    "monthly_rules"
                );

            },


            /*
               Pemetaan checkbox → rule nyata.

               Ini penting agar checkbox bukan
               dianggap sebagai source of truth.
            */

            ruleStateFields : {

                aktifkanRuleLembur : {

                    field :
                        "aktifkanRuleLembur",

                    label :
                        "Rule Lembur"

                },


                aktifkanRuleIzin : {

                    field :
                        "aktifkanRuleIzin",

                    label :
                        "Rule Izin"

                },


                gunakanRuleTelat : {

                    field :
                        "gunakanRuleTelat",

                    label :
                        "Rule Telat"

                },


                gunakanRuleShift : {

                    field :
                        "gunakanRuleShift",

                    label :
                        "Rule Shift"

                }

            },


            fields : [


                /* =========================================
                   RULE LEMBUR
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


                    resultName :
                        "Rule Lembur",


                    note :
                        "Aktifkan jika Attendance membutuhkan input lembur jam."

                },


                /* =========================================
                   RULE IZIN
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


                    resultName :
                        "Rule Izin",


                    note :
                        "Aktifkan jika Attendance membutuhkan kondisi izin telat dan izin pulang."

                },


                /* =========================================
                   RULE TELAT
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


                    resultName :
                        "Rule Telat",


                    note :
                        "Aktifkan jika keterlambatan pada Attendance digunakan dalam perhitungan payroll."

                },


                /* =========================================
                   RULE SHIFT
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


                    resultName :
                        "Rule Shift",


                    note :
                        "Aktifkan jika Payroll Monthly menggunakan shift kerja pada Attendance."

                }

            ],


            /*
               Tidak membuat rule baru.

               Rule Attendance sudah dibuat otomatis
               oleh Rule Periode.

               Checkbox hanya digunakan sebagai
               representasi UI.
            */

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
   MONTHLY READY
===================================================== */

/*
   Jangan menjalankan pembacaan sheet di sini.

   Global Setting controller akan memanggil
   getRuleState() ketika section dirender.

   payroll.js tetap menjadi pusat pembacaan
   persisted rule.
*/

bindNewPeriodAction();
