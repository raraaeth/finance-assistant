/* =====================================================
   Finance Assistant
   Workspace   : Shared
   Module      : Chart
   File        : chart.js
   Version     : 1.0.0

   Description :
   Shared Chart Component
===================================================== */


/* =====================================================
   CHART
===================================================== */

export const Chart = {

    instance : null

};


/* =====================================================
   LINE
===================================================== */

Chart.renderLine = function(

    options

){

    const canvas =

        document.querySelector(

            options.canvas

        );

    if(

        !canvas

    ){

        return;

    }

    Chart.destroy();

    Chart.instance =

        new Chart(

            canvas,

            {

                type :

                    "line",

                data : {

                    labels :

                        options.labels,

                    datasets :

                        options.datasets

                },

                options :

                    options.options ??

                    {}

            }

        );

};

/* =====================================================
/* =====================================================
   BAR
===================================================== */

Chart.renderBar = function(

    options

){

    const canvas =

        document.querySelector(

            options.canvas

        );

    if(

        !canvas

    ){

        return;

    }

    Chart.destroy();

    Chart.instance =

        new Chart(

            canvas,

            {

                type :

                    "bar",

                data : {

                    labels :

                        options.labels,

                    datasets :

                        options.datasets

                },

                options :

                    options.options ??

                    {}

            }

        );

};


/* =====================================================
   DESTROY
===================================================== */

Chart.destroy = function(){

    if(

        !Chart.instance

    ){

        return;

    }

    Chart.instance.destroy();

    Chart.instance =

        null;

};
