/* =====================================================
   Finance Assistant
   Workspace   : Shared
   Module      : Filter
   File        : filter.js
   Version     : 1.0.0

   Description :
   Shared Filter Helper
===================================================== */


/* =====================================================
   FILTER
===================================================== */

export const Filter = {};


/* =====================================================
   PERIOD
===================================================== */

Filter.period = [

    {

        value : "today",

        label : "Hari Ini"

    },

    {

        value : "yesterday",

        label : "Kemarin"

    },

    {

        value : "7days",

        label : "7 Hari Terakhir"

    },

    {

        value : "30days",

        label : "30 Hari Terakhir"

    },

    {

        value : "month",

        label : "Bulan Ini"

    },

    {

        value : "last-month",

        label : "Bulan Lalu"

    },

    {

        value : "year",

        label : "Tahun Ini"

    },

    {

        value : "all",

        label : "Semua"

    }

];


/* =====================================================
   RANGE
===================================================== */

Filter.range = [

    {

        value : 1,

        label : "1 Bulan"

    },

    {

        value : 3,

        label : "3 Bulan"

    },

    {

        value : 6,

        label : "6 Bulan"

    },

    {

        value : 12,

        label : "12 Bulan"

    }

];


/* =====================================================
   CREATE OPTION
===================================================== */

Filter.createOption = function(

    data,

    selected = null

){

    return data.map(

        item =>

        `

        <option

            value="${item.value}"

            ${

                item.value === selected

                ?

                "selected"

                :

                ""

            }

        >

            ${item.label}

        </option>

        `

    ).join("");

};
