/* =====================================================
   Finance Assistant
   Global
   Module      : Chart
   File        : chart.js
   Version     : 2.0.0

   Description :
   Global Chart Helper
===================================================== */


/* =====================================================
   CHART
===================================================== */

export const Chart = {

    instances : {}

};


/* =====================================================
   GET KEY
===================================================== */

Chart.getKey = function(

    canvas

){

    return typeof canvas ===

        "string"

        ?

        canvas

        :

        canvas.id;

};


/* =====================================================
   RENDER LINE
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

    const key =

        Chart.getKey(

            options.canvas

        );

    Chart.destroy(

        key

    );

    Chart.instances[key] =

        new window.Chart(

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

                options : {

                    responsive : true,

                    maintainAspectRatio : false,

                    animation : {

                        duration : 700,

                        easing : "easeOutQuart"

                    },

                    interaction : {

                        intersect : false,

                        mode : "index"

                    },

                    ...(

                        options.options ??

                        {}

                    )

                }

            }

        );

};


/* =====================================================
   RENDER BAR
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

    const key =

        Chart.getKey(

            options.canvas

        );

    Chart.destroy(

        key

    );

    Chart.instances[key] =

        new window.Chart(

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

                options : {

                    responsive : true,

                    maintainAspectRatio : false,

                    animation : {

                        duration : 700,

                        easing : "easeOutQuart"

                    },

                    ...(

                        options.options ??

                        {}

                    )

                }

            }

        );

};


/* =====================================================
   RENDER DOUGHNUT
===================================================== */

Chart.renderDoughnut = function(

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

    const key =

        Chart.getKey(

            options.canvas

        );

    Chart.destroy(

        key

    );

    Chart.instances[key] =

        new window.Chart(

            canvas,

            {

                type :

                    "doughnut",

                data : {

                    labels :

                        options.labels,

                    datasets :

                        options.datasets

                },

                options : {

                    responsive : true,

                    maintainAspectRatio : true,

                    aspectRatio : 1,

                    cutout : "70%",

                    plugins : {

                        legend : {

                            display : false

                        }

                    },

                    animation : {

                        animateRotate : true,

                        animateScale : true,

                        duration : 800

                    },

                    ...(

                        options.options ??

                        {}

                    )

                }

            }

        );

};


/* =====================================================
   DESTROY
===================================================== */

Chart.destroy = function(

    key

){

    if(

        !Chart.instances[key]

    ){

        return;

    }

    Chart.instances[key].destroy();

    delete Chart.instances[key];

};
