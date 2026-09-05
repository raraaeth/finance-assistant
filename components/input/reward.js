/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Airdrop
   File         : reward.js
   Version      : 1.0.0

   Description :
   Airdrop Edit Input Reward Engine

   Handles :
   - Reward edit data filtering
   - Record selection
   - Result validation
   - Reward validation
   - Build update payload
   - Send update to Apps Script
   - Update local selected record

   RULE :

   Edit Input Reward hanya menampilkan
   record dengan status :

   - ongoing
   - ended

   Record dengan status :

   - win
   - notwin

   tidak boleh masuk ke Edit Input Reward.

   RESULT :

   ongoing → win
   ongoing → notwin

   ended → win
   ended → notwin

   WIN :
   - status = win
   - $reward = nominal baru

   NOT WIN :
   - status = notwin
   - $reward = kosong

   PRINCIPLE :

   script.js
        ↓
   Reward.js
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

            ).trim();


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

                    ).trim()

                    ===

                    targetId

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

        const status =

            normalizeStatus(

                record.status

            );


        if(

            status !==

                STATUS_ONGOING

            &&

            status !==

                STATUS_ENDED

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

            typeof State.clearSelectedRecord ===

            "function"

        ){

            State.clearSelectedRecord();

            return;

        }


        State.selectedRecord =

            null;


        State.editingId =

            null;

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

            ).trim() ===

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
       
       Validasi lengkap sebelum update.
    ================================================= */

    validate({

        result,

        reward

    } = {}){

        const selectedRecord =

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
           RECORD STATUS
           
           Record harus tetap ongoing / ended
           sebelum proses update.
        ============================================= */

        const currentStatus =

            normalizeStatus(

                selectedRecord.status

            );


        if(

            currentStatus !==

                STATUS_ONGOING

            &&

            currentStatus !==

                STATUS_ENDED

        ){

            return {

                valid :

                    false,

                message :

                    "Data ini sudah tidak tersedia untuk Edit Input Reward."

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

            status :

                resultValidation.status,

            reward :

                rewardValidation.reward

        };

    },


    /* =================================================
       BUILD CHANGES
       
       Payload yang akan dikirim ke Update.js.
    ================================================= */

    buildChanges({

        result,

        reward

    } = {}){

        const validation =

            this.validate({

                result,

                reward

            });


        if(

            !validation.valid

        ){

            return null;

        }


        /* =============================================
           WIN
        ============================================= */

        if(

            validation.status ===

                STATUS_WIN

        ){

            return {

                status :

                    STATUS_WIN,

                "$reward" :

                    String(

                        validation.reward

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
       SAVE
       
       Kirim perubahan ke Apps Script.
    ================================================= */

    async save({

        result,

        reward

    } = {}){

        const selectedRecord =

            this.getSelectedRecord();


        /* =============================================
           VALIDATION
        ============================================= */

        const validation =

            this.validate({

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


        /* =============================================
           ID
        ============================================= */

        const id =

            String(

                selectedRecord.id ??

                ""

            ).trim();


        if(

            !id

        ){

            return {

                success :

                    false,

                message :

                    "ID data Airdrop tidak ditemukan."

            };

        }


        /* =============================================
           PROJECT
           
           Project tidak diubah.
           
           Digunakan sebagai bagian dari target
           update field saat ini.
        ============================================= */

        const project =

            String(

                selectedRecord.project ??

                ""

            ).trim();


        if(

            !project

        ){

            return {

                success :

                    false,

                message :

                    "Project data Airdrop tidak ditemukan."

            };

        }


        /* =============================================
           CHANGES
        ============================================= */

        const changes =

            this.buildChanges({

                result,

                reward

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


        console.log(

            "===== AIRDROP REWARD UPDATE ====="

        );


        console.log(

            "TARGET:",

            {

                id,

                project

            }

        );


        console.log(

            "CHANGES:",

            changes

        );


        /* =============================================
           SEND UPDATE
        ============================================= */

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

                "REWARD UPDATE RESPONSE:",

                response

            );


            /* =========================================
               CHECK RESPONSE
            ========================================= */

            if(

                !isSuccess(

                    response

                )

            ){

                return {

                    success :

                        false,

                    message :

                        getResponseMessage(

                            response

                        ),

                    response

                };

            }


            /* =========================================
               UPDATE LOCAL RECORD
            ========================================= */

            const updatedRecord = {

                ...selectedRecord,

                ...changes

            };


            if(

                typeof State.setSelectedRecord ===

                "function"

            ){

                State.setSelectedRecord(

                    updatedRecord

                );

            }

            else{

                State.selectedRecord =

                    updatedRecord;

            }


            console.log(

                "===== AIRDROP REWARD UPDATE SUCCESS =====",

                updatedRecord

            );


            return {

                success :

                    true,

                message :

                    validation.status ===

                        STATUS_WIN

                        ?

                        "Reward berhasil disimpan sebagai Win."

                        :

                        "Data berhasil disimpan sebagai Not Win.",

                record :

                    updatedRecord,

                changes,

                response

            };

        }

        catch(

            error

        ){

            console.error(

                "Airdrop Reward Update Error:",

                error

            );


            return {

                success :

                    false,

                message :

                    error?.message

                    ??

                    "Gagal menyimpan Edit Input Reward.",

                error

            };

        }

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
       "$100"     → 100
       "100 USD"  → 100
       "1,250.50" → 1250.50
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
