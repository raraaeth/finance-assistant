/* =====================================================
   Finance Assistant
   Global
   Module      : Animation
   File        : animation.js
   Version     : 1.1.0

   Description :
   Global Animation Helper

   Sections :
   - Animation
   - Number
   - Vertical Loop
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

    duration = 1200

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


/* =====================================================
   VERTICAL LOOP
===================================================== */

/*
 * Animasi vertikal sederhana.
 *
 * Arah :
 *
 *      Atas
 *       ↓
 *       ↓
 *      Bawah
 *       ↑
 *       ↑
 *      Atas
 *
 * Cocok untuk :
 *
 * - Reminder
 * - Notice
 * - Announcement
 * - Status berjalan
 *
 * Element yang dianimasikan harus berada
 * di dalam container dengan overflow:hidden.
 */

Animation.verticalLoop = function(

    container,

    options = {}

){

    if(

        !container

    ){

        return;

    }


    const items =

        Array.from(

            container.children

        );


    if(

        !items.length

    ){

        return;

    }


    const duration =

        Number(

            options.duration

        ) || 9000;


    const pause =

        Number(

            options.pause

        ) || 1200;


    const distance =

        Number(

            options.distance

        ) || 0;


    let animation = null;

    let running = true;


    /*
     * Reset posisi.
     */

    items.forEach(

        item => {

            item.style.transform =

                "translateY(0)";

        }

    );


    /*
     * Kalau hanya satu item,
     * tidak perlu looping.
     */

    if(

        items.length <= 1

    ){

        return {

            stop(){

                running = false;

            },

            start(){

                running = true;

            }

        };

    }


    /*
     * Tentukan tinggi seluruh konten.
     */

    const totalHeight =

        container.scrollHeight;


    const visibleHeight =

        container.clientHeight;


    const calculatedDistance =

        distance ||

        Math.max(

            totalHeight -

            visibleHeight,

            0

        );


    /*
     * Tidak ada area untuk bergerak.
     */

    if(

        calculatedDistance <= 0

    ){

        return {

            stop(){

                running = false;

            },

            start(){

                running = true;

            }

        };

    }


    /*
     * Loop utama.
     */

    async function loop(){

        while(

            running

        ){

            /*
             * Tunggu sebentar
             * sebelum mulai bergerak.
             */

            await wait(

                pause

            );


            if(

                !running

            ){

                break;

            }


            /*
             * Atas → bawah
             */

            await animate(

                container,

                0,

                -calculatedDistance,

                duration

            );


            if(

                !running

            ){

                break;

            }


            /*
             * Diam sebentar
             * di posisi bawah.
             */

            await wait(

                pause

            );


            if(

                !running

            ){

                break;

            }


            /*
             * Bawah → atas
             */

            await animate(

                container,

                -calculatedDistance,

                0,

                duration

            );

        }

    }


    loop();


    /*
     * Return controller.
     */

    return {

        stop(){

            running = false;

            if(

                animation

            ){

                cancelAnimationFrame(

                    animation

                );

            }

        },


        start(){

            if(

                running

            ){

                return;

            }

            running = true;

            loop();

        }

    };


    /* =================================================
       WAIT
    ================================================= */

    function wait(

        milliseconds

    ){

        return new Promise(

            resolve =>

                setTimeout(

                    resolve,

                    milliseconds

                )

        );

    }


    /* =================================================
       ANIMATE
    ================================================= */

    function animate(

        element,

        from,

        to,

        time

    ){

        return new Promise(

            resolve => {

                const startTime =

                    performance.now();


                function frame(

                    currentTime

                ){

                    if(

                        !running

                    ){

                        resolve();

                        return;

                    }


                    const progress =

                        Math.min(

                            (

                                currentTime -

                                startTime

                            ) /

                            time,

                            1

                        );


                    /*
                     * Ease in-out.
                     */

                    const eased =

                        progress < 0.5

                            ?

                            2 *

                            progress *

                            progress

                            :

                            1 -

                            Math.pow(

                                -2 *

                                progress +

                                2,

                                2

                            ) /

                            2;


                    const value =

                        from +

                        (

                            to -

                            from

                        ) *

                        eased;


                    element.style.transform =

                        `translateY(${value}px)`;


                    if(

                        progress < 1

                    ){

                        animation =

                            requestAnimationFrame(

                                frame

                            );

                    }

                    else{

                        animation =

                            null;

                        resolve();

                    }

                }


                animation =

                    requestAnimationFrame(

                        frame

                    );

            }

        );

    }

};
