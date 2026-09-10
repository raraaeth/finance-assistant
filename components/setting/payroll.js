/* =====================================================
   Finance Assistant
   Component    : Global Setting
   Module       : Payroll Shared Engine
   File         : payroll.js
   Version      : 1.0.0

   Description :
   Shared Payroll Rule Engine

   Responsibility :
   - Read real payroll rules from Google Sheets
   - Determine active payroll period
   - Manage period state
   - Manage period-based rule lock
   - Manage Rule Periode UI state
   - Manage new-period mode
   - Inherit active period into new rules
   - Detect existing Rule Gaji
   - Detect existing Rule Tambah
   - Detect existing Rule Potong
   - Provide Monthly Attendance auto rules
   - Support Payroll Daily / Payroll Monthly

   Principle :
   - Google Sheets = source of truth
   - DOM result is NOT source of truth
   - Rule Periode is master period
   - Existing period is displayed as a note/result
   - "Tambah Periode" starts a new period
   - Old rules remain history
   - New period reopens period-dependent rules
   - Rule Tambah/Potong are locked per active period
   - Daily work source  = rule_work
   - Monthly work source = Attendance
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

const WORKSPACE = {

    daily :
        "payroll-daily",

    monthly :
        "payroll-monthly"

};


/* =====================================================
   STATE
===================================================== */

const STATE = {

    daily : {
        loaded :
            false,

        rules : [],

        activePeriod :
            null,

        newPeriodMode :
            false,

        loadedAt :
            null
    },

    monthly : {
        loaded :
            false,

        rules : [],

        activePeriod :
            null,

        newPeriodMode :
            false,

        loadedAt :
            null
    }

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
   NORMALIZE TYPE
===================================================== */

function normalizeType(
    value
){

    return normalizeCompareValue(
        value
    );

}


/* =====================================================
   GET WORKSPACE
===================================================== */

function getPayrollWorkspace(
    mode
){

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


    let workspace;


    /* =============================================
       DAILY
    ============================================= */

    if(
        mode ===
        WORKSPACE.daily
        ||
        mode ===
        "daily"
    ){

        workspace =
            workspaces[
                "payroll-daily"
            ];

    }


    /* =============================================
       MONTHLY
    ============================================= */

    if(
        mode ===
        WORKSPACE.monthly
        ||
        mode ===
        "monthly"
    ){

        workspace =
            workspaces[
                "payroll-monthly"
            ];

    }


    if(
        !workspace
    ){

        throw new Error(
            `Workspace Payroll "${mode}" tidak ditemukan.`
        );

    }


    if(
        !Array.isArray(
            workspace.sheets
        )
    ){

        throw new Error(
            "Konfigurasi sheet Payroll tidak valid."
        );

    }


    if(
        workspace.sheets.length <
        2
    ){

        throw new Error(
            "Workspace Payroll tidak memiliki DATA sheet."
        );

    }


    return workspace;

}


/* =====================================================
   GET PAYROLL SHEETS
===================================================== */

function getPayrollSheets(
    mode
){

    const workspace =
        getPayrollWorkspace(
            mode
        );


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
            currentKey =>
                normalizeCompareValue(
                    currentKey
                ) ===
                target
        );


    if(
        !key
    ){

        return "";

    }


    return normalizeValue(
        row[key]
    );

}


/* =====================================================
   CONVERT RAW ROW TO RULE
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


    /*
     * API.data dapat berupa:
     *
     * {
     *     type_rule,
     *     nama,
     *     kondisi,
     *     waktu,
     *     nominal,
     *     nilai_start,
     *     nilai_end,
     *     berlaku_start,
     *     berlaku_end
     * }
     *
     * atau row hasil sheet.
     */


    const typeRule =
        getColumnValue(
            row,
            "type_rule"
        );


    const nama =
        getColumnValue(
            row,
            "nama"
        );


    const kondisi =
        getColumnValue(
            row,
            "kondisi"
        );


    const waktu =
        getColumnValue(
            row,
            "waktu"
        );


    const nominal =
        getColumnValue(
            row,
            "nominal"
        );


    const nilaiStart =
        getColumnValue(
            row,
            "nilai_start"
        );


    const nilaiEnd =
        getColumnValue(
            row,
            "nilai_end"
        );


    const berlakuStart =
        getColumnValue(
            row,
            "berlaku_start"
        );


    const berlakuEnd =
        getColumnValue(
            row,
            "berlaku_end"
        );


    /*
     * Row bukan payroll rule.
     */

    if(
        !typeRule &&
        !nama
    ){

        return null;

    }


    return {

        type_rule :
            typeRule,

        nama :
            nama,

        kondisi :
            kondisi,

        waktu :
            waktu,

        nominal :
            nominal,

        nilai_start :
            nilaiStart,

        nilai_end :
            nilaiEnd,

        berlaku_start :
            berlakuStart,

        berlaku_end :
            berlakuEnd

    };

}


/* =====================================================
   NORMALIZE RULE COLLECTION
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


    const output = [];


    rows.forEach(
        row => {

            /*
             * Sudah dalam bentuk rule.
             */

            const rule =
                normalizeRuleRow(
                    row
                );


            if(
                !rule
            ){

                return;

            }


            /*
             * Payroll rule harus
             * memiliki type_rule.
             */

            if(
                !rule.type_rule
            ){

                return;

            }


            output.push(
                rule
            );

        }
    );


    return output;

}


/* =====================================================
   READ PAYROLL RULE DATA
===================================================== */

async function readPayrollRules(
    mode
){

    const sheets =
        getPayrollSheets(
            mode
        );


    console.log(
        "=========================================="
    );

    console.log(
        "PAYROLL ENGINE: READ RULE DATA"
    );

    console.log(
        "MODE:",
        mode
    );

    console.log(
        "RAW SHEET:",
        sheets.rawSheet
    );

    console.log(
        "DATA SHEET:",
        sheets.dataSheet
    );

    console.log(
        "=========================================="
    );


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
            `Gagal membaca rule Payroll ${mode}.`
        );

    }


    const rows =
        Array.isArray(
            result.data
        )
            ?
        result.data
            :
        Array.isArray(
            API.data
        )
            ?
        API.data
            :
        [];


    const rules =
        normalizeRules(
            rows
        );


    STATE[
        mode ===
        WORKSPACE.daily
            ?
        "daily"
            :
        "monthly"
    ].rules =
        rules;


    STATE[
        mode ===
        WORKSPACE.daily
            ?
        "daily"
            :
        "monthly"
    ].loaded =
        true;


    STATE[
        mode ===
        WORKSPACE.daily
            ?
        "daily"
            :
        "monthly"
    ].loadedAt =
        new Date();


    console.log(
        "PAYROLL ENGINE: RULE COUNT",
        rules.length
    );


    console.log(
        "PAYROLL ENGINE: RULES",
        rules
    );


    return rules;

}


