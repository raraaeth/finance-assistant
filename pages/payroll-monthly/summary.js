/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Summary
   File        : summary.js
   Version     : 3.2.0

   Description :
   Payroll Summary / Salary History
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Process

} from "./process.js";


import {

    Period

} from "./period.js";


import {

    Overlay

} from "../../components/overlay/script.js";


/* =====================================================
   STATE
===================================================== */

export const Summary = {

    currentPeriod : {

        start : null,

        end : null

    },

    selectedPeriod : {

        start : null,

        end : null

    },

    periodOffset : 0,

    historyData : null,

    initialized : false

};


/* =====================================================
   INIT
===================================================== */

Summary.init = function(){

    if(

        Summary.initialized

    ){

        return;

    }


    Summary.initialized = true;


    hideNonPayrollSections();


    registerEvents();


    processPayrollSummary();

};


/* =====================================================
   HIDE NON PAYROLL SECTIONS
===================================================== */

function hideNonPayrollSections(){

    [

        "summary-overview",

        "summary-debt",

        "summary-distribution"

    ].forEach(

        id => {

            const section =

                document.getElementById(

                    id

                );


            if(

                section

            ){

                section.classList.add(

                    "hidden"

                );

            }

        }

    );

}


/* =====================================================
   PROCESS PAYROLL SUMMARY
===================================================== */

function processPayrollSummary(){

    const currentPeriod =

        Period.current;


    const lastPeriod =

        Period.data;


    if(

        !currentPeriod?.start ||

        !currentPeriod?.end

    ){

        return;

    }


    Summary.currentPeriod = {

        start :

            new Date(

                currentPeriod.start

            ),

        end :

            new Date(

                currentPeriod.end

            )

    };


    if(

        lastPeriod?.start &&

        lastPeriod?.end

    ){

        Summary.selectedPeriod = {

            start :

                new Date(

                    lastPeriod.start

                ),

            end :

                new Date(

                    lastPeriod.end

                )

        };

    }

    else {

        Summary.selectedPeriod = {

            start : null,

            end : null

        };

    }


    Summary.periodOffset =

        -1;


    renderSummary();

    renderCurrentPeriod();

}


/* =====================================================
   RENDER SUMMARY
===================================================== */

function renderSummary(){

    const section =

        document.getElementById(

            "summary-payroll-last"

        );


    const card =

        document.getElementById(

            "summary-payroll-last-card"

        );


    if(

        !section ||

        !card

    ){

        return;

    }


    section.classList.remove(

        "hidden"

    );


    const period =

        Summary.selectedPeriod;


    const result =

        calculatePayroll(

            period.start,

            period.end

        );


    Summary.historyData =

        result;


    card.innerHTML = `

        <div class="payroll-last-period">

            ${

                formatDate(

                    period.start

                )

            }

            -

            ${

                formatDate(

                    period.end

                )

            }

        </div>


        <div class="payroll-last-salary">

            ${

                formatRupiah(

                    result.netSalary

                )

            }

        </div>


        <div class="payroll-period-navigation">

            <button

                type="button"

                id="payroll-period-prev">

                &lt; Back

            </button>


            <button

                type="button"

                id="payroll-period-next"

                ${

                    Summary.periodOffset >= 0

                        ? "disabled"

                        : ""

                }>

                Next &gt;

            </button>

        </div>


        <button

            type="button"

            id="payroll-period-detail"

            class="payroll-period-detail">

            Tampilkan Rincian

        </button>

    `;

}


/* =====================================================
   CURRENT PERIOD
===================================================== */

