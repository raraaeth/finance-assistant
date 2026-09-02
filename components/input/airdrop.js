/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Airdrop
   File         : airdrop.js
   Version      : 4.3.0

   Description :
   Airdrop Input Configuration

   Modes :
   - Activity
   - Reward

   Activity :

   Normal Campaign :
   - Tanggal otomatis dari Global Input
   - Type
   - Nama / Wallet
   - Project
   - Start
   - End
   - Status otomatis ongoing

   Bansos :
   - Tanggal otomatis dari Global Input
   - Type = bansos
   - Nama / Wallet
   - Project
   - $ Reward
   - Start tidak digunakan
   - End tidak digunakan
   - Status otomatis win

   Reward :
   - Project ongoing / ended
   - ID
   - Project
   - Type locked
   - Status
   - Reward jika Win

   DATA SOURCE :

   Global Input data.js
        ↓
   getInputRaw()
        ↓
   sheet pertama workspace
        ↓
   data aktivitas / project

   Global Input data.js
        ↓
   getInputData()
        ↓
   sheet kedua workspace
        ↓
   konfigurasi wallet / type

   Principle :
   - Tidak ada daftar wallet / type hardcode.
   - Tidak membaca API secara langsung.
   - Data source ditentukan oleh Global Workspace.
   - Tanggal activity tidak dibuat sebagai field.
   - Tanggal activity otomatis menggunakan State.date.
   - Bansos tidak mempunyai Start / End.
   - Bansos otomatis berstatus win.
   - Reward bansos disimpan pada $reward.
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    State

} from "./state.js";


import {

    getInputRaw,

    getInputData

} from "./data.js";


/* =====================================================
   CONSTANT
===================================================== */

const RULE_OPTION =

    "option";


const TARGET_WALLET =

    "wallet";


const TARGET_TYPE =

    "type";


const STATUS_ONGOING =

    "ongoing";


const STATUS_ENDED =

    "ended";


const STATUS_WIN =

    "win";


const STATUS_NOT_WIN =

    "not_win";


const TYPE_BANSOS =

    "bansos";


const TYPE_CAMPAIGN =

    "campaign";


/* =====================================================
   AIRDROP CONFIG
===================================================== */