/* =====================================================
   GET STATE KEY
===================================================== */

function getStateKey(
    mode
){

    if(
        mode ===
        WORKSPACE.daily
        ||
        mode ===
        "daily"
    ){

        return "daily";

    }


    return "monthly";

}


/* =====================================================
   GET CACHED RULES
===================================================== */

function getRules(
    mode
){

    const key =
        getStateKey(
            mode
        );


    return Array.isArray(
        STATE[key].rules
    )
        ?
        STATE[key].rules
        :
        [];

}


/* =====================================================
   FIND RULE
===================================================== */

function findRule(
    mode,
    typeRule,
    nama
){

    const targetType =
        normalizeCompareValue(
            typeRule
        );


    const targetName =
        normalizeCompareValue(
            nama
        );


    return getRules(
        mode
    ).find(
        rule =>

            normalizeCompareValue(
                rule.type_rule
            ) ===
            targetType

            &&

            (
                !targetName
                ||
                normalizeCompareValue(
                    rule.nama
                ) ===
                targetName
            )

    );

}


/* =====================================================
   FIND RULES
===================================================== */

function findRules(
    mode,
    typeRule
){

    const target =
        normalizeCompareValue(
            typeRule
        );


    return getRules(
        mode
    ).filter(
        rule =>
            normalizeCompareValue(
                rule.type_rule
            ) ===
            target
    );

}


/* =====================================================
   FIND RULE BY NAME
===================================================== */

function findRuleByName(
    mode,
    nama
){

    const target =
        normalizeCompareValue(
            nama
        );


    return getRules(
        mode
    ).filter(
        rule =>
            normalizeCompareValue(
                rule.nama
            ) ===
            target
    );

}


/* =====================================================
   VALID PERIOD
===================================================== */

function hasValidPeriod(
    rule
){

    return Boolean(

        normalizeValue(
            rule?.berlaku_start
        )

        &&

        normalizeValue(
            rule?.berlaku_end
        )

    );

}


/* =====================================================
   PERIOD KEY
===================================================== */

function getPeriodKey(
    period
){

    if(
        !period
    ){

        return "";

    }


    const start =
        normalizeValue(
            period.berlaku_start
        );


    const end =
        normalizeValue(
            period.berlaku_end
        );


    if(
        !start ||
        !end
    ){

        return "";

    }


    return `${start}__${end}`;

}


/* =====================================================
   PERIOD DATE VALUE
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
        ?
        0
        :
        time;

}


/* =====================================================
   FIND LATEST RULE PERIODE
===================================================== */

function findLatestPeriod(
    mode
){

    const periods =
        getRules(
            mode
        ).filter(
            rule =>

                normalizeCompareValue(
                    rule.type_rule
                ) ===
                "rule_periode"

                &&

                normalizeCompareValue(
                    rule.nama
                ) ===
                "periode_gaji"

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


    /*
     * Sheet menjadi source of truth.
     *
     * Periode terbaru ditentukan dari
     * berlaku_start.
     *
     * Jika sama, periode yang muncul
     * lebih akhir dalam data dianggap
     * yang terbaru.
     */

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
                    rule.berlaku_start
                );


            const latestTime =
                getTimeValue(
                    latest.berlaku_start
                );


            if(
                currentTime >
                latestTime
            ){

                latest =
                    rule;

                return;

            }


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
    mode,
    period
){

    const key =
        getStateKey(
            mode
        );


    STATE[key]
        .activePeriod =
        period
            ?
        {
            type_rule :
                period.type_rule,

            nama :
                period.nama,

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

            berlaku_start :
                period.berlaku_start,

            berlaku_end :
                period.berlaku_end
        }
            :
        null;


    return STATE[key]
        .activePeriod;

}


/* =====================================================
   REFRESH ACTIVE PERIOD
===================================================== */

function refreshActivePeriod(
    mode
){

    const period =
        findLatestPeriod(
            mode
        );


    return setActivePeriod(
        mode,
        period
    );

}


/* =====================================================
   GET ACTIVE PERIOD
===================================================== */

function getActivePeriod(
    mode
){

    const key =
        getStateKey(
            mode
        );


    return STATE[key]
        .activePeriod;

}


/* =====================================================
   GET ACTIVE PERIOD KEY
===================================================== */

function getActivePeriodKey(
    mode
){

    return getPeriodKey(
        getActivePeriod(
            mode
        )
    );

}


/* =====================================================
   IS NEW PERIOD MODE
===================================================== */

function isNewPeriodMode(
    mode
){

    const key =
        getStateKey(
            mode
        );


    return STATE[key]
        .newPeriodMode ===
        true;

}


/* =====================================================
   ENTER NEW PERIOD MODE
===================================================== */

function enterNewPeriodMode(
    mode
){

    const key =
        getStateKey(
            mode
        );


    STATE[key]
        .newPeriodMode =
        true;


    console.log(
        "PAYROLL ENGINE: NEW PERIOD MODE",
        mode
    );


    return true;

}


/* =====================================================
   EXIT NEW PERIOD MODE
===================================================== */

function exitNewPeriodMode(
    mode
){

    const key =
        getStateKey(
            mode
        );


    STATE[key]
        .newPeriodMode =
        false;


    return true;

}


/* =====================================================
   RESET SESSION STATE
===================================================== */

function resetSessionState(
    mode
){

    const key =
        getStateKey(
            mode
        );


    STATE[key]
        .newPeriodMode =
        false;


    STATE[key]
        .activePeriod =
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
            rule.berlaku_start
        );


    const ruleEnd =
        normalizeCompareValue(
            rule.berlaku_end
        );


    const periodStart =
        normalizeCompareValue(
            period.berlaku_start
        );


    const periodEnd =
        normalizeCompareValue(
            period.berlaku_end
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
    mode,
    period = null
){

    const targetPeriod =
        period ??
        getActivePeriod(
            mode
        );


    if(
        !targetPeriod
    ){

        return [];

    }


    return getRules(
        mode
    ).filter(
        rule =>
            ruleBelongsToPeriod(
                rule,
                targetPeriod
            )
    );

}


/* =====================================================
   GET RULES IN CURRENT PERIOD
===================================================== */

function getCurrentPeriodRules(
    mode
){

    return getRulesInPeriod(
        mode
    );

}


/* =====================================================
   GET USED NAMES IN PERIOD
===================================================== */

