/* =====================================================
   FINANCE ASSISTANT
   FILE : utils.js
   DESCRIPTION : Global Utility
   VERSION : 1.0.0
===================================================== */


/* =====================================================
   CURRENCY
===================================================== */

export function rupiah(

    value = 0

){

    return Number(

        value

    ).toLocaleString(

        "id-ID",

        {

            style :

                "currency",

            currency :

                "IDR",

            minimumFractionDigits : 0

        }

    );

}


export function nominal(

    value = 0

){

    return Number(

        value

    ).toLocaleString(

        "id-ID"

    );

}


export function shortRupiah(

    value = 0

){

    value = Number(

        value

    );

    function format(

        number

    ){

        return Number(

            number.toFixed(1)

        ).toLocaleString(

            "id-ID"

        );

    }

    if(

        value >=

        1000000000

    ){

        return `${

            format(

                value /

                1000000000

            )

        } Miliar`;

    }

    if(

        value >=

        1000000

    ){

        return `${

            format(

                value /

                1000000

            )

        } Juta`;

    }

    if(

        value >=

        1000

    ){

        return `${

            format(

                value /

                1000

            )

        } Ribu`;

    }

    return nominal(

        value

    );

}


/* =====================================================
   DATE
===================================================== */

export function formatDate(

    date

){

    return new Date(

        date

    ).toLocaleDateString(

        "id-ID",

        {

            day :

                "2-digit",

            month :

                "long",

            year :

                "numeric"

        }

    );

}


export function formatTime(

    date

){

    return new Date(

        date

    ).toLocaleTimeString(

        "id-ID",

        {

            hour :

                "2-digit",

            minute :

                "2-digit"

        }

    );

}

/* =====================================================
   GLOBAL FORMATTER
===================================================== */

window.rupiah =

    rupiah;

window.shortRupiah =

    shortRupiah;

/* =====================================================
   ANIMATE NUMBER
===================================================== */

export function animateNumber(

    element,

    target,

    formatter = value => value

){

    if(

        !element

    ){

        return;

    }

    const start = 0;

    const duration = 800;

    const startTime = performance.now();

    function update(

        currentTime

    ){

        const progress = Math.min(

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

                update

            );

        }

    }

    requestAnimationFrame(

        update

    );

}


