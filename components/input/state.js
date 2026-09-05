/* =====================================================
   Finance Assistant
   Component    : Global Input
   File         : state.js
   Version      : 2.1.0

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
   - Edit Input Mode
   - Edit Selected Record
   - Edit Transaction List
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

       KHUSUS NORMAL INPUT.

       Tidak digunakan untuk menyimpan
       batch Edit Input.
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

       Tetap dipertahankan untuk
       kompatibilitas logic lama.
    ============================================= */

    selectedRecord :

        null,


    /* =============================================
       EDIT INPUT
       
       Mode khusus Edit Input.

       Contoh :

       reward
       row

       Tidak menggunakan `mode`
       milik Normal Input supaya
       kedua flow tetap terpisah.
    ============================================= */

    editMode :

        null,


    /* =============================================
       EDIT SELECTED RECORD

       Record yang sedang aktif dipilih
       pada Edit Input.

       Berbeda dari selectedRecord
       agar layer Edit Input memiliki
       state sendiri dan tidak mengganggu
       logic lama.
    ============================================= */

    editSelectedRecord :

        null,


    /* =============================================
       EDIT TRANSACTION LIST

       Menyimpan kumpulan perubahan
       sementara sebelum user menekan
       tombol Konfirmasi.

       Contoh :

       [
           {
               id,
               project,
               result,
               reward,
               changes
           },
           {
               id,
               project,
               result,
               reward,
               changes
           }
       ]

       Data di sini BELUM dikirim
       ke Apps Script.

       Pengiriman dilakukan oleh
       controller / engine saat
       Konfirmasi.
    ============================================= */

    editTransactions :

        [],


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


        /* =========================================
           EDIT INPUT
        ========================================= */

        this.editMode =

            null;


        this.editSelectedRecord =

            null;


        this.editTransactions =

            [];

    },


    /* =============================================
       RESET CURRENT INPUT
       
       Hanya mereset input yang sedang
       dikerjakan.

       Tidak mereset:
       - workspace
       - config
       - transactions
       - edit batch
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
       SET EDIT MODE

       Digunakan oleh Edit Input.

       Contoh :

       State.setEditMode("reward");

       atau :

       State.setEditMode("row");
    ============================================= */

    setEditMode(

        mode

    ){

        this.editMode =

            mode

            ||

            null;


        this.editSelectedRecord =

            null;

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
       SET EDIT SELECTED RECORD

       Digunakan oleh Edit Input.

       Tidak mengubah selectedRecord lama.
    ============================================= */

    setEditSelectedRecord(

        record

    ){

        this.editSelectedRecord =

            record

            ?

            {

                ...record

            }

            :

            null;

    },


    /* =============================================
       CLEAR EDIT SELECTED RECORD
    ============================================= */

    clearEditSelectedRecord(){

        this.editSelectedRecord =

            null;

    },


    /* =============================================
       ADD EDIT TRANSACTION

       Menambahkan perubahan ke daftar
       sementara.

       Tidak melakukan request ke
       Apps Script.

       Digunakan ketika user menekan
       "Tambahkan".
    ============================================= */

    addEditTransaction(

        transaction

    ){

        if(

            !transaction

        ){

            return false;

        }


        this.editTransactions.push(

            {

                ...transaction

            }

        );


        return true;

    },


    /* =============================================
       REMOVE EDIT TRANSACTION

       index berdasarkan posisi item
       dalam daftar edit sementara.
    ============================================= */

    removeEditTransaction(

        index

    ){

        if(

            !Number.isInteger(

                index

            )

        ){

            return false;

        }


        if(

            index < 0

            ||

            index >=

                this.editTransactions.length

        ){

            return false;

        }


        this.editTransactions.splice(

            index,

            1

        );


        return true;

    },


    /* =============================================
       CLEAR EDIT TRANSACTIONS

       Digunakan setelah:
       - Konfirmasi berhasil
       - User membatalkan batch
       - Edit Input ditutup / direset
    ============================================= */

    clearEditTransactions(){

        this.editTransactions =

            [];

    },


    /* =============================================
       GET EDIT TRANSACTIONS

       Mengembalikan copy array supaya
       pemanggil tidak mengubah state
       secara langsung.
    ============================================= */

    getEditTransactions(){

        return [

            ...this.editTransactions

        ];

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
