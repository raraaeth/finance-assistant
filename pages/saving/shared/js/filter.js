/* =====================================================
   Finance Assistant
   Workspace   : Shared
   Module      : Filter
   File        : filter.js
   Version     : 2.0.0

   Description :
   Shared Filter Helper
===================================================== */


/* =====================================================
   FILTER
===================================================== */

export const Filter = {};


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

        item=>`

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


/* =====================================================
   SET RANGE
===================================================== */

Filter.setRange = function(

    id,

    selected = 6

){

    const select =

        document.getElementById(

            id

        );

    if(

        !select

    ){

        return;

    }

    select.innerHTML =

        Filter.createOption(

            Filter.range,

            selected

        );

};


/* =====================================================
   GET VALUE
===================================================== */

Filter.getValue = function(

    id

){

    const element =

        document.getElementById(

            id

        );

    return element ?

        element.value

        :

        null;

};
