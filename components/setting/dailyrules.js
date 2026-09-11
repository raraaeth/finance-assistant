/* =====================================================
   Finance Assistant
   Component    : Shared Daily Rule Engine
   File         : dailyrules.js
   Version      : 1.0.0

   Responsibility :
   - Read real Payroll Daily rules from Google Sheets
   - Determine active Rule Gaji / period
   - Manage Daily period state
   - Keep old periods as history
   - Attach active Daily period to new rules
   - Manage Rule Work / Tambah / Potong state
   - Detect duplicates inside the correct Daily period
   - Prepare Daily setting payload before save

   Daily schema :
   Rule Gaji :
       type_rule       : rule_gaji
       nama            : gaji
       periode_start
       periode_end
       years

   Other rules :
       periode_start
       periode_end
       years

   Principle :
   Google Sheets = source of truth.
   ===================================================== */


/* =====================================================
   IMPORT GLOBAL API
===================================================== */

import {
    API
} from "../../js/api.js";


/* =====================================================
   IMPORT GLOBAL WORKSPACE
===================================================== */

import {
    getWorkspaceConfig
} from "../../js/workspace.js";


/* =====================================================
   CONSTANT
===================================================== */

const MODE =
    "payroll-daily";


/* =====================================================
   STATE
===================================================== */

const STATE = {

    loaded :
        false,

    rules :
        [],

    activePeriod :
        null,

    newPeriodMode :
        false,

    loadedAt :
        null
};


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
        .trim();

}


/* =====================================================
   NORMALIZE COMPARE VALUE
===================================================== */

function normalizeCompareValue(
    value
){

    return normalizeValue(
        value
    )
        .toLowerCase();

}


/* =====================================================
   GET WORKSPACE
===================================================== */

function getWorkspace(){

    const workspaces =
        getWorkspaceConfig();

    if(
        !workspaces ||
        typeof workspaces !==
            "object"
    ){

        throw new Error(
            "Workspace configuration tidak ditemukan."
        );

    }


    const workspace =
        workspaces[
            MODE
        ];

    if(
        !workspace
    ){

        throw new Error(
            `Workspace Payroll Daily "${MODE}" tidak ditemukan.`
        );

    }


    if(
        !Array.isArray(
            workspace.sheets
        )
        ||
        workspace.sheets.length <
            2
    ){

        throw new Error(
            "Workspace Payroll Daily tidak memiliki DATA sheet yang valid."
        );

    }


    return workspace;

}


/* =====================================================
   GET SHEETS
===================================================== */

function getSheets(){

    const workspace =
        getWorkspace();

    return {

        rawSheet :
            workspace.sheets[0],

        dataSheet :
            workspace.sheets[1]

    };

}


/* =====================================================
   GET COLUMN VALUE
===================================================== */

function getColumnValue(
    row,
    column
){

    if(
        !row ||
        typeof row !==
            "object"
    ){

        return "";

    }


    const target =
        normalizeCompareValue(
            column
        );


    const key =
        Object.keys(
            row
        ).find(
            item =>
                normalizeCompareValue(
                    item
                ) === target
        );


    return key
        ? normalizeValue(
            row[key]
        )
        : "";

}


/* =====================================================
   NORMALIZE RULE ROW
===================================================== */

function normalizeRuleRow(
    row
){

    if(
        !row ||
        typeof row !==
            "object"
    ){

        return null;

    }


    const rule = {

        type_rule :
            getColumnValue(
                row,
                "type_rule"
            ),

        nama :
            getColumnValue(
                row,
                "nama"
            ),

        grade_1 :
            getColumnValue(
                row,
                "grade_1"
            ),

        grade_2 :
            getColumnValue(
                row,
                "grade_2"
            ),

        kondisi :
            getColumnValue(
                row,
                "kondisi"
            ),

        waktu :
            getColumnValue(
                row,
                "waktu"
            ),

        nominal :
            getColumnValue(
                row,
                "nominal"
            ),

        nilai_start :
            getColumnValue(
                row,
                "nilai_start"
            ),

        nilai_end :
            getColumnValue(
                row,
                "nilai_end"
            ),

        periode_start :
            getColumnValue(
                row,
                "periode_start"
            ),

        periode_end :
            getColumnValue(
                row,
                "periode_end"
            ),

        years :
            getColumnValue(
                row,
                "years"
            )

    };


    if(
        !rule.type_rule &&
        !rule.nama
    ){

        return null;

    }


    return rule;

}


/* =====================================================
   NORMALIZE RULES
===================================================== */

function normalizeRules(
    rows
){

    if(
        !Array.isArray(
            rows
        )
    ){

        return [];

    }


    return rows

        .map(
            normalizeRuleRow
        )

        .filter(
            Boolean
        )

        .filter(
            rule =>
                rule.type_rule
        );

}


/* =====================================================
   READ RULES
===================================================== */

async function readRules(){

    const sheets =
        getSheets();


    const result =
        await API.load(
            sheets.rawSheet,
            sheets.dataSheet
        );


    if(
        !result ||
        result.success !==
            true
    ){

        throw new Error(
            "Gagal membaca rule Payroll Daily."
        );

    }


    const rows =
        Array.isArray(
            result.data
        )

            ? result.data

            : Array.isArray(
                API.data
            )

                ? API.data

                : [];


    STATE.rules =
        normalizeRules(
            rows
        );


    STATE.loaded =
        true;


    STATE.loadedAt =
        new Date();


    return STATE.rules;

}


/* =====================================================
   GET RULES
===================================================== */

function getRules(){

    return Array.isArray(
        STATE.rules
    )

        ? STATE.rules

        : [];

}


/* =====================================================
   FIND RULE
===================================================== */

