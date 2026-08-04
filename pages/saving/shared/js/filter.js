/* =====================================================
   Finance Assistant
   Workspace   : Shared
   Module      : Filter
   File        : filter.js
   Version     : 3.0.0

   Description :
   Shared Filter Component
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
   RENDER
===================================================== */

Filter.render = function(

    options

){

    const container =

        document.querySelector(

            options.container

        );

    if(

        !container

    ){

        return;

    }

    container.innerHTML =

    `

        <button

            id="filter-period"

            class="filter-period"

        >

            <span>

                📅

            </span>

            <span>

                ${options.period}

            </span>

        </button>

        <div

            id="filter-range"

            class="filter-range"

        >

            ${Filter.renderRange(

                options.range

            )}

        </div>

    `;

};


/* =====================================================
   RENDER RANGE
===================================================== */

Filter.renderRange = function(

    active = 6

){

    return Filter.range.map(

        item =>

        `

            <button

                class="filter-button

                ${

                    item.value === active

                    ?

                    "active"

                    :

                    ""

                }"

                data-range="${item.value}"

            >

                ${item.label}

            </button>

        `

    ).join("");

};


/* =====================================================
   REGISTER
===================================================== */

Filter.register = function(

    options

){

    const period =

        document.getElementById(

            "filter-period"

        );

    const buttons =

        document.querySelectorAll(

            ".filter-button"

        );

    if(

        period

    ){

        period.addEventListener(

            "click",

            ()=>{

                options.onPeriod();

            }

        );

    }

    buttons.forEach(

        button=>{

            button.addEventListener(

                "click",

                ()=>{

                    const value =

                        Number(

                            button.dataset.range

                        );

                    Filter.setActive(

                        value

                    );

                    options.onRange(

                        value

                    );

                }

            );

        }

    );

};


/* =====================================================
   SET ACTIVE
===================================================== */

Filter.setActive = function(

    range

){

    document

        .querySelectorAll(

            ".filter-button"

        )

        .forEach(

            button=>{

                button.classList.toggle(

                    "active",

                    Number(

                        button.dataset.range

                    )===Number(

                        range

                    )

                );

            }

        );

};


/* =====================================================
   SET PERIOD
===================================================== */

Filter.setPeriod = function(

    period

){

    const button =

        document.getElementById(

            "filter-period"

        );

    if(

        !button

    ){

        return;

    }

    button.innerHTML =

    `

        <span>

            📅

        </span>

        <span>

            ${period}

        </span>

    `;

};

