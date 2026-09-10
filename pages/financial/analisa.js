/* =====================================================
   Finance Assistant
   Module      : Financial
   File        : analisa.js
   Version     : 1.1.0

   Description :
   Financial Analysis Engine + UI Controller

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
        ↓
   UI Rendering

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

const DETAIL_PAGE_SIZE = 5;


/* =====================================================
   DOM ID
===================================================== */

const DOM = {

    section :
        "summary-financial-analysis",

    card :
        "summary-financial-analysis-card",

    search :
        "financial-analysis-search-input",

    chart :
        "financial-analysis-chart",

    trending :
        "financial-analysis-trending-list",

    resultInfo :
        "financial-analysis-result-info",

    resultList :
        "financial-analysis-result-list",

    empty :
        "financial-analysis-empty",

    period :
        "financial-analysis-period-select"

};


/* =====================================================
   ANALYSIS STATE
===================================================== */

const state = {

    data : [],

    keyword : "",

    months : DEFAULT_PERIOD_MONTHS,

    result : null,

    chartInstance : null,

    initialized : false,

    detailPage : 1

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


        /*
         * Bersihkan chart lama.
         */

        destroyChart();


        /*
         * Siapkan UI.
         */

        setupUI();


        /*
         * Buka section Analisa.
         */

        showSection();


        /*
         * Render analisa pertama.
         */

        render();


        state.initialized = true;


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


        if(

            state.initialized

        ){

            render();

        }


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

       state.detailPage = 1;


        if(

            state.initialized

        ){

            render();

        }


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

       state.detailPage = 1;


        if(

            state.initialized

        ){

            render();

        }


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


            summary :

                summary,


            chart :

                chart,


            top5 :

                topDays,


            details :

                details

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
   UI SETUP
===================================================== */

function setupUI(){

    const searchInput =

        document.getElementById(

            DOM.search

        );


    const periodSelect =

        document.getElementById(

            DOM.period

        );


    /*
     * Hindari listener ganda.
     */

    if(

        searchInput &&

        searchInput.dataset.analisaReady !== "true"

    ){

        searchInput.addEventListener(

            "input",

            function(event){

                state.keyword =

                    normalizeSearchText(

                        event.target.value

                    );


                render();

            }

        );


        searchInput.dataset.analisaReady = "true";

    }


    /*
     * Periode.
     */

    if(

        periodSelect &&

        periodSelect.dataset.analisaReady !== "true"

    ){

        populatePeriodSelect(

            periodSelect

        );


        periodSelect.value =

            String(

                state.months

            );


        periodSelect.addEventListener(

            "change",

            function(event){

                state.months =

                    normalizePeriod(

                        event.target.value

                    );


                render();

            }

        );


        periodSelect.dataset.analisaReady = "true";

    }

    else if(

        periodSelect

    ){

        periodSelect.value =

            String(

                state.months

            );

    }

}


/* =====================================================
   SHOW SECTION
===================================================== */

function showSection(){

    const section =

        document.getElementById(

            DOM.section

        );


    if(

        !section

    ){

        return;

    }


    section.classList.remove(

        "hidden"

    );

}


/* =====================================================
   RENDER
===================================================== */

function render(){

    const section =

        document.getElementById(

            DOM.section

        );


    if(

        !section

    ){

        return;

    }


    /*
     * Section selalu dibuka ketika
     * Analisa dijalankan.
     */

    section.classList.remove(

        "hidden"

    );


    /*
     * Pastikan period select sinkron.
     */

    const periodSelect =

        document.getElementById(

            DOM.period

        );


    if(

        periodSelect

    ){

        populatePeriodSelect(

            periodSelect

        );


        periodSelect.value =

            String(

                state.months

            );

    }


    /*
     * Pastikan search sinkron.
     */

    const searchInput =

        document.getElementById(

            DOM.search

        );


    if(

        searchInput &&

        searchInput.value !==

            state.keyword

    ){

        searchInput.value =

            state.keyword;

    }


    /*
     * Jalankan engine.
     */

    const result =

        Analisa.analyze();


    /*
     * Render seluruh UI.
     */

    renderChart(

        result

    );


    renderTrending(

        result

    );


    renderDetails(

        result

    );

}


/* =====================================================
   POPULATE PERIOD SELECT
===================================================== */

function populatePeriodSelect(

    select

){

    if(

        !select

    ){

        return;

    }


    const currentValue =

        normalizePeriod(

            select.value ||

            state.months

        );


    const options =

        buildPeriodOptions();


    select.innerHTML =

        options

            .map(

                option => `

                    <option value="${option.value}">

                        ${escapeHTML(option.label)}

                    </option>

                `

            )

            .join("");


    select.value =

        String(

            state.months ||

            currentValue

        );

}


/* =====================================================
   RENDER CHART
===================================================== */

function renderChart(

    result

){

    const canvas =

        document.getElementById(

            DOM.chart

        );


    if(

        !canvas

    ){

        return;

    }


    destroyChart();


    const chartData =

        result?.chart;


    if(

        !chartData ||

        !chartData.labels.length

    ){

        clearCanvas(

            canvas

        );

        return;

    }


    /*
     * Chart.js tersedia secara global
     * melalui index.html.
     */

    const ChartJS =

        window.Chart;


    if(

        typeof ChartJS !==

        "function"

    ){

        console.warn(

            "[Analisa] Chart.js tidak tersedia."

        );

        return;

    }


    const context =

        canvas.getContext(

            "2d"

        );


    if(

        !context

    ){

        return;

    }


    state.chartInstance =

        new ChartJS(

            context,

            {

                type :

                    "line",


                data : {

                    labels :

                        chartData.labels.map(

                            formatChartLabel

                        ),


                    datasets : [

                        {

                            label :

                                "Pemasukan",


                            data :

                                chartData.income,


                            borderColor :

                                "#2E7D32",


                            backgroundColor :

                                "rgba(46,125,50,0.08)",


                            borderWidth :

                                2,


                            tension :

                                0.3,


                            fill :

                                false,


                            pointRadius :

                                2,


                            pointHoverRadius :

                                4

                        },


                        {

                            label :

                                "Pengeluaran",


                            data :

                                chartData.expense,


                            borderColor :

                                "#D32F2F",


                            backgroundColor :

                                "rgba(211,47,47,0.08)",


                            borderWidth :

                                2,


                            tension :

                                0.3,


                            fill :

                                false,


                            pointRadius :

                                2,


                            pointHoverRadius :

                                4

                        }

                    ]

                },


                options : {

                    responsive :

                        true,


                    maintainAspectRatio :

                        false,


                    interaction : {

                        mode :

                            "index",

                        intersect :

                            false

                    },


                    plugins : {

                        legend : {

                            display :

                                true

                        },


                        tooltip : {

                            callbacks : {

                                label :

                                    function(

                                        context

                                    ){

                                        return (

                                            context.dataset.label +

                                            ": " +

                                            formatRupiah(

                                                context.parsed.y

                                            )

                                        );

                                    }

                            }

                        }

                    },


                    scales : {

                        x : {

                            ticks : {

                                maxTicksLimit :

                                    8

                            }

                        },


                        y : {

                            beginAtZero :

                                true,


                            ticks : {

                                callback :

                                    function(

                                        value

                                    ){

                                        return shortRupiah(

                                            value

                                        );

                                    }

                            }

                        }

                    }

                }

            }

        );

}


/* =====================================================
   DESTROY CHART
===================================================== */

function destroyChart(){

    if(

        state.chartInstance &&

        typeof state.chartInstance.destroy ===

            "function"

    ){

        state.chartInstance.destroy();

    }


    state.chartInstance = null;

}


/* =====================================================
   CLEAR CANVAS
===================================================== */

function clearCanvas(

    canvas

){

    if(

        !canvas

    ){

        return;

    }


    const context =

        canvas.getContext(

            "2d"

        );


    if(

        !context

    ){

        return;

    }


    context.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );

}


