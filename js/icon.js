/* =====================================================
   Finance Assistant
   Global
   Module      : Icon
   File        : icon.js
   Version     : 2.0.0

   Description :
   Global Icon Helper

   Sections :
   - State
   - Icon
   - Bank
===================================================== */


/* =====================================================
   STATE
===================================================== */

const BASE =

    new URL(

        "../assets/icons/",

        import.meta.url

    ).href;


/* =====================================================
   ICON
===================================================== */

export const Icon = {};


/* =====================================================
   BANK
===================================================== */

Icon.bank = function(

    name

){

    switch(

        (

            name ??

            ""

        )

        .toLowerCase()

    ){

        case "mandiri":

            return BASE +

                "mandiri.webp";

        case "bri":

            return BASE +

                "bri.webp";

        case "bca":

            return BASE +

                "bca.webp";

        case "bni":

            return BASE +

                "bni.webp";

        case "dana":

            return BASE +

                "dana.webp";

        case "ovo":

            return BASE +

                "ovo.webp";

        case "gopay":

            return BASE +

                "gopay.webp";

        case "shopee":

        case "shopeepay":

            return BASE +

                "shopee.webp";

        case "crypto":

        case "wallet_crypto":

            return BASE +

                "crypto.webp";

        case "seabank":

            return BASE +

                "seabank.webp";

        default:

            return BASE +

                "defaultbank.webp";

    }

};