export const Airdrop = {


    /* =================================================
       HEADER
    ================================================= */

    title :

        "Input Airdrop",


    subtitle :

        "Tambahkan aktivitas atau masukkan hasil reward Airdrop.",


    workspaceLabel :

        "Airdrop",


    /* =================================================
       PREFIX

       Prefix khusus Input Airdrop.

       Prefix digunakan hanya untuk membuat
       ID transaksi Airdrop.

       Tidak berasal dari global workspace.js.
    ================================================= */

    prefix :

        "AIR",


    /* =================================================
       MODES
    ================================================= */

    modes : [

        {

            id :

                "activity",


            label :

                "Input Activity",


            description :

                "Tambahkan aktivitas Airdrop baru."

        },


        {

            id :

                "reward",


            label :

                "Input Reward",


            description :

                "Tambahkan atau ubah hasil reward Airdrop."

        }

    ],


    /* =================================================
       DEFAULT MODE
    ================================================= */

    defaultMode :

        "activity",

/* =================================================
   TRANSACTION PREPARATION
=================================================

   Hook untuk Global Transaction Controller.

   Transaction.js tidak mengetahui aturan
   khusus Airdrop.

   Flow :

       transaction.js
            ↓
       Airdrop.prepareTransaction()
            ↓
       mode
            ↓
       activity
            ↓
       buildActivityValues()

   Activity :

       campaign
           ↓
       status = ongoing

       bansos
           ↓
       status = win
       $reward wajib
       start = ""
       end = ""

   Reward :

       Tidak menggunakan Activity normalizer.

       Reward mempunyai flow khususnya sendiri.

================================================= */

prepareTransaction :

    function(

        values,

        context = {}

    ){

        /* =========================================
           REWARD

           Reward bukan Activity.

           Jangan jalankan buildActivityValues()
           pada mode Reward.
        ========================================= */

        if(

            context.mode ===

                "reward"

        ){

            return {

                ...values

            };

        }


        /* =========================================
           ACTIVITY

           Gunakan normalizer Activity milik
           module Airdrop.
        ========================================= */

        if(

            context.mode ===

                "activity"

            ||

            !context.mode

        ){

            return buildActivityValues(

                values

            );

        }


        /* =========================================
           FALLBACK

           Mode tidak dikenal tidak boleh
           diproses dengan aturan Activity
           secara diam-diam.

           Kembalikan values apa adanya agar
           controller tetap generic.
        ========================================= */

        return {

            ...values

        };

    },

   /* =================================================
       ACTIVITY STEPS
    ================================================= */
    
    steps : [

        /* =============================================
           TYPE
        ============================================= */

        {

            id :

                "type",


            label :

                "Type",


            type :

                "select",


            placeholder :

                "Pilih type",


            required :

                true,


            options :

                () =>

                    getTypeOptions()

        },


        /* =============================================
           NAMA / WALLET
        ============================================= */

        {

            id :

                "nama",


            label :

                "Nama / Wallet",


            type :

                "select",


            placeholder :

                "Pilih wallet",


            required :

                true,


            options :

                () =>

                    getWalletOptions()

        },


        /* =============================================
           PROJECT
        ============================================= */

        {

            id :

                "project",


            label :

                "Project",


            type :

                "text",


            placeholder :

                "Masukkan nama project",


            required :

                true

        },


        /* =============================================
           $ REWARD

           KHUSUS BANSOS.

           Field baru muncul setelah :

               type = bansos

           DAN :

               project sudah terisi.

           Bansos dianggap langsung menang
           karena reward nyata sudah diterima
           pada tanggal input.

           Tidak membutuhkan Start / End.
        ============================================= */

        {

            id :

                "$reward",


            label :

                "$ Reward",


            type :

                "number",


            placeholder :

                "Masukkan nominal USD",


            required :

                true,


            min :

                0,


            step :

                "any",


            showWhen :

                values =>

                    isBansos(

                        values?.type

                    )

                    &&

                    String(

                        values?.project ??

                        ""

                    ).trim() !== ""

        },


        /* =============================================
           START

           Hanya campaign.

           Bansos tidak mempunyai waktu
           pengerjaan sehingga field ini
           tidak ditampilkan.
        ============================================= */

        {

            id :

                "start",


            label :

                "Start",


            type :

                "date",


            required :

                false,


            showWhen :

                values =>

                    normalizeValue(

                        values?.type

                    )

                    ===

                    TYPE_CAMPAIGN

        },


        /* =============================================
           END

           Hanya campaign.

           Bansos tidak mempunyai waktu
           pengerjaan sehingga field ini
           tidak ditampilkan.
        ============================================= */

        {

            id :

                "end",


            label :

                "End",


            type :

                "date",


            required :

                false,


            showWhen :

                values =>

                    normalizeValue(

                        values?.type

                    )

                    ===

                    TYPE_CAMPAIGN

        }

    ]

};


/* =====================================================
   INIT
===================================================== */

export function initAirdrop(){

    console.log(

        "===== AIRDROP INPUT INIT ====="

    );


    console.log(

        "Airdrop Rules:",

        getRules()

    );


    console.log(

        "Airdrop Activity Data:",

        getAirdropData()

    );


    console.log(

        "Airdrop Type Options:",

        getTypeOptions()

    );


    console.log(

        "Airdrop Wallet Options:",

        getWalletOptions()

    );

}


/* =====================================================
   SET MODE
===================================================== */

export function setAirdropMode(

    mode

){

    const validMode =

        Airdrop.modes.some(

            item =>

                item.id ===

                mode

        );


    if(

        !validMode

    ){

        console.warn(

            "Airdrop mode tidak valid:",

            mode

        );


        return false;

    }


    if(

        typeof State.setMode ===

        "function"

    ){

        State.setMode(

            mode

        );

    }

    else{

        State.mode =

            mode;

    }


    return true;

}


/* =====================================================
   GET RULES
===================================================== */

/*
   Sumber :

       getInputData()
           ↓
       sheet kedua workspace

   Untuk Airdrop :

       airdrop_rules

   Tidak membaca API.data secara langsung.
*/

export function getRules(){

    const data =

        getInputData();


    if(

        !Array.isArray(

            data

        )

    ){

        return [];

    }


    return data.filter(

        item =>

            item

            &&

            typeof item ===

                "object"

            &&

            typeof item.rules ===

                "string"

    );

}


/* =====================================================
   GET OPTION RULES
===================================================== */