function renderCurrentPeriod(){

    const section =

        document.getElementById(

            "summary-payroll-current"

        );


    const card =

        document.getElementById(

            "summary-payroll-current-card"

        );


    if(

        !section ||

        !card

    ){

        return;

    }


    section.classList.remove(

        "hidden"

    );


    const period =

        Summary.currentPeriod;


    const result =

        calculatePayroll(

            period.start,

            period.end

        );


    const earningRows =

        result.earnings.components ?? [];


    const deductionRows =

        result.deductions.components ?? [];


    const renderComponentRows =

        (components, deduction = false) =>

            components

            .filter(

                item =>

                    Number(

                        item.total || 0

                    ) !== 0

            )

            .map(

                item => `

                    <div class="payroll-row">

                        <span>

                            ${item.label}

                        </span>


                        <strong>

                            ${

                                deduction

                                    ? `-${formatRupiah(item.total)}`

                                    : formatRupiah(item.total)

                            }

                        </strong>

                    </div>

                `

            )

            .join("");


    const earningHTML =

        renderComponentRows(

            earningRows

        );


    const deductionHTML =

        renderComponentRows(

            deductionRows,

            true

        );


    const hasEarnings =

        earningRows.some(

            item =>

                Number(item.total || 0) !== 0

        );


    const hasDeductions =

        deductionRows.some(

            item =>

                Number(item.total || 0) !== 0

        );


    card.innerHTML = `

        <div class="payroll-current-period">

            ${

                formatDate(

                    period.start

                )

            }

            -

            ${

                formatDate(

                    period.end

                )

            }

        </div>


        <div class="payroll-estimate-total">

            <span>

                Estimasi Total Gaji

            </span>


            <strong>

                ${

                    formatRupiah(

                        result.grossSalary

                    )

                }

            </strong>

        </div>


        <div class="payroll-divider"></div>


        ${

            Number(result.gajiPokok || 0) !== 0

                ? `

                    <div class="payroll-row">

                        <span>

                            Gaji Pokok

                        </span>

                        <strong>

                            ${

                                formatRupiah(

                                    result.gajiPokok

                                )

                            }

                        </strong>

                    </div>

                `

                : ""

        }


        ${

            hasEarnings

                ? `

                    <div class="payroll-subtitle">

                        Penambahan

                    </div>

                    ${earningHTML}

                `

                : ""

        }


        ${

            hasEarnings && hasDeductions

                ? `<div class="payroll-divider"></div>`

                : hasDeductions

                    ? `<div class="payroll-divider"></div>`

                    : ""

        }


        ${

            hasDeductions

                ? `

                    <div class="payroll-subtitle">

                        Potongan

                    </div>

                    ${deductionHTML}

                `

                : ""

        }


        <div class="payroll-divider"></div>


        <div class="payroll-net">

            <span>

                Gaji Bersih

            </span>


            <strong>

                ${

                    formatRupiah(

                        result.netSalary

                    )

                }

            </strong>

        </div>

    `;

}


/* =====================================================
   PAGINATION
===================================================== */

function changePeriod(

    direction

){

    const newOffset =

        Summary.periodOffset +

        direction;


    if(

        newOffset >= 0

    ){

        return;

    }


    const base =

        Summary.currentPeriod;


    const start =

        new Date(

            base.start

        );


    const end =

        new Date(

            base.end

        );


    start.setMonth(

        start.getMonth() +

        newOffset

    );


    end.setMonth(

        end.getMonth() +

        newOffset

    );


    Summary.periodOffset =

        newOffset;


    Summary.selectedPeriod = {

        start,

        end

    };


    renderSummary();

}


/* =====================================================
   GLOBAL OVERLAY
===================================================== */