function getUsedNamesInPeriod(
    mode,
    typeRule,
    period = null
){

    const rules =
        getRulesInPeriod(
            mode,
            period
        );


    const targetType =
        normalizeCompareValue(
            typeRule
        );


    const names =
        new Set();


    rules.forEach(
        rule => {

            if(
                normalizeCompareValue(
                    rule.type_rule
                ) !==
                targetType
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
    mode,
    typeRule,
    nama,
    period = null
){

    const names =
        getUsedNamesInPeriod(
            mode,
            typeRule,
            period
        );


    return names.has(
        normalizeCompareValue(
            nama
        )
    );

}


/* =====================================================
   GET AVAILABLE NAMES
===================================================== */

function getAvailableNames(
    mode,
    typeRule,
    options = []
){

    const used =
        getUsedNamesInPeriod(
            mode,
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
                    ?
                option.value
                    :
                option;


            return !used.has(
                normalizeCompareValue(
                    value
                )
            );

        }
    );

}


/* =====================================================
   RULE Gaji STATE
===================================================== */

function getRuleGajiState(
    mode
){

    const period =
        getActivePeriod(
            mode
        );


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
            mode,
            period
        ).find(
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

function getRuleTambahState(
    mode
){

    const rules =
        getRulesInPeriod(
            mode
        ).filter(
            rule =>
                normalizeCompareValue(
                    rule.type_rule
                ) ===
                "rule_tambah"
        );


    const names =
        new Set();


    rules.forEach(
        rule => {

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


    return {

        names :
            names,

        rules :
            rules

    };

}


/* =====================================================
   RULE POTONG STATE
===================================================== */

function getRulePotongState(
    mode
){

    const rules =
        getRulesInPeriod(
            mode
        ).filter(
            rule =>
                normalizeCompareValue(
                    rule.type_rule
                ) ===
                "rule_potong"
        );


    const names =
        new Set();


    rules.forEach(
        rule => {

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


    return {

        names :
            names,

        rules :
            rules

    };

}


/* =====================================================
   RULE WORK STATE
===================================================== */

function getRuleWorkState(
    mode
){

    const rules =
        getRulesInPeriod(
            mode
        ).filter(
            rule =>
                normalizeCompareValue(
                    rule.type_rule
                ) ===
                "rule_work"
        );


    return {

        rules :
            rules,

        count :
            rules.length

    };

}


/* =====================================================
   MONTHLY ATTENDANCE STATE
===================================================== */

function getAttendanceState(
    mode = WORKSPACE.monthly
){

    const rules =
        getRulesInPeriod(
            mode
        ).filter(
            rule =>
                normalizeCompareValue(
                    rule.type_rule
                ) ===
                "rule_masuk"
        );


    const names =
        new Set();


    rules.forEach(
        rule => {

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


    return {

        rules :
            rules,

        names :
            names,

        count :
            rules.length

    };

}


/* =====================================================
   MONTHLY WORK SOURCE
===================================================== */

function getWorkSource(
    mode
){

    const key =
        getStateKey(
            mode
        );


    if(
        key ===
        "monthly"
    ){

        return {

            type :
                "attendance",

            rules :
                getAttendanceState(
                    WORKSPACE.monthly
                ).rules

        };

    }


    return {

        type :
            "rule_work",

        rules :
            getRuleWorkState(
                WORKSPACE.daily
            ).rules

    };

}


/* =====================================================
   CREATE AUTOMATIC RULE MASUK
===================================================== */

function createAutomaticRuleMasuk(
    period
){

    if(
        !period ||
        !normalizeValue(
            period.berlaku_start
        ) ||
        !normalizeValue(
            period.berlaku_end
        )
    ){

        return [];

    }


    const weekdays =
        "senin,selasa,rabu,kamis,jumat";


    const names = [

        "masuk",

        "sakit",

        "cuti",

        "libur",

        "absen"

    ];


    return names.map(
        nama => ({

            type_rule :
                "rule_masuk",

            nama :
                nama,

            kondisi :
                nama ===
                "masuk"
                    ?
                "masuk"
                    :
                "libur",

            waktu :
                weekdays,

            nominal :
                "",

            nilai_start :
                "",

            nilai_end :
                "",

            berlaku_start :
                period.berlaku_start,

            berlaku_end :
                period.berlaku_end

        })
    );

}


/* =====================================================
   CREATE AUTOMATIC MONTHLY RULES
===================================================== */

function createAutomaticMonthlyRules(
    period,
    settings = {}
){

    if(
        !period
    ){

        return [];

    }


    const output =
        [];


    const existingRules =
        getRulesInPeriod(
            WORKSPACE.monthly,
            period
        );


    const exists = (
        typeRule,
        nama
    ) => {

        return existingRules.some(
            rule =>

                normalizeCompareValue(
                    rule.type_rule
                ) ===
                normalizeCompareValue(
                    typeRule
                )

                &&

                normalizeCompareValue(
                    rule.nama
                ) ===
                normalizeCompareValue(
                    nama
                )
        );

    };


    const pushRule = (
        typeRule,
        nama,
        kondisi,
        waktu
    ) => {

        if(
            exists(
                typeRule,
                nama
            )
        ){

            return;

        }


        output.push({

            type_rule :
                typeRule,

            nama :
                nama,

            kondisi :
                kondisi,

            waktu :
                waktu,

            nominal :
                "",

            nilai_start :
                "",

            nilai_end :
                "",

            berlaku_start :
                period.berlaku_start,

            berlaku_end :
                period.berlaku_end

        });

    };


    /*
     * Rule Attendance dibuat
     * berdasarkan Rule Periode.
     *
     * Tidak perlu input manual.
     */

    createAutomaticRuleMasuk(
        period
    ).forEach(
        rule => {

            if(
                !exists(
                    rule.type_rule,
                    rule.nama
                )
            ){

                output.push(
                    rule
                );

            }

        }
    );


    /*
     * Rule Lembur
     */

    if(
        settings.aktifkanRuleLembur ===
        true
    ){

        pushRule(
            "rule_lembur",
            "lembur_jam",
            "masuk",
            "jam"
        );

    }


    /*
     * Rule Izin
     */

    if(
        settings.aktifkanRuleIzin ===
        true
    ){

        pushRule(
            "rule_izin",
            "izin_pulang",
            "masuk",
            "jam"
        );

    }


    /*
     * Rule Telat
     */

    if(
        settings.gunakanRuleTelat ===
        true
    ){

        pushRule(
            "rule_telat",
            "telat",
            "masuk",
            "menit"
        );


        pushRule(
            "rule_telat",
            "izin_telat",
            "masuk",
            "jam"
        );

    }


    /*
     * Rule Shift
     */

    if(
        settings.gunakanRuleShift ===
        true
    ){

        pushRule(
            "rule_shift",
            "shift",
            "masuk",
            "pagi,siang,malam"
        );

    }


    return output;

}


/* =====================================================
   INHERIT ACTIVE PERIOD
===================================================== */

function inheritActivePeriod(
    mode,
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
     * Saat user sedang membuat
     * periode baru, periode lama
     * tidak boleh diwariskan.
     */

    if(
        isNewPeriodMode(
            mode
        )
    ){

        return {

            ...rule,

            berlaku_start :
                rule.berlaku_start ??
                "",

            berlaku_end :
                rule.berlaku_end ??
                ""

        };

    }


    const period =
        getActivePeriod(
            mode
        );


    if(
        !period
    ){

        return {

            ...rule,

            berlaku_start :
                rule.berlaku_start ??
                "",

            berlaku_end :
                rule.berlaku_end ??
                ""

        };

    }


    return {

        ...rule,

        berlaku_start :
            period.berlaku_start,

        berlaku_end :
            period.berlaku_end

    };

}


/* =====================================================
   ATTACH PERIOD TO RULE
===================================================== */

function attachActivePeriod(
    mode,
    rule
){

    if(
        !rule
    ){

        return null;

    }


    const period =
        getActivePeriod(
            mode
        );


    if(
        !period
    ){

        return {

            ...rule

        };

    }


    return {

        ...rule,

        berlaku_start :
            period.berlaku_start,

        berlaku_end :
            period.berlaku_end

    };

}


/* =====================================================
   PREPARE NEW RULE
===================================================== */

function prepareRule(
    mode,
    rule
){

    return inheritActivePeriod(
        mode,
        rule
    );

}


/* =====================================================
   RULE WORK DUPLICATE IDENTITY
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
            rule.berlaku_start
        ),

        normalizeCompareValue(
            rule.berlaku_end
        )

    ].join(
        "|"
    );

}


/* =====================================================
   IS EXACT RULE DUPLICATE
===================================================== */

function isExactRuleDuplicate(
    mode,
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


    return getRules(
        mode
    ).some(
        existing =>

            createRuleIdentity(
                existing
            ) ===
            identity

    );

}


/* =====================================================
   CHECK RULE WORK DUPLICATE
===================================================== */

function isRuleWorkDuplicate(
    mode,
    rule
){

    if(
        !rule
    ){

        return false;

    }


    if(
        normalizeCompareValue(
            rule.type_rule
        ) !==
        "rule_work"
    ){

        return false;

    }


    return isExactRuleDuplicate(
        mode,
        rule
    );

}


/* =====================================================
   BUILD LOCK STATE
===================================================== */

function buildLockState(
    mode
){

    const period =
        getActivePeriod(
            mode
        );


    const hasPeriod =
        Boolean(
            period
        );


    const gaji =
        getRuleGajiState(
            mode
        );


    const tambah =
        getRuleTambahState(
            mode
        );


    const potong =
        getRulePotongState(
            mode
        );


    const work =
        getRuleWorkState(
            mode
        );


    const attendance =
        mode ===
        WORKSPACE.monthly
            ?
        getAttendanceState(
            WORKSPACE.monthly
        )
            :
        {
            rules : [],
            names :
                new Set(),
            count :
                0
        };


    return {

        mode :

            mode,

        hasPeriod :

            hasPeriod,

        activePeriod :

            period,

        activePeriodKey :

            getPeriodKey(
                period
            ),

        newPeriodMode :

            isNewPeriodMode(
                mode
            ),

        ruleGaji :

            gaji,

        ruleTambah :

            tambah,

        rulePotong :

            potong,

        ruleWork :

            work,

        attendance :

            attendance

    };

}


/* =====================================================
   BUILD UI RULE STATE
===================================================== */

function buildUIRuleState(
    mode
){

    const state =
        buildLockState(
            mode
        );


    /*
     * Jika mode periode baru:
     *
     * seluruh rule yang bergantung
     * pada periode lama dibuka.
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

        /*
         * Rule Gaji
         */

        lockRuleGaji :
            state.ruleGaji.exists,


        /*
         * Tambah
         */

        lockedTambah :
            state.ruleTambah.names,


        /*
         * Potong
         */

        lockedPotong :
            state.rulePotong.names,


        /*
         * Rule Work Daily
         *
         * Tidak dikunci berdasarkan nama.
         * Duplicate dicek berdasarkan
         * keseluruhan row.
         */

        lockRuleWork :
            false,


        /*
         * Rule Periode
         */

        lockPeriod :
            state.hasPeriod

    };

}


/* =====================================================
   REFRESH PAYROLL STATE
===================================================== */

async function refresh(
    mode
){

    const rules =
        await readPayrollRules(
            mode
        );


    const period =
        refreshActivePeriod(
            mode
        );


    const key =
        getStateKey(
            mode
        );


    STATE[key]
        .newPeriodMode =
        false;


    console.log(
        "=========================================="
    );

    console.log(
        "PAYROLL ENGINE: ACTIVE PERIOD"
    );

    console.log(
        period
    );

    console.log(
        "=========================================="
    );


    return {

        rules :
            rules,

        activePeriod :
            period,

        state :
            buildLockState(
                mode
            ),

        ui :
            buildUIRuleState(
                mode
            )

    };

}


/* =====================================================
   GET CURRENT STATE
===================================================== */

function getState(
    mode
){

    return {

        rules :
            getRules(
                mode
            ),

        activePeriod :
            getActivePeriod(
                mode
            ),

        state :
            buildLockState(
                mode
            ),

        ui :
            buildUIRuleState(
                mode
            )

    };

}


/* =====================================================
   ENSURE LOADED
===================================================== */

async function ensureLoaded(
    mode
){

    const key =
        getStateKey(
            mode
        );


    if(
        !STATE[key].loaded
    ){

        return refresh(
            mode
        );

    }


    return getState(
        mode
    );

}


/* =====================================================
   GET RULE STATE FOR GLOBAL SETTING
===================================================== */

async function getRuleState(
    {
        mode,
        sectionId = ""
    } = {}
){

    const payrollMode =
        mode ??
        WORKSPACE.monthly;


    await ensureLoaded(
        payrollMode
    );


    const state =
        buildUIRuleState(
            payrollMode
        );


    /*
     * Rule Periode
     *
     * Tidak memakai state boolean
     * generic sebagai satu-satunya
     * mekanisme.
     *
     * Section akan menggunakan
     * periodState.
     */

    if(
        sectionId ===
        "rule_periode"
    ){

        return {

            created :
                state.hasPeriod,

            periodExists :
                state.hasPeriod,

            lockPeriod :
                state.lockPeriod,

            newPeriodMode :
                state.newPeriodMode,

            activePeriod :
                state.activePeriod

        };

    }


    /*
     * Rule Gaji
     */

    if(
        sectionId ===
        "rule_gaji"
    ){

        return {

            gaji :
                state.lockRuleGaji,

            created : {

                gaji :
                    state.lockRuleGaji

            },

            activePeriod :
                state.activePeriod

        };

    }


    /*
     * Default.
     */

    return {

        activePeriod :
            state.activePeriod,

        newPeriodMode :
            state.newPeriodMode

    };

}


/* =====================================================
   GET EXISTING RULE
===================================================== */

async function getExistingRule(
    mode,
    typeRule,
    nama
){

    await ensureLoaded(
        mode
    );


    return findRule(
        mode,
        typeRule,
        nama
    );

}


/* =====================================================
   GET EXISTING RULES
===================================================== */

async function getExistingRules(
    mode,
    typeRule
){

    await ensureLoaded(
        mode
    );


    return findRules(
        mode,
        typeRule
    );

}


/* =====================================================
   GET EXISTING PERIOD
===================================================== */

async function getExistingPeriod(
    mode
){

    await ensureLoaded(
        mode
    );


    return getActivePeriod(
        mode
    );

}


/* =====================================================
   GET USED RULE NAMES
===================================================== */

async function getUsedRuleNames(
    mode,
    typeRule
){

    await ensureLoaded(
        mode
    );


    return getUsedNamesInPeriod(
        mode,
        typeRule
    );

}


/* =====================================================
   GET AVAILABLE RULE OPTIONS
===================================================== */

async function getAvailableRuleOptions(
    mode,
    typeRule,
    options = []
){

    await ensureLoaded(
        mode
    );


    /*
     * Saat membuat periode baru,
     * semua option dibuka kembali.
     */

    if(
        isNewPeriodMode(
            mode
        )
    ){

        return Array.isArray(
            options
        )
            ?
            [...options]
            :
            [];

    }


    return getAvailableNames(
        mode,
        typeRule,
        options
    );

}


/* =====================================================
   IS OPTION LOCKED
===================================================== */

async function isOptionLocked(
    mode,
    typeRule,
    nama
){

    await ensureLoaded(
        mode
    );


    if(
        isNewPeriodMode(
            mode
        )
    ){

        return false;

    }


    return isRuleNameUsed(
        mode,
        typeRule,
        nama
    );

}


/* =====================================================
   ENTER NEW PERIOD
===================================================== */

async function addNewPeriod(
    mode
){

    await ensureLoaded(
        mode
    );


    enterNewPeriodMode(
        mode
    );


    return {

        success :
            true,

        mode :
            mode,

        newPeriodMode :
            true,

        previousPeriod :
            getActivePeriod(
                mode
            )

    };

}


/* =====================================================
   PERIOD DISPLAY DATA
===================================================== */

function getPeriodDisplayData(
    period
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

            text :
                ""

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


    const berlakuStart =
        normalizeValue(
            period.berlaku_start
        );


    const berlakuEnd =
        normalizeValue(
            period.berlaku_end
        );


    return {

        exists :
            true,

        nilaiStart :
            nilaiStart,

        nilaiEnd :
            nilaiEnd,

        berlakuStart :
            berlakuStart,

        berlakuEnd :
            berlakuEnd,

        text :
            [
                nilaiStart,
                nilaiEnd,
                berlakuStart,
                berlakuEnd
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
            normalized +
            (
                normalized.length ===
                10
                    ?
                "T00:00:00"
                    :
                ""
            )
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
    ).format(
        date
    );

}


/* =====================================================
   BUILD PERIOD NOTE
===================================================== */

function buildPeriodNote(
    period
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


    const berlakuStart =
        formatDate(
            period.berlaku_start
        );


    const berlakuEnd =
        formatDate(
            period.berlaku_end
        );


    return {

        title :
            "Periode Gaji sudah dibuat",

        text :
            `Periode perhitungan: ${nilaiStart} – ${nilaiEnd}\nMasa aktif: ${berlakuStart} – ${berlakuEnd}`,

        calculation :
            `${nilaiStart} – ${nilaiEnd}`,

        active :
            `${berlakuStart} – ${berlakuEnd}`,

        html :
            `
                <div class="payroll-period-note">
                    <strong>
                        ✓ Periode Gaji sudah dibuat
                    </strong>

                    <div class="payroll-period-note-row">
                        <span>
                            Periode perhitungan
                        </span>

                        <strong>
                            ${nilaiStart}
                            –
                            ${nilaiEnd}
                        </strong>
                    </div>

                    <div class="payroll-period-note-row">
                        <span>
                            Masa aktif
                        </span>

                        <strong>
                            ${berlakuStart}
                            –
                            ${berlakuEnd}
                        </strong>
                    </div>
                </div>
            `

    };

}


/* =====================================================
   APPLY PERIOD UI
===================================================== */

function applyPeriodUI(
    sectionElement,
    mode
){

    if(
        !sectionElement
    ){

        return;

    }


    const state =
        buildUIRuleState(
            mode
        );


    const form =
        sectionElement.querySelector(
            ".global-setting-form"
        );


    const addButton =
        sectionElement.querySelector(
            ".global-setting-add"
        );


    const result =
        sectionElement.querySelector(
            ".global-setting-result"
        );


    /*
     * Tidak ada period.
     *
     * Form tetap normal.
     */

    if(
        !state.activePeriod
    ){

        if(
            form
        ){

            form.classList.remove(
                "hidden"
            );

        }


        if(
            addButton
        ){

            addButton.style.display =
                "";

            addButton.textContent =
                "＋ Tambah Periode";

        }


        return;

    }


    /*
     * Mode periode baru.
     *
     * Form dibuka oleh controller.
     */

    if(
        state.newPeriodMode
    ){

        if(
            addButton
        ){

            addButton.style.display =
                "";

            addButton.textContent =
                "＋ Tambah Periode";

        }


        if(
            result
        ){

            const oldNote =
                result.querySelector(
                    ".payroll-period-note"
                );


            if(
                oldNote
            ){

                oldNote.remove();

            }

        }


        return;

    }


    /*
     * Existing period.
     */

    if(
        form
    ){

        form.classList.add(
            "hidden"
        );

        form.innerHTML =
            "";

    }


    if(
        addButton
    ){

        addButton.style.display =
            "";

        addButton.textContent =
            "＋ Tambah Periode";

    }


    if(
        result
    ){

        /*
         * Jangan menghapus result
         * payroll lainnya jika nanti
         * ada integrasi tambahan.
         */

        let note =
            result.querySelector(
                ".payroll-period-note"
            );


        if(
            !note
        ){

            note =
                document.createElement(
                    "div"
                );

            note.className =
                "payroll-period-note";


            result.prepend(
                note
            );

        }


        const periodNote =
            buildPeriodNote(
                state.activePeriod
            );


        note.innerHTML =
            `
                <strong>
                    ✓ Periode Gaji sudah dibuat
                </strong>

                <div class="payroll-period-note-row">
                    <span>
                        Periode perhitungan
                    </span>

                    <strong>
                        ${periodNote.calculation}
                    </strong>
                </div>

                <div class="payroll-period-note-row">
                    <span>
                        Masa aktif
                    </span>

                    <strong>
                        ${periodNote.active}
                    </strong>
                </div>
            `;

    }

}


/* =====================================================
   BIND NEW PERIOD BUTTON
===================================================== */

function bindNewPeriodButton(
    sectionElement,
    mode
){

    if(
        !sectionElement
    ){

        return;

    }


    const button =
        sectionElement.querySelector(
            ".global-setting-add"
        );


    if(
        !button
    ){

        return;

    }


    /*
     * Hindari binding dua kali.
     */

    if(
        button.dataset.payrollPeriodBound ===
        "true"
    ){

        return;

    }


    button.dataset.payrollPeriodBound =
        "true";


    button.addEventListener(
        "click",
        () => {

            const state =
                buildUIRuleState(
                    mode
                );


            /*
             * Jika existing period,
             * klik tombol berarti:
             *
             * USER INGIN MEMBUAT
             * PERIODE BARU.
             */

            if(
                state.activePeriod
                &&
                !state.newPeriodMode
            ){

                enterNewPeriodMode(
                    mode
                );


                /*
                 * Buka kembali semua
                 * lock period-dependent.
                 */

                unlockDependentSections(
                    mode
                );


                /*
                 * Render ulang state
                 * periode.
                 */

                applyPeriodUI(
                    sectionElement,
                    mode
                );


                /*
                 * Jangan return untuk
                 * membatalkan event controller.
                 *
                 * Global Setting controller
                 * tetap akan membuka form.
                 */

            }

        }
    );

}


/* =====================================================
   UNLOCK DEPENDENT SECTIONS
===================================================== */

function unlockDependentSections(
    mode
){

    /*
     * Engine state adalah source state.
     *
     * UI section akan membaca state ini
     * saat form dibuka kembali.
     */

    const key =
        getStateKey(
            mode
        );


    STATE[key]
        .newPeriodMode =
        true;


    console.log(
        "PAYROLL ENGINE: DEPENDENT RULES UNLOCKED",
        mode
    );


    /*
     * Jika section sedang terbuka,
     * bersihkan state lock yang ditempel
     * oleh engine sebelumnya.
     */

    const sections =
        document.querySelectorAll(
            ".global-setting-section"
        );


    sections.forEach(
        section => {

            const sectionId =
                normalizeCompareValue(
                    section.dataset.section
                );


            if(
                sectionId !==
                "rule_gaji"

                &&

                sectionId !==
                "rule_tambah"

                &&

                sectionId !==
                "rule_potong"

                &&

                sectionId !==
                "rule_periode"

            ){

                return;

            }


            section.dataset.payrollNewPeriod =
                "true";


            /*
             * Jangan menghapus result history.
             *
             * Yang dibuka kembali hanya
             * form/input.
             */

            const form =
                section.querySelector(
                    ".global-setting-form"
                );


            if(
                form
            ){

                /*
                 * State berikut akan dipakai
                 * ketika form dibuka.
                 */

                form.dataset.payrollNewPeriod =
                    "true";

            }


            /*
             * Existing visual lock.
             */

            section
                .querySelectorAll(
                    ".is-used, .rule-created"
                )
                .forEach(
                    element => {

                        element.classList.remove(
                            "is-used"
                        );

                        element.classList.remove(
                            "rule-created"
                        );

                    }
                );

        }
    );

}


/* =====================================================
   APPLY SECTION STATE
===================================================== */

async function applySectionState(
    sectionElement,
    mode,
    sectionId
){

    if(
        !sectionElement
    ){

        return;

    }


    await ensureLoaded(
        mode
    );


    /*
     * Rule Periode
     */

    if(
        sectionId ===
        "rule_periode"
    ){

        applyPeriodUI(
            sectionElement,
            mode
        );


        bindNewPeriodButton(
            sectionElement,
            mode
        );


        return;

    }


    const state =
        buildUIRuleState(
            mode
        );


    /*
     * Jika periode baru sedang dibuat,
     * jangan terapkan lock periode lama.
     */

    if(
        state.newPeriodMode
    ){

        unlockSectionFields(
            sectionElement
        );


        return;

    }


    /*
     * Rule Gaji
     */

    if(
        sectionId ===
        "rule_gaji"
    ){

        if(
            state.lockRuleGaji
        ){

            lockFixedRuleSection(
                sectionElement,
                "Gaji Pokok"
            );

        }
        else{

            unlockSectionFields(
                sectionElement
            );

        }


        return;

    }


    /*
     * Rule Tambah
     */

    if(
        sectionId ===
        "rule_tambah"
    ){

        applySelectLockState(
            sectionElement,
            "rule_tambah",
            state.lockedTambah
        );


        return;

    }


    /*
     * Rule Potong
     */

    if(
        sectionId ===
        "rule_potong"
    ){

        applySelectLockState(
            sectionElement,
            "rule_potong",
            state.lockedPotong
        );


        return;

    }


    /*
     * Rule Work Daily
     */

    if(
        sectionId ===
        "rule_work"
    ){

        /*
         * Rule Work tetap terbuka.
         *
         * Duplicate dicek berdasarkan
         * keseluruhan row.
         */

        unlockSectionFields(
            sectionElement
        );

    }

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
            "input, select, textarea, button"
        )
        .forEach(
            element => {

                /*
                 * Jangan mengaktifkan
                 * tombol hapus/result.
                 */

                if(
                    element.classList.contains(
                        "global-setting-result-delete"
                    )
                ){

                    return;

                }


                if(
                    element.classList.contains(
                        "global-setting-confirm"
                    )
                ){

                    return;

                }


                element.disabled =
                    false;

            }
        );


    sectionElement
        .querySelectorAll(
            ".is-used, .rule-created"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "is-used"
                );

                element.classList.remove(
                    "rule-created"
                );

            }
        );

}


/* =====================================================
   LOCK FIXED RULE SECTION
===================================================== */

function lockFixedRuleSection(
    sectionElement,
    label
){

    if(
        !sectionElement
    ){

        return;

    }


    const form =
        sectionElement.querySelector(
            ".global-setting-form"
        );


    if(
        form
    ){

        form.querySelectorAll(
            "input, select, textarea"
        ).forEach(
            input => {

                input.disabled =
                    true;

            }
        );

    }


    const fieldWrappers =
        sectionElement.querySelectorAll(
            ".global-setting-field"
        );


    fieldWrappers.forEach(
        wrapper => {

            wrapper.classList.add(
                "rule-created"
            );

            wrapper.classList.add(
                "is-used"
            );

        }
    );


    /*
     * Form tetap dapat dipakai
     * oleh controller, tetapi rule
     * sudah ditandai existing.
     */

    const note =
        sectionElement.querySelector(
            ".payroll-rule-created-note"
        );


    if(
        !note
    ){

        const element =
            document.createElement(
                "div"
            );


        element.className =
            "global-setting-field-note payroll-rule-created-note";


        element.textContent =
            `✓ ${label} sudah dibuat`;


        const content =
            sectionElement.querySelector(
                ".global-setting-result"
            );


        if(
            content
        ){

            content.prepend(
                element
            );

        }

    }

}


/* =====================================================
   APPLY SELECT LOCK STATE
===================================================== */

function applySelectLockState(
    sectionElement,
    typeRule,
    lockedNames
){

    if(
        !sectionElement
    ){

        return;

    }


    if(
        !(lockedNames instanceof Set)
    ){

        return;

    }


    const form =
        sectionElement.querySelector(
            ".global-setting-form"
        );


    if(
        !form
    ){

        return;

    }


    /*
     * Select native.
     */

    form.querySelectorAll(
        "select"
    ).forEach(
        select => {

            const fieldName =
                normalizeCompareValue(
                    select.name
                );


            /*
             * Rule name selector.
             */

            if(
                fieldName !==
                "nama"
            ){

                return;

            }


            Array.from(
                select.options
            ).forEach(
                option => {

                    const value =
                        normalizeCompareValue(
                            option.value
                        );


                    const locked =
                        lockedNames.has(
                            value
                        );


                    option.disabled =
                        locked;

                }
            );


            /*
             * Jika value saat ini
             * sudah locked, reset.
             */

            if(
                select.value
                &&
                lockedNames.has(
                    normalizeCompareValue(
                        select.value
                    )
                )
            ){

                select.value =
                    "";

            }

        }
    );


    /*
     * Custom select.
     *
     * Global Setting membuat picker
     * berdasarkan field.options ketika
     * picker dibuka.
     *
     * Tambahkan marker agar integration
     * berikutnya dapat menggunakan state
     * ini tanpa DOM sebagai source truth.
     */

    form.querySelectorAll(
        ".global-setting-custom-select"
    ).forEach(
        button => {

            const fieldName =
                normalizeCompareValue(
                    button.dataset.name
                );


            if(
                fieldName !==
                "nama"
            ){

                return;

            }


            button.dataset.payrollLockType =
                typeRule;


            button.dataset.payrollLockedNames =
                JSON.stringify(
                    Array.from(
                        lockedNames
                    )
                );

        }
    );

}


/* =====================================================
   CHECK DUPLICATE NEW RULE
===================================================== */

async function validateNewRule(
    mode,
    rule
){

    await ensureLoaded(
        mode
    );


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


    /*
     * Rule Work:
     *
     * duplicate hanya jika
     * seluruh row identik.
     */

    if(
        normalizeCompareValue(
            rule.type_rule
        ) ===
        "rule_work"
    ){

        if(
            isRuleWorkDuplicate(
                mode,
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


    /*
     * Tambah / Potong:
     *
     * duplicate berdasarkan nama
     * dalam periode aktif.
     */

    if(
        normalizeCompareValue(
            rule.type_rule
        ) ===
        "rule_tambah"

        ||

        normalizeCompareValue(
            rule.type_rule
        ) ===
        "rule_potong"
    ){

        if(
            !isNewPeriodMode(
                mode
            )
            &&
            isRuleNameUsed(
                mode,
                rule.type_rule,
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


    /*
     * Rule Gaji:
     * satu gaji dalam periode.
     */

    if(
        normalizeCompareValue(
            rule.type_rule
        ) ===
        "rule_gaji"
    ){

        if(
            !isNewPeriodMode(
                mode
            )
        ){

            const state =
                getRuleGajiState(
                    mode
                );


            if(
                state.exists
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

        }

    }


    return {

        valid :
            true,

        duplicate :
            false

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


    const berlakuStart =
        normalizeValue(
            period.berlaku_start
        );


    const berlakuEnd =
        normalizeValue(
            period.berlaku_end
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
        !berlakuStart ||
        !berlakuEnd
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
            berlakuStart
        );


    const activeEnd =
        getTimeValue(
            berlakuEnd
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
            "rule_periode",

        nama :
            "periode_gaji",

        kondisi :
            "periode",

        waktu :
            "bulanan",

        nominal :
            "",

        nilai_start :
            period.nilai_start,

        nilai_end :
            period.nilai_end,

        berlaku_start :
            period.berlaku_start,

        berlaku_end :
            period.berlaku_end

    };

}


/* =====================================================
   PERIOD SAVED
===================================================== */

function markPeriodSaved(
    mode,
    period
){

    const normalized =
        preparePeriodResult(
            period
        );


    setActivePeriod(
        mode,
        normalized
    );


    exitNewPeriodMode(
        mode
    );


    console.log(
        "PAYROLL ENGINE: PERIOD SAVED",
        normalized
    );


    return normalized;

}


/* =====================================================
   PREPARE SAVE PAYLOAD
===================================================== */

async function prepareSave(
    mode,
    payload = [],
    options = {}
){

    await ensureLoaded(
        mode
    );


    const data =
        Array.isArray(
            payload
        )
            ?
        payload.map(
            item => {

                if(
                    item &&
                    item.data
                ){

                    return {

                        ...item,

                        data :
                            item.data

                    };

                }


                return item;

            }
        )
            :
        [];


    const output =
        [];


    /*
     * Cari Rule Periode baru
     * dari payload.
     */

    let newPeriod =
        null;


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
                "rule_periode"

                &&

                normalizeCompareValue(
                    rule.nama
                ) ===
                "periode_gaji"
            ){

                newPeriod =
                    rule;

            }

        }
    );


    /*
     * Jika ada Rule Periode baru,
     * validasi dan jadikan periode
     * konteks baru.
     */

    if(
        newPeriod
    ){

        const normalizedPeriod =
            preparePeriodResult(
                newPeriod
            );


        setActivePeriod(
            mode,
            normalizedPeriod
        );


        /*
         * Setelah period baru tersedia,
         * semua rule lain dalam payload
         * harus menggunakan periode baru.
         */

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
                    "rule_periode"
                ){

                    output.push(
                        item
                    );

                    return;

                }


                const prepared =
                    attachActivePeriod(
                        mode,
                        rule
                    );


                if(
                    item &&
                    item.data
                ){

                    output.push({

                        ...item,

                        data :
                            prepared

                    });

                }
                else{

                    output.push(
                        prepared
                    );

                }

            }
        );


        /*
         * Mode periode baru selesai
         * setelah payload disiapkan.
         */

        exitNewPeriodMode(
            mode
        );


        /*
         * Monthly automatic attendance.
         *
         * Hanya dibuat jika mode Monthly.
         */

        if(
            mode ===
            WORKSPACE.monthly
        ){

            const settings =
                options.settings ??
                {};


            const automaticRules =
                createAutomaticMonthlyRules(
                    normalizedPeriod,
                    settings
                );


            automaticRules.forEach(
                rule => {

                    output.push({

                        section :
                            rule.type_rule,

                        data :
                            rule

                    });

                }
            );

        }


        return output;

    }


    /*
     * Tidak ada period baru.
     *
     * Rule lain tetap mewarisi
     * active period yang sedang ada.
     */

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
                    mode,
                    rule
                );


            if(
                item &&
                item.data
            ){

                output.push({

                    ...item,

                    data :
                        prepared

                });

            }
            else{

                output.push(
                    prepared
                );

            }

        }
    );


    return output;

}


/* =====================================================
   BUILD MONTHLY AUTO RULES
===================================================== */

async function buildMonthlyAutoRules(
    settings = {}
){

    await ensureLoaded(
        WORKSPACE.monthly
    );


    const period =
        getActivePeriod(
            WORKSPACE.monthly
        );


    if(
        !period
    ){

        return [];

    }


    return createAutomaticMonthlyRules(
        period,
        settings
    );

}


/* =====================================================
   REFRESH AFTER SAVE
===================================================== */

async function refreshAfterSave(
    mode
){

    /*
     * Sheet kembali menjadi source
     * of truth setelah save.
     */

    return refresh(
        mode
    );

}


/* =====================================================
   RELOAD RULES
===================================================== */

async function reload(
    mode
){

    resetSessionState(
        mode
    );


    return refresh(
        mode
    );

}


/* =====================================================
   GET RULE COUNT
===================================================== */

function getRuleCount(
    mode,
    typeRule = null
){

    if(
        !typeRule
    ){

        return getRules(
            mode
        ).length;

    }


    return findRules(
        mode,
        typeRule
    ).length;

}


/* =====================================================
   GET CURRENT PERIOD RULE COUNT
===================================================== */

function getCurrentPeriodRuleCount(
    mode,
    typeRule = null
){

    const rules =
        getRulesInPeriod(
            mode
        );


    if(
        !typeRule
    ){

        return rules.length;

    }


    const target =
        normalizeCompareValue(
            typeRule
        );


    return rules.filter(
        rule =>
            normalizeCompareValue(
                rule.type_rule
            ) ===
            target
    ).length;

}


/* =====================================================
   GET LOCK SUMMARY
===================================================== */

function getLockSummary(
    mode
){

    const state =
        buildUIRuleState(
            mode
        );


    return {

        mode :
            mode,

        activePeriod :
            state.activePeriod,

        newPeriodMode :
            state.newPeriodMode,

        ruleGajiLocked :
            state.lockRuleGaji,

        ruleTambahLocked :
            Array.from(
                state.lockedTambah
            ),

        rulePotongLocked :
            Array.from(
                state.lockedPotong
            ),

        ruleWorkLocked :
            false

    };

}


/* =====================================================
   GET PAYROLL RULE
===================================================== */

function getPayrollRule(
    mode,
    typeRule,
    nama = null
){

    return findRule(
        mode,
        typeRule,
        nama
    );

}


/* =====================================================
   GET PAYROLL RULES
===================================================== */

function getPayrollRules(
    mode,
    typeRule = null
){

    if(
        typeRule
    ){

        return findRules(
            mode,
            typeRule
        );

    }


    return getRules(
        mode
    );

}


/* =====================================================
   GET PAYROLL PERIOD RULES
===================================================== */

function getPayrollPeriodRules(
    mode
){

    return getRulesInPeriod(
        mode
    );

}


/* =====================================================
   GET PAYROLL PERIOD
===================================================== */

function getPayrollPeriod(
    mode
){

    return getActivePeriod(
        mode
    );

}


/* =====================================================
   GET PAYROLL MODE
===================================================== */

function getMode(
    mode
){

    if(
        mode ===
        WORKSPACE.daily
        ||
        mode ===
        "daily"
    ){

        return WORKSPACE.daily;

    }


    return WORKSPACE.monthly;

}


/* =====================================================
   PUBLIC API
===================================================== */

export const Payroll = {

    /*
     * Workspace
     */

    WORKSPACE,


    /*
     * Load
     */

    refresh,

    reload,

    ensureLoaded,

    refreshAfterSave,


    /*
     * State
     */

    getState,

    getRuleState,

    getLockSummary,


    /*
     * Rules
     */

    getRules :
        getPayrollRules,

    getRule :
        getPayrollRule,

    getExistingRule,

    getExistingRules,

    getRuleCount,

    getCurrentPeriodRuleCount,


    /*
     * Period
     */

    getActivePeriod :
        getPayrollPeriod,

    getExistingPeriod,

    getCurrentPeriodRules :
        getPayrollPeriodRules,

    getActivePeriodKey,

    getPeriodDisplayData,

    buildPeriodNote,

    validatePeriod,

    preparePeriodResult,

    markPeriodSaved,


    /*
     * Period mode
     */

    isNewPeriodMode,

    enterNewPeriodMode,

    addNewPeriod,

    exitNewPeriodMode,


    /*
     * Rule period
     */

    ruleBelongsToPeriod,

    getRulesInPeriod,

    getUsedRuleNames,

    getAvailableRuleOptions,

    isOptionLocked,


    /*
     * Rule states
     */

    getRuleGajiState,

    getRuleTambahState,

    getRulePotongState,

    getRuleWorkState,

    getAttendanceState,

    getWorkSource,


    /*
     * Rule preparation
     */

    prepareRule,

    attachActivePeriod,

    inheritActivePeriod,

    validateNewRule,

    isExactRuleDuplicate,

    isRuleWorkDuplicate,


    /*
     * Monthly
     */

    createAutomaticRuleMasuk,

    createAutomaticMonthlyRules,

    buildMonthlyAutoRules,


    /*
     * Save
     */

    prepareSave,


    /*
     * UI
     */

    applyPeriodUI,

    bindNewPeriodButton,

    applySectionState,

    unlockDependentSections,

    unlockSectionFields,

    lockFixedRuleSection,

    applySelectLockState

};


/* =====================================================
   BACKWARD COMPATIBILITY
===================================================== */

export const PayrollEngine =
    Payroll;


/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default Payroll;
