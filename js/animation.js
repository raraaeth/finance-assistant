/* =====================================================
   Finance Assistant
   Global
   Module      : Animation
   File        : animation.js
   Version     : 1.0.0

   Description :
   Global Animation Helper

   Sections :
   - Animation
   - Number
===================================================== */


/* =====================================================
   ANIMATION
===================================================== */

export const Animation = {};


/* =====================================================
   NUMBER
===================================================== */

Animation.number = function(

    element,

    target = 0,

    formatter = value => value,

    duration = 800

){

    if(

        !element

    ){

        return;

    }

    target =

        Number(

            target

        ) || 0;

    const start = 0;

    const startTime =

        performance.now();

    function frame(

        currentTime

    ){

        const progress =

            Math.min(

                (

                    currentTime -

                    startTime

                ) /

                duration,

                1

            );

        const value =

            Math.floor(

                start +

                (

                    target -

                    start

                ) *

                progress

            );

        element.textContent =

            formatter(

                value

            );

        if(

            progress < 1

        ){

            requestAnimationFrame(

                frame

            );

        }

    }

    requestAnimationFrame(

        frame

    );

};
