/* =====================================================
   Finance Assistant
   Global
   Module      : Chart
   File        : chart.js
   Version     : 1.0.0

   Description :
   Global Chart Helper
===================================================== */


/* =====================================================
   CHART
===================================================== */

export const Chart = {

    instance : null

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

    Chart.destroy();

    Chart.instance =

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

    Chart.destroy();

    Chart.instance =

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

    Chart.destroy();

    Chart.instance =

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

                    maintainAspectRatio : false,

                    animation : {

                        duration : 700,

                        easing : "easeOutQuart"

                    },

                    plugins : {

                        legend : {

                            display : false

                        }

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
   RENDER PIE
===================================================== */

Chart.renderPie = function(

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

        new window.Chart(

            canvas,

            {

                type :

                    "pie",

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

                    plugins : {

                        legend : {

                            display : false

                        }

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