function openDetailOverlay(){

    const data =

        Summary.historyData;


    if(

        !data

    ){

        return;

    }


    const rows = [];


    if(

        Number(data.gajiPokok || 0) !== 0

    ){

        rows.push(

            overlayRow(

                "Gaji Pokok",

                formatRupiah(

                    data.gajiPokok

                )

            )

        );

    }


    const earnings =

        data.earnings?.components ?? [];


    const deductions =

        data.deductions?.components ?? [];


    if(

        earnings.length > 0

    ){

        rows.push(

            `

            <div class="global-overlay-subtitle">

                Penambahan

            </div>

            `

        );


        earnings.forEach(

            item => {

                if(

                    Number(item.total || 0) === 0

                ){

                    return;

                }


                rows.push(

                    overlayRow(

                        item.label,

                        formatRupiah(

                            item.total

                        )

                    )

                );

            }

        );

    }


    if(

        deductions.length > 0

    ){

        rows.push(

            `

            <div class="global-overlay-divider"></div>

            <div class="global-overlay-subtitle">

                Potongan

            </div>

            `

        );


        deductions.forEach(

            item => {

                if(

                    Number(item.total || 0) === 0

                ){

                    return;

                }


                rows.push(

                    overlayRow(

                        item.label,

                        `-${formatRupiah(item.total)}`

                    )

                );

            }

        );

    }


    rows.push(

        `

        <div class="global-overlay-divider"></div>

        `

    );


    rows.push(

        `

        <div class="global-overlay-row global-overlay-total">

            <span>

                Gaji Bersih

            </span>


            <strong>

                ${

                    formatRupiah(

                        data.netSalary

                    )

                }

            </strong>

        </div>

        `

    );


    Overlay.open({

        title :

            "Rincian Gaji",

        period :

            formatDate(

                data.period.start

            )

            +

            " - "

            +

            formatDate(

                data.period.end

            ),

        userName :

            getAppUserName(),

        content :

            rows.join("")

    });

}


/* =====================================================
   OVERLAY HELPER
===================================================== */

function overlayRow(

    label,

    value

){

    return `

        <div class="global-overlay-row">

            <span>

                ${label}

            </span>


            <strong>

                ${value}

            </strong>

        </div>

    `;

}


/* =====================================================
   USER NAME
===================================================== */

function getAppUserName(){

    return (

        window.currentUser?.displayName ??

        window.currentUser?.name ??

        window.user?.displayName ??

        window.user?.name ??

        localStorage.getItem(

            "displayName"

        ) ??

        localStorage.getItem(

            "userName"

        ) ??

        "Finance User"

    );

}


/* =====================================================
   EVENTS
===================================================== */

function registerEvents(){

    document.addEventListener(

        "click",

        event => {

            if(

                event.target.closest(

                    "#payroll-period-prev"

                )

            ){

                changePeriod(

                    -1

                );

                return;

            }


            if(

                event.target.closest(

                    "#payroll-period-next"

                )

            ){

                changePeriod(

                    1

                );

                return;

            }


            if(

                event.target.closest(

                    "#payroll-period-detail"

                )

            ){

                openDetailOverlay();

            }

        }

    );

}


/* =====================================================
   CALCULATE PAYROLL
===================================================== */

