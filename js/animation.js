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
