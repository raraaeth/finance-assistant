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

export const Filter = {

    container : null,

    callback : null,

    period : "",

    activeRange : 6

};


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

Filter.render(

    options

)

    Filter.container =

    document.querySelector(

        options.container

    );

Filter.period =

    options.period;

Filter.activeRange =

    options.range;

Filter.callback =

    options.callback;

    if(

        !element

    ){

        return;

    }

    Filter.container.innerHTML =

    `

        <button

            id="filter-period"

            class="filter-period"

        >

            <span>

                📅

            </span>

            <span>

                ${period}

            </span>

        </button>

        <div

            id="filter-range"

            class="filter-range"

        >

            ${Filter.renderRange(

                range

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

Filter.register = function(){

    ...
}{

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

                callback(

                    "period"

                );

            }

        );

    }

    buttons.forEach(

        button=>{

            button.addEventListener(

                "click",

                ()=>{

                    Filter.setActive(

                        button.dataset.range

                    );

                    callback(

                        "range",

                        Number(

                            button.dataset.range

                        )

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

/* =====================================================
   SET RANGE
===================================================== */

Filter.setRange = function(

    range

){

    Filter.range =

        Number(

            range

        );

    Filter.setActive(

        range

    );

};

