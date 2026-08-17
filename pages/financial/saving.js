/* =====================================================
   Finance Assistant
   Module      : Financial
   File        : saving.js
   Version     : 1.0.0

   Description :
   Financial Saving Engine

   Handles :
   - Dana Darurat
   - Tabungan Kaleng
   - Nabung
   - Tarik
===================================================== */


/* =====================================================
   SAVING ENGINE
===================================================== */

export const Saving = {


    /* =================================================
       STATE
    ================================================= */

    data : {

        danaDarurat : {

            deposited : 0,

            withdrawn : 0,

            balance : 0,

            transactions : []

        },


        tabunganKaleng : {

            deposited : 0,

            withdrawn : 0,

            balance : 0,

            transactions : []

        }

    },


    /* =================================================
       INIT
    ================================================= */

    init : function(

        transactions = []

    ){

        const result = {

            danaDarurat :

                createSavingState(),


            tabunganKaleng :

                createSavingState()

        };


        transactions.forEach(

            item => {

                const jenis =

                    String(

                        item?.jenis ?? ""

                    )

                    .trim()

                    .toLowerCase();


                const type =

                    String(

                        item?.type ?? ""

                    )

                    .trim()

                    .toLowerCase();


                if(

                    type !==

                        "dana_darurat"

                    &&

                    type !==

                        "tabungan_kaleng"

                ){

                    return;

                }


                if(

                    jenis !==

                        "nabung"

                    &&

                    jenis !==

                        "tarik"

                ){

                    return;

                }


                const nominal =

                    toNumber(

                        item?.nominal

                    );


                const key =

                    type ===

                        "dana_darurat"

                        ?

                        "danaDarurat"

                        :

                        "tabunganKaleng";


                const target =

                    result[key];


                if(

                    jenis ===

                    "nabung"

                ){

                    target.deposited +=

                        nominal;

                }


                if(

                    jenis ===

                    "tarik"

                ){

                    target.withdrawn +=

                        nominal;

                }


                target.transactions.push({

                    ...item,

                    nominal,

                    savingType :

                        jenis ===

                        "nabung"

                            ?

                            "deposit"

                            :

                            "withdraw"

                });

            }

        );


        result.danaDarurat.balance =

            Math.max(

                0,

                result.danaDarurat.deposited -

                result.danaDarurat.withdrawn

            );


        result.tabunganKaleng.balance =

            Math.max(

                0,

                result.tabunganKaleng.deposited -

                result.tabunganKaleng.withdrawn

            );


        Saving.data =

            result;


        return Saving.data;

    }

};


/* =====================================================
   CREATE STATE
===================================================== */

function createSavingState(){

    return {

        deposited : 0,

        withdrawn : 0,

        balance : 0,

        transactions : []

    };

}


/* =====================================================
   NUMBER
===================================================== */

function toNumber(

    value

){

    const number =

        Number(

            value

        );


    return Number.isFinite(

        number

    )

        ?

        number

        :

        0;

}