function findRule(
    typeRule,
    nama = ""
){

    const type =
        normalizeCompareValue(
            typeRule
        );

    const name =
        normalizeCompareValue(
            nama
        );


    return getRules()
        .find(
            rule =>

                normalizeCompareValue(
                    rule.type_rule
                ) === type

                &&

                (
                    !name
                    ||
                    normalizeCompareValue(
                        rule.nama
                    ) === name
                )
        );

}


/* =====================================================
   FIND RULES
===================================================== */

function findRules(
    typeRule
){

    const type =
        normalizeCompareValue(
            typeRule
        );


    return getRules()
        .filter(
            rule =>
                normalizeCompareValue(
                    rule.type_rule
                ) === type
        );

}


/* =====================================================
   FIND RULE BY NAME
===================================================== */

function findRuleByName(
    nama
){

    const name =
        normalizeCompareValue(
            nama
        );


    return getRules()
        .filter(
            rule =>
                normalizeCompareValue(
                    rule.nama
                ) === name
        );

}


/* =====================================================
   GET DAILY PERIOD START
===================================================== */

function getPeriodStart(
    period
){

    return normalizeValue(
        period?.periode_start
    );

}


/* =====================================================
   GET DAILY PERIOD END
===================================================== */

function getPeriodEnd(
    period
){

    return normalizeValue(
        period?.periode_end
    );

}


/* =====================================================
   GET DAILY PERIOD YEAR
===================================================== */

function getPeriodYear(
    period
){

    const year =
        normalizeValue(
            period?.years
        );


    if(
        year
    ){

        return year;

    }


    const match =
        getPeriodStart(
            period
        )
            .match(
                /^(\d{4})-/
            );


    return match
        ? match[1]
        : "";

}


/* =====================================================
   VALID PERIOD
===================================================== */

function hasValidPeriod(
    rule
){

    return Boolean(

        getPeriodStart(
            rule
        )

        &&

        getPeriodEnd(
            rule
        )

    );

}


/* =====================================================
   PERIOD KEY
===================================================== */

function getPeriodKey(
    period
){

    const start =
        getPeriodStart(
            period
        );

    const end =
        getPeriodEnd(
            period
        );


    return start && end

        ? `${start}__${end}`

        : "";

}


/* =====================================================
   TIME VALUE
===================================================== */

function getTimeValue(
    value
){

    const normalized =
        normalizeValue(
            value
        );


    if(
        !normalized
    ){

        return 0;

    }


    const time =
        Date.parse(
            normalized
        );


    return Number.isNaN(
        time
    )

        ? 0

        : time;

}


/* =====================================================
   FIND LATEST DAILY PERIOD
===================================================== */

function findLatestPeriod(){

    const periods =
        getRules()
            .filter(
                rule =>

                    normalizeCompareValue(
                        rule.type_rule
                    ) ===
                        "rule_gaji"

                    &&

                    normalizeCompareValue(
                        rule.nama
                    ) ===
                        "gaji"

                    &&

                    hasValidPeriod(
                        rule
                    )
            );


    if(
        periods.length ===
            0
    ){

        return null;

    }


    let latest =
        null;


    periods.forEach(
        rule => {

            if(
                !latest
            ){

                latest =
                    rule;

                return;

            }


            const currentTime =
                getTimeValue(
                    getPeriodStart(
                        rule
                    )
                );


            const latestTime =
                getTimeValue(
                    getPeriodStart(
                        latest
                    )
                );


            if(
                currentTime >
                latestTime
            ){

                latest =
                    rule;

                return;

            }


            /*
             * Jika tanggal sama,
             * rule yang berada lebih
             * akhir di Sheet menjadi
             * active period.
             */

            if(
                currentTime ===
                latestTime
            ){

                latest =
                    rule;

            }

        }
    );


    return latest;

}


/* =====================================================
   SET ACTIVE PERIOD
===================================================== */

function setActivePeriod(
    period
){

    STATE.activePeriod =
        period

            ? {

                type_rule :
                    period.type_rule,

                nama :
                    period.nama,

                grade_1 :
                    period.grade_1,

                grade_2 :
                    period.grade_2,

                kondisi :
                    period.kondisi,

                waktu :
                    period.waktu,

                nominal :
                    period.nominal,

                nilai_start :
                    period.nilai_start,

                nilai_end :
                    period.nilai_end,

                periode_start :
                    period.periode_start,

                periode_end :
                    period.periode_end,

                years :
                    period.years

            }

            : null;


    return STATE.activePeriod;

}


/* =====================================================
   REFRESH ACTIVE PERIOD
===================================================== */

function refreshActivePeriod(){

    return setActivePeriod(
        findLatestPeriod()
    );

}


/* =====================================================
   GET ACTIVE PERIOD
===================================================== */

function getActivePeriod(){

    return STATE.activePeriod;

}


/* =====================================================
   GET ACTIVE PERIOD KEY
===================================================== */

function getActivePeriodKey(){

    return getPeriodKey(
        getActivePeriod()
    );

}


/* =====================================================
   NEW PERIOD MODE
===================================================== */

function isNewPeriodMode(){

    return STATE.newPeriodMode ===
        true;

}


function enterNewPeriodMode(){

    STATE.newPeriodMode =
        true;

    return true;

}


function exitNewPeriodMode(){

    STATE.newPeriodMode =
        false;

    return true;

}


/* =====================================================
   RESET SESSION STATE
===================================================== */

function resetSessionState(){

    STATE.newPeriodMode =
        false;

    STATE.activePeriod =
        null;

    return true;

}


/* =====================================================
   RULE BELONGS TO PERIOD
===================================================== */

