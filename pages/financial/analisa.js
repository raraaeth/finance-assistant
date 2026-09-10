/* =====================================================
   Finance Assistant
   Module      : Financial
   File        : analisa.js
   Version     : 1.0.0

   Description :
   Financial Analysis Engine

   Source :
       Process.data

   Flow :

   Process.data
        ↓
   Period Filter
        ↓
   Keyword Search
        ↓
   Cashflow Classification
        ↓
   Daily Aggregation
        ↓
   Analysis Result
        ├── Summary
        ├── Chart
        ├── Top 5
        └── Details

   Principle :
   - Tidak membaca Google Sheets langsung.
   - Tidak membaca financial_activity langsung.
   - Tidak mengubah Process.
   - Tidak mengubah Input.
   - Tidak mengubah Edit Input.
   - Tidak mengubah Setting.
   - Process.data menjadi sumber transaksi.
   - category dari Process menjadi sumber
     penentuan income / expense.
   - Keyword dicari pada:
       type
       keterangan
===================================================== */


/* =====================================================
   CONSTANT
===================================================== */

const MIN_PERIOD_MONTHS = 1;

const MAX_PERIOD_MONTHS = 24;

const DEFAULT_PERIOD_MONTHS = 1;


/* =====================================================
   ANALYSIS STATE
===================================================== */

const state = {

    data : [],

    keyword : "",

    months : DEFAULT_PERIOD_MONTHS,

    result : null

};


/* =====================================================
   ANALISA
===================================================== */

export const Analisa = {


    /* =================================================
       STATE
    ================================================= */

    state : state,


    /* =================================================
       INIT
    ================================================= */

    init : function(

        data = []

    ){

        state.data =

            Array.isArray(

                data

            )

                ?

                data

                :

                [];


        state.keyword = "";

        state.months =

            DEFAULT_PERIOD_MONTHS;

        state.result = null;


        return Analisa;

    },


    /* =================================================
       SET DATA
    ================================================= */

    setData : function(

        data = []

    ){

        state.data =

            Array.isArray(

                data

            )

                ?

                data

                :

                [];


        return Analisa;

    },


    /* =================================================
       SET KEYWORD
    ================================================= */

    setKeyword : function(

        keyword = ""

    ){

        state.keyword =

            normalizeSearchText(

                keyword

            );


        return Analisa;

    },


    /* =================================================
       SET PERIOD
    ================================================= */

    setPeriod : function(

        months = DEFAULT_PERIOD_MONTHS

    ){

        state.months =

            normalizePeriod(

                months

            );


        return Analisa;

    },


    /* =================================================
       ANALYZE
    ================================================= */

    analyze : function(

        options = {}

    ){

        /*
         * Data bisa diberikan langsung.
         *
         * Jika tidak diberikan,
         * gunakan state.data.
         */

        const sourceData =

            Array.isArray(

                options.data

            )

                ?

                options.data

                :

                state.data;


        /*
         * Keyword bisa diberikan langsung.
         */

        const keyword =

            options.keyword !== undefined

                ?

                normalizeSearchText(

                    options.keyword

                )

                :

                state.keyword;


        /*
         * Period bisa diberikan langsung.
         */

        const months =

            options.months !== undefined

                ?

                normalizePeriod(

                    options.months

                )

                :

                state.months;


        /*
         * Reference date.
         *
         * Default menggunakan hari ini.
         *
         * Bisa diganti controller jika
         * diperlukan untuk testing.
         */

        const referenceDate =

            options.referenceDate

                ?

                normalizeDate(

                    options.referenceDate

                )

                :

                startOfDay(

                    new Date()

                );


        if(

            !referenceDate

        ){

            return createEmptyResult(

                keyword,

                months,

                null,

                null

            );

        }


        /*
         * Tentukan batas periode.
         */

        const period =

            getPeriodRange(

                referenceDate,

                months

            );


        /*
         * Filter transaksi.
         */

        const periodTransactions =

            filterByPeriod(

                sourceData,

                period.start,

                period.end

            );


        /*
         * Filter keyword.
         */

        const matchedTransactions =

            filterByKeyword(

                periodTransactions,

                keyword

            );


        /*
         * Pastikan setiap transaksi
         * mempunyai struktur analisa
         * yang konsisten.
         */

        const normalizedTransactions =

            matchedTransactions

                .map(

                    normalizeAnalysisTransaction

                )

                .filter(

                    Boolean

                );


        /*
         * Summary.
         */

        const summary =

            calculateSummary(

                normalizedTransactions

            );


        /*
         * Daily chart.
         */

        const chart =

            buildDailyChart(

                normalizedTransactions,

                period.start,

                period.end

            );


        /*
         * Top 5 hari terbesar.
         */

        const topDays =

            buildTopDays(

                chart.days

            );


        /*
         * Detail transaksi.
         */

        const details =

            buildDetails(

                normalizedTransactions

            );


        /*
         * Hasil final.
         */

        const result = {

            keyword :

                keyword,


            months :

                months,


            period : {

                start :

                    formatDateKey(

                        period.start

                    ),

                end :

                    formatDateKey(

                        period.end

                    ),

                startDate :

                    period.start,

                endDate :

                    period.end

            },


            count :

                normalizedTransactions.length,


            summary : summary,


            chart : chart,


            top5 : topDays,


            details : details

        };


        /*
         * Simpan state terakhir.
         */

        state.keyword = keyword;

        state.months = months;

        state.result = result;


        return result;

    },


    /* =================================================
       SEARCH
    ================================================= */

    search : function(

        keyword = "",

        months = DEFAULT_PERIOD_MONTHS,

        options = {}

    ){

        return Analisa.analyze({

            ...options,

            keyword :

                keyword,

            months :

                months

        });

    },


    /* =================================================
       GET RESULT
    ================================================= */

    getResult : function(){

        return state.result;

    },


    /* =================================================
       GET CURRENT DATA
    ================================================= */

    getData : function(){

        return Array.isArray(

            state.data

        )

            ?

            [

                ...state.data

            ]

            :

            [];

    },


    /* =================================================
       GET PERIOD OPTIONS
    ================================================= */

    getPeriodOptions : function(){

        return buildPeriodOptions();

    }

};