function getOptionRules(

    target

){

    const normalizedTarget =

        normalizeValue(

            target

        );


    return getRules().filter(

        rule => {

            const rules =

                normalizeValue(

                    rule.rules

                );


            const ruleTarget =

                normalizeValue(

                    rule.target

                );


            return (

                rules ===

                    RULE_OPTION

            )

            &&

            (

                ruleTarget ===

                    normalizedTarget

            );

        }

    );

}


/* =====================================================
   GET TYPE OPTIONS
===================================================== */

export function getTypeOptions(){

    const rules =

        getOptionRules(

            TARGET_TYPE

        );


    const options = [];


    rules.forEach(

        rule => {

            const value =

                String(

                    rule?.type ??

                    ""

                ).trim();


            if(

                !value

            ){

                return;

            }


            /* =====================================
               ACTIVE
            ===================================== */

            if(

                !isRuleActive(

                    rule

                )

            ){

                return;

            }


            /* =====================================
               DUPLICATE
            ===================================== */

            if(

                options.some(

                    option =>

                        option.value ===

                        value

                )

            ){

                return;

            }


            options.push({

                value :

                    value,


                label :

                    formatOptionLabel(

                        value

                    ),


                note :

                    getRuleNote(

                        rule

                    )

            });

        }

    );


    return options;

}


/* =====================================================
   GET WALLET OPTIONS
===================================================== */

export function getWalletOptions(){

    const rules =

        getOptionRules(

            TARGET_WALLET

        );


    const options = [];


    rules.forEach(

        rule => {

            const value =

                String(

                    rule?.type ??

                    ""

                ).trim();


            if(

                !value

            ){

                return;

            }


            /* =====================================
               ACTIVE
            ===================================== */

            if(

                !isRuleActive(

                    rule

                )

            ){

                return;

            }


            /* =====================================
               DUPLICATE
            ===================================== */

            if(

                options.some(

                    option =>

                        option.value ===

                        value

                )

            ){

                return;

            }


            options.push({

                value :

                    value,


                label :

                    formatOptionLabel(

                        value

                    ),


                note :

                    getRuleNote(

                        rule

                    )

            });

        }

    );


    return options;

}


/* =====================================================
   RULE ACTIVE
===================================================== */

function isRuleActive(

    rule

){

    const active =

        String(

            rule?.active ??

            ""

        )

        .trim()

        .toUpperCase();


    /* =============================================
       ACTIVE KOSONG

       Compatibility dengan rule lama.
    ============================================= */

    if(

        active ===

        ""

    ){

        return true;

    }


    return (

        active ===

            "TRUE"

        ||

        active ===

            "1"

        ||

        active ===

            "YES"

        ||

        active ===

            "ACTIVE"

    );

}


/* =====================================================
   RULE NOTE
===================================================== */

function getRuleNote(

    rule

){

    if(

        !rule

    ){

        return "";

    }


    if(

        rule.note

    ){

        return String(

            rule.note

        );

    }


    return "";

}


/* =====================================================
   FORMAT OPTION LABEL
===================================================== */

function formatOptionLabel(

    value

){

    if(

        !value

    ){

        return "";

    }


    return String(

        value

    )

        .replace(

            /_/g,

            " "

        )

        .replace(

            /\b\w/g,

            letter =>

                letter.toUpperCase()

        );

}


/* =====================================================
   NORMALIZE VALUE
===================================================== */

