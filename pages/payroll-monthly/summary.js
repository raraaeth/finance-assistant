/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Summary
   File        : summary.js
   Version     : 2.0.0

   Description :
   Payroll Summary / Salary History

   Sections :
   - Import
   - State
   - Init
   - Payroll Period
   - Payroll Calculation
   - Pagination
   - Detail Overlay
   - Export
   - Helper
===================================================== */


/* =====================================================
   IMPORT
===================================================== */

import {

    Process

} from "./process.js";

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


    Summary.initialized =

        true;


    hideNonPayrollSections();


    registerEvents();


    processPayrollSummary();

};

/* =====================================================
   HIDE NON PAYROLL SECTIONS
===================================================== */

function hideNonPayrollSections(){

    const sections = [

        "summary-overview",

        "summary-debt",

        "summary-distribution"

    ];


    sections.forEach(

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

    const today =

        new Date();


    /*
       Tentukan periode payroll
       yang sedang berjalan.

       Jika hari >= 26 :

       26 bulan ini
       -
       25 bulan berikutnya

       Jika hari < 26 :

       26 bulan sebelumnya
       -
       25 bulan ini
    */

    let currentStart;

    let currentEnd;


    if(

        today.getDate() >= 26

    ){

        currentStart =

            new Date(

                today.getFullYear(),

                today.getMonth(),

                26

            );


        currentEnd =

            new Date(

                today.getFullYear(),

                today.getMonth() + 1,

                25

            );

    }

    else {

        currentStart =

            new Date(

                today.getFullYear(),

                today.getMonth() - 1,

                26

            );


        currentEnd =

            new Date(

                today.getFullYear(),

                today.getMonth(),

                25

            );

    }


    Summary.currentPeriod = {

        start :

            currentStart,

        end :

            currentEnd

    };


    /*
       Periode terakhir yang sudah selesai
    */

    const lastStart =

        new Date(

            currentStart.getFullYear(),

            currentStart.getMonth() - 1,

            26

        );


    const lastEnd =

        new Date(

            currentStart.getFullYear(),

            currentStart.getMonth(),

            25

        );


    Summary.selectedPeriod = {

        start :

            lastStart,

        end :

            lastEnd

    };


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


    /* =============================================
       SHOW SECTION
    ============================================= */

    section.classList.remove(

        "hidden"

    );


    /* =============================================
       SELECTED PERIOD
    ============================================= */

    const period =

        Summary.selectedPeriod;


    /* =============================================
       CALCULATION
    ============================================= */

    const result =

        calculatePayroll(

            period.start,

            period.end

        );


    Summary.historyData =

        result;


    /* =============================================
       RENDER
    ============================================= */

    card.innerHTML =

    `

        <!-- PERIODE -->

        <div class="payroll-period-date">

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


        <!-- GAJI BERSIH -->

        <div class="payroll-net-value">

            ${

                formatRupiah(

                    result.netSalary

                )

            }

        </div>


        <!-- NAVIGATION -->

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


        <!-- DETAIL -->

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


    /* =============================================
       SHOW SECTION
    ============================================= */

    section.classList.remove(

        "hidden"

    );


    /* =============================================
       CURRENT PERIOD
    ============================================= */

    const period =

        Summary.currentPeriod;


    /* =============================================
       CALCULATION
    ============================================= */

    const result =

        calculatePayroll(

            period.start,

            period.end

        );


    /* =============================================
       HELPER DATA
    ============================================= */

    const attendance =

        result.attendance ?? [];


    const countStatus =

        status =>

            attendance.filter(

                item =>

                    item.status === status

            ).length;


    const countLate =

        attendance.filter(

            item =>

                Number(

                    item.lateMinutes ??

                    item.telat ??

                    0

                ) > 0

        ).length;


    const countIzinTelat =

        attendance.filter(

            item =>

                Number(

                    item.izinTelatHours ??

                    item.izin_telat ??

                    0

                ) > 0

        ).length;


    const countIzinPulang =

        attendance.filter(

            item =>

                Number(

                    item.izinPulangHours ??

                    item.izin_pulang ??

                    0

                ) > 0

        ).length;


    const uangMakanDays =

        attendance.filter(

            item =>

                item.status === "masuk" ||

                item.status === "lembur"

        ).length;


    const lemburHours =

        attendance.reduce(

            (total, item) =>

                total +

                Number(

                    item.overtimeHours ??

                    item.lembur_jam ??

                    item.lemburJam ??

                    0

                ),

            0

        );


    /* =============================================
       RENDER
    ============================================= */

    card.innerHTML =

    `

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


        <!-- GAJI POKOK -->

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


        <!-- PENAMBAHAN -->

        <div class="payroll-subtitle">

            Penambahan

        </div>


        <div class="payroll-row">

            <span>

                Uang Makan

                ${

                    uangMakanDays

                        ? `${uangMakanDays} hari`

                        : ""

                }

            </span>


            <strong>

                ${

                    formatRupiah(

                        result.earnings.uangMakan

                    )

                }

            </strong>

        </div>


        <div class="payroll-row">

            <span>

                Uang Transport

            </span>


            <strong>

                ${

                    formatRupiah(

                        result.earnings.transport

                    )

                }

            </strong>

        </div>


        <div class="payroll-row">

            <span>

                Tunjangan

            </span>


            <strong>

                ${

                    formatRupiah(

                        result.earnings.tunjangan

                    )

                }

            </strong>

        </div>


        <div class="payroll-row">

            <span>

                Lembur

                ${

                    lemburHours

                        ? `${lemburHours} jam`

                        : ""

                }

            </span>


            <strong>

                ${

                    formatRupiah(

                        result.earnings.lemburJam1 +

                        result.earnings.lemburJam2

                    )

                }

            </strong>

        </div>


        <div class="payroll-divider"></div>


        <!-- POTONGAN -->

        <div class="payroll-subtitle">

            Potongan

        </div>


        <div class="payroll-row">

            <span>

                BPJS

            </span>


            <strong>

                -${

                    formatRupiah(

                        result.deductions.bpjs

                    )

                }

            </strong>

        </div>


        <div class="payroll-row">

            <span>

                Tabungan

            </span>


            <strong>

                -${

                    formatRupiah(

                        result.deductions.tabungan

                    )

                }

            </strong>

        </div>


        <div class="payroll-row">

            <span>

                Jamsostek

            </span>


            <strong>

                -${

                    formatRupiah(

                        result.deductions.jamsostek

                    )

                }

            </strong>

        </div>


        <div class="payroll-row">

            <span>

                Koperasi

            </span>


            <strong>

                -${

                    formatRupiah(

                        result.deductions.koperasi

                    )

                }

            </strong>

        </div>


        <div class="payroll-row">

            <span>

                Lain-lain

            </span>


            <strong>

                -${

                    formatRupiah(

                        result.deductions.lainLain

                    )

                }

            </strong>

        </div>


        ${
            countLate > 0

                ?

            `

            <div class="payroll-row">

                <span>

                    Pot. Telat ${countLate}x

                </span>


                <strong>

                    -${

                        formatRupiah(

                            result.deductions.potonganTelat

                        )

                    }

                </strong>

            </div>

            `

                :

            ""

        }


        ${
            countIzinTelat > 0

                ?

            `

            <div class="payroll-row">

                <span>

                    Pot. Izin Telat ${countIzinTelat}x

                </span>


                <strong>

                    -${

                        formatRupiah(

                            result.deductions.potonganIzinTelat

                        )

                    }

                </strong>

            </div>

            `

                :

            ""

        }


        ${
            countIzinPulang > 0

                ?

            `

            <div class="payroll-row">

                <span>

                    Pot. Izin Pulang ${countIzinPulang}x

                </span>


                <strong>

                    -${

                        formatRupiah(

                            result.deductions.potonganIzinPulang

                        )

                    }

                </strong>

            </div>

            `

                :

            ""

        }


        ${
            countStatus("absen") > 0

                ?

            `

            <div class="payroll-row">

                <span>

                    Pot. Absen ${

                        countStatus("absen")

                    }x

                </span>


                <strong>

                    -${

                        formatRupiah(

                            result.deductions.potonganAbsen

                        )

                    }

                </strong>

            </div>

            `

                :

            ""

        }


        <div class="payroll-divider"></div>


        <!-- GAJI BERSIH -->

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

        Process.rules ??

        {};


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


    const allRules =

        flattenRules(

            rules

        );


    const gajiRule =

        allRules.find(

            rule =>

                rule.nama ===

                "gaji"

        );


    const gajiPokok =

        Number(

            gajiRule?.nominal || 0

        );


    let uangMakan = 0;

    let lemburJam1 = 0;

    let lemburJam2 = 0;

    let tunjangan = 0;

    let transport = 0;


    let bpjs = 0;

    let tabungan = 0;

    let jamsostek = 0;

    let koperasi = 0;

    let lainLain = 0;


    let potonganTelat = 0;

    let potonganIzinTelat = 0;

    let potonganIzinPulang = 0;

    let potonganAbsen = 0;


    /*
       UANG MAKAN

       Kondisi:

       masuk, lembur

       nominal:

       8.000 / hari
    */

    const uangMakanRule =

        allRules.find(

            rule =>

                rule.nama ===

                "uang_makan"

        );


    const makanNominal =

        Number(

            uangMakanRule?.nominal || 0

        );


    const makanCount =

        rows.filter(

            item =>

                item.status === "masuk" ||

                item.status === "lembur"

        ).length;


    uangMakan =

        makanCount *

        makanNominal;


    /*
       LEMBUR JAM
    */

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


            if(

                hours === 1

            ){

                const rule =

                    allRules.find(

                        r =>

                            r.nama ===

                            "lembur_jam_1"

                    );


                lemburJam1 +=

                    Number(

                        rule?.nominal || 0

                    );

            }


            else if(

                hours >= 2

            ){

                const rule =

                    allRules.find(

                        r =>

                            r.nama ===

                            "lembur_jam_2"

                    );


                lemburJam2 +=

                    hours *

                    Number(

                        rule?.nominal || 0

                    );

            }

        }

    );


    /*
       TUNJANGAN
    */

    const tunjanganRule =

        allRules.find(

            rule =>

                rule.nama ===

                "tunjangan"

        );


    tunjangan =

        Number(

            tunjanganRule?.nominal || 0

        );


    /*
       TRANSPORT
    */

    const transportRule =

        allRules.find(

            rule =>

                rule.nama ===

                "uang_transport"

        );


    transport =

        Number(

            transportRule?.nominal || 0

        );


    /*
       FIXED DEDUCTIONS
    */

    bpjs =

        getRuleNominal(

            allRules,

            "BPJS"

        );


    tabungan =

        getRuleNominal(

            allRules,

            "tabungan"

        );


    jamsostek =

        getRuleNominal(

            allRules,

            "Jamsostek"

        );


    koperasi =

        getRuleNominal(

            allRules,

            "koperasi"

        );


    lainLain =

        getRuleNominal(

            allRules,

            "lain-lain"

        );


    /*
       TELAT
    */

    rows.forEach(

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

                return;

            }


            const rule =

                allRules.find(

                    r => {

                        if(

                            r.type_rule !==

                            "rule_potong"

                        ){

                            return false;

                        }


                        if(

                            r.kondisi !==

                            "telat"

                        ){

                            return false;

                        }


                        const min =

                            Number(

                                r.nilai_start || 0

                            );


                        const max =

                            Number(

                                r.nilai_end || Infinity

                            );


                        return (

                            minutes >= min &&

                            minutes <= max

                        );

                    }

                );


            potonganTelat +=

                Number(

                    rule?.nominal || 0

                );

        }

    );


    /*
       IZIN TELAT
    */

    const izinTelatRule =

        allRules.find(

            rule =>

                rule.nama ===

                "izin_telat" &&

                rule.type_rule ===

                "rule_potong"

        );


    rows.forEach(

        item => {

            const hours =

                Number(

                    item.izinTelatHours ??

                    item.izin_telat ??

                    0

                );


            potonganIzinTelat +=

                hours *

                Number(

                    izinTelatRule?.nominal || 0

                );

        }

    );


    /*
       IZIN PULANG
    */

    const izinPulangRule =

        allRules.find(

            rule =>

                rule.nama ===

                "izin_pulang" &&

                rule.type_rule ===

                "rule_potong"

        );


    rows.forEach(

        item => {

            const hours =

                Number(

                    item.izinPulangHours ??

                    item.izin_pulang ??

                    0

                );


            potonganIzinPulang +=

                hours *

                Number(

                    izinPulangRule?.nominal || 0

                );

        }

    );


    /*
       ABSEN
    */

    const absenRule =

        allRules.find(

            rule =>

                rule.nama ===

                "absen"

        );


    const absenCount =

        rows.filter(

            item =>

                item.status ===

                "absen"

        ).length;


    potonganAbsen =

        absenCount *

        Number(

            absenRule?.nominal || 0

        );


    /*
       TOTAL
    */

    const totalEarnings =

        uangMakan +

        lemburJam1 +

        lemburJam2 +

        tunjangan +

        transport;


    const totalDeductions =

        bpjs +

        tabungan +

        jamsostek +

        koperasi +

        lainLain +

        potonganTelat +

        potonganIzinTelat +

        potonganIzinPulang +

        potonganAbsen;


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

        earnings : {

            uangMakan,

            lemburJam1,

            lemburJam2,

            tunjangan,

            transport

        },

        deductions : {

            bpjs,

            tabungan,

            jamsostek,

            koperasi,

            lainLain,

            potonganTelat,

            potonganIzinTelat,

            potonganIzinPulang,

            potonganAbsen

        },

        totalEarnings,

        totalDeductions,

        grossSalary,

        netSalary

    };

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


    /*
       Tidak boleh melewati
       periode berjalan.
    */

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
   DETAIL OVERLAY