/* =====================================================
   CREATE EMPTY RESULT
===================================================== */

function createEmptyResult(

    keyword,

    months,

    start,

    end

){

    return {

        keyword :

            keyword || "",


        months :

            months,


        period : {

            start :

                start

                    ?

                    formatDateKey(

                        start

                    )

                    :

                    null,

            end :

                end

                    ?

                    formatDateKey(

                        end

                    )

                    :

                    null,

            startDate :

                start,

            endDate :

                end

        },


        count :

            0,


        summary : {

            income :

                0,

            expense :

                0,

            balance :

                0

        },


        chart : {

            labels : [],

            income : [],

            expense : [],

            days : []

        },


        top5 : [],


        details : []

    };

}


/* =====================================================
   NORMALIZE PERIOD
===================================================== */

function normalizePeriod(

    value

){

    const number =

        Number(

            value

        );


    if(

        !Number.isFinite(

            number

        )

    ){

        return DEFAULT_PERIOD_MONTHS;

    }


    return Math.min(

        MAX_PERIOD_MONTHS,

        Math.max(

            MIN_PERIOD_MONTHS,

            Math.floor(

                number

            )

        )

    );

}


/* =====================================================
   PERIOD OPTIONS
===================================================== */

function buildPeriodOptions(){

    const options = [];


    for(

        let month = MIN_PERIOD_MONTHS;

        month <= MAX_PERIOD_MONTHS;

        month++

    ){

        options.push({

            value :

                month,

            label :

                `${month} Bulan`

        });

    }


    return options;

}


/* =====================================================
   GET PERIOD RANGE
===================================================== */

/*
 * Periode dihitung mundur dari
 * referenceDate.
 *
 * Contoh:
 *
 * reference:
 * 10 September 2026
 *
 * 1 bulan:
 * 11 Agustus 2026
 * sampai
 * 10 September 2026
 *
 * Hari reference tetap termasuk.
 */

function getPeriodRange(

    referenceDate,

    months

){

    const end =

        startOfDay(

            referenceDate

        );


    const start =

        new Date(

            end

        );


    start.setMonth(

        start.getMonth() -

        months

    );


    /*
     * Geser satu hari supaya
     * periode berbentuk inclusive.
     *
     * Contoh:
     *
     * 1 bulan dari 10 Sep:
     * 10 Agu - 10 Sep
     *
     * Kita tidak menghilangkan
     * hari batas.
     */

    return {

        start :

            start,

        end :

            end

    };

}