/* =====================================================
   RENDER TRENDING
===================================================== */

function renderTrending(

    result

){

    const container =

        document.getElementById(

            DOM.trending

        );


    if(

        !container

    ){

        return;

    }


    const top5 =

        Array.isArray(

            result?.top5

        )

            ?

            result.top5

            :

            [];


    container.innerHTML = "";


    if(

        !top5.length

    ){

        container.innerHTML = `

            <div class="financial-analysis-empty">

                Belum ada transaksi pada periode ini.

            </div>

        `;

        return;

    }


    container.innerHTML =

        top5

            .map(

                item =>

                    createTrendingItem(

                        item

                    )

            )

            .join("");

}


/* =====================================================
   CREATE TRENDING ITEM
===================================================== */

function createTrendingItem(

    item

){

    const categoryClass =

        item.category === "income"

            ?

            "income"

            :

            item.category === "expense"

                ?

                "expense"

                :

                "mixed";


    return `

        <div class="financial-analysis-trending-item ${categoryClass}">


            <div class="financial-analysis-trending-date">

                ${formatDisplayDate(item.date)}

            </div>


            <div class="financial-analysis-trending-weekday">

                ${escapeHTML(item.day)}

            </div>


            <div class="financial-analysis-trending-amount ${categoryClass}">

                ${formatRupiah(item.total)}

            </div>


        </div>

    `;

}


