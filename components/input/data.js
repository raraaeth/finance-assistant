/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : data.js
   Version      : 1.0.0

   Description :
   Global Input Dynamic Data

   Development source :
   OpenSheet / Google Spreadsheet
===================================================== */


/* =====================================================
   SOURCE
===================================================== */

const DATA_SOURCE = {

    kasMembers :
        "https://opensheet.elk.sh/1eVZV1BYpJlPGLiYWhd6C_kAoHZdbD-H7ykwAc1ddFiM/kas_member",

    financialActivity :
        "https://opensheet.elk.sh/1eVZV1BYpJlPGLiYWhd6C_kAoHZdbD-H7ykwAc1ddFiM/financial_activity"

};


/* =====================================================
   DATA STATE
===================================================== */

const Data = {

    kasMembers : [],

    financialActivity : []

};


/* =====================================================
   LOAD INPUT DATA
===================================================== */

export async function loadInputData(

    workspace

){

    /* =============================================
       LOAD KAS DATA
    ============================================= */

    if(

        workspace === "kas"

    ){

        await loadKasMembers();

    }


    /* =============================================
       LOAD FINANCIAL DATA
    ============================================= */

    if(

        workspace === "financial"

    ){

        await loadFinancialActivity();

    }


    return Data;

}


/* =====================================================
   LOAD KAS MEMBERS
===================================================== */

async function loadKasMembers(){

    try{

        const response =

            await fetch(

                DATA_SOURCE.kasMembers

            );


        if(

            !response.ok

        ){

            throw new Error(

                `HTTP ${response.status}`

            );

        }


        const raw =

            await response.json();


        Data.kasMembers =

            Array.isArray(raw)

                ?

            raw

                .filter(

                    item =>

                        item &&

                        typeof item.nama ===

                            "string" &&

                        item.nama.trim() !== ""

                )

                .map(

                    item => ({

                        value :

                            item.nama.trim(),

                        label :

                            item.nama.trim()

                    })

                )

                :

            [];


        console.log(

            "GLOBAL INPUT DATA - KAS MEMBERS:",

            Data.kasMembers

        );

    }

    catch(error){

        Data.kasMembers = [];


        console.error(

            "GLOBAL INPUT DATA ERROR - KAS MEMBERS:",

            error

        );

    }

}


/* =====================================================
   LOAD FINANCIAL ACTIVITY
===================================================== */

async function loadFinancialActivity(){

    try{

        const response =

            await fetch(

                DATA_SOURCE.financialActivity

            );


        if(

            !response.ok

        ){

            throw new Error(

                `HTTP ${response.status}`

            );

        }


        const raw =

            await response.json();


        Data.financialActivity =

            Array.isArray(raw)

                ?

            raw

                .filter(

                    item =>

                        item &&

                        typeof item.rules ===

                            "string"

                )

                :

            [];


        console.log(

            "GLOBAL INPUT DATA - FINANCIAL ACTIVITY:",

            Data.financialActivity

        );

    }

    catch(error){

        Data.financialActivity = [];


        console.error(

            "GLOBAL INPUT DATA ERROR - FINANCIAL ACTIVITY:",

            error

        );

    }

}


/* =====================================================
   GET DATA
===================================================== */

export function getKasMembers(){

    return [

        ...Data.kasMembers

    ];

}


export function getFinancialActivity(){

    return [

        ...Data.financialActivity

    ];

}
