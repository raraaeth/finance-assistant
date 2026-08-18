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
        "https://opensheet.elk.sh/1eVZV1BYpJlPGLiYWhd6C_kAoHZdbD-H7ykwAc1ddFiM/kas_member"

};


/* =====================================================
   DATA STATE
===================================================== */

const Data = {

    kasMembers : []

};


/* =====================================================
   LOAD INPUT DATA
===================================================== */

export async function loadInputData(

    workspace

){

    /* =============================================
       HANYA LOAD DATA YANG DIBUTUHKAN WORKSPACE
    ============================================= */

    if(

        workspace !== "kas"

    ){

        return Data;

    }


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

            "GLOBAL INPUT DATA ERROR:",

            error

        );

    }


    return Data;

}


/* =====================================================
   GET KAS MEMBERS
===================================================== */

export function getKasMembers(){

    return [

        ...Data.kasMembers

    ];

}