/* =====================================================
   FILTER PERIOD
===================================================== */

function filterByPeriod(

    data,

    start,

    end

){

    if(

        !Array.isArray(

            data

        )

    ){

        return [];

    }


    return data.filter(

        item => {

            if(

                !item

            ){

                return false;

            }


            const date =

                getTransactionDate(

                    item

                );


            if(

                !date

            ){

                return false;

            }


            return (

                date >= start &&

                date <= end

            );

        }

    );

}


/* =====================================================
   FILTER KEYWORD
===================================================== */

/*
 * Keyword dicari pada:
 *
 * 1. type
 * 2. keterangan
 *
 * Jika keyword kosong:
 *
 * semua transaksi pada periode
 * dianggap match.
 */

function filterByKeyword(

    data,

    keyword

){

    if(

        !Array.isArray(

            data

        )

    ){

        return [];

    }


    const normalizedKeyword =

        normalizeSearchText(

            keyword

        );


    /*
     * Tanpa keyword:
     * tampilkan seluruh transaksi.
     */

    if(

        !normalizedKeyword

    ){

        return [

            ...data

        ];

    }


    return data.filter(

        item => {

            const type =

                normalizeSearchText(

                    item?.type

                );


            const keterangan =

                normalizeSearchText(

                    item?.keterangan

                );


            return (

                type.includes(

                    normalizedKeyword

                ) ||

                keterangan.includes(

                    normalizedKeyword

                )

            );

        }

    );

}


/* =====================================================
   NORMALIZE ANALYSIS TRANSACTION
===================================================== */

function normalizeAnalysisTransaction(

    item

){

    if(

        !item ||

        typeof item !== "object"

    ){

        return null;

    }


    const date =

        getTransactionDate(

            item

        );


    if(

        !date

    ){

        return null;

    }


    const category =

        normalizeSearchText(

            item.category

        );


    /*
     * Hanya transaksi yang sudah
     * berhasil diklasifikasikan
     * sebagai income / expense
     * yang masuk grafik.
     */

    if(

        category !== "income" &&

        category !== "expense"

    ){

        return null;

    }


    const nominal =

        toNumber(

            item.nominal

        );


    return {

        id :

            String(

                item.id ??

                ""

            ).trim(),


        date :

            formatDateKey(

                date

            ),


        dateObject :

            date,


        jenis :

            normalizeSearchText(

                item.jenis

            ),


        type :

            normalizeSearchText(

                item.type

            ),


        nominal :

            nominal,


        keterangan :

            String(

                item.keterangan ??

                ""

            ).trim(),


        category :

            category,


        debtAction :

            item.debtAction ??

            null,


        savingAction :

            item.savingAction ??

            null,


        nama :

            item.nama ??

            ""

    };

}


/* =====================================================
   GET TRANSACTION DATE
===================================================== */

function getTransactionDate(

    item

){

    if(

        item?.dateObject instanceof Date

    ){

        return normalizeDate(

            item.dateObject

        );

    }


    return normalizeDate(

        item?.date ??

        item?.Date ??

        item?.tanggal

    );

}


/* =====================================================
   CALCULATE SUMMARY
===================================================== */

function calculateSummary(

    transactions

){

    let income = 0;

    let expense = 0;


    transactions.forEach(

        item => {

            if(

                item.category ===

                "income"

            ){

                income +=

                    item.nominal;

            }


            else if(

                item.category ===

                "expense"

            ){

                expense +=

                    item.nominal;

            }

        }

    );


    return {

        income :

            income,


        expense :

            expense,


        balance :

            income -

            expense

    };

}


/* =====================================================
   BUILD DAILY CHART
===================================================== */

/*
 * Hasil:
 *
 * labels :
 *
 * [
 *   "2026-08-10",
 *   "2026-08-11",
 *   ...
 * ]
 *
 * income :
 *
 * [
 *   0,
 *   50000,
 *   ...
 * ]
 *
 * expense :
 *
 * [
 *   20000,
 *   0,
 *   ...
 * ]
 *
 * days :
 *
 * [
 *   {
 *      date,
 *      day,
 *      income,
 *      expense,
 *      total
 *   }
 * ]
 */

