/* =====================================================
   Finance Assistant
   Component    : Global Input
   Module       : Airdrop
   File         : airdrop.js
   Version      : 4.8.0

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

   Direct list :
        ↓
   Search / filter
        ↓
   klik card project
        ↓
   detail project
        ↓
   pilih Status
        ↓
   isi Reward jika Win
        ↓
   Tambahkan
        ↓
   UpdateData temporary state
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

   EDIT UI :
   - Ditangani oleh global updatedata.js.
   - Direct card list.
   - Search / filter di atas list.
   - Internal scroll pada list.
   - Klik card untuk membuka detail dan field edit.
   - Full-screen overlay.
   - Mendukung multi-project batch.
   - Apps Script hanya dipanggil saat Konfirmasi.

   EDIT INPUT ROW :
   - Skeleton saja.
   - Belum ada business logic.
   - Target nantinya ID + Tanggal.
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
   Reward adalah business logic untuk Edit Input Reward.

   airdrop.js :
   - konfigurasi workspace
   - aturan Activity
   - adapter Edit Reward
   - skeleton Edit Row

   updatedata.js :
   - UI Edit Input global
   - direct record list
   - search / filter
   - selected detail
   - fields
   - Tambahkan
   - pending list
   - Konfirmasi

   reward.js :
   - filtering
   - selection
   - validation
   - build changes
   - staging
   - batch confirmation

   update.js :
   - komunikasi update ke Apps Script
*/

import {

    Reward

} from "./reward.js";


import {

    UpdateData

} from "./updatedata.js";

