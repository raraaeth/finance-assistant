/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Airdrop
   File         : airdrop.js
   Version      : 4.5.0

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

   EDIT INPUT REWARD :

   User memilih project
        ↓
   pilih Status
        ↓
   isi Reward jika Win
        ↓
   Tambahkan
        ↓
   State.editTransactions
        ↓
   pilih project lain
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


/*
   Reward adalah brain untuk Edit Input Reward.

   airdrop.js :
   - menyediakan konfigurasi
   - membuat UI
   - mengatur flow workspace

   reward.js :
   - filtering
   - selection
   - validation
   - build changes
   - staging
   - batch confirmation
*/

import {

    Reward

} from "./reward.js";


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
       EDIT INPUT

       Controller dari Global Input script.js.

       Mode :

       reward
           ↓
       Edit Input Reward

       row
           ↓
       Edit Input Row

       Edit Input Row belum diaktifkan.
    ================================================= */

    async openEdit(context = null) {

        /* =============================================
           RESOLVE EDIT MODE

           Global Input mengirim object:

           {
               workspace,
               mode,
               data,
               state
           }

           Tetap dukung pemanggilan lama
           dengan string untuk menjaga kompatibilitas.
        ============================================= */

        const mode =

            typeof context === "object" &&
            context !== null

                ? context.mode

                : context;


        const normalizedMode =

            normalizeValue(

                mode

            );


        /* =============================================
           EDIT REWARD
        ============================================= */

        if(

            normalizedMode === "reward"

        ){

            return openEditReward();

        }


        /* =============================================
           EDIT ROW
        ============================================= */

        if(

            normalizedMode === "row"

        ){

            console.warn(

                "Airdrop Edit Input Row belum tersedia."

            );


            return null;

        }


        /* =============================================
           UNKNOWN MODE
        ============================================= */

        console.warn(

            "Airdrop Edit Input: mode tidak dikenal:",

            mode

        );


        return null;

    },


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


            if(

                !isRuleActive(

                    rule

                )

            ){

                return;

            }


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


            if(

                !isRuleActive(

                    rule

                )

            ){

                return;

            }


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

export function getAirdropData(){

    return getInputRaw();

}


/* =====================================================
   GET REWARD RECORDS
===================================================== */

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

            typeof Reward.clearSelection ===

            "function"

        ){

            Reward.clearSelection();

        }

        else if(

            typeof State.clearSelectedRecord ===

            "function"

        ){

            State.clearSelectedRecord();

        }

        else{

            State.selectedRecord =

                null;

        }


        return null;

    }


    const selected =

        typeof Reward.selectRecord ===

            "function"

            ?

            Reward.selectRecord(

                record

            )

            :

            record;


    if(

        !selected

    ){

        return null;

    }


    console.log(

        "AIRDROP REWARD RECORD SELECTED:",

        {

            id :

                selected.id,

            project :

                selected.project,

            type :

                selected.type,

            status :

                selected.status

        }

    );


    return selected;

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

        values[

            "$reward"

        ] =

            "";

    }


    return values;

}