function buildDailyChart(

    transactions,

    start,

    end

){

    const dailyMap =

        new Map();


    /*
     * Buat semua hari terlebih dahulu.
     *
     * Dengan demikian hari tanpa
     * transaksi tetap mempunyai
     * nilai 0.
     */

    let cursor =

        new Date(

            start

        );


    while(

        cursor <= end

    ){

        const key =

            formatDateKey(

                cursor

            );


        dailyMap.set(

            key,

            {

                date :

                    key,

                dateObject :

                    new Date(

                        cursor

                    ),

                day :

                    getDayLabel(

                        cursor

                    ),

                income :

                    0,

                expense :

                    0,

                total :

                    0,

                transactionCount :

                    0

            }

        );


        cursor.setDate(

            cursor.getDate() +

            1

        );

    }


    /*
     * Masukkan transaksi.
     */

    transactions.forEach(

        item => {

            const day =

                dailyMap.get(

                    item.date

                );


            if(

                !day

            ){

                return;

            }


            if(

                item.category ===

                "income"

            ){

                day.income +=

                    item.nominal;

            }


            else if(

                item.category ===

                "expense"

            ){

                day.expense +=

                    item.nominal;

            }


            day.total =

                day.income +

                day.expense;


            day.transactionCount++;

        }

    );


    const days =

        Array.from(

            dailyMap.values()

        );


    return {

        labels :

            days.map(

                day =>

                    day.date

            ),


        income :

            days.map(

                day =>

                    day.income

            ),


        expense :

            days.map(

                day =>

                    day.expense

            ),


        days :

            days

    };

}


/* =====================================================
   BUILD TOP 5 DAYS
===================================================== */

/*
 * Top 5 berdasarkan total nominal
 * transaksi yang cocok pada hari.
 *
 * Jika satu hari memiliki:
 *
 * income  = 500.000
 * expense = 200.000
 *
 * total = 700.000
 *
 * Hari tersebut akan dinilai
 * berdasarkan 700.000.
 *
 * Tetapi income/expense tetap
 * dipisahkan pada hasilnya.
 */

function buildTopDays(

    days

){

    if(

        !Array.isArray(

            days

        )

    ){

        return [];

    }


    return days

        .filter(

            day =>

                day.total > 0

        )

        .sort(

            (a, b) => {

                if(

                    b.total !==

                    a.total

                ){

                    return (

                        b.total -

                        a.total

                    );

                }


                return String(

                    b.date

                ).localeCompare(

                    String(

                        a.date

                    )

                );

            }

        )

        .slice(

            0,

            5

        )

        .map(

            (day, index) => ({

                rank :

                    index + 1,


                date :

                    day.date,


                dateObject :

                    day.dateObject,


                day :

                    day.day,


                income :

                    day.income,


                expense :

                    day.expense,


                total :

                    day.total,


                transactionCount :

                    day.transactionCount,


                category :

                    getDominantCategory(

                        day

                    )

            })

        );

}


/* =====================================================
   GET DOMINANT CATEGORY
===================================================== */

function getDominantCategory(

    day

){

    if(

        day.income > day.expense

    ){

        return "income";

    }


    if(

        day.expense > day.income

    ){

        return "expense";

    }


    if(

        day.income > 0

    ){

        return "mixed";

    }


    return null;

}


/* =====================================================
   BUILD DETAILS
===================================================== */

/*
 * Semua transaksi yang match.
 *
 * Urutan:
 * terbaru → terlama
 */

function buildDetails(

    transactions

){

    if(

        !Array.isArray(

            transactions

        )

    ){

        return [];

    }


    return [

        ...transactions

    ]

        .sort(

            (a, b) => {

                const dateCompare =

                    b.dateObject.getTime() -

                    a.dateObject.getTime();


                if(

                    dateCompare !== 0

                ){

                    return dateCompare;

                }


                return (

                    b.nominal -

                    a.nominal

                );

            }

        )

        .map(

            (item, index) => ({

                index :

                    index + 1,


                id :

                    item.id,


                date :

                    item.date,


                dateObject :

                    item.dateObject,


                day :

                    getDayLabel(

                        item.dateObject

                    ),


                jenis :

                    item.jenis,


                type :

                    item.type,


                activity :

                    formatActivity(

                        item.type

                    ),


                nominal :

                    item.nominal,


                keterangan :

                    item.keterangan,


                category :

                    item.category,


                debtAction :

                    item.debtAction,


                savingAction :

                    item.savingAction,


                nama :

                    item.nama

            })

        );

}


