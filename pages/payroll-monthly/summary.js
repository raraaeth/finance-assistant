/* =====================================================
   Finance Assistant
   Page        : Payroll Monthly
   Module      : Summary
   File        : summary.js
   Version     : 3.1.0

   Description :
   Payroll Summary / Salary History

   Changes :
   - Current Period menggunakan Process.calculation
   - Lembur Harian dipisahkan dari Lembur Jam
   - Lembur Jam menggunakan seluruh component lembur_jam
   - Dirumahkan ditampilkan sebagai potongan jika rule tersedia
   - History calculation tetap tersedia
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

    /*
       Period Engine menjadi sumber
       periode payroll.

       Period.current
       = periode yang sedang berjalan

       Period.data
       = periode gaji penuh terakhir
    */

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


    /*
       PERIODE BERJALAN
    */

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


    /*
       PERIODE GAJI TERAKHIR
    */

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


    /*
       CURRENT PERIOD HARUS MENGGUNAKAN
       HASIL DARI CALCULATION ENGINE.

       Jangan menghitung ulang payroll
       menggunakan calculatePayroll().
    */

    const result =

        Process.calculation ?? {};


    const attendance =

        result.attendance ?? [];


    const earnings =

        result.earnings ?? [];


    const deductions =

        result.deductions ?? [];


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


    /*
       PENAMBAHAN
    */

    const uangMakan =

        getCalculationComponent(

            earnings,

            "uang_makan"

        );


    const transport =

        getCalculationComponent(

            earnings,

            "uang_transport"

        );


    const tunjangan =

        getCalculationComponent(

            earnings,

            "tunjangan"

        );


    /*
       LEMBUR HARIAN
    */

    const lemburHarian =

        getCalculationComponent(

            earnings,

            "lembur"

        );


    /*
       LEMBUR JAM

       Semua component yang namanya
       lembur_jam_* dijumlahkan.

       Jadi kalau ada:

       lembur_jam_1
       lembur_jam_2
       lembur_jam_3

       semuanya tetap masuk.
    */

    const lemburJam =

        getCalculationComponentByPrefix(

            earnings,

            "lembur_jam"

        );


    /*
       POTONGAN
    */

    const bpjs =

        getCalculationComponent(

            deductions,

            "BPJS"

        );


    const tabungan =

        getCalculationComponent(

            deductions,

            "tabungan"

        );


    const jamsostek =

        getCalculationComponent(

            deductions,

            "Jamsostek"

        );


    const koperasi =

        getCalculationComponent(

            deductions,

            "koperasi"

        );


    const lainLain =

        getCalculationComponent(

            deductions,

            "lain-lain"

        );


    /*
       TELAT

       Calculation menghasilkan component:

       telat_1
       telat_2
       telat_3
       telat_4

       Jadi semuanya dijumlahkan.
    */

    const potonganTelat =

        getCalculationComponentByPrefix(

            deductions,

            "telat_"

        );


    const potonganIzinTelat =

        getCalculationComponent(

            deductions,

            "izin_telat"

        );


    const potonganIzinPulang =

        getCalculationComponent(

            deductions,

            "izin_pulang"

        );


    const potonganAbsen =

        getCalculationComponent(

            deductions,

            "absen"

        );


    /*
       DIRUMAHKAN

       Kalau rule tidak ada:

       component tidak ada
       nominal = 0

       Jadi attendance dirumahkan
       tidak otomatis menjadi potongan.
    */

    const potonganDirumahkan =

        getCalculationComponent(

            deductions,

            "dirumahkan"

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

                        uangMakan

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

                        transport

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

                        tunjangan

                    )

                }

            </strong>

        </div>


        ${
            lemburHarian > 0

                ?

            `

            <div class="payroll-row">

                <span>

                    Lembur Harian

                    ${

                        countStatus("lembur")

                            ? `${countStatus("lembur")} hari`

                            : ""

                    }

                </span>


                <strong>

                    ${

                        formatRupiah(

                            lemburHarian

                        )

                    }

                </strong>

            </div>

            `

                :

            ""

        }


        ${
            lemburJam > 0

                ?

            `

            <div class="payroll-row">

                <span>

                    Lembur Jam

                    ${

                        lemburHours

                            ? `${lemburHours} jam`

                            : ""

                    }

                </span>


                <strong>

                    ${

                        formatRupiah(

                            lemburJam

                        )

                    }

                </strong>

            </div>

            `

                :

            ""

        }


        <div class="payroll-divider"></div>


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

                        bpjs

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

                        tabungan

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

                        jamsostek

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

                        koperasi

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

                        lainLain

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

                            potonganTelat

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

                            potonganIzinTelat

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

                            potonganIzinPulang

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

                    Pot. Absen ${countStatus("absen")}x

                </span>


                <strong>

                    -${

                        formatRupiah(

                            potonganAbsen

                        )

                    }

                </strong>

            </div>

            `

                :

            ""

        }


        ${
            countStatus("dirumahkan") > 0 &&
            potonganDirumahkan > 0

                ?

            `

            <div class="payroll-row">

                <span>

                    Pot. Dirumahkan ${countStatus("dirumahkan")}x

                </span>


                <strong>

                    -${

                        formatRupiah(

                            potonganDirumahkan

                        )

                    }

                </strong>

            </div>

            `

                :

            ""

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


    const attendance =

        data.attendance ?? [];


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


    const countAbsen =

        attendance.filter(

            item =>

                item.status === "absen"

        ).length;


    const countDirumahkan =

        attendance.filter(

            item =>

                item.status === "dirumahkan"

        ).length;


    const rows = [];


    rows.push(

        overlayRow(

            "Gaji Pokok",

            formatRupiah(

                data.gajiPokok

            )

        )

    );


    rows.push(

        `

        <div class="global-overlay-subtitle">

            Penambahan

        </div>

        `

    );


    if(

        data.earnings.uangMakan

    ){

        rows.push(

            overlayRow(

                `Uang Makan ${

                    uangMakanDays

                        ? `${uangMakanDays} hari`

                        : ""

                }`,

                formatRupiah(

                    data.earnings.uangMakan

                )

            )

        );

    }


    if(

        data.earnings.transport

    ){

        rows.push(

            overlayRow(

                "Uang Transport",

                formatRupiah(

                    data.earnings.transport

                )

            )

        );

    }


    if(

        data.earnings.tunjangan

    ){

        rows.push(

            overlayRow(

                "Tunjangan",

                formatRupiah(

                    data.earnings.tunjangan

                )

            )

        );

    }


    /*
       LEMBUR HARIAN
    */

    if(

        data.earnings.lemburHarian

    ){

        rows.push(

            overlayRow(

                `Lembur Harian ${

                    data.earnings.lemburHarianJumlah

                        ? `${data.earnings.lemburHarianJumlah} hari`

                        : ""

                }`,

                formatRupiah(

                    data.earnings.lemburHarian

                )

            )

        );

    }


    /*
       LEMBUR JAM
    */

    const lemburTotal =

        data.earnings.lemburJamTotal ??

        (

            Number(

                data.earnings.lemburJam1 ||

                0

            )

            +

            Number(

                data.earnings.lemburJam2 ||

                0

            )

        );


    if(

        lemburTotal

    ){

        rows.push(

            overlayRow(

                `Lembur Jam ${

                    lemburHours

                        ? `${lemburHours} jam`

                        : ""

                }`,

                formatRupiah(

                    lemburTotal

                )

            )

        );

    }


    rows.push(

        `

        <div class="global-overlay-divider"></div>

        <div class="global-overlay-subtitle">

            Potongan

        </div>

        `

    );


    rows.push(

        overlayRow(

            "BPJS",

            `-${

                formatRupiah(

                    data.deductions.bpjs

                )

            }`

        )

    );


    rows.push(

        overlayRow(

            "Tabungan",

            `-${

                formatRupiah(

                    data.deductions.tabungan

                )

            }`

        )

    );


    rows.push(

        overlayRow(

            "Jamsostek",

            `-${

                formatRupiah(

                    data.deductions.jamsostek

                )

            }`

        )

    );


    rows.push(

        overlayRow(

            "Koperasi",

            `-${

                formatRupiah(

                    data.deductions.koperasi

                )

            }`

        )

    );


    rows.push(

        overlayRow(

            "Lain-lain",

            `-${

                formatRupiah(

                    data.deductions.lainLain

                )

            }`

        )

    );


    if(

        countLate > 0

    ){

        rows.push(

            overlayRow(

                `Pot. Telat ${countLate}x`,

                `-${

                    formatRupiah(

                        data.deductions.potonganTelat

                    )

                }`

            )

        );

    }


    if(

        countIzinTelat > 0

    ){

        rows.push(

            overlayRow(

                `Pot. Izin Telat ${countIzinTelat}x`,

                `-${

                    formatRupiah(

                        data.deductions.potonganIzinTelat

                    )

                }`

            )

        );

    }


    if(

        countIzinPulang > 0

    ){

        rows.push(

            overlayRow(

                `Pot. Izin Pulang ${countIzinPulang}x`,

                `-${

                    formatRupiah(

                        data.deductions.potonganIzinPulang

                    )

                }`

            )

        );

    }


    if(

        countAbsen > 0

    ){

        rows.push(

            overlayRow(

                `Pot. Absen ${countAbsen}x`,

                `-${

                    formatRupiah(

                        data.deductions.potonganAbsen

                    )

                }`

            )

        );

    }


    if(

        countDirumahkan > 0 &&

        Number(

            data.deductions.potonganDirumahkan ||

            0

        ) > 0

    ){

        rows.push(

            overlayRow(

                `Pot. Dirumahkan ${countDirumahkan}x`,

                `-${

                    formatRupiah(

                        data.deductions.potonganDirumahkan

                    )

                }`

            )

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
   HISTORY
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

    let lemburHarian = 0;

    let lemburHarianJumlah = 0;

    let lemburJamTotal = 0;

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

    let potonganDirumahkan = 0;


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
       LEMBUR HARIAN

       Hanya status:

       lembur

       yang dihitung.
    */

    const lemburHarianRule =

        allRules.find(

            rule =>

                rule.type_rule ===

                "rule_tambah"

                &&

                rule.nama ===

                "lembur"

                &&

                rule.kondisi ===

                "lembur_harian"

                &&

                rule.waktu ===

                "harian"

        );


    lemburHarianJumlah =

        rows.filter(

            item =>

                item.status ===

                "lembur"

        ).length;


    lemburHarian =

        lemburHarianJumlah *

        Number(

            lemburHarianRule?.nominal || 0

        );


    /*
       LEMBUR JAM

       Dihitung per hari.

       Jam 1 hari berikutnya
       kembali menjadi jam 1.

       Ini penting agar:

       Hari A = 3 jam
       Hari B = 2 jam

       tidak dianggap:

       5 jam dalam satu rangkaian.
    */

    const overtimeRules =

        allRules.filter(

            rule =>

                rule.type_rule ===

                "rule_tambah"

                &&

                rule.waktu ===

                "jam"

                &&

                rule.nama

                ?.startsWith(

                    "lembur_jam"

                )

        );


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

                hours <= 0 ||

                overtimeRules.length === 0

            ){

                return;

            }


            const applicableRules =

                overtimeRules.filter(

                    rule => {

                        const conditions =

                            String(

                                rule.kondisi ??

                                ""

                            )

                            .split(",")

                            .map(

                                value =>

                                    value.trim()

                            );


                        return (

                            conditions.includes(

                                item.status

                            )

                        );

                    }

                );


            for(

                let hour = 1;

                hour <= hours;

                hour++

            ){

                const rule =

                    findOvertimeHourRule(

                        applicableRules,

                        hour

                    );


                if(

                    !rule

                ){

                    continue;

                }


                const nominal =

                    Number(

                        rule.nominal || 0

                    );


                lemburJamTotal +=

                    nominal;


                if(

                    rule.nama ===

                    "lembur_jam_1"

                ){

                    lemburJam1 +=

                        nominal;

                }


                if(

                    rule.nama ===

                    "lembur_jam_2"

                ){

                    lemburJam2 +=

                        nominal;

                }

            }

        }

    );


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

                                r.nilai_end ||

                                Infinity

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

                rule.type_rule ===

                "rule_potong"

                &&

                rule.kondisi ===

                "absen"

                &&

                rule.waktu ===

                "harian"

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
       DIRUMAHKAN

       Hanya dipotong jika rule
       memang ada.
    */

    const dirumahkanRule =

        allRules.find(

            rule =>

                rule.type_rule ===

                "rule_potong"

                &&

                rule.kondisi ===

                "dirumahkan"

                &&

                rule.waktu ===

                "harian"

        );


    const dirumahkanCount =

        rows.filter(

            item =>

                item.status ===

                "dirumahkan"

        ).length;


    potonganDirumahkan =

        dirumahkanCount *

        Number(

            dirumahkanRule?.nominal || 0

        );


    const totalEarnings =

        uangMakan +

        lemburHarian +

        lemburJamTotal +

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

        potonganAbsen +

        potonganDirumahkan;


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

            lemburHarian,

            lemburHarianJumlah,

            lemburJamTotal,

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

            potonganAbsen,

            potonganDirumahkan

        },

        totalEarnings,

        totalDeductions,

        grossSalary,

        netSalary

    };

}


/* =====================================================
   HELPER : CALCULATION COMPONENT
===================================================== */

function getCalculationComponent(

    items,

    name

){

    const item =

        (

            items ?? []

        ).find(

            row =>

                row?.nama ===

                name

        );


    return Number(

        item?.total || 0

    );

}


/* =====================================================
   HELPER : CALCULATION COMPONENT PREFIX
===================================================== */

function getCalculationComponentByPrefix(

    items,

    prefix

){

    return (

        items ?? []

    )

    .filter(

        row =>

            typeof row?.nama ===

            "string"

            &&

            row.nama.startsWith(

                prefix

            )

    )

    .reduce(

        (

            total,

            row

        ) =>

            total +

            Number(

                row?.total || 0

            ),

        0

    );

}


/* =====================================================
   HELPER : OVERTIME RULE
===================================================== */

function findOvertimeHourRule(

    rules,

    hour

){

    if(

        !rules ||

        rules.length === 0

    ){

        return null;

    }


    /*
       PRIORITAS 1

       Cari rule yang secara eksplisit
       mencakup jam tersebut.
    */

    const explicitRules =

        rules.filter(

            rule => {

                const start =

                    Number(

                        rule.nilai_start || 0

                    );


                const endValue =

                    Number(

                        rule.nilai_end || 0

                    );


                if(

                    start <= 0

                ){

                    return false;

                }


                if(

                    endValue > 0

                ){

                    return (

                        hour >= start &&

                        hour <= endValue

                    );

                }


                return hour >= start;

            }

        );


    if(

        explicitRules.length > 0

    ){

        explicitRules.sort(

            (

                a,

                b

            ) =>

                Number(

                    b.nilai_start || 0

                )

                -

                Number(

                    a.nilai_start || 0

                )

        );


        return explicitRules[0];

    }


    /*
       PRIORITAS 2

       Tidak ada rule eksplisit.

       Gunakan rule terakhir yang
       start-nya sudah dilewati.

       Contoh:

       Rule 1:
       1 - 1

       Rule 2:
       2 - 8

       Jam 9:

       tidak ada rule eksplisit

       maka Rule 2 tetap digunakan.
    */

    const fallbackRules =

        rules.filter(

            rule =>

                Number(

                    rule.nilai_start || 0

                ) > 0

                &&

                Number(

                    rule.nilai_start || 0

                ) <= hour

        );


    fallbackRules.sort(

        (

            a,

            b

        ) =>

            Number(

                b.nilai_start || 0

            )

            -

            Number(

                a.nilai_start || 0

            )

    );


    return (

        fallbackRules[0] ??

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
