/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : state.js
   Version      : 2.0.0

   Description :
   Global Input State

   Supports :
   - Workspace
   - Input Configuration
   - Input Mode
   - Current Values
   - Flow Step
   - Transaction List
   - Date
   - Date Lock
   - Edit / Rewrite by ID
===================================================== */


/* =====================================================
   STATE
===================================================== */

export const State = {


    /* =============================================
       WORKSPACE
    ============================================= */

    workspace :

        null,


    config :

        null,


    /* =============================================
       INPUT MODE
       
       Contoh :

       activity
       reward

       Workspace yang hanya mempunyai
       satu mode tetap menggunakan
       mode default.
    ============================================= */

    mode :

        null,


    /* =============================================
       CURRENT INPUT
    ============================================= */

    values :

        {},


    step :

        0,


    /* =============================================
       TRANSACTION LIST
       
       Digunakan oleh flow/input
       yang membutuhkan kumpulan data.
    ============================================= */

    transactions :

        [],


    /* =============================================
       DATE
    ============================================= */

    date :

        null,


    dateLocked :

        false,


    /* =============================================
       EDIT
       
       editingIndex tetap dipertahankan
       untuk kompatibilitas dengan
       flow lama.

       editingId digunakan untuk
       kebutuhan rewrite berdasarkan ID.
    ============================================= */

    editingIndex :

        null,


    editingId :

        null,


    /* =============================================
       SELECTED RECORD
       
       Digunakan ketika sebuah record
       dipilih untuk diedit / di-rewrite.

       Contoh Airdrop Reward :

       {
           id,
           project,
           type,
           status,
           ...
       }
    ============================================= */

    selectedRecord :

        null,


    /* =============================================
       RESET
    ============================================= */

    reset(){

        this.workspace =

            null;


        this.config =

            null;


        this.mode =

            null;


        this.values =

            {};


        this.step =

            0;


        this.transactions =

            [];


        this.date =

            null;


        this.dateLocked =

            false;


        this.editingIndex =

            null;


        this.editingId =

            null;


        this.selectedRecord =

            null;

    },


    /* =============================================
       RESET CURRENT INPUT
    ============================================= */

    resetCurrent(){

        this.values =

            {};


        this.step =

            0;


        this.editingIndex =

            null;


        this.editingId =

            null;


        this.selectedRecord =

            null;

    },


    /* =============================================
       SET MODE
    ============================================= */

    setMode(

        mode

    ){

        this.mode =

            mode

            ||

            null;


        this.resetCurrent();

    },


    /* =============================================
       SET SELECTED RECORD
       
       Digunakan terutama untuk
       mode Reward Airdrop.
    ============================================= */

    setSelectedRecord(

        record

    ){

        this.selectedRecord =

            record

            ?

            {

                ...record

            }

            :

            null;


        /* =========================================
           SIMPAN ID UNTUK REWRITE
        ========================================= */

        this.editingId =

            record?.id

            ??

            null;

    },


    /* =============================================
       CLEAR SELECTED RECORD
    ============================================= */

    clearSelectedRecord(){

        this.selectedRecord =

            null;


        this.editingId =

            null;

    },


    /* =============================================
       SET VALUE
    ============================================= */

    setValue(

        key,

        value

    ){

        if(

            !key

        ){

            return;

        }


        this.values[

            key

        ] =

            value;

    },


    /* =============================================
       GET VALUE
    ============================================= */

    getValue(

        key

    ){

        if(

            !key

        ){

            return null;

        }


        return this.values[

            key

        ];

    }

};
