/* =====================================================
   Finance Assistant
   Global
   Module      : Animation
   File        : animation.js
   Version     : 2.0.0

   Description :
   Global Animation Engine
===================================================== */


/* =====================================================
   ANIMATION
===================================================== */

export const Animation = {};


/* =====================================================
   COUNT
===================================================== */

function playCount(

    element

){

    const target =

        Number(

            element.dataset.target

        );

    const formatter =

        window[

            element.dataset.format

        ] ??

        (value=>value);

    const duration =

        1200;

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

                target *

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

                update

            );

        }

    }

    requestAnimationFrame(

        update

    );

}


/* =====================================================
   BAR
===================================================== */

function playBar(

    element

){

   console.log(

    "Play Bar",

    element.dataset.width

);

    element.style.width =

        "0";

    requestAnimationFrame(

        ()=>{

            element.style.width =

                element.dataset.width;

        }

    );

}


/* =====================================================
   PLAY
===================================================== */

Animation.play = function(

    container

){
   console.log(

    "Animation Play"

);

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

                        playCount(

                            element

                        );

                        break;

                    case "bar":

                        playBar(

                            element

                        );

                        break;

                }

            }

        );

};


/* =====================================================
   OBSERVER
===================================================== */

Animation.observe = function(){

    const observer =

        new MutationObserver(

            ()=>{

                requestAnimationFrame(

                    ()=>{

                        Animation.play(

                            ".active-page"

                        );

                    }

                );

            }

        );

    document

        .querySelectorAll(

            ".page"

        )

        .forEach(

            page=>{

                observer.observe(

                    page,

                    {

                        attributes :

                            true,

                        attributeFilter :

                            [

                                "class"

                            ]

                    }

                );

            }

        );

};