function ruleBelongsToPeriod(
    rule,
    period
){

    if(
        !rule ||
        !period
    ){

        return false;

    }


    const ruleStart =
        normalizeCompareValue(
            getPeriodStart(
                rule
            )
        );


    const ruleEnd =
        normalizeCompareValue(
            getPeriodEnd(
                rule
            )
        );


    const periodStart =
        normalizeCompareValue(
            getPeriodStart(
                period
            )
        );


    const periodEnd =
        normalizeCompareValue(
            getPeriodEnd(
                period
            )
        );


    if(
        !ruleStart ||
        !ruleEnd ||
        !periodStart ||
        !periodEnd
    ){

        return false;

    }


    return (

        ruleStart ===
            periodStart

        &&

        ruleEnd ===
            periodEnd

    );

}


/* =====================================================
   GET RULES IN PERIOD
===================================================== */

function getRulesInPeriod(
    period = null
){

    const target =
        period ??
        getActivePeriod();


    if(
        !target
    ){

        return [];

    }


    return getRules()
        .filter(
            rule =>
                ruleBelongsToPeriod(
                    rule,
                    target
                )
        );

}


/* =====================================================
   GET CURRENT PERIOD RULES
===================================================== */

function getCurrentPeriodRules(){

    return getRulesInPeriod();

}


/* =====================================================
   USED NAMES
===================================================== */

function getUsedNamesInPeriod(
    typeRule,
    period = null
){

    const target =
        normalizeCompareValue(
            typeRule
        );


    const names =
        new Set();


    getRulesInPeriod(
        period
    )
        .forEach(
            rule => {

                if(
                    normalizeCompareValue(
                        rule.type_rule
                    ) !== target
                ){

                    return;

                }


                const name =
                    normalizeCompareValue(
                        rule.nama
                    );


                if(
                    name
                ){

                    names.add(
                        name
                    );

                }

            }
        );


    return names;

}


/* =====================================================
   IS RULE NAME USED
===================================================== */

function isRuleNameUsed(
    typeRule,
    nama,
    period = null
){

    return getUsedNamesInPeriod(
        typeRule,
        period
    )
        .has(
            normalizeCompareValue(
                nama
            )
        );

}


/* =====================================================
   AVAILABLE NAMES
===================================================== */

function getAvailableNames(
    typeRule,
    options = []
){

    const used =
        getUsedNamesInPeriod(
            typeRule
        );


    if(
        !Array.isArray(
            options
        )
    ){

        return [];

    }


    return options.filter(
        option => {

            const value =
                typeof option ===
                    "object"

                    ? option.value

                    : option;


            return !used.has(
                normalizeCompareValue(
                    value
                )
            );

        }
    );

}


/* =====================================================
   RULE GAJI STATE
===================================================== */

function getRuleGajiState(){

    const period =
        getActivePeriod();


    if(
        !period
    ){

        return {
            exists :
                false,

            rule :
                null
        };

    }


    const rule =
        getRulesInPeriod(
            period
        )
            .find(
                item =>

                    normalizeCompareValue(
                        item.type_rule
                    ) ===
                        "rule_gaji"

                    &&

                    normalizeCompareValue(
                        item.nama
                    ) ===
                        "gaji"
            );


    return {

        exists :
            Boolean(
                rule
            ),

        rule :
            rule ??
            null

    };

}


/* =====================================================
   RULE TAMBAH STATE
===================================================== */

function getRuleTambahState(){

    const rules =
        getRulesInPeriod()
            .filter(
                rule =>
                    normalizeCompareValue(
                        rule.type_rule
                    ) ===
                        "rule_tambah"
            );


    const names =
        new Set(

            rules

                .map(
                    rule =>
                        normalizeCompareValue(
                            rule.nama
                        )
                )

                .filter(
                    Boolean
                )

        );


    return {

        names,

        rules

    };

}


/* =====================================================
   RULE POTONG STATE
===================================================== */

function getRulePotongState(){

    const rules =
        getRulesInPeriod()
            .filter(
                rule =>
                    normalizeCompareValue(
                        rule.type_rule
                    ) ===
                        "rule_potong"
            );


    const names =
        new Set(

            rules

                .map(
                    rule =>
                        normalizeCompareValue(
                            rule.nama
                        )
                )

                .filter(
                    Boolean
                )

        );


    return {

        names,

        rules

    };

}

/* =====================================================
   RULE APPLY FIELD LOCK
===================================================== */
function applyFieldOptionsLock(
    section,
    fieldName,
    masterOptions,
    lockedNames = [],
    newPeriodMode = false
){
    if(!section || !Array.isArray(section.fields)){
        return;
    }

    const field = section.fields.find(
        item => item?.name === fieldName
    );

    if(!field){
        return;
    }

    const options = Array.isArray(masterOptions)
        ? masterOptions
        : [];

    // Periode baru → semua option dibuka
    if(newPeriodMode){
        field.options = options.map(option => ({
            ...option
        }));

        return;
    }

    const locked =
        lockedNames instanceof Set
            ? lockedNames
            : new Set(lockedNames || []);

    field.options = options
        .filter(option => {
            const value = normalizeCompareValue(
                option?.value
            );

            return !locked.has(value);
        })
        .map(option => ({
            ...option
        }));
}


/* =====================================================
   RULE WORK STATE
===================================================== */

function getRuleWorkState(){

    const rules =
        getRulesInPeriod()
            .filter(
                rule =>
                    normalizeCompareValue(
                        rule.type_rule
                    ) ===
                        "rule_work"
            );


    return {

        rules,

        count :
            rules.length

    };

}


/* =====================================================
   WORK SOURCE
===================================================== */

function getWorkSource(){

    return {

        type :
            "rule_work",

        rules :
            getRuleWorkState()
                .rules

    };

}


