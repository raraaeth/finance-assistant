/* =====================================================
   Finance Assistant
   Global
   Module      : Animation
   File        : animation.js
   Version     : 1.0.0

   Description :
   Number Animation Helper
===================================================== */


/* =====================================================
   ANIMATION
===================================================== */

export const Animation = {};


/* =====================================================
   COUNT NUMBER
===================================================== */

Animation.count = function(

    element,

    target,

    formatter,

    duration = 1200

){

    let start = 0;

    const startTime =

        performance.now();

    function update(

        now

    ){

        const progress =

            Math.min(

                (

                    now -

                    startTime

                ) /

                duration,

                1

            );

        const value =

            Math.floor(

                progress *

                target

            );

        element.textContent =

            formatter(

                value

            );

        if(

            progress < 1

        ){

            requestAnimationFrame(

                update

            );

        }

    }

    requestAnimationFrame(

        update

    );

};

/* =====================================================
   PLAY
===================================================== */

Animation.play = function(

    container

){

    const page =

        document.querySelector(

            container

        );

    if(

        !page

    ){

        return;

    }

    page

        .querySelectorAll(

            "[data-animation]"

        )

        .forEach(

            element=>{

                switch(

                    element.dataset.animation

                ){

                    case "count":

                        Animation.count(

                            element,

                            Number(

                                element.dataset.target

                            ),

                            window[

                                element.dataset.format

                            ]

                        );

                        break;

                    case "bar":

                        element.style.width =

                            "0";

                        requestAnimationFrame(

                            ()=>{

                                element.style.width =

                                    element.dataset.width;

                            }

                        );

                        break;

                }

            }

        );

};
