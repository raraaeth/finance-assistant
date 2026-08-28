/* =====================================================
   Finance Assistant
   Page        : Financial
   Module      : Summary Detail
   File        : detail.js
   Version     : 1.0.0

   Description :
   Financial Summary Transaction Detail Engine

   Handles :
   - Monthly Filter
   - Jenis Filter
   - Kategori Filter
   - Keyword Grouping
   - Nominal Aggregation
   - Pagination
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Process

} from "./process.js";


/* =====================================================
   STATE
===================================================== */

export const SummaryDetail = {

    initialized : false,

    data : [],

    filtered : [],

    groups : [],

    filters : {

        month : "",

        jenis : "",

        category : ""

    },

    pagination : {

        page : 1,

        perPage : 3,

        totalPages : 1

    }

};


/* =====================================================
   INIT
===================================================== */

SummaryDetail.init = function(){

    SummaryDetail.initialized = false;

    SummaryDetail.data = [];

    SummaryDetail.filtered = [];

    SummaryDetail.groups = [];

    SummaryDetail.filters = {

        month : "",

        jenis : "",

        category : ""

    };

    SummaryDetail.pagination = {

        page : 1,

        perPage : 3,

        totalPages : 1

    };


    if(

        !Array.isArray(

            Process.data

        )

    ){

        return SummaryDetail;

    }


    SummaryDetail.data = [

        ...Process.data

    ];


    SummaryDetail.initialized = true;


    return SummaryDetail;

};


/* =====================================================
   FILTER
===================================================== */

SummaryDetail.setFilter = function({

    month,

    jenis,

    category

} = {}){


    SummaryDetail.filters = {

        month :

            month ??

            "",

        jenis :

            jenis ??

            "",

        category :

            category ??

            ""

    };


    SummaryDetail.pagination.page = 1;


    process();


    return SummaryDetail.getResult();

};


/* =====================================================
   PROCESS
===================================================== */

function process(){

    SummaryDetail.filtered =

        filterData(

            SummaryDetail.data

        );


    SummaryDetail.groups =

        groupByKeyword(

            SummaryDetail.filtered

        );


    SummaryDetail.pagination.totalPages =

        Math.max(

            1,

            Math.ceil(

                SummaryDetail.groups.length /

                SummaryDetail.pagination.perPage

            )

        );


    if(

        SummaryDetail.pagination.page >

        SummaryDetail.pagination.totalPages

    ){

        SummaryDetail.pagination.page =

            SummaryDetail.pagination.totalPages;

    }

}


/* =====================================================
   FILTER DATA
===================================================== */

function filterData(

    data

){

    return data.filter(

        item => {

            if(

                !item

            ){

                return false;

            }


            /* =========================================
               MONTH
            ========================================= */

            if(

                SummaryDetail.filters.month

            ){

                if(

                    !matchesMonth(

                        item,

                        SummaryDetail.filters.month

                    )

                ){

                    return false;

                }

            }


            /* =========================================
               JENIS
            ========================================= */

            if(

                SummaryDetail.filters.jenis

            ){

                if(

                    normalize(

                        item.jenis

                    ) !==

                    normalize(

                        SummaryDetail.filters.jenis

                    )

                ){

                    return false;

                }

            }


            /* =========================================
               CATEGORY
            ========================================= */

            if(

                SummaryDetail.filters.category

            ){

                if(

                    normalize(

                        item.type

                    ) !==

                    normalize(

                        SummaryDetail.filters.category

                    )

                ){

                    return false;

                }

            }


            return true;

        }

    );

}


/* =====================================================
   MONTH MATCH
===================================================== */

function matchesMonth(

    item,

    month

){

    if(

        !item.date

    ){

        return false;

    }


    const value =

        String(

            item.date

        ).trim();


    /*
     * Format yang diharapkan:
     *
     * YYYY-MM-DD
     *
     * Contoh:
     * 2026-08-15
     */

    if(

        value.length < 7

    ){

        return false;

    }


    return value.substring(

        0,

        7

    ) ===

    month;

}


/* =====================================================
   GROUP KEYWORD
===================================================== */

function groupByKeyword(

    data

){

    const groups = {};


    data.forEach(

        item => {

            const keyword =

                detectKeyword(

                    item.keterangan

                );


            if(

                !keyword

            ){

                return;

            }


            const key =

                normalize(

                    keyword

                );


            if(

                !groups[key]

            ){

                groups[key] = {

                    keyword,

                    total : 0,

                    count : 0,

                    transactions : []

                };

            }


            const nominal =

                toNumber(

                    item.nominal

                );


            groups[key].total +=

                nominal;


            groups[key].count++;


            groups[key].transactions.push(

                item

            );

        }

    );


    return Object.values(

        groups

    )

    .sort(

        (

            a,

            b

        ) =>

            b.total -

            a.total

    );

}


/* =====================================================
   KEYWORD DETECTION
===================================================== */