/* =====================================================
   SEARCH TEXT
===================================================== */

function normalizeSearchText(

    value

){

    return String(

        value ?? ""

    )

        .trim()

        .toLowerCase()

        .normalize(

            "NFD"

        )

        .replace(

            /[\u0300-\u036f]/g,

            ""

        )

        .replace(

            /[\s_-]+/g,

            " "

        );

}


/* =====================================================
   NORMALIZE DATE
===================================================== */

function normalizeDate(

    value

){

    if(

        !value

    ){

        return null;

    }


    /*
     * Date object.
     */

    if(

        value instanceof Date

    ){

        if(

            Number.isNaN(

                value.getTime()

            )

        ){

            return null;

        }


        return new Date(

            value.getFullYear(),

            value.getMonth(),

            value.getDate()

        );

    }


    const text =

        String(

            value

        ).trim();


    /*
     * YYYY-MM-DD
     *
     * Juga aman untuk ISO:
     *
     * 2026-09-10T00:00:00.000Z
     */

    const isoMatch =

        text.match(

            /^(\d{4})-(\d{2})-(\d{2})/

        );


    if(

        isoMatch

    ){

        const year =

            Number(

                isoMatch[1]

            );


        const month =

            Number(

                isoMatch[2]

            );


        const day =

            Number(

                isoMatch[3]

            );


        const date =

            new Date(

                year,

                month - 1,

                day

            );


        if(

            Number.isNaN(

                date.getTime()

            )

        ){

            return null;

        }


        return date;

    }


    /*
     * Fallback Date parser.
     */

    const parsed =

        new Date(

            text

        );


    if(

        Number.isNaN(

            parsed.getTime()

        )

    ){

        return null;

    }


    return new Date(

        parsed.getFullYear(),

        parsed.getMonth(),

        parsed.getDate()

    );

}


/* =====================================================
   START OF DAY
===================================================== */

function startOfDay(

    date

){

    return new Date(

        date.getFullYear(),

        date.getMonth(),

        date.getDate()

    );

}


/* =====================================================
   FORMAT DATE KEY
===================================================== */

function formatDateKey(

    date

){

    return [

        date.getFullYear(),

        String(

            date.getMonth() + 1

        ).padStart(

            2,

            "0"

        ),

        String(

            date.getDate()

        ).padStart(

            2,

            "0"

        )

    ].join("-");

}


/* =====================================================
   DAY LABEL
===================================================== */

function getDayLabel(

    date

){

    return new Intl.DateTimeFormat(

        "id-ID",

        {

            weekday :

                "long"

        }

    ).format(

        date

    );

}


/* =====================================================
   FORMAT ACTIVITY
===================================================== */

function formatActivity(

    value

){

    if(

        !value

    ){

        return "-";

    }


    return String(

        value

    )

        .replace(

            /_/g,

            " "

        )

        .replace(

            /\b\w/g,

            character =>

                character.toUpperCase()

        );

}


/* =====================================================
   NUMBER
===================================================== */

function toNumber(

    value

){

    const number =

        Number(

            value

        );


    return Number.isFinite(

        number

    )

        ?

        number

        :

        0;

}


/* =====================================================
   DEBUG
===================================================== */

export function debugAnalisa(

    data = state.data,

    keyword = state.keyword,

    months = state.months

){

    const result =

        Analisa.analyze({

            data :

                data,

            keyword :

                keyword,

            months :

                months

        });


    console.log(

        "=========================================="

    );


    console.log(

        "===== FINANCIAL ANALISA DEBUG ====="

    );


    console.log(

        "=========================================="

    );


    console.log(

        "Keyword:",

        result.keyword

    );


    console.log(

        "Period:",

        result.period

    );


    console.log(

        "Count:",

        result.count

    );


    console.log(

        "Summary:",

        result.summary

    );


    console.log(

        "Chart:",

        result.chart

    );


    console.log(

        "Top 5:",

        result.top5

    );


    console.log(

        "Details:",

        result.details

    );


    console.log(

        "=========================================="

    );


    return result;

}


/* =====================================================
   GET PERIOD OPTIONS
===================================================== */

export function getAnalisaPeriodOptions(){

    return buildPeriodOptions();

}


/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default Analisa;
