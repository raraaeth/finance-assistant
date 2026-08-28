/* =====================================================
   Finance Assistant
   Workspace   : Shared
   Module      : Filter
   File        : filter.js
   Version     : 3.1.0

   Description :
   Shared Filter Component

   Existing :
   - Range Filter
   - Custom Date Filter

   Added :
   - Detail Filter
   - Month
   - Jenis
   - Kategori

   Notes :
   - Existing Filter API is NOT changed.
   - Detail Filter is an additional component.
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

    const cancel =

        document.getElementById(

            "filter-cancel"

        );

    const apply =

        document.getElementById(

            "filter-apply"

        );

    const startInput =

        document.getElementById(

            "filter-start"

        );

    const endInput =

        document.getElementById(

            "filter-end"

        );

    period?.addEventListener(

        "click",

        ()=>{

            Filter.openSheet();

        }

    );

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

            options.onPeriod({

                start :

                    startInput.value,

                end :

                    endInput.value

            });

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


/* =====================================================
   DETAIL FILTER
=====================================================

   NEW SHARED COMPONENT

   Digunakan untuk:

   - Summary Detail
   - Workspace lain
   - Filter berdasarkan bulan
   - Filter berdasarkan jenis
   - Filter berdasarkan kategori

   Tidak mengubah Filter.render()
   Tidak mengubah Filter.register()
   Tidak mengubah API filter lama.
===================================================== */


/* =====================================================
   DETAIL STATE
===================================================== */

Filter.detail = {

    initialized : false,

    container : null,

    options : {

        month : [],

        jenis : [],

        category : []

    },

    values : {

        month : "",

        jenis : "",

        category : ""

    }

};


/* =====================================================
   DETAIL RENDER
===================================================== */

Filter.renderDetail = function(

    options = {}

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


    /* =============================================
       NORMALIZE OPTIONS
    ============================================= */

    const months =

        Array.isArray(

            options.months

        )

            ?

            options.months

            :

            [];


    const jenis =

        Array.isArray(

            options.jenis

        )

            ?

            options.jenis

            :

            [];


    const categories =

        Array.isArray(

            options.categories

        )

            ?

            options.categories

            :

            [];


    /* =============================================
       SAVE STATE
    ============================================= */

    Filter.detail.initialized = true;

    Filter.detail.container =

        container;


    Filter.detail.options = {

        month :

            months,

        jenis :

            jenis,

        category :

            categories

    };


    Filter.detail.values = {

        month :

            options.value?.month ??

            months[0] ??

            "",

        jenis :

            options.value?.jenis ??

            jenis[0] ??

            "",

        category :

            options.value?.category ??

            categories[0] ??

            ""

    };


    /* =============================================
       RENDER
    ============================================= */

    container.innerHTML =

    `

        <div class="filter-detail-wrapper">


            <!-- =================================
                 MONTH
            ================================== -->

            <div class="filter-detail-field">


                <label class="filter-detail-label">

                    Bulan

                </label>


                <div class="filter-detail-select-wrap">


                    <span

                        class="material-symbols-rounded
                               filter-detail-icon"

                    >

                        calendar_month

                    </span>


                    <select

                        class="filter-detail-select"

                        data-detail-filter="month"

                    >

                        ${

                            Filter.renderDetailOptions(

                                months,

                                Filter.detail.values.month,

                                "month"

                            )

                        }

                    </select>


                </div>


            </div>


            <!-- =================================
                 JENIS
            ================================== -->

            <div class="filter-detail-field">


                <label class="filter-detail-label">

                    Jenis

                </label>


                <div class="filter-detail-select-wrap">


                    <span

                        class="material-symbols-rounded
                               filter-detail-icon"

                    >

                        swap_vert

                    </span>


                    <select

                        class="filter-detail-select"

                        data-detail-filter="jenis"

                    >

                        ${

                            Filter.renderDetailOptions(

                                jenis,

                                Filter.detail.values.jenis,

                                "text"

                            )

                        }

                    </select>


                </div>


            </div>


            <!-- =================================
                 KATEGORI
            ================================== -->

            <div class="filter-detail-field">


                <label class="filter-detail-label">

                    Kategori

                </label>


                <div class="filter-detail-select-wrap">


                    <span

                        class="material-symbols-rounded
                               filter-detail-icon"

                    >

                        category

                    </span>


                    <select

                        class="filter-detail-select"

                        data-detail-filter="category"

                    >

                        ${

                            Filter.renderDetailOptions(

                                categories,

                                Filter.detail.values.category,

                                "text"

                            )

                        }

                    </select>


                </div>


            </div>


        </div>

    `;


    /* =============================================
       REGISTER EVENT
    ============================================= */

    Filter.registerDetail(

        options

    );


    return Filter;

};


/* =====================================================
   DETAIL OPTIONS
===================================================== */