function calculatePayroll(

    start,

    end

){

    const attendance =

        Process.attendance?.data ??

        [];


    const rules =

        flattenRules(

            Process.rules ?? {}

        );


    const rows =

        attendance.filter(

            item => {

                const date =

                    getAttendanceDate(

                        item

                    );


                if(

                    !date

                ){

                    return false;

                }


                return (

                    date >= start &&

                    date <= end

                );

            }

        );


    const gajiRule =

        rules.find(

            rule =>

                rule.type_rule === "rule_gaji" &&

                rule.nama === "gaji"

        ) ||

        rules.find(

            rule =>

                rule.nama === "gaji"

        );


    const gajiPokok =

        Number(

            gajiRule?.nominal || 0

        );


    const earnings = {

        components : []

    };


    const deductions = {

        components : []

    };


    /* =============================================
       TAMBAHAN PERIODE / HARIAN
    ============================================= */

    rules

        .filter(

            rule =>

                rule.type_rule === "rule_tambah"

        )

        .forEach(

            rule => {

                if(

                    rule.kondisi === "periode" &&

                    rule.waktu === "gaji"

                ){

                    addPayrollComponent(

                        earnings.components,

                        rule,

                        1,

                        createEarningLabel(

                            rule,

                            1

                        )

                    );

                    return;

                }


                if(

                    rule.waktu === "harian"

                ){

                    let jumlah = 0;


                    if(

                        rule.kondisi === "lembur_harian"

                    ){

                        jumlah =

                            countStatus(

                                rows,

                                "lembur"

                            );

                    }

                    else {

                        const kondisi =

                            String(

                                rule.kondisi || ""

                            )

                            .split(",")

                            .map(

                                value =>

                                    value.trim()

                            );


                        jumlah =

                            rows.filter(

                                item =>

                                    kondisi.includes(

                                        item.status

                                    )

                            ).length;

                    }


                    addPayrollComponent(

                        earnings.components,

                        rule,

                        jumlah,

                        createEarningLabel(

                            rule,

                            jumlah

                        )

                    );

                }

            }

        );


    /* =============================================
       LEMBUR PER JAM

       Setiap hari dimulai kembali dari jam 1.
       Component dikumpulkan berdasarkan tier
       rule lembur_jam_1, lembur_jam_2, dst.
    ============================================= */

    const overtimeRules =

        rules

        .filter(

            rule =>

                rule.type_rule === "rule_tambah" &&

                rule.waktu === "jam" &&

                String(

                    rule.nama || ""

                ).startsWith(

                    "lembur_jam"

                )

        );


    const overtimeCounts =

        new Map();


    rows.forEach(

        item => {

            const hours =

                Number(

                    item.overtimeHours ??

                    item.lembur_jam ??

                    item.lemburJam ??

                    0

                );


            if(

                hours <= 0

            ){

                return;

            }


            for(

                let hour = 1;

                hour <= hours;

                hour++

            ){

                const rule =

                    findOvertimeHourRule(

                        overtimeRules,

                        hour,

                        item.status

                    );


                if(

                    !rule

                ){

                    continue;

                }


                const current =

                    overtimeCounts.get(

                        rule.nama

                    ) ?? {

                        rule,

                        count : 0

                    };


                current.count++;


                overtimeCounts.set(

                    rule.nama,

                    current

                );

            }

        }

    );


    overtimeRules

        .forEach(

            rule => {

                const entry =

                    overtimeCounts.get(

                        rule.nama

                    );


                if(

                    !entry

                ){

                    return;

                }


                addPayrollComponent(

                    earnings.components,

                    rule,

                    entry.count,

                    createEarningLabel(

                        rule,

                        entry.count

                    )

                );

            }

        );


    /* =============================================
       POTONGAN
    ============================================= */

    rules

        .filter(

            rule =>

                rule.type_rule === "rule_potong"

        )

        .forEach(

            rule => {

                let jumlah = 0;


                /* =================================
                   POTONGAN PERIODE
                ================================= */

                if(

                    rule.kondisi === "periode" &&

                    rule.waktu === "gaji"

                ){

                    jumlah = 1;

                }


                /* =================================
                   POTONGAN TELAT

                   Setiap rule telat dihitung
                   sendiri berdasarkan range.
                ================================= */

                else if(

                    rule.kondisi === "telat" &&

                    rule.waktu === "menit"

                ){

                    jumlah =

                        rows.filter(

                            item => {

                                const minutes =

                                    Number(

                                        item.lateMinutes ??

                                        item.telat ??

                                        0

                                    );


                                if(

                                    minutes <= 0

                                ){

                                    return false;

                                }


                                const min =

                                    Number(

                                        rule.nilai_start || 0

                                    );


                                const max =

                                    Number(

                                        rule.nilai_end ||

                                        Infinity

                                    );


                                return (

                                    minutes >= min &&

                                    minutes <= max

                                );

                            }

                        ).length;

                }


                /* =================================
                   IZIN TELAT
                ================================= */

                else if(

                    rule.kondisi === "izin_telat"

                ){

                    jumlah =

                        sumAttendanceValue(

                            rows,

                            "izinTelatHours",

                            "izin_telat"

                        );

                }


                /* =================================
                   IZIN PULANG
                ================================= */

                else if(

                    rule.kondisi === "izin_pulang"

                ){

                    jumlah =

                        sumAttendanceValue(

                            rows,

                            "izinPulangHours",

                            "izin_pulang"

                        );

                }


                /* =================================
                   POTONGAN HARIAN

                   Contoh:
                   absen
                   dirumahkan
                ================================= */

                else if(

                    rule.waktu === "harian" &&

                    rule.kondisi

                ){

                    jumlah =

                        countStatus(

                            rows,

                            rule.kondisi

                        );

                }


                addPayrollComponent(

                    deductions.components,

                    rule,

                    jumlah,

                    createDeductionLabel(

                        rule,

                        jumlah

                    )

                );

            }

        );


    /* =============================================
       TOTAL
    ============================================= */

    const totalEarnings =

        earnings.components.reduce(

            (total, item) =>

                total +

                Number(item.total || 0),

            0

        );


    const totalDeductions =

        deductions.components.reduce(

            (total, item) =>

                total +

                Number(item.total || 0),

            0

        );


    const grossSalary =

        gajiPokok +

        totalEarnings;


    const netSalary =

        grossSalary -

        totalDeductions;


    return {

        period : {

            start,

            end

        },

        attendance :

            rows,

        gajiPokok,

        earnings,

        deductions,

        totalEarnings,

        totalDeductions,

        grossSalary,

        netSalary

    };

}