function normalizeValue(

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
   IS BANSOS
===================================================== */

/*
   Bansos adalah tipe khusus yang :

       - tidak memiliki Start
       - tidak memiliki End
       - langsung Win
       - membutuhkan $ Reward

   Semua perbandingan type tetap
   menggunakan normalized value.
*/

function isBansos(

    value

){

    return (

        normalizeValue(

            value

        )

        ===

        TYPE_BANSOS

    );

}


/* =====================================================
   GET ACTIVITY STEPS
===================================================== */

export function getActivitySteps(){

    return [

        ...Airdrop.steps

    ];

}


/* =====================================================
   GET CURRENT DATA
===================================================== */

/*
   Sumber :

       getInputRaw()
           ↓
       sheet pertama workspace

   Untuk Airdrop :

       airdrop

   Tidak membaca API.raw secara langsung.
*/

export function getAirdropData(){

    return getInputRaw();

}


/* =====================================================
   GET REWARD RECORDS
===================================================== */

/*
   Reward hanya boleh memilih record
   yang statusnya:

       ongoing
       ended

   Record:

       win
       not_win

   tidak ditampilkan lagi.

   Bansos yang sudah otomatis Win
   juga tidak akan muncul pada
   Reward Picker.
*/

export function getRewardRecords(){

    return getAirdropData()

        .filter(

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

}


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
   FIND RECORD BY ID
===================================================== */

export function findRewardRecord(

    id

){

    if(

        !id

    ){

        return null;

    }


    const normalizedId =

        String(

            id

        ).trim();


    const records =

        getRewardRecords();


    return (

        records.find(

            record =>

                String(

                    record?.id ??

                    ""

                ).trim()

                ===

                normalizedId

        )

        ??

        null

    );

}


/* =====================================================
   SELECT REWARD RECORD
===================================================== */

export function selectRewardRecord(

    record

){

    if(

        !record

    ){

        if(

            typeof State.clearSelectedRecord ===

            "function"

        ){

            State.clearSelectedRecord();

        }

        else{

            State.selectedRecord =

                null;

        }


        return;

    }


    if(

        typeof State.setSelectedRecord ===

        "function"

    ){

        State.setSelectedRecord(

            record

        );

    }

    else{

        State.selectedRecord =

            record;

    }


    console.log(

        "AIRDROP REWARD RECORD SELECTED:",

        {

            id :

                record.id,

            project :

                record.project,

            type :

                record.type,

            status :

                record.status

        }

    );

}


/* =====================================================
   BUILD REWARD VALUES
===================================================== */

export function buildRewardValues(

    record,

    status,

    reward

){

    if(

        !record

    ){

        return null;

    }


    const normalizedStatus =

        normalizeStatus(

            status

        );


    /* =============================================
       VALID STATUS
    ============================================= */

    if(

        normalizedStatus !==

            STATUS_WIN

        &&

        normalizedStatus !==

            STATUS_NOT_WIN

    ){

        return null;

    }


    const values = {

        id :

            String(

                record.id ??

                ""

            ).trim(),


        status :

            normalizedStatus

    };


    /* =============================================
       WIN
    ============================================= */

    if(

        normalizedStatus ===

            STATUS_WIN

    ){

        const numericReward =

            Number(

                reward

            );


        if(

            !Number.isFinite(

                numericReward

            )

            ||

            numericReward < 0

        ){

            return null;

        }


        values[

            "$reward"

        ] =

            String(

                numericReward

            );

    }


    /* =============================================
       NOT WIN
    ============================================= */

    else{

        /*
           Not Win tidak mempunyai nominal.

           clearReward digunakan oleh
           transaction/write layer sebagai
           instruksi bahwa reward lama,
           jika ada, harus dikosongkan.
        */

        values.clearReward =

            true;

    }


    return values;

}


/* =====================================================
   APPLY REWARD
===================================================== */

/*
   Reward bukan membuat ID baru.

   ID record lama dipertahankan:

       State.editingId
           ↓
       record.id

   Dengan demikian write layer nantinya
   dapat mencari baris berdasarkan ID
   dan melakukan rewrite pada baris yang sama.
*/

export function applyReward(

    record,

    status,

    reward

){

    const values =

        buildRewardValues(

            record,

            status,

            reward

        );


    if(

        !values

    ){

        return false;

    }


    if(

        typeof State.setSelectedRecord ===

        "function"

    ){

        State.setSelectedRecord(

            record

        );

    }

    else{

        State.selectedRecord =

            record;

    }


    State.editingId =

        String(

            record.id ??

            ""

        ).trim();


    State.values = {

        ...values

    };


    State.mode =

        "reward";


    console.log(

        "AIRDROP REWARD PREPARED:",

        {

            editingId :

                State.editingId,

            values :

                State.values

        }

    );


    return true;

}


/* =====================================================
   BUILD ACTIVITY VALUES
===================================================== */

/*
   Tanggal TIDAK berasal dari field Airdrop.

   Sumber tanggal :

       Global Input
           ↓
       State.date
           ↓
       values.tanggal

   Dengan demikian user tidak perlu
   memilih tanggal dua kali.


   NORMAL CAMPAIGN :

       type      = campaign
       start     = input user
       end       = input user
       status    = ongoing


   BANSOS :

       type      = bansos
       start     = ""
       end       = ""
       status    = win
       $reward   = nominal USD


   Bansos dianggap langsung Win karena
   reward nyata sudah diterima pada hari
   transaksi dibuat.
*/

export function buildActivityValues(

    values

){

    if(

        !values

        ||

        typeof values !==

            "object"

    ){

        return null;

    }


    const type =

        String(

            values.type ??

            ""

        ).trim();


    const nama =

        String(

            values.nama ??

            ""

        ).trim();


    const project =

        String(

            values.project ??

            ""

        ).trim();


    const isBansosType =

        isBansos(

            type

        );


    /* =============================================
       BASE RESULT
    ============================================= */

    const result = {

        tanggal :

            String(

                State.date ??

                ""

            ).trim(),


        type :


            type,


        nama :


            nama,


        project :


            project,


        start :

            String(

                values.start ??

                ""

            ).trim(),


        end :

            String(

                values.end ??

                ""

            ).trim(),


        status :

            STATUS_ONGOING

    };


    /* =============================================
       VALIDATION DASAR
    ============================================= */

    if(

        !result.tanggal

        ||

        !result.type

        ||

        !result.nama

        ||

        !result.project

    ){

        return null;

    }


    /* =============================================
       BANSOS
    ============================================= */

    if(

        isBansosType

    ){

        /*
           Bansos tidak memiliki periode
           pengerjaan.

           Start dan End selalu kosong.
        */

        result.start = "";

        result.end = "";


        /*
           Bansos langsung Win.

           User tidak perlu memilih status.
        */

        result.status =

            STATUS_WIN;


        /*
           Reward wajib ada.
        */

        const rawReward =

            values[

                "$reward"

            ];


        if(

            rawReward ===

                ""

            ||

            rawReward ===

                null

            ||

            rawReward ===

                undefined

        ){

            return null;

        }


        const numericReward =

            Number(

                rawReward

            );


        /*
           Reward harus angka
           dan tidak boleh negatif.
        */

        if(

            !Number.isFinite(

                numericReward

            )

            ||

            numericReward < 0

        ){

            return null;

        }


        result[

            "$reward"

        ] =

            String(

                numericReward

            );


        return result;

    }


    /* =============================================
       NON CAMPAIGN
       
       Start / End tidak digunakan
       untuk type selain campaign.
    ============================================= */

    if(

        normalizeValue(

            result.type

        )

        !==

        TYPE_CAMPAIGN

    ){

        result.start = "";

        result.end = "";

    }


    return result;

}


/* =====================================================
   APPLY ACTIVITY
===================================================== */

export function applyActivity(

    values

){

    const activity =

        buildActivityValues(

            values

        );


    if(

        !activity

    ){

        return false;

    }


    if(

        typeof State.resetCurrent ===

        "function"

    ){

        State.resetCurrent();

    }


    if(

        typeof State.setMode ===

        "function"

    ){

        State.setMode(

            "activity"

        );

    }

    else{

        State.mode =

            "activity";

    }


    State.values =

        activity;


    return true;

}


/* =====================================================
   VALIDATE REWARD
===================================================== */

export function validateReward(

    status,

    reward

){

    const normalizedStatus =

        normalizeStatus(

            status

        );


    /* =============================================
       STATUS
    ============================================= */

    if(

        normalizedStatus !==

            STATUS_WIN

        &&

        normalizedStatus !==

            STATUS_NOT_WIN

    ){

        return {

            valid :

                false,


            message :

                "Status reward tidak valid."

        };

    }


    /* =============================================
       WIN
    ============================================= */

    if(

        normalizedStatus ===

            STATUS_WIN

    ){

        if(

            reward ===

                ""

            ||

            reward ===

                null

            ||

            reward ===

                undefined

        ){

            return {

                valid :

                    false,


                message :

                    "Nominal reward wajib diisi jika status Win."

            };

        }


        const numericReward =

            Number(

                reward

            );


        if(

            !Number.isFinite(

                numericReward

            )

            ||

            numericReward < 0

        ){

            return {

                valid :

                    false,


                message :

                    "Nominal reward harus berupa angka."

            };

        }

    }


    /* =============================================
       NOT WIN
    ============================================= */

    return {

        valid :

            true,


        message :

            ""

    };

}


/* =====================================================
   VALIDATE BANSOS
===================================================== */

/*
   Validation khusus Activity Bansos.

   Bansos harus memiliki :

       type
       nama
       project
       $reward

   Dan otomatis :

       status = win
       start  = ""
       end    = ""
*/

export function validateBansos(

    values

){

    if(

        !values

        ||

        typeof values !==

            "object"

    ){

        return {

            valid :

                false,


            message :

                "Data bansos tidak valid."

        };

    }


    if(

        !isBansos(

            values.type

        )

    ){

        return {

            valid :

                false,


            message :

                "Type bukan bansos."

        };

    }


    const project =

        String(

            values.project ??

            ""

        ).trim();


    if(

        !project

    ){

        return {

            valid :

                false,


            message :

                "Nama project wajib diisi."

        };

    }


    const reward =

        values[

            "$reward"

        ];


    if(

        reward ===

            ""

        ||

        reward ===

            null

        ||

        reward ===

            undefined

    ){

        return {

            valid :

                false,


            message :

                "Nominal $ Reward wajib diisi."

        };

    }


    const numericReward =

        Number(

            reward

        );


    if(

        !Number.isFinite(

            numericReward

        )

        ||

        numericReward < 0

    ){

        return {

            valid :

                false,


            message :

                "$ Reward harus berupa angka USD."

        };

    }


    return {

        valid :

            true,


        message :

            ""

    };

}


/* =====================================================
   REWARD STATUS OPTIONS
===================================================== */

export function getRewardStatusOptions(){

    return [

        {

            value :

                STATUS_WIN,


            label :

                "Win"

        },


        {

            value :

                STATUS_NOT_WIN,


            label :

                "Not Win"

        }

    ];

}


/* =====================================================
   GET STATUS LABEL
===================================================== */

export function getStatusLabel(

    status

){

    const normalized =

        normalizeStatus(

            status

        );


    switch(

        normalized

    ){

        case STATUS_ONGOING:

            return "Ongoing";


        case STATUS_ENDED:

            return "Ended";


        case STATUS_WIN:

            return "Win";


        case STATUS_NOT_WIN:

            return "Not Win";


        default :

            return status ??

                "-";

    }

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(

    value

){

    return String(

        value ??

        ""

    )

        .replace(

            /&/g,

            "&amp;"

        )

        .replace(

            /</g,

            "&lt;"

        )

        .replace(

            />/g,

            "&gt;"

        )

        .replace(

            /"/g,

            "&quot;"

        )

        .replace(

            /'/g,

            "&#039;"

        );

}


/* =====================================================
   RENDER MODE SELECTOR
===================================================== */

export function renderModeSelector(

    container,

    onChange

){

    if(

        !container

    ){

        return;

    }


    container.innerHTML = "";


    const wrapper =

        document.createElement(

            "div"

        );


    wrapper.className =

        "airdrop-input-modes";


    Airdrop.modes.forEach(

        mode => {

            const button =

                document.createElement(

                    "button"

                );


            button.type =

                "button";


            button.className =

                "airdrop-input-mode";


            button.dataset.mode =

                mode.id;


            const title =

                document.createElement(

                    "strong"

                );


            title.textContent =

                mode.label;


            const description =

                document.createElement(

                    "small"

                );


            description.textContent =

                mode.description;


            button.appendChild(

                title

            );


            button.appendChild(

                description

            );


            button.addEventListener(

                "click",

                () => {

                    setAirdropMode(

                        mode.id

                    );


                    wrapper

                        .querySelectorAll(

                            ".airdrop-input-mode"

                        )

                        .forEach(

                            item => {

                                item.classList.toggle(

                                    "active",

                                    item.dataset.mode ===

                                        mode.id

                                );

                            }

                        );


                    if(

                        typeof onChange ===

                        "function"

                    ){

                        onChange(

                            mode.id

                        );

                    }

                }

            );


            wrapper.appendChild(

                button

            );

        }

    );


    container.appendChild(

        wrapper

    );

}


/* =====================================================
   RENDER REWARD PICKER
===================================================== */

/*
   UI khusus Reward.

   Tidak menggunakan field.js
   karena Reward membutuhkan:

       list project
           ↓
       pilih record
           ↓
       detail record
           ↓
       status
           ↓
       nominal jika Win
*/

export function renderRewardPicker(

    container,

    onSelect

){

    if(

        !container

    ){

        return;

    }


    container.innerHTML = "";


    const records =

        getRewardRecords();


    /* =============================================
       TITLE
    ============================================= */

    const title =

        document.createElement(

            "div"

        );


    title.className =

        "airdrop-reward-title";


    title.textContent =

        "Pilih Project";


    container.appendChild(

        title

    );


    /* =============================================
       SCROLL BOX
    ============================================= */

    const list =

        document.createElement(

            "div"

        );


    list.className =

        "airdrop-reward-project-list";


    /* =============================================
       EMPTY
    ============================================= */

    if(

        records.length ===

            0

    ){

        const empty =

            document.createElement(

                "div"

            );


        empty.className =

            "airdrop-reward-empty";


        empty.textContent =

            "Tidak ada project dengan status Ongoing atau Ended.";


        list.appendChild(

            empty

        );

    }


    /* =============================================
       PROJECT ITEMS
    ============================================= */

    records.forEach(

        record => {

            const item =

                document.createElement(

                    "button"

                );


            item.type =

                "button";


            item.className =

                "airdrop-reward-project";


            item.dataset.id =

                String(

                    record.id ??

                    ""

                );


            const project =

                document.createElement(

                    "span"

                );


            project.className =

                "airdrop-reward-project-name";


            project.textContent =

                record.project ??

                "-";


            const meta =

                document.createElement(

                    "small"

                );


            meta.textContent =

                `${

                    formatOptionLabel(

                        record.type

                    )

                } · ${

                    getStatusLabel(

                        record.status

                    )

                }`;


            item.appendChild(

                project

            );


            item.appendChild(

                meta

            );


            item.addEventListener(

                "click",

                () => {

                    list

                        .querySelectorAll(

                            ".airdrop-reward-project"

                        )

                        .forEach(

                            projectItem => {

                                projectItem.classList.remove(

                                    "selected"

                                );

                            }

                        );


                    item.classList.add(

                        "selected"

                    );


                    selectRewardRecord(

                        record

                    );


                    if(

                        typeof onSelect ===

                        "function"

                    ){

                        onSelect(

                            record

                        );

                    }

                }

            );


            list.appendChild(

                item

            );

        }

    );


    container.appendChild(

        list

    );

}


/* =====================================================
   RENDER SELECTED REWARD
===================================================== */

export function renderSelectedReward(

    container,

    record,

    onSubmit

){

    if(

        !container

    ){

        return;

    }


    container.innerHTML = "";


    if(

        !record

    ){

        return;

    }


    /* =============================================
       CARD
    ============================================= */

    const card =

        document.createElement(

            "div"

        );


    card.className =

        "airdrop-reward-selected";


    /* =============================================
       ID
    ============================================= */

    appendInfo(

        card,

        "ID",

        record.id

    );


    /* =============================================
       PROJECT
    ============================================= */

    appendInfo(

        card,

        "Project",

        record.project

    );


    /* =============================================
       TYPE

       LOCKED
    ============================================= */

    appendInfo(

        card,

        "Type",

        formatOptionLabel(

            record.type

        ),

        true

    );


    /* =============================================
       CURRENT STATUS
    ============================================= */

    appendInfo(

        card,

        "Status saat ini",

        getStatusLabel(

            record.status

        ),

        true

    );


    /* =============================================
       NEW STATUS
    ============================================= */

    const statusWrapper =

        document.createElement(

            "div"

        );


    statusWrapper.className =

        "airdrop-reward-status";


    const statusLabel =

        document.createElement(

            "label"

        );


    statusLabel.textContent =

        "Status";


    const statusSelect =

        document.createElement(

            "select"

        );


    statusSelect.className =

        "global-input-control";


    const placeholder =

        document.createElement(

            "option"

        );


    placeholder.value =

        "";


    placeholder.textContent =

        "Pilih status";


    statusSelect.appendChild(

        placeholder

    );


    getRewardStatusOptions().forEach(

        option => {

            const item =

                document.createElement(

                    "option"

                );


            item.value =

                option.value;


            item.textContent =

                option.label;


            statusSelect.appendChild(

                item

            );

        }

    );


    statusWrapper.appendChild(

        statusLabel

    );


    statusWrapper.appendChild(

        statusSelect

    );


    card.appendChild(

        statusWrapper

    );


    /* =============================================
       REWARD

       Hanya muncul jika Win.
    ============================================= */

    const rewardWrapper =

        document.createElement(

            "div"

        );


    rewardWrapper.className =

        "airdrop-reward-amount hidden";


    const rewardLabel =

        document.createElement(

            "label"

        );


    rewardLabel.textContent =

        "Nominal Reward";


    const rewardInput =

        document.createElement(

            "input"

        );


    rewardInput.type =

        "number";


    rewardInput.min =

        "0";


    rewardInput.step =

        "any";


    rewardInput.placeholder =

        "Masukkan nominal";


    rewardInput.className =

        "global-input-control";


    rewardWrapper.appendChild(

        rewardLabel

    );


    rewardWrapper.appendChild(

        rewardInput

    );


    card.appendChild(

        rewardWrapper

    );


    /* =============================================
       ACTION
    ============================================= */

    const button =

        document.createElement(

            "button"

        );


    button.type =

        "button";


    button.className =

        "global-input-action-button";


    button.textContent =

        "Tambahkan";


    button.disabled =

        true;


    card.appendChild(

        button

    );


    /* =============================================
       STATUS CHANGE
    ============================================= */

    statusSelect.addEventListener(

        "change",

        () => {

            const status =

                statusSelect.value;


            if(

                status ===

                    STATUS_WIN

            ){

                rewardWrapper.classList.remove(

                    "hidden"

                );

            }

            else{

                rewardWrapper.classList.add(

                    "hidden"

                );


                rewardInput.value = "";

            }


            button.disabled =

                !isRewardFormValid(

                    status,

                    rewardInput.value

                );

        }

    );


    /* =============================================
       REWARD CHANGE
    ============================================= */

    rewardInput.addEventListener(

        "input",

        () => {

            button.disabled =

                !isRewardFormValid(

                    statusSelect.value,

                    rewardInput.value

                );

        }

    );


    /* =============================================
       SUBMIT
    ============================================= */

    button.addEventListener(

        "click",

        () => {

            const status =

                statusSelect.value;


            const reward =

                rewardInput.value;


            const validation =

                validateReward(

                    status,

                    reward

                );


            if(

                !validation.valid

            ){

                console.warn(

                    validation.message

                );


                return;

            }


            const success =

                applyReward(

                    record,

                    status,

                    reward

                );


            if(

                !success

            ){

                return;

            }


            if(

                typeof onSubmit ===

                "function"

            ){

                onSubmit({

                    record,

                    status,

                    reward,

                    values :

                        {

                            ...State.values

                        },

                    editingId :

                        State.editingId

                });

            }

        }

    );


    container.appendChild(

        card

    );

}


/* =====================================================
   REWARD FORM VALIDATION
===================================================== */

function isRewardFormValid(

    status,

    reward

){

    const validation =

        validateReward(

            status,

            reward

        );


    return validation.valid;

}


/* =====================================================
   APPEND INFO
===================================================== */

function appendInfo(

    container,

    label,

    value,

    locked = false

){

    const row =

        document.createElement(

            "div"

        );


    row.className =

        "airdrop-reward-info";


    if(

        locked

    ){

        row.classList.add(

            "locked"

        );

    }


    const labelElement =

        document.createElement(

            "span"

        );


    labelElement.textContent =

        label;


    const valueElement =

        document.createElement(

            "strong"

        );


    valueElement.textContent =

        value ??

        "-";


    row.appendChild(

        labelElement

    );


    row.appendChild(

        valueElement

    );


    container.appendChild(

        row

    );

}


/* =====================================================
   PREPARE ACTIVITY
===================================================== */

export function prepareActivity(){

    if(

        typeof State.setMode ===

        "function"

    ){

        State.setMode(

            "activity"

        );

    }

    else{

        State.mode =

            "activity";

    }


    if(

        typeof State.resetCurrent ===

        "function"

    ){

        State.resetCurrent();

    }


    State.mode =

        "activity";

}


/* =====================================================
   PREPARE REWARD
===================================================== */

export function prepareReward(){

    if(

        typeof State.setMode ===

        "function"

    ){

        State.setMode(

            "reward"

        );

    }

    else{

        State.mode =

            "reward";

    }


    if(

        typeof State.resetCurrent ===

        "function"

    ){

        State.resetCurrent();

    }


    State.mode =

        "reward";

}


/* =====================================================
   GET CONFIG
===================================================== */

export function getAirdropConfig(){

    return {

        ...Airdrop

    };

}