Filter.renderDetailOptions = function(

    values = [],

    active = "",

    type = "text"

){

    if(

        !Array.isArray(values) ||

        !values.length

    ){

        return `

            <option value="">

                Tidak tersedia

            </option>

        `;

    }


    return values

        .map(

            value => {

                const selected =

                    String(value) ===

                    String(active)

                        ?

                        "selected"

                        :

                        "";


                let label =

                    String(

                        value

                    );


                if(

                    type === "month"

                ){

                    label =

                        formatDetailMonth(

                            value

                        );

                }


                else{

                    label =

                        formatDetailLabel(

                            value

                        );

                }


                return `

                    <option

                        value="${escapeFilterHTML(value)}"

                        ${selected}

                    >

                        ${escapeFilterHTML(label)}

                    </option>

                `;

            }

        )

        .join("");

};


/* =====================================================
   DETAIL REGISTER
===================================================== */

Filter.registerDetail = function(

    options = {}

){

    const container =

        Filter.detail.container;


    if(

        !container

    ){

        return;

    }


    const selects =

        container.querySelectorAll(

            "[data-detail-filter]"

        );


    selects.forEach(

        select => {

            select.addEventListener(

                "change",

                event => {

                    const field =

                        event.target.dataset.detailFilter;


                    const value =

                        event.target.value;


                    Filter.detail.values[field] =

                        value;


                    /* =================================
                       CATEGORY DEPENDENCY
                    ================================= */

                    if(

                        field === "jenis" &&

                        typeof options.onJenisChange ===

                        "function"

                    ){

                        const categories =

                            options.onJenisChange(

                                value

                            );


                        if(

                            Array.isArray(

                                categories

                            )

                        ){

                            Filter.setDetailCategories(

                                categories

                            );

                        }

                    }


                    /* =================================
                       GENERAL CHANGE
                    ================================= */

                    if(

                        typeof options.onChange ===

                        "function"

                    ){

                        options.onChange({

                            month :

                                Filter.detail.values.month,

                            jenis :

                                Filter.detail.values.jenis,

                            category :

                                Filter.detail.values.category

                        });

                    }

                }

            );

        }

    );

};


/* =====================================================
   DETAIL SET CATEGORIES
=====================================================

   Digunakan ketika Jenis berubah.

   Contoh:

   Masuk
      ↓
   Gaji
   Bonus
   Penghasilan Lain

   Keluar
      ↓
   Kopi
   Tagihan
   Belanja Online
===================================================== */

Filter.setDetailCategories = function(

    categories = []

){

    const container =

        Filter.detail.container;


    if(

        !container

    ){

        return;

    }


    const select =

        container.querySelector(

            '[data-detail-filter="category"]'

        );


    if(

        !select

    ){

        return;

    }


    const values =

        Array.isArray(

            categories

        )

            ?

            categories

            :

            [];


    Filter.detail.options.category =

        values;


    /* =============================================
       CURRENT CATEGORY
    ============================================= */

    const currentCategory =

        values.includes(

            Filter.detail.values.category

        )

            ?

            Filter.detail.values.category

            :

            values[0] ?? "";


    Filter.detail.values.category =

        currentCategory;


    /* =============================================
       RENDER OPTIONS
    ============================================= */

    select.innerHTML =

        Filter.renderDetailOptions(

            values,

            currentCategory,

            "text"

        );


    /* =============================================
       CALLBACK
    ============================================= */

    return currentCategory;

};


/* =====================================================
   DETAIL GET VALUES
===================================================== */

Filter.getDetailValues = function(){

    return {

        month :

            Filter.detail.values.month,

        jenis :

            Filter.detail.values.jenis,

        category :

            Filter.detail.values.category

    };

};


/* =====================================================
   DETAIL SET VALUES
===================================================== */

Filter.setDetailValues = function(

    values = {}

){

    const container =

        Filter.detail.container;


    if(

        !container

    ){

        return;

    }


    const month =

        container.querySelector(

            '[data-detail-filter="month"]'

        );


    const jenis =

        container.querySelector(

            '[data-detail-filter="jenis"]'

        );


    const category =

        container.querySelector(

            '[data-detail-filter="category"]'

        );


    if(

        values.month !== undefined

    ){

        Filter.detail.values.month =

            String(

                values.month

            );


        if(

            month

        ){

            month.value =

                String(

                    values.month

                );

        }

    }


    if(

        values.jenis !== undefined

    ){

        Filter.detail.values.jenis =

            String(

                values.jenis

            );


        if(

            jenis

        ){

            jenis.value =

                String(

                    values.jenis

                );

        }

    }


    if(

        values.category !== undefined

    ){

        Filter.detail.values.category =

            String(

                values.category

            );


        if(

            category

        ){

            category.value =

                String(

                    values.category

                );

        }

    }

};


/* =====================================================
   DETAIL RESET
===================================================== */

Filter.resetDetail = function(){

    const options =

        Filter.detail.options;


    const month =

        options.month?.[0] ??

        "";


    const jenis =

        options.jenis?.[0] ??

        "";


    const category =

        options.category?.[0] ??

        "";


    Filter.setDetailValues({

        month,

        jenis,

        category

    });


    return Filter.getDetailValues();

};


/* =====================================================
   DETAIL MONTH FORMAT
===================================================== */

function formatDetailMonth(

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

}


/* =====================================================
   DETAIL LABEL FORMAT
===================================================== */

function formatDetailLabel(

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

            letter =>

                letter.toUpperCase()

        );

}


/* =====================================================
   DETAIL HTML ESCAPE
===================================================== */

function escapeFilterHTML(

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
