/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : state.js
   Version      : 1.0.0

   Description :
   Global Input State
===================================================== */


/* =====================================================
   STATE
===================================================== */

export const State = {

    /* =============================================
       WORKSPACE
    ============================================= */

    workspace : null,

    config : null,


    /* =============================================
       CURRENT TRANSACTION
    ============================================= */

    values : {},

    step : 0,


    /* =============================================
       TRANSACTION LIST
    ============================================= */

    transactions : [],


    /* =============================================
       DATE
    ============================================= */

    date : null,

    dateLocked : false,


    /* =============================================
       EDIT
    ============================================= */

    editingIndex : null,


    /* =============================================
       RESET
    ============================================= */

    reset(){

        this.workspace = null;

        this.config = null;

        this.values = {};

        this.step = 0;

        this.transactions = [];

        this.date = null;

        this.dateLocked = false;

        this.editingIndex = null;

    },


    /* =============================================
       RESET CURRENT TRANSACTION
    ============================================= */

    resetCurrent(){

        this.values = {};

        this.step = 0;

        this.editingIndex = null;

    }

};