/* =====================================================
   INHERIT ACTIVE PERIOD
===================================================== */

function inheritActivePeriod(
    rule
){

    if(
        !rule ||
        typeof rule !==
            "object"
    ){

        return rule;

    }


    /*
     * New period mode :
     * jangan mengambil period lama.
     */

    if(
        isNewPeriodMode()
    ){

        return {

            ...rule,

            periode_start :
                rule.periode_start ??
                "",

            periode_end :
                rule.periode_end ??
                "",

            years :
                rule.years ??
                ""

        };

    }


    const period =
        getActivePeriod();


    if(
        !period
    ){

        return {

            ...rule,

            periode_start :
                rule.periode_start ??
                "",

            periode_end :
                rule.periode_end ??
                "",

            years :
                rule.years ??
                ""

        };

    }


    return {

        ...rule,

        periode_start :
            getPeriodStart(
                period
            ),

        periode_end :
            getPeriodEnd(
                period
            ),

        years :
            getPeriodYear(
                period
            )

    };

}


/* =====================================================
   ATTACH ACTIVE PERIOD
===================================================== */

function attachActivePeriod(
    rule
){

    if(
        !rule
    ){

        return null;

    }


    const period =
        getActivePeriod();


    if(
        !period
    ){

        return {
            ...rule
        };

    }


    return {

        ...rule,

        periode_start :
            getPeriodStart(
                period
            ),

        periode_end :
            getPeriodEnd(
                period
            ),

        years :
            getPeriodYear(
                period
            )

    };

}


/* =====================================================
   PREPARE RULE
===================================================== */

function prepareRule(
    rule
){

    if(
        !rule
        ||
        typeof rule !== "object"
    ){

        return rule;

    }


    return {
        ...rule
    };

}


/* =====================================================
   CREATE RULE IDENTITY
===================================================== */

function createRuleIdentity(
    rule
){

    if(
        !rule
    ){

        return "";

    }


    return [

        normalizeCompareValue(
            rule.type_rule
        ),

        normalizeCompareValue(
            rule.nama
        ),

        normalizeCompareValue(
            rule.grade_1
        ),

        normalizeCompareValue(
            rule.grade_2
        ),

        normalizeCompareValue(
            rule.kondisi
        ),

        normalizeCompareValue(
            rule.waktu
        ),

        normalizeCompareValue(
            rule.nominal
        ),

        normalizeCompareValue(
            rule.nilai_start
        ),

        normalizeCompareValue(
            rule.nilai_end
        ),

        normalizeCompareValue(
            rule.periode_start
        ),

        normalizeCompareValue(
            rule.periode_end
        ),

        normalizeCompareValue(
            rule.years
        )

    ].join("|");

}


/* =====================================================
   EXACT DUPLICATE
===================================================== */

function isExactRuleDuplicate(
    rule
){

    const identity =
        createRuleIdentity(
            rule
        );


    if(
        !identity
    ){

        return false;

    }


    return getRulesInPeriod()
        .some(
            existing =>

                createRuleIdentity(
                    existing
                ) === identity
        );

}


/* =====================================================
   RULE WORK DUPLICATE
===================================================== */

function isRuleWorkDuplicate(
    rule
){

    if(
        !rule ||
        normalizeCompareValue(
            rule.type_rule
        ) !==
            "rule_work"
    ){

        return false;

    }


    return isExactRuleDuplicate(
        rule
    );

}


/* =====================================================
   VALIDATE NEW RULE
===================================================== */

async function validateNewRule(
    rule
){

    await ensureLoaded();


    if(
        !rule
    ){

        return {

            valid :
                false,

            duplicate :
                false,

            error :
                "Rule tidak valid."

        };

    }


    const type =
        normalizeCompareValue(
            rule.type_rule
        );


    /* =============================================
       RULE WORK
    ============================================= */

    if(
        type ===
            "rule_work"
    ){

        /*
         * Work boleh dibuat ulang
         * pada periode baru.
         *
         * History periode lama
         * tidak boleh menjadi
         * duplicate blocker.
         */

        if(
            isNewPeriodMode()
        ){

            return {

                valid :
                    true,

                duplicate :
                    false

            };

        }


        if(
            isRuleWorkDuplicate(
                rule
            )
        ){

            return {

                valid :
                    false,

                duplicate :
                    true,

                error :
                    "Rule Work yang sama sudah dibuat."

            };

        }


        return {

            valid :
                true,

            duplicate :
                false

        };

    }


    /* =============================================
       RULE TAMBAH / POTONG
    ============================================= */

    if(
        type ===
            "rule_tambah"

        ||

        type ===
            "rule_potong"
    ){

        if(
            !isNewPeriodMode()

            &&

            isRuleNameUsed(
                type,
                rule.nama
            )
        ){

            return {

                valid :
                    false,

                duplicate :
                    true,

                error :
                    `Rule "${rule.nama}" sudah dibuat pada periode aktif.`

            };

        }

    }


    /* =============================================
       RULE GAJI
    ============================================= */

    if(
        type ===
            "rule_gaji"

        &&

        !isNewPeriodMode()

        &&

        getRuleGajiState()
            .exists
    ){

        return {

            valid :
                false,

            duplicate :
                true,

            error :
                "Rule Gaji untuk periode aktif sudah dibuat."

        };

    }


    return {

        valid :
            true,

        duplicate :
            false

    };

}


/* =====================================================
   LOCK STATE
===================================================== */

