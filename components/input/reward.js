/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Airdrop
   File         : reward.js
   Version      : 2.0.0

   Description :
   Airdrop Edit Input Reward Engine

   Handles :
   - Reward edit data filtering
   - Record selection
   - Result validation
   - Reward validation
   - Build update payload
   - Stage multiple reward edits
   - Manage accumulated edit transactions
   - Send accumulated updates to Apps Script
   - Update local records after success

   RULE :

   Edit Input Reward hanya menampilkan
   record dengan status :

   - ongoing
   - ended

   Record dengan status :

   - win
   - not_win

   tidak boleh masuk ke Edit Input Reward.

   RESULT :

   ongoing → win
   ongoing → not_win

   ended → win
   ended → not_win

   WIN :
   - status = win
   - $reward = nominal baru

   NOT WIN :
   - status = not_win
   - $reward = kosong

   FLOW :

   User memilih record
        ↓
   pilih Result
        ↓
   isi Reward jika Win
        ↓
   Tambahkan
        ↓
   State.editTransactions
        ↓
   pilih record lain
        ↓
   Tambahkan lagi
        ↓
   Konfirmasi
        ↓
   Reward.confirm()
        ↓
   Update.js
        ↓
   Apps Script
        ↓
   Google Sheet

===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    State

} from "./state.js";


import {

    getInputRaw

} from "./data.js";


import {

    Update

} from "../../js/update.js";


/* =====================================================
   CONFIG
===================================================== */

const WORKSPACE =

    "airdrop";


const STATUS_ONGOING =

    "ongoing";


const STATUS_ENDED =

    "ended";


const STATUS_WIN =

    "win";


const STATUS_NOTWIN =

    "not_win";


/* =====================================================
   REWARD
===================================================== */