function detectKeyword(

    value

){

    if(

        !value

    ){

        return null;

    }


    const text =

        normalize(

            value

        );


    if(

        !text

    ){

        return null;

    }


    /*
     * ================================================
     * TEMPORARY KEYWORD ENGINE
     * ================================================
     *
     * Untuk testing kita gunakan kata pertama
     * yang cukup berarti dari keterangan.
     *
     * Nanti bagian ini bisa kita upgrade menjadi:
     *
     * keyword rules
     * stop words
     * synonym
     * manual keyword
     * AI grouping
     *
     * tanpa mengubah engine lainnya.
     */


    const stopWords = [

        "beli",

        "bayar",

        "pembelian",

        "untuk",

        "dan",

        "di",

        "ke",

        "dari",

        "yang",

        "dengan",

        "uang",

        "jajan",

        "belanja"

    ];


    const words =

        text

            .replace(

                /[^a-z0-9\s]/gi,

                " "

            )

            .split(

                /\s+/

            )

            .filter(

                Boolean

            );


    /*
     * Cari kata yang bukan stop word.
     */

    for(

        const word of words

    ){

        if(

            word.length < 3

        ){

            continue;

        }


        if(

            stopWords.includes(

                word

            )

        ){

            continue;

        }


        return word;

    }


    return null;

}


/* =====================================================
   PAGINATION
===================================================== */

SummaryDetail.next = function(){

    if(

        SummaryDetail.pagination.page <

        SummaryDetail.pagination.totalPages

    ){

        SummaryDetail.pagination.page++;

    }


    return SummaryDetail.getResult();

};


SummaryDetail.previous = function(){

    if(

        SummaryDetail.pagination.page > 1

    ){

        SummaryDetail.pagination.page--;

    }


    return SummaryDetail.getResult();

};


/* =====================================================
   CURRENT PAGE
===================================================== */

function getCurrentPage(){

    const start =

        (

            SummaryDetail.pagination.page -

            1

        )

        *

        SummaryDetail.pagination.perPage;


    const end =

        start +

        SummaryDetail.pagination.perPage;


    return SummaryDetail.groups.slice(

        start,

        end

    );

}


/* =====================================================
   RESULT
===================================================== */

SummaryDetail.getResult = function(){

    return {

        filters : {

            ...SummaryDetail.filters

        },


        items :

            getCurrentPage(),


        totalItems :

            SummaryDetail.groups.length,


        page :

            SummaryDetail.pagination.page,


        perPage :

            SummaryDetail.pagination.perPage,


        totalPages :

            SummaryDetail.pagination.totalPages,


        hasPrevious :

            SummaryDetail.pagination.page > 1,


        hasNext :

            SummaryDetail.pagination.page <

            SummaryDetail.pagination.totalPages

    };

};


/* =====================================================
   GET ALL GROUPS
===================================================== */

SummaryDetail.getGroups = function(){

    return SummaryDetail.groups.map(

        group => ({

            ...group,

            transactions :

                [

                    ...group.transactions

                ]

        })

    );

};


/* =====================================================
   GET FILTER OPTIONS
===================================================== */

SummaryDetail.getMonths = function(){

    const months = new Set();


    SummaryDetail.data.forEach(

        item => {

            if(

                !item?.date

            ){

                return;

            }


            const date =

                String(

                    item.date

                );


            if(

                date.length >= 7

            ){

                months.add(

                    date.substring(

                        0,

                        7

                    )

                );

            }

        }

    );


    return Array.from(

        months

    )

    .sort()

    .reverse();

};


SummaryDetail.getJenis = function(){

    return uniqueValues(

        SummaryDetail.data,

        "jenis"

    );

};


SummaryDetail.getCategories = function(

    jenis = ""

){

    const data =

        jenis

            ?

            SummaryDetail.data.filter(

                item =>

                    normalize(

                        item.jenis

                    ) ===

                    normalize(

                        jenis

                    )

            )

            :

            SummaryDetail.data;


    return uniqueValues(

        data,

        "type"

    );

};


/* =====================================================
   UNIQUE VALUES
===================================================== */

function uniqueValues(

    data,

    field

){

    return [

        ...

        new Set(

            data

                .map(

                    item =>

                        normalize(

                            item?.[field]

                        )

                )

                .filter(

                    Boolean

                )

        )

    ];

}


/* =====================================================
   NUMBER
===================================================== */

function toNumber(

    value

){

    if(

        typeof value ===

        "number"

    ){

        return Number.isFinite(

            value

        )

            ?

            value

            :

            0;

    }


    if(

        value ===

        null ||

        value ===

        undefined ||

        value ===

        ""

    ){

        return 0;

    }


    const number =

        Number(

            String(

                value

            )

            .replace(

                /[^0-9.-]/g,

                ""

            )

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
   NORMALIZE
===================================================== */

function normalize(

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
   MONTH LABEL
===================================================== */

SummaryDetail.formatMonth = function(

    value

){

    if(

        !value

    ){

        return "-";

    }


    const parts =

        String(

            value

        )

        .split("-");


    if(

        parts.length !== 2

    ){

        return value;

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

        !year ||

        !month

    ){

        return value;

    }


    const date =

        new Date(

            year,

            month - 1,

            1

        );


    return date.toLocaleDateString(

        "id-ID",

        {

            month :

                "long",

            year :

                "numeric"

        }

    );

};