function getLockState(){

    const period =
        getActivePeriod();


    const gaji =
        getRuleGajiState();


    const tambah =
        getRuleTambahState();


    const potong =
        getRulePotongState();


    const work =
        getRuleWorkState();


    return {

        mode :
            MODE,

        hasPeriod :
            Boolean(
                period
            ),

        activePeriod :
            period,

        activePeriodKey :
            getPeriodKey(
                period
            ),

        newPeriodMode :
            isNewPeriodMode(),

        ruleGaji :
            gaji,

        ruleTambah :
            tambah,

        rulePotong :
            potong,

        ruleWork :
            work,

        attendance : {

            rules :
                [],

            names :
                new Set(),

            count :
                0

        }

    };

}


/* =====================================================
   UI STATE
===================================================== */

function getRuleUIState(){

    const state =
        getLockState();


    /*
     * New period :
     * seluruh dependent rule
     * kembali terbuka.
     */

    if(
        state.newPeriodMode
    ){

        return {

            ...state,

            lockRuleGaji :
                false,

            lockedTambah :
                new Set(),

            lockedPotong :
                new Set(),

            lockRuleWork :
                false,

            lockPeriod :
                false

        };

    }


    return {

        ...state,

        lockRuleGaji :
            state.ruleGaji.exists,

        lockedTambah :
            state.ruleTambah.names,

        lockedPotong :
            state.rulePotong.names,

        lockRuleWork :
            false,

        lockPeriod :
            state.hasPeriod

    };

}


/* =====================================================
   REFRESH
===================================================== */

async function refresh(){

    const rules =
        await readRules();


    const activePeriod =
        refreshActivePeriod();


    /*
     * Setiap refresh dari Sheet
     * kembali ke normal mode.
     */

    STATE.newPeriodMode =
        false;


    return {

        rules,

        activePeriod,

        state :
            getLockState(),

        ui :
            getRuleUIState()

    };

}


/* =====================================================
   GET STATE
===================================================== */

function getState(){

    return {

        rules :
            getRules(),

        activePeriod :
            getActivePeriod(),

        state :
            getLockState(),

        ui :
            getRuleUIState()

    };

}


/* =====================================================
   ENSURE LOADED
===================================================== */

async function ensureLoaded(){

    if(
        !STATE.loaded
    ){

        return refresh();

    }


    return getState();

}


/* =====================================================
   GET RULE STATE
===================================================== */

async function getRuleState({
    sectionId = ""
} = {}){

    await ensureLoaded();


    const state =
        getRuleUIState();


    /* =============================================
       RULE GAJI
    ============================================= */

    if(
        sectionId ===
            "rule_gaji"
    ){

        return {

            created :
                state.ruleGaji
                    .exists,

            periodExists :
                state.hasPeriod,

            lockPeriod :
                state.hasPeriod,

            newPeriodMode :
                state.newPeriodMode,

            gaji :
                state.ruleGaji
                    .exists,

            createdRule :
                state.ruleGaji
                    .rule,

            activePeriod :
                state.activePeriod

        };

    }


    /* =============================================
       RULE WORK
    ============================================= */

    if(
        sectionId ===
            "rule_work"
    ){

        return {

            created :
                false,

            lockRuleWork :
                false,

            newPeriodMode :
                state.newPeriodMode,

            activePeriod :
                state.activePeriod

        };

    }


    /* =============================================
       RULE TAMBAH
    ============================================= */

    if(
        sectionId ===
            "rule_tambah"
    ){

        return {

            created :
                state.ruleTambah
                    .rules
                    .length > 0,

            locked :
                state.lockedTambah,

            newPeriodMode :
                state.newPeriodMode,

            activePeriod :
                state.activePeriod

        };

    }


    /* =============================================
       RULE POTONG
    ============================================= */

    if(
        sectionId ===
            "rule_potong"
    ){

        return {

            created :
                state.rulePotong
                    .rules
                    .length > 0,

            locked :
                state.lockedPotong,

            newPeriodMode :
                state.newPeriodMode,

            activePeriod :
                state.activePeriod

        };

    }


    return {

        activePeriod :
            state.activePeriod,

        newPeriodMode :
            state.newPeriodMode

    };

}


/* =====================================================
   EXISTING RULE
===================================================== */

async function getExistingRule(
    typeRule,
    nama
){

    await ensureLoaded();


    return findRule(
        typeRule,
        nama
    );

}


/* =====================================================
   EXISTING RULES
===================================================== */

async function getExistingRules(
    typeRule
){

    await ensureLoaded();


    return findRules(
        typeRule
    );

}


/* =====================================================
   EXISTING PERIOD
===================================================== */

async function getExistingPeriod(){

    await ensureLoaded();


    return getActivePeriod();

}


/* =====================================================
   USED RULE NAMES
===================================================== */

async function getUsedRuleNames(
    typeRule
){

    await ensureLoaded();


    return getUsedNamesInPeriod(
        typeRule
    );

}


/* =====================================================
   AVAILABLE RULE OPTIONS
===================================================== */

async function getAvailableRuleOptions(
    typeRule,
    options = []
){

    await ensureLoaded();


    /*
     * Period baru :
     * semua pilihan kembali tersedia.
     */

    if(
        isNewPeriodMode()
    ){

        return Array.isArray(
            options
        )

            ? [
                ...options
            ]

            : [];

    }


    return getAvailableNames(
        typeRule,
        options
    );

}


/* =====================================================
   OPTION LOCK
===================================================== */

async function isOptionLocked(
    typeRule,
    nama
){

    await ensureLoaded();


    if(
        isNewPeriodMode()
    ){

        return false;

    }


    return isRuleNameUsed(
        typeRule,
        nama
    );

}


/* =====================================================
   ADD NEW PERIOD
===================================================== */

async function addNewPeriod(){

    await ensureLoaded();


    const previousPeriod =
        getActivePeriod();


    enterNewPeriodMode();


    return {

        success :
            true,

        mode :
            MODE,

        newPeriodMode :
            true,

        previousPeriod

    };

}