===================================================== */

function openDetailOverlay(){

    const data =
        Summary.historyData;


    if(
        !data
    ){

        return;

    }


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

            "Test User",

        content :

        `

            <div class="global-overlay-row">

                <span>
                    Gaji Pokok
                </span>

                <strong>
                    ${
                        formatRupiah(
                            data.gajiPokok
                        )
                    }
                </strong>

            </div>


            <div class="global-overlay-row">

                <span>
                    Total Penambahan
                </span>

                <strong>
                    ${
                        formatRupiah(
                            data.totalEarnings
                        )
                    }
                </strong>

            </div>


            <div class="global-overlay-row">

                <span>
                    Total Potongan
                </span>

                <strong>
                    -${
                        formatRupiah(
                            data.totalDeductions
                        )
                    }
                </strong>

            </div>


            <div class="global-overlay-row">

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

    });

}
            
                  
/* =====================================================
   CLOSE OVERLAY
===================================================== */

function closeDetailOverlay(){

    const overlay =

        document.getElementById(

            "summary-payroll-overlay"

        );


    if(

        !overlay

    ){

        return;

    }


    overlay.classList.remove(

        "active"

    );


    setTimeout(

        () => {

            overlay.remove();

        },

        250

    );

}


/* =====================================================
   EXPORT
===================================================== */

function exportPayroll(){

    /*
       PNG export kita sambungkan
       setelah layout export final.
    */

    const data =

        Summary.historyData;


    if(

        !data

    ){

        return;

    }


    const target =

    document.getElementById(

        "summary-payroll-last-card"

    );


    if(

        !target

    ){

        return;

    }


    /*
       html2canvas harus tersedia
       sebelum fitur export digunakan.
    */

    if(

        typeof html2canvas !==

        "function"

    ){

        return;

    }


    html2canvas(

        target

    )

    .then(

        canvas => {

            const link =

                document.createElement(

                    "a"

                );


            link.download =

                `gaji-${

                    data.period.start

                    .toISOString()

                    .slice(

                        0,

                        10

                    )

                }.png`;


            link.href =

                canvas.toDataURL(

                    "image/png"

                );


            link.click();

        }

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

                return;

            }


            if(

                event.target.closest(

                    "#summary-payroll-overlay-close"

                )

            ){

                closeDetailOverlay();

                return;

            }


            if(

                event.target.closest(

                    "[data-close-payroll-overlay]"

                )

            ){

                closeDetailOverlay();

                return;

            }


            if(

                event.target.closest(

                    "#summary-payroll-export-button"

                )

            ){

                exportPayroll();

            }

        }

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

                item.nama === name

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
   HELPER : OVERLAY ROW
===================================================== */

function renderOverlayRow(

    label,

    value,

    negative = false

){

    if(

        !value

    ){

        return "";

    }


    return `

        <div class="overlay-row">

            <span>

                ${label}

            </span>

            <strong>

                ${

                    negative

                        ? "- "

                        : ""

                }${

                    formatRupiah(

                        value

                    )

                }

            </strong>

        </div>

    `;

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

