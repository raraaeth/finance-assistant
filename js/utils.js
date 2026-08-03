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

    value =

        Number(

            value

        );

    if(

        value >=

        1000000000

    ){

        return (

            value /

            1000000000

        ).toFixed(1)

        + " M";

    }

    if(

        value >=

        1000000

    ){

        return (

            value /

            1000000

        ).toFixed(1)

        + " Jt";

    }

    if(

        value >=

        1000

    ){

        return (

            value /

            1000

        ).toFixed(1)

        + " Rb";

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