/* =====================================================
   PAYROLL COMPONENT
===================================================== */

function addPayrollComponent(

    target,

    rule,

    count,

    label

){

    const jumlah =

        Number(count || 0);


    const nominal =

        Number(rule?.nominal || 0);


    target.push({

        rule,

        nama :

            rule?.nama ?? "",

        label,

        count :

            jumlah,

        nominal,

        total :

            jumlah *

            nominal

    });

}


/* =====================================================
   CREATE EARNING LABEL
===================================================== */

function createEarningLabel(

    rule,

    count

){

    const nama =

        String(

            rule?.nama || ""

        );


    const jumlah =

        Number(

            count || 0

        );


    /* =============================================
       UANG MAKAN
    ============================================= */

    if(

        nama === "uang_makan"

    ){

        return (

            `Uang Makan ${jumlah} hari`

        );

    }


    /* =============================================
       LEMBUR HARIAN
    ============================================= */

    if(

        nama === "lembur"

    ){

        return (

            `Lembur Harian x${jumlah}`

        );

    }


    /* =============================================
       LEMBUR JAM
    ============================================= */

    if(

        nama.startsWith(

            "lembur_jam_"

        )

    ){

        const tier =

            nama.replace(

                "lembur_jam_",

                ""

            );


        return (

            `Lembur Jam ${tier} x${jumlah}`

        );

    }


    /* =============================================
       TRANSPORT
    ============================================= */

    if(

        nama === "uang_transport"

    ){

        return "Uang Transport";

    }


    /* =============================================
       TUNJANGAN
    ============================================= */

    if(

        nama === "tunjangan"

    ){

        return "Tunjangan";

    }


    return nama;

}


/* =====================================================
   CREATE DEDUCTION LABEL
===================================================== */

function createDeductionLabel(

    rule,

    count

){

    const nama =

        String(

            rule?.nama || ""

        );


    const jumlah =

        Number(

            count || 0

        );


    /* =============================================
       TELAT
    ============================================= */

    if(

        nama.startsWith(

            "telat_"

        )

    ){

        const tier =

            nama.replace(

                "telat_",

                ""

            );


        return (

            `Pot. Telat ${tier} x${jumlah}`

        );

    }


    /* =============================================
       IZIN TELAT
    ============================================= */

    if(

        nama === "izin_telat"

    ){

        return (

            `Pot. Izin Telat x${jumlah}`

        );

    }


    /* =============================================
       IZIN PULANG
    ============================================= */

    if(

        nama === "izin_pulang"

    ){

        return (

            `Pot. Izin Pulang x${jumlah}`

        );

    }


    /* =============================================
       ABSEN
    ============================================= */

    if(

        nama === "absen"

    ){

        return (

            `Pot. Absen x${jumlah}`

        );

    }


    /* =============================================
       DIRUMAHKAN
    ============================================= */

    if(

        nama === "dirumahkan"

    ){

        return (

            `Pot. Dirumahkan ${jumlah}x`

        );

    }


    /* =============================================
       POTONGAN PERIODE
    ============================================= */

    const labels = {

        BPJS :

            "BPJS",

        tabungan :

            "Tabungan",

        Jamsostek :

            "Jamsostek",

        koperasi :

            "Koperasi",

        "lain-lain" :

            "Lain-lain"

    };


    return (

        labels[nama] ??

        nama

    );

}