import {
   
    EditRow
   
} from "./editrow.js";


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
    ================================================= */

    async openEdit(context = null){

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

            return openEditRow();

        }


        /* =============================================
           UNKNOWN
        ============================================= */

        console.warn(

            "Airdrop Edit Input: mode tidak dikenal:",

            mode

        );


        return null;

    },


    /* =================================================
       TRANSACTION PREPARATION
    ================================================= */

    prepareTransaction :

        function(

            values,

            context = {}

        ){

            /* =========================================
               REWARD

               Reward bukan Activity.
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


            return {

                ...values

            };

        },


    /* =================================================
       ACTIVITY STEPS
    ================================================= */

    steps : [

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

            item &&

            typeof item === "object" &&

            typeof item.rules === "string"

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

        active === ""

    ){

        return true;

    }


    return (

        active === "TRUE" ||

        active === "1" ||

        active === "YES" ||

        active === "ACTIVE"

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

/*
   Hanya record dengan status :

       ongoing
       ended

   yang boleh diedit melalui
   Edit Input Reward.

   Record :

       win
       not_win

   tidak ditampilkan.

   Urutan dibuat terbaru terlebih dahulu
   apabila field tanggal tersedia.
*/

export function getRewardRecords(){

    const records =

        getAirdropData()

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


    return sortRewardRecordsLatestFirst(

        records

    );

}


/* =====================================================
   SORT REWARD RECORDS
===================================================== */

function sortRewardRecordsLatestFirst(

    records

){

    if(

        !Array.isArray(

            records

        )

    ){

        return [];

    }


    return records

        .map(

            (

                record,

                index

            ) => ({

                record,

                index

            })

        )

        .sort(

            (

                a,

                b

            ) => {

                const dateA =

                    getRecordDateValue(

                        a.record

                    );


                const dateB =

                    getRecordDateValue(

                        b.record

                    );


                if(

                    dateA !== null &&

                    dateB !== null

                ){

                    if(

                        dateA !==

                        dateB

                    ){

                        return (

                            dateB -

                            dateA

                        );

                    }

                }


                else if(

                    dateA !== null

                ){

                    return -1;

                }


                else if(

                    dateB !== null

                ){

                    return 1;

                }


                return (

                    a.index -

                    b.index

                );

            }

        )

        .map(

            item =>

                item.record

        );

}


/* =====================================================
   GET RECORD DATE VALUE
===================================================== */

function getRecordDateValue(

    record

){

    if(

        !record ||

        typeof record !== "object"

    ){

        return null;

    }


    const candidates = [

        record.tanggal,

        record.date,

        record.createdAt,

        record.timestamp

    ];


    for(

        const value of candidates

    ){

        if(

            value === null ||

            value === undefined ||

            String(

                value

            ).trim() === ""

        ){

            continue;

        }


        const text =

            String(

                value

            ).trim();


        const parsed =

            Date.parse(

                text

            );


        if(

            Number.isFinite(

                parsed

            )

        ){

            return parsed;

        }


        const normalized =

            text.replace(

                /[^\d]/g,

                ""

            );


        if(

            normalized.length >= 8

        ){

            const numeric =

                Number(

                    normalized

                );


            if(

                Number.isFinite(

                    numeric

                )

            ){

                return numeric;

            }

        }

    }


    return null;

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

        normalizedStatus !== STATUS_WIN &&

        normalizedStatus !== STATUS_NOT_WIN

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


    if(

        normalizedStatus === STATUS_WIN

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


        values["$reward"] =

            String(

                numericReward

            );

    }

    else{

        values["$reward"] = "";

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

        !values ||

        typeof values !== "object"

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

        !result.tanggal ||

        !result.type ||

        !result.nama ||

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

            values["$reward"];


        if(

            rawReward === "" ||

            rawReward === null ||

            rawReward === undefined

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

            ) ||

            numericReward < 0

        ){

            return null;

        }


        result["$reward"] =

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

        !== TYPE_CAMPAIGN

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

        normalizedStatus !== STATUS_WIN &&

        normalizedStatus !== STATUS_NOT_WIN

    ){

        return {

            valid :

                false,


            message :

                "Status reward tidak valid."

        };

    }


    if(

        normalizedStatus === STATUS_WIN

    ){

        if(

            reward === "" ||

            reward === null ||

            reward === undefined

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

            ) ||

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

        !values ||

        typeof values !== "object"

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

        values["$reward"];


    if(

        reward === "" ||

        reward === null ||

        reward === undefined

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

        ) ||

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

            return status ?? "-";

    }

}


/* =====================================================
   EDIT INPUT REWARD
   GLOBAL UPDATEDATA ADAPTER
===================================================== */

/*
   Semua UI Edit Reward ditangani
   oleh components/input/updatedata.js.

   KONSEP UI :

       ┌───────────────────────────────┐
       │ Edit Input Reward             │
       │                               │
       │ [ Cari project... ]           │
       │                               │
       │ DAFTAR PROJECT                │
       │ ┌───────────────────────────┐ │
       │ │ Dagama                    │ │
       │ │ Retro · Ongoing           │ │
       │ ├───────────────────────────┤ │
       │ │ Project B                 │ │
       │ │ Campaign · Ended          │ │
       │ ├───────────────────────────┤ │
       │ │ Project C                 │ │
       │ │ ...                       │ │
       │ └───────────────────────────┘ │
       │        ↕ scroll                │
       │                               │
       │ Detail Project                │
       │ ID                            │
       │ Project                       │
       │ Type                          │
       │ Status saat ini               │
       │                               │
       │ Status                        │
       │ [ Win / Not Win ]             │
       │                               │
       │ Nominal Reward                │
       │ [ ... ]                       │
       │                               │
       │ [ Tambahkan ]                 │
       │                               │
       │ Sudah Ditambahkan             │
       │ ...                           │
       │                               │
       │ [ Konfirmasi ]                │
       └───────────────────────────────┘

   Tidak ada :

       - tombol Pilih Data
       - native select untuk memilih project
       - request Apps Script saat memilih
       - request Apps Script saat Tambahkan

   Apps Script hanya dipanggil
   saat Konfirmasi melalui :

       Reward.confirm()
*/


async function openEditReward(){

    console.log(

        "===== AIRDROP EDIT REWARD OPEN ====="

    );


    /* =============================================
       GET RECORDS
    ============================================= */

    const records =

        typeof Reward.getRecords ===

            "function"

            ?

            Reward.getRecords()

            :

            getRewardRecords();


    /*
       Pastikan hanya record editable
       yang dikirim ke UI.

       Reward.getRecords() adalah business
       filter utama.

       Fallback menggunakan getRewardRecords().
    */

    const editableRecords =

        Array.isArray(

            records

        )

            ?

            sortRewardRecordsLatestFirst(

                records.filter(

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

                )

            )

            :

            [];


    /* =============================================
       CLEAR CURRENT SELECTION
    ============================================= */

    if(

        typeof Reward.clearSelection ===

            "function"

    ){

        Reward.clearSelection();

    }


    /* =============================================
       UPDATE DATA CHECK
    ============================================= */

    if(

        !UpdateData ||

        typeof UpdateData.open !==

            "function"

    ){

        console.error(

            "UpdateData.open() tidak tersedia."

        );


        return null;

    }


    /* =============================================
       OPEN GLOBAL UPDATE DATA
    ============================================= */

    return UpdateData.open({

        /* =========================================
           WORKSPACE
        ========================================= */

        workspace :

            "airdrop",


        mode :

            "reward",


        /* =========================================
           HEADER
        ========================================= */

        title :

            "Edit Input Reward",


        subtitle :

            "Pilih project dari daftar untuk mengubah hasil reward.",


        /* =========================================
           DIRECT LIST
        ========================================= */

        /*
           updatedata.js versi terbaru
           menggunakan direct record list.

           Tidak ada picker/dropdown.

           List langsung tampil ketika overlay
           dibuka.
        */

        listTitle :

            "Daftar Project",


        records :

            editableRecords,


        /* =========================================
           RECORD ID / IDENTITY
        ========================================= */

        /*
           Reward memakai target :

               ID + Project

           Ini khusus Reward.

           Edit Input Row nantinya
           akan memakai :

               ID + Tanggal
        */

        getRecordId :

            record =>

                getRewardTargetKey(

                    record

                ),


        /* =========================================
           RECORD LABEL
        ========================================= */

        getRecordLabel :

            record => {

                const project =

                    String(

                        record?.project ??

                        ""

                    ).trim();


                if(

                    project

                ){

                    return project;

                }


                const id =

                    String(

                        record?.id ??

                        ""

                    ).trim();


                return id || "-";

            },


        /* =========================================
           RECORD META
        ========================================= */

        getRecordMeta :

            record => {

                const type =

                    formatOptionLabel(

                        record?.type

                    );


                const status =

                    getStatusLabel(

                        record?.status

                    );


                const parts = [];


                if(

                    type

                ){

                    parts.push(

                        type

                    );

                }


                if(

                    status

                ){

                    parts.push(

                        status

                    );

                }


                return parts.join(

                    " · "

                );

            },


        /* =========================================
           DETAIL
        ========================================= */

        renderDetail :

            record => {

                return {

                    title :

                        "Detail Project",


                    items : [

                        {

                            label :

                                "ID",


                            value :

                                String(

                                    record?.id ??

                                    "-"

                                )

                        },


                        {

                            label :

                                "Project",


                            value :

                                String(

                                    record?.project ??

                                    "-"

                                )

                        },


                        {

                            label :

                                "Type",


                            value :

                                formatOptionLabel(

                                    record?.type

                                ),


                            locked :

                                true

                        },


                        {

                            label :

                                "Status saat ini",


                            value :

                                getStatusLabel(

                                    record?.status

                                ),


                            locked :

                                true

                        }

                    ]

                };

            },


        /* =========================================
           EDIT FIELDS
        ========================================= */

        renderFields :

            record => {

                return [

                    {

                        id :

                            "status",


                        label :

                            "Status",


                        type :

                            "select",


                        placeholder :

                            "Pilih status",


                        options :

                            getRewardStatusOptions()

                    },


                    {

                        id :

                            "$reward",


                        label :

                            "Nominal Reward",


                        type :

                            "number",


                        placeholder :

                            "Masukkan nominal reward",


                        min :

                            0,


                        step :

                            "any",


                        showWhen :

                            values =>

                                normalizeStatus(

                                    values?.status

                                ) ===

                                STATUS_WIN

                    }

                ];

            },


        /* =========================================
           INITIAL FIELD VALUES
        ========================================= */

        getFieldValue :

            (

                record,

                field

            ) => {

                if(

                    field?.id ===

                    "status"

                ){

                    return "";

                }


                if(

                    field?.id ===

                    "$reward"

                ){

                    return "";

                }


                return "";

            },


        /* =========================================
           SELECT CALLBACK
        ========================================= */

        /*
           Penting :

           Klik card hanya memilih record
           dan membuka editor.

           Tidak ada Apps Script di sini.
        */

        onSelect :

            record => {

                console.log(

                    "===== AIRDROP REWARD SELECT ====="

                );


                console.log(

                    "Selected record:",

                    record

                );


                return selectRewardRecord(

                    record

                );

            },


        /* =========================================
           VALIDATE
        ========================================= */

        validate :

            (

                record,

                values

            ) => {

                if(

                    !record

                ){

                    return {

                        valid :

                            false,


                        message :

                            "Project belum dipilih."

                    };

                }


                return validateReward(

                    values?.status,

                    values?.["$reward"]

                );

            },


        /* =========================================
           BUILD CHANGES
        ========================================= */

        buildChanges :

            (

                record,

                values

            ) => {

                const result =

                    buildRewardValues(

                        record,

                        values?.status,

                        values?.["$reward"]

                    );


                if(

                    !result

                ){

                    return null;

                }


                return {

                    status :

                        result.status,


                    "$reward" :

                        result["$reward"]

                };

            },


        /* =========================================
           STAGE
        ========================================= */

        /*
           Tambahkan hanya memasukkan perubahan
           ke temporary state melalui Reward.add().

           Tidak ada Apps Script.
        */

        onAdd :

            async (

                record,

                values,

                changes

            ) => {

                console.log(

                    "===== AIRDROP REWARD STAGE ====="

                );


                console.log(

                    "Record:",

                    record

                );


                console.log(

                    "Values:",

                    values

                );


                console.log(

                    "Changes:",

                    changes

                );


                const result =

                    Reward.add({

                        record :

                            record,


                        result :

                            values?.status,


                        reward :

                            values?.["$reward"]

                    });


                console.log(

                    "AIRDROP REWARD STAGE RESULT:",

                    result

                );


                return result;

            },


        /* =========================================
           REMOVE PENDING
        ========================================= */

        onRemove :

            async (

                transaction,

                index

            ) => {

                console.log(

                    "===== AIRDROP REWARD REMOVE ====="

                );


                console.log(

                    "Transaction:",

                    transaction

                );


                console.log(

                    "Index:",

                    index

                );


                return Reward.remove(

                    index

                );

            },


        /* =========================================
           GET PENDING
        ========================================= */

        getPending :

            () => {

                if(

                    typeof Reward.getPendingEdits ===

                        "function"

                ){

                    return Reward.getPendingEdits();

                }


                return [];

            },


        /* =========================================
           PENDING COUNT
        ========================================= */

        getPendingCount :

            () => {

                if(

                    typeof Reward.getPendingCount ===

                        "function"

                ){

                    return Reward.getPendingCount();

                }


                return 0;

            },


        /* =========================================
           PENDING LABEL
        ========================================= */

        getPendingLabel :

            transaction => {

                const record =

                    transaction?.record

                    ??

                    transaction;


                const project =

                    String(

                        record?.project ??

                        transaction?.project ??

                        ""

                    ).trim();


                const id =

                    String(

                        record?.id ??

                        transaction?.id ??

                        ""

                    ).trim();


                if(

                    project &&

                    id

                ){

                    return `${project} · ${id}`;

                }


                return project || id || "Data Reward";

            },


        /* =========================================
           CONFIRM
        ========================================= */

        /*
           Ini satu-satunya titik yang
           boleh mengirim perubahan ke server.

           UpdateData hanya mengumpulkan
           pending changes.

           Reward.confirm() yang menjalankan
           Update.updateField() untuk setiap
           record.
        */

        onConfirm :

            async (

                pending

            ) => {

                console.log(

                    "===== AIRDROP REWARD CONFIRM ====="

                );


                console.log(

                    "Pending changes:",

                    pending

                );


                const result =

                    await Reward.confirm();


                console.log(

                    "AIRDROP REWARD CONFIRM RESULT:",

                    result

                );


                return result;

            },


        /* =========================================
           EMPTY
        ========================================= */

        emptyText :

            "Tidak ada project dengan status Ongoing atau Ended.",


        /* =========================================
           SEARCH
        ========================================= */

        searchPlaceholder :

            "Cari project...",


        /* =========================================
           BUTTON TEXT
        ========================================= */

        addText :

            "Tambahkan",


        confirmText :

            "Konfirmasi",


        removeText :

            "Hapus",


        /* =========================================
           PENDING TEXT
        ========================================= */

        pendingTitle :

            "Sudah Ditambahkan",


        addedText :

            "Sudah Ditambahkan",


        duplicateText :

            "Project ini sudah ditambahkan.",


        /* =========================================
           CONFIRM LOADING
        ========================================= */

        confirmLoadingText :

            "Menyimpan...",


        /* =========================================
           UI MODE
        ========================================= */

        fullscreen :

            true,


        allowBackdropClose :

            true,


        allowEscapeClose :

            true

    });

}


/* =====================================================
   EDIT INPUT ROW
   AIRDROP ADAPTER
===================================================== */

/*
   Edit Row menggunakan engine global :

       components/input/editrow.js

   Airdrop hanya menentukan rule workspace.

   Generic engine menangani :
   - maksimal 20 transaksi terakhir
   - direct record list
   - search
   - selected record
   - ID + Tanggal sebagai target
   - ID locked
   - Tanggal locked
   - staging
   - pending
   - Konfirmasi

   Airdrop menentukan :
   - field yang boleh diedit
   - field tambahan yang locked
   - label
   - tipe input
   - option field tertentu
   - validasi khusus Airdrop

   Tidak ada request Apps Script
   ketika record dipilih.

   Tidak ada request Apps Script
   ketika Tambahkan.

   Update hanya dilakukan ketika
   user menekan Konfirmasi.
*/

async function openEditRow(){

    console.log(
        "===== AIRDROP EDIT INPUT ROW OPEN ====="
    );


    /* =============================================
       GET RECORDS
    ============================================= */

    const records =
        typeof EditRow.getEditableRecords ===
            "function"
            ? EditRow.getEditableRecords()
            : getAirdropData();


    console.log(
        "Airdrop Edit Row records:",
        records
    );


    /* =============================================
       CLEAR CURRENT STATE
    ============================================= */

    if(
        typeof EditRow.reset ===
        "function"
    ){

        EditRow.reset();

    }


    /* =============================================
       OPEN CHECK
    ============================================= */

    if(
        !EditRow ||
        typeof EditRow.open !==
            "function"
    ){

        console.error(
            "[Airdrop] EditRow.open() tidak tersedia."
        );

        return null;

    }


    /* =============================================
       OPEN GLOBAL EDIT ROW
    ============================================= */

    return EditRow.open({

        /* =========================================
           WORKSPACE
        ========================================= */

        workspace :
            "airdrop",


        mode :
            "row",


        /* =========================================
           HEADER
        ========================================= */

        title :
            "Edit Input Row",


        subtitle :
            "Pilih transaksi dari daftar untuk mengubah data.",


        /* =========================================
           RECORD SOURCE
        ========================================= */

        /*
           EditRow sendiri sudah membatasi
           menjadi maksimal 20 transaksi terakhir.

           records tetap diberikan di sini supaya
           adapter Airdrop eksplisit terhadap
           source workspace.
        */

        getRecords :
            () => getAirdropData(),


        /* =========================================
           TARGET FIELD
        ========================================= */

        /*
           Target generic :

               ID + Tanggal

           ID dan Tanggal otomatis locked
           oleh editrow.js.
        */

        getIdField :
            record => {

                return "id";

            },


        getDateField :
            record => {

                return "tanggal";

            },


        /* =========================================
           RECORD LABEL
        ========================================= */

        getRecordLabel :
            record => {

                const project =
                    String(
                        record?.project ??
                        ""
                    ).trim();


                if(
                    project
                ){

                    return project;

                }


                const nama =
                    String(
                        record?.nama ??
                        ""
                    ).trim();


                if(
                    nama
                ){

                    return nama;

                }


                const id =
                    String(
                        record?.id ??
                        ""
                    ).trim();


                return id ||
                       "Transaksi Airdrop";

            },


        /* =========================================
           RECORD META
        ========================================= */

        getRecordMeta :
            record => {

                const tanggal =
                    String(
                        record?.tanggal ??
                        ""
                    ).trim();


                const type =
                    formatOptionLabel(
                        record?.type
                    );


                const status =
                    getStatusLabel(
                        record?.status
                    );


                const parts = [];


                if(
                    tanggal
                ){

                    parts.push(
                        tanggal
                    );

                }


                if(
                    type
                ){

                    parts.push(
                        type
                    );

                }


                if(
                    status
                ){

                    parts.push(
                        status
                    );

                }


                return parts.join(
                    " · "
                );

            },


        /* =========================================
           LIST
        ========================================= */

        listTitle :
            "Daftar Transaksi",


        searchPlaceholder :
            "Cari transaksi...",


        emptyText :
            "Tidak ada transaksi yang dapat diedit.",


        /* =========================================
           FIELD RULE
        ========================================= */

        /*
           Airdrop tetap mengikuti struktur
           row yang sekarang :

           tanggal
           id
           type
           nama
           project
           $reward
           start
           end
           status

           ID + tanggal :
               locked oleh generic EditRow.

           Field lain :
               editable secara default.

           Workspace dapat menambahkan
           locked rule di sini.
        */

        isFieldLocked :
            (
                field,
                record
            ) => {

                /*
                   Type pada Airdrop tidak dikunci
                   untuk Edit Row.

                   Status juga tidak dikunci.

                   Karena Edit Row memang ditujukan
                   untuk koreksi seluruh row.
                */

                return false;

            },


        /* =========================================
           FIELD TYPE
        ========================================= */

        getFieldType :
            (
                field,
                value,
                record
            ) => {

                const normalized =
                    normalizeValue(
                        field
                    );


                if(
                    normalized ===
                    "status"
                ){

                    return "select";

                }


                if(
                    normalized ===
                    "type"
                ){

                    return "select";

                }


                if(
                    normalized ===
                    "$reward"
                ){

                    return "number";

                }


                if(
                    normalized ===
                    "start" ||
                    normalized ===
                    "end"
                ){

                    return "date";

                }


                return undefined;

            },


        /* =========================================
           FIELD LABEL
        ========================================= */

        getFieldLabel :
            (
                field,
                record
            ) => {

                switch(
                    field
                ){

                    case "id":
                        return "ID";

                    case "tanggal":
                        return "Tanggal";

                    case "type":
                        return "Type";

                    case "nama":
                        return "Nama / Wallet";

                    case "project":
                        return "Project";

                    case "$reward":
                        return "$ Reward";

                    case "start":
                        return "Start";

                    case "end":
                        return "End";

                    case "status":
                        return "Status";

                    default:
                        return formatOptionLabel(
                            field
                        );

                }

            },


        /* =========================================
           FIELD CONFIG
        ========================================= */

        getFieldConfig :
            (
                field,
                record
            ) => {

                switch(
                    field
                ){

                    case "type":

                        return {

                            type :
                                "select",

                            options :
                                getTypeOptions(),

                            placeholder :
                                "Pilih type"

                        };


                    case "nama":

                        return {

                            type :
                                "text",

                            placeholder :
                                "Masukkan nama / wallet"

                        };


                    case "project":

                        return {

                            type :
                                "text",

                            placeholder :
                                "Masukkan nama project"

                        };


                    case "$reward":

                        return {

                            type :
                                "number",

                            min :
                                0,

                            step :
                                "any",

                            placeholder :
                                "Masukkan nominal USD"

                        };


                    case "start":

                        return {

                            type :
                                "date"

                        };


                    case "end":

                        return {

                            type :
                                "date"

                        };


                    case "status":

                        return {

                            type :
                                "select",

                            options : [

                                {
                                    value :
                                        STATUS_ONGOING,

                                    label :
                                        "Ongoing"
                                },

                                {
                                    value :
                                        STATUS_ENDED,

                                    label :
                                        "Ended"
                                },

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

                            ],

                            placeholder :
                                "Pilih status"

                        };


                    default:

                        return {};

                }

            },


        /* =========================================
           FIELD ORDER
        ========================================= */

        /*
           Karena API sudah mengembalikan object
           row, kita tidak perlu mengetahui seluruh
           header Sheet.

           Untuk Airdrop, bila field ini memang
           tersedia, tampilkan dengan urutan yang
           sama dengan struktur transaksi Airdrop.
        */

        getFieldOrder :
            record => {

                const preferred = [

                    "id",
                    "tanggal",
                    "type",
                    "nama",
                    "project",
                    "$reward",
                    "start",
                    "end",
                    "status"

                ];


                const existing =
                    Object.keys(
                        record || {}
                    );


                return [

                    ...preferred.filter(
                        field =>
                            existing.includes(
                                field
                            )
                    ),

                    ...existing.filter(
                        field =>
                            !preferred.includes(
                                field
                            )
                    )

                ];

            },


        /* =========================================
           DETAIL
        ========================================= */

        renderDetail :
            record => {

                return {

                    title :
                        "Informasi Transaksi",

                    items : [

                        {
                            label :
                                "ID",

                            value :
                                String(
                                    record?.id ??
                                    "-"
                                ),

                            locked :
                                true

                        },

                        {
                            label :
                                "Tanggal",

                            value :
                                String(
                                    record?.tanggal ??
                                    "-"
                                ),

                            locked :
                                true

                        },

                        {
                            label :
                                "Type",

                            value :
                                formatOptionLabel(
                                    record?.type
                                )

                        },

                        {
                            label :
                                "Nama / Wallet",

                            value :
                                String(
                                    record?.nama ??
                                    "-"
                                )

                        },

                        {
                            label :
                                "Project",

                            value :
                                String(
                                    record?.project ??
                                    "-"
                                )

                        },

                        {
                            label :
                                "$ Reward",

                            value :
                                String(
                                    record?.["$reward"] ??
                                    "-"
                                )

                        },

                        {
                            label :
                                "Start",

                            value :
                                String(
                                    record?.start ??
                                    "-"
                                )

                        },

                        {
                            label :
                                "End",

                            value :
                                String(
                                    record?.end ??
                                    "-"
                                )

                        },

                        {
                            label :
                                "Status",

                            value :
                                getStatusLabel(
                                    record?.status
                                )

                        }

                    ]

                };

            },


        /* =========================================
           VALIDATE
        ========================================= */

        validate :
            (
                record,
                overlay,
                context
            ) => {

                if(
                    !record
                ){

                    return false;

                }


                const id =
                    String(
                        record?.id ??
                        ""
                    ).trim();


                const tanggal =
                    String(
                        record?.tanggal ??
                        ""
                    ).trim();


                if(
                    !id
                ){

                    console.error(
                        "[Airdrop EditRow] ID kosong."
                    );

                    return false;

                }


                if(
                    !tanggal
                ){

                    console.error(
                        "[Airdrop EditRow] Tanggal kosong."
                    );

                    return false;

                }


                /*
                   Rule tambahan workspace
                   dapat ditambahkan di sini.

                   Untuk sekarang tidak mengunci
                   type/status/project/etc.
                */

                return true;

            },


        /* =========================================
           BUILD CHANGES
        ========================================= */

        buildChanges :
            (
                record,
                overlay
            ) => {

                /*
                   EditRow generic sudah membaca
                   seluruh editable field dan
                   membangun full row.

                   Di sini kita hanya memastikan
                   ID + tanggal tidak berubah.
                */

                const result =
                    EditRow.buildRow
                        ? null
                        : null;


                /*
                   Jangan membuat row baru
                   berdasarkan daftar field manual.

                   Generic EditRow yang menangani
                   full-row preservation.

                   Return null akan membuat
                   EditRow menggunakan default
                   builder.
                */

                return undefined;

            },


        /* =========================================
           STAGING
        ========================================= */

        onAdd :
            async (
                record,
                values,
                changes
            ) => {

                console.log(
                    "===== AIRDROP EDIT ROW STAGE ====="
                );


                console.log(
                    "Record:",
                    record
                );


                console.log(
                    "Values:",
                    values
                );


                console.log(
                    "Changes:",
                    changes
                );


                /*
                   Tidak ada Apps Script request.

                   Semua staging ditangani
                   oleh EditRow / UpdateData.
                */

                return true;

            },


        /* =========================================
           PENDING LABEL
        ========================================= */

        getPendingLabel :
            item => {

                const record =
                    item?.record ??
                    item;


                const project =
                    String(
                        record?.project ??
                        ""
                    ).trim();


                const tanggal =
                    String(
                        record?.tanggal ??
                        ""
                    ).trim();


                const id =
                    String(
                        record?.id ??
                        ""
                    ).trim();


                if(
                    project &&
                    tanggal
                ){

                    return (
                        `${project} · ${tanggal}`
                    );

                }


                if(
                    id &&
                    tanggal
                ){

                    return (
                        `${id} · ${tanggal}`
                    );

                }


                return (
                    project ||
                    id ||
                    "Data Airdrop"
                );

            },


        /* =========================================
           UI TEXT
        ========================================= */

        addText :
            "Tambahkan",


        confirmText :
            "Konfirmasi",


        removeText :
            "Hapus",


        pendingTitle :
            "Sudah Ditambahkan",


        duplicateText :
            "Transaksi ini sudah ditambahkan.",


        confirmLoadingText :
            "Menyimpan...",


        fullscreen :
            true,


        allowBackdropClose :
            true,


        allowEscapeClose :
            true

    });

}





/* =====================================================
   REWARD TARGET KEY
===================================================== */

/*
   Target Reward :

       ID + Project

   Ini sengaja berbeda dari Edit Input Row.

   Reward bekerja pada project reward tertentu,
   sehingga target business logic Reward tetap
   menggunakan ID + Project.
*/

function getRewardTargetKey(

    record

){

    if(

        !record

    ){

        return "";

    }


    return (

        String(

            record?.id ??

            ""

        ).trim()

        +

        "::"

        +

        String(

            record?.project ??

            ""

        ).trim()

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
