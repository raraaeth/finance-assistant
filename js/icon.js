/* =====================================================
   Finance Assistant
   Global
   Module      : Icon
   File        : icon.js
   Version     : 1.0.0

   Description :
   Global Icon Helper

   Sections :
   - Icon
   - Bank
===================================================== */


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

            return "../../assets/icons/mandiri.webp";

        case "bri":

            return "../../assets/icons/bri.webp";

        case "bca":

            return "../../assets/icons/bca.webp";

        case "bni":

            return "../../assets/icons/bni.webp";

        case "dana":

            return "../../assets/icons/dana.webp";

        case "ovo":

            return "../../assets/icons/ovo.webp";

        case "gopay":

            return "../../assets/icons/gopay.webp";

        case "shopee":

        case "shopeepay":

            return "../../assets/icons/shopee.webp";

        case "crypto":

        case "wallet_crypto":

            return "../../assets/icons/crypto.webp";

        case "seabank":

            return "../../assets/icons/seabank.webp";

        default:

            return "../../assets/icons/defaultbank.webp";

    }

};
