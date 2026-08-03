/* =====================================================
   Finance Assistant
   Workspace   : Saving
   Module      : Statistics
   File        : statistics.js
   Version     : 1.0.0

   Description :
   Statistics Controller

   Sections :
   - State
   - Init
   - Filter
   - Chart
   - Transaction
===================================================== */

/* =====================================================
   IMPORT
===================================================== */

import {

    Process

} from "./process.js";

import {

    Filter

} from

"../../shared/js/filter.js";


/* =====================================================
   STATE
===================================================== */

export const Statistics = {

    filter : {

        period :

            "all",

        type :

            "all",

        bank :

            "all",

        category :

            "all",

        method :

            "all"

    },

    data : []

};


/* =====================================================
   INIT
===================================================== */

Statistics.init = function(){

    Statistics.applyFilter();

    Statistics.renderTransaction();

};


/* =====================================================
   FILTER
===================================================== */

Statistics.applyFilter = function(){

    Statistics.data =

        Process.transaction.filter(

            item => {

                if(

                    Statistics.filter.period !==

                    "all"

                ){

                    if(

                        !item.tanggal.startsWith(

                            Statistics.filter.period

                        )

                    ){

                        return false;

                    }

                }

                if(

                    Statistics.filter.type !==

                    "all"

                ){

                    if(

                        item.jenis !==

                        Statistics.filter.type

                    ){

                        return false;

                    }

                }

                if(

                    Statistics.filter.bank !==

                    "all"

                ){

                    if(

                        item.bank !==

                        Statistics.filter.bank

                    ){

                        return false;

                    }

                }

                if(

                    Statistics.filter.category !==

                    "all"

                ){

                    if(

                        item.kategori !==

                        Statistics.filter.category

                    ){

                        return false;

                    }

                }

                return true;

            }

        );

};


/* =====================================================
   CHART
===================================================== */

Statistics.renderChart = function(){

};


/* =====================================================
   TRANSACTION
===================================================== */

Statistics.renderTransaction = function(){

    const list =

        document.getElementById(

            "transaction-list"

        );

    if(

        !list

    ){

        return;

    }

    list.innerHTML =

        "";

    Statistics.data.forEach(

        item=>{

            list.innerHTML +=

            `

            <div class="transaction-item">

                <div>

                    <strong>

                        ${item.keterangan || item.kategori}

                    </strong>

                    <br>

                    <small>

                        ${item.tanggal}

                    </small>

                </div>

                <div>

                    ${item.jenis}

                    <br>

                    ${item.nominal}

                </div>

            </div>

            `;

        }

    );

};