/* =====================================================
   PERIOD DISPLAY DATA
===================================================== */

function getPeriodDisplayData(
    period =
        getActivePeriod()
){

    if(
        !period
    ){

        return {

            exists :
                false,

            nilaiStart :
                "",

            nilaiEnd :
                "",

            berlakuStart :
                "",

            berlakuEnd :
                "",

            periodeStart :
                "",

            periodeEnd :
                "",

            years :
                "",

            text :
                []

        };

    }


    const nilaiStart =
        normalizeValue(
            period.nilai_start
        );


    const nilaiEnd =
        normalizeValue(
            period.nilai_end
        );


    const periodeStart =
        getPeriodStart(
            period
        );


    const periodeEnd =
        getPeriodEnd(
            period
        );


    const years =
        getPeriodYear(
            period
        );


    return {

        exists :
            true,

        nilaiStart,

        nilaiEnd,

        /*
         * Alias supaya
         * controller generic
         * tetap dapat memakai
         * nama berlakuStart /
         * berlakuEnd jika diperlukan.
         */

        berlakuStart :
            periodeStart,

        berlakuEnd :
            periodeEnd,

        periodeStart,

        periodeEnd,

        years,

        text : [

            nilaiStart,

            nilaiEnd,

            periodeStart,

            periodeEnd

        ]

    };

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(
    value
){

    const normalized =
        normalizeValue(
            value
        );


    if(
        !normalized
    ){

        return "-";

    }


    const date =
        new Date(

            normalized.length ===
                10

                ? `${normalized}T00:00:00`

                : normalized

        );


    if(
        Number.isNaN(
            date.getTime()
        )
    ){

        return normalized;

    }


    return new Intl.DateTimeFormat(
        "id-ID",
        {

            day :
                "numeric",

            month :
                "long",

            year :
                "numeric"

        }
    )
        .format(
            date
        );

}


/* =====================================================
   PERIOD NOTE
===================================================== */

function buildPeriodNote(
    period =
        getActivePeriod()
){

    if(
        !period
    ){

        return {

            title :
                "Periode Gaji",

            text :
                "",

            html :
                ""

        };

    }


    const nilaiStart =
        formatDate(
            period.nilai_start
        );


    const nilaiEnd =
        formatDate(
            period.nilai_end
        );


    const periodeStart =
        formatDate(
            getPeriodStart(
                period
            )
        );


    const periodeEnd =
        formatDate(
            getPeriodEnd(
                period
            )
        );


    return {

        title :
            "Periode Gaji sudah dibuat",

        text :
            `Periode perhitungan: ${nilaiStart} – ${nilaiEnd}\nMasa aktif: ${periodeStart} – ${periodeEnd}`,

        calculation :
            `${nilaiStart} – ${nilaiEnd}`,

        active :
            `${periodeStart} – ${periodeEnd}`,

        html :
            `<div class="payroll-period-note"><strong>✓ Periode Gaji sudah dibuat</strong><div class="payroll-period-note-row"><span>Periode perhitungan</span><strong>${nilaiStart} – ${nilaiEnd}</strong></div><div class="payroll-period-note-row"><span>Masa aktif</span><strong>${periodeStart} – ${periodeEnd}</strong></div></div>`

    };

}


/* =====================================================
   VALIDATE PERIOD
===================================================== */

function validatePeriod(
    period
){

    if(
        !period
    ){

        return {

            valid :
                false,

            error :
                "Data periode tidak ditemukan."

        };

    }


    const nilaiStart =
        normalizeValue(
            period.nilai_start
        );


    const nilaiEnd =
        normalizeValue(
            period.nilai_end
        );


    const periodeStart =
        getPeriodStart(
            period
        );


    const periodeEnd =
        getPeriodEnd(
            period
        );


    if(
        !nilaiStart ||
        !nilaiEnd
    ){

        return {

            valid :
                false,

            error :
                "Periode perhitungan gaji belum lengkap."

        };

    }


    if(
        !periodeStart ||
        !periodeEnd
    ){

        return {

            valid :
                false,

            error :
                "Masa aktif payroll belum lengkap."

        };

    }


    const calculationStart =
        getTimeValue(
            nilaiStart
        );


    const calculationEnd =
        getTimeValue(
            nilaiEnd
        );


    const activeStart =
        getTimeValue(
            periodeStart
        );


    const activeEnd =
        getTimeValue(
            periodeEnd
        );


    if(
        calculationStart
        &&
        calculationEnd
        &&
        calculationEnd <
            calculationStart
    ){

        return {

            valid :
                false,

            error :
                "Tanggal akhir periode perhitungan tidak boleh sebelum tanggal awal."

        };

    }


    if(
        activeStart
        &&
        activeEnd
        &&
        activeEnd <
            activeStart
    ){

        return {

            valid :
                false,

            error :
                "Masa aktif akhir tidak boleh sebelum masa aktif awal."

        };

    }


    return {

        valid :
            true,

        error :
            ""

    };

}


/* =====================================================
   PREPARE PERIOD RESULT
===================================================== */

function preparePeriodResult(
    period
){

    const validation =
        validatePeriod(
            period
        );


    if(
        !validation.valid
    ){

        throw new Error(
            validation.error
        );

    }


    return {

        type_rule :
            "rule_gaji",

        nama :
            "gaji",

        grade_1 :
            period.grade_1 ??
            "",

        grade_2 :
            period.grade_2 ??
            "",

        kondisi :
            "periode",

        nominal :
            "",

        waktu :
            "bulanan",

        nilai_start :
            period.nilai_start,

        nilai_end :
            period.nilai_end,

        periode_start :
            period.periode_start,

        periode_end :
            period.periode_end,

        years :
            period.years ??
            getPeriodYear(
                period
            )

    };

}


/* =====================================================
   MARK PERIOD SAVED
===================================================== */

function markPeriodSaved(
    period
){

    const normalized =
        preparePeriodResult(
            period
        );


    setActivePeriod(
        normalized
    );


    exitNewPeriodMode();


    return normalized;

}

/* =====================================================
   APPLY AVAILABLE SELLECT
===================================================== */
function applyAvailableSelectOptions(
    section,
    fieldName,
    masterOptions,
    lockedNames,
    newPeriodMode
){
    if(
        !section ||
        !Array.isArray(section.fields)
    ){
        return;
    }

    const field =
        section.fields.find(
            item => item?.name === fieldName
        );

    if(!field){
        return;
    }

    const options =
        Array.isArray(masterOptions)
            ? masterOptions
            : [];

    /*
       Periode baru:
       semua option kembali tersedia.
    */
    if(newPeriodMode){
        field.options =
            options.map(
                option => ({...option})
            );

        return;
    }

    const locked =
        lockedNames instanceof Set
            ? lockedNames
            : new Set(
                Array.isArray(lockedNames)
                    ? lockedNames
                    : []
            );

    field.options =
        options
            .filter(option => {
                const value =
                    normalizeCompareValue(
                        option?.value
                    );

                return !locked.has(value);
            })
            .map(
                option => ({...option})
            );
       }


/* =====================================================
   APPLY PERIOD UI
===================================================== */

function applyPeriodUI(
    sectionElement
){

    if(
        !sectionElement
    ){

        return;

    }


    const state =
        getRuleUIState();


    const form =
        sectionElement.querySelector(
            ".global-setting-form"
        );


    const result =
        sectionElement.querySelector(
            ".global-setting-result"
        );


    const note =
        sectionElement.querySelector(
            ".payroll-period-note"
        );


    if(
        state.hasPeriod
        &&
        !state.newPeriodMode
    ){

        if(
            form
        ){

            form.style.display =
                "none";

        }


        if(
            result
        ){

            result.style.display =
                "";

        }


        if(
            note
        ){

            note.innerHTML =
                buildPeriodNote(
                    state.activePeriod
                )
                    .html;

        }

    }

}


/* =====================================================
   BIND NEW PERIOD BUTTON
===================================================== */

function bindNewPeriodButton(
    sectionElement
){

    if(
        !sectionElement
    ){

        return;

    }


    const button =
        sectionElement.querySelector(
            "[data-action=add-period], .add-period-button, .payroll-add-period"
        );


    if(
        !button
    ){

        return;

    }


    if(
        button.dataset.dailyRulesBound ===
            "true"
    ){

        return;

    }


    button.dataset.dailyRulesBound =
        "true";


    button.addEventListener(
        "click",
        () => {

            enterNewPeriodMode();

        }
    );

}


/* =====================================================
   UNLOCK DEPENDENT SECTIONS
===================================================== */

function unlockDependentSections(){

    return true;

}


/* =====================================================
   UNLOCK SECTION FIELDS
===================================================== */

function unlockSectionFields(
    sectionElement
){

    if(
        !sectionElement
    ){

        return;

    }


    sectionElement
        .querySelectorAll(
            "input,select,textarea,button"
        )
        .forEach(
            element => {

                if(
                    element.dataset
                        .lockByDailyRules ===
                        "true"
                ){

                    element.disabled =
                        false;

                }

            }
        );

}


/* =====================================================
   LOCK FIXED RULE SECTION
===================================================== */

function lockFixedRuleSection(
    sectionElement
){

    if(
        !sectionElement
    ){

        return;

    }


    sectionElement
        .querySelectorAll(
            "input,select,textarea"
        )
        .forEach(
            element => {

                element.dataset
                    .lockByDailyRules =
                    "true";

                element.disabled =
                    true;

            }
        );

}


/* =====================================================
   APPLY SELECT LOCK STATE
===================================================== */
function applySelectLockState(
    selectElement,
    lockedValues = []
){

    if(
        !selectElement
    ){

        return;

    }


    const locked =

        lockedValues instanceof Set

            ?

        lockedValues

            :

        new Set(
            Array.isArray(
                lockedValues
            )
                ?
            lockedValues
                :
            []
        );


    [
        ...selectElement.options
    ]
        .forEach(

            option => {

                const value =

                    normalizeCompareValue(
                        option.value
                    );


                if(
                    locked.has(
                        value
                    )
                ){

                    option.remove();

                }

            }

        );


    const currentValue =

        normalizeCompareValue(
            selectElement.value
        );


    if(
        locked.has(
            currentValue
        )
    ){

        selectElement.value = "";

    }

}


/* =====================================================
   APPLY SECTION STATE
===================================================== */

function applySectionState(
    sectionElement,
    sectionId
){

    if(
        !sectionElement
    ){

        return;

    }


    const state =
        getRuleUIState();


    /* =============================================
       RULE GAJI
    ============================================= */

    if(
        sectionId ===
            "rule_gaji"
    ){

        if(
            state.hasPeriod
            &&
            !state.newPeriodMode
        ){

            lockFixedRuleSection(
                sectionElement
            );

        }

        else{

            unlockSectionFields(
                sectionElement
            );

        }


        return;

    }


    /* =============================================
       RULE TAMBAH
    ============================================= */

    if(
        sectionId ===
            "rule_tambah"
    ){

        applySelectLockState(

            sectionElement.querySelector(
                "select[name=nama]"
            ),

            state.lockedTambah

        );

        return;

    }


    /* =============================================
       RULE POTONG
    ============================================= */

    if(
        sectionId ===
            "rule_potong"
    ){

        applySelectLockState(

            sectionElement.querySelector(
                "select[name=nama]"
            ),

            state.lockedPotong

        );

    }

}


/* =====================================================
   PREPARE SAVE
===================================================== */

async function prepareSave(
    payload,
    context = {}
){

    await ensureLoaded();


    const data =
        Array.isArray(
            payload
        )

            ? payload.map(
                item =>

                    item &&
                    item.data

                        ? {
                            ...item,
                            data :
                                item.data
                        }

                        : item
            )

            : [];


    const output =
        [];


    let newPeriod =
        null;


    /* =============================================
       FIND NEW DAILY PERIOD
    ============================================= */

    data.forEach(
        item => {

            const rule =
                item?.data ??
                item;


            if(
                !rule
            ){

                return;

            }


            if(

                normalizeCompareValue(
                    rule.type_rule
                ) ===
                    "rule_gaji"

                &&

                normalizeCompareValue(
                    rule.nama
                ) ===
                    "gaji"

            ){

                newPeriod =
                    rule;

            }

        }
    );


    /* =============================================
       NEW PERIOD
    ============================================= */

    if(
        newPeriod
    ){

        const normalizedPeriod =
            preparePeriodResult(
                newPeriod
            );


        setActivePeriod(
            normalizedPeriod
        );


        data.forEach(
            item => {

                const rule =
                    item?.data ??
                    item;


                if(
                    !rule
                ){

                    return;

                }


                /* =================================
                   RULE GAJI
                ================================= */

                if(

                    normalizeCompareValue(
                        rule.type_rule
                    ) ===
                        "rule_gaji"

                    &&

                    normalizeCompareValue(
                        rule.nama
                    ) ===
                        "gaji"

                ){

                    const prepared =
                        preparePeriodResult(
                            rule
                        );


                    output.push(

                        item &&
                        item.data

                            ? {
                                ...item,
                                data :
                                    prepared
                            }

                            : prepared

                    );


                    return;

                }


                /* =================================
                   OTHER DAILY RULE
                ================================= */

                const prepared =
                    attachActivePeriod(
                        rule
                    );


                output.push(

                    item &&
                    item.data

                        ? {
                            ...item,
                            data :
                                prepared
                        }

                        : prepared

                );

            }
        );


        exitNewPeriodMode();


        return output;

    }


    /* =============================================
       NORMAL SAVE
    ============================================= */

    data.forEach(
        item => {

            const rule =
                item?.data ??
                item;


            if(
                !rule
            ){

                return;

            }


            const prepared =
                attachActivePeriod(
                    rule
                );


            output.push(

                item &&
                item.data

                    ? {
                        ...item,
                        data :
                            prepared
                    }

                    : prepared

            );

        }
    );


    return output;

}


/* =====================================================
   REFRESH AFTER SAVE
===================================================== */

async function refreshAfterSave(){

    STATE.loaded =
        false;


    return refresh();

}


/* =====================================================
   RELOAD
===================================================== */

async function reload(){

    STATE.loaded =
        false;


    STATE.rules =
        [];


    STATE.activePeriod =
        null;


    STATE.newPeriodMode =
        false;


    return refresh();

}


/* =====================================================
   RULE COUNT
===================================================== */

function getRuleCount(){

    return getRules()
        .length;

}


/* =====================================================
   CURRENT PERIOD RULE COUNT
===================================================== */

function getCurrentPeriodRuleCount(){

    return getRulesInPeriod()
        .length;

}


/* =====================================================
   LOCK SUMMARY
===================================================== */

function getLockSummary(){

    const state =
        getRuleUIState();


    return {

        hasPeriod :
            state.hasPeriod,

        activePeriodKey :
            state.activePeriodKey,

        newPeriodMode :
            state.newPeriodMode,

        ruleGajiLocked :
            state.lockRuleGaji,

        tambahLocked :
            [
                ...state.lockedTambah
            ],

        potongLocked :
            [
                ...state.lockedPotong
            ],

        workLocked :
            false

    };

}


/* =====================================================
   PUBLIC API
===================================================== */

export const DailyRules = {

    MODE,

    refresh,

    reload,

    ensureLoaded,

    refreshAfterSave,

    getState,

    getRuleState,

    getLockSummary,

    getRules,

    getRule :
        getExistingRule,

    getExistingRule,

    getExistingRules,

    getRuleCount,

    getCurrentPeriodRuleCount,

    getActivePeriod,

    getExistingPeriod,

    getCurrentPeriodRules,

    getActivePeriodKey,

    getPeriodDisplayData,

    buildPeriodNote,

    validatePeriod,

    preparePeriodResult,

    markPeriodSaved,

    isNewPeriodMode,

    enterNewPeriodMode,

    addNewPeriod,

    exitNewPeriodMode,

    resetSessionState,

    ruleBelongsToPeriod,

    getRulesInPeriod,

    getUsedRuleNames,

    getAvailableRuleOptions,

    isOptionLocked,

    getRuleGajiState,

    getRuleTambahState,

    getRulePotongState,

    getRuleWorkState,

    getWorkSource,

    prepareRule,

    attachActivePeriod,

    inheritActivePeriod,

    validateNewRule,

    isExactRuleDuplicate,

    isRuleWorkDuplicate,

    prepareSave,

    applyPeriodUI,

    bindNewPeriodButton,

    applySectionState,

    unlockDependentSections,

    unlockSectionFields,

    lockFixedRuleSection,

    applyFieldOptionsLock,

    applyAvailableSelectOptions,

    applySelectLockState

};


/* =====================================================
   ALIAS
===================================================== */

export const DailyRulesEngine =
    DailyRules;


/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default DailyRules;
