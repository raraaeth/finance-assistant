/* =====================================================
   Finance Assistant
   Module      : Financial
   File        : debt.js
   Version     : 2.0.0

   Description :
   Financial Debt & Lending Engine

   Handles :
   - Hutang
   - Bayar hutang
   - Meminjamkan
   - Pengembalian pinjaman
   - Outstanding debt
   - Outstanding lending
===================================================== */


/* =====================================================
   DEBT & LENDING ENGINE
===================================================== */

export const Debt = {


    /* =================================================
       STATE
    ================================================= */

    data : {

        /* =============================================
           HUTANG
        ============================================= */

        borrowed : 0,

        paid : 0,

        outstanding : 0,


        /* =============================================
           MEMINJAMKAN
        ============================================= */

        lent : 0,

        returned : 0,

        outstandingLending : 0,


        /* =============================================
           TRANSACTIONS
        ============================================= */

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


        let lent = 0;

        let returned = 0;


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


                /* =====================================
                   ONLY DEBT TRANSACTIONS
                ===================================== */

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


                /* =====================================
                   HUTANG
                ===================================== */

                if(

                    jenis ===

                    "hutang"

                ){

                    borrowed +=

                        nominal;


                    data.push({

                        ...item,

                        nominal,

                        debtType :

                            "borrow"

                    });


                    return;

                }


                /* =====================================
                   BAYAR HUTANG
                ===================================== */

                if(

                    jenis ===

                    "bayar"

                ){

                    paid +=

                        nominal;


                    data.push({

                        ...item,

                        nominal,

                        debtType :

                            "payment"

                    });


                    return;

                }

            }

        );


        /* =============================================
           HUTANG OUTSTANDING
        ============================================= */

        const outstanding =

            Math.max(

                0,

                borrowed -

                paid

            );


        /* =============================================
           MEMINJAMKAN OUTSTANDING
        ============================================= */

        const outstandingLending =

            Math.max(

                0,

                lent -

                returned

            );


        /* =============================================
           SAVE STATE
        ============================================= */

        Debt.data = {

            borrowed,

            paid,

            outstanding,


            lent,

            returned,

            outstandingLending,


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
