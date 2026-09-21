/* =====================================================
   Finance Assistant
   Module      : Financial
   File        : debt.js
   Version     : 2.1.0

   Description :
   Financial Debt & Lending Engine

   Handles :
   - Hutang
   - Bayar hutang
   - Dipinjamkan
   - Pengembalian pinjaman
   - Outstanding debt
   - Outstanding lending

   Transaction structure :

   jenis = hutang
   type  = hutang_piutang

       → menambah posisi hutang


   jenis = bayar
   type  = hutang_piutang

       → mengurangi posisi hutang


   Keyword dari keterangan digunakan
   untuk menentukan pasangan transaksi.


   Contoh :

   bayar
   hutang_piutang
   Dipinjam Dilla

       +

   hutang
   hutang_piutang
   Dilla membayar hutang


   Keyword :

   dilla


   Hasil :

   lent     → uang yang dipinjamkan
   returned → uang yang dikembalikan
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
           DIPINJAM
        ============================================= */

        lent : 0,

        returned : 0,

        outstandingLending : 0,


        /* =============================================
           DETAIL PER KEYWORD
        ============================================= */

        groups : [],


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

        const data = [];


        const groups = {};


        /* =============================================
           READ TRANSACTIONS
        ============================================= */

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
                   HANYA HUTANG PIUTANG
                ===================================== */

                if(

                    type !==

                    "hutang_piutang"

                ){

                    return;

                }


                /* =====================================
                   HANYA HUTANG & BAYAR
                ===================================== */

                if(

                    jenis !== "hutang" &&

                    jenis !== "bayar"

                ){

                    return;

                }


                const nominal =

                    toNumber(

                        item?.nominal

                    );


                if(

                    nominal <= 0

                ){

                    return;

                }


                /* =====================================
                   KEYWORD
                ===================================== */

                const keyword =

                    extractDebtKeyword(

                        item?.keterangan

                    );


                /* =====================================
                   TANPA KEYWORD

                   Tetap disimpan sebagai transaksi
                   tetapi tidak bisa dipasangkan
                   dengan transaksi lain.
                ===================================== */

                if(

                    !keyword

                ){

                    data.push({

                        ...item,

                        nominal,

                        debtType :

                            jenis === "hutang"

                                ?

                                "borrow"

                                :

                                "payment",

                        keyword :

                            ""

                    });

                    return;

                }


                /* =====================================
                   CREATE GROUP
                ===================================== */

                if(

                    !groups[keyword]

                ){

                    groups[keyword] = {

                        keyword,

                        borrowed : 0,

                        paid : 0,

                        transactions : []

                    };

                }


                /* =====================================
                   HUTANG
                ===================================== */

                if(

                    jenis === "hutang"

                ){

                    groups[keyword].borrowed +=

                        nominal;

                }


                /* =====================================
                   BAYAR
                ===================================== */

                else if(

                    jenis === "bayar"

                ){

                    groups[keyword].paid +=

                        nominal;

                }


                /* =====================================
                   SAVE TRANSACTION
                ===================================== */

                const transaction = {

                    ...item,

                    nominal,

                    debtType :

                        jenis === "hutang"

                            ?

                            "borrow"

                            :

                            "payment",

                    keyword

                };


                groups[keyword].transactions.push(

                    transaction

                );


                data.push(

                    transaction

                );

            }

        );


        /* =============================================
           FINAL TOTAL
        ============================================= */

        let borrowed = 0;

        let paid = 0;

        let outstanding = 0;


        let lent = 0;

        let returned = 0;

        let outstandingLending = 0;


        const groupList = [];


        /* =============================================
           PROCESS EACH KEYWORD
        ============================================= */

        Object.values(

            groups

        ).forEach(

            group => {

                const net =

                    group.borrowed -

                    group.paid;


                /* =====================================
                   HUTANG

                   net > 0

                   Contoh :

                   hutang 1.000.000
                   bayar    400.000

                   net = 600.000
                ===================================== */

                if(

                    net > 0

                ){

                    borrowed +=

                        group.borrowed;


                    paid +=

                        group.paid;


                    outstanding +=

                        net;


                    group.position =

                        "debt";


                    group.outstanding =

                        net;

                }


                /* =====================================
                   DIPINJAM

                   net < 0

                   Contoh :

                   bayar  1.000.000
                   hutang   400.000

                   net = -600.000
                ===================================== */

                else if(

                    net < 0

                ){

                    lent +=

                        group.paid;


                    returned +=

                        group.borrowed;


                    outstandingLending +=

                        Math.abs(

                            net

                        );


                    group.position =

                        "lending";


                    group.outstanding =

                        Math.abs(

                            net

                        );

                }


                /* =====================================
                   SELESAI / NET 0

                   Tidak mempunyai posisi aktif.
                ===================================== */

                else {

                    group.position =

                        "settled";


                    group.outstanding =

                        0;

                }


                /* =====================================
                   GROUP RESULT
                ===================================== */

                groupList.push({

                    keyword :

                        group.keyword,


                    borrowed :

                        group.borrowed,


                    paid :

                        group.paid,


                    net :

                        net,


                    position :

                        group.position,


                    outstanding :

                        group.outstanding,


                    transactions :

                        group.transactions

                });

            }

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


            groups :

                groupList,


            transactions :

                data

        };


        return Debt.data;

    }

};


/* =====================================================
   EXTRACT DEBT KEYWORD
===================================================== */

function extractDebtKeyword(

    value

){

    if(

        !value

    ){

        return "";

    }


    let text =

        String(

            value

        )

        .trim()

        .toLowerCase();


    if(

        !text

    ){

        return "";

    }


    /* =============================================
       NORMALIZE SEPARATORS
    ============================================= */

    text =

        text

            .replace(

                /[.,!?;:()[\]{}]/g,

                " "

            )

            .replace(

                /\s+/g,

                " "

            )

            .trim();


    /* =============================================
       REMOVE COMMON DEBT WORDS

       Contoh :

       "Dipinjam Dilla"

       menjadi :

       "dilla"


       "Dilla membayar hutang"

       menjadi :

       "dilla"
    ============================================= */

    const stopWords = [

        "dipinjam",

        "pinjam",

        "meminjam",

        "minjam",

        "dari",

        "kepada",

        "untuk",

        "membayar",

        "bayar",

        "dibayar",

        "membayarkan",

        "hutang",

        "utang",

        "nyaur",

        "kembali",

        "dikembalikan",

        "pengembalian"

    ];


    const words =

        text

            .split(

                " "

            )

            .filter(

                word =>

                    word &&

                    !stopWords.includes(

                        word

                    )

            );


    /* =============================================
       RESULT

       Contoh :

       "Dipinjam Dilla"
       → "dilla"


       "Dilla membayar hutang"
       → "dilla"
    ============================================= */

    return words.join(

        " "

    ).trim();

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