/* =====================================================
   COUNT STATUS
===================================================== */

function countStatus(

    rows,

    status

){

    return rows.filter(

        item =>

            item.status ===

            status

    ).length;

}


/* =====================================================
   SUM ATTENDANCE VALUE
===================================================== */

function sumAttendanceValue(

    rows,

    primary,

    fallback

){

    return rows.reduce(

        (total, item) =>

            total +

            Number(

                item[primary] ??

                item[fallback] ??

                0

            ),

        0

    );

}


/* =====================================================
   FIND OVERTIME HOUR RULE
===================================================== */

function findOvertimeHourRule(

    rules,

    hour,

    status

){

    const applicable =

        rules

        .filter(

            rule => {

                const kondisi =

                    String(

                        rule.kondisi || ""

                    )

                    .split(",")

                    .map(

                        value =>

                            value.trim()

                    );


                return (

                    !kondisi.length ||

                    kondisi.includes(

                        status

                    )

                );

            }

        )

        .sort(

            (a, b) =>

                Number(

                    a.nilai_start || 0

                ) -

                Number(

                    b.nilai_start || 0

                )

        );


    /* =============================================
       CARI RANGE YANG TEPAT
    ============================================= */

    const exact =

        applicable.find(

            rule => {

                const min =

                    Number(

                        rule.nilai_start || 0

                    );


                const max =

                    Number(

                        rule.nilai_end ||

                        Infinity

                    );


                return (

                    hour >= min &&

                    hour <= max

                );

            }

        );


    if(

        exact

    ){

        return exact;

    }


    /* =============================================
       FALLBACK

       Kalau tidak ada rule range yang
       langsung mencakup jam tersebut,
       gunakan tier terakhir yang sudah
       dimulai.

       Contoh:

       Jam 1 = 1-1
       Jam 2 = 2-8

       Jam 3 -> Jam 2
    ============================================= */

    const fallback =

        applicable

        .filter(

            rule =>

                Number(

                    rule.nilai_start || 0

                ) <= hour

        )

        .pop();


    return (

        fallback ??

        null

    );

}


/* =====================================================
   HELPER : FLATTEN RULES
===================================================== */

function flattenRules(

    rules

){

    if(

        Array.isArray(

            rules

        )

    ){

        return rules;

    }


    return Object.values(

        rules ?? {}

    )

    .flat()

    .filter(

        Boolean

    );

}


/* =====================================================
   HELPER : RULE NOMINAL
===================================================== */

function getRuleNominal(

    rules,

    name

){

    const rule =

        rules.find(

            item =>

                item.nama ===

                name

        );


    return Number(

        rule?.nominal || 0

    );

}


/* =====================================================
   HELPER : ATTENDANCE DATE
===================================================== */

function getAttendanceDate(

    item

){

    if(

        item.dateObject instanceof Date

    ){

        return new Date(

            item.dateObject

        );

    }


    if(

        item.date

    ){

        const [

            year,

            month,

            day

        ] =

            item.date

            .split("-")

            .map(Number);


        if(

            year &&

            month &&

            day

        ){

            return new Date(

                year,

                month - 1,

                day

            );

        }

    }


    return null;

}


/* =====================================================
   HELPER : FORMAT RUPIAH
===================================================== */

function formatRupiah(

    value

){

    return new Intl.NumberFormat(

        "id-ID",

        {

            style :

                "currency",

            currency :

                "IDR",

            maximumFractionDigits :

                0

        }

    )

    .format(

        Number(

            value || 0

        )

    );

}


/* =====================================================
   HELPER : FORMAT DATE
===================================================== */

function formatDate(

    date

){

    if(

        !date

    ){

        return "-";

    }


    const months = [

        "Januari",

        "Februari",

        "Maret",

        "April",

        "Mei",

        "Juni",

        "Juli",

        "Agustus",

        "September",

        "Oktober",

        "November",

        "Desember"

    ];


    return (

        String(

            date.getDate()

        )

        .padStart(

            2,

            "0"

        )

        +

        " " +

        months[

            date.getMonth()

        ] +

        " " +

        date.getFullYear()

    );

}
