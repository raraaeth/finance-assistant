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

        <div class="filter-wrapper">

            <button

                id="filter-period"

                class="filter-period"

            >

                <span

                    class="material-symbols-rounded"

                >

                    calendar_month

                </span>

                <span

                    class="filter-period-text"

                >

                    ${options.period}

                </span>

                <span

                    class="material-symbols-rounded"

                >

                    expand_more

                </span>

            </button>

            <div

                class="filter-chip-group"

            >

                ${Filter.renderRange(

                    options.range

                )}

            </div>

        </div>

        <div

            id="filter-overlay"

            class="filter-overlay hidden"

        >

        </div>

        <div

            id="filter-sheet"

            class="filter-sheet hidden"

        >

            <div

                class="filter-sheet-handle"

            >

            </div>

            <div

                class="filter-sheet-header"

            >

                <h3>

                    Pilih Periode

                </h3>

                <p>

                    Tentukan rentang tanggal
                    yang ingin ditampilkan.

                </p>

            </div>

            <div

                class="filter-sheet-body"

            >

                <div

                    class="filter-input"

                >

                    <label>

                        Tanggal Mulai

                    </label>

                    <input

                        id="filter-start"

                        type="date"

                    >

                </div>

                <div

                    class="filter-input"

                >

                    <label>

                        Tanggal Akhir

                    </label>

                    <input

                        id="filter-end"

                        type="date"

                    >

                </div>

            </div>

            <div

                class="filter-sheet-footer"

            >

                <button

                    id="filter-cancel"

                >

                    Batal

                </button>

                <button

                    id="filter-apply"

                >

                    Terapkan

                </button>

            </div>

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

                class="filter-chip

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

            ".filter-chip"

        );

    const overlay =

        document.getElementById(

            "filter-overlay"

        );

    const sheet =

        document.getElementById(

            "filter-sheet"

        );

    const cancel =

        document.getElementById(

            "filter-cancel"

        );

    const apply =

        document.getElementById(

            "filter-apply"

        );

    if(

        period

    ){

        period.addEventListener(

            "click",

            ()=>{

                Filter.openSheet();

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

                    Filter.setRange(

                        value

                    );

                    options.onRange(

                        value

                    );

                }

            );

        }

    );

    overlay?.addEventListener(

        "click",

        ()=>{

            Filter.closeSheet();

        }

    );

    cancel?.addEventListener(

        "click",

        ()=>{

            Filter.closeSheet();

        }

    );

    apply?.addEventListener(

        "click",

        ()=>{

            options.onPeriod();

            Filter.closeSheet();

        }

    );

};

/* =====================================================
   OPEN SHEET
===================================================== */

Filter.openSheet = function(){

    document

        .getElementById(

            "filter-overlay"

        )

        ?.classList.remove(

            "hidden"

        );

    document

        .getElementById(

            "filter-sheet"

        )

        ?.classList.remove(

            "hidden"

        );

};

/* =====================================================
   CLOSE SHEET
===================================================== */

Filter.closeSheet = function(){

    document

        .getElementById(

            "filter-overlay"

        )

        ?.classList.add(

            "hidden"

        );

    document

        .getElementById(

            "filter-sheet"

        )

        ?.classList.add(

            "hidden"

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

            ".filter-chip"

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

    const text =

        document.querySelector(

            ".filter-period-text"

        );

    if(

        !text

    ){

        return;

    }

    text.textContent =

        period;

};

/* =====================================================
   SET DATE
===================================================== */

Filter.setDate = function(

    start,

    end

){

    const startInput =

        document.getElementById(

            "filter-start"

        );

    const endInput =

        document.getElementById(

            "filter-end"

        );

    if(

        startInput

    ){

        startInput.value =

            formatDateInput(

                start

            );

    }

    if(

        endInput

    ){

        endInput.value =

            formatDateInput(

                end

            );

    }

};

/* =====================================================
   SET RANGE
===================================================== */

Filter.setRange = function(

    range

){

    Filter.setActive(

        range

    );

};

/* =====================================================
   HELPER
===================================================== */

function formatDateInput(

    date

){

    const year =

        date.getFullYear();

    const month =

        String(

            date.getMonth() + 1

        ).padStart(

            2,

            "0"

        );

    const day =

        String(

            date.getDate()

        ).padStart(

            2,

            "0"

        );

    return `${year}-${month}-${day}`;

}