export const Reward = {


    /* =================================================
       GET EDITABLE RECORDS

       Hanya ongoing dan ended.
    ================================================= */

    getRecords(){

        const data =

            getInputRaw();


        if(

            !Array.isArray(

                data

            )

        ){

            return [];

        }


        return data.filter(

            record => {

                const status =

                    normalizeStatus(

                        record?.status

                    );


                return (

                    status ===

                        STATUS_ONGOING

                    ||

                    status ===

                        STATUS_ENDED

                );

            }

        );

    },


    /* =================================================
       FIND RECORD

       Digunakan controller ketika user memilih ID.
    ================================================= */

    findRecord(

        id

    ){

        if(

            id ===

                null

            ||

            id ===

                undefined

        ){

            return null;

        }


        const targetId =

            String(

                id

            )

                .trim();


        if(

            !targetId

        ){

            return null;

        }


        return (

            this.getRecords().find(

                record =>

                    String(

                        record?.id ??

                            ""

                    )

                        .trim()

                    ===

                    targetId

            )

            ??

            null

        );

    },


    /* =================================================
       FIND RECORD BY TARGET

       Target Edit Reward :

       ID + Project
    ================================================= */

    findTarget(

        target = {}

    ){

        const id =

            String(

                target?.id ??

                    ""

            )

                .trim();


        const project =

            String(

                target?.project ??

                    ""

            )

                .trim();


        if(

            !id ||

            !project

        ){

            return null;

        }


        return (

            this.getRecords().find(

                record => {

                    const recordId =

                        String(

                            record?.id ??

                                ""

                        )

                            .trim();


                    const recordProject =

                        String(

                            record?.project ??

                                ""

                        )

                            .trim();


                    return (

                        recordId === id

                        &&

                        recordProject ===

                            project

                    );

                }

            )

            ??

            null

        );

    },


    /* =================================================
       SELECT RECORD
    ================================================= */

    selectRecord(

        record

    ){

        if(

            !record

        ){

            this.clearSelection();

            return null;

        }


        /* =============================================
           Pastikan record memang masih editable.
        ============================================= */

        if(

            !this.isEditable(

                record

            )

        ){

            console.warn(

                "Reward: record tidak dapat diedit karena status bukan ongoing/ended.",

                record

            );


            this.clearSelection();

            return null;

        }


        const selectedRecord = {

            ...record

        };


        /* =============================================
           SET STATE

           Edit Reward menggunakan selected record
           milik State.
        ============================================= */

        if(

            typeof State.setSelectedRecord ===

                "function"

        ){

            State.setSelectedRecord(

                selectedRecord

            );

        }

        else{

            State.selectedRecord =

                selectedRecord;


            State.editingId =

                selectedRecord.id;

        }


        /* =============================================
           Edit-specific state jika tersedia.
        ============================================= */

        if(

            typeof State.setEditSelectedRecord ===

                "function"

        ){

            State.setEditSelectedRecord(

                selectedRecord

            );

        }


        console.log(

            "REWARD RECORD SELECTED:",

            selectedRecord

        );


        return selectedRecord;

    },


    /* =================================================
       GET SELECTED RECORD
    ================================================= */

    getSelectedRecord(){

        if(

            State.editSelectedRecord

        ){

            return (

                State.editSelectedRecord

            );

        }


        return (

            State.selectedRecord

            ??

            null

        );

    },


    /* =================================================
       CLEAR SELECTION
    ================================================= */

    clearSelection(){

        if(

            typeof State.clearEditSelectedRecord ===

                "function"

        ){

            State.clearEditSelectedRecord();

        }


        if(

            typeof State.clearSelectedRecord ===

                "function"

        ){

            State.clearSelectedRecord();

        }

        else{

            State.selectedRecord =

                null;


            State.editingId =

                null;

        }

    },


    /* =================================================
       RESULT OPTIONS

       Hanya hasil akhir.
    ================================================= */

    getResultOptions(){

        return [

            {

                value :

                    STATUS_WIN,

                label :

                    "Win"

            },

            {

                value :

                    STATUS_NOTWIN,

                label :

                    "Not Win"

            }

        ];

    },


    /* =================================================
       VALIDATE RESULT
    ================================================= */

    validateResult(

        result

    ){

        const status =

            normalizeStatus(

                result

            );


        if(

            status !==

                STATUS_WIN

            &&

            status !==

                STATUS_NOTWIN

        ){

            return {

                valid :

                    false,

                message :

                    "Pilih hasil Win atau Not Win."

            };

        }


        return {

            valid :

                true,

            status

        };

    },


    /* =================================================
       VALIDATE REWARD

       Reward hanya wajib ketika Win.
    ================================================= */

    validateReward(

        result,

        reward

    ){

        const status =

            normalizeStatus(

                result

            );


        /* =============================================
           NOT WIN

           Tidak membutuhkan nominal.
        ============================================= */

        if(

            status ===

                STATUS_NOTWIN

        ){

            return {

                valid :

                    true,

                reward :

                    ""

            };

        }


        /* =============================================
           WIN
        ============================================= */

        if(

            status !==

                STATUS_WIN

        ){

            return {

                valid :

                    false,

                message :

                    "Hasil reward tidak valid."

            };

        }


        /* =============================================
           REQUIRED
        ============================================= */

        if(

            reward ===

                null

            ||

            reward ===

                undefined

            ||

            String(

                reward

            )

                .trim() ===

                    ""

        ){

            return {

                valid :

                    false,

                message :

                    "Nominal reward wajib diisi untuk status Win."

            };

        }


        /* =============================================
           NORMALIZE NOMINAL
        ============================================= */

        const numericReward =

            normalizeReward(

                reward

            );


        if(

            numericReward ===

                null

        ){

            return {

                valid :

                    false,

                message :

                    "Nominal reward harus berupa angka."

            };

        }


        /* =============================================
           NEGATIVE
        ============================================= */

        if(

            numericReward <

                0

        ){

            return {

                valid :

                    false,

                message :

                    "Nominal reward tidak boleh negatif."

            };

        }


        return {

            valid :

                true,

            reward :

                numericReward

        };

    },


    /* =================================================
       VALIDATE

       Validasi lengkap sebelum Tambahkan.
    ================================================= */

    validate({

        record = null,

        result,

        reward

    } = {}){

        const selectedRecord =

            record

            ??

            this.getSelectedRecord();


        /* =============================================
           SELECTED RECORD
        ============================================= */

        if(

            !selectedRecord

        ){

            return {

                valid :

                    false,

                message :

                    "Belum ada data Airdrop yang dipilih."

            };

        }


        /* =============================================
           EDITABLE STATUS
        ============================================= */

        if(

            !this.isEditable(

                selectedRecord

            )

        ){

            return {

                valid :

                    false,

                message :

                    "Data ini sudah tidak tersedia untuk Edit Input Reward."

            };

        }


        /* =============================================
           ID
        ============================================= */

        const id =

            String(

                selectedRecord.id ??

                    ""

            )

                .trim();


        if(

            !id

        ){

            return {

                valid :

                    false,

                message :

                    "ID data Airdrop tidak ditemukan."

            };

        }


        /* =============================================
           PROJECT
        ============================================= */

        const project =

            String(

                selectedRecord.project ??

                    ""

            )

                .trim();


        if(

            !project

        ){

            return {

                valid :

                    false,

                message :

                    "Project data Airdrop tidak ditemukan."

            };

        }


        /* =============================================
           RESULT
        ============================================= */

        const resultValidation =

            this.validateResult(

                result

            );


        if(

            !resultValidation.valid

        ){

            return resultValidation;

        }


        /* =============================================
           REWARD
        ============================================= */

        const rewardValidation =

            this.validateReward(

                resultValidation.status,

                reward

            );


        if(

            !rewardValidation.valid

        ){

            return rewardValidation;

        }


        return {

            valid :

                true,

            id,

            project,

            status :

                resultValidation.status,

            reward :

                rewardValidation.reward,

            record :

                selectedRecord

        };

    },


    /* =================================================
       BUILD CHANGES

       Membuat payload perubahan.

       Fungsi ini TIDAK mengirim Apps Script.
    ================================================= */

    buildChanges({

        result,

        reward

    } = {}){

        const resultValidation =

            this.validateResult(

                result

            );


        if(

            !resultValidation.valid

        ){

            return null;

        }


        const rewardValidation =

            this.validateReward(

                resultValidation.status,

                reward

            );


        if(

            !rewardValidation.valid

        ){

            return null;

        }


        /* =============================================
           WIN
        ============================================= */

        if(

            resultValidation.status ===

                STATUS_WIN

        ){

            return {

                status :

                    STATUS_WIN,

                "$reward" :

                    String(

                        rewardValidation.reward

                    )

            };

        }


        /* =============================================
           NOT WIN
        ============================================= */

        return {

            status :

                STATUS_NOTWIN,

            "$reward" :

                ""

        };

    },


    /* =================================================
       BUILD EDIT TRANSACTION

       Membuat satu item perubahan untuk batch.

       Tidak mengirim Apps Script.
    ================================================= */

    buildTransaction({

        record = null,

        result,

        reward

    } = {}){

        const validation =

            this.validate({

                record,

                result,

                reward

            });


        if(

            !validation.valid

        ){

            return {

                success :

                    false,

                message :

                    validation.message

            };

        }


        const changes =

            this.buildChanges({

                result :

                    validation.status,

                reward :

                    validation.reward

            });


        if(

            !changes

        ){

            return {

                success :

                    false,

                message :

                    "Perubahan reward tidak valid."

            };

        }


        const transaction = {

            id :

                validation.id,

            project :

                validation.project,

            record :

                {

                    ...validation.record

                },

            result :

                validation.status,

            reward :

                validation.reward,

            changes :

                {

                    ...changes

                }

        };


        return {

            success :

                true,

            transaction

        };

    },


    /* =================================================
       HAS PENDING EDIT

       Mengecek apakah target sudah ada di batch.
    ================================================= */

    hasPendingEdit(

        id,

        project

    ){

        const transactions =

            this.getPendingEdits();


        const targetId =

            String(

                id ??

                    ""

            )

                .trim();


        const targetProject =

            String(

                project ??

                    ""

            )

                .trim();


        if(

            !targetId ||

            !targetProject

        ){

            return false;

        }


        return transactions.some(

            transaction =>

                String(

                    transaction?.id ??

                        ""

                )

                    .trim() ===

                        targetId

                &&

                String(

                    transaction?.project ??

                        ""

                )

                    .trim() ===

                        targetProject

        );

    },


    /* =================================================
       ADD / STAGE EDIT

       Dipanggil ketika user menekan Tambahkan.

       BELUM mengirim Apps Script.
    ================================================= */

    add({

        record = null,

        result,

        reward

    } = {}){

        const built =

            this.buildTransaction({

                record,

                result,

                reward

            });


        if(

            !built.success

        ){

            return built;

        }


        const transaction =

            built.transaction;


        /* =============================================
           DUPLICATE TARGET

           Satu ID + Project hanya boleh satu perubahan
           aktif di dalam batch.
        ============================================= */

        if(

            this.hasPendingEdit(

                transaction.id,

                transaction.project

            )

        ){

            return {

                success :

                    false,

                duplicate :

                    true,

                message :

                    "Data Airdrop tersebut sudah ditambahkan."

            };

        }


        /* =============================================
           STATE
        ============================================= */

        if(

            typeof State.addEditTransaction ===

                "function"

        ){

            State.addEditTransaction(

                transaction

            );

        }

        else{

            if(

                !Array.isArray(

                    State.editTransactions

                )

            ){

                State.editTransactions =

                    [];

            }


            State.editTransactions.push(

                transaction

            );

        }


        console.log(

            "REWARD EDIT STAGED:",

            transaction

        );


        return {

            success :

                true,

            transaction,

            transactions :

                this.getPendingEdits()

        };

    },


    /* =================================================
       GET PENDING EDITS

       Semua perubahan yang sudah ditekan Tambahkan.
    ================================================= */

    getPendingEdits(){

        if(

            typeof State.getEditTransactions ===

                "function"

        ){

            const transactions =

                State.getEditTransactions();


            return Array.isArray(

                transactions

            )

                ?

                transactions

                :

                [];

        }


        return Array.isArray(

            State.editTransactions

        )

            ?

            State.editTransactions

            :

            [];

    },


    /* =================================================
       GET PENDING COUNT
    ================================================= */

    getPendingCount(){

        return this.getPendingEdits().length;

    },


    /* =================================================
       REMOVE PENDING EDIT
    ================================================= */

    remove(

        index

    ){

        const transactions =

            this.getPendingEdits();


        if(

            !Number.isInteger(

                index

            )

        ){

            return null;

        }


        if(

            index <

                0

            ||

            index >=

                transactions.length

        ){

            return null;

        }


        const removed =

            transactions[index];


        if(

            typeof State.removeEditTransaction ===

                "function"

        ){

            State.removeEditTransaction(

                index

            );

        }

        else{

            State.editTransactions.splice(

                index,

                1

            );

        }


        console.log(

            "REWARD EDIT REMOVED:",

            removed

        );


        return removed;

    },


    /* =================================================
       CLEAR PENDING EDITS
    ================================================= */

    clearPendingEdits(){

        if(

            typeof State.clearEditTransactions ===

                "function"

        ){

            State.clearEditTransactions();

        }

        else{

            State.editTransactions =

                [];

        }


        console.log(

            "REWARD EDIT BATCH CLEARED"

        );

    },


    /* =================================================
       CONFIRM

       Mengirim SEMUA perubahan yang sudah
       ditekan Tambahkan.

       Hanya method ini yang mengirim ke Update.js.
    ================================================= */

    async confirm(){

        const transactions =

            this.getPendingEdits();


        if(

            !transactions.length

        ){

            return {

                success :

                    false,

                message :

                    "Belum ada perubahan reward yang ditambahkan."

            };

        }


        console.log(

            "===== AIRDROP REWARD BATCH UPDATE ====="

        );


        console.log(

            "TOTAL TRANSACTIONS:",

            transactions.length

        );


        const results = [];

        const failed = [];


        /* =============================================
           PROSES SATU PER SATU

           Tetap menggunakan Update.updateField()
           dengan target ID + Project.
        ============================================= */

        for(

            let index = 0;

            index < transactions.length;

            index++

        ){

            const transaction =

                transactions[index];


            const id =

                String(

                    transaction?.id ??

                        ""

                )

                    .trim();


            const project =

                String(

                    transaction?.project ??

                        ""

                )

                    .trim();


            const changes =

                transaction?.changes

                &&

                typeof transaction.changes ===

                    "object"

                    ?

                    {

                        ...transaction.changes

                    }

                    :

                    null;


            if(

                !id ||

                !project ||

                !changes

            ){

                failed.push({

                    index,

                    transaction,

                    message :

                        "Target atau perubahan reward tidak valid."

                });


                continue;

            }


            console.log(

                "REWARD BATCH UPDATE:",

                {

                    id,

                    project,

                    changes

                }

            );


            try{

                const response =

                    await Update.updateField(

                        WORKSPACE,

                        {

                            id,

                            project

                        },

                        changes

                    );


                console.log(

                    "REWARD BATCH RESPONSE:",

                    response

                );


                if(

                    !isSuccess(

                        response

                    )

                ){

                    failed.push({

                        index,

                        transaction,

                        response,

                        message :

                            getResponseMessage(

                                response

                            )

                    });


                    continue;

                }


                const updatedRecord = {

                    ...(transaction.record ??

                        {}),

                    ...changes

                };


                results.push({

                    index,

                    transaction,

                    record :

                        updatedRecord,

                    changes,

                    response

                });

            }

            catch(

                error

            ){

                console.error(

                    "Airdrop Reward Batch Update Error:",

                    error

                );


                failed.push({

                    index,

                    transaction,

                    error,

                    message :

                        error?.message

                        ??

                        "Gagal menyimpan Edit Input Reward."

                });

            }

        }


        /* =============================================
           UPDATE LOCAL STATE

           Hanya transaction yang sukses.
        ============================================= */

        if(

            results.length

        ){

            this.applyLocalResults(

                results

            );

        }


        /* =============================================
           REMOVE SUCCESSFUL ITEMS DARI BATCH

           Item gagal tetap berada di State agar
           user dapat mencoba Konfirmasi lagi.
        ============================================= */

        if(

            results.length

        ){

            const successfulTargets =

                new Set(

                    results.map(

                        item =>

                            makeTargetKey(

                                item.transaction?.id,

                                item.transaction?.project

                            )

                    )

                );


            const remaining =

                transactions.filter(

                    transaction =>

                        !successfulTargets.has(

                            makeTargetKey(

                                transaction?.id,

                                transaction?.project

                            )

                        )

                );


            if(

                typeof State.clearEditTransactions ===

                    "function"

            ){

                State.clearEditTransactions();


                remaining.forEach(

                    transaction => {

                        if(

                            typeof State.addEditTransaction ===

                                "function"

                        ){

                            State.addEditTransaction(

                                transaction

                            );

                        }

                    }

                );

            }

            else{

                State.editTransactions =

                    remaining;

            }

        }


        /* =============================================
           RESULT
        ============================================= */

        const success =

            results.length > 0

            &&

            failed.length === 0;


        console.log(

            "===== AIRDROP REWARD BATCH COMPLETE ====="

        );


        console.log(

            {

                success,

                total :

                    transactions.length,

                updated :

                    results.length,

                failed :

                    failed.length

            }

        );


        if(

            success

        ){

            return {

                success :

                    true,

                message :

                    results.length === 1

                        ?

                        "Reward berhasil disimpan."

                        :

                        `${results.length} reward berhasil disimpan.`,

                updated :

                    results,

                failed :

                    [],

                total :

                    transactions.length,

                remaining :

                    0

            };

        }


        if(

            results.length

        ){

            return {

                success :

                    false,

                partial :

                    true,

                message :

                    `${results.length} data berhasil disimpan, ${failed.length} data gagal.`,

                updated :

                    results,

                failed,

                total :

                    transactions.length,

                remaining :

                    this.getPendingCount()

            };

        }


        return {

            success :

                false,

            message :

                "Tidak ada perubahan reward yang berhasil disimpan.",

            updated :

                [],

            failed,

            total :

                transactions.length,

            remaining :

                this.getPendingCount()

        };

    },


    /* =================================================
       APPLY LOCAL RESULTS

       Memperbarui selected/local record setelah
       Apps Script berhasil.
    ================================================= */

    applyLocalResults(

        results

    ){

        if(

            !Array.isArray(

                results

            )

        ){

            return;

        }


        results.forEach(

            result => {

                const record =

                    result?.record;


                if(

                    !record

                ){

                    return;

                }


                /* =====================================
                   Selected record
                ===================================== */

                const selected =

                    this.getSelectedRecord();


                if(

                    selected

                ){

                    const sameTarget =

                        makeTargetKey(

                            selected?.id,

                            selected?.project

                        )

                        ===

                        makeTargetKey(

                            record?.id,

                            record?.project

                        );


                    if(

                        sameTarget

                    ){

                        if(

                            typeof State.setSelectedRecord ===

                                "function"

                        ){

                            State.setSelectedRecord(

                                {

                                    ...selected,

                                    ...record

                                }

                            );

                        }

                        else{

                            State.selectedRecord = {

                                ...selected,

                                ...record

                            };

                        }


                        if(

                            typeof State.setEditSelectedRecord ===

                                "function"

                        ){

                            State.setEditSelectedRecord(

                                {

                                    ...selected,

                                    ...record

                                }

                            );

                        }

                    }

                }

            }

        );

    },


    /* =================================================
       SAVE

       Compatibility method.

       Untuk Edit Reward batch baru, controller
       seharusnya menggunakan add() lalu confirm().

       Method ini tetap disediakan agar pemanggilan lama
       tidak langsung merusak API Reward.
    ================================================= */

    async save({

        result,

        reward

    } = {}){

        const staged =

            this.add({

                record :

                    this.getSelectedRecord(),

                result,

                reward

            });


        if(

            !staged.success

        ){

            return {

                success :

                    false,

                message :

                    staged.message

            };

        }


        return this.confirm();

    },


    /* =================================================
       CHECK EDITABLE
    ================================================= */

    isEditable(

        record

    ){

        if(

            !record

        ){

            return false;

        }


        const status =

            normalizeStatus(

                record.status

            );


        return (

            status ===

                STATUS_ONGOING

            ||

            status ===

                STATUS_ENDED

        );

    },


    /* =================================================
       GET STATUS
    ================================================= */

    getStatusConstants(){

        return {

            ongoing :

                STATUS_ONGOING,

            ended :

                STATUS_ENDED,

            win :

                STATUS_WIN,

            not_win :

                STATUS_NOTWIN

        };

    }

};


