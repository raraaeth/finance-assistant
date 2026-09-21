/* =====================================================
   Finance Assistant
   Module      : Financial
   File        : debt.js
   Version     : 1.0.0

   Description :
   Financial Debt Engine

   Handles :
   - Hutang
   - Bayar hutang
   - Outstanding debt
===================================================== */


/* =====================================================
   DEBT ENGINE
===================================================== */

export const Debt = {


    /* =================================================
       STATE
    ================================================= */

    data : {

        borrowed : 0,

        paid : 0,

        outstanding : 0,

        transactions : []

    },


    /* =================================================
       INIT
    ================================================= */

    init : function(

        transactions = []

    ){

        let borrowed = 0;

        let paid = 0;


        const data = [];


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

                    "hutang_piutang"

                ){

                    return;

                }


                const nominal =

                    toNumber(

                        item?.nominal

                    );


                if(

                    jenis ===

                    "hutang"

                ){

                    borrowed +=

                        nominal;

                }


                else if(

                    jenis ===

                    "bayar"

                ){

                    paid +=

                        nominal;

                }


                else {

                    return;

                }


                data.push({

                    ...item,

                    nominal,

                    debtType :

                        jenis ===

                        "hutang"

                            ?

                            "borrow"

                            :

                            "payment"

                });

            }

        );


        Debt.data = {

            borrowed,

            paid,

            outstanding :

                Math.max(

                    0,

                    borrowed -

                    paid

                ),

            transactions :

                data

        };


        return Debt.data;

    }

};


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