/* =====================================================
   RENDER DETAILS
===================================================== */

function renderDetails(

    result

){

    const info =

        document.getElementById(

            DOM.resultInfo

        );


    const list =

        document.getElementById(

            DOM.resultList

        );


    const empty =

        document.getElementById(

            DOM.empty

        );


    const count =

        Number(

            result?.count

        ) || 0;


    /*
     * Info.
     */

    if(

        info

    ){

        info.innerHTML = `

            <span>

                ${count}

                transaksi

            </span>

            <span>

                ${formatPeriodText(result)}

            </span>

        `;

    }


    /*
     * List.

     */

    if(

        !list

    ){

        return;

    }


    list.innerHTML = "";


    /*
     * Empty.

     */

    if(

        !count

    ){

        if(

            empty

        ){

            empty.classList.remove(

                "hidden"

            );

        }


        return;

    }


    if(

        empty

    ){

        empty.classList.add(

            "hidden"

        );

    }


    list.innerHTML =

        result.details

            .map(

                item =>

                    createResultItem(

                        item

                    )

            )

            .join("");

}


/* =====================================================
   CREATE RESULT ITEM
===================================================== */

function createResultItem(

    item

){

    const amountClass =

        item.category === "income"

            ?

            "income"

            :

            "expense";


    const sign =

        item.category === "income"

            ?

            "+"

            :

            "-";


    return `

        <div class="financial-analysis-result-item ${amountClass}">


            <div class="financial-analysis-result-info-group">


                <div class="financial-analysis-result-date">

                    ${formatDisplayDate(item.date)}

                    <span>

                        ${escapeHTML(item.day)}

                    </span>

                </div>


                <div class="financial-analysis-result-activity">

                    ${escapeHTML(item.activity)}

                </div>


                <div class="financial-analysis-result-note">

                    ${

                        item.keterangan

                            ?

                            escapeHTML(

                                item.keterangan

                            )

                            :

                            "-"

                    }

                </div>


            </div>


            <div class="financial-analysis-result-amount ${amountClass}">

                ${sign}

                ${formatRupiah(item.nominal)}

            </div>


        </div>

    `;

}


/* =====================================================
   FORMAT PERIOD TEXT
===================================================== */

function formatPeriodText(

    result

){

    if(

        !result?.period?.start ||

        !result?.period?.end

    ){

        return "-";

    }


    return (

        formatDisplayDate(

            result.period.start

        ) +

        " - " +

        formatDisplayDate(

            result.period.end

        )

    );

}


/* =====================================================
   FORMAT CHART LABEL
===================================================== */

function formatChartLabel(

    value

){

    const date =

        normalizeDate(

            value

        );


    if(

        !date

    ){

        return value;

    }


    return (

        String(

            date.getDate()

        ).padStart(

            2,

            "0"

        ) +

        "/" +

        String(

            date.getMonth() + 1

        ).padStart(

            2,

            "0"

        )

    );

}


/* =====================================================
   FORMAT DISPLAY DATE
===================================================== */

function formatDisplayDate(

    value

){

    const date =

        normalizeDate(

            value

        );


    if(

        !date

    ){

        return "-";

    }


    return new Intl.DateTimeFormat(

        "id-ID",

        {

            day :

                "2-digit",

            month :

                "short",

            year :

                "numeric"

        }

    ).format(

        date

    );

}


/* =====================================================
   FORMAT RUPIAH
===================================================== */

function formatRupiah(

    value

){

    try{

        return rupiah(

            value

        );

    }

    catch(

        error

    ){

        return (

            "Rp " +

            Number(

                value || 0

            ).toLocaleString(

                "id-ID"

            )

        );

    }

}


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
 * 10 Agustus 2026
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
     * Hanya income / expense
     * yang masuk analisa.
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

function buildDailyChart(

    transactions,

    start,

    end

){

    const dailyMap =

        new Map();


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
   ESCAPE HTML
===================================================== */

function escapeHTML(

    value

){

    return String(

        value ?? ""

    )

        .replace(

            /&/g,

            "&amp;"

        )

        .replace(

            /</g,

            "&lt;"

        )

        .replace(

            />/g,

            "&gt;"

        )

        .replace(

            /"/g,

            "&quot;"

        )

        .replace(

            /'/g,

            "&#039;"

        );

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