/* =====================================================
   NORMALIZE STATUS
===================================================== */

function normalizeStatus(

    value

){

    return String(

        value ??

            ""

    )

        .trim()

        .toLowerCase();

}


/* =====================================================
   NORMALIZE REWARD
===================================================== */

function normalizeReward(

    value

){

    if(

        typeof value ===

            "number"

    ){

        return Number.isFinite(

            value

        )

            ?

            value

            :

            null;

    }


    let text =

        String(

            value ??

                ""

        )

            .trim();


    if(

        !text

    ){

        return null;

    }


    /* =============================================
       Hapus simbol dollar dan pemisah umum.

       Contoh :

       "$100"
           → 100

       "100 USD"
           → 100

       "1,250.50"
           → 1250.50
    ============================================= */

    text =

        text

            .replace(

                /\$/g,

                ""

            )

            .replace(

                /USD/gi,

                ""

            )

            .replace(

                /,/g,

                ""

            )

            .trim();


    if(

        !text

    ){

        return null;

    }


    const number =

        Number(

            text

        );


    if(

        !Number.isFinite(

            number

        )

    ){

        return null;

    }


    return number;

}


/* =====================================================
   TARGET KEY
===================================================== */

function makeTargetKey(

    id,

    project

){

    const normalizedId =

        String(

            id ??

                ""

        )

            .trim();


    const normalizedProject =

        String(

            project ??

                ""

        )

            .trim();


    return (

        normalizedId

        +

        "::"

        +

        normalizedProject

    );

}


/* =====================================================
   RESPONSE SUCCESS
===================================================== */

function isSuccess(

    response

){

    if(

        response ===

            true

    ){

        return true;

    }


    if(

        response?.success ===

            true

    ){

        return true;

    }


    if(

        response?.ok ===

            true

    ){

        return true;

    }


    return false;

}


/* =====================================================
   RESPONSE MESSAGE
===================================================== */

function getResponseMessage(

    response

){

    if(

        typeof response?.message ===

            "string"

        &&

        response.message.trim()

    ){

        return response.message;

    }


    if(

        typeof response?.error ===

            "string"

        &&

        response.error.trim()

    ){

        return response.error;

    }


    return (

        "Gagal menyimpan Edit Input Reward."

    );

}


/* =====================================================
   DEFAULT
===================================================== */

export default Reward;
