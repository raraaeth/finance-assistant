/* =====================================================
   Finance Assistant
   Page        : Airdrop
   Module      : Summary
   File        : summary.js
   Version     : 1.0.0

   Description :
   Airdrop Summary Controller

   Status :
   Dummy / Skeleton
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Process

} from "./process.js";


/* =====================================================
   SUMMARY
===================================================== */

export const Summary = {};


/* =====================================================
   INIT
===================================================== */

Summary.init = function(){

    /*
     * Dummy sementara.
     *
     * Nantinya Summary akan menampilkan:
     *
     * - Total reward
     * - Win Airdrop
     * - Ongoing Airdrop
     * - Ended Airdrop
     * - Not Win global
     * - Detail list berdasarkan status
     */


    console.log(

        "Airdrop Summary initialized",

        Process.summary

    );


    return Summary;

};
