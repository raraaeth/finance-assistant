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
   RENDER
===================================================== */

Chart.render = function(

    options

){

    const canvas =

        document.querySelector(

            options.element

        );

    if(

        !canvas

    ){

        return;

    }

    if(

        Chart.instance

    ){

        Chart.instance.destroy();

    }

    Chart.instance =

        new window.Chart(

            canvas,

            {

                type :

                    options.type ??

                    "line",

                data : {

                    labels :

                        options.labels ??

                        [],

                    datasets :

                        options.datasets ??

                        []

                },

                options :

                    options.config ??

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