/* =====================================================
   APPLY REWARD
===================================================== */

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

        typeof Reward.selectRecord ===

            "function"

    ){

        const selected =

            Reward.selectRecord(

                record

            );


        if(

            !selected

        ){

            return false;

        }

    }

    else if(

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
       BASIC VALIDATION
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

        result.start = "";

        result.end = "";

        result.status =

            STATUS_WIN;


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
   GET PENDING TARGET KEY
===================================================== */

function getPendingTargetKey(

    record

){

    if(

        !record

    ){

        return "";

    }


    return (

        String(

            record.id ??

            ""

        ).trim()

        +

        "::"

        +

        String(

            record.project ??

            ""

        ).trim()

    );

}


/* =====================================================
   HAS PENDING RECORD
===================================================== */

function hasPendingRewardRecord(

    record

){

    if(

        !record

    ){

        return false;

    }


    return Reward.hasPendingEdit(

        record.id,

        record.project

    );

}


/* =====================================================
   RENDER REWARD PICKER
===================================================== */

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

        typeof Reward.getRecords ===

            "function"

            ?

            Reward.getRecords()

            :

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
       INFO
    ============================================= */

    const info =

        document.createElement(

            "small"

        );


    info.className =

        "airdrop-reward-picker-info";


    info.textContent =

        records.length

            ?

            `${records.length} project tersedia`

            :

            "Tidak ada project tersedia";


    container.appendChild(

        info

    );


    /* =============================================
       LIST
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
       ITEMS
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


            item.dataset.project =

                String(

                    record.project ??

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

                    )}`;


            item.appendChild(

                project

            );


            item.appendChild(

                meta

            );


            /* =====================================
               PENDING
            ===================================== */

            if(

                hasPendingRewardRecord(

                    record

                )

            ){

                item.classList.add(

                    "pending"

                );


                const pending =

                    document.createElement(

                        "em"

                    );


                pending.className =

                    "airdrop-reward-project-pending";


                pending.textContent =

                    "Sudah ditambahkan";


                item.appendChild(

                    pending

                );

            }


            item.addEventListener(

                "click",

                () => {

                    if(

                        hasPendingRewardRecord(

                            record

                        )

                    ){

                        console.warn(

                            "Reward project sudah ada di batch:",

                            getPendingTargetKey(

                                record

                            )

                        );


                        return;

                    }


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


                    const selectedRecord =

                        selectRewardRecord(

                            record

                        );


                    if(

                        !selectedRecord

                    ){

                        return;

                    }


                    if(

                        typeof onSelect ===

                        "function"

                    ){

                        onSelect(

                            selectedRecord

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
       TYPE LOCKED
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


    placeholder.value = "";


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
       SUBMIT / STAGE
    ============================================= */

    button.addEventListener(

        "click",

        async () => {

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


            if(

                typeof onSubmit ===

                "function"

            ){

                await onSubmit({

                    record,

                    status,

                    reward

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
   RENDER PENDING EDITS
===================================================== */

function renderPendingEdits(

    container,

    onRemove

){

    if(

        !container

    ){

        return;

    }


    container.innerHTML = "";


    const transactions =

        Reward.getPendingEdits();


    /* =============================================
       WRAPPER
    ============================================= */

    const section =

        document.createElement(

            "div"

        );


    section.className =

        "airdrop-reward-pending-section";


    /* =============================================
       HEADER
    ============================================= */

    const header =

        document.createElement(

            "div"

        );


    header.className =

        "airdrop-reward-pending-header";


    const title =

        document.createElement(

            "strong"

        );


    title.textContent =

        "Sudah Ditambahkan";


    const count =

        document.createElement(

            "span"

        );


    count.textContent =

        String(

            transactions.length

        );


    header.appendChild(

        title

    );


    header.appendChild(

        count

    );


    section.appendChild(

        header

    );


    /* =============================================
       EMPTY
    ============================================= */

    if(

        transactions.length ===

            0

    ){

        const empty =

            document.createElement(

                "small"

            );


        empty.className =

            "airdrop-reward-pending-empty";


        empty.textContent =

            "Belum ada perubahan reward.";


        section.appendChild(

            empty

        );


        container.appendChild(

            section

        );


        return;

    }


    /* =============================================
       LIST
    ============================================= */

    const list =

        document.createElement(

            "div"

        );


    list.className =

        "airdrop-reward-pending-list";


    transactions.forEach(

        (

            transaction,

            index

        ) => {

            const item =

                document.createElement(

                    "div"

                );


            item.className =

                "airdrop-reward-pending-item";


            /* =====================================
               INFO
            ===================================== */

            const info =

                document.createElement(

                    "div"

                );


            info.className =

                "airdrop-reward-pending-info";


            const project =

                document.createElement(

                    "strong"

                );


            project.textContent =

                transaction?.project ??

                "-";


            const meta =

                document.createElement(

                    "small"

                );


            const resultLabel =

                transaction?.result ===

                    STATUS_WIN

                    ?

                    "Win"

                    :

                    "Not Win";


            meta.textContent =

                `${resultLabel}${

                    transaction?.result ===

                        STATUS_WIN

                        ?

                        ` · $${transaction?.reward ?? ""}`

                        :

                        ""

                }`;


            const id =

                document.createElement(

                    "small"

                );


            id.textContent =

                `ID: ${transaction?.id ?? "-"}`;


            info.appendChild(

                project

            );


            info.appendChild(

                meta

            );


            info.appendChild(

                id

            );


            /* =====================================
               REMOVE
            ===================================== */

            const removeButton =

                document.createElement(

                    "button"

                );


            removeButton.type =

                "button";


            removeButton.className =

                "airdrop-reward-pending-remove";


            removeButton.textContent =

                "Hapus";


            removeButton.addEventListener(

                "click",

                () => {

                    if(

                        typeof onRemove ===

                        "function"

                    ){

                        onRemove(

                            index

                        );

                    }

                }

            );


            item.appendChild(

                info

            );


            item.appendChild(

                removeButton

            );


            list.appendChild(

                item

            );

        }

    );


    section.appendChild(

        list

    );


    container.appendChild(

        section

    );

}


/* =====================================================
   RENDER CONFIRM ACTION
===================================================== */

function renderRewardConfirm(

    container,

    onConfirm

){

    if(

        !container

    ){

        return;

    }


    container.innerHTML = "";


    const transactions =

        Reward.getPendingEdits();


    if(

        transactions.length ===

            0

    ){

        return;

    }


    const footer =

        document.createElement(

            "div"

        );


    footer.className =

        "airdrop-reward-confirm";


    const info =

        document.createElement(

            "small"

        );


    info.textContent =

        `${transactions.length} perubahan siap dikonfirmasi.`;


    const button =

        document.createElement(

            "button"

        );


    button.type =

        "button";


    button.className =

        "global-input-confirm-button";


    button.textContent =

        "Konfirmasi";


    button.addEventListener(

        "click",

        async () => {

            button.disabled =

                true;


            button.textContent =

                "Menyimpan...";


            try{

                if(

                    typeof onConfirm ===

                    "function"

                ){

                    await onConfirm();

                }

            }

            finally{

                if(

                    document.body.contains(

                        button

                    )

                ){

                    button.disabled =

                        Reward.getPendingCount() ===

                            0;


                    button.textContent =

                        "Konfirmasi";

                }

            }

        }

    );


    footer.appendChild(

        info

    );


    footer.appendChild(

        button

    );


    container.appendChild(

        footer

    );

}


/* =====================================================
   SHOW REWARD MESSAGE
===================================================== */

function showRewardMessage(

    container,

    message,

    type = "info"

){

    if(

        !container

    ){

        return;

    }


    const existing =

        container.querySelector(

            ".airdrop-reward-message"

        );


    if(

        existing

    ){

        existing.remove();

    }


    if(

        !message

    ){

        return;

    }


    const element =

        document.createElement(

            "div"

        );


    element.className =

        "airdrop-reward-message";


    element.classList.add(

        type

    );


    element.textContent =

        message;


    container.prepend(

        element

    );

}


/* =====================================================
   OPEN EDIT REWARD
===================================================== */

async function openEditReward(){

    console.log(

        "===== AIRDROP EDIT REWARD OPEN ====="

    );


    /* =============================================
       EXISTING OVERLAY
    ============================================= */

    const existing =

        document.getElementById(

            "airdrop-edit-reward-overlay"

        );


    if(

        existing

    ){

        existing.classList.add(

            "is-open"

        );


        document.body.classList.add(

            "input-open"

        );


        refreshEditRewardUI(

            existing

        );


        return existing;

    }


    /* =============================================
       RESET EDIT STATE

       Jangan menghapus State normal.

       Hanya batch Edit Input Reward.
    ============================================= */

    if(

        typeof Reward.clearPendingEdits ===

            "function"

    ){

        Reward.clearPendingEdits();

    }


    if(

        typeof Reward.clearSelection ===

            "function"

    ){

        Reward.clearSelection();

    }


    /* =============================================
       OVERLAY
    ============================================= */

    const overlay =

        document.createElement(

            "div"

        );


    overlay.id =

        "airdrop-edit-reward-overlay";


    overlay.className =

        "airdrop-edit-reward-overlay";


    /* =============================================
       PANEL
    ============================================= */

    const panel =

        document.createElement(

            "div"

        );


    panel.className =

        "airdrop-edit-reward-panel";


    /* =============================================
       HEADER
    ============================================= */

    const header =

        document.createElement(

            "div"

        );


    header.className =

        "airdrop-edit-reward-header";


    const title =

        document.createElement(

            "h2"

        );


    title.textContent =

        "Edit Input Reward";


    const closeButton =

        document.createElement(

            "button"

        );


    closeButton.type =

        "button";


    closeButton.className =

        "airdrop-edit-reward-close";


    closeButton.setAttribute(

        "aria-label",

        "Tutup"

    );


    closeButton.textContent =

        "×";


    header.appendChild(

        title

    );


    header.appendChild(

        closeButton

    );


    /* =============================================
       CONTENT
    ============================================= */

    const content =

        document.createElement(

            "div"

        );


    content.className =

        "airdrop-edit-reward-content";


    /* =============================================
       MESSAGE
    ============================================= */

    const message =

        document.createElement(

            "div"

        );


    message.className =

        "airdrop-edit-reward-message-container";


    /* =============================================
       PICKER
    ============================================= */

    const picker =

        document.createElement(

            "div"

        );


    picker.className =

        "airdrop-edit-reward-picker";


    /* =============================================
       SELECTED
    ============================================= */

    const selected =

        document.createElement(

            "div"

        );


    selected.className =

        "airdrop-edit-reward-selected-container";


    /* =============================================
       PENDING
    ============================================= */

    const pending =

        document.createElement(

            "div"

        );


    pending.className =

        "airdrop-edit-reward-pending-container";


    /* =============================================
       CONFIRM
    ============================================= */

    const confirm =

        document.createElement(

            "div"

        );


    confirm.className =

        "airdrop-edit-reward-confirm-container";


    /* =============================================
       APPEND
    ============================================= */

    content.appendChild(

        message

    );


    content.appendChild(

        picker

    );


    content.appendChild(

        selected

    );


    content.appendChild(

        pending

    );


    content.appendChild(

        confirm

    );


    panel.appendChild(

        header

    );


    panel.appendChild(

        content

    );


    overlay.appendChild(

        panel

    );


    document.body.appendChild(

        overlay

    );


    /* =============================================
       CLOSE
    ============================================= */

    const close =

        () => {

            overlay.classList.remove(

                "is-open"

            );


            document.body.classList.remove(

                "input-open"

            );


            if(

                typeof Reward.clearSelection ===

                    "function"

            ){

                Reward.clearSelection();

            }

        };


    closeButton.addEventListener(

        "click",

        close

    );


    /* =============================================
       BACKDROP
    ============================================= */

    overlay.addEventListener(

        "click",

        event => {

            if(

                event.target ===

                overlay

            ){

                close();

            }

        }

    );


    /* =============================================
       ESCAPE
    ============================================= */

    const escapeHandler =

        event => {

            if(

                event.key ===

                "Escape"

            ){

                close();


                document.removeEventListener(

                    "keydown",

                    escapeHandler

                );

            }

        };


    document.addEventListener(

        "keydown",

        escapeHandler

    );


    /* =============================================
       RENDER SELECTED
    ============================================= */

    const renderSelected =

        record => {

            const selectedRecord =

                selectRewardRecord(

                    record

                );


            if(

                !selectedRecord

            ){

                selected.innerHTML = "";


                return;

            }


            renderSelectedReward(

                selected,

                selectedRecord,

                async ({

                    record,

                    status,

                    reward

                }) => {

                    console.log(

                        "===== AIRDROP REWARD STAGE =====",

                        {

                            id :

                                record?.id,

                            project :

                                record?.project,

                            status,

                            reward

                        }

                    );


                    /* =================================
                       STAGE ONLY

                       TIDAK mengirim Apps Script.
                    ================================= */

                    const result =

                        Reward.add({

                            record,

                            result :

                                status,

                            reward

                        });


                    console.log(

                        "AIRDROP REWARD STAGE RESULT:",

                        result

                    );


                    /* =================================
                       FAILED
                    ================================= */

                    if(

                        !result?.success

                    ){

                        showRewardMessage(

                            message,

                            result?.message ??

                                "Gagal menambahkan perubahan reward.",

                            result?.duplicate

                                ?

                                "warning"

                                :

                                "error"

                        );


                        return;

                    }


                    /* =================================
                       SUCCESS STAGED
                    ================================= */

                    showRewardMessage(

                        message,

                        "Perubahan reward ditambahkan.",

                        "success"

                    );


                    /* =================================
                       CLEAR SELECTED
                    ================================= */

                    if(

                        typeof Reward.clearSelection ===

                            "function"

                    ){

                        Reward.clearSelection();

                    }


                    selected.innerHTML = "";


                    /* =================================
                       REFRESH ALL UI

                       Project yang sudah masuk batch
                       tidak dapat ditambahkan dua kali.
                    ================================= */

                    refreshEditRewardUI(

                        overlay

                    );

                }

            );

        };


    /* =============================================
       CONFIRM
    ============================================= */

    const confirmBatch =

        async () => {

            const count =

                Reward.getPendingCount();


            if(

                count ===

                    0

            ){

                showRewardMessage(

                    message,

                    "Belum ada perubahan reward yang ditambahkan.",

                    "warning"

                );


                return;

            }


            console.log(

                "===== AIRDROP REWARD CONFIRM =====",

                {

                    count

                }

            );


            const result =

                await Reward.confirm();


            console.log(

                "AIRDROP REWARD CONFIRM RESULT:",

                result

            );


            /* =================================
               FULL SUCCESS
            ================================= */

            if(

                result?.success

            ){

                showRewardMessage(

                    message,

                    result.message ??

                        "Reward berhasil disimpan.",

                    "success"

                );


                if(

                    typeof Reward.clearSelection ===

                        "function"

                ){

                    Reward.clearSelection();

                }


                selected.innerHTML = "";


                refreshEditRewardUI(

                    overlay

                );


                return;

            }


            /* =================================
               PARTIAL SUCCESS
            ================================= */

            if(

                result?.partial

            ){

                showRewardMessage(

                    message,

                    result.message ??

                        "Sebagian reward berhasil disimpan.",

                    "warning"

                );


                if(

                    typeof Reward.clearSelection ===

                        "function"

                ){

                    Reward.clearSelection();

                }


                selected.innerHTML = "";


                refreshEditRewardUI(

                    overlay

                );


                return;

            }


            /* =================================
               FAILED
            ================================= */

            showRewardMessage(

                message,

                result?.message ??

                    "Tidak ada perubahan reward yang berhasil disimpan.",

                "error"

            );


            refreshEditRewardUI(

                overlay

            );

        };


    /* =============================================
       INITIAL RENDER
    ============================================= */

    renderRewardPicker(

        picker,

        renderSelected

    );


    renderPendingEdits(

        pending,

        index => {

            const removed =

                Reward.remove(

                    index

                );


            if(

                removed

            ){

                showRewardMessage(

                    message,

                    "Perubahan reward dihapus dari daftar.",

                    "info"

                );

            }


            selected.innerHTML = "";


            if(

                typeof Reward.clearSelection ===

                    "function"

            ){

                Reward.clearSelection();

            }


            refreshEditRewardUI(

                overlay

            );

        }

    );


    renderRewardConfirm(

        confirm,

        confirmBatch

    );


    /* =============================================
       SHOW
    ============================================= */

    overlay.classList.add(

        "is-open"

    );


    document.body.classList.add(

        "input-open"

    );


    return overlay;

}


/* =====================================================
   REFRESH EDIT REWARD UI
===================================================== */

function refreshEditRewardUI(

    overlay

){

    if(

        !overlay

    ){

        return;

    }


    const picker =

        overlay.querySelector(

            ".airdrop-edit-reward-picker"

        );


    const selected =

        overlay.querySelector(

            ".airdrop-edit-reward-selected-container"

        );


    const pending =

        overlay.querySelector(

            ".airdrop-edit-reward-pending-container"

        );


    const confirm =

        overlay.querySelector(

            ".airdrop-edit-reward-confirm-container"

        );


    if(

        !picker

    ){

        return;

    }


    /* =============================================
       CURRENT SELECTED
    ============================================= */

    const currentSelected =

        typeof Reward.getSelectedRecord ===

            "function"

            ?

            Reward.getSelectedRecord()

            :

            null;


    /* =============================================
       PICKER

       Callback memilih record baru.
    ============================================= */

    renderRewardPicker(

        picker,

        record => {

            if(

                !selected

            ){

                return;

            }


            renderSelectedReward(

                selected,

                record,

                async ({

                    record,

                    status,

                    reward

                }) => {

                    const result =

                        Reward.add({

                            record,

                            result :

                                status,

                            reward

                        });


                    if(

                        !result?.success

                    ){

                        const message =

                            overlay.querySelector(

                                ".airdrop-edit-reward-message-container"

                            );


                        showRewardMessage(

                            message,

                            result?.message ??

                                "Gagal menambahkan perubahan reward.",

                            result?.duplicate

                                ?

                                "warning"

                                :

                                "error"

                        );


                        return;

                    }


                    const message =

                        overlay.querySelector(

                            ".airdrop-edit-reward-message-container"

                        );


                    showRewardMessage(

                        message,

                        "Perubahan reward ditambahkan.",

                        "success"

                    );


                    if(

                        typeof Reward.clearSelection ===

                            "function"

                    ){

                        Reward.clearSelection();

                    }


                    selected.innerHTML = "";


                    refreshEditRewardUI(

                        overlay

                    );

                }

            );

        }

    );


    /* =============================================
       RESTORE SELECTED

       Hanya restore kalau record tersebut
       belum masuk batch.
    ============================================= */

    if(

        currentSelected

        &&

        !hasPendingRewardRecord(

            currentSelected

        )

        &&

        selected

    ){

        renderSelectedReward(

            selected,

            currentSelected,

            async ({

                record,

                status,

                reward

            }) => {

                const result =

                    Reward.add({

                        record,

                        result :

                            status,

                        reward

                    });


                const message =

                    overlay.querySelector(

                        ".airdrop-edit-reward-message-container"

                    );


                if(

                    !result?.success

                ){

                    showRewardMessage(

                        message,

                        result?.message ??

                            "Gagal menambahkan perubahan reward.",

                        result?.duplicate

                            ?

                            "warning"

                            :

                            "error"

                    );


                    return;

                }


                showRewardMessage(

                    message,

                    "Perubahan reward ditambahkan.",

                    "success"

                );


                Reward.clearSelection();


                selected.innerHTML = "";


                refreshEditRewardUI(

                    overlay

                );

            }

        );

    }


    /* =============================================
       PENDING
    ============================================= */

    if(

        pending

    ){

        renderPendingEdits(

            pending,

            index => {

                const removed =

                    Reward.remove(

                        index

                    );


                if(

                    removed

                ){

                    const message =

                        overlay.querySelector(

                            ".airdrop-edit-reward-message-container"

                        );


                    showRewardMessage(

                        message,

                        "Perubahan reward dihapus dari daftar.",

                        "info"

                    );

                }


                Reward.clearSelection();


                if(

                    selected

                ){

                    selected.innerHTML = "";

                }


                refreshEditRewardUI(

                    overlay

                );

            }

        );

    }


    /* =============================================
       CONFIRM
    ============================================= */

    if(

        confirm

    ){

        renderRewardConfirm(

            confirm,

            async () => {

                const message =

                    overlay.querySelector(

                        ".airdrop-edit-reward-message-container"

                    );


                const result =

                    await Reward.confirm();


                if(

                    result?.success

                ){

                    showRewardMessage(

                        message,

                        result.message ??

                            "Reward berhasil disimpan.",

                        "success"

                    );


                    Reward.clearSelection();


                    if(

                        selected

                    ){

                        selected.innerHTML = "";

                    }


                    refreshEditRewardUI(

                        overlay

                    );


                    return;

                }


                if(

                    result?.partial

                ){

                    showRewardMessage(

                        message,

                        result.message ??

                            "Sebagian reward berhasil disimpan.",

                        "warning"

                    );


                    Reward.clearSelection();


                    if(

                        selected

                    ){

                        selected.innerHTML = "";

                    }


                    refreshEditRewardUI(

                        overlay

                    );


                    return;

                }


                showRewardMessage(

                    message,

                    result?.message ??

                        "Tidak ada perubahan reward yang berhasil disimpan.",

                    "error"

                );


                refreshEditRewardUI(

                    overlay

                );

            }

        );

    }

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
