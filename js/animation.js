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
   IMPORT
===================================================== */

import {

    rupiah,

    shortRupiah

} from

"./utils.js";


/* =====================================================
   ANIMATION
===================================================== */

export const Animation = {};


/* =====================================================
   FORMATTER
===================================================== */

const formatter = {

    rupiah,

    shortRupiah

};


/* =====================================================
   COUNT
===================================================== */

Animation.count = function(

    element,

    target,

    format,

    duration = 1200

){

    if(

        !element

    ){

        return;

    }

    const fn =

        formatter[

            format

        ] ??

        (

            value=>value

        );

    const start =

        performance.now();

    function update(

        now

    ){

        const progress =

            Math.min(

                (

                    now -

                    start

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

            fn(

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

            '[data-animation="count"]'

        )

        .forEach(

            element=>{

                Animation.count(

                    element,

                    Number(

                        element.dataset.target

                    ),

                    element.dataset.format

                );

            }

        );

};


/* =====================================================
   OBSERVE
===================================================== */

Animation.observe = function(){

    const observer =

        new MutationObserver(

            ()=>{

                const page =

                    document.querySelector(

                        ".active-page"

                    );

                if(

                    !page

                ){

                    return;

                }

                Animation.play(

                    ".active-page"

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

                        attributes : true,

                        attributeFilter : [

                            "class"

                        ]

                    }

                );

            }

        );

};


/* =====================================================
   INIT
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        Animation.observe();

    }

);
